import React, { useCallback, useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '../../../contexts/ThemeContext'
import { Input, Typography, Button, Card, Row, Col } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import SurveyTable from './SurveyTable'
import SurveyModal from './SurveyModal'
import SurveyDetailModal from './SurveyDetailModal'
import {
  getAllSurveys,
  createSurvey,
} from '../../../store/actions/surveyActions'
import {
  selectSurveys,
  selectSurveyLoading,
  selectSurveyError,
  clearError,
} from '../../../store/slices/surveySlice'
import useMessage from 'antd/es/message/useMessage'
// import AutoTranslatedText from '../../../components/common/AutoTranslatedText'

const { Title, Text } = Typography
const { Search } = Input

const SurveyManagement = () => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const dispatch = useDispatch()
  const [messageApi, contextHolder] = useMessage()

  // Redux selectors
  const surveys = useSelector(selectSurveys)
  const loading = useSelector(selectSurveyLoading)
  const error = useSelector(selectSurveyError)

  // Local state for FE paging/search
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedSurvey, setSelectedSurvey] = useState(null)
  const [detailVisible, setDetailVisible] = useState(false)

  // Load all surveys once
  useEffect(() => {
    dispatch(getAllSurveys())
  }, [dispatch])

  // FE search
  const filteredSurveys = useMemo(() => {
    if (!searchText) return surveys
    return surveys.filter(
      survey =>
        survey.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        survey.description?.toLowerCase().includes(searchText.toLowerCase())
    )
  }, [surveys, searchText])

  // FE paging
  const paginatedSurveys = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredSurveys.slice(start, start + pageSize)
  }, [filteredSurveys, currentPage, pageSize])

  // Table pagination config
  const pagination = {
    current: currentPage,
    pageSize,
    total: filteredSurveys.length,
    showSizeChanger: true,
    onChange: (page, size) => {
      setCurrentPage(page)
      setPageSize(size)
    },
  }

  // Handle search
  const handleSearch = useCallback(value => {
    setSearchText(value)
    setCurrentPage(1) // Reset to first page when searching
  }, [])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    dispatch(getAllSurveys())
  }, [dispatch])

  const handleView = useCallback(survey => {
    setSelectedSurvey(survey)
    setDetailVisible(true)
  }, [])

  const handleEdit = () => {
    handleRefresh()
    setDetailVisible(false)
  }

  const handleDelete = useCallback(() => {}, [])
  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleModalOk = async (values, resetFields, handleCategoryChange) => {
    try {
      // Format dates to YYYY-MM-DD and handle categoryId
      const payload = {
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
      }
      await dispatch(createSurvey(payload)).unwrap()
      messageApi.success(t('surveyManagement.messages.addSuccess'))
      setIsModalVisible(false)
      dispatch(getAllSurveys()) // Refresh the list
      resetFields()
      handleCategoryChange(null)
    } catch (error) {
      console.warn('Failed to create survey:', error)
      messageApi.error(t('surveyManagement.messages.addError'))
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
  }

  const handleDetailClose = () => {
    setDetailVisible(false)
    setSelectedSurvey(null)
  }

  // Show error message if there's an error
  useEffect(() => {
    if (error) {
      messageApi.error(error)
      dispatch(clearError())
    }
  }, [error, messageApi, dispatch])

  return (
    <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
      {contextHolder}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title
            level={2}
            className={isDarkMode ? 'text-white' : 'text-gray-900'}
          >
            {t('surveyManagement.title')}
          </Title>
          <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            {t('surveyManagement.description')}
          </Text>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            {t('surveyManagement.refresh')}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
            {t('surveyManagement.addSurvey')}
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <Search
              placeholder={t('surveyManagement.search')}
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
        <SurveyTable
          t={t}
          data={paginatedSurveys}
          loading={loading}
          pagination={pagination}
          onChange={pagination.onChange}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>
      <SurveyModal
        t={t}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        messageApi={messageApi}
      />
      <SurveyDetailModal
        t={t}
        visible={detailVisible}
        survey={selectedSurvey}
        onClose={handleDetailClose}
        onUpdated={handleEdit}
        messageApi={messageApi}
      />
    </div>
  )
}

export default SurveyManagement

{
  /* <h2>
    <AutoTranslatedText
      text="Dynamic Survey Management"
      translationKey="dynamic.survey.management"
      // loadingComponent={<span>Loading...</span>}
    />
  </h2> */
}
