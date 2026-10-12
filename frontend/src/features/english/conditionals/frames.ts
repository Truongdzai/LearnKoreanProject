// Câu điều kiện loại 1 và loại 2. Mỗi câu 4 phương án, chỉ một đúng:
// không đưa "was" vào câu "If I were…" (văn nói vẫn dùng), không dùng loại 0 (If you heat ice, it melts / will melt đều được).

export type CondType = 'c1' | 'c2'
export type Clause = 'if' | 'main'

export interface Frame {
  id: string
  en: string
  vi: string
  options: string[]
  answer: string
  type: CondType
  clause: Clause
}

export const TYPES: Record<CondType, { name: string; form: string; use: string; ex: string }> = {
  c1: {
    name: 'Loại 1 — có thể xảy ra',
    form: 'If + hiện tại đơn, … will + V',
    use: 'Việc có thật, có thể xảy ra ở hiện tại / tương lai. Vế if KHÔNG dùng will.',
    ex: 'If it rains tomorrow, we will stay at home.',
  },
  c2: {
    name: 'Loại 2 — không có thật',
    form: 'If + quá khứ đơn, … would + V',
    use: 'Giả định trái với hiện tại hoặc khó xảy ra. Động từ be dùng were cho mọi ngôi (If I were you…). Vế if KHÔNG dùng would.',
    ex: 'If I had more money, I would buy a car.',
  },
}

// [câu, nghĩa, [đáp án, …sai], loại, vế có chỗ trống]
type Raw = [string, string, [string, string, string, string], CondType, Clause]

const RAW: Raw[] = [
  ['If it ___ (rain) tomorrow, we will stay at home.', 'Nếu mai trời mưa, chúng tôi sẽ ở nhà.', ['rains', 'will rain', 'rained', 'would rain'], 'c1', 'if'],
  ['If you ___ (study) hard, you will pass the exam.', 'Nếu bạn học chăm, bạn sẽ đỗ.', ['study', 'will study', 'studied', 'would study'], 'c1', 'if'],
  ['If she ___ (not / hurry), she will miss the bus.', 'Nếu cô ấy không nhanh lên, cô ấy sẽ lỡ xe buýt.', ['doesn\'t hurry', 'won\'t hurry', 'didn\'t hurry', 'wouldn\'t hurry'], 'c1', 'if'],
  ['If we ___ (leave) now, we will be on time.', 'Nếu đi ngay bây giờ, chúng ta sẽ đến kịp.', ['leave', 'will leave', 'left', 'would leave'], 'c1', 'if'],
  ['If he ___ (call) me, I will tell him the news.', 'Nếu anh ấy gọi, tôi sẽ báo tin cho anh ấy.', ['calls', 'will call', 'called', 'would call'], 'c1', 'if'],
  ['If it is sunny tomorrow, we ___ (go) to the beach.', 'Nếu mai trời nắng, chúng tôi sẽ đi biển.', ['will go', 'would go', 'went', 'going'], 'c1', 'main'],
  ['If you eat too much, you ___ (feel) sick.', 'Ăn nhiều quá thì bạn sẽ thấy khó chịu.', ['will feel', 'would feel', 'felt', 'feeling'], 'c1', 'main'],
  ['If I see Lan, I ___ (give) her your message.', 'Nếu gặp Lan, tôi sẽ chuyển lời bạn cho cô ấy.', ['will give', 'would give', 'gave', 'giving'], 'c1', 'main'],
  ['If you don\'t wear a coat, you ___ (catch) a cold.', 'Không mặc áo khoác thì bạn sẽ bị cảm.', ['will catch', 'would catch', 'caught', 'catching'], 'c1', 'main'],
  ['We ___ (not / finish) on time if we don\'t start now.', 'Không bắt đầu ngay thì chúng ta sẽ không kịp xong.', ['won\'t finish', 'wouldn\'t finish', 'didn\'t finish', 'not finishing'], 'c1', 'main'],

  ['If I ___ (have) more money, I would travel around the world.', 'Nếu có nhiều tiền hơn, tôi sẽ đi du lịch vòng quanh thế giới.', ['had', 'have', 'will have', 'would have'], 'c2', 'if'],
  ['If I ___ (be) you, I would take the job.', 'Nếu tôi là bạn, tôi sẽ nhận công việc đó.', ['were', 'am', 'will be', 'would be'], 'c2', 'if'],
  ['If she ___ (live) closer, we would see each other more often.', 'Nếu cô ấy sống gần hơn, chúng tôi sẽ gặp nhau thường xuyên hơn.', ['lived', 'lives', 'will live', 'would live'], 'c2', 'if'],
  ['If we ___ (know) his address, we would send him a card.', 'Nếu biết địa chỉ anh ấy thì chúng tôi sẽ gửi thiệp (nhưng không biết).', ['knew', 'know', 'will know', 'would know'], 'c2', 'if'],
  ['If he ___ (not / work) so much, he would be healthier.', 'Nếu anh ấy không làm việc nhiều như vậy, anh ấy sẽ khỏe hơn.', ['didn\'t work', 'doesn\'t work', 'won\'t work', 'wouldn\'t work'], 'c2', 'if'],
  ['If I had a car, I ___ (drive) to work.', 'Nếu có ô tô, tôi sẽ lái xe đi làm.', ['would drive', 'will drive', 'drove', 'drive'], 'c2', 'main'],
  ['If I won the lottery, I ___ (buy) a house for my parents.', 'Nếu trúng xổ số, tôi sẽ mua nhà cho bố mẹ.', ['would buy', 'will buy', 'bought', 'buy'], 'c2', 'main'],
  ['If she spoke English, she ___ (get) a better job.', 'Nếu cô ấy nói được tiếng Anh, cô ấy sẽ có việc tốt hơn.', ['would get', 'will get', 'got', 'gets'], 'c2', 'main'],
  ['If it weren\'t so expensive, I ___ (stay) at that hotel.', 'Nếu không đắt như thế, tôi sẽ ở khách sạn đó.', ['would stay', 'will stay', 'stayed', 'stay'], 'c2', 'main'],
  ['If you saw a ghost, what ___ (you / do)?', 'Nếu nhìn thấy ma, bạn sẽ làm gì?', ['would you do', 'will you do', 'did you do', 'you would do'], 'c2', 'main'],
]

export const FRAMES: Frame[] = RAW.map(([en, vi, opts, type, clause]) => ({ id: en, en, vi, options: opts, answer: opts[0], type, clause }))

export const ROUND = 10

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildRound(weak: string[]): (Frame & { shuffled: string[] })[] {
  const w = shuffle(FRAMES.filter((f) => weak.includes(f.id))).slice(0, Math.ceil(ROUND / 2))
  const rest = shuffle(FRAMES.filter((f) => !weak.includes(f.id)))
  return shuffle([...w, ...rest].slice(0, ROUND)).map((f) => ({ ...f, shuffled: shuffle(f.options) }))
}

export const filled = (f: Frame) => f.en.replace(/___\s*\([^)]*\)/, f.answer)
