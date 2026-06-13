import { Test, TestingModule } from '@nestjs/testing'
import { ResourcesController } from './resources.controller'
import { ResourcesService } from './resources.service'
import { StorageService } from '../../common/storage/storage.service'

describe('ResourcesController', () => {
  let controller: ResourcesController
  let service: any

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      star: jest.fn(),
      publish: jest.fn(),
      download: jest.fn(),
      findByType: jest.fn(),
    }

    const mockStorageService = {
      uploadFile: jest.fn(),
      getFile: jest.fn(),
      getPresignedUrl: jest.fn(),
      deleteFile: jest.fn(),
      isReady: jest.fn().mockReturnValue(true),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourcesController],
      providers: [
        { provide: ResourcesService, useValue: mockService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile()

    controller = module.get<ResourcesController>(ResourcesController)
    service = module.get(ResourcesService)
  })

  describe('findAll', () => {
    it('should return paginated resources', async () => {
      const mockResult = { items: [{ id: '1', name: 'Test' }], meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 } }
      service.findAll.mockResolvedValue(mockResult)

      const result = await controller.findAll({ page: 1, pageSize: 20 })

      expect(result).toHaveProperty('items')
      expect(result.items).toHaveLength(1)
    })

    it('should filter by type', async () => {
      service.findAll.mockResolvedValue({ items: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } })

      await controller.findAll({ type: 'prompt' })

      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ type: 'prompt' }))
    })
  })

  describe('findOne', () => {
    it('should return resource detail', async () => {
      service.findById.mockResolvedValue({ id: '1', name: 'Test', isStarred: false })

      const result = await controller.findOne('1', { user: { id: 'user-1' } })

      expect(result).toHaveProperty('name', 'Test')
    })
  })

  describe('create', () => {
    it('should create a resource', async () => {
      service.create.mockResolvedValue({ id: '1', name: 'New', type: 'prompt' })

      const result = await controller.create(
        { user: { id: 'user-1' } },
        { type: 'prompt', name: 'New' } as any,
      )

      expect(result).toHaveProperty('id', '1')
    })
  })

  describe('update', () => {
    it('should update a resource', async () => {
      service.update.mockResolvedValue({ id: '1', name: 'Updated' })

      const result = await controller.update(
        '1',
        { user: { id: 'user-1' } },
        { name: 'Updated' } as any,
      )

      expect(result.name).toBe('Updated')
    })
  })

  describe('delete', () => {
    it('should delete a resource', async () => {
      service.delete.mockResolvedValue({ success: true })

      const result = await controller.delete('1', { user: { id: 'user-1' } })

      expect(result).toEqual({ success: true })
    })
  })
})
