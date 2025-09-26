import {
  DashboardOutlined,
  UserOutlined,
  AlertOutlined,
  TeamOutlined,
  HeartOutlined,
  CalendarOutlined,
  SettingOutlined,
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
        allowedRoles: ['teacher', 'counselor', 'manager'],
        hidden: true,
      },
      {
        key: '/program-management',
        labelKey: 'navigation.programManagement',
        allowedRoles: ['manager', 'counselor'],
        element: 'ProgramManagement',
      },
      {
        key: '/program-management/details/:id',
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
    allowedRoles: ['manager', 'teacher'],
    children: [
      {
        key: '/class-management',
        labelKey: 'navigation.classManagement',
        allowedRoles: ['manager', 'teacher'],
        element: 'ClassManagement',
      },
      {
        key: '/create-class',
        labelKey: 'navigation.createClass',
        allowedRoles: ['manager'],
        element: 'CreateClass',
      },
      {
        key: '/student-management',
        labelKey: 'navigation.studentManagement',
        allowedRoles: ['teacher'],
        element: 'ClientManagement',
      },
    ],
  },
  {
    key: '/student-management/:id',
    labelKey: 'navigation.studentManagement',
    hidden: true,
    allowedRoles: ['manager', 'teacher'],
    element: 'UserDetail',
  },

  {
    key: '/account-management',
    icon: UserOutlined,
    labelKey: 'navigation.accountManagement.title',
    allowedRoles: ['manager'],
    element: 'StaffManagement',
  },

  // Slot Management (Work Schedule) - Teacher, Counselor
  {
    key: '/work-schedule',
    icon: CalendarOutlined,
    labelKey: 'navigation.slotManagement',
    allowedRoles: ['teacher', 'counselor', 'manager'],
    element: 'SlotManagement',
  },

  // Case Management (Case Management, Case Assign) - Manager
  {
    key: '/case-management',
    icon: AlertOutlined,
    labelKey: 'navigation.caseManagement',
    allowedRoles: ['manager', 'counselor', 'teacher'],
    element: 'CaseManagement',
  },

  // System Config (System Config) - Manager
  // {
  //   key: '/system-config',
  //   icon: SettingOutlined,
  //   labelKey: 'navigation.systemConfig',
  //   allowedRoles: ['manager'],
  //   element: 'SystemConfigManagement',
  // },

  {
    key: '/case-management/details/:id',
    element: 'CaseDetails',
    allowedRoles: ['teacher', 'counselor', 'manager'],
    hidden: true,
  },
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
  // console.log('acc', acc)
  return acc
}, {})
