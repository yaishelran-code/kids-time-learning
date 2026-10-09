# Kids Time Learning — לומדים את השעה

A Hebrew, RTL time-learning web application for children aged 7–9.
The product requirements are in [docs/PRD.md](docs/PRD.md).

## Current scope

Home offers full-hour learning, half-hour learning, **לימוד רבע שעה**, **לימוד דקות**, and **לימוד דקות מדויקות**.
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
  Home restores focus to the entry.

- Five-minute practice (Issue #22): twelve setting and twelve reading exercises
  cover :05/:10/:20/:25/:35/:40/:50/:55, including 12:05 and 12:55. Twenty
  mixed exercises revisit full, half and quarter hours and cover every new
  minute value in both setting and reading. The three entries are in the minutes
  lesson. Setting uses mouse/touch dragging or keyboard arrows in five-minute
  steps, with varied starting times, directions and distances. Both hands stay
  synchronized across twelve; current digital selection stays hidden. Reading
  offers three distinct, rotating choices with minute/hour distractors. “בדיקה”
  checks the answer; friendly retries reveal no solution, edits clear feedback,
  and correct answers lock until “התרגיל הבא”. Each mode shows progress,
  completion, restart, return to the selected lesson example and Home.
  Existing full/half/quarter-hour practice keeps its original snapping rules.

- Exact-minute lesson (Issue #25): fifteen display-only examples in order:
  8:00, 8:01, 8:04, 8:05, 8:06, 8:07, 8:09, 8:10, 8:23, 8:37,
  8:58, 8:59, 9:00, 12:01 and 12:59. Each pairs accurate hands with visible
  digital time, accessible Hebrew wording and counting from the preceding
  five-minute anchor. An outlined circle and triangle mark the current minute
  without relying only on color. Comparisons show 8:05/8:06/8:07 and
  8:58/8:59/9:00, including the hour hand reaching nine and minutes resetting
  to 00. Previous/next boundaries, example progress and Home use the existing
  focus and navigation patterns. Practice interactions and snapping are unchanged;
  the broader navigation review remains in Issue #24.

- Exact-minute practice (Issue #28): twelve setting and twelve reading exercises,
  plus twenty mixed exercises reviewing full, half, quarter and five-minute times.
  Twelve of the mixed exercises use minutes that are not multiples of five,
  split evenly between setting and reading. Fixed sequences include adjacent
  minutes, 8:01/8:07/8:23/8:37/8:58/8:59 and 12:01/12:59, with other hours.
  Three entries in the exact-minute lesson reuse the existing practice flow.
  Mouse/touch dragging and keyboard arrows snap to one minute; both hands stay
  synchronized through twelve in both directions. Varied starting times require
  different solution directions and distances. Exact-minute practice uses stronger
  minute ticks and a wider minute-hand grab area; earlier practice keeps its
  original appearance and full/half/quarter/five-minute snapping rules.
  The current digital selection stays hidden. Reading offers three distinct,
  rotating choices testing adjacent-minute, several-minute and hour confusion.
  Explicit checking, friendly retries without revealing the answer, clearing
  feedback on edits, correct-answer locking, progress, completion and restart
  follow the existing patterns. Return to learning preserves the selected example
  and restores focus; return Home is available throughout. Hebrew wording includes
  “דקה אחת”, with RTL text and LTR digital times. Issues #24 and #27 remain separate.

Later-stage relative-time terminology is not added.
There is no 24-hour teaching, scoring, login, database, audio or parent PIN yet.

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

Issue #22 browser verification used the production preview in Chromium at
1280×900, 390×844, 844×390, 768×1024, 1024×768 and 320×568. All three
practice sequences were completed at every size, including retries, locking,
restart, selected lesson preservation, touch targets and horizontal overflow
checks. Mouse and emulated touch drags crossed twelve in both directions
without scrolling the page; keyboard Tab/Enter navigation and existing practice
snapping were also checked. Emulation does not verify physical iOS/Android
devices, Safari/WebKit, or screen-reader announcements.

Issue #25 verification passed all 86 automated tests, TypeScript, the production
build and `git diff --check`. Production-preview Chromium checks passed at
1280×900, 390×844, 844×390, 768×1024, 1024×768 and 320×568. At every size,
all fifteen examples, hand/marker geometry, comparison sequences, forward/back
navigation and boundaries, keyboard Enter navigation, heading/Home focus,
visible focus outlines, touch-target sizes, horizontal overflow and absence of
browser errors were checked. Existing half/quarter/five-minute keyboard snapping
and rollover were checked, and desktop/narrow-phone screenshots were inspected.
These checks use emulation, not physical devices; Safari/WebKit and screen-reader
announcements were not verified.

Issue #28 verification passed all 96 automated tests across 12 files, TypeScript,
production build and `git diff --check`. New tests cover all three practice modes,
all 720 one-minute keyboard positions, fractional snapping boundaries, forward/
reverse rollover, mouse/touch pointer handling, retries, locking, completion,
reset, navigation and original snapping regressions. Production-preview Chromium
verification completed all 44 exercises at 1280×900, 390×844, 844×390, 768×1024,
1024×768 and 320×568. Real browser mouse input and CDP-emulated touch input
verified adjacent-minute changes (including 8:06 ↔ 8:07), 12:59 ↔ 1:00 and
11:59 ↔ 12:00, continuous forward/reverse rollover and no scrolling during drag.
Every size passed retries, locking, reset, selected lesson preservation, RTL/LTR,
touch-target size, horizontal overflow, earlier snapping and browser error checks.
Tab/Enter navigation, one-minute keyboard arrows and visible slider/button focus
passed on desktop and the narrow phone viewport. Desktop, phone and narrow-phone
screenshots were visually inspected for minute-tick readability and layout.
Phone/tablet checks use Chromium emulation; physical iOS/Android devices,
Safari/WebKit, Firefox and screen-reader announcements were not verified.

Vite writes production assets to `dist/`. Preview serves that build for local
verification; it is not a production deployment server.

## Structure

- `src/App.tsx`: Hebrew Home screen and learning entry
- `src/components/AnalogClock.tsx`: reusable minute-aware SVG clock with optional full/half/quarter/five/exact-minute interaction
- `src/styles.css`: responsive styling
- `src/App.test.tsx`: initial screen and clock rendering checks
- `src/learning/`: full-hour and half-hour lessons/practice, quarter-hour lesson/practice, five-minute lesson/practice, exact-minute lesson/practice, snapping geometry, and navigation/interaction tests

No backend, credentials, external fonts, or third-party services are required.
