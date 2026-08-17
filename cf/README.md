# VyLing trên Cloudflare

Lớp tích hợp Cloudflare cho VyLing. **Toàn bộ thư mục này là code MỚI, thêm vào.**
Không có dòng nào trong `backend/` bị sửa, và `frontend/` chỉ thêm file mới cộng
4 chỗ móc nối được liệt kê ở cuối.

---

## 1. Kiến trúc: vì sao KHÔNG port backend sang Workers

Điều đầu tiên cần nói rõ, vì nó quyết định mọi thứ còn lại.

`backend/` là **Python + FastAPI + SQLite + ffmpeg + yt-dlp + từ điển KRDICT offline**
(10.600 dòng, 82 file, DB 24 MB, media 420 MB). Workers chạy isolate JS/WASM —
không có Python runtime đầy đủ, không có filesystem ghi được, không có ffmpeg.
Port sang Workers nghĩa là **viết lại toàn bộ backend**, tức là đúng thứ bạn dặn
tuyệt đối không làm.

Nên cách làm ở đây là ngược lại: backend chạy **y nguyên** trong Cloudflare Sandbox
(container Linux, GA từ 04/2026), Worker chỉ đứng trước.

```
Người dùng
    │
    ▼
┌─────────────────────── Cloudflare Worker (edge) ────────────────────────┐
│  src/app.ts                                                             │
│    /mcp, /sse      → MCP server  (Claude & client MCP ngoài cắm vào)     │
│    /agents/*       → Agent Flue  (Durable Object riêng, state bền)       │
│    /cf/ping        → liveness edge, không đánh thức container            │
│    * (còn lại)     → chuyển thẳng xuống dưới, KHÔNG đụng vào             │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │ reverse proxy
                               ▼
              ┌──── Cloudflare Sandbox (container Linux) ────┐
              │  uvicorn backend.main:app --port 8000        │
              │  ↑ NGUYÊN VẸN app hiện tại                   │
              │  /api/*, /media/*, SPA, sitemap.xml…         │
              └──────────────────────────────────────────────┘
```

Mọi URL cũ vẫn do chính `backend/` trả lời. Nếu gỡ Worker đi, app chạy y như trước.

---

## 2. File trong thư mục này

| File | Việc |
|---|---|
| `wrangler.jsonc` | Cấu hình Worker: Sandbox container, Durable Object, migration, AI, R2, Worker Loader |
| `Dockerfile` | Image chạy backend FastAPI (base `cloudflare/sandbox:0.7.0-python` + ffmpeg) |
| `Dockerfile.dockerignore` | Chặn media/, data/, config.toml… khỏi image — **tên file quan trọng, xem §12** |
| `vite.config.ts` | `flue()` → `codemode()` → `cloudflare()` (thứ tự bắt buộc) |
| `src/app.ts` | Bản đồ route |
| `src/legacy-proxy.ts` | Khởi động uvicorn trong sandbox + reverse proxy |
| `src/cloudflare.ts` | Export Durable Object class ra Worker entry |
| `src/mcp/tools.ts` | 8 tool MCP, mỗi tool ánh xạ 1-1 với endpoint đang chạy |
| `src/mcp/server.ts` | MCP server (Durable Object) |
| `src/codemode/vyling.codemode.ts` | Connector Code Mode dùng chung schema với MCP |
| `src/codemode/runtime.ts` | Runtime Code Mode (log bền, phê duyệt, rollback) |
| `src/agents/vyling-tutor.ts` | Agent Flue, cắm vào MCP của chính nó |
| `ai-search/build-corpus.mjs` | Xuất corpus từ SQLite → NDJSON |
| `ai-search/ai-search.jsonc` | Cấu hình tham chiếu cho instance AI Search |
| `flue.config.ts` | Giới hạn nhà cung cấp model — xem §11 |
| `src/asr/whisper.ts` | Nhận diện giọng nói bằng Workers AI Whisper |
| `src/agents/vyling-ops.ts` | Agent trực ca (chỉ đọc) |
| `src/ops/scheduled.ts` | Handler Cron Trigger — agent vận hành dự án |
| `litestream.yml` | Cấu hình sao lưu liên tục SQLite → R2 (xem §20) |
| `start-backend.sh` | Khôi phục DB rồi chạy uvicorn dưới quyền Litestream |
| `src/waiting.ts` | Trang chờ cold start thay cho trang lỗi Cloudflare (§21) |
| `src/lessons.ts` | Bài học dựng sẵn phục vụ thẳng từ R2 ở edge (§23) |
| `src/dict.ts` | Tra từ tiếng Anh miễn phí ở edge, cache R2 (§24) |
| `src/site.ts` | Phục vụ SPA thẳng từ R2 ở edge (§26) |

---

## 3. Chạy thử và deploy

```bash
npm install --prefix cf
```

```bash
npm run dev --prefix cf
```

```bash
npm run deploy --prefix cf
```

Secrets (KHÔNG để trong `wrangler.jsonc`):

```bash
npx wrangler secret put LLM_API_KEY --cwd cf
```

Dữ liệu nặng nạp lên R2 một lần:

```bash
npx wrangler r2 bucket create vyling-media
```

---

## 4. MCP: cắm Claude vào hệ thống

Sau khi deploy, thêm vào cấu hình MCP client (Claude Desktop / `claude mcp`):

```bash
claude mcp add --transport http vyling https://vyling.workers.dev/mcp
```

8 tool: `tra_tu`, `tra_tu_chi_tiet`, `them_the_srs`, `the_den_han`,
`thong_ke_srs`, `kho_video`, `phu_de_video`, `suc_khoe_he_thong`.

Thêm tool mới = thêm một mục vào `src/mcp/tools.ts`. Cùng lúc nó xuất hiện trong
Code Mode, vì connector dùng chung mảng đó.

**Dùng MCP v2 (không trạng thái).** Bản đầu viết bằng `McpAgent` — một Durable
Object giữ phiên. Đặc tả MCP 2026-07-28 bỏ hẳn nhu cầu đó: giao thức nay không
trạng thái, và `createMcpHandler` từ `agents/mcp/server` chạy thẳng trên Worker.
Kết quả: **bớt được một Durable Object** (`MCP_OBJECT` + migration của nó) —
đơn giản hơn, rẻ hơn, ít thứ hỏng hơn. Gói dùng là
`@modelcontextprotocol/server@2` chứ không phải `@modelcontextprotocol/sdk@1`.

Đường `/sse` cũ đã bỏ; v2 chỉ dùng streamable HTTP tại `/mcp`.

---

## 5. Code Mode

Code Mode đảo ngược cách agent dùng tool: thay vì gọi từng tool qua protocol,
model **viết TypeScript** rồi chạy trong isolate không có mạng. Một vòng lặp
6 bước là một lần chạy sandbox, thay vì 6 vòng qua model.

> ### ⚠️ Cần quyền beta
> Code Mode chạy trên **Worker Loader API — đang ở beta kín**. Tài khoản chưa
> được cấp quyền thì `worker_loaders` trong `wrangler.jsonc` sẽ deploy lỗi.
>
> **Cách xử lý:** comment dòng `"worker_loaders": [{ "binding": "LOADER" }]`.
> Proxy app, MCP server và agent Flue **vẫn chạy bình thường**; chỉ Code Mode
> báo lỗi rõ ràng khi được gọi (`src/codemode/runtime.ts` kiểm tra sẵn).
> Đăng ký quyền: https://developers.cloudflare.com/workers/runtime-apis/bindings/worker-loader/

`them_the_srs` và `phu_de_video` đặt `requiresApproval: true` — agent phải chờ
người duyệt trước khi ghi vào thẻ của người học hoặc tiêu quota dịch.

---

## 6. Flue SDK trên giao diện

`@flue/react` + `@flue/sdk` đã cài vào `frontend/`. Hook `useFlueAgent` giữ SSE
tới Durable Object của agent, đồng bộ transcript vào state React — thấy được cả
tiến trình (đang suy luận, đang gọi tool nào), không chỉ câu trả lời cuối.

**Mặc định TẮT.** Bật bằng cách đặt trong `frontend/.env`:

```bash
VITE_AGENT_BASE=https://vyling.workers.dev
```

Đo thực tế trên build hiện tại:

| | `react-vendor` | chunk `AgentPanel` |
|---|---|---|
| Chưa đặt biến (mặc định) | 141.671 B | 110 B — Vite loại sạch |
| Đã đặt biến | 197.813 B | 2.652 B |

Nghĩa là **khi chưa bật, người dùng tải đúng số byte như trước**, không thêm gì.

### Vì sao tách workspace `cf/` riêng

`@flue/vite` yêu cầu **Vite ^8**, còn `frontend/` đang ở **Vite 5.4**. Nhét Flue
vào build frontend sẽ ép nâng Vite 5 → 8, một bước nhảy 3 major có khả năng làm
hỏng build đang chạy tốt. Nên phần server của Flue sống trong `cf/` với Vite 8 của
riêng nó, còn frontend chỉ lấy `@flue/react` + `@flue/sdk` (peer `react >=18`,
khớp React 18.3.1 sẵn có). Đây cũng đúng cách example `react-chat` của Flue làm.

---

## 7. AI Search

```bash
node cf/ai-search/build-corpus.mjs
```

Đã chạy thử: **91.622 tài liệu** (91.481 mục từ điển, 103 video, 31 bài học, 7 nhiệm vụ).

**Về riêng tư:** `build-corpus.mjs` có danh sách `DENY` chặn cứng mọi bảng chứa
dữ liệu cá nhân — `users`, `srs_cards`, `srs_reviews`, `activity_log`,
`admin_audit`, `feedback`… Đưa thẻ SRS của người học vào AI Search nghĩa là nội
dung riêng của họ bị nhúng (embed) lên hạ tầng Cloudflare và trở thành thứ agent
truy vấn được. Thêm bảng mới vào corpus thì phải tự hỏi câu đó trước.

Tạo instance bằng CLI (`wrangler ai-search`, open beta) — không phải chỉ dashboard
như bản README đầu viết nhầm:

```bash
npx wrangler ai-search create vyling-knowledge --type r2 --source vyling-knowledge --embedding-model @cf/baai/bge-m3 --chunk-size 512 --chunk-overlap 64 --max-num-results 8 --reranking
```

Thử truy vấn ngay, không cần viết code:

```bash
npx wrangler ai-search search vyling-knowledge "từ nào nghĩa là mệt mỏi"
```

Còn `list`, `get`, `update`, `stats`, `delete`. `ai-search.jsonc` là nguồn sự thật
của cấu hình. Index **không** tự cập nhật khi DB đổi: chạy lại corpus → đẩy R2 → Sync.

---

## 7b. Workers AI Whisper — chấm phát âm chính xác hơn

Web đang nhận diện giọng nói bằng Web Speech API của trình duyệt. Chính chuỗi
i18n `sh.srNote` đã thừa nhận điểm yếu:

> "chạy trong trình duyệt nên có thể nghe sai dù bạn đọc đúng… Hãy dùng Chrome/Edge"

Và phải có nút **"Máy nghe sai — không tính"** để gỡ oan cho người học. Đó là
một khiếm khuyết có thật, không phải chỗ để tô vẽ.

`@cf/openai/whisper-large-v3-turbo` chạy phía máy chủ nên:
- chính xác hơn hẳn, nhất là người Việt nói tiếng Hàn/Anh;
- chạy được trên **Safari và Firefox** — hai trình duyệt hiện KHÔNG dùng được
  tính năng luyện phát âm;
- đủ cả 6 ngôn ngữ web đang dạy.

**Cách nối vào mà không đổi logic cũ:** `useWhisperRecognition` trả về **đúng
hình dạng** của `useSpeechRecognition` (`supported / listening / transcript /
alternatives / confidence / interim / error / start / stop / reset`), rồi
`useAsr` chọn giữa hai bản. 11 component chỉ đổi đúng 2 dòng: tên import và tên
hook. Chưa đặt `VITE_AGENT_BASE` thì `useAsr` trả thẳng hook cũ — hành vi không
lệch một chút nào.

**Chi phí khi tắt:** hook Whisper vẫn nằm trong bundle (~4,3 KB nguồn, gộp vào
một chunk 5,9 KB), vì quy tắc hook của React bắt phải gọi cả hai vô điều kiện,
nên không tree-shake được. Nó nằm im hoàn toàn. `@flue/react` thì vẫn bị loại
sạch như cũ — `react-vendor` giữ nguyên 141.671 B.

Whisper nhận `audio` dạng **base64**, trần 8 MB mỗi clip (luyện phát âm chỉ vài
giây ≈ 100 KB). Endpoint `/cf/asr` chạy ở edge, **không đánh thức container**,
nên chấm phát âm không phải chờ uvicorn khởi động.

---

## 7c. Agent vận hành dự án (Cron Triggers)

`VylingOps` là "trực ca": nhận tín hiệu theo lịch, tự kiểm tra, rồi kết luận.

| Lịch (UTC) | Việc |
|---|---|
| `*/30 * * * *` | Kiểm tra sức khoẻ. **Im lặng khi bình thường.** |
| `0 3 * * *` (10h sáng VN) | Báo cáo vận hành ngày |

**Đừng gọi model khi không cần.** Cách làm ngây thơ là mỗi nhịp cron lại đánh
thức agent — tốn tiền model 48 lần/ngày để 47 lần nhận về câu "mọi thứ ổn". Nên
nhịp 30 phút do chính handler kiểm tra bằng một HTTP request rẻ tới
`/api/health`, và **chỉ đánh thức agent khi có sự cố**. Nhịp ngày mới cần suy
luận thật.

Mỗi loại việc dùng một `id` hội thoại cố định (`health-watch`, `daily-report`)
nên Durable Object giữ được trí nhớ — agent biết "lỗi này hôm qua đã báo rồi",
không kêu lại như mới.

**Agent vận hành CHỈ ĐỌC:** `useMcpConnection` giới hạn `tools` còn 3 tool đọc
(`suc_khoe_he_thong`, `thong_ke_srs`, `kho_video`). Một con cron chạy sai giờ mà
có quyền ghi là cách nhanh nhất để hỏng dữ liệu thật.

---

## 8. Bốn chỗ móc nối trong `frontend/`

Ngoài các file mới trong `src/features/agent/`:

1. `src/config/env.ts` — thêm `agentBase`
2. `src/App.tsx` — thêm 2 dòng (lazy import + `<AgentPanel />`)
3. `src/core/i18n/translations.ts` — thêm 14 khoá `agent.*` (VI + EN)
4. `src/styles/globals.css` — thêm CSS `.agent-*` ở cuối file
5. 11 component đổi `useSpeechRecognition` → `useAsr` (đúng 2 dòng mỗi file)

Không sửa logic nào có sẵn. `useSpeechRecognition.ts` giữ nguyên, không đụng tới.

---

## 12. Ba cái bẫy đã sập (ghi lại để đừng lặp lại)

### 12.1 `.dockerignore` phải nằm ở gốc build context

Build context là `../` (gốc repo), nên Docker tìm `.dockerignore` ở **gốc repo** —
đặt ở `cf/.dockerignore` thì nó **bị bỏ qua hoàn toàn**, không báo lỗi gì.

Hậu quả nếu không phát hiện: build context nuốt trọn `media/` (420MB),
`data/hanquan.db`, `node_modules/`, `.venv/` — **và cả `config.toml` chứa API
key**, đưa thẳng secret vào image.

Cách sửa: đổi tên thành **`Dockerfile.dockerignore`** — BuildKit ưu tiên file
ignore riêng đặt cạnh Dockerfile, và mọi thứ vẫn gọn trong `cf/`.

### 12.2 Không được tạo `frontend/dist` rỗng trong image

`backend/main.py` mount SPA theo `if _DIST.exists()`. Thư mục **rỗng vẫn tính là
tồn tại**, nên nó mount `SpaStaticFiles` lên chỗ không có file nào — mọi request
về `/` rơi vào nhánh fallback `index.html` không tồn tại và đổ lỗi, thay vì 404
sạch. Nay `Dockerfile` `COPY frontend/dist/` thật.

**Nhớ chạy `npm run build --prefix frontend` trước khi build image.**

### 12.3 Workers Assets không dùng được trên đường build này

Đã thử khai `"assets": { "directory": "../frontend/dist", … }` trong
`wrangler.jsonc`. `@cloudflare/vite-plugin` **bỏ im lặng** khối đó — kiểm tra
`dist/vyling/wrangler.json` sinh ra thì `assets: undefined`, trong khi
`triggers`, `containers`, `durable_objects` đều qua bình thường. Plugin tự quản
static assets từ client build của chính nó, mà `frontend/` là project Vite 5
riêng (xem §6), không nằm trong build này.

Nên SPA do FastAPI phục vụ trong container, đúng như hôm nay. Đánh đổi: image
nặng thêm ~104MB.

**Tối ưu sau nếu cold start chậm:** trong 104MB đó, app thật chỉ ~15MB
(`assets/` + 18 trang prerender); 97MB còn lại là `wordimg/` (46MB), `audio/`
(38MB), `cosmetics/` (13MB) — toàn file tĩnh bất biến, chuyển sang R2 và phục vụ
ở edge được, y hệt cách `/media/*` đang làm trong `src/app.ts`.

---

## 13. Bốn lỗi mà lần build container đầu tiên tìm ra

Cả bốn đều đi lọt qua type-check, `vite build` và `wrangler --dry-run`.

### 13.1 Image nền không có `python`/`pip`

`cloudflare/sandbox:0.7.0-python` chỉ có **`python3`** và **`pip3`**
(`/usr/local/bin`, Python 3.11.14). Không có alias `python`/`pip`.

| Chỗ | Sai | Nếu không bắt được |
|---|---|---|
| `Dockerfile` RUN | `pip install` | Build đỏ ngay — dễ thấy |
| `Dockerfile` CMD | `python -m uvicorn` | Image build **xanh**, container chết lúc khởi động |
| `legacy-proxy.ts` | `python -m uvicorn` | Worker deploy **xanh**, backend không bao giờ lên |

Hai dòng dưới mới là loại nguy hiểm: hỏng lúc *chạy*, không phải lúc build.

### 13.2 `probe()` hiểu sai `/api/health`

`/api/health` trả về **mảng** `[{name, ok, detail, optional}]`, không phải
object. Code cũ dùng `Object.entries` nên báo lỗi ra **chỉ số** (`"1"`, `"6"`)
thay vì tên hạng mục.

Tệ hơn: nó coi **mọi** `ok:false` là sự cố. Nhưng trong container luôn có hai
mục false một cách hợp lệ:
- **`Môi trường ảo (.venv)`** — container không cần venv, đây là cảnh báo dành
  cho máy dev Windows (`"Hãy khởi động bằng start.bat"`)
- **`Bộ não AI (LLM)`** — `optional: true`, chưa nạp API key thì luôn false

Nghĩa là cron 30 phút sẽ **báo sự cố giả suốt đời**, đốt tiền model để kêu nhầm —
đúng thứ mà thiết kế "đừng gọi model khi không cần" ở §7c muốn tránh.

Nay `realFailures()` bỏ qua mục `optional` và danh sách `IGNORED_CHECKS`, và đã
kiểm chứng bằng chính payload thật lấy từ container đang chạy: health thật → `[]`
(không báo giả), giả lập SQLite hỏng → báo đúng tên mục.

---

## 14. Tunnels thay cho preview URL — bỏ được ràng buộc domain

Bản đầu dùng `exposePort()`, sinh preview URL dạng
`8000-sandbox-<id>-app.<domain>`. Cách đó **bắt buộc có domain riêng cấu hình
wildcard DNS**; `.workers.dev` không chạy được. Với người chưa có domain thì
coi như tắc.

Hai điều phát hiện thêm khi tra tài liệu chính thức:
1. **`exposePort()` đã bị deprecated**, thay bằng Tunnels API.
2. Bản SDK ghim ban đầu (`^0.7.0`) quá cũ — chọn theo trang docs viết *"current
   stable is 0.7.0"*, trong khi npm đã ở **0.12.7**. Bản 0.7 chưa có tunnels.

Nay dùng **quick tunnel**:

```ts
const tunnel = await sandbox.tunnels.get(port)
// → https://<ngẫu nhiên>.trycloudflare.com
```

Không cần domain, không cần DNS, không cần cấu hình gì. Kèm hai ràng buộc:

- **Bắt buộc RPC transport** — `getSandbox(..., { transport: 'rpc' })`. Tunnels
  không chạy trên transport HTTP/WebSocket cũ (cũng đang deprecated).
- **URL đổi mỗi lần container khởi động lại.** Nên `proxyToBackend` thử lại một
  lần: fetch hỏng → xoá cache URL → dựng tunnel mới. Chỉ thử lại với request
  không có body (body là stream, đọc rồi không phát lại được).

Khi có domain riêng thì đổi sang **named tunnel** cho URL cố định:
`sandbox.tunnels.get(port, { name: 'vyling' })` → `https://vyling.<zone>`.

Kèm theo: package và image phải **cùng dòng phiên bản** — nâng SDK lên 0.12.7
thì `Dockerfile` cũng phải đổi sang `cloudflare/sandbox:0.12.7-python`.

---

## 15. ✅ Secret đã nạp được vào backend (đã xử lý 16/08)

**Đường đi:** `wrangler secret put` → Worker env → biến môi trường của tiến
trình uvicorn (`legacy-proxy.ts`) → `backend/config.py` đọc qua `_apply_env()`.

Cần đặt các secret sau; **bạn tự gõ giá trị**, không dán vào chat:

```bash
npx wrangler secret put LLM_API_KEY --cwd cf
```

Còn `ADMIN_PASSWORD` (chặn việc app tự sinh mật khẩu rồi in ra log — xem 15.2),
`SMTP_PASSWORD`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_APP_SECRET`, `DEPLOY_TOKEN`.

Bản đồ tên biến nằm ở `_ENV_SECRETS` trong `backend/config.py`. Biến môi trường
ghi đè giá trị trong file, nên chạy trên máy vẫn dùng `config.toml` như cũ.

**Chưa đặt `LLM_API_KEY` thì mọi tính năng AI tắt câm** — kể cả dịch phụ đề, và
người học chỉ thấy tiếng Anh.

<details>
<summary>Ghi chép cũ (trước khi sửa)</summary>

## 15-cũ. Secret CHƯA nạp được vào backend

Phát hiện khi rà trước lần deploy đầu. Hai việc còn nợ, **không** chặn deploy
kiểm chứng nhưng **chặn chạy thật**:

### 15.1 `wrangler secret` không tới được app Python

`backend/config.py` chỉ đọc TOML — `config.toml`, không có thì `config.example.toml`
— và **không hề đọc biến môi trường**. Nên `wrangler secret put LLM_API_KEY`
đưa secret vào Worker, còn tiến trình uvicorn trong sandbox thì không thấy gì.

Bản đầu `legacy-proxy.ts` truyền `VYLING_LLM_API_KEY` qua `startProcess({env})`.
Vô tác dụng, đã gỡ — để lại thì tưởng đã bảo mật xong mà thật ra chưa.

Ba hướng, chưa chọn:
1. **Ghi `config.toml` vào sandbox** từ secret của Worker trước khi chạy uvicorn
   (`sandbox.writeFile`). Không đụng backend. Vướng: `config.py` dùng
   `config.toml` **thay cho** `config.example.toml` chứ không gộp, nên phải sinh
   file đủ nội dung, không phải vài dòng.
2. **Cho `config.py` đọc env làm lớp dự phòng** — sạch nhất về lâu dài, nhưng
   sửa vào code backend hiện có.
3. **Mount từ R2** — nặng tay hơn mức cần.

### 15.2 Mật khẩu admin bị in ra log

`config.example.toml` để `admin.password = ""`, nên `seed_admin()` tự sinh mật
khẩu ngẫu nhiên rồi in ra stdout **mỗi lần container khởi động**:

```
[VyLing] Mật khẩu admin mới cho admin@vyling.vn: … — lưu lại ngay, chỉ hiện 1 lần
```

Trên máy thì vô hại. Trên Cloudflare, log đó lưu lại và đọc được. Xử lý cùng
15.1 — đặt `admin.password` thật là hết.

</details>

---

## 16. Cờ `experimental` chặn TOÀN BỘ deploy, không chỉ Code Mode

Lần deploy đầu tiên đỏ ngay ở bước gọi API:

```
The compatibility flag experimental is experimental and cannot yet be used
in Workers deployed to Cloudflare.  [code: 10021]
```

Cờ `experimental` chỉ chạy được ở **dev cục bộ**. Tôi thêm nó theo example
`cloudflare` của Flue, nơi ghi rõ là cần cho Worker Loader. Nhưng Worker Loader
đang beta kín (§5), và điều tôi không lường được: cờ đó không chỉ vô hiệu hoá
Code Mode — nó làm **cả Worker không deploy nổi**.

Nay `compatibility_flags` chỉ còn `nodejs_compat`, và `worker_loaders` bị comment.
Hệ quả: **Code Mode không chạy trên production**, `createVylingCodemode()` ném lỗi
rõ ràng khi được gọi. Mọi thứ khác chạy bình thường.

Bật lại khi có quyền beta Worker Loader: bỏ comment `worker_loaders`, thêm
`"experimental"` vào `compatibility_flags`, chạy `npm run types`.

Kiểu của `LOADER` khai optional trong `src/env.d.ts` chứ không để `wrangler types`
sinh — vì binding đang tắt thì wrangler không sinh, mà code vẫn cần kiểm tra
`!!env.LOADER`.

---

## 17. Trạng thái sau lần deploy đầu (15/08/2026)

**Đã chạy thật trên Cloudflare:** https://vyling.qvantruong205.workers.dev

| Đường | Kết quả |
|---|---|
| `/cf/ping` | ✅ 200 — edge, không đánh thức container |
| `/cf/asr` (Whisper) | ✅ 200, ~1,6s — chép **chính xác tuyệt đối** cả Anh lẫn Hàn |
| `/api/health` | ✅ 200 qua container + quick tunnel |
| `/` (SPA) | ✅ 200 text/html |
| `/api/content/videos` | ✅ có dữ liệu (seed từ code) |
| `/api/define?word=공부` | ⚠️ 200 nhưng **rỗng** — xem dưới |

Kết quả Whisper thật:

```
"Hello, my name is Truong. I am learning English every day."   (en, 5.4s)
"안녕하세요. 저는 베트남 사람입니다. 한국어를 공부하고 있어요."      (ko, 7.2s)
"오늘 날씨가 정말 좋네요. 같이 산책할까요?"                        (ko, 6.1s)
```

Cả ba đúng từng ký tự, kể cả tên riêng và dấu câu.

### 17.1 🔴 Container CHƯA CÓ DỮ LIỆU *(đã xử lý 16/08 — xem §20)*

`/app/dictionaries/` và `/app/data/` **rỗng**. `Dockerfile.dockerignore` cố tình
loại chúng (§12), dự tính nạp từ R2 lúc chạy — nhưng **phần nạp đó chưa viết**.

Hệ quả cụ thể:
- Từ điển KRDICT **91.481 mục → 0**. `/api/define` trả rỗng, và tool MCP `tra_tu`
  cũng vậy.
- SQLite là DB mới tinh mỗi lần container dựng lại, không phải `data/hanquan.db`
  24MB có sẵn. Tài khoản, thẻ SRS, tiến độ đều không có.

Nói cho đúng: **kiến trúc đã kiểm chứng, đường dẫn dữ liệu thì chưa dựng.**
Deploy này trả lời "chạy được trên Cloudflare không", chưa phải "web dùng được chưa".

`/media/*` thì **đã xong** — `vyling-media` có 934 object / 438 MB, kiểm bằng
`wrangler r2 bucket info vyling-media`, và một file thật trả 200 đúng
`audio/mpeg`. Câu "bucket đang rỗng" ở bản README trước là viết sai lúc chưa đẩy.

### 17.2 Ba việc còn nợ, theo thứ tự

1. ~~**Nạp dữ liệu**~~ — **xong 16/08**: từ điển vào image (§20.1), SQLite bền
   nhờ Litestream → R2 (§20.2), media đã ở R2 từ trước.
2. ~~**Secret tới được backend**~~ — **xong 16/08** (§15).
3. ~~**Cold start** trả 500~~ — **xong 16/08**: trang chờ ở §21.

---

## 18. 🔴 Deploy KHÔNG tự cập nhật container đang chạy

Cái bẫy tốn thời gian nhất cho tới giờ. Sau `wrangler deploy` thành công, web
thật **vẫn chạy code cũ**. Kiểm bằng:

```bash
npx wrangler containers instances <APPLICATION_ID>
```

Cột `VERSION` đứng nguyên ở 1 dù đã deploy nhiều lần — vì `keepAlive: true`
giữ instance cũ sống, Cloudflare không ép thay.

Tệ hơn: khi Cloudflare có dừng container (state `inactive`), **bản ghi tunnel
vẫn còn**. Bản đầu của `ensureBackend` tin `tunnels.list()` mà không kiểm, nên
trả về URL của một origin đã chết → proxy mãi vào đó → **không bao giờ dựng lại
container**, web đứng ở bản cũ vĩnh viễn.

Và origin chết thì Cloudflare trả **530**, tức một HTTP response HỢP LỆ — `fetch`
không ném lỗi, nên nhánh `catch` để thử lại cũng không chạy. Phải xét mã trạng
thái mới bắt được.

Nay đã sửa cả ba:
1. `originAlive()` gọi thử `/api/health` trước khi tin tunnel cũ; chết thì
   `tunnels.destroy(port)` rồi dựng lại.
2. `proxyToBackend` coi `status >= 500` là origin chết và thử lại một lần
   (chỉ với request không có body — body là stream, đọc rồi không phát lại được).
3. `POST /cf/recycle` (cần header `X-Deploy-Token` khớp secret `DEPLOY_TOKEN`)
   để chủ động huỷ container sau khi deploy code backend.

### 18.1 Đẩy image lên registry hay timeout — cứ chạy lại

Image 2,65 GB đẩy lên `registry.cloudflare.com` mất khá lâu và có thể chết giữa
chừng:

```
failed commit on ref "layer-sha256:…": net/http: timeout awaiting response headers
X [ERROR] Docker command exited with code: 1
```

Cũng gặp biến thể `X [ERROR] Unauthorized` — thẻ đăng nhập registry mà wrangler
cấp có hạn ngắn, deploy nhiều lần liên tiếp là hết hạn giữa chừng.

Và biến thể thứ ba: **Docker Desktop đã tắt** (`failed to connect to the docker
API at npipe:…`). Wrangler cần Docker để build image, nên phải mở Docker Desktop
rồi đợi engine lên hẳn mới deploy được. Nếu chỉ sửa code Worker (không đụng
`backend/` hay `frontend/dist`) thì đi đường tắt, không cần Docker:

```bash
npx wrangler deploy --containers-rollout=none --cwd cf
```

Cả hai đều là lỗi tạm, không phải lỗi cấu hình. **Chạy lại `npm run deploy --prefix cf`**
— các layer đã đẩy xong được giữ lại nên lần sau nhanh hơn nhiều. Điểm cần nhớ:
lần deploy hỏng ở bước này thì Worker **không** được thay, web thật vẫn chạy bản
cũ nguyên vẹn. Đừng tưởng đã lên rồi mà bỏ qua bước kiểm chứng.

**Quy trình deploy đúng:**

```bash
npm run build --prefix frontend
```

```bash
npm run deploy --prefix cf
```

Rồi gọi một request bất kỳ vào `/api/health` để container dựng lại — lần đầu
mất ~10–60s và có thể trả 500 giữa chừng, đó là bình thường. Kiểm chứng bằng dữ
liệu thật, đừng tin mỗi dòng "Deployed":

```bash
curl -s https://vyling.qvantruong205.workers.dev/api/content/videos | head -c 200
```

---

## 19. 🔴 Hai lỗi im lặng khiến mọi tính năng AI tắt câm

Cả hai đều **type-check sạch, deploy xanh**, và chỉ lộ ra khi đọc log Worker.

### 19.1 `transport` không đặt được qua `getSandbox()`

```ts
getSandbox(ns, id, { transport: 'rpc' })   // ❌ BỊ BỎ QUA
```

`SandboxOptions` **không có** trường `transport`. Worker chạy HTTP transport,
log ghi `Using http transport`, và vì **tunnels bắt buộc RPC** nên mọi lệnh
tunnel hỏng với `Tunnel recovery attempts were exhausted`.

Đúng cách là biến môi trường trong `wrangler.jsonc`:

```jsonc
"vars": { "SANDBOX_TRANSPORT": "rpc" }
```

Chính SDK có sẵn câu này trong thông báo lỗi: *"requires the rpc transport.
Set SANDBOX_TRANSPORT=rpc."*

### 19.2 Tên trường biến môi trường

```ts
startProcess(cmd, { env: {...} })          // ❌ SDK bỏ qua
await sandbox.setEnvVars({...})            // ✅ đúng
```

Hệ quả: `wrangler secret` tới được Worker (`/cf/ping` báo `llm: true`) nhưng
**không tới tiến trình uvicorn**, nên `/api/health` luôn báo `✗ Bộ não AI`.
Dịch phụ đề im lặng trả về tiếng Anh trần.

### 19.3 Đừng gọi `sandbox.destroy()` trong đường request

Thử dùng `destroy()` để ép container nhận code mới. Kết quả: hệ thống tunnel
kẹt (`ensureTunnelRun was interrupted`), `startProcess` bị Canceled, web trả
500 liên tục. Chỉ nên `tunnels.destroy(port)` — `startProcess` tự khởi động lại
container đã dừng.

### 19.4 `keepAlive: true` để lại container mồ côi

Khi khôi phục bằng cách đổi `SANDBOX_ID`, sandbox cũ **không bao giờ tự ngủ**
và tính tiền mãi. Nay dùng `keepAlive: false` + `sleepAfter: '15m'`: đổi lại là
cold start sau khi nhàn rỗi, nhưng `proxyToBackend` đã có nhánh thử lại để che.

### 19.5 Khôi phục khi container application hỏng hẳn

```bash
npx wrangler containers delete <APPLICATION_ID>
```

Cần gõ `y` xác nhận (không có cờ `--force`). Sau đó Worker sẽ báo *"There is no
container application assigned to this Durable Object namespace"* cho tới khi
`npm run deploy --prefix cf` dựng lại nó.

---

## 20. Đường dữ liệu (16/08) — từ "chạy được" sang "dùng được"

§17.1 nói kiến trúc đã kiểm chứng nhưng đường dữ liệu chưa dựng. Mục này dựng nó.

### 20.1 Từ điển: vào image, và nạp sẵn NGAY LÚC BUILD

Từ điển đi ngược quyết định "dữ liệu nặng để ngoài image" của §12, có lý do:

| | media/ | dictionaries/ |
|---|---|---|
| Nặng | 420 MB | 18 MB |
| Ai đọc | trình duyệt, từng file một | tiến trình Python, đọc một lần lúc khởi động |
| Để ở R2 | phục vụ thẳng ở edge, **nhanh hơn** | phải tải về rồi mới parse, **chậm hơn** |

Nên `Dockerfile.dockerignore` mở đúng một khe `!dictionaries/KO-VI.KRDICT.zip`
(`Frequency.CC100.Korean.zip` không có chỗ nào trong code dùng — để ngoài).

Nhưng chỉ copy zip vào thì chưa đủ. `ensure_imported()` chạy lúc khởi động và
parse **91.481 mục**; cold start vốn đã 10–60 giây, cộng thêm chục giây nữa là
người học nhìn trang trắng. Nên Dockerfile chạy `import_zip()` **lúc build**:

```dockerfile
RUN python3 -c "from backend.services import dictionary; ..."
```

DB trong image do đó ra lò đã có sẵn `dict_entries`, và `ensure_imported()` lúc
chạy thấy `count() != 0` nên không làm gì. Bước này cũng bật luôn `PRAGMA
journal_mode=WAL` — Litestream chỉ theo dõi được DB ở chế độ WAL, mà bước khôi
phục chạy **trước** uvicorn nên không thể trông chờ `init_db()` bật hộ.

### 20.2 SQLite: Litestream sao lưu liên tục lên R2

Đây là thứ chặn web thành sản phẩm nhiều người dùng. Tài liệu Containers ghi
thẳng **"Disk persistence: None"** — đĩa container là tạm, ngủ 15 phút dậy là
trắng tinh. Mỗi lần như thế là mọi tài khoản, thẻ SRS, XP, tiến độ biến mất.

Ba hướng đã cân:

| Hướng | Vướng |
|---|---|
| Mount R2 vào `/app/data` (`mountBucket`) | SQLite cần khoá POSIX + ghi ngẫu nhiên giữa file; FUSE trên object storage không đáp ứng → **hỏng dữ liệu**, không phải chậm |
| Chuyển sang D1 | Viết lại toàn bộ tầng dữ liệu của `backend/` (sqlite3 → binding HTTP), đúng thứ đã chốt là không làm |
| **Litestream** ✅ | Thêm một binary vào image; cần khoá S3 của R2 |

Litestream đứng ngoài đọc WAL và đẩy lên R2 mỗi giây. `backend/` **không biết nó
tồn tại** — không sửa một dòng nào, đúng nguyên tắc của cả thư mục `cf/` này.

Đường chạy trong `start-backend.sh`:

```
litestream restore -if-replica-exists → thay DB → litestream replicate -exec "uvicorn …"
```

Ba chỗ dễ sai đã xử lý sẵn:

1. **Khôi phục ra file tạm rồi mới thay.** `restore` từ chối ghi đè DB đang có
   (đúng), còn `-force` thì lỡ replica rỗng là xoá mất bản trong image.
2. **Xoá `-wal`/`-shm` của bản cũ trước khi `mv`.** Bỏ sót là SQLite lấy WAL của
   DB này áp vào DB kia — hỏng dữ liệu âm thầm, không báo lỗi.
3. **Sao lưu hỏng KHÔNG được làm sập web.** Thiếu khoá, sai endpoint, Litestream
   chết trong 15 giây đầu → script lùi về `uvicorn` trần và kêu to trong log.
   Thà chạy không có sao lưu còn hơn trả 500 cho mọi người học.

### 20.3 🔴 `CMD` phải BIẾN MẤT khỏi Dockerfile — bẫy tốn một vòng deploy

Đọc `node_modules/@cloudflare/sandbox/Dockerfile` mới thấy: image nền chỉ đặt
`ENTRYPOINT ["/container-server/sandbox"]` và **không đặt `CMD`**. Nên `CMD` của
`cf/Dockerfile` trở thành *userCmd*, và sandbox agent tự chạy nó **ngay khi
container lên** — log ghi thẳng `Spawning user command`. Rồi `legacy-proxy.ts`
lại gọi `startProcess('/app/start-backend.sh')` một lần nữa.

Hai vấn đề, và vấn đề thứ hai nặng hơn nhiều:

1. **Hai Litestream cùng ghi một DB lên cùng một đường R2** — hai bên tranh nhau
   viết lịch sử WAL. (Hai uvicorn tranh cổng thì vô hại: cái sau chết vì
   "address already in use".)
2. **Bản do `CMD` chạy KHÔNG có một khoá API nào.** Nó khởi động trước khi Worker
   kịp gọi `setEnvVars()`, mà nó lại chiếm cổng 8000 trước.

Điểm 2 đã xảy ra thật và bắt được lúc kiểm chứng sau deploy: `/api/health` báo
**`✗ Bộ não AI (LLM)`** trong khi `/cf/ping` báo `llm: true` — tức khoá tới được
Worker nhưng không tới tiến trình phục vụ. Triệu chứng giống hệt §19.2 nhưng
nguyên nhân khác hẳn, và nó **chỉ lộ ra khi thêm chốt cổng vào script**: trước đó
hai bản cùng chạy nên đôi khi bản có secret giành được cổng, tức là một lỗi *lúc
lúc đúng lúc lúc sai* — loại tệ nhất.

Cách sửa: **bỏ hẳn `CMD`**, để đúng một nơi được khởi động backend là
`startProcess`, chạy sau `setEnvVars`. Chốt cổng trong `start-backend.sh` vẫn
giữ làm lớp phòng thân. Chạy thử trên máy thì truyền script làm tham số:

```bash
docker run -p 8000:8000 vyling-sandbox /app/start-backend.sh
```

### 20.4 Bỏ `CMD` kéo theo: phải chờ cổng trước khi dựng tunnel

Một hệ quả không hiển nhiên. Trước đây container vừa lên là đã có sẵn một uvicorn
nghe cổng 8000 (bản do `CMD` chạy), nên `tunnels.get(port)` gọi ngay sau
`startProcess` cũng trúng. Nay **không còn ai nghe lúc container vừa lên**, mà
chuỗi khôi phục DB từ R2 + lifespan của FastAPI mất hàng chục giây — dựng tunnel
trỏ vào chỗ chưa có ai là ăn 530 ngay lần đầu.

Nên `ensureBackend` chờ bằng `proc.waitForPort(port, { path: '/api/health' })`.
Chấp nhận `status` tới 499 chứ không chỉ 2xx: điều cần biết là *uvicorn đã trả
lời chưa*, một mã 4xx cũng đã trả lời rồi. Và lỗi ở bước chờ này **không được
ném ra** — nhánh thử lại của `proxyToBackend` cùng trang chờ đã che, còn ném thì
mất luôn tunnel vừa dựng.

Bucket riêng `vyling-db` (đã tạo), tách khỏi `vyling-media` để bản sao dữ liệu
người dùng không nằm chung chỗ với file tĩnh phục vụ công khai.

**Cửa sổ mất dữ liệu ~1 giây** (`sync-interval: 1s`). Lưu ý `POST /cf/recycle` và
`sandbox.destroy()` giết container đột ngột nên có thể mất đúng cửa sổ đó — chấp
nhận được, nhưng đừng recycle giữa lúc đông người dùng.

---

## 21. Trang chờ cold start

Container ngủ sau 15 phút nhàn rỗi (§19.4). Người đầu tiên quay lại sau đó phải
chờ Cloudflare kéo image, chạy uvicorn, chờ lifespan, chờ tunnel — và trong suốt
khoảng đó Cloudflare trả **530**, tức đúng trang lỗi màu cam trông y như web hỏng
hẳn. Trạng thái "đang khởi động" phải trông khác hẳn "hỏng", vì với người dùng
thì khác biệt đó là tất cả.

`src/waiting.ts` trả 503 + `Retry-After`, kèm trang tự tải lại (gradient + blob,
cùng ngôn ngữ hình ảnh với web; có nhánh `prefers-color-scheme` và
`prefers-reduced-motion`). Request `/api/*` thì nhận JSON `{detail, starting}`
đúng hình dạng lỗi của backend, không phải một đống HTML làm `response.json()`
ném lỗi khó hiểu.

Hai chi tiết quan trọng:

- **Phân biệt "không tới được backend" với "backend trả lỗi".** Đây là chỗ bản
  đầu viết sai và suýt lọt: tôi lấy cả `502/503/504` làm dấu hiệu origin chết,
  trong khi **backend dùng thật đúng những mã đó** — `502` cho *"AI không phản
  hồi"* (`learn.py`, `english.py`, `speaking.py`, `pronounce.py`), `503` cho
  *"Máy chủ đang bận xử lý video khác"* (`learn.py`, `lingo.py`). Đổi những câu
  đó thành "đang khởi động" là xoá mất thông tin người dùng cần và bắt họ chờ
  một thứ sẽ không bao giờ xong.

  Nay chia hai nhóm: `521–524` và `530` là **mã chỉ Cloudflare sinh ra**, ứng
  dụng không bao giờ trả → chắc chắn origin chết. Còn `502/503/504` thì xét thêm
  `content-type`: lỗi của FastAPI luôn là JSON (`HTTPException`/`AppError` →
  `JSONResponse`), trang lỗi của Cloudflare là HTML. Header `server` **không**
  dùng được để phân biệt, vì cả hai đều đi qua cùng một edge.

  **Cố ý không có 500**: FastAPI trả 500 nghĩa là app *sống* và có bug thật —
  che nó bằng "đang khởi động" là giấu lỗi.
- **Trang chờ hỏi `/cf/ready`, không phải `/cf/ping`.** Ping trả lời ngay ở edge
  nên lúc nào cũng 200 → tải lại theo nó là quay vòng vô tận. Và `/cf/ready`
  **không** gọi `ensureBackend`: nếu có, mỗi nhịp hỏi lại spawn thêm một uvicorn
  nữa vào cùng một cổng, tức trang chờ tự phá thứ nó đang chờ.

---

## 23. Bài học dựng sẵn — bỏ hẳn cái chờ 10–60 giây

Bấm một video trong kho, người học thấy dòng
*"Đang lấy phụ đề & dịch... (10–60 giây tùy độ dài video)"* rồi ngồi đợi. Cái
chờ đó **vô nghĩa với video trong kho**: video là do mình chọn sẵn, biết trước
mã, hoàn toàn dựng trước được. Đo thực tế lúc bắt đầu: **6/7 video tiếng Anh
chưa có bài học nào dựng sẵn**, nên mỗi người bấm vào là máy lại đi lấy phụ đề
YouTube rồi gọi AI dịch lại từ đầu — chờ lâu, tốn lượt AI nhân theo số người, và
hỏng hẳn nếu YouTube chặn máy chủ đúng lúc đó.

Hai bước:

| Bước | Việc | Chạy khi nào |
|---|---|---|
| `scripts/prebuild_lessons.py` | Đi đúng đường của `/api/transcript` (lấy phụ đề → dọn → dịch) rồi lưu vào `lesson_cache` **trên máy** | Khi thêm video vào kho |
| `scripts/publish_lessons.py` | Xuất `lesson_cache` (+ người nói) ra JSON, đẩy lên bucket `vyling-lessons` | Sau mỗi lần dựng |

### 23.1 Vì sao để ở R2 chứ không nướng vào image

1. **Bấm là có kể cả khi container đang ngủ** — bài học nằm ở edge nên
   `/api/transcript` không cần đánh thức container, không dính cold start.
2. **Thêm bài không phải deploy lại** — nướng vào image thì mỗi video mới là một
   lần build và đẩy 2,65 GB.
3. **Không đụng vào DB.** Từ khi có Litestream (§20.2), DB trong image bị thay
   bằng bản khôi phục từ R2 — thứ gì nướng vào image cũng biến mất ở lần khôi
   phục đầu tiên. Bài học là **nội dung dựng sẵn**, không phải dữ liệu người
   dùng; để riêng mới đúng chỗ.

`src/lessons.ts` đọc `<video_id>.json` từ bucket. Không có thì trả `null` và
request rơi xuống container y như cũ — người học tự dán link video lạ vẫn chạy
đúng đường cũ.

### 23.2 Hai chi tiết dễ sai

- **Body chỉ đọc được một lần.** `/api/transcript` là POST và phải đọc body mới
  biết video nào. Body là stream — đọc rồi không phát lại được, nên `app.ts` đọc
  đúng một lần thành chuỗi rồi **tự dựng lại `Request`** cho nhánh chuyển tiếp
  xuống container (và xoá `content-length` cũ).
- **Hạn mức không bị tính, và đó là đúng.** `learn.py` trả cache **trước** khi
  gọi `quota.consume`, nên bài đã cache xưa nay vẫn không tốn lượt. Đường edge
  giữ nguyên hành vi đó.

### 23.3 🔴 Lỗi tìm ra khi soi bài dựng sẵn: hai cổng "có cần dọn phụ đề không" chỏi nhau

Nhìn file JSON xuất ra mới thấy: bài `aN78Tz_e5c4` còn **37/72 dòng có `>>`** và
câu bị cắt làm đôi giữa chừng — đúng thứ mà `_needs_repair` trong
`backend/routers/learn.py` được viết ra để chặn.

Nguyên nhân: **có hai cổng, và cổng trong huỷ quyết định của cổng ngoài.**

| Nơi | Luật | Với bài này |
|---|---|---|
| `routers/learn.py::_needs_repair` | nguồn "tự động", hoặc có `>>`/`[music]`, hoặc dưới **50%** dòng kết thúc bằng dấu câu | **True** → gọi dọn |
| `services/translate.py::needs_repair` (bên trong `repair_segments`) | dưới **30%** dòng kết thúc bằng dấu câu | **False** → thoát ngay, không làm gì |

51/72 dòng (71%) có dấu câu nên cổng trong nói "không cần", và `repair_segments`
`return segments` mà không báo gì. Người học nhận nguyên bản chép kiểu truyền
hình; máy dịch cũng dịch sai vì nửa câu không đủ nghĩa.

Sửa: **một luật, ở một chỗ.** `translate.needs_repair(lines, source)` giờ là nơi
duy nhất trả lời câu hỏi đó (đã gộp cả kiểm tra nhiễu và ngưỡng 50%);
`repair_segments` **không hỏi lại** — bên gọi đã quyết; `learn._needs_repair`
chỉ còn chuyển tiếp. 43/43 test backend vẫn xanh.

Đo trên bài `aN78Tz_e5c4` sau khi sửa và dựng lại:

| | Trước | Sau |
|---|---|---|
| Dòng còn `>>` | 37/72 | **0/71** |
| Dòng là câu trọn vẹn | 51/72 (71%) | **71/71 (100%)** |

Cả 7 bài tiếng Anh: 1.596 dòng, **93% là câu trọn vẹn**. Số `>>` còn sót nằm ở
những cửa sổ mà `repair_segments` tự lùi về bản thô vì bản dọn ngắn hơn 60% bản
gốc — chốt an toàn đó giữ nguyên, thà giữ bản thô còn hơn mất nội dung.

Đây là lý do nên soi dữ liệu trước khi đóng băng: bài dựng sẵn nằm ở R2 lâu dài,
đóng băng bản phụ đề hỏng vào đó thì sai đó ở lại rất lâu.

### 23.4 Sửa luôn câu thông báo doạ người

Báo ngay "10–60 giây" cho mọi trường hợp là doạ bằng một cái chờ không có thật.
Nay `app.store.tsx` hiện `learn.preparing` ("Đang chuẩn bị bài học…") trước, và
chỉ đổi sang câu "10–60 giây" khi **đã chờ quá 1,5 giây** — tức là khi máy thật
sự đang phải đi lấy phụ đề. Hẹn giờ này phải được huỷ ở **cả nhánh lỗi**: hỏng
nhanh (link sai, hết hạn mức) mà quên huỷ thì 1,5 giây sau câu "đang lấy phụ đề"
ghi đè mất câu báo lỗi thật.

---

### 23.5 Đo trên web thật sau khi deploy

| Video | Dựng mất | Bấm vào giờ mất |
|---|---|---|
| `aN78Tz_e5c4` (3:24) | 53s | **1,16s** |
| `4474zOLzD8k` (16:57) | 77s | **0,65s** |
| `C5kR-exHmr4` (23:55) | 115s | **0,41s** |

Header `X-Vyling-Lesson: prebuilt` xác nhận trả từ edge. Nội dung đủ: 71/71,
437/441 và 305/306 dòng có tiếng Việt, **0 dòng còn `>>`**.

Đường rơi xuống container vẫn đúng: gửi một chuỗi không phải link thì nhận
`{"detail":"Hãy dán một link video YouTube hợp lệ.","code":"INVALID_URL"}` — tức
là request đã xuống tận backend, không bị route edge nuốt.

**Lưu ý deploy:** lần recycle NGAY sau `wrangler deploy` thường vẫn dựng lại
bằng image cũ (Cloudflare rollout container là rolling, không tức thì). Kiểm
bằng cách so tên file bundle:

```bash
curl -s https://vyling.qvantruong205.workers.dev/ | grep -o 'assets/index-[A-Za-z0-9_-]*\.js'
```

Khác với `frontend/dist/index.html` trên máy thì đợi 2–3 phút rồi recycle lần nữa.

---

## 24. Tra từ tiếng Anh ở edge (`src/dict.ts`)

Với tiếng Anh, bấm vào một từ trong phụ đề đang đi đường rất tệ: `/api/define`
trả **rỗng** (bảng `dict_entries` chỉ có KRDICT tiếng Hàn), nên giao diện rơi
sang `/api/define/rich` — **gọi thẳng LLM cho từng từ mới**. Ba cái giá: chờ vài
giây, tốn lượt AI theo từng người học, và phải đánh thức container.

Nguồn thay thế: **Free Dictionary API** (`dictionaryapi.dev`) — miễn phí, không
cần khoá, có IPA, file phát âm, từ loại, định nghĩa và ví dụ. Đo thật:
`sandcastle` 0,42s · `castle` 0,22s · `bewildered` 0,21s.

`GET /cf/dict?word=…` gọt bản trả về xuống đúng phần dùng được rồi cache **hai
tầng**: R2 (`dict/en/<word>.json`) để tra một lần dùng mãi kể cả khi nguồn cộng
đồng đó chết, và `Cache-Control` để chính edge giữ bản trả về. Ghi R2 đặt trong
`ctx.waitUntil` nên người học không phải chờ thao tác lưu.

**Không thay thế `/api/define/rich`.** Từ điển Anh–Anh không có nghĩa tiếng
Việt, thứ người học Việt cần nhất. Nên giao diện chạy **song song**: bản edge về
trước, hiện ngay để có cái đọc; bản AI về sau, bổ sung phần tiếng Việt. Cái đổi
là người học không còn nhìn vòng xoay trống trong lúc chờ.

---

## 25. Bật Litestream thật (17/08) — và ba lỗi lộ ra khi bật

Sao lưu **đã chạy trên production**. Bằng chứng, không phải suy đoán:

```
tạo tài khoản        → user id uc18bc900d746a181
POST /cf/recycle     → huỷ sạch container, đĩa trắng
đăng nhập lại        → user id uc18bc900d746a181
```

Lần đăng nhập đó **không hâm nóng trước**, tức nó gặp đúng container vừa dựng
lại — chứng minh luôn cả nhánh thử lại ở §25.3.

### 25.1 `/cf/logs` — endpoint chẩn đoán (cần `X-Deploy-Token`)

Không có nó thì không thể biết vì sao Litestream im lặng: log của tiến trình
nằm trong container, `wrangler tail` chỉ thấy log Worker. Endpoint này trả về
ba khối: Worker thấy secret nào, container thấy biến nào và có binary
`litestream` không, danh sách tunnel kèm kết quả probe, và log từng tiến trình.

Chỉ in `SET`/`EMPTY`, **không bao giờ in giá trị**.

### 25.2 Ba lỗi cấu hình đã gặp, theo đúng thứ tự lộ ra

| Triệu chứng | Nguyên nhân thật |
|---|---|
| Script báo *"KHÔNG có sao lưu"* | Hai secret **tồn tại nhưng rỗng ruột** — giá trị bị đưa vào chỗ TÊN (`wrangler secret put <giá-trị>`), sinh ra hai secret rác mang tên chính là khoá |
| `tls: handshake failure` | `R2_ACCOUNT_ID` giữ nhầm **Access Key ID**, nên endpoint trỏ vào một tên miền không tồn tại |
| Web 503 kéo dài | Hệ thống tunnel kẹt sau nhiều lần huỷ container liên tiếp lúc chẩn đoán — đúng bẫy §19.3. Cứu bằng đổi `SANDBOX_ID` |

Bài học rút ra cho lần sau: **đặt secret qua dashboard, không qua terminal.**
Terminal ẩn ký tự khi dán nên không có cách nào biết mình vừa dán hụt; ô nhập
trên dashboard thì nhìn thấy được.

### 25.3 🔴 Hai lỗi thật trong `proxyToBackend`

Cả hai đều có sẵn từ trước, chỉ lộ ra khi cold start dài thêm vì Litestream
phải khôi phục DB trước khi uvicorn chạy.

**(a) POST không bao giờ được thử lại.** `canRetry` cũ đòi `!request.body`, nên
`/api/health` (GET) được thử lần hai còn đăng ký/đăng nhập (POST) hỏng phát đầu
là trả trang chờ. Ghi dữ liệu mong manh hơn hẳn đọc — mà ghi mới là thứ người
dùng quan tâm. Nay body được đọc vào bộ nhớ một lần (trần 12 MB) để POST cũng
thử lại được; body lớn hơn vẫn truyền thẳng như cũ.

**(b) Nhánh `ensureBackend` hỏng thì thoát ngay, bỏ qua hẳn `canRetry`:**

```ts
try { origin = await ensureBackend(env) }
catch { invalidate(); return waitingResponse(request) }   // ❌ không thử lại
```

Container đang dựng thì `ensureBackend` **luôn** ném lỗi, nên mọi request đầu
tiên sau mỗi lần container ngủ dậy chỉ có đúng một cơ hội — dù cơ chế thử lại
nằm ngay bên dưới. Nay cả ba nhánh hỏng đều tôn trọng `canRetry`, và mỗi lần
thử lại chờ 2,5 giây cho container kịp lên thay vì đâm lại tức thì.

Kèm theo: `originAlive` đổi từ **1 lần / 8 giây** sang **2 lần / 15 giây**. Ngưỡng
cũ quá chặt cho chuỗi *khôi phục DB → `init_db` → seed*, nên nó **huỷ nhầm
tunnel đang lành** rồi dựng cái mới với URL khác — chính là thứ châm ngòi cho
vòng luẩn quẩn ở §25.2.

---

## 26. Phục vụ SPA từ R2 ở edge (`src/site.ts`)

### 26.1 Đo trước khi sửa

| Đo | Số liệu |
|---|---|
| Mở trang khi container ngủ | **31,5s** (bắt tay mạng chỉ 0,24s — còn lại là chờ container) |
| Mở trang khi container ấm | 1,69s cho một HTML **8,9 KB** |
| Tải `assets/index-*.js` | 1,93s |
| `CF-Cache-Status` | **DYNAMIC** |

Nén vẫn có (zstd) và trang chỉ gọi 3 file, nên **không** phải lỗi kích thước hay
số lượng request. Vấn đề là **đường đi**: mọi file tĩnh đều do FastAPI trong
container phục vụ, nên phải chạy `trình duyệt → edge → tunnel → uvicorn → về`.
Riêng chặng đó ~1,5s dù file chỉ 9 KB. Và `DYNAMIC` nghĩa là Cloudflare **không
cache** — mỗi người, mỗi lần, mỗi file đều đi trọn vòng, dù header đã ghi
`immutable`. Response đi ra từ `fetch()` của Worker nên không rơi vào cache của
zone, mà `workers.dev` cũng không có quy tắc cache nào.

### 26.2 Cách sửa

Đúng như §12.3 đã ghi sẵn: đẩy lên R2 và phục vụ ở edge, y hệt `/media/*`.

Trong 104 MB của `frontend/dist`, **vỏ ứng dụng chỉ ~140 file** (`assets/`,
`index.html`, `sw.js`, manifest, `icons/`, `img/`, 18 trang prerender). Nhóm đó
lên bucket `vyling-site` qua `scripts/upload_site_r2.mjs`.

`src/site.ts` xử lý ba trường hợp:

| Đường vào | Xử lý |
|---|---|
| `/api/*`, `/cf/*`, `/media/*`, `/mcp`, `/agents/*` | trả `null` ngay — không đụng vào |
| Có file trên R2 | trả thẳng từ edge |
| Không có file, đường dẫn **không** có đuôi | trả `index.html` (SPA fallback) |
| Không có file, đường dẫn **có** đuôi | trả `null` → rơi xuống container |

Nhánh cuối là **đường lùi cố ý**: `wordimg/` (46 MB), `audio/` (38 MB),
`cosmetics/` (13 MB) chưa đẩy lên R2 nên vẫn do container phục vụ như cũ. Không
có thời điểm nào web bị trống. Đẩy nốt sau bằng `--all`.

`assets/*` là tên có băm nên đặt `immutable, max-age=31536000`; HTML đặt
`max-age=0, must-revalidate` để deploy mới được nhận ngay.

### 26.3 Đo sau khi sửa

Cách đo đáng tin nhất là **ba request liên tiếp trên cùng một kết nối** — mỗi lần
gọi `curl` riêng lại phải bắt tay TLS lại nên số bị nhiễu:

```
1,22s → 0,143s → 0,146s
```

Chi phí thật mỗi request còn **~0,15s**, so với 1,69s trước đó. `assets/*` có
tên băm nên còn được `caches.default` giữ ở edge, khỏi đọc lại R2.

| | Trước | Sau |
|---|---|---|
| HTML (ấm) | 1,69s | ~0,15s |
| `assets/index-*.js` | 1,93s | 0,28–0,79s |
| Container đang ngủ | **31,5s** | không liên quan nữa — trang không cần container |

Điều đáng giá nhất không phải con số mà là **thay đổi cấu trúc**: mở trang không
còn chạm vào container. Cold start giờ chỉ ảnh hưởng `/api/*` (đăng nhập, SRS),
mà chỗ đó đã có trang chờ và cơ chế thử lại ở §25.3 che.

Đường lùi cũng đã kiểm: `/wordimg/…` chưa lên R2 vẫn trả 200 qua container.

### 26.4 ⚠️ Deploy nay có THÊM một bước

Từ giờ `frontend/dist` nằm ở **hai nơi**: R2 (phục vụ thật) và image container
(đường lùi). Đổi frontend mà quên đẩy R2 thì người dùng vẫn thấy bản cũ, vì R2
được hỏi trước.

```bash
npm run build --prefix frontend
node scripts/upload_site_r2.mjs
npm run deploy --prefix cf
```

---

## 22. Trạng thái sau đợt 16/08 — đo trên web thật

| Đường | Kết quả |
|---|---|
| `/api/define?word=공부` | ✅ `matched: "exact"` — **từ điển đã sống**, trước đó rỗng |
| `/api/health` → Bộ não AI | ✅ `gemini · model mặc định` |
| `/api/health` → SQLite | ✅ `/app/data/hanquan.db` |
| `/` (SPA) | ✅ 200, 0,54s khi container đã ấm |
| `/media/toeic/…mp3` | ✅ 200 `audio/mpeg` từ R2 ở edge |
| `/api/content/videos` | ✅ 200 |
| `/cf/ready` | ✅ `{"ready":true}` |
| Request đầu sau `recycle` | ✅ **503 + trang chờ của mình**, không còn 530 màu cam |

Hai mục `✗` còn lại trong `/api/health` là **đúng và vô hại**: `.venv` (container
không cần) — `realFailures()` đã bỏ qua từ §13.2.

**Còn nợ đúng một việc, và nó cần bạn:** khoá S3 của R2 (§9). Chưa có thì
Litestream nằm im, log container ghi *"KHÔNG có sao lưu"*, và dữ liệu người học
vẫn mất mỗi lần container ngủ dậy. Cơ chế đã kiểm chứng chạy đúng (§20.2), chỉ
thiếu khoá.

---

## 11. Kích thước bundle Worker

Mặc định Flue nạp **tất cả** nhà cung cấp model (OpenAI, Anthropic, Vertex,
Mistral, Azure, Copilot…). Cả hai agent ở đây đều chạy qua Workers AI binding,
nên `flue.config.ts` đặt `providers: ['cloudflare']` để loại phần còn lại.

Số đo thật của `wrangler deploy --dry-run`:

```
Total Upload: 4649.29 KiB / gzip: 1043.43 KiB
```

Trần Workers: **3 MB gzip (Free)**, 10 MB (Paid) → còn rất nhiều chỗ. Nếu sau
này thêm nhà cung cấp model khác, nhớ đo lại.

---

## 9. Việc chỉ bạn làm được

**Bật Docker (đang chặn việc build container):** Docker Desktop 29.4.2 đã cài
sẵn, nhưng WSL2 chưa có distro nên engine không chạy. Cần quyền admin và phải
bấm đồng ý giấy phép — hai thứ nên do bạn tự làm:

```bash
wsl --install --no-distribution
```

Chạy trong PowerShell **Run as Administrator**, khởi động lại máy, rồi mở Docker
Desktop từ Start Menu và bấm Accept ở màn hình giấy phép lần đầu. Xong thì
`docker info` phải ra phiên bản engine.

**🔴 Tạo khoá S3 cho R2 (đang chặn việc sao lưu dữ liệu người dùng):** Litestream
chạy trong container nên nói chuyện S3 thẳng với R2 — binding R2 của Worker
không dùng được. Vào **Cloudflare Dashboard → R2 → API → Manage API tokens →
Create API token**, quyền **Object Read & Write**, giới hạn vào bucket
`vyling-db`. Nhận về Access Key ID, Secret Access Key, và Account ID:

```bash
npx wrangler secret put R2_ACCESS_KEY_ID --cwd cf
```

Rồi `R2_SECRET_ACCESS_KEY` và `R2_ACCOUNT_ID` y hệt. **Chưa đặt đủ ba cái thì web
vẫn chạy nhưng KHÔNG có sao lưu** — log container ghi rõ dòng cảnh báo, và mỗi
lần container ngủ dậy là mất sạch tài khoản người học (xem §20.2).

- Tài khoản Cloudflare + `wrangler login`
- Đăng ký quyền beta Worker Loader (nếu muốn Code Mode chạy production)
- ~~Domain riêng có wildcard DNS~~ — **không còn cần** kể từ khi chuyển sang
  tunnels, xem §14
- Tạo instance AI Search trên dashboard
- Nạp secrets bằng `wrangler secret put`

## 10. Đã kiểm chứng và chưa kiểm chứng

**Đã chạy thật, kết quả xanh:**
- `tsc --noEmit` trong `cf/` — sạch (lần đầu tìm ra 3 lỗi thật: `Cloudflare.Env`
  namespace, tên binding `Sandbox`, và kiểu `ExecutionContext` — đã sửa)
- `vite build` trong `cf/` — Worker bundle thành công
- `wrangler deploy --dry-run` — **gzip 1043 KiB**, xác nhận đủ 11 binding, và
  entry export đúng 4 class: `FlueVylingOpsAgent`, `FlueVylingTutorAgent`,
  `Sandbox`, `VylingMcp` (khớp migration tag trong `wrangler.jsonc`)
- `scheduled` handler + model id Whisper có mặt trong bundle đã build
- `frontend` type-check sạch, build đầy đủ, chạy được cả hai chế độ bật/tắt
- `backend.main` import bình thường, **43/43 test backend xanh**
- corpus builder ra 91.622 tài liệu

**Container ĐÃ build và chạy được (15/08):**
- `docker build -f cf/Dockerfile -t vyling-sandbox .` → image **2,52 GB**
- Container chạy: sandbox entrypoint spawn `python3 -m uvicorn`, uvicorn lên,
  **`/api/health` trả 200 sau ~6 giây**
- Trong container: Python 3.11.14, FFmpeg ✓, FFprobe ✓, yt-dlp ✓, edge-tts ✓,
  SQLite ✓, `import backend.main` ✓

Lần build đầu tiên đó tìm ra **4 lỗi thật** — xem §13.
- Thời gian cold start thật của sandbox (lifespan chạy `init_db` + seed + import
  từ điển — có thể lâu hơn timeout 120s đang đặt trong `legacy-proxy.ts`)
- Hành vi preview URL (cần wildcard DNS)
- Chất lượng Whisper thực tế trên giọng người Việt nói tiếng Hàn
- Cron có bắn đúng giờ không, và agent trực ca báo cáo có dùng được không
