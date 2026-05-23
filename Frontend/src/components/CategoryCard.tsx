import { Link } from 'react-router-dom'
import type { Category } from '@/types'
import { IconBox } from '@/components/ui/IconBox'

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to={`/search?category=${encodeURIComponent(category.name)}`}
      className="flex flex-col gap-3.5 rounded-lg border border-line bg-white p-5 transition hover:border-brand hover:shadow-md"
    >
      <IconBox icon={category.icon} tone={category.tone} size={48} iconSize={23} />
      <div className="flex flex-col gap-0.5">
        <h3 className="font-heading text-[15px] font-semibold text-ink">{category.name}</h3>
        <p className="text-[13px] text-ink-secondary">{category.tripsCount.toLocaleString('en-IN')} trips</p>
      </div>
    </Link>
  )
}
