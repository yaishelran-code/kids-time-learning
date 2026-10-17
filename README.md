# Kids Time Learning — לומדים את השעה

A Hebrew, RTL time-learning web application for children aged 7–9.
The product requirements are in [docs/PRD.md](docs/PRD.md).

## Current scope

Home offers full-hour learning, half-hour learning, **לימוד רבע שעה**, **לימוד דקות**, **לימוד דקות מדויקות**, **כמה זמן עבר ונשאר?**, **לימוד חלקי היום**, **היום שלי**, **מאיפה מתחילים?**, **מבנה השעון**, **האוסף שלי**, and **אזור הורה**.
All lessons pair a read-only analog clock with a visible digital time in a
Hebrew RTL layout; digital times remain LTR.

- Parent help (Issue #48): all 20 practice modes share seven topic counters.
  Three consecutive wrong checked answers pause that topic; success resets only
  that topic, even when the question was already rewarded. Clock questions are
  classified by their target minute: 00 whole hours, 30 halves, 15/45 quarters,
  other multiples of five five-minute practice, and other minutes exact minutes.
  This applies to earlier-level questions inside advanced/mixed practice too.
  Elapsed/remaining share relative time; identification/comparison share day
  periods. Comparison checking is one attempt even if both selections are wrong.
  Selection/hand movement does not count unless the existing mode checks on
  selection (full-hour and half-hour reading). Baseline and lessons do not count.
  Pauses hide answer controls and solutions, retain the current question during
  inline unlocking, and allow Home/lessons and other topics. Mixed practice does
  not skip a paused question. Navigation, practice restart and refresh do not
  clear saved counters or pauses; later reentry retains the existing question-one
  behavior. Unlocking resets only the chosen topic; explicit **פתיחת כל הנושאים**
  resets all paused topics, preserving counters below three. Neither grants nor
  removes rewards. Three new mistakes can pause the topic again.

- Fixed parent PIN: **1212 is the only code**, used both to unlock a paused topic
  and to enter **אזור הורה**. There is no personal PIN setup/change/recovery.
  The masked field accepts exactly four ASCII digits and requests a numeric
  keyboard. Wrong PIN attempts leave pauses and rewards unchanged; input is not
  logged or persisted and the code is not displayed in child screens.
  Leaving the parent area or refreshing requires authentication again. This is
  a fixed, known accompaniment code, not strong security: anyone who knows it
  can use parent actions, and browser data/code can be edited or deleted.

- Confirmed parent resets: **איפוס התגמולים והאוסף** requires parent entry plus
  an additional deletion confirmation. Cancellation changes nothing. Successful
  saving replaces the single reward snapshot before updating in-memory totals,
  character unlocks and all run/award history; fresh awards are possible again.
  Failed saving preserves the previous in-memory and stored state and offers
  retry. It also permits explicitly confirmed replacement of corrupt reward
  data, which normal awards/restarts never overwrite. Baseline/recommendation,
  My Day, mistake counters and pauses are preserved.

- Parent-help persistence: `kids-time-learning.parent-help.v1` is separate from
  rewards, Baseline and My Day. Ordinary attempt/unlock write failures retain
  the current in-memory counters/pauses, warn and offer snapshot-save retry;
  failed saving never silently clears a pause. Refresh/closing after failed
  saving may lose unsaved changes, including an unlock. Corrupt/unreadable parent
  data blocks answering in every practice topic rather than assuming no pauses.
  Home/lessons remain available and stored data is never automatically overwritten.
  In the authenticated parent area, explicit **התאוששות נתוני עזרת הורה** plus
  another confirmation resets only counters/pauses after successful saving.
  Failed recovery preserves the blocked state and prior data. Rewards, Baseline
  and My Day are untouched. One active tab is assumed; no cross-tab/device
  synchronization or backup. No parent progress report, adaptive difficulty,
  skill tracking or graded hints are added; #24 and #27 remain separate.

- Practice rewards (Issue #46): every correctly solved practice question earns
  10 points and one star, including success after retries. Mistakes never subtract
  rewards. All 20 modes across eight practice components use the same ledger;
  two-story comparisons earn once only when both answers are right. Baseline,
  lesson viewing and My Day do not earn rewards. Success announces
  **כל הכבוד! קיבלת כוכב ו־10 נקודות**; completion summarizes that run's earnings.
  Home displays lifetime totals and **האוסף שלי**.
  Each practice mode has a persisted run identity and awarded question indices.
  Totals, unlocks and the deduplication ledger are written together immediately
  after success, including unfinished practice. Repeated checks, screen navigation,
  refresh/reopening and save retries do not reward an already-awarded question.
  Reentry still displays question one, following existing practice behavior; its
  prior rewards remain credited and are not awarded again. **התחלה מחדש — רצף
  תגמולים חדש** starts a new reward run during unfinished practice; **תרגלו שוב**
  does so after completion. Restart retains lifetime totals and unlocked characters.
  The per-mode ledger is bounded to current runs; totals include older runs.
  Future question-list changes must version/migrate the ledger to preserve question
  identity rather than silently reusing indices for different questions.

- Collectible characters (Issue #46): three original static SVG ninja illustrations
  included in `src/assets/characters/`: **ניצוץ**, **טל**, and **זוהר**. Their distinct
  scarves, leaf hat/garden friend and moon lantern/cape were created for this
  project; no commercial characters or emoji substitutes are used. Characters
  unlock at 10/20/30 lifetime stars without consuming them, and remain open.
  Collection cards show illustrations, Hebrew names, explicit locked/open states,
  the stars missing for the next character and a positive all-unlocked message.
  Unlock announcements do not open a modal or block continued practice.

- Reward storage limits: this implementation assumes **one active practice tab**
  in the same browser/device/origin. Concurrent practice in multiple tabs is not
  coordinated; separate tabs can overwrite one another's snapshots. There is no
  cloud synchronization or backup. The versioned reward key is separate from
  Baseline and My Day. Write failure retains the shared in-memory ledger across
  navigation, warns and allows saving the current snapshot again without granting
  anything twice. Refreshing/closing before a successful retry can lose unsaved
  rewards and unsaved restart/deduplication state; durable guarantees apply to
  successfully saved state. Corrupt/unreadable data is never automatically reset
  or overwritten, even after a reward or restart. In that case practice continues
  with temporary in-memory rewards, persistence is blocked for that session and
  a warning asks for adult help. Only an authenticated, explicitly confirmed
  parent reset can replace these data; there is no automatic recovery.
  A refresh can retry reading after the underlying problem is resolved.
  Issue #46 added no parent PIN, skill tracking, adaptive difficulty or streak bonuses;
  broader navigation review (#24) and minute-button renaming (#27) remain separate.

- Baseline (Issue #43): **מאיפה מתחילים?** opens an optional 12-question
  knowledge check: two questions each for hour hands, minute hands, whole hours,
  half hours, quarter hours and basic digital reading. Every question offers
  **עדיין לא יודע/ת**. One response locks the choices and receives only neutral
  **תודה, ממשיכים** feedback; the child advances explicitly. There are no hints,
  retries, revealed solutions or numeric scores. Assessment clock titles do not
  announce the time being tested. Time choices are at least seven minutes apart.
  A skill is considered familiar in this check only when both answers are correct.
  Difficulty with either hand or digital reading recommends clock structure;
  otherwise the first unfamiliar whole/half/quarter-hour topic is recommended.
  If all are familiar, the recommendation opens the existing five-minute lesson.
  This is a starting suggestion, not a mastery judgement; Home still offers other
  topics. Entry is manual, with no automatic assessment or adaptive practice.
  Only completed per-skill results and the recommendation are saved in a separate
  versioned local-storage key. Reentry restores the recommendation; a new check
  replaces it only on completion. Partial exit/reload leaves the previous saved
  result intact. Corrupt/blocked reads warn without overwriting data. Failed writes
  keep the new recommendation visible in memory, preserve prior saved data and
  offer retry. Refreshing or leaving can lose an unsaved new recommendation.
  My Day storage remains separate; no sync, backup or parent report is added.

- Clock structure (added for Issue #43): the short **מבנה השעון** lesson is
  available directly from Home and as a baseline recommendation. It explains
  the short purple hour hand, long green minute hand, twelve clock numbers,
  twelve hours per hour-hand rotation and 60 minutes per minute-hand rotation.
  Five accurate clock states show 7:00 → 7:15 → 7:30 → 7:45 → 8:00 with synchronized
  12-hour LTR digital times. Children can step back/forward, replay the full rotation,
  continue to the existing whole-hours lesson or return Home. Only navigation
  needed for this lesson and assessment was added; Issues #24 and #27 remain separate.

- My Day (Issue #40): Home includes **היום שלי**. Children add a named daily
  activity with native touch-friendly hour (1–12), minute (00–59) and day-period
  selectors. Incompatible combinations and blank names receive Hebrew guidance.
  Activities display accurate analog clocks, visible LTR 12-hour digital times
  and day periods, sorted from midnight with stable insertion order for ties.
  Editing preserves identity and tie order; deletion requires confirmation and
  can be cancelled. Empty-state guidance, keyboard labels/focus and Home return
  are included. Activities have no dates or durations.
  Local browser storage restores activities after reload/reopening on the same
  browser/device. Read errors or corrupt data show a warning without automatically
  overwriting the stored data. Failed writes keep current changes in memory and
  offer a retry, with a warning that refreshing/leaving may lose those changes.
  Adding/editing/deleting explicitly saves the current list. No exercise
  integration, device sync or navigation redesign is included; Issues #24 and
  #27 remain outside scope.

- Parts of the day (Issue #36): ten fixed, display-only stories cover morning,
  noon, afternoon, evening and night: 7:00 morning, 10:00 morning, 12:00 noon,
  1:30 noon, 4:00 afternoon, 5:30 afternoon, 7:00 evening, 8:30 evening,
  10:00 night and 2:00 night. Every clock has a visible 12-hour digital time,
  day-period label and captioned symbol. A vertical sequence with downward
  arrows keeps the five periods unambiguous in RTL and explains that a new
  morning follows night. Paired comparisons of 7:00 morning/evening and
  10:00 morning/night show identical hands with different stories and symbols.
  Activities are examples, not rules for every family. Internal minutes since
  midnight classify periods using the PRD boundaries, including midnight and
  day rollover; children see no 24-hour times or technical boundary table.
  Previous/next boundaries, example numbering and Home reuse the existing
  navigation and focus patterns. No practice or broader navigation/button
  redesign is included; Issues #24 and #27 remain separate.

- Day-period practice (Issue #38): three entries inside the parts-of-day lesson
  offer 10 identification questions (each period appears twice), 8 same-clock
  comparison questions and 16 alternating mixed questions. Light and event-order
  clues make the stories clear without naming the answer or showing a revealing
  symbol. Questions include midnight and after-midnight contexts; analog clocks
  and digital times remain in 12-hour format. Each story has three unique choices
  with rotating correct positions. Comparison questions require both selections
  and check them together, with no partial-answer disclosure after a mistake.
  Friendly retries, feedback clearing on edits, answer locking, explanations
  after success, progress, completion and restart follow the existing practice
  flow. Return to learning preserves the selected example and restores focus to
  the practice entry; Home and fresh reentry are available throughout. Activities
  are examples, not family schedule rules. Issues #24 and #27 remain separate.

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

There is no 24-hour teaching, login, database, audio or parent progress report yet.

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

Issue #36 verification passed all 145 automated tests across 15 files (28 new
cases), TypeScript, production build and whitespace checks. Independent fixtures
check all ten examples and exact hand angles, both identical-hand comparisons,
different periods/stories/symbols, five-period order, navigation boundaries and
focus. Classification cases cover every transition immediately before, at and
after its boundary, midnight, next-day rollover and negative-day normalization.
The default test command passed with browser verification run separately;
running both concurrently caused three existing practice tests to exceed their
five-second timeout. No test timeout or existing practice code was changed.
Production-preview Chromium checked all ten examples and both comparisons at
1280×900, 390×844, 844×390, 768×1024, 1024×768 and 320×568. Checks covered
12-hour-only child-facing times, exact geometry, labeled contexts/symbols,
vertical sequence and responsive comparison order, navigation boundaries,
keyboard Enter/Tab, heading/Home focus, touch-target sizes and no horizontal
overflow or browser errors. Existing lessons and every practice entry passed
browser smoke checks, including keyboard movement of setting sliders. Desktop
and narrow-phone screenshots were visually inspected.
Phone/tablet checks use Chromium emulation; physical devices, Safari/WebKit,
Firefox and screen-reader announcements were not verified. Complete existing
practice flows are covered by the automated suite; browser regression coverage
is smoke testing. No scoring, persistence, audio or 24-hour teaching is added.

Issue #38 verification passed all 156 tests across 16 files with
`npm test -- --testTimeout=15000`, followed by TypeScript, production build and
whitespace checks. The initial default run passed 155 tests; one unchanged
five-minute practice test exceeded its five-second timeout. The rerun used a
command-line allowance only; no existing test timeout/configuration was changed.
Eleven new tests cover all 34 questions against independent expected times and
periods, five-period coverage, unique rotating choices, midnight contexts,
identical comparison hands, safe clock titles, no revealing story labels/symbols,
both single-error comparison cases, retries, feedback clearing, locking,
completion/restart, lesson-example preservation and focus restoration.
Automated tests and browser verification ran separately.
Production-preview Chromium completed all 34 questions at 1280×900, 390×844,
844×390, 768×1024, 1024×768 and 320×568. Each size checked geometry, visible
12-hour digital times, hidden explanations, combined checking, either single
comparison error, retries, locking, completion/reset, navigation/focus, RTL/LTR,
responsive story order, touch-target size, no overflow and no browser errors.
Desktop mouse clicks, emulated phone/tablet touch taps and keyboard Tab/Enter
flows passed. Existing lesson/practice entries and keyboard setting sliders
passed browser smoke checks; complete previous practice flows are covered by
the automated suite. Desktop and narrow-phone screenshots were inspected.
Physical iOS/Android devices, Safari/WebKit, Firefox and screen-reader
announcements were not verified. Progress remains session-only; no scoring,
persistence, audio, personal activities or 24-hour teaching is introduced.

Issue #40 verification passed all 164 automated tests across 17 files with the
standard `npm test` command and default timeouts. Eight new tests cover PRD time
boundaries, midnight/noon, incompatible selections, stable tie ordering,
add/edit/delete/cancel, exact hand positions, persistent reload of saved data,
corrupt/blocked reads and write-failure recovery. TypeScript, production build
and whitespace checks passed. The focused activity suite and build checks also
passed after correcting the selectors' accessible names.
Browser verification ran separately in production-preview Chromium at
1280×900, 390×844, 844×390, 768×1024, 1024×768 and 320×568. Checks covered
empty-state guidance, validation, add/edit/delete confirmation and cancellation,
reload and reopening in a new tab, midnight/noon and stable tie order, clock
geometry, 12-hour/LTR time, RTL, native selector touch size, keyboard submission,
focus restoration, corrupt/blocked reads, simulated quota errors and save retry.
Existing lessons and every practice entry passed browser smoke checks, including
keyboard movement of setting sliders. No horizontal overflow or browser errors;
desktop and narrow-phone list/form screenshots inspected. Additional form and
long-name deletion-confirmation checks passed at desktop and narrow-phone sizes.
Phone/tablet checks use Chromium emulation; physical devices, Safari/WebKit,
Firefox and screen-reader announcements were not verified. Storage failures were
simulated; browser storage may be cleared by users or browser settings. There is
no backup or cross-device synchronization. Previously saved data survives failed
writes, but unsaved in-memory changes can be lost on refresh or leaving My Day.

Issue #43 verification passed all 177 automated tests across 18 files using
standard `npm test` with default timeouts, plus TypeScript, production build and
`git diff --check`. Thirteen new tests verify six skills/twelve questions, unique
answers, minimum time-choice spacing, all 4,096 correct/incorrect response patterns,
unknown answers, neutral feedback/locking, accurate assessment/lesson clocks,
non-revealing clock titles, all recommended lesson routes, reload/reentry,
partial-exit preservation, replacement only after completion, separate My Day
storage, corrupt/blocked reads and write-failure retry.
Browser verification ran separately against the production build in Chromium at
1280×900, 390×844, 844×390, 768×1024, 1024×768 and 320×568. Each size completed
both an all-correct and an all-unknown assessment, checked saved recommendations
and partial exit, opened all five recommendation destinations, completed the
structure lesson's 60-minute rotation and continued to whole hours. Checks also
covered exact hand geometry, neutral feedback, locking, 12-hour LTR times, RTL,
keyboard Enter/Home focus, emulated touch, control sizes and horizontal overflow.
Existing lessons and every practice entry passed browser smoke checks; setting
sliders responded to keyboard arrows. My Day's saved activity and Issue #42 field
placement remained correct. Separate simulated corrupt/blocked reads and failed
writes/retry passed. No browser runtime errors occurred. Desktop/phone screenshots
were visually inspected.
Verification uses Chromium emulation, not physical iOS/Android devices;
Safari/WebKit, Firefox and screen-reader announcements were not verified.
Existing practice completion flows are covered by automated tests; browser
regression coverage is smoke testing. Storage fault cases are simulated. Saved
recommendations belong only to this browser/device/origin and may be cleared by
browser settings; there is no backup or cross-device synchronization. No broader
navigation redesign (#24), minute-button renaming (#27), adaptive practice,
scoring, parent PIN or parent report is introduced.

Issue #46 verification passed all 207 automated tests across 19 files with
standard `npm test` and unchanged default timeouts. Thirty new reward tests cover
all 20 practice integrations, the 224-question ledger, 10/20/30-star thresholds,
repeated requests before a React render, wrong-answer retries, one reward for a
complete comparison, repeated setting success, navigation/remount deduplication,
explicit restart, per-run summaries, collection states, corrupt/blocked storage
and failed-write retry. Existing practice completion tests also assert saved
counts and summaries, and isolate local storage between cases. TypeScript,
production build and staged whitespace checks passed.
Separate production-preview Chromium verification completed all 224 questions
across all 20 modes on desktop (1280×900). At 390×844, 844×390, 768×1024,
1024×768 and 320×568, the first question of every mode was checked with a wrong
attempt, success, navigation/reentry, actual page reload and explicit restart.
At every size these checks confirmed exact totals/deduplication, unlock notices
without a modal, loaded illustrations, collection/Home focus, no horizontal
overflow or browser errors, and no rewards for Baseline, lesson viewing or My Day.
Desktop completed-run summaries and character thresholds/locked states passed;
separate corrupted-data and failed-save navigation/retry/reload checks passed.
Desktop and phone collection screenshots were visually inspected. Final-build
focused checks also verified singular Hebrew star labels, a completed Baseline
without rewards and unavailable storage reads.
Browser coverage uses Chromium with mouse, keyboard and emulated touch. Physical
iOS/Android devices, Safari/WebKit, Firefox and screen-reader announcements were
not verified. Full practice completion is covered by automated tests and desktop
browser checks; smaller viewports cover every mode's first question and reward
lifecycle. Storage faults are simulated. Single-active-tab and failed-storage
limitations are described above; simultaneous multi-tab practice was not tested.

Issue #48 verification passed all 245 automated tests across 20 files with the
standard `npm test` command (61.75s) and unchanged default timeouts, plus
TypeScript, production build and whitespace checks. Thirty-eight new tests cover
all 20 mode integrations, all 60 minute classifications, every quarter/five/exact
mixed question, exactly-three pauses, topic-only success resets, repeated checks
before rendering, navigation/restart/remount persistence, already-rewarded success,
combined comparison attempts, fixed PIN, parent reauthentication, single/all-topic
unlocking, cancellation, safe reward reset, corrupt/unreadable data, failed-save
retry and preservation of other stores. Existing reward and completion tests pass;
Home assertions now expect the actual parent entry rather than the placeholder.
Browser verification ran separately on the production build in Chromium at
1280×900, 390×844, 844×390, 768×1024, 1024×768 and 320×568. Every size checked
all 20 modes' first-question pause/unlock lifecycle, exactly-three mistakes,
restart/navigation/actual-reload persistence, wrong/right masked PIN, resumed
practice, already-credited success without duplicate rewards, individual/all-topic
unlocking, parent exit/refresh reauthentication, reset cancellation/success,
locked collection after reset, durable re-earning, heading/Home/confirmation focus,
RTL and absence of horizontal overflow or browser errors. Desktop, phone and
narrow-phone pause/parent screenshots were inspected. Desktop and narrow-phone
checks also covered all seven paused topics, reset confirmation/cancellation focus,
keyboard PIN submission and controls at least 44px high; confirmation screenshots
were visually inspected.
Separate browser fault cases verified reward-reset failure with old totals,
unlocks and award history intact; corrupt-reward reset with temporary rewards
preserved on failure; parent-data recovery cancellation/failure/retry; unsaved
pauses surviving navigation and later saved/reloaded; blocked reads failing closed;
exact PIN validation and keyboard Enter; three new mistakes after unlocking;
later-question resume; and a mid-sequence earlier-level mixed pause without
skipping. Baseline recommendation and My Day activities remained usable and their
stored bytes were unchanged; parent-data recovery retained reward deduplication.
The existing reward browser regression also passed all 224 questions across all
20 modes on desktop, including completed-run summaries, unlocks and restarts;
all five smaller viewports checked every mode's first-question reward lifecycle,
navigation/reload deduplication and explicit restarts. Threshold/locked states,
corrupt-reward protection, save retries, lesson/Baseline/My Day non-eligibility and
loaded original illustrations passed. Full completion is covered by desktop
browser verification and automated tests; smaller screens cover first questions.
Chromium mouse, keyboard and emulated touch were used. Physical iOS/Android
devices, Safari/WebKit, Firefox and screen-reader announcements were not verified.
Storage faults were simulated. One active tab is assumed; browser storage can be
edited/cleared, and refresh after a failed save can lose unsaved changes. The known
fixed PIN is a local accompaniment mechanism, not identity verification or strong
security. No broader navigation redesign (#24) or minute-button renaming (#27).

Vite writes production assets to `dist/`. Preview serves that build for local
verification; it is not a production deployment server.

## Structure

- `src/App.tsx`: Hebrew Home screen and learning entry
- `src/components/AnalogClock.tsx`: reusable minute-aware SVG clock with optional full/half/quarter/five/exact-minute interaction
- `src/parent/`: shared topic counters, persistent pauses, fixed-PIN parent area, confirmed recovery and tests
- `src/rewards/`: shared reward ledger/provider, per-run summaries, collection screen and tests
- `src/assets/characters/`: three original collectible ninja SVG illustrations
- `src/baseline/`: fixed assessment questions, recommendation rules, versioned local storage, assessment screen and tests
- `src/learning/ClockStructureLesson.tsx`: introductory hands/numbers/rotation lesson
- `src/myDay/`: personal activity screen, time validation, local storage and tests
- `src/styles.css`: responsive styling
- `src/App.test.tsx`: initial screen and clock rendering checks
- `src/learning/`: full-hour and half-hour lessons/practice, quarter-hour lesson/practice, five-minute lesson/practice, exact-minute lesson/practice, elapsed/remaining-time lesson/practice, parts-of-day lesson/practice/classification, snapping geometry, and navigation/interaction tests

Personal activities, completed baseline recommendations and practice rewards are saved in local browser storage; no backend, credentials,
external fonts, or third-party services are required.

## Child-trial flow proposal and implementation

The pending child-trial PR adds **בואו נתרגל** as the primary entry: topic,
practice-now/learn-first, mode, practice and clear continuation. All twenty modes
have contextual help in a native modal dialog that leaves the question mounted;
help/expanded hand exploration never grants rewards, records an attempt or clears
a parent pause. The central flow retains one active practice through Home and
requires confirmation before replacing unfinished practice. Successful parent
reward reset invalidates that suspended practice; failed reset does not.

**מבנה השעון** now includes free exploration with independently draggable hour
and minute hands, one synchronized time, visible digital time, keyboard controls
and an explicit demo-clock reset. Existing practice snapping rules stay unchanged.
Minute topic names are **קפיצות של 5 דקות** and **צעדים של דקה אחת**, including the
Baseline destination label. Lessons show explicit endings and replay controls.

See [the Hebrew review, diagrams, three verification rounds and known gaps](docs/reviews/child-trial-flow.md).
The supplementary learn-first links under **לימוד לפי נושא** now hand off to the
same practice host as direct entry. Home resume, one active session, replacement
confirmation, reward reset invalidation and next-topic completion apply to both
entry paths. Returning to the originating lesson preserves its example and
restores focus to the practice entry. Merely reentering resumes; an explicit
restart is needed for a fresh question state/reward run.

Unsaved My Day guards now cover direct switches to another activity's edit/delete
as well as Home, cancel and new form. Cancelling preserves the draft and stored
bytes; accepting discard executes only the requested action. Back/Escape cancel
the pending discard. Deployment still requires owner approval.
Physical devices, non-Chromium engines and screen readers remain unverified.
