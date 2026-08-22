export interface UploadStream {
  push: (blob: Blob) => void
  end: () => void
  abort: () => void
  response: Promise<Response>
  bytes: () => number
}

let streamable: boolean | null = null

export function markStreamUnsupported(): void {
  streamable = false
}

export function canStreamUpload(): boolean {
  if (streamable !== null) return streamable
  streamable = false
  try {
    if (typeof ReadableStream === 'undefined' || typeof Request === 'undefined') return false
    let duplexAsked = false
    const probe = new Request('https://vyling.invalid/', {
      method: 'POST',
      body: new ReadableStream(),
      get duplex() {
        duplexAsked = true
        return 'half'
      },
    } as RequestInit)
    streamable = duplexAsked && !probe.headers.has('Content-Type')
  } catch {
    streamable = false
  }
  return streamable
}

export function createUploadStream(url: string, mime: string): UploadStream {
  const queue: Uint8Array[] = []
  const controller = new AbortController()
  let closed = false
  let sent = 0
  let wake: (() => void) | null = null
  let tail: Promise<void> = Promise.resolve()

  const nudge = () => {
    const fn = wake
    wake = null
    fn?.()
  }

  const body = new ReadableStream<Uint8Array>({
    async pull(ctrl) {
      while (!queue.length && !closed) {
        await new Promise<void>((resolve) => { wake = resolve })
      }
      const next = queue.shift()
      if (next) {
        ctrl.enqueue(next)
        return
      }
      ctrl.close()
    },
    cancel() {
      closed = true
      nudge()
    },
  })

  const response = fetch(url, {
    method: 'POST',
    body,
    headers: { 'Content-Type': mime },
    signal: controller.signal,
    duplex: 'half',
  } as RequestInit)

  return {
    push(blob: Blob) {
      if (closed || blob.size === 0) return
      sent += blob.size
      tail = tail.then(async () => {
        queue.push(new Uint8Array(await blob.arrayBuffer()))
        nudge()
      })
    },
    end() {
      tail = tail.then(() => {
        closed = true
        nudge()
      })
    },
    abort() {
      closed = true
      nudge()
      try { controller.abort() } catch {  }
    },
    response,
    bytes: () => sent,
  }
}
