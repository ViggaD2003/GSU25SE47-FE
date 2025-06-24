import sampleSurveys from './sampleSurveys.json'

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
export const SAMPLE_SURVEYS = sampleSurveys
