import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/database/prisma/prisma.service'

describe('App E2E', () => {
  let app: INestApplication
  let prisma: PrismaService

  const testUser = {
    username: 'e2e_test_user',
    email: 'e2e@test.com',
    password: 'TestPass123!',
  }

  let authToken: string
  let userId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()

    app.setGlobalPrefix('api/v1')
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    )

    await app.init()

    prisma = app.get(PrismaService)

    // Clean up any leftover test data
    await prisma.star.deleteMany({ where: {} })
    await prisma.version.deleteMany({ where: {} })
    await prisma.auditLog.deleteMany({ where: {} })
    await prisma.resource.deleteMany({ where: {} })
    await prisma.teamMember.deleteMany({ where: {} })
    await prisma.notification.deleteMany({ where: {} })
    await prisma.user.deleteMany({
      where: { username: testUser.username },
    })
  })

  afterAll(async () => {
    // Clean up
    await prisma.user.deleteMany({
      where: { username: testUser.username },
    })
    await app.close()
  })

  describe('Auth Flow', () => {
    it('POST /api/v1/auth/register - should register a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201)

      expect(res.body).toHaveProperty('token')
      expect(res.body.user).toHaveProperty('username', testUser.username)
      expect(res.body.user).toHaveProperty('email', testUser.email)
      expect(res.body.user).not.toHaveProperty('passwordHash')

      authToken = res.body.token
      userId = res.body.user.id
    })

    it('POST /api/v1/auth/register - should reject duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(409)
    })

    it('POST /api/v1/auth/login - should login with username', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ usernameOrEmail: testUser.username, password: testUser.password })
        .expect(201)

      expect(res.body).toHaveProperty('token')
      authToken = res.body.token
    })

    it('POST /api/v1/auth/login - should login with email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ usernameOrEmail: testUser.email, password: testUser.password })
        .expect(201)

      expect(res.body).toHaveProperty('token')
    })

    it('POST /api/v1/auth/login - should reject wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ usernameOrEmail: testUser.username, password: 'wrong-password' })
        .expect(401)
    })

    it('GET /api/v1/auth/me - should return current user', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(res.body).toHaveProperty('id')
      expect(res.body).toHaveProperty('username', testUser.username)
    })

    it('GET /api/v1/auth/me - should reject without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401)
    })
  })

  describe('Resource CRUD', () => {
    let resourceId: string

    it('POST /api/v1/resources - should create a resource', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'prompt',
          name: 'E2E Test Prompt',
          description: 'Created during E2E testing',
          visibility: 'team',
        })
        .expect(201)

      expect(res.body).toHaveProperty('id')
      expect(res.body).toHaveProperty('name', 'E2E Test Prompt')
      expect(res.body).toHaveProperty('slug', 'e2e-test-prompt')
      resourceId = res.body.id
    })

    it('GET /api/v1/resources - should list resources', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/resources')
        .expect(200)

      expect(res.body).toHaveProperty('items')
      expect(Array.isArray(res.body.items)).toBe(true)
      expect(res.body).toHaveProperty('meta')
    })

    it('GET /api/v1/resources/:id - should get resource detail', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/resources/${resourceId}`)
        .expect(200)

      expect(res.body).toHaveProperty('name', 'E2E Test Prompt')
      expect(res.body).toHaveProperty('owner')
      expect(res.body).toHaveProperty('isStarred', false)
    })

    it('PUT /api/v1/resources/:id - should update resource', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/resources/${resourceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated E2E Prompt' })
        .expect(200)

      expect(res.body).toHaveProperty('name', 'Updated E2E Prompt')
    })

    it('POST /api/v1/resources/:id/star - should star a resource', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/resources/${resourceId}/star`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201)

      expect(res.body).toHaveProperty('starred', true)
    })

    it('POST /api/v1/resources/:id/star - should unstar a resource', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/resources/${resourceId}/star`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201)

      expect(res.body).toHaveProperty('starred', false)
    })

    it('DELETE /api/v1/resources/:id - should delete resource', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/resources/${resourceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
    })

    it('GET /api/v1/resources/:id - should return 404 after delete', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/resources/${resourceId}`)
        .expect(404)
    })
  })

  describe('Protected Routes', () => {
    it('should return 401 for protected route without token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/resources')
        .send({ type: 'prompt', name: 'Test' })
        .expect(401)
    })
  })
})
