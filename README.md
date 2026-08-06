# Skillrush

Skillrush is a Next.js application for browsing Valorant lineups, filtering them by map and agent, and managing lineup data through a Supabase-backed admin area.

## Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase
- Zustand

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your local environment file:
   ```bash
   cp .env.example .env.local
   ```
3. Fill in the Supabase values in `.env.local`.
4. Start the app:
   ```bash
   npm run dev
   ```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## Project structure

- `src/app` — pages and routes
- `src/components` — shared UI and feature-specific components
- `src/features` — agents, maps and lineup feature modules
- `src/services/supabase` — Supabase integration
- `src/stores` — Zustand state

## Notes

- Use [SUPABASE_SCHEMA.md](SUPABASE_SCHEMA.md) for the database setup.
- The current app uses the Supabase environment variables from `.env.local`.
