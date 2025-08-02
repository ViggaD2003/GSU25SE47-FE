// Survey Enums
export const SURVEY_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
}

export const SURVEY_TYPE = {
  SCREENING: 'SCREENING',
  PROGRAM: 'PROGRAM',
  FOLLOWUP: 'FOLLOWUP',
}

export const TARGET_SCOPE = {
  ALL: 'ALL',
  GRADE: 'GRADE',
  NONE: 'NONE',
}

export const GRADE_LEVEL = {
  GRADE_10: 'GRADE_10',
  GRADE_11: 'GRADE_11',
  GRADE_12: 'GRADE_12',
}

export const RECURRING_CYCLE = {
  NONE: 'NONE',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
}

export const QUESTION_TYPE = {
  LINKERT_SCALE: 'LINKERT_SCALE',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  SINGLE_CHOICE: 'SINGLE_CHOICE',
  TEXT: 'TEXT',
}

export const SURVEY_TYPE_PERMISSIONS = {
  manager: ['SCREENING', 'PROGRAM'],
  counselor: ['FOLLOWUP'],
}

// Appointment Enums
export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ABSENT: 'ABSENT',
  CANCELED: 'CANCELED',
  EXPIRED: 'EXPIRED',
}

export const APPOINTMENT_TYPE = {
  INDIVIDUAL: 'INDIVIDUAL',
  GROUP: 'GROUP',
}

export const APPOINTMENT_FORMALITY = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
}

export const HOST_TYPE = {
  TEACHER: 'TEACHER',
  COUNSELOR: 'COUNSELOR',
  STUDENT: 'STUDENT',
}

// Session Flow Enums
export const SESSION_FLOW = {
  GOOD: 'GOOD',
  AVERAGE: 'AVERAGE',
  POOR: 'POOR',
  UNKNOWN: 'UNKNOWN',
}

// Student Cooperation Level Enums
export const STUDENT_COOP_LEVEL = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  UNKNOWN: 'UNKNOWN',
}

// Support Program Enums
export const PROGRAM_STATUS = {
  UPCOMING: 'UPCOMING',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
}

export const PROGRAM_TYPE = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
}

// User Role Enums
export const USER_ROLE = {
  STUDENT: 'STUDENT',
  GUARDIAN: 'GUARDIAN',
  TEACHER: 'TEACHER',
  COUNSELOR: 'COUNSELOR',
}

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
}

// Category Enums
export const CATEGORY_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
}

// Color mappings for UI
export const STATUS_COLORS = {
  // Survey status colors
  [SURVEY_STATUS.PUBLISHED]: 'green',
  [SURVEY_STATUS.DRAFT]: 'orange',
  [SURVEY_STATUS.ARCHIVED]: 'red',

  // Recurring cycle colors
  [RECURRING_CYCLE.NONE]: 'default',
  [RECURRING_CYCLE.WEEKLY]: 'blue',
  [RECURRING_CYCLE.MONTHLY]: 'green',

  // Survey type colors
  [SURVEY_TYPE.SCREENING]: 'blue',
  [SURVEY_TYPE.PROGRAM]: 'purple',
  [SURVEY_TYPE.FOLLOWUP]: 'red',

  // Target scope colors
  [TARGET_SCOPE.ALL]: 'purple',
  [TARGET_SCOPE.GRADE]: 'purple',
  [TARGET_SCOPE.NONE]: 'default',

  // Grade colors
  [GRADE_LEVEL.GRADE_10]: 'green',
  [GRADE_LEVEL.GRADE_11]: 'green',
  [GRADE_LEVEL.GRADE_12]: 'green',

  // Appointment status colors
  [APPOINTMENT_STATUS.PENDING]: 'orange',
  [APPOINTMENT_STATUS.CONFIRMED]: 'blue',
  [APPOINTMENT_STATUS.IN_PROGRESS]: 'purple',
  [APPOINTMENT_STATUS.COMPLETED]: 'green',
  [APPOINTMENT_STATUS.ABSENT]: 'red',
  [APPOINTMENT_STATUS.CANCELED]: 'red',
  [APPOINTMENT_STATUS.EXPIRED]: 'gray',

  // Session flow colors
  [SESSION_FLOW.GOOD]: 'green',
  [SESSION_FLOW.AVERAGE]: 'orange',
  [SESSION_FLOW.POOR]: 'red',
  [SESSION_FLOW.UNKNOWN]: 'gray',

  // Student cooperation level colors
  [STUDENT_COOP_LEVEL.HIGH]: 'green',
  [STUDENT_COOP_LEVEL.MEDIUM]: 'orange',
  [STUDENT_COOP_LEVEL.LOW]: 'red',
  [STUDENT_COOP_LEVEL.UNKNOWN]: 'gray',

  // Program status colors
  [PROGRAM_STATUS.UPCOMING]: 'blue',
  [PROGRAM_STATUS.ONGOING]: 'green',
  [PROGRAM_STATUS.COMPLETED]: 'default',
  [PROGRAM_STATUS.CANCELLED]: 'red',
}

// Helper functions
export const getStatusColor = status => STATUS_COLORS[status] || 'default'

export const formatGradeDisplay = grade => {
  if (!grade) return ''
  return grade.replace('GRADE_', 'Grade ')
}

export const formatEnumDisplay = value => {
  if (!value) return ''
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase())
}

export const getSurveyTypePermissions = userRole => {
  return SURVEY_TYPE_PERMISSIONS[userRole]
}
