import codemode from '@cloudflare/codemode/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { flue, flueWorkerConfig } from '@flue/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [flue(), codemode(), cloudflare({ config: flueWorkerConfig() })],
})
