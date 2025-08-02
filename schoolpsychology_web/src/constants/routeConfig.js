import {
  DashboardOutlined,
  UserOutlined,
  AlertOutlined,
  TeamOutlined,
  HeartOutlined,
  CalendarOutlined,
} from '@ant-design/icons'

export const ROUTE_CONFIG = [
  {
    key: '/dashboard',
    icon: DashboardOutlined,
    labelKey: 'navigation.dashboard',
    allowedRoles: ['manager', 'teacher', 'counselor'],
    element: 'Dashboard',
  },

  // Psychological Support (Category, Survey, Appointment, Program) - Manager, Teacher, Counselor
  {
    key: 'psychological-support',
    icon: HeartOutlined,
    labelKey: 'navigation.psychologicalSupport',
    allowedRoles: ['manager', 'teacher', 'counselor'],
    children: [
      {
        key: '/category-management',
        labelKey: 'navigation.categoryManagement',
        allowedRoles: ['manager'],
        element: 'CategoryManagement',
      },
      {
        key: '/survey-management',
        labelKey: 'navigation.surveyManagement',
        allowedRoles: ['manager', 'counselor'],
        element: 'SurveyManagement',
      },
      {
        key: '/appointment-management',
        labelKey: 'navigation.appointmentsManagement',
        allowedRoles: ['teacher', 'counselor'],
        element: 'AppointmentManagement',
      },
      {
        key: '/appointment-management/details/:id',
        element: 'AppointmentDetails',
        allowedRoles: ['teacher', 'counselor'],
        hidden: true,
      },
      {
        key: '/program-management',
        labelKey: 'navigation.programManagement',
        allowedRoles: ['manager', 'counselor'],
        element: 'ProgramManagement',
      },
      {
        key: '/program-management/details',
        element: 'ProgramDetails',
        allowedRoles: ['manager', 'counselor'],
        hidden: true,
      },
    ],
  },

  // Class Management (Class, Teacher, Student) - Manager
  {
    key: 'classes',
    icon: TeamOutlined,
    labelKey: 'navigation.classManagement',
    allowedRoles: ['manager'],
    children: [
      {
        key: '/class-management',
        labelKey: 'navigation.classManagement',
        allowedRoles: ['manager'],
        element: 'ClassManagement',
      },
      {
        key: '/student-management',
        labelKey: 'navigation.studentManagement',
        allowedRoles: ['manager'],
        element: 'ClientManagement',
      },
    ],
  },

  // My Class (My Student, Observed Cases) - Teacher
  {
    key: 'my-class',
    icon: TeamOutlined,
    labelKey: 'navigation.myClass',
    allowedRoles: ['teacher'],
    children: [
      {
        key: '/my-class',
        labelKey: 'navigation.myStudent',
        allowedRoles: ['teacher'],
        element: 'ClientManagement',
      },
      {
        key: '/observed-cases',
        labelKey: 'navigation.observedCases',
        allowedRoles: ['teacher'],
        element: 'CaseManagement',
      },
    ],
  },

  // Assigned Cases (Assigned Cases) - Counselor
  {
    key: '/assigned-cases',
    icon: AlertOutlined,
    labelKey: 'navigation.assignedCases',
    allowedRoles: ['counselor'],
    element: 'CaseManagement',
  },

  // Staff Management (Staff List, Slot Management) - Manager
  {
    key: 'staff-management',
    icon: UserOutlined,
    labelKey: 'navigation.staffManagement.title',
    allowedRoles: ['manager'],
    children: [
      {
        key: '/counselor-management',
        labelKey: 'navigation.staffManagement.counselorList',
        element: 'StaffManagement',
        allowedRoles: ['manager'],
      },
      {
        key: '/teacher-management',
        labelKey: 'navigation.staffManagement.teacherList',
        element: 'StaffManagement',
        allowedRoles: ['manager'],
      },
      {
        key: '/slot-management',
        labelKey: 'navigation.slotManagement',
        allowedRoles: ['manager'],
        element: 'SlotManagement',
      },
    ],
  },

  // Slot Management (Work Schedule) - Teacher, Counselor
  {
    key: '/work-schedule',
    icon: CalendarOutlined,
    labelKey: 'navigation.slotManagement',
    allowedRoles: ['teacher', 'counselor'],
    element: 'SlotManagement',
  },

  // Case Management (Case Management, Case Assign) - Manager
  {
    key: '/case-management',
    icon: AlertOutlined,
    labelKey: 'navigation.caseManagement',
    allowedRoles: ['manager'],
    element: 'CaseManagement',
    // children: [
    //   {
    //     key: '/case-management',
    //     labelKey: 'navigation.caseManagement',
    //     allowedRoles: ['manager'],
    //     element: 'CaseManagement',
    //   },
    //   {
    //     key: '/case-assign',
    //     labelKey: 'navigation.caseAssign',
    //     allowedRoles: ['manager'],
    //     element: 'CaseAssign',
    //   },
    // ],
  },

  // {
  //   key: '/assessment-demo',
  //   labelKey: 'navigation.assessmentDemo',
  //   allowedRoles: ['manager', 'teacher', 'counselor'],
  //   element: 'AssessmentDemo',
  // },
]

// Helper: Tạo object role -> [route] cho permission
export const ROLE_PERMISSIONS = ROUTE_CONFIG.reduce((acc, route) => {
  if (route.allowedRoles) {
    route.allowedRoles.forEach(role => {
      if (!acc[role]) acc[role] = []
      acc[role].push(route.key)
      if (route.children) {
        route.children.forEach(child => acc[role].push(child.key))
      }
    })
  }
  return acc
}, {})
