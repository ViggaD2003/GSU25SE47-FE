import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Spin,
  message,
  Tabs,
  Tag,
  Image,
  Divider,
  Statistic,
  Progress,
  Empty,
  Modal,
} from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BarChartOutlined,
  FileTextOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'

import { getProgramById } from '@/store/actions/programActions'
import { clearProgram } from '@/store/slices/programSlice'
import {
  ProgramOverview,
  ProgramStatistics,
  ParticipantList,
  SurveyInfo,
  ProgramCharts,
} from './components'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
// const { confirm } = Modal

const ProgramDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [messageApi, contextHolder] = message.useMessage()

  const { program, loading, error } = useSelector(state => state.program)
  const [activeTab, setActiveTab] = useState('overview')
  const [isInitialized, setIsInitialized] = useState(false)
  console.log(program)

  // Fetch program details on component mount
  useEffect(() => {
    if (id) {
      setIsInitialized(false)
      dispatch(getProgramById(id))
        .unwrap()
        .then(() => {
          setIsInitialized(true)
        })
        .catch(() => {
          setIsInitialized(true)
        })
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearProgram())
    }
  }, [dispatch, id])

  // Handle error messages
  useEffect(() => {
    if (error && isInitialized) {
      messageApi.error(t('programManagement.details.error'))
    }
  }, [error, t, messageApi, isInitialized])

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!program) return null

    const participants = Array.isArray(program.participants)
      ? program.participants
      : []
    const totalParticipants = participants.length
    const maxParticipants = program.maxParticipants || 0
    const enrolledCount = participants.filter(
      p => p.status === 'ENROLLED'
    ).length
    const completedCount = participants.filter(
      p => p.status === 'COMPLETED'
    ).length
    const absentCount = participants.filter(p => p.status === 'ABSENT').length
    const activeCount = participants.filter(p => p.status === 'ACTIVE').length

    const scores =
      participants
        .filter(p => p.finalScore !== null && p.finalScore !== undefined)
        .map(p => p.finalScore) || []

    const averageScore =
      scores.length > 0
        ? (
            scores.reduce((sum, score) => sum + score, 0) / scores.length
          ).toFixed(1)
        : 0

    return {
      totalParticipants,
      maxParticipants,
      enrolledCount,
      completedCount,
      absentCount,
      activeCount,
      enrollmentRate:
        maxParticipants > 0
          ? ((totalParticipants / maxParticipants) * 100).toFixed(1)
          : 0,
      completionRate:
        totalParticipants > 0
          ? ((completedCount / totalParticipants) * 100).toFixed(1)
          : 0,
      averageScore,
    }
  }, [program])

  // Handle program deletion
  //   const handleDelete = () => {
  //     confirm({
  //       title: t('programManagement.details.confirmDelete'),
  //       content: t('programManagement.messages.confirmDelete'),
  //       okText: t('common.yes'),
  //       okType: 'danger',
  //       cancelText: t('common.no'),
  //       onOk: async () => {
  //         try {
  //           await dispatch(deleteProgram(id)).unwrap()
  //           messageApi.success(t('programManagement.details.deleteSuccess'))
  //           navigate('/program-management')
  //         } catch {
  //           messageApi.error(t('programManagement.details.deleteError'))
  //         }
  //       },
  //     })
  //   }

  //   // Handle edit program
  //   const handleEdit = () => {
  //     navigate(`/program-management/edit/${id}`)
  //   }

  // Handle back to list
  const handleBack = () => {
    navigate('/program-management')
  }

  // Show loading state
  if (loading || !isInitialized) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>{t('common.loading')}</Text>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !program) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Empty
          description={t('programManagement.details.error')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={handleBack}>
            {t('programManagement.details.backToList')}
          </Button>
        </Empty>
      </div>
    )
  }

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

  const getStatusIcon = status => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleOutlined />
      case 'PLANNING':
        return <ClockCircleOutlined />
      case 'ON_GOING':
        return <ExclamationCircleOutlined />
      case 'COMPLETED':
        return <TrophyOutlined />
      default:
        return <ClockCircleOutlined />
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      {contextHolder}

      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size="small">
              <Space>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBack}
                  type="text"
                >
                  {t('programManagement.details.backToList')}
                </Button>
              </Space>
              <Title level={2} style={{ margin: 0 }}>
                {program.name}
              </Title>
              <Space>
                <Tag
                  color={getStatusColor(program.status)}
                  icon={getStatusIcon(program.status)}
                >
                  {t(`programManagement.status.${program.status}`)}
                </Tag>
                {program.category && (
                  <Tag color="blue">{program.category.name}</Tag>
                )}
              </Space>
            </Space>
          </Col>
          {/* <Col>
            <Space>
              <Button
                icon={<EditOutlined />}
                onClick={handleEdit}
                type="primary"
              >
                {t('programManagement.details.editProgram')}
              </Button>
              <Button icon={<DeleteOutlined />} onClick={handleDelete} danger>
                {t('programManagement.details.deleteProgram')}
              </Button>
            </Space>
          </Col> */}
        </Row>
      </Card>

      {/* Statistics Cards */}
      {statistics && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t('programManagement.details.totalParticipants')}
                value={statistics.totalParticipants}
                prefix={<UserOutlined />}
                suffix={`/ ${statistics.maxParticipants}`}
              />
              <Progress
                percent={parseFloat(statistics.enrollmentRate)}
                size="small"
                status="active"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t('programManagement.details.enrollmentRate')}
                value={statistics.enrollmentRate}
                suffix="%"
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t('programManagement.details.completionRate')}
                value={statistics.completionRate}
                suffix="%"
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t('programManagement.details.averageScore')}
                value={statistics.averageScore}
                prefix={<TrophyOutlined />}
                precision={1}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Content Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'overview',
              label: (
                <span>
                  <BarChartOutlined />
                  {t('programManagement.details.overview')}
                </span>
              ),
              children: <ProgramOverview program={program} />,
            },
            {
              key: 'statistics',
              label: (
                <span>
                  <BarChartOutlined />
                  {t('programManagement.details.statistics.title')}
                </span>
              ),
              children: (
                <ProgramStatistics program={program} statistics={statistics} />
              ),
            },
            {
              key: 'participants',
              label: (
                <span>
                  <TeamOutlined />
                  {t('programManagement.details.participants')}
                </span>
              ),
              children: <ParticipantList participants={program.participants} />,
            },
            {
              key: 'survey',
              label: (
                <span>
                  <FileTextOutlined />
                  {t('programManagement.details.survey')}
                </span>
              ),
              children: <SurveyInfo survey={program.programSurvey} />,
            },
            // {
            //   key: 'charts',
            //   label: (
            //     <span>
            //       <BarChartOutlined />
            //       {t('programManagement.details.charts.enrollmentTrend')}
            //     </span>
            //   ),
            //   children: (
            //     <ProgramCharts program={program} statistics={statistics} />
            //   ),
            // },
          ]}
        />
      </Card>
    </div>
  )
}

export default ProgramDetails
