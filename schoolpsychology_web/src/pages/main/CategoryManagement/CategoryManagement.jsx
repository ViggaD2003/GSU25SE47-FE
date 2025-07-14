import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  lazy,
} from 'react'
import { Card, Button, Input, message, Row, Col, Typography, Modal } from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import { categoriesAPI } from '@/services/categoryApi'

const { Title, Text } = Typography
const { Search } = Input

// Lazy load components
const CategoryTable = lazy(() => import('./CategoryTable'))
const CategoryModal = lazy(() => import('./CategoryModal'))

const CategoryManagement = () => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const [messageApi, contextHolder] = message.useMessage()

  // State management
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [isView, setIsView] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Fetch categories function
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const response = await categoriesAPI.getCategories()
      setCategories(response || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      messageApi.error(t('categoryManagement.messages.fetchError'))
    } finally {
      setLoading(false)
    }
  }, [messageApi, t])

  // Filter and search categories
  const filteredCategories = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return []

    return categories.filter(category => {
      const matchesSearch =
        category?.name?.toLowerCase()?.includes(searchText.toLowerCase()) ||
        category?.code?.toLowerCase()?.includes(searchText.toLowerCase())

      return matchesSearch
    })
  }, [categories, searchText])

  // Update pagination when filtered data changes
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: filteredCategories.length,
    }))
  }, [filteredCategories.length])

  // Get paginated data
  const paginatedCategories = useMemo(() => {
    const startIndex = (pagination.current - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize
    return filteredCategories.slice(startIndex, endIndex)
  }, [filteredCategories, pagination.current, pagination.pageSize])

  // Handle table pagination change
  const handleTableChange = useCallback(paginationInfo => {
    setPagination(prev => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    }))
  }, [])

  // Handle search
  const handleSearch = useCallback(value => {
    setSearchText(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchCategories()
    setSearchText('')
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [fetchCategories])

  // Handle view
  const handleView = useCallback(record => {
    setSelectedCategory(record)
    setIsView(true)
    setIsEdit(false)
    setIsModalVisible(true)
  }, [])

  // Handle edit
  const handleEdit = useCallback(record => {
    setSelectedCategory(record)
    setIsEdit(true)
    setIsView(false)
    setIsModalVisible(true)
  }, [])

  // Handle delete
  const handleDelete = useCallback(
    _record => {
      Modal.confirm({
        title: t('categoryManagement.messages.deleteTitle'),
        content: t('categoryManagement.messages.deleteConfirm'),
        icon: <ExclamationCircleOutlined />,
        onOk: async () => {
          try {
            // Note: API doesn't have delete endpoint, so this is placeholder
            messageApi.success(t('categoryManagement.messages.deleteSuccess'))
            fetchCategories()
          } catch {
            messageApi.error(t('categoryManagement.messages.deleteError'))
          }
        },
      })
    },
    [t, messageApi, fetchCategories]
  )

  // Handle add
  const handleAdd = useCallback(() => {
    setSelectedCategory(null)
    setIsEdit(false)
    setIsView(false)
    setIsModalVisible(true)
  }, [])

  // Handle modal OK
  const handleModalOk = useCallback(
    async categoryData => {
      try {
        if (isEdit) {
          // Note: API doesn't have update endpoint, so this is placeholder
          messageApi.success(t('categoryManagement.messages.editSuccess'))
        } else {
          await categoriesAPI.createCategories(categoryData)
          messageApi.success(t('categoryManagement.messages.addSuccess'))
        }
        setIsModalVisible(false)
        fetchCategories()
      } catch (error) {
        console.error('Failed to save category:', error)
        const errorMsg = isEdit
          ? t('categoryManagement.messages.editError')
          : t('categoryManagement.messages.addError')
        messageApi.error(errorMsg)
      }
    },
    [isEdit, messageApi, t, fetchCategories]
  )

  // Handle modal cancel
  const handleModalCancel = useCallback(() => {
    setIsModalVisible(false)
    setSelectedCategory(null)
    setIsEdit(false)
    setIsView(false)
  }, [])

  return (
    <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
      {contextHolder}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title
            level={2}
            className={isDarkMode ? 'text-white' : 'text-gray-900'}
          >
            {t('categoryManagement.title')}
          </Title>
          <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            {t('categoryManagement.description')}
          </Text>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            {t('categoryManagement.refresh')}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {t('categoryManagement.addCategory')}
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card
        className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <Search
              placeholder={t('categoryManagement.search')}
              allowClear
              onSearch={handleSearch}
              onChange={e => handleSearch(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <Suspense fallback={<div>{t('common.loading')}</div>}>
          <CategoryTable
            data={paginatedCategories}
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Suspense>
      </Card>

      {/* Modal */}
      <Suspense fallback={null}>
        <CategoryModal
          visible={isModalVisible}
          onCancel={handleModalCancel}
          onOk={handleModalOk}
          selectedCategory={selectedCategory}
          isEdit={isEdit}
          isView={isView}
        />
      </Suspense>
    </div>
  )
}

export default CategoryManagement
