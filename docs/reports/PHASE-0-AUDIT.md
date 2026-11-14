# Phase 0 · Audit (2026-11-14)

Branch `chore/phase-0-audit`. Không sửa code ứng dụng. Log gốc: `docs/audit/{lint,typecheck,test,build}.txt`, Lighthouse JSON: `docs/audit/lighthouse/`.

## 1. Trạng thái build

| Lệnh | Kết quả |
|---|---|
| `bun install --frozen-lockfile` | OK, 544 package |
| `bun run lint` | **FAIL**: 742 lỗi + 10 cảnh báo. Toàn bộ lỗi là `prettier/prettier` (định dạng, sửa tự động được); 10 cảnh báo `react-refresh/only-export-components` (vô hại) |
| `bunx tsc --noEmit` | OK, 0 lỗi |
| `bun run test` | OK, 4 file / 13 test |
| `bun run build` | OK. Cảnh báo: chunk > 500 kB (bản server), `inlineDynamicImports` bị bỏ qua |
| Dev server | Chạy OK. Cảnh báo `inputValidator()` deprecated (3 chỗ trong leads.functions.ts), `vite-tsconfig-paths` thừa |

## 2. Khác biệt so với docs/HANDOFF.md

- **Thiếu `docs/DESIGN-SYSTEM.md` và `docs/CONTENT-STATUS.md`** trong file zip (HANDOFF nhắc tới cả hai). Bạn cần xuất lại từ Lovable.
- Slug của Stick là `stick-english-learning-app`, không phải `stick`. `/work/stick` trả 404.
- App là **TanStack Start SSR** (không phải SPA thuần), nên mỗi route đã có title/description/OG/canonical/hreflang ngay trong HTML ban đầu (xem mục 5).
- Logo + 2 mp3 + 1 mp4 placeholder là con trỏ `/__l5e/...` đến CDN Lovable, **không có trong git**. Đã tải về đủ 5 file, khớp dung lượng (`media-source/lovable-rescue/`).
- `.env` (chứa URL và key public của Lovable Cloud) **không nằm trong .gitignore**. Đã thêm vào .gitignore trước commit đầu tiên.
- Bảng `contact_submissions` + form liên hệ ở trang chủ có tồn tại, HANDOFF có ghi, nhưng brief không nhắc.

## 3. Bảo mật (xếp theo mức độ)

1. **Cao: chèn trực tiếp qua Data API vượt rào kiểm tra.** RLS cho `anon` INSERT với `WITH CHECK (true)` trên `audit_requests`, `pack_signups`, `contact_submissions`. Publishable key được nhúng sẵn vào bundle trình duyệt (biến VITE_). Vì vậy bất kỳ ai cũng có thể POST thẳng vào REST, tự đặt `qualified = true`, bỏ qua zod, và spam không giới hạn. Server function hiện có tính `qualified` đúng ở server, nhưng đường vòng này vẫn mở. → Phase 2: thu hồi INSERT của anon, chỉ server ghi bằng service role.
2. **Cao: không chống spam.** Không có honeypot, không rate limit, không CAPTCHA.
3. **Trung bình: grant thực tế rộng hơn migration.** Theo HANDOFF, anon/authenticated có SELECT/INSERT/UPDATE/DELETE trên cả 4 bảng; hiện chỉ RLS chặn lại. Migration mới sẽ REVOKE tường minh.
4. **Trung bình: link Free Pack công khai.** `VITE_FREE_PACK_URL` nằm trong bundle JS, ai cũng tải được mà không cần đăng ký và không có log.
5. **Trung bình: form VI bắt buộc `appStatus` chỉ ở client**, server không kiểm tra. Tháng ra mắt chỉ kiểm định dạng, không kiểm tháng hợp lệ.
6. **Thấp: lỗi chỉ `console.error`**, không có lưu trữ lỗi hay error tracking.
7. **Thấp: không có trang admin.** Lead chỉ xem được qua dashboard Lovable.
8. OK: không có service role key trong client; CSRF middleware còn nguyên; `getRequestOrigin` chỉ tin `x-forwarded-host` khi host là localhost.

## 4. Hiệu năng & accessibility (Lighthouse mobile, bản build production chạy local qua wrangler)

| Trang | Perf | A11y | Best pr. | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| / | 66 | 100 | 100 | 100 | 5.7 s | 0 |
| /work | 70 | 98 | 100 | 100 | 5.4 s | 0 |
| /work/lantern-valley | 75 | 100 | 100 | 100 | 4.4 s | 0 |
| /services | 73 | 100 | 100 | 100 | 4.5 s | 0 |
| /sound-audit | 75 | 100 | 100 | 100 | 4.3 s | 0 |

Nguyên nhân chính:
- **Google Fonts chặn render** (CSS bên thứ ba, ước tính tiết kiệm 1,3–2,1 s). → Tự host woff2 (có subset tiếng Việt) và preload.
- **Ảnh JPG chưa tối ưu** (ước tính tiết kiệm 130–370 KiB/trang): chưa dùng WebP/AVIF, chưa có `srcset`. Ảnh LCP ở /work lại bị lazy-load.
- JS không dùng tới khoảng 134 KiB (shadcn/radix/framer). DOM trang chủ 1.204 node.
- A11y: /work có heading nhảy cấp; /services có `aria-allowed-role` sai ở một phần tử.
- Audio: `preload="none"` OK. Nhưng `AudioProvider.computePeaks()` tải **toàn bộ file** để vẽ waveform khi phát → Phase 4 dùng peaks JSON tạo sẵn.
- **Bug iOS:** Safari iOS bỏ qua `audio.volume`, nên Before/After phát **cả hai track cùng lúc** trên iPhone. → Phase 4 chuyển sang Web Audio GainNode.

## 5. SEO

- Nhờ SSR, từng route đã trả về `<title>`, description, og:title/og:description/og:image, canonical và hreflang (en, vi, x-default) **ngay trong HTML ban đầu**. Đã kiểm bằng curl trên /, /vi, /services, /sound-audit, /free-pack, /vi/about, /work/calm-ledger. Preview trên LinkedIn sẽ hoạt động.
- Thiếu hoặc chưa tốt:
  - Canonical/OG lấy theo host của request, nên trên workers.dev hay tremola.vn sẽ ra canonical sai → dùng `SITE_URL` cố định.
  - Chưa có sitemap.xml.
  - robots.txt chưa trỏ tới sitemap.
  - OG image dùng chung, chưa có ảnh riêng cho từng case study.
  - `/work` redirect 307 sang `/work?line=all`.
  - JSON-LD Organization có, nhưng `sameAs` là link placeholder.

## 6. Kế hoạch Phase 1–6 (đã duyệt hướng: Supabase tài khoản mới, Cloudflare Workers + R2, Resend tài khoản mới, domain mua ở Cloudflare)

| Phase | Nội dung | Ước lượng |
|---|---|---|
| 1 | Migrations `supabase/migrations/` tái tạo schema + RLS (siết lại), docs/BACKEND.md, client đọc env, prettier toàn repo, danh sách package Lovable | 0,5 ngày + bạn tạo tài khoản Supabase |
| 2 | Server-only insert (service role), honeypot, rate limit IP/email (bảng DB), email Resend nội bộ + xác nhận EN/VI, Free Pack qua signed URL R2 + log tải, log lỗi submit | 1 ngày + bạn tạo tài khoản Resend |
| 3 | Founding counter trong DB, /admin (Supabase Auth email, không cho đăng ký), danh sách + lọc + trạng thái + CSV, docs/CONTENT-GUIDE.md | 1 ngày |
| 4 | scripts/process-audio (−16 LUFS, −1 dBTP, MP3 + Opus, peaks JSON, manifest), media lên R2, sửa Before/After cho iOS, poster/lazy video | 1 ngày |
| 5 | SITE_URL canonical, sitemap/robots tự sinh, tự host font, tối ưu ảnh, Playwright smoke, GitHub Actions | 1 ngày |
| 6 | Cloudflare Workers (preview mỗi branch + production từ main), docs/DEPLOY.md, domain + redirect tremola.vn/tremola.studio, uptime + error tracking miễn phí | 0,5 ngày + bạn bấm DNS/duyệt deploy |
