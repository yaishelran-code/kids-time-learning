# Kids Time Learning — לומדים את השעה

A Hebrew, RTL time-learning web application for children aged 7–9.
The product requirements are in [docs/PRD.md](docs/PRD.md).

## Current scope (Issue #4)

The existing Home screen opens the first full-hour learning screen through
“התחל ללמוד”. Children can step through paired morning/evening examples of
7:00, 8:00, and 6:00, go back to an example, repeat, or return Home.
The SVG and digital displays share one selected hour; the minute hand stays
at twelve. Hebrew day-period labels and everyday activities explain why the
same hand positions can mean a different time of day.

Only 12-hour full hours are taught. There is no hand dragging, advanced lesson,
scoring, login, database, or parent PIN in this issue.

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

- `src/App.tsx`: Hebrew Home screen and learning entry
- `src/components/AnalogClock.tsx`: reusable full-hour SVG clock
- `src/styles.css`: responsive styling
- `src/App.test.tsx`: initial screen and clock rendering checks
- `src/learning/`: full-hour examples, lesson screen, and navigation tests

No backend, credentials, external fonts, or third-party services are required.
