import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  lazy,
} from 'react'
import {
  Card,
  Button,
  Input,
  message,
  Row,
  Col,
  Typography,
  Modal,
  Select,
  Space,
  Tag,
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  ClearOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import { categoriesAPI } from '@/services/categoryApi'
import { CATEGORY_STATUS } from '@/constants/enums'

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
  const [statusFilter, setStatusFilter] = useState(undefined)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [isView, setIsView] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

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
  }, [])

  // Fetch categories on component mount
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories()
    }
  }, [categories.length])

  // Filter and search categories
  const filteredCategories = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return []

    return categories.filter(category => {
      const matchesSearch =
        category?.name?.toLowerCase()?.includes(searchText.toLowerCase()) ||
        category?.code?.toLowerCase()?.includes(searchText.toLowerCase())

      const matchesStatus =
        statusFilter === undefined || category?.isActive === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [categories, searchText, statusFilter])

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

  // Handle status filter change
  const handleStatusFilterChange = useCallback(value => {
    setStatusFilter(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [])

  // Clear all filters handler
  const handleClearFilters = () => {
    setSearchText('')
    setStatusFilter(undefined)

    setPagination(prev => ({ ...prev, current: 1 }))
  }

  // Check if any filters are active
  const hasActiveFilters = useMemo(
    () => searchText.trim() || statusFilter !== undefined,
    [searchText, statusFilter]
  )

  // Handle refresh
  const handleRefresh = async () => {
    await fetchCategories()
    handleClearFilters()
  }

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

  //Handle toggle status
  const handleToggleStatus = useCallback(
    async (recordId, newStatus) => {
      try {
        await categoriesAPI.updateStatus(recordId, newStatus)
        messageApi.success(t('categoryManagement.messages.statusUpdateSuccess'))
        fetchCategories()
      } catch (error) {
        console.error('Failed to update category status:', error)
        messageApi.error(t('categoryManagement.messages.statusUpdateError'))
      }
    },
    [messageApi, t, fetchCategories]
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
    async (categoryId, categoryData) => {
      try {
        if (isEdit) {
          console.log('categoryId', categoryId)
          // Note: API doesn't have update endpoint, so this is placeholder
          await categoriesAPI.updateCategories(categoryId, categoryData)
          messageApi.success(t('categoryManagement.messages.editSuccess'))
        } else {
          await categoriesAPI.createCategories(categoryData)
          messageApi.success(t('categoryManagement.messages.addSuccess'))
        }
        setIsModalVisible(false)
        fetchCategories()
      } catch {
        throw new Error('Failed to save category')
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
    <div className="p-6">
      {contextHolder}

      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <Title
            level={2}
            className={isDarkMode ? 'text-white' : 'text-gray-900'}
          >
            {t('categoryManagement.title')}
          </Title>
          <Text
            type="secondary"
            className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
          >
            {t('categoryManagement.description')}
          </Text>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            icon={<ReloadOutlined />}
            onClick={() => handleRefresh()}
            loading={loading}
          >
            {t('categoryManagement.refresh')}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {t('categoryManagement.addCategory')}
          </Button>
        </div>
      </div>

      {/* Enhanced Filter Card */}
      <Card
        className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}
        style={{ marginBottom: 16 }}
        title={
          <Space>
            <FilterOutlined />
            <span>Filters & Search</span>
            {hasActiveFilters && (
              <Tag color="blue">
                {filteredCategories.length} of {categories?.length || 0}{' '}
                categories
              </Tag>
            )}
          </Space>
        }
        extra={
          hasActiveFilters && (
            <Button
              type="text"
              icon={<ClearOutlined />}
              onClick={handleClearFilters}
              size="small"
            >
              Clear All
            </Button>
          )
        }
      >
        <Row gutter={[16, 16]} align="middle">
          {/* Text Search - Search in name, code */}
          <Col xs={24} sm={12} md={8} lg={8}>
            <div>
              <Text strong>{t('categoryManagement.search')}</Text>
              <Text
                type="secondary"
                style={{ display: 'block', fontSize: '12px' }}
              >
                {t('categoryManagement.searchDescription')}
              </Text>
            </div>
            <Search
              placeholder={t('categoryManagement.search')}
              allowClear
              size="middle"
              onSearch={handleSearch}
              onChange={e => handleSearch(e.target.value)}
              value={searchText}
              style={{ marginTop: 4 }}
            />
          </Col>

          {/* Status Filter - Filter by status */}
          <Col xs={24} sm={12} md={8} lg={8}>
            <div>
              <Text strong>{t('categoryManagement.status')}</Text>
              <Text
                type="secondary"
                style={{ display: 'block', fontSize: '12px' }}
              >
                {t('categoryManagement.statusDescription')}
              </Text>
            </div>
            <Select
              placeholder={t('categoryManagement.selectStatus')}
              size="middle"
              allowClear
              value={statusFilter}
              onChange={handleStatusFilterChange}
              options={[
                {
                  label: t('categoryManagement.table.active'),
                  value: CATEGORY_STATUS.ACTIVE,
                },
                {
                  label: t('categoryManagement.table.inactive'),
                  value: CATEGORY_STATUS.INACTIVE,
                },
              ]}
              style={{ marginTop: 4, width: '100%' }}
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
            onToggleStatus={handleToggleStatus}
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
          message={messageApi}
        />
      </Suspense>
    </div>
  )
}

export default CategoryManagement
