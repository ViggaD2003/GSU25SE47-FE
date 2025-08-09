import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { systemConfig as systemConfigApi } from '@/services/systemConfigApi'
import { useAuth } from './AuthContext'

const SystemConfigContext = createContext(null)

export const useSystemConfig = () => {
  const ctx = useContext(SystemConfigContext)
  if (!ctx)
    throw new Error(
      'useSystemConfig must be used within a SystemConfigProvider'
    )
  return ctx
}

export const SystemConfigProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()

  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSystemConfigs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await systemConfigApi.getSystemConfig()
      const data = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : []
      setConfigs(data)
      return { success: true, data }
    } catch (err) {
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSystemConfigs = useCallback(
    async updatedPayload => {
      // Normalize payload to array
      const items = Array.isArray(updatedPayload)
        ? updatedPayload
        : [updatedPayload]

      // Server returns values as strings; send values as strings by type unless backend accepts native types
      const normalized = items.map(item => {
        const type = (item?.valueType || '').toLowerCase()
        let value = item?.configValue

        if (type === 'boolean')
          value =
            value === true || value === 'true' || value === 1 || value === '1'
              ? 'true'
              : 'false'
        else if (type === 'integer' || type === 'long' || type === 'number')
          value = String(Number(value))
        else if (type === 'json') {
          try {
            value = typeof value === 'string' ? value : JSON.stringify(value)
          } catch {
            value = String(value ?? '')
          }
        } else {
          value = String(value ?? '')
        }

        return { ...item, configValue: value }
      })

      const res = await systemConfigApi.updateSystemConfig(normalized)
      await fetchSystemConfigs()
      return res
    },
    [fetchSystemConfigs]
  )

  const getValue = useCallback(
    key => {
      const found = configs.find(c => c?.configKey === key)
      return found?.configValue ?? null
    },
    [configs]
  )

  const getTypedValue = useCallback(
    (key, defaultValue = null) => {
      const found = configs.find(c => c?.configKey === key)
      if (!found) return defaultValue
      const { valueType, configValue } = found
      const type = (valueType || '').toLowerCase()

      try {
        if (type === 'boolean')
          return (
            configValue === true ||
            configValue === 'true' ||
            configValue === 1 ||
            configValue === '1'
          )
        if (type === 'integer' || type === 'long' || type === 'number')
          return Number(configValue)
        if (type === 'json')
          return typeof configValue === 'string'
            ? JSON.parse(configValue)
            : configValue
        return configValue
      } catch {
        return defaultValue
      }
    },
    [configs]
  )

  // Auto-fetch after successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchSystemConfigs()
    }
  }, [isAuthenticated, fetchSystemConfigs])

  const value = useMemo(
    () => ({
      configs,
      loading,
      error,
      fetchSystemConfigs,
      updateSystemConfigs,
      getValue,
      getTypedValue,
    }),
    [
      configs,
      loading,
      error,
      fetchSystemConfigs,
      updateSystemConfigs,
      getValue,
      getTypedValue,
    ]
  )

  return (
    <SystemConfigContext.Provider value={value}>
      {children}
    </SystemConfigContext.Provider>
  )
}
