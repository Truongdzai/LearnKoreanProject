# Nhập đề ETS 2026 vào app

Đọc tài liệu trong `TailieuToeic/` rồi sinh dữ liệu cho khối "Đề thật ETS 2026"
ở trang Luyện thi TOEIC.

## Chạy

```bash
.venv/Scripts/python.exe tools/toeic_ets/build.py             # cả 10 đề (JSON + audio + ảnh Part 1)
.venv/Scripts/python.exe tools/toeic_ets/build.py 3           # chỉ đề 3
.venv/Scripts/python.exe tools/toeic_ets/build.py --no-audio  # bỏ bước chép 388 MB audio
```

Kiểm tra: `python tools/toeic_ets/check_lc.py` (phần Nghe) ·
`python tools/toeic_ets/bundle.py check` (đủ file media chưa).

## Đầu ra

| Đích | Nội dung |
|---|---|
| `frontend/src/data/english/toeic/ets/tNN.json` | Part 1–5 của từng đề |
| `frontend/src/data/english/toeic/ets/index.json` | Danh sách đề cho màn hình chọn |
| `media/toeic/ets/tNN/*.mp3` | 54 file audio gốc mỗi đề |
| `media/toeic/ets/tNN/p1-*.webp` | 6 ảnh Part 1 mỗi đề, cắt từ sách quét |

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
| `passages.py` | *(dở dang)* cắt đoạn văn Part 6/7 từ `ETS 2026- RC.pdf` |
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

## Còn thiếu

- **Part 6 + Part 7** (70 câu/đề) — câu hỏi và phương án bóc được ~95%, đáp án đã có đủ từ ảnh
  key, nhưng **đoạn văn** thì: PDF giải thích chỉ nhúng 21–27 / 27 đoạn mỗi đề, còn cắt từ sách
  quét thì vướng bóng gáy sách và tab "TEST n" ở mép phải làm hỏng phép dò lề (`passages.py`).
- **Câu "Look at the graphic"** (2 câu Part 3 + 2 câu Part 4 mỗi đề) — thiếu bảng/biểu đồ, app
  đang hiện cảnh báo trong lúc làm bài.
