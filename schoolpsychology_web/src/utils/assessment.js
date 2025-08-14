// utils/assessment.js

/**
 * Tính điểm trung bình cho 1 danh mục
 * @param {number[]} scores - Mảng điểm (0–5)
 * @returns {number} - Điểm trung bình (0–5)
 */
export const calcAverageScore = scores => {
  if (!scores?.length) return 0
  const total = scores.reduce((sum, val) => sum + (val || 0), 0)
  return +(total / scores.length).toFixed(2)
}

/**
 * Chuyển điểm 0–5 sang %
 * @param {number} avgScore - Điểm trung bình (0–5)
 * @returns {number} - % tương ứng (0–100)
 */
export const toPercent = avgScore => {
  return +((avgScore / 5) * 100).toFixed(2)
}

/**
 * Xác định risk level dựa trên điểm trung bình 0–5
 * @param {number} avgScore - Điểm trung bình (0–5)
 * @returns {string} - Risk level
 */
export const getRiskLevel = avgScore => {
  if (avgScore >= 4) return 'Very High'
  if (avgScore >= 3) return 'High'
  if (avgScore >= 2) return 'Moderate'
  if (avgScore > 0) return 'Low'
  return 'None'
}

/**
 * Xử lý toàn bộ dữ liệu đánh giá thành format cho đồ thị
 * @param {object} categories - { Depression: [...], Anxiety: [...], Violence: [...] }
 * @param {boolean} asPercent - true nếu muốn dùng %
 * @returns {Array} - [{ category, score, riskLevel }]
 */
export const prepareChartData = (categories, asPercent = false) => {
  return Object.entries(categories).map(([category, scores]) => {
    const avg = calcAverageScore(scores)
    return {
      category,
      score: asPercent ? toPercent(avg) : avg,
      riskLevel: getRiskLevel(avg),
    }
  })
}
