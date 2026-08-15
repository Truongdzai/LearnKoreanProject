import { useState, type FormEvent } from 'react'
import type { FlueConversationMessage, FlueConversationPart } from '@flue/react'
import { useAppStore } from '@/store/app.store'
import { agentEnabled, useVylingAgent } from './useVylingAgent'

export default function AgentPanel() {
	if (!agentEnabled) return null
	return <AgentPanelInner />
}

function AgentPanelInner() {
	const { t } = useAppStore()
	const agent = useVylingAgent()
	const [open, setOpen] = useState(false)
	const [input, setInput] = useState('')
	const [sendError, setSendError] = useState<string>()

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const message = input.trim()
		if (!message) return
		setInput('')
		setSendError(undefined)
		try {
			await agent.sendMessage(message)
		} catch (error) {
			setInput(message)
			setSendError(error instanceof Error ? error.message : String(error))
		}
	}

	if (!open) {
		return (
			<button className="agent-fab" type="button" onClick={() => setOpen(true)} aria-label={t('agent.open')}>
				✨
			</button>
		)
	}

	const error = sendError ?? agent.error?.message

	return (
		<aside className="agent-panel" aria-label={t('agent.title')}>
			<header className="agent-panel__head">
				<strong>{t('agent.title')}</strong>
				<span className={`agent-panel__status is-${agent.status}`}>
					{t(`agent.status.${agent.status}`)}
				</span>
				<button type="button" onClick={() => setOpen(false)} aria-label={t('agent.close')}>
					✕
				</button>
			</header>

			<div className="agent-panel__log" aria-live="polite">
				{agent.messages.length === 0 && <p className="agent-panel__empty">{t('agent.empty')}</p>}
				{agent.messages.map((message) => (
					<Message key={message.id} message={message} t={t} />
				))}
			</div>

			{error && (
				<p className="agent-panel__error" role="alert">
					{error}
					<button type="button" onClick={() => agent.refresh()}>
						{t('agent.retry')}
					</button>
				</p>
			)}

			<form className="agent-panel__form" onSubmit={submit}>
				<input
					aria-label={t('agent.placeholder')}
					autoComplete="off"
					onChange={(e) => setInput(e.target.value)}
					placeholder={t('agent.placeholder')}
					value={input}
				/>
				<button disabled={!input.trim() || agent.status === 'streaming'} type="submit">
					{t('agent.send')}
				</button>
			</form>
		</aside>
	)
}

type Translate = (key: string, params?: Record<string, string | number>) => string

function Message({ message, t }: { message: FlueConversationMessage; t: Translate }) {
	return (
		<article className={`agent-msg is-${message.role}`}>
			{message.parts.map((part, index) => (
				<Part key={`${index}:${part.type}`} part={part} t={t} />
			))}
		</article>
	)
}

function Part({ part, t }: { part: FlueConversationPart; t: Translate }) {
	if (part.type === 'text') return <p>{part.text}</p>

	if (part.type === 'reasoning') {
		return (
			<details className="agent-msg__reasoning">
				<summary>{t('agent.reasoning')}</summary>
				{part.text}
			</details>
		)
	}

	if (part.type === 'dynamic-tool') {
		return (
			<p className="agent-msg__tool">
				{t('agent.tool')}: <code>{part.toolName}</code> ({part.state})
			</p>
		)
	}

	if (part.type === 'file' && part.url) {
		return part.mediaType.startsWith('image/') ? (
			<img src={part.url} alt={part.filename ?? ''} className="agent-msg__img" />
		) : (
			<a href={part.url}>{part.filename ?? part.mediaType}</a>
		)
	}

	return null
}
