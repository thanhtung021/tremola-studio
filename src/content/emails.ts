/**
 * Visitor-facing email copy (EN/VI). DRAFT — waiting for the owner's review.
 * Brand rules apply (docs/BRAND.md): short, human, concrete; no banned words; no AI mention.
 * `{name}` and `{link}` are replaced at send time.
 */
export const emailCopy = {
  en: {
    audit: {
      subject: "We have your trailer · Tremola Studio",
      preheader: "Your Sound Audit is in our hands.",
      body: [
        "Hi {name},",
        "Thank you for sending your project to Tremola Studio. We will listen to it closely, with headphones on, more than once.",
        "Within 3 working days you will receive a short Sound Audit: what the sound is doing for your players today, and one moment re-scored so you can hear the difference.",
        "If you want to add context in the meantime (a build, a reference, a scene you care about), simply reply to this email.",
      ],
      signoff: "Tremola Studio · Sound for games & apps",
    },
    pack: {
      subject: "Your free pack · Tremola Studio",
      preheader: "Đàn tranh, đàn nguyệt, sáo trúc and T'rưng one-shots.",
      body: [
        "Hi {name},",
        "Here is your pack of one-shots recorded on Vietnamese instruments: đàn tranh, đàn nguyệt, sáo trúc and T'rưng.",
        "Download link (valid for 24 hours): {link}",
        "Try a đàn nguyệt pluck as a UI confirm sound, or a T'rưng roll under a level-up. If the link expires, request the pack again on our site.",
      ],
      signoff: "Tremola Studio · Sound for games & apps",
    },
  },
  vi: {
    audit: {
      subject: "Chúng tôi đã nhận được dự án của bạn · Tremola Studio",
      preheader: "Bản Sound Audit của bạn đang được thực hiện.",
      body: [
        "Chào {name},",
        "Cảm ơn bạn đã gửi dự án cho Tremola Studio. Chúng tôi sẽ đeo tai nghe và nghe thật kỹ, nhiều lần.",
        "Trong vòng 3 ngày làm việc, bạn sẽ nhận một bản Sound Audit ngắn: âm thanh hiện đang làm gì cho người dùng của bạn, kèm một khoảnh khắc được làm lại âm thanh để bạn nghe sự khác biệt.",
        "Nếu muốn bổ sung thông tin (bản build, tài liệu tham khảo, cảnh bạn quan tâm), bạn chỉ cần trả lời email này.",
      ],
      signoff: "Tremola Studio · Âm thanh cho game & ứng dụng",
    },
    pack: {
      subject: "Gói âm thanh miễn phí của bạn · Tremola Studio",
      preheader: "One-shot đàn tranh, đàn nguyệt, sáo trúc và T'rưng.",
      body: [
        "Chào {name},",
        "Đây là gói one-shot thu từ nhạc cụ Việt Nam: đàn tranh, đàn nguyệt, sáo trúc và T'rưng.",
        "Link tải (dùng được trong 24 giờ): {link}",
        "Thử dùng một tiếng gảy đàn nguyệt làm âm xác nhận trong ứng dụng, hoặc một chuỗi T'rưng khi người chơi lên cấp. Nếu link hết hạn, bạn có thể yêu cầu lại trên website.",
      ],
      signoff: "Tremola Studio · Âm thanh cho game & ứng dụng",
    },
  },
} as const;
