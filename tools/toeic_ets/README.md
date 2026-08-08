# Nhập đề ETS 2026 vào app

Đọc tài liệu trong `TailieuToeic/` rồi sinh dữ liệu cho khối "Đề thật ETS 2026"
ở trang Luyện thi TOEIC.

## Chạy

```bash
.venv/Scripts/python.exe tools/toeic_ets/build.py             # cả 10 đề (JSON + audio + ảnh Part 1)
.venv/Scripts/python.exe tools/toeic_ets/build.py 3           # chỉ đề 3
.venv/Scripts/python.exe tools/toeic_ets/build.py --no-audio  # bỏ bước chép 388 MB audio
.venv/Scripts/python.exe tools/toeic_ets/graphics.py --write  # cắt 50 hình "Look at the graphic" + gắn vào JSON
```

Kiểm tra: `python tools/toeic_ets/audit.py` (**chạy sau mỗi lần build**) ·
`python tools/toeic_ets/check_lc.py` (phần Nghe) ·
`python tools/toeic_ets/bundle.py check` (đủ file media chưa).

## Đầu ra

| Đích | Nội dung |
|---|---|
| `frontend/src/data/english/toeic/ets/tNN.json` | Part 1–7 của từng đề |
| `frontend/src/data/english/toeic/ets/index.json` | Danh sách đề cho màn hình chọn |
| `media/toeic/ets/tNN/*.mp3` | 54 file audio gốc mỗi đề |
| `media/toeic/ets/tNN/p1-*.webp` | 6 ảnh Part 1 mỗi đề, cắt từ sách quét |
| `media/toeic/ets/tNN/g-*.webp` | 5 hình "Look at the graphic" mỗi đề (nhóm 62 · 65 · 68 · 95 · 98) |
| `media/toeic/ets/tNN/rc-*.webp` | Ảnh đoạn văn Part 6/7, đặt tên `rc-<câu đầu>-<thứ tự>.webp`; đuôi `-scanN` là bản cắt từ sách quét |

Media nằm ở `media/` (backend mount `/media`) chứ không ở `frontend/public/`, để 396 MB
không bị Vite chép lại mỗi lần build.

**Cả hai đích đều loại khỏi git** (`.git/info/exclude`) vì là tài liệu có bản quyền của ETS.
Frontend dùng `import.meta.glob` nên bản checkout thiếu thư mục `ets/` vẫn build được và khối
ETS tự ẩn. Cách đưa dữ liệu sang máy khác: xem `bundle.py` và `docs/DEPLOYMENT.md` §3b.

## Các file

| File | Việc |
|---|---|
| `pdftext.py` | Đường dẫn tới tài liệu nguồn |
| `layout.py` | Dựng lại bảng từ PDF có lớp chữ: tách cột, gộp ô tràn trang |
| `lc.py` | Bóc Part 1–4 từ PDF Listening (transcript, câu hỏi, đáp án, bản dịch) |
| `rc.py` | Bóc Part 5–7 từ PDF Reading theo dòng chảy văn bản |
| `answer_keys.py` | **Đáp án chính thức 101–200**, đọc từ ảnh `KEY READING/*.heic` |
| `scans.py` | Ghép các dải ảnh của một trang sách quét thành một trang hoàn chỉnh |
| `regions.py` | Tìm vùng ảnh trên trang quét (cắt watermark, dò khối ảnh) |
| `photos.py` | Cắt 6 ảnh Part 1 mỗi đề từ `ETS 2026- LC.pdf` |
| `graphics.py` | Cắt 5 hình "Look at the graphic" mỗi đề từ ảnh chụp trang trong `TailieuToeic/` |
| `rc67.py` | Part 6/7: bóc câu + phương án từ lớp chữ, lấy ảnh đoạn văn nhúng sẵn trong PDF key, ghép đoạn ↔ nhóm câu |
| `rcscan.py` | Cắt đoạn văn bộ 176–200 từ sách quét cho các bộ mà PDF key nhúng thiếu ảnh |
| `clean.py` | Cắt phần chữ tràn giữa hai cột: đuôi phương án, chữ đáp án + bản dịch dính vào, chọn đúng bộ mốc (A)…(D) |
| `audit.py` | Soát dữ liệu đã sinh: phương án rỗng / dài / lẫn tiếng Việt / dính đuôi lạ / trùng nhau, câu thiếu |
| `fixes.py` | Các câu chép tay từ sách quét (lớp chữ PDF hỏng), áp lại mỗi lần build |
| `passages.py` | *(không dùng nữa)* cắt đoạn văn từ sách quét — `rc67.py` thay thế |
| `build.py` | Ghép lại, gắn đường dẫn media, ghi JSON, chép file |
| `bundle.py` | Đóng gói / giải nén / kiểm tra dữ liệu để chuyển sang máy khác |

## Nguồn đáp án

Phần Nghe lấy từ **cột "Đáp án"** trong PDF Listening — cột riêng, có cấu trúc, `check_lc.py`
xác nhận đủ 100 câu ở cả 10 đề.

Phần Đọc lấy từ **ảnh đáp án chính thức** (`KEY READING/*.heic`, đã đọc và chép vào
`answer_keys.py`). Không dùng chữ "Chọn (X)" trong phần giải thích làm nguồn chính vì mỗi đề
viết một kiểu và Part 7 nhiều câu bỏ trống — chỉ dùng để **đối chiếu chéo**: 542 câu so được,
**khớp 97.4%**, 14 câu lệch đều là do bóc nhầm từ giải thích của câu bên cạnh, không phải sai
đáp án. `build.py` ghi các câu lệch vào `gaps.keyDisputed` của từng đề.

## Cách `rc67.py` ghép đoạn văn với nhóm câu

Ba nguồn trong cùng một file PDF key, mỗi nguồn đọc bằng một cách:

1. **Câu + phương án** — `page.extract_text()` chế độ thường (KHÔNG dùng `extraction_mode="layout"`:
   chế độ layout chèn khoảng trắng vào giữa từ, "flash-frozen" thành "flash-fr ozen"). Chuỗi luôn
   theo khuôn `<số> <đề tiếng Anh> (A)…(D) <chữ đáp án> <đề tiếng Việt> (A)…(D)`, cắt phần tiếng
   Việt tại từ đầu tiên có dấu. Dò số câu bằng quy hoạch động chọn dãy vị trí tăng dần — nếu bám
   tham lam thì một số bị bóc nhầm (ví dụ "150" trong bảng giá) sẽ kéo tuột toàn bộ các câu sau.
2. **Đoạn văn** — ảnh nhúng sẵn trong PDF key (bản sạch, không phải sách quét). Lọc banner đầu
   trang bằng cách bỏ mọi kích thước ảnh xuất hiện ở hơn 40% số trang.
3. **Thứ tự đoạn ↔ câu** — `extract_text(visitor_operand_before=…, visitor_text=…)` cho toạ độ
   `y` của cả ảnh (`cm[5]` khi gặp lệnh `Do`) lẫn chữ (`cm[5]+tm[5]`). Không có bước này thì không
   biết ảnh nằm trên hay dưới các câu trên cùng một trang, và ranh giới các bộ lệch hàng loạt.

Mốc "Questions 165-167" in trong sách **không đáng tin** (nhiều đề in thiếu, đề 8 in sai — câu 164
có tham chiếu `(164)` nằm trong chính đoạn văn của bộ 165-167). Chỉ dùng để đối chiếu:
`collect()` trả `headingOff` liệt kê chỗ lệch.

## Vá đoạn văn thiếu bằng sách quét (`rcscan.py`)

PDF key nhúng thiếu ảnh ở 21 bộ (chủ yếu bộ đọc ba 186–200). Lấy bù từ `ETS 2026- RC.pdf`
được vì sách quét có bố cục **giống hệt nhau ở cả 10 đề**: mỗi đề đúng **30 trang**, bìa nằm ở
bội số của 30, và vị trí từng bộ cố định:

| Bộ | Trang đoạn văn (offset trong đề) | Trang câu hỏi |
|---|---|---|
| 176–180 | 19 | 20 |
| 181–185 | 21 | 22 |
| 186–190 | 23 + đầu trang 24 | 24 |
| 191–195 | 25 + đầu trang 26 | 26 |
| 196–200 | 27 + đầu trang 28 | 28 |

Hai phép đo trên trang quét:
- **Bỏ banner**: trang luôn cao đúng `banner + 3335px` nội dung, vài trang bị nhân đôi banner nên
  lấy `chiều cao − 3335` thay vì hằng số cứng.
- **Cắt phần đoạn văn ở trang câu hỏi**: tìm **rãnh trắng giữa hai cột** — xác định toạ độ `x` của
  rãnh ở 1/3 dưới trang (chắc chắn là vùng câu hỏi) rồi lấy **khoảng trắng dài nhất** theo trục
  dọc tại `x` đó. Dò từ trên xuống thì dính khoảng trắng trong đoạn văn; dò từ dưới lên thì vướng
  dòng "Stop! This is the end of the test".

## Những gì `clean.py` phải cắt

Lớp chữ của PDF key xếp **đề tiếng Anh và bản dịch tiếng Việt cạnh nhau**, nên phần sau hay
tràn vào phần trước. Các mốc cắt, theo thứ tự hay gặp:

| Rác dính vào | Ví dụ thật | Mốc cắt |
|---|---|---|
| Cả phần còn lại của tài liệu | câu 130 dài 13 000 ký tự | trần 180 ký tự + mốc bên dưới |
| Chữ đáp án + bản dịch | `…the Daily Gazette. A Có thể kết luận…` | chữ `[A-D]` đứng một mình mà phía sau có chữ có dấu |
| Bản dịch | `carry out D Trong email, từ "conduct"…` | từ có dấu đầu tiên |
| Phần giải nghĩa | `Before long Now that:` · `verify (v):` | cụm viết hoa + dấu hai chấm |
| Câu kế / phương án kế | `… 132. (A) years` | số câu hoặc `(X)` kế tiếp |
| Đoạn văn kế | `… 2. Email To: Cindy Weaver` | mục đánh số |

Hai chỗ dễ sai khi siết luật: bộ dò tiếng Việt **không được tính `é à ó`** (`résumé`, `café` là
từ tiếng Anh), và luật cắt phần giải nghĩa **phải có khoảng trắng phía trước**, nếu không
`"Before long Now that:"` bị cắt sạch thành rỗng.

## Chép tay 20 câu (`fixes.py`)

20 câu lớp chữ PDF key hỏng đúng chỗ nên không bóc được. Sách quét vẫn đọc rõ nên chép tay
vào `fixes.READING`, `build.py` chèn lại mỗi lần chạy. Đáp án vẫn lấy từ `answer_keys.py`
như mọi câu khác — `fixes.py` chỉ chứa đề bài và 4 phương án.

Vị trí trang trong sách quét (offset trong đề, đề `t` bắt đầu ở trang `30·(t−1)`):

| Phần | Trang |
|---|---|
| Part 5 (101–130) | 1 · 2 · 3 |
| Part 6 (131–146) | 4 · 5 · 6 · 7 |
| Part 7 đoạn đơn (147–175) | 8 → 18 |
| Part 7 đoạn đôi/ba (176–200) | 19 → 28 |
