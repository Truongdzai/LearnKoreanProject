import type { ReactNode } from 'react'

// Cách một phòng điền chỗ trống hỏi và giải thích từng câu. Dùng chung cho lượt của chính phòng đó
// và lượt "Ôn câu sai" trộn câu từ nhiều phòng.
export interface LabView<F, R> {
  ask: (f: F) => string
  feedback: (f: F) => ReactNode
  extra?: (f: F) => ReactNode
  missedNote: (f: F) => ReactNode
  result: (f: F, ok: boolean) => R
}
