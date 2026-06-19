import Icon from '@/core/components/Icon'

interface Plan {
  id: string
  name: string
  tagline: string
  original: string
  price: string
  unit: string
  note: string
  featured?: boolean
  cta: string
}

const PLANS: Plan[] = [
  {
    id: 'monthly',
    name: 'Hằng tháng',
    tagline: 'Dùng thử linh hoạt',
    original: '180.000đ',
    price: '100.000đ',
    unit: '/tháng',
    note: 'Ưu đãi chỉ áp dụng cho lần đầu tiên',
    cta: 'Chọn gói tháng',
  },
  {
    id: 'yearly',
    name: 'Hằng năm',
    tagline: 'Tiết kiệm nhất • phổ biến',
    original: '180.000đ/tháng',
    price: '59.000đ',
    unit: '/tháng',
    note: 'Tính theo năm • ưu đãi lần đầu tiên',
    featured: true,
    cta: 'Chọn gói năm',
  },
  {
    id: 'lifetime',
    name: 'Vĩnh viễn',
    tagline: 'Trả một lần, học trọn đời',
    original: '50.999.000đ',
    price: '20.299.000đ',
    unit: 'một lần',
    note: 'Ưu đãi chỉ áp dụng cho lần đầu tiên',
    cta: 'Sở hữu vĩnh viễn',
  },
]

const PERKS = [
  'Toàn bộ tính năng trong gói Miễn phí',
  'Thêm bất kỳ video yêu thích nào',
  'Truy cập toàn bộ video trong kho',
  'Hỗ trợ video dài đến 2 giờ',
  'Phiên âm 30 giờ/tháng (tải video & luyện phát âm)',
  'Luyện phát âm với AI thông minh',
  'Mở khoá các tính năng kết hợp AI',
  'Không quảng cáo',
  'Học được tất cả ngôn ngữ',
  'Hỗ trợ 4 thiết bị: web, app mobile, iPad & hơn thế nữa',
]

export default function PricingPage() {
  return (
    <div className="pricing">
      <div className="pricing-head">
        <span className="promo-pill"><Icon name="sparkles" size={15} /> Ưu đãi ra mắt — chỉ áp dụng lần đầu tiên</span>
        <h1>Nâng cấp Premium</h1>
        <p>Mở khoá toàn bộ kho video, luyện phát âm với AI và học mọi ngôn ngữ — trên mọi thiết bị.</p>
      </div>

      <div className="plan-grid">
        {PLANS.map((p) => (
          <div key={p.id} className={'plan' + (p.featured ? ' featured' : '')}>
            {p.featured && <div className="plan-flag">Đáng giá nhất</div>}
            <div className="plan-name">{p.name}</div>
            <div className="plan-tag">{p.tagline}</div>
            <div className="plan-price">
              <span className="orig">{p.original}</span>
              <div className="now">
                <b>{p.price}</b>
                <span className="unit">{p.unit}</span>
              </div>
            </div>
            <div className="plan-note">{p.note}</div>
            <button className={'plan-cta' + (p.featured ? ' primary' : '')}>{p.cta}</button>
          </div>
        ))}
      </div>

      <div className="perks">
        <div className="perks-title"><Icon name="rocket" size={18} /> Đặc quyền gói Premium</div>
        <ul className="perks-list">
          {PERKS.map((perk) => (
            <li key={perk}><Icon name="check-circle" size={17} /> {perk}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
