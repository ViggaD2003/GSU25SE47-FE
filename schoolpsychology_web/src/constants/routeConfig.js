import {
  DashboardOutlined,
  UserOutlined,
  AlertOutlined,
  CalendarOutlined,
  FileTextOutlined,
  AppstoreOutlined,
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
  {
    key: '/case-management',
    icon: AlertOutlined,
    labelKey: 'navigation.caseManagement',
    allowedRoles: ['manager', 'teacher', 'counselor'],
    element: 'CaseManagement',
  },
  {
    key: '/appointment-management',
    icon: CalendarOutlined,
    labelKey: 'navigation.appointmentsManagement',
    allowedRoles: ['manager', 'teacher', 'counselor'],
    element: 'AppointmentManagement',
  },
  {
    key: '/survey-management',
    icon: FileTextOutlined,
    labelKey: 'navigation.surveyManagement',
    allowedRoles: ['manager', 'teacher', 'counselor'],
    element: 'SurveyManagement',
  },
  {
    key: '/program-management',
    icon: AppstoreOutlined,
    labelKey: 'navigation.programManagement',
    allowedRoles: ['manager', 'teacher', 'counselor'],
    element: 'ProgramManagement',
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
