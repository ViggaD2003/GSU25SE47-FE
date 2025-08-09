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
  Modal,
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '@/contexts/ThemeContext'
import {
  getAllClasses,
  createClass,
  // updateClass,
  // deleteClass,
} from '@/store/actions/classActions'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select

// Lazy load components
const ClassTable = lazy(() => import('./ClassTable'))
const ClassModal = lazy(() => import('./ClassModal'))
const CreateClassModal = lazy(() => import('./CreateClassModal'))

const ClassManagement = () => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const dispatch = useDispatch()
  const { classes, loading, error } = useSelector(state => state.class)
  const [messageApi, contextHolder] = message.useMessage()

  // State management
  const [searchText, setSearchText] = useState('')
  const [selectedClass, setSelectedClass] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [isView, setIsView] = useState(false)
  const [filters, setFilters] = useState({
    teacher: undefined,
  })
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // Fetch classes on component mount
  useEffect(() => {
    dispatch(getAllClasses())
  }, [dispatch])

  // Handle error messages
  useEffect(() => {
    if (error) {
      console.error('Error fetching classes:', error)
    }
  }, [error])

  // Filter and search classes
  const filteredClasses = useMemo(() => {
    if (!classes || !Array.isArray(classes)) return []

    return classes.filter(classItem => {
      const matchesSearch =
        classItem?.codeClass
          ?.toLowerCase()
          ?.includes(searchText.toLowerCase()) ||
        classItem?.teacher?.fullName
          ?.toLowerCase()
          ?.includes(searchText.toLowerCase()) ||
        classItem?.teacher?.teacherCode
          ?.toLowerCase()
          ?.includes(searchText.toLowerCase())

      const matchesTeacher =
        !filters.teacher ||
        classItem?.teacher?.fullName
          ?.toLowerCase()
          ?.includes(filters.teacher.toLowerCase())

      return matchesSearch && matchesTeacher
    })
  }, [classes, searchText, filters])

  // Update pagination when filtered data changes
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: filteredClasses.length,
    }))
  }, [filteredClasses.length])

  // Get paginated data
  const paginatedClasses = useMemo(() => {
    const startIndex = (pagination.current - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize
    return filteredClasses.slice(startIndex, endIndex)
  }, [filteredClasses, pagination.current, pagination.pageSize])

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

  // Handle filters change
  const handleFiltersChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }))
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    dispatch(getAllClasses())
    setSearchText('')
    setFilters({
      classYear: undefined,
      teacher: undefined,
    })
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [dispatch])

  // Handle view
  const handleView = useCallback(record => {
    setSelectedClass(record)
    setIsView(true)
    setIsEdit(false)
    setIsModalVisible(true)
  }, [])

  // Handle edit
  // const handleEdit = useCallback(record => {
  //   setSelectedClass(record)
  //   setIsEdit(true)
  //   setIsView(false)
  //   setIsModalVisible(true)
  // }, [])

  // Handle delete
  // const handleDelete = useCallback(
  //   record => {
  //     Modal.confirm({
  //       title: t('classManagement.messages.deleteTitle'),
  //       content: t('classManagement.messages.deleteConfirm'),
  //       icon: <ExclamationCircleOutlined />,
  //       onOk: async () => {
  //         try {
  //           await dispatch(deleteClass(record.codeClass))
  //           messageApi.success(t('classManagement.messages.deleteSuccess'))
  //           dispatch(getAllClasses())
  //         } catch {
  //           messageApi.error(t('classManagement.messages.deleteError'))
  //         }
  //       },
  //     })
  //   },
  //   [dispatch, t, messageApi]
  // )

  // Handle create multiple classes
  const handleCreateMultiple = useCallback(() => {
    setIsCreateModalVisible(true)
  }, [])

  // Handle modal OK
  const handleModalOk = useCallback(
    async classData => {
      try {
        if (isEdit) {
          // await dispatch(updateClass(selectedClass.codeClass, classData))
          messageApi.success(t('classManagement.messages.editSuccess'))
        } else {
          await dispatch(createClass(classData)).unwrap()
          messageApi.success(t('classManagement.messages.addSuccess'))
        }
        setIsModalVisible(false)
        setIsCreateModalVisible(false) // Close create modal too
        // Don't need to call getAllClasses() since Redux already updated the state
        // message.success(t('classManagement.messages.addSuccess'))
      } catch (error) {
        console.error('Failed to create/update class:', error)
        messageApi.error(t('classManagement.messages.createError'))
        throw error
      }
    },
    [dispatch, isEdit, selectedClass, t, messageApi]
  )

  // Handle modal cancel
  const handleModalCancel = useCallback(() => {
    setIsModalVisible(false)
    setSelectedClass(null)
    setIsEdit(false)
    setIsView(false)
  }, [])

  // Handle create modal cancel
  const handleCreateModalCancel = useCallback(() => {
    setIsCreateModalVisible(false)
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
              {t('classManagement.title')}
            </Title>
            <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {t('classManagement.description')}
            </Text>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              {t('classManagement.refresh')}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateMultiple}
            >
              {t('classManagement.createMultipleClasses')}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card
          className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} lg={8}>
              <Search
                placeholder={t('classManagement.search')}
                allowClear
                onSearch={handleSearch}
                onChange={e => handleSearch(e.target.value)}
                style={{ width: '100%' }}
                prefix={<SearchOutlined />}
              />
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Input
                placeholder={t('classManagement.filters.teacher')}
                allowClear
                value={filters.teacher}
                onChange={e => handleFiltersChange('teacher', e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
          </Row>
        </Card>

        {/* Classes Table */}
        <Card
          className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}
        >
          <Suspense
            fallback={
              <div className="text-center py-8">{t('common.loading')}</div>
            }
          >
            <ClassTable
              data={paginatedClasses}
              loading={loading}
              pagination={pagination}
              onChange={handleTableChange}
              onView={handleView}
              // onEdit={handleEdit}
              // onDelete={handleDelete}
            />
          </Suspense>
        </Card>

        {/* Class Modal */}
        <Suspense fallback={null}>
          {isModalVisible && (
            <ClassModal
              visible={isModalVisible}
              onCancel={handleModalCancel}
              onOk={handleModalOk}
              selectedClass={selectedClass}
              isEdit={isEdit}
              isView={isView}
            />
          )}
        </Suspense>

        {/* Create Class Modal */}
        <Suspense fallback={null}>
          {isCreateModalVisible && (
            <CreateClassModal
              visible={isCreateModalVisible}
              onCancel={handleCreateModalCancel}
              onOk={handleModalOk}
            />
          )}
        </Suspense>
      </div>
    </>
  )
}

export default ClassManagement
