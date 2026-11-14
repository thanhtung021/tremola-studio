# Tremola Studio — project guide for Claude

Composer-led sound studio from Vietnam (music, SFX, UI sound, sonic branding for games and apps).
Bilingual site (EN at `/`, VI at `/vi/...`). Designed in Lovable; this repo is now self-owned.
The **visual design is frozen**: no color, font, spacing, layout, copy or animation change unless the
owner approves it, and then only per `docs/DESIGN-SYSTEM.md` (missing from the export — fall back to
the tokens in `docs/BRAND.md` and `src/styles.css`).

## Working rules

- Owner-facing reports in **Vietnamese**; code, comments, commit messages in **English**.
- Work in phases on feature branches. End of each phase: `bun run lint`, `bunx tsc --noEmit`,
  `bun run test`, `bun run build` all pass → commit → short Vietnamese report in `docs/reports/`.
- Ask the owner before: deleting files/data, removing Lovable packages, choosing a paid service,
  schema changes that drop data, deploying to production.
- Never commit secrets. Local values live in `.env` / `.env.local` (git-ignored); names in `.env.example`.
- Text rules (docs/BRAND.md): never "cheap", "affordable", "outsourcing", "best", "#1", "leading",
  "world-class" (VI: "giá rẻ", "hàng đầu", "số 1"). AI only in the FAQ. Never invent clients,
  testimonials, logos or result numbers. Placeholders stay labelled "Placeholder".
- Audio: never autoplay, one track at a time site-wide (everything goes through `AudioProvider`
  / `claim()`), `preload="none"`.

## Stack

React 19.2 · TanStack Start 1.168 (SSR) / Router 1.170 · Vite 8 · Tailwind 4 (CSS-first, `src/styles.css`)
· shadcn/ui (vendored) · Framer Motion · zod 3 · Supabase (Postgres + Auth + RLS) · Nitro → Cloudflare
Workers · bun. Exact versions: `docs/HANDOFF.md`.

## Commands

```bash
bun install --frozen-lockfile
bun run dev            # http://localhost:8080 (launch config "tremola" uses port 8100)
bun run build          # → .output/ (Worker + static assets)
bun run lint           # eslint + prettier
bunx tsc --noEmit
bun run test           # vitest
python scripts/lh-summary.py docs/audit/lighthouse/*.json   # summarize Lighthouse runs
```

Node/bun are a portable install in `%LOCALAPPDATA%\node`; prefix `PATH` with it in scripts.

## Folder map

| Path | What |
|---|---|
| `src/routes/` | File routes; `vi/` mirrors EN pages; `__root.tsx` = shell, head, JSON-LD, html lang |
| `src/components/{home,about,services,work,forms}` | Page components |
| `src/components/audio/` | `AudioProvider` (single-track ownership), players, waveform, `Track` type |
| `src/components/brand/`, `layout/`, `ui/` | Logo/motion bits, nav/footer/cookie notice, vendored shadcn |
| `src/i18n/` | EN/VI dictionaries, locale helpers, `pageHead()` (title/description/OG/canonical/hreflang) |
| `src/content/` | Bilingual page copy, form copy, media map |
| `src/data/work.ts`, `src/data/pricing.ts` | Portfolio and prices (typed, edited by hand) |
| `src/config/` | Founding slots, site config (tracking IDs, pack URL) |
| `src/lib/leads.ts` | Shared zod schemas + `isQualified()`; `leads.functions.ts` = server functions |
| `src/integrations/supabase/` | Supabase clients/middleware (originally Lovable-generated) |
| `drizzle/migrations/` | Original Lovable SQL (reference); `supabase/migrations/` = our migrations |
| `docs/` | HANDOFF, BRAND, audit, reports, guides |
| `media-source/` | Local master media (git-ignored except README) |

## Gotchas

- SSR runs in workerd: bundle everything, no Node child_process, no runtime module resolution.
- `src/routeTree.gen.ts` is generated — never edit.
- `qualified` is computed only on the server (`isQualified`) and never sent to the browser.
- Portfolio slug for Stick is `stick-english-learning-app` (HANDOFF says `stick`).
