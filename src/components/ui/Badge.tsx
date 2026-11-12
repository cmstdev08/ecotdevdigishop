import React from 'react'
import { cn } from '@/utils/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
  size?: 'sm' | 'md'
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'primary',
  size = 'sm',
  children,
  ...props
}) => {
  const base = 'inline-flex items-center font-medium rounded-full uppercase tracking-wider'

  const variants = {
    primary: 'bg-primary/15 text-primary border border-primary/30',
    accent: 'bg-accent/15 text-accent border border-accent/30',
    secondary: 'bg-slate-800 text-slate-300 border border-slate-700',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    destructive: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    outline: 'border border-slate-700 text-slate-300',
  }

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-semibold',
  }

  return (
    <div className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </div>
  )
}
