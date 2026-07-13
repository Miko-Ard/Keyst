# ⌨ Typing Tracker

A calm, editorial personal web app for building consistent typing habits and
tracking your journey to 100 WPM. Warm, minimal, spacious — designed with the
quiet confidence of an Anthropic-quality product.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **TailwindCSS** with a hand-tuned warm design-token palette
- **shadcn-style** UI primitives (Button, Card, Input, Textarea)
- **Recharts** for the muted WPM / accuracy charts
- **Framer Motion** for very subtle, 200ms-calm animations
- **Prisma + SQLite** for local persistence

## Getting started

```bash
npm install          # installs deps + generates Prisma client
npm run db:push      # create the SQLite database
npm run db:seed      # seed ~30 days of realistic practice data
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build && npm run start
```

## What's inside

- **Hero** — editorial title, today's progress ring, streak & goal
- **Statistics cards** — Current WPM, Best WPM, Average Accuracy, Current Streak
- **Daily log** — record WPM, accuracy, raw WPM, duration, feeling, notes
- **Charts** — WPM (area) and accuracy (line) over time, muted palette
- **Achievements** — pastel milestone cards that unlock from your real data
- **Recent sessions** — a soft, rounded, spacious table

Achievements and stats recompute automatically from your logged sessions —
break 100 WPM and the "100 Club" card unlocks on the next save.

## Design language

Background `#F7F5F2` · Surface `#F2ECE3` · Card Beige `#E8DDCF` ·
Soft Sage `#DDE8E1` · Dusty Lavender `#DDD9EC` · Muted Blue `#D8E6EC` ·
Accent `#3B3B3B`. Headings in **Newsreader**, body in **Inter**.
24px radii, flat warm cards, soft borders, hover = slight elevation only.
