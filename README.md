# Kids Time Learning — לומדים את השעה

A Hebrew, RTL time-learning web application for children aged 7–9.
The product requirements are in [docs/PRD.md](docs/PRD.md).

## Current scope

Home offers full-hour learning, half-hour learning, **לימוד רבע שעה**, and **לימוד דקות**.
All lessons pair a read-only analog clock with a visible digital time in a
Hebrew RTL layout; digital times remain LTR.

- Full hours: paired morning/evening examples of 7:00, 8:00 and 6:00,
  setting practice with a draggable hour hand, and clock-reading practice.
  The hour hand supports arrow keys, Home and End.
- Half hours: comparisons of :00 and :30 for 7, 8, 11 and 12, plus setting,
  reading and mixed full/half-hour practice. In setting practice the minute
  hand snaps to :00/:30 and both hands advance together, including across 12.
  Answers receive friendly feedback, retries and a completion screen.
- Quarter hours (Issue #16): a teaching-only sequence of 7:00, 7:15, 7:30,
  7:45, 12:15 and 12:45. A side-by-side comparison shows both hands advancing
  every 15 minutes. The lesson explains a quarter hour, uses שבע ורבע and
  שבע ארבעים וחמש, and provides previous/next examples and return Home.
  Example navigation moves focus to the example heading; returning Home
  restores focus to the lesson entry.

- Quarter-hour practice (Issue #18): eight setting exercises, eight reading
  exercises and twelve mixed exercises covering :00/:15/:30/:45. The three
  entries are in the quarter-hour lesson. Setting uses mouse/touch dragging
  or keyboard arrows in 15-minute steps; full-hour and half-hour practice
  retain their original snapping rules. Current digital selection stays hidden.
  Reading provides three distinct choices, then “בדיקה” checks the selection.
  Incorrect attempts can be retried; changing the selection clears feedback.
  Correct answers lock until the next exercise. Each mode shows progress,
  a completion screen, restart, return to the selected lesson example and Home.

- Five-minute lesson (Issue #20): a display-only sequence from 8:00 to 9:00
  in five-minute steps, followed by 12:05 and 12:55. Optional minute labels
  sit beside the hour numbers; a mapping explains 1 = 5 through 11 = 55,
  and 12 = 60 elapsed minutes with a new hour and minutes resetting to 00.
  Three clocks compare 8:05, 8:10 and 8:15. Hebrew minute wording and links
  to quarter/half/three-quarter hours accompany the visible digital time.
  Previous/next navigation shows example progress and focuses its heading;
  Home restores focus to the entry. No minutes practice is added, and all
  existing practice snapping rules remain unchanged.

Later-stage relative-time terminology is not added.
There is no arbitrary-minute or 24-hour teaching, scoring, login, database,
audio or parent PIN yet.

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
- `src/components/AnalogClock.tsx`: reusable minute-aware SVG clock with optional full/half/quarter-hour interaction
- `src/styles.css`: responsive styling
- `src/App.test.tsx`: initial screen and clock rendering checks
- `src/learning/`: full-hour and half-hour lessons/practice, quarter-hour lesson/practice, five-minute lesson, snapping geometry, and navigation/interaction tests

No backend, credentials, external fonts, or third-party services are required.
