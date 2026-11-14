import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { localeFromPath } from "../i18n";
import { getRequestOrigin } from "../lib/origin.functions";
import { getFounding } from "../lib/founding.functions";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { AudioProvider } from "../components/audio/AudioProvider";
import { MiniPlayer } from "../components/audio/MiniPlayer";
import { CookieNotice } from "../components/layout/CookieNotice";
import { captureAttribution } from "../lib/attribution";
import { initTracking, track } from "../lib/track";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async () => {
    // Canonical/OG/hreflang always use the configured public origin when set, so pages served from
    // workers.dev or redirect domains still point search engines at tremolastudio.com.
    const configured = (import.meta.env["VITE_SITE_URL"] as string | undefined)?.replace(
      /\/+$/,
      "",
    );
    const [origin, founding] = await Promise.all([
      configured || (typeof window !== "undefined" ? window.location.origin : getRequestOrigin()),
      getFounding(),
    ]);
    return { origin, founding };
  },
  staleTime: Infinity,
  head: ({ loaderData }) => ({
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Tremola Studio",
          slogan: "Sound with a soul of its own.",
          url: `${loaderData?.origin ?? ""}/`,
          logo: `${loaderData?.origin ?? ""}/apple-touch-icon.png`,
          // Placeholder: replace with the real profile URLs.
          sameAs: [
            "https://www.linkedin.com/company/placeholder-tremola-studio",
            "https://www.youtube.com/@placeholder-tremola-studio",
            "https://www.instagram.com/placeholder-tremola-studio",
            "https://www.tiktok.com/@placeholder-tremola-studio",
          ],
        }),
      },
    ],
    // Replace these placeholders with the app's name and description when first building the app.
    // Each content route, / included, must still set its own head(). Never add og:image or
    // twitter:image here: every page without its own would inherit the root's preview image.
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Tremola Studio · Sound for games & apps" },
      { name: "description", content: "Tremola gives games and apps a sound of their own." },
      { name: "author", content: "Tremola Studio" },
      { property: "og:title", content: "Tremola Studio · Sound for games & apps" },
      { property: "og:description", content: "Tremola gives games and apps a sound of their own." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#1f1a14" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=JetBrains+Mono:wght@400&display=swap&subset=vietnamese",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <html lang={localeFromPath(pathname)}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    captureAttribution();
    initTracking();
    // CTA clicks: any link to the audit or the free pack.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      const href = a?.getAttribute("href") ?? "";
      if (/\/(sound-audit|free-pack)$/.test(href)) {
        track("cta_click", {
          label: (a?.textContent ?? "").trim().slice(0, 80),
          page: window.location.pathname,
        });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <AudioProvider>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main">
          <Outlet />
        </main>
        <Footer />
        <MiniPlayer />
        <CookieNotice />
      </AudioProvider>
    </QueryClientProvider>
  );
}
