/**
 * Portfolio content. Add a project by adding an object below.
 * Only items with status "published" appear on the site. Real numbers only in `results`.
 */
import calmLedger from "@/assets/work/calm-ledger.jpg";
import lanternValley from "@/assets/work/lantern-valley.jpg";
import moonLute from "@/assets/work/moon-lute-duel.jpg";
import stick from "@/assets/work/stick.jpg";
import { placeholderMedia } from "@/content/media";

export type WorkTrack = { title: string; src: string; duration: string; instruments?: string[]; peaks?: number[] };
export type Work = {
  slug: string;
  title: string;
  client?: string;
  kind: "client" | "concept" | "personal";
  line: "game" | "app" | "media";
  tags: string[];
  year: number;
  platform?: string;
  role: string;
  cover: { type: "image" | "video"; src: string; alt: string };
  heroTrack?: WorkTrack;
  beforeAfter?: { video: string; beforeAudio: string; afterAudio: string };
  summary: string;
  challenge: string;
  direction: string;
  system: { music?: WorkTrack[]; sfx?: WorkTrack[]; ui?: WorkTrack[] };
  integration?: string[];
  results?: { label: string; value: string }[];
  credits?: string[];
  status: "draft" | "published";
  /** Vietnamese text for /vi pages. Missing fields fall back to English. */
  vi?: Partial<Pick<Work, "title" | "role" | "summary" | "challenge" | "direction" | "tags">>;
};

/** Vietnamese instruments — used for the "Asian Signature" filter and the instrument pills. */
export const vietnameseInstruments = ["Đàn tranh", "Đàn nguyệt", "Sáo trúc", "T'rưng", "Đàn bầu", "Đàn tỳ bà"];

const ph = (title: string, instruments?: string[]): WorkTrack => ({
  title: `${title} (Placeholder)`,
  src: placeholderMedia.after,
  duration: "0:24",
  ...(instruments ? { instruments } : {}),
});
const phBeforeAfter = { video: placeholderMedia.video, beforeAudio: placeholderMedia.before, afterAudio: placeholderMedia.after };

const work: Work[] = [
  {
    slug: "stick-english-learning-app",
    title: "Stick — English learning app",
    kind: "personal",
    line: "app",
    tags: ["UI sound", "Sonic logo", "Sound guideline"],
    year: 2026,
    platform: "iOS · Android",
    role: "Sonic logo, UI sound kit, sound guideline",
    cover: { type: "image", src: stick, alt: "Placeholder cover: a bamboo stick between golden sound waves" },
    heroTrack: ph("Stick sonic logo"),
    summary:
      "A full sound identity for Stick, a Vietnamese English-learning app: sonic logo, UI sound kit and a guideline the dev team ships from.",
    challenge: "Placeholder — the challenge for Stick.",
    direction: "Placeholder — motif, instruments and palette for Stick.",
    system: { ui: [ph("Correct answer"), ph("Streak kept"), ph("Lesson complete")], music: [ph("Sonic logo")] },
    integration: ["iOS", "Android"],
    credits: ["Placeholder credit"],
    vi: {
      title: "Stick — ứng dụng học tiếng Anh",
      role: "Sonic logo, UI sound kit, sound guideline",
      summary: "Bộ nhận diện âm thanh trọn vẹn cho Stick, ứng dụng học tiếng Anh của Việt Nam: sonic logo, UI sound kit và guideline để đội dev triển khai.",
      challenge: "Placeholder — thách thức của Stick.",
      direction: "Placeholder — motif, nhạc cụ và bảng âm sắc cho Stick.",
    },
    status: "published",
  },
  {
    slug: "lantern-valley",
    title: "Lantern Valley — cozy RPG main theme",
    kind: "concept",
    line: "game",
    tags: ["Main theme", "Adaptive music", "Đàn tranh"],
    year: 2026,
    platform: "PC · Switch",
    role: "Music",
    cover: { type: "image", src: lanternValley, alt: "Placeholder cover: a lantern-lit valley at night" },
    heroTrack: ph("Lantern Valley main theme", ["Đàn tranh", "Strings"]),
    beforeAfter: phBeforeAfter,
    summary: "Placeholder — a warm main theme for a cozy RPG, carried by đàn tranh and strings.",
    challenge: "Placeholder — the challenge for Lantern Valley.",
    direction: "Placeholder — motif and palette. Instruments: Đàn tranh, Strings.",
    system: { music: [ph("Main theme", ["Đàn tranh", "Strings"]), ph("Village at dusk")], sfx: [ph("Lantern lit")] },
    integration: ["FMOD", "Unity"],
    vi: {
      title: "Lantern Valley — nhạc chủ đề cho game RPG cozy",
      role: "Âm nhạc",
      tags: ["Nhạc chủ đề", "Nhạc adaptive", "Đàn tranh"],
      summary: "Placeholder — nhạc chủ đề ấm áp cho một game RPG cozy, dẫn dắt bởi đàn tranh và dàn dây.",
      challenge: "Placeholder — thách thức của Lantern Valley.",
      direction: "Placeholder — motif và bảng âm sắc. Nhạc cụ: đàn tranh, dàn dây.",
    },
    status: "published",
  },
  {
    slug: "moon-lute-duel",
    title: "Moon Lute Duel — adaptive boss music",
    kind: "concept",
    line: "game",
    tags: ["Adaptive music", "Đàn nguyệt", "Percussion"],
    year: 2026,
    platform: "PC",
    role: "Adaptive music, SFX",
    cover: { type: "image", src: moonLute, alt: "Placeholder cover: a moon lute under a crescent moon" },
    heroTrack: ph("Moon Lute Duel, full intensity", ["Đàn nguyệt", "Percussion"]),
    beforeAfter: phBeforeAfter,
    summary: "Placeholder — boss music in three intensity layers, led by the đàn nguyệt.",
    challenge: "Placeholder — the challenge for Moon Lute Duel.",
    direction: "Placeholder — motif and palette. Instruments: Đàn nguyệt, Percussion. 3 intensity layers.",
    system: {
      music: [ph("Layer 1 · Calm"), ph("Layer 2 · Tension"), ph("Layer 3 · Full duel")],
      sfx: [ph("Lute strike"), ph("Phase change")],
    },
    integration: ["Wwise", "Unreal"],
    vi: {
      title: "Moon Lute Duel — nhạc boss adaptive",
      role: "Nhạc adaptive, SFX",
      tags: ["Nhạc adaptive", "Đàn nguyệt", "Bộ gõ"],
      summary: "Placeholder — nhạc trận boss với ba lớp cường độ, dẫn dắt bởi đàn nguyệt.",
      challenge: "Placeholder — thách thức của Moon Lute Duel.",
      direction: "Placeholder — motif và bảng âm sắc. Nhạc cụ: đàn nguyệt, bộ gõ. 3 lớp cường độ.",
    },
    status: "published",
  },
  {
    slug: "calm-ledger",
    title: "Calm Ledger — fintech UI sound kit",
    kind: "concept",
    line: "app",
    tags: ["UI sound", "Sonic logo"],
    year: 2026,
    platform: "iOS · Android · Web",
    role: "Sonic logo, UI sound",
    cover: { type: "image", src: calmLedger, alt: "Placeholder cover: soft gold interface shapes" },
    heroTrack: ph("Calm Ledger sonic logo"),
    summary: "Placeholder — a calm UI sound kit and sonic logo for a fintech app.",
    challenge: "Placeholder — the challenge for Calm Ledger.",
    direction: "Placeholder — motif, instruments and palette for Calm Ledger.",
    system: { ui: [ph("Payment sent"), ph("Balance updated"), ph("Error, gentle")], music: [ph("Sonic logo")] },
    integration: ["iOS", "Android"],
    vi: {
      title: "Calm Ledger — UI sound kit cho ứng dụng fintech",
      summary: "Placeholder — UI sound kit và sonic logo nhẹ nhàng cho một ứng dụng fintech.",
      challenge: "Placeholder — thách thức của Calm Ledger.",
      direction: "Placeholder — motif, nhạc cụ và bảng âm sắc cho Calm Ledger.",
    },
    status: "published",
  },
];

export const publishedWork = work.filter((w) => w.status === "published");
export const getWork = (slug: string) => publishedWork.find((w) => w.slug === slug);

export const isAsianSignature = (w: Work) =>
  w.tags.some((t) => vietnameseInstruments.includes(t)) ||
  Object.values(w.system).some((ts) => ts?.some((t) => t.instruments?.some((i) => vietnameseInstruments.includes(i))));

export const lineLabels: Record<Work["line"], string> = { game: "Game Audio", app: "Product & App Sound", media: "Media" };
export const kindBadge = (w: Work, locale: "en" | "vi" = "en") =>
  w.kind === "concept"
    ? locale === "vi" ? "Original concept · Ý tưởng gốc" : "Original concept"
    : w.kind === "personal"
      ? locale === "vi" ? "Dự án của studio" : "Studio project"
      : null;

/** Work text in the page language (Vietnamese falls back to English per field). */
export const localizeWork = (w: Work, locale: "en" | "vi"): Work => (locale === "vi" && w.vi ? { ...w, ...w.vi } : w);
