export interface DayWord {
  term: string
  sub: string
  vi: string
  ex: string
  exVi: string
}

const KO: DayWord[] = [
  { term: '괜찮아요', sub: 'gwaen-chan-a-yo', vi: 'không sao / ổn mà', ex: '늦어서 미안해요. — 괜찮아요!', exVi: 'Xin lỗi tôi đến muộn. — Không sao đâu!' },
  { term: '맛집', sub: 'mat-jip', vi: 'quán ăn ngon nổi tiếng', ex: '이 근처에 맛집 있어요?', exVi: 'Gần đây có quán nào ngon không?' },
  { term: '대박', sub: 'dae-bak', vi: 'đỉnh quá / không thể tin được', ex: '시험에 합격했어요? 대박!', exVi: 'Bạn đậu kỳ thi rồi á? Đỉnh vậy!' },
  { term: '천천히', sub: 'cheon-cheon-hi', vi: 'từ từ, chậm rãi', ex: '천천히 말해 주세요.', exVi: 'Xin nói chậm lại giúp tôi.' },
  { term: '진짜', sub: 'jin-jja', vi: 'thật / thật sự', ex: '이거 진짜 맛있어요!', exVi: 'Món này ngon thật sự!' },
  { term: '수고하셨습니다', sub: 'su-go-ha-syeoss-seum-ni-da', vi: 'bạn đã vất vả rồi (nói khi tan làm)', ex: '오늘도 수고하셨습니다!', exVi: 'Hôm nay bạn cũng đã vất vả rồi!' },
  { term: '배고파요', sub: 'bae-go-pa-yo', vi: 'đói bụng', ex: '너무 배고파요. 밥 먹으러 가요!', exVi: 'Đói quá. Đi ăn cơm thôi!' },
  { term: '재미있어요', sub: 'jae-mi-i-sseo-yo', vi: 'thú vị, vui', ex: '한국어 공부가 재미있어요.', exVi: 'Học tiếng Hàn thú vị lắm.' },
  { term: '화이팅', sub: 'hwa-i-ting', vi: 'cố lên!', ex: '내일 시험이죠? 화이팅!', exVi: 'Mai bạn thi đúng không? Cố lên!' },
  { term: '알겠습니다', sub: 'al-gess-seum-ni-da', vi: 'tôi hiểu rồi ạ', ex: '네, 알겠습니다. 바로 할게요.', exVi: 'Vâng, tôi hiểu rồi. Tôi làm ngay đây.' },
]

const EN: DayWord[] = [
  { term: 'No worries', sub: '/noʊ ˈwɜː.riz/', vi: 'không sao đâu / đừng bận tâm', ex: "Sorry I'm late! — No worries.", exVi: 'Xin lỗi tôi muộn! — Không sao đâu.' },
  { term: 'It depends', sub: '/ɪt dɪˈpendz/', vi: 'còn tuỳ', ex: 'Do you eat out often? — It depends on the week.', exVi: 'Bạn hay ăn ngoài không? — Còn tuỳ tuần.' },
  { term: 'Sounds good', sub: '/saʊndz ɡʊd/', vi: 'nghe ổn đấy / chốt vậy đi', ex: "Lunch at noon? — Sounds good!", exVi: 'Ăn trưa 12 giờ nhé? — Chốt vậy đi!' },
  { term: "I'm on my way", sub: '/aɪm ɑːn maɪ weɪ/', vi: 'tôi đang trên đường tới', ex: "Where are you? — I'm on my way!", exVi: 'Bạn đâu rồi? — Tôi đang tới đây!' },
  { term: 'Long story short', sub: '/lɔːŋ ˈstɔːr.i ʃɔːrt/', vi: 'nói ngắn gọn là', ex: 'Long story short, we missed the train.', exVi: 'Nói ngắn gọn là bọn tôi lỡ tàu.' },
  { term: 'My bad', sub: '/maɪ bæd/', vi: 'lỗi của tôi (thân mật)', ex: 'You forgot the keys! — My bad.', exVi: 'Cậu quên chìa khóa rồi! — Lỗi của tớ.' },
  { term: 'Fingers crossed', sub: '/ˈfɪŋ.ɡərz krɔst/', vi: 'cầu may / hy vọng suôn sẻ', ex: 'Interview tomorrow — fingers crossed!', exVi: 'Mai phỏng vấn — cầu cho suôn sẻ!' },
  { term: "It's up to you", sub: '/ɪts ʌp tə juː/', vi: 'tuỳ bạn quyết định', ex: 'Pizza or pho? — It’s up to you.', exVi: 'Pizza hay phở? — Tuỳ bạn.' },
  { term: 'Take your time', sub: '/teɪk jʊr taɪm/', vi: 'cứ từ từ, không vội', ex: 'I need five more minutes. — Take your time.', exVi: 'Tôi cần thêm 5 phút. — Cứ từ từ.' },
  { term: 'Actually', sub: '/ˈæk.tʃu.əl.i/', vi: 'thật ra là', ex: 'Actually, I have been there twice.', exVi: 'Thật ra tôi đã đến đó hai lần rồi.' },
]

const JA: DayWord[] = [
  { term: '大丈夫', sub: 'だいじょうぶ · daijōbu', vi: 'không sao / ổn', ex: '大丈夫ですか。— はい、大丈夫です。', exVi: 'Bạn ổn chứ? — Vâng, không sao.' },
  { term: 'お疲れ様', sub: 'おつかれさま · otsukaresama', vi: 'bạn đã vất vả rồi', ex: '今日もお疲れ様でした!', exVi: 'Hôm nay bạn cũng vất vả rồi!' },
  { term: '美味しい', sub: 'おいしい · oishii', vi: 'ngon', ex: 'このラーメン、美味しいですね。', exVi: 'Mì ramen này ngon nhỉ.' },
  { term: '頑張って', sub: 'がんばって · ganbatte', vi: 'cố lên!', ex: '明日は試験?頑張って!', exVi: 'Mai thi à? Cố lên nhé!' },
  { term: 'すみません', sub: 'sumimasen', vi: 'xin lỗi / cho hỏi (đa năng)', ex: 'すみません、駅はどこですか。', exVi: 'Cho hỏi, nhà ga ở đâu ạ?' },
  { term: '楽しい', sub: 'たのしい · tanoshii', vi: 'vui, thích thú', ex: '日本語の勉強は楽しいです。', exVi: 'Học tiếng Nhật rất vui.' },
  { term: 'いただきます', sub: 'itadakimasu', vi: 'mời cả nhà ăn cơm (trước bữa ăn)', ex: 'いただきます!美味しそう!', exVi: 'Mời mọi người! Trông ngon quá!' },
  { term: 'ゆっくり', sub: 'yukkuri', vi: 'từ từ, chậm rãi', ex: 'ゆっくり話してください。', exVi: 'Xin nói chậm lại giúp tôi.' },
  { term: '本当', sub: 'ほんとう · hontō', vi: 'thật / thật sự', ex: '本当ですか。すごい!', exVi: 'Thật á? Tuyệt vậy!' },
  { term: 'よろしくお願いします', sub: 'yoroshiku onegaishimasu', vi: 'rất mong được giúp đỡ (chào lần đầu)', ex: 'はじめまして。よろしくお願いします。', exVi: 'Rất vui được gặp. Mong được giúp đỡ ạ.' },
]

const ZH: DayWord[] = [
  { term: '加油', sub: 'jiāyóu', vi: 'cố lên!', ex: '明天考试?加油!', exVi: 'Mai thi à? Cố lên!' },
  { term: '没关系', sub: 'méi guānxi', vi: 'không sao đâu', ex: '对不起!— 没关系。', exVi: 'Xin lỗi! — Không sao đâu.' },
  { term: '好吃', sub: 'hǎochī', vi: 'ngon (đồ ăn)', ex: '这个菜真好吃!', exVi: 'Món này ngon thật!' },
  { term: '慢慢来', sub: 'mànmàn lái', vi: 'cứ từ từ, đừng vội', ex: '别着急,慢慢来。', exVi: 'Đừng vội, cứ từ từ.' },
  { term: '真的', sub: 'zhēnde', vi: 'thật / thật sự', ex: '真的吗?太好了!', exVi: 'Thật á? Tốt quá!' },
  { term: '辛苦了', sub: 'xīnkǔ le', vi: 'bạn vất vả rồi', ex: '今天辛苦了,早点休息吧。', exVi: 'Hôm nay vất vả rồi, nghỉ sớm nhé.' },
  { term: '饿了', sub: 'è le', vi: 'đói bụng rồi', ex: '我饿了,我们去吃饭吧。', exVi: 'Tôi đói rồi, mình đi ăn thôi.' },
  { term: '有意思', sub: 'yǒu yìsi', vi: 'thú vị', ex: '学中文很有意思。', exVi: 'Học tiếng Trung rất thú vị.' },
  { term: '太棒了', sub: 'tài bàng le', vi: 'tuyệt quá!', ex: '你通过考试了?太棒了!', exVi: 'Bạn qua kỳ thi rồi? Tuyệt quá!' },
  { term: '不好意思', sub: 'bù hǎoyìsi', vi: 'ngại quá / xin lỗi nhẹ', ex: '不好意思,请再说一遍。', exVi: 'Ngại quá, xin nói lại lần nữa ạ.' },
]

const DE: DayWord[] = [
  { term: 'Genau', sub: '/ɡəˈnaʊ/', vi: 'chính xác / đúng vậy', ex: 'Du meinst dieses Café? — Genau!', exVi: 'Ý cậu là quán cà phê này à? — Chính xác!' },
  { term: 'Gemütlich', sub: '/ɡəˈmyːtlɪç/', vi: 'ấm cúng, dễ chịu', ex: 'Dein Zimmer ist sehr gemütlich.', exVi: 'Phòng của bạn ấm cúng thật.' },
  { term: 'Feierabend', sub: '/ˈfaɪɐˌʔaːbn̩t/', vi: 'giờ tan làm (niềm vui cuối ngày)', ex: 'Endlich Feierabend!', exVi: 'Cuối cùng cũng được tan làm!' },
  { term: 'Lecker', sub: '/ˈlɛkɐ/', vi: 'ngon', ex: 'Das Essen ist richtig lecker!', exVi: 'Đồ ăn ngon thật sự!' },
  { term: 'Keine Ahnung', sub: '/ˈkaɪnə ˈaːnʊŋ/', vi: 'chịu, không biết', ex: 'Wo ist Max? — Keine Ahnung.', exVi: 'Max đâu rồi? — Chịu, không biết.' },
  { term: 'Alles klar', sub: '/ˈaləs klaːɐ̯/', vi: 'ok, rõ rồi', ex: 'Wir treffen uns um acht. — Alles klar!', exVi: 'Mình gặp nhau lúc 8 giờ nhé. — Ok rõ rồi!' },
  { term: 'Langsam bitte', sub: '/ˈlaŋzaːm ˈbɪtə/', vi: 'xin chậm lại', ex: 'Sprechen Sie bitte langsam.', exVi: 'Xin nói chậm lại ạ.' },
  { term: 'Viel Erfolg', sub: '/fiːl ɛɐ̯ˈfɔlk/', vi: 'chúc thành công', ex: 'Morgen Prüfung? Viel Erfolg!', exVi: 'Mai thi à? Chúc thành công!' },
  { term: 'Doch', sub: '/dɔx/', vi: 'có chứ (phủ định lại câu phủ định)', ex: 'Du kommst nicht? — Doch!', exVi: 'Cậu không đến à? — Có chứ!' },
  { term: 'Mahlzeit', sub: '/ˈmaːlˌtsaɪt/', vi: 'chúc ngon miệng (chào giờ trưa)', ex: 'Mahlzeit! Was gibt es heute?', exVi: 'Chúc ngon miệng! Hôm nay có món gì thế?' },
]

const VI: DayWord[] = [
  { term: 'ơi', sub: 'oi', vi: 'gọi ai đó thân mật (mẹ ơi, em ơi)', ex: 'Chị ơi, cho em xin cái menu!', exVi: '(Gọi nhân viên) Chị ơi, cho em xin thực đơn!' },
  { term: 'nhé', sub: 'nhe', vi: 'thêm vào cuối câu cho thân thiện', ex: 'Mai gặp lại nhé!', exVi: 'Hẹn gặp lại ngày mai (thân mật).' },
  { term: 'quá trời', sub: 'wa choi', vi: 'nhiều lắm / cực kỳ (miền Nam)', ex: 'Món này ngon quá trời!', exVi: 'Món này ngon cực kỳ!' },
  { term: 'không sao đâu', sub: 'khong sao dau', vi: 'đừng lo, ổn mà', ex: 'Xin lỗi mình tới trễ. — Không sao đâu!', exVi: 'Trấn an người khác rằng mọi thứ ổn.' },
  { term: 'từ từ', sub: 'tu tu', vi: 'chậm thôi, đừng vội', ex: 'Từ từ nói, mình nghe nè.', exVi: 'Bảo ai đó bình tĩnh nói chậm lại.' },
  { term: 'cố lên', sub: 'co len', vi: 'cổ vũ ai đó', ex: 'Sắp thi rồi hả? Cố lên!', exVi: 'Động viên trước kỳ thi.' },
  { term: 'dễ thương', sub: 'de thuong', vi: 'đáng yêu', ex: 'Con mèo này dễ thương ghê!', exVi: 'Khen con mèo đáng yêu.' },
  { term: 'thoải mái', sub: 'thoai mai', vi: 'dễ chịu, tự nhiên', ex: 'Cứ tự nhiên, thoải mái đi!', exVi: 'Mời ai đó cứ tự nhiên như ở nhà.' },
  { term: 'hết sảy', sub: 'het say', vi: 'tuyệt vời (khẩu ngữ)', ex: 'Chuyến đi hôm qua hết sảy luôn!', exVi: 'Khen chuyến đi rất tuyệt.' },
  { term: 'ngon lành', sub: 'ngon lanh', vi: 'ổn áp, suôn sẻ', ex: 'Bài kiểm tra làm ngon lành!', exVi: 'Bài kiểm tra làm rất suôn sẻ.' },
]

const BY_LANG: Record<string, DayWord[]> = { ko: KO, en: EN, ja: JA, zh: ZH, de: DE, vi: VI }

export function wordOfDay(lang: string, date = new Date()): DayWord {
  const list = BY_LANG[lang] || KO
  const start = new Date(date.getFullYear(), 0, 0)
  const day = Math.floor((date.getTime() - start.getTime()) / 86400000)
  return list[day % list.length]
}
