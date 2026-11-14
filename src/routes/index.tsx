import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home/HomePage";
import { pageHead } from "@/i18n";

export const Route = createFileRoute("/")({
  head: (ctx) => pageHead("en", "home", ctx),
  component: () => <HomePage locale="en" />,
});
