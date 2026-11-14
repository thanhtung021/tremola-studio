# Báo cáo tổng · Phase 0–6 (2026-11-14)

Repo: `Desktop/Claude Code/tremola-studio`. Các branch xếp chồng theo phase:
`chore/phase-0-audit` → `feat/phase-1-backend` → `feat/phase-2-lead-capture` → `feat/phase-3-admin` → `feat/phase-4-media` → `feat/phase-5-seo-perf-tests` → `feat/phase-6-deploy` (đầu chuỗi, chứa toàn bộ thay đổi). Chưa merge vào `main`, chưa push lên GitHub.
Kiểm tra cuối: lint 0 lỗi (11 cảnh báo vô hại), typecheck OK, 23 unit test, 22 test Playwright (desktop + mobile), 12 test @remote chạy trên preview thật. Tất cả đều pass.

## Đang chạy thật

| | Trạng thái |
|---|---|
| Preview | https://tremola-preview.thanhtungtran1002.workers.dev: đầy đủ trang EN/VI, /admin, media từ R2, noindex. Form đang ở **chế độ mock** (kiểm tra hợp lệ rồi báo thành công, **không lưu**), vì chưa có Supabase |
| R2 | `tremola-media` (audio/video đã chuẩn hoá), `tremola-packs` (ZIP placeholder, riêng tư) |
| Production tremolastudio.com | **Chưa deploy**: cần bạn duyệt và hoàn tất các bước ở mục "Việc của bạn" |

## Đã làm theo phase

- **0 · Audit:** docs/reports/PHASE-0-AUDIT.md, CLAUDE.md. Đã cứu 5 file media khỏi CDN của Lovable.
- **1 · Backend:** migration `supabase/migrations/` tái tạo đúng schema + RLS của Lovable; mẫu env mới; prettier toàn repo; docs/BACKEND.md có danh sách package Lovable đề xuất gỡ (**chưa gỡ gì**, chờ bạn duyệt).
- **2 · Lead:**
  - Trình duyệt **không còn quyền INSERT**; server ghi bằng service role. `qualified` chỉ tính trên server.
  - zod dùng chung, siết thêm: tháng hợp lệ, `appStatus` bắt buộc với form VI, ngân sách theo ngôn ngữ.
  - Chống spam: honeypot ẩn, rate limit theo IP và email.
  - Email Resend: thông báo nội bộ đủ trường, có cờ **[QUALIFIED]**, UTM, locale, quốc gia; email xác nhận EN/VI (bản nháp ở `src/content/emails.ts`, chờ bạn duyệt).
  - Free Pack: link ký HMAC, hết hạn sau 24 giờ, lấy từ bucket riêng tư, mỗi lượt tải đều được ghi log.
  - Lỗi khi gửi form được ghi vào bảng `submission_errors`.
- **3 · Admin:** /admin đăng nhập bằng email + mật khẩu, không có đăng ký công khai. Danh sách lead có lọc (ngày, ngôn ngữ, qualified, trạng thái), 6 trạng thái, ghi chú, xuất CSV (giữ dấu tiếng Việt, chống formula injection), sửa Founding counter (lưu trong DB). Hướng dẫn: docs/CONTENT-GUIDE.md (tiếng Việt).
- **4 · Media:**
  - `scripts/process-audio.mjs`: −16 LUFS, true peak ≤ −1 dBTP (đo lại sau khi encode), MP3 + Opus, peaks JSON, video H.264 kèm poster, manifest, upload R2. Có hỗ trợ Range cho tua.
  - **Sửa bug iPhone:** Before/After trước đây phát cả 2 track cùng lúc trên iOS. Nay dùng Web Audio: 2 track khoá mẫu với nhau, video bám theo đồng hồ audio.
- **5 · SEO / hiệu năng / test:**
  - Canonical cố định về tremolastudio.com; sitemap và robots tự sinh; bản preview luôn noindex; /work không còn redirect.
  - Font tự host có subset tiếng Việt; ảnh WebP kèm srcset.
  - Nội dung hero hiện ngay không cần JS, animation y hệt cũ.
  - Supabase SDK và framer-motion tải lười: JS trên đường găng giảm khoảng 100 KB gzip.
  - Playwright + GitHub Actions.
- **6 · Deploy:**
  - Cloudflare Workers; custom domain cho tremolastudio.com, www, tremola.studio (redirect 301).
  - Endpoint /api/health, lỗi trình duyệt gửi về Worker Logs.
  - docs/DEPLOY.md: biến môi trường cho từng môi trường, DNS, tremola.vn, monitoring.

## Số đo (Lighthouse mobile)

| | Trước | Sau (preview thật trên Cloudflare) |
|---|---|---|
| Accessibility | 98–100 | **100** ở mọi trang |
| SEO | 100 | 100 trên bản production. Bản preview chỉ 66–69 **vì noindex cố ý** |
| Best practices | 100 | 100 |
| CLS | 0 | 0–0,003 |
| LCP đo thực (observed) | không đo | **1,0–1,4 s** |
| Performance (giả lập Slow-4G) | 66–75 | 63–88, dao động mạnh giữa các lần chạy |

**Chưa đạt mục tiêu Performance ≥ 90 trong lab.** Phần còn nặng là khoảng 200 KB font (11 file woff2) và khoảng 110 KB JS lõi (React + Router). Bước tiếp theo đề xuất:
- subset font theo đúng ký tự dùng trên site (glyphhanger), bỏ Cormorant italic nếu không dùng ở hero;
- inline CSS quan trọng.

Hai việc này không đổi giao diện. Ước lượng khoảng 0,5 ngày.

## Việc của bạn (theo thứ tự)

1. **Supabase:** tạo project `tremola-prod` (Singapore) trong org Tremola. Nếu muốn preview có dữ liệu riêng, tạo thêm `tremola-dev`. Báo tôi khi xong; tôi sẽ chạy 3 migration, tắt đăng ký công khai và tạo tài khoản admin.
2. **Sales inbox:** chọn địa chỉ. Đề xuất `hello@tremolastudio.com`, chuyển tiếp về Gmail bằng Cloudflare Email Routing (miễn phí).
3. **Resend:** thêm domain `mail.tremolastudio.com`, thêm các bản ghi DNS vào Cloudflare (bạn bấm), tạo API key và tự dán vào Worker secret. Lệnh nằm trong docs/DEPLOY.md.
4. **GitHub:** tạo repo private `tremola-studio`, tôi push; thêm secret `CLOUDFLARE_API_TOKEN`.
5. **Duyệt nội dung email** trong `src/content/emails.ts`.
6. **Duyệt gỡ code Lovable** (danh sách trong docs/BACKEND.md).
7. **Duyệt deploy production** lên tremolastudio.com. Trước đó cần xoá bản ghi parking `@`/`www` cũ, nếu có.
8. UptimeRobot: tạo 2 monitor như trong docs/DEPLOY.md#monitoring.

## Vẫn là placeholder

(docs/CONTENT-STATUS.md không có trong file zip; danh sách dưới đây lấy từ quét code.)
- Toàn bộ audio, video Before/After, ảnh nhạc cụ, ảnh bìa: là bản demo có nhãn Placeholder.
- Phần challenge/direction của 4 dự án trong `work.ts`.
- Thông tin founder (`about.ts`).
- Email liên hệ `[contact email]` (`i18n/en.ts`, `vi.ts`).
- Link mạng xã hội (footer; đã bỏ khỏi JSON-LD).
- File ZIP Free Pack thật kèm giấy phép.
- OG image riêng cho từng case study.
- ID GA4 / Meta Pixel.
