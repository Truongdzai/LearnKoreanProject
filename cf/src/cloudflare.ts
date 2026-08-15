import { handleScheduled } from './ops/scheduled'

export { Sandbox } from '@cloudflare/sandbox'

export default {
	scheduled: handleScheduled,
}
