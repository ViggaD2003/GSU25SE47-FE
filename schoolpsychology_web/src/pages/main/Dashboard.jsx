import React from 'react'
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  List,
  Avatar,
  Tag,
  Typography,
  Tabs,
} from 'antd'
import {
  UserOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'
import { Line, Bar, Pie } from 'react-chartjs-2'
import { TokenDebugger } from '../../components/common'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title as ChartTitle,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  ChartTitle
)

const { Title, Text } = Typography
const { TabPane } = Tabs

const Dashboard = () => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()

  // Mock data
  const stats = [
    {
      title: t('dashboard.activeCases'),
      value: 56,
      icon: <UserOutlined className="text-2xl text-blue-500" />,
      color: '#1677ff',
    },
    {
      title: t('dashboard.newCasesThisWeek'),
      value: 12,
      icon: <ExclamationCircleOutlined className="text-2xl text-green-500" />,
      color: '#52c41a',
    },
    {
      title: t('dashboard.surveyAboveThreshold'),
      value: 8,
      icon: <WarningOutlined className="text-2xl text-orange-500" />,
      color: '#faad14',
    },
    {
      title: t('dashboard.upcomingAppointments'),
      value: 5,
      icon: <CalendarOutlined className="text-2xl text-purple-500" />,
      color: '#722ed1',
    },
  ]

  const caseStatus = [
    {
      type: t('dashboard.caseStatus.open'),
      value: 34,
      color: '#1677ff',
      icon: <ExclamationCircleOutlined />,
    },
    {
      type: t('dashboard.caseStatus.closed'),
      value: 18,
      color: '#52c41a',
      icon: <CheckCircleOutlined />,
    },
    {
      type: t('dashboard.caseStatus.highRisk'),
      value: 4,
      color: '#faad14',
      icon: <WarningOutlined />,
    },
  ]

  // Biểu đồ xu hướng theo khối lớp
  const gradeTrendData = {
    labels: [
      t('dashboard.grade.10'),
      t('dashboard.grade.11'),
      t('dashboard.grade.12'),
    ],
    datasets: [
      {
        label: t('dashboard.charts.cases'),
        data: [10, 20, 11],
        backgroundColor: '#1677ff',
        borderColor: '#1677ff',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
    ],
  }

  // Biểu đồ xu hướng theo giới tính
  const genderPieData = {
    labels: [t('dashboard.gender.male'), t('dashboard.gender.female')],
    datasets: [
      {
        label: t('dashboard.charts.cases'),
        data: [30, 22],
        backgroundColor: ['#1677ff', '#faad14'],
        borderWidth: 1,
      },
    ],
  }

  // Biểu đồ loại vấn đề
  const issueBarData = {
    labels: [
      t('dashboard.issue.anxiety'),
      t('dashboard.issue.depression'),
      t('dashboard.issue.violence'),
      t('dashboard.issue.other'),
    ],
    datasets: [
      {
        label: t('dashboard.charts.cases'),
        data: [18, 12, 8, 10],
        backgroundColor: ['#1677ff', '#faad14', '#52c41a', '#722ed1'],
        borderRadius: 8,
      },
    ],
  }

  // Lịch hẹn sắp tới
  const appointments = [
    {
      id: 1,
      student: 'Nguyễn Văn A',
      time: '09:00 12/06/2024',
      type: t('dashboard.appointmentType.individual'),
    },
    {
      id: 2,
      student: 'Trần Thị B',
      time: '10:30 12/06/2024',
      type: t('dashboard.appointmentType.group'),
    },
    {
      id: 3,
      student: 'Lê Văn C',
      time: '14:00 13/06/2024',
      type: t('dashboard.appointmentType.individual'),
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-6">
        <Title
          level={2}
          className={isDarkMode ? 'text-white' : 'text-gray-900'}
        >
          {t('dashboard.title')}
        </Title>
        <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          {t('dashboard.welcome')}
        </Text>
      </div>

      {/* Token Debugger - Development Only */}
      {import.meta.env.DEV && (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <TokenDebugger />
          </Col>
        </Row>
      )}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        {stats.map((stat, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card
              className={`flex items-center gap-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-md`}
            >
              <div>{stat.icon}</div>
              <Statistic
                title={
                  <span
                    className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                  >
                    {stat.title}
                  </span>
                }
                value={stat.value}
                valueStyle={{ color: stat.color, fontWeight: 600 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Case Status & Appointments */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {t('dashboard.caseStatus.title')}
              </span>
            }
            className={
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }
          >
            <Row gutter={[16, 16]}>
              {caseStatus.map((item, idx) => (
                <Col xs={24} sm={8} key={idx}>
                  <Card
                    className={`flex items-center gap-3 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}
                    variant="outlined"
                  >
                    <div className="text-xl" style={{ color: item.color }}>
                      {item.icon}
                    </div>
                    <div>
                      <div
                        className={
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }
                        style={{ fontWeight: 500 }}
                      >
                        {item.type}
                      </div>
                      <div
                        className="text-lg font-bold"
                        style={{ color: item.color }}
                      >
                        {item.value}
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {t('dashboard.upcomingAppointments')}
              </span>
            }
            className={
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={appointments}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<CalendarOutlined />}
                        className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}
                      />
                    }
                    title={
                      <span
                        className={isDarkMode ? 'text-white' : 'text-gray-900'}
                      >
                        {item.student}
                      </span>
                    }
                    description={
                      <div>
                        <span
                          className={
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }
                        >
                          {item.type}
                        </span>
                        <br />
                        <span className="text-xs text-blue-500 font-semibold">
                          {item.time}
                        </span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Trend Charts */}
      <Card
        className={
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }
        title={
          <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
            {t('dashboard.charts.title')}
          </span>
        }
      >
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: (
                <span>
                  <BarChartOutlined /> {t('dashboard.charts.byGrade')}
                </span>
              ),
              children: (
                <div className="p-4">
                  <Line
                    data={gradeTrendData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: {
                          display: true,
                          text: t('dashboard.charts.trendByGrade'),
                          color: isDarkMode ? '#fff' : '#222',
                          font: { size: 16 },
                        },
                      },
                      scales: {
                        x: { ticks: { color: isDarkMode ? '#fff' : '#222' } },
                        y: { ticks: { color: isDarkMode ? '#fff' : '#222' } },
                      },
                    }}
                  />
                </div>
              ),
            },
            {
              key: '2',
              label: (
                <span>
                  <PieChartOutlined /> {t('dashboard.charts.byGender')}
                </span>
              ),
              children: (
                <div className="p-4 flex justify-center">
                  <Pie
                    data={genderPieData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          labels: {
                            color: isDarkMode ? '#fff' : '#222',
                            font: { size: 14 },
                          },
                        },
                        title: {
                          display: true,
                          text: t('dashboard.charts.ratioByGender'),
                          color: isDarkMode ? '#fff' : '#222',
                          font: { size: 16 },
                        },
                      },
                    }}
                  />
                </div>
              ),
            },
            {
              key: '3',
              label: (
                <span>
                  <LineChartOutlined /> {t('dashboard.charts.byIssue')}
                </span>
              ),
              children: (
                <div className="p-4">
                  <Bar
                    data={issueBarData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: {
                          display: true,
                          text: t('dashboard.charts.byIssueTitle'),
                          color: isDarkMode ? '#fff' : '#222',
                          font: { size: 16 },
                        },
                      },
                      scales: {
                        x: { ticks: { color: isDarkMode ? '#fff' : '#222' } },
                        y: { ticks: { color: isDarkMode ? '#fff' : '#222' } },
                      },
                    }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}

export default Dashboard
