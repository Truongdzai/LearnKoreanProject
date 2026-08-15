import { z } from 'zod'

export interface ToolDef {
	name: string
	description: string
	schema: z.ZodRawShape
	request: (args: Record<string, unknown>) => { path: string; method?: string; body?: unknown }
}

export const TOOLS: ToolDef[] = [
	{
		name: 'tra_tu',
		description:
			'Tra một từ trong từ điển offline (KRDICT cho tiếng Hàn). Trả nghĩa, từ loại, ví dụ. Dùng khi người học hỏi nghĩa của một từ cụ thể.',
		schema: {
			word: z.string().min(1).max(40).describe('Từ cần tra, đúng chính tả gốc'),
		},
		request: (a) => ({ path: `/api/define?word=${encodeURIComponent(String(a.word))}` }),
	},
	{
		name: 'tra_tu_chi_tiet',
		description:
			'Tra từ ở mức chi tiết (có phát âm, sắc thái, ví dụ dịch sang tiếng mẹ đẻ). Tốn quota AI hơn tra_tu — chỉ dùng khi người học cần hiểu sâu.',
		schema: {
			word: z.string().min(1).max(40),
			lang: z.string().max(5).default('ko').describe('Ngôn ngữ đang học: ko, en, zh, ja'),
			native: z.string().max(5).default('vi').describe('Tiếng mẹ đẻ của người học'),
		},
		request: (a) => ({
			path:
				`/api/define/rich?word=${encodeURIComponent(String(a.word))}` +
				`&lang=${encodeURIComponent(String(a.lang ?? 'ko'))}` +
				`&native=${encodeURIComponent(String(a.native ?? 'vi'))}`,
		}),
	},
	{
		name: 'them_the_srs',
		description:
			'Lưu một thẻ vào hệ ôn tập ngắt quãng (SRS) của người học. Dùng khi gặp từ mới đáng nhớ. KHÔNG dùng Anki — hệ thẻ này là của riêng VyLing.',
		schema: {
			front: z.string().min(1).describe('Mặt trước: từ hoặc câu cần nhớ'),
			back: z.string().default('').describe('Mặt sau: nghĩa và ghi chú'),
			source: z.string().default('').describe('Nguồn gốc, ví dụ id video YouTube'),
		},
		request: (a) => ({
			path: '/api/srs/add',
			method: 'POST',
			body: { front: a.front, back: a.back ?? '', source: a.source ?? '' },
		}),
	},
	{
		name: 'the_den_han',
		description:
			'Lấy danh sách thẻ SRS đến hạn ôn hôm nay kèm thống kê. Dùng để trả lời "hôm nay tôi cần ôn gì".',
		schema: {},
		request: () => ({ path: '/api/srs/due' }),
	},
	{
		name: 'thong_ke_srs',
		description:
			'Thống kê tiến độ ôn tập của người học (tổng thẻ, đến hạn, đã thuộc). Dùng để đánh giá trình độ trước khi gợi ý bài học.',
		schema: {},
		request: () => ({ path: '/api/srs/stats' }),
	},
	{
		name: 'kho_video',
		description:
			'Liệt kê video trong kho đã kiểm chứng phụ đề. Dùng khi cần gợi ý tài liệu luyện shadowing.',
		schema: {
			lang: z.string().max(5).default('').describe('Lọc theo ngôn ngữ: ko, en, zh, ja. Bỏ trống = tất cả'),
		},
		request: (a) => ({ path: `/api/content/videos?lang=${encodeURIComponent(String(a.lang ?? ''))}` }),
	},
	{
		name: 'phu_de_video',
		description:
			'Lấy phụ đề song ngữ của một video YouTube. Tác vụ nặng (tải + dịch) — chỉ gọi khi người học thực sự muốn học video đó.',
		schema: {
			url: z.string().url().describe('Link YouTube đầy đủ'),
		},
		request: (a) => ({ path: '/api/transcript', method: 'POST', body: { url: a.url } }),
	},
	{
		name: 'suc_khoe_he_thong',
		description: 'Kiểm tra tình trạng backend (DB, từ điển, ffmpeg, LLM). Dùng khi nghi ngờ lỗi hệ thống.',
		schema: {},
		request: () => ({ path: '/api/health' }),
	},
]
