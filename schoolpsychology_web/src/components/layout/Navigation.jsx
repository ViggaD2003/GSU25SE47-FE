import React, { memo, useMemo, useCallback } from 'react'
import { Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUserRole } from '../../store/slices/authSlice'
import { useTranslation } from 'react-i18next'

import { ROUTE_CONFIG } from '@/constants/routeConfig'

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
    // Lấy menu phù hợp role
    const filterMenu = items =>
      items
        .filter(
          item => !item.allowedRoles || item.allowedRoles.includes(userRole)
        )
        .map(({ allowedRoles: _ar, labelKey, children, icon, ...item }) => ({
          ...item,
          icon: icon ? React.createElement(icon) : undefined,
          label: t(labelKey),
          children: children ? filterMenu(children) : undefined,
          onClick: item.key && !children ? handleNavigate(item.key) : undefined,
        }))

    return filterMenu(ROUTE_CONFIG)
  }, [userRole, t, handleNavigate])

  // Build visible menu keys for current role to support prefix matching
  const visibleMenuKeys = useMemo(() => {
    const collect = items =>
      items
        .filter(
          item => !item.allowedRoles || item.allowedRoles.includes(userRole)
        )
        .flatMap(item => {
          const childrenKeys = item.children ? collect(item.children) : []
          const selfKeys = item.labelKey && !item.hidden ? [item.key] : []
          return [...selfKeys, ...childrenKeys]
        })
    return collect(ROUTE_CONFIG)
  }, [userRole])

  // Select the longest matching visible key that prefixes the current path
  const selectedKeys = useMemo(() => {
    const match = visibleMenuKeys
      .filter(key => typeof key === 'string')
      .sort((a, b) => b.length - a.length)
      .find(key => location.pathname.startsWith(key))
    return match ? [match] : []
  }, [location.pathname, visibleMenuKeys])

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
