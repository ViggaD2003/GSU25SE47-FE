import React, { memo, useMemo, useCallback } from 'react'
import { Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUserRole } from '../../store/slices/authSlice'
import { useTranslation } from 'react-i18next'
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
} from '@ant-design/icons'

const Navigation = memo(({ collapsed }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const userRole = useSelector(selectUserRole)
  const { t } = useTranslation()

  const handleNavigate = useCallback(
    path => {
      return () => navigate(path)
    },
    [navigate]
  )

  // Memoize menu items based on user role to prevent recreation on every render
  const menuItems = useMemo(() => {
    const baseItems = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: t('navigation.dashboard'),
        onClick: handleNavigate('/dashboard'),
        allowedRoles: ['manager', 'teacher', 'counselor'],
      },
      {
        key: '/client-management',
        icon: <UserOutlined />,
        label: t('navigation.accountManagement.title'),
        // onClick: handleNavigate('/client-management'),
        children: [
          {
            key: '/client-management',
            label: t('navigation.accountManagement.clients'),
            onClick: handleNavigate('/client-management'),
          },
          {
            key: '/staff-management',
            label: t('navigation.accountManagement.staffs'),
            onClick: handleNavigate('/staff-management'),
          },
        ],
        allowedRoles: ['manager'],
      },
    ]

    // Filter base items by user role
    const filteredBaseItems = baseItems.filter(
      item => !item.allowedRoles || item.allowedRoles.includes(userRole)
    )

    // Clean up allowedRoles property from final items
    return [...filteredBaseItems].map(
      ({ allowedRoles: _allowedRoles, ...item }) => item
    )
  }, [userRole, t, handleNavigate])

  const selectedKeys = useMemo(() => [location.pathname], [location.pathname])

  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKeys}
      items={menuItems}
      className="border-0 bg-transparent h-full theme-transition"
      inlineCollapsed={collapsed}
    />
  )
})

Navigation.displayName = 'Navigation'

export default Navigation
