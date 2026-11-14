import { createFileRoute } from "@tanstack/react-router";
import { FreePackPage } from "@/components/forms/FreePackPage";
import { pageHead } from "@/i18n";

export const Route = createFileRoute("/vi/free-pack")({
  head: (ctx) => pageHead("vi", "freePack", ctx),
  component: () => <FreePackPage locale="vi" />,
});
