# AGENTS.md — EasyFund V2

## Quick Reference

```bash
# Install
npm install

# Dev (both API + web)
npm run dev

# Dev (individual)
npm run dev:api      # API on :5000 (tsx watch)
npm run dev:web      # Web on :3000 (next dev)

# Build
npm run build        # both
npm run build:web    # web only
npm run build:api    # api only

# Seed (API must be running)
cd apps/api && npx tsx src/scripts/seed.ts --force

# Lint
npm run lint         # all workspaces
```

## Architecture

**npm workspaces monorepo** — two packages:

| Package | Port | Stack | Entry |
|---------|------|-------|-------|
| `apps/api` | 5000 | Express + MongoDB native driver + Firebase Admin + Stripe | `src/server.ts` |
| `apps/web` | 3000 | Next.js 14 App Router + Tailwind + shadcn/ui + Firebase client | `src/app/layout.tsx` |

**Auth flow:** Firebase on frontend → ID token via `Authorization` header → Backend verifies with Firebase Admin → Generates JWT → Sets httpOnly cookies → Subsequent requests use cookies.

**Env:** Single root `.env` at project root is source of truth. `apps/web/.env.local` also exists with `NEXT_PUBLIC_*` vars — required because Next.js only loads `.env` from its project directory.

## Gotchas

- **API entry point is `server.ts`**, not `index.ts`. Running `tsx src/index.ts` won't work.
- **Zod schemas in `validators/schemas.ts`** — body schemas do NOT have a `body:` wrapper. The `validateBody` middleware passes `req.body` directly.
- **`AuthUser` type** has `{ userId, email, role }` — no `name` property. Use `user.userId` not `user._id`.
- **Campaign categories are lowercase slugs** (`education`, `health`, `community`, `emergency`, `environment`, `arts-culture`, `sports`, `technology`, `animals`). Do not capitalize.
- **`ADMIN_EMAILS`** is env-driven, no hardcoded fallback. Auto-admin on login in `auth.service.ts`.
- **Helmet config** disables `crossOriginResourcePolicy` and `crossOriginOpenerPolicy` — these were blocking cross-origin response reading.
- **`fetchWithTimeout`** defaults to 15000ms. Use `getApiUrl()` from `@/lib/config` for all API URLs.
- **`next/image`** — allowed remote patterns in `next.config.js` include `images.unsplash.com`. If you add new image hosts, update that config.
- **Force dark mode** — `<html className="dark">` is hardcoded. Body background is `#060e1e` in `globals.css`.
- **Typography** — Manrope (`--font-manrope`) for body, Sora (`--font-sora`) for headings via global CSS.
- **Theme tokens** — primary green `#0ef695`, bg `#060e1e`, surface `#071426`, card `#0c1828`, sidebar `#071324`, footer `#040b16`.

## Route Groups (web)

| Group | Path prefix | Purpose |
|-------|-------------|---------|
| `(landing)` | `/` | Homepage |
| `(public)` | `/explore`, `/campaign/*`, `/profile/*`, etc. | Public pages |
| `(dashboard)` | `/dashboard/*` | Authenticated user dashboard |
| `(admin)` | `/admin/*` | Admin panel (needs admin role) |
| `auth` | `/auth/login`, `/auth/register` | Auth pages |

## API Routes

All under `/api/`. Key routes: `auth`, `campaigns`, `donations`, `users`, `admin`, `categories`, `comments`, `follows`, `analytics`, `withdrawals`, `verification`, `reports`, `upload`, `webhooks/stripe`.

## Seed Data

- 5 users (admin, 2 fundraisers, 2 donors), 20 campaigns, 15 donations, 9 categories
- Firebase Auth accounts are created via `firebase-admin` SDK with real UIDs
- Password: `password123` for all demo accounts
- Categories match explore page filter slugs (lowercase)

## Style Conventions

- shadcn/ui + Radix UI primitives
- Framer Motion for animations
- `clsx` + `tailwind-merge` for class composition
- Zod for validation (both frontend and backend)
- Pino for API logging
- Lucide React for icons
