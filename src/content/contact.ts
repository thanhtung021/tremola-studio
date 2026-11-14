import type { Locale } from "@/i18n";

const en = {
  eyebrow: "Tremola Studio · Contact",
  title: "Let’s talk about your sound.",
  name: "Name", email: "Email", company: "Studio or company", message: "Your message",
  optional: "optional", submit: "Send message", sending: "Sending…",
  success: "Your message has been received. Thank you for contacting Tremola Studio.",
  failed: "Your message could not be sent. Please try again.",
  errors: { name: "Enter your name (up to 120 characters).", email: "Enter a valid email (up to 255 characters).", company: "Use up to 160 characters.", message: "Enter your message (up to 2,000 characters)." } as Record<string, string>,
};
export const contactCopy: Record<Locale, typeof en> = {
  en,
  vi: {
    eyebrow: "Tremola Studio · Liên hệ", title: "Cùng nói về âm thanh của bạn.",
    name: "Tên của bạn", email: "Email", company: "Studio hoặc công ty", message: "Lời nhắn",
    optional: "không bắt buộc", submit: "Gửi lời nhắn", sending: "Đang gửi…",
    success: "Đã nhận lời nhắn của bạn. Cảm ơn bạn đã liên hệ Tremola Studio.",
    failed: "Chưa gửi được lời nhắn. Bạn vui lòng thử lại.",
    errors: { name: "Nhập tên của bạn (tối đa 120 ký tự).", email: "Nhập email hợp lệ (tối đa 255 ký tự).", company: "Nhập tối đa 160 ký tự.", message: "Nhập lời nhắn của bạn (tối đa 2.000 ký tự)." },
  },
};