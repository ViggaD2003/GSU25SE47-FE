export const SESSION_FLOW_OPTIONS = [
  {
    value: 'GOOD',
    label: 'Tốt',
    color: '#52c41a',
  },
  {
    value: 'AVERAGE',
    label: 'Trung bình',
    color: '#faad14',
  },
  {
    value: 'POOR',
    label: 'Kém',
    color: '#ff4d4f',
  },
]

export const STUDENT_COOP_LEVEL_OPTIONS = [
  {
    value: 'HIGH',
    label: 'Cao',
    color: '#52c41a',
  },
  {
    value: 'MEDIUM',
    label: 'Trung bình',
    color: '#faad14',
  },
  {
    value: 'LOW',
    label: 'Thấp',
    color: '#ff4d4f',
  },
]

export const ASSESSMENT_OPTIONS = {
  severity: {
    label: 'Mức độ nghiêm trọng của triệu chứng',
    options: [
      { score: 0, text: 'Không có triệu chứng' },
      { score: 1, text: 'Rất nhẹ, không ảnh hưởng' },
      { score: 2, text: 'Nhẹ, đôi khi gây khó chịu' },
      { score: 3, text: 'Trung bình, gây khó chịu rõ rệt' },
      { score: 4, text: 'Nặng, ảnh hưởng đáng kể đến sinh hoạt' },
      { score: 5, text: 'Rất nặng, ảnh hưởng nghiêm trọng' },
    ],
  },
  frequency: {
    label: 'Tần suất xuất hiện triệu chứng',
    options: [
      { score: 0, text: 'Không bao giờ hoặc hiếm khi xảy ra' },
      { score: 1, text: 'Thỉnh thoảng (1–2 ngày mỗi tuần)' },
      { score: 2, text: 'Một vài ngày mỗi tuần (2–3 ngày)' },
      { score: 3, text: 'Thường xuyên (4–5 ngày mỗi tuần)' },
      { score: 4, text: 'Gần như mỗi ngày (6–7 ngày mỗi tuần)' },
      { score: 5, text: 'Liên tục suốt ngày, không gián đoạn' },
    ],
  },
  impairment: {
    label: 'Mức độ ảnh hưởng đến chức năng',
    options: [
      {
        score: 0,
        text: 'Không ảnh hưởng đến học tập, sinh hoạt hay các mối quan hệ',
      },
      { score: 1, text: 'Ảnh hưởng rất nhẹ, hầu như không nhận thấy' },
      { score: 2, text: 'Ảnh hưởng nhẹ đến học tập hoặc quan hệ xã hội' },
      { score: 3, text: 'Ảnh hưởng rõ rệt đến một số hoạt động hàng ngày' },
      { score: 4, text: 'Ảnh hưởng nghiêm trọng đến nhiều lĩnh vực chức năng' },
      {
        score: 5,
        text: 'Gây suy giảm nghiêm trọng hoặc mất chức năng hoàn toàn',
      },
    ],
  },
  chronicity: {
    label: 'Tính kéo dài của triệu chứng (Chronicity)',
    options: [
      { score: 0, text: 'Triệu chứng không xuất hiện hoặc chỉ mới xuất hiện' },
      { score: 1, text: 'Kéo dài dưới 2 tuần' },
      { score: 2, text: 'Kéo dài 2 tuần đến dưới 2 tháng' },
      { score: 3, text: 'Kéo dài ≥ 2 tháng, có lúc thuyên giảm' },
      { score: 4, text: 'Kéo dài liên tục ≥ 6 tháng, không thuyên giảm' },
      { score: 5, text: 'Kéo dài nhiều năm, ổn định, không cải thiện' },
    ],
  },
}
