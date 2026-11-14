import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { BeforeAfterPlayer } from "@/components/audio/BeforeAfterPlayer";
import { Reveal } from "@/components/brand/Reveal";
import { StringDivider } from "@/components/brand/StringDivider";
import { TremolaLogo } from "@/components/brand/TremolaLogo";
import { Button } from "@/components/ui/button";
import { placeholderMedia, placeholderTrack } from "@/content/media";

export const Route = createFileRoute("/styleguide")({
  head: () => ({
    meta: [
      { title: "Styleguide · Tremola Studio" },
      { name: "description", content: "Internal review of the Tremola Studio design system." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Styleguide · Tremola Studio" },
      {
        property: "og:description",
        content: "Internal review of the Tremola Studio design system.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Styleguide,
});

const swatches = [
  ["Night wood", "#1f1a14", "bg-background"],
  ["Surface", "#282119", "bg-surface"],
  ["Raised", "#322a20", "bg-raised"],
  ["Bronze gold", "#c9a45c", "bg-gold"],
  ["Gold hover", "#d6b56f", "bg-gold-hover"],
  ["Ivory gold", "#e6cf9a", "bg-ivory"],
  ["Body text", "#cdbfa3", "bg-body"],
  ["Muted text", "#9a8d74", "bg-muted-foreground"],
  ["Hairline", "gold 18%", "bg-hairline"],
] as const;

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal as="section" className="py-16">
      <p className="label-mono mb-6 text-muted-foreground">{title}</p>
      {children}
    </Reveal>
  );
}

function Styleguide() {
  const [replay, setReplay] = useState(0);
  return (
    <div className="container-site pb-24 pt-32">
      <h1>Tremola Studio styleguide</h1>
      <p className="mt-4 max-w-2xl">
        Every token and component of the foundation, for review. Not linked from the menu.
      </p>

      <Block title="Colors">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {swatches.map(([n, v, c]) => (
            <div key={n} className="card-tremola overflow-hidden">
              <div className={`h-20 border-b border-hairline ${c}`} />
              <div className="p-3">
                <p className="text-small text-ivory">{n}</p>
                <p className="label-mono text-muted-foreground">{v}</p>
              </div>
            </div>
          ))}
        </div>
      </Block>
      <StringDivider />

      <Block title="Typography">
        <h1>Sound with a soul of its own.</h1>
        <h2 className="mt-6">Âm thanh có hồn riêng.</h2>
        <h3 className="mt-6">H3 · Đàn tranh, đàn nguyệt, sáo trúc</h3>
        <p className="mt-6 max-w-2xl">
          Body 17/1.65 · Be Vietnam Pro. Tremola gives games and apps a sound of their own. Tiếng
          Việt: đ ư ơ ả ỗ ặ ữ.
        </p>
        <p className="text-small mt-3">Small 14px · Đàn nguyệt, T'rưng.</p>
        <p className="label-mono mt-3 text-muted-foreground">
          0:24 · 92 BPM · Wwise · FMOD · đ ư ơ ả ỗ
        </p>
        <p className="mt-6 font-display text-[28px] italic text-ivory">
          Cormorant italic · đ ư ơ ả ỗ
        </p>
      </Block>
      <StringDivider />

      <Block title="Buttons and links">
        <div className="flex flex-wrap items-center gap-6">
          <Button size="lg">Free Sound Audit</Button>
          <Button>Primary</Button>
          <Button variant="ghostGold">Ghost</Button>
          <a href="#" className="link-draw">
            Text link
          </a>
        </div>
      </Block>
      <StringDivider />

      <Block title="Cards">
        <div className="grid gap-6 md:grid-cols-3">
          {["Game Audio", "Product & App Sound", "Media"].map((s) => (
            <div key={s} className="card-tremola p-8">
              <p className="label-mono text-muted-foreground">{s}</p>
              <h3 className="mt-3">Card title</h3>
              <p className="mt-3 text-small">
                Hover for the gold border and inner glow. Placeholder
              </p>
            </div>
          ))}
        </div>
      </Block>
      <StringDivider />

      <Block title="Logo">
        <div className="flex flex-wrap items-end gap-12">
          <div className="text-center">
            <TremolaLogo key={replay} size={160} animated="intro" />
            <Button
              variant="textLink"
              className="mt-4"
              onClick={() => {
                sessionStorage.removeItem("tremola-intro-played");
                setReplay((r) => r + 1);
              }}
            >
              Replay intro
            </Button>
          </div>
          <div>
            <TremolaLogo size={64} animated="hover" />
            <p className="label-mono mt-3 text-muted-foreground">Hover: pluck</p>
          </div>
          <div>
            <TremolaLogo size={64} withTile />
            <p className="label-mono mt-3 text-muted-foreground">With tile</p>
          </div>
          <div>
            <TremolaLogo size={32} />
            <p className="label-mono mt-3 text-muted-foreground">32px</p>
          </div>
        </div>
      </Block>

      <Block title="String divider · hover it">
        <StringDivider />
      </Block>

      <Block title="Audio player">
        <div className="card-tremola max-w-xl space-y-6 p-6">
          <AudioPlayer track={placeholderTrack("sg-1", "Moon lute motif")} />
          <AudioPlayer
            track={{ ...placeholderTrack("sg-2", "Before tone"), src: placeholderMedia.before }}
            compact
          />
        </div>
      </Block>

      <Block title="Before / after player">
        <BeforeAfterPlayer
          placeholder
          video={placeholderMedia.video}
          before={placeholderMedia.before}
          after={placeholderMedia.after}
        />
      </Block>
    </div>
  );
}
