import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

describe('AuthController', () => {
  let controller: AuthController
  let authService: any

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      validateUser: jest.fn(),
      changePassword: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get(AuthService)
  })

  describe('register', () => {
    it('should register a new user', async () => {
      const mockResult = { user: { id: '1', username: 'newuser' }, token: 'jwt-token' }
      authService.register.mockResolvedValue(mockResult)

      const result = await controller.register({
        username: 'newuser',
        email: 'new@test.com',
        password: 'password123',
      })

      expect(result).toEqual(mockResult)
      expect(authService.register).toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('should login and return token', async () => {
      const mockResult = { user: { id: '1', username: 'testuser' }, token: 'jwt-token' }
      authService.login.mockResolvedValue(mockResult)

      const result = await controller.login({
        usernameOrEmail: 'testuser',
        password: 'password123',
      })

      expect(result).toHaveProperty('token')
      expect(authService.login).toHaveBeenCalledWith({
        usernameOrEmail: 'testuser',
        password: 'password123',
      })
    })
  })

  describe('getProfile', () => {
    it('should return current user profile', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@test.com' }
      authService.validateUser.mockResolvedValue(mockUser)

      const result = await controller.getProfile({ user: { id: '1' } })

      expect(result).toEqual(mockUser)
    })
  })
})
