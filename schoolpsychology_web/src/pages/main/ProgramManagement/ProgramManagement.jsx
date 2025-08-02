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
  Select,
  message,
  Row,
  Col,
  Typography,
  Space,
  DatePicker,
  Spin,
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from '@/store/actions/programActions'
import {
  updateFilters,
  updatePagination,
  updateSortConfig,
  resetFilters,
  clearError,
} from '@/store/slices/programSlice'
import { categoriesAPI } from '@/services/categoryApi'
import dayjs from 'dayjs'
import { useAuth } from '@/contexts/AuthContext'
import { accountAPI } from '@/services/accountApi'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

// Lazy load components
const ProgramTable = lazy(() => import('./ProgramTable'))
const ProgramModal = lazy(() => import('./ProgramModal'))

const ProgramManagement = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { programs, loading, error, pagination, filters, sortConfig } =
    useSelector(state => state.program)

  const [messageApi, contextHolder] = message.useMessage()

  // Local state
  const [searchText, setSearchText] = useState('')
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [isView, setIsView] = useState(false)
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [counselors, setCounselors] = useState([])

  const fetchCounselors = useCallback(async () => {
    const data = await accountAPI.getAccounts({ role: 'COUNSELOR' })
    setCounselors(data)
  }, [])

  // Fetch programs on component mount
  useEffect(() => {
    dispatch(getAllPrograms())
    fetchCategories()
    if (user.role === 'manager') {
      fetchCounselors()
    }
  }, [dispatch, user.role])

  // Handle error messages
  useEffect(() => {
    if (error) {
      messageApi.error(t('programManagement.messages.fetchError'))
      dispatch(clearError())
    }
  }, [error, t, messageApi, dispatch])

  // Fetch categories for filter
  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true)
      const response = await categoriesAPI.getCategories()
      setCategories(response || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }, [])

  // Filter and search programs
  const filteredPrograms = useMemo(() => {
    if (!programs || !Array.isArray(programs)) return []

    return programs.filter(program => {
      // Search text filter
      const matchesSearch =
        !searchText ||
        program?.name?.toLowerCase()?.includes(searchText.toLowerCase()) ||
        program?.description
          ?.toLowerCase()
          ?.includes(searchText.toLowerCase()) ||
        program?.category?.name
          ?.toLowerCase()
          ?.includes(searchText.toLowerCase())

      // Status filter
      const matchesStatus = filters.status
        ? program.status === filters.status
        : ['UPCOMING', 'ONGOING', 'COMPLETED'].includes(program.status)

      // Category filter
      const matchesCategory =
        !filters.category || program.category?.id === filters.category

      // Date range filter
      const matchesDateRange =
        !filters.dateRange ||
        (dayjs(program.startDate).isAfter(dayjs(filters.dateRange[0])) &&
          dayjs(program.endDate).isBefore(dayjs(filters.dateRange[1])))

      return (
        matchesSearch && matchesStatus && matchesCategory && matchesDateRange
      )
    })
  }, [programs, searchText, filters])

  // Sort programs
  const sortedPrograms = useMemo(() => {
    if (!filteredPrograms.length) return []

    const sorted = [...filteredPrograms].sort((a, b) => {
      const { field, direction } = sortConfig
      let aValue = a[field]
      let bValue = b[field]

      // Handle nested fields
      if (field.includes('.')) {
        const fields = field.split('.')
        aValue = fields.reduce((obj, key) => obj?.[key], a)
        bValue = fields.reduce((obj, key) => obj?.[key], b)
      }

      // Handle date fields
      if (['startDate', 'endDate', 'createdDate'].includes(field)) {
        aValue = dayjs(aValue)
        bValue = dayjs(bValue)
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1
      if (aValue > bValue) return direction === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [filteredPrograms, sortConfig])

  // Paginated programs
  const paginatedPrograms = useMemo(() => {
    const { current, pageSize } = pagination
    const startIndex = (current - 1) * pageSize
    const endIndex = startIndex + pageSize
    return sortedPrograms.slice(startIndex, endIndex)
  }, [sortedPrograms, pagination])

  // Handle search
  const handleSearch = useCallback(
    value => {
      setSearchText(value)
      dispatch(updatePagination({ current: 1 }))
    },
    [dispatch]
  )

  // Handle filter changes
  const handleFilterChange = useCallback(
    (filterType, value) => {
      dispatch(updateFilters({ [filterType]: value }))
    },
    [dispatch]
  )

  // Handle sort
  const handleSort = useCallback(
    sortConfig => {
      dispatch(updateSortConfig(sortConfig))
    },
    [dispatch]
  )

  // Handle pagination
  const handlePageChange = useCallback(
    paginationConfig => {
      dispatch(updatePagination(paginationConfig))
    },
    [dispatch]
  )

  // Handle refresh
  const handleRefresh = useCallback(() => {
    dispatch(getAllPrograms())
    if (user.role === 'manager') {
      fetchCounselors()
    }
    messageApi.success(t('common.refreshSuccess'))
  }, [dispatch, t, messageApi, user.role])

  // Handle reset filters
  const handleResetFilters = useCallback(() => {
    setSearchText('')
    dispatch(resetFilters())
    messageApi.success(t('common.filtersReset'))
  }, [dispatch, messageApi, t])

  // Handle create program
  const handleCreate = useCallback(() => {
    setSelectedProgram(null)
    setIsEdit(false)
    setIsView(false)
    setIsModalVisible(true)
  }, [])

  // Handle view program
  const handleView = useCallback(program => {
    setSelectedProgram(program)
    setIsEdit(false)
    setIsView(true)
    setIsModalVisible(true)
  }, [])

  // Handle edit program
  const handleEdit = useCallback(program => {
    setSelectedProgram(program)
    setIsEdit(true)
    setIsView(false)
    setIsModalVisible(true)
  }, [])

  // Handle delete program
  const handleDelete = useCallback(
    async programId => {
      try {
        await dispatch(deleteProgram(programId)).unwrap()
        messageApi.success(t('programManagement.messages.deleteSuccess'))
        dispatch(getAllPrograms()) // Refresh list
      } catch {
        messageApi.error(t('programManagement.messages.deleteError'))
      }
    },
    [dispatch, t, messageApi]
  )

  // Handle save program (create/update)
  const handleSave = useCallback(
    async programData => {
      try {
        if (isEdit) {
          await dispatch(
            updateProgram({
              programId: selectedProgram.id,
              programData,
            })
          ).unwrap()
          messageApi.success(t('programManagement.messages.updateSuccess'))
        } else {
          await dispatch(createProgram(programData)).unwrap()
          messageApi.success(t('programManagement.messages.createSuccess'))
        }
        setIsModalVisible(false)
        dispatch(getAllPrograms()) // Refresh list
      } catch {
        const errorMessage = isEdit
          ? t('programManagement.messages.updateError')
          : t('programManagement.messages.createError')
        messageApi.error(errorMessage)
      }
    },
    [dispatch, isEdit, selectedProgram, t, messageApi]
  )

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!programs?.length)
      return { total: 0, upcoming: 0, ongoing: 0, completed: 0 }

    return {
      total: programs.length,
      upcoming: programs.filter(p => p.status === 'UPCOMING').length,
      ongoing: programs.filter(p => p.status === 'ONGOING').length,
      completed: programs.filter(p => p.status === 'COMPLETED').length,
    }
  }, [programs])

  // Update pagination total when filtered data changes
  useEffect(() => {
    if (pagination.total !== sortedPrograms.length) {
      dispatch(updatePagination({ total: sortedPrograms.length }))
    }
  }, [sortedPrograms.length, pagination.total, dispatch])

  return (
    <div className="program-management">
      {contextHolder}

      {/* Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <Title level={2} className="mb-2">
            {t('programManagement.title')}
          </Title>
          <Text type="secondary" className="text-base">
            {t('programManagement.description')}
          </Text>
        </div>
        {/* Action Buttons */}
        <Space size="middle">
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
            size="middle"
          >
            {t('programManagement.refresh')}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="middle"
          >
            {t('programManagement.create')}
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {statistics.total}
            </div>
            <div className="text-gray-500">{t('common.total')}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-cyan-600">
              {statistics.upcoming}
            </div>
            <div className="text-gray-500">
              {t('programManagement.status.UPCOMING')}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {statistics.ongoing}
            </div>
            <div className="text-gray-500">
              {t('programManagement.status.ONGOING')}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {statistics.completed}
            </div>
            <div className="text-gray-500">
              {t('programManagement.status.COMPLETED')}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Controls */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          {/* Search */}
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder={t('programManagement.search')}
              allowClear
              size="middle"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onSearch={handleSearch}
            />
          </Col>

          <Col xs={24} sm={12} md={8}>
            <RangePicker
              value={filters.dateRange}
              onChange={dates => handleFilterChange('dateRange', dates)}
              format="DD/MM/YYYY"
              placeholder={[t('common.startDate'), t('common.endDate')]}
              className="flex-1"
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Space size="small" className="w-full">
              <Select
                placeholder={t('programManagement.filters.category')}
                allowClear
                value={filters.category}
                onChange={value => handleFilterChange('category', value)}
                loading={loadingCategories}
                className="w-full"
              >
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                title={t('programManagement.filters.reset')}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Suspense fallback={null}>
          <ProgramTable
            programs={paginatedPrograms}
            loading={loading}
            pagination={{
              ...pagination,
              total: sortedPrograms.length,
            }}
            onPageChange={handlePageChange}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </Suspense>
      </Card>

      {/* Program Modal */}
      <Suspense fallback={null}>
        <ProgramModal
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onOk={handleSave}
          selectedProgram={selectedProgram}
          isEdit={isEdit}
          isView={isView}
          categories={categories}
          counselors={counselors}
          message={messageApi}
        />
      </Suspense>
    </div>
  )
}

export default ProgramManagement
