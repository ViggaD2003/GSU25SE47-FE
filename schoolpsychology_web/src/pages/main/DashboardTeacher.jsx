import React, { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  List,
  Avatar,
  Tag,
  Typography,
  Skeleton,
  Empty,
  Table,
  Badge,
} from 'antd'
import { useTheme } from '@/contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import { dashboardApi } from '@/services/dashboardApi'
import {
  TeamOutlined,
  SolutionOutlined,
  ScheduleOutlined,
  FormOutlined,
  FolderOpenOutlined,
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

const TeacherOverview = React.memo(({ overview, isDarkMode, t }) => {
  const items = useMemo(
    () => [
      {
        key: 'totalStudents',
        title: t('teacherDashboard.overview.totalStudents'),
        value: overview?.totalStudents || 0,
        icon: <TeamOutlined className="text-2xl text-blue-500" />,
        color: '#1677ff',
      },
      {
        key: 'studentsWithCases',
        title: t('teacherDashboard.overview.studentsWithCases'),
        value: overview?.studentsWithCases || 0,
        icon: <SolutionOutlined className="text-2xl text-green-500" />,
        color: '#52c41a',
      },
      {
        key: 'studentsInPrograms',
        title: t('teacherDashboard.overview.studentsInPrograms'),
        value: overview?.studentsInPrograms || 0,
        icon: <ScheduleOutlined className="text-2xl text-purple-500" />,
        color: '#722ed1',
      },
      {
        key: 'studentsCompletedSurveys',
        title: t('teacherDashboard.overview.studentsCompletedSurveys'),
        value: overview?.studentsCompletedSurveys || 0,
        icon: <FormOutlined className="text-2xl text-orange-500" />,
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
})

const CategorySummary = React.memo(({ data, isDarkMode, t }) => {
  return (
    <Card
      className={
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }
      title={
        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
          {t('teacherDashboard.caseSummary.title')}
        </span>
      }
    >
      {(!data || data.length === 0) && (
        <Empty description={t('teacherDashboard.empty')} />
      )}
      {data && data.length > 0 && (
        <List
          itemLayout="horizontal"
          dataSource={(data || []).filter(Boolean)}
          rowKey={(item, idx) =>
            item?.categoryCode || item?.categoryName || idx
          }
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={<FolderOpenOutlined />}
                    className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}
                  />
                }
                title={
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {item.categoryName}
                  </span>
                }
                description={
                  <div className="flex items-center gap-3">
                    <Tag>{item.categoryCode}</Tag>
                    <span
                      className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                    >
                      {t('teacherDashboard.caseSummary.cases')}:{' '}
                      {numberFormatter.format(item.caseCount || 0)}
                    </span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  )
})

const CasesTable = React.memo(({ cases, isDarkMode, t }) => {
  const columns = [
    {
      title: t('teacherDashboard.cases.student'),
      dataIndex: ['studentDto', 'fullName'],
      key: 'student',
      render: (_text, record) => (
        <div>
          <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
            {record?.studentDto?.fullName}
          </div>
          <div className="text-xs text-blue-500">
            {record?.studentDto?.studentCode}
          </div>
        </div>
      ),
    },
    {
      title: t('teacherDashboard.cases.category'),
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: val => <Tag>{val}</Tag>,
    },
    {
      title: t('teacherDashboard.cases.status'),
      dataIndex: 'status',
      key: 'status',
      render: val => <StatusBadge status={val} t={t} />,
    },
    {
      title: t('teacherDashboard.cases.trend'),
      dataIndex: 'progressTrend',
      key: 'progressTrend',
      render: val => <ProgressTrendTag trend={val} t={t} />,
    },
    {
      title: t('teacherDashboard.cases.priority'),
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
      title: t('teacherDashboard.cases.lastUpdated'),
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: val => (val ? new Date(val).toLocaleDateString() : '--'),
    },
  ]

  return (
    <Card
      className={
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }
      title={
        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
          {t('teacherDashboard.cases.title')}
        </span>
      }
    >
      <Table
        rowKey="caseId"
        dataSource={(cases || []).filter(Boolean)}
        columns={columns}
        size="middle"
        pagination={{ pageSize: 5, showSizeChanger: false }}
        locale={{
          emptyText: <Empty description={t('teacherDashboard.empty')} />,
        }}
      />
    </Card>
  )
})

const SkippedSurveys = React.memo(({ data, isDarkMode, t }) => {
  return (
    <Card
      className={
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }
      title={
        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
          {t('teacherDashboard.alertSkippedSurveys.title')}
        </span>
      }
      extra={
        <Tag color="red">
          {numberFormatter.format(data?.totalSkippedThisMonth || 0)}{' '}
          {t('teacherDashboard.alertSkippedSurveys.countSuffix')}
        </Tag>
      }
    >
      {(!data?.students || data.students.length === 0) && (
        <Empty description={t('teacherDashboard.empty')} />
      )}
      {data?.students && data.students.length > 0 && (
        <List
          dataSource={(data.students || []).filter(Boolean)}
          rowKey={(item, idx) => item?.id || item?.name || idx}
          renderItem={student => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={<FormOutlined />}
                    className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}
                  />
                }
                title={
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {student.name}
                  </span>
                }
                description={
                  <div className="flex flex-wrap gap-2">
                    {student.skippedSurveys?.map((s, idx) => (
                      <Tag key={idx} color="volcano">
                        {s}
                      </Tag>
                    ))}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  )
})

const DashboardTeacher = () => {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await dashboardApi.getTeacherDashboard()
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
          {t('teacherDashboard.title')}
        </Title>
        <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          {t('teacherDashboard.subtitle')}
        </Text>
      </div>

      <TeacherOverview
        overview={data?.overview}
        isDarkMode={isDarkMode}
        t={t}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <CasesTable cases={data?.cases} isDarkMode={isDarkMode} t={t} />
        </Col>
        <Col xs={24} lg={10}>
          <CategorySummary
            data={data?.caseSummary}
            isDarkMode={isDarkMode}
            t={t}
          />
          <div className="h-4" />
          <SkippedSurveys
            data={data?.alertSkippedSurveys}
            isDarkMode={isDarkMode}
            t={t}
          />
        </Col>
      </Row>
    </div>
  )
}

export default React.memo(DashboardTeacher)
