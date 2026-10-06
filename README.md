# Kids Time Learning — לומדים את השעה

A Hebrew, RTL time-learning web application for children aged 7–9.
The product requirements are in [docs/PRD.md](docs/PRD.md).

## Current scope (Issue #1)

React + TypeScript + Vite foundation, a responsive Home screen, and a reusable
SVG `AnalogClock` showing a static **7:00** with a matching digital display.
The “התחל ללמוד” entry moves to the clock on the same page. The parent area is
an explicitly labelled placeholder. There are no additional lessons or features.

## Run locally

Requires Node.js 22.12+ (tested with Node.js 24) and npm.

```sh
npm ci
npm run dev -- --host 0.0.0.0
```

Open the address printed by Vite in your browser. Use `--host 0.0.0.0` to test
from a tablet or phone on the same network; use the computer's LAN address.
The layout supports portrait and landscape, touch targets, and iOS safe areas.

## Checks and production build

```sh
npm test
npm run typecheck
npm run build
npm run preview -- --host 0.0.0.0
```

Vite writes production assets to `dist/`. Preview serves that build for local
verification; it is not a production deployment server.

## Structure

- `src/App.tsx`: Hebrew Home screen
- `src/components/AnalogClock.tsx`: reusable static SVG clock
- `src/styles.css`: responsive styling
- `src/App.test.tsx`: initial screen and clock rendering checks

No backend, credentials, external fonts, or third-party services are required.
