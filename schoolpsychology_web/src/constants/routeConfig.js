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
        allowedRoles: ['manager', 'teacher'],
        element: 'ClientManagement',
      },
    ],
  },

  // Staff Management (Staff List, Slot Management) - Manager
  {
    key: 'account-management',
    icon: UserOutlined,
    labelKey: 'navigation.accountManagement.title',
    allowedRoles: ['manager'],
    children: [
      {
        key: 'account-staff',
        labelKey: 'navigation.staffManagement.title',
        children: [
          {
            key: '/staff/counselor',
            labelKey: 'navigation.staffManagement.counselorList',
            element: 'StaffManagement',
          },
          {
            key: '/staff/teacher',
            labelKey: 'navigation.staffManagement.teacherList',
            element: 'StaffManagement',
          },
          {
            key: '/staff/slot',
            labelKey: 'navigation.workSchedule',
            element: 'SlotManagement',
          },
        ],
      },
      {
        key: 'account-client',
        labelKey: 'navigation.clientManagement.title',
        children: [
          {
            key: '/client/student',
            labelKey: 'navigation.clientManagement.studentList',
            element: 'ClientManagement',
          },
          {
            key: '/client/parent',
            labelKey: 'navigation.clientManagement.parentList',
            element: 'ClientManagement',
          },
        ],
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
    allowedRoles: ['manager', 'counselor', 'teacher'],
    element: 'CaseManagement',
  },

  // System Config (System Config) - Manager
  {
    key: '/system-config',
    icon: SettingOutlined,
    labelKey: 'navigation.systemConfig',
    allowedRoles: ['manager'],
    element: 'SystemConfigManagement',
  },

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
