import { createFileRoute } from "@tanstack/react-router";
import { FreePackPage } from "@/components/forms/FreePackPage";
import { pageHead } from "@/i18n";

export const Route = createFileRoute("/free-pack")({
  head: (ctx) => pageHead("en", "freePack", ctx),
  component: () => <FreePackPage locale="en" />,
});
