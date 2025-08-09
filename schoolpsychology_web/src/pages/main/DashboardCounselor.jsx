import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Card,
  Typography,
  Empty,
  Row,
  Col,
  Statistic,
  List,
  Avatar,
  Tag,
  Table,
  Skeleton,
  Badge,
} from 'antd'
import { useTheme } from '@/contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import { dashboardApi } from '@/services/dashboardApi'
import {
  CalendarOutlined,
  CheckSquareOutlined,
  FileSearchOutlined,
  ApartmentOutlined,
  FolderOpenOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const numberFormatter = new Intl.NumberFormat()

const ProgressTrendTag = ({ trend, t }) => {
  if (!trend) return null
  const isImproved = trend === 'IMPROVED'
  const isDeclined = trend === 'DECLINED'
  return (
    <Tag color={isImproved ? 'green' : isDeclined ? 'red' : 'blue'}>
      {isImproved ? (
        <ArrowUpOutlined />
      ) : isDeclined ? (
        <ArrowDownOutlined />
      ) : null}{' '}
      {t(`caseManagement.progressTrendOptions.${trend}`, trend)}
    </Tag>
  )
}

const StatusBadge = ({ status, t }) => {
  const colorMap = {
    NEW: 'processing',
    IN_PROGRESS: 'warning',
    CLOSED: 'success',
  }
  return (
    <Badge
      status={colorMap[status] || 'default'}
      text={t(`caseManagement.statusOptions.${status}`, status)}
    />
  )
}

const Overview = ({ overview, isDarkMode, t }) => {
  const items = useMemo(
    () => [
      {
        key: 'myActiveCases',
        title: t('counselorDashboard.overview.myActiveCases'),
        value: overview?.myActiveCases || 0,
        icon: <FolderOpenOutlined className="text-2xl text-blue-500" />,
        color: '#1677ff',
      },
      {
        key: 'myAppointmentsThisMonth',
        title: t('counselorDashboard.overview.myAppointmentsThisMonth'),
        value: overview?.myAppointmentsThisMonth || 0,
        icon: <CalendarOutlined className="text-2xl text-purple-500" />,
        color: '#722ed1',
      },
      {
        key: 'mySurveysReviewed',
        title: t('counselorDashboard.overview.mySurveysReviewed'),
        value: overview?.mySurveysReviewed || 0,
        icon: <FileSearchOutlined className="text-2xl text-green-500" />,
        color: '#52c41a',
      },
      {
        key: 'programsReferred',
        title: t('counselorDashboard.overview.programsReferred'),
        value: overview?.programsReferred || 0,
        icon: <ApartmentOutlined className="text-2xl text-orange-500" />,
        color: '#fa8c16',
      },
    ],
    [overview, t]
  )

  return (
    <Row gutter={[16, 16]}>
      {items.map(item => (
        <Col xs={24} sm={12} lg={6} key={item.key}>
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
        </Col>
      ))}
    </Row>
  )
}

const UpcomingAppointments = ({ appointments, isDarkMode, t }) => {
  return (
    <Card
      className={
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }
      title={
        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
          {t('counselorDashboard.upcomingAppointments')}
        </span>
      }
    >
      {!appointments?.length && (
        <Empty description={t('teacherDashboard.empty')} />
      )}
      {appointments?.length > 0 && (
        <List
          itemLayout="horizontal"
          dataSource={appointments}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={<ClockCircleOutlined />}
                    className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}
                  />
                }
                title={
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {item.student}
                  </span>
                }
                description={
                  <span
                    className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                  >
                    {new Date(item.date).toLocaleString()}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  )
}

const CaseByCategory = ({ data, isDarkMode, t }) => {
  const columns = [
    {
      title: t('counselorDashboard.caseByCategory.category'),
      dataIndex: 'category',
      key: 'category',
      render: v => <Tag>{v}</Tag>,
    },
    {
      title: t('counselorDashboard.caseByCategory.totalCases'),
      dataIndex: 'totalCases',
      key: 'totalCases',
      render: v => numberFormatter.format(v || 0),
    },
    {
      title: t('caseManagement.statusOptions.IN_PROGRESS'),
      dataIndex: 'inProgress',
      key: 'inProgress',
      render: v => numberFormatter.format(v || 0),
    },
    {
      title: t('caseManagement.statusOptions.CLOSED'),
      dataIndex: 'closed',
      key: 'closed',
      render: v => numberFormatter.format(v || 0),
    },
  ]

  return (
    <Card
      className={
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }
      title={
        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
          {t('counselorDashboard.caseByCategory.title')}
        </span>
      }
    >
      <Table
        dataSource={(data || []).map((d, idx) => ({ ...d, key: idx }))}
        columns={columns}
        size="middle"
        pagination={{ pageSize: 5, showSizeChanger: false }}
        locale={{
          emptyText: <Empty description={t('teacherDashboard.empty')} />,
        }}
      />
    </Card>
  )
}

const ActiveCaseList = ({ data, isDarkMode, t }) => {
  const columns = [
    {
      title: t('counselorDashboard.activeCases.titleCol'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('counselorDashboard.activeCases.student'),
      dataIndex: ['student', 'fullName'],
      key: 'student',
    },
    {
      title: t('counselorDashboard.activeCases.priority'),
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
      title: t('counselorDashboard.activeCases.status'),
      dataIndex: 'status',
      key: 'status',
      render: val => <StatusBadge status={val} t={t} />,
    },
    {
      title: t('counselorDashboard.activeCases.trend'),
      dataIndex: 'progressTrend',
      key: 'progressTrend',
      render: val => <ProgressTrendTag trend={val} t={t} />,
    },
  ]

  return (
    <Card
      className={
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }
      title={
        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
          {t('counselorDashboard.activeCases.title')}
        </span>
      }
    >
      <Table
        dataSource={(data || []).map(item => ({ ...item, key: item.id }))}
        columns={columns}
        size="middle"
        pagination={{ pageSize: 5, showSizeChanger: false }}
        locale={{
          emptyText: <Empty description={t('teacherDashboard.empty')} />,
        }}
      />
    </Card>
  )
}

const DashboardCounselor = () => {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await dashboardApi.getCounselorDashboard()
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
          <Col xs={24} lg={14}>
            <Card>
              <Skeleton active />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
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
          {t('counselorDashboard.title')}
        </Title>
        <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          {t('counselorDashboard.subtitle')}
        </Text>
      </div>

      <Overview overview={data?.overview} isDarkMode={isDarkMode} t={t} />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <ActiveCaseList
            data={data?.acitveCaseList}
            isDarkMode={isDarkMode}
            t={t}
          />
        </Col>
        <Col xs={24} lg={10}>
          <UpcomingAppointments
            appointments={data?.upcomingAppointments}
            isDarkMode={isDarkMode}
            t={t}
          />
          <div className="h-4" />
          <CaseByCategory
            data={data?.caseByCategory}
            isDarkMode={isDarkMode}
            t={t}
          />
        </Col>
      </Row>
    </div>
  )
}

export default React.memo(DashboardCounselor)
