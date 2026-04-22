# LunaArt Terminal

LunaArt Terminal is a Next.js dashboard for tracking art auction activity across Christie’s and Sotheby’s. It combines a live-style Auction Feed, a Spotlight view for artist/lots analysis, and an Auction Calendar for upcoming sales.

## What’s inside

- **Auction Feed** — filter lots by time, house, medium, and price band
- **Market Pulse** — quick summary of volume, sell-through, and estimate performance
- **Spotlight** — rising artists, hot lots, liquidity, and volatility views with decision labels
- **Auction Calendar** — grouped auction schedule by month, house, and sale type
- **Source snapshot cards** — quick visibility into dataset coverage and freshness

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Recharts
- Static JSON data generated from auction sources

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Production build

```bash
npm run build
npm start
```

## Linting

```bash
npm run lint
```

## Data notes

The app uses curated auction data in `src/lib/christies-data.json` and `src/lib/sothebys-data.json`. The `scripts/fetch-christies.mjs` script can be used to refresh Christie’s data.

## Project structure

- `src/app/page.tsx` — Auction Feed dashboard
- `src/app/spotlight/page.tsx` — Spotlight analytics dashboard
- `src/app/calendar/page.tsx` — Auction Calendar
- `src/components/` — reusable UI blocks
- `src/lib/mock-data.ts` — merged data access and analytics helpers

## Deployment

The app is set up for GitHub Pages deployment via `.github/workflows/deploy.yml`.

## Notes

This project is optimized for quick scanning and decision support rather than archival research. The labels and summaries are opinionated shortcuts to help you decide what to inspect first.
