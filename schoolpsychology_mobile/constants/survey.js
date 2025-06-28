export const surveyData = [
  {
    surveyId: 1,
    name: "Khảo sát tâm lý học đường",
    description: "Khảo sát đánh giá tâm lý học sinh",
    isRequired: true,
    isRecurring: false,
    recurringCycle: "MONTHLY",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    createdAt: "2025-06-27T07:38:23",
    updatedAt: null,
    status: "ARCHIVED",
    questions: [
      {
        questionId: 1,
        createdAt: "2025-06-27T07:38:23",
        updatedAt: null,
        description: "Đánh giá mức độ áp lực từ việc học.",
        moduleType: "SURVEY",
        questionType: "MULTIPLE_CHOICE",
        category: {
          id: 1,
          name: "Tâm lý học đường",
          code: "PSY",
        },
        text: "Bạn có thường xuyên cảm thấy bị quá tải với khối lượng bài tập và kỳ vọng học tập không?",
        answers: [
          {
            id: 1,
            text: "Có",
            score: 1,
          },
          {
            id: 2,
            text: "Không",
            score: 0,
          },
        ],
        active: true,
        required: true,
      },
    ],
  },
  {
    surveyId: 2,
    name: "Test",
    description: "string",
    isRequired: true,
    isRecurring: true,
    recurringCycle: "DAILY",
    startDate: "2025-06-27",
    endDate: "2025-06-29",
    createdAt: "2025-06-27T10:25:27.051248",
    updatedAt: "2025-06-27T10:25:27.051275",
    status: "PUBLISHED",
    questions: [
      {
        questionId: 2,
        createdAt: "2025-06-27T10:25:27.086534",
        updatedAt: "2025-06-27T10:25:27.086549",
        description: "string",
        moduleType: "SURVEY",
        questionType: "SINGLE_CHOICE",
        category: {
          id: 1,
          name: "Tâm lý học đường",
          code: "PSY",
        },
        text: "string",
        answers: [
          {
            id: 3,
            text: "string",
            score: 0,
          },
          {
            id: 4,
            text: "string",
            score: 1,
          },
        ],
        active: true,
        required: true,
      },
      {
        questionId: 3,
        name: "Test 1",
        description: "string",
        isRequired: true,
        isRecurring: true,
        recurringCycle: "DAILY",
        createdAt: "2025-06-27T10:25:27.1014",
        updatedAt: "2025-06-27T10:25:27.101415",
        description: "string",
        moduleType: "SURVEY",
        questionType: "SINGLE_CHOICE",
        category: {
          id: 1,
          name: "Tâm lý học đường",
          code: "PSY",
        },
        text: "string",
        answers: [
          {
            id: 5,
            text: "string",
            score: 0,
          },
          {
            id: 6,
            text: "string",
            score: 1,
          },
        ],
        active: true,
        required: true,
      },
    ],
  },
  {
    surveyId: 4,
    name: "Test 2",
    description: "string",
    isRequired: true,
    isRecurring: true,
    recurringCycle: "DAILY",
    startDate: "2025-06-28",
    endDate: "2025-07-05",
    createdAt: "2025-06-27T10:28:03.11668",
    updatedAt: "2025-06-27T10:28:03.116695",
    status: "PUBLISHED",
    questions: [
      {
        questionId: 4,
        createdAt: "2025-06-27T10:28:03.124911",
        updatedAt: "2025-06-27T10:28:03.124952",
        description: "string",
        moduleType: "SURVEY",
        questionType: "SINGLE_CHOICE",
        category: {
          id: 1,
          name: "Tâm lý học đường",
          code: "PSY",
        },
        text: "string",
        answers: [
          {
            id: 7,
            text: "string",
            score: 0,
          },
          {
            id: 8,
            text: "string",
            score: 1,
          },
        ],
        active: true,
        required: true,
      },
      {
        questionId: 5,
        createdAt: "2025-06-27T10:28:03.133327",
        updatedAt: "2025-06-27T10:28:03.133342",
        description: "string",
        moduleType: "SURVEY",
        questionType: "SINGLE_CHOICE",
        category: {
          id: 1,
          name: "Tâm lý học đường",
          code: "PSY",
        },
        text: "string",
        answers: [
          {
            id: 9,
            text: "string",
            score: 0,
          },
          {
            id: 10,
            text: "string",
            score: 1,
          },
        ],
        active: true,
        required: true,
      },
    ],
  },
  {
    surveyId: 5,
    name: "Khảo sát sức khỏe tâm thần",
    description: "Đánh giá tình trạng sức khỏe tâm thần của học sinh",
    isRequired: false,
    isRecurring: true,
    recurringCycle: "WEEKLY",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    createdAt: "2025-06-27T10:30:00.000000",
    updatedAt: "2025-06-27T10:30:00.000000",
    status: "PUBLISHED",
    questions: [
      {
        questionId: 6,
        createdAt: "2025-06-27T10:30:00.000000",
        updatedAt: "2025-06-27T10:30:00.000000",
        description: "Đánh giá mức độ stress",
        moduleType: "SURVEY",
        questionType: "SINGLE_CHOICE",
        category: {
          id: 2,
          name: "Sức khỏe tâm thần",
          code: "MENTAL",
        },
        text: "Bạn có thường xuyên cảm thấy căng thẳng không?",
        answers: [
          {
            id: 11,
            text: "Rất thường xuyên",
            score: 3,
          },
          {
            id: 12,
            text: "Thỉnh thoảng",
            score: 2,
          },
          {
            id: 13,
            text: "Hiếm khi",
            score: 1,
          },
          {
            id: 14,
            text: "Không bao giờ",
            score: 0,
          },
        ],
        active: true,
        required: true,
      },
    ],
  },
];

export const surveyResult = [
  {
    surveyCode: "GAD-7",
    method: "sum",
    totalScore: 21,
    levels: [
      {
        min: 0,
        max: 4,
        level: "low",
        noteSuggest:
          "Học sinh không có biểu hiện lo âu đáng kể. Có thể tiếp tục tham gia các hoạt động học tập và xã hội bình thường. Nên duy trì các thói quen lành mạnh và được khảo sát lại định kỳ nếu cần.",
      },
      {
        min: 5,
        max: 9,
        level: "medium",
        noteSuggest:
          "Học sinh bắt đầu xuất hiện một số dấu hiệu lo âu nhẹ. Khuyến nghị theo dõi thêm trong vài tuần, tạo môi trường học tích cực và có thể mời học sinh tham gia hoạt động hỗ trợ tinh thần hoặc gặp counselor nếu biểu hiện tăng dần.",
      },
      {
        min: 10,
        max: 14,
        level: "high",
        noteSuggest:
          "Học sinh đang có mức độ lo âu trung bình. Nên thực hiện tư vấn 1:1 với chuyên viên tâm lý học đường. Có thể kết hợp thêm các công cụ đánh giá khác để làm rõ tình trạng và có phương án hỗ trợ phù hợp.",
      },
      {
        min: 15,
        max: 21,
        level: "critical",
        noteSuggest:
          "Học sinh có dấu hiệu lo âu nghiêm trọng. Cần được can thiệp ngay bởi chuyên viên tư vấn. Cần trao đổi với phụ huynh và nhà trường để lập kế hoạch hỗ trợ tâm lý phù hợp, đồng thời giám sát sát sao diễn biến tâm trạng của học sinh.",
      },
    ],
  },
  {
    surveyCode: "PHQ-9",
    method: "sum",
    totalScore: 27,
    levels: [
      {
        min: 0,
        max: 4,
        level: "low",
        noteSuggest:
          "Không có dấu hiệu trầm cảm đáng kể. Học sinh đang ở trạng thái tâm lý ổn định. Không cần can thiệp chuyên sâu, chỉ cần duy trì môi trường tích cực và theo dõi định kỳ.",
      },
      {
        min: 5,
        max: 9,
        level: "medium",
        noteSuggest:
          "Có dấu hiệu trầm cảm nhẹ. Học sinh nên được khuyến khích chia sẻ cảm xúc, tham gia các hoạt động ngoại khóa, và có thể được tư vấn định hướng nhằm phòng ngừa nguy cơ tăng nặng.",
      },
      {
        min: 10,
        max: 14,
        level: "high",
        noteSuggest:
          "Trạng thái trầm cảm vừa. Nên tổ chức buổi tư vấn cá nhân, đánh giá thêm các yếu tố nguy cơ khác như học tập, gia đình, quan hệ bạn bè để xây dựng kế hoạch hỗ trợ phù hợp.",
      },
      {
        min: 15,
        max: 19,
        level: "high",
        noteSuggest:
          "Học sinh có dấu hiệu trầm cảm rõ rệt. Nên có sự can thiệp chuyên sâu từ chuyên viên tâm lý. Cần phối hợp với phụ huynh, giáo viên để đảm bảo môi trường hỗ trợ học sinh toàn diện.",
      },
      {
        min: 20,
        max: 27,
        level: "critical",
        noteSuggest:
          "Học sinh đang ở trạng thái trầm cảm nghiêm trọng. Cần lập tức liên hệ với phụ huynh, chuyên viên tâm lý và có thể cân nhắc chuyển tuyến hỗ trợ chuyên sâu. Ưu tiên bảo vệ sự an toàn và sức khỏe tinh thần của học sinh.",
      },
    ],
  },
  {
    surveyCode: "FAMILY_ENV",
    method: "average",
    totalScore: 5,
    levels: [
      {
        min: 0.0,
        max: 2.9,
        level: "high",
        noteSuggest:
          "Môi trường gia đình của học sinh có nhiều yếu tố tiêu cực hoặc thiếu hỗ trợ. Cần tiến hành buổi trò chuyện riêng để tìm hiểu sâu hơn, đồng thời cân nhắc việc mời phụ huynh tham gia nếu phù hợp.",
      },
      {
        min: 3.0,
        max: 3.9,
        level: "medium",
        noteSuggest:
          "Gia đình học sinh có một số điểm chưa lý tưởng nhưng vẫn có thể hỗ trợ được. Cần hướng dẫn học sinh kỹ năng giao tiếp, giải tỏa căng thẳng trong gia đình và theo dõi định kỳ.",
      },
      {
        min: 4.0,
        max: 5.0,
        level: "low",
        noteSuggest:
          "Gia đình là một nguồn hỗ trợ tích cực cho học sinh. Không cần can thiệp, chỉ nên duy trì kết nối tốt giữa nhà trường và phụ huynh.",
      },
    ],
  },
  {
    surveyCode: "SCHOOL_ENV",
    method: "average",
    totalScore: 5,
    levels: [
      {
        min: 0.0,
        max: 2.9,
        level: "high",
        noteSuggest:
          "Học sinh cảm thấy môi trường học đường tiêu cực, có thể liên quan đến bắt nạt, áp lực học tập hoặc xung đột nhóm. Nên trao đổi với GVCN và có thể làm khảo sát nhóm lớp để điều chỉnh môi trường chung.",
      },
      {
        min: 3.0,
        max: 3.9,
        level: "medium",
        noteSuggest:
          "Môi trường học đường nhìn chung tạm ổn nhưng vẫn có một số yếu tố chưa thực sự tích cực. Nên cải thiện bằng hoạt động lớp, kỹ năng làm việc nhóm, tăng tính gắn kết bạn bè.",
      },
      {
        min: 4.0,
        max: 5.0,
        level: "low",
        noteSuggest:
          "Học sinh hài lòng và cảm thấy an toàn trong môi trường học đường. Không cần can thiệp, chỉ cần tiếp tục duy trì và phát huy các yếu tố tích cực.",
      },
    ],
  },
];
