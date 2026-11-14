import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "@/components/services/ServicesPage";
import { pageHead } from "@/i18n";

export const Route = createFileRoute("/services")({
  head: (ctx) => pageHead("en", "services", ctx),
  component: () => <ServicesPage locale="en" />,
});
