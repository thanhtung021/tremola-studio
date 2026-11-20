import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { DemoPage } from "@/components/work/DemoPage";
import { getWork } from "@/data/work";
import { originFrom } from "@/i18n";
import { demoHead } from "@/components/work/demo-head";

const LOCALE = "vi" as const;

export const Route = createFileRoute("/vi/work/$slug")({
  loader: ({ params }) => {
    const w = getWork(params.slug, LOCALE);
    if (!w) throw notFound();
    return {
      slug: w.slug,
      title: w.title,
      summary: w.summary,
      cover: w.cover,
      video: w.video.src,
      seconds: Math.round(w.video.duration),
    };
  },
  head: ({ loaderData, matches }) =>
    demoHead(loaderData, originFrom({ matches }), LOCALE, {
      title: "Không tìm thấy dự án",
      description: "Không tìm thấy dự án này.",
    }),
  component: DemoRoute,
  notFoundComponent: () => (
    <div className="container-site pb-32 pt-40">
      <h1>Không tìm thấy dự án</h1>
      <Link to="/vi/work" className="link-draw mt-6 inline-block">
        Xem tất cả dự án
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="container-site pb-32 pt-40">
      <h1>Không tải được dự án này</h1>
    </div>
  ),
});

function DemoRoute() {
  const { slug } = Route.useLoaderData();
  return <DemoPage work={getWork(slug, LOCALE)!} />;
}
