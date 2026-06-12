import { WorkflowEngine } from './workflow-engine'

// Mock PrismaService
const mockPrisma = {
  workflowExecution: {
    update: jest.fn().mockResolvedValue({}),
    findUnique: jest.fn(),
  },
}

// Mock child_process
jest.mock('child_process', () => ({
  exec: jest.fn(),
  spawn: jest.fn(),
}))

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine

  const mockNodes = [
    { id: 'start-1', type: 'start', name: '开始', config: {} },
    { id: 'task-1', type: 'task', name: '构建', config: { command: 'echo build' } },
    { id: 'task-2', type: 'task', name: '测试', config: { script: 'npm test' } },
    { id: 'task-3', type: 'task', name: '部署', config: { command: 'echo deploy' } },
    { id: 'end-1', type: 'end', name: '结束', config: {} },
  ]

  const mockEdges = [
    { id: 'e1', source: 'start-1', target: 'task-1' },
    { id: 'e2', source: 'task-1', target: 'task-2' },
    { id: 'e3', source: 'task-2', target: 'task-3' },
    { id: 'e4', source: 'task-3', target: 'end-1' },
  ]

  beforeEach(() => {
    engine = new WorkflowEngine(mockPrisma as any)
    jest.clearAllMocks()

    // Mock execAsync to return success
    const { exec } = require('child_process')
    exec.mockImplementation((cmd: string, opts: any, cb: any) => {
      if (cb) {
        cb(null, { stdout: 'output', stderr: '' })
        return { kill: jest.fn() }
      }
      return { kill: jest.fn() }
    })
  })

  describe('execute', () => {
    it('should execute a simple linear workflow', async () => {
      const result = await engine.execute(
        'workflow-1',
        'execution-1',
        [mockNodes[0], mockNodes[1], mockNodes[4]], // start -> task -> end
        [
          { id: 'e1', source: 'start-1', target: 'task-1' },
          { id: 'e2', source: 'task-1', target: 'end-1' },
        ],
        {},
      )

      expect(result.success).toBe(true)
      expect(mockPrisma.workflowExecution.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'execution-1' },
          data: expect.objectContaining({ status: 'success' }),
        }),
      )
    })

    it('should throw if no start node exists', async () => {
      await expect(
        engine.execute(
          'workflow-1',
          'execution-1',
          [mockNodes[1]], // No start node
          [],
          {},
        ),
      ).rejects.toThrow('未找到开始节点')
    })

    it('should handle task node with command', async () => {
      const { exec } = require('child_process')
      exec.mockImplementation((_cmd: string, _opts: any, cb: any) => {
        if (cb) {
          cb(null, { stdout: 'build success', stderr: '' })
          return { kill: jest.fn() }
        }
        return { kill: jest.fn() }
      })

      const result = await engine.execute(
        'workflow-1',
        'execution-1',
        [mockNodes[0], mockNodes[1], mockNodes[4]],
        [
          { id: 'e1', source: 'start-1', target: 'task-1' },
          { id: 'e2', source: 'task-1', target: 'end-1' },
        ],
        {},
      )

      expect(result.success).toBe(true)
    })

    it('should handle task node with script', async () => {
      const { spawn } = require('child_process')
      spawn.mockImplementation(() => {
        const mockChild = {
          stdout: { on: jest.fn() },
          stderr: { on: jest.fn() },
          on: jest.fn((event: string, cb: Function) => {
            if (event === 'close') setTimeout(() => cb(0), 0)
            return mockChild
          }),
          kill: jest.fn(),
        }
        return mockChild
      })

      const result = await engine.execute(
        'workflow-1',
        'execution-1',
        [mockNodes[0], mockNodes[2], mockNodes[4]],
        [
          { id: 'e1', source: 'start-1', target: 'task-2' },
          { id: 'e2', source: 'task-2', target: 'end-1' },
        ],
        {},
      )

      expect(result.success).toBe(true)
    })

    it('should mark execution as failed on error', async () => {
      const { exec } = require('child_process')
      exec.mockImplementation((_cmd: string, _opts: any, cb: any) => {
        if (cb) {
          cb(new Error('Command failed'), { stdout: '', stderr: 'Command failed' })
          return { kill: jest.fn() }
        }
        return { kill: jest.fn() }
      })

      await expect(
        engine.execute(
          'workflow-1',
          'execution-1',
          [mockNodes[0], mockNodes[1], mockNodes[4]],
          [
            { id: 'e1', source: 'start-1', target: 'task-1' },
            { id: 'e2', source: 'task-1', target: 'end-1' },
          ],
          {},
        ),
      ).rejects.toThrow()

      expect(mockPrisma.workflowExecution.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'execution-1' },
          data: expect.objectContaining({ status: 'failed' }),
        }),
      )
    })
  })

  describe('condition nodes', () => {
    const conditionNodes = [
      { id: 'start-1', type: 'start', name: '开始', config: {} },
      { id: 'cond-1', type: 'condition', name: '判断', config: { expression: 'variables.count > 5' } },
      { id: 'task-1', type: 'task', name: '任务A', config: { command: 'echo A' } },
      { id: 'task-2', type: 'task', name: '任务B', config: { command: 'echo B' } },
      { id: 'end-1', type: 'end', name: '结束', config: {} },
    ]

    it('should follow branch when condition is true', async () => {
      const result = await engine.execute(
        'workflow-1',
        'execution-1',
        conditionNodes,
        [
          { id: 'e1', source: 'start-1', target: 'cond-1' },
          { id: 'e2', source: 'cond-1', target: 'task-1', condition: 'variables.count > 5' },
          { id: 'e3', source: 'cond-1', target: 'task-2', condition: 'variables.count <= 5' },
          { id: 'e4', source: 'task-1', target: 'end-1' },
          { id: 'e5', source: 'task-2', target: 'end-1' },
        ],
        { count: 10 },
      )

      expect(result.success).toBe(true)
      // task-1 should have been executed (count > 5), task-2 should be skipped
    })

    it('should skip branch when condition is false', async () => {
      const result = await engine.execute(
        'workflow-1',
        'execution-1',
        conditionNodes,
        [
          { id: 'e1', source: 'start-1', target: 'cond-1' },
          { id: 'e2', source: 'cond-1', target: 'task-1', condition: 'variables.count > 5' },
          { id: 'e3', source: 'cond-1', target: 'task-2', condition: 'variables.count <= 5' },
          { id: 'e4', source: 'task-1', target: 'end-1' },
          { id: 'e5', source: 'task-2', target: 'end-1' },
        ],
        { count: 3 },
      )

      expect(result.success).toBe(true)
    })
  })

  describe('parallel nodes', () => {
    const parallelNodes = [
      { id: 'start-1', type: 'start', name: '开始', config: {} },
      { id: 'parallel-1', type: 'parallel', name: '并行', config: { maxConcurrency: 2 } },
      { id: 'task-1', type: 'task', name: '任务A', config: { command: 'echo A' } },
      { id: 'task-2', type: 'task', name: '任务B', config: { command: 'echo B' } },
      { id: 'task-3', type: 'task', name: '任务C', config: { command: 'echo C' } },
      { id: 'end-1', type: 'end', name: '结束', config: {} },
    ]

    it('should execute parallel children', async () => {
      const result = await engine.execute(
        'workflow-1',
        'execution-1',
        parallelNodes,
        [
          { id: 'e1', source: 'start-1', target: 'parallel-1' },
          { id: 'e2', source: 'parallel-1', target: 'task-1' },
          { id: 'e3', source: 'parallel-1', target: 'task-2' },
          { id: 'e4', source: 'parallel-1', target: 'task-3' },
          { id: 'e5', source: 'task-1', target: 'end-1' },
          { id: 'e6', source: 'task-2', target: 'end-1' },
          { id: 'e7', source: 'task-3', target: 'end-1' },
        ],
        {},
      )

      expect(result.success).toBe(true)
    })
  })

  describe('buildAdjacency', () => {
    it('should build adjacency list from edges', () => {
      const adjacency = (engine as any).buildAdjacency([
        { id: 'e1', source: 'A', target: 'B' },
        { id: 'e2', source: 'A', target: 'C' },
        { id: 'e3', source: 'B', target: 'D' },
      ])

      expect(adjacency.get('A')).toEqual(['B', 'C'])
      expect(adjacency.get('B')).toEqual(['D'])
    })

    it('should return empty map for no edges', () => {
      const adjacency = (engine as any).buildAdjacency([])
      expect(adjacency.size).toBe(0)
    })
  })

  describe('evaluateCondition', () => {
    it('should evaluate simple expressions', () => {
      const context = { variables: { x: 5, y: 10 }, nodeOutputs: {}, logs: [], aborted: false } as any

      expect((engine as any).evaluateCondition('variables.x > 3', context)).toBe(true)
      expect((engine as any).evaluateCondition('variables.x > 10', context)).toBe(false)
      expect((engine as any).evaluateCondition('variables.x + variables.y === 15', context)).toBe(true)
    })

    it('should access nodeOutputs', () => {
      const context = {
        variables: {},
        nodeOutputs: { 'task-1': { exitCode: 0 } },
        logs: [],
        aborted: false,
      } as any

      expect(
        (engine as any).evaluateCondition("outputs['task-1'].exitCode === 0", context),
      ).toBe(true)
    })

    it('should return false for invalid expressions', () => {
      const context = { variables: {}, nodeOutputs: {}, logs: [], aborted: false } as any

      expect((engine as any).evaluateCondition('invalid syntax !!!', context)).toBe(false)
    })
  })

  describe('sanitizeExpression', () => {
    it('should block dangerous keywords', () => {
      expect((engine as any).sanitizeExpression('require("fs")')).toBe('false')
      expect((engine as any).sanitizeExpression('import("fs")')).toBe('false')
      expect((engine as any).sanitizeExpression('eval("1+1")')).toBe('false')
      expect((engine as any).sanitizeExpression('process.exit(1)')).toBe('false')
      expect((engine as any).sanitizeExpression('__dirname')).toBe('false')
      expect((engine as any).sanitizeExpression('__filename')).toBe('false')
    })

    it('should pass safe expressions', () => {
      expect((engine as any).sanitizeExpression('variables.x > 5')).toBe('variables.x > 5')
      expect((engine as any).sanitizeExpression('outputs.result === true')).toBe(
        'outputs.result === true',
      )
    })
  })

  describe('resolveVariables', () => {
    it('should convert all values to strings', () => {
      const result = (engine as any).resolveVariables({
        NODE_ENV: 'production',
        PORT: 3000,
        DEBUG: true,
      })

      expect(result).toEqual({
        NODE_ENV: 'production',
        PORT: '3000',
        DEBUG: 'true',
      })
    })
  })

  describe('retry logic', () => {
    it('should retry failed tasks up to retry count', async () => {
      const { exec } = require('child_process')
      let callCount = 0
      exec.mockImplementation((_cmd: string, _opts: any, cb: any) => {
        callCount++
        // Fail first 2 calls, succeed on 3rd
        if (callCount < 3 && cb) {
          cb(new Error('Temporary failure'), { stdout: '', stderr: 'error' })
          return { kill: jest.fn() }
        }
        if (cb) {
          cb(null, { stdout: 'success after retry', stderr: '' })
          return { kill: jest.fn() }
        }
        return { kill: jest.fn() }
      })

      const result = await engine.execute(
        'workflow-1',
        'execution-1',
        [
          { id: 'start-1', type: 'start', name: '开始', config: {} },
          { id: 'task-1', type: 'task', name: '重试任务', config: { command: 'flaky-cmd', retries: 3 } },
          { id: 'end-1', type: 'end', name: '结束', config: {} },
        ],
        [
          { id: 'e1', source: 'start-1', target: 'task-1' },
          { id: 'e2', source: 'task-1', target: 'end-1' },
        ],
        {},
      )

      expect(result.success).toBe(true)
      expect(callCount).toBe(3) // 2 failures + 1 success
    })
  })
})
