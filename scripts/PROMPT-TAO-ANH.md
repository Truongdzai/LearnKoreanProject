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

Đọc từ biến môi trường `GEMINI_API_KEY`. **Không** đọc `config.toml` (file đó không có trong repo,
và không được commit khoá vào repo trong bất kỳ trường hợp nào).

Model: thử lần lượt `gemini-3.1-flash-lite-image` → `gemini-3.1-flash-image` → `gemini-2.5-flash-image`.
Gọi qua `POST https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`,
lấy ảnh ở `candidates[0].content.parts[].inlineData.data` (base64).

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

**Làm theo mẻ, đừng chạy một lượt 2.843 từ.** Mỗi mẻ 25–50 từ, commit sau mỗi mẻ.

Thứ tự ưu tiên (nhóm khó tìm ảnh nhất, AI vẽ có lợi nhất): **tính từ → trạng từ → động từ → danh từ**.

Sau mỗi mẻ, ghép ảnh thành một bảng có nhãn để người duyệt nhìn một lượt. Repo đã có sẵn công cụ
tương tự ở `scripts/review_images.py` (hàm `sheet()`) — đọc để tái dùng cách ghép bảng.

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
