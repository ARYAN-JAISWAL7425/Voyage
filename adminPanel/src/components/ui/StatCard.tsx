import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/ui/Icon'

type Tone = 'brand' | 'accent' | 'success' | 'danger' | 'info'

const toneClasses: Record<Tone, string> = {
  brand: 'bg-brand-soft text-brand',
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-[#E7F0FE] text-info',
}

interface StatCardProps {
  label: string
  value: string
  icon: IconName
  tone?: Tone
  delta?: string
  deltaUp?: boolean
  className?: string
}

export function StatCard({ label, value, icon, tone = 'brand', delta, deltaUp = true, className }: StatCardProps) {
  return (
    <div className={cn('flex flex-col gap-3.5 rounded-lg border border-line bg-white p-5', className)}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-ink-secondary">{label}</span>
        <span className={cn('grid h-[34px] w-[34px] place-items-center rounded-lg', toneClasses[tone])}>
          <Icon name={icon} size={18} />
        </span>
      </div>
      <span className="font-heading text-[26px] font-semibold leading-none text-ink">{value}</span>
      {delta && (
        <span className={cn('inline-flex items-center gap-1 text-xs font-medium', deltaUp ? 'text-success' : 'text-danger')}>
          <Icon name={deltaUp ? 'trending-up' : 'trending-down'} size={14} />
          {delta}
        </span>
      )}
    </div>
  )
}
