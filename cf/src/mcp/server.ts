import { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod'
import { proxyToBackend } from '../legacy-proxy'
import { TOOLS } from './tools'

export function buildMcpServer(env: Env): McpServer {
	const server = new McpServer({ name: 'vyling', version: '2.0.0' })

	for (const tool of TOOLS) {
		server.registerTool(
			tool.name,
			{ description: tool.description, inputSchema: z.object(tool.schema) },
			async (args) => {
				const spec = tool.request((args ?? {}) as Record<string, unknown>)
				const init: RequestInit = { method: spec.method ?? 'GET' }
				if (spec.body !== undefined) {
					init.method = spec.method ?? 'POST'
					init.body = JSON.stringify(spec.body)
					init.headers = { 'Content-Type': 'application/json' }
				}

				const response = await proxyToBackend(
					new Request(`https://vyling.internal${spec.path}`, init),
					env,
				)
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
			},
		)
	}

	return server
}
