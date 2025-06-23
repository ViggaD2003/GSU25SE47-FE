import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../../contexts/ThemeContext'
import { Input, Typography, Button, Card, Row, Col, message } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import SurveyTable from './SurveyTable'
import SurveyModal from './SurveyModal'
import { surveyAPI } from '../../../services/surveyApi'
// import AutoTranslatedText from '../../../components/common/AutoTranslatedText'

const { Title, Text } = Typography
const { Search } = Input

const SurveyManagement = () => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // Mock API fetch function for server-side pagination
  const fetchSurveys = async (page, pageSize, searchText = '') => {
    // Simulate API delay
    await new Promise(res => setTimeout(res, 500))
    // Generate mock data
    const total = 1000
    const surveys = Array.from({ length: pageSize }, (_, i) => {
      const id = (page - 1) * pageSize + i + 1
      return {
        id,
        name: `Survey ${id}`,
        description: `Description ${id}`,
        status: 'active',
        createDate: '15/01/2024',
        lastUpdate: '25/05/2024',
      }
    }).filter(u => u.name.toLowerCase().includes(searchText.toLowerCase()))
    return { data: surveys, total }
  }

  const loadData = useCallback(
    async (page = 1, pageSize = 10, search = searchText) => {
      setLoading(true)
      const res = await fetchSurveys(page, pageSize, search)
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

  const handleView = useCallback(() => {}, [])

  const handleEdit = useCallback(() => {}, [])

  const handleDelete = useCallback(() => {}, [])

  const handleSearch = useCallback(
    value => {
      setSearchText(value)
      loadData(pagination.current, pagination.pageSize, value)
    },
    [loadData, pagination]
  )

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleModalOk = async values => {
    try {
      // Format dates to YYYY-MM-DD
      const payload = {
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
      }
      console.log('Survey data:', payload)
      await surveyAPI.createSurvey(payload)
      message.success(t('surveyManagement.messages.addSuccess'))
      setIsModalVisible(false)
      loadData()
    } catch (error) {
      console.error('Failed to create survey:', error)
      message.error(t('surveyManagement.messages.addError'))
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
  }

  return (
    <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
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
            onClick={() => loadData(pagination.current, pagination.pageSize)}
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
          data={data}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>
      <SurveyModal
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
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
