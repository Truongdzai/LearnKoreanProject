import { dispatch } from '@flue/runtime'
import { VylingOps } from '../agents/vyling-ops'
import { ensureBackend } from '../legacy-proxy'

const SLOW_MS = 5_000

const IGNORED_CHECKS = ['.venv']

interface HealthCheck {
	name?: string
	ok?: boolean
	detail?: string
	optional?: boolean
}

interface Probe {
	ok: boolean
	status: number | null
	ms: number
	detail: string
}

function realFailures(payload: unknown): string[] {
	if (!Array.isArray(payload)) return []
	return (payload as HealthCheck[])
		.filter((c) => c && c.ok === false && c.optional !== true)
		.filter((c) => !IGNORED_CHECKS.some((skip) => (c.name ?? '').includes(skip)))
		.map((c) => `${c.name ?? '?'} (${c.detail ?? 'không rõ'})`)
}

async function probe(env: Env): Promise<Probe> {
	const started = Date.now()
	try {
		const origin = await ensureBackend(env, new Request(`${env.PUBLIC_URL}/cf/ops`))
		const res = await fetch(`${origin}/api/health`, { method: 'GET' })
		const ms = Date.now() - started
		const failed = realFailures(await res.json().catch(() => null))

		if (!res.ok) return { ok: false, status: res.status, ms, detail: `HTTP ${res.status}` }
		if (failed.length) {
			return { ok: false, status: res.status, ms, detail: `hạng mục lỗi: ${failed.join('; ')}` }
		}
		if (ms > SLOW_MS) {
			return { ok: false, status: res.status, ms, detail: `phản hồi chậm ${ms}ms` }
		}
		return { ok: true, status: res.status, ms, detail: 'ổn' }
	} catch (error) {
		return {
			ok: false,
			status: null,
			ms: Date.now() - started,
			detail: error instanceof Error ? error.message : String(error),
		}
	}
}

async function wake(id: string, type: string, body: string, attributes: Record<string, string>) {
	await dispatch(VylingOps, {
		id,
		message: { kind: 'signal', type, body, attributes },
	})
}

export async function handleScheduled(
	controller: ScheduledController,
	env: Env,
	ctx: ExecutionContext,
) {
	const at = new Date(controller.scheduledTime).toISOString()

	switch (controller.cron) {
		case '*/30 * * * *': {
			const result = await probe(env)
			if (result.ok) return
			ctx.waitUntil(
				wake(
					'health-watch',
					'incident',
					`Kiểm tra sức khoẻ THẤT BẠI lúc ${at}: ${result.detail}. ` +
						'Hãy gọi suc_khoe_he_thong để xác nhận rồi kết luận: hỏng gì, ' +
						'người học có bị ảnh hưởng không, cần làm gì tiếp theo.',
					{ scheduledAt: at, status: String(result.status), ms: String(result.ms) },
				),
			)
			return
		}

		case '0 3 * * *': {
			const result = await probe(env)
			ctx.waitUntil(
				wake(
					'daily-report',
					'schedule',
					`Báo cáo vận hành ngày ${at.slice(0, 10)}. ` +
						`Kết quả kiểm tra tự động: ${result.detail} (${result.ms}ms). ` +
						'Hãy xem sức khoẻ hệ thống và tình hình học tập, viết báo cáo ngắn. ' +
						'Nhắc nếu corpus AI Search đã cũ — index KHÔNG tự cập nhật khi dữ liệu đổi, ' +
						'phải chạy lại cf/ai-search/build-corpus.mjs rồi Sync thủ công.',
					{ scheduledAt: at, probe: result.detail },
				),
			)
			return
		}

		default:
			console.warn(`[ops] Chưa có xử lý cho lịch "${controller.cron}"`)
	}
}
