import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'isPublic'

/**
 * Marks a route as public (skips JWT authentication).
 * Usage: @Public() on a controller or route handler.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
