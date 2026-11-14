import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/components/about/AboutPage";
import { pageHead } from "@/i18n";

export const Route = createFileRoute("/about")({
  head: (ctx) => pageHead("en", "about", ctx),
  component: () => <AboutPage locale="en" />,
});
