import { Fragment } from 'react'

// Câu giải thích tiếng Việt có chen chữ Hàn: bọc từng đoạn Hangul trong lang="ko" để đọc màn hình và font đúng.
const HANGUL_RUN = /([가-힣ㄱ-ㅣ]+(?:\s+[가-힣ㄱ-ㅣ]+)*)/

export default function KoText({ text }: { text: string }) {
  const parts = text.split(HANGUL_RUN)
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <span key={i} lang="ko">{p}</span> : <Fragment key={i}>{p}</Fragment>))}
    </>
  )
}
