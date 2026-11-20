import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import { useAudio } from "@/components/audio/AudioProvider";
import { Reveal } from "@/components/brand/Reveal";
import { StringDivider } from "@/components/brand/StringDivider";
import { Button } from "@/components/ui/button";
import { pricing } from "@/data/pricing";
import { creditLabels, lineLabels, listWork, type Work } from "@/data/work";
import { useLocale } from "@/i18n";
import { track } from "@/lib/track";

/** One portfolio demo: the video first, then what it shows, what you hear and what to order. */
export function DemoPage({ work: w }: { work: Work }) {
  const { locale, t } = useLocale();
  const c = t.work;
  const { claim } = useAudio();
  const video = useRef<HTMLVideoElement>(null);

  const all = listWork(locale);
  const idx = all.findIndex((x) => x.slug === w.slug);
  const prev = all[(idx - 1 + all.length) % all.length]!;
  const next = all[(idx + 1) % all.length]!;
  const workRoute = locale === "vi" ? ("/vi/work/$slug" as const) : ("/work/$slug" as const);
  const auditRoute = locale === "vi" ? ("/vi/sound-audit" as const) : ("/sound-audit" as const);
  const servicesRoute = locale === "vi" ? ("/vi/services" as const) : ("/services" as const);
  const packages = w.packages.flatMap((id) => {
    const p = pricing[locale].packages.find((x) => x.id === id);
    return p ? [{ id, name: p.name, section: p.line === "addon" ? "game" : p.line }] : [];
  });

  const rows = [
    { label: c.shows, body: <p>{w.shows}</p> },
    { label: c.hear, body: <p>{w.hear}</p> },
    {
      label: c.packages,
      body: (
        <ul className="flex flex-wrap gap-2">
          {packages.map((p) => (
            <li key={p.id}>
              <Link
                to={servicesRoute}
                hash={p.section}
                className="inline-block rounded-full border border-hairline-strong px-3 py-1 text-small text-ivory transition-colors duration-250 hover:border-gold hover:text-gold"
              >
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      ),
    },
    { label: c.credit, body: <p className="text-small">{w.creditNote}</p> },
  ];

  return (
    <article className="pt-36">
      <header className="container-site">
        <p className="label-mono text-muted-foreground">
          {lineLabels[locale][w.line]} · {w.genre} · {w.video.durationLabel}
        </p>
        <h1 className="mt-4 max-w-5xl">{w.title}</h1>
        <p className="mt-6">
          <span className="label-mono rounded-full border border-hairline-strong px-3 py-1 text-ivory">
            {creditLabels[locale][w.credit]}
          </span>
        </p>
        <div className="mt-10 overflow-hidden rounded-card border border-hairline bg-raised">
          <video
            ref={video}
            key={w.video.src}
            src={w.video.src}
            poster={w.cover}
            controls
            playsInline
            preload="none"
            aria-label={w.title}
            width={1920}
            height={1080}
            className="aspect-video w-full bg-background"
            onPlay={() => {
              // One sound source site-wide: stop the mini player; it pauses this video in turn.
              claim(`demo:${w.slug}`, () => video.current?.pause());
              track("demo_play", { demo: w.slug, locale });
            }}
          />
        </div>
        <p className="label-mono mt-4 text-muted-foreground">{c.soundOn}</p>
      </header>

      <div className="container-site">
        <Reveal className="py-16">
          <p className="max-w-4xl font-display text-[28px] font-medium leading-snug tracking-[-0.01em] text-ivory">
            {w.summary}
          </p>
        </Reveal>
        <StringDivider />
        <Reveal as="section" className="py-12">
          <dl className="divide-y divide-hairline">
            {rows.map((r) => (
              <div key={r.label} className="grid-12 py-6">
                <dt className="label-mono col-span-12 mb-2 text-muted-foreground md:col-span-3 md:mb-0 md:pt-1">
                  {r.label}
                </dt>
                <dd className="col-span-12 md:col-span-9">{r.body}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {all.length > 1 && (
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
