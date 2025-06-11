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
} from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  HeartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/ThemeContext'
const { Title, Text } = Typography

const Dashboard = () => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()

  // Mock data for demonstration
  const stats = [
    {
      title: 'Total Students',
      value: 1284,
      prefix: <UserOutlined />,
      suffix: '',
      precision: 0,
      valueStyle: { color: '#3f8600' },
      change: { value: 12.5, isPositive: true },
    },
    {
      title: 'Active Sessions',
      value: 43,
      prefix: <TeamOutlined />,
      suffix: '',
      precision: 0,
      valueStyle: { color: '#cf1322' },
      change: { value: 2.3, isPositive: false },
    },
    {
      title: 'Support Programs',
      value: 18,
      prefix: <HeartOutlined />,
      suffix: '',
      precision: 0,
      valueStyle: { color: '#1890ff' },
      change: { value: 5.7, isPositive: true },
    },
    {
      title: 'Resources',
      value: 267,
      prefix: <BookOutlined />,
      suffix: '',
      precision: 0,
      valueStyle: { color: '#722ed1' },
      change: { value: 8.1, isPositive: true },
    },
  ]

  const recentActivities = [
    {
      id: 1,
      title: 'New student enrolled in anxiety support program',
      description:
        'John Doe has been enrolled in the anxiety management program',
      time: '2 hours ago',
      type: 'enrollment',
      avatar: <UserOutlined />,
    },
    {
      id: 2,
      title: 'Session completed',
      description: 'Group therapy session completed with 8 participants',
      time: '4 hours ago',
      type: 'session',
      avatar: <TeamOutlined />,
    },
    {
      id: 3,
      title: 'New resource added',
      description: 'Mental health guide for teenagers added to library',
      time: '1 day ago',
      type: 'resource',
      avatar: <BookOutlined />,
    },
    {
      id: 4,
      title: 'Program milestone reached',
      description: 'Stress management program reached 100% completion rate',
      time: '2 days ago',
      type: 'milestone',
      avatar: <HeartOutlined />,
    },
  ]

  const getTypeColor = type => {
    const colors = {
      enrollment: 'blue',
      session: 'green',
      resource: 'purple',
      milestone: 'gold',
    }
    return colors[type] || 'default'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
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

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-shadow`}
            >
              <Statistic
                title={stat.title}
                value={stat.value}
                precision={stat.precision}
                valueStyle={stat.valueStyle}
                prefix={stat.prefix}
                suffix={
                  <div className="flex items-center space-x-2">
                    <span>{stat.suffix}</span>
                    <span
                      className={`text-xs flex items-center ${
                        stat.change.isPositive
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {stat.change.isPositive ? (
                        <ArrowUpOutlined />
                      ) : (
                        <ArrowDownOutlined />
                      )}
                      {stat.change.value}%
                    </span>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Recent Activities */}
        <Col xs={24} lg={16}>
          <Card
            title="Recent Activities"
            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={item.avatar}
                        className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                      />
                    }
                    title={
                      <div className="flex items-center space-x-3">
                        <span
                          className={
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }
                        >
                          {item.title}
                        </span>
                        <Tag color={getTypeColor(item.type)}>{item.type}</Tag>
                      </div>
                    }
                    description={
                      <div>
                        <p
                          className={
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }
                        >
                          {item.description}
                        </p>
                        <p
                          className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                          {item.time}
                        </p>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Progress Overview */}
        <Col xs={24} lg={8}>
          <Card
            title="Program Progress"
            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Text
                    className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                  >
                    Anxiety Support
                  </Text>
                  <Text
                    className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                  >
                    85%
                  </Text>
                </div>
                <Progress percent={85} strokeColor="#52c41a" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Text
                    className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                  >
                    Stress Management
                  </Text>
                  <Text
                    className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                  >
                    72%
                  </Text>
                </div>
                <Progress percent={72} strokeColor="#1890ff" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Text
                    className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                  >
                    Social Skills
                  </Text>
                  <Text
                    className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                  >
                    94%
                  </Text>
                </div>
                <Progress percent={94} strokeColor="#722ed1" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Text
                    className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                  >
                    Mindfulness
                  </Text>
                  <Text
                    className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                  >
                    68%
                  </Text>
                </div>
                <Progress percent={68} strokeColor="#fa8c16" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
