/**
 * IMPROVED PSYCHOLOGICAL ASSESSMENT SCORING SYSTEM
 * Based on international standards and evidence-based practices
 *
 * References:
 * 1. American Psychiatric Association. (2022). DSM-5-TR Clinical Assessment Measures
 * 2. Shaffer, D., et al. (1983). Children's Global Assessment Scale (CGAS). Archives of General Psychiatry, 40(11), 1228-1231
 * 3. Orth, Z., et al. (2022). Measuring Mental Wellness of Adolescents: A Systematic Review. Frontiers in Psychology, 13, 835601
 * 4. ICHOM Depression & Anxiety for Children & Young People Standards (2023)
 * 5. World Health Organization. (2021). Adolescent Mental Health Assessment Guidelines
 */

export const IMPROVED_SCORING_SYSTEM = {
  // Thang điểm mở rộng 0-5 để phù hợp với DSM-5-TR và tăng độ nhạy
  SEVERITY_LEVELS: {
    0: {
      label: 'Không có vấn đề',
      english: 'None',
      description: 'Không có dấu hiệu hoặc triệu chứng',
      intervention: 'Không cần can thiệp',
      color: '#52c41a',
      bgColor: '#f6ffed',
      dsmEquivalent: 'None (0)',
      cGASRange: '81-100',
    },
    1: {
      label: 'Rất nhẹ',
      english: 'Minimal',
      description: 'Triệu chứng hiếm khi xuất hiện, ít hơn 1-2 ngày/tuần',
      intervention: 'Theo dõi và quan sát',
      color: '#52c41a',
      bgColor: '#f6ffed',
      dsmEquivalent: 'Slight (1)',
      cGASRange: '71-80',
    },
    2: {
      label: 'Nhẹ',
      english: 'Mild',
      description:
        'Triệu chứng xuất hiện vài ngày/tuần, ảnh hưởng nhẹ đến hoạt động',
      intervention: 'Tư vấn hỗ trợ định kỳ',
      color: '#faad14',
      bgColor: '#fffbe6',
      dsmEquivalent: 'Mild (2)',
      cGASRange: '61-70',
    },
    3: {
      label: 'Trung bình',
      english: 'Moderate',
      description: 'Triệu chứng xuất hiện hơn nửa số ngày, ảnh hưởng rõ rệt',
      intervention: 'Can thiệp tích cực, theo dõi sát',
      color: '#fa8c16',
      bgColor: '#fff7e6',
      dsmEquivalent: 'Moderate (3)',
      cGASRange: '51-60',
    },
    4: {
      label: 'Nghiêm trọng',
      english: 'Severe',
      description:
        'Triệu chứng xuất hiện hầu như mỗi ngày, ảnh hưởng nghiêm trọng',
      intervention: 'Can thiệp khẩn cấp, chuyển chuyên gia',
      color: '#ff4d4f',
      bgColor: '#fff2f0',
      dsmEquivalent: 'Severe (4)',
      cGASRange: '31-50',
    },
    5: {
      label: 'Cực kỳ nghiêm trọng',
      english: 'Critical',
      description: 'Nguy cơ cao, cần giám sát 24/7',
      intervention: 'Can thiệp khẩn cấp, liên hệ phụ huynh, chuyển viện',
      color: '#a8071a',
      bgColor: '#fff1f0',
      dsmEquivalent: 'Severe+ (4)',
      cGASRange: '1-30',
    },
  },

  // Guidelines đánh giá dựa trên nghiên cứu khoa học
  ASSESSMENT_GUIDELINES: {
    frequency: {
      0: 'Không bao giờ hoặc hiếm khi',
      1: 'Ít hơn 1-2 ngày trong tuần',
      2: 'Một vài ngày trong tuần (2-3 ngày)',
      3: 'Hơn nửa số ngày trong tuần (4-5 ngày)',
      4: 'Hầu như mỗi ngày (6-7 ngày)',
      5: 'Liên tục, nguy cơ cao',
    },
    impairment: {
      0: 'Không ảnh hưởng đến chức năng',
      1: 'Ảnh hưởng tối thiểu, hầu như không nhận thấy',
      2: 'Ảnh hưởng nhẹ đến học tập hoặc quan hệ xã hội',
      3: 'Ảnh hưởng trung bình đến nhiều lĩnh vực',
      4: 'Ảnh hưởng nghiêm trọng đến hầu hết lĩnh vực',
      5: 'Không thể thực hiện chức năng cơ bản',
    },
    duration: {
      0: 'Không có',
      1: 'Dưới 1 tuần',
      2: '1-2 tuần',
      3: '2-4 tuần',
      4: '1-3 tháng',
      5: 'Hơn 3 tháng hoặc mạn tính',
    },
  },

  // Điểm số cải tiến cho từng vấn đề dựa trên evidence-based research
  MENTAL_HEALTH_ISSUES: {
    // Tâm lý (Mental Health) - Được điều chỉnh dựa trên DSM-5-TR severity measures
    anxiety_persistent: {
      id: 'anxiety_persistent',
      label: 'Lo âu kéo dài',
      category: 'mental_health',
      baseScore: 3, // Moderate trong DSM-5
      evidenceLevel: 'Strong', // Dựa trên GAD-7, RCADS-25
      riskFactors: ['family_history', 'academic_pressure', 'social_issues'],
      comorbidity: ['depression', 'sleep_disorder'],
      reference: 'Spence, S.H. (1998). RCADS Manual. Griffith University.',
    },
    sleep_disorder: {
      id: 'sleep_disorder',
      label: 'Rối loạn giấc ngủ',
      category: 'mental_health',
      baseScore: 2, // Mild-Moderate
      evidenceLevel: 'Moderate',
      riskFactors: ['screen_time', 'caffeine', 'stress'],
      reference: 'Owens, J.A. (2014). Sleep Medicine Reviews, 18(4), 313-319.',
    },
    depression_symptoms: {
      id: 'depression_symptoms',
      label: 'Triệu chứng trầm cảm',
      category: 'mental_health',
      baseScore: 3, // Moderate
      evidenceLevel: 'Strong', // PHQ-A validation
      riskFactors: ['family_conflict', 'bullying', 'academic_failure'],
      comorbidity: ['anxiety', 'self_harm_ideation'],
      reference:
        'Johnson, J.G. et al. (2002). J Adolescent Health, 30(3), 196-204.',
    },
    low_self_esteem: {
      id: 'low_self_esteem',
      label: 'Lòng tự trọng thấp',
      category: 'mental_health',
      baseScore: 2, // Mild-Moderate
      evidenceLevel: 'Moderate',
      riskFactors: ['social_comparison', 'academic_pressure', 'body_image'],
      reference: 'Rosenberg, M. (1965). Rosenberg Self-Esteem Scale.',
    },
    self_harm_ideation: {
      id: 'self_harm_ideation',
      label: 'Ý nghĩ tự hại/tự tử',
      category: 'mental_health',
      baseScore: 5, // Critical - Always highest priority
      evidenceLevel: 'Strong', // Columbia Suicide Severity Rating Scale
      immediateAction: true,
      protocolRequired: 'SUICIDE_RISK_PROTOCOL',
      reference:
        'Posner, K. et al. (2011). Am J Psychiatry, 168(12), 1266-1277.',
    },

    // Môi trường (Environmental) - Điều chỉnh dựa trên Social Determinants of Health
    family_conflict: {
      id: 'family_conflict',
      label: 'Xung đột gia đình',
      category: 'environment',
      baseScore: 3, // Moderate impact
      evidenceLevel: 'Strong',
      riskFactors: ['divorce', 'domestic_violence', 'communication_breakdown'],
      protectiveFactors: ['family_therapy', 'communication_skills'],
      reference:
        'Cummings, E.M. & Davies, P.T. (2010). Annual Review of Psychology, 61, 237-263.',
    },
    bullying_victimization: {
      id: 'bullying_victimization',
      label: 'Bị bắt nạt/cô lập',
      category: 'environment',
      baseScore: 4, // Severe impact
      evidenceLevel: 'Strong', // Extensive research base
      immediateAction: true,
      protocolRequired: 'ANTI_BULLYING_PROTOCOL',
      riskFactors: [
        'physical_differences',
        'social_skills_deficit',
        'minority_status',
      ],
      reference:
        'Kowalski, R.M. et al. (2014). Psychological Bulletin, 140(4), 1073-1137.',
    },
    academic_pressure: {
      id: 'academic_pressure',
      label: 'Áp lực học tập',
      category: 'environment',
      baseScore: 3, // Moderate but common
      evidenceLevel: 'Strong',
      culturalFactor: 'EAST_ASIAN_CONTEXT', // Đặc biệt quan trọng ở Á Châu
      riskFactors: ['parental_expectations', 'competition', 'perfectionism'],
      reference:
        'Liu, Y. & Lu, Z. (2012). Educational Psychology, 32(3), 365-377.',
    },
    lack_of_support: {
      id: 'lack_of_support',
      label: 'Thiếu hỗ trợ từ trường/GV',
      category: 'environment',
      baseScore: 2, // Mild-Moderate
      evidenceLevel: 'Moderate',
      systemicIssue: true,
      reference:
        'Cohen, J. et al. (2009). School Climate Research Summary, 1, 1-6.',
    },
    unstable_home: {
      id: 'unstable_home',
      label: 'Môi trường sống không ổn định',
      category: 'environment',
      baseScore: 4, // Severe impact
      evidenceLevel: 'Strong',
      chronicity: 'LONG_TERM',
      riskFactors: [
        'poverty',
        'housing_instability',
        'parental_mental_illness',
      ],
      reference:
        'Evans, G.W. (2006). Annual Review of Psychology, 57, 423-451.',
    },
  },

  // Composite scoring algorithm dựa trên research
  COMPOSITE_SCORING: {
    weightingFactors: {
      frequency: 0.3,
      severity: 0.4,
      impairment: 0.2,
      chronicity: 0.1,
    },
    comorbidityMultiplier: {
      none: 1.0,
      single: 1.1,
      multiple: 1.25,
      complex: 1.4,
    },
    culturalAdjustment: {
      // Điều chỉnh cho bối cảnh Việt Nam
      collectivistCulture: {
        family_conflict: +0.5, // Ảnh hưởng lớn hơn trong văn hóa gia đình
        academic_pressure: +0.5, // Áp lực học tập cao hơn
        social_shame: +0.3,
      },
    },
  },

  // Intervention thresholds dựa trên evidence-based practices
  INTERVENTION_THRESHOLDS: {
    GREEN_ZONE: {
      // Score 0-1
      label: 'Vùng an toàn',
      actions: ['Theo dõi định kỳ', 'Tăng cường kỹ năng tích cực'],
      frequency: 'Quarterly assessment',
      reference: 'Preventive intervention model (Mrazek & Haggerty, 1994)',
    },
    YELLOW_ZONE: {
      // Score 2-3
      label: 'Cần chú ý',
      actions: ['Tư vấn cá nhân', 'Kỹ năng ứng phó', 'Liên hệ phụ huynh'],
      frequency: 'Bi-weekly monitoring',
      reference: 'Stepped care model (Bower & Gilbody, 2005)',
    },
    RED_ZONE: {
      // Score 4-5
      label: 'Can thiệp khẩn cấp',
      actions: ['Đánh giá chuyên sâu', 'Chuyển chuyên gia', 'Safety planning'],
      frequency: 'Daily monitoring',
      reference: 'Crisis intervention protocols (Roberts, 2005)',
    },
  },

  // Quality assurance measures
  PSYCHOMETRIC_PROPERTIES: {
    reliability: {
      internal_consistency: 'Cronbach α > 0.80 required',
      test_retest: 'r > 0.75 over 2-week interval',
      inter_rater: 'κ > 0.80 between trained assessors',
    },
    validity: {
      content: 'Expert panel validation (Lawshe CVR > 0.62)',
      criterion: 'Correlation with gold standard measures',
      construct: 'Confirmatory factor analysis (CFI > 0.95)',
    },
    cultural_adaptation: {
      translation: 'Forward-backward translation protocol',
      validation: 'Vietnamese adolescent sample (n ≥ 500)',
      norm_development: 'Age and gender-specific norms',
    },
  },
}

// Hàm tính điểm composite
export const calculateCompositeScore = (
  baseScore,
  frequency,
  impairment,
  chronicity,
  comorbidities = [],
  culturalFactors = {}
) => {
  const weights = IMPROVED_SCORING_SYSTEM.COMPOSITE_SCORING.weightingFactors

  // Base calculation
  let compositeScore =
    baseScore * weights.severity +
    frequency * weights.frequency +
    impairment * weights.impairment +
    chronicity * weights.chronicity

  // Comorbidity adjustment
  const comorbidityLevel =
    comorbidities.length === 0
      ? 'none'
      : comorbidities.length === 1
        ? 'single'
        : comorbidities.length <= 3
          ? 'multiple'
          : 'complex'

  compositeScore *=
    IMPROVED_SCORING_SYSTEM.COMPOSITE_SCORING.comorbidityMultiplier[
      comorbidityLevel
    ]

  // Cultural adjustments
  Object.entries(culturalFactors).forEach(([_factor, adjustment]) => {
    compositeScore += adjustment
  })

  // Cap at maximum score
  return Math.min(Math.round(compositeScore * 10) / 10, 5)
}

// Validation checklist
export const VALIDATION_CHECKLIST = {
  items: [
    'Inter-rater reliability established (κ > 0.80)',
    'Test-retest reliability confirmed (r > 0.75)',
    'Content validity verified by expert panel',
    'Criterion validity against established measures',
    'Cultural adaptation completed for Vietnamese context',
    'Normative data established for target population',
    'Sensitivity and specificity calculated',
    'Clinical utility demonstrated',
    'Training materials developed',
    'Quality assurance protocols implemented',
  ],
  status: 'PENDING_VALIDATION', // Should be updated after studies
  nextSteps: [
    'Conduct pilot study with 50 cases',
    'Establish inter-rater reliability',
    'Validate against PHQ-A and RCADS-25',
    'Develop Vietnamese norms',
    'Create training program',
  ],
}

export default IMPROVED_SCORING_SYSTEM

export const reportForm = {
  id: 1,
  title: 'Đánh giá sức khỏe tâm lý đầu vào',
  description:
    'Phiếu khảo sát giúp đánh giá tần suất và mức độ ảnh hưởng của các triệu chứng tâm lý.',
  questions: [
    {
      questionId: 101,
      questionText:
        'Bạn cảm thấy lo âu hay căng thẳng như thế nào trong tuần qua?',
      category: {
        id: 1,
        code: 'GAD',
        name: 'Rối loạn lo âu',
      },
      scoreTypes: [
        {
          scoreType: 'frequency',
          options: [
            {
              optionId: 1,
              label: 'Không bao giờ',
              score: 0,
            },
            {
              optionId: 2,
              label: 'Vài ngày',
              score: 1,
            },
            {
              optionId: 3,
              label: 'Hơn một nửa số ngày',
              score: 2,
            },
            {
              optionId: 4,
              label: 'Gần như mỗi ngày',
              score: 3,
            },
          ],
        },
        {
          scoreType: 'impairment',
          options: [
            {
              optionId: 5,
              label: 'Không ảnh hưởng',
              score: 0,
            },
            {
              optionId: 6,
              label: 'Ảnh hưởng nhẹ',
              score: 1,
            },
            {
              optionId: 7,
              label: 'Ảnh hưởng trung bình',
              score: 2,
            },
            {
              optionId: 8,
              label: 'Ảnh hưởng nghiêm trọng',
              score: 3,
            },
          ],
        },
      ],
    },
    {
      questionId: 102,
      questionText: 'Bạn có cảm thấy buồn bã, tuyệt vọng không?',
      category: {
        id: 2,
        code: 'PHQ',
        name: 'Trầm cảm',
      },
      scoreTypes: [
        {
          scoreType: 'frequency',
          options: [
            {
              optionId: 9,
              label: 'Không bao giờ',
              score: 0,
            },
            {
              optionId: 10,
              label: 'Vài ngày',
              score: 1,
            },
            {
              optionId: 11,
              label: 'Hơn một nửa số ngày',
              score: 2,
            },
            {
              optionId: 12,
              label: 'Gần như mỗi ngày',
              score: 3,
            },
          ],
        },
      ],
    },
    // ... More questions
  ],
}

export const assessmentResult = {
  id: 1001,
  formId: 1,
  submittedBy: {
    id: 2001,
    fullName: 'Nguyễn Văn A',
    role: 'student',
  },
  results: [
    {
      questionId: 101,
      questionText:
        'Trong 2 tuần qua, bạn cảm thấy buồn, chán nản hoặc vô vọng như thế nào?',
      category: {
        id: 1,
        code: 'DEPRESSION',
        name: 'Trầm cảm',
      },
      scores: {
        frequency: {
          selectedOptionId: 3,
          label: 'Hơn một nửa số ngày',
          score: 2,
        },
        impairment: {
          selectedOptionId: 7,
          label: 'Ảnh hưởng vừa',
          score: 2,
        },
      },
    },
    {
      questionId: 102,
      questionContent:
        'Bạn cảm thấy lo lắng hoặc bồn chồn bao nhiêu lần trong 2 tuần qua?',
      category: {
        id: 2,
        code: 'ANXIETY',
        name: 'Lo âu',
      },
      scores: {
        frequency: {
          selectedOptionId: 12,
          label: 'Gần như mỗi ngày',
          score: 3,
        },
      },
    },
  ],
}
