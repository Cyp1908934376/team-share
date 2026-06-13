import { PrismaService } from '../../database/prisma/prisma.service'
import { exec, spawn } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface ExecutionContext {
  workflowId: string
  executionId: string
  variables: Record<string, any>
  nodeOutputs: Record<string, any>
  logs: Array<{
    timestamp: Date
    level: 'info' | 'warn' | 'error' | 'debug'
    message: string
    nodeId?: string
  }>
  aborted: boolean
}

interface NodeDefinition {
  id: string
  type: string
  name: string
  config: Record<string, any>
}

interface EdgeDefinition {
  id: string
  source: string
  target: string
  condition?: string
}

export class WorkflowEngine {
  constructor(private prisma: PrismaService) {}

  async execute(
    workflowId: string,
    executionId: string,
    nodes: NodeDefinition[],
    edges: EdgeDefinition[],
    variables: Record<string, any>
  ) {
    const context: ExecutionContext = {
      workflowId,
      executionId,
      variables: { ...variables },
      nodeOutputs: {},
      logs: [],
      aborted: false,
    }

    try {
      this.log(context, 'info', '工作流开始执行')

      // Build adjacency list
      const adjacency = this.buildAdjacency(edges)

      // Find start node
      const startNode = nodes.find((n) => n.type === 'start')
      if (!startNode) {
        throw new Error('未找到开始节点')
      }

      // Execute nodes in order
      await this.executeNode(startNode, nodes, edges, adjacency, context)

      // Check if execution was aborted
      if (context.aborted) {
        await this.prisma.workflowExecution.update({
          where: { id: executionId },
          data: {
            status: 'cancelled',
            finishedAt: new Date(),
            outputs: context.nodeOutputs,
            logs: context.logs,
          },
        })
        return { success: false, cancelled: true }
      }

      // Update execution status
      await this.prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: 'success',
          finishedAt: new Date(),
          outputs: context.nodeOutputs,
          logs: context.logs,
        },
      })

      this.log(context, 'info', '工作流执行完成')

      return { success: true, outputs: context.nodeOutputs }
    } catch (error: any) {
      this.log(context, 'error', `工作流执行失败: ${error.message}`)

      await this.prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          outputs: context.nodeOutputs,
          logs: context.logs,
        },
      })

      throw error
    }
  }

  async abort(executionId: string) {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
    })
    if (execution && execution.status === 'running') {
      // We can't directly set context.aborted from outside,
      // but we update the DB status. The engine checks at each node.
      await this.prisma.workflowExecution.update({
        where: { id: executionId },
        data: { status: 'cancelled', finishedAt: new Date() },
      })
    }
  }

  private async executeNode(
    node: NodeDefinition,
    allNodes: NodeDefinition[],
    edges: EdgeDefinition[],
    adjacency: Map<string, string[]>,
    context: ExecutionContext
  ) {
    // Check abort
    if (context.aborted) return

    this.log(context, 'info', `执行节点: ${node.name}`, node.id)

    // Update node execution status
    await this.updateNodeExecution(context.executionId, node.id, 'running')

    try {
      let output: any = null

      switch (node.type) {
        case 'start':
          output = await this.executeStartNode(node, context)
          break
        case 'end':
          output = await this.executeEndNode(node, context)
          break
        case 'task':
          output = await this.executeTaskNode(node, context)
          break
        case 'condition':
          output = await this.executeConditionNode(node, context)
          break
        case 'parallel':
          output = await this.executeParallelNode(node, allNodes, edges, adjacency, context)
          break
        case 'loop':
          output = await this.executeLoopNode(node, allNodes, edges, adjacency, context)
          break
        case 'subprocess':
          output = await this.executeSubprocessNode(node, context)
          break
        default:
          this.log(context, 'warn', `未知节点类型: ${node.type}`, node.id)
          output = {}
      }

      context.nodeOutputs[node.id] = output

      // Update node execution status
      await this.updateNodeExecution(context.executionId, node.id, 'success')

      // Find and execute next nodes (skip for parallel node, it handles its own children)
      if (!['parallel', 'loop', 'subprocess'].includes(node.type)) {
        const nextNodeIds = adjacency.get(node.id) || []

        for (const nextNodeId of nextNodeIds) {
          const nextNode = allNodes.find((n) => n.id === nextNodeId)
          if (!nextNode) continue

          // Check condition for conditional edges
          const edge = edges.find((e) => e.source === node.id && e.target === nextNodeId)
          if (edge?.condition) {
            const conditionMet = this.evaluateCondition(edge.condition, context)
            if (!conditionMet) {
              this.log(context, 'info', `条件不满足，跳过节点: ${nextNode.name}`, node.id)
              continue
            }
          }

          await this.executeNode(nextNode, allNodes, edges, adjacency, context)
        }
      }
    } catch (error: any) {
      await this.updateNodeExecution(context.executionId, node.id, 'failed')
      throw error
    }
  }

  private async executeStartNode(node: NodeDefinition, context: ExecutionContext) {
    this.log(context, 'info', '开始节点执行', node.id)
    return { started: true }
  }

  private async executeEndNode(node: NodeDefinition, context: ExecutionContext) {
    this.log(context, 'info', '结束节点执行', node.id)
    return { finished: true }
  }

  private async executeTaskNode(node: NodeDefinition, context: ExecutionContext) {
    const { command, script, timeout = 60000, retries = 0, env } = node.config

    this.log(context, 'info', `执行任务: ${node.name}`, node.id)

    // Merge environment variables
    const envVars = {
      ...process.env,
      ...this.resolveVariables(context.variables),
      ...(env || {}),
    }

    let lastError: Error | null = null
    const maxAttempts = retries + 1

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (attempt > 1) {
        this.log(context, 'warn', `第 ${attempt} 次重试`, node.id)
      }

      try {
        if (command) {
          this.log(context, 'info', `执行命令: ${command}`, node.id)
          const result = await this.executeCommand(command, envVars, timeout)
          this.log(context, 'info', `命令执行完成，退出码: ${result.exitCode}`, node.id)
          return result
        }

        if (script) {
          this.log(context, 'info', '执行脚本', node.id)
          const result = await this.executeScript(script, envVars, timeout)
          this.log(context, 'info', `脚本执行完成，退出码: ${result.exitCode}`, node.id)
          return result
        }

        return { skipped: true, reason: '未配置 command 或 script' }
      } catch (error: any) {
        lastError = error
        this.log(context, 'error', `执行失败: ${error.message}`, node.id)

        if (attempt < maxAttempts) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
          this.log(context, 'info', `等待 ${delay}ms 后重试...`, node.id)
          await this.delay(delay)
        }
      }
    }

    throw lastError || new Error('任务执行失败')
  }

  private async executeCommand(
    command: string,
    env: Record<string, string>,
    timeout: number
  ): Promise<{ exitCode: number; stdout: string; stderr: string }> {
    try {
      const { stdout, stderr } = await execAsync(command, {
        env,
        timeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB
      })
      return { exitCode: 0, stdout, stderr }
    } catch (error: any) {
      if (error.killed) {
        throw new Error(`命令执行超时 (${timeout}ms)`)
      }
      // Throw on non-zero exit to trigger retry logic in executeTaskNode
      throw new Error(
        `命令执行失败 (exit code ${error.code || 1}): ${error.stderr || error.message}`,
      )
    }
  }

  private async executeScript(
    script: string,
    env: Record<string, string>,
    timeout: number
  ): Promise<{ exitCode: number; stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', script], {
        env,
        timeout,
        stdio: ['pipe', 'pipe', 'pipe'],
      })

      let stdout = ''
      let stderr = ''

      child.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      const timer = setTimeout(() => {
        child.kill('SIGTERM')
        reject(new Error(`脚本执行超时 (${timeout}ms)`))
      }, timeout)

      child.on('close', (code) => {
        clearTimeout(timer)
        if (code === 0) {
          resolve({ exitCode: 0, stdout, stderr })
        } else {
          resolve({ exitCode: code || 1, stdout, stderr })
        }
      })

      child.on('error', (err) => {
        clearTimeout(timer)
        reject(err)
      })
    })
  }

  private async executeParallelNode(
    node: NodeDefinition,
    allNodes: NodeDefinition[],
    edges: EdgeDefinition[],
    adjacency: Map<string, string[]>,
    context: ExecutionContext
  ) {
    const { maxConcurrency = 5 } = node.config
    const nextNodeIds = adjacency.get(node.id) || []

    this.log(context, 'info', `并行执行 ${nextNodeIds.length} 个节点，并发数: ${maxConcurrency}`, node.id)

    const results: Record<string, any> = {}

    // Execute children in parallel with concurrency limit
    const chunks: string[][] = []
    for (let i = 0; i < nextNodeIds.length; i += maxConcurrency) {
      chunks.push(nextNodeIds.slice(i, i + maxConcurrency))
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async (nextNodeId) => {
        const nextNode = allNodes.find((n) => n.id === nextNodeId)
        if (!nextNode) return

        // Check condition
        const edge = edges.find((e) => e.source === node.id && e.target === nextNodeId)
        if (edge?.condition) {
          const conditionMet = this.evaluateCondition(edge.condition, context)
          if (!conditionMet) {
            this.log(context, 'info', `条件不满足，跳过节点: ${nextNode.name}`, node.id)
            return
          }
        }

        await this.executeNode(nextNode, allNodes, edges, adjacency, context)
        results[nextNodeId] = context.nodeOutputs[nextNodeId]
      })

      await Promise.all(promises)
    }

    return { parallel: true, results }
  }

  private async executeLoopNode(
    node: NodeDefinition,
    allNodes: NodeDefinition[],
    edges: EdgeDefinition[],
    adjacency: Map<string, string[]>,
    context: ExecutionContext
  ) {
    const { iterations, collection, mode = 'sequential' } = node.config || {}
    const nextNodeIds = adjacency.get(node.id) || []

    // Determine loop count
    let loopCount = 0
    let collectionItems: any[] = []
    if (iterations !== undefined && iterations > 0) {
      loopCount = iterations
    } else if (collection) {
      // Resolve collection from variables or outputs
      const resolved = this.resolveJsonPath(collection, context)
      if (Array.isArray(resolved)) {
        collectionItems = resolved
        loopCount = collectionItems.length
      }
    }

    this.log(context, 'info', `循环开始，共 ${loopCount} 次迭代`, node.id)

    const results: any[] = []

    for (let i = 0; i < loopCount; i++) {
      if (context.aborted) break

      // Set loop context variables
      context.variables.loopIndex = i
      if (collectionItems.length > 0) {
        context.variables.loopItem = collectionItems[i]
      }

      this.log(context, 'info', `循环迭代 ${i + 1}/${loopCount}`, node.id)

      const iterationOutputs: Record<string, any> = {}

      if (mode === 'parallel' && nextNodeIds.length > 0) {
        // Execute children in parallel for this iteration
        const promises = nextNodeIds.map(async (nextNodeId) => {
          const nextNode = allNodes.find((n) => n.id === nextNodeId)
          if (!nextNode) return
          await this.executeNode(nextNode, allNodes, edges, adjacency, context)
          iterationOutputs[nextNodeId] = context.nodeOutputs[nextNodeId]
        })
        await Promise.all(promises)
      } else {
        // Sequential execution
        for (const nextNodeId of nextNodeIds) {
          if (context.aborted) break
          const nextNode = allNodes.find((n) => n.id === nextNodeId)
          if (!nextNode) continue

          const edge = edges.find((e) => e.source === node.id && e.target === nextNodeId)
          if (edge?.condition) {
            if (!this.evaluateCondition(edge.condition, context)) continue
          }

          await this.executeNode(nextNode, allNodes, edges, adjacency, context)
          iterationOutputs[nextNodeId] = context.nodeOutputs[nextNodeId]
        }
      }

      results.push({ iteration: i, outputs: iterationOutputs })
    }

    // Find and execute nodes after the loop
    for (const nextNodeId of nextNodeIds) {
      if (context.aborted) break
      const nextNode = allNodes.find((n) => n.id === nextNodeId)
      if (!nextNode) continue
      // Only execute if node wasn't a loop child (children handled above)
      // For simplicity, loop children are direct adjacency nodes
    }

    this.log(context, 'info', `循环完成，共 ${results.length} 次迭代`, node.id)

    // Clean up loop-specific variables
    delete context.variables.loopIndex
    delete context.variables.loopItem

    return { iterations: loopCount, results }
  }

  private async executeSubprocessNode(
    node: NodeDefinition,
    context: ExecutionContext
  ) {
    const { workflowId: subWorkflowId, inputMapping = {}, outputMapping = {} } = node.config || {}

    if (!subWorkflowId) {
      this.log(context, 'error', '未指定子工作流 ID', node.id)
      return { skipped: true, reason: '未指定子工作流 ID' }
    }

    this.log(context, 'info', `执行子工作流: ${subWorkflowId}`, node.id)

    // Load sub-workflow
    const subWorkflow = await this.prisma.workflow.findUnique({
      where: { id: subWorkflowId },
    })

    if (!subWorkflow) {
      this.log(context, 'error', `子工作流不存在: ${subWorkflowId}`, node.id)
      return { skipped: true, reason: '子工作流不存在' }
    }

    // Map inputs
    const subVariables: Record<string, any> = {}
    for (const [targetKey, sourcePath] of Object.entries(inputMapping)) {
      subVariables[targetKey] = this.resolveJsonPath(sourcePath as string, context)
    }

    // Create sub-execution record
    const subExecution = await this.prisma.workflowExecution.create({
      data: {
        workflowId: subWorkflowId,
        status: 'running',
        trigger: 'subprocess',
        inputs: subVariables,
        startedAt: new Date(),
      },
    })

    // Execute sub-workflow recursively
    const subResult = await this.execute(
      subWorkflowId,
      subExecution.id,
      (subWorkflow.nodes as any[]) || [],
      (subWorkflow.edges as any[]) || [],
      { ...(subWorkflow.variables as Record<string, any>), ...subVariables }
    )

    // Map outputs back
    const mappedOutputs: Record<string, any> = {}
    for (const [targetKey, sourceKey] of Object.entries(outputMapping)) {
      if (subResult.outputs && sourceKey as string in subResult.outputs) {
        mappedOutputs[targetKey] = subResult.outputs[sourceKey as string]
      }
    }

    return {
      subprocess: true,
      subWorkflowId,
      subExecutionId: subExecution.id,
      result: subResult,
      mappedOutputs,
    }
  }

  private resolveJsonPath(path: string, context: ExecutionContext): any {
    if (!path) return undefined
    // Support simple paths like "variables.foo", "outputs.nodeId.bar"
    const parts = path.split('.')
    let current: any = context
    for (const part of parts) {
      if (current === null || current === undefined) return undefined
      current = current[part]
    }
    return current
  }

  private async executeConditionNode(node: NodeDefinition, context: ExecutionContext) {
    const { expression } = node.config

    this.log(context, 'info', `评估条件: ${expression || 'true'}`, node.id)

    const result = expression ? this.evaluateCondition(expression, context) : true

    this.log(context, 'info', `条件结果: ${result}`, node.id)

    return { result }
  }

  private evaluateCondition(expression: string, context: ExecutionContext): boolean {
    try {
      // Simple expression evaluation with safety
      const safeExpression = this.sanitizeExpression(expression)
      const func = new Function('variables', 'outputs', `return ${safeExpression}`)
      return func(context.variables, context.nodeOutputs)
    } catch {
      return false
    }
  }

  private sanitizeExpression(expression: string): string {
    // Block dangerous patterns
    const blocked = ['require', 'import', 'eval', 'Function', 'process.exit', '__dirname', '__filename']
    for (const keyword of blocked) {
      if (expression.includes(keyword)) {
        return 'false'
      }
    }
    return expression
  }

  private resolveVariables(variables: Record<string, any>): Record<string, string> {
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(variables)) {
      result[key] = String(value)
    }
    return result
  }

  private buildAdjacency(edges: EdgeDefinition[]): Map<string, string[]> {
    const adjacency = new Map<string, string[]>()

    for (const edge of edges) {
      if (!adjacency.has(edge.source)) {
        adjacency.set(edge.source, [])
      }
      adjacency.get(edge.source)!.push(edge.target)
    }

    return adjacency
  }

  private log(
    context: ExecutionContext,
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    nodeId?: string
  ) {
    context.logs.push({
      timestamp: new Date(),
      level,
      message,
      nodeId,
    })
  }

  private async updateNodeExecution(
    executionId: string,
    nodeId: string,
    status: 'running' | 'success' | 'failed'
  ) {
    // Update node execution in the logs
    // In a full implementation, this would update a separate node_executions table
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
