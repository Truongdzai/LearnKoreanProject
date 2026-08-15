import type { Sandbox as SandboxDO } from '@cloudflare/sandbox'

declare global {
	namespace Cloudflare {
		interface Env {
			Sandbox: DurableObjectNamespace<SandboxDO>
			MCP_OBJECT: DurableObjectNamespace
			AI: Ai
			LOADER?: WorkerLoader
			MEDIA: R2Bucket
			KNOWLEDGE_BASE: R2Bucket

			APP_PORT: string
			AI_SEARCH_NAME: string
			PUBLIC_URL: string

			LLM_API_KEY?: string
			JWT_SECRET?: string
			SMTP_PASSWORD?: string
			GOOGLE_CLIENT_SECRET?: string
			FACEBOOK_APP_SECRET?: string
		}
	}

	type Env = Cloudflare.Env
}

export {}
