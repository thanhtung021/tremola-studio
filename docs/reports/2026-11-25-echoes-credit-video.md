# 25/11/2026 — Video Echoes ghi đúng "dự án thật"

**Việc đã làm (nhánh `feat/echoes-real-credit`)**
- 4 video demo Echoes (Echoes of the Nine Mountains EN/VI, Echoes · Asian Signature EN/VI) dựng lại: bỏ dòng "Original concept",
  nay ghi "Music & sound by Tremola Studio for Echoes of the Nine Mountains." (VI: "Âm nhạc & âm thanh Tremola Studio làm cho Echoes of the Nine Mountains.").
- Đã tải lên R2 bằng `process-audio.mjs --demos-only --upload` (khoá mới có mã băm, bản cũ vẫn còn nên web đang chạy không bị ảnh hưởng).
- `src/content/media-manifest.json`: chỉ đổi 4 khoá video Echoes + `generatedAt`.
- Poster giữ nguyên (khung màn hình tiêu đề game, không có chữ ghi công).
- Nội dung trang (`src/data/work.ts`) đã ghi Echoes là dự án thật từ trước, không sửa.

**Kiểm tra:** lint 0 lỗi (11 cảnh báo cũ) · tsc OK · test 26/26 · build OK · 2 file mới trên tremolastudio.com/media trả 200.

**Chờ owner:** đồng ý push + deploy production (lần deploy này cũng đưa lên commit 01fab6b — hồ sơ công khai YouTube/Fiverr/itch cho Footer + sameAs).
