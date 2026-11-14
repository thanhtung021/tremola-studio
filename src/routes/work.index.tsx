import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { normaliseFilter, WorkListPage } from "@/components/work/WorkListPage";
import { pageHead } from "@/i18n";

// Optional so the canonical /work URL renders directly (no redirect to ?line=all).
const search = z.object({ line: fallback(z.string(), "all").optional() });

export const Route = createFileRoute("/work/")({
  validateSearch: zodValidator(search),
  head: (ctx) => pageHead("en", "work", ctx),
  component: WorkRoute,
});

function WorkRoute() {
  const { line } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <WorkListPage
      line={normaliseFilter(line ?? "all")}
      setLine={(l) =>
        navigate({ search: l === "all" ? {} : { line: l }, replace: true, resetScroll: false })
      }
    />
  );
}
