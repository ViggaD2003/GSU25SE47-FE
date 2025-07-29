import {
  DashboardOutlined,
  UserOutlined,
  AlertOutlined,
  CalendarOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons'

export const ROUTE_CONFIG = [
  {
    key: '/dashboard',
    icon: DashboardOutlined,
    labelKey: 'navigation.dashboard',
    allowedRoles: ['manager', 'teacher', 'counselor'],
    element: 'Dashboard',
  },
  {
    key: '/account-management',
    icon: UserOutlined,
    labelKey: 'navigation.accountManagement.title',
    allowedRoles: ['manager'],
    children: [
      {
        key: '/client-management',
        labelKey: 'navigation.accountManagement.clients',
        element: 'ClientManagement',
      },
      {
        key: '/staff-management',
        labelKey: 'navigation.accountManagement.staffs',
        element: 'StaffManagement',
      },
    ],
  },
  // {
  //   key: '/case-management',
  //   icon: AlertOutlined,
  //   labelKey: 'navigation.caseManagement',
  //   allowedRoles: ['manager', 'teacher', 'counselor'],
  //   element: 'CaseManagement',
  // },
  {
    key: '/survey-management',
    icon: FileTextOutlined,
    labelKey: 'navigation.surveyManagement',
    allowedRoles: ['manager'],
    element: 'SurveyManagement',
  },
  {
    key: '/appointment-management',
    icon: CalendarOutlined,
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
    icon: AppstoreOutlined,
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
  {
    key: '/slot-management',
    icon: ClockCircleOutlined,
    labelKey: 'navigation.slotManagement',
    allowedRoles: ['manager', 'teacher', 'counselor'],
    element: 'SlotManagement',
  },
  {
    key: '/class-management',
    icon: TeamOutlined,
    labelKey: 'navigation.classManagement',
    allowedRoles: ['manager'],
    element: 'ClassManagement',
  },
  {
    key: '/category-management',
    icon: AppstoreOutlined,
    labelKey: 'navigation.categoryManagement',
    allowedRoles: ['manager'],
    element: 'CategoryManagement',
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
  return acc
}, {})
