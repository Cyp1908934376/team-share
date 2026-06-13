import { forwardRef, type HTMLAttributes, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../utils/cn'

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlay?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      open,
      onClose,
      title,
      description,
      size = 'md',
      closeOnOverlay = true,
      closeOnEscape = true,
      showCloseButton = true,
      children,
      ...props
    },
    ref
  ) => {
    const handleEscape = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape' && closeOnEscape) {
          onClose()
        }
      },
      [closeOnEscape, onClose]
    )

    useEffect(() => {
      if (open) {
        document.addEventListener('keydown', handleEscape)
        document.body.style.overflow = 'hidden'
      }
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = ''
      }
    }, [open, handleEscape])

    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
    }

    return createPortal(
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeOnOverlay ? onClose : undefined}
            />

            <motion.div
              ref={ref}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1.0] }}
              className={cn(
                'relative z-10 w-full rounded-xl bg-bg-elevated p-6 shadow-apple-4',
                sizeClasses[size],
                className
              )}
              style={props.style}
            >
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-lg p-1 text-label-tertiary transition-colors hover:bg-fill-quaternary hover:text-label-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-system-blue focus-visible:ring-offset-2"
                >
                  <X size={18} />
                </button>
              )}

              {(title || description) && (
                <div className="mb-4">
                  {title && <h2 className="text-title-3 text-label-primary">{title}</h2>}
                  {description && <p className="mt-1 text-footnote text-label-secondary">{description}</p>}
                </div>
              )}

              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )
  }
)

Modal.displayName = 'Modal'

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'mt-6 flex items-center justify-end gap-3',
          className
        )}
        {...props}
      />
    )
  }
)

ModalFooter.displayName = 'ModalFooter'
