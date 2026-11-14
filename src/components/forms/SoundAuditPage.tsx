import { BeforeAfterPlayer } from "@/components/audio/BeforeAfterPlayer";
import { auditCopy } from "@/content/forms";
import { placeholderMedia } from "@/content/media";
import type { Locale } from "@/i18n";
import { AuditForm } from "./AuditForm";

export function SoundAuditPage({ locale }: { locale: Locale }) {
  const c = auditCopy[locale];
  return (
    <div className="container-site grid-12 pb-32 pt-40">
      <div className="col-span-12 lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <p className="eyebrow label-mono">Tremola Studio</p>
          <h1 className="mt-4">{c.title}</h1>
          <p className="mt-6">{c.intro}</p>
          <div className="mt-10">
            <p className="label-mono mb-3 text-muted-foreground">{c.sample}</p>
            <BeforeAfterPlayer
              placeholder
              video={placeholderMedia.video}
              poster={placeholderMedia.poster}
              before={placeholderMedia.before}
              after={placeholderMedia.after}
            />
          </div>
          <ul className="mt-8 space-y-2">
            {c.facts.map((f) => (
              <li key={f} className="label-mono text-muted-foreground">
                · {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="col-span-12 mt-12 lg:col-span-6 lg:col-start-7 lg:mt-0">
        <AuditForm locale={locale} />
      </div>
    </div>
  );
}
