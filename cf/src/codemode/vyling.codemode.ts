import { CodemodeConnector, type ConnectorTool } from '@cloudflare/codemode'
import { z } from 'zod'
import { proxyToBackend } from '../legacy-proxy'
import { TOOLS } from '../mcp/tools'

const NEEDS_APPROVAL = new Set(['them_the_srs', 'phu_de_video'])

export class VylingConnector extends CodemodeConnector<Env> {
	name() {
		return 'vyling'
	}

	protected instructions() {
		return [
			'API của VyLing — web học ngoại ngữ qua video YouTube.',
			'Dùng để tra từ điển offline, đọc/ghi thẻ ôn tập ngắt quãng (SRS),',
			'liệt kê kho video đã kiểm chứng phụ đề, và lấy phụ đề song ngữ.',
			'Hệ thẻ SRS là của riêng VyLing, không phải Anki.',
			'Luôn xem thong_ke_srs trước khi gợi ý nội dung học, để bám đúng trình độ.',
		].join(' ')
	}

	protected tools(): Record<string, ConnectorTool> {
		const out: Record<string, ConnectorTool> = {}

		for (const tool of TOOLS) {
			out[tool.name] = {
				description: tool.description,
				inputSchema: z.toJSONSchema(z.object(tool.schema)) as ConnectorTool['inputSchema'],
				requiresApproval: NEEDS_APPROVAL.has(tool.name),
				execute: async (args) => {
					const spec = tool.request((args ?? {}) as Record<string, unknown>)
					const init: RequestInit = { method: spec.method ?? 'GET' }
					if (spec.body !== undefined) {
						init.method = spec.method ?? 'POST'
						init.body = JSON.stringify(spec.body)
						init.headers = { 'Content-Type': 'application/json' }
					}
					const response = await proxyToBackend(
						new Request(`https://vyling.internal${spec.path}`, init),
						this.env,
					)
					const text = await response.text()
					if (!response.ok) {
						throw new Error(`VyLing API ${response.status} tại ${spec.path}: ${text.slice(0, 300)}`)
					}
					try {
						return JSON.parse(text)
					} catch {
						return text
					}
				},
			}
		}

		return out
	}
}
