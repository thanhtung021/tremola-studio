import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { creditLabels, lineLabels, type Work } from "@/data/work";
import { useLocale } from "@/i18n";
import { cn, responsiveImage } from "@/lib/utils";

/** Portfolio card: poster, credit badge, duration; the whole card links to the demo page. */
export function WorkCard({
  work: w,
  priority,
  headingLevel = 3,
  sizes = "(min-width: 768px) 50vw, 100vw",
}: {
  work: Work;
  /** Above-the-fold card: load eagerly with high priority (LCP image). */
  priority?: boolean;
  /** 2 on pages without a section h2 above the cards (keeps heading order valid). Looks identical. */
  headingLevel?: 2 | 3;
  sizes?: string;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const { locale, t } = useLocale();
  const linkProps =
    locale === "vi"
      ? ({ to: "/vi/work/$slug", params: { slug: w.slug } } as const)
      : ({ to: "/work/$slug", params: { slug: w.slug } } as const);
  return (
    <article className="card-tremola group relative h-full overflow-hidden">
      <div className="relative aspect-video overflow-hidden bg-raised">
        <img
          src={w.cover}
          {...responsiveImage(w.cover)}
          sizes={sizes}
          alt=""
          loading={priority ? "eager" : "lazy"}
          {...(priority ? { fetchPriority: "high" as const } : {})}
          width={1600}
          height={900}
          className="size-full object-cover transition-transform duration-600 ease-tremola motion-safe:group-hover:scale-103"
        />
        <span className="label-mono absolute right-4 top-4 rounded-full border border-hairline-strong bg-background/70 px-3 py-1 text-ivory backdrop-blur-sm">
          {creditLabels[locale][w.credit]}
        </span>
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-hairline-strong bg-background/60 text-gold backdrop-blur-sm transition-colors duration-250 group-hover:bg-background/80"
        >
          <Play className="size-5 translate-x-px fill-current" />
        </span>
        <span className="label-mono absolute bottom-4 right-4 rounded-full bg-background/70 px-3 py-1 text-ivory backdrop-blur-sm">
          {w.video.durationLabel}
        </span>
      </div>
      <div className="p-6">
        <Heading className={cn("text-[26px] leading-[1.2]", headingLevel === 2 && "font-semibold")}>
          <Link
            {...linkProps}
            aria-label={`${t.work.play}: ${w.title}`}
            className="after:absolute after:inset-0"
          >
            {w.title}
          </Link>
        </Heading>
        <p className="label-mono mt-2 text-muted-foreground">
          {lineLabels[locale][w.line]} · {w.genre}
        </p>
      </div>
    </article>
  );
}
