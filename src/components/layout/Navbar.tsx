import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { TremolaLogo } from "@/components/brand/TremolaLogo";
import { Button } from "@/components/ui/button";
import { switchLocalePath, useLocale } from "@/i18n";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { routes } from "./nav";

export function Navbar() {
  const { locale, t, pathname } = useLocale();
  const r = routes[locale];
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 80);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const links = [
    { to: r.work, label: t.nav.work },
    { to: r.services, label: t.nav.services },
    { to: r.home, hash: "asian-signature", label: t.nav.asian },
    { to: r.about, label: t.nav.about },
  ] as const;

  const LangSwitch = ({ className }: { className?: string }) => (
    <div className={cn("label-mono flex items-center gap-2", className)} aria-label="Language">
      {(["en", "vi"] as const).map((l, i) => (
        <span key={l} className="flex items-center gap-2">
          {i > 0 && <span className="text-muted-foreground">|</span>}
          <a
            href={switchLocalePath(pathname, l)}
            hrefLang={l}
            aria-current={locale === l ? "true" : undefined}
            className={locale === l ? "text-ivory underline decoration-gold underline-offset-4" : "text-muted-foreground hover:text-ivory"}
          >
            {l.toUpperCase()}
          </a>
        </span>
      ))}
    </div>
  );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color] duration-250",
        scrolled || open ? "border-hairline bg-surface/85 backdrop-blur-md" : "border-transparent bg-transparent",
      )}
    >
      <nav className="container-site flex h-18 items-center gap-6">
        <Link to={r.home} className="flex items-center gap-3" aria-label="Tremola Studio, home">
          <TremolaLogo size={36} animated="hover" />
          <span className="font-display text-2xl font-medium tracking-[-0.01em] text-ivory">Tremola Studio</span>
        </Link>
        <ul className="ml-auto hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <li key={l.label}>
              <Link
                to={l.to}
                {...("hash" in l ? { hash: l.hash } : {})}
                className="text-small text-body transition-colors hover:text-ivory"
                activeProps={{ className: "text-ivory underline decoration-gold underline-offset-8" }}
                activeOptions={{ exact: true, includeHash: true }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <LangSwitch className="hidden lg:flex" />
        <Button asChild size="sm" className="hidden lg:inline-flex">
          <Link to={r.audit}>{t.nav.audit}</Link>
        </Button>
        <button
          type="button"
          className="ml-auto grid size-10 cursor-pointer place-items-center text-ivory lg:hidden"
          aria-expanded={open}
          aria-label={open ? t.nav.close : t.nav.menu}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-x-0 bottom-0 top-18 bg-background lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.ul
              className="container-site flex flex-col gap-6 pt-12"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            >
              {links.map((l) => (
                <motion.li
                  key={l.label}
                  variants={{
                    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.2 : 0.6, ease } },
                  }}
                >
                  <Link
                    to={l.to}
                    {...("hash" in l ? { hash: l.hash } : {})}
                    onClick={() => setOpen(false)}
                    className="font-display text-[40px] leading-none text-ivory"
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="flex flex-col gap-6 pt-6">
                <Button asChild size="lg" className="self-start">
                  <Link to={r.audit}>{t.nav.audit}</Link>
                </Button>
                <LangSwitch />
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
