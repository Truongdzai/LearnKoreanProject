import { lazy, type ComponentType } from 'react'

const RELOAD_FLAG = 'vyling.chunkReload'

function isStaleChunk(e: unknown): boolean {
  const msg = e instanceof Error ? `${e.name} ${e.message}` : String(e)
  return /dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(msg)
}

export function lazyPage<T extends ComponentType<any>>(load: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      const mod = await load()
      sessionStorage.removeItem(RELOAD_FLAG)
      return mod
    } catch (first) {
      try {
        return await load()
      } catch (err) {
        if (isStaleChunk(err) && !sessionStorage.getItem(RELOAD_FLAG)) {
          sessionStorage.setItem(RELOAD_FLAG, '1')
          location.reload()
          return { default: (() => null) as unknown as T }
        }
        throw err instanceof Error ? err : first
      }
    }
  })
}
