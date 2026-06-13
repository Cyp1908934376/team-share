import { Test, TestingModule } from '@nestjs/testing'
import { WorkflowsService } from './workflows.service'
import { PrismaService } from '../../database/prisma/prisma.service'
import { QueueService } from '../../common/queue/queue.service'

describe('WorkflowsService', () => {
  let service: WorkflowsService
  let prisma: any
  let queueService: any

  const mockWorkflow = {
    id: 'wf-uuid-1',
    name: 'Test Workflow',
    description: 'A test workflow',
    version: '1.0.0',
    triggerConfig: {},
    nodes: [{ id: 'start', type: 'start', name: 'Start', config: {}, position: { x: 0, y: 0 }, inputs: [], outputs: [] }],
    edges: [],
    variables: {},
    timeout: 3600,
    retryPolicy: {},
    teamId: null,
    status: 'draft',
    executions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    const mockPrisma = {
      workflow: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      workflowExecution: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    }

    const mockQueueService = {
      addWorkflowJob: jest.fn(),
      cancelWorkflowJob: jest.fn(),
      getWorkflowJob: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: QueueService, useValue: mockQueueService },
      ],
    }).compile()

    service = module.get<WorkflowsService>(WorkflowsService)
    prisma = module.get(PrismaService)
    queueService = module.get(QueueService)
  })

  describe('findAll', () => {
    it('should return workflows with execution count', async () => {
      prisma.workflow.findMany.mockResolvedValue([mockWorkflow])

      const result = await service.findAll()

      expect(result).toHaveLength(1)
    })
  })

  describe('create', () => {
    it('should create a workflow', async () => {
      prisma.workflow.create.mockResolvedValue(mockWorkflow)

      const result = await service.create({
        name: 'New Workflow',
        nodes: [],
        edges: [],
      } as any)

      expect(result).toHaveProperty('name', 'Test Workflow')
    })
  })

  describe('execute', () => {
    it('should enqueue workflow execution via BullMQ', async () => {
      prisma.workflow.findUnique.mockResolvedValue({
        ...mockWorkflow,
        nodes: [
          { id: 'start', type: 'start', name: 'Start', config: {}, position: { x: 0, y: 0 }, inputs: [], outputs: [] },
          { id: 'end', type: 'end', name: 'End', config: {}, position: { x: 0, y: 0 }, inputs: [], outputs: [] },
        ],
      })
      prisma.workflowExecution.create.mockResolvedValue({
        id: 'exec-1',
        workflowId: mockWorkflow.id,
        status: 'pending',
        createdAt: new Date(),
      })
      queueService.addWorkflowJob.mockResolvedValue({ id: 'exec-1' })

      const result = await service.execute(mockWorkflow.id, {})

      expect(result).toHaveProperty('executionId', 'exec-1')
      expect(result).toHaveProperty('status', 'pending')
      expect(queueService.addWorkflowJob).toHaveBeenCalledWith({
        workflowId: mockWorkflow.id,
        executionId: 'exec-1',
        nodes: expect.any(Array),
        edges: expect.any(Array),
        variables: expect.any(Object),
      })
    })
  })

  describe('cancelExecution', () => {
    it('should cancel a pending execution via BullMQ', async () => {
      prisma.workflowExecution.findUnique.mockResolvedValue({
        id: 'exec-1',
        status: 'pending',
      })
      prisma.workflowExecution.update.mockResolvedValue({ id: 'exec-1', status: 'cancelled' })
      queueService.cancelWorkflowJob.mockResolvedValue(undefined)

      const result = await service.cancelExecution('exec-1')

      expect(result).toEqual({ success: true })
      expect(queueService.cancelWorkflowJob).toHaveBeenCalledWith('exec-1')
    })

    it('should reject cancellation of completed execution', async () => {
      prisma.workflowExecution.findUnique.mockResolvedValue({
        id: 'exec-1',
        status: 'success',
      })

      const result = await service.cancelExecution('exec-1')

      expect(result.success).toBe(false)
    })
  })

  describe('update', () => {
    it('should update a workflow', async () => {
      prisma.workflow.findUnique.mockResolvedValue(mockWorkflow)
      prisma.workflow.update.mockResolvedValue({ ...mockWorkflow, name: 'Updated' })

      const result = await service.update(mockWorkflow.id, { name: 'Updated' } as any)

      expect(result.name).toBe('Updated')
    })
  })

  describe('delete', () => {
    it('should delete a workflow', async () => {
      prisma.workflow.findUnique.mockResolvedValue(mockWorkflow)
      prisma.workflow.delete.mockResolvedValue(mockWorkflow)

      const result = await service.delete(mockWorkflow.id)

      expect(result).toEqual({ success: true })
    })
  })
})
