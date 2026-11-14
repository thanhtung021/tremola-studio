import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { normaliseFilter, WorkListPage } from "@/components/work/WorkListPage";
import { pageHead } from "@/i18n";

const search = z.object({ line: fallback(z.string(), "all").default("all") });

export const Route = createFileRoute("/vi/work/")({
  validateSearch: zodValidator(search),
  head: (ctx) => pageHead("vi", "work", ctx),
  component: WorkRoute,
});

function WorkRoute() {
  const { line } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <WorkListPage
      line={normaliseFilter(line)}
      setLine={(l) => navigate({ search: { line: l }, replace: true, resetScroll: false })}
    />
  );
}
