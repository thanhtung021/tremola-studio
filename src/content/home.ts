import type { Locale } from "@/i18n";
import { mediaTrack } from "./media";

/** Homepage copy per locale. Edit text here; the page layout reads it. */
const tracks = {
  game: mediaTrack("svc-game", "echoes-score", "Echoes of the Nine Mountains · adaptive score"),
  app: mediaTrack("svc-app", "forma-app-montage", "Forma · in-app sound"),
  media: mediaTrack("svc-media", "forma-promo-15", "Forma · 15 s promo with sonic logo"),
};
const inst = {
  tranh: mediaTrack("inst-tranh", "inst-tranh-live", "Đàn tranh sample"),
  nguyet: mediaTrack("inst-nguyet", "inst-nguyet-live", "Đàn nguyệt sample"),
  sao: mediaTrack("inst-sao", "inst-sao-live", "Sáo trúc sample"),
  trung: mediaTrack("inst-trung", "inst-trung-live", "T'rưng sample"),
};

const en = {
  hero: {
    eyebrow: "Composer-led sound studio · Vietnam",
    title: "Sound with a soul of its own.",
    text: "Tremola Studio designs complete sonic systems for games and apps. Music, SFX and UI sound that speak one language, rooted in Southeast Asian craft.",
    cta: "Get a free Sound Audit",
    listen: "Listen to the reel",
    note: "Bamboo, zithers and moon lutes, recorded live.",
  },
  showreel: {
    eyebrow: "Hear the difference",
    title: "Same scene. Different soul.",
    note: "Toggle Before / After. Headphones recommended.",
  },
  servicesTitle: "One studio. One sonic language.",
  explore: "Explore",
  serviceLines: [
    {
      slug: "game",
      label: "Game Audio",
      title: "Your world, scored and sounded as one.",
      bullets: ["Adaptive music", "SFX & UI sound", "Wwise / FMOD integration"],
      track: tracks.game,
    },
    {
      slug: "app",
      label: "Product & App Sound",
      title: "The sound people remember your product by.",
      bullets: ["Sonic logo", "UI sound kit", "Sound guideline for your design system"],
      track: tracks.app,
    },
    {
      slug: "media",
      label: "Media",
      title: "A signature sound for every frame.",
      bullets: ["Sonic logo", "Stingers", "Channel identity"],
      track: tracks.media,
    },
  ],
  work: { title: "Selected work", all: "See all work" },
  asian: {
    eyebrow: "The Asian Signature",
    title: "Instruments with a voice of their own.",
    text: "Our signature is Southeast Asian craft, woven into modern interactive audio. Played by hand, recorded live, made to sit inside a game engine.",
    note: "Live Asian Recording is available as an add-on for any package.",
  },
  instruments: [
    { name: "Đàn tranh", desc: "16-string zither", track: inst.tranh },
    { name: "Đàn nguyệt", desc: "Moon lute", track: inst.nguyet },
    { name: "Sáo trúc", desc: "Bamboo flute", track: inst.sao },
    { name: "T'rưng", desc: "Bamboo xylophone of the Central Highlands", track: inst.trung },
  ],
  whyTitle: "Why Tremola Studio",
  pillars: [
    {
      title: "Composer-led",
      text: "Every project is led by a trained composer, from the first motif to the final mix.",
    },
    {
      title: "Interactive by design",
      text: "Music and sound respond to what players and users do, not loops on repeat.",
    },
    {
      title: "Southeast Asian craft",
      text: "Bamboo, wood and string instruments, used authentically and in a modern way.",
    },
    {
      title: "A system, not assets",
      text: "Music, SFX and UI sound share one palette and one sonic guideline.",
    },
    {
      title: "Exclusive and rights-clean",
      text: "Every sound is made for one client, with a clear licence in the contract.",
    },
  ],
  howTitle: "How we work",
  steps: [
    { n: "01", title: "Listen", text: "A free Sound Audit of your trailer or app." },
    { n: "02", title: "Find the motif", text: "The musical idea your world is built on." },
    {
      n: "03",
      title: "Build the system",
      text: "Music, SFX and UI sound in one palette, with a guideline.",
    },
    { n: "04", title: "Integrate", text: "Wwise, FMOD, Unity, Unreal, stems ready for your team." },
    { n: "05", title: "Deliver and license", text: "Non-exclusive, exclusive or full buyout." },
  ],
  founding: {
    label: (r: number, t: number) => `${r} of ${t} founding slots left`,
    aria: "Founding slots left",
    text: (t: number) =>
      `Our first ${t} studio clients get a founding rate in exchange for a case study, a testimonial and a credit.`,
    link: "See pricing",
  },
  pack: {
    eyebrow: "Free pack",
    title: "Free Vietnamese Instruments Pack",
    text: "One-shots of đàn tranh, đàn nguyệt, sáo trúc and T'rưng, free for your next game.",
    cta: "Get the free pack",
  },
  final: {
    title: "Let your world sound like nowhere else.",
    text: "Send us your trailer or a screen recording of your app. We send back a 60–90 second audit with one moment re-scored.",
    cta: "Get a free Sound Audit",
    videoLabel: "Tremola campaign music · 60 s",
  },
};
export type HomeContent = typeof en;

const vi: HomeContent = {
  hero: {
    eyebrow: "Studio âm thanh do nhà soạn nhạc dẫn dắt · Việt Nam",
    title: "Âm thanh có hồn riêng.",
    text: "Tremola Studio thiết kế trọn vẹn hệ thống âm thanh cho game và ứng dụng. Nhạc, SFX và UI sound cùng nói một ngôn ngữ, bắt rễ từ chất liệu Đông Nam Á.",
    cta: "Nhận Sound Audit miễn phí",
    listen: "Nghe showreel",
    note: "Tre, đàn tranh và đàn nguyệt, thu âm trực tiếp.",
  },
  showreel: {
    eyebrow: "Nghe sự khác biệt",
    title: "Cùng một cảnh. Khác một linh hồn.",
    note: "Chuyển Before / After. Nên dùng tai nghe.",
  },
  servicesTitle: "Một studio. Một ngôn ngữ âm thanh.",
  explore: "Xem",
  serviceLines: [
    {
      slug: "app",
      label: "Product & App Sound",
      title: "Âm thanh khiến người dùng nhớ đến sản phẩm của bạn.",
      bullets: ["Sonic logo", "UI sound kit", "Sound guideline cho design system"],
      track: tracks.app,
    },
    {
      slug: "game",
      label: "Game Audio",
      title: "Thế giới của bạn, có nhạc và tiếng động như một khối.",
      bullets: ["Nhạc adaptive", "SFX & UI sound", "Tích hợp Wwise / FMOD"],
      track: tracks.game,
    },
    {
      slug: "media",
      label: "Media",
      title: "Một chữ ký âm thanh cho mọi khung hình.",
      bullets: ["Sonic logo", "Stinger", "Nhận diện âm thanh cho kênh"],
      track: tracks.media,
    },
  ],
  work: { title: "Dự án tiêu biểu", all: "Xem tất cả dự án" },
  asian: {
    eyebrow: "Dấu ấn Á Đông",
    title: "Những nhạc cụ có giọng nói riêng.",
    text: "Dấu ấn của chúng tôi là chất liệu Đông Nam Á, dệt vào âm thanh tương tác hiện đại. Chơi bằng tay, thu trực tiếp, sẵn sàng chạy trong game engine.",
    note: "Live Asian Recording có thể thêm vào bất kỳ gói nào.",
  },
  instruments: [
    { name: "Đàn tranh", desc: "Đàn 16 dây", track: inst.tranh },
    { name: "Đàn nguyệt", desc: "Đàn hình trăng", track: inst.nguyet },
    { name: "Sáo trúc", desc: "Sáo làm từ trúc", track: inst.sao },
    { name: "T'rưng", desc: "Đàn tre của Tây Nguyên", track: inst.trung },
  ],
  whyTitle: "Vì sao chọn Tremola Studio",
  pillars: [
    {
      title: "Nhà soạn nhạc dẫn dắt",
      text: "Mỗi dự án do một nhà soạn nhạc được đào tạo bài bản phụ trách, từ motif đầu tiên đến bản mix cuối.",
    },
    {
      title: "Tương tác từ thiết kế",
      text: "Nhạc và âm thanh phản hồi theo hành động của người chơi, người dùng, không phải vòng lặp phát mãi.",
    },
    {
      title: "Chất liệu Đông Nam Á",
      text: "Nhạc cụ tre, gỗ và dây, dùng đúng tinh thần và theo cách hiện đại.",
    },
    {
      title: "Một hệ thống, không phải từng file lẻ",
      text: "Nhạc, SFX và UI sound dùng chung một bảng âm sắc và một sound guideline.",
    },
    {
      title: "Độc quyền, bản quyền rõ ràng",
      text: "Mỗi âm thanh làm riêng cho một khách hàng, với giấy phép ghi rõ trong hợp đồng.",
    },
  ],
  howTitle: "Cách chúng tôi làm việc",
  steps: [
    {
      n: "01",
      title: "Lắng nghe",
      text: "Sound Audit miễn phí cho trailer hoặc ứng dụng của bạn.",
    },
    { n: "02", title: "Tìm motif", text: "Ý tưởng âm nhạc làm nền cho cả thế giới của bạn." },
    {
      n: "03",
      title: "Xây hệ thống",
      text: "Nhạc, SFX và UI sound chung một bảng âm sắc, kèm guideline.",
    },
    {
      n: "04",
      title: "Tích hợp",
      text: "Wwise, FMOD, Unity, Unreal, stem sẵn sàng cho đội của bạn.",
    },
    { n: "05", title: "Bàn giao và cấp quyền", text: "Không độc quyền, độc quyền hoặc mua đứt." },
  ],
  founding: {
    label: (r, t) => `Còn ${r}/${t} suất ưu đãi sáng lập`,
    aria: "Số suất giá sáng lập còn lại",
    text: (t) =>
      `${t} khách hàng đến sớm nhất nhận giá sáng lập, đổi lại một case study, một lời nhận xét và ghi danh trên sản phẩm.`,
    link: "Xem bảng giá",
  },
  pack: {
    eyebrow: "Gói miễn phí",
    title: "Gói nhạc cụ Việt Nam miễn phí",
    text: "One-shot đàn tranh, đàn nguyệt, sáo trúc và T'rưng, miễn phí cho dự án tiếp theo của bạn.",
    cta: "Nhận gói miễn phí",
  },
  final: {
    title: "Để sản phẩm của bạn có một âm thanh không lẫn vào đâu.",
    text: "Gửi trailer hoặc bản quay màn hình ứng dụng. Chúng tôi gửi lại bản audit 60–90 giây, kèm một khoảnh khắc được làm lại âm thanh.",
    cta: "Nhận Sound Audit miễn phí",
    videoLabel: "Nhạc chiến dịch Tremola · 60 giây",
  },
};

export const homeContent: Record<Locale, HomeContent> = { en, vi };
/** Kept for the styleguide and other callers. */
export const instruments = en.instruments;
export const serviceLines = en.serviceLines;
