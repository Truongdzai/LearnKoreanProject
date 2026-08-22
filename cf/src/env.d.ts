declare global {
	interface Env {
		LOADER?: WorkerLoader

		SANDBOX_SLEEP_AFTER?: string

		OPS_AGENT?: string

		DEPLOY_TOKEN?: string
		LLM_API_KEY?: string
		R2_ACCESS_KEY_ID?: string
		R2_SECRET_ACCESS_KEY?: string
		R2_ACCOUNT_ID?: string
		ADMIN_PASSWORD?: string
		JWT_SECRET?: string
		SMTP_PASSWORD?: string
		GOOGLE_CLIENT_ID?: string
		GOOGLE_CLIENT_SECRET?: string
		FACEBOOK_APP_ID?: string
		FACEBOOK_APP_SECRET?: string
	}
}

export {}
