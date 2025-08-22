import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Tag,
  Image,
  Descriptions,
  Divider,
} from 'antd'
import {
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  FileTextOutlined,
  TagOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography

const ProgramOverview = ({ program }) => {
  const { t } = useTranslation()

  const getStatusColor = status => {
    switch (status) {
      case 'ACTIVE':
        return 'green'
      case 'PLANNING':
        return 'blue'
      case 'ON_GOING':
        return 'orange'
      case 'COMPLETED':
        return 'purple'
      default:
        return 'default'
    }
  }

  const formatDate = date => {
    if (!date) return 'N/A'
    return dayjs(date).format('DD/MM/YYYY')
  }

  // const formatDateTime = date => {
  //   if (!date) return t('programManagement.details.noDescription')
  //   return dayjs(date).format('DD/MM/YYYY HH:mm')
  // }

  return (
    <div>
      <Row gutter={[24, 24]}>
        {/* Program Image and Basic Info */}
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              {program.thumbnail ? (
                <Image
                  src={program.thumbnail}
                  alt={program.name}
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAA"
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '200px',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                  }}
                >
                  <Text type="secondary">
                    {t('programManagement.details.thumbnail')}
                  </Text>
                </div>
              )}
            </div>

            <Descriptions column={1} size="small">
              <Descriptions.Item
                label={t('programManagement.details.status.title')}
              >
                <Tag color={getStatusColor(program.status)}>
                  {t(`programManagement.status.${program.status}`)}
                </Tag>
              </Descriptions.Item>

              {program.category && (
                <Descriptions.Item
                  label={t('programManagement.details.category')}
                >
                  <Tag color="blue" icon={<TagOutlined />}>
                    {program.category.name}
                  </Tag>
                </Descriptions.Item>
              )}

              <Descriptions.Item
                label={t('programManagement.details.maxParticipants')}
              >
                <Text strong>{program.maxParticipants}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Program Details */}
        <Col xs={24} lg={16}>
          <Card>
            <Title level={4} style={{ marginBottom: '16px' }}>
              {t('programManagement.details.basicInfo')}
            </Title>

            <Descriptions column={2} size="small">
              <Descriptions.Item
                label={t('programManagement.details.hostedBy')}
                span={2}
              >
                <Space>
                  <UserOutlined />
                  <Text>
                    {program.hostedBy?.fullName ||
                      t('programManagement.details.noDescription')}
                  </Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item
                label={t('programManagement.details.startDate')}
                span={1}
              >
                <Space>
                  <CalendarOutlined />
                  <Text>{formatDate(program.startTime)}</Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item
                label={t('programManagement.details.endDate')}
                span={1}
              >
                <Space>
                  <CalendarOutlined />
                  <Text>{formatDate(program.endTime)}</Text>
                </Space>
              </Descriptions.Item>

              {program.linkMeet && (
                <Descriptions.Item
                  label={t('programManagement.details.meetingLink')}
                >
                  <Space>
                    <LinkOutlined />
                    <a
                      href={program.linkMeet}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('programManagement.details.meetingLink')}
                    </a>
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            <Title level={4} style={{ marginBottom: '16px' }}>
              {t('programManagement.details.description')}
            </Title>

            <Paragraph>
              {program.description ||
                t('programManagement.details.noDescription')}
            </Paragraph>

            {program.programSurvey && (
              <>
                <Divider />
                <Title level={4} style={{ marginBottom: '16px' }}>
                  {t('programManagement.details.surveyInfo.title')}
                </Title>

                <Descriptions column={2} size="small">
                  <Descriptions.Item
                    label={t('programManagement.details.surveyInfo.title')}
                    span={2}
                  >
                    <Space>
                      <FileTextOutlined />
                      <Text>{program.programSurvey.title}</Text>
                    </Space>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={t('programManagement.details.surveyInfo.status')}
                  >
                    <Tag
                      color={
                        program.programSurvey.status === 'ACTIVE'
                          ? 'green'
                          : 'orange'
                      }
                    >
                      {program.programSurvey.status}
                    </Tag>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={t('programManagement.details.surveyInfo.required')}
                  >
                    <Tag
                      color={program.programSurvey.isRequired ? 'red' : 'green'}
                    >
                      {program.programSurvey.isRequired
                        ? t('common.yes')
                        : t('common.no')}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ProgramOverview
