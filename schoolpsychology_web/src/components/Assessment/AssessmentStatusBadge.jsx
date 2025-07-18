import React, { memo } from 'react'
import { Badge, Tag, Tooltip, Progress } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  HeartOutlined,
  TeamOutlined,
} from '@ant-design/icons'

// Assessment status configuration
const ASSESSMENT_STATUS_CONFIG = {
  SUBMITTED: {
    color: 'blue',
    icon: <ClockCircleOutlined />,
    bgColor: '#e6f7ff',
    borderColor: '#91d5ff',
  },
  FINALIZED: {
    color: 'green',
    icon: <CheckCircleOutlined />,
    bgColor: '#f6ffed',
    borderColor: '#b7eb8f',
  },
  PENDING: {
    color: 'orange',
    icon: <ExclamationCircleOutlined />,
    bgColor: '#fff7e6',
    borderColor: '#ffd591',
  },
}

// Session flow configuration
const SESSION_FLOW_CONFIG = {
  GOOD: {
    color: 'green',
    icon: <CheckCircleOutlined />,
  },
  NORMAL: {
    color: 'blue',
    icon: <ClockCircleOutlined />,
  },
  DIFFICULT: {
    color: 'red',
    icon: <ExclamationCircleOutlined />,
  },
  UNKNOWN: {
    color: 'default',
    icon: <ExclamationCircleOutlined />,
  },
}

// Cooperation level configuration
const COOPERATION_LEVEL_CONFIG = {
  HIGH: {
    color: 'green',
    icon: <HeartOutlined />,
  },
  MEDIUM: {
    color: 'orange',
    icon: <TeamOutlined />,
  },
  LOW: {
    color: 'red',
    icon: <ExclamationCircleOutlined />,
  },
  UNKNOWN: {
    color: 'default',
    icon: <ExclamationCircleOutlined />,
  },
}

// Component for displaying assessment status
export const AssessmentStatusBadge = memo(({ status, t }) => {
  const config = ASSESSMENT_STATUS_CONFIG[status]
  if (!config) return null

  return (
    <Badge
      color={config.color}
      text={t(`assessmentForm.status.${status.toLowerCase()}`)}
      className="font-medium"
    />
  )
})

// Component for displaying session flow
export const SessionFlowTag = memo(({ sessionFlow, t }) => {
  const config = SESSION_FLOW_CONFIG[sessionFlow]
  if (!config) return null

  return (
    <Tag color={config.color} icon={config.icon}>
      {t(`assessmentForm.sessionFlow.${sessionFlow.toLowerCase()}`)}
    </Tag>
  )
})

// Component for displaying cooperation level
export const CooperationLevelTag = memo(({ cooperationLevel, t }) => {
  const config = COOPERATION_LEVEL_CONFIG[cooperationLevel]
  if (!config) return null

  return (
    <Tag color={config.color} icon={config.icon}>
      {t(`assessmentForm.cooperationLevel.${cooperationLevel.toLowerCase()}`)}
    </Tag>
  )
})

// Component for displaying risk level based on total score
export const RiskLevelIndicator = memo(({ totalScore, t }) => {
  if (totalScore === null || totalScore === undefined) {
    return (
      <Tag color="default">
        {t('appointmentRecord.riskLevels.unknown', 'Unknown')}
      </Tag>
    )
  }

  let riskLevel, color, percent

  if (totalScore <= 5) {
    riskLevel = 'low'
    color = '#52c41a'
    percent = (totalScore / 5) * 33
  } else if (totalScore <= 12) {
    riskLevel = 'medium'
    color = '#faad14'
    percent = 33 + ((totalScore - 5) / 7) * 34
  } else {
    riskLevel = 'high'
    color = '#ff4d4f'
    percent = 67 + Math.min(((totalScore - 12) / 8) * 33, 33)
  }

  return (
    <Tooltip
      title={`${t('appointmentRecord.totalScore')}: ${totalScore}`}
      placement="top"
    >
      <div className="flex items-center space-x-2">
        <Tag color={color} icon={<TrophyOutlined />} className="font-medium">
          {t(`appointmentRecord.riskLevels.${riskLevel}`)}
        </Tag>
        <Progress
          percent={Math.min(percent, 100)}
          size="small"
          strokeColor={color}
          showInfo={false}
          style={{ width: 60 }}
        />
      </div>
    </Tooltip>
  )
})

// Component for displaying assessment score with visual indicator
export const AssessmentScoreCard = memo(({ totalScore, t, className = '' }) => {
  if (totalScore === null || totalScore === undefined) {
    return (
      <div className={`text-center p-4 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-2xl text-gray-400 mb-1">--</div>
        <div className="text-sm text-gray-500">
          {t('appointmentRecord.noRecord')}
        </div>
      </div>
    )
  }

  let riskLevel, color, bgColor

  if (totalScore <= 5) {
    riskLevel = 'low'
    color = '#52c41a'
    bgColor = '#f6ffed'
  } else if (totalScore <= 12) {
    riskLevel = 'medium'
    color = '#faad14'
    bgColor = '#fffbe6'
  } else {
    riskLevel = 'high'
    color = '#ff4d4f'
    bgColor = '#fff2f0'
  }

  return (
    <div
      className={`text-center p-4 rounded-lg border ${className}`}
      style={{ backgroundColor: bgColor, borderColor: color }}
    >
      <div className="text-3xl font-bold mb-1" style={{ color }}>
        {totalScore}
      </div>
      <div className="text-sm font-medium" style={{ color }}>
        {t(`appointmentRecord.riskLevels.${riskLevel}`)}
      </div>
    </div>
  )
})

// Add display names for debugging
AssessmentStatusBadge.displayName = 'AssessmentStatusBadge'
SessionFlowTag.displayName = 'SessionFlowTag'
CooperationLevelTag.displayName = 'CooperationLevelTag'
RiskLevelIndicator.displayName = 'RiskLevelIndicator'
AssessmentScoreCard.displayName = 'AssessmentScoreCard'
