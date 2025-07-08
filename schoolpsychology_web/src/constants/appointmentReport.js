export const reportData = {
  mental_health: {
    id: 1,
    title: 'Mental Health',
    description: 'Mental Health',
    data: [
      {
        id: 'anxiety',
        label: 'Lo âu kéo dài',
        category: 'mental_health',
        score: 3,
        noteSummary:
          'Học sinh xuất hiện tình trạng lo lắng thường xuyên, khó kiểm soát suy nghĩ tiêu cực.',
        noteSuggest:
          'Tiếp tục tư vấn định kỳ, hướng dẫn kỹ thuật thư giãn và viết nhật ký cảm xúc.',
      },
      {
        id: 'sleep_disorder',
        label: 'Rối loạn giấc ngủ',
        category: 'mental_health',
        score: 2,
        noteSummary: 'Học sinh khó ngủ, ngủ chập chờn hoặc ngủ quá nhiều.',
        noteSuggest:
          'Tư vấn điều chỉnh thói quen sinh hoạt và theo dõi thời gian ngủ hàng ngày.',
      },
      {
        id: 'depression',
        label: 'Buồn chán, mất năng lượng',
        category: 'mental_health',
        score: 3,
        noteSummary:
          'Thiếu hứng thú, mệt mỏi và ít tham gia vào các hoạt động yêu thích.',
        noteSuggest:
          'Khuyến khích hoạt động tích cực và lên kế hoạch cá nhân hằng ngày.',
      },
      {
        id: 'low_self_esteem',
        label: 'Tự ti, tự phán xét',
        category: 'mental_health',
        score: 2,
        noteSummary:
          'Học sinh hay so sánh bản thân, thiếu tự tin trong học tập hoặc giao tiếp.',
        noteSuggest:
          'Tư vấn nâng cao nhận thức bản thân và xây dựng niềm tin cá nhân.',
      },
      {
        id: 'self_harm',
        label: 'Ý nghĩ tự hại / tự tử',
        category: 'mental_health',
        score: 4,
        noteSummary: 'Học sinh có ý nghĩ hoặc hành vi gây hại cho bản thân.',
        noteSuggest:
          'Can thiệp khẩn cấp, liên hệ phụ huynh và chuyển chuyên gia tâm lý.',
      },
    ],
  },
  environment: {
    id: 2,
    title: 'Environment',
    description: 'Environment',
    data: [
      {
        id: 'family_conflict',
        label: 'Xung đột với cha mẹ',
        category: 'environment',
        score: 3,
        noteSummary:
          'Học sinh thường xuyên xung đột hoặc không được lắng nghe từ cha mẹ.',
        noteSuggest:
          'Khuyến nghị tư vấn gia đình nếu phù hợp và hướng dẫn kỹ năng giao tiếp.',
      },
      {
        id: 'bullying',
        label: 'Bị bắt nạt / cô lập',
        category: 'environment',
        score: 4,
        noteSummary:
          'Học sinh bị bạn bè xa lánh, bị chọc ghẹo hoặc bạo lực học đường.',
        noteSuggest:
          'Phối hợp GVCN, đảm bảo an toàn và can thiệp theo quy trình phòng chống bạo lực.',
      },
      {
        id: 'academic_pressure',
        label: 'Áp lực học tập',
        category: 'environment',
        score: 3,
        noteSummary: 'Học sinh chịu áp lực cao từ kỳ vọng điểm số hoặc thi cử.',
        noteSuggest:
          'Tư vấn kỹ năng học tập, lập kế hoạch và đặt mục tiêu phù hợp.',
      },
      {
        id: 'lack_of_support',
        label: 'Thiếu hỗ trợ từ giáo viên/trường',
        category: 'environment',
        score: 2,
        noteSummary:
          'Học sinh cảm thấy không được quan tâm, hỗ trợ khi cần thiết.',
        noteSuggest:
          'Tư vấn viên làm cầu nối với GVCN và giới thiệu kênh hỗ trợ trong trường.',
      },
      {
        id: 'unstable_home',
        label: 'Môi trường sống không ổn định',
        category: 'environment',
        score: 4,
        noteSummary:
          'Gia đình có hoàn cảnh khó khăn, ly thân, hoặc thay đổi liên tục.',
        noteSuggest:
          'Tư vấn dài hạn và kết nối với các chương trình học bổng / hỗ trợ.',
      },
    ],
  },
  //   impact: {
  //     title: 'Impact',
  //     description: 'Impact',
  //     data: [
  //       {
  //         id: 'impact_emotion',
  //         label: 'Ảnh hưởng cảm xúc',
  //         score: 3,
  //         noteSummary:
  //           'Cảm xúc học sinh bị ảnh hưởng rõ rệt như buồn bã, lo âu, tức giận.',
  //         noteSuggest: 'Tư vấn kiểm soát cảm xúc và luyện tập kỹ thuật thư giãn.',
  //       },
  //       {
  //         id: 'impact_academic',
  //         label: 'Ảnh hưởng học tập',
  //         score: 2,
  //         noteSummary: 'Khó tập trung, giảm hiệu suất học tập, chán học.',
  //         noteSuggest: 'Hỗ trợ kỹ năng học tập, quản lý thời gian, giảm áp lực.',
  //       },
  //       {
  //         id: 'impact_social',
  //         label: 'Ảnh hưởng quan hệ xã hội',
  //         score: 3,
  //         noteSummary:
  //           'Học sinh thu mình, không hoà nhập hoặc có mâu thuẫn với bạn.',
  //         noteSuggest:
  //           'Tư vấn kỹ năng giao tiếp, khuyến khích tham gia nhóm tích cực.',
  //       },
  //       {
  //         id: 'impact_behavior',
  //         label: 'Hành vi nguy cơ',
  //         score: 4,
  //         noteSummary: 'Có hành vi bất thường như bỏ học, nói tục, gây rối.',
  //         noteSuggest:
  //           'Theo dõi sát, làm việc với phụ huynh và giáo viên chủ nhiệm.',
  //       },
  //     ],
  //   },
}
