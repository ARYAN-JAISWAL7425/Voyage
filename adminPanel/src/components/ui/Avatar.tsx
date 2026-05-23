import { cn } from '@/lib/cn'

interface AvatarProps {
  initials: string
  src?: string
  size?: number
  className?: string
}

export function Avatar({ initials, src, size = 40, className }: AvatarProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full overflow-hidden bg-brand-soft text-brand font-semibold shrink-0',
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {src ? <img src={src} alt={initials} className="w-full h-full object-cover" /> : initials}
    </div>
  )
}
