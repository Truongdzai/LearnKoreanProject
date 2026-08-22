import { dispatch } from '@flue/runtime'
import { VylingOps } from '../agents/vyling-ops'
import { ensureBackend } from '../legacy-proxy'

const SLOW_MS = 5_000
const EDGE_ATTEMPTS = 3
const EDGE_PAUSE_MS = 3_000

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
	coldMs: number
	detail: string
}

function why(error: unknown): string {
	return error instanceof Error ? error.message : String(error)
}

function pause(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

function realFailures(payload: unknown): string[] {
	if (!Array.isArray(payload)) return []
	return (payload as HealthCheck[])
		.filter((c) => c && c.ok === false && c.optional !== true)
		.filter((c) => !IGNORED_CHECKS.some((skip) => (c.name ?? '').includes(skip)))
		.map((c) => `${c.name ?? '?'} (${c.detail ?? 'không rõ'})`)
}

async function edgeFailure(env: Env): Promise<string> {
	if (!env.SITE) return ''
	try {
		const shell = await env.SITE.head('index.html')
		if (!shell) return 'kho vyling-site không còn index.html — trang chủ sẽ trắng'
		return ''
	} catch (error) {
		return `không đọc được kho vyling-site: ${why(error)}`
	}
}

async function checkEdge(env: Env): Promise<string> {
	let last = ''
	for (let attempt = 0; attempt < EDGE_ATTEMPTS; attempt++) {
		last = await edgeFailure(env)
		if (!last) return ''
		if (attempt < EDGE_ATTEMPTS - 1) await pause(EDGE_PAUSE_MS)
	}
	return last
}

async function probeBackend(env: Env): Promise<Probe> {
	const wokeAt = Date.now()
	try {
		const origin = await ensureBackend(env)
		const coldMs = Date.now() - wokeAt

		const started = Date.now()
		const res = await fetch(`${origin}/api/health`, { method: 'GET' })
		const ms = Date.now() - started
		const failed = realFailures(await res.json().catch(() => null))

		if (!res.ok) return { ok: false, status: res.status, ms, coldMs, detail: `HTTP ${res.status}` }
		if (failed.length) {
			return { ok: false, status: res.status, ms, coldMs, detail: `hạng mục lỗi: ${failed.join('; ')}` }
		}
		if (ms > SLOW_MS) {
			return { ok: false, status: res.status, ms, coldMs, detail: `phản hồi chậm ${ms}ms` }
		}
		return { ok: true, status: res.status, ms, coldMs, detail: `ổn (khởi động ${coldMs}ms, trả lời ${ms}ms)` }
	} catch (error) {
		return {
			ok: false,
			status: null,
			ms: 0,
			coldMs: Date.now() - wokeAt,
			detail: why(error),
		}
	}
}

async function wake(id: string, type: string, body: string, attributes: Record<string, string>) {
	await dispatch(VylingOps, {
		id,
		message: { kind: 'signal', type, body, attributes },
	})
}

function agentEnabled(env: Env): boolean {
	return (env.OPS_AGENT ?? 'off').toLowerCase() === 'on'
}

const ALERT_KEY = 'ops/alert-state'
const ALERT_QUIET_MS = 6 * 60 * 60 * 1000

async function shouldAlert(env: Env, now: number): Promise<boolean> {
	if (!env.LESSONS) return true
	try {
		const last = await env.LESSONS.get(ALERT_KEY)
		const at = last ? Number(await last.text()) : 0
		if (at && now - at < ALERT_QUIET_MS) return false
		await env.LESSONS.put(ALERT_KEY, String(now))
		return true
	} catch {
		return true
	}
}

export async function handleScheduled(
	controller: ScheduledController,
	env: Env,
	ctx: ExecutionContext,
) {
	const at = new Date(controller.scheduledTime).toISOString()

	switch (controller.cron) {
		case '*/30 * * * *': {
			const broken = await checkEdge(env)
			if (!broken) return
			console.warn(`[ops] Lớp edge THẤT BẠI lúc ${at}: ${broken}`)
			if (!agentEnabled(env)) return
			if (!(await shouldAlert(env, controller.scheduledTime))) return
			ctx.waitUntil(
				wake(
					`health-watch-${at.slice(0, 10)}`,
					'incident',
					`Lớp edge THẤT BẠI lúc ${at} sau ${EDGE_ATTEMPTS} lần thử: ${broken}. ` +
						'Đây là lỗi chặn cả người chưa đăng nhập. Hãy gọi suc_khoe_he_thong để xác nhận ' +
						'rồi kết luận: hỏng gì, người học có bị ảnh hưởng không, cần làm gì tiếp theo.',
					{ scheduledAt: at, layer: 'edge' },
				),
			)
			return
		}

		case '0 3 * * *': {
			const broken = await checkEdge(env)
			if (!agentEnabled(env)) {
				console.log(`[ops] Báo cáo ngày ${at.slice(0, 10)} — edge: ${broken || 'ổn'}. `
					+ 'Agent đang TẮT (OPS_AGENT != "on") nên không đánh thức container.')
				return
			}
			const result = await probeBackend(env)
			ctx.waitUntil(
				wake(
					`daily-report-${at.slice(0, 10)}`,
					'schedule',
					`Báo cáo vận hành ngày ${at.slice(0, 10)}. ` +
						`Lớp edge: ${broken || 'ổn'}. ` +
						`Backend: ${result.detail}. ` +
						'Hãy xem sức khoẻ hệ thống và tình hình học tập, viết báo cáo ngắn. ' +
						'Nhắc nếu corpus AI Search đã cũ — index KHÔNG tự cập nhật khi dữ liệu đổi, ' +
						'phải chạy lại cf/ai-search/build-corpus.mjs rồi Sync thủ công.',
					{ scheduledAt: at, probe: result.detail, coldMs: String(result.coldMs) },
				),
			)
			return
		}

		default:
			console.warn(`[ops] Chưa có xử lý cho lịch "${controller.cron}"`)
	}
}
