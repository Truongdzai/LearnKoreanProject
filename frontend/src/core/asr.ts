import { useEffect, useState } from 'react'
import { env } from '@/config/env'

const EDGE_TIMEOUT_MS = 4000

let probe: Promise<boolean> | null = null

export function edgeAsrBase(): string {
	return env.agentBase.replace(/\/$/, '')
}

export function hasEdgeAsr(): Promise<boolean> {
	if (probe) return probe
	probe = (async () => {
		if (typeof fetch !== 'function') return false
		try {
			const res = await fetch(`${edgeAsrBase()}/cf/ping`, {
				signal: AbortSignal.timeout(EDGE_TIMEOUT_MS),
			})
			if (!res.ok) return false
			const data = (await res.json()) as { pong?: boolean }
			return data.pong === true
		} catch {
			return false
		}
	})()
	return probe
}

export function useEdgeAsr(): boolean {
	const [ok, setOk] = useState(false)
	useEffect(() => {
		let alive = true
		void hasEdgeAsr().then((v) => { if (alive) setOk(v) })
		return () => { alive = false }
	}, [])
	return ok
}
