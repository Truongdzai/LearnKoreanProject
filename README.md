## VYLING.COM
**V – Voice**

Khám phá tiếng nói của bản thân.

Ngôn ngữ không chỉ là từ vựng hay ngữ pháp, mà là khả năng truyền đạt suy nghĩ, cảm xúc và câu chuyện của mỗi người.

**Y – Your Journey**

Mỗi người có một hành trình học tập khác nhau.

Vyling sử dụng AI để cá nhân hóa con đường học, giúp mỗi người học theo tốc độ, mục tiêu và phong cách riêng.

**LING – Language / Linguistics**

Thế giới của ngôn ngữ.

Ling được lấy cảm hứng từ:

**Language** – Ngôn ngữ
**Linguistics** – Ngôn ngữ học
**Lingo** – Cách nói, cách diễn đạt

## Đại diện cho:

**🌎 Đa ngôn ngữ**
**🗣️ Giao tiếp**

**🧠 Thấu hiểu văn hóa**

**📚 Khám phá tri thức**

**🌱 Ý nghĩa tổng thể của VYLING**

## VYLING = Voice + Your Journey + Language

Một nơi giúp bạn tìm thấy tiếng nói của chính mình, trên hành trình chinh phục mọi ngôn ngữ.

## 🤖 Triết lý sản phẩm

Vyling không chỉ là một ứng dụng học ngoại ngữ.

Đó là một người bạn đồng hành AI, giúp hàng triệu người trên thế giới:

**🎧 Nghe tự nhiên hơn**

**🗣️ Nói tự tin hơn**

**🎬 Học qua video thực tế**

**🤖 Luyện tập cùng AI cá nhân hóa**

**🌎 Kết nối với nhiều nền văn hóa hơn**

## 🎯 Phương pháp học cốt lõi
Listen → Repeat → Understand → Express
**🎧 Listen**

Nghe ngôn ngữ trong ngữ cảnh thực tế.

**🗣️ Repeat**

Luyện Shadowing, bắt chước phát âm và ngữ điệu.

**🧠 Understand**

Hiểu ý nghĩa, văn hóa và cách sử dụng.

**✨ Express**

Tự tin thể hiện suy nghĩ của bản thân.
## ✨ Tính năng chính

- **Phụ đề song ngữ tự động** — dán link YouTube tiếng Hàn, app tải phụ đề Hàn và dịch sang tiếng Việt.
- **Từ điển tích hợp** — bấm vào bất kỳ từ tiếng Hàn nào để xem nghĩa ngay. Dùng từ điển **KRDICT Hàn–Việt đóng gói sẵn**, chạy **offline**, tự nhận dạng dạng gốc của từ (tự lược bỏ tiểu từ và đuôi chia động từ). *Không cần cài Yomitan.*
- **Bộ thẻ ghi nhớ (SRS)** — lưu từ vừa tra thành thẻ, rồi ôn lại theo thuật toán lặp lại ngắt quãng (kiểu SM‑2): tự chấm *Lại / Khó / Tốt / Dễ*, app tự xếp lịch ôn lần sau.
- **Riêng tư, miễn phí** — toàn bộ lịch sử học và thẻ từ lưu trong SQLite ngay trên máy bạn, không gửi đi đâu.
- **(Tuỳ chọn) Xuất sang Anki** — nếu thích, vẫn có thể đẩy thẻ sang Anki qua AnkiConnect.

---

## 🧱 Công nghệ & kiến trúc

| Thành phần | Công nghệ | Thư mục |
|---|---|---|
| Backend (API + phục vụ giao diện) | Python · FastAPI | `backend/` |
| Frontend (giao diện) | React 18 · TypeScript · Vite | `frontend/` |
| Cơ sở dữ liệu | SQLite (tự tạo ở `data/hanquan.db`) | `data/` |
| Từ điển | KRDICT Hàn–Việt (đóng gói sẵn) | `dictionaries/` |

Khi chạy thật, **backend phục vụ luôn bản React đã build** → chỉ **1 cửa sổ, 1 cổng `8000`**.

---

## ✅ Yêu cầu (chỉ kiểm tra 1 lần)

- **Windows**
- **Python 3.11 trở lên** (bắt buộc — app dùng `tomllib`)
- **Node.js 18 trở lên** (đã kèm `npm`)

---

## 🚀 Cài đặt lần đầu

Mở **PowerShell** ngay trong thư mục dự án rồi chạy lần lượt 4 bước:

```powershell
# 1) Tạo môi trường ảo Python và cài thư viện backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt

# 2) Cài thư viện cho giao diện React
npm install --prefix frontend

# 3) Build giao diện (tạo frontend/dist để backend phục vụ)
npm run build --prefix frontend

# 4) Tạo file cấu hình từ mẫu, rồi điền API key (xem mục Cấu hình)
Copy-Item config.example.toml config.toml
```

> 💡 Bước 2–3 cũng có thể làm nhanh bằng cách **bấm đúp `build.bat`** (sau khi đã cài Node).
> Chưa có API key vẫn chạy được app và **tra từ điển** bình thường — chỉ là phụ đề sẽ **không tự dịch** cho tới khi bạn điền key Gemini vào `config.toml`.

Xong phần cài đặt. Từ giờ mỗi ngày chỉ cần **`start.bat`**.

---

## ▶️ Chạy hằng ngày (cách khuyên dùng)

Bấm đúp **`start.bat`** → trình duyệt tự mở **http://127.0.0.1:8000**

Giao diện và API chạy chung **1 cổng `8000`**. Muốn dừng: nhấn **`Ctrl + C`** trong cửa sổ đen.

---

## 📖 Cách dùng

1. **Trang chủ** — dán link YouTube tiếng Hàn rồi tạo bài học. App tải phụ đề Hàn và dịch sang Việt (phụ đề song ngữ).
2. **Khi học** — bấm vào một từ tiếng Hàn bất kỳ để hiện nghĩa, rồi bấm **“Lưu từ này”** để thêm vào bộ thẻ.
3. **Ôn tập** — vào mục **Ôn tập**, ôn các thẻ tới hạn và tự chấm *Lại / Khó / Tốt / Dễ*; app tự sắp lịch ôn lần sau.
4. **Trạng thái** — xem tổng số thẻ, số thẻ tới hạn, số thẻ đã ôn hôm nay…

---

## 🔧 Khi sửa code giao diện React

Bấm đúp **`build.bat`** (build lại `frontend/dist`), rồi chạy **`start.bat`**.

## 🧪 Chế độ phát triển — hot reload (chỉ khi lập trình)

> ⚠️ **Quan trọng:** chế độ dev có **2 server**. Vite (cổng **5173**) chỉ lo giao diện; mọi lệnh `/api` được **chuyển sang backend cổng 8000**. **Phải bật cả hai**, nếu không sẽ thấy lỗi **500**.

Mở 2 cửa sổ PowerShell:

```powershell
# Cửa sổ 1 — Backend (cổng 8000)
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --port 8000

# Cửa sổ 2 — Frontend (cổng 5173, hot reload)
npm run dev --prefix frontend
```

Rồi mở **http://localhost:5173**. Ngại rắc rối thì cứ dùng **`start.bat`** (1 cổng, không cần dev mode).

---

## 🔌 Danh sách API

| Phương thức | Đường dẫn | Việc |
|---|---|---|
| `GET`  | `/api/health` | Kiểm tra tình trạng hệ thống |
| `POST` | `/api/transcript` | Lấy phụ đề Hàn từ link YouTube + dịch sang Việt |
| `GET`  | `/api/define?word=…` | Tra một từ trong từ điển tích hợp |
| `POST` | `/api/srs/add` | Thêm thẻ vào bộ ôn tập (`front`, `back`, `source`) |
| `GET`  | `/api/srs/due` | Lấy danh sách thẻ tới hạn + thống kê |
| `POST` | `/api/srs/review` | Chấm điểm một thẻ (`card_id`, `rating` 1–4) |
| `GET`  | `/api/srs/stats` | Thống kê bộ thẻ |
| `POST` | `/api/mine` | (Tuỳ chọn) Đẩy thẻ sang Anki qua AnkiConnect |

---

## ⚙️ Cấu hình — `config.toml`

`config.toml` chứa khoá API nên **không được đưa lên git** (đã có trong `.gitignore`). File mẫu là `config.example.toml` — cứ copy ra rồi sửa.

```toml
[llm]
# "Bộ não" AI: dùng để dịch phụ đề (và sau này là gia sư).
provider = "gemini"
api_key  = "DÁN_KEY_GEMINI_CỦA_BẠN_VÀO_ĐÂY"
model    = "gemini-2.5-flash"

[anki]
# Chỉ cần nếu bạn muốn đẩy thẻ sang Anki.
url       = "http://127.0.0.1:8765"
deck      = "TiengHan"
note_type = "HanQuan"

[whisper]
# Dành cho tính năng chấm phát âm sau này.
model = "small"
```

> 🔑 **Lấy API key Gemini** ở **Google AI Studio** (miễn phí) rồi dán vào mục `[llm]`.

**Tuỳ chọn — dùng Anki:** cài add‑on **AnkiConnect** (mã `2055492159`) và mở Anki khi học; khi đó tính năng đẩy thẻ sang Anki mới hoạt động. *Không bắt buộc — app đã có bộ thẻ ôn tập riêng.*

---

## 🆘 Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách xử lý |
|---|---|---|
| Mở app thấy trang trắng | Chưa build giao diện (`frontend/dist` chưa có) | Chạy `build.bat`, rồi `start.bat` |
| Console báo **500** ở `/api/...` | Backend (cổng 8000) chưa chạy | Bật backend, hoặc chỉ cần dùng `start.bat` |
| Báo **400** kèm chữ “lỗi 429” | YouTube tạm giới hạn tải phụ đề | Đợi vài phút rồi thử lại |
| “Không tìm thấy nội dung phụ đề” | Video thiếu phụ đề tiếng Hàn | Chọn video khác (xem **Kho video** trong app) |
| Phụ đề không được dịch sang Việt | Chưa điền API key Gemini trong `config.toml` | Điền key vào mục `[llm]` rồi tạo lại bài học |

---

## 📂 Cấu trúc dự án

```
LearnKorean/
├─ backend/                  # 🐍 Python (FastAPI) — API + phục vụ React build
│  ├─ main.py                #   khởi chạy app, gắn router, mount frontend/dist
│  ├─ config.py              #   đọc config.toml (kèm giá trị mặc định)
│  ├─ db.py                  #   SQLite: tạo bảng + kết nối
│  ├─ routers/               #   điểm cuối API
│  │  ├─ learn.py            #     /api/transcript, /api/mine
│  │  ├─ dict.py             #     /api/define
│  │  └─ srs.py              #     /api/srs/*
│  ├─ schemas/               #   model dữ liệu vào/ra (pydantic)
│  ├─ services/              #   nghiệp vụ: youtube, translate, dictionary,
│  │                         #   srs, llm, ankiconnect, media, health
│  └─ requirements.txt       #   thư viện Python (bản ghim phiên bản)
├─ frontend/                 # ⚛️ React + TypeScript (Vite)
│  ├─ src/
│  │  ├─ main.tsx · App.tsx  #   điểm vào + bố cục/điều hướng
│  │  ├─ config/             #   biến môi trường (VITE_API_BASE)
│  │  ├─ core/               #   dùng chung: api/, components/, constants/, utils/
│  │  ├─ models/             #   kiểu dữ liệu (lesson, video, dict, srs, health)
│  │  ├─ hooks/              #   React hooks (useYouTubePlayer)
│  │  ├─ store/              #   trạng thái toàn cục (React Context)
│  │  ├─ providers/          #   bọc app (ErrorBoundary, store)
│  │  ├─ layout/             #   Sidebar, Topbar
│  │  ├─ features/           #   theo trang: home, learn, library, review,
│  │  │                      #   dashboard, shared
│  │  ├─ data/               #   videos.ts (kho video), sampleLesson.ts
│  │  └─ styles/globals.css  #   giao diện
│  ├─ vite.config.ts         #   alias @/ → src, proxy /api → :8000
│  └─ dist/                  #   bản build (backend phục vụ — KHÔNG sửa tay)
├─ dictionaries/             # 📖 Từ điển KRDICT Hàn–Việt (đóng gói sẵn)
├─ data/                     # 💾 SQLite + media + backup (của bạn — không lên git)
├─ config.example.toml       # 🔑 mẫu cấu hình — copy thành config.toml
├─ requirements.txt          # thư viện Python (dùng khi cài đặt)
├─ start.bat                 # ▶ chạy app (cổng 8000)
└─ build.bat                 # 🔧 build lại React
```

---

## ➕ Muốn thêm tính năng sau này? (thêm vào đâu)

- **API mới** → tạo file trong `backend/routers/` rồi khai báo ở `backend/main.py`.
- **Nghiệp vụ mới** (vd: chấm phát âm) → tạo `backend/services/<tên>.py`.
- **Model dữ liệu** (body request/response) → `backend/schemas/`.
- **Trang/giao diện mới** → tạo trong `frontend/src/features/<tên>/` rồi gắn vào `App.tsx`. Thành phần UI dùng lại đặt ở `frontend/src/core/components/`.
- **Kiểu dữ liệu mới** → `frontend/src/models/`.

---

## 🗺️ Lộ trình

- **Phase 0 ✅** Môi trường + khung dự án
- **Phase 1 ✅** Video → phụ đề Hàn–Việt song ngữ
- **Phase 2 ✅** Từ điển tích hợp (bấm để tra từ ngay trong app)
- **Phase 3 ✅** Bộ thẻ ghi nhớ SRS (lưu & ôn tập ngay trong app)
- **Phase 4 ⏳** Shadowing + chấm phát âm (Whisper)
- **Phase 5 ⏳** Gia sư AI & Roleplay (Gemini)
- **Phase 6 ⏳** TOPIK Trainer
- **Phase 7 ⏳** Dashboard tiến độ nâng cao + sao lưu tự động
