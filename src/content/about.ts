import type { Locale } from "@/i18n";

export type LogoPart = "moon" | "bamboo" | "together" | "ring";

/** About page copy per locale. Founder fields are placeholders until the real details arrive. */
const en = {
  eyebrow: "Tremola Studio · About",
  title: "A composer-led studio from Vietnam.",
  nameTitle: "The name",
  name: [
    { word: "Tre", text: "Bamboo, the material of Vietnamese instruments." },
    { word: "Tremolo", text: "The trembling-string technique of the đàn tranh and đàn nguyệt." },
    { word: "-la", text: "The note A." },
  ],
  nameNote: "In Italian, tremola means \u201Cit trembles\u201D.",
  logoTitle: "The logo",
  logo: [
    { part: "moon", text: "The crescent moon — the body of the đàn nguyệt." },
    { part: "bamboo", text: "The bamboo stem — and a string that trembles." },
    { part: "together", text: "Together — a lowercase a, for audio." },
    { part: "ring", text: "The circle — one complete sound system." },
  ] as { part: LogoPart; text: string }[],
  story:
    "In Vietnam, music grows from bamboo. Bamboo becomes flutes, zithers and the strings that tremble under a player's hand: the tremolo. Tremola Studio carries that trembling string into games and apps, crafting sound that feels alive, human and unmistakably its own.",
  founderTitle: "The founder",
  founder: {
    portraitAlt: "Placeholder portrait of the founder",
    name: "[Founder name]",
    role: "Founder & Composer",
    bio: "[Degree, school], [2–3 lines about background and approach]",
  },
  notTitle: "What we are not",
  not: [
    "Not a sound-effects factory",
    "Not a stock library",
    "Not a one-color \u201Cethnic music\u201D studio",
    "Not a jingle agency",
  ],
  ctaTitle: "Hear what your product could sound like.",
  cta: "Get a free Sound Audit",
};
export type AboutContent = typeof en;

const vi: AboutContent = {
  eyebrow: "Tremola Studio · Giới thiệu",
  title: "Studio âm thanh do nhà soạn nhạc dẫn dắt, đến từ Việt Nam.",
  nameTitle: "Cái tên",
  name: [
    { word: "Tre", text: "Chất liệu làm nên nhạc cụ Việt Nam." },
    { word: "Tremolo", text: "Kỹ thuật rung dây trên đàn tranh và đàn nguyệt." },
    { word: "-la", text: "Nốt La (A)." },
  ],
  nameNote: "Trong tiếng Ý, tremola nghĩa là \u201Cnó đang rung\u201D.",
  logoTitle: "Logo",
  logo: [
    { part: "moon", text: "Vầng trăng khuyết — thân đàn nguyệt." },
    { part: "bamboo", text: "Thân tre — cũng là một sợi dây đang rung." },
    { part: "together", text: "Ghép lại — chữ a thường, của audio." },
    { part: "ring", text: "Vòng tròn — một hệ thống âm thanh trọn vẹn." },
  ],
  story:
    "Ở Việt Nam, âm nhạc mọc lên từ cây tre. Tre thành sáo, thành đàn, thành những sợi dây rung lên dưới tay người chơi: tiếng tremolo. Tremola Studio mang sợi dây rung ấy vào game và ứng dụng, tạo nên thứ âm thanh sống động, có hơi thở con người và mang hồn riêng không lẫn vào đâu.",
  founderTitle: "Người sáng lập",
  founder: {
    portraitAlt: "Ảnh chân dung người sáng lập (Placeholder)",
    name: "[Tên người sáng lập]",
    role: "Founder & Composer",
    bio: "[Bằng cấp, trường], [2–3 dòng về xuất thân và cách làm việc]",
  },
  notTitle: "Chúng tôi không phải",
  not: [
    "Không phải xưởng sản xuất hiệu ứng âm thanh hàng loạt",
    "Không phải thư viện âm thanh có sẵn",
    "Không phải studio \u201Cnhạc dân tộc\u201D một màu",
    "Không phải agency làm jingle",
  ],
  ctaTitle: "Nghe thử sản phẩm của bạn có thể mang âm thanh như thế nào.",
  cta: "Nhận Sound Audit miễn phí",
};

export const aboutContent: Record<Locale, AboutContent> = { en, vi };
