import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Reveal } from "@/components/brand/Reveal";
import { StringDivider } from "@/components/brand/StringDivider";
import { TremolaLogo } from "@/components/brand/TremolaLogo";
import { routes } from "@/components/layout/nav";
import { Button } from "@/components/ui/button";
import { aboutContent, type LogoPart } from "@/content/about";
import type { Locale } from "@/i18n";
import { cn } from "@/lib/utils";

export function AboutPage({ locale }: { locale: Locale }) {
  const c = aboutContent[locale];
  const r = routes[locale];
  const [focus, setFocus] = useState<LogoPart | null>(null);
  return (
    <div className="pt-40">
      <Reveal eager className="container-site">
        <p className="eyebrow label-mono">{c.eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-balance break-words">{c.title}</h1>
      </Reveal>

      <Reveal as="section" className="section container-site">
        <h2 className="mb-12 text-[28px]">{c.nameTitle}</h2>
        <dl className="grid gap-10 md:grid-cols-3">
          {c.name.map((n) => (
            <div key={n.word} className="border-t border-hairline pt-6">
              <dt className="font-display text-[56px] font-medium leading-none text-ivory">
                {n.word}
              </dt>
              <dd className="mt-4">{n.text}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 font-display text-[28px] italic text-ivory">{c.nameNote}</p>
      </Reveal>

      <div className="container-site">
        <StringDivider />
      </div>

      <Reveal as="section" className="section container-site grid-12 items-center">
        <div className="col-span-12 flex justify-center md:col-span-5">
          <div className="logo-story" data-focus={focus ?? undefined}>
            <TremolaLogo size={280} className="h-auto w-[220px] sm:w-[280px]" />
          </div>
        </div>
        <div className="col-span-12 mt-12 md:col-span-6 md:col-start-7 md:mt-0">
          <h2 className="mb-8 text-[28px]">{c.logoTitle}</h2>
          <ul className="space-y-2">
            {c.logo.map((l) => (
              <li key={l.part}>
                <button
                  type="button"
                  onMouseEnter={() => setFocus(l.part)}
                  onMouseLeave={() => setFocus(null)}
                  onFocus={() => setFocus(l.part)}
                  onBlur={() => setFocus(null)}
                  aria-pressed={focus === l.part}
                  className={cn(
                    "w-full cursor-pointer border-l-2 py-3 pl-5 text-left text-body transition-colors duration-250",
                    focus === l.part
                      ? "border-gold text-ivory"
                      : "border-hairline hover:text-ivory",
                  )}
                >
                  {l.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal as="section" className="section container-site">
        <p className="mx-auto max-w-4xl font-display text-[28px] font-medium leading-snug tracking-[-0.01em] text-ivory">
          {c.story}
        </p>
      </Reveal>

      <div className="container-site">
        <StringDivider />
      </div>

      {/* Founder block stays hidden until the real name, portrait and bio are in about.ts. */}
      {c.founder.ready && (
        <Reveal as="section" className="section container-site grid-12 items-center">
          <div className="col-span-12 md:col-span-4">
            <div
              role="img"
              aria-label={c.founder.portraitAlt}
              className="relative grid aspect-[4/5] place-items-center rounded-card border border-hairline bg-raised"
            >
              <TremolaLogo size={64} className="opacity-40" />
              <span className="label-mono absolute left-4 top-4 rounded-full bg-background/70 px-3 py-1 text-muted-foreground">
                Placeholder
              </span>
            </div>
          </div>
          <div className="col-span-12 mt-10 md:col-span-7 md:col-start-6 md:mt-0">
            <p className="eyebrow label-mono">{c.founderTitle}</p>
            <h2 className="mt-4">{c.founder.name}</h2>
            <p className="label-mono mt-3 text-muted-foreground">{c.founder.role}</p>
            <p className="mt-6 max-w-xl">
              {c.founder.bio} <span className="label-mono text-muted-foreground">Placeholder</span>
            </p>
          </div>
        </Reveal>
      )}

      <Reveal as="section" className="section container-site pt-0">
        <h2 className="mb-8 text-[28px]">{c.notTitle}</h2>
        <ul className="flex flex-wrap gap-3">
          {c.not.map((n) => (
            <li key={n} className="rounded-full border border-hairline px-4 py-2 text-small">
              {n}
            </li>
          ))}
        </ul>
      </Reveal>

      <section className="border-y border-hairline bg-surface">
        <div className="container-site flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between">
          <p className="font-display text-[32px] leading-tight text-ivory">{c.ctaTitle}</p>
          <Button asChild size="lg">
            <Link to={r.audit}>{c.cta}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
