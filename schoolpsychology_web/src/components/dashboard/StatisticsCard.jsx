import React, { memo } from 'react'
import { Card, Statistic, Row, Col } from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  PlayCircleOutlined,
  StopOutlined,
} from '@ant-design/icons'

const StatisticsCard = memo(({ statistics, isDarkMode, t }) => {
  const getStatusIcon = status => {
    switch (status) {
      case 'total':
        return <CalendarOutlined />
      case 'pending':
        return <ClockCircleOutlined />
      case 'confirmed':
        return <UserOutlined />
      case 'inProgress':
        return <PlayCircleOutlined />
      case 'completed':
        return <CheckCircleOutlined />
      case 'cancelled':
        return <CloseCircleOutlined />
      case 'absent':
        return <StopOutlined />
      case 'expired':
        return <ExclamationCircleOutlined />
      default:
        return <CalendarOutlined />
    }
  }

  const getStatusColor = status => {
    switch (status) {
      case 'total':
        return '#1890ff'
      case 'pending':
        return '#faad14'
      case 'confirmed':
        return '#1890ff'
      case 'inProgress':
        return '#722ed1'
      case 'completed':
        return '#52c41a'
      case 'cancelled':
        return '#ff4d4f'
      case 'absent':
        return '#ff4d4f'
      case 'expired':
        return '#8c8c8c'
      default:
        return '#1890ff'
    }
  }

  const stats = [
    {
      key: 'total',
      title: t('appointment.statistics.total', 'Total'),
      value: statistics.total,
      icon: getStatusIcon('total'),
      color: getStatusColor('total'),
    },
    {
      key: 'pending',
      title: t('appointment.statistics.pending', 'Pending'),
      value: statistics.pending,
      icon: getStatusIcon('pending'),
      color: getStatusColor('pending'),
    },
    {
      key: 'confirmed',
      title: t('appointment.statistics.confirmed', 'Confirmed'),
      value: statistics.confirmed,
      icon: getStatusIcon('confirmed'),
      color: getStatusColor('confirmed'),
    },
    {
      key: 'inProgress',
      title: t('appointment.statistics.inProgress', 'In Progress'),
      value: statistics.inProgress,
      icon: getStatusIcon('inProgress'),
      color: getStatusColor('inProgress'),
    },
    {
      key: 'completed',
      title: t('appointment.statistics.completed', 'Completed'),
      value: statistics.completed,
      icon: getStatusIcon('completed'),
      color: getStatusColor('completed'),
    },
    {
      key: 'cancelled',
      title: t('appointment.statistics.cancelled', 'Cancelled'),
      value: statistics.cancelled,
      icon: getStatusIcon('cancelled'),
      color: getStatusColor('cancelled'),
    },
    {
      key: 'absent',
      title: t('appointment.statistics.absent', 'Absent'),
      value: statistics.absent,
      icon: getStatusIcon('absent'),
      color: getStatusColor('absent'),
    },
    {
      key: 'expired',
      title: t('appointment.statistics.expired', 'Expired'),
      value: statistics.expired,
      icon: getStatusIcon('expired'),
      color: getStatusColor('expired'),
    },
  ]

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-blue-500" />
          {t('appointment.statistics.title', 'Appointment Statistics')}
        </div>
      }
      className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}
    >
      <Row gutter={[16, 16]}>
        {stats.map(stat => (
          <Col xs={12} sm={8} md={6} lg={3} key={stat.key}>
            <Card
              size="small"
              className={`text-center border-l-4 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`}
              style={{ borderLeftColor: stat.color }}
            >
              <Statistic
                title={
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <span style={{ color: stat.color }}>{stat.icon}</span>
                    <span
                      className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                    >
                      {stat.title}
                    </span>
                  </div>
                }
                value={stat.value}
                valueStyle={{
                  color: stat.color,
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  )
})

StatisticsCard.displayName = 'StatisticsCard'

export default StatisticsCard
