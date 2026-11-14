import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/components/about/AboutPage";
import { pageHead } from "@/i18n";

export const Route = createFileRoute("/vi/about")({
  head: (ctx) => pageHead("vi", "about", ctx),
  component: () => <AboutPage locale="vi" />,
});
