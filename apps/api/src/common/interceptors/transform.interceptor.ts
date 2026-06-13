import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface WrappedResponse<T> {
  code: number
  message: string
  data: T
  meta?: any
}

/**
 * Wraps all successful responses in a standardized format:
 * { code: 0, message: 'success', data: T, meta?: PaginationMeta }
 *
 * Skips wrapping if the response is already in the standard format
 * or if it's a raw type (string, Buffer, etc.).
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, WrappedResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<WrappedResponse<T>> {
    const response = context.switchToHttp().getResponse()

    return next.handle().pipe(
      map((data) => {
        // Skip wrapping for raw types and already-wrapped responses
        if (
          data === undefined ||
          data === null ||
          typeof data === 'string' ||
          Buffer.isBuffer(data)
        ) {
          return data as any
        }

        // If the response already has a 'code' field, assume it's already wrapped
        if (typeof data === 'object' && 'code' in data) {
          return data
        }

        // Arrays: wrap directly, no extra metadata extraction needed
        if (Array.isArray(data)) {
          return {
            code: 0,
            message: 'success',
            data,
          }
        }

        // Extract pagination/extra metadata if present
        const { items, meta, ...extra } = data || {}

        return {
          code: 0,
          message: 'success',
          data: items !== undefined ? items : data,
          ...(meta ? { meta } : {}),
          // Preserve extra metadata fields (e.g. total, unreadCount)
          ...(Object.keys(extra).length > 0 ? extra : {}),
        }
      }),
    )
  }
}
