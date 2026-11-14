# Tremola Studio — Engineering handoff

Snapshot: 2026-11-14 UTC. This delivery adds documentation and an empty environment template only. No UI, copy, route, component, schema or behavior changes. Start with [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md), [BRAND.md](BRAND.md) and [CONTENT-STATUS.md](CONTENT-STATUS.md).

## Stack and reproducibility

These are **installed and bun.lock-resolved versions**, not the looser package.json ranges. All 79 direct package versions were cross-checked against the lockfile. Preserve `bun.lock`; use `bun install --frozen-lockfile`, `bun run dev`, `bun run test`. `bun run build` is the production build command; `bun run preview` is available. There is no production `start` script. Choose and configure the deployment adapter before outside hosting; this is an SSR/full-stack application, not merely static Vite output.

| Layer | Exact version / approach |
|---|---|
| React / React DOM | 19.2.8 / 19.2.8 |
| Vite / TypeScript | 8.1.5 / 5.9.3 (actual repository; do not assume Vite 7 from earlier briefs) |
| Tailwind / @tailwindcss/vite | 4.3.3 / 4.3.3; CSS-first theme in src/styles.css |
| shadcn/ui | Vendored source, no shadcn runtime package/version; components.json new-york style, CSS variables, Lucide icons |
| Framer Motion | 14.12.0 |
| TanStack Start / Router / router-plugin | 1.168.60 / 1.170.41 / 1.168.42 |
| TanStack Query / zod-adapter | 5.101.4 / 1.167.0 |
| i18n | Custom typed EN/VI dictionaries, Locale union, /vi prefix; no i18n library |
| Form validation | Zod 3.25.76; lead forms use React state + shared Field controls and schema validation on client/server |
| Form toolkit available in ui/form.tsx | react-hook-form 7.83.0; @hookform/resolvers 5.5.7; not the lead forms' state manager |
| Cloud client SDK | @supabase/supabase-js 2.119.0 |
| Lovable Vite configuration | @lovable.dev/vite-tanstack-config 2.27.1 |
| Server adapter | Nitro 3.0.260603-beta; default Cloudflare Worker target |
| Database tooling | drizzle-kit 0.31.11; drizzle-orm 0.45.4; postgres 4.1.1 |
| Tests | Vitest 4.1.11; jsdom 20.0.3; Testing Library React 16.3.3 / jest-dom 6.10.0 |
| UI foundations | class-variance-authority 0.7.1; clsx 2.1.1; tailwind-merge 3.6.0; lucide-react 0.575.0; sonner 2.0.7; tw-animate-css 1.4.0 |

Radix packages are individually versioned: accordion 1.2.20, alert-dialog 1.1.23, aspect-ratio 1.1.15, avatar 1.2.6, checkbox 1.3.11, collapsible 1.1.20, context-menu 2.3.7, dialog 1.1.23, dropdown-menu 2.1.24, hover-card 1.1.15, label 2.1.15, menubar 1.1.24, navigation-menu 1.2.22, popover 1.1.23, progress 1.1.16, radio-group 1.4.7, scroll-area 1.2.18, select 2.3.7, separator 1.1.15, slider 1.4.7, slot 1.3.3, switch 1.3.7, tabs 1.1.21, toggle 1.1.18, toggle-group 1.1.19, tooltip 1.2.16. Other UI packages: cmdk 1.1.1, date-fns 4.4.0, embla-carousel-react 8.6.0, input-otp 1.4.2, react-day-picker 9.14.0, react-resizable-panels 4.12.2, recharts 2.15.4, vaul 1.1.2, vite-tsconfig-paths 6.1.1. Rolldown is overridden to 1.2.1.

## Folder map

| Path | Responsibility |
|---|---|
| src/routes/ | TanStack file routes (the pages); vi/ mirrors localized pages; __root.tsx owns shared shell/head/lang |
| src/components/{home,about,services,work,forms}/ | Page presentation and feature components |
| src/components/brand/ | Logo, string divider, reveal, viewport-aware gradient text |
| src/components/audio/ | Shared ownership/provider, players, waveform and Track contract |
| src/components/layout/ | Navigation, footer, cookie consent and page title |
| src/components/ui/ | Vendored shadcn primitives; customize via tokens/variants |
| src/i18n/ | EN/VI dictionaries, locale paths and SEO head helpers |
| src/content/ | Bilingual page copy, form labels and media maps |
| src/data/ | Typed portfolio, prices, rights and formatting |
| src/config/ | Founding availability and tracking/download settings |
| src/lib/ | Validation, submissions, attribution, tracking, motion, utility and error handling |
| src/hooks/ | Mobile detection and ambient-loop pausing |
| src/integrations/supabase/ | Generated Cloud browser/server/auth/type helpers; don't hand-edit while managed |
| src/assets/ | Local generated covers/instrument photos and external asset-pointer JSON |
| public/ | Real favicon, touch icon, share image and robots.txt |
| drizzle/ | Custom PostgreSQL migration SQL and journal; schema.ts intentionally blank |
| supabase/ | Only managed config.toml, not the schema sources |
| src/test/ and *.test.* | Routing and business-rule/validation tests |
| docs/ | Handoff documentation |

`src/router.tsx` creates a QueryClient per router/request, configures scroll restoration and the generated `src/routeTree.gen.ts`. Never edit that generated tree. `src/start.ts` preserves CSRF, error middleware and bearer attachment; `src/server.ts` wraps catastrophic SSR errors. SSR/server functions publish to workerd: all packages must be bundled; no runtime module resolution or Node child_process execution. Local Node compatibility does not prove Worker compatibility.

## Every route

| EN | VI | File(s) under src/routes/ | Rendered component |
|---|---|---|---|
| / | /vi (route declaration /vi/) | index.tsx; vi/index.tsx | HomePage, src/components/home/HomePage.tsx |
| /work | /vi/work | work.index.tsx; vi/work.index.tsx (index declarations end /) | WorkRoute → WorkListPage |
| /work/:slug | /vi/work/:slug | work.$slug.tsx; vi/work.$slug.tsx | CaseRoute → CaseStudy |
| /services | /vi/services | services.tsx; vi/services.tsx | ServicesPage |
| /sound-audit | /vi/sound-audit | sound-audit.tsx; vi/sound-audit.tsx | SoundAuditPage → AuditForm |
| /free-pack | /vi/free-pack | free-pack.tsx; vi/free-pack.tsx | FreePackPage → PackForm |
| /about | /vi/about | about.tsx; vi/about.tsx | AboutPage |
| /styleguide | none | styleguide.tsx | local Styleguide, hidden from nav, noindex |

Current published slugs: `stick`, `lantern-valley`, `moon-lute-duel`, `calm-ledger`. Unknown/unpublished slugs throw notFound. Work lists validate the `line` query filter. Root layout is RootShell/RootComponent → Navbar, Outlet, Footer plus AudioProvider, MiniPlayer, CookieNotice and QueryClientProvider. There are no API, login or admin routes.

Every leaf content route has its own head(): ordinary pages use `pageHead(locale,key,ctx)`; case studies build article heads from localized loader data; styleguide has unique metadata/noindex. Descriptions, canonical and EN/VI/x-default alternates are centralized in src/i18n/index.ts. Root loader obtains origin through getRequestOrigin; root emits Organization JSON-LD and sets html lang. Ordinary/case pages currently use the shared public/og-image.png, not individual cover previews. Missing-project metadata delivery has not been checked in this handoff.

## Content and data editing map

There is no CMS. A non-developer should edit quoted copy/numeric values with an engineer reviewing syntax and both languages, not edit JSX. Preserve property names, quotes, commas, option codes, unique IDs and slugs. Run targeted tests after business-rule changes. Do not turn placeholders into real-client claims without supplied evidence.

| File | Type / exported data | Editing instructions |
|---|---|---|
| src/data/work.ts | WorkTrack, Work, Work[]; published/localize helpers | Edit project objects; status published exposes them. Keep original concepts badged; vi overrides supported text, otherwise EN fallback. Optional results/credits need real evidence. |
| src/data/pricing.ts | Line, Package, Currency; private Price/Key; prices, rights, helpers | Numeric listed/founding prices live here. EN USD, VI VND. listed accepts number/range/null, founding null disables discount. Preserve tests and rights formula. |
| src/config/founding.ts | inferred {total:number,remaining:number} | Update remaining manually; not linked to orders or signup counts. Zero hides founding display. |
| src/config/site.ts | inferred siteConfig | Tracking IDs/download URL come from env; empty IDs disable analytics; absent pack URL marks placeholder. |
| src/i18n/en.ts; vi.ts | Dict=typeof en; vi implements Dict | Shared nav/footer/work labels/page titles/descriptions. Edit both; contact email is still placeholder. |
| src/i18n/index.ts | Locale='en'\|'vi'; Record<Locale,Dict> | Locale/path/head infrastructure; engineer changes only. |
| src/content/home.ts | HomeContent=typeof en; Record<Locale,HomeContent> | All home section copy; VI prioritizes app/product services. Also exports instruments/serviceLines aliases. |
| src/content/about.ts | LogoPart union; AboutContent=typeof en; locale record | Founder/story copy; preserve logo-part codes; replace founder placeholders. |
| src/content/services.ts | ServicesContent=typeof en; locale record | Service descriptions, FAQ, founding labels/terms; prices elsewhere. |
| src/content/contact.ts | contactCopy:Record<Locale,typeof en> | Contact labels/messages; limits in leads.ts. |
| src/content/forms.ts | inferred auditCopy/packCopy; audit satisfies locale record; string maps | Both languages' form/options/errors/pack copy; stored codes must match auditOptions. Shapes not fully enforced as equal. |
| src/content/media.ts | inferred placeholderMedia; placeholderTrack(...):Track | Replace external media pointers, duration labels and placeholder flags together. |
| src/content/instrument-images.ts | Record<string,string> | Replace session images; retain exact instrument-name lookup keys. |
| src/components/layout/nav.ts | literal route map satisfying Record<Locale,Record<string,string>> | Route links; engineer keeps routes aligned. |
| src/components/audio/types.ts | Track | id,title,src plus optional durationLabel, peaks (0–1), placeholder. |
| src/lib/leads.ts | auditOptions; auditSchema/packSchema/contactSchema; AuditInput, PackInput | Option codes and validation, not marketing text; update copy and tests together. |

## Backend inventory (read-only inspection, 2026-11-14 UTC)

Lovable Cloud is the active managed backend. Four application tables exist in `public`; RLS is enabled on all four. No Cloud storage buckets or managed HTTP schedules were returned by live inventory. No application triggers were reported. This handoff does not copy production submissions or account data.

### Schema sources and export boundary

- `drizzle/migrations/0000_migration.sql`: `app_role`, `user_roles`, `has_role`, `audit_requests`, `pack_signups`, constraints, explicit grants and policies.
- `drizzle/migrations/0001_create_contact_submissions.sql`: contact table, constraints, grants and policies.
- `drizzle/migrations/meta/_journal.json`, `0000_snapshot.json`, `0001_snapshot.json`: Drizzle migration bookkeeping. Custom SQL is authoritative; `drizzle/schema.ts` is a placeholder, not a complete typed schema.
- `drizzle.config.ts`: PostgreSQL migration configuration, reads `LOVABLE_DB_MIGRATION_URL`.
- **Under `supabase/` only `supabase/config.toml` exists.** It contains managed project identification, not table/function/bucket definitions. There is no `supabase/migrations/` or `supabase/functions/` directory. Do not mistake that for an absent database.
- `src/integrations/supabase/types.ts`: generated application schema types; not a migration or data backup.

All columns below are NOT NULL unless marked nullable. All `id` columns are UUID primary keys defaulting to `gen_random_uuid()`; submission `created_at` columns are `timestamptz`, default `now()`.

### `audit_requests`

| Column | PostgreSQL type | Default / constraint |
|---|---|---|
| id | uuid | generated primary key |
| created_at | timestamptz | now() |
| locale | text | 'en'; en or vi |
| name | text | 1–120 characters |
| email | text | 3–255 characters; email format validated in application |
| company | text | 1–160 characters |
| role | text | ≤80 characters |
| listen_to | text | ≤40 characters |
| link | text | ≤500 characters; HTTP(S) URL validated in application |
| team_size | text | ≤20 characters |
| launch | text, nullable | YYYY-MM regex; application does not validate a real calendar month |
| budget | text | ≤40 characters |
| pain | text, nullable | ≤2000 characters |
| heard_from | text, nullable | ≤60 characters |
| app_status | text, nullable | ≤40 characters |
| qualified | boolean | false |
| utm_source | text, nullable | ≤200 characters |
| utm_medium | text, nullable | ≤200 characters |
| utm_campaign | text, nullable | ≤200 characters |
| utm_content | text, nullable | ≤200 characters |
| referrer | text, nullable | ≤500 characters |
| landing_page | text, nullable | ≤500 characters |

### `pack_signups`

| Column | PostgreSQL type | Default / constraint |
|---|---|---|
| id | uuid | generated primary key |
| created_at | timestamptz | now() |
| locale | text | 'en'; en or vi |
| name | text | 1–120 characters |
| email | text | 3–255 characters |
| making | text | ≤40 characters |
| utm_source, utm_medium, utm_campaign, utm_content | text, nullable (four separate columns) | ≤200 characters each |
| referrer, landing_page | text, nullable (two separate columns) | ≤500 characters each |

### `contact_submissions`

| Column | PostgreSQL type | Default / constraint |
|---|---|---|
| id | uuid | generated primary key |
| created_at | timestamptz | now() |
| locale | text | en or vi; no default |
| name | text | 1–120 characters |
| email | text | 3–255 characters |
| company | text | empty string; ≤160 characters |
| message | text | 1–2000 characters |

### `user_roles`, enum and database function

| Column | PostgreSQL type | Default / constraint |
|---|---|---|
| id | uuid | generated primary key |
| user_id | uuid | references auth.users(id), ON DELETE CASCADE |
| role | public.app_role | enum admin or user |

Unique pair `(user_id, role)`. Roles are never stored in browser storage or user-editable profile metadata. `public.has_role(_user_id uuid, _role app_role) → boolean` is SQL, STABLE, SECURITY DEFINER, `search_path=public`; checks for a matching role row. Source: `0000_migration.sql`. It is a database function, **not** an Edge Function.

### Exact RLS policies

| Table | Policy name | Operation / roles | Predicate |
|---|---|---|---|
| audit_requests | Anyone can submit an audit request | INSERT; anon, authenticated | WITH CHECK true |
| audit_requests | Admins can read audit requests | SELECT; authenticated | has_role(auth.uid(), 'admin'::app_role) |
| pack_signups | Anyone can sign up for the pack | INSERT; anon, authenticated | WITH CHECK true |
| pack_signups | Admins can read pack signups | SELECT; authenticated | has_role(auth.uid(), 'admin'::app_role) |
| contact_submissions | Visitors can submit contact messages | INSERT; anon, authenticated | WITH CHECK true |
| contact_submissions | Admins can read contact messages | SELECT; authenticated | has_role(auth.uid(), 'admin'::app_role) |
| user_roles | Users can read their own roles | SELECT; authenticated | auth.uid() = user_id |

No UPDATE/DELETE policies; user_roles has no INSERT policy. Normal visitors cannot read submissions; service-role access bypasses RLS. Migrations explicitly grant INSERT to anon/authenticated and SELECT to authenticated on submission tables, SELECT to authenticated on roles, ALL to service_role. Live `has_table_privilege` returned broader SELECT/INSERT/UPDATE/DELETE privileges for all three roles on all four tables, while the role_table_grants query returned no rows. Consequently the SQL files document intended explicit grants, not a proven minimal live ACL; RLS remains the effective access boundary. Review destination ACLs independently during migration; no permission changes were made for this handoff.

### Server functions, not Edge Functions

| Function / source | Inputs | Outputs / purpose |
|---|---|---|
| submitContactMessage; src/lib/leads.functions.ts | contactSchema: locale, name, email, company, message | { ok: true }; inserts contact_submissions, throws on validation/save error |
| submitAuditRequest; same file | auditSchema / AuditInput: locale, name, email, company, role, listenTo, link, teamSize, launch, budget, optional pain/heardFrom/appStatus, nullable attribution fields | { ok: true }; maps camelCase to DB columns and inserts audit_requests |
| submitPackSignup; same file | packSchema / PackInput: locale, name, email, making, nullable attribution fields | { ok: true }; inserts pack_signups |
| getRequestOrigin; src/lib/origin.functions.ts | no user input | request origin string, root loader metadata |

The three submissions are public TanStack Start POST `createServerFn` handlers with server-side Zod validation and a sessionless publishable client; INSERT RLS applies. They do not use the privileged client. `src/start.ts` retains CSRF request middleware and bearer attachment. Generated auth/admin helpers exist but there is no admin UI or protected content route.

**Qualification is computed on the server today:** `submitAuditRequest` calls `isQualified(data.launch, data.budget)` from `src/lib/leads.ts`. True only when launch is truthy and budget is neither `not_sure`, `usd_under_500` nor `vnd_under_5m`. It is not a database trigger/generated column. Direct anonymous Data API inserts can bypass this calculation and application option validation; DB constraints still apply. Do not treat `qualified` as an authorization decision.

No Edge Function source or calls exist in this repository. The available read-only tools did not provide a deployed Edge Function listing, so **remote-only deployments are unverified**, not guaranteed absent. Auth provider/confirmation settings were not read and remain unverified. There are no storage policies because live bucket inventory was empty; asset CDN pointers are separate from Cloud storage.

### What GitHub does not export

Git includes code, migrations, generated type/helper files and local images; it does not transfer the running backend, database rows, user accounts/password hashes, secrets, provider configuration, managed schedules, hosting/domain settings or storage objects. Asset JSON pointers contain URLs, not the remote media bytes.

For a full database/account transfer, the owner uses Lovable **More → Database → Manage → Settings → Export project data → Export data → Database → Export → Start export**, then retrieves the export from its emailed link or More → Storage. That export includes schema/data and accounts/password hashes, but excludes storage files, Edge Function code, secrets and sign-in provider/API-key settings. It is separate from Git. Do not run a dump using invented managed credentials: the managed service-role key and database password are not available to the owner through Lovable Cloud. Destination hosting must provision its own credentials. Download any storage files separately through More → Storage (none were found today). Transfer CDN-backed logos/media separately and verify licensing/accessibility on the destination.

## Environment and secrets (names only)

See root `.env.example`; every value is empty. VITE-prefixed variables are public browser configuration. Private credentials must never use that prefix or be committed in a filled template.

| Name | Reader / purpose |
|---|---|
| VITE_SUPABASE_URL | Generated browser client; backend endpoint |
| VITE_SUPABASE_PUBLISHABLE_KEY | Generated browser client; public RLS-scoped key |
| SUPABASE_URL | Server lead/auth/admin clients; SSR client fallback |
| SUPABASE_PUBLISHABLE_KEY | Public server client/auth; SSR fallback |
| SUPABASE_SERVICE_ROLE_KEY | Generated server admin helper only; bypasses RLS; not used by lead submissions |
| VITE_SUPABASE_PROJECT_ID, SUPABASE_PROJECT_ID | Managed project identification in current env; no direct application read found |
| VITE_GA4_ID | siteConfig/track.ts; optional Google Analytics ID |
| VITE_META_PIXEL_ID | siteConfig/track.ts; optional Meta pixel ID |
| VITE_FREE_PACK_URL | siteConfig; real download URL |
| LOVABLE_DB_MIGRATION_URL | drizzle.config.ts; tooling-only privileged migration connection |
| LOVABLE_CRON_SECRET, LOVABLE_CRON_SECRET_PREVIOUS | Generated cron-auth helper; current/rotation credential, helper unused today |
| LOVABLE_API_KEY | Hosted secret inventory; no application read or AI/connector call found |
| SUPABASE_ANON_KEY, SUPABASE_DB_URL | Hosted secret inventory; no direct source read found; legacy/platform bindings |

These last hosted-only names are documented for completeness, not requirements to create new AI/connector features. Deployment secrets/credentials are not exported here. Exact provider/confirmation settings remain unverified.

## Lovable-specific integration and outside development

1. `@lovable.dev/vite-tanstack-config` wraps Start, React, Tailwind, TS paths, Nitro/Cloudflare, sandbox defaults, deduplication and error logging. Keep it initially or replace it with an equivalent standard configuration during the team's migration, preserving src/server.ts and middleware. Do not add duplicate plugins while the wrapper remains. No lovable-tagger or AI gateway SDK is installed; exemptions in bunfig.toml are not installed dependencies.
2. Generated Cloud clients/auth middleware/preview storage live in src/integrations/supabase/. Backend use is standard SDK + PostgreSQL/RLS. To stop depending on Lovable Cloud, restore schema/accounts/data at a separately controlled compatible backend, provision new credentials, update endpoint/public config and secure server bindings, then verify all forms and authorization. These steps are future migration work, not performed here.
3. `previewAuthStorage.ts` and optional browser error hooks in src/lib/lovable-error-reporting.ts support editor preview. Outside Lovable the hooks may be absent; replace reporting with the team's monitoring if desired. Preserve error boundary/SSR fallback behavior.
4. Official logo/audio/video `.asset.json` imports are CDN pointers. Git does not contain their media bytes; rehost intentionally for independence. Local JPG covers and instrument placeholders are in Git.
5. No app connectors were returned by project connection inventory; no AI calls or installed AI gateway found. Hosted LOVABLE_API_KEY alone does not establish an active integration. Cron helper exists but no managed schedules were found.
6. Root AGENTS.md contains a Lovable-managed block. Its managed database/generated-file rules apply while linked to Lovable; the receiving team should document its own controlled migration workflow after moving away. BRAND.md is the verbatim project guide; later color refinements are separately documented in DESIGN-SYSTEM.md, not silently rewritten into that original.
7. **Git sync and GitHub API are distinct.** Git sync transfers this code repository (Project settings → Git); the GitHub API connector powers runtime API automations and is not required for this handoff. Selecting a connector does not verify Git sync status or create/export a repository. No GitHub API feature was added, and Git sync connection/status was not verified by available tools.

## Analytics and consent

src/lib/track.ts defines track(); root initializes after hydration. CookieNotice stores accepted/declined under localStorage `tremola-consent`. Until accepted, GA/Meta scripts and custom events do not load/fire. Empty IDs also disable delivery. Acceptance loads GA gtag.js/config and Meta fbevents.js/init/PageView; track dispatches GA event/Meta trackCustom.

| Event | Where it fires |
|---|---|
| audit_form_start | AuditForm.tsx; first form interaction, locale |
| audit_form_submit | AuditForm.tsx; successful submission, locale/listen_to |
| pack_signup | PackForm.tsx; successful signup, locale/making |
| before_after_toggle | BeforeAfterPlayer.tsx; switch selection, to/page |
| audio_play | BeforeAfterPlayer.tsx; play, track/page; not general AudioPlayer |
| pricing_view | ServicesPage.tsx; mount effect, locale |
| cta_click | __root.tsx delegated document click for audit/free-pack links; label/page |

There is no contact-submission analytics event. Attribution fields are captured by src/lib/attribution.ts; inspect separately from consent-gated analytics dispatch. No real analytics network delivery was tested (IDs unset). Meta's queue shim has no explicit callMethod branch; SDK takeover needs verification. No explicit SPA navigation PageView subscription is implemented. Consent UI does not provide a revoke/reset path after its banner closes; declining initially prevents loading, but already-loaded SDKs are not unloaded by setConsent('declined').

## Known issues and next-team checklist

- See exhaustive content replacement map in CONTENT-STATUS.md: real audio, recording footage, instrument photos, founder details, socials/contact email, pack ZIP/license and case-study facts remain outstanding.
- Founding availability is static configuration, not transactional inventory; never interpret 20/20 as live account/order counting.
- No admin/sign-in page, email notifications, lead management or pack email delivery. Leads are stored and pack success reveals the configured link.
- Public direct inserts can bypass application validation/qualification; no CAPTCHA or app-level anti-spam/rate limiter exists. Review abuse handling without opening read permissions.
- Launch validates shape only, not actual month or future date. Qualification is prioritization, not permission.
- English-derived content shapes can fall back to EN; Vietnamese copy/diacritics still merit native review.
- Legacy BRAND.md palette describes original body colors; current neutral palette/dark-only/lacquer refinements are in DESIGN-SYSTEM.md. Do not restore the rejected paper background.
- Historical preview Lighthouse mobile performance was 41, accessibility 100 after lacquer changes; not a production score. ≥90 performance verification waits for publication. No published/custom address currently established; sitemap.xml remains pending.
- Shared OG image is not per-case cover; root Organization social links remain placeholder. Unknown-case noindex delivery unverified here.
- CSS contains dormant ripple/cue keyframes and unused drift potential; inventory distinguishes definitions from actual mounted behavior.
- All public-table policies were read live; actual grants differ from the explicitly narrow migration intent as noted above. Auth settings and remote-only Edge Functions remain unverified.
- Existing tests: pricing, leads, contact validation, routing. This handoff changes no rules/tests; documentation validation and an unchanged /styleguide availability check are recorded during delivery. A production build or external-host deployment was not performed.
