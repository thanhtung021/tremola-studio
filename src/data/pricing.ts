/**
 * Package prices. Edit numbers here only — the Services page reads them.
 * `en` is in USD (international), `vi` is in VND (/vi/services).
 * `founding: null` means no founding discount for that item.
 */
export type Line = "game" | "app" | "media";
export type Package = {
  id: string;
  line: Line | "addon";
  name: string;
  includes: string[];
  listed: number | [number, number] | null; // null = "contact us"
  founding: number | null;
  note?: string;
};
export type Currency = "USD" | "VND";

type Price = { listed: Package["listed"]; founding: number | null };
type Key = "basic" | "indie" | "premium" | "uiKit" | "sonicId" | "suite" | "stinger" | "live";
/** What each package includes, per language. Product names stay in English. */
const includes: Record<"en" | "vi", Record<Key, string[]>> = {
  en: {
    basic: ["1 theme (2 min)", "2 loops", "30 SFX", "15 UI sounds"],
    indie: ["1 theme", "4 loops", "10–15 min of music", "80–100 SFX", "Full UI set"],
    premium: ["1 theme", "10 adaptive tracks", "300 SFX", "Full UI set"],
    uiKit: ["Up to 50 sounds", "Sound guideline"],
    sonicId: ["3 sonic logos", "UI sound kit", "Sound guideline"],
    suite: ["10 sonic logos", "UI sound kit", "Sound guideline", "3 music tracks"],
    stinger: ["3 sonic logos", "10 stingers"],
    live: ["Live đàn tranh, đàn nguyệt, sáo trúc or T'rưng"],
  },
  vi: {
    basic: ["1 nhạc chủ đề (2 phút)", "2 loop", "30 SFX", "15 UI sound"],
    indie: ["1 nhạc chủ đề", "4 loop", "10–15 phút nhạc", "80–100 SFX", "Trọn bộ UI sound"],
    premium: ["1 nhạc chủ đề", "10 track adaptive", "300 SFX", "Trọn bộ UI sound"],
    uiKit: ["Tối đa 50 âm thanh", "Sound guideline"],
    sonicId: ["3 sonic logo", "UI sound kit", "Sound guideline"],
    suite: ["10 sonic logo", "UI sound kit", "Sound guideline", "3 bản nhạc"],
    stinger: ["3 sonic logo", "10 stinger"],
    live: ["Thu trực tiếp đàn tranh, đàn nguyệt, sáo trúc hoặc T'rưng"],
  },
};
const liveNote = {
  en: "Per track, no discount: players and studio are paid in full.",
  vi: "Tính theo track, không giảm giá: nghệ nhân và phòng thu được trả đủ.",
};

const packages = (l: "en" | "vi", p: Record<Key, Price>): Package[] => {
  const inc = includes[l];
  return [
    { id: "basic", line: "game", name: "Basic Pack", includes: inc.basic, ...p.basic },
    { id: "indie", line: "game", name: "Indie Full Score", includes: inc.indie, ...p.indie },
    {
      id: "premium",
      line: "game",
      name: "Premium Score Pack",
      includes: inc.premium,
      ...p.premium,
    },
    { id: "ui-kit", line: "app", name: "UI Sound Kit Pro", includes: inc.uiKit, ...p.uiKit },
    {
      id: "sonic-identity",
      line: "app",
      name: "Sonic Identity",
      includes: inc.sonicId,
      ...p.sonicId,
    },
    { id: "brand-suite", line: "app", name: "Brand Sound Suite", includes: inc.suite, ...p.suite },
    {
      id: "stinger",
      line: "media",
      name: "Sonic Identity & Stinger",
      includes: inc.stinger,
      ...p.stinger,
    },
    {
      id: "live-recording",
      line: "addon",
      name: "Live Asian Recording",
      includes: inc.live,
      note: liveNote[l],
      ...p.live,
    },
  ];
};

export const pricing: Record<"en" | "vi", { currency: Currency; packages: Package[] }> = {
  en: {
    currency: "USD",
    packages: packages("en", {
      basic: { listed: 550, founding: 200 },
      indie: { listed: 1800, founding: 500 },
      premium: { listed: 4500, founding: 999 },
      uiKit: { listed: 400, founding: 100 },
      sonicId: { listed: 1000, founding: 300 },
      suite: { listed: 2500, founding: 800 },
      stinger: { listed: 800, founding: 500 },
      live: { listed: [300, 600], founding: null },
    }),
  },
  vi: {
    currency: "VND",
    packages: packages("vi", {
      basic: { listed: 7_000_000, founding: 2_000_000 },
      indie: { listed: 20_000_000, founding: 5_000_000 },
      premium: { listed: 50_000_000, founding: 12_000_000 },
      uiKit: { listed: 5_000_000, founding: 1_000_000 },
      sonicId: { listed: 12_000_000, founding: 3_000_000 },
      suite: { listed: 30_000_000, founding: 8_000_000 },
      stinger: { listed: 10_000_000, founding: 5_000_000 },
      live: { listed: null, founding: null },
    }),
  },
};

/** Rights options, as a change to the base (exclusive) price. */
export const rights = [
  {
    id: "non-exclusive",
    name: "Non-exclusive",
    modifier: -0.2,
    text: "Tremola Studio keeps the rights and may license the sounds again.",
  },
  {
    id: "exclusive",
    name: "Exclusive",
    modifier: 0,
    text: "Yours to use exclusively, forever, in your product.",
    isDefault: true,
  },
  { id: "buyout", name: "Full buyout", modifier: 0.5, text: "All rights transferred to you." },
] as const;

/** Vietnamese names and text for the rights options, keyed by id. */
export const rightsVi: Record<(typeof rights)[number]["id"], { name: string; text: string }> = {
  "non-exclusive": {
    name: "Không độc quyền",
    text: "Tremola Studio giữ quyền và có thể cấp phép lại các âm thanh này.",
  },
  exclusive: {
    name: "Độc quyền",
    text: "Bạn được dùng độc quyền, vĩnh viễn, trong sản phẩm của mình.",
  },
  buyout: { name: "Mua đứt", text: "Toàn bộ quyền được chuyển giao cho bạn." },
};

export function formatPrice(amount: number, currency: Currency) {
  if (currency === "VND") return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}đ`;
  return `$${amount.toLocaleString("en-US")}`;
}

export function formatListed(p: Package, currency: Currency) {
  if (p.listed === null) return currency === "VND" ? "Liên hệ" : "Contact us";
  if (Array.isArray(p.listed))
    return `${formatPrice(p.listed[0], currency)}–${formatPrice(p.listed[1], currency)}`;
  return formatPrice(p.listed, currency);
}

/** Founding price shows only while slots remain and the item has one. */
export const showFounding = (p: Package, remaining: number) => remaining > 0 && p.founding !== null;

export const rightsLabel = (m: number) =>
  m === 0 ? "Base price" : `${m > 0 ? "+" : "−"}${Math.abs(m * 100)}%`;
