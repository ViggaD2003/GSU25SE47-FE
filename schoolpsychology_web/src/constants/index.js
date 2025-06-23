// API URLs
export const API_BASE_URL = 'http://localhost:3001/api'

// App configuration
export const APP_CONFIG = {
  NAME: 'School Psychology',
  VERSION: '1.0.0',
  DESCRIPTION: 'School Psychology Management System',
}

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  FORGOT_PASSWORD: '/forgot-password',
  NOT_FOUND: '*',
}

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
}

// Sample surveys based on categories
export const SAMPLE_SURVEYS = {
  mental_health: [
    {
      name: 'GAD-7 (Khảo sát lo âu GAD-7)',
      description: 'Khảo sát đánh giá mức độ lo âu tổng quát',
      questions: [
        {
          text: 'Cảm thấy lo lắng, bồn chồn hoặc căng thẳng',
          required: true,
          questionType: 'MULTIPLE_CHOICE',
          answers: [
            { text: 'Không hề', score: 0 },
            { text: 'Vài ngày', score: 1 },
            { text: 'Hơn một nửa số ngày', score: 2 },
            { text: 'Gần như mỗi ngày', score: 3 },
          ],
        },
        {
          text: 'Không thể ngừng lo lắng hoặc kiểm soát được sự lo lắng',
          required: true,
          questionType: 'MULTIPLE_CHOICE',
          answers: [
            { text: 'Không hề', score: 0 },
            { text: 'Vài ngày', score: 1 },
            { text: 'Hơn một nửa số ngày', score: 2 },
            { text: 'Gần như mỗi ngày', score: 3 },
          ],
        },
      ],
    },
    {
      name: 'PHQ-9 (Khảo sát trầm cảm PHQ-9)',
      description: 'Khảo sát đánh giá mức độ trầm cảm',
      questions: [
        {
          text: 'Ít quan tâm hoặc ít thích thú làm việc gì',
          required: true,
          questionType: 'MULTIPLE_CHOICE',
          answers: [
            { text: 'Không hề', score: 0 },
            { text: 'Vài ngày', score: 1 },
            { text: 'Hơn một nửa số ngày', score: 2 },
            { text: 'Gần như mỗi ngày', score: 3 },
          ],
        },
        {
          text: 'Cảm thấy chán nản, buồn bã hoặc tuyệt vọng',
          required: true,
          questionType: 'MULTIPLE_CHOICE',
          answers: [
            { text: 'Không hề', score: 0 },
            { text: 'Vài ngày', score: 1 },
            { text: 'Hơn một nửa số ngày', score: 2 },
            { text: 'Gần như mỗi ngày', score: 3 },
          ],
        },
      ],
    },
  ],
  environment: [
    {
      name: 'FAMILY (Đánh giá môi trường gia đình)',
      description: 'Khảo sát đánh giá môi trường gia đình',
      questions: [
        {
          text: 'Gia đình bạn có thường xuyên giao tiếp với nhau không?',
          required: true,
          questionType: 'MULTIPLE_CHOICE',
          answers: [
            { text: 'Rất ít', score: 0 },
            { text: 'Thỉnh thoảng', score: 1 },
            { text: 'Thường xuyên', score: 2 },
            { text: 'Rất thường xuyên', score: 3 },
          ],
        },
        {
          text: 'Bạn có cảm thấy được hỗ trợ từ gia đình không?',
          required: true,
          questionType: 'MULTIPLE_CHOICE',
          answers: [
            { text: 'Không hề', score: 0 },
            { text: 'Ít', score: 1 },
            { text: 'Nhiều', score: 2 },
            { text: 'Rất nhiều', score: 3 },
          ],
        },
      ],
    },
    {
      name: 'SCHOOL (Môi trường học đường)',
      description: 'Khảo sát đánh giá môi trường học đường',
      questions: [
        {
          text: 'Bạn có cảm thấy an toàn ở trường không?',
          required: true,
          questionType: 'MULTIPLE_CHOICE',
          answers: [
            { text: 'Không an toàn', score: 0 },
            { text: 'Ít an toàn', score: 1 },
            { text: 'An toàn', score: 2 },
            { text: 'Rất an toàn', score: 3 },
          ],
        },
        {
          text: 'Bạn có hài lòng với môi trường học tập không?',
          required: true,
          questionType: 'MULTIPLE_CHOICE',
          answers: [
            { text: 'Không hài lòng', score: 0 },
            { text: 'Ít hài lòng', score: 1 },
            { text: 'Hài lòng', score: 2 },
            { text: 'Rất hài lòng', score: 3 },
          ],
        },
      ],
    },
  ],
}
