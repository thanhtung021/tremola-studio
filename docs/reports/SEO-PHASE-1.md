# SEO giai đoạn 1 – tremolastudio.com (22/11/2026)

Nguồn việc: `seo-plan/tremolastudio.com-audit/ACTION-PLAN.md` (C1, C2, H1, H3, H4, M1, M2), `KEYWORDS.md`, `KE-HOACH-SEO-TONG.md` mục 2–3 (phương án A: Tremola = studio, gói, giá, sonic branding, nhạc cụ Việt; không nhắm tên cá nhân).

Branch `fix/seo-phase-1` (gốc: `main@ecd04d3`). Preview: https://fix-seo-phase-1-tremola-preview.thanhtungtran1002.workers.dev

## Commit

| Commit | Nội dung |
|---|---|
| `9e9a0bb` | 301 cho 8 URL demo cũ (EN + VI) về demo gần nhất; dấu `/` cuối 307 → 301 (giữ query); header `Strict-Transport-Security: max-age=31536000; includeSubDomains` + `X-Content-Type-Options: nosniff` cho mọi response. Unit test `src/server/redirects.test.ts`. |
| `18a4a76` | Ẩn cột Social (link `#`) cho tới khi có profile thật (`src/config/contact.ts` → `socialProfiles`); ẩn khối founder ở About (`about.ts` → `founder.ready = false`); thêm dòng link footer sang sylvanusfinnian.com và sylvanusaudio.com. |
| `71bea34` | Title có từ khoá, ≤ 60 ký tự, EN + VI (`i18n` → `meta.titles`; demo → `work.ts` `seoTitle`); H1 trang Work và Services. |
| `206bf86` | FAQ `/services`: câu trả lời có sẵn trong HTML (`forceMount`, panel đóng cao 0 và ẩn với trình đọc màn hình, giao diện và hiệu ứng như cũ) + JSON-LD `FAQPage`. |
| `fd87872` | Trang demo: `og:url`, `og:locale` (+ alternate), kích thước `og:image`; VideoObject `uploadDate` = `2026-11-20T00:00:00+07:00`, `url`, `publisher.logo`. Organization: `@id`, `founder = {"@id": "https://sylvanusfinnian.com/#person"}`, `sameAs` lấy từ profile thật (đang rỗng). |
| `91e45d5` | e2e: URL cũ 301, FAQ + FAQPage + header trong HTML. |

Redirect: `stick-english-learning-app` → `sonic-logos`, `lantern-valley` → `echoes-of-the-nine-mountains`, `moon-lute-duel` → `echoes-asian-signature`, `calm-ledger` → `nhip-fintech-app` (cả `/vi/work/...`).

## Kiểm tra trên preview
- 8/8 URL cũ trả 301 đúng đích; `/about/`, `/vi/`, `/work/?utm_source=x` trả 301 về bản không có `/`.
- 12 trang chính: 200, title ≤ 60 ký tự, JSON-LD parse được, canonical + hreflang `en`/`vi`/`x-default` đúng, có HSTS + nosniff, không còn `[Founder name]` hay `href="#"`.
- `/services`: 6 câu hỏi FAQ, đủ câu trả lời trong HTML.
- Lint, typecheck, 26 unit test, build, e2e 18/18 (@remote) đều qua.

## Chữ hiển thị chờ anh duyệt
1. H1 `/work`: "Work" → **"Game and app sound portfolio"**; `/vi/work`: "Dự án" → **"Dự án âm thanh game và ứng dụng"**.
2. H1 `/services`: "Services" → **"Sound for games, apps and brands"**; `/vi/services`: "Dịch vụ" → **"Âm thanh cho game, ứng dụng và thương hiệu"**.
3. Footer: ẩn cột "Social / Mạng xã hội" (4 mục "Placeholder") cho tới khi có link thật. Không có chữ thay thế.
4. About: ẩn khối "The founder / Người sáng lập" ("[Founder name]", ảnh và tiểu sử placeholder) cho tới khi có thông tin thật. Không có chữ thay thế.
5. Dòng mới cuối footer: **"Founder's portfolio: sylvanusfinnian.com and sylvanusaudio.com"** / **"Hồ sơ người sáng lập: sylvanusfinnian.com và sylvanusaudio.com"**.
6. Title (tab + Google):
   - EN: "Tremola Studio | Game Sound Design and Sonic Branding" · "Game and App Sound Design Portfolio | Tremola Studio" · "Game Audio, UI Sound, Sonic Logo Pricing | Tremola Studio" · "Free Sound Audit for Games and Apps | Tremola Studio" · "Free Vietnamese Instrument Sample Pack | Tremola Studio" · "About Tremola Studio: Composer-Led Sound Studio in Vietnam".
   - VI: "Tremola Studio | Thiết kế âm thanh game và thương hiệu" · "Dự án âm thanh game và ứng dụng | Tremola Studio" · "Bảng giá âm thanh game, UI và logo âm thanh | Tremola Studio" · "Sound Audit miễn phí cho game và ứng dụng | Tremola Studio" · "Sample đàn tranh và nhạc cụ Việt miễn phí | Tremola Studio" · "Giới thiệu Tremola Studio: studio âm thanh tại Việt Nam".
   - Demo (EN / VI, + " | Tremola Studio"): Echoes: Adaptive Fantasy RPG Music / Echoes: nhạc tương tác cho game RPG fantasy · The Hospital: Horror Game Sound Design / The Hospital: âm thanh game kinh dị · Forma: Fitness App Sound and Sonic Logo / Forma: âm thanh cho app thể dục · Vietnamese Instruments for Games: Echoes / Nhạc cụ Việt trong game: Echoes · Catfluencer: Cozy Game Music and SFX / Catfluencer: nhạc và SFX game cozy · Sonic Logo Design for Four Brands / Thiết kế logo âm thanh cho 4 thương hiệu · Action Game Sound Redesign / Sound redesign game hành động · Nhịp: Fintech App UI Sound Design / Nhịp: thiết kế UI sound cho app tài chính.

Giữ nguyên: H1 trang chủ (tagline thương hiệu), H1 About, Sound Audit, Free Pack (đã có từ khoá), tên demo trên trang.

## Còn chờ
- Link profile thật → thêm vào `socialProfiles` (cột Social + `sameAs` tự hiện).
- Thông tin founder thật → điền `about.ts`, đặt `founder.ready = true`.
- Sau khi lên production: phiên "Kế hoạch SEO chi tiết" kiểm tra lại và yêu cầu Google index lại các URL đã sửa.
