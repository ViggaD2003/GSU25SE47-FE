import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Descriptions,
  Avatar,
  Tag,
  Divider,
  Alert,
} from 'antd'
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
  BookOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography

const CaseOverview = ({ caseInfo, _statistics }) => {
  const { t } = useTranslation()
  const formatDate = dateString => {
    return dayjs(dateString).format('DD/MM/YYYY')
  }

  const getGenderIcon = gender => {
    return gender ? (
      <ManOutlined style={{ color: '#1890ff' }} />
    ) : (
      <WomanOutlined style={{ color: '#eb2f96' }} />
    )
  }

  const getLevelColor = level => {
    switch (level?.code) {
      case 'L1':
        return 'green'
      case 'L2':
        return 'orange'
      case 'L3':
        return 'red'
      default:
        return 'default'
    }
  }

  const calculateAge = dob => {
    return dayjs().diff(dayjs(dob), 'year')
  }

  return (
    <>
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {/* Student Information */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <UserOutlined />
                {t('caseManagement.details.overview.studentInfo')}
              </Space>
            }
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space>
                <Avatar size={64} icon={<UserOutlined />} />
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    {caseInfo.student?.fullName}
                  </Title>
                  <Text type="secondary">
                    {t('caseManagement.table.studentCode')}:{' '}
                    {caseInfo.student?.studentCode}
                  </Text>
                </div>
              </Space>

              <Descriptions column={1} size="small">
                <Descriptions.Item
                  label={
                    <Space>
                      <MailOutlined />
                      {t('auth.login.email')}
                    </Space>
                  }
                >
                  {caseInfo.student?.email}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <PhoneOutlined />
                      {t('common.phone')}
                    </Space>
                  }
                >
                  {caseInfo.student?.phoneNumber}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      {getGenderIcon(caseInfo.student?.gender)}
                      {t('common.gender')}
                    </Space>
                  }
                >
                  {caseInfo.student?.gender
                    ? t('common.male')
                    : t('common.female')}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <CalendarOutlined />
                      {t('common.dateOfBirth')}
                    </Space>
                  }
                >
                  {formatDate(caseInfo.student?.dob)} (
                  {calculateAge(caseInfo.student?.dob)} {t('common.yearsOld')})
                </Descriptions.Item>
                <Descriptions.Item
                  label={t('caseManagement.details.overview.surveyEnabled')}
                >
                  <Tag
                    color={caseInfo.student?.isEnableSurvey ? 'green' : 'red'}
                  >
                    {caseInfo.student?.isEnableSurvey
                      ? t('common.enabled')
                      : t('common.disabled')}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Space>
          </Card>
        </Col>

        {/* Staff Information */}
        <Col xs={24} lg={12}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Teacher Information */}
            <Card
              title={
                <Space>
                  <UserOutlined />
                  {t('caseManagement.details.overview.createdBy')}
                </Space>
              }
              size="small"
            >
              <Space>
                <Avatar icon={<UserOutlined />} />
                <div>
                  <Text strong>{caseInfo.createBy?.fullName}</Text>
                  <br />
                  <Text type="secondary">
                    {t('caseManagement.table.teacherCode')}:{' '}
                    {caseInfo.createBy?.teacherCode}
                  </Text>
                  <br />
                  <Text type="secondary">{caseInfo.createBy?.email}</Text>
                </div>
              </Space>
            </Card>

            {/* Counselor Information */}
            {caseInfo.counselor && (
              <Card
                title={
                  <Space>
                    <UserOutlined />
                    {t('caseManagement.details.overview.counselor')}
                  </Space>
                }
                size="small"
              >
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <div>
                    <Text strong>{caseInfo.counselor?.fullName}</Text>
                    <br />
                    <Text type="secondary">
                      {t('caseManagement.table.counselorCode')}:{' '}
                      {caseInfo.counselor?.counselorCode}
                    </Text>
                    <br />
                    <Text type="secondary">{caseInfo.counselor?.email}</Text>
                  </div>
                </Space>
              </Card>
            )}
          </Space>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Basic Case Information */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BookOutlined />
                {t('caseManagement.details.overview.basicInfo')}
              </Space>
            }
          >
            <Descriptions column={1} styles={{ label: { fontWeight: 'bold' } }}>
              <Descriptions.Item label={t('caseManagement.table.title')}>
                {caseInfo.title}
              </Descriptions.Item>
              <Descriptions.Item label={t('caseManagement.table.description')}>
                <Paragraph style={{ margin: 0, maxWidth: 500 }}>
                  {caseInfo.description ||
                    t('caseManagement.table.noDescription')}
                </Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label={t('caseManagement.table.priority')}>
                <Tag
                  color={
                    caseInfo.priority === 'HIGH'
                      ? 'red'
                      : caseInfo.priority === 'MEDIUM'
                        ? 'orange'
                        : 'green'
                  }
                >
                  {t(`caseManagement.priorityOptions.${caseInfo.priority}`)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('caseManagement.table.status')}>
                <Tag
                  color={
                    caseInfo.status === 'NEW'
                      ? 'blue'
                      : caseInfo.status === 'IN_PROGRESS'
                        ? 'orange'
                        : 'green'
                  }
                >
                  {t(`caseManagement.statusOptions.${caseInfo.status}`)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item
                label={t('caseManagement.table.progressTrend')}
              >
                <Tag
                  color={
                    caseInfo.progressTrend === 'IMPROVED'
                      ? 'green'
                      : caseInfo.progressTrend === 'DECLINED'
                        ? 'red'
                        : 'orange'
                  }
                >
                  {t(
                    `caseManagement.progressTrendOptions.${caseInfo.progressTrend}`
                  )}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Level Information */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TrophyOutlined />
                {t('caseManagement.details.overview.levelInfo')}
              </Space>
            }
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>{t('caseManagement.table.initialLevel')}</Text>
                <div style={{ marginTop: 8 }}>
                  <Tag
                    color={getLevelColor(caseInfo.initialLevel)}
                    size="large"
                  >
                    {caseInfo.initialLevel?.label} (
                    {caseInfo.initialLevel?.code})
                  </Tag>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">
                      {caseInfo.initialLevel?.description}
                    </Text>
                  </div>
                </div>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <div>
                <Text strong>{t('caseManagement.table.currentLevel')}</Text>
                <div style={{ marginTop: 8 }}>
                  <Tag
                    color={getLevelColor(caseInfo.currentLevel)}
                    size="large"
                  >
                    {caseInfo.currentLevel?.label} (
                    {caseInfo.currentLevel?.code})
                  </Tag>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">
                      {caseInfo.currentLevel?.description}
                    </Text>
                  </div>
                </div>
              </div>

              {caseInfo.currentLevel?.interventionRequired !== 'None' && (
                <Alert
                  message={t(
                    'caseManagement.details.overview.interventionRequired'
                  )}
                  description={caseInfo.currentLevel?.interventionRequired}
                  type="warning"
                  icon={<ExclamationCircleOutlined />}
                  showIcon
                />
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default CaseOverview
