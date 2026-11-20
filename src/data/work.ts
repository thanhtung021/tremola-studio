/**
 * Portfolio: the sales demo reels (Desktop/Tremola/demo/Tremola_Demos). Each demo has an English
 * and a Vietnamese text version of the same video; /work shows the EN cut, /vi/work the VN cut.
 * Videos are processed by `scripts/process-audio.mjs` from media-source/demos/<slug>-<en|vi>.mp4.
 * Copy rules: no prices, never present a concept or demo app as a real client, no "recorded live".
 */
import echoesOfTheNineMountainsEn from "@/assets/work/echoes-of-the-nine-mountains-en.jpg";
import echoesOfTheNineMountainsVi from "@/assets/work/echoes-of-the-nine-mountains-vi.jpg";
import theHospitalEn from "@/assets/work/the-hospital-en.jpg";
import theHospitalVi from "@/assets/work/the-hospital-vi.jpg";
import formaWellnessAppEn from "@/assets/work/forma-wellness-app-en.jpg";
import formaWellnessAppVi from "@/assets/work/forma-wellness-app-vi.jpg";
import echoesAsianSignatureEn from "@/assets/work/echoes-asian-signature-en.jpg";
import echoesAsianSignatureVi from "@/assets/work/echoes-asian-signature-vi.jpg";
import catfluencerEn from "@/assets/work/catfluencer-en.jpg";
import catfluencerVi from "@/assets/work/catfluencer-vi.jpg";
import sonicLogosEn from "@/assets/work/sonic-logos-en.jpg";
import sonicLogosVi from "@/assets/work/sonic-logos-vi.jpg";
import actionSoundRedesignEn from "@/assets/work/action-sound-redesign-en.jpg";
import actionSoundRedesignVi from "@/assets/work/action-sound-redesign-vi.jpg";
import nhipFintechAppEn from "@/assets/work/nhip-fintech-app-en.jpg";
import nhipFintechAppVi from "@/assets/work/nhip-fintech-app-vi.jpg";
import { demoAsset } from "@/content/media";
import type { Locale } from "@/i18n";

// Posters: a frame of each cut (1600 px JPG + 800/1600 WebP for srcset, see docs/CONTENT-GUIDE.md).
const covers: Record<string, string> = {
  "echoes-of-the-nine-mountains-en": echoesOfTheNineMountainsEn,
  "echoes-of-the-nine-mountains-vi": echoesOfTheNineMountainsVi,
  "the-hospital-en": theHospitalEn,
  "the-hospital-vi": theHospitalVi,
  "forma-wellness-app-en": formaWellnessAppEn,
  "forma-wellness-app-vi": formaWellnessAppVi,
  "echoes-asian-signature-en": echoesAsianSignatureEn,
  "echoes-asian-signature-vi": echoesAsianSignatureVi,
  "catfluencer-en": catfluencerEn,
  "catfluencer-vi": catfluencerVi,
  "sonic-logos-en": sonicLogosEn,
  "sonic-logos-vi": sonicLogosVi,
  "action-sound-redesign-en": actionSoundRedesignEn,
  "action-sound-redesign-vi": actionSoundRedesignVi,
  "nhip-fintech-app-en": nhipFintechAppEn,
  "nhip-fintech-app-vi": nhipFintechAppVi,
};
const cover = (slug: string, locale: Locale) => covers[`${slug}-${locale}`]!;

/** pricing.ts package ids, shown as "Packages that fit". */
export type PackageId =
  | "basic"
  | "indie"
  | "premium"
  | "ui-kit"
  | "sonic-identity"
  | "brand-suite"
  | "stinger"
  | "live-recording";

/** client = real credit · concept = original Tremola concept · redesign = sound on third-party
 * footage · demo-app = illustrative app built for the demo. */
export type Credit = "client" | "concept" | "redesign" | "demo-app";

type WorkText = {
  title: string;
  genre: string;
  summary: string;
  shows: string;
  hear: string;
  creditNote: string;
};

type WorkEntry = {
  slug: string;
  line: "game" | "app";
  /** Listed under the "Asian Signature" filter (Vietnamese instruments carry the score). */
  asian?: boolean;
  credit: Credit;
  packages: PackageId[];
  en: WorkText;
  vi: WorkText;
};

/** Order = order on /work; the home page shows the first six. */
const entries: WorkEntry[] = [
  {
    slug: "echoes-of-the-nine-mountains",
    line: "game",
    asian: true,
    credit: "client",
    packages: ["indie", "premium"],
    en: {
      title: "Echoes of the Nine Mountains",
      genre: "Fantasy RPG",
      summary:
        "A fantasy RPG scored as one adaptive system: the music follows the player from the title screen through the town and the inventory to a boss fight.",
      shows:
        "Main menu → exploration → town → inventory → combat → boss. On-screen labels name the music state and the SFX layer playing.",
      hear: "Orchestral and hybrid main theme, state-based adaptive music with Vietnamese instrument colour, menu UI, magic and combat SFX.",
      creditNote: "Music and sound by Tremola for Echoes of the Nine Mountains.",
    },
    vi: {
      title: "Echoes of the Nine Mountains",
      genre: "Fantasy / RPG",
      summary:
        "Game RPG fantasy, làm âm thanh như một hệ thống tương tác: nhạc đi theo người chơi từ màn hình chính, thị trấn, túi đồ tới trận boss.",
      shows:
        "Menu chính → khám phá → thị trấn → túi đồ → chiến đấu → boss. Nhãn trên hình ghi trạng thái nhạc và lớp SFX đang phát.",
      hear: "Nhạc chủ đề dàn nhạc & hybrid, nhạc tương tác theo trạng thái, màu nhạc cụ Việt, UI menu, SFX phép thuật & chiến đấu.",
      creditNote: "Nhạc & âm thanh Tremola làm cho Echoes of the Nine Mountains.",
    },
  },
  {
    slug: "the-hospital",
    line: "game",
    credit: "client",
    packages: ["basic", "indie"],
    en: {
      title: "The Hospital",
      genre: "Horror",
      summary:
        "A horror sequence where sound sets the pace: room tone and a slowly rising drone, then a scare, a chase and a slammed door.",
      shows:
        "Dark corridor, flashlight, the creature appears, chase, door slam. On-screen labels name each sound layer.",
      hear: "Ambience and room tone, a rising drone, adaptive music (explore → confront → chase), a jump-scare stinger, creature SFX and foley.",
      creditNote:
        "Sound by Tremola for The Hospital. The gameplay scene was recreated for this demo.",
    },
    vi: {
      title: "The Hospital",
      genre: "Kinh dị",
      summary:
        "Một đoạn chơi kinh dị mà âm thanh dẫn nhịp: room tone, drone căng dần, rồi cú hù, rượt đuổi và cửa đóng sầm.",
      shows:
        "Hành lang tối, đèn pin, quái vật xuất hiện, rượt đuổi, cửa đóng sầm. Nhãn trên hình ghi lớp âm thanh.",
      hear: "Ambience & room tone, drone căng dần, nhạc tương tác (khám phá → đối mặt → rượt đuổi), stinger hù dọa, SFX quái vật & foley.",
      creditNote: "Âm thanh Tremola làm cho The Hospital. Cảnh gameplay được dựng lại cho demo.",
    },
  },
  {
    slug: "forma-wellness-app",
    line: "app",
    credit: "client",
    packages: ["sonic-identity", "brand-suite"],
    en: {
      title: "Forma",
      genre: "Fitness app",
      summary:
        "A complete sound layer for a real home-workout app, from the sonic logo to every cue in a session and the music inside the app.",
      shows:
        "One workout played twice, silent and then with sound: launch, set start, countdown, phase change, form check by camera, session complete, badge, meal photo, stretching.",
      hear: "Sonic logo, UI sounds, workout cues (set start and end, countdown, rep count, phase change, badge), 128 BPM workout music and 64 BPM stretching music.",
      creditNote:
        "Sound by Tremola for Forma, on the app's real screens (Vietnamese interface). Mixed at in-app level, so turn the volume up a little.",
    },
    vi: {
      title: "Forma",
      genre: "App thể dục",
      summary:
        "Trọn bộ âm thanh cho một app tập tại nhà có thật: từ sonic logo tới mọi âm báo trong buổi tập và nhạc trong app.",
      shows:
        "Cùng một buổi tập chạy 2 lần, im lặng rồi có âm thanh: mở app, vào hiệp, đếm ngược, đổi pha, chỉnh form qua camera, hoàn thành, huy hiệu, chụp món ăn, giãn cơ.",
      hear: "Sonic logo, UI sound, âm báo khi tập (vào/hết hiệp, đếm ngược, đếm rep, đổi pha, huy hiệu), nhạc tập 128 BPM và nhạc giãn cơ 64 BPM.",
      creditNote:
        "Âm thanh Tremola làm cho app Forma, trên màn hình thật của app. Âm lượng giữ đúng mức trong app nên hơi nhỏ, bạn tăng âm lượng một chút.",
    },
  },
  {
    slug: "echoes-asian-signature",
    line: "game",
    asian: true,
    credit: "client",
    packages: ["indie", "live-recording"],
    en: {
      title: "Echoes · Asian Signature",
      genre: "Asian fantasy / wuxia",
      summary:
        "The same adaptive RPG score, told through Vietnamese instruments: Vietnamese zither (đàn tranh), moon lute (đàn nguyệt), bamboo flute (sáo trúc) and bamboo xylophone (T'rưng) carry the identity of every scene.",
      shows:
        "The Echoes gameplay, with on-screen notes naming the Vietnamese instrument that carries each scene.",
      hear: "Vietnamese zither (đàn tranh), moon lute (đàn nguyệt), bamboo flute (sáo trúc), orchestral and hybrid layers, state-based adaptive music.",
      creditNote:
        "Music and sound by Tremola for Echoes of the Nine Mountains. The Vietnamese instruments in this demo are sampled; recording them live is an add-on.",
    },
    vi: {
      title: "Echoes · Asian Signature",
      genre: "Fantasy Á Đông / kiếm hiệp",
      summary:
        "Cùng bản nhạc RPG tương tác, kể bằng nhạc cụ Việt: đàn tranh, đàn nguyệt, sáo trúc và T'rưng mang bản sắc vào từng cảnh.",
      shows: "Gameplay Echoes, kèm chú thích nhạc cụ Việt dẫn dắt từng cảnh.",
      hear: "Đàn tranh, đàn nguyệt, sáo trúc, lớp dàn nhạc & hybrid, nhạc tương tác theo trạng thái.",
      creditNote:
        "Nhạc & âm thanh Tremola làm cho Echoes of the Nine Mountains. Nhạc cụ Việt trong demo là sample; thu trực tiếp là dịch vụ thêm.",
    },
  },
  {
    slug: "catfluencer",
    line: "game",
    credit: "client",
    packages: ["basic", "indie"],
    en: {
      title: "Catfluencer",
      genre: "Cozy / casual puzzle",
      summary:
        "Real Catfluencer gameplay with two complete SFX directions on the same scenes, so you can hear how the choice changes the feel.",
      shows:
        "Merge board, home and quests, dialogue, rewards and shop, each scene played with SFX set A and set B.",
      hear: "Warm music loops, soft UI (pick-ups, rewards), character sounds and two SFX directions. Headphones help with the A/B.",
      creditNote: "Music and SFX by Tremola for Catfluencer.",
    },
    vi: {
      title: "Catfluencer",
      genre: "Cozy / casual puzzle",
      summary:
        "Gameplay thật của Catfluencer, cùng cảnh nghe 2 hướng SFX trọn bộ để thấy lựa chọn đổi cảm giác game thế nào.",
      shows:
        "Bàn merge, nhà & nhiệm vụ, hội thoại, phần thưởng & cửa hàng; mỗi cảnh nghe bộ SFX A và B.",
      hear: "Loop nhạc ấm, UI mềm (nhặt đồ, phần thưởng), âm thanh nhân vật, 2 hướng SFX. Nên nghe bằng tai nghe để so A/B.",
      creditNote: "Nhạc & SFX Tremola làm cho Catfluencer.",
    },
  },
  {
    slug: "sonic-logos",
    line: "app",
    credit: "client",
    packages: ["sonic-identity", "stinger"],
    en: {
      title: "Sonic Logos",
      genre: "Sonic branding",
      summary:
        "Four brands, one method: each gets a sonic logo, a short logo and four UI sounds that grow from the same musical idea.",
      shows:
        "Stick, Forma, Logline and Musician: sonic logo, short logo and UI sounds, with waveforms and the idea behind each.",
      hear: "24 sounds: full sonic logos, short logos and success, notification, gentle error and tap UI sounds, at delivered levels.",
      creditNote: "Sonic logos and UI sounds by Tremola for Stick, Forma, Logline and Musician.",
    },
    vi: {
      title: "Sonic Logo",
      genre: "Nhận diện âm thanh",
      summary:
        "4 thương hiệu, một cách làm: mỗi thương hiệu có sonic logo, logo ngắn và 4 UI sound cùng xuất phát từ một ý nhạc.",
      shows:
        "Stick, Forma, Logline và Musician: sonic logo, logo ngắn và UI sound, kèm dạng sóng và ý tưởng của từng âm.",
      hear: "24 âm: sonic logo đầy đủ, logo ngắn, UI thành công / thông báo / lỗi nhẹ / chạm, giữ nguyên mức đã giao.",
      creditNote: "Sonic logo & UI sound Tremola làm cho Stick, Forma, Logline, Musician.",
    },
  },
  {
    slug: "action-sound-redesign",
    line: "game",
    credit: "redesign",
    packages: ["basic", "premium"],
    en: {
      title: "Action · Sound Redesign",
      genre: "Action",
      summary:
        "One gameplay clip played three times: no audio, adaptive SFX only, then SFX with music that follows the fight.",
      shows:
        "The same sequence in three passes: silent → adaptive SFX → SFX and music moving from exploration to combat, boss and victory.",
      hear: "Hit, skill and environment SFX; music that moves exploration → combat → boss → victory.",
      creditNote:
        "Sound redesign made for this portfolio. Footage © Sony Interactive Entertainment (God of War); not affiliated with or endorsed by Sony.",
    },
    vi: {
      title: "Action · Sound Redesign",
      genre: "Hành động",
      summary:
        "Một đoạn gameplay chạy 3 lượt: không âm thanh, chỉ SFX tương tác, rồi SFX cùng nhạc bám theo trận đánh.",
      shows:
        "Cùng một đoạn chơi 3 lượt: im lặng → SFX tương tác → SFX và nhạc chuyển từ khám phá sang chiến đấu, boss và chiến thắng.",
      hear: "SFX đòn đánh, kỹ năng, môi trường; nhạc chuyển trạng thái khám phá → chiến đấu → boss → chiến thắng.",
      creditNote:
        "Sound redesign làm cho portfolio. Footage © Sony Interactive Entertainment (God of War), không liên kết hay được Sony bảo trợ.",
    },
  },
  {
    slug: "nhip-fintech-app",
    line: "app",
    credit: "demo-app",
    packages: ["ui-kit", "sonic-identity"],
    en: {
      title: "Nhịp · Fintech app",
      genre: "Fintech",
      summary:
        "A money transfer played twice, silent and then with sound, to show how audio makes a finance app feel trustworthy and recognisable.",
      shows: "Open the app, enter an amount, face verification, transfer sent, money received.",
      hear: "Sonic logo on launch, taps, keypad, slide to confirm, verification success, transfer success and the incoming-money notification.",
      creditNote: "Nhịp is an illustrative app built by Tremola for this demo, not a real product.",
    },
    vi: {
      title: "Nhịp · App tài chính",
      genre: "Fintech",
      summary:
        "Một luồng chuyển tiền chạy 2 lần, im lặng rồi có âm thanh, cho thấy âm thanh giúp app tài chính đáng tin và dễ nhận ra.",
      shows: "Mở app, nhập số tiền, xác thực khuôn mặt, chuyển thành công, nhận tiền.",
      hear: "Sonic logo mở app, chạm UI, bàn phím, trượt xác nhận, xác thực thành công, giao dịch thành công, thông báo nhận tiền.",
      creditNote: "Nhịp là app minh họa do Tremola dựng cho demo, không phải sản phẩm có thật.",
    },
  },
];

export type Work = WorkText & {
  slug: string;
  line: "game" | "app";
  asian: boolean;
  credit: Credit;
  packages: PackageId[];
  video: { src: string; duration: number; durationLabel: string };
  cover: string;
};

/** A demo in the page language: Vietnamese text and the VN-text cut of the video on /vi. */
export function localizeWork(e: WorkEntry, locale: Locale): Work {
  const v = demoAsset(`${e.slug}-${locale}`);
  return {
    ...e[locale],
    slug: e.slug,
    line: e.line,
    asian: !!e.asian,
    credit: e.credit,
    packages: e.packages,
    video: v,
    cover: cover(e.slug, locale),
  };
}

export const workSlugs = entries.map((e) => e.slug);
export const getWorkEntry = (slug: string) => entries.find((e) => e.slug === slug);
export const getWork = (slug: string, locale: Locale) => {
  const e = getWorkEntry(slug);
  return e ? localizeWork(e, locale) : undefined;
};
export const listWork = (locale: Locale) => entries.map((e) => localizeWork(e, locale));

export const lineLabels: Record<Locale, Record<Work["line"], string>> = {
  en: { game: "Game Audio", app: "Product & App Sound" },
  vi: { game: "Game Audio", app: "Product & App Sound" },
};

export const creditLabels: Record<Locale, Record<Credit, string>> = {
  en: {
    client: "Real project",
    concept: "Original concept",
    redesign: "Sound redesign",
    "demo-app": "Demo app",
  },
  vi: {
    client: "Dự án thật",
    concept: "Concept gốc",
    redesign: "Sound redesign",
    "demo-app": "App minh họa",
  },
};
