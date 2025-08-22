import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Tag,
  Descriptions,
  Divider,
  Button,
  Empty,
  message,
} from 'antd'
import {
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  TagOutlined,
  LinkOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import SurveyDetailModal from '@/pages/main/SurveyManagement/SurveyDetailModal'
import { useDispatch, useSelector } from 'react-redux'

const { Title, Text, Paragraph } = Typography

const SurveyInfo = ({ survey }) => {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const { messageApi, contextHolder } = message.useMessage()
  const userRole = useSelector(state => state.auth.user?.role)
  const dispatch = useDispatch()

  if (!survey) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <FileTextOutlined
            style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }}
          />
          <Title level={4} type="secondary">
            {t('programManagement.details.noSurvey')}
          </Title>
          <Text type="secondary">
            {t('programManagement.details.surveyInfo.noSurveyAssigned')}
          </Text>
        </div>
      </Card>
    )
  }

  const getStatusColor = status => {
    switch (status) {
      case 'ACTIVE':
        return 'green'
      case 'DRAFT':
        return 'orange'
      case 'INACTIVE':
        return 'red'
      case 'COMPLETED':
        return 'purple'
      case 'PLANNING':
        return 'cyan'
      case 'ON_GOING':
        return 'gold'
      case 'PUBLISHED':
        return 'blue'
      default:
        return 'default'
    }
  }

  const getStatusIcon = status => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleOutlined />
      case 'DRAFT':
        return <ClockCircleOutlined />
      case 'INACTIVE':
        return <CloseCircleOutlined />
      case 'COMPLETED':
        return <CheckCircleOutlined />
      default:
        return <ClockCircleOutlined />
    }
  }

  const formatDate = date => {
    if (!date) return t('programManagement.details.noDescription')
    return dayjs(date).format('DD/MM/YYYY')
  }

  const formatDateTime = date => {
    if (!date) return t('programManagement.details.noDescription')
    return dayjs(date).format('DD/MM/YYYY HH:mm')
  }

  return (
    <div>
      {contextHolder}
      <Button
        type="primary"
        onClick={() => setVisible(true)}
        style={{ marginTop: '10px', float: 'right', marginBottom: '10px' }}
      >
        {t('programManagement.details.surveyInfo.view')}
      </Button>
      <Divider />
      <Row gutter={[24, 24]}>
        {/* View survey detail */}
        {/* Survey Basic Information */}
        <Col xs={24} lg={12}>
          <Card>
            <Title level={4} style={{ marginBottom: '16px' }}>
              <FileTextOutlined />{' '}
              {t('programManagement.details.surveyInfo.title')}
            </Title>

            <Descriptions column={1} size="small">
              <Descriptions.Item
                label={t('programManagement.details.surveyInfo.title')}
              >
                <Text strong>{survey.title}</Text>
              </Descriptions.Item>

              <Descriptions.Item
                label={t('programManagement.details.surveyInfo.status')}
              >
                <Tag
                  color={getStatusColor(survey.status)}
                  icon={getStatusIcon(survey.status)}
                >
                  {survey.status}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item
                label={t('programManagement.details.surveyInfo.type')}
              >
                <Tag color="blue">{survey.surveyType}</Tag>
              </Descriptions.Item>

              <Descriptions.Item
                label={t('programManagement.details.surveyInfo.required')}
              >
                <Tag color={survey.isRequired ? 'red' : 'green'}>
                  {survey.isRequired ? t('common.yes') : t('common.no')}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item
                label={t('programManagement.details.surveyInfo.recurring')}
              >
                <Tag color={survey.isRecurring ? 'blue' : 'default'}>
                  {survey.isRecurring ? t('common.yes') : t('common.no')}
                </Tag>
              </Descriptions.Item>

              {survey.isRecurring && (
                <Descriptions.Item
                  label={t(
                    'programManagement.details.surveyInfo.recurringCycle'
                  )}
                >
                  <Tag color="purple">{survey.recurringCycle}</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Survey Schedule */}
        <Col xs={24} lg={12}>
          <Card>
            <Title level={4} style={{ marginBottom: '16px' }}>
              <CalendarOutlined />{' '}
              {t('programManagement.details.surveyInfo.schedule')}
            </Title>

            <Descriptions column={1} size="small">
              <Descriptions.Item
                label={t('programManagement.details.startDate')}
              >
                <Space>
                  <CalendarOutlined />
                  <Text>{formatDate(survey.startDate)}</Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label={t('programManagement.details.endDate')}>
                <Space>
                  <CalendarOutlined />
                  <Text>{formatDate(survey.endDate)}</Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item
                label={t('programManagement.details.surveyInfo.createdAt')}
              >
                <Space>
                  <CalendarOutlined />
                  <Text>{formatDateTime(survey.createdAt)}</Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item
                label={t('programManagement.details.surveyInfo.updatedAt')}
              >
                <Space>
                  <CalendarOutlined />
                  <Text>{formatDateTime(survey.updatedAt)}</Text>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Survey Description */}
        <Col span={24}>
          <Card>
            <Title level={4} style={{ marginBottom: '16px' }}>
              {t('programManagement.details.description')}
            </Title>
            <Paragraph>
              {survey.description ||
                t('programManagement.details.noDescription')}
            </Paragraph>
          </Card>
        </Col>

        {/* Survey Category */}
        {survey.category && (
          <Col span={24}>
            <Card>
              <Title level={4} style={{ marginBottom: '16px' }}>
                <TagOutlined />{' '}
                {t('programManagement.details.surveyInfo.categoryInfo')}
              </Title>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item
                      label={t(
                        'programManagement.details.surveyInfo.categoryName'
                      )}
                    >
                      <Tag color="blue" icon={<TagOutlined />}>
                        {survey.category.name}
                      </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item
                      label={t(
                        'programManagement.details.surveyInfo.categoryCode'
                      )}
                    >
                      <Text code>{survey.category.code}</Text>
                    </Descriptions.Item>

                    <Descriptions.Item
                      label={t('programManagement.details.description')}
                    >
                      <Text>{survey.category.description}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                <Col xs={24} sm={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item
                      label={t(
                        'programManagement.details.surveyInfo.questionLength'
                      )}
                    >
                      <Text strong>{survey.category.questionLength}</Text>
                    </Descriptions.Item>

                    <Descriptions.Item
                      label={t(
                        'programManagement.details.surveyInfo.severityWeight'
                      )}
                    >
                      <Text strong>{survey.category.severityWeight}</Text>
                    </Descriptions.Item>

                    <Descriptions.Item
                      label={t('programManagement.details.surveyInfo.active')}
                    >
                      <Tag color={survey.category.isActive ? 'green' : 'red'}>
                        {survey.category.isActive
                          ? t('common.yes')
                          : t('common.no')}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>
          </Col>
        )}
      </Row>

      <SurveyDetailModal
        t={t}
        visible={visible}
        onClose={() => setVisible(false)}
        surveyId={survey.surveyId}
        onUpdated={() => {}}
        messageApi={messageApi}
        userRole={userRole}
        dispatch={dispatch}
      />
    </div>
  )
}

export default SurveyInfo
