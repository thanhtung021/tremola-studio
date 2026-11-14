import { createFileRoute } from "@tanstack/react-router";
import { SoundAuditPage } from "@/components/forms/SoundAuditPage";
import { pageHead } from "@/i18n";

export const Route = createFileRoute("/sound-audit")({
  head: (ctx) => pageHead("en", "audit", ctx),
  component: () => <SoundAuditPage locale="en" />,
});
