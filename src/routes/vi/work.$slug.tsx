import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CaseStudy } from "@/components/work/CaseStudy";
import { getWork, localizeWork } from "@/data/work";
import { alternateLinks, originFrom } from "@/i18n";

export const Route = createFileRoute("/vi/work/$slug")({
  loader: ({ params }) => {
    const w = getWork(params.slug);
    if (!w) throw notFound();
    const l = localizeWork(w, "vi");
    return { slug: w.slug, title: l.title, summary: l.summary };
  },
  head: ({ loaderData, matches }) => {
    const origin = originFrom({ matches });
    const title = loaderData
      ? `${loaderData.title} · Tremola Studio`
      : "Không tìm thấy dự án · Tremola Studio";
    const description = loaderData?.summary ?? "Không tìm thấy dự án này.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData && origin
          ? [
              { property: "og:image", content: `${origin}/og-image.png` },
              { name: "twitter:image", content: `${origin}/og-image.png` },
            ]
          : []),
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      links: loaderData ? alternateLinks("vi", `/work/${loaderData.slug}`, origin) : [],
    };
  },
  component: CaseRoute,
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

function CaseRoute() {
  const { slug } = Route.useLoaderData();
  return <CaseStudy work={localizeWork(getWork(slug)!, "vi")} />;
}
