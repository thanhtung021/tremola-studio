import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/brand/Reveal";
import { isAsianSignature, publishedWork } from "@/data/work";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { WorkCard } from "./WorkCard";
import { useLocale } from "@/i18n";

export const workFilters = [
  { key: "all", label: "All" },
  { key: "game", label: "Game Audio" },
  { key: "app", label: "Product & App Sound" },
  { key: "media", label: "Media" },
  { key: "asian", label: "Asian Signature" },
] as const;
export type WorkFilter = (typeof workFilters)[number]["key"];

export const normaliseFilter = (v: string): WorkFilter =>
  workFilters.find((f) => f.key === v)?.key ?? "all";

export function WorkListPage({
  line,
  setLine,
}: {
  line: WorkFilter;
  setLine: (l: WorkFilter) => void;
}) {
  const reduce = useReducedMotion();
  const { t } = useLocale();
  const items = publishedWork.filter((w) =>
    line === "all" ? true : line === "asian" ? isAsianSignature(w) : w.line === line,
  );
  return (
    <div className="container-site pb-32 pt-40">
      <Reveal eager>
        <h1>{t.pages.work}</h1>
        <p className="mt-6 max-w-2xl">{t.work.intro}</p>
      </Reveal>
      <div role="group" aria-label={t.work.filterLabel} className="mt-12 flex flex-wrap gap-2">
        {workFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={line === f.key}
            onClick={() => setLine(f.key)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-2 text-small transition-colors duration-250",
              line === f.key
                ? "border-muted-foreground bg-raised text-body"
                : "border-hairline text-body hover:border-muted-foreground hover:text-body",
            )}
          >
            {t.work.filters[f.key]}
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
        <LayoutGroup>
          <motion.ul layout className="mt-12 grid gap-6 md:grid-cols-2">
            {items.map((w, i) => (
              <motion.li
                key={w.slug}
                layout={!reduce}
                // Fade-in runs in CSS (.reveal-fade) so the first cover paints before hydration.
                initial={false}
                transition={{ duration: reduce ? 0.2 : 0.6, ease }}
                className={i === 0 ? "reveal-fade md:col-span-2" : "reveal-fade"}
              >
                <WorkCard work={w} featured={i === 0} priority={i === 0} headingLevel={2} />
              </motion.li>
            ))}
          </motion.ul>
        </LayoutGroup>
      )}
    </div>
  );
}
