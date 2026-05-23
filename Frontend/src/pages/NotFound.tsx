import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center gap-4 py-28 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-soft"><Icon name="compass" size={32} className="text-brand" /></span>
      <h1 className="font-heading text-3xl font-bold text-ink">Page not found</h1>
      <p className="max-w-md text-ink-secondary">The page you're looking for doesn't exist or has moved. Let's get you back on track.</p>
      <div className="mt-2 flex gap-3">
        <Button to="/">Back home</Button>
        <Button to="/search" variant="secondary">Browse trips</Button>
      </div>
    </Container>
  )
}
