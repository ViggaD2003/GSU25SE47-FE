import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
} from 'react'
import {
  Card,
  Button,
  Input,
  Select,
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
  FilterOutlined,
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import { classAPI } from '@/services/classApi'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select

export const EnrollStudentsModal = ({
  t,
  open,
  onCancel,
  onSubmit,
  classItem,
  isDarkMode,
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

  console.log(classItem)

  // Memoize filter values để tránh re-render không cần thiết
  const activeFilters = useMemo(() => {
    return Object.values(filterValues).some(
      value => value !== undefined && value !== ''
    )
  }, [filterValues])

  // Memoize fetch function để tránh tạo mới mỗi lần render
  const fetchStudents = useCallback(
    async (params = {}) => {
      try {
        setLoading(true)
        const requestParams = {
          ...params,
          ...(classItem?.id && { classId: classItem.id }),
        }

        const data = await classAPI.getStudentWithInactiveClass(requestParams)
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : []

        console.log(list)

        setStudents(list)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    },
    [classItem?.id]
  )

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
                    {classItem?.schoolYear?.name || '-'}
                  </Text>
                </div>
              </div>
              <div>
                <Text type="secondary" className="text-sm">
                  {t('classManagement.form.teacherName')}
                </Text>
                <div>
                  <Text strong className="text-base">
                    {classItem?.teacher?.fullName || '-'}
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
