import { Link } from "@tanstack/react-router";
import { useAudio } from "@/components/audio/AudioProvider";
import { PlayButton } from "@/components/audio/PlayButton";
import { kindBadge, lineLabels, localizeWork, type Work } from "@/data/work";
import { useLocale } from "@/i18n";
import { responsiveImage } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toTrack } from "./toTrack";

export function WorkCard({
  work,
  featured,
  priority,
  headingLevel = 3,
}: {
  work: Work;
  featured?: boolean;
  /** Above-the-fold card: load eagerly with high priority (LCP image). */
  priority?: boolean;
  /** 2 on pages without a section h2 above the cards (keeps heading order valid). Looks identical. */
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const { current, playing, toggle } = useAudio();
  const { locale } = useLocale();
  const w = localizeWork(work, locale);
  const track = w.heroTrack ? toTrack(w.slug, w.heroTrack, -1) : null;
  const on = !!track && current?.id === track.id && playing;
  const badge = kindBadge(w, locale);
  const linkProps =
    locale === "vi"
      ? ({ to: "/vi/work/$slug", params: { slug: w.slug } } as const)
      : ({ to: "/work/$slug", params: { slug: w.slug } } as const);
  return (
    <article data-audio-playing={on} className="card-tremola group h-full overflow-hidden">
      <div
        className={cn(
          "relative overflow-hidden bg-raised",
          featured ? "aspect-[21/9]" : "aspect-[16/10]",
        )}
      >
        {w.cover.type === "video" ? (
          <video
            src={w.cover.src}
            muted
            loop
            playsInline
            preload="none"
            aria-label={w.cover.alt}
            className="size-full object-cover transition-transform duration-600 ease-tremola group-hover:scale-103"
          />
        ) : (
          <img
            src={w.cover.src}
            {...responsiveImage(w.cover.src)}
            sizes={featured ? "100vw" : "(min-width: 768px) 50vw, 100vw"}
            alt={w.cover.alt}
            loading={priority ? "eager" : "lazy"}
            {...(priority ? { fetchPriority: "high" as const } : {})}
            width={1600}
            height={912}
            className="size-full object-cover transition-transform duration-600 ease-tremola group-hover:scale-103"
          />
        )}
        {w.cover.alt.startsWith("Placeholder") && (
          <span className="label-mono absolute left-4 top-4 rounded-full bg-background/70 px-3 py-1 text-muted-foreground">
            Placeholder
          </span>
        )}
        {badge && (
          <span className="label-mono absolute right-4 top-4 rounded-full border border-hairline-strong bg-background/70 px-3 py-1 text-ivory backdrop-blur-sm">
            {badge}
          </span>
        )}
        {track && (
          <PlayButton
            playing={on}
            onClick={() => toggle(track)}
            label={track.title}
            className="absolute bottom-4 left-4 bg-background/60 backdrop-blur-sm"
          />
        )}
      </div>
      <div className="p-6">
        <Heading
          className={cn(
            featured ? "text-[36px]" : "text-[28px]",
            headingLevel === 2 && "font-semibold leading-[1.2]",
          )}
        >
          <Link {...linkProps}>{w.title}</Link>
        </Heading>
        <p className="label-mono mt-2 text-muted-foreground">
          {lineLabels[w.line]} · {w.tags.join(" · ")}
        </p>
      </div>
    </article>
  );
}
