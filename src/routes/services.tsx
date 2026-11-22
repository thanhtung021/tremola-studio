import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "@/components/services/ServicesPage";
import { pageHead } from "@/i18n";
import { faqJsonLd } from "@/content/services";

export const Route = createFileRoute("/services")({
  head: (ctx) => ({ ...pageHead("en", "services", ctx), scripts: [faqJsonLd("en")] }),
  component: () => <ServicesPage locale="en" />,
});
