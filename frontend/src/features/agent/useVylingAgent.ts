import { useMemo, useState } from 'react'
import { useFlueAgent } from '@flue/react'
import { env } from '@/config/env'

export const agentEnabled = !!env.agentBase

export type AgentStatus = 'idle' | 'connecting' | 'submitted' | 'streaming' | 'error'

export function useVylingAgent() {
	const [conversationId] = useState(() =>
		typeof crypto !== 'undefined' && 'randomUUID' in crypto
			? crypto.randomUUID()
			: String(Date.now()),
	)

	const url = useMemo(
		() => `${env.agentBase.replace(/\/$/, '')}/agents/vyling-tutor/${conversationId}`,
		[conversationId],
	)

	const agent = useFlueAgent({ url })

	return {
		...agent,
		status: agent.status as AgentStatus,
		conversationId,
	}
}
