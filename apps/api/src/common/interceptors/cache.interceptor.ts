import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common'
import { Observable, of } from 'rxjs'
import { tap } from 'rxjs/operators'
import { RedisService } from '../../database/redis/redis.service'

export const CACHE_TTL = 'CACHE_TTL'
export const CACHE_PREFIX = 'CACHE_PREFIX'

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_TTL) private ttl: number = 300,
    @Inject(CACHE_PREFIX) private prefix: string = 'cache',
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest()

    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle()
    }

    // Get RedisService instance from request (set by module)
    const redisService: RedisService = request.__redisService
    if (!redisService?.isConnected) {
      return next.handle()
    }

    const cacheKey = this.buildCacheKey(request)
    const cached = await redisService.get(cacheKey)
    if (cached !== null && cached !== undefined) {
      return of(cached)
    }

    return next.handle().pipe(
      tap(async (response) => {
        if (response !== null && response !== undefined) {
          await redisService.set(cacheKey, response, this.ttl)
        }
      }),
    )
  }

  private buildCacheKey(request: any): string {
    const { method, originalUrl } = request
    return `${this.prefix}:${method}:${originalUrl}`
  }
}
