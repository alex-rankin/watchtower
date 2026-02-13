# Watchtower

A trading dashboard with P&L calculator and RSS-based news aggregator.

## Monorepo Structure

This project is organized as a monorepo using Yarn workspaces:

```
watchtower/
├── apps/
│   ├── frontend/     # React + Vite frontend application
│   └── backend/      # Express + TypeScript backend API
├── package.json      # Root workspace configuration
└── yarn.lock         # Shared lockfile
```

## Features

- **Trading P&L Calculator**: Calculate risk, reward, and break-even with live FX conversion
- **News Aggregator**: Monitor market news from multiple RSS feeds with filtering and search
- **Clean Dashboard UI**: Terminal-inspired, Apple-clean design using ShadCN components

## Development

### Prerequisites

- Node.js 18+ and Yarn

### Installation

Install all dependencies for all workspaces:

```bash
yarn install
```

### Running the Development Servers

Run both frontend and backend concurrently:

```bash
yarn dev
```

This will start:
- Frontend (Vite) on `http://localhost:5173` (or next available port)
- Backend API on `http://localhost:3001`

You can also run them separately:

```bash
# Frontend only
yarn workspace @watchtower/frontend dev

# Backend only
yarn workspace @watchtower/backend dev
```

### Building for Production

Build both frontend and backend:

```bash
yarn build
```

This will:
- Build the frontend React app to `apps/frontend/dist`
- Compile the backend TypeScript to `apps/backend/dist`

### Running Production Server

After building, run the production server:

```bash
yarn start
```

The production server serves both:
- Static frontend files from `apps/frontend/dist`
- API routes at `/api/*`

## Workspace Scripts

### Root Level

- `yarn dev` - Run both frontend and backend in development mode
- `yarn build` - Build both frontend and backend
- `yarn start` - Start production server
- `yarn lint` - Lint all workspaces
- `yarn format` - Format all workspaces
- `yarn typecheck` - Type check all workspaces

### Frontend (`@watchtower/frontend`)

- `yarn workspace @watchtower/frontend dev` - Start Vite dev server
- `yarn workspace @watchtower/frontend build` - Build for production
- `yarn workspace @watchtower/frontend lint` - Lint frontend code

### Backend (`@watchtower/backend`)

- `yarn workspace @watchtower/backend dev` - Start backend with hot reload (tsx watch)
- `yarn workspace @watchtower/backend build` - Compile TypeScript
- `yarn workspace @watchtower/backend start` - Run compiled backend
- `yarn workspace @watchtower/backend lint` - Lint backend code

## RSS News Aggregator

### Adding New Feeds

To add new RSS feeds, edit `apps/frontend/src/news/feeds.ts` and add a new feed definition:

```typescript
{
  id: "unique-feed-id",
  name: "Display Name",
  url: "https://example.com/feed.rss",
  leaning?: "left" | "center" | "right" | "finance" | "other",
  industries?: ["tech", "finance"],
  regions?: ["US", "EU"]
}
```

### Backend Architecture

The backend is organized with a DRY (Don't Repeat Yourself) structure:

- `src/types.ts` - Shared TypeScript types
- `src/utils/` - Reusable utilities (rate limiting, RSS parsing)
- `src/middleware/` - Express middleware (validation, etc.)
- `src/routes/` - API route handlers
- `src/index.ts` - Application entry point

### How Caching Works

- **TanStack Query**: Articles are cached per feed with a 5-minute stale time
- **localStorage**: Last successful fetch is persisted to localStorage (`news.cache.v1`) so the feed remains visible on page refresh
- **Deduplication**: Articles are deduplicated across feeds using their `guid` or URL
- **Rate Limiting**: The backend applies rate limiting (10 requests per minute per feed) to avoid hammering sources

### RSS Proxy Server

The backend (`apps/backend`) handles:
- Fetching RSS feeds (bypassing CORS restrictions)
- Parsing RSS/Atom feeds
- Normalizing article metadata
- Rate limiting per feed
- Error handling

In development, Vite proxies `/api/*` requests to the backend server. In production, the same Express server handles both static file serving and API requests.

## Linting and Formatting (Biome)

- **Check:** `yarn lint` — runs Biome check on all workspaces
- **Format:** `yarn format` — runs Biome format on all workspaces
- **Fix:** `yarn workspace @watchtower/<app> lint:fix` — fixes issues in a specific workspace

Each workspace has its own `biome.json` configuration.
