# Hướng dẫn cập nhật nội dung (dành cho Marketing Leader & team)

Website không có CMS. Nội dung nằm trong các file TypeScript có kiểu dữ liệu rõ ràng. Chỉ sửa **chữ trong dấu ngoặc kép** và **con số**; giữ nguyên tên thuộc tính, dấu phẩy, dấu ngoặc, mã option và slug. Mỗi thay đổi đều sửa **cả tiếng Anh lẫn tiếng Việt**.

Quy tắc chữ (docs/BRAND.md): không dùng "cheap", "affordable", "outsourcing", "best", "#1", "leading", "world-class" (và "giá rẻ", "hàng đầu", "số 1"); không nhắc AI ngoài FAQ; không bịa khách hàng, testimonial, logo hay con số kết quả. Nội dung tạm luôn ghi "Placeholder".

## 0. Chuẩn bị (một lần)

- Cài VS Code. Mở thư mục `tremola-studio`.
- Có quyền vào repo GitHub `tremola-studio`.
- Muốn xem trước trên máy: mở Terminal trong VS Code, chạy `bun install` rồi `bun run dev`, sau đó vào http://localhost:8080.

## 1. Những việc KHÔNG cần sửa code (làm trong /admin)

| Việc | Ở đâu |
|---|---|
| Xem lead Sound Audit / Free Pack, lọc theo ngày, ngôn ngữ, qualified, trạng thái | https://tremolastudio.com/admin → tab tương ứng |
| Đổi trạng thái lead (Mới → Đã liên hệ → Đã gửi audit → Đã đặt call → Thắng / Thua), ghi chú nội bộ | Bấm **Details** trên dòng lead |
| Xuất CSV (mở được bằng Excel, giữ dấu tiếng Việt) | Nút **CSV**, xuất theo bộ lọc đang chọn |
| Cập nhật số suất Founding (tổng / còn lại) | Tab **Founding slots** → Save. Website cập nhật trong khoảng 1 phút. Đặt "Remaining" = 0 để ẩn ưu đãi |

Lead mới cũng được gửi email đến sales inbox. Mục tiêu là trả lời trong 24 giờ; tiêu đề email có chữ **[QUALIFIED]** với lead đạt chuẩn.

## 2. Thêm hoặc thay một demo portfolio

Portfolio là các video demo chào hàng (bộ gốc ở `Desktop/Tremola/demo/Tremola_Demos`). Mỗi demo có 2 bản chữ: trang `/work` dùng bản EN, trang `/vi/work` dùng bản VN. Dữ liệu ở `src/data/work.ts`.

1. **Video:** chép 2 file vào `media-source/demos/` và đặt tên `<slug>-en.mp4` và `<slug>-vi.mp4` (slug: chữ thường, gạch nối, không dấu, ví dụ `the-hospital`). Slug là đường dẫn `/work/<slug>` và không đổi sau khi đã đăng.
2. Kỹ sư (hoặc ai có quyền Cloudflare) chạy:
   ```bash
   FFMPEG=<đường dẫn ffmpeg> node scripts/process-audio.mjs --demos-only --upload
   ```
   Video được nén H.264 1080p + AAC, giữ nguyên âm lượng đã master, đưa lên R2 và ghi vào `src/content/media-manifest.json`.
3. **Ảnh bìa:** lấy một khung hình đẹp của mỗi bản (16:9, rộng 1600 px) thành `src/assets/work/<slug>-en.jpg` và `<slug>-vi.jpg`, kèm 2 bản WebP (`-800.webp`, `-1600.webp`, lệnh ở phụ lục). Ví dụ lấy khung ở giây 28:
   ```bash
   ffmpeg -ss 28 -i media-source/demos/the-hospital-en.mp4 -frames:v 1 -vf scale=1600:-2 -q:v 3 src/assets/work/the-hospital-en.jpg
   ```
   Thêm 2 dòng import ảnh ở đầu `work.ts` và 2 dòng trong bảng `covers`.
4. Chép một khối `{ slug: "...", ... }` có sẵn trong danh sách `entries`, rồi sửa:
   - `line`: `"game"` hoặc `"app"`; `asian: true` nếu nhạc cụ Việt dẫn dắt (hiện ở bộ lọc "Asian Signature").
   - `credit`: `"client"` (dự án thật, credit thật), `"concept"` (concept gốc), `"redesign"` (làm lại âm thanh trên footage của người khác) hoặc `"demo-app"` (app minh họa). **Không ghi concept hay app minh họa là khách hàng thật.**
   - `packages`: id gói trong `src/data/pricing.ts` (ví dụ `"basic"`, `"indie"`, `"sonic-identity"`); trang demo tự dẫn link tới bảng giá.
   - `en` và `vi`: `title`, `genre`, `summary` (1–2 câu), `shows` (video thể hiện gì), `hear` (nghe được gì), `creditNote` (ghi danh, quyền footage).
5. Thứ tự trong `entries` là thứ tự trên trang Work; trang chủ hiện 6 demo đầu. Muốn ẩn một demo thì xóa khối của nó (file video vẫn nằm trên R2).
6. Sitemap tự cập nhật khi build.

## 3. Thêm hoặc thay một track nhạc

Audio được xử lý tự động: chuẩn loudness −16 LUFS, true peak ≤ −1 dBTP, xuất MP3 + Opus, tạo waveform, rồi đưa lên Cloudflare R2.

1. Chép file gốc (WAV/AIFF/FLAC, 44.1 hoặc 48 kHz) vào `media-source/audio/`. Tên file là **id** của track, ví dụ `lantern-main.wav` thì id là `lantern-main`. Không dùng dấu, không dùng khoảng trắng.
2. Kỹ sư (hoặc ai có quyền Cloudflare) chạy:
   ```bash
   FFMPEG=<đường dẫn ffmpeg> bun run media -- --upload
   ```
   Script in ra LUFS/true peak từng file và cập nhật `src/content/media-manifest.json`. Nếu file không đạt chuẩn, script dừng và báo lỗi.
3. Dùng id đó ở nơi phát track (ví dụ `audioAsset("lantern-main")` trong `src/content/`).
4. Video không tiếng cho player Before/After: chép vào `media-source/video/`, chạy lệnh ở bước 2. Video được nén H.264, bỏ tiếng, kèm poster. Hai file audio Before/After phải **cùng độ dài với video**.

Quy tắc audio: không bao giờ tự phát, mỗi lúc chỉ một track, chỉ tải khi người xem bấm play. Các quy tắc này đã có sẵn trong player, không cần cấu hình.

## 4. Đổi giá

File: `src/data/pricing.ts`. Tìm bảng giá theo ngôn ngữ: tiếng Anh tính bằng USD, tiếng Việt tính bằng VND.

- `listed`: giá niêm yết. Có thể là một số (`550`), một khoảng (`[2000, 3500]`) hoặc `null` (hiện "Liên hệ").
- `founding`: giá Founding; `null` nghĩa là không giảm.
- Nội dung gói: mảng `includes.en` / `includes.vi` ở đầu file.

Sau khi đổi giá, chạy `bun run test`. Test `pricing.test.ts` kiểm tra giá; nếu cố ý đổi giá thì sửa số trong test cho khớp.

## 5. Sửa chữ / dịch

| Nội dung | File |
|---|---|
| Menu, footer, tiêu đề trang, mô tả SEO | `src/i18n/en.ts` và `src/i18n/vi.ts` |
| Trang chủ | `src/content/home.ts` (khối `en` và `vi`) |
| Dịch vụ, FAQ, điều khoản Founding | `src/content/services.ts` |
| Giới thiệu | `src/content/about.ts` |
| Form Sound Audit / Free Pack (nhãn, lựa chọn, lỗi) | `src/content/forms.ts` (không đổi **mã** option như `usd_500_2000`, chỉ đổi chữ hiển thị) |
| Email gửi khách (xác nhận audit, link Free Pack) | `src/content/emails.ts` |
| Ảnh nhạc cụ | `src/content/instrument-images.ts` (ảnh JPG 1024×768 kèm WebP `-512` / `-1024`) |

Tiếng Việt phải có đủ dấu. Sau khi sửa, mở trang /vi trên điện thoại (khổ 375 px) để kiểm tra tiêu đề không bị tràn. Test tự động `bun run e2e` cũng kiểm tra việc này.

## 6. Xuất bản

1. Tạo branch mới trên GitHub (VS Code: góc trái dưới → Create new branch), commit thay đổi.
2. Push. GitHub Actions tự chạy kiểm tra (lint, test, build, Playwright) và tạo **bản preview** tại
   `https://<tên-branch>-tremola-preview.thanhtungtran1002.workers.dev`. Link nằm trong tab Actions.
3. Xem preview trên điện thoại và máy tính.
4. Mở Pull Request vào `main` → người duyệt bấm **Merge**. Production (tremolastudio.com) tự deploy sau khoảng 3 phút.
5. Nếu có sự cố: Cloudflare → Workers → `tremola` → Deployments → Rollback về bản trước.

## Phụ lục: lệnh tạo ảnh WebP {#lenh-anh}

```bash
ffmpeg -i src/assets/work/ten-du-an.jpg -vf scale=800:-2 -c:v libwebp -quality 78 src/assets/work/ten-du-an-800.webp
ffmpeg -i src/assets/work/ten-du-an.jpg -c:v libwebp -quality 78 src/assets/work/ten-du-an-1600.webp
```
