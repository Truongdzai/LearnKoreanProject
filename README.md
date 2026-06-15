# 🇰🇷 Trường Học Ngoại Ngữ — Học tiếng Hàn qua video

Website học tiếng Hàn chạy **cục bộ trên máy bạn**, **0 đồng**, dữ liệu của riêng bạn.

**Kiến trúc:** Backend Python (FastAPI) ở `backend/` + Giao diện React + TypeScript (Vite) ở `frontend/`.
Khi chạy thật, **backend phục vụ luôn React đã build** → chỉ 1 cửa sổ, 1 cổng (8000).

---

## ▶️ Chạy hằng ngày (cách khuyên dùng)

Bấm đúp **`start.bat`** → trình duyệt tự mở **http://127.0.0.1:8000**

Mọi thứ (giao diện + API) chạy chung **1 cổng 8000**. Dừng: `Ctrl + C` trong cửa sổ đen.

## 🔧 Khi sửa giao diện React

Bấm đúp **`build.bat`** (build lại `frontend/dist`), rồi chạy `start.bat`.

## 🧪 Chế độ phát triển — hot reload (chỉ khi lập trình)

> ⚠️ **Quan trọng:** chế độ dev có **2 server**. Vite (cổng **5173**) chỉ lo giao diện; mọi lệnh `/api` được **chuyển sang backend cổng 8000**. **Phải bật cả hai**, nếu không sẽ thấy lỗi **500** (không gọi được backend).

Mở 2 cửa sổ:
1. Backend: `".venv\Scripts\python.exe" -m uvicorn backend.main:app --port 8000`
2. Frontend: `npm run dev --prefix frontend` → mở http://localhost:5173

Ngại rắc rối thì cứ dùng **`start.bat`** (1 cổng 8000, không cần dev mode).

## 🆘 Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách xử lý |
|---|---|---|
| Console báo **500** ở `/api/...` | Backend (cổng 8000) chưa chạy | Bật backend, hoặc chỉ cần dùng `start.bat` |
| Báo **400** kèm chữ "lỗi 429" | YouTube tạm giới hạn tải phụ đề | Đợi vài phút rồi thử lại |
| "Video này không có phụ đề tiếng Hàn" | Video thiếu phụ đề Hàn | Chọn video khác (xem **Kho video** trong app) |

## ✅ Thiết lập 1 lần

- **Anki**: cài add-on **AnkiConnect** (mã `2055492159`); mở Anki khi học để app tạo thẻ.
- **Trình duyệt**: tiện ích **asbplayer** + **Yomitan** (đã có từ điển KO–VI ở `dictionaries/`).
- **config.toml**: đã cấu hình **Gemini** làm "bộ não" AI (dịch, và sau này là gia sư).
- **Cài lại thư viện Python (nếu cần):** `".venv\Scripts\pip" install -r backend\requirements.txt`

## 📂 Cấu trúc dự án

```
LearnKorean/
├─ backend/                 # 🐍 Backend Python (FastAPI)
│  ├─ main.py               #   khởi chạy: API + phục vụ React build
│  ├─ config.py, db.py      #   cấu hình tập trung + SQLite
│  ├─ routers/              #   điểm cuối API — learn.py: /api/transcript, /api/mine
│  ├─ schemas/              #   model dữ liệu vào/ra (pydantic)
│  ├─ services/             #   nghiệp vụ: youtube, translate, llm, ankiconnect, health, media
│  └─ requirements.txt      #   thư viện Python
├─ frontend/                # ⚛️ Giao diện React + TypeScript (Vite)
│  ├─ src/
│  │  ├─ main.tsx · App.tsx #   điểm vào + bố cục/điều hướng
│  │  ├─ config/            #   biến môi trường
│  │  ├─ core/              #   dùng chung: api/, components/ (UI), constants/, utils/
│  │  ├─ models/            #   kiểu dữ liệu domain (Lesson, Video, HealthCheck)
│  │  ├─ types/             #   kiểu dùng chung (barrel)
│  │  ├─ hooks/             #   React hooks (useYouTubePlayer)
│  │  ├─ store/             #   trạng thái toàn cục (React Context)
│  │  ├─ providers/         #   bọc app (ErrorBoundary, store)
│  │  ├─ layout/            #   Sidebar, Topbar
│  │  ├─ features/          #   theo trang: home, learn, library, dashboard, shared
│  │  ├─ data/videos.ts     #   kho video tiếng Hàn đã chọn lọc
│  │  └─ styles/globals.css #   giao diện (theme mint)
│  ├─ tsconfig.json         #   cấu hình TypeScript (alias @/ → src/)
│  └─ dist/                 #   bản build (backend phục vụ — KHÔNG sửa tay)
├─ data/                    # 💾 SQLite + dữ liệu học (tài sản của bạn)
├─ dictionaries/            # 📖 Từ điển Yomitan KO–VI
├─ .venv/                   # Môi trường Python
├─ config.toml             # 🔑 Cấu hình + API key (không lên git)
├─ start.bat               # ▶ chạy app
└─ build.bat               # 🔧 build lại React
```

## ➕ Muốn thêm tính năng sau này? (thêm vào đâu)

- **API mới** → tạo file trong `backend/routers/` + khai báo ở `backend/main.py`.
- **Nghiệp vụ mới** (vd: chấm phát âm) → tạo `backend/services/<tên>.py`.
- **Model dữ liệu** (body request/response) → `backend/schemas/`.
- **Trang/giao diện mới** → tạo trong `frontend/src/features/<tên>/` rồi gắn vào `App.tsx`. Thành phần UI dùng lại đặt ở `frontend/src/core/components/`.
- **Kiểu dữ liệu mới** → `frontend/src/models/` (domain) hoặc `frontend/src/types/`.

## 🗺️ Lộ trình

- **Phase 0 ✅** Môi trường + khung dự án
- **Phase 1 ✅** Video → phụ đề song ngữ → mine vào Anki
- **Phase 2 ⏳** Shadowing + chấm phát âm (Whisper)
- **Phase 3 ⏳** Gia sư AI & Roleplay (Gemini)
- **Phase 4 ⏳** TOPIK Trainer
- **Phase 5 ⏳** Dashboard tiến độ + sao lưu tự động
