'use client'

import { ButtonHTMLAttributes, forwardRef, ReactElement } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
    
    const variants = {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500',
      secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus-visible:ring-secondary-500',
      outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 focus-visible:ring-primary-500',
      ghost: 'text-primary-500 hover:bg-primary-50 focus-visible:ring-primary-500',
    }
    
    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-14 px-8 text-lg',
    }

    const classes = cn(baseStyles, variants[variant], sizes[size], className)

    if (asChild) {
      const child = children as ReactElement
      if (child && child.type === Link) {
        return (
          <Link
            {...child.props}
            className={cn(classes, child.props.className)}
            ref={ref}
          />
        )
      }
      return child
    }

    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
