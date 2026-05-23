import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { formatINR } from '@/lib/format'
import { useAuth } from '@/hooks/useAuth'
import { createTrip, uploadTripPhoto } from '@/lib/api/operator'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { categories } from '@/data/categories'

const DRAFT_KEY = 'voyago:trip-draft'

interface Draft {
  title: string; destination: string; category: string; price: string; originalPrice: string
  duration: string; maxGroup: string; transport: string; summary: string; description: string
  days: { title: string; desc: string }[]; departures: { date: string; seats: string }[]
  travelIncluded: boolean; departureCities: string[]; travelFare: string
  coverUrl: string; galleryUrls: string[]
}

function loadDraft(): Draft | null {
  try {
    const s = localStorage.getItem(DRAFT_KEY)
    return s ? (JSON.parse(s) as Draft) : null
  } catch {
    return null
  }
}

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-white p-6">
      <h2 className="font-heading text-lg font-bold text-ink">{title}</h2>
      {desc && <p className="mt-0.5 mb-4 text-sm text-ink-secondary">{desc}</p>}
      <div className={cn(!desc && 'mt-4')}>{children}</div>
    </section>
  )
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="text-[13px] font-medium text-ink-secondary">{label}</span>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="h-[46px] w-full appearance-none rounded-sm border border-line-strong bg-white px-3.5 pr-9 text-sm text-ink outline-none focus:border-brand">
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" />
      </div>
    </label>
  )
}

export default function CreateTrip() {
  const navigate = useNavigate()
  const { operatorId } = useAuth()
  const [draft] = useState<Draft | null>(() => loadDraft())

  const [title, setTitle] = useState(draft?.title ?? '')
  const [destination, setDestination] = useState(draft?.destination ?? '')
  const [category, setCategory] = useState(draft?.category ?? categories[0].name)
  const [price, setPrice] = useState(draft?.price ?? '')
  const [originalPrice, setOriginalPrice] = useState(draft?.originalPrice ?? '')
  const [duration, setDuration] = useState(draft?.duration ?? '')
  const [maxGroup, setMaxGroup] = useState(draft?.maxGroup ?? '')
  const [transport, setTransport] = useState(draft?.transport ?? 'Flights')
  const [summary, setSummary] = useState(draft?.summary ?? '')
  const [description, setDescription] = useState(draft?.description ?? '')
  const [days, setDays] = useState(draft?.days ?? [{ title: '', desc: '' }])
  const [departures, setDepartures] = useState(draft?.departures ?? [{ date: '', seats: '' }])

  // Travel model: round-trip from the traveler's city vs. land-only (join at destination)
  const [travelIncluded, setTravelIncluded] = useState(draft?.travelIncluded ?? true)
  const [departureCities, setDepartureCities] = useState<string[]>(draft?.departureCities ?? [])
  const [cityInput, setCityInput] = useState('')
  const [travelFare, setTravelFare] = useState(draft?.travelFare ?? '')

  // Photos (uploaded to Supabase Storage)
  const [coverUrl, setCoverUrl] = useState(draft?.coverUrl ?? '')
  const [galleryUrls, setGalleryUrls] = useState<string[]>(draft?.galleryUrls ?? [])
  const [uploading, setUploading] = useState(false)

  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [draftSaved, setDraftSaved] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const priceNum = Number(price) || 0
  const fareNum = Number(travelFare) || 0
  const origNum = Number(originalPrice) || 0
  const youEarn = Math.round(priceNum * 0.9)
  const landOnlyPrice = Math.max(priceNum - fareNum, 0)
  const effectiveTransport = travelIncluded ? transport : 'Land only'

  const addCity = () => {
    const c = cityInput.trim()
    if (c && !departureCities.some((x) => x.toLowerCase() === c.toLowerCase())) {
      setDepartureCities([...departureCities, c])
    }
    setCityInput('')
  }
  const removeCity = (c: string) => setDepartureCities(departureCities.filter((x) => x !== c))

  const uploadCover = async (file?: File | null) => {
    if (!file) return
    if (!operatorId) { setError('Finish operator setup before uploading photos.'); return }
    setError('')
    setUploading(true)
    const res = await uploadTripPhoto(operatorId, file)
    setUploading(false)
    if (res.error) setError(res.error)
    else if (res.url) setCoverUrl(res.url)
  }

  const addGallery = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (!operatorId) { setError('Finish operator setup before uploading photos.'); return }
    setError('')
    setUploading(true)
    for (const f of Array.from(files)) {
      const res = await uploadTripPhoto(operatorId, f)
      if (res.error) { setError(res.error); break }
      if (res.url) setGalleryUrls((g) => [...g, res.url as string])
    }
    setUploading(false)
  }
  const removeGalleryAt = (i: number) => setGalleryUrls((g) => g.filter((_, idx) => idx !== i))

  const saveDraft = () => {
    const d: Draft = {
      title, destination, category, price, originalPrice, duration, maxGroup, transport,
      summary, description, days, departures, travelIncluded, departureCities, travelFare,
      coverUrl, galleryUrls,
    }
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)) } catch { /* ignore quota errors */ }
    setDraftSaved(true)
    setTimeout(() => setDraftSaved(false), 2000)
  }

  const checklist = [
    { label: 'Trip title', done: title.trim().length > 3 },
    { label: 'Destination & category', done: destination.trim().length > 1 },
    { label: 'Summary added', done: summary.trim().length > 10 },
    ...(travelIncluded ? [{ label: 'Departure city added', done: departureCities.length > 0 }] : []),
    { label: 'At least one itinerary day', done: days.some((d) => d.title.trim()) },
    { label: 'Pricing set', done: priceNum > 0 },
    { label: 'At least one departure date', done: departures.some((d) => d.date.trim()) },
  ]
  const readyPct = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100)

  const publish = async () => {
    if (!operatorId) { setError('Finish operator setup before publishing.'); return }
    if (priceNum <= 0 || title.trim().length < 4) { setError('Add a trip title and price first.'); return }
    setError('')
    setPublishing(true)
    const res = await createTrip(operatorId, {
      title,
      destination,
      category,
      summary,
      description,
      price: priceNum,
      originalPrice: origNum > 0 ? origNum : undefined,
      durationDays: Number(duration) || 0,
      maxGroup: Number(maxGroup) || 0,
      travelIncluded,
      transport,
      departureCities,
      travelFare: fareNum,
      image: coverUrl || undefined,
      gallery: galleryUrls,
      itinerary: days.filter((d) => d.title.trim()).map((d, i) => ({ day: i + 1, title: d.title, description: d.desc })),
      departures: departures.filter((d) => d.date).map((d) => ({ date: d.date, seats: Number(d.seats) || 0 })),
    })
    setPublishing(false)
    if (res.error) { setError(res.error); return }
    try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
    navigate('/business/trips')
  }

  return (
    <div className="min-h-screen bg-surface-page">
      {/* Top bar */}
      <header className="flex h-16 items-center justify-between border-b border-line bg-white px-4 sm:px-10">
        <div className="flex items-center gap-3">
          <Link to="/business/dashboard" className="grid h-[34px] w-[34px] place-items-center rounded-sm border border-line bg-surface-muted text-ink"><Icon name="arrow-left" size={18} /></Link>
          <div>
            <p className="font-heading text-base font-bold text-ink">{title || 'Create new trip'}</p>
            <p className="text-xs text-ink-muted">Draft · not published</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" iconLeft="eye" className="hidden sm:inline-flex" onClick={() => setPreviewOpen(true)}>Preview</Button>
          <Button variant="secondary" size="sm" iconLeft={draftSaved ? 'check' : 'save'} onClick={saveDraft}>{draftSaved ? 'Draft saved' : 'Save draft'}</Button>
          <Button size="sm" iconLeft="check" onClick={publish} disabled={publishing}>{publishing ? 'Publishing…' : 'Publish'}</Button>
        </div>
      </header>

      {error && (
        <div className="mx-auto mt-4 flex max-w-[1180px] items-center gap-2 rounded-sm bg-danger-soft px-4 py-2.5 text-sm font-medium text-danger sm:px-10">
          <Icon name="circle-alert" size={16} className="shrink-0" /> {error}
        </div>
      )}
      <div className="mx-auto flex max-w-[1180px] flex-col gap-7 px-4 py-7 sm:px-10 lg:flex-row">
        {/* Form */}
        <div className="flex flex-1 flex-col gap-5">
          <Card title="Trip basics" desc="The essentials travelers see first">
            <div className="flex flex-col gap-4">
              <Input label="Trip title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 6-Day Goa Beaches & Old Town Escape" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Destination" icon="map-pin" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Goa" />
                <Select label="Category" value={category} onChange={setCategory} options={categories.map((c) => c.name)} />
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-ink-secondary">Short summary</span>
                <textarea rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="One punchy line shown on trip cards…" className="rounded-sm border border-line-strong bg-white p-3.5 text-sm text-ink outline-none focus:border-brand placeholder:text-ink-muted" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-ink-secondary">Full description</span>
                <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the experience in detail…" className="rounded-sm border border-line-strong bg-white p-3.5 text-sm text-ink outline-none focus:border-brand placeholder:text-ink-muted" />
              </label>
            </div>
          </Card>

          <Card title="Duration & group">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Duration (days)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="6" />
              <Input label="Max group size" type="number" value={maxGroup} onChange={(e) => setMaxGroup(e.target.value)} placeholder="14" />
            </div>
          </Card>

          {/* Travel model */}
          <Card title="Travel & pickup" desc="Do you manage round-trip travel, or do travelers join you at the destination?">
            <div className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setTravelIncluded(true)}
                  className={cn('flex flex-col gap-1 rounded-md border p-4 text-left transition', travelIncluded ? 'border-brand bg-brand-soft/40 ring-1 ring-brand' : 'border-line-strong hover:border-brand')}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink"><Icon name="plane-takeoff" size={16} className="text-brand" /> Round-trip included</span>
                  <span className="text-xs leading-relaxed text-ink-secondary">You pick travelers up from their city and bring them back. Price includes travel both ways.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTravelIncluded(false)}
                  className={cn('flex flex-col gap-1 rounded-md border p-4 text-left transition', !travelIncluded ? 'border-brand bg-brand-soft/40 ring-1 ring-brand' : 'border-line-strong hover:border-brand')}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink"><Icon name="luggage" size={16} className="text-brand" /> Land only</span>
                  <span className="text-xs leading-relaxed text-ink-secondary">Travelers arrange their own travel and meet you at the destination.</span>
                </button>
              </div>

              {travelIncluded ? (
                <>
                  <Select label="Round-trip transport" value={transport} onChange={setTransport} options={['Flights', 'Train', 'Volvo coach']} />

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] font-medium text-ink-secondary">Departure cities</span>
                    {departureCities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {departureCities.map((c) => (
                          <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[13px] font-medium text-brand-dark">
                            {c}
                            <button type="button" onClick={() => removeCity(c)} className="text-brand hover:text-danger"><Icon name="x" size={13} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCity() } }}
                        placeholder="Type a city and press Enter (e.g. Mumbai)"
                        className="h-[46px] flex-1 rounded-sm border border-line-strong bg-white px-3.5 text-sm text-ink outline-none focus:border-brand placeholder:text-ink-muted"
                      />
                      <Button variant="secondary" size="md" iconLeft="plus" onClick={addCity}>Add</Button>
                    </div>
                    <span className="text-xs text-ink-muted">Travelers pick their departure city at checkout.</span>
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] font-medium text-ink-secondary">Round-trip travel fare per person (₹)</span>
                    <Input type="number" value={travelFare} onChange={(e) => setTravelFare(e.target.value)} placeholder="7000" />
                    <span className="text-xs text-ink-muted">
                      Travelers who choose <strong className="font-semibold text-ink-secondary">land only</strong> pay {formatINR(landOnlyPrice)}{fareNum > 0 ? ` (${formatINR(fareNum)} less)` : ''}.
                    </span>
                  </label>
                </>
              ) : (
                <div className="flex items-start gap-2.5 rounded-md bg-surface-muted p-4 text-sm text-ink-secondary">
                  <Icon name="info" size={16} className="mt-0.5 shrink-0 text-brand" />
                  <span>Travelers book the land package only and meet you at <strong className="font-semibold text-ink">{destination || 'the destination'}</strong>. No departure cities or travel fare needed.</span>
                </div>
              )}
            </div>
          </Card>

          <Card title="Itinerary" desc="Add a day-by-day plan">
            <div className="flex flex-col gap-3">
              {days.map((d, i) => (
                <div key={i} className="rounded-md border border-line bg-surface-muted p-4">
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">{i + 1}</span> Day {i + 1}
                    </span>
                    {days.length > 1 && <button onClick={() => setDays(days.filter((_, idx) => idx !== i))} className="text-ink-muted hover:text-danger"><Icon name="trash-2" size={16} /></button>}
                  </div>
                  <div className="grid gap-3">
                    <Input placeholder="Day title (e.g. Arrive Delhi)" value={d.title} onChange={(e) => setDays(days.map((x, idx) => idx === i ? { ...x, title: e.target.value } : x))} />
                    <textarea rows={2} placeholder="What happens on this day…" value={d.desc} onChange={(e) => setDays(days.map((x, idx) => idx === i ? { ...x, desc: e.target.value } : x))} className="rounded-sm border border-line-strong bg-white p-3 text-sm text-ink outline-none focus:border-brand placeholder:text-ink-muted" />
                  </div>
                </div>
              ))}
              <button onClick={() => setDays([...days, { title: '', desc: '' }])} className="flex items-center justify-center gap-2 rounded-md border border-dashed border-line-strong py-3 text-sm font-medium text-brand hover:bg-brand-soft/40">
                <Icon name="plus" size={16} /> Add day
              </button>
            </div>
          </Card>

          <Card title="Pricing & commission">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Price per person (₹)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="26999" />
              <Input label="Original price (optional)" type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="—" />
            </div>
            <div className="mt-4 flex flex-col gap-2 rounded-md bg-surface-muted p-4 text-sm">
              <div className="flex justify-between text-ink-secondary"><span>Listed price{travelIncluded ? ' (with round-trip)' : ''}</span><span className="text-ink">{formatINR(priceNum)}</span></div>
              {travelIncluded && fareNum > 0 && (
                <div className="flex justify-between text-ink-secondary"><span>Land-only price (auto)</span><span className="text-ink">{formatINR(landOnlyPrice)}</span></div>
              )}
              <div className="flex justify-between text-ink-secondary"><span>Voyago commission (10%)</span><span className="text-danger">− {formatINR(Math.round(priceNum * 0.1))}</span></div>
              <div className="my-1 h-px bg-line" />
              <div className="flex justify-between font-semibold text-ink"><span>You earn / booking</span><span className="font-heading text-success">{formatINR(youEarn)}</span></div>
            </div>
          </Card>

          <Card title="Departure dates" desc="Set available dates and seats">
            <div className="flex flex-col gap-3">
              {departures.map((d, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
                  <Input label={i === 0 ? 'Departure date' : ''} type="date" value={d.date} onChange={(e) => setDepartures(departures.map((x, idx) => idx === i ? { ...x, date: e.target.value } : x))} />
                  <Input label={i === 0 ? 'Seats' : ''} type="number" placeholder="14" value={d.seats} onChange={(e) => setDepartures(departures.map((x, idx) => idx === i ? { ...x, seats: e.target.value } : x))} />
                  <button onClick={() => departures.length > 1 && setDepartures(departures.filter((_, idx) => idx !== i))} className="grid h-[46px] w-[46px] place-items-center rounded-sm border border-line-strong text-ink-muted hover:text-danger"><Icon name="trash-2" size={16} /></button>
                </div>
              ))}
              <button onClick={() => setDepartures([...departures, { date: '', seats: '' }])} className="flex items-center justify-center gap-2 rounded-md border border-dashed border-line-strong py-3 text-sm font-medium text-brand hover:bg-brand-soft/40">
                <Icon name="plus" size={16} /> Add departure
              </button>
            </div>
          </Card>

          <Card title="Photos" desc="Upload a cover photo and gallery — stored in Supabase">
            <div className="flex flex-col gap-4">
              {/* Cover */}
              <label className="relative grid aspect-[16/9] cursor-pointer place-items-center overflow-hidden rounded-md border border-dashed border-line-strong bg-surface-muted text-center hover:border-brand">
                {coverUrl ? (
                  <img src={coverUrl} alt="Cover" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <span className="flex flex-col items-center gap-1 text-ink-muted">
                    <Icon name="image" size={24} className="text-brand" />
                    <span className="text-sm font-medium text-ink">Upload cover photo</span>
                    <span className="text-xs">1600×900 recommended</span>
                  </span>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadCover(e.target.files?.[0])} />
              </label>

              {/* Gallery */}
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {galleryUrls.map((url, i) => (
                  <div key={url} className="relative aspect-square overflow-hidden rounded-md border border-line">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeGalleryAt(i)} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-ink shadow hover:text-danger"><Icon name="x" size={13} /></button>
                  </div>
                ))}
                <label className="grid aspect-square cursor-pointer place-items-center rounded-md border border-dashed border-line-strong bg-surface-muted text-ink-muted hover:border-brand">
                  <Icon name="plus" size={20} />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addGallery(e.target.files)} />
                </label>
              </div>
              {uploading && <p className="text-xs font-medium text-brand">Uploading…</p>}
              {!operatorId && <p className="text-xs text-ink-muted">Finish operator setup to enable photo uploads.</p>}
            </div>
          </Card>
        </div>

        {/* Side */}
        <aside className="flex w-full flex-col gap-5 lg:w-[340px] lg:shrink-0">
          <div className="lg:sticky lg:top-6 lg:flex lg:flex-col lg:gap-5">
            {/* Live preview */}
            <div className="rounded-lg border border-line bg-white p-4">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted"><Icon name="eye" size={14} /> Live preview</p>
              <div className="overflow-hidden rounded-lg border border-line">
                <div className="relative h-32 bg-gradient-to-br from-brand-soft to-accent-soft">
                  {coverUrl ? (
                    <img src={coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-ink-muted"><Icon name="image" size={28} /></div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 p-3.5">
                  <span className="inline-flex items-center gap-1 text-[13px] text-ink-secondary"><Icon name="map-pin" size={13} className="text-brand" /> {destination || 'Destination'}</span>
                  <p className="font-heading text-sm font-semibold text-ink line-clamp-2">{title || 'Your trip title appears here'}</p>
                  <span className="text-[12.5px] text-ink-secondary">{duration ? `${duration} days` : '— days'} · {effectiveTransport}</span>
                  <span className="inline-flex items-center gap-1 text-[12px] text-ink-secondary">
                    <Icon name={travelIncluded ? 'plane-takeoff' : 'luggage'} size={12} className="text-brand" />
                    {travelIncluded
                      ? departureCities.length
                        ? `Round-trip from ${departureCities[0]}${departureCities.length > 1 ? ` +${departureCities.length - 1}` : ''}`
                        : 'Round-trip available'
                      : `Land only · join at ${destination || 'destination'}`}
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-[11px] text-ink-muted">From</span>
                    <span className="font-heading text-lg font-bold text-ink">{priceNum ? formatINR(priceNum) : '₹—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="rounded-lg border border-line bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink">Publish checklist</h3>
                <span className="text-xs font-semibold text-brand">{readyPct}%</span>
              </div>
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${readyPct}%` }} /></div>
              <div className="flex flex-col gap-2">
                {checklist.map((c) => (
                  <div key={c.label} className="flex items-center gap-2 text-sm">
                    <Icon name={c.done ? 'circle-check' : 'circle'} size={16} className={c.done ? 'text-success' : 'text-line-strong'} />
                    <span className={c.done ? 'text-ink' : 'text-ink-secondary'}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured boost */}
            <div className="rounded-lg border border-[#F2C98C] bg-accent-soft p-5">
              <Icon name="sparkles" size={20} className="text-accent" />
              <h3 className="mt-2 font-heading text-base font-bold text-ink">Boost this trip</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">Feature your trip on the homepage & top of search to get up to 3× more bookings.</p>
              <Button variant="secondary" size="sm" fullWidth iconLeft="trending-up" className="mt-3 border-accent text-accent">Promote — from ₹2,999</Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Preview modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setPreviewOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-[680px] overflow-y-auto rounded-lg bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-56 bg-gradient-to-br from-brand-soft to-accent-soft">
              {coverUrl ? (
                <img src={coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-ink-muted"><Icon name="image" size={32} /></div>
              )}
              <button onClick={() => setPreviewOpen(false)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink shadow hover:text-danger"><Icon name="x" size={18} /></button>
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-secondary">Preview</span>
            </div>
            <div className="flex flex-col gap-4 p-6">
              <div>
                <span className="inline-flex items-center gap-1 text-[13px] text-ink-secondary"><Icon name="map-pin" size={14} className="text-brand" /> {destination || 'Destination'}</span>
                <h2 className="mt-1 font-heading text-2xl font-bold text-ink">{title || 'Your trip title'}</h2>
                {summary && <p className="mt-1 text-sm text-ink-secondary">{summary}</p>}
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-secondary">
                <span className="inline-flex items-center gap-1.5"><Icon name="timer" size={15} className="text-brand" /> {duration || '—'} days</span>
                <span className="inline-flex items-center gap-1.5"><Icon name="users" size={15} className="text-brand" /> Max {maxGroup || '—'}</span>
                <span className="inline-flex items-center gap-1.5"><Icon name={travelIncluded ? 'plane-takeoff' : 'luggage'} size={15} className="text-brand" /> {effectiveTransport}</span>
              </div>
              {description && <p className="text-sm leading-relaxed text-ink-secondary">{description}</p>}
              {galleryUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {galleryUrls.map((url) => <img key={url} src={url} alt="" className="aspect-square w-full rounded-md object-cover" />)}
                </div>
              )}
              {days.some((d) => d.title.trim()) && (
                <div>
                  <h3 className="mb-2 font-heading text-base font-bold text-ink">Itinerary</h3>
                  <div className="flex flex-col gap-2">
                    {days.filter((d) => d.title.trim()).map((d, i) => (
                      <div key={i} className="rounded-md border border-line p-3">
                        <p className="text-sm font-semibold text-ink">Day {i + 1}: {d.title}</p>
                        {d.desc && <p className="mt-0.5 text-sm text-ink-secondary">{d.desc}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-line pt-4">
                <div>
                  <span className="text-xs text-ink-muted">From</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-2xl font-bold text-ink">{priceNum ? formatINR(priceNum) : '₹—'}</span>
                    {origNum > priceNum && origNum > 0 && <span className="text-sm text-ink-muted line-through">{formatINR(origNum)}</span>}
                  </div>
                </div>
                <span className="text-sm text-ink-secondary">{departures.filter((d) => d.date).length} departure date{departures.filter((d) => d.date).length === 1 ? '' : 's'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
