import React, { useCallback, useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '../../../contexts/ThemeContext'
import {
  Input,
  Typography,
  Button,
  Card,
  Row,
  Col,
  DatePicker,
  Space,
  Tag,
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined,
  ClearOutlined,
} from '@ant-design/icons'
import SurveyTable from './SurveyTable'
import SurveyModal from './SurveyModal'
import SurveyDetailModal from './SurveyDetailModal'
import {
  getAllSurveys,
  createSurvey,
  getSurveyInCase,
} from '../../../store/actions/surveyActions'
import {
  selectSurveys,
  selectSurveyLoading,
  selectSurveyError,
  clearError,
} from '../../../store/slices/surveySlice'
import useMessage from 'antd/es/message/useMessage'
import dayjs from 'dayjs'
import { useAuth } from '@/contexts/AuthContext'
import { getSurveyTypePermissions } from '@/constants/enums'
import { loadAccount } from '@/store/actions'

const { Title, Text } = Typography
const { Search } = Input
const { RangePicker } = DatePicker

const SurveyManagement = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const dispatch = useDispatch()
  const [messageApi, contextHolder] = useMessage()

  // Redux selectors
  const surveys = useSelector(selectSurveys)
  const loading = useSelector(selectSurveyLoading)
  const error = useSelector(selectSurveyError)

  // Local state for FE paging/search/filtering
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedSurveyId, setSelectedSurveyId] = useState(null)
  const [detailVisible, setDetailVisible] = useState(false)

  // Filter states with clear descriptions
  const [dateRange, setDateRange] = useState(null) // Filter by creation date range

  // Load all surveys once
  useEffect(() => {
    if (user?.role === 'counselor') {
      dispatch(getSurveyInCase())
    } else {
      dispatch(getAllSurveys())
    }
  }, [dispatch, user?.role])

  // Enhanced filtering logic with comprehensive search and filter capabilities
  const filteredSurveys = useMemo(() => {
    if (!surveys) return []

    // Filter surveys by user role
    const filteredSurveysByRole = surveys.filter(survey => {
      const surveyType = survey.surveyType
      const userRole = user?.role
      const permissions = getSurveyTypePermissions(userRole)
      return permissions.includes(surveyType)
    })

    // If no filters are applied, return all surveys
    const hasActiveFilters = searchText.trim() || dateRange

    if (!hasActiveFilters) return filteredSurveysByRole

    return filteredSurveysByRole.filter(survey => {
      // 1. Text Search: Search in title, description, and category name/code
      const searchLower = searchText.toLowerCase()
      const matchesSearch =
        !searchText.trim() || survey.title?.toLowerCase().includes(searchLower)

      // 2. Date Range Filter: Filter by survey creation date
      const matchesDateRange =
        !dateRange ||
        !dateRange.length ||
        (dayjs(survey.createdAt).isAfter(dateRange[0].startOf('day')) &&
          dayjs(survey.createdAt).isBefore(dateRange[1].endOf('day')))

      // All filters must match for the survey to be included
      return matchesSearch && matchesDateRange
    })
  }, [surveys, searchText, dateRange, user?.role])

  // Pagination for filtered surveys
  const paginatedSurveys = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredSurveys.slice(startIndex, endIndex)
  }, [filteredSurveys, currentPage, pageSize])

  // Pagination config
  const pagination = useMemo(
    () => ({
      current: currentPage,
      pageSize: pageSize,
      total: filteredSurveys.length,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total, range) =>
        `${t('common.showing')} ${range[0]}-${range[1]} ${t('common.of')} ${total} ${t('common.items')}`,
      onChange: (page, size) => {
        setCurrentPage(page)
        setPageSize(size)
      },
      onShowSizeChange: (current, size) => {
        setCurrentPage(1)
        setPageSize(size)
      },
    }),
    [currentPage, pageSize, filteredSurveys.length, t]
  )

  // Handler functions
  const handleSearch = useCallback(value => {
    setSearchText(value)
    setCurrentPage(1) // Reset to first page when searching
  }, [])

  const handleRefresh = useCallback(() => {
    if (!user) return
    if (user?.role.toLowerCase() !== 'manager') {
      Promise.all([
        dispatch(loadAccount()).unwrap(),
        dispatch(getSurveyInCase()).unwrap(),
      ])
    } else {
      dispatch(getAllSurveys()).unwrap()
    }
    setCurrentPage(1)
  }, [dispatch, user?.role, user])

  const handleAddSurvey = useCallback(() => {
    setIsModalVisible(true)
  }, [])

  const handleViewSurvey = useCallback(survey => {
    setSelectedSurveyId(survey.surveyId)
    setDetailVisible(true)
  }, [])

  const handleModalOk = async (values, resetFields) => {
    try {
      await dispatch(createSurvey(values)).unwrap()
      messageApi.success(t('surveyManagement.messages.addSuccess'))
      setIsModalVisible(false)
      resetFields()
      handleRefresh()
    } catch (error) {
      messageApi.error(error || t('surveyManagement.messages.addError'))
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
  }

  const handleDetailClose = () => {
    setDetailVisible(false)
    setSelectedSurveyId(null)
  }

  const handleDetailUpdated = () => {
    dispatch(getAllSurveys()) // Refresh the list
  }

  // Enhanced date range change handler
  const handleDateRangeChange = dates => {
    if (dates && dates.length === 2) {
      setDateRange(dates)
      setCurrentPage(1) // Reset to first page when filtering
    } else {
      setDateRange(null)
    }
  }

  // Clear all filters handler
  const handleClearFilters = () => {
    setSearchText('')
    setDateRange(null)
    setCurrentPage(1)
  }

  // Check if any filters are active
  const hasActiveFilters = searchText.trim() || dateRange !== null

  // Show error message if there's an error
  useEffect(() => {
    if (error) {
      messageApi.error(error)
      dispatch(clearError())
    }
  }, [error, messageApi, dispatch])

  return (
    <div className="p-6">
      {contextHolder}

      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <Title
            level={2}
            className={isDarkMode ? 'text-white' : 'text-gray-800'}
          >
            {t('surveyManagement.title')}
          </Title>
          <Text
            type="secondary"
            className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
          >
            {t('surveyManagement.description')}
          </Text>
        </div>
        <div className="flex gap-2">
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            {t('surveyManagement.refresh')}
          </Button>
          {((user?.role === 'counselor' &&
            user?.hasAvailable &&
            Array.isArray(user?.categories) &&
            user?.categories?.length > 0) ||
            user?.role === 'manager') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddSurvey}
            >
              {t('surveyManagement.addSurvey')}
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Filter Card */}
      <Card
        className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}
        style={{ marginBottom: 16 }}
        title={
          <Space>
            <FilterOutlined />
            <span>{t('surveyManagement.filtersAndSearch')}</span>
            {hasActiveFilters && (
              <Tag color="blue">
                {filteredSurveys.length} of {surveys?.length || 0} surveys
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
        <Row gutter={[16, 16]} className="mb-4">
          {/* Text Search - Search in title*/}
          <Col xs={24} sm={12} md={8} lg={8}>
            <div>
              <Text strong>{t('surveyManagement.searchTitle')}</Text>
              <Text
                type="secondary"
                style={{ display: 'block', fontSize: '12px' }}
              >
                {t('surveyManagement.searchDescription')}
              </Text>
            </div>
            <Search
              placeholder={t('surveyManagement.searchPlaceholder')}
              allowClear
              size="middle"
              onSearch={handleSearch}
              onChange={e => handleSearch(e.target.value)}
              value={searchText}
              style={{ marginTop: 4 }}
            />
          </Col>

          {/* Date Range Filter - Filter by creation date */}
          <Col xs={24} sm={12} md={8} lg={8}>
            <div>
              <Text strong>{t('surveyManagement.creationDate')}</Text>
              <Text
                type="secondary"
                style={{ display: 'block', fontSize: '12px' }}
              >
                {t('surveyManagement.creationDateDescription')}
              </Text>
            </div>
            <RangePicker
              className="w-full"
              size="middle"
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder={[
                t('surveyManagement.startDate'),
                t('surveyManagement.endDate'),
              ]}
              allowClear
              style={{ marginTop: 4 }}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <SurveyTable
        t={t}
        data={paginatedSurveys}
        loading={loading}
        pagination={pagination}
        onView={handleViewSurvey}
        userRole={user?.role}
      />

      {/* Modals */}
      <SurveyModal
        visible={isModalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
        messageApi={messageApi}
        user={user}
      />

      <SurveyDetailModal
        t={t}
        visible={detailVisible}
        surveyId={selectedSurveyId}
        onClose={handleDetailClose}
        onUpdated={handleDetailUpdated}
        messageApi={messageApi}
        userRole={user?.role}
        dispatch={dispatch}
      />
    </div>
  )
}

export default SurveyManagement
