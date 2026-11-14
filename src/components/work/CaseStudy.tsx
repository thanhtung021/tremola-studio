import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { useAudio } from "@/components/audio/AudioProvider";
import { BeforeAfterPlayer } from "@/components/audio/BeforeAfterPlayer";
import { Reveal } from "@/components/brand/Reveal";
import { StringDivider } from "@/components/brand/StringDivider";
import { Button } from "@/components/ui/button";
import {
  kindBadge,
  lineLabels,
  localizeWork,
  publishedWork,
  vietnameseInstruments,
  type Work,
  type WorkTrack,
} from "@/data/work";
import { useLocale } from "@/i18n";
import { cn } from "@/lib/utils";
import { CountUp } from "./CountUp";
import { GoldText } from "@/components/brand/GoldText";
import { toTrack } from "./toTrack";
import { responsiveImage } from "@/lib/utils";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal as="section" className="grid-12 py-16">
      <h2 className="col-span-12 text-[28px] md:col-span-4">{title}</h2>
      <div className="col-span-12 md:col-span-8">{children}</div>
    </Reveal>
  );
}

function TrackList({
  slug,
  tracks,
  offset,
}: {
  slug: string;
  tracks: WorkTrack[];
  offset: number;
}) {
  const { current, playing } = useAudio();
  return (
    <ul className="space-y-4">
      {tracks.map((t, i) => {
        const tr = toTrack(slug, t, offset + i);
        return (
          <li
            key={tr.id}
            className={cn(
              "border-l-2 pl-4 transition-colors",
              current?.id === tr.id && playing ? "border-gold" : "border-transparent",
            )}
          >
            <AudioPlayer track={tr} compact />
          </li>
        );
      })}
    </ul>
  );
}

export function CaseStudy({ work: w }: { work: Work }) {
  const reduce = useReducedMotion();
  const { locale, t } = useLocale();
  const c = t.work;
  const badge = kindBadge(w, locale);
  const instruments = Array.from(
    new Set([
      ...w.tags.filter((t) => vietnameseInstruments.includes(t)),
      ...Object.values(w.system).flatMap((ts) => ts?.flatMap((t) => t.instruments ?? []) ?? []),
      ...(w.heroTrack?.instruments ?? []),
    ]),
  );
  const cols = [
    { key: "music", label: "Music", tracks: w.system.music ?? [] },
    { key: "sfx", label: "SFX", tracks: w.system.sfx ?? [] },
    { key: "ui", label: c.ui, tracks: w.system.ui ?? [] },
  ].filter((c) => c.tracks.length);
  const idx = publishedWork.findIndex((x) => x.slug === w.slug);
  const prevRaw = publishedWork[(idx - 1 + publishedWork.length) % publishedWork.length];
  const nextRaw = publishedWork[(idx + 1) % publishedWork.length];
  const prev = prevRaw && localizeWork(prevRaw, locale);
  const next = nextRaw && localizeWork(nextRaw, locale);
  const workRoute = locale === "vi" ? ("/vi/work/$slug" as const) : ("/work/$slug" as const);
  const auditRoute = locale === "vi" ? ("/vi/sound-audit" as const) : ("/sound-audit" as const);

  return (
    <article className="pt-36">
      <header className="container-site">
        <p className="label-mono text-muted-foreground">
          {[lineLabels[w.line], w.year, w.platform].filter(Boolean).join(" · ")}
        </p>
        <h1 className="mt-4 max-w-5xl">{w.title}</h1>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-small">
          {w.client ? (
            <span className="text-ivory">{w.client}</span>
          ) : (
            badge && (
              <span className="label-mono rounded-full border border-hairline-strong px-3 py-1 text-ivory">
                {badge}
              </span>
            )
          )}
          <span className="text-muted-foreground">{w.role}</span>
        </div>
        <div className="relative mt-12 overflow-hidden rounded-card border border-hairline">
          {w.cover.alt.startsWith("Placeholder") && (
            <span className="label-mono absolute left-4 top-4 z-10 rounded-full bg-background/70 px-3 py-1 text-muted-foreground">
              Placeholder
            </span>
          )}
          {w.cover.type === "video" ? (
            <video
              src={w.cover.src}
              muted
              loop
              playsInline
              preload="none"
              aria-label={w.cover.alt}
              className="aspect-[21/9] w-full object-cover"
            />
          ) : (
            <motion.img
              src={w.cover.src}
              {...responsiveImage(w.cover.src)}
              sizes="100vw"
              fetchPriority="high"
              alt={w.cover.alt}
              width={1600}
              height={912}
              className="aspect-[21/9] w-full object-cover"
              initial={reduce ? { opacity: 0 } : { scale: 1.04 }}
              animate={reduce ? { opacity: 1 } : { scale: 1 }}
              transition={{ duration: reduce ? 0.2 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </div>
        {w.heroTrack && (
          <div className="card-tremola mt-6 p-5">
            <AudioPlayer track={toTrack(w.slug, w.heroTrack, -1)} />
          </div>
        )}
      </header>

      <div className="container-site">
        {w.summary && (
          <Reveal className="py-20">
            <p className="max-w-4xl font-display text-[28px] font-medium leading-snug tracking-[-0.01em] text-ivory">
              {w.summary}
            </p>
          </Reveal>
        )}
        <StringDivider />
        {w.challenge && (
          <Section title={c.challenge}>
            <p>{w.challenge}</p>
          </Section>
        )}
        {(w.direction || instruments.length > 0) && (
          <Section title={c.direction}>
            {w.direction && <p>{w.direction}</p>}
            {instruments.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label={c.instruments}>
                {instruments.map((i) => (
                  <li
                    key={i}
                    className="rounded-full border border-hairline-strong px-3 py-1 text-small text-ivory"
                  >
                    {i}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )}
        {w.beforeAfter && (
          <Reveal as="section" className="py-16">
            <h2 className="mb-8 text-[28px]">Before / After</h2>
            <BeforeAfterPlayer
              placeholder
              video={w.beforeAfter.video}
              {...(w.beforeAfter.poster ? { poster: w.beforeAfter.poster } : {})}
              before={w.beforeAfter.beforeAudio}
              after={w.beforeAfter.afterAudio}
            />
          </Reveal>
        )}
        {cols.length > 0 && (
          <Reveal as="section" className="py-16">
            <h2 className="mb-8 text-[28px]">{c.system}</h2>
            <div className="grid gap-10 md:grid-cols-3">
              {cols.map((c, ci) => (
                <div key={c.key}>
                  <p className="label-mono mb-4 text-muted-foreground">{c.label}</p>
                  <TrackList slug={w.slug} tracks={c.tracks} offset={ci * 100} />
                </div>
              ))}
            </div>
          </Reveal>
        )}
        {w.integration?.length ? (
          <Section title={c.integration}>
            <p className="label-mono text-muted-foreground">{w.integration.join(" · ")}</p>
          </Section>
        ) : null}
        {w.results?.length ? (
          <Reveal as="section" className="py-16">
            <h2 className="mb-8 text-[28px]">{c.results}</h2>
            <dl className="grid gap-10 sm:grid-cols-3">
              {w.results.map((r) => (
                <div key={r.label}>
                  <dd className="font-display text-[64px] font-medium leading-none text-ivory">
                    <GoldText>
                      <CountUp value={r.value} />
                    </GoldText>
                  </dd>
                  <dt className="label-mono mt-3 text-muted-foreground">{r.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        ) : null}
        {w.credits?.length ? (
          <Section title={c.credits}>
            <ul className="space-y-1 text-small">
              {w.credits.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Section>
        ) : null}

        {publishedWork.length > 1 && prev && next && (
          <nav
            aria-label={c.more}
            className="grid gap-6 border-t border-hairline py-12 sm:grid-cols-2"
          >
            <Link to={workRoute} params={{ slug: prev.slug }} className="group">
              <span className="label-mono text-muted-foreground">{c.prev}</span>
              <span className="mt-2 block font-display text-[28px] text-ivory group-hover:text-gold">
                {prev.title}
              </span>
            </Link>
            <Link to={workRoute} params={{ slug: next.slug }} className="group sm:text-right">
              <span className="label-mono text-muted-foreground">{c.next}</span>
              <span className="mt-2 block font-display text-[28px] text-ivory group-hover:text-gold">
                {next.title}
              </span>
            </Link>
          </nav>
        )}
      </div>

      <section className="border-y border-hairline bg-surface">
        <div className="container-site flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between">
          <p className="font-display text-[32px] leading-tight text-ivory">{c.cta}</p>
          <Button asChild size="lg">
            <Link to={auditRoute}>{c.audit}</Link>
          </Button>
        </div>
      </section>
    </article>
  );
}
