import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "@/components/services/ServicesPage";
import { pageHead } from "@/i18n";
import { faqJsonLd } from "@/content/services";

export const Route = createFileRoute("/vi/services")({
  head: (ctx) => ({ ...pageHead("vi", "services", ctx), scripts: [faqJsonLd("vi")] }),
  component: () => <ServicesPage locale="vi" />,
});
