import type { Locale } from "@/i18n";
import { mediaTrack } from "./media";

/** Services page copy per locale. Prices live in src/data/pricing.ts. */
const tracks = {
  game: mediaTrack(
    "svc-page-game",
    "echoes-score",
    "Echoes of the Nine Mountains · adaptive score",
  ),
  app: mediaTrack("svc-page-app", "forma-app-montage", "Forma · in-app sound"),
  media: mediaTrack("svc-page-media", "forma-promo-15", "Forma · 15 s promo with sonic logo"),
};

const en = {
  eyebrow: "Tremola Studio · Services",
  title: "Services",
  intro:
    "Priced by package, never by the hour. Every package is an exclusive licence unless you choose otherwise.",
  sections: [
    {
      id: "game",
      label: "Game Audio",
      title: "Your world, scored and sounded as one.",
      intro:
        "Themes, adaptive music, SFX and UI sound built as one system, delivered engine-ready for Wwise or FMOD.",
      track: tracks.game,
    },
    {
      id: "app",
      label: "Product & App Sound",
      title: "The sound people remember your product by.",
      intro:
        "A sonic logo, a UI sound kit and a guideline your design and dev teams can ship from.",
      track: tracks.app,
    },
    {
      id: "media",
      label: "Media",
      title: "A signature sound for every frame.",
      intro: "Sonic logos and stingers that give a channel or brand one recognisable voice.",
      track: tracks.media,
    },
  ] as {
    id: "game" | "app" | "media";
    label: string;
    title: string;
    intro: string;
    track: typeof tracks.game;
  }[],
  addon: "Add-on",
  foundingRate: "Founding rate",
  originalPrice: "Regular price",
  slotsLeft: (r: number, t: number) => `${r} of ${t} founding slots left`,
  rightsTitle: "Rights",
  rightsAria: "Rights options",
  basePrice: "Base price",
  isDefault: "Default",
  terms: [
    "2 revision rounds per package",
    "50% upfront, 50% on delivery (large projects 40/30/30 by milestone)",
    "Delivered as stems and engine-ready files",
  ],
  whyFoundingTitle: "Why a founding rate?",
  whyFounding: (t: number) =>
    `Our first ${t} studio clients get a founding rate. In return, we ask to share the project as a case study, with a testimonial and a credit. Orders through freelance marketplaces are not included.`,
  faqTitle: "Questions",
  faq: [
    {
      q: "Do you work with Wwise and FMOD?",
      a: "Yes. We deliver music and sound as Wwise or FMOD projects, or as stems and engine-ready files for Unity and Unreal, so your team can drop them straight in.",
    },
    {
      q: "Can you match an existing soundtrack or style?",
      a: "Yes. Send us references and what you already have. We find the motif and palette that sit with your current sound, then build from there.",
    },
    { q: "How long does a package take?", a: "Placeholder — typical timelines per package." },
    {
      q: "What does \u201Cexclusive\u201D mean in practice?",
      a: "The sounds are made for your product only. You use them forever in that product, and we never license them to anyone else. If you need every right transferred, choose Full buyout.",
    },
    {
      q: "Do you use AI?",
      a: "We use some AI tools inside our workflow to move faster on routine tasks. Every sound we deliver is composed, edited and approved by people, and is cleared for your exclusive use. Ask us anything about our process.",
    },
    {
      q: "Can we start small?",
      a: "Yes. Start with a free Sound Audit or a single package, such as a UI Sound Kit or a Basic Pack, and grow the system from there.",
    },
  ],
  ctaTitle: "Not sure which package fits? Start with a free Sound Audit.",
  cta: "Get a free Sound Audit",
};
export type ServicesContent = typeof en;

const vi: ServicesContent = {
  eyebrow: "Tremola Studio · Dịch vụ",
  title: "Dịch vụ",
  intro:
    "Báo giá theo gói, không tính theo giờ. Mọi gói đều mặc định là giấy phép độc quyền, trừ khi bạn chọn khác.",
  sections: [
    {
      id: "app",
      label: "Product & App Sound",
      title: "Âm thanh khiến người dùng nhớ đến sản phẩm của bạn.",
      intro: "Sonic logo, UI sound kit và một guideline để đội design và dev triển khai ngay.",
      track: tracks.app,
    },
    {
      id: "game",
      label: "Game Audio",
      title: "Thế giới của bạn, có nhạc và tiếng động như một khối.",
      intro:
        "Nhạc chủ đề, nhạc adaptive, SFX và UI sound xây thành một hệ thống, bàn giao sẵn sàng cho Wwise hoặc FMOD.",
      track: tracks.game,
    },
    {
      id: "media",
      label: "Media",
      title: "Một chữ ký âm thanh cho mọi khung hình.",
      intro: "Sonic logo và stinger giúp một kênh hay thương hiệu có một giọng nói dễ nhận ra.",
      track: tracks.media,
    },
  ],
  addon: "Dịch vụ thêm",
  foundingRate: "Giá ưu đãi sáng lập",
  originalPrice: "Giá gốc",
  slotsLeft: (r, t) => `Còn ${r}/${t} suất ưu đãi sáng lập`,
  rightsTitle: "Quyền sử dụng",
  rightsAria: "Các lựa chọn quyền sử dụng",
  basePrice: "Giá gốc",
  isDefault: "Mặc định",
  terms: [
    "2 vòng chỉnh sửa cho mỗi gói",
    "Thanh toán 50% trước, 50% khi bàn giao (dự án lớn chia 40/30/30 theo mốc)",
    "Bàn giao stem và file sẵn sàng cho game engine",
  ],
  whyFoundingTitle: "Vì sao có giá sáng lập?",
  whyFounding: (t) =>
    `${t} khách hàng đến sớm nhất nhận giá sáng lập. Đổi lại, chúng tôi xin được chia sẻ dự án dưới dạng case study, kèm một lời nhận xét và ghi danh. Không áp dụng cho đơn đặt qua các sàn freelance.`,
  faqTitle: "Câu hỏi thường gặp",
  faq: [
    {
      q: "Tremola Studio có làm việc với Wwise và FMOD không?",
      a: "Có. Chúng tôi bàn giao nhạc và âm thanh dưới dạng project Wwise hoặc FMOD, hoặc stem và file sẵn sàng cho Unity, Unreal, để đội của bạn đưa vào ngay.",
    },
    {
      q: "Có thể làm theo một soundtrack hay phong cách sẵn có không?",
      a: "Có. Hãy gửi tham khảo và những gì bạn đang có. Chúng tôi tìm motif và bảng âm sắc hợp với âm thanh hiện tại, rồi phát triển từ đó.",
    },
    { q: "Một gói mất bao lâu?", a: "Placeholder — thời gian thường gặp cho từng gói." },
    {
      q: "\u201CĐộc quyền\u201D nghĩa là gì trong thực tế?",
      a: "Âm thanh chỉ làm cho sản phẩm của bạn. Bạn dùng vĩnh viễn trong sản phẩm đó và chúng tôi không cấp phép cho bất kỳ ai khác. Nếu cần chuyển giao toàn bộ quyền, hãy chọn Mua đứt.",
    },
    {
      q: "Tremola Studio có dùng AI không?",
      a: "Chúng tôi dùng một số công cụ AI trong quy trình nội bộ để xử lý nhanh các việc lặp lại. Mọi âm thanh bàn giao đều do con người sáng tác, biên tập và duyệt, và sạch bản quyền cho việc sử dụng độc quyền của bạn. Bạn cứ hỏi thêm về quy trình.",
    },
    {
      q: "Có thể bắt đầu nhỏ không?",
      a: "Được. Hãy bắt đầu với Sound Audit miễn phí hoặc một gói đơn lẻ như UI Sound Kit hay Basic Pack, rồi mở rộng hệ thống dần.",
    },
  ],
  ctaTitle: "Chưa biết gói nào phù hợp? Hãy bắt đầu với Sound Audit miễn phí.",
  cta: "Nhận Sound Audit miễn phí",
};

export const servicesContent: Record<Locale, ServicesContent> = { en, vi };
