import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)
  private client: Redis
  private connected = false

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const url = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379')
    try {
      this.client = new Redis(url, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          if (times > 5) return null
          return Math.min(times * 100, 3000)
        },
        lazyConnect: true,
      })

      await this.client.connect()
      this.connected = true
      this.logger.log('Redis 连接成功')
    } catch (error) {
      this.logger.warn(`Redis 连接失败，缓存功能将不可用: ${(error as Error).message}`)
      this.connected = false
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit()
      this.logger.log('Redis 连接已关闭')
    }
  }

  get isConnected(): boolean {
    return this.connected && this.client?.status === 'ready'
  }

  async get<T = string>(key: string): Promise<T | null> {
    if (!this.isConnected) return null
    const value = await this.client.get(key)
    if (!value) return null
    try {
      return JSON.parse(value) as T
    } catch {
      return value as unknown as T
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected) return
    const serialized = typeof value === 'string' ? value : JSON.stringify(value)
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, serialized)
    } else {
      await this.client.set(key, serialized)
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return
    await this.client.del(key)
  }

  async delByPattern(pattern: string): Promise<void> {
    if (!this.isConnected) return
    const keys = await this.client.keys(pattern)
    if (keys.length > 0) {
      await this.client.del(...keys)
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false
    const result = await this.client.exists(key)
    return result === 1
  }

  async incr(key: string): Promise<number> {
    if (!this.isConnected) return 0
    return this.client.incr(key)
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (!this.isConnected) return
    await this.client.expire(key, ttlSeconds)
  }

  async ttl(key: string): Promise<number> {
    if (!this.isConnected) return -1
    return this.client.ttl(key)
  }

  async keys(pattern: string): Promise<string[]> {
    if (!this.isConnected) return []
    return this.client.keys(pattern)
  }
}
