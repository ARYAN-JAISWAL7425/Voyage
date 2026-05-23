import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

interface RatingProps {
  score: number
  count?: number
  className?: string
  starSize?: number
}

export function Rating({ score, count, className, starSize = 16 }: RatingProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Icon name="star" size={starSize} className="text-star" fill="currentColor" strokeWidth={1.5} />
      <span className="font-bold text-ink text-sm leading-none">{score.toFixed(1)}</span>
      {count != null && <span className="text-ink-muted text-[13px] leading-none">({count})</span>}
    </span>
  )
}
