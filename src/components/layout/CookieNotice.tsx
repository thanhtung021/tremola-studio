import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n";
import { getConsent, setConsent } from "@/lib/track";

export function CookieNotice() {
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(getConsent() === null), []);
  if (!open) return null;
  const vi = locale === "vi";
  const choose = (v: "accepted" | "declined") => {
    setConsent(v);
    setOpen(false);
  };
  return (
    <div
      role="dialog"
      aria-label={vi ? "Cookie" : "Cookies"}
      className="fixed bottom-4 left-4 right-4 z-[60] max-w-md rounded-card border border-hairline bg-raised p-5 sm:right-auto"
    >
      <p className="text-small">
        {vi
          ? "Chúng tôi dùng cookie phân tích để hiểu cách mọi người tìm thấy Tremola Studio. Không có gì chạy trước khi bạn đồng ý."
          : "We use analytics cookies to understand how people find Tremola Studio. Nothing runs until you accept."}
      </p>
      <div className="mt-4 flex gap-3">
        <Button size="sm" onClick={() => choose("accepted")}>
          {vi ? "Đồng ý" : "Accept"}
        </Button>
        <Button size="sm" variant="ghostGold" onClick={() => choose("declined")}>
          {vi ? "Từ chối" : "Decline"}
        </Button>
      </div>
    </div>
  );
}
