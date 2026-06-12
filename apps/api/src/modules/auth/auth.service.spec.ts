import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { PrismaService } from '../../database/prisma/prisma.service'

describe('AuthService', () => {
  let service: AuthService
  let prisma: any
  let jwtService: any

  const mockUser = {
    id: 'user-uuid-1',
    username: 'testuser',
    email: 'test@example.com',
    displayName: 'Test User',
    avatarUrl: null,
    passwordHash: '$2a$10$hashedPassword',
    role: 'user',
    preferences: {},
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    const mockPrisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    }

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    }

    const mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret'),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    prisma = module.get(PrismaService)
    jwtService = module.get(JwtService)
  })

  describe('register', () => {
    const registerDto = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      displayName: 'New User',
    }

    it('should register a new user and return token', async () => {
      prisma.user.findFirst.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue({
        ...mockUser,
        username: registerDto.username,
        email: registerDto.email,
        displayName: registerDto.displayName,
      })

      const result = await service.register(registerDto)

      expect(result).toHaveProperty('token', 'mock-jwt-token')
      expect(result.user).toHaveProperty('username', 'newuser')
      expect(result.user).toHaveProperty('email', 'new@example.com')
      expect(prisma.user.create).toHaveBeenCalledTimes(1)
    })

    it('should use username as displayName when not provided', async () => {
      prisma.user.findFirst.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue({
        ...mockUser,
        username: 'newuser',
        displayName: 'newuser',
      })

      const result = await service.register({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      })

      expect(result.user.displayName).toBe('newuser')
    })

    it('should throw ConflictException if username exists', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser)

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException)
    })

    it('should throw ConflictException if email exists', async () => {
      prisma.user.findFirst.mockResolvedValue({ ...mockUser, username: 'other' })

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException)
    })
  })

  describe('login', () => {
    const loginDto = {
      usernameOrEmail: 'testuser',
      password: 'password123',
    }

    it('should login with username and return token', async () => {
      const bcrypt = require('bcryptjs')
      const hash = await bcrypt.hash('password123', 10)
      prisma.user.findFirst.mockResolvedValue({ ...mockUser, passwordHash: hash })
      prisma.user.update.mockResolvedValue(mockUser)

      const result = await service.login(loginDto)

      expect(result).toHaveProperty('token', 'mock-jwt-token')
      expect(result.user).toHaveProperty('username', 'testuser')
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: { lastLoginAt: expect.any(Date) },
        }),
      )
    })

    it('should login with email', async () => {
      const bcrypt = require('bcryptjs')
      const hash = await bcrypt.hash('password123', 10)
      prisma.user.findFirst.mockResolvedValue({ ...mockUser, passwordHash: hash })
      prisma.user.update.mockResolvedValue(mockUser)

      const result = await service.login({
        usernameOrEmail: 'test@example.com',
        password: 'password123',
      })

      expect(result).toHaveProperty('token')
    })

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null)

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException if password is wrong', async () => {
      const bcrypt = require('bcryptjs')
      const hash = await bcrypt.hash('correct-password', 10)
      prisma.user.findFirst.mockResolvedValue({ ...mockUser, passwordHash: hash })

      await expect(
        service.login({ usernameOrEmail: 'testuser', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('validateUser', () => {
    it('should return user without password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        displayName: mockUser.displayName,
        avatarUrl: mockUser.avatarUrl,
        role: mockUser.role,
      })

      const result = await service.validateUser(mockUser.id)

      expect(result).not.toHaveProperty('passwordHash')
      expect(result).toHaveProperty('id', mockUser.id)
    })

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      await expect(service.validateUser('non-existent')).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const bcrypt = require('bcryptjs')
      const oldHash = await bcrypt.hash('oldpassword', 10)
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, passwordHash: oldHash })
      prisma.user.update.mockResolvedValue(mockUser)

      const result = await service.changePassword(mockUser.id, 'oldpassword', 'newpassword')

      expect(result).toEqual({ success: true })
    })

    it('should throw BadRequestException if current password is wrong', async () => {
      const bcrypt = require('bcryptjs')
      const hash = await bcrypt.hash('correctpass', 10)
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, passwordHash: hash })

      await expect(
        service.changePassword(mockUser.id, 'wrongpass', 'newpass'),
      ).rejects.toThrow(BadRequestException)
    })
  })
})
