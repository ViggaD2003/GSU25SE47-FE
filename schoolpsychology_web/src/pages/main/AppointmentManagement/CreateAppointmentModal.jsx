import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  Modal,
  Steps,
  Form,
  Select,
  Input,
  DatePicker,
  TimePicker,
  Button,
  Card,
  Tag,
  Space,
  Divider,
  message,
  Spin,
} from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { getCases } from '../../../store/actions/caseActions'
import { fetchSlots } from '../../../store/actions/slotActions'
import { appointmentAPI } from '@/services/appointmentApi'
import {
  generateTimeSlots,
  markBookedSlots,
  formatTimeSlot,
} from '../../../utils/slotUtils'

const { TextArea } = Input
const { RangePicker } = DatePicker

const CreateAppointmentModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [form] = Form.useForm()

  // State
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)

  // Selectors
  const { cases, loading: casesLoading } = useSelector(state => state.case)
  const { slots, loading: slotsLoading } = useSelector(state => state.slot)
  const { user } = useSelector(state => state.auth)

  // Effects
  useEffect(() => {
    if (isOpen) {
      dispatch(getCases({ statusCase: ['IN_PROGRESS'], accountId: user.id }))
      dispatch(fetchSlots(user.id))
    }
  }, [isOpen, dispatch, user.id])

  // Memoized computations
  const caseOptions = useMemo(() => {
    return cases.map(c => ({
      value: c.id,
      label: `${c.title || c.id} - ${c.studentId}`,
      studentId: c.studentId,
    }))
  }, [cases])

  const selectedCase = useMemo(() => {
    const caseId = form.getFieldValue('caseId')
    return cases.find(c => c.id === caseId)
  }, [cases, form])

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || slots.length === 0) return []

    const dateSlots = slots.filter(slot => {
      const slotDate = dayjs(slot.startDateTime).format('YYYY-MM-DD')
      return slotDate === selectedDate.format('YYYY-MM-DD')
    })

    if (dateSlots.length === 0) return []

    const allTimeSlots = []
    dateSlots.forEach(slot => {
      const timeSlots = generateTimeSlots(
        new Date(slot.startDateTime),
        new Date(slot.endDateTime)
      )
      allTimeSlots.push(...timeSlots)
    })

    // Mark booked slots
    const bookedSlots = dateSlots.flatMap(slot => slot.booked || [])
    return markBookedSlots(allTimeSlots, bookedSlots)
  }, [selectedDate, slots])

  // Handlers
  const handleCaseChange = useCallback(_ => {
    setSelectedTimeSlot(null)
  }, [])

  const handleDateChange = useCallback(
    date => {
      setSelectedDate(date)
      setSelectedTimeSlot(null)
      form.setFieldsValue({ timeSlot: undefined })
    },
    [form]
  )

  const handleTimeSlotSelect = useCallback(
    slot => {
      setSelectedTimeSlot(slot)
      form.setFieldsValue({
        timeSlot: slot,
        startDateTime: slot.startTime,
        endDateTime: slot.endTime,
      })
    },
    [form]
  )

  const handleSubmit = async values => {
    if (!selectedTimeSlot) {
      message.error(t('appointment.form.slotRequired'))
      return
    }

    if (!selectedCase) {
      message.error(t('appointment.form.caseRequired'))
      return
    }

    setLoading(true)

    try {
      const appointmentData = {
        slotId: selectedTimeSlot.slotId || null,
        bookedForId: selectedCase.studentId,
        isOnline: values.location === 'online',
        startDateTime: selectedTimeSlot.startTime.toISOString(),
        endDateTime: selectedTimeSlot.endTime.toISOString(),
        hostType: 'COUNSELOR',
        reasonBooking: values.reasonBooking || '',
        caseId: values.caseId,
        notes: values.notes,
        priority: values.priority,
        appointmentType: values.appointmentType,
        locationDetails:
          values.location === 'offline' ? values.locationDetails : '',
      }

      await appointmentAPI.createAppointment(appointmentData)
      message.success(t('appointment.createSuccess'))
      onSuccess()
      handleClose()
    } catch (error) {
      console.error('Error creating appointment:', error)
      message.error(t('appointment.createError'))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.resetFields()
    setActiveStep(0)
    setSelectedDate(null)
    setSelectedTimeSlot(null)
    onClose()
  }

  const nextStep = () => {
    if (activeStep < 2) {
      setActiveStep(activeStep + 1)
    }
  }

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  const steps = [
    {
      title: t('appointment.form.caseSection'),
      icon: <FileTextOutlined />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('appointment.form.caseSection')}
            </h3>
            <p className="text-gray-600">
              {t('appointment.form.caseRequired')}
            </p>
          </div>

          <Form.Item
            name="caseId"
            label={t('appointment.caseInformation')}
            rules={[
              { required: true, message: t('appointment.form.caseRequired') },
            ]}
          >
            <Select
              placeholder={t('appointment.selectCase')}
              options={caseOptions}
              onChange={handleCaseChange}
              loading={casesLoading}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          {selectedCase && (
            <Card className="bg-blue-50 border-blue-200">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">
                    {t('appointment.student')}:
                  </span>
                  <span className="text-gray-900 font-semibold">
                    {selectedCase.studentId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">
                    {t('appointment.caseInformation')}:
                  </span>
                  <span className="text-gray-900">
                    {selectedCase.title || selectedCase.id}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      ),
    },
    {
      title: t('appointment.form.scheduleSection'),
      icon: <CalendarOutlined />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('appointment.form.scheduleSection')}
            </h3>
            <p className="text-gray-600">
              {t('appointment.form.slotDescription')}
            </p>
          </div>

          <Form.Item
            name="appointmentDate"
            label={t('appointment.form.selectDate')}
            rules={[
              { required: true, message: t('appointment.form.selectDate') },
            ]}
          >
            <DatePicker
              className="w-full"
              placeholder={t('appointment.form.selectDate')}
              onChange={handleDateChange}
              disabledDate={current =>
                current && current < dayjs().startOf('day')
              }
            />
          </Form.Item>

          {selectedDate && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">
                  {t('appointment.form.timeSlots')} -{' '}
                  {selectedDate.format('DD/MM/YYYY')}
                </h4>
                <div className="flex space-x-2">
                  <Tag color="green">
                    {t('appointment.form.availableSlots')}
                  </Tag>
                  <Tag color="red">{t('appointment.form.bookedSlots')}</Tag>
                </div>
              </div>

              {slotsLoading ? (
                <div className="text-center py-8">
                  <Spin size="large" />
                  <p className="text-gray-500 mt-2">
                    {t('appointment.form.loadingSlots')}
                  </p>
                </div>
              ) : availableTimeSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t('appointment.form.noSlotsToday')}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {availableTimeSlots.map((slot, index) => {
                    const { timeStr, duration } = formatTimeSlot(
                      slot.startTime,
                      slot.endTime
                    )
                    return (
                      <Card
                        key={index}
                        size="small"
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedTimeSlot === slot
                            ? 'ring-2 ring-blue-500 bg-blue-50'
                            : ''
                        } ${!slot.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() =>
                          slot.isAvailable && handleTimeSlotSelect(slot)
                        }
                      >
                        <div className="text-center">
                          <div className="font-medium text-sm text-gray-900">
                            {timeStr}
                          </div>
                          <div className="text-xs text-gray-500">
                            {duration} {t('appointment.form.minutes')}
                          </div>
                          {!slot.isAvailable && (
                            <Tag color="red" size="small" className="mt-1">
                              {t('appointment.form.bookedSlots')}
                            </Tag>
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="appointmentType"
              label={t('appointment.form.appointmentType')}
              initialValue="individual"
            >
              <Select>
                <Select.Option value="individual">
                  {t('appointment.form.typeIndividual')}
                </Select.Option>
                <Select.Option value="group">
                  {t('appointment.form.typeGroup')}
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="location"
              label={t('appointment.form.location')}
              initialValue="offline"
            >
              <Select>
                <Select.Option value="offline">
                  {t('appointment.form.locationOffline')}
                </Select.Option>
                <Select.Option value="online">
                  {t('appointment.form.locationOnline')}
                </Select.Option>
              </Select>
            </Form.Item>
          </div>

          {form.getFieldValue('location') === 'offline' && (
            <Form.Item
              name="locationDetails"
              label={t('appointment.form.location')}
            >
              <Input placeholder={t('appointment.form.locationPlaceholder')} />
            </Form.Item>
          )}
        </div>
      ),
    },
    {
      title: t('common.confirm'),
      icon: <SettingOutlined />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('appointment.form.title')}
            </h3>
            <p className="text-gray-600">{t('appointment.form.subtitle')}</p>
          </div>

          <Card className="bg-gray-50">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">
                  {t('appointment.student')}:
                </span>
                <span className="text-gray-900">
                  {selectedCase?.studentId || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">
                  {t('appointment.caseInformation')}:
                </span>
                <span className="text-gray-900">
                  {selectedCase?.title || selectedCase?.id || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">
                  {t('appointment.form.dateTime')}:
                </span>
                <span className="text-gray-900">
                  {selectedTimeSlot
                    ? `${selectedTimeSlot.startTime.toLocaleDateString('vi-VN')} ${selectedTimeSlot.startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">
                  {t('appointment.priority')}:
                </span>
                <span className="text-gray-900 capitalize">
                  {form.getFieldValue('priority')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">
                  {t('appointment.form.location')}:
                </span>
                <span className="text-gray-900 capitalize">
                  {form.getFieldValue('location') === 'online'
                    ? t('appointment.form.locationOnline')
                    : t('appointment.form.locationOffline')}
                </span>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
  ]

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={800}
      title={
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('appointment.form.title')}
          </h2>
          <p className="text-gray-600 mt-1">{t('appointment.form.subtitle')}</p>
        </div>
      }
      className="appointment-modal"
    >
      <div className="py-6">
        <Steps current={activeStep} items={steps} className="mb-8" />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-6"
        >
          {steps[activeStep].content}

          <Divider />

          <div className="flex justify-between items-center">
            <Button
              onClick={prevStep}
              disabled={activeStep === 0}
              icon={<ClockCircleOutlined />}
            >
              {t('common.back')}
            </Button>

            <div className="flex space-x-3">
              {activeStep < steps.length - 1 ? (
                <Button
                  type="primary"
                  onClick={nextStep}
                  disabled={
                    !form.getFieldValue('caseId') ||
                    (activeStep === 1 && !selectedTimeSlot)
                  }
                >
                  {t('common.next')}
                </Button>
              ) : (
                <>
                  <Button onClick={handleClose}>{t('common.cancel')}</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    disabled={!selectedTimeSlot}
                  >
                    {loading ? t('common.creating') : t('appointment.create')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  )
}

export default CreateAppointmentModal
