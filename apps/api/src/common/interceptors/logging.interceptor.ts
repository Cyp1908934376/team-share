import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

/**
 * Logs incoming requests and outgoing responses with timing.
 * Format: [METHOD] /path -> statusCode (durationMs)
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url } = request
    const startTime = Date.now()

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse()
          const duration = Date.now() - startTime
          this.logger.log(`${method} ${url} -> ${response.statusCode} (${duration}ms)`)
        },
        error: (error) => {
          const duration = Date.now() - startTime
          const status = error?.status || error?.statusCode || 500
          this.logger.error(`${method} ${url} -> ${status} (${duration}ms)`)
        },
      }),
    )
  }
}
