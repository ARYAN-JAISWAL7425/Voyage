import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/ui/Icon'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  secondary: 'bg-white text-ink border border-line-strong hover:bg-surface-muted',
  ghost: 'bg-transparent text-ink hover:bg-surface-muted',
  outline: 'bg-transparent text-brand border border-brand hover:bg-brand-soft',
  danger: 'bg-danger text-white hover:brightness-95',
  success: 'bg-success text-white hover:brightness-95',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm rounded-sm gap-1.5',
  md: 'h-11 px-[22px] text-[15px] rounded-sm gap-2',
  lg: 'h-12 px-7 text-[15px] rounded-md gap-2',
}

interface ButtonProps {
  variant?: Variant
  size?: Size
  iconLeft?: IconName
  iconRight?: IconName
  fullWidth?: boolean
  children?: ReactNode
  className?: string
  to?: string
  href?: string
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  disabled?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth,
  children,
  className,
  to,
  href,
  type = 'button',
  onClick,
  disabled,
}: ButtonProps) {
  const cls = cn(
    'inline-flex items-center justify-center font-semibold transition-colors whitespace-nowrap cursor-pointer select-none',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className,
  )
  const iconSize = size === 'sm' ? 16 : 18
  const inner = (
    <>
      {iconLeft && <Icon name={iconLeft} size={iconSize} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </>
  )

  if (to) return <Link to={to} className={cls}>{inner}</Link>
  if (href) return <a href={href} className={cls}>{inner}</a>
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {inner}
    </button>
  )
}
