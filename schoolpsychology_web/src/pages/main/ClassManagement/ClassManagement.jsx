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
} from 'antd'
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '@/contexts/ThemeContext'
import { getAllClasses } from '@/store/actions/classActions'
import { enrollClass } from '@/store/actions/classActions'
import { EnrollStudentsModal } from './EnrollStudentModal'
import { loadAccount } from '@/store/actions'
import { useAuth } from '@/hooks'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select

// Lazy load components
const ClassTable = lazy(() => import('./ClassTable'))

const ClassManagement = () => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const dispatch = useDispatch()
  const { classes, loading, error } = useSelector(state => state.class)
  // State management
  const [searchText, setSearchText] = useState('')
  const [filters, setFilters] = useState({
    schoolYear: undefined,
  })
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [enrollTarget, setEnrollTarget] = useState(null)
  const [isEnrollVisible, setIsEnrollVisible] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const { user } = useAuth()

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

  const handleClearFilters = useCallback(() => {
    setFilters({
      schoolYear: undefined,
    })
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (!user) return
    if (user?.role.toLowerCase() !== 'manager') {
      Promise.all([
        dispatch(loadAccount()).unwrap(),
        dispatch(getAllClasses()).unwrap(),
      ])
    } else {
      dispatch(getAllClasses()).unwrap()
    }
    setSearchText('')
    setFilters({
      classYear: undefined,
      teacher: undefined,
    })
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [dispatch, user])

  const handleEnroll = useCallback(record => {
    setEnrollTarget(record)
    setIsEnrollVisible(true)
  }, [])

  const handleEnrollSubmit = useCallback(
    async studentIds => {
      if (!enrollTarget?.id) return
      try {
        await dispatch(
          enrollClass({ classId: enrollTarget.id, studentIds })
        ).unwrap()
        messageApi.success(t('classManagement.enrollModal.success'))
        dispatch(getAllClasses())
      } catch (e) {
        console.error(e)
        messageApi.error(e)
      }
    },
    [dispatch, enrollTarget, t, messageApi]
  )

  const handleEnrollCancel = useCallback(() => {
    setIsEnrollVisible(false)
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
          </div>
          <div className="flex items-center space-x-3">
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              {t('classManagement.refresh')}
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
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Select
                placeholder={t('classManagement.filters.classYear')}
                allowClear
                value={filters.schoolYear}
                onChange={e => handleFiltersChange('schoolYear', e)}
                options={Array.from(
                  new Set(classes.map(classItem => classItem.schoolYear.name))
                ).map(schoolYear => ({
                  label: schoolYear,
                  value: schoolYear,
                }))}
              />
            </Col>
            {(searchText || filters.schoolYear) && (
              <Col xs={24} sm={12} lg={8}>
                <Button onClick={handleClearFilters}>
                  {t('appointment.filter.clearFilters')}
                </Button>
              </Col>
            )}
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
              onEnroll={handleEnroll}
            />
          </Suspense>
        </Card>

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
