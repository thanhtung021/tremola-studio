# Tremola Studio — Foundation

This first step builds the shared building blocks the site will use: the design system, the logo, the menu bar and footer, the audio players, and empty pages. Real page content comes later. A hidden /styleguide page shows every piece so you can review it.

## 1. Design system
- Colors: only the official palette (night wood, surface, raised, bronze gold, gold hover, ivory, body/muted text, hairline). All default colors are removed.
- Fonts: Cormorant Garamond, Be Vietnam Pro and JetBrains Mono, loaded with Vietnamese characters. The styleguide shows "đ ư ơ ả ỗ" in each font so we can check them.
- Type scale, 1200px max width, section spacing of 128px on desktop and 80px on mobile, 12-column grid, and a static film grain at 3%.
- Buttons: Primary, Ghost and Text link, exactly as in your brief. Cards with a hairline border, 16px corners, a faint glow on hover and no shadows.

## 2. Logo
- The exact SVG you provided, never redrawn. Options: size, whether the dark tile shows, and an animation setting (intro, hover or none). Each logo gets its own mask ID, so several can share a page.
- Intro: the ring draws in, then the moon fades in, the bamboo grows, the leaf unfolds, and the mark settles with a "pluck". This plays once per session.
- Hover: the pluck only. With reduced motion, the logo appears in its final state.
- Favicon and Apple touch icon: the tiled mark.

## 3. Motion kit and string divider
- Shared easing, timings, a fade-up effect, a stagger effect, the tremolo preset, and a Reveal wrapper that plays at 20% visibility. With reduced motion, everything becomes a 200ms fade.
- A string divider that vibrates when it enters the view and on hover, settling over 800ms.

## 4. Global layout
- Navbar: logo with the pluck on hover, the "Tremola Studio" wordmark, Work · Services · Asian Signature · About, the EN | VI switch, and a "Free Sound Audit" button.
  - It is transparent over the hero and becomes a frosted surface after 80px of scrolling.
  - Mobile: a full-screen menu.
- Footer: descriptor, tagline in italics, page links, social links and a contact email (both marked "Placeholder"), and the copyright line.
- Empty pages with a title only: /, /work, /work/:slug, /services, /sound-audit, /free-pack, /about, plus the same set under /vi. Each sets the correct page language and its own page title.

## 5. Audio system
- One sound at a time across the whole site. Nothing autoplays, and audio loads only when someone presses play.
- Player: round play button, title, duration and a bar waveform you can click or drag to seek. It works fully with the keyboard and has spoken labels.
- A mini player slides up at the bottom of the screen while something is playing.
- Before/After player: 16:9 video, a Before and an "After · Tremola Studio" toggle with a 300ms crossfade, and the B key to switch while the player is focused.

## 6. Placeholder media
- The styleguide needs a short placeholder video and audio. I'll use a placeholder video and generated tones, all labelled "Placeholder", until you send the real files.

## Technical details
- Tokens are oklch values in src/styles.css, mapped to the shadcn variables. Unused chart and sidebar colors are dropped.
- Fonts load through Google Fonts links in __root (subsets latin and vietnamese).
- framer-motion is added.
- Files:
  - src/components/brand/{TremolaLogo,StringDivider}.tsx
  - src/lib/motion.ts
  - src/components/layout/{Navbar,Footer}.tsx
  - src/components/audio/{AudioProvider,AudioPlayer,MiniPlayer,Waveform,BeforeAfterPlayer}.tsx
  - src/i18n/{en,vi}.ts
  - src/content/ for typed placeholder data
- Language comes from the /vi path prefix. The root shell sets <html lang> based on the current location.
- Waveform peaks come from a supplied array, or are decoded with Web Audio once the file has loaded.
- The before/after crossfade uses two audio elements synced to the video's currentTime, with a volume ramp.
- An AGENTS.md rule is added for the content and i18n file structure.
