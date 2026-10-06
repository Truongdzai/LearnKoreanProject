// Dữ liệu gốc dồn đáp án đúng ở vài vị trí đầu, nên đảo phương án và dời chỉ số đáp án theo
export function shuffleOptions<T extends { options: string[]; answer: number }>(q: T): T {
  const order = q.options.map((_, k) => k)
  for (let k = order.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1))
    ;[order[k], order[j]] = [order[j], order[k]]
  }
  return { ...q, options: order.map((k) => q.options[k]), answer: order.indexOf(q.answer) }
}
