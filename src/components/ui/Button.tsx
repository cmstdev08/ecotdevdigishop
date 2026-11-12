import React from 'react'
import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-primary/40'

    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-600 shadow-lg shadow-primary/25 border border-primary-500/30',
      accent: 'bg-accent text-brand-darkBg font-semibold hover:bg-accent-400 shadow-lg shadow-accent/25 border border-accent/40',
      secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/60',
      outline: 'border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800/60 hover:text-white hover:border-slate-600',
      ghost: 'bg-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white',
      destructive: 'bg-destructive text-white hover:bg-red-600 shadow-lg shadow-red-500/25',
    }

    const sizes = {
      sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
      md: 'text-sm px-4 py-2.5 h-10 gap-2',
      lg: 'text-base px-6 py-3 h-12 gap-2.5 font-semibold',
      icon: 'h-10 w-10 p-0',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
