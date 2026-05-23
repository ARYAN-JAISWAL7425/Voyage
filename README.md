# Voyago

A travel marketplace where **operators** list group trips and **travelers** discover, book, and pay for them — with a separate **admin** console for platform moderation. Built with React + Vite + TypeScript + Tailwind on a Supabase (Postgres + Auth + RLS + Edge Functions) backend, with Razorpay for payments.

> This is a monorepo with two front-ends (the public app and the admin console) sharing one Supabase project.

## Live

- **Marketplace:** https://voyago-zeta-coral.vercel.app
- **Admin console:** https://voyago-admin-five.vercel.app

---

## Repository structure

```
Voyage/
├── Frontend/      # Traveler + operator web app (React 19 + Vite 8)
├── adminPanel/    # Admin console (React 19 + Vite 8)
├── supabase/      # SQL schema, RLS policies, RPCs + Razorpay Edge Functions
├── LICENSE
└── README.md
```

| Workspace | What it is | Default dev port |
|-----------|-----------|------------------|
| [`Frontend/`](Frontend/) | Public marketplace: browse/search trips, book & pay, traveler dashboard, **and** the operator (“Business”) dashboard for listing trips, managing bookings, availability & earnings. | `5173` |
| [`adminPanel/`](adminPanel/) | Admin-only console (gated by an `admin` role): operators, listings, bookings, payments, disputes, users. | `5174` |
| [`supabase/`](supabase/) | Database schema + Row-Level-Security policies + SECURITY DEFINER RPCs, plus the `create-order` / `verify-payment` Edge Functions. | — |

---

## Tech stack

- **Frontend:** React 19, Vite 8, TypeScript, Tailwind CSS 4, React Router 7, `lucide-react`
- **Backend:** Supabase — Postgres, Auth (email/password + Google OAuth), Row-Level Security, Edge Functions (Deno)
- **Payments:** Razorpay (server-side order creation + signature verification)

The Frontend has a **mock-data fallback**: with no Supabase env vars set, it serves a built-in demo catalog so you can run the UI without any backend. Add the keys and it switches to live Supabase data automatically.

---

## Prerequisites

- **Node.js 20+** (current LTS — required by Vite 8)
- A **Supabase** project (free tier is fine) — for live data, auth, and payments
- A **Razorpay** account in **Test mode** — for the checkout flow

---

## Getting started

### 1. Clone

```bash
git clone https://github.com/ARYAN-JAISWAL7425/Voyage.git
cd Voyage
```

### 2. Set up the Supabase backend

In the Supabase dashboard → **SQL Editor**, run the files in [`supabase/`](supabase/) **in this order** (each is idempotent / safe to re-run):

| # | File | Purpose |
|---|------|---------|
| 1 | [`schema.sql`](supabase/schema.sql) | Core tables + RLS (catalog is public-read; bookings/profiles are per-user) |
| 2 | [`storage.sql`](supabase/storage.sql) | Public bucket for trip photos + operator upload access |
| 3 | [`operator-policies.sql`](supabase/operator-policies.sql) | Lets an operator read bookings made for **their** trips |
| 4 | [`operator-write.sql`](supabase/operator-write.sql) | `become_operator()` self-onboarding + lets operators publish trips |
| 5 | [`payment-schema.sql`](supabase/payment-schema.sql) | Adds `payment_id` / `order_id` columns for the payment flow |
| 6 | [`admin-policies.sql`](supabase/admin-policies.sql) | `is_admin()` + platform-wide read & operator moderation for admins |
| 7 | [`cancel-booking.sql`](supabase/cancel-booking.sql) | `cancel_booking()` RPC (restores seats; requires `is_admin()`) |

Then deploy the **Edge Functions** (requires the [Supabase CLI](https://supabase.com/docs/guides/cli)):

```bash
supabase functions deploy create-order
supabase functions deploy verify-payment
```

Set their secrets in **Edge Functions → Secrets** (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically):

| Secret | Used by |
|--------|---------|
| `RAZORPAY_KEY_ID` | `create-order` |
| `RAZORPAY_KEY_SECRET` | `create-order`, `verify-payment` |

Finally, in **Authentication → URL Configuration → Redirect URLs**, add your local and production URLs (needed for password reset + Google OAuth), e.g. `http://localhost:5173/**`.

> **Grant admin access:** the admin console only opens for a user whose `profiles.role = 'admin'`. Sign that user up in the app first, then set their role to `admin` in the `profiles` table.

### 3. Run the Frontend

```bash
cd Frontend
npm install
cp .env.example .env.local        # then fill in your values
npm run dev                        # → http://localhost:5173
```

### 4. Run the admin panel

```bash
cd adminPanel
npm install
# create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (same project)
npm run dev                        # → http://localhost:5174
```

### 5. (Optional) Seed the catalog

Populates Supabase with the demo trips/operators using the **service-role** key:

```bash
cd Frontend
cp .env.seed.example .env.seed     # then fill in SUPABASE_URL + SUPABASE_SERVICE_ROLE
npm run seed:dry                   # preview without writing
npm run seed                       # write to the database
```

---

## Environment variables

`VITE_`-prefixed values are **browser-safe** (they ship in the client bundle). The service-role key is **secret** and must never be exposed to the browser or committed.

**`Frontend/.env.local`**

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL (blank → app uses mock data) |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable/anon key |
| `VITE_RAZORPAY_KEY_ID` | Razorpay **Test** key id (`rzp_test_…`); blank → payment is skipped |

**`adminPanel/.env.local`**

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Same Supabase project as the main app |
| `VITE_SUPABASE_ANON_KEY` | Same publishable/anon key |

**`Frontend/.env.seed`** (local-only, used by `npm run seed`)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE` | **Secret** service-role key (bypasses RLS — keep private) |

> All real `.env*` files are git-ignored; only the `*.example` templates (placeholders) are committed.

---

## Available scripts

Run inside `Frontend/` or `adminPanel/`:

| Script | Action |
|--------|--------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build |
| `npm run seed` / `seed:dry` | *(Frontend only)* Seed Supabase / dry-run preview |

---

## Database

Six core tables (see [`supabase/schema.sql`](supabase/schema.sql)):

`operators` · `trips` · `departures` · `profiles` · `reviews` · `bookings`

Catalog tables are public-read; `bookings`/`profiles` are per-user via RLS. Privileged actions (booking creation after payment, seat restoration on cancel, operator onboarding) go through **SECURITY DEFINER** functions and the Edge Functions rather than broad write policies.

## Payments

Checkout is fully server-validated: `create-order` recomputes the price from the database and creates a real Razorpay order, and `verify-payment` verifies Razorpay’s signature, re-checks seat availability, then creates the booking and decrements seats — so a paid booking can’t be forged or overbooked. Use Razorpay **Test mode** keys for development.

---

## Deployment

Each front-end is a static Vite build deployable to any static host (e.g. **Vercel** — set the project root to `Frontend/` or `adminPanel/`). Remember to:

1. Set the same `VITE_*` env vars on the host.
2. Add the production domain to **Supabase → Auth → Redirect URLs**.
3. Add it to your **Google OAuth** authorized origins / redirect URIs.

---

## License

See [LICENSE](LICENSE).
