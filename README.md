# Countdowns

A small, personal countdown app. Add as many events as you like and watch the
time tick down: years, months, weeks, days, hours, minutes, seconds.

- **Add / edit / delete** your own countdowns (tap **＋ new**).
- **Opens on the largest unit** the gap actually holds, with the remainder
  beside it: an event 13 months out starts at **1 year 1 month**, then swipes
  down to **13 months**, **56 weeks 3 days**, and so on. Years and months are
  counted on the calendar, not as fixed spans of days.
- **Swipe** up/down in a countdown to move between units; tap the dots to jump.
- **Local only** — every countdown is stored in your browser's `localStorage`
  on this device. Nothing is uploaded, synced, or shared.
- All times are interpreted as **local** wall‑clock time.

## Stack

- **Vite + React** with **Mantine** components (`DatePickerInput` / `TimeInput`
  in a responsive grid, so the form lays out correctly on every screen size).
- No backend — a static build deployed to GitHub Pages via the workflow in
  `.github/workflows/deploy.yml`.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## Add to your phone's home screen

Open the published page in Safari → Share → **Add to Home Screen**. It launches
full‑screen with the clock icon.
