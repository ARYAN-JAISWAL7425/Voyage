import { Link } from 'react-router-dom'
import { IconBox } from '@/components/ui/IconBox'
import { SocialIcon, type SocialName } from '@/components/ui/SocialIcon'

const columns: { title: string; links: string[] }[] = [
  { title: 'Explore', links: ['Destinations', 'Trip categories', 'Top deals', 'Travel guides'] },
  { title: 'Company', links: ['About us', 'Careers', 'Press', 'Contact'] },
  { title: 'For business', links: ['List your trips', 'Partner portal', 'Verification', 'Commission rates'] },
  { title: 'Support', links: ['Help center', 'Cancellation', 'Trust & safety', 'Terms & privacy'] },
]

const socials: SocialName[] = ['instagram', 'facebook', 'x', 'youtube']

export function Footer() {
  return (
    <footer className="bg-surface-inverse px-5 py-11 sm:px-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap justify-between gap-10">
          <div className="flex w-full max-w-[300px] flex-col gap-3.5">
            <Link to="/" className="flex items-center gap-2.5">
              <IconBox icon="compass" tone="inverse" size={30} iconSize={19} radius={8} />
              <span className="font-heading text-xl font-bold text-white">Voyago</span>
            </Link>
            <p className="text-[13px] leading-relaxed text-ink-muted">
              The trusted marketplace connecting travelers with verified trip operators across India.
            </p>
            <div className="flex gap-2.5">
              {socials.map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={s}
                  className="grid h-[34px] w-[34px] place-items-center rounded-full bg-white/[0.08] text-white/70 transition hover:bg-white/15 hover:text-white"
                >
                  <SocialIcon name={s} size={16} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="flex w-[150px] flex-col gap-3">
              <h4 className="text-sm font-semibold text-white">{col.title}</h4>
              {col.links.map((link) => (
                <a key={link} href="#" className="text-[13px] text-ink-muted transition-colors hover:text-white">
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="h-px w-full bg-white/10" />

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-[13px] text-ink-muted">© 2026 Voyago Inc. All rights reserved.</p>
          <p className="text-[13px] text-ink-muted">
            Secured payments by Razorpay · UPI · Cards · Net Banking · GST invoices
          </p>
        </div>
      </div>
    </footer>
  )
}
