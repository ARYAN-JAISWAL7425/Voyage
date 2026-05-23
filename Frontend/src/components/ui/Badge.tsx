import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/ui/Icon'

type Tone = 'accent' | 'brand' | 'success' | 'danger' | 'info' | 'neutral' | 'solid-accent'

const tones: Record<Tone, string> = {
  accent: 'bg-accent-soft text-accent',
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-[#E7F0FE] text-info',
  neutral: 'bg-surface-muted text-ink-secondary',
  'solid-accent': 'bg-accent text-white',
}

interface BadgeProps {
  tone?: Tone
  icon?: IconName
  children: ReactNode
  className?: string
}

export function Badge({ tone = 'accent', icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-[11px] py-[5px] text-xs font-semibold leading-none',
        tones[tone],
        className,
      )}
    >
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  )
}
