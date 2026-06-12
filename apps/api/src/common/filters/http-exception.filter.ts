import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

/**
 * Global HTTP exception filter that standardizes all error responses
 * to the format: { code: number, message: string, details?: any, path: string, timestamp: string }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status: number
    let message: string
    let details: any

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any
        message = resp.message || exception.message
        // Extract class-validator validation errors
        if (Array.isArray(resp.message)) {
          details = resp.message
          message = '验证失败'
        }
      } else {
        message = exception.message
      }
    } else {
      // Unexpected errors
      status = HttpStatus.INTERNAL_SERVER_ERROR
      message = '服务器内部错误'
      this.logger.error('Unexpected error:', exception)
    }

    response.status(status).json({
      code: status,
      message,
      details,
      path: request.url,
      timestamp: new Date().toISOString(),
    })
  }
}
