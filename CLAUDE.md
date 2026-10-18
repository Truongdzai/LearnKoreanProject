# VyLing — hướng dẫn phát triển

Khi chủ dự án chỉ nhắn ngắn ("tiếp tục phát triển", "kiểm tra kĩ"…), hiểu yêu cầu đầy đủ là:

> Tự chọn và làm những phần mang lại nhiều giá trị nhất cho người học VyLing, ưu tiên tiếng Anh (ngôn ngữ đã ra mắt).
> Mỗi phần phải đúng nội dung, chạy ổn trên điện thoại và máy tính, không làm mất tiến độ của người học. Phải được
> kiểm tra bằng build, test và chạy thử trên trình duyệt, rồi rà soát lại trước khi đẩy lên. Không cần hỏi lại; chỉ
> dừng để hỏi khi việc đó khó đảo ngược hoặc chạm tới phần chủ dự án đang tự làm.

## Thứ tự ưu tiên

1. Lỗi đang làm hỏng trải nghiệm: chấm sai, mất tiến độ, trang trắng, tràn ngang trên điện thoại, lỗi bảo mật.
2. Lỗ hổng nội dung tiếng Anh: bài ngữ pháp chưa có phòng luyện, lỗi người Việt hay mắc chưa được luyện.
3. Gắn kết: lộ trình 12 tuần, phiên "Hôm nay", mục "Ôn câu sai", nút "Luyện thêm" trong bài học.
4. Trợ năng (WCAG AA, mỗi trang một h1, không nhảy cấp tiêu đề) và tốc độ tải.
5. Tiếng Hàn / tiếng Trung: đang đánh dấu "sắp có", chỉ sửa lỗi, chưa mở rộng.

## Quy trình mỗi vòng

1. Khảo sát code và dữ liệu thật trước khi đề xuất. Chọn 1–3 hạng mục cụ thể, nêu rõ "xong" nghĩa là gì.
2. Viết theo đúng khuôn có sẵn (xem mục Kiến trúc). Nội dung luyện tập do một người viết, một người khác soi từng
   câu để tìm câu có hơn một đáp án đúng; sửa hoặc bỏ câu đó.
3. Tích hợp đủ chỗ: tab, dải Phòng luyện, lộ trình, Ôn câu sai, mô tả trang (routes.ts + prerender.mjs).
4. Kiểm tra (mục Kiểm tra), rồi rà soát đối kháng phần vừa viết; sửa lỗi được xác nhận và kiểm tra lại.
5. Commit + push lên nhánh làm việc. Báo cáo ngắn: đã làm gì, kiểm tra ra sao, còn gì chưa làm.

## Ràng buộc

- Commit đứng tên `Quang Văn Trường <qvantruong205@gmail.com>`, lời commit tiếng Việt không dấu, viết thường.
  Không thêm dòng Co-Authored-By / Claude-Session, không ghi tên model.
- Chỉ push lên nhánh làm việc của phiên. Không gộp vào `main`, không deploy khi chủ dự án chưa bảo.
- Không sửa `frontend/src/core/constants/languages.ts` (ja / zh / ko vẫn `soon: true`).
- Tránh sửa các phần chủ dự án đang làm dở trên máy: từ vựng tiếng Anh (components/vocab), VocabQuiz, Sổ lỗi,
  giao diện gia sư AI, thư mục `docs/`.
- Mã server cho tiến độ (`/api/me/plans/<id>`): id chỉ gồm `a-z0-9_-`, tối đa 32 ký tự, tối đa 64 id mỗi tài khoản.

## Kiến trúc cần biết

- Frontend: React 18 + Vite + TypeScript (không dấu chấm phẩy, thụt 2 dấu cách, nháy đơn, chú thích tiếng Việt ngắn).
  Backend: FastAPI + SQLite. Worker Cloudflare trong `cf/`.
- Tiến độ người học: `useServerPlan(planId, localKey, normalize, isEmpty)` — lưu local, đẩy lên server khi đăng nhập.
- Phòng luyện tiếng Anh dạng điền chỗ trống: `frontend/src/features/english/<phòng>/` gồm `frames.ts` (id = câu tiếng
  Anh, `options[0]` là đáp án, `buildRound`, `filled`), `<X>Quiz.tsx` (export `view` dùng chung với Ôn câu sai, bọc
  `shared/BlankQuiz`), `<X>Lab.tsx`, `progress.ts` (`applyResults`, `finishRound`, `reviewDone`), `styles.css`.
  Khuôn mẫu: `passive/`. Phòng mới phải được đăng ký ở `GrammarHub.tsx` (PANES, LABS có nhóm, LESSON_LABS),
  `core/labScores.ts` (LabKey, SOURCES, LAB_KEYS, EN_REVIEW_KEYS, LAB_TARGET, LAB_NAME), `review/sources.ts` +
  `review/WeakReview.tsx`, `data/englishLabs.ts` (nhiệm vụ lộ trình).
- Nội dung câu luyện: đúng một đáp án với người bản xứ cả Anh lẫn Mỹ; phương án sai là lỗi người Việt hay mắc;
  câu tiếng Việt tự nhiên; mỗi nhóm ≥ 8 câu.

## Kiểm tra

- `npm run build --prefix frontend` — gồm check-counts, check-hanviet, check-content, check-labs (soát câu phòng
  luyện), tsc, vite, prerender.
- `python -m pytest -q backend/tests`
- Chạy thử trên trình duyệt (Playwright) ở 390px và 1280px, cả giao diện sáng và tối: không tràn ngang, không lỗi
  trang, chơi trọn một lượt ở phòng vừa sửa, các nút trong lộ trình mở đúng chỗ.
- Trợ năng: axe (color-contrast, heading-order, page-has-heading-one, nested-interactive) trên các trang vừa sửa.
