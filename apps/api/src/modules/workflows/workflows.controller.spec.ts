import { Test, TestingModule } from '@nestjs/testing'
import { WorkflowsController } from './workflows.controller'
import { WorkflowsService } from './workflows.service'

describe('WorkflowsController', () => {
  let controller: WorkflowsController
  let service: any

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      execute: jest.fn(),
      getExecutions: jest.fn(),
      getExecution: jest.fn(),
      cancelExecution: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowsController],
      providers: [
        { provide: WorkflowsService, useValue: mockService },
      ],
    }).compile()

    controller = module.get<WorkflowsController>(WorkflowsController)
    service = module.get(WorkflowsService)
  })

  describe('findAll', () => {
    it('should return workflow list', async () => {
      service.findAll.mockResolvedValue([{ id: '1', name: 'Test WF', executions: [] }])

      const result = await controller.findAll()

      expect(result).toHaveLength(1)
    })
  })

  describe('create', () => {
    it('should create a workflow', async () => {
      service.create.mockResolvedValue({ id: '1', name: 'New WF' })

      const result = await controller.create({
        name: 'New WF',
        nodes: [],
        edges: [],
      } as any)

      expect(result).toHaveProperty('name', 'New WF')
    })
  })

  describe('execute', () => {
    it('should execute a workflow', async () => {
      service.execute.mockResolvedValue({ executionId: 'exec-1', status: 'running' })

      const result = await controller.execute('1', {})

      expect(result).toHaveProperty('executionId')
    })
  })

  describe('getExecutions', () => {
    it('should return execution history', async () => {
      service.getExecutions.mockResolvedValue([{ id: 'exec-1', status: 'success' }])

      const result = await controller.getExecutions('1')

      expect(result).toHaveLength(1)
    })
  })

  describe('getExecution', () => {
    it('should return execution detail', async () => {
      service.getExecution.mockResolvedValue({ id: 'exec-1', status: 'running', logs: [] })

      const result = await controller.getExecution('1', 'exec-1')

      expect(result).toHaveProperty('logs')
    })
  })
})
