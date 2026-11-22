import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/admin/AdminPage";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin | Tremola Studio" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  // Auth state lives in the browser (Supabase session), so the admin UI renders on the client only.
  ssr: false,
  component: AdminPage,
});
