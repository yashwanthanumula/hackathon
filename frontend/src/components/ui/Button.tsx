import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          clsx(
            'inline-flex items-center justify-center rounded-md font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            {
              'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-600':
                variant === 'primary',
              'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600':
                variant === 'secondary',
              'hover:bg-gray-100 dark:hover:bg-gray-800':
                variant === 'ghost',
              'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600':
                variant === 'danger',
            },
            {
              'h-8 px-3 text-sm': size === 'sm',
              'h-10 px-4 text-sm': size === 'md',
              'h-12 px-6 text-base': size === 'lg',
            },
            className
          )
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'