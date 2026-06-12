import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  SetMetadata,
} from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { AuditLogsService } from './audit-logs.service'
import { Reflector } from '@nestjs/core'

export const AUDIT_ACTION_KEY = 'audit_action'
export const AuditAction = (action: string) => SetMetadata(AUDIT_ACTION_KEY, action)

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private auditLogsService: AuditLogsService,
    private reflector: Reflector
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const action = this.reflector.get<string>(
      AUDIT_ACTION_KEY,
      context.getHandler()
    )

    if (!action) {
      return next.handle()
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user
    const startTime = Date.now()

    return next.handle().pipe(
      tap(async (response) => {
        if (!user) return

        try {
          const params = context.switchToHttp().getRequest().params
          const resourceId = params.id || params.resourceId || response?.id

          // Infer resource type from route
          const route = request.route?.path || ''
          let resourceType: string | undefined
          if (route.includes('/resources')) resourceType = 'resource'
          else if (route.includes('/environments')) resourceType = 'environment'
          else if (route.includes('/workflows')) resourceType = 'workflow'
          else if (route.includes('/versions')) resourceType = 'version'
          else if (route.includes('/teams')) resourceType = 'team'

          await this.auditLogsService.log({
            userId: user.id,
            action,
            resourceType,
            resourceId,
            details: {
              method: request.method,
              path: request.path,
              statusCode: context.switchToHttp().getResponse().statusCode,
              duration: Date.now() - startTime,
            },
            ipAddress:
              request.ip || request.headers?.['x-forwarded-for'] || 'unknown',
            userAgent: request.headers?.['user-agent'] || 'unknown',
          })
        } catch (error) {
          // Don't let audit logging failures break the request
          console.error('Audit log failed:', error)
        }
      })
    )
  }
}
