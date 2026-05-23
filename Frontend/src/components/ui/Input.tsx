import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/ui/Icon'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: IconName
  trailing?: ReactNode
  containerClassName?: string
}

export function Input({ label, icon, trailing, className, containerClassName, ...props }: InputProps) {
  return (
    <label className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
      {label && <span className="text-[13px] font-medium text-ink-secondary">{label}</span>}
      <span className="flex items-center gap-2.5 h-[46px] rounded-sm border border-line-strong bg-white px-3.5 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
        {icon && <Icon name={icon} size={18} className="text-ink-muted shrink-0" />}
        <input
          className={cn(
            'flex-1 min-w-0 bg-transparent outline-none text-sm text-ink placeholder:text-ink-muted',
            className,
          )}
          {...props}
        />
        {trailing}
      </span>
    </label>
  )
}
