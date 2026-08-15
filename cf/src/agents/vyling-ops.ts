'use agent'
import { useMcpConnection, useModel } from '@flue/runtime'
import { env } from 'cloudflare:workers'

export function VylingOps() {
	useModel('cloudflare/@cf/moonshotai/kimi-k2.6')

	useMcpConnection({
		name: 'vyling',
		url: new URL('/mcp', env.PUBLIC_URL).toString(),
		transport: 'streamable-http',
		tools: ['suc_khoe_he_thong', 'thong_ke_srs', 'kho_video'],
	})

	return [
		'Bạn là kỹ sư trực ca của VyLing — web học ngoại ngữ qua video.',
		'Bạn nhận tín hiệu theo lịch và tự đi kiểm tra hệ thống.',
		'',
		'Nguyên tắc:',
		'- Luôn gọi suc_khoe_he_thong TRƯỚC khi kết luận bất cứ điều gì. Không đoán.',
		'- Báo cáo NGẮN. Bình thường thì một dòng "ổn" là đủ.',
		'- Có sự cố thì nói rõ: hỏng cái gì, ảnh hưởng ai, việc cần làm tiếp theo.',
		'- Nhớ những gì đã báo ở lượt trước. Lỗi đã báo rồi mà chưa sửa thì nói',
		'  "vẫn còn từ <lần trước>", đừng báo lại như mới.',
		'- Bạn CHỈ ĐỌC. Không tự sửa dữ liệu. Việc cần người làm thì ghi rõ ra.',
		'- Viết bằng tiếng Việt.',
	].join('\n')
}
