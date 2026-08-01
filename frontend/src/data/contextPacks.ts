export interface PackWord {
  term: string
  sub: string
  vi: string
  ex: string
  exVi: string
}

export interface ContextPack {
  id: string
  name: string
  emoji: string
  tone: string
  desc: string
  goal: string
  words: Record<string, PackWord[]>
}


const KO_WORK: PackWord[] = [
  { term: '회사', sub: 'hoe-sa', vi: 'công ty', ex: '저는 IT 회사에 다녀요.', exVi: 'Tôi làm ở một công ty IT.' },
  { term: '회의', sub: 'hoe-ui', vi: 'cuộc họp', ex: '오후 2시에 회의가 있어요.', exVi: '2 giờ chiều có cuộc họp.' },
  { term: '보고서', sub: 'bo-go-seo', vi: 'báo cáo', ex: '보고서를 내일까지 보내 주세요.', exVi: 'Hãy gửi báo cáo trước ngày mai.' },
  { term: '마감', sub: 'ma-gam', vi: 'hạn chót', ex: '마감이 금요일이에요.', exVi: 'Hạn chót là thứ Sáu.' },
  { term: '출근하다', sub: 'chul-geun-ha-da', vi: 'đi làm', ex: '저는 8시에 출근해요.', exVi: 'Tôi đi làm lúc 8 giờ.' },
  { term: '퇴근하다', sub: 'toe-geun-ha-da', vi: 'tan làm', ex: '오늘은 일찍 퇴근해요.', exVi: 'Hôm nay tôi tan làm sớm.' },
  { term: '야근', sub: 'ya-geun', vi: 'tăng ca', ex: '어제 야근했어요.', exVi: 'Hôm qua tôi tăng ca.' },
  { term: '동료', sub: 'dong-nyo', vi: 'đồng nghiệp', ex: '동료들이 친절해요.', exVi: 'Đồng nghiệp của tôi thân thiện.' },
  { term: '상사', sub: 'sang-sa', vi: 'cấp trên', ex: '상사에게 보고했어요.', exVi: 'Tôi đã báo cáo với cấp trên.' },
  { term: '월급', sub: 'wol-geup', vi: 'lương tháng', ex: '월급날이 언제예요?', exVi: 'Ngày lãnh lương là khi nào?' },
  { term: '휴가', sub: 'hyu-ga', vi: 'kỳ nghỉ phép', ex: '다음 주에 휴가를 가요.', exVi: 'Tuần sau tôi nghỉ phép.' },
  { term: '프로젝트', sub: 'peu-ro-jek-teu', vi: 'dự án', ex: '새 프로젝트를 시작했어요.', exVi: 'Chúng tôi bắt đầu dự án mới.' },
  { term: '자료', sub: 'ja-ryo', vi: 'tài liệu', ex: '자료를 준비했어요.', exVi: 'Tôi đã chuẩn bị tài liệu.' },
  { term: '발표', sub: 'bal-pyo', vi: 'thuyết trình', ex: '내일 발표가 있어요.', exVi: 'Mai tôi có bài thuyết trình.' },
  { term: '계약', sub: 'gye-yak', vi: 'hợp đồng', ex: '계약을 검토하고 있어요.', exVi: 'Tôi đang xem xét hợp đồng.' },
  { term: '팀', sub: 'tim', vi: 'đội, nhóm', ex: '우리 팀은 분위기가 좋아요.', exVi: 'Đội của chúng tôi không khí rất tốt.' },
]

const KO_TRAVEL: PackWord[] = [
  { term: '여행', sub: 'yeo-haeng', vi: 'du lịch', ex: '한국 여행을 가고 싶어요.', exVi: 'Tôi muốn đi du lịch Hàn Quốc.' },
  { term: '공항', sub: 'gong-hang', vi: 'sân bay', ex: '공항에 몇 시에 도착해요?', exVi: 'Mấy giờ đến sân bay?' },
  { term: '여권', sub: 'yeo-gwon', vi: 'hộ chiếu', ex: '여권을 보여 주세요.', exVi: 'Cho xem hộ chiếu ạ.' },
  { term: '짐', sub: 'jim', vi: 'hành lý', ex: '짐이 많아요.', exVi: 'Hành lý nhiều quá.' },
  { term: '호텔', sub: 'ho-tel', vi: 'khách sạn', ex: '호텔을 예약했어요.', exVi: 'Tôi đã đặt khách sạn.' },
  { term: '예약', sub: 'ye-yak', vi: 'đặt trước', ex: '예약을 확인하고 싶어요.', exVi: 'Tôi muốn xác nhận đặt chỗ.' },
  { term: '체크인', sub: 'che-keu-in', vi: 'nhận phòng', ex: '체크인은 3시부터예요.', exVi: 'Nhận phòng từ 3 giờ.' },
  { term: '지하철', sub: 'ji-ha-cheol', vi: 'tàu điện ngầm', ex: '지하철로 30분 걸려요.', exVi: 'Đi tàu điện ngầm mất 30 phút.' },
  { term: '표', sub: 'pyo', vi: 'vé', ex: '표 두 장 주세요.', exVi: 'Cho tôi hai vé.' },
  { term: '길', sub: 'gil', vi: 'đường', ex: '길을 잃었어요.', exVi: 'Tôi bị lạc đường.' },
  { term: '지도', sub: 'ji-do', vi: 'bản đồ', ex: '지도를 볼 수 있어요?', exVi: 'Tôi xem bản đồ được không?' },
  { term: '관광지', sub: 'gwan-gwang-ji', vi: 'điểm tham quan', ex: '유명한 관광지가 어디예요?', exVi: 'Điểm tham quan nổi tiếng ở đâu?' },
  { term: '사진', sub: 'sa-jin', vi: 'bức ảnh', ex: '사진 좀 찍어 주시겠어요?', exVi: 'Chụp giúp tôi tấm ảnh được không?' },
  { term: '환전', sub: 'hwan-jeon', vi: 'đổi tiền', ex: '어디에서 환전할 수 있어요?', exVi: 'Đổi tiền ở đâu được ạ?' },
  { term: '비행기', sub: 'bi-haeng-gi', vi: 'máy bay', ex: '비행기가 연착됐어요.', exVi: 'Máy bay bị trễ chuyến.' },
  { term: '출발', sub: 'chul-bal', vi: 'khởi hành', ex: '출발 시간이 몇 시예요?', exVi: 'Mấy giờ khởi hành ạ?' },
]

const KO_RESTAURANT: PackWord[] = [
  { term: '메뉴', sub: 'me-nyu', vi: 'thực đơn', ex: '메뉴 좀 주세요.', exVi: 'Cho tôi xin thực đơn.' },
  { term: '주문', sub: 'ju-mun', vi: 'gọi món', ex: '주문할게요.', exVi: 'Tôi gọi món nhé.' },
  { term: '추천', sub: 'chu-cheon', vi: 'gợi ý, đề xuất', ex: '추천 메뉴가 뭐예요?', exVi: 'Món nào đáng thử ạ?' },
  { term: '물', sub: 'mul', vi: 'nước', ex: '물 좀 주세요.', exVi: 'Cho tôi xin nước.' },
  { term: '반찬', sub: 'ban-chan', vi: 'món phụ ăn kèm', ex: '반찬이 정말 다양해요.', exVi: 'Món ăn kèm đa dạng thật.' },
  { term: '맵다', sub: 'maep-da', vi: 'cay', ex: '이 음식은 너무 매워요.', exVi: 'Món này cay quá.' },
  { term: '달다', sub: 'dal-da', vi: 'ngọt', ex: '디저트가 좀 달아요.', exVi: 'Món tráng miệng hơi ngọt.' },
  { term: '짜다', sub: 'jja-da', vi: 'mặn', ex: '국이 조금 짜요.', exVi: 'Canh hơi mặn.' },
  { term: '맛있다', sub: 'ma-sit-da', vi: 'ngon', ex: '정말 맛있어요!', exVi: 'Ngon thật đấy!' },
  { term: '계산서', sub: 'gye-san-seo', vi: 'hoá đơn', ex: '계산서 주세요.', exVi: 'Cho tôi xin hoá đơn.' },
  { term: '포장', sub: 'po-jang', vi: 'gói mang về', ex: '포장 돼요?', exVi: 'Gói mang về được không ạ?' },
  { term: '젓가락', sub: 'jeot-ga-rak', vi: 'đũa', ex: '젓가락 하나 더 주세요.', exVi: 'Cho tôi thêm một đôi đũa.' },
  { term: '숟가락', sub: 'sut-ga-rak', vi: 'thìa', ex: '숟가락이 없어요.', exVi: 'Tôi chưa có thìa.' },
  { term: '배부르다', sub: 'bae-bu-reu-da', vi: 'no', ex: '너무 배불러요.', exVi: 'No quá rồi.' },
  { term: '사장님', sub: 'sa-jang-nim', vi: 'chủ quán', ex: '사장님, 여기요!', exVi: 'Chủ quán ơi, cho gọi món!' },
  { term: '맛집', sub: 'mat-jip', vi: 'quán ngon nổi tiếng', ex: '여기가 유명한 맛집이에요.', exVi: 'Đây là quán ngon nổi tiếng đấy.' },
]

const KO_INTERVIEW: PackWord[] = [
  { term: '면접', sub: 'myeon-jeop', vi: 'phỏng vấn', ex: '내일 면접이 있어요.', exVi: 'Mai tôi có buổi phỏng vấn.' },
  { term: '이력서', sub: 'i-ryeok-seo', vi: 'CV, sơ yếu lý lịch', ex: '이력서를 제출했어요.', exVi: 'Tôi đã nộp CV.' },
  { term: '지원하다', sub: 'ji-won-ha-da', vi: 'ứng tuyển', ex: '이 회사에 지원했어요.', exVi: 'Tôi đã ứng tuyển công ty này.' },
  { term: '경력', sub: 'gyeong-nyeok', vi: 'kinh nghiệm làm việc', ex: '3년 경력이 있어요.', exVi: 'Tôi có 3 năm kinh nghiệm.' },
  { term: '장점', sub: 'jang-jeom', vi: 'điểm mạnh', ex: '제 장점은 성실함이에요.', exVi: 'Điểm mạnh của tôi là chăm chỉ.' },
  { term: '단점', sub: 'dan-jeom', vi: 'điểm yếu', ex: '단점을 고치려고 노력해요.', exVi: 'Tôi cố gắng sửa điểm yếu.' },
  { term: '목표', sub: 'mok-pyo', vi: 'mục tiêu', ex: '제 목표는 팀장이 되는 거예요.', exVi: 'Mục tiêu của tôi là trở thành trưởng nhóm.' },
  { term: '질문', sub: 'jil-mun', vi: 'câu hỏi', ex: '질문 있어요?', exVi: 'Bạn có câu hỏi không?' },
  { term: '대답', sub: 'dae-dap', vi: 'câu trả lời', ex: '대답을 준비했어요.', exVi: 'Tôi đã chuẩn bị câu trả lời.' },
  { term: '자기소개', sub: 'ja-gi-so-gae', vi: 'giới thiệu bản thân', ex: '자기소개를 해 주세요.', exVi: 'Mời bạn giới thiệu bản thân.' },
  { term: '연봉', sub: 'yeon-bong', vi: 'lương năm', ex: '연봉이 어떻게 되나요?', exVi: 'Mức lương năm thế nào ạ?' },
  { term: '합격', sub: 'hap-gyeok', vi: 'trúng tuyển, đậu', ex: '합격했어요!', exVi: 'Tôi trúng tuyển rồi!' },
  { term: '긴장되다', sub: 'gin-jang-doe-da', vi: 'hồi hộp', ex: '조금 긴장돼요.', exVi: 'Tôi hơi hồi hộp.' },
  { term: '준비하다', sub: 'jun-bi-ha-da', vi: 'chuẩn bị', ex: '열심히 준비했어요.', exVi: 'Tôi đã chuẩn bị kỹ.' },
  { term: '기회', sub: 'gi-hoe', vi: 'cơ hội', ex: '좋은 기회라고 생각해요.', exVi: 'Tôi nghĩ đây là cơ hội tốt.' },
  { term: '능력', sub: 'neung-nyeok', vi: 'năng lực', ex: '저는 문제 해결 능력이 있어요.', exVi: 'Tôi có khả năng giải quyết vấn đề.' },
]


const EN_WORK: PackWord[] = [
  { term: 'deadline', sub: '/ˈded.laɪn/', vi: 'hạn chót', ex: 'The deadline is this Friday.', exVi: 'Hạn chót là thứ Sáu tuần này.' },
  { term: 'meeting', sub: '/ˈmiː.tɪŋ/', vi: 'cuộc họp', ex: 'We have a meeting at 2 p.m.', exVi: 'Chúng ta họp lúc 2 giờ chiều.' },
  { term: 'report', sub: '/rɪˈpɔːrt/', vi: 'báo cáo', ex: 'Please send me the report.', exVi: 'Vui lòng gửi tôi bản báo cáo.' },
  { term: 'schedule', sub: '/ˈskedʒ.uːl/', vi: 'lịch trình', ex: 'My schedule is full today.', exVi: 'Hôm nay lịch của tôi kín rồi.' },
  { term: 'colleague', sub: '/ˈkɑː.liːɡ/', vi: 'đồng nghiệp', ex: 'My colleagues are friendly.', exVi: 'Đồng nghiệp của tôi thân thiện.' },
  { term: 'boss', sub: '/bɑːs/', vi: 'sếp', ex: 'My boss is very busy.', exVi: 'Sếp tôi rất bận.' },
  { term: 'salary', sub: '/ˈsæl.ər.i/', vi: 'lương', ex: 'The salary is paid monthly.', exVi: 'Lương trả theo tháng.' },
  { term: 'day off', sub: '/ˌdeɪ ˈɔːf/', vi: 'ngày nghỉ', ex: 'I have a day off tomorrow.', exVi: 'Mai tôi được nghỉ.' },
  { term: 'overtime', sub: '/ˈoʊ.vər.taɪm/', vi: 'tăng ca', ex: 'I worked overtime last night.', exVi: 'Tối qua tôi tăng ca.' },
  { term: 'project', sub: '/ˈprɑː.dʒekt/', vi: 'dự án', ex: 'We started a new project.', exVi: 'Chúng tôi bắt đầu dự án mới.' },
  { term: 'attach', sub: '/əˈtætʃ/', vi: 'đính kèm', ex: 'I attached the file to the email.', exVi: 'Tôi đã đính kèm tệp vào email.' },
  { term: 'presentation', sub: '/ˌprez.ənˈteɪ.ʃən/', vi: 'bài thuyết trình', ex: 'I have a presentation tomorrow.', exVi: 'Mai tôi có bài thuyết trình.' },
  { term: 'contract', sub: '/ˈkɑːn.trækt/', vi: 'hợp đồng', ex: 'Please review the contract.', exVi: 'Vui lòng xem lại hợp đồng.' },
  { term: 'task', sub: '/tæsk/', vi: 'nhiệm vụ', ex: 'I finished all my tasks.', exVi: 'Tôi làm xong hết việc rồi.' },
  { term: 'feedback', sub: '/ˈfiːd.bæk/', vi: 'nhận xét, phản hồi', ex: 'Can you give me some feedback?', exVi: 'Bạn nhận xét giúp tôi được không?' },
  { term: 'team', sub: '/tiːm/', vi: 'đội, nhóm', ex: 'Our team works well together.', exVi: 'Nhóm chúng tôi phối hợp rất tốt.' },
]

const EN_TRAVEL: PackWord[] = [
  { term: 'passport', sub: '/ˈpæs.pɔːrt/', vi: 'hộ chiếu', ex: 'May I see your passport?', exVi: 'Cho tôi xem hộ chiếu được không?' },
  { term: 'luggage', sub: '/ˈlʌɡ.ɪdʒ/', vi: 'hành lý', ex: 'My luggage is very heavy.', exVi: 'Hành lý của tôi nặng quá.' },
  { term: 'flight', sub: '/flaɪt/', vi: 'chuyến bay', ex: 'My flight leaves at 9 a.m.', exVi: 'Chuyến bay của tôi cất cánh 9 giờ sáng.' },
  { term: 'boarding pass', sub: '/ˈbɔːr.dɪŋ pæs/', vi: 'thẻ lên máy bay', ex: 'Here is my boarding pass.', exVi: 'Thẻ lên máy bay của tôi đây.' },
  { term: 'check-in', sub: '/ˈtʃek.ɪn/', vi: 'làm thủ tục / nhận phòng', ex: 'Check-in starts at 2 p.m.', exVi: 'Nhận phòng từ 2 giờ chiều.' },
  { term: 'reservation', sub: '/ˌrez.ərˈveɪ.ʃən/', vi: 'đặt chỗ', ex: 'I have a reservation for tonight.', exVi: 'Tôi có đặt chỗ tối nay.' },
  { term: 'sightseeing', sub: '/ˈsaɪtˌsiː.ɪŋ/', vi: 'tham quan', ex: 'We went sightseeing all day.', exVi: 'Chúng tôi tham quan cả ngày.' },
  { term: 'map', sub: '/mæp/', vi: 'bản đồ', ex: 'Do you have a city map?', exVi: 'Bạn có bản đồ thành phố không?' },
  { term: 'ticket', sub: '/ˈtɪk.ɪt/', vi: 'vé', ex: 'Two tickets, please.', exVi: 'Cho tôi hai vé.' },
  { term: 'platform', sub: '/ˈplæt.fɔːrm/', vi: 'sân ga', ex: 'The train leaves from platform 3.', exVi: 'Tàu rời từ sân ga số 3.' },
  { term: 'exchange', sub: '/ɪksˈtʃeɪndʒ/', vi: 'đổi tiền', ex: 'Where can I exchange money?', exVi: 'Tôi đổi tiền ở đâu được?' },
  { term: 'souvenir', sub: '/ˌsuː.vənˈɪr/', vi: 'quà lưu niệm', ex: 'I bought souvenirs for my family.', exVi: 'Tôi mua quà lưu niệm cho gia đình.' },
  { term: 'delay', sub: '/dɪˈleɪ/', vi: 'trễ, hoãn', ex: 'The flight was delayed two hours.', exVi: 'Chuyến bay bị hoãn hai tiếng.' },
  { term: 'departure', sub: '/dɪˈpɑːr.tʃər/', vi: 'khởi hành', ex: 'What time is departure?', exVi: 'Mấy giờ khởi hành?' },
  { term: 'arrival', sub: '/əˈraɪ.vəl/', vi: 'điểm đến, sự đến nơi', ex: 'Arrival time is 6 p.m.', exVi: 'Giờ đến nơi là 6 giờ tối.' },
  { term: 'customs', sub: '/ˈkʌs.təmz/', vi: 'hải quan', ex: 'We waited at customs for an hour.', exVi: 'Chúng tôi chờ ở hải quan một tiếng.' },
]

const EN_RESTAURANT: PackWord[] = [
  { term: 'menu', sub: '/ˈmen.juː/', vi: 'thực đơn', ex: 'Could I see the menu, please?', exVi: 'Cho tôi xem thực đơn được không?' },
  { term: 'order', sub: '/ˈɔːr.dər/', vi: 'gọi món', ex: 'Are you ready to order?', exVi: 'Bạn gọi món chưa ạ?' },
  { term: 'recommend', sub: '/ˌrek.əˈmend/', vi: 'gợi ý', ex: 'What do you recommend?', exVi: 'Bạn gợi ý món nào?' },
  { term: 'appetizer', sub: '/ˈæp.ə.taɪ.zər/', vi: 'món khai vị', ex: 'We ordered two appetizers.', exVi: 'Chúng tôi gọi hai món khai vị.' },
  { term: 'main course', sub: '/ˌmeɪn ˈkɔːrs/', vi: 'món chính', ex: 'The main course was excellent.', exVi: 'Món chính rất tuyệt.' },
  { term: 'dessert', sub: '/dɪˈzɜːrt/', vi: 'món tráng miệng', ex: 'Would you like some dessert?', exVi: 'Bạn dùng tráng miệng không?' },
  { term: 'spicy', sub: '/ˈspaɪ.si/', vi: 'cay', ex: 'Is this dish spicy?', exVi: 'Món này có cay không?' },
  { term: 'delicious', sub: '/dɪˈlɪʃ.əs/', vi: 'ngon', ex: 'Everything was delicious!', exVi: 'Món nào cũng ngon!' },
  { term: 'bill', sub: '/bɪl/', vi: 'hoá đơn', ex: 'Could we have the bill, please?', exVi: 'Cho chúng tôi xin hoá đơn.' },
  { term: 'tip', sub: '/tɪp/', vi: 'tiền boa', ex: 'We left a small tip.', exVi: 'Chúng tôi để lại chút tiền boa.' },
  { term: 'takeout', sub: '/ˈteɪk.aʊt/', vi: 'đồ mang về', ex: 'Can I get this as takeout?', exVi: 'Tôi mang món này về được không?' },
  { term: 'waiter', sub: '/ˈweɪ.tər/', vi: 'phục vụ bàn', ex: 'The waiter was very kind.', exVi: 'Bạn phục vụ rất dễ thương.' },
  { term: 'book a table', sub: '/bʊk ə ˈteɪ.bəl/', vi: 'đặt bàn', ex: 'I booked a table for two.', exVi: 'Tôi đặt bàn cho hai người.' },
  { term: 'allergy', sub: '/ˈæl.ər.dʒi/', vi: 'dị ứng', ex: 'I have a peanut allergy.', exVi: 'Tôi dị ứng đậu phộng.' },
  { term: 'refill', sub: '/ˈriː.fɪl/', vi: 'châm thêm (nước)', ex: 'Can I get a refill, please?', exVi: 'Châm thêm cho tôi được không?' },
  { term: 'full', sub: '/fʊl/', vi: 'no', ex: "I'm so full, thank you!", exVi: 'Tôi no quá rồi, cảm ơn!' },
]

const EN_INTERVIEW: PackWord[] = [
  { term: 'interview', sub: '/ˈɪn.tər.vjuː/', vi: 'phỏng vấn', ex: 'I have a job interview tomorrow.', exVi: 'Mai tôi có buổi phỏng vấn xin việc.' },
  { term: 'resume', sub: '/ˈrez.ə.meɪ/', vi: 'CV, sơ yếu lý lịch', ex: 'Please send us your resume.', exVi: 'Vui lòng gửi CV cho chúng tôi.' },
  { term: 'apply', sub: '/əˈplaɪ/', vi: 'ứng tuyển', ex: 'I applied for this position.', exVi: 'Tôi đã ứng tuyển vị trí này.' },
  { term: 'experience', sub: '/ɪkˈspɪr.i.əns/', vi: 'kinh nghiệm', ex: 'I have three years of experience.', exVi: 'Tôi có ba năm kinh nghiệm.' },
  { term: 'strength', sub: '/streŋθ/', vi: 'điểm mạnh', ex: 'My strength is problem-solving.', exVi: 'Điểm mạnh của tôi là giải quyết vấn đề.' },
  { term: 'weakness', sub: '/ˈwiːk.nəs/', vi: 'điểm yếu', ex: 'What is your biggest weakness?', exVi: 'Điểm yếu lớn nhất của bạn là gì?' },
  { term: 'skill', sub: '/skɪl/', vi: 'kỹ năng', ex: 'Communication is an important skill.', exVi: 'Giao tiếp là kỹ năng quan trọng.' },
  { term: 'position', sub: '/pəˈzɪʃ.ən/', vi: 'vị trí (công việc)', ex: 'This position requires English.', exVi: 'Vị trí này yêu cầu tiếng Anh.' },
  { term: 'hire', sub: '/haɪr/', vi: 'tuyển dụng', ex: 'They hired five new people.', exVi: 'Họ tuyển năm người mới.' },
  { term: 'candidate', sub: '/ˈkæn.dɪ.dət/', vi: 'ứng viên', ex: 'She is a strong candidate.', exVi: 'Cô ấy là ứng viên sáng giá.' },
  { term: 'introduce yourself', sub: '/ˌɪn.trəˈduːs jʊrˈself/', vi: 'giới thiệu bản thân', ex: 'Please introduce yourself.', exVi: 'Mời bạn giới thiệu bản thân.' },
  { term: 'nervous', sub: '/ˈnɜː.vəs/', vi: 'hồi hộp', ex: 'I was nervous before the interview.', exVi: 'Tôi hồi hộp trước buổi phỏng vấn.' },
  { term: 'opportunity', sub: '/ˌɑː.pərˈtuː.nə.ti/', vi: 'cơ hội', ex: 'Thank you for this opportunity.', exVi: 'Cảm ơn vì cơ hội này.' },
  { term: 'qualification', sub: '/ˌkwɑː.lə.fəˈkeɪ.ʃən/', vi: 'bằng cấp, tiêu chuẩn', ex: 'Do you have any qualifications?', exVi: 'Bạn có bằng cấp gì không?' },
  { term: 'teamwork', sub: '/ˈtiːm.wɜːrk/', vi: 'làm việc nhóm', ex: 'Teamwork is essential here.', exVi: 'Làm việc nhóm là cốt lõi ở đây.' },
  { term: 'achievement', sub: '/əˈtʃiːv.mənt/', vi: 'thành tích', ex: 'Tell me about your achievements.', exVi: 'Hãy kể về thành tích của bạn.' },
]

const KO_EXAM: PackWord[] = [
  { term: '시험', sub: 'si-heom', vi: 'kỳ thi', ex: '다음 달에 토픽 시험이 있어요.', exVi: 'Tháng sau có kỳ thi TOPIK.' },
  { term: '접수', sub: 'jeop-su', vi: 'đăng ký (thi)', ex: '시험 접수는 온라인으로 해요.', exVi: 'Đăng ký thi qua mạng.' },
  { term: '점수', sub: 'jeom-su', vi: 'điểm số', ex: '점수가 잘 나왔어요.', exVi: 'Điểm của tôi khá tốt.' },
  { term: '합격', sub: 'hap-gyeok', vi: 'đậu, trúng tuyển', ex: '시험에 합격했어요!', exVi: 'Tôi đã đậu kỳ thi rồi!' },
  { term: '불합격', sub: 'bul-hap-gyeok', vi: 'trượt, rớt', ex: '불합격해도 다시 도전해요.', exVi: 'Rớt thì thi lại thôi.' },
  { term: '문제', sub: 'mun-je', vi: 'câu hỏi, đề bài', ex: '이 문제가 어려워요.', exVi: 'Câu này khó quá.' },
  { term: '정답', sub: 'jeong-dap', vi: 'đáp án đúng', ex: '정답을 확인해 보세요.', exVi: 'Hãy kiểm tra đáp án.' },
  { term: '단어', sub: 'dan-eo', vi: 'từ vựng', ex: '매일 단어를 외워요.', exVi: 'Mỗi ngày tôi học thuộc từ vựng.' },
  { term: '문법', sub: 'mun-beop', vi: 'ngữ pháp', ex: '문법이 제일 어려워요.', exVi: 'Ngữ pháp là khó nhất.' },
  { term: '듣기', sub: 'deut-gi', vi: 'phần nghe', ex: '듣기 연습을 많이 해요.', exVi: 'Tôi luyện nghe rất nhiều.' },
  { term: '읽기', sub: 'il-kki', vi: 'phần đọc', ex: '읽기는 시간이 부족해요.', exVi: 'Phần đọc hay bị thiếu thời gian.' },
  { term: '쓰기', sub: 'sseu-gi', vi: 'phần viết', ex: '쓰기 점수를 올리고 싶어요.', exVi: 'Tôi muốn tăng điểm viết.' },
  { term: '급', sub: 'geup', vi: 'cấp (TOPIK 1–6)', ex: '토픽 3급을 목표로 해요.', exVi: 'Tôi đặt mục tiêu TOPIK cấp 3.' },
  { term: '준비하다', sub: 'jun-bi-ha-da', vi: 'chuẩn bị', ex: '시험을 준비하고 있어요.', exVi: 'Tôi đang ôn thi.' },
  { term: '복습', sub: 'bok-seup', vi: 'ôn tập', ex: '복습이 정말 중요해요.', exVi: 'Ôn tập thật sự quan trọng.' },
  { term: '성적표', sub: 'seong-jeok-pyo', vi: 'bảng điểm', ex: '성적표가 나왔어요.', exVi: 'Có bảng điểm rồi.' },
]

const EN_EXAM: PackWord[] = [
  { term: 'exam', sub: '/ɪɡˈzæm/', vi: 'kỳ thi', ex: 'The TOEIC exam is next month.', exVi: 'Kỳ thi TOEIC là tháng sau.' },
  { term: 'register', sub: '/ˈredʒ.ə.stɚ/', vi: 'đăng ký', ex: 'I registered for the test online.', exVi: 'Tôi đăng ký thi qua mạng.' },
  { term: 'score', sub: '/skɔːr/', vi: 'điểm số', ex: 'My goal is a score of 700.', exVi: 'Mục tiêu của tôi là 700 điểm.' },
  { term: 'pass', sub: '/pæs/', vi: 'đậu, vượt qua', ex: 'I passed the exam on my first try.', exVi: 'Tôi đậu ngay lần thi đầu.' },
  { term: 'fail', sub: '/feɪl/', vi: 'trượt, rớt', ex: "Don't be afraid to fail.", exVi: 'Đừng sợ thất bại.' },
  { term: 'question', sub: '/ˈkwes.tʃən/', vi: 'câu hỏi', ex: 'Read each question carefully.', exVi: 'Đọc kỹ từng câu hỏi.' },
  { term: 'answer sheet', sub: '/ˈæn.sɚ ʃiːt/', vi: 'phiếu trả lời', ex: 'Mark your answers on the answer sheet.', exVi: 'Tô đáp án vào phiếu trả lời.' },
  { term: 'vocabulary', sub: '/voʊˈkæb.jə.ler.i/', vi: 'từ vựng', ex: 'Vocabulary is the key to reading fast.', exVi: 'Từ vựng là chìa khoá để đọc nhanh.' },
  { term: 'grammar', sub: '/ˈɡræm.ɚ/', vi: 'ngữ pháp', ex: 'Part 5 tests your grammar.', exVi: 'Part 5 kiểm tra ngữ pháp của bạn.' },
  { term: 'listening', sub: '/ˈlɪs.ən.ɪŋ/', vi: 'phần nghe', ex: 'The listening section has 100 questions.', exVi: 'Phần nghe có 100 câu.' },
  { term: 'reading', sub: '/ˈriː.dɪŋ/', vi: 'phần đọc', ex: 'Manage your time in the reading section.', exVi: 'Phân bổ thời gian ở phần đọc.' },
  { term: 'practice test', sub: '/ˈpræk.tɪs test/', vi: 'đề thi thử', ex: 'Take a practice test every week.', exVi: 'Mỗi tuần làm một đề thi thử.' },
  { term: 'certificate', sub: '/sɚˈtɪf.ə.kət/', vi: 'chứng chỉ', ex: 'The certificate is valid for two years.', exVi: 'Chứng chỉ có giá trị hai năm.' },
  { term: 'prepare', sub: '/prɪˈper/', vi: 'chuẩn bị, ôn', ex: 'I have three months to prepare.', exVi: 'Tôi có ba tháng để ôn.' },
  { term: 'review', sub: '/rɪˈvjuː/', vi: 'ôn tập', ex: 'Review your mistakes after each test.', exVi: 'Ôn lại lỗi sai sau mỗi đề.' },
  { term: 'result', sub: '/rɪˈzʌlt/', vi: 'kết quả', ex: 'The results come out in two weeks.', exVi: 'Hai tuần nữa có kết quả.' },
]

const KO_SMALLTALK: PackWord[] = [
  { term: '주말', sub: 'ju-mal', vi: 'cuối tuần', ex: '주말에 뭐 했어요?', exVi: 'Cuối tuần bạn làm gì?' },
  { term: '취미', sub: 'chwi-mi', vi: 'sở thích', ex: '취미가 뭐예요?', exVi: 'Sở thích của bạn là gì?' },
  { term: '날씨', sub: 'nal-ssi', vi: 'thời tiết', ex: '오늘 날씨가 정말 좋네요.', exVi: 'Hôm nay trời đẹp thật.' },
  { term: '영화', sub: 'yeong-hwa', vi: 'phim', ex: '요즘 무슨 영화 봤어요?', exVi: 'Dạo này bạn xem phim gì?' },
  { term: '노래', sub: 'no-rae', vi: 'bài hát', ex: '이 노래 진짜 좋아요.', exVi: 'Bài này hay thật đấy.' },
  { term: '맛집', sub: 'mat-jip', vi: 'quán ngon', ex: '이 근처 맛집 알아요?', exVi: 'Bạn biết quán nào ngon gần đây không?' },
  { term: '요즘', sub: 'yo-jeum', vi: 'dạo này', ex: '요즘 어떻게 지내요?', exVi: 'Dạo này bạn sống thế nào?' },
  { term: '운동', sub: 'un-dong', vi: 'thể thao, tập luyện', ex: '무슨 운동을 해요?', exVi: 'Bạn chơi môn thể thao gì?' },
  { term: '여자친구/남자친구', sub: 'yeo-ja-chin-gu / nam-ja-chin-gu', vi: 'bạn gái / bạn trai', ex: '남자친구 있어요?', exVi: 'Bạn có bạn trai chưa?' },
  { term: '재미있다', sub: 'jae-mi-it-da', vi: 'thú vị, vui', ex: '그 드라마 진짜 재미있어요.', exVi: 'Bộ phim đó hay thật sự.' },
  { term: '피곤하다', sub: 'pi-gon-ha-da', vi: 'mệt', ex: '요즘 좀 피곤해요.', exVi: 'Dạo này tôi hơi mệt.' },
  { term: '바쁘다', sub: 'ba-ppeu-da', vi: 'bận', ex: '이번 주는 너무 바빠요.', exVi: 'Tuần này tôi bận quá.' },
  { term: '약속', sub: 'yak-sok', vi: 'cuộc hẹn', ex: '오늘 저녁에 약속이 있어요.', exVi: 'Tối nay tôi có hẹn.' },
  { term: '연락하다', sub: 'yeol-la-ka-da', vi: 'liên lạc', ex: '자주 연락해요!', exVi: 'Nhớ liên lạc thường xuyên nha!' },
  { term: '심심하다', sub: 'sim-sim-ha-da', vi: 'chán, buồn tẻ', ex: '심심할 때 뭐 해요?', exVi: 'Lúc rảnh rỗi bạn làm gì?' },
  { term: '수고했어요', sub: 'su-go-hae-sseo-yo', vi: 'bạn vất vả rồi', ex: '오늘도 수고했어요!', exVi: 'Hôm nay bạn vất vả rồi!' },
]

const EN_SMALLTALK: PackWord[] = [
  { term: 'weekend', sub: '/ˈwiːk.end/', vi: 'cuối tuần', ex: 'How was your weekend?', exVi: 'Cuối tuần của bạn thế nào?' },
  { term: 'hobby', sub: '/ˈhɑː.bi/', vi: 'sở thích', ex: 'What are your hobbies?', exVi: 'Sở thích của bạn là gì?' },
  { term: 'weather', sub: '/ˈweð.ɚ/', vi: 'thời tiết', ex: 'Nice weather today, right?', exVi: 'Hôm nay trời đẹp nhỉ?' },
  { term: 'movie', sub: '/ˈmuː.vi/', vi: 'phim', ex: 'Have you seen any good movies lately?', exVi: 'Dạo này bạn xem phim nào hay không?' },
  { term: 'music', sub: '/ˈmjuː.zɪk/', vi: 'âm nhạc', ex: 'What kind of music do you like?', exVi: 'Bạn thích thể loại nhạc gì?' },
  { term: 'plan', sub: '/plæn/', vi: 'kế hoạch', ex: 'Any plans for the holiday?', exVi: 'Lễ này có kế hoạch gì chưa?' },
  { term: 'lately', sub: '/ˈleɪt.li/', vi: 'dạo gần đây', ex: 'How have you been lately?', exVi: 'Dạo này bạn sao rồi?' },
  { term: 'gym', sub: '/dʒɪm/', vi: 'phòng tập', ex: 'Do you go to the gym?', exVi: 'Bạn có đi tập gym không?' },
  { term: 'pet', sub: '/pet/', vi: 'thú cưng', ex: 'Do you have any pets?', exVi: 'Bạn có nuôi thú cưng không?' },
  { term: 'funny', sub: '/ˈfʌn.i/', vi: 'buồn cười, hài', ex: 'That show is so funny.', exVi: 'Chương trình đó hài ghê.' },
  { term: 'tired', sub: '/taɪrd/', vi: 'mệt', ex: "I'm a bit tired these days.", exVi: 'Dạo này tôi hơi mệt.' },
  { term: 'busy', sub: '/ˈbɪz.i/', vi: 'bận', ex: "I've been really busy this week.", exVi: 'Tuần này tôi bận kinh khủng.' },
  { term: 'hang out', sub: '/hæŋ aʊt/', vi: 'đi chơi (với bạn)', ex: "Let's hang out this Saturday.", exVi: 'Thứ Bảy này đi chơi đi.' },
  { term: 'catch up', sub: '/kætʃ ʌp/', vi: 'hàn huyên, cập nhật chuyện', ex: "Let's catch up over coffee.", exVi: 'Cà phê hàn huyên chút đi.' },
  { term: 'bored', sub: '/bɔːrd/', vi: 'chán', ex: "I'm so bored at home.", exVi: 'Ở nhà chán quá trời.' },
  { term: 'joke', sub: '/dʒoʊk/', vi: 'chuyện đùa', ex: 'He always tells funny jokes.', exVi: 'Anh ấy toàn kể chuyện đùa mắc cười.' },
]

export const CONTEXT_PACKS: ContextPack[] = [
  {
    id: 'work', name: 'Công việc & văn phòng', emoji: '💼', tone: 'tone-f', goal: 'work',
    desc: 'Họp hành, deadline, email — nói chuyện công sở tự tin.',
    words: { ko: KO_WORK, en: EN_WORK },
  },
  {
    id: 'travel', name: 'Du lịch & di chuyển', emoji: '✈️', tone: 'tone-d', goal: 'travel',
    desc: 'Sân bay, khách sạn, hỏi đường — đủ dùng cho cả chuyến đi.',
    words: { ko: KO_TRAVEL, en: EN_TRAVEL },
  },
  {
    id: 'restaurant', name: 'Nhà hàng & quán xá', emoji: '🍽️', tone: 'tone-c', goal: 'talk',
    desc: 'Gọi món, khen ngon, xin hoá đơn — ăn uống không lo bí từ.',
    words: { ko: KO_RESTAURANT, en: EN_RESTAURANT },
  },
  {
    id: 'interview', name: 'Phỏng vấn xin việc', emoji: '🤝', tone: 'tone-b', goal: 'work',
    desc: 'Giới thiệu bản thân, điểm mạnh yếu, deal lương — sẵn sàng trúng tuyển.',
    words: { ko: KO_INTERVIEW, en: EN_INTERVIEW },
  },
  {
    id: 'exam', name: 'Luyện thi & phòng thi', emoji: '🎓', tone: 'tone-a', goal: 'exam',
    desc: 'Đăng ký, đề thi, điểm số, chứng chỉ — bộ từ sống còn mùa ôn thi TOPIK/TOEIC.',
    words: { ko: KO_EXAM, en: EN_EXAM },
  },
  {
    id: 'smalltalk', name: 'Tán gẫu & kết bạn', emoji: '☕', tone: 'tone-e', goal: 'talk',
    desc: 'Cuối tuần, sở thích, thời tiết — bắt chuyện tự nhiên với bất kỳ ai.',
    words: { ko: KO_SMALLTALK, en: EN_SMALLTALK },
  },
]

export function packsFor(lang: string): ContextPack[] {
  return CONTEXT_PACKS.filter((p) => (p.words[lang] || []).length > 0)
}
