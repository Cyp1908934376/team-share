import { SetMetadata } from '@nestjs/common'

export const ROLES_KEY = 'roles'

/**
 * Restricts access to users with the specified roles.
 * Usage: @Roles('admin', 'developer')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles)
