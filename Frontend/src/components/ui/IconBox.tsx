import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/ui/Icon'

type Tone = 'brand' | 'accent' | 'success' | 'danger' | 'info' | 'inverse'

const tones: Record<Tone, string> = {
  brand: 'bg-brand-soft text-brand',
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-[#E7F0FE] text-info',
  inverse: 'bg-brand text-white',
}

interface IconBoxProps {
  icon: IconName
  tone?: Tone
  size?: number
  iconSize?: number
  radius?: number
  className?: string
}

export function IconBox({ icon, tone = 'brand', size = 46, iconSize = 22, radius = 12, className }: IconBoxProps) {
  return (
    <div
      className={cn('inline-flex items-center justify-center shrink-0', tones[tone], className)}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <Icon name={icon} size={iconSize} />
    </div>
  )
}
