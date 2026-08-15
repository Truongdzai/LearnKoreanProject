import { McpAgent } from 'agents/mcp'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { proxyToBackend } from '../legacy-proxy'
import { TOOLS } from './tools'

export class VylingMcp extends McpAgent<Env> {
	server = new McpServer({
		name: 'vyling',
		version: '1.0.0',
	})

	async init() {
		for (const tool of TOOLS) {
			this.server.tool(tool.name, tool.description, tool.schema, async (args) => {
				const spec = tool.request(args as Record<string, unknown>)
				const init: RequestInit = { method: spec.method ?? 'GET' }
				if (spec.body !== undefined) {
					init.method = spec.method ?? 'POST'
					init.body = JSON.stringify(spec.body)
					init.headers = { 'Content-Type': 'application/json' }
				}

				const request = new Request(`https://vyling.internal${spec.path}`, init)
				const response = await proxyToBackend(request, this.env)
				const text = await response.text()

				if (!response.ok) {
					return {
						content: [
							{
								type: 'text' as const,
								text: `Lỗi ${response.status} khi gọi ${spec.path}: ${text.slice(0, 500)}`,
							},
						],
						isError: true,
					}
				}

				return { content: [{ type: 'text' as const, text }] }
			})
		}
	}
}
