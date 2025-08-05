import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Typography,
  Avatar,
  Tooltip,
  Modal,
  Descriptions,
  Row,
  Col,
} from 'antd'
import {
  UserOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  TrophyOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const ParticipantList = ({ participants = [] }) => {
  const { t } = useTranslation()
  const [selectedParticipant, setSelectedParticipant] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const getStatusColor = status => {
    switch (status) {
      case 'ENROLLED':
        return 'blue'
      case 'COMPLETED':
        return 'green'
      case 'DROPPED':
        return 'red'
      case 'PENDING':
        return 'orange'
      default:
        return 'default'
    }
  }

  const getStatusIcon = status => {
    switch (status) {
      case 'ENROLLED':
        return <UserOutlined />
      case 'COMPLETED':
        return <TrophyOutlined />
      case 'DROPPED':
        return <UserOutlined />
      case 'PENDING':
        return <CalendarOutlined />
      default:
        return <UserOutlined />
    }
  }

  const formatDate = date => {
    if (!date) return '-'
    return dayjs(date).format('DD/MM/YYYY HH:mm')
  }

  const showParticipantDetails = participant => {
    setSelectedParticipant(participant)
    setIsModalVisible(true)
  }

  const columns = [
    {
      title: t('programManagement.details.participantTable.name'),
      dataIndex: 'student',
      key: 'name',
      render: student => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{student.fullName}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {student.studentCode}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: t('programManagement.details.participantTable.email'),
      dataIndex: 'student',
      key: 'email',
      render: student => (
        <Space>
          <MailOutlined />
          <Text>{student.email}</Text>
        </Space>
      ),
    },
    {
      title: t('programManagement.details.participantTable.phone'),
      dataIndex: 'student',
      key: 'phone',
      render: student => (
        <Space>
          <PhoneOutlined />
          <Text>{student.phoneNumber}</Text>
        </Space>
      ),
    },
    {
      title: t('programManagement.details.participantTable.joinDate'),
      dataIndex: 'joinAt',
      key: 'joinDate',
      render: joinAt => (
        <Space>
          <CalendarOutlined />
          <Text>{formatDate(joinAt)}</Text>
        </Space>
      ),
    },
    {
      title: t('programManagement.details.participantTable.status'),
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {t(`programManagement.details.status.${status.toLowerCase()}`)}
        </Tag>
      ),
    },
    {
      title: t('programManagement.details.participantTable.finalScore'),
      dataIndex: 'finalScore',
      key: 'finalScore',
      render: score => (
        <Space>
          <TrophyOutlined />
          <Text strong>
            {score !== null && score !== undefined ? score : '-'}
          </Text>
        </Space>
      ),
    },
    {
      title: t('programManagement.details.participantTable.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title={t('programManagement.details.viewParticipant')}>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => showParticipantDetails(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  if (Array.isArray(participants) && participants.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <TeamOutlined
            style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }}
          />
          <Title level={4} type="secondary">
            {t('programManagement.details.noParticipants')}
          </Title>
          <Text type="secondary">
            {t('programManagement.details.participant.noParticipantsEnrolled')}
          </Text>
        </div>
      </Card>
    )
  }

  return (
    <div>
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Title level={4}>
            <TeamOutlined /> {t('programManagement.details.participants')} (
            {Array.isArray(participants) ? participants.length : 0})
          </Title>
        </div>

        <Table
          columns={columns}
          dataSource={participants ?? []}
          rowKey={record => record.id}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} participants`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Participant Details Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            {t('programManagement.details.participantInfo')}
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            {t('common.close')}
          </Button>,
        ]}
        width={600}
      >
        {selectedParticipant && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Descriptions
                  title={t('programManagement.details.participant.studentInfo')}
                  column={1}
                >
                  <Descriptions.Item
                    label={t('programManagement.details.participant.name')}
                  >
                    {selectedParticipant.student.fullName}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={t(
                      'programManagement.details.participant.studentCode'
                    )}
                  >
                    {selectedParticipant.student.studentCode}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={t('programManagement.details.participant.email')}
                  >
                    {selectedParticipant.student.email}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={t('programManagement.details.participant.phone')}
                  >
                    {selectedParticipant.student.phoneNumber}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={t('programManagement.details.participant.gender')}
                  >
                    {selectedParticipant.student.gender
                      ? t('common.male')
                      : t('common.female')}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={t(
                      'programManagement.details.participant.dateOfBirth'
                    )}
                  >
                    {dayjs(selectedParticipant.student.dob).format(
                      'DD/MM/YYYY'
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Col>

              <Col span={24}>
                <Descriptions
                  title={t(
                    'programManagement.details.participant.enrollmentInfo'
                  )}
                  column={1}
                >
                  <Descriptions.Item
                    label={t('programManagement.details.participant.joinDate')}
                  >
                    {formatDate(selectedParticipant.joinAt)}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={t('programManagement.details.participant.status')}
                  >
                    <Tag
                      color={getStatusColor(selectedParticipant.status)}
                      icon={getStatusIcon(selectedParticipant.status)}
                    >
                      {t(
                        `programManagement.details.status.${selectedParticipant.status.toLowerCase()}`
                      )}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={t(
                      'programManagement.details.participant.finalScore'
                    )}
                  >
                    {selectedParticipant.finalScore !== null &&
                    selectedParticipant.finalScore !== undefined
                      ? selectedParticipant.finalScore
                      : t('programManagement.details.participant.notAvailable')}
                  </Descriptions.Item>
                </Descriptions>
              </Col>

              {selectedParticipant.cases && (
                <Col span={24}>
                  <Descriptions
                    title={t('programManagement.details.participant.caseInfo')}
                    column={1}
                  >
                    <Descriptions.Item
                      label={t(
                        'programManagement.details.participant.caseTitle'
                      )}
                    >
                      {selectedParticipant.cases.title}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={t(
                        'programManagement.details.participant.caseDescription'
                      )}
                    >
                      {selectedParticipant.cases.description ||
                        t(
                          'programManagement.details.participant.noDescription'
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={t(
                        'programManagement.details.participant.priority'
                      )}
                    >
                      <Tag
                        color={
                          selectedParticipant.cases.priority === 'HIGH'
                            ? 'red'
                            : selectedParticipant.cases.priority === 'MEDIUM'
                              ? 'orange'
                              : 'green'
                        }
                      >
                        {selectedParticipant.cases.priority}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={t(
                        'programManagement.details.participant.caseStatus'
                      )}
                    >
                      <Tag
                        color={
                          selectedParticipant.cases.status === 'IN_PROGRESS'
                            ? 'blue'
                            : selectedParticipant.cases.status === 'CLOSED'
                              ? 'green'
                              : 'orange'
                        }
                      >
                        {selectedParticipant.cases.status}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ParticipantList
