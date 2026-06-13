# 工作流编写指南

## 工作流概述

工作流引擎支持可视化编排自动化流程，可拖拽节点构建 DAG（有向无环图）。

## 节点类型

### 基础节点

| 节点 | 说明 | 配置 |
|------|------|------|
| **开始 (Start)** | 工作流入口 | 无 |
| **结束 (End)** | 工作流出口 | 无 |
| **任务 (Task)** | 执行命令或脚本 | command / script / timeout / retries |
| **条件 (Condition)** | 条件分支 | expression（JavaScript 表达式） |

### 高级节点

| 节点 | 说明 | 配置 |
|------|------|------|
| **并行 (Parallel)** | 并发执行多个子节点 | maxConcurrency（最大并发数） |
| **循环 (Loop)** | 循环执行子节点 | iterations（次数）或 collection（数组遍历），mode（sequential/parallel） |
| **子流程 (Subprocess)** | 调用另一个工作流 | workflowId / inputMapping / outputMapping |

## 触发方式

- **手动触发**：点击「执行」按钮
- **定时触发 (Cron)**：设置 cron 表达式定时执行
- **Webhook 触发**：通过 HTTP POST 调用触发

## 条件表达式

在 Condition 节点和 Edge 上可使用 JavaScript 表达式：

```
// 访问变量
variables.myVar > 10

// 访问前置节点输出
outputs.nodeId.status === 'success'

// 组合条件
variables.env === 'production' && outputs.build.exitCode === 0
```

## 示例工作流

### 1. 一键部署

```
Start → Build(Task) → Test(Task) → Deploy(Task) → Verify(Task) → End
```

### 2. 带审批的发布

```
Start → Validate(Task) → [Condition: 验证通过?] →
  true  → SubmitReview(Task) → WaitApproval(Task) → Publish(Task) → End
  false → Notify(Task) → End
```

### 3. 批量处理

```
Start → FetchItems(Task) → Loop(遍历 items) →
  Process(Task) → [Condition: 成功?] →
    true → Next Iteration
    false → LogError(Task) → Next Iteration
→ Aggregate(Task) → End
```
