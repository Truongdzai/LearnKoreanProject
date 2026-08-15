// Binding lấy từ worker-configuration.d.ts do `wrangler types` sinh ra từ
// wrangler.jsonc — KHÔNG khai lại ở đây, viết tay là chắc chắn lệch.
// File này chỉ bổ sung secret: secret nạp bằng `wrangler secret put` nên không
// nằm trong wrangler.jsonc, wrangler không thể biết để sinh kiểu.
//
// Bổ sung vào `Env` toàn cục chứ không phải `Cloudflare.Env`: file sinh ra khai
// `interface Env extends __BaseEnv_Env {}` ở phạm vi global, và code dùng chính
// interface đó. Ghi vào `Cloudflare.Env` sẽ không với tới nó.
declare global {
	interface Env {
		// Binding Worker Loader (Code Mode). Đang comment trong wrangler.jsonc
		// vì nó kéo theo cờ `experimental` mà Cloudflare không cho deploy, nên
		// wrangler không sinh kiểu cho nó. Khai optional ở đây để code kiểm tra
		// `!!env.LOADER` vẫn biên dịch được, và tự bật lại khi có quyền beta.
		LOADER?: WorkerLoader

		DEPLOY_TOKEN?: string
		LLM_API_KEY?: string
		ADMIN_PASSWORD?: string
		JWT_SECRET?: string
		SMTP_PASSWORD?: string
		GOOGLE_CLIENT_SECRET?: string
		FACEBOOK_APP_SECRET?: string
	}
}

export {}
