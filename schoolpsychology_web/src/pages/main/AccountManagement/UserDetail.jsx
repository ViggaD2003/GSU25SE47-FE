import React, { useEffect, useState, useCallback } from 'react'
import {
  Card,
  Avatar,
  Tag,
  Skeleton,
  Empty,
  Button,
  Divider,
  Space,
  Row,
  Col,
  Statistic,
  Typography,
} from 'antd'
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  IdcardOutlined,
  TeamOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  HomeOutlined,
  GlobalOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import api from '@/services/api'
import CaseTable from '../CaseManagement/CaseTable'
import { useParams } from 'react-router-dom'

const { Title, Text } = Typography

const UserDetail = () => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const { id } = useParams()

  const fetchUserDetail = useCallback(async userId => {
    try {
      setLoading(true)
      const response = await api.get(
        `/api/v1/account/students/details?accountId=${userId}`
      )
      if (response.status === 200) {
        setUser(response.data)
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUserDetail(id)
  }, [id, fetchUserDetail])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Empty description={t('common.noData')} className="dark:text-white" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <Title
            level={2}
            className={isDarkMode ? 'text-white' : 'text-gray-900'}
          >
            {t('userDetail.studentDetails')}
          </Title>
        </div>
        <div className="flex items-end space-x-3">
          <Button icon={<ReloadOutlined />} onClick={() => fetchUserDetail(id)}>
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Main Content */}
        <Col xs={24} lg={16}>
          {/* Basic Information */}
          <Card
            title={
              <div className="flex items-center">
                <UserOutlined className="mr-2 text-blue-600" />
                {t('userDetail.basicInformation')}
              </div>
            }
            className={`mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div className="flex items-center space-x-3 mb-4">
                  <MailOutlined className="text-gray-400" />
                  <div>
                    <div
                      className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      {t('common.email', 'Email')}
                    </div>
                    <div
                      className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      {user.email}
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="flex items-center space-x-3 mb-4">
                  <PhoneOutlined className="text-gray-400" />
                  <div>
                    <div
                      className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {t('common.phone')}
                    </div>
                    <div
                      className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      {user.phoneNumber}
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="flex items-center space-x-3 mb-4">
                  <CalendarOutlined className="text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t('common.dateOfBirth')}
                    </div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      {user.dob ?? '-'}
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="flex items-center space-x-3 mb-4">
                  <IdcardOutlined className="text-gray-400" />
                  <div>
                    <div
                      className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {t('userDetail.studentCode')}
                    </div>
                    <div
                      className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      {user.studentCode}
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-gray-400">👤</div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t('common.gender')}
                    </div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      {user.gender ? t('common.male') : t('common.female')}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>

            <Divider />

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('userDetail.surveyStatus')}:
              </span>
              <Tag
                color={user.isEnableSurvey ? 'success' : 'error'}
                icon={
                  user.isEnableSurvey ? (
                    <CheckCircleOutlined />
                  ) : (
                    <CloseCircleOutlined />
                  )
                }
              >
                {user.isEnableSurvey
                  ? t('userDetail.surveyEnabled')
                  : t('userDetail.surveyDisabled')}
              </Tag>
            </div>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          {/* Parent Information */}
          <Card
            title={
              <div className="flex items-center">
                <TeamOutlined className="mr-2 text-green-600" />
                {t('userDetail.parentInformation')}
              </div>
            }
            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
          >
            {user.parents && user.parents.length > 0 ? (
              <div className="space-y-4">
                {user.parents.map(parent => (
                  <Card
                    key={parent.id}
                    size="small"
                    className="border-l-4 border-l-green-500"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          size="small"
                          icon={<UserOutlined />}
                          className="bg-green-500"
                        />
                        <div className="font-medium text-gray-900 dark:text-white">
                          {parent.fullName}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <MailOutlined className="text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {parent.email}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <PhoneOutlined className="text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {parent.phoneNumber}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CalendarOutlined className="text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {parent.dob}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <HomeOutlined className="text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {parent.address}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-gray-400">👤</div>
                          <span className="text-gray-600 dark:text-gray-300">
                            {parent.gender
                              ? t('common.male')
                              : t('common.female')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty
                description={t('userDetail.noParentInformation')}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>
      {/* Support Cases */}
      <Card
        title={
          <div className="flex items-center">
            <FileTextOutlined className="mr-2 text-purple-600" />
            {t('userDetail.supportCases')}
          </div>
        }
        className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}
      >
        {user.cases && user.cases.length > 0 ? (
          <div className="space-y-6">
            <CaseTable
              user={user}
              filteredCases={user.cases}
              loading={loading}
              t={t}
              hideStudent={true}
            />
          </div>
        ) : (
          <Empty
            description={t('userDetail.noSupportCases')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </div>
  )
}

export default UserDetail
