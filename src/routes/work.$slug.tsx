import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { DemoPage } from "@/components/work/DemoPage";
import { getWork } from "@/data/work";
import { originFrom } from "@/i18n";
import { demoHead } from "@/components/work/demo-head";

const LOCALE = "en" as const;

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    const w = getWork(params.slug, LOCALE);
    if (!w) throw notFound();
    return {
      slug: w.slug,
      title: w.title,
      seoTitle: w.seoTitle,
      summary: w.summary,
      cover: w.cover,
      video: w.video.src,
      seconds: Math.round(w.video.duration),
    };
  },
  head: ({ loaderData, matches }) =>
    demoHead(loaderData, originFrom({ matches }), LOCALE, {
      title: "Project not found",
      description: "This project could not be found.",
    }),
  component: DemoRoute,
  notFoundComponent: () => (
    <div className="container-site pb-32 pt-40">
      <h1>Project not found</h1>
      <Link to="/work" className="link-draw mt-6 inline-block">
        See all work
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="container-site pb-32 pt-40">
      <h1>This project didn't load</h1>
    </div>
  ),
});

function DemoRoute() {
  const { slug } = Route.useLoaderData();
  return <DemoPage work={getWork(slug, LOCALE)!} />;
}
