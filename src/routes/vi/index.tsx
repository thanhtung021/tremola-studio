import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home/HomePage";
import { pageHead } from "@/i18n";

export const Route = createFileRoute("/vi/")({
  head: (ctx) => pageHead("vi", "home", ctx),
  component: () => <HomePage locale="vi" />,
});
