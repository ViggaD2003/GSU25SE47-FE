import React, { useState, useCallback, Suspense, lazy } from 'react'
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
import UserTable from './UserTable'

const { Title, Text } = Typography
const { Option } = Select
const { Search } = Input
const UserModal = lazy(() => import('./UserModal'))

const StaffManagement = () => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [messageApi, contextHolder] = message.useMessage()
  const [deletedUser, setDeletedUser] = useState(null)

  // Mock API fetch function for server-side pagination
  const fetchUsers = async (page, pageSize, searchText = '') => {
    await new Promise(res => setTimeout(res, 500))
    const total = 500
    const users = Array.from({ length: pageSize }, (_, i) => {
      const id = (page - 1) * pageSize + i + 1
      return {
        id,
        fullName: `Nguyen Van B ${id}`,
        email: `nguyenvanb${id}@school.edu.vn`,
        phone: `+84 123 456 ${800 + id}`,
        role: id % 2 === 0 ? 'teacher' : 'counselor',
        status: id % 3 === 0 ? 'inactive' : 'active',
        createDate: '15/01/2024',
        lastLogin: '25/05/2024',
      }
    }).filter(u => u.fullName.toLowerCase().includes(searchText.toLowerCase()))
    return { data: users, total }
  }

  const loadData = useCallback(
    async (page = 1, pageSize = 10, search = searchText) => {
      setLoading(true)
      const res = await fetchUsers(page, pageSize, search)
      setData(res.data)
      setPagination(p => ({ ...p, current: page, pageSize, total: res.total }))
      setLoading(false)
    },
    [searchText]
  )

  React.useEffect(() => {
    loadData(pagination.current, pagination.pageSize)
    // eslint-disable-next-line
  }, [searchText])

  const handleTableChange = useCallback(
    pag => {
      loadData(pag.current, pag.pageSize)
    },
    [loadData]
  )

  const handleSearch = value => {
    setSearchText(value)
    loadData(1, pagination.pageSize, value)
  }

  const handleView = record => {
    setSelectedUser(record)
    setIsEdit(false)
    setIsModalVisible(true)
  }

  const handleEdit = record => {
    setSelectedUser(record)
    setIsEdit(true)
    setIsModalVisible(true)
  }

  const handleDelete = record => {
    setDeletedUser(record)
    loadData(pagination.current, pagination.pageSize)
  }

  const handleAdd = () => {
    setSelectedUser(null)
    setIsEdit(false)
    setIsModalVisible(true)
  }

  const handleModalOk = () => {
    setIsModalVisible(false)
    messageApi.success(
      isEdit
        ? t('staffManagement.messages.editUserSuccess')
        : t('staffManagement.messages.addUserSuccess')
    )
    loadData(pagination.current, pagination.pageSize)
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
  }

  React.useEffect(() => {
    if (deletedUser) {
      messageApi.success(t('staffManagement.messages.inactiveSuccess'))
      setDeletedUser(null)
    }
  }, [deletedUser])

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
              onClick={() => loadData(pagination.current, pagination.pageSize)}
            >
              {t('staffManagement.refresh')}
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              {t('staffManagement.addStaff')}
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
                onSearch={handleSearch}
                onChange={e => handleSearch(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Users Table */}
        <Card
          className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}
        >
          <UserTable
            data={data}
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>

        <Suspense fallback={null}>
          {isModalVisible && (
            <UserModal
              visible={isModalVisible}
              onOk={handleModalOk}
              onCancel={handleModalCancel}
              editingUser={selectedUser}
              isEdit={isEdit}
              confirmLoading={false}
            />
          )}
        </Suspense>
      </div>
    </>
  )
}

export default StaffManagement
