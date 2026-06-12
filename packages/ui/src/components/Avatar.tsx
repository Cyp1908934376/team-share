import { forwardRef, type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils/cn'

const avatarVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-fill-tertiary',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-[10px]',
        sm: 'h-8 w-8 text-caption-2',
        md: 'h-10 w-10 text-footnote',
        lg: 'h-12 w-12 text-subheadline',
        xl: 'h-16 w-16 text-headline',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface AvatarProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  fallback?: string
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, fallback, ...props }, ref) => {
    const initials = fallback || alt?.charAt(0).toUpperCase() || '?'

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-medium text-label-secondary">{initials}</span>
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'
