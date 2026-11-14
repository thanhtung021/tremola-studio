# Backend

Self-owned Supabase project (Free plan) in the **Tremola** organisation, separate Supabase account
dedicated to the studio. Region: Southeast Asia (Singapore). Decision 2026-11-14 (Phase 1).

| Item | Value |
|---|---|
| Organisation | Tremola (Free) |
| Production project | `tremola-prod` (ref in `.env.local` / Worker vars, never committed) |
| Optional second project | `tremola-dev` for branch previews (Free plan allows 2 projects) |
| Schema source of truth | `supabase/migrations/*.sql` (applied in order) |
| Old Lovable SQL | `drizzle/migrations/` — reference only, do not run |

## Why our own project (vs Lovable Cloud)

- Dashboard, SQL editor, logs, auth settings and backups are directly accessible.
- We get the **service role / secret key**, which the server needs to write leads after the
  public INSERT policies were removed (Phase 2), to read the founding counter and to log downloads.
- Custom SMTP (Resend) for admin password-reset emails.
- Cost: 0 on Free (500 MB DB, 50k MAU, 5 GB egress). Free projects pause after 7 days without
  traffic — the uptime monitor (docs/DEPLOY.md#monitoring) keeps the site warm and alerts us.
- The site had almost no data on Lovable Cloud, so nothing needs to be migrated. If the owner wants
  the few test rows: Lovable → More → Database → Manage → Settings → Export project data.

## Schema (after all migrations)

| Table | Purpose | Who can read | Who can write |
|---|---|---|---|
| `audit_requests` | Sound Audit leads; `qualified` computed on the server; `status`, `notes` | admins (RLS) | server (service role); admins may update `status`, `status_updated_at`, `notes` only |
| `pack_signups` | Free Pack sign-ups; `status`, `notes` | admins | server; admins update status/notes |
| `contact_submissions` | Homepage contact form | admins | server |
| `pack_downloads` | One row per pack download (hashed IP, UA, country) | admins | server |
| `submission_errors` | Server-side form failures (no personal data) | admins | server |
| `rate_limits` | Fixed-window counters (hashed IP/e-mail) | nobody | `rate_limit_hit()` (service role) |
| `founding_slots` | Single row: total / remaining | everyone | admins |
| `user_roles` | `admin` role per auth user | the user themself | SQL only |

No anonymous INSERT exists any more: the browser cannot write to the database directly, so the
`qualified` flag, validation, honeypot and rate limits cannot be bypassed.

## Applying migrations

The Supabase CLI is not installed on the studio PC; migrations are pasted into the SQL editor:

1. Supabase → project → **SQL Editor** → New query.
2. Paste each file from `supabase/migrations/` **in filename order**, Run, check "Success".
3. Record it in `docs/reports/` (date + file).

With the CLI (CI or another machine): `supabase link --project-ref <ref>` then `supabase db push`.

## Admin users (no public sign-up)

1. Supabase → **Authentication → Sign In / Providers → Email**: keep Email enabled, turn
   **"Allow new users to sign up" OFF**.
2. **Authentication → Users → Add user → Create new user**: email + strong password,
   tick *Auto Confirm User*.
3. SQL editor:
   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'admin' from auth.users where email = 'marketing@tremolastudio.com';
   ```
4. Sign in at `/admin`. Remove access: `delete from public.user_roles where user_id = …;`

**Auth URL settings:** Authentication → URL Configuration → Site URL `https://tremolastudio.com`,
Redirect URLs `https://tremolastudio.com/admin`, `https://*.workers.dev/admin`, `http://localhost:8100/admin`.

## Keys and where they go

| Key (Supabase → Project Settings → API Keys) | Name in this repo | Where |
|---|---|---|
| Project URL | `VITE_SUPABASE_URL`, `SUPABASE_URL` | build env (GitHub variable) + Worker var |
| Publishable key `sb_publishable_…` | `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PUBLISHABLE_KEY` | build env + Worker var (public by design) |
| Secret key `sb_secret_…` | `SUPABASE_SERVICE_ROLE_KEY` | **Worker secret only** (`wrangler secret put`), `.env.local` for local dev |

## Email

Provider: **Resend** (Free: 3,000 emails/month, 100/day), separate account for the studio.
Sending domain: `mail.tremolastudio.com` (DNS records added in Cloudflare, see docs/DEPLOY.md).

| Email | When | Env |
|---|---|---|
| Internal notification (all fields, qualified flag, UTM, locale, country) | every audit request, pack sign-up, contact message | `SALES_INBOX` |
| Visitor confirmation (EN/VI, brand voice, copy in `src/content/emails.ts`) | audit request — only when `SEND_VISITOR_CONFIRMATION=true` | `EMAIL_FROM`, `EMAIL_REPLY_TO` |
| Free pack link (signed, 24 h) | pack sign-up | `EMAIL_FROM` |

Until the sending domain is verified Resend only delivers to the account owner's address; failures
are recorded in `submission_errors` and never shown to visitors (the lead is already saved).
Supabase Auth emails (password reset) should use Resend SMTP: Authentication → Emails → SMTP Settings
→ host `smtp.resend.com`, port 465, user `resend`, password = a Resend API key, sender
`no-reply@mail.tremolastudio.com`.

## Lovable-specific code — removal proposal (needs owner approval)

| Item | Status | Proposal |
|---|---|---|
| `@lovable.dev/vite-tanstack-config` (devDependency) | still used by `vite.config.ts` | Keep for now (it wires TanStack Start + Nitro + Tailwind). Replace with an explicit Vite config in a separate PR when convenient. |
| `src/lib/lovable-error-reporting.ts` | no longer imported (replaced by `client-errors.ts`) | Delete |
| `src/integrations/supabase/previewAuthStorage.ts` | used by the browser client; only matters inside the Lovable editor | Replace with plain `localStorage`, delete |
| `src/assets/**/*.asset.json` (5 Lovable CDN pointers) | no longer imported (media now on R2) | Delete |
| `drizzle/`, `drizzle.config.ts`, `drizzle-kit`, `drizzle-orm`, `postgres` | unused (schema now in `supabase/migrations`) | Delete |
| `.lovable/`, Lovable block in `AGENTS.md`, `bunfig.toml` Lovable excludes | Lovable metadata | Delete / trim |
| `LOVABLE_*` env names | removed from `.env.example` | — |
