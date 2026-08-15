import { createCodemodeRuntime, DynamicWorkerExecutor } from '@cloudflare/codemode'
import { VylingConnector } from './vyling.codemode'

export function isCodeModeAvailable(env: Env): boolean {
	return !!env.LOADER
}

export function createVylingCodemode(ctx: DurableObjectState, env: Env) {
	if (!env.LOADER) {
		throw new Error(
			'Code Mode cần Worker Loader binding (`worker_loaders` trong wrangler.jsonc) — ' +
				'tính năng đang ở beta kín. Đăng ký quyền truy cập tại ' +
				'https://developers.cloudflare.com/workers/runtime-apis/bindings/worker-loader/ ' +
				'hoặc bỏ comment binding nếu tài khoản đã được cấp.',
		)
	}

	return createCodemodeRuntime({
		ctx,
		executor: new DynamicWorkerExecutor({ loader: env.LOADER }),
		connectors: [new VylingConnector(ctx as unknown as ExecutionContext, env)],
	})
}
