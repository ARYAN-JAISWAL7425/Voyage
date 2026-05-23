import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/ui/Icon'
import { IconBox } from '@/components/ui/IconBox'

interface StatCardProps {
  label: string
  value: string
  icon: IconName
  tone?: 'brand' | 'accent' | 'success' | 'danger' | 'info'
  delta?: string
  deltaUp?: boolean
  className?: string
}

export function StatCard({ label, value, icon, tone = 'brand', delta, deltaUp = true, className }: StatCardProps) {
  return (
    <div className={cn('flex flex-col gap-3.5 rounded-lg border border-line bg-white p-5', className)}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-ink-secondary">{label}</span>
        <IconBox icon={icon} tone={tone} size={34} iconSize={18} radius={8} />
      </div>
      <span className="font-heading text-[26px] font-semibold text-ink leading-none">{value}</span>
      {delta && (
        <span className={cn('inline-flex items-center gap-1 text-xs font-medium', deltaUp ? 'text-success' : 'text-danger')}>
          <Icon name={deltaUp ? 'trending-up' : 'trending-down'} size={14} />
          {delta}
        </span>
      )}
    </div>
  )
}
