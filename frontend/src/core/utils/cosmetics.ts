export interface FrameSources {
  webm: string
  mp4: string
}

const COSMETICS_VER = 4

export function frameVideoSources(frame?: string | null): FrameSources | null {
  if (frame && frame.startsWith('v-')) {
    const name = frame.slice(2)
    return {
      webm: `/cosmetics/frames/${name}.webm?v=${COSMETICS_VER}`,
      mp4: `/cosmetics/frames/${name}.mp4?v=${COSMETICS_VER}`,
    }
  }
  return null
}

export function bgVideo(bg?: string | null): string | null {
  if (bg && /^nen\d+$/.test(bg)) return `/cosmetics/bg/${bg}.mp4?v=${COSMETICS_VER}`
  return null
}
