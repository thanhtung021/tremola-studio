import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CaseStudy } from "@/components/work/CaseStudy";
import { getWork, localizeWork } from "@/data/work";
import { alternateLinks, originFrom } from "@/i18n";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    const w = getWork(params.slug);
    if (!w) throw notFound();
    const l = localizeWork(w, "en");
    return { slug: w.slug, title: l.title, summary: l.summary };
  },
  head: ({ loaderData, matches }) => {
    const origin = originFrom({ matches });
    const title = loaderData
      ? `${loaderData.title} · Tremola Studio`
      : "Project not found · Tremola Studio";
    const description = loaderData?.summary ?? "This project could not be found.";
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
      links: loaderData ? alternateLinks("en", `/work/${loaderData.slug}`, origin) : [],
    };
  },
  component: CaseRoute,
  notFoundComponent: () => (
    <div className="container-site pb-32 pt-40">
      <h1>Project not found</h1>
      <Link to="/work" search={{ line: "all" }} className="link-draw mt-6 inline-block">
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

function CaseRoute() {
  const { slug } = Route.useLoaderData();
  return <CaseStudy work={localizeWork(getWork(slug)!, "en")} />;
}
