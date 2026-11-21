<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

# Tremola Studio — Project Knowledge (applies to every prompt)

## What we are building
A portfolio website for Tremola Studio: a composer-led interactive sound studio from Vietnam that designs complete, exclusive sonic systems (music incl. adaptive music, SFX, UI sound, sonic branding) for games and apps, rooted in East Asian musical heritage. The site's job: let visitors HEAR the work, then request a Free Sound Audit. Clients buy sound with their ears, so every page leads to something they can listen to.

## Brand facts
- Name: always "Tremola Studio" on first mention on every page. Never write "TREMOLA" in all caps inside sentences. Descriptor: "Tremola Studio · Sound for games & apps".
- Tagline: "Sound with a soul of its own." (VI: "Âm thanh có hồn riêng.")
- One-liner: "Tremola gives games and apps a sound of their own."
- Name story: Tre (bamboo, the material of Vietnamese instruments) + Tremolo (the trembling-string technique on the đàn tranh and đàn nguyệt) + -la (the note A). In Italian, "tremola" means "it trembles".
- Logo story: a crescent moon (the body of the đàn nguyệt, the moon lute) + a bamboo stem with 3 segments and 1 leaf (also a string that is vibrating). Together they form a lowercase "a" for audio, inside a thin circle that stands for a complete sound system.
- Three service lines: Game Audio · Product & App Sound · Media.

## Audience
- Primary: funded indie game studios (2–20 people) in the US, Canada and Europe making Asian-inspired, fantasy, RPG or cozy games. Readers: founders, creative directors, producers.
- Also: indie and mid-size studios outsourcing SFX/UI with Wwise/FMOD integration; funded app/SaaS startups (Head of Product, Head of Design) needing a sonic logo, UI sound and a sound guideline.
- Vietnamese version: brand/marketing managers of fintech, edtech and wellness apps; mobile game studios; creative agencies (white-label partners).

## Voice
Refined, human, technically fluent, confident but modest. Short sentences, strong verbs, concrete sound examples instead of adjectives. Talk about what players and users feel.
Never use: "cheap", "affordable", "outsourcing", "best", "#1", "leading", "world-class", "top-tier", "all genres", "exotic", "Oriental". Do not overuse "mystical" or "ancient". Never turn culture into a tourism slogan.
AI: never in headlines, slogans, the hero or the homepage. Mention it only in the FAQ, answered honestly: AI is an internal tool; every sound delivered is composed, edited and approved by people, and is rights-clean.

## Honesty rules for content
- No invented clients, client logos, testimonials, reviews, ratings or result numbers. Testimonials and "trusted by" blocks stay hidden until real data exists.
- Original demo pieces are allowed but must carry a visible "Original concept" badge.
- All placeholder text, audio and images are labelled "Placeholder" so the team can find and replace them.

## Design tokens (must match the official logo exactly)
- Night wood — background: #1f1a14
- Bronze gold — accent, ring, moon, primary buttons, links, active states: #c9a45c
- Ivory gold — headings, text on dark, bamboo, leaf: #e6cf9a
- Derived tones (use only these): surface #282119 · raised #322a20 · hairline border rgba(201,164,92,0.18) · body text rgba(230,207,154,0.80) · muted text rgba(230,207,154,0.62) · gold hover #d6b56f
- No other hues: no blue, no purple, no pure white, no pure black. No loud gradients; only soft radial glows of #c9a45c at 12% opacity or less.
- Dark-first site. Text contrast must pass WCAG AA (4.5:1 for body text).

## Typography (proposal, may change later)
- Display (H1–H3, large numbers, pull quotes): "Cormorant Garamond" 500/600, tight leading, letter-spacing -0.01em. Use only at 28px and above.
- Body and UI: "Be Vietnam Pro" 400/500.
- Small technical labels (durations, BPM, "Wwise · FMOD", track numbers): "JetBrains Mono" 400, 12–13px, uppercase, letter-spacing 0.08em.
- Load the Vietnamese subset; check that đ, ư, ơ, ả, ỗ and other Vietnamese diacritics render correctly in every font. If a font lacks them, use Be Vietnam Pro for that text.

## Motion principles
Subtle, slow, musical. The signature gesture is the "tremolo": a short damped vibration, like a plucked string settling. Use it sparingly (logo, play buttons, string dividers). No bouncing, no scroll-jacking, no heavy parallax, no custom cursor, no 3D or WebGL. Respect prefers-reduced-motion everywhere.

## Audio rules
Never autoplay sound. Only one track plays at a time across the whole site. Audio loads lazily (preload="none") and starts only when the user clicks play.

## Tech
React + TypeScript + Tailwind + shadcn/ui + Framer Motion. Lovable Cloud for form submissions. Keep content in typed data files so non-developers can edit it.

## Project structure
- Copy/data in typed files: `src/data/work.ts` (portfolio), `src/content`, `src/config`, `src/i18n/{en,vi}.ts`, not in components.
- Locale = `/vi` path prefix (`src/routes/vi/`); root shell sets `<html lang>`.
- All audio goes through `AudioProvider`; other players call `claim()` (one at a time).

- Audio presentation uses `data-audio-playing` and shared CSS `:has()` for parent-card illumination, so every shared player returns to neutral on pause without duplicating state.
- Instrument photo placeholders live in a typed content map, so real session photography can replace them without changing page layout.
- Contact forms reuse the shared field controls and server-side lead schemas; keep bilingual copy in content files so validation and presentation stay consistent.
- Centralize lacquer effects in semantic CSS utilities; use a shared viewport-aware text wrapper to keep at most one gradient text element visible.
