import { createFileRoute } from "@tanstack/react-router";
import { SoundAuditPage } from "@/components/forms/SoundAuditPage";
import { pageHead } from "@/i18n";

export const Route = createFileRoute("/vi/sound-audit")({
  head: (ctx) => pageHead("vi", "audit", ctx),
  component: () => <SoundAuditPage locale="vi" />,
});
