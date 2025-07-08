import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Space,
  Button,
  Card,
  Row,
  Col,
  Divider,
  Typography,
  Tag,
  Avatar,
  Popconfirm,
  Empty,
  Badge,
  Collapse,
  Alert,
} from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BookOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckOutlined,
  EditOutlined,
  DownOutlined,
  UpOutlined,
  SaveOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { useAuth } from '../../../contexts/AuthContext'
import {
  createSlots,
  fetchUsersByRole,
} from '../../../store/actions/slotActions'
import {
  selectCreateLoading,
  selectCreateError,
  selectUsers,
  clearError,
} from '../../../store/slices/slotSlice'
import { validateSlot, checkSlotConflict } from '../../../utils/slotUtils'

const { Option } = Select
const { Title, Text } = Typography
const { Panel } = Collapse

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrBefore)

const VN_TZ = 'Asia/Ho_Chi_Minh'
const VN_TZ_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'

// HelpText component
const HelpText = ({ children }) => (
  <div
    style={{
      background: '#f0f5ff',
      color: '#1890ff',
      fontSize: 12,
      borderRadius: 6,
      padding: '6px 10px',
      marginTop: 4,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    }}
  >
    <InfoCircleOutlined style={{ fontSize: 14 }} />
    <span>{children}</span>
  </div>
)

// ErrorText component
const ErrorText = ({ children }) => (
  <div
    style={{
      background: '#fff1f0',
      color: '#ff4d4f',
      fontSize: 12,
      borderRadius: 6,
      padding: '6px 10px',
      marginTop: 4,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    }}
  >
    <WarningOutlined style={{ fontSize: 14 }} />
    <span>{children}</span>
  </div>
)

const SlotModal = ({ visible, message, onCancel, onSuccess }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { user } = useAuth()

  const [form] = Form.useForm()
  const [previewSlots, setPreviewSlots] = useState([])
  const [editingSlotId, setEditingSlotId] = useState(null)
  const [expandedDates, setExpandedDates] = useState(new Set())
  const [conflictSlots, setConflictSlots] = useState([])
  const createLoading = useSelector(selectCreateLoading)
  const createError = useSelector(selectCreateError)
  const users = useSelector(selectUsers)

  useEffect(() => {
    if (visible && user?.role.toUpperCase() === 'MANAGER') {
      // Fetch teachers and counselors for manager to select
      dispatch(fetchUsersByRole('TEACHER'))
      dispatch(fetchUsersByRole('COUNSELOR'))
    }
  }, [visible, user?.role, dispatch])

  useEffect(() => {
    if (createError) {
      dispatch(clearError())
    }
  }, [createError, dispatch])

  // Function to check if a slot is in conflict
  const isSlotInConflict = slot => {
    return conflictSlots.some(
      conflictSlot =>
        conflictSlot.slotName === slot.slotName &&
        conflictSlot.startDateTime ===
          dayjs(slot.startDateTime).format('YYYY-MM-DDTHH:mm:ss') &&
        conflictSlot.endDateTime ===
          dayjs(slot.endDateTime).format('YYYY-MM-DDTHH:mm:ss')
    )
  }

  // Function to get conflict reason for a slot
  const getConflictReason = slot => {
    const conflictSlot = conflictSlots.find(
      conflict =>
        conflict.slotName === slot.slotName &&
        conflict.startDateTime ===
          dayjs(slot.startDateTime).format('YYYY-MM-DDTHH:mm:ss') &&
        conflict.endDateTime ===
          dayjs(slot.endDateTime).format('YYYY-MM-DDTHH:mm:ss')
    )
    return conflictSlot?.reason || ''
  }

  // Function to group slots by date only
  const groupSlotsByDate = slots => {
    const groupedSlots = {}

    slots.forEach(slot => {
      const dateKey = dayjs(slot.startDateTime).format('YYYY-MM-DD')
      if (!groupedSlots[dateKey]) {
        groupedSlots[dateKey] = []
      }
      groupedSlots[dateKey].push(slot)
    })

    return Object.entries(groupedSlots).map(([dateKey, dateSlots]) => ({
      dateKey,
      date: dayjs(dateKey),
      slots: dateSlots.sort((a, b) =>
        dayjs(a.startDateTime).diff(dayjs(b.startDateTime))
      ),
      totalSlots: dateSlots.length,
    }))
  }

  // Function to check time conflicts within the same day
  const checkTimeConflictInPreview = (
    start,
    end,
    hostedById,
    excludeSlotId = null
  ) => {
    const sameDaySlots = previewSlots.filter(slot => {
      // Exclude the slot being edited
      if (excludeSlotId && slot.id === excludeSlotId) return false

      // Check if same day and same host
      const slotDate = dayjs(slot.startDateTime).format('YYYY-MM-DD')
      const newSlotDate = dayjs(start).format('YYYY-MM-DD')
      return slotDate === newSlotDate && slot.hostedBy === hostedById
    })

    return sameDaySlots.some(slot => {
      const slotStart = dayjs(slot.startDateTime)
      const slotEnd = dayjs(slot.endDateTime)

      // Check for overlap: new slot overlaps with existing slot
      return (
        (start.isBefore(slotEnd) && end.isAfter(slotStart)) ||
        start.isSame(slotStart) ||
        end.isSame(slotEnd) ||
        (start.isAfter(slotStart) && start.isBefore(slotEnd)) ||
        (end.isAfter(slotStart) && end.isBefore(slotEnd))
      )
    })
  }

  // Function to get detailed conflict information
  const getConflictDetails = (start, end, hostedById, excludeSlotId = null) => {
    const sameDaySlots = previewSlots.filter(slot => {
      // Exclude the slot being edited
      if (excludeSlotId && slot.id === excludeSlotId) return false

      // Check if same day and same host
      const slotDate = dayjs(slot.startDateTime).format('YYYY-MM-DD')
      const newSlotDate = dayjs(start).format('YYYY-MM-DD')
      return slotDate === newSlotDate && slot.hostedBy === hostedById
    })

    const conflicts = sameDaySlots.filter(slot => {
      const slotStart = dayjs(slot.startDateTime)
      const slotEnd = dayjs(slot.endDateTime)

      // Check for overlap: new slot overlaps with existing slot
      return (
        (start.isBefore(slotEnd) && end.isAfter(slotStart)) ||
        start.isSame(slotStart) ||
        end.isSame(slotEnd) ||
        (start.isAfter(slotStart) && start.isBefore(slotEnd)) ||
        (end.isAfter(slotStart) && end.isBefore(slotEnd))
      )
    })

    return conflicts.map(slot => ({
      slotName: slot.slotName,
      startTime: dayjs(slot.startDateTime).format('HH:mm'),
      endTime: dayjs(slot.endDateTime).format('HH:mm'),
      duration: slot.duration,
    }))
  }

  const handleAddSlot = async () => {
    try {
      const values = await form.validateFields()
      const { slotName, startDateTime, duration, slotType, hostedBy } = values

      // Calculate end date time
      const start = dayjs(startDateTime)
      const end = start.add(duration, 'hour')

      // Validate business rules
      const validationError = validateSlot(
        start,
        end,
        slotType,
        user?.role.toUpperCase(),
        t
      )
      if (validationError) {
        message.error(validationError)
        return
      }

      // Check for conflicts with existing slots in preview
      const hasConflictInPreview = checkTimeConflictInPreview(
        start,
        end,
        hostedBy || user?.id
      )
      if (hasConflictInPreview) {
        const conflictDetails = getConflictDetails(
          start,
          end,
          hostedBy || user?.id
        )
        const conflictMessage =
          conflictDetails.length > 0
            ? `${t('slotManagement.validation.slotConflict')}\n\n${t('slotManagement.validation.conflictDetails')}:\n${conflictDetails.map(c => `- ${c.slotName}: ${c.startTime} - ${c.endTime} (${c.duration}h)`).join('\n')}`
            : t('slotManagement.validation.slotConflict')

        message.error(conflictMessage)
        return
      }

      // Check for conflicts with existing slots in database (if available)
      const hasConflict = checkSlotConflict(start, end, hostedBy || user?.id)
      if (hasConflict) {
        message.error(t('slotManagement.validation.slotConflict'))
        return
      }

      const newSlot = {
        id: Date.now(), // Temporary ID for preview
        slotName,
        startDateTime: start,
        endDateTime: end,
        duration,
        slotType,
        hostedBy: hostedBy || user?.id,
      }

      const updatedSlots = [...previewSlots, newSlot]
      setPreviewSlots(updatedSlots)

      // Reset form
      form.resetFields(['slotName', 'startDateTime', 'duration'])
      form.setFieldsValue({
        slotType:
          user?.role.toUpperCase() === 'MANAGER' ? 'PROGRAM' : 'APPOINTMENT',
        hostedBy: hostedBy,
      })

      message.success(t('slotManagement.messages.slotAdded'))
    } catch (error) {
      console.error('Error adding slot:', error)
    }
  }

  const handleRemoveSlot = slotId => {
    const updatedSlots = previewSlots.filter(slot => slot.id !== slotId)
    setPreviewSlots(updatedSlots)
    message.success(t('slotManagement.messages.slotRemoved'))
  }

  const handleStartEdit = slot => {
    setEditingSlotId(slot.id)
  }

  const handleCancelEdit = () => {
    setEditingSlotId(null)
  }

  const handleSaveEdit = (slot, formValues) => {
    try {
      const { slotName, startDateTime, duration, slotType, hostedBy } =
        formValues

      // Calculate end date time
      const start = dayjs(startDateTime)
      const end = start.add(duration, 'hour')

      // Validate business rules
      const validationError = validateSlot(
        start,
        end,
        slotType,
        user?.role.toUpperCase(),
        t
      )
      if (validationError) {
        message.error(validationError)
        return
      }

      // Check for conflicts with existing slots in preview (excluding current slot being edited)
      const hasConflictInPreview = checkTimeConflictInPreview(
        start,
        end,
        hostedBy || user?.id,
        slot.id
      )
      if (hasConflictInPreview) {
        const conflictDetails = getConflictDetails(
          start,
          end,
          hostedBy || user?.id,
          slot.id
        )
        const conflictMessage =
          conflictDetails.length > 0
            ? `${t('slotManagement.validation.slotConflict')}\n\n${t('slotManagement.validation.conflictDetails')}:\n${conflictDetails.map(c => `- ${c.slotName}: ${c.startTime} - ${c.endTime} (${c.duration}h)`).join('\n')}`
            : t('slotManagement.validation.slotConflict')

        message.error(conflictMessage)
        return
      }

      // Check for conflicts with existing slots in database (if available)
      const hasConflict = checkSlotConflict(start, end, hostedBy || user?.id)
      if (hasConflict) {
        message.error(t('slotManagement.validation.slotConflict'))
        return
      }

      const updatedSlot = {
        ...slot,
        slotName,
        startDateTime: start,
        endDateTime: end,
        duration,
        slotType,
        hostedBy: hostedBy || user?.id,
      }

      const updatedSlots = previewSlots.map(s =>
        s.id === slot.id ? updatedSlot : s
      )
      setPreviewSlots(updatedSlots)
      setEditingSlotId(null)
      message.success(t('slotManagement.messages.slotUpdated'))
    } catch (error) {
      console.error('Error updating slot:', error)
    }
  }

  const handleSubmit = async () => {
    if (previewSlots.length === 0) {
      message.warning(t('slotManagement.messages.noSlotsToCreate'))
      return
    }

    try {
      const slotsToCreate = previewSlots.map(slot => ({
        slotName: slot.slotName,
        startDateTime: dayjs(slot.startDateTime).tz(VN_TZ).format(VN_TZ_FORMAT),
        endDateTime: dayjs(slot.endDateTime).tz(VN_TZ).format(VN_TZ_FORMAT),
        slotType: slot.slotType,
      }))

      const result = await dispatch(createSlots(slotsToCreate)).unwrap()
      if (result) {
        setPreviewSlots([])
        form.resetFields()
        setConflictSlots([])
        onSuccess(t('slotManagement.messages.createSuccess'))
      }
    } catch (error) {
      console.log(error.conflicts)
      setConflictSlots(error.conflicts || [])
      message.error(t('slotManagement.messages.slotConflict'))
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setPreviewSlots([])
    setEditingSlotId(null)
    setConflictSlots([])
    onCancel()
  }

  const toggleDateExpansion = dateKey => {
    const newExpanded = new Set(expandedDates)
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey)
    } else {
      newExpanded.add(dateKey)
    }
    setExpandedDates(newExpanded)
  }

  const disabledDate = current => {
    return current && current < dayjs().tz(VN_TZ).startOf('day')
  }

  const disabledTime = date => {
    if (!date) return {}
    const now = dayjs()
    let disabled = []
    // Disable ngoài 8-17h
    disabled = disabled.concat(Array.from({ length: 8 }, (_, i) => i))
    disabled = disabled.concat(Array.from({ length: 6 }, (_, i) => i + 18))
    // Nếu là Counselor thì disable thêm 12h
    if (user?.role.toUpperCase() === 'COUNSELOR') {
      disabled.push(12)
    }
    // Nếu là hôm nay thì disable giờ trước giờ hiện tại
    if (date.isSame(now, 'day')) {
      disabled = disabled.concat(
        Array.from({ length: now.hour() }, (_, i) => i)
      )
    }
    // Loại trùng
    disabled = Array.from(new Set(disabled)).sort((a, b) => a - b)
    return {
      disabledHours: () => disabled,
    }
  }

  const customStartDateTimeValidator = (_, value) => {
    if (!value) return Promise.resolve()
    const now = dayjs()
    if (value.isBefore(now)) {
      return Promise.reject(t('slotManagement.validation.startTimeAfterNow'))
    }
    return Promise.resolve()
  }

  const customDurationValidator = (_, value) => {
    const start = form.getFieldValue('startDateTime')
    if (start && value) {
      const end = dayjs(start).add(value, 'hour')
      if (end.isSameOrBefore(start)) {
        return Promise.reject(
          t('slotManagement.validation.startTimeBeforeEndTime')
        )
      }
      if (end.isBefore(dayjs())) {
        return Promise.reject(t('slotManagement.validation.endTimeAfterNow'))
      }
      // Không được quá 17h00
      if (end.hour() > 17 || (end.hour() === 17 && end.minute() > 0)) {
        return Promise.reject(t('slotManagement.validation.endTimeBefore17'))
      }
      // Nếu là Counselor và start < 12h thì end không được quá 12h00
      if (
        user?.role?.toUpperCase() === 'COUNSELOR' &&
        dayjs(start).hour() < 12 &&
        (end.hour() > 12 || (end.hour() === 12 && end.minute() > 0))
      ) {
        return Promise.reject(t('slotManagement.validation.lunchBreakConflict'))
      }
    }
    return Promise.resolve()
  }

  const getSelectedUser = userId => {
    return users.find(u => u.id === userId)
  }

  const getSlotTypeColor = type => {
    return type === 'APPOINTMENT' ? 'blue' : 'green'
  }

  const InlineEditForm = ({ slot, onSave, onCancel }) => {
    const [editForm] = Form.useForm()

    useEffect(() => {
      editForm.setFieldsValue({
        slotName: slot.slotName,
        startDateTime: slot.startDateTime,
        duration: slot.duration,
        slotType: slot.slotType,
        hostedBy: slot.hostedBy,
      })
    }, [slot, editForm])

    const handleSave = async () => {
      try {
        const values = await editForm.validateFields()
        onSave(slot, values)
      } catch (error) {
        console.error('Validation error:', error)
      }
    }

    return (
      <div style={{ padding: '8px 0' }}>
        <Form form={editForm} layout="vertical" size="small">
          <Row gutter={8}>
            <Col span={8}>
              <Form.Item
                name="slotName"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="Slot name" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="startDateTime"
                rules={[{ required: true, message: 'Required' }]}
              >
                <DatePicker
                  showTime={{ format: 'HH:mm' }}
                  format="MM-DD HH:mm"
                  placeholder="Start time"
                  disabledDate={disabledDate}
                  disabledTime={disabledTime}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                name="duration"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber
                  min={1}
                  max={8}
                  placeholder="Hours"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="slotType">
                <Select size="small">
                  {user?.role.toUpperCase() === 'MANAGER' ? (
                    <>
                      <Option value="PROGRAM">
                        {t('slotManagement.typeOptions.program')}
                      </Option>
                    </>
                  ) : (
                    <Option value="APPOINTMENT">
                      {t('slotManagement.typeOptions.appointment')}
                    </Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col span={2}>
              <Space>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  size="small"
                  onClick={handleSave}
                />
                <Button
                  icon={<CloseOutlined />}
                  size="small"
                  onClick={onCancel}
                />
              </Space>
            </Col>
          </Row>
        </Form>
      </div>
    )
  }

  const renderIndividualSlot = slot => {
    const isEditing = editingSlotId === slot.id
    const isConflicting = isSlotInConflict(slot)
    const conflictReason = getConflictReason(slot)

    return (
      <Card
        key={slot.id}
        size="small"
        style={{
          marginBottom: 8,
          marginLeft: 16,
          border: isConflicting ? '2px solid #ff4d4f' : undefined,
          backgroundColor: isConflicting ? '#fff1f0' : undefined,
        }}
        extra={
          <Space>
            {!isEditing ? (
              <Button
                type="text"
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleStartEdit(slot)}
              />
            ) : null}
            <Popconfirm
              title={t('slotManagement.preview.deleteConfirm')}
              onConfirm={() => handleRemoveSlot(slot.id)}
              okText={t('common.yes')}
              cancelText={t('common.no')}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Space>
        }
      >
        {isEditing ? (
          <InlineEditForm
            slot={slot}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        ) : (
          <>
            <div style={{ marginBottom: 8 }}>
              <Space>
                <Text
                  strong
                  style={{ color: isConflicting ? '#ff4d4f' : undefined }}
                >
                  {slot.slotName}
                </Text>
                <Tag color={getSlotTypeColor(slot.slotType)}>
                  {slot.slotType === 'APPOINTMENT'
                    ? t('slotManagement.typeOptions.appointment')
                    : t('slotManagement.typeOptions.program')}
                </Tag>
                {isConflicting && (
                  <Tag color="red" icon={<ExclamationCircleOutlined />}>
                    Conflict
                  </Tag>
                )}
              </Space>
            </div>

            <div
              style={{
                fontSize: 12,
                color: isConflicting ? '#ff4d4f' : '#666',
              }}
            >
              <div>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {dayjs(slot.startDateTime).format('HH:mm')} -{' '}
                {dayjs(slot.endDateTime).format('HH:mm')}
              </div>
              <div>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {slot.duration} {t('slotManagement.preview.hours')}
              </div>
              <div>
                <UserOutlined style={{ marginRight: 4 }} />
                {user?.role.toUpperCase() === 'MANAGER' && slot.hostedBy
                  ? getSelectedUser(slot.hostedBy)?.fullName ||
                    getSelectedUser(slot.hostedBy)?.email
                  : user?.fullName || user?.email}
              </div>
              {isConflicting && conflictReason && (
                <div
                  style={{
                    marginTop: 8,
                    padding: 8,
                    background: '#fff2f0',
                    borderRadius: 4,
                  }}
                >
                  <ExclamationCircleOutlined
                    style={{ color: '#ff4d4f', marginRight: 4 }}
                  />
                  <Text type="danger" style={{ fontSize: 11 }}>
                    {conflictReason}
                  </Text>
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    )
  }

  const renderDateGroup = dateGroup => {
    const hasConflictsInGroup = dateGroup.slots.some(slot =>
      isSlotInConflict(slot)
    )

    return (
      <Card
        key={dateGroup.dateKey}
        size="small"
        style={{
          marginBottom: 8,
          border: hasConflictsInGroup ? '2px solid #ff4d4f' : undefined,
          backgroundColor: hasConflictsInGroup ? '#fff1f0' : undefined,
        }}
        extra={
          <Space>
            {hasConflictsInGroup && (
              <Tag color="red" icon={<ExclamationCircleOutlined />}>
                Has Conflicts
              </Tag>
            )}
            <Button
              type="text"
              icon={
                expandedDates.has(dateGroup.dateKey) ? (
                  <UpOutlined />
                ) : (
                  <DownOutlined />
                )
              }
              size="small"
              onClick={() => toggleDateExpansion(dateGroup.dateKey)}
            >
              {expandedDates.has(dateGroup.dateKey) ? 'Thu gọn' : 'Mở rộng'}
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 8 }}>
          <Space>
            <CalendarOutlined
              style={{ color: hasConflictsInGroup ? '#ff4d4f' : '#1890ff' }}
            />
            <Text
              strong
              style={{ color: hasConflictsInGroup ? '#ff4d4f' : undefined }}
            >
              {dateGroup.date.format('DD/MM/YYYY')}
            </Text>
            <Badge
              count={dateGroup.totalSlots}
              size="small"
              style={{
                backgroundColor: hasConflictsInGroup ? '#ff4d4f' : undefined,
              }}
            />
          </Space>
        </div>

        {expandedDates.has(dateGroup.dateKey) && (
          <div style={{ marginTop: 8 }}>
            {dateGroup.slots.map(slot => renderIndividualSlot(slot))}
          </div>
        )}
      </Card>
    )
  }

  const groupedSlots = groupSlotsByDate(previewSlots)
  const hasConflicts = conflictSlots.length > 0

  return (
    <Modal
      title={
        <div>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            {t('slotManagement.addSlot')}
          </Title>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={1400}
      centered
    >
      <Row gutter={24}>
        {/* Form Section - Left Side */}
        <Col span={10}>
          <Card
            title={
              <Space>
                <BookOutlined style={{ color: '#1890ff' }} />
                <Text strong>{t('slotManagement.form.details')}</Text>
              </Space>
            }
            style={{ height: '100%' }}
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                slotType:
                  user?.role.toUpperCase() === 'MANAGER'
                    ? 'PROGRAM'
                    : 'APPOINTMENT',
              }}
            >
              <Form.Item
                name="slotName"
                label={
                  <Space>
                    <InfoCircleOutlined />
                    {t('slotManagement.form.slotName')}
                  </Space>
                }
                rules={[
                  {
                    required: true,
                    message: t('slotManagement.form.slotNameRequired'),
                  },
                ]}
              >
                <Input
                  placeholder={t('slotManagement.form.slotNamePlaceholder')}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="startDateTime"
                label={
                  <Space>
                    <CalendarOutlined />
                    {t('slotManagement.form.startDateTime')}
                  </Space>
                }
                rules={[
                  {
                    required: true,
                    message: t('slotManagement.form.startDateTimeRequired'),
                  },
                  { validator: customStartDateTimeValidator },
                ]}
                extra={
                  <HelpText>
                    {t('slotManagement.form.startDateTimeHelp')}
                  </HelpText>
                }
              >
                <DatePicker
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                  placeholder={t('slotManagement.form.startDateTimeRequired')}
                  disabledDate={disabledDate}
                  disabledTime={disabledTime}
                  style={{ width: '100%' }}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="duration"
                label={
                  <Space>
                    <ClockCircleOutlined />
                    {t('slotManagement.form.duration')}
                  </Space>
                }
                rules={[
                  {
                    required: true,
                    message: t('slotManagement.form.durationRequired'),
                  },
                  {
                    type: 'number',
                    min: 1,
                    message: t('slotManagement.form.durationMin'),
                  },
                  {
                    validator: (_, value) => {
                      if (value && value % 1 !== 0) {
                        return Promise.reject(
                          t('slotManagement.form.durationInteger')
                        )
                      }
                      return Promise.resolve()
                    },
                  },
                  { validator: customDurationValidator },
                ]}
                extra={
                  <HelpText>{t('slotManagement.form.durationHelp')}</HelpText>
                }
              >
                <InputNumber
                  min={1}
                  max={8}
                  style={{ width: '100%' }}
                  placeholder={t('slotManagement.form.durationPlaceholder')}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="slotType"
                label={
                  <Space>
                    <BookOutlined />
                    {t('slotManagement.form.slotType')}
                  </Space>
                }
                rules={[
                  {
                    required: true,
                    message: t('slotManagement.form.slotTypeRequired'),
                  },
                ]}
              >
                <Select
                  placeholder={t('slotManagement.form.slotTypeRequired')}
                  size="large"
                >
                  {user?.role.toUpperCase() !== 'MANAGER' ? (
                    <Option value="APPOINTMENT">
                      {t('slotManagement.typeOptions.appointment')}
                    </Option>
                  ) : (
                    <Option value="PROGRAM">
                      {t('slotManagement.typeOptions.program')}
                    </Option>
                  )}
                </Select>
              </Form.Item>

              {user?.role.toUpperCase() === 'MANAGER' && (
                <Form.Item
                  name="hostedBy"
                  label={
                    <Space>
                      <UserOutlined />
                      {t('slotManagement.form.hostedBy')}
                    </Space>
                  }
                  rules={[
                    {
                      required: true,
                      message: t('slotManagement.form.hostedByRequired'),
                    },
                  ]}
                >
                  <Select
                    placeholder={t('slotManagement.form.hostedByRequired')}
                    size="large"
                    showSearch
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {users.map(user => (
                      <Option key={user.id} value={user.id}>
                        <Space>
                          <Avatar size="small" icon={<UserOutlined />} />
                          {user.fullName || user.email}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              <Divider />

              <Form.Item>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddSlot}
                  size="large"
                  style={{ width: '100%' }}
                >
                  {t('slotManagement.form.addSlot')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Preview Section - Right Side */}
        <Col span={14}>
          <Card
            title={
              <Space>
                <InfoCircleOutlined
                  style={{ color: hasConflicts ? '#ff4d4f' : '#52c41a' }}
                />
                <Text
                  strong
                  style={{ color: hasConflicts ? '#ff4d4f' : undefined }}
                >
                  {t('slotManagement.preview.title')}
                </Text>
                <Badge
                  count={previewSlots.length}
                  showZero
                  style={{
                    backgroundColor: hasConflicts ? '#ff4d4f' : undefined,
                  }}
                />
              </Space>
            }
            style={{ height: '100%' }}
            extra={
              <Space>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handleSubmit}
                  loading={createLoading}
                  disabled={previewSlots.length === 0}
                  danger={hasConflicts}
                >
                  {t('slotManagement.form.createAll')}
                </Button>
                <Button onClick={handleCancel}>
                  {t('slotManagement.form.cancel')}
                </Button>
              </Space>
            }
          >
            {hasConflicts && (
              <Alert
                message="Time Conflicts Detected"
                description={
                  <div>
                    <Text strong>
                      The following slots have conflicts with existing slots in
                      the database:
                    </Text>
                    <ul style={{ marginTop: 8, marginBottom: 0 }}>
                      {conflictSlots.map((conflict, index) => (
                        <li key={index} style={{ marginBottom: 4 }}>
                          <Text strong>{conflict.slotName}</Text> (
                          {dayjs(conflict.startDateTime).format('HH:mm')} -{' '}
                          {dayjs(conflict.endDateTime).format('HH:mm')})
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {conflict.reason}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                }
                type="error"
                showIcon
                icon={<ExclamationCircleOutlined />}
                style={{ marginBottom: 16 }}
                action={
                  <Button
                    size="small"
                    danger
                    onClick={() => setConflictSlots([])}
                  >
                    Clear Conflicts
                  </Button>
                }
              />
            )}

            {groupedSlots.length > 0 ? (
              <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                {groupedSlots.map(dateGroup => renderDateGroup(dateGroup))}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t('slotManagement.preview.noSlots')}
                style={{ margin: '40px 0' }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </Modal>
  )
}

export default SlotModal
