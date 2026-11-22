import { Reveal } from "@/components/brand/Reveal";
import { listWork } from "@/data/work";
import { cn } from "@/lib/utils";
import { WorkCard } from "./WorkCard";
import { useLocale } from "@/i18n";

export const workFilters = ["all", "game", "app", "asian"] as const;
export type WorkFilter = (typeof workFilters)[number];

export const normaliseFilter = (v: string): WorkFilter => workFilters.find((f) => f === v) ?? "all";

export function WorkListPage({
  line,
  setLine,
}: {
  line: WorkFilter;
  setLine: (l: WorkFilter) => void;
}) {
  const { locale, t } = useLocale();
  const items = listWork(locale).filter((w) =>
    line === "all" ? true : line === "asian" ? w.asian : w.line === line,
  );
  return (
    <div className="container-site pb-32 pt-40">
      <Reveal eager>
        <h1>{t.work.heading}</h1>
        <p className="mt-6 max-w-2xl">{t.work.intro}</p>
      </Reveal>
      <div role="group" aria-label={t.work.filterLabel} className="mt-12 flex flex-wrap gap-2">
        {workFilters.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={line === f}
            onClick={() => setLine(f)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-2 text-small transition-colors duration-250",
              line === f
                ? "border-muted-foreground bg-raised text-body"
                : "border-hairline text-body hover:border-muted-foreground hover:text-body",
            )}
          >
            {t.work.filters[f]}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="card-tremola mt-12 p-10 text-center">
          <p className="text-ivory">{t.work.empty}</p>
          <button
            type="button"
            onClick={() => setLine("all")}
            className="link-draw mt-4 cursor-pointer text-small"
          >
            {t.work.seeAll}
          </button>
        </div>
      ) : (
        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {items.map((w, i) => (
            // Fade-in runs in CSS (.reveal-fade) so the first covers paint before hydration.
            <li key={w.slug} className="reveal-fade">
              <WorkCard work={w} priority={i < 2} headingLevel={2} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
