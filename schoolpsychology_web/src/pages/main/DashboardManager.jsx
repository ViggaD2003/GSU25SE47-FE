import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Card,
  Typography,
  Empty,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  List,
  Avatar,
  Skeleton,
  Button,
} from 'antd'
import { useTheme } from '@/contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import { dashboardApi } from '@/services/dashboardApi'
import {
  TeamOutlined,
  AppstoreOutlined,
  FormOutlined,
  CalendarOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const numberFormatter = new Intl.NumberFormat()

const Overview = ({ overview, isDarkMode, t }) => {
  const items = useMemo(
    () => [
      {
        key: 'totalStudents',
        title: t('managerDashboard.overview.totalStudents'),
        value: overview?.totalStudents || 0,
        icon: <TeamOutlined className="text-2xl text-blue-500" />,
        color: '#1677ff',
      },
      {
        key: 'totalPrograms',
        title: t('managerDashboard.overview.totalPrograms'),
        value: overview?.totalPrograms || 0,
        icon: <AppstoreOutlined className="text-2xl text-green-500" />,
        color: '#52c41a',
      },
      {
        key: 'totalSurveys',
        title: t('managerDashboard.overview.totalSurveys'),
        value: overview?.totalSurveys || 0,
        icon: <FormOutlined className="text-2xl text-orange-500" />,
        color: '#fa8c16',
      },
      {
        key: 'totalAppointments',
        title: t('managerDashboard.overview.totalAppointments'),
        value: overview?.totalAppointments || 0,
        icon: <CalendarOutlined className="text-2xl text-purple-500" />,
        color: '#722ed1',
      },
      {
        key: 'activeCases',
        title: t('managerDashboard.overview.activeCases'),
        value: overview?.activeCases || 0,
        icon: <FolderOpenOutlined className="text-2xl text-red-500" />,
        color: '#ff4d4f',
      },
    ],
    [overview, t]
  )

  return (
    <div className="flex flex-wrap items-center gap-8 mb-6">
      {items.map(item => (
        <div key={item.key}>
          <Card
            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-md`}
          >
            <div className="flex items-center gap-4">
              {item.icon}
              <Statistic
                title={
                  <span
                    className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                  >
                    {item.title}
                  </span>
                }
                value={item.value}
                formatter={value => numberFormatter.format(Number(value))}
                valueStyle={{ color: item.color, fontWeight: 600 }}
              />
            </div>
          </Card>
        </div>
      ))}
    </div>
  )
}

const ActivityByCategories = ({ data, isDarkMode, t }) => {
  const columns = [
    {
      title: t('managerDashboard.activityByCategories.category'),
      dataIndex: 'category',
      key: 'category',
      render: v => <Tag>{v}</Tag>,
    },
    {
      title: t('managerDashboard.activityByCategories.programs'),
      dataIndex: 'programs',
      key: 'programs',
    },
    {
      title: t('managerDashboard.activityByCategories.surveys'),
      dataIndex: 'surveys',
      key: 'surveys',
    },
    {
      title: t('managerDashboard.activityByCategories.appointments'),
      dataIndex: 'appointments',
      key: 'appointments',
    },
  ]
  return (
    <Card
      className={
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }
      title={
        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
          {t('managerDashboard.activityByCategories.title')}
        </span>
      }
    >
      <Table
        dataSource={(data || []).map((d, idx) => ({ ...d, key: idx }))}
        columns={columns}
        size="middle"
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
          showTotal: (total, range) =>
            `${t('common.showing')} ${range[0]}-${range[1]} ${t('common.of')} ${total} ${t('common.items')}`,
        }}
        locale={{
          emptyText: <Empty description={t('teacherDashboard.empty')} />,
        }}
      />
    </Card>
  )
}

const SurveyLevelByCategories = ({ data, isDarkMode, t }) => {
  // Flatten levels for table with guaranteed-unique keys
  const rows = (data || []).flatMap((item, i) =>
    (item.levels || []).map((level, j) => ({
      key: `${item.category}-${String(level.level)}-${i}-${j}`,
      category: item.category,
      level: level.level,
      count: level.count,
    }))
  )

  const columns = [
    {
      title: t('managerDashboard.surveyLevelByCategories.category'),
      dataIndex: 'category',
      key: 'category',
      render: v => <Tag>{v}</Tag>,
    },
    {
      title: t('managerDashboard.surveyLevelByCategories.level'),
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: t('managerDashboard.surveyLevelByCategories.count'),
      dataIndex: 'count',
      key: 'count',
    },
  ]

  return (
    <Card
      className={
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }
      title={
        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
          {t('managerDashboard.surveyLevelByCategories.title')}
        </span>
      }
    >
      <Table
        dataSource={rows}
        columns={columns}
        size="middle"
        pagination={{
          pageSize: 7,
          showSizeChanger: false,
          showTotal: (total, range) =>
            `${t('common.showing')} ${range[0]}-${range[1]} ${t('common.of')} ${total} ${t('common.items')}`,
        }}
        locale={{
          emptyText: <Empty description={t('teacherDashboard.empty')} />,
        }}
      />
    </Card>
  )
}

const ActiveCasesList = ({ data, isDarkMode, t }) => {
  const columns = [
    {
      title: t('managerDashboard.activeCases.titleCol'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('managerDashboard.activeCases.student'),
      dataIndex: ['student', 'fullName'],
      key: 'student',
    },
    {
      title: t('managerDashboard.activeCases.counselor'),
      dataIndex: ['counselor', 'fullName'],
      key: 'counselor',
    },
    {
      title: t('managerDashboard.activeCases.priority'),
      dataIndex: 'priority',
      key: 'priority',
      render: val => (
        <Tag
          color={val === 'HIGH' ? 'red' : val === 'MEDIUM' ? 'orange' : 'blue'}
        >
          {t(`caseManagement.priorityOptions.${val}`, val)}
        </Tag>
      ),
    },
    {
      title: t('managerDashboard.activeCases.status'),
      dataIndex: 'status',
      key: 'status',
    },
  ]

  return (
    <Card
      className={
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }
      title={
        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
          {t('managerDashboard.activeCases.title')}
        </span>
      }
    >
      <Table
        dataSource={(data || []).map(item => ({ ...item, key: item.id }))}
        columns={columns}
        size="middle"
        pagination={{
          pageSize: 6,
          showSizeChanger: false,
          showTotal: (total, range) =>
            `${t('common.showing')} ${range[0]}-${range[1]} ${t('common.of')} ${total} ${t('common.items')}`,
        }}
        locale={{
          emptyText: <Empty description={t('teacherDashboard.empty')} />,
        }}
      />
    </Card>
  )
}

const DashboardManager = () => {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await dashboardApi.getManagerDashboard()
      setData(res)
    } catch (e) {
      setError(e?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 1 }} />
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map(i => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card>
                <Skeleton active paragraph={false} />
              </Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card>
              <Skeleton active />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card>
              <Skeleton active />
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  if (error) {
    return (
      <Card
        className={
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }
      >
        <Text type="danger">
          {t('common.error')}: {String(error)}
        </Text>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div className="mb-2">
        <Title
          level={2}
          className={isDarkMode ? 'text-white' : 'text-gray-900'}
        >
          {t('managerDashboard.title')}
        </Title>
        <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          {t('managerDashboard.subtitle')}
        </Text>
      </div>

      <Overview overview={data?.overview} isDarkMode={isDarkMode} t={t} />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ActivityByCategories
            data={data?.activityByCategories}
            isDarkMode={isDarkMode}
            t={t}
          />
        </Col>
        <Col xs={24} lg={12}>
          <SurveyLevelByCategories
            data={data?.surveyLevelByCategories}
            isDarkMode={isDarkMode}
            t={t}
          />
        </Col>
      </Row>

      <ActiveCasesList
        data={data?.activeCasesList}
        isDarkMode={isDarkMode}
        t={t}
      />
    </div>
  )
}

export default React.memo(DashboardManager)
