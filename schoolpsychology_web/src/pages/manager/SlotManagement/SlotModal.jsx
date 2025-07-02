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
  message,
  Space,
  Button,
  Card,
  Row,
  Col,
  Divider,
  Typography,
  Tag,
  Avatar,
  List,
  Popconfirm,
  Empty,
  Badge,
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
} from '@ant-design/icons'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { useAuth } from '../../../contexts/AuthContext'
import {
  createSlots,
  fetchUsersByRole,
  selectCreateLoading,
  selectCreateError,
  selectUsers,
  clearError,
} from '../../../store/slices/slotSlice'
import { validateSlot, checkSlotConflict } from '../../../utils/slotUtils'

const { Option } = Select
const { Title, Text } = Typography

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

const SlotModal = ({ visible, onCancel, onSuccess }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { user } = useAuth()

  const [form] = Form.useForm()
  const [previewSlots, setPreviewSlots] = useState([])
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
      message.error(t('slotManagement.messages.createError'))
      dispatch(clearError())
    }
  }, [createError, t, dispatch])

  // Function to merge slots with same date
  const mergeSlotsByDate = slots => {
    const groupedSlots = {}

    slots.forEach(slot => {
      const dateKey = dayjs(slot.startDateTime).format('YYYY-MM-DD')
      if (!groupedSlots[dateKey]) {
        groupedSlots[dateKey] = []
      }
      groupedSlots[dateKey].push(slot)
    })

    return Object.values(groupedSlots).map(dateSlots => {
      if (dateSlots.length === 1) {
        return dateSlots[0]
      }

      // Merge multiple slots on same date
      const firstSlot = dateSlots[0]
      const lastSlot = dateSlots[dateSlots.length - 1]

      return {
        ...firstSlot,
        slotName: `${firstSlot.slotName} + ${dateSlots.length - 1} more`,
        endDateTime: lastSlot.endDateTime,
        duration: dayjs(lastSlot.endDateTime).diff(
          dayjs(firstSlot.startDateTime),
          'hour',
          true
        ),
        mergedSlots: dateSlots,
      }
    })
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

      // Check for conflicts with existing slots
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
      const mergedSlots = mergeSlotsByDate(updatedSlots)
      setPreviewSlots(mergedSlots)

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

  const handleSubmit = async () => {
    if (previewSlots.length === 0) {
      message.warning(t('slotManagement.messages.noSlotsToCreate'))
      return
    }

    try {
      const slotsToCreate = previewSlots.flatMap(slot => {
        if (slot.mergedSlots) {
          // Expand merged slots back to individual slots
          return slot.mergedSlots.map(mergedSlot => ({
            slotName: mergedSlot.slotName,
            startDateTime: dayjs(mergedSlot.startDateTime)
              .tz(VN_TZ)
              .format(VN_TZ_FORMAT),
            endDateTime: dayjs(mergedSlot.endDateTime)
              .tz(VN_TZ)
              .format(VN_TZ_FORMAT),
            slotType: mergedSlot.slotType,
          }))
        } else {
          return [
            {
              slotName: slot.slotName,
              startDateTime: dayjs(slot.startDateTime)
                .tz(VN_TZ)
                .format(VN_TZ_FORMAT),
              endDateTime: dayjs(slot.endDateTime)
                .tz(VN_TZ)
                .format(VN_TZ_FORMAT),
              slotType: slot.slotType,
            },
          ]
        }
      })

      const result = await dispatch(createSlots(slotsToCreate)).unwrap()
      if (result) {
        message.success(t('slotManagement.messages.createSuccess'))
        setPreviewSlots([])
        form.resetFields()
        onSuccess()
      }
    } catch (error) {
      console.error('Error creating slots:', error)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setPreviewSlots([])
    onCancel()
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

  const renderSlotPreview = (slot, index) => (
    <Card
      key={index}
      size="small"
      style={{ marginBottom: 8 }}
      extra={
        <Popconfirm
          title={t('slotManagement.preview.deleteConfirm')}
          onConfirm={() => handleRemoveSlot(slot.id)}
          okText={t('common.yes')}
          cancelText={t('common.no')}
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      }
    >
      <div style={{ marginBottom: 8 }}>
        <Space>
          <Text strong>{slot.slotName}</Text>
          <Tag color={getSlotTypeColor(slot.slotType)}>
            {slot.slotType === 'APPOINTMENT'
              ? t('slotManagement.typeOptions.appointment')
              : t('slotManagement.typeOptions.program')}
          </Tag>
          {slot.mergedSlots && (
            <Badge count={slot.mergedSlots.length} size="small" />
          )}
        </Space>
      </div>

      <div style={{ fontSize: 12, color: '#666' }}>
        <div>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {dayjs(slot.startDateTime).format('DD/MM/YYYY HH:mm')} -{' '}
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
      </div>
    </Card>
  )

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            {t('slotManagement.addSlot')}
          </Title>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={1200}
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
                  placeholder="Enter duration in hours"
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
                  <Option value="APPOINTMENT">
                    {t('slotManagement.typeOptions.appointment')}
                  </Option>
                  <Option value="PROGRAM">
                    {t('slotManagement.typeOptions.program')}
                  </Option>
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
                <InfoCircleOutlined style={{ color: '#52c41a' }} />
                <Text strong>{t('slotManagement.preview.title')}</Text>
                <Badge count={previewSlots.length} showZero />
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
                >
                  {t('slotManagement.form.createAll')}
                </Button>
                <Button onClick={handleCancel}>
                  {t('slotManagement.form.cancel')}
                </Button>
              </Space>
            }
          >
            {previewSlots.length > 0 ? (
              <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                {previewSlots.map((slot, index) =>
                  renderSlotPreview(slot, index)
                )}
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
