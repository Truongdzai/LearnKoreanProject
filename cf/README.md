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

## 15. 🔴 Secret CHƯA nạp được vào backend — phải xử lý trước khi chạy thật

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

### 17.1 🔴 Container CHƯA CÓ DỮ LIỆU

`/app/dictionaries/` và `/app/data/` **rỗng**. `Dockerfile.dockerignore` cố tình
loại chúng (§12), dự tính nạp từ R2 lúc chạy — nhưng **phần nạp đó chưa viết**.

Hệ quả cụ thể:
- Từ điển KRDICT **91.481 mục → 0**. `/api/define` trả rỗng, và tool MCP `tra_tu`
  cũng vậy.
- SQLite là DB mới tinh mỗi lần container dựng lại, không phải `data/hanquan.db`
  24MB có sẵn. Tài khoản, thẻ SRS, tiến độ đều không có.
- `/media/*` phục vụ từ R2 nhưng **bucket đang rỗng**.

Nói cho đúng: **kiến trúc đã kiểm chứng, đường dẫn dữ liệu thì chưa dựng.**
Deploy này trả lời "chạy được trên Cloudflare không", chưa phải "web dùng được chưa".

### 17.2 Ba việc còn nợ, theo thứ tự

1. **Nạp dữ liệu** — đẩy `dictionaries/` + `media/` lên R2, mount hoặc tải lúc
   container khởi động. Quyết định luôn: SQLite dùng chung một volume bền hay
   chuyển sang D1.
2. **Secret tới được backend** (§15) — chưa có thì mọi tính năng cần LLM đều tắt.
3. **Cold start**: lần gọi đầu trả 500 rồi 530 trong lúc container dựng và tunnel
   chưa sẵn sàng; ~2,2s khi đã ấm. Cần chặn lỗi đó bằng trang chờ hoặc thử lại,
   đừng để người học thấy 500.

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
