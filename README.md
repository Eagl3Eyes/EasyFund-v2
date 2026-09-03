# EasyFund V2

A production-grade crowdfunding platform built with Next.js 14, Express, MongoDB, Firebase Auth, and Stripe.

## Features

- **Campaigns** — Create, browse, search, and donate to fundraising campaigns
- **Authentication** — Firebase Auth with JWT-based httpOnly cookie sessions
- **Payments** — Stripe Checkout for donations with webhook handling
- **Dashboard** — Fundraiser dashboard with campaign management, analytics, and withdrawal requests
- **Admin Panel** — Full admin interface for user management, campaign moderation, verification, reports, and audit logs
- **Notifications** — Real-time in-app notification system with polling
- **Responsive** — Mobile-first dark-themed UI with glassmorphism and Framer Motion animations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, shadcn/ui, Radix UI, Framer Motion, Recharts |
| Backend | Express, TypeScript, MongoDB (native driver), Zod validation, Pino logging |
| Auth | Firebase Auth (client), Firebase Admin SDK (server), JWT (httpOnly cookies) |
| Payments | Stripe Checkout + Webhooks |
| Database | MongoDB Atlas (15+ collections) |
| Monorepo | npm workspaces |

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)
- Firebase project (Auth + Admin SDK credentials)
- Stripe account (test keys)

### Installation

```bash
npm install
```

### Environment Setup

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Key variables:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin SDK service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK private key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_API_URL` | API base URL (default: `http://localhost:5000`) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase client API key |

### Development

```bash
# Run both API and web concurrently
npm run dev

# Run individually
npm run dev:api    # API on http://localhost:5000
npm run dev:web    # Web on http://localhost:3000
```

### Seed Database

With the API running:

```bash
cd apps/api
npx tsx src/scripts/seed.ts --force
```

This creates 5 demo accounts, 20 campaigns, 15 donations, and 9 categories.

**Demo accounts** (password: `password123`):

| Account | Email | Role |
|---------|-------|------|
| Admin | admin@easyfund.com | admin |
| Fundraiser | sarah@example.com | fundraiser |
| Fundraiser | mike@example.com | fundraiser |
| Donor | emily@example.com | user |
| Donor | james@example.com | user |

### Build

```bash
npm run build        # Build both packages
npm run build:web    # Web only
npm run build:api    # API only
```

### Lint

```bash
npm run lint
```

## Project Structure

```
EasyFund/
├── apps/
│   ├── api/                    # Express backend
│   │   └── src/
│   │       ├── config/         # Env, database, Firebase
│   │       ├── controllers/    # Route handlers
│   │       ├── middleware/     # Auth, validation, rate limiting
│   │       ├── repositories/   # Database queries
│   │       ├── routes/         # Express route definitions
│   │       ├── scripts/        # Seed, migration
│   │       ├── services/       # Business logic
│   │       ├── validators/     # Zod schemas
│   │       └── app.ts          # Express app setup
│   └── web/                    # Next.js frontend
│       └── src/
│           ├── app/            # App Router pages
│           │   ├── (landing)/  # Homepage
│           │   ├── (public)/   # Explore, campaign detail, profile
│           │   ├── (dashboard)/ # User dashboard
│           │   ├── (admin)/    # Admin panel
│           │   └── auth/       # Login, register
│           ├── components/     # Reusable UI components
│           ├── lib/            # Utilities, types, config
│           └── providers/      # Auth context provider
├── .env                        # Environment variables (source of truth)
├── .env.example                # Environment template
└── package.json                # Workspace root
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Firebase token → JWT cookie |
| GET | `/api/campaigns` | List campaigns (filter, sort, paginate) |
| GET | `/api/campaigns/:slug` | Campaign by slug |
| POST | `/api/campaigns` | Create campaign (auth) |
| POST | `/api/donations` | Create Stripe checkout session |
| GET | `/api/donations/campaign/:id/supporters` | Campaign supporters |
| GET | `/api/users/me` | Current user profile |
| GET | `/api/admin/*` | Admin management endpoints |

## Database

15+ MongoDB collections: `users`, `campaigns`, `donations`, `categories`, `notifications`, `comments`, `campaign_updates`, `withdrawals`, `verification_requests`, `saved_campaigns`, `follows`, `audit_logs`, `reports`, `payment_webhooks`.

## License

Private project.
