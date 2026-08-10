# BP18 Frame & Body Dashboard

Next.js 15 (App Router) + MongoDB control surface for the BlackPearl FSAE Frame & Body subsystem.

## Stack
- Next.js 15, TypeScript, Tailwind 4
- MongoDB (Mongoose) — local service by default, Atlas for deploy
- Machine aesthetic: dark mode, SVG icons, no emojis

## Run locally
1. Start MongoDB (Windows service on `127.0.0.1:27017`, or `mongod`).
2. `npm install`
3. `npm run seed`  — load sample data from GAS dumps (optional; needs `../projects/gas_*.json`)
4. `npm run dev`  — http://localhost:3000

## Env
Create `.env.local` (optional — defaults to local Mongo):
```
MONGODB_URI=mongodb://127.0.0.1:27017/bp18
```

## Structure
- `lib/collections.ts` — registry: each section's fields drive the auto table + form
- `lib/db.ts` — Mongo connection
- `app/api/[collection]/route.ts` — generic GET/POST
- `app/api/[collection]/[id]/route.ts` — generic PATCH/DELETE
- `app/[section]/page.tsx` — one route renders all 15 sections
- `components/GenericTable.tsx` — table + modal form (search, pagination, optimistic save)
- `components/Sidebar.tsx` — collapsible nav

## Add a new section
Add an entry to `COLLECTIONS` in `lib/collections.ts`. The table, form, API, and sidebar update automatically — no new route or component needed.
