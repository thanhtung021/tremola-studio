# Deployment

**Host: Cloudflare Workers** (decision 2026-11-14). Reasons: the app already builds to a Worker
(TanStack Start + Nitro `cloudflare-module`), the domains are already in the same Cloudflare account,
R2 media/pack buckets bind directly to the Worker with no egress fees, preview URLs per branch are
built in, and the Free plan (100k requests/day) covers this site. Vercel would need an adapter change
and Pro (USD 20/month) for commercial use.

Cloudflare account: `Thanhtungtran1002@gmail.com's Account` (id `d91bd5af0c58a9a8af2620c86878c611`).

## Environments

| | Development | Preview (per branch) | Production |
|---|---|---|---|
| Worker | `vite dev` (port 8100) | `tremola-preview` + preview alias per branch | `tremola` |
| URL | http://localhost:8100 | `https://<branch>-tremola-preview.thanhtungtran1002.workers.dev` (latest: `https://tremola-preview.thanhtungtran1002.workers.dev`) | https://tremolastudio.com |
| Trigger | manual | push to any branch ≠ main (GitHub Actions) | push to `main` (GitHub Actions) |
| Indexing | noindex | noindex + robots `Disallow: /` | indexable, sitemap |
| Forms | real backend from `.env.local`, or `E2E_MOCK_BACKEND=true` | `E2E_MOCK_BACKEND=true` until `tremola-dev` exists | real backend |
| R2 | `media-build/` via dev middleware | `tremola-media`, `tremola-packs` | `tremola-media`, `tremola-packs` |

## Environment variables

Build-time (public, baked into the browser bundle — GitHub repository **variables**):

| Name | Preview | Production |
|---|---|---|
| `VITE_APP_ENV` | `preview` | `production` |
| `VITE_SITE_URL` / `SITE_URL` | `https://tremolastudio.com` | `https://tremolastudio.com` |
| `VITE_SUPABASE_URL` | `PREVIEW_SUPABASE_URL` (tremola-dev) | `SUPABASE_URL` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `PREVIEW_SUPABASE_PUBLISHABLE_KEY` | `SUPABASE_PUBLISHABLE_KEY` |
| `VITE_MEDIA_BASE_URL` | empty (= `/media`) | empty, or `https://media.tremolastudio.com` once the R2 custom domain exists |
| `VITE_GA4_ID`, `VITE_META_PIXEL_ID` | empty | IDs when ready (consent-gated) |

Runtime (Worker — Cloudflare dashboard → Workers → worker → Settings → Variables and Secrets, or
`npx wrangler secret put NAME --name <worker>`; `keep_vars: true` means deploys never wipe them):

| Name | Type | Preview (`tremola-preview`) | Production (`tremola`) |
|---|---|---|---|
| `SITE_URL` | var | `https://tremolastudio.com` | `https://tremolastudio.com` |
| `SUPABASE_URL` | var | tremola-dev URL | tremola-prod URL |
| `SUPABASE_PUBLISHABLE_KEY` | var | dev publishable key | prod publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | **secret** | dev secret key | prod secret key |
| `RESEND_API_KEY` | **secret** | same key or empty | Resend API key (sending access) |
| `EMAIL_FROM` | var | `Tremola Studio <hello@mail.tremolastudio.com>` | same |
| `EMAIL_REPLY_TO` | var | sales inbox | sales inbox |
| `SALES_INBOX` | **secret** (personal address) | a test inbox | sales inbox (comma-separated allowed) |
| `SEND_VISITOR_CONFIRMATION` | var | `false` | `true` after the copy in `src/content/emails.ts` is approved |
| `DOWNLOAD_SIGNING_SECRET` | **secret** | random 48+ chars (set) | different random 48+ chars |
| `FREE_PACK_OBJECT_KEY` | var | default | default `free-pack/tremola-free-pack-v1.zip` |
| `DOWNLOAD_TTL_SECONDS` | var | default 86400 | default 86400 |
| `E2E_MOCK_BACKEND` | var | `true` (set) until tremola-dev exists | **never set** |

Generate a signing secret: `python -c "import secrets;print(secrets.token_urlsafe(48))" | npx wrangler@4 secret put DOWNLOAD_SIGNING_SECRET --name tremola`

GitHub repository **secrets**: `CLOUDFLARE_API_TOKEN` (template "Edit Cloudflare Workers" + R2 edit),
`CLOUDFLARE_ACCOUNT_ID` = `d91bd5af0c58a9a8af2620c86878c611`. GitHub **variables**: see table above
plus `WORKERS_SUBDOMAIN` = `thanhtungtran1002`. Create a GitHub Environment `production`.

## Deploying by hand

```bash
# preview
TREMOLA_WORKER_NAME=tremola-preview VITE_APP_ENV=preview bun run build
npx wrangler@4 deploy --config .output/server/wrangler.json
# production (owner approval required)
TREMOLA_WORKER_NAME=tremola VITE_APP_ENV=production VITE_SUPABASE_URL=… VITE_SUPABASE_PUBLISHABLE_KEY=… bun run build
npx wrangler@4 deploy --config .output/server/wrangler.json
```

Rollback: Cloudflare → Workers → tremola → Deployments → pick the previous version → **Rollback**
(or `npx wrangler@4 rollback --name tremola`).

## Domains

`tremolastudio.com` (primary) and `tremola.studio` are already active zones in this Cloudflare account.
The production Worker declares them as **Custom Domains** (`vite.config.ts` → `routes`), so the first
production deploy creates the DNS records and certificates automatically:

| Host | Behaviour |
|---|---|
| `tremolastudio.com` | the site (HTTPS, Universal SSL) |
| `www.tremolastudio.com` | 301 → `https://tremolastudio.com/<path>` (done in `src/server.ts`) |
| `tremola.studio`, `www.tremola.studio` | 301 → `https://tremolastudio.com/<path>` |
| `tremola.vn`, `www.tremola.vn` | 301 once added (below) |

Before the first production deploy, check each zone → DNS → Records: **delete any existing `A`/`AAAA`/`CNAME`
on `@` and `www`** (parking pages), otherwise the custom-domain creation fails. Then zone →
SSL/TLS → Edge Certificates → **Always Use HTTPS: On**, Minimum TLS 1.2.

### tremola.vn (not in Cloudflare yet)

`.vn` domains are sold by Vietnamese registrars (Mắt Bão, PA, Nhân Hòa…). When purchased:
1. Cloudflare → Add a domain → `tremola.vn` → Free plan.
2. At the registrar, change the nameservers to the two Cloudflare nameservers shown (`.vn` changes can take up to 24 h; some registrars need an ID document on file first).
3. When the zone is Active: add `tremola.vn` and `www.tremola.vn` to the `routes` list in `vite.config.ts`
   and redeploy production (the Worker already redirects these hosts).

### Email DNS (Resend + receiving mail)

- **Sending** (Resend → Domains → Add `mail.tremolastudio.com`, region Tokyo): Resend lists 3–4 records
  (`MX send.mail`, `TXT send.mail` SPF, `TXT resend._domainkey.mail` DKIM, optional DMARC). Add each in
  Cloudflare → tremolastudio.com → DNS with **Proxy status: DNS only**, then Verify in Resend.
- **Receiving** `hello@tremolastudio.com` (sales inbox) for free: Cloudflare → tremolastudio.com →
  Email → Email Routing → Enable → Add the suggested MX/TXT records → Routing rules: `hello@` → the owner's Gmail.

### Media CDN domain (optional)

Media is served at `/media/*` by the Worker from R2 with Range support and immutable caching. For a
separate CDN host: R2 → `tremola-media` → Settings → Custom Domains → `media.tremolastudio.com`, then set
`VITE_MEDIA_BASE_URL=https://media.tremolastudio.com` and rebuild.

## Monitoring

- **Uptime (free): UptimeRobot** (50 monitors, 5-minute checks, e-mail alerts). Monitors:
  1. HTTP(s) `https://tremolastudio.com/api/health` — expects 200 and keyword `"ok":true`
     (also checks the database, and the regular hits keep the Supabase Free project from pausing).
  2. Keyword `https://tremolastudio.com/` contains `Tremola Studio`.
- **Errors (free, built in):** browser errors are beaconed to `/api/client-error` and server errors are
  logged by the Worker; both are in Cloudflare → Workers → tremola → **Observability → Logs** (filter
  `client-error`, `[audit]`, `[pack]`). Form failures are also stored in the `submission_errors` table.
- Optional later: Sentry Developer plan (free, 5k errors/month) if alerting on JS errors is wanted.

## Release checklist (production)

1. All CI jobs green on `main`; preview checked on phone (iOS Safari + Android Chrome).
2. Supabase prod: all migrations applied, sign-ups disabled, admin user + role created.
3. Worker `tremola` vars/secrets set (table above); `E2E_MOCK_BACKEND` absent.
4. Test one real audit request and one pack sign-up; check the sales inbox and `/admin`.
5. Sitemap submitted in Google Search Console (`https://tremolastudio.com/sitemap.xml`).
