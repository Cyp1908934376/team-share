import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { MetricsService } from './metrics.service'

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest()
    const { method, route } = request
    const path = route?.path || request.url
    const start = Date.now()

    this.metrics.incrementActiveConnections()

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse()
          const duration = (Date.now() - start) / 1000
          this.metrics.incrementRequest(method, path, response.statusCode)
          this.metrics.observeRequestDuration(method, path, duration)
          this.metrics.decrementActiveConnections()
        },
        error: (error) => {
          const duration = (Date.now() - start) / 1000
          this.metrics.incrementRequest(method, path, error.status || 500)
          this.metrics.observeRequestDuration(method, path, duration)
          this.metrics.decrementActiveConnections()
        },
      }),
    )
  }
}
