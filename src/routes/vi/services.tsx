import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "@/components/services/ServicesPage";
import { pageHead } from "@/i18n";

export const Route = createFileRoute("/vi/services")({
  head: (ctx) => pageHead("vi", "services", ctx),
  component: () => <ServicesPage locale="vi" />,
});
