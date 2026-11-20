import { ArrowRight } from "lucide-react";
import { instrumentImages } from "@/content/instrument-images";
import { responsiveImage } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { useAudio } from "@/components/audio/AudioProvider";
import { BeforeAfterPlayer } from "@/components/audio/BeforeAfterPlayer";
import { Waveform } from "@/components/audio/Waveform";
import { Reveal } from "@/components/brand/Reveal";
import { StringDivider } from "@/components/brand/StringDivider";
import { TremolaLogo } from "@/components/brand/TremolaLogo";
import { routes } from "@/components/layout/nav";
import { Button } from "@/components/ui/button";
import { WorkCard } from "@/components/work/WorkCard";
import { useFounding } from "@/hooks/use-founding";
import { homeContent, type HomeContent } from "@/content/home";
import { beforeAfterMedia } from "@/content/media";
import { listWork } from "@/data/work";
import type { Locale } from "@/i18n";
import { revealClass, useReveal } from "@/lib/use-reveal";
import { useAmbientPause } from "@/hooks/use-ambient-pause";
import { ContactForm } from "@/components/forms/ContactForm";
import { contactCopy } from "@/content/contact";
import { GoldText } from "@/components/brand/GoldText";

type P = { c: HomeContent; r: (typeof routes)[Locale] };

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow label-mono mb-4">{children}</p>;
}

function Divider() {
  return (
    <div className="container-site">
      <StringDivider />
    </div>
  );
}

export function HomePage({ locale }: { locale: Locale }) {
  const p: P = { c: homeContent[locale], r: routes[locale] };
  return (
    <>
      <Hero {...p} />
      <Showreel {...p} />
      <Divider />
      <Services {...p} />
      <Divider />
      <SelectedWork {...p} locale={locale} />
      <Divider />
      <AsianSignature {...p} />
      <Divider />
      <WhyTremola {...p} />
      <Divider />
      <HowWeWork {...p} />
      <FoundingStrip {...p} />
      <FreePack {...p} />
      <Divider />
      <FinalCta {...p} />
      <section id="contact" className="border-t border-hairline bg-surface scroll-mt-24">
        <div className="section container-site grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <Eyebrow>{contactCopy[locale].eyebrow}</Eyebrow>
            <h2>{contactCopy[locale].title}</h2>
          </div>
          <ContactForm locale={locale} />
        </div>
      </section>
    </>
  );
}

function Hero({ c, r }: P) {
  const ref = useAmbientPause<HTMLElement>();
  return (
    <section
      ref={ref}
      className="relative flex min-h-[min(720px,92svh)] flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-24 text-center"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] size-[720px] -translate-x-1/2 -translate-y-1/2"
      >
        <div className="hero-glow absolute inset-0" />
        <div className="hero-ripple absolute inset-[35%]" />
      </div>
      <Reveal eager className="relative flex flex-col items-center">
        <TremolaLogo size={96} animated="intro" />
        <p className="eyebrow label-mono mt-5">{c.hero.eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-balance break-words">
          <GoldText>{c.hero.title}</GoldText>
        </h1>
        <p className="mt-4 max-w-2xl text-body">{c.hero.text}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link to={r.audit}>{c.hero.cta}</Link>
          </Button>
          <Button
            variant="ghostGold"
            size="lg"
            onClick={() =>
              document.getElementById("showreel")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            {c.hero.listen}
          </Button>
        </div>
        <p className="mt-4 text-small text-muted-foreground">{c.hero.note}</p>
      </Reveal>
      <div
        aria-hidden
        className="absolute bottom-8 left-1/2 h-14 w-px -translate-x-1/2 overflow-hidden"
      >
        <div className="scroll-cue h-full w-full bg-gold" />
      </div>
    </section>
  );
}

function Showreel({ c }: P) {
  return (
    <Reveal
      as="section"
      id="showreel"
      className="ambient-showreel section container-site scroll-mt-20"
    >
      <Eyebrow>{c.showreel.eyebrow}</Eyebrow>
      <h2 className="mb-12">{c.showreel.title}</h2>
      <BeforeAfterPlayer
        video={beforeAfterMedia.video}
        poster={beforeAfterMedia.poster}
        before={beforeAfterMedia.before}
        after={beforeAfterMedia.after}
      />
      <p className="label-mono mt-4 text-muted-foreground">{c.showreel.note}</p>
    </Reveal>
  );
}

function Services({ c, r }: P) {
  return (
    <Reveal as="section" className="section container-site">
      <h2 className="mb-12">{c.servicesTitle}</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {c.serviceLines.map((s) => (
          <article key={s.slug} className="card-tremola flex min-w-0 flex-col p-8">
            <p className="eyebrow label-mono">{s.label}</p>
            <h3 className="mt-4">{s.title}</h3>
            <ul className="mt-6 space-y-2 text-small">
              {s.bullets.map((b) => (
                <li key={b} className="flex gap-3">
                  <span aria-hidden className="text-muted-foreground">
                    —
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <AudioPlayer track={s.track} compact />
              <Link
                to={r.services}
                hash={s.slug}
                className="explore-link link-draw mt-6 text-small"
              >
                {c.explore} {s.label} <ArrowRight aria-hidden />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </Reveal>
  );
}

function SelectedWork({ c, r, locale }: P & { locale: Locale }) {
  const latest = listWork(locale).slice(0, 6);
  return (
    <Reveal as="section" className="section container-site">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <h2>{c.work.title}</h2>
        <Button asChild variant="ghostGold">
          <Link to={r.work}>{c.work.all}</Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {latest.map((w) => (
          <WorkCard key={w.slug} work={w} sizes="(min-width: 768px) 33vw, 100vw" />
        ))}
      </div>
    </Reveal>
  );
}

function InstrumentCard({ inst }: { inst: HomeContent["instruments"][number] }) {
  const { current, playing } = useAudio();
  const [signal, setSignal] = useState(0);
  const on = current?.id === inst.track.id && playing;
  useEffect(() => {
    if (on) setSignal((s) => s + 1);
  }, [on]);
  return (
    <article
      className="card-tremola group flex min-w-0 flex-col overflow-hidden"
      onMouseEnter={() => setSignal((s) => s + 1)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-raised">
        <img
          src={instrumentImages[inst.name]!}
          {...responsiveImage(instrumentImages[inst.name]!)}
          sizes="(min-width: 640px) 50vw, 100vw"
          alt={`Placeholder · ${inst.name}`}
          loading="lazy"
          width={1024}
          height={768}
          className="size-full object-cover transition-[transform,filter] duration-600 ease-tremola motion-safe:group-hover:scale-103 group-hover:brightness-105"
        />
        <span className="label-mono absolute left-3 top-3 bg-background/90 px-2 py-1">
          Placeholder
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-[32px]">{inst.name}</h3>
        <p className="label-mono mt-2 text-muted-foreground">{inst.desc}</p>
        <StringDivider pluckSignal={signal} className="my-6" />
        <AudioPlayer track={inst.track} compact className="mt-auto" />
      </div>
    </article>
  );
}

function AsianSignature({ c }: P) {
  return (
    <Reveal
      as="section"
      id="asian-signature"
      className="ambient-signature section container-site scroll-mt-20"
    >
      <Eyebrow>{c.asian.eyebrow}</Eyebrow>
      <h2 className="max-w-3xl">{c.asian.title}</h2>
      <p className="mt-6 max-w-2xl">{c.asian.text}</p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {c.instruments.map((i) => (
          <InstrumentCard key={i.name} inst={i} />
        ))}
      </div>
      <p className="mt-8 text-small text-muted-foreground">{c.asian.note}</p>
    </Reveal>
  );
}

function WhyTremola({ c }: P) {
  return (
    <Reveal as="section" className="why-section section">
      <div className="container-site">
        <h2 className="mb-12">{c.whyTitle}</h2>
        <dl className="grid gap-x-16 gap-y-10 md:grid-cols-2">
          {c.pillars.map((p) => (
            <div key={p.title} className="border-t border-hairline pt-6">
              <dt className="font-display text-[28px] font-medium leading-tight text-ivory">
                {p.title}
              </dt>
              <dd className="mt-2 text-body">{p.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Reveal>
  );
}

function HowWeWork({ c }: P) {
  const [ref, state] = useReveal<HTMLOListElement>(0.3);
  return (
    <section className="section container-site">
      <Reveal>
        <h2 className="mb-16">{c.howTitle}</h2>
      </Reveal>
      <ol
        ref={ref}
        className={revealClass(state, "reveal-group relative grid gap-10 md:grid-cols-5 md:gap-6")}
      >
        <span
          aria-hidden
          className="reveal-line absolute left-[5px] top-0 h-full w-px origin-top bg-gold md:left-0 md:top-[5px] md:h-px md:w-full md:origin-left"
        />
        {c.steps.map((s, k) => (
          <li
            key={s.n}
            className="reveal-step relative pl-8 md:pl-0 md:pt-10"
            style={{ "--reveal-delay": `${0.3 + 0.18 * (k + 1)}s` } as CSSProperties}
          >
            <span
              aria-hidden
              className="absolute left-0 top-1 size-[11px] rounded-full border border-muted-foreground bg-background md:top-0"
            />
            <p className="label-mono text-muted-foreground">{s.n}</p>
            <h3 className="mt-2">{s.title}</h3>
            <p className="mt-2 text-small">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FoundingStrip({ c, r }: P) {
  const founding = useFounding();
  if (founding.remaining <= 0) return null;
  const pct = (founding.remaining / founding.total) * 100;
  return (
    <Reveal as="section" className="border-y border-hairline bg-surface">
      <div className="container-site flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-lg font-medium text-ivory">
            {c.founding
              .label(founding.remaining, founding.total)
              .split(/(\d+)/)
              .map((part, index) => (index === 1 ? <GoldText key={index}>{part}</GoldText> : part))}
          </p>
          <div
            className="mt-3 h-px w-full max-w-sm bg-hairline"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={founding.total}
            aria-valuenow={founding.remaining}
            aria-label={c.founding.aria}
          >
            <div className="h-px bg-gold" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-4 text-small">{c.founding.text(founding.total)}</p>
        </div>
        <Link to={r.services} className="link-draw self-start text-small md:self-center">
          {c.founding.link}
        </Link>
      </div>
    </Reveal>
  );
}

function FreePack({ c, r }: P) {
  const cards = c.instruments.slice(0, 3);
  const ref = useAmbientPause<HTMLDivElement>();
  return (
    <Reveal as="section" className="section container-site">
      <div className="grid items-center gap-16 md:grid-cols-2">
        <div>
          <Eyebrow>{c.pack.eyebrow}</Eyebrow>
          <h2>{c.pack.title}</h2>
          <p className="mt-6 max-w-lg">{c.pack.text}</p>
          <Button asChild size="lg" className="mt-10">
            <Link to={r.freePack}>{c.pack.cta}</Link>
          </Button>
        </div>
        <div ref={ref} aria-hidden className="relative h-80">
          {cards.map((card, i) => (
            <div
              key={card.name}
              className="drift card-tremola absolute w-[85%] p-5"
              style={{
                top: `${i * 30}%`,
                left: `${i * 7}%`,
                animationDelay: `${i * -3}s`,
                zIndex: 3 - i,
              }}
            >
              <p className="label-mono mb-3 text-muted-foreground">{card.name} · One-shot</p>
              <Waveform progress={0.35 + i * 0.15} className="h-8" />
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

function FinalCta({ c, r }: P) {
  return (
    <Reveal as="section" className="ambient-final section container-site text-center">
      <p className="mx-auto max-w-4xl font-display text-h2 font-medium leading-tight tracking-[-0.01em] text-ivory">
        {c.final.title}
      </p>
      <p className="mx-auto mt-6 max-w-2xl">{c.final.text}</p>
      <Button asChild size="lg" className="mt-10">
        <Link to={r.audit}>{c.final.cta}</Link>
      </Button>
    </Reveal>
  );
}
