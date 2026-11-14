import { instrumentImages } from "@/content/instrument-images";
import { responsiveImage } from "@/lib/utils";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { Reveal } from "@/components/brand/Reveal";
import { packCopy } from "@/content/forms";
import { homeContent } from "@/content/home";
import type { Locale } from "@/i18n";
import { PackForm } from "./PackForm";

export function FreePackPage({ locale }: { locale: Locale }) {
  const c = packCopy[locale];
  const instruments = homeContent[locale].instruments;
  return (
    <div className="container-site pb-32 pt-40">
      <Reveal eager>
        <p className="eyebrow label-mono">
          Tremola Studio · {locale === "vi" ? "Gói miễn phí" : "Free pack"}
        </p>
        <h1 className="mt-4 max-w-4xl">{c.title}</h1>
        <p className="mt-6 max-w-2xl">{c.intro}</p>
      </Reveal>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {instruments.map((i) => (
          <div key={i.name} className="card-tremola group overflow-hidden">
            <div className="relative aspect-[4/3] overflow-hidden bg-raised">
              <img
                src={instrumentImages[i.name]!}
                {...responsiveImage(instrumentImages[i.name]!)}
                sizes="(min-width: 640px) 50vw, 100vw"
                alt={`Placeholder · ${i.name}`}
                loading="lazy"
                width={1024}
                height={768}
                className="size-full object-cover transition-[transform,filter] duration-600 ease-tremola motion-safe:group-hover:scale-103 group-hover:brightness-105"
              />
              <span className="label-mono absolute left-3 top-3 bg-background/90 px-2 py-1">
                Placeholder
              </span>
            </div>
            <div className="p-6">
              <p className="font-display text-[28px] text-ivory">{i.name}</p>
              <p className="label-mono mb-4 text-muted-foreground">{i.desc}</p>
              <AudioPlayer track={{ ...i.track, id: `pack-${i.track.id}` }} compact />
            </div>
          </div>
        ))}
      </div>
      <div className="grid-12 mt-20">
        <div className="col-span-12 md:col-span-5">
          <h2 className="text-[28px]">{c.insideTitle}</h2>
          <ul className="mt-6 space-y-3">
            {c.inside.map((x) => (
              <li key={x} className="flex gap-3 text-small">
                <span aria-hidden className="text-muted-foreground">
                  —
                </span>
                {x}
              </li>
            ))}
          </ul>
          <p className="label-mono mt-10 text-muted-foreground">{c.licence}</p>
        </div>
        <div className="col-span-12 mt-10 md:col-span-6 md:col-start-7 md:mt-0">
          <PackForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
