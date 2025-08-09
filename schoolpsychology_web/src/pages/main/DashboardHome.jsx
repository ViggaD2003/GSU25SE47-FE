import React from 'react'
import { useSelector } from 'react-redux'
import { selectUserRole } from '@/store/slices/authSlice'

const DashboardTeacher = React.lazy(() => import('./DashboardTeacher'))
const DashboardCounselor = React.lazy(() => import('./DashboardCounselor'))
const DashboardManager = React.lazy(() => import('./DashboardManager'))

const DashboardHome = () => {
  const role = useSelector(selectUserRole)

  if (role === 'teacher') return <DashboardTeacher />
  if (role === 'counselor') return <DashboardCounselor />
  if (role === 'manager') return <DashboardManager />

  return null
}

export default DashboardHome


