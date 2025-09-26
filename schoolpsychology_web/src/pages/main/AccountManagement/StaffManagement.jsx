import React, { useState, useCallback, useMemo, Suspense, lazy } from 'react'
import {
  Card,
  Button,
  Input,
  Select,
  message,
  Row,
  Col,
  Typography,
} from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useTheme } from '../../../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import { accountAPI } from '@/services/accountApi'
import AccountTable from './AccountTable'

const { Title, Text } = Typography
const { Search } = Input
const UserModal = lazy(() => import('./UserModal'))

const StaffManagement = () => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isView, setIsView] = useState(false)
  const [data, setData] = useState([])
  const [messageApi, contextHolder] = message.useMessage()

  // Optimized search function with debouncing
  const searchData = useMemo(() => {
    return data.filter(user => {
      const fullName = user.fullName?.toLowerCase() || ''
      const email = user.email?.toLowerCase() || ''
      const phoneNumber = user.phoneNumber?.toLowerCase() || ''

      return (
        fullName.includes(searchText.toLowerCase()) ||
        email.includes(searchText.toLowerCase()) ||
        phoneNumber.includes(searchText.toLowerCase())
      )
    })
  }, [data, searchText])

  // Optimized API fetch function with caching and error handling
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch all roles in parallel with error handling
      const data = await accountAPI.getAllAccounts()

      setData(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)

      // More specific error messages
      const errorMessage =
        error.response?.status === 403
          ? t('staffManagement.messages.accessDenied')
          : error.response?.status >= 500
            ? t('staffManagement.messages.serverError')
            : t('staffManagement.messages.fetchError')

      messageApi.error(errorMessage)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [messageApi, t])

  // Refresh data function (used by refresh button)
  const refreshData = useCallback(async () => {
    await fetchUsers()
  }, [fetchUsers])

  const handleView = record => {
    setSelectedUser(record)
    setIsView(true)
    setIsModalVisible(true)
  }

  const handleDelete = () => {
    console.log('handleDelete')
    refreshData()
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      await accountAPI.updateAccountStatus(id, status)
      messageApi.success(t('staffManagement.messages.statusUpdateSuccess'))
      refreshData()
    } catch (error) {
      console.error('Error updating status:', error)
      messageApi.error(t('staffManagement.messages.statusUpdateError'))
    }
  }

  const handleAdd = () => {
    setSelectedUser(null)
    setIsView(false)
    setIsModalVisible(true)
  }

  const handleModalOk = async (data, isEdit) => {
    try {
      if (isEdit) {
        await accountAPI.updateAccount(selectedUser.id, data)
      } else {
        await accountAPI.createAccount(data)
      }

      messageApi.success(
        isEdit
          ? t('staffManagement.messages.editUserSuccess')
          : t('staffManagement.messages.addUserSuccess')
      )

      // Close modal and refresh data
      setIsModalVisible(false)
      setIsView(false)
      setSelectedUser(null)
      await refreshData()
    } catch (error) {
      console.error('Error in handleModalOk:', error)
      messageApi.error(
        isEdit
          ? t('staffManagement.messages.editError')
          : t('staffManagement.messages.addError')
      )
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    setIsView(false)
    setSelectedUser(null)
  }

  const updateAccounts = async (userId, data) => {
    setData(prevData =>
      prevData.find(user => user.id === userId)
        ? prevData.map(user =>
            user.id === userId ? { ...user, ...data } : user
          )
        : prevData
    )
    setSelectedUser(prevUser =>
      prevUser?.id === userId ? { ...prevUser, ...data } : prevUser
    )
  }

  React.useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {contextHolder}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Title
              level={2}
              className={isDarkMode ? 'text-white' : 'text-gray-900'}
            >
              {t('staffManagement.title')}
            </Title>
            <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {t('staffManagement.description')}
            </Text>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              icon={<ReloadOutlined />}
              onClick={refreshData}
              loading={loading}
            >
              {t('staffManagement.refresh')}
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              {t('staffManagement.addAccount')}
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card
          className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} lg={8}>
              <Search
                placeholder={t('staffManagement.search')}
                allowClear
                onChange={e => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Users Table */}
        <Card
          className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}
        >
          <AccountTable
            students={data.filter(user => user.roleName === 'STUDENT')}
            data={searchData}
            loading={loading}
            onView={handleView}
            onDelete={() => handleDelete()}
            onUpdateStatus={handleUpdateStatus}
          />
        </Card>

        <Suspense fallback={null}>
          {isModalVisible && (
            <UserModal
              visible={isModalVisible}
              onOk={handleModalOk}
              onCancel={handleModalCancel}
              editingUser={selectedUser}
              isView={isView}
              confirmLoading={false}
              students={data.filter(user => user.roleName === 'STUDENT')}
              updateAccounts={updateAccounts}
            />
          )}
        </Suspense>
      </div>
    </>
  )
}

export default StaffManagement
