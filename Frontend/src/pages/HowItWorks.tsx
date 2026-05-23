import { useState } from 'react'
import { Container } from '@/components/ui/Container'
import { Icon, type IconName } from '@/components/ui/Icon'
import { IconBox } from '@/components/ui/IconBox'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

const steps: { icon: IconName; step: string; title: string; body: string }[] = [
  { icon: 'search', step: 'Step 1', title: 'Search & compare', body: 'Filter thousands of verified trips by destination, budget, duration, dates — and your departure city.' },
  { icon: 'route', step: 'Step 2', title: 'Choose how you travel', body: 'Pick a full package with round-trip travel from your city, or go land-only and join the group at the destination.' },
  { icon: 'shield-check', step: 'Step 3', title: 'Book securely', body: 'Reserve your seats and pay safely with UPI, cards or net-banking via Razorpay — with a GST invoice.' },
  { icon: 'plane-takeoff', step: 'Step 4', title: 'Travel with confidence', body: 'Get your e-ticket & QR, meet your operator’s host, and enjoy 24/7 support before, during and after.' },
]

const travelModes: { icon: IconName; tone: 'brand' | 'accent'; title: string; body: string }[] = [
  { icon: 'plane-takeoff', tone: 'brand', title: 'Full package — travel included', body: 'The operator arranges round-trip flights/train/coach from your city and a host travels with the group door-to-door, then brings you home.' },
  { icon: 'luggage', tone: 'accent', title: 'Land only — join at destination', body: 'Prefer your own flights, have miles, or live nearby? Book just the on-ground experience and meet the group at the destination.' },
]

const why: { icon: IconName; title: string; body: string }[] = [
  { icon: 'badge-check', title: 'Verified operators', body: 'Every operator is KYC-verified before they can list a single trip.' },
  { icon: 'lock', title: 'Secure payments', body: 'PCI-DSS Razorpay checkout — and you’re not charged until availability is confirmed.' },
  { icon: 'calendar-check', title: 'Free cancellation', body: 'Cancel free up to 15 days before departure on most trips.' },
  { icon: 'headphones', title: '24/7 support', body: 'Real humans to help before, during and after your journey.' },
  { icon: 'star', title: 'Real reviews', body: 'Ratings only from travelers who actually went on the trip.' },
  { icon: 'wallet', title: 'No hidden fees', body: 'Transparent pricing with GST shown upfront — no surprises.' },
]

const faqs: { q: string; a: string }[] = [
  { q: 'Is travel from my city included?', a: 'On full packages, yes — round-trip travel (flights/train/coach) from your selected departure city is included and managed by the operator. Land-only trips exclude travel; you arrange your own and meet the group at the destination.' },
  { q: 'Can I join a trip at the destination?', a: 'Yes. Choose the “Land only” option on any trip that offers it, or book a land-only operator. The price drops by the travel portion and you simply meet the group at the destination on Day 1.' },
  { q: 'How do payments work?', a: 'Securely via Razorpay — UPI, cards, net-banking or no-cost EMI. You receive a GST invoice, and you aren’t charged until the operator confirms your seats.' },
  { q: 'What is the cancellation policy?', a: 'Most trips offer free cancellation up to 15 days before departure, 50% refund up to 7 days before, and no refund within 7 days. Each trip lists its own policy on the booking page.' },
  { q: 'Who actually runs the trips?', a: 'Independent, verified operators run and operate the trips and the travel. Voyago is the marketplace that handles discovery, secure payments, your voucher and support.' },
]

export default function HowItWorks() {
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <div>
      {/* Hero */}
      <section className="bg-surface-inverse">
        <Container className="flex flex-col items-center gap-4 py-16 text-center">
          <Badge tone="brand" icon="compass">How Voyago works</Badge>
          <h1 className="max-w-[760px] font-heading text-3xl font-bold leading-tight text-white sm:text-[42px]">
            From your city to the trip of a lifetime — fully managed
          </h1>
          <p className="max-w-[620px] text-[15px] leading-relaxed text-[#C7D2D9]">
            Voyago connects you with verified operators who run end-to-end group trips. Compare, choose how you travel,
            book securely, and go — we handle the rest.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button to="/search" iconRight="arrow-right">Browse trips</Button>
            <Button to="/business/register" variant="outline-inverse">List your trips</Button>
          </div>
        </Container>
      </section>

      {/* Steps */}
      <section className="bg-white py-16">
        <Container className="flex flex-col gap-9">
          <div className="max-w-[620px]">
            <h2 className="font-heading text-3xl font-bold text-ink">Four simple steps</h2>
            <p className="mt-1.5 text-[15px] text-ink-secondary">From discovery to departure, with no coordination headaches.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.step} className="flex flex-col gap-3.5 rounded-lg border border-line bg-surface-muted p-7">
                <div className="flex items-center gap-3.5">
                  <IconBox icon={s.icon} tone="inverse" size={52} iconSize={25} />
                  <span className="font-mono text-[13px] font-semibold text-brand">{s.step}</span>
                </div>
                <h3 className="font-heading text-[19px] font-semibold text-ink">{s.title}</h3>
                <p className="text-sm leading-relaxed text-ink-secondary">{s.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Travel your way */}
      <section className="bg-surface-page py-16">
        <Container className="flex flex-col gap-9">
          <div className="max-w-[620px]">
            <Badge tone="accent" icon="sparkles" className="mb-3 w-fit">Travel your way</Badge>
            <h2 className="font-heading text-3xl font-bold text-ink">Round-trip from your city, or land-only</h2>
            <p className="mt-1.5 text-[15px] text-ink-secondary">
              Not every trip needs you to sort your own flights. Choose what suits you on each trip.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {travelModes.map((m) => (
              <div key={m.title} className="flex flex-col gap-4 rounded-lg border border-line bg-white p-7">
                <IconBox icon={m.icon} tone={m.tone} size={52} iconSize={26} />
                <h3 className="font-heading text-xl font-bold text-ink">{m.title}</h3>
                <p className="text-[15px] leading-relaxed text-ink-secondary">{m.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Why Voyago */}
      <section className="bg-white py-16">
        <Container className="flex flex-col gap-9">
          <div className="max-w-[620px]">
            <h2 className="font-heading text-3xl font-bold text-ink">Why book with Voyago</h2>
            <p className="mt-1.5 text-[15px] text-ink-secondary">The marketplace layer that makes booking a trip feel safe and simple.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {why.map((w) => (
              <div key={w.title} className="flex gap-4">
                <IconBox icon={w.icon} tone="brand" size={44} iconSize={21} />
                <div>
                  <h3 className="font-heading text-base font-semibold text-ink">{w.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{w.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-surface-page py-16">
        <Container className="max-w-[820px]">
          <h2 className="mb-7 font-heading text-3xl font-bold text-ink">Frequently asked questions</h2>
          <div className="flex flex-col overflow-hidden rounded-lg border border-line bg-white">
            {faqs.map((f, i) => {
              const open = openFaq === i
              return (
                <div key={f.q} className={cn('border-line', i !== faqs.length - 1 && 'border-b')}>
                  <button onClick={() => setOpenFaq(open ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                    <span className="font-semibold text-ink">{f.q}</span>
                    <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} className="shrink-0 text-ink-muted" />
                  </button>
                  {open && <p className="px-5 pb-5 text-sm leading-relaxed text-ink-secondary">{f.a}</p>}
                </div>
              )
            })}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-white py-16">
        <Container>
          <div className="flex flex-col items-center gap-5 rounded-xl bg-surface-inverse p-10 text-center sm:p-14">
            <h2 className="max-w-[560px] font-heading text-3xl font-bold leading-tight text-white">
              Ready to find your next trip?
            </h2>
            <p className="max-w-[520px] text-[15px] text-[#C7D2D9]">
              Browse curated, verified trips across India — with travel from your city handled for you.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button to="/search" iconRight="arrow-right">Explore trips</Button>
              <Button to="/signup" variant="outline-inverse">Create free account</Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
