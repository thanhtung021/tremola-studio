import { Link } from "@tanstack/react-router";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { Reveal } from "@/components/brand/Reveal";
import { StringDivider } from "@/components/brand/StringDivider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { founding } from "@/config/founding";
import { servicesContent } from "@/content/services";
import { formatListed, formatPrice, pricing, rights, rightsLabel, rightsVi, showFounding, type Package } from "@/data/pricing";
import type { Locale } from "@/i18n";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

function PackageCard({ p, locale }: { p: Package; locale: Locale }) {
  const { currency } = pricing[locale];
  const discounted = showFounding(p, founding.remaining);
  const c = servicesContent[locale];
  return (
    <article className="card-tremola flex min-w-0 flex-col p-6 lg:p-8">
      <h3>{p.name}</h3>
      <ul className="mt-5 space-y-2 text-small">
        {p.includes.map((i) => (
          <li key={i} className="flex gap-3"><span aria-hidden className="text-muted-foreground">—</span>{i}</li>
        ))}
      </ul>
      <div className="mt-auto pt-8">
        {discounted && p.founding !== null ? (
          <div>
            <p className="text-small text-muted-foreground">
              {c.originalPrice}{" "}
              <del className="whitespace-nowrap decoration-1">{formatListed(p, currency)}</del>
            </p>
            <p className="mt-4 text-small font-medium text-body">{c.foundingRate}</p>
            <p className="mt-2 break-words font-display text-[48px] font-semibold leading-none text-ivory tabular-nums">
              {formatPrice(p.founding, currency)}
            </p>
            <p className="mt-5 border-t border-hairline pt-4 text-small font-medium text-ivory">
              {c.slotsLeft(founding.remaining, founding.total)}
            </p>
          </div>
        ) : (
          <p className="break-words font-display text-[40px] font-medium leading-none text-ivory">
            {formatListed(p, currency)}
          </p>
        )}
        {p.note && <p className="mt-3 text-small text-muted-foreground">{p.note}</p>}
      </div>
    </article>
  );
}

export function ServicesPage({ locale }: { locale: Locale }) {
  useEffect(() => track("pricing_view", { locale }), [locale]);
  const pkgs = pricing[locale].packages;
  const c = servicesContent[locale];
  const addon = pkgs.filter((p) => p.line === "addon");
  const audit = locale === "vi" ? ("/vi/sound-audit" as const) : ("/sound-audit" as const);
  return (
    <div className="pt-40">
      <Reveal className="container-site">
        <p className="eyebrow label-mono">{c.eyebrow}</p>
        <h1 className="mt-4">{c.title}</h1>
        <p className="mt-6 max-w-2xl">
          {c.intro}
        </p>
      </Reveal>

      {c.sections.map((s) => (
        <Reveal as="section" key={s.id} id={s.id} className="section container-site scroll-mt-20">
          <div className="grid-12 mb-12 items-end">
            <div className="col-span-12 md:col-span-7">
              <p className="eyebrow label-mono">{s.label}</p>
              <h2 className="mt-3">{s.title}</h2>
              <p className="mt-5 max-w-xl">{s.intro}</p>
            </div>
            <div className="col-span-12 mt-6 md:col-span-5 md:mt-0">
              <AudioPlayer track={s.track} compact />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pkgs.filter((p) => p.line === s.id).map((p) => <PackageCard key={p.id} p={p} locale={locale} />)}
          </div>
        </Reveal>
      ))}

      <Reveal as="section" className="container-site pb-16">
        <p className="eyebrow label-mono mb-6">{c.addon}</p>
        <div className="grid gap-6 md:grid-cols-2">
          {addon.map((p) => <PackageCard key={p.id} p={p} locale={locale} />)}
        </div>
      </Reveal>

      <div className="container-site"><StringDivider /></div>

      <Reveal as="section" className="section container-site">
        <h2 className="mb-12">{c.rightsTitle}</h2>
        <div className="grid gap-6 md:grid-cols-3" role="table" aria-label={c.rightsAria}>
          {rights.map((r) => {
            const isDefault = "isDefault" in r && r.isDefault;
            return (
              <div key={r.id} role="row" className={cn("card-tremola p-8", isDefault && "border-muted-foreground")}>
                <p role="cell" className="label-mono text-muted-foreground">
                  {r.modifier === 0 ? c.basePrice : rightsLabel(r.modifier)}{isDefault ? ` · ${c.isDefault}` : ""}
                </p>
                <h3 role="cell" className="mt-3">{locale === "vi" ? rightsVi[r.id].name : r.name}</h3>
                <p role="cell" className="mt-3 text-small">{locale === "vi" ? rightsVi[r.id].text : r.text}</p>
              </div>
            );
          })}
        </div>
        <ul className="mt-12 space-y-2">
          {c.terms.map((t) => <li key={t} className="label-mono text-muted-foreground">· {t}</li>)}
        </ul>
      </Reveal>

      <div className="container-site"><StringDivider /></div>

      <Reveal as="section" className="section container-site grid-12">
        <h2 className="col-span-12 md:col-span-5">{c.whyFoundingTitle}</h2>
        <p className="col-span-12 md:col-span-7">
          {c.whyFounding(founding.total)}
        </p>
      </Reveal>

      <Reveal as="section" className="section container-site pt-0">
        <h2 className="mb-10">{c.faqTitle}</h2>
        <Accordion type="single" collapsible className="max-w-3xl">
          {c.faq.map((f, i) => (
            <AccordionItem key={f.q} value={`q${i}`} className="border-hairline">
              <AccordionTrigger className="py-6 text-body text-ivory hover:no-underline hover:text-body">{f.q}</AccordionTrigger>
              <AccordionContent className="pb-6 text-body">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>

      <section className="border-y border-hairline bg-surface">
        <div className="container-site flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between">
          <p className="font-display text-[32px] leading-tight text-ivory">{c.ctaTitle}</p>
          <Button asChild size="lg"><Link to={audit}>{c.cta}</Link></Button>
        </div>
      </section>
    </div>
  );
}
