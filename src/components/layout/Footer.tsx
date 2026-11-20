import { Link } from "@tanstack/react-router";
import { TremolaLogo } from "@/components/brand/TremolaLogo";
import { contact } from "@/config/contact";
import { useLocale } from "@/i18n";
import { routes } from "./nav";

const socials = ["LinkedIn", "YouTube", "TikTok", "Instagram"];

export function Footer() {
  const { locale, t } = useLocale();
  const r = routes[locale];
  const pages = [
    { to: r.work, label: t.pages.work },
    { to: r.services, label: t.pages.services },
    { to: r.audit, label: t.pages.audit },
    { to: r.freePack, label: t.pages.freePack },
    { to: r.about, label: t.pages.about },
  ];
  return (
    <footer className="lacquer-footer border-t border-hairline">
      <div className="container-site grid-12 py-20">
        <div className="col-span-12 md:col-span-5">
          <TremolaLogo size={48} />
          <p className="mt-5 text-small text-ivory">{t.footer.descriptor}</p>
          <p className="mt-3 font-display text-[28px] italic leading-tight text-ivory">
            {t.footer.tagline}
          </p>
        </div>
        <div className="col-span-6 md:col-span-2">
          <p className="label-mono mb-4 text-muted-foreground">{t.footer.pages}</p>
          <ul className="space-y-2 text-small">
            {pages.map((p) => (
              <li key={p.to}>
                <Link to={p.to} className="link-draw">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-6 md:col-span-2">
          <p className="label-mono mb-4 text-muted-foreground">{t.footer.social}</p>
          <ul className="space-y-2 text-small">
            {socials.map((s) => (
              <li key={s}>
                <a href="#" className="link-draw">
                  {s}
                </a>{" "}
                <span className="label-mono text-muted-foreground">Placeholder</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-12 md:col-span-3">
          <p className="label-mono mb-4 text-muted-foreground">{t.footer.contact}</p>
          <ul className="space-y-2 text-small text-ivory">
            {contact.emails.map((email) => (
              <li key={email}>
                <a href={`mailto:${email}`} className="link-draw">
                  {email}
                </a>
              </li>
            ))}
            <li>
              <a href={`tel:${contact.phone}`} className="link-draw">
                {contact.phoneDisplay}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-site border-t border-hairline py-6">
        <p className="label-mono text-muted-foreground">
          © {new Date().getFullYear()} Tremola Studio. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
