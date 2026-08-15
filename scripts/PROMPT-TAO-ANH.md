# Nhiệm vụ: vẽ ảnh minh hoạ cho từ vựng tiếng Anh

Bạn là agent lập trình làm việc trực tiếp trên repo này. Hãy đọc hết trước khi bắt đầu.

## Bối cảnh

Đây là web học ngoại ngữ. Trang **Học sâu từ vựng** cần mỗi từ một hình minh hoạ nhỏ.
Kho từ nằm ở `frontend/src/data/english/units/*.json`, mỗi từ có `en`, `vi`, `pos`.
Hiện có **2.843 từ đơn**: 1.669 danh từ · 589 động từ · 427 tính từ · 106 trạng từ · 41 giới từ.

Chúng tôi đã thử tìm ảnh có sẵn trên kho ảnh mở và **thất bại một cách có quy luật** — đọc kỹ
phần "Bài học" bên dưới, đó là phần quan trọng nhất của nhiệm vụ này.

## Việc cần làm

Sinh ảnh bằng model tạo ảnh của Gemini, lưu **thẳng vào repo**, và cập nhật danh sách.

- Ảnh: `frontend/public/wordimg/<từ-viết-thường>.webp`
- Danh sách: thêm từ vào mảng `words` trong `frontend/src/data/english/wordImages.json`

Web tự đọc danh sách đó; **không cần sửa code React**. Chỉ cần thêm file ảnh và thêm tên từ
vào mảng `words` là ảnh hiện ra.

## Khoá API

**14/08: đã đổi nhà cung cấp hai lần.** Gemini bắt bật thanh toán mới cho tạo ảnh; Together AI thì
tài khoản mới rơi vào "read-only mode", phải nạp tiền mới gọi được API. Nhà cung cấp đang dùng là
**Cloudflare Workers AI**, model `@cf/black-forest-labs/flux-1-schnell`, gói miễn phí 10.000
neuron/ngày và **không cần thẻ ngân hàng**. Công cụ đã viết sẵn: `scripts/gen_wordimg.py`.

Khoá đọc từ biến môi trường `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`, nếu không có thì đọc
`config.toml` mục `[cloudflare]`. **Không commit khoá vào repo trong bất kỳ trường hợp nào** —
`config.toml` đã nằm ngoài git.

Gọi qua `POST https://api.cloudflare.com/client/v4/accounts/<account_id>/ai/run/<model>` với thân
`{"prompt": ..., "steps": 2}`, ảnh nằm ở `result.image` (base64). Model **không nhận `width/height`**
(gửi vào là lỗi 400) — ảnh luôn 1024×1024, tức 4 ô 512px. `--check` để kiểm khoá và lấy `account_id`.

**Tiền bạc — đọc kỹ.** Tài khoản đang ở gói Workers Paid 5 USD/tháng, nên **hết 10.000 neuron miễn
phí mỗi ngày là API vẫn chạy tiếp và tính tiền**, không còn bị chặn như gói free. Giá neuron của
`flux-1-schnell`: 4,8/ô 512px + 9,6/bước → ảnh 1024px 2 bước ≈ 48 neuron (đo thật ở 4 bước là ~72,
cao hơn công thức ~25% nên công cụ nhân hệ số an toàn 1,25). Công cụ tự đếm và **dừng ở đúng 10.000
neuron mỗi ngày UTC**, ghi sổ ở `scripts/wordimg_usage.json`. Nâng `--budget` lên là **tiêu tiền
thật** — chủ dự án đã ấn định trần vượt tối đa 0,1 USD, đừng tự ý vượt.

**🔴 Đạo cụ cấm trong câu tả cảnh.** Gặp mấy thứ này là FLUX viết chữ vào ảnh, mà viết sai chính tả
(đo thật: `annual` → "Heppy Birthday.", `last`/`final` → "FINSH", `recent` → "Taday. It us is dom an
one day", `great` → số 1 trên bục, `responsible` → chữ mờ "every single day" ở đáy ảnh). **Không bao
giờ** tả: lịch, tờ báo, thư đang đọc, biển hiệu, băng rôn, vạch đích, bảng điểm, màn hình, sách mở,
áp phích, bằng khen, huy chương hay bục có số hạng. Tìm cách khác diễn đạt ý đó — ví dụ `monthly`
dùng bốn pha mặt trăng thay tờ lịch, `last` dùng chiếc bánh cuối cùng trên đĩa thay vạch đích.

**Soi ảnh:** `--audit` nhờ Gemini xem từng ảnh, trả về `has_text` (có chữ trong ảnh không) và
`matches` (có đúng nghĩa không), lưu ở `scripts/wordimg_audit.json`. Đo thật trên 323 ảnh:
`has_text` **không bỏ sót ca nào** (bắt được cả chữ mờ ở `responsible` mà mắt người bỏ qua) nhưng
**báo thừa khoảng một nửa** — hay nhầm nhãn chai trống, ô vuông trắng, phù hiệu thành chữ. `matches`
còn khắt khe hơn nữa, gạch oan chừng hai phần ba (kể cả `angry`, `bankrupt`, `dizzy`, `enormous`).
Vậy **cả hai chỉ dùng để lọc ra danh sách ngắn rồi nhìn bằng mắt** qua `--review --only ...`, đừng
để máy tự quyết vẽ lại — sẽ đốt neuron oan. Vẽ lại thì **xoá file ảnh đi là đủ**, mẻ sau tự nhận ra
thiếu và vẽ lại. Từ nào không vẽ được cho tử tế thì đặt câu tả cảnh thành `"skip"` trong
`scripts/wordscenes.json`, web sẽ tự lùi về emoji — hiện **không có từ nào bị bỏ**.

**Người xem là người học trưởng thành, không phải trẻ em.** Đây là quyết định của chủ dự án
(15/08). Từ nào cần vẽ đúng đời thật thì cứ vẽ: rượu bia, thuốc lá, vũ khí, bệnh tật, bệnh viện,
tang lễ, tội phạm, cãi vã, thương tích — đây là **tranh vẽ hoạt hình**, né tránh chỉ tạo ra ảnh sai
nghĩa (`drunk` từng bị bỏ hẳn vì lý do này, nay đã vẽ bình thường: người đỏ mặt loạng choạng cầm
chai bia). Giới hạn duy nhất còn giữ: không khoả thân, không nội dung tình dục, không máu me ghê rợn
— vừa là chuẩn mực sản phẩm, vừa vì bộ lọc của Cloudflare sẽ từ chối.

## Prompt vẽ ảnh

Với mỗi từ, ghép prompt theo mẫu sau. Phần `<hướng dẫn theo từ loại>` chọn theo `pos`:

```
An illustration teaching the English word "<en>" which means "<vi>". <hướng dẫn theo từ loại>
Do not draw anything that merely sounds like the word or shares its spelling — draw the meaning itself.
Flat vector clipart illustration in a friendly educational flashcard style. One single centered subject,
bold simple shapes, bright cheerful colours, soft rounded edges, solid plain white background.
Absolutely no text, no letters, no numbers, no watermark, no signature, no border.
Fully clothed, modest, suitable for children.
```

| `pos` | `<hướng dẫn theo từ loại>` |
|---|---|
| `noun` | Show the object or thing itself, clearly recognisable on its own. |
| `verb` | Show a person in the middle of doing this action, so the action is obvious. |
| `adj` | Show a simple scene where this quality is the most obvious thing in the picture. |
| `adverb` | Show a simple scene where this manner is the most obvious thing in the picture. |
| `prep` | Show two simple objects arranged so the spatial relation is unmistakable. |

## Xử lý ảnh trước khi lưu

1. Mở bằng Pillow, giữ kênh alpha nếu có.
2. Resize về chiều rộng **480px** (giữ tỉ lệ), chỉ thu nhỏ, không phóng to.
3. Lưu **WebP**, `quality=86`. Mỗi ảnh nên dưới 60KB.
4. Tên file là từ viết thường, đúng như trong `units/*.json`.

## Bài học từ lần thất bại trước — đọc kỹ

Chúng tôi từng tìm ảnh trên kho ảnh mở, kết quả sai theo đúng một kiểu: **từ ghép cướp nghĩa**.

| Từ | Ảnh nhận được | Vì sao sai |
|---|---|---|
| big | Big **Ben** | tên riêng |
| hot | **hot dog** | món ăn |
| hard | **hard disk** | linh kiện |
| fast | **fast food** | đồ ăn nhanh |
| condition | **air conditioner** | máy lạnh |
| good | **good luck** | cụm khác |
| happy | chữ "HAPPY BIRTHDAY" | là chữ, không phải hình |
| back | **back to school** | cụm khác |
| ear | hoa **bear's ear** | tên loài hoa |
| foot | **40-foot** telescope | đơn vị đo |
| nose | kìm **needle nose** | dụng cụ |
| tail | roi **cat o' nine tails** | dụng cụ |

Vì vậy câu **"draw the meaning itself, not something that sounds like the word"** trong prompt là
bắt buộc, đừng bỏ.

Hai luật cứng khác:

- **Tuyệt đối không có chữ trong ảnh.** Model vẽ chữ hay bị sai chính tả, và ảnh dạng chữ thì
  vô dụng cho việc học nghĩa.
- **Nội dung phải an toàn cho trẻ em.** Bản trước từng lọt một ảnh người không mặc đủ quần áo cho
  từ `people`. Prompt đã có `fully clothed, modest, suitable for children` — giữ nguyên, và nếu
  ảnh nào trông đáng ngờ thì bỏ, đừng commit.

## Cách chạy

**Làm theo mẻ, đừng chạy một lượt 3.122 từ.** Mỗi mẻ 25–50 từ, commit sau mỗi mẻ.

Thứ tự ưu tiên (nhóm khó tìm ảnh nhất, AI vẽ có lợi nhất): **tính từ → trạng từ → động từ → giới từ
→ danh từ → cụm từ**. Đây cũng là thứ tự mặc định của công cụ.

```
python scripts/gen_wordimg.py --pos adj --limit 25 --sheet review.png
```

Công cụ tự bỏ qua từ đã có ảnh, tự cập nhật `wordImages.json`, và ghép sẵn bảng ảnh có nhãn
(`--sheet`) để người duyệt nhìn một lượt. Cờ khác: `--only` (chỉ vài từ), `--force` (vẽ lại),
`--dry-run`, `--workers`, `--delay` (giãn cách chống lỗi 429), `--rebuild-list`.

## Ràng buộc của repo

- **Không commit khoá API.** `config.toml` đang bị `.gitignore` — giữ nguyên như vậy.
- **Không ghi vào `data/`** — thư mục đó bị `.gitignore`, file bỏ vào đó sẽ không lên GitHub.
- Toàn bộ chuỗi hiển thị cho người dùng phải bằng **tiếng Việt**.
- Không thêm comment vào code, giữ đúng phong cách các file sẵn có.
- Sau khi sửa frontend phải chạy `npm run build --prefix frontend` để chắc không vỡ.

## Xong việc thì báo lại

- Bao nhiêu ảnh đã sinh, bao nhiêu từ bị bỏ qua và vì sao.
- Tổng dung lượng thêm vào repo.
- Danh sách từ mà bạn thấy ảnh đáng ngờ, để người duyệt xem lại bằng mắt.
