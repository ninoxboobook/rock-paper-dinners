# 🎰 Rock Paper Dinners

Can't decide where to eat? **Shake your phone three times** and let the slot machine pick a Melbourne venue for you. Built for settling the nightly "where should we eat" debate.

A installable **PWA** — add it to your home screen and it works offline.

## Features

- **Play** — shake the phone (or tap **SPIN** on desktop) to spin a 3-reel slot machine that lands on a random venue from the current filters. Confetti included.
- **Map** — every venue plotted on a map with emoji pins (OpenStreetMap, no API key).
- **Browse** — searchable, filterable list. Each venue is a card with name, cuisine, suburb and description.
- **Filters** — by cuisine and suburb, applied everywhere (including what the slot machine draws from).
- **Shortlist** — star venues to a personal shortlist, then set the machine to spin only from those.

## Data

224 Melbourne venues, sourced from a curated Instagram "Local Eats" collection, web-verified for cuisine + suburb, then geocoded for the map. See `src/data/venues.json`.

| precision | meaning |
|-----------|---------|
| `exact`   | geocoded to the street address (180) |
| `suburb`  | only a suburb-level pin was found (42) |
| `none`    | no reliable coordinates — shows in lists, not on the map (2) |

## Stack

- **Vite + React + TypeScript**
- **Zustand** for state (filters + shortlist persisted to `localStorage`)
- **Leaflet / react-leaflet** + OpenStreetMap tiles
- **vite-plugin-pwa** (Workbox) — installable, offline, caches map tiles
- `DeviceMotion` for shake detection (iOS motion-permission handled)

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the production build
```

> Motion sensors and "Add to Home Screen" need **HTTPS** (or `localhost`). To test shake-to-spin on your actual phone, serve over HTTPS (e.g. `vite --host` behind a tunnel, or deploy).

## Regenerating the venue data

The venue list + coordinates are pre-built into `src/data/venues.json`. To rebuild from the source export and re-geocode:

```bash
python3 scripts/geocode.py   # uses free OSM Nominatim (~4 min, rate-limited)
```

## Deploy

Static — host `dist/` anywhere (GitHub Pages, Netlify, Vercel). `base` is relative so it works from a subpath.
