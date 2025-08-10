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
  Table,
  Space,
  Divider,
  Tag,
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import {
  getAllClasses,
  createClass,
  // updateClass,
  // deleteClass,
} from '@/store/actions/classActions'
import { enrollClass } from '@/store/actions/classActions'
import { classAPI } from '@/services/classApi'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select

// Lazy load components
const ClassTable = lazy(() => import('./ClassTable'))
const ClassModal = lazy(() => import('./ClassModal'))
const CreateClassModal = lazy(() => import('./CreateClassModal'))

const EnrollStudentsModal = ({
  open,
  onCancel,
  onSubmit,
  classItem,
  isDarkMode,
  t,
}) => {
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterValues, setFilterValues] = useState({
    grade: undefined,
    schoolYear: undefined,
    classCode: undefined,
  })

  // Memoize filter values để tránh re-render không cần thiết
  const activeFilters = useMemo(() => {
    return Object.values(filterValues).some(
      value => value !== undefined && value !== ''
    )
  }, [filterValues])

  // Memoize fetch function để tránh tạo mới mỗi lần render
  const fetchStudents = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      const data = await classAPI.getStudentWithInactiveClass(params)
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : []
      setStudents(list)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch students khi modal mở
  useEffect(() => {
    if (open) {
      fetchStudents()
    }
  }, [open, fetchStudents])

  // Reset state khi modal đóng
  useEffect(() => {
    if (!open) {
      setSelectedIds([])
      setQuery('')
      setShowFilters(false)
      setFilterValues({
        grade: undefined,
        schoolYear: undefined,
        classCode: undefined,
      })
    }
  }, [open])

  // Memoize filtered students
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return students
    return students.filter(s =>
      [s.fullName, s.email, s.phoneNumber, s.studentCode]
        .filter(Boolean)
        .some(x => String(x).toLowerCase().includes(q))
    )
  }, [students, query])

  // Memoize filter change handler
  const handleFilterChange = useCallback((key, value) => {
    setFilterValues(prev => ({ ...prev, [key]: value }))
  }, [])

  // Memoize get students handler
  const handleGetStudents = useCallback(() => {
    setShowFilters(false)
    setFilterValues({
      grade: undefined,
      schoolYear: undefined,
      classCode: undefined,
    })
    fetchStudents()
  }, [fetchStudents])

  // Memoize apply filters handler
  const handleApplyFilters = useCallback(() => {
    if (activeFilters) {
      const params = Object.fromEntries(
        Object.entries(filterValues).filter(
          ([_, value]) => value !== undefined && value !== ''
        )
      )
      fetchStudents(params)
    }
  }, [activeFilters, filterValues, fetchStudents])

  // Memoize reset filters handler
  const resetFilters = useCallback(() => {
    setFilterValues({
      grade: undefined,
      schoolYear: undefined,
      classCode: undefined,
    })
  }, [])

  // Memoize toggle filters handler
  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev)
  }, [])

  // Memoize hide filters handler
  const hideFilters = useCallback(() => {
    setShowFilters(false)
  }, [])

  // Memoize search handler
  const handleSearch = useCallback(value => {
    setQuery(value)
  }, [])

  // Memoize selection change handler
  const handleSelectionChange = useCallback(keys => {
    setSelectedIds(keys)
  }, [])

  // Memoize submit handler
  const handleSubmit = useCallback(() => {
    onSubmit(selectedIds)
  }, [onSubmit, selectedIds])

  // Memoize cancel handler
  const handleCancel = useCallback(() => {
    onCancel()
  }, [onCancel])

  // Memoize table columns để tránh re-render
  const columns = useMemo(
    () => [
      {
        title: t('userTable.fullName'),
        dataIndex: 'fullName',
        key: 'fullName',
        ellipsis: true,
      },
      {
        title: t('userTable.email'),
        dataIndex: 'email',
        key: 'email',
        ellipsis: true,
      },
      {
        title: t('userTable.phone'),
        dataIndex: 'phoneNumber',
        key: 'phoneNumber',
        ellipsis: true,
      },
      {
        title: t('userTable.studentCode'),
        dataIndex: 'studentCode',
        key: 'studentCode',
        width: 120,
      },
      {
        title: t('userTable.gender'),
        dataIndex: 'gender',
        key: 'gender',
        width: 100,
        render: v => (
          <Tag color={v ? 'blue' : 'pink'}>
            {v ? t('common.male') : t('common.female')}
          </Tag>
        ),
      },
    ],
    [t]
  )

  // Memoize pagination config
  const paginationConfig = useMemo(
    () => ({
      pageSize: 8,
      showSizeChanger: false,
      showTotal: (total, range) =>
        t('common.pagination.showing', {
          showing: range[0],
          of: range[1],
          items: total,
        }),
      size: 'small',
    }),
    [t]
  )

  // Memoize row selection config
  const rowSelectionConfig = useMemo(
    () => ({
      selectedRowKeys: selectedIds,
      onChange: handleSelectionChange,
    }),
    [selectedIds, handleSelectionChange]
  )

  return (
    <Modal
      title={
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          {t('classManagement.enrollModal.title', {
            code: classItem?.codeClass,
          })}
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={1300}
      className={isDarkMode ? 'dark-modal' : ''}
      centered
      styles={{
        body: { maxHeight: '85vh' },
      }}
    >
      <Row gutter={24}>
        {/* Left Side - Class Information */}
        <Col span={8}>
          <Card
            title={
              <Space>
                <BookOutlined style={{ color: '#1890ff' }} />
                <Text strong>{t('classManagement.form.classDetails')}</Text>
              </Space>
            }
            size="small"
            className="mb-4"
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text type="secondary" className="text-sm">
                  {t('classManagement.table.codeClass')}
                </Text>
                <div>
                  <Text strong className="text-base">
                    {classItem?.codeClass || '-'}
                  </Text>
                </div>
              </div>
              <div>
                <Text type="secondary" className="text-sm">
                  {t('classManagement.form.grade')}
                </Text>
                <div>
                  <Text strong className="text-base">
                    {classItem?.grade ?? '-'}
                  </Text>
                </div>
              </div>
              <div>
                <Text type="secondary" className="text-sm">
                  {t('classManagement.form.schoolYear')}
                </Text>
                <div>
                  <Text strong className="text-base">
                    {classItem?.schoolYear || '-'}
                  </Text>
                </div>
              </div>
              <div>
                <Text type="secondary" className="text-sm">
                  {t('classManagement.form.teacherName')}
                </Text>
                <div>
                  <Text strong className="text-base">
                    {classItem?.teacherName || '-'}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>

          {/* Filter Section */}
          <Card
            title={
              <Space>
                <FilterOutlined style={{ color: '#1890ff' }} />
                <Text strong>{t('common.filter')}</Text>
              </Space>
            }
            size="small"
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Button
                  type={!showFilters ? 'primary' : 'default'}
                  onClick={handleGetStudents}
                  block
                  icon={<UserOutlined />}
                >
                  {t('classManagement.enrollModal.getStudents')}
                </Button>
              </div>
              <div>
                <Button
                  type={showFilters ? 'primary' : 'default'}
                  onClick={toggleFilters}
                  block
                  icon={<FilterOutlined />}
                >
                  {showFilters
                    ? t('classManagement.enrollModal.hideFilters')
                    : t('classManagement.enrollModal.showFilters')}
                </Button>
              </div>

              {showFilters && (
                <div className="mt-3">
                  <Divider style={{ margin: '12px 0' }} />
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: '100%' }}
                  >
                    <div>
                      <Text className="text-sm">
                        {t('classManagement.form.grade')}
                      </Text>
                      <Select
                        placeholder={t('classManagement.form.selectGrade')}
                        value={filterValues.grade}
                        onChange={value => handleFilterChange('grade', value)}
                        style={{ width: '100%' }}
                        allowClear
                        size="small"
                      >
                        <Select.Option value={10}>
                          {t('classManagement.form.grade10')}
                        </Select.Option>
                        <Select.Option value={11}>
                          {t('classManagement.form.grade11')}
                        </Select.Option>
                        <Select.Option value={12}>
                          {t('classManagement.form.grade12')}
                        </Select.Option>
                      </Select>
                    </div>
                    <div>
                      <Text className="text-sm">
                        {t('classManagement.form.schoolYear')}
                      </Text>
                      <Input
                        placeholder={t(
                          'classManagement.enrollModal.schoolYearPlaceholder'
                        )}
                        value={filterValues.schoolYear}
                        onChange={e =>
                          handleFilterChange('schoolYear', e.target.value)
                        }
                        allowClear
                        size="small"
                      />
                    </div>
                    <div>
                      <Text className="text-sm">
                        {t('classManagement.form.codeClass')}
                      </Text>
                      <Input
                        placeholder={t(
                          'classManagement.enrollModal.classCodePlaceholder'
                        )}
                        value={filterValues.classCode}
                        onChange={e =>
                          handleFilterChange('classCode', e.target.value)
                        }
                        allowClear
                        size="small"
                      />
                    </div>
                    <div className="mt-2">
                      <Space size="small" style={{ width: '100%' }}>
                        <Button
                          type="primary"
                          size="small"
                          onClick={handleApplyFilters}
                          disabled={!activeFilters}
                          block
                        >
                          {t('classManagement.enrollModal.applyFilters')}
                        </Button>
                        <Button size="small" onClick={resetFilters}>
                          {t('common.clear')}
                        </Button>
                      </Space>
                      <div className="mt-2">
                        <Button
                          size="small"
                          onClick={hideFilters}
                          style={{ width: '100%' }}
                        >
                          {t('classManagement.enrollModal.hideFilters')}
                        </Button>
                      </div>
                    </div>
                  </Space>
                </div>
              )}
            </Space>
          </Card>
        </Col>

        {/* Right Side - Student List */}
        <Col span={16}>
          <Card
            title={
              <Space>
                <TeamOutlined style={{ color: '#1890ff' }} />
                <Text strong>
                  {t('classManagement.enrollModal.studentList')}
                </Text>
              </Space>
            }
            size="small"
            extra={
              <Input.Search
                placeholder={t('classManagement.enrollModal.searchPlaceholder')}
                allowClear
                onSearch={handleSearch}
                onChange={e => handleSearch(e.target.value)}
                enterButton
                style={{ width: 300 }}
                size="small"
              />
            }
          >
            <div className="mb-4">
              <Text type="secondary" className="text-sm">
                {t('classManagement.enrollModal.selectedCount', {
                  count: selectedIds.length,
                })}
              </Text>
            </div>

            <Table
              rowKey="id"
              loading={loading}
              dataSource={filtered}
              pagination={paginationConfig}
              rowSelection={rowSelectionConfig}
              size="small"
              scroll={{ x: 600 }}
              columns={columns}
            />

            <div className="mt-4 pt-3 border-t border-gray-200">
              <Space size="middle" style={{ float: 'right' }}>
                <Button onClick={handleCancel} size="middle">
                  {t('common.cancel')}
                </Button>
                <Button
                  type="primary"
                  size="middle"
                  disabled={!selectedIds.length}
                  loading={loading}
                  onClick={handleSubmit}
                  icon={<UserAddOutlined />}
                >
                  {t('classManagement.enrollModal.enrollSelected')}
                </Button>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
    </Modal>
  )
}

const ClassManagement = () => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const { userRole } = useAuth()
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
  const [isEnrollVisible, setIsEnrollVisible] = useState(false)
  const [enrollTarget, setEnrollTarget] = useState(null)
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
  // Handle enroll open
  const handleOpenEnroll = useCallback(record => {
    setEnrollTarget(record)
    setIsEnrollVisible(true)
  }, [])

  const handleEnrollCancel = useCallback(() => {
    setIsEnrollVisible(false)
    setEnrollTarget(null)
  }, [])

  const handleEnrollSubmit = useCallback(
    async studentIds => {
      if (!enrollTarget?.id) return
      try {
        await dispatch(
          enrollClass({ classId: enrollTarget.id, studentIds })
        ).unwrap()
        messageApi.success(t('classManagement.enrollModal.success'))
        setIsEnrollVisible(false)
        setEnrollTarget(null)
        dispatch(getAllClasses())
      } catch (e) {
        console.error(e)
        messageApi.error(e)
      }
    },
    [dispatch, enrollTarget, t, messageApi]
  )

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
              onEnroll={userRole === 'manager' ? handleOpenEnroll : undefined}
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

        {/* Enroll Students Modal */}
        {isEnrollVisible && (
          <EnrollStudentsModal
            open={isEnrollVisible}
            onCancel={handleEnrollCancel}
            onSubmit={handleEnrollSubmit}
            classItem={enrollTarget}
            isDarkMode={isDarkMode}
            t={t}
          />
        )}
      </div>
    </>
  )
}

export default ClassManagement
