# Kids Time Learning — לומדים את השעה

A Hebrew, RTL time-learning web application for children aged 7–9.
The product requirements are in [docs/PRD.md](docs/PRD.md).

## Current scope

Home offers full-hour learning, half-hour learning, **לימוד רבע שעה**, **לימוד דקות**, **לימוד דקות מדויקות**, and **כמה זמן עבר ונשאר?**.
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
  offers three distinct, rotating choices with minute/hour distractors, each pair
  at least seven minutes apart on the 12-hour cycle (Issue #30). “בדיקה”
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
  rotating choices testing minute and hour confusion, with at least seven minutes
  between every pair of full proposed times on the 12-hour cycle (Issue #30).
  Explicit checking, friendly retries without revealing the answer, clearing
  feedback on edits, correct-answer locking, progress, completion and restart
  follow the existing patterns. Return to learning preserves the selected example
  and restores focus; return Home is available throughout. Hebrew wording includes
  “דקה אחת”, with RTL text and LTR digital times. Issues #24 and #27 remain separate.

- Elapsed/remaining time lesson (Issue #32): twelve fixed, display-only examples
  progress from whole hours to minutes within an hour, minutes across an hour,
  and hours plus minutes. Everyday stories explicitly identify day periods.
  Two accurate analog clocks show visible LTR digital times and roles:
  “התחלנו”, “עכשיו” or “הפעילות מתחילה”. The lesson distinguishes a clock time
  from a duration and answers “כמה זמן עבר?” / “כמה זמן נשאר?” in full sentences.
  A numbered vertical timeline with downward arrows keeps event order clear in
  RTL and on narrow screens. Calculations count whole hours first, then individual
  five-minute steps, with a summary and explanations of 60 minutes as one hour
  and 90 minutes as an hour and a half. Forward event order and day context handle
  twelve and the morning-to-noon transition without showing 24-hour time.
  Previous/next boundaries, example progress and Home follow existing navigation
  and focus patterns. No interactive relative-time practice, overnight durations,
  scoring or persistence is introduced; Issues #24 and #27 remain separate.

- Relative-time practice (Issue #34): three entries in the elapsed/remaining lesson
  open twelve elapsed-time questions, twelve remaining-time questions and twenty
  mixed questions. Fixed everyday stories cover whole hours, minutes within an
  hour, minutes across an hour and hours plus minutes, including twelve, with
  explicit day periods. Same-day durations are five-minute multiples up to three
  hours. Two read-only clocks retain visible LTR digital times and event roles.
  Three duration choices have one unique correct answer, rotate its position,
  and are at least ten minutes apart (meeting the seven-minute minimum); spacing
  compares duration values directly, not cyclic clock times. Explanations and
  decomposition stay hidden until a correct answer. Friendly retries, feedback
  clearing, locking, progress, completion and restart follow existing practice
  patterns. Return to learning preserves the example and restores entry focus;
  Home is available during practice and on completion. Issues #24 and #27 remain
  separate. No end-time calculation, overnight intervals, 24-hour teaching,
  scoring or persistence is added.

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

Issue #30 replaces the earlier adjacent-minute answer-distractor requirement;
exact displayed times and one-minute setting practice remain unchanged. Both
five-minute and exact-minute reading modes, including reading questions in their
mixed practice, require `min(abs(a-b), 720-abs(a-b)) >= 7` for every answer pair,
where `a` and `b` are complete times converted to minutes on a 12-hour cycle.
Minute distractors now use ten-minute offsets in five-minute practice and varied
ten/fifteen-minute offsets in exact-minute practice; hour distractors and correct
answer rotation remain. Existing tests scan all 44 reading questions and all 132
answer pairs, including beginning/end-of-hour, twelve and full-hour cases.
All 96 automated tests, TypeScript, production build and whitespace checks passed.
Production-preview Chromium checks passed at 1280×900, 390×844 and 320×568:
each size checked all 44 reading questions/132 pairs, with an observed minimum
distance of ten minutes, one unique correct answer, unchanged hand angles,
retries, feedback clearing, locking, progression, completion, restart, lesson
preservation, RTL/LTR and no horizontal overflow or browser errors. Setting
questions in both mixed sequences were completed using browser mouse input or
CDP-emulated touch. Desktop and phone boundary-case screenshots were inspected.
These checks use Chromium emulation; physical devices, Safari/WebKit, Firefox
and screen-reader announcements were not verified.

Issue #32 verification passed all 110 automated tests across 13 files, TypeScript,
production build and whitespace checks. Independent acceptance fixtures cover all
12 durations, whole-hour/five-minute decomposition, step continuity and endpoints.
Rendered tests check both clocks' hand angles, digital times, role/day labels,
answers, explanations, read-only behavior, navigation boundaries and focus.
Production-preview Chromium checks passed at 1280×900, 390×844, 844×390,
768×1024, 1024×768 and 320×568. Each size checked all 12 examples, clock geometry,
durations/answers, timeline steps and downward order, RTL/LTR, touch-target sizes,
no horizontal overflow, previous/next boundaries, keyboard Tab/Enter navigation and
heading/Home focus. Existing lessons and all practice entries passed browser
smoke checks; existing setting sliders responded to keyboard input. No browser
runtime or console errors occurred. Desktop and narrow-phone screenshots were
visually inspected. Phone/tablet checks use Chromium emulation; physical devices,
Safari/WebKit, Firefox and screen-reader announcements were not verified.

Issue #34 verification passed all 117 automated tests across 14 files, TypeScript,
production build and `git diff --check`. Independent fixtures verify same-day
elapsed/remaining durations, including hour boundaries and twelve. Tests scan all
44 questions for one correct answer, distinct duration values/labels, and every
pair's spacing; rendered tests cover both clocks' geometry, roles and day periods,
hidden explanations, retries, clearing feedback, locking, completion, reset,
lesson preservation and focus restoration. The expanded relative-time tests also
passed separately after adding clock geometry assertions.
Production-preview Chromium completed all 44 questions at 1280×900, 390×844,
844×390, 768×1024, 1024×768 and 320×568. Every size checked answer rotation,
spacing, hidden/revealed explanations, retries, locking, completion, restart,
lesson preservation, focus restoration, RTL/LTR, touch-target sizes and absence
of horizontal overflow or browser errors. Keyboard Tab/Enter selection and
existing half/quarter/five/exact-minute setting practice passed smoke checks.
Desktop and narrow-phone screenshots were visually inspected. Duration choices
stack on small screens to keep Hebrew labels readable.
Phone/tablet checks use Chromium emulation, not physical devices; Safari/WebKit,
Firefox and screen-reader announcements were not verified. Practice progress
remains session-only and is reset on reentry, matching the existing flows.

Vite writes production assets to `dist/`. Preview serves that build for local
verification; it is not a production deployment server.

## Structure

- `src/App.tsx`: Hebrew Home screen and learning entry
- `src/components/AnalogClock.tsx`: reusable minute-aware SVG clock with optional full/half/quarter/five/exact-minute interaction
- `src/styles.css`: responsive styling
- `src/App.test.tsx`: initial screen and clock rendering checks
- `src/learning/`: full-hour and half-hour lessons/practice, quarter-hour lesson/practice, five-minute lesson/practice, exact-minute lesson/practice, elapsed/remaining-time lesson, snapping geometry, and navigation/interaction tests

No backend, credentials, external fonts, or third-party services are required.
