import React from 'react'
import {
  Card,
  Collapse,
  Typography,
  Tag,
  Space,
  List,
  Alert,
  Row,
  Col,
  Divider,
  Button,
} from 'antd'
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  BulbOutlined,
  TeamOutlined,
  CalendarOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'

const { Text, Title } = Typography
const { Panel } = Collapse

const ProgramCreationHelper = ({ visible, onClose }) => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()

  if (!visible) return null

  //   const programTypes = [
  //     {
  //       type: 'counseling',
  //       participants: '10-15',
  //       duration: '4-8 weeks',
  //       format: 'offline',
  //       color: 'blue',
  //     },
  //     {
  //       type: 'skillsDevelopment',
  //       participants: '15-25',
  //       duration: '6-12 weeks',
  //       format: 'hybrid',
  //       color: 'green',
  //     },
  //     {
  //       type: 'groupTherapy',
  //       participants: '8-12',
  //       duration: '8-16 weeks',
  //       format: 'offline',
  //       color: 'orange',
  //     },
  //     {
  //       type: 'workshop',
  //       participants: '20-40',
  //       duration: '1-3 days',
  //       format: 'online',
  //       color: 'purple',
  //     },
  //     {
  //       type: 'support',
  //       participants: '10-20',
  //       duration: '4-6 weeks',
  //       format: 'hybrid',
  //       color: 'cyan',
  //     },
  //   ]

  const guidelines = [
    {
      icon: <TeamOutlined className="text-blue-500" />,
      title: t('programHelper.guidelines.participants.title'),
      rules: [
        t('programHelper.guidelines.participants.rule1'),
        t('programHelper.guidelines.participants.rule2'),
        t('programHelper.guidelines.participants.rule3'),
        t('programHelper.guidelines.participants.rule4'),
      ],
    },
    {
      icon: <CalendarOutlined className="text-green-500" />,
      title: t('programHelper.guidelines.duration.title'),
      rules: [
        t('programHelper.guidelines.duration.rule1'),
        t('programHelper.guidelines.duration.rule2'),
        t('programHelper.guidelines.duration.rule3'),
        t('programHelper.guidelines.duration.rule4'),
      ],
    },
    {
      icon: <GlobalOutlined className="text-purple-500" />,
      title: t('programHelper.guidelines.format.title'),
      rules: [
        t('programHelper.guidelines.format.rule1'),
        t('programHelper.guidelines.format.rule2'),
        t('programHelper.guidelines.format.rule3'),
        t('programHelper.guidelines.format.rule4'),
      ],
    },
    {
      icon: <EnvironmentOutlined className="text-orange-500" />,
      title: t('programHelper.guidelines.content.title'),
      rules: [
        t('programHelper.guidelines.content.rule1'),
        t('programHelper.guidelines.content.rule2'),
        t('programHelper.guidelines.content.rule3'),
        t('programHelper.guidelines.content.rule4'),
      ],
    },
  ]

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BulbOutlined className="text-yellow-500" />
            <Title level={4} className="mb-0">
              {t('programHelper.title')}
            </Title>
          </div>
          <Button type="text" onClick={onClose} size="small">
            ×
          </Button>
        </div>
      }
      size="small"
      className={`mb-4 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
      }`}
    >
      <Alert
        message={t('programHelper.welcome.title')}
        description={t('programHelper.welcome.description')}
        type="info"
        showIcon
        className="mb-4"
      />

      <Collapse
        defaultActiveKey={['types', 'guidelines']}
        className="mb-4"
        size="small"
      >
        {/* Program Types */}
        {/* <Panel
          header={
            <div className="flex items-center space-x-2">
              <InfoCircleOutlined className="text-blue-500" />
              <Text strong>{t('programHelper.types.title')}</Text>
            </div>
          }
          key="types"
        >
          <Row gutter={[16, 16]}>
            {programTypes.map((program, index) => (
              <Col xs={24} md={12} key={index}>
                <Card
                  size="small"
                  className={`h-full ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Text strong>
                        {t(`programHelper.types.${program.type}.name`)}
                      </Text>
                      <Tag color={program.color}>
                        {t(`programHelper.types.${program.type}.category`)}
                      </Tag>
                    </div>
                    <Text type="secondary" className="text-sm">
                      {t(`programHelper.types.${program.type}.description`)}
                    </Text>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <Text className="text-xs">
                          {t('programHelper.types.participants')}:
                        </Text>
                        <Text className="text-xs font-medium">
                          {program.participants}
                        </Text>
                      </div>
                      <div className="flex justify-between">
                        <Text className="text-xs">
                          {t('programHelper.types.duration')}:
                        </Text>
                        <Text className="text-xs font-medium">
                          {program.duration}
                        </Text>
                      </div>
                      <div className="flex justify-between">
                        <Text className="text-xs">
                          {t('programHelper.types.format')}:
                        </Text>
                        <Text className="text-xs font-medium">
                          {t(`programHelper.types.formats.${program.format}`)}
                        </Text>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Panel> */}

        {/* Guidelines */}
        <Panel
          header={
            <div className="flex items-center space-x-2">
              <CheckCircleOutlined className="text-green-500" />
              <Text strong>{t('programHelper.guidelines.title')}</Text>
            </div>
          }
          key="guidelines"
        >
          <div className="space-y-4">
            {guidelines.map((guideline, index) => (
              <div key={index}>
                <div className="flex items-center space-x-2 mb-2">
                  {guideline.icon}
                  <Text strong className="text-sm">
                    {guideline.title}
                  </Text>
                </div>
                <List
                  size="small"
                  dataSource={guideline.rules}
                  renderItem={rule => (
                    <List.Item className="px-0 py-1">
                      <div className="flex items-start space-x-2">
                        <CheckCircleOutlined className="text-green-500 text-xs mt-1 flex-shrink-0" />
                        <Text className="text-sm">{rule}</Text>
                      </div>
                    </List.Item>
                  )}
                />
                {index < guidelines.length - 1 && <Divider className="my-3" />}
              </div>
            ))}
          </div>
        </Panel>

        {/* Best Practices */}
        <Panel
          header={
            <div className="flex items-center space-x-2">
              <BulbOutlined className="text-yellow-500" />
              <Text strong>{t('programHelper.bestPractices.title')}</Text>
            </div>
          }
          key="bestPractices"
        >
          <div className="space-y-3">
            <Alert
              message={t('programHelper.bestPractices.preparation.title')}
              description={
                <List
                  size="small"
                  dataSource={[
                    t('programHelper.bestPractices.preparation.tip1'),
                    t('programHelper.bestPractices.preparation.tip2'),
                    t('programHelper.bestPractices.preparation.tip3'),
                  ]}
                  renderItem={tip => (
                    <List.Item className="px-0 py-1">
                      <Text className="text-sm">• {tip}</Text>
                    </List.Item>
                  )}
                />
              }
              type="warning"
              showIcon
              className="mb-3"
            />

            <Alert
              message={t('programHelper.bestPractices.execution.title')}
              description={
                <List
                  size="small"
                  dataSource={[
                    t('programHelper.bestPractices.execution.tip1'),
                    t('programHelper.bestPractices.execution.tip2'),
                    t('programHelper.bestPractices.execution.tip3'),
                  ]}
                  renderItem={tip => (
                    <List.Item className="px-0 py-1">
                      <Text className="text-sm">• {tip}</Text>
                    </List.Item>
                  )}
                />
              }
              type="success"
              showIcon
            />
          </div>
        </Panel>

        {/* Common Mistakes */}
        <Panel
          header={
            <div className="flex items-center space-x-2">
              <QuestionCircleOutlined className="text-red-500" />
              <Text strong>{t('programHelper.mistakes.title')}</Text>
            </div>
          }
          key="mistakes"
        >
          <Alert
            message={t('programHelper.mistakes.warning')}
            type="error"
            showIcon
            className="mb-3"
          />
          <List
            size="small"
            dataSource={[
              t('programHelper.mistakes.mistake1'),
              t('programHelper.mistakes.mistake2'),
              t('programHelper.mistakes.mistake3'),
              t('programHelper.mistakes.mistake4'),
              t('programHelper.mistakes.mistake5'),
            ]}
            renderItem={mistake => (
              <List.Item className="px-0 py-1">
                <div className="flex items-start space-x-2">
                  <Text className="text-red-500 font-bold text-xs mt-1">×</Text>
                  <Text className="text-sm">{mistake}</Text>
                </div>
              </List.Item>
            )}
          />
        </Panel>
      </Collapse>

      <div className="text-center pt-2 border-t border-gray-200">
        <Text type="secondary" className="text-xs">
          {t('programHelper.footer')}
        </Text>
      </div>
    </Card>
  )
}

export default ProgramCreationHelper
