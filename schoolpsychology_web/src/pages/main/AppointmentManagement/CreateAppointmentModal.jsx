import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
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
  Badge,
  Tooltip,
} from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { fetchSlots } from '../../../store/actions/slotActions'
import { appointmentAPI } from '@/services/appointmentApi'
import {
  generateTimeSlots,
  markBookedSlots,
  formatTimeSlot,
  validateTimeSlotRange,
} from '../../../utils/slotUtils'
import { useTheme } from '../../../contexts/ThemeContext'
import { caseAPI } from '@/services/caseApi'

const { TextArea } = Input
const { RangePicker } = DatePicker

// Memoized components for better performance
const TimeSlotCard = React.memo(
  ({
    slot,
    isSelected,
    isBooked,
    onSelect,
    timeSlotCardClassName,
    isDarkMode,
    t,
  }) => {
    const { timeStr, duration } = formatTimeSlot(slot.startTime, slot.endTime)
    const handleClick = useCallback(() => {
      if (slot.isAvailable) {
        onSelect(slot)
      }
    }, [slot, onSelect])

    return (
      <Tooltip
        title={
          isBooked
            ? t('appointment.form.slotBooked')
            : t('appointment.form.clickToSelect')
        }
        placement="top"
      >
        <Card
          size="small"
          className={`time-slot-card ${timeSlotCardClassName} ${
            isSelected ? 'selected' : ''
          } ${isBooked ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleClick}
        >
          <div className="text-center">
            <div
              className={`font-medium text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
            >
              {timeStr}
            </div>
            <div
              className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {duration} {t('appointment.form.minutes')}
            </div>
            {isSelected && (
              <CheckCircleOutlined className="text-green-500 text-lg mt-1" />
            )}
            {isBooked && (
              <Tag color="red" size="small" className="mt-1">
                {t('appointment.form.bookedSlots')}
              </Tag>
            )}
          </div>
        </Card>
      </Tooltip>
    )
  }
)

const CaseInfoCard = React.memo(
  ({ selectedCase, cardClassName, isDarkMode, t }) => (
    <Card className={`${cardClassName} border-l-4 border-l-blue-500`}>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircleOutlined className="text-green-500 text-lg" />
          <span
            className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
          >
            {t('appointment.selectedCase')}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex justify-between items-center">
            <span
              className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
            >
              {t('appointment.student')}:
            </span>
            <Badge
              color="blue"
              text={
                <span
                  className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                >
                  {selectedCase.student?.studentCode} -{' '}
                  {selectedCase.student?.fullName}
                </span>
              }
            />
          </div>
          <div className="flex justify-between items-center">
            <span
              className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
            >
              {t('appointment.caseInformation')}:
            </span>
            <span
              className={`${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
            >
              {selectedCase.title || selectedCase.id}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
)

// Wrapper component to ensure useForm is only called when modal is mounted
const CreateAppointmentModalContent = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { isDarkMode } = useTheme()
  const [form] = Form.useForm()

  // Refs for stable references
  const isOpenRef = useRef(isOpen)
  const userIdRef = useRef()

  // State
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [selectedCase, setSelectedCase] = useState(null)
  const [cases, setCases] = useState([])
  const [casesLoading, setCasesLoading] = useState(false)

  // Selectors with shallow comparison
  const slotsState = useSelector(
    state => state.slot,
    (left, right) => {
      return left.slots === right.slots && left.loading === right.loading
    }
  )
  const { slots, loading: slotsLoading } = slotsState
  const { user } = useSelector(state => state.auth)

  // Update refs
  isOpenRef.current = isOpen
  userIdRef.current = user?.id

  // Memoized fetch function
  const fetchCases = useCallback(async () => {
    if (!userIdRef.current) return
    try {
      setCasesLoading(true)
      const cases = await caseAPI.getCases({
        statusCase: ['IN_PROGRESS'],
        accountId: userIdRef.current,
      })
      setCases(cases || [])
      if (cases?.length > 0) {
        setSelectedCase(cases[0])
        form.setFieldsValue({
          caseId: cases[0]?.id,
        })
      }
    } catch (error) {
      console.error('Error fetching cases:', error)
    } finally {
      setCasesLoading(false)
    }
  }, [form])

  // Effects with dependency optimization
  useEffect(() => {
    if (isOpen && user?.id) {
      fetchCases()
      dispatch(fetchSlots(user.id))
    }
  }, [isOpen, user?.id, fetchCases, dispatch])

  // Memoized computations with proper dependencies
  const caseOptions = useMemo(() => {
    if (!Array.isArray(cases) || cases.length === 0) return []

    return cases.map(c => ({
      value: c.id,
      label: `${c.title || c.id} - ${c.student?.studentCode}`,
      studentId: c.student?.id,
    }))
  }, [cases])

  const availableTimeSlots = useMemo(() => {
    // Early return for invalid states
    if (!selectedDate || !Array.isArray(slots) || slots.length === 0) {
      return []
    }

    // Filter slots for the selected date with proper date comparison
    const selectedDateString = selectedDate.local().format('YYYY-MM-DD')
    const dateSlots = slots.filter(slot => {
      if (!slot?.startDateTime) return false
      const slotDate = dayjs(slot.startDateTime).local().format('YYYY-MM-DD')
      return slotDate === selectedDateString
    })

    if (dateSlots.length === 0) return []

    // Generate all time slots from available slots
    const allTimeSlots = dateSlots.reduce((acc, slot) => {
      if (!slot.startDateTime || !slot.endDateTime) {
        console.warn('Invalid slot data:', slot)
        return acc
      }

      try {
        const timeSlots = generateTimeSlots(
          slot.id,
          dayjs(slot.startDateTime).local(),
          dayjs(slot.endDateTime).local(),
          false
        )

        const enhancedTimeSlots = timeSlots.map(timeSlot => ({
          ...timeSlot,
          slotStartTime: dayjs(slot.startDateTime).local(),
          slotEndTime: dayjs(slot.endDateTime).local(),
          slotId: slot.id,
        }))

        return [...acc, ...enhancedTimeSlots]
      } catch (error) {
        console.error('Error generating time slots for slot:', slot, error)
        return acc
      }
    }, [])

    if (allTimeSlots.length === 0) return []

    // Extract and flatten booked slots
    const bookedSlots = dateSlots.reduce((acc, slot) => {
      if (Array.isArray(slot.booked)) {
        return [...acc, ...slot.booked]
      }
      return acc
    }, [])

    // Mark booked slots and return final result
    try {
      return markBookedSlots(allTimeSlots, bookedSlots)
    } catch (error) {
      console.error('Error marking booked slots:', error)
      return allTimeSlots.map(slot => ({
        ...slot,
        isAvailable: !slot.isPastSlot,
        reason: slot.isPastSlot ? 'past' : 'available',
      }))
    }
  }, [selectedDate, slots])

  // Optimized handlers with useCallback
  const handleCaseChange = useCallback(
    caseId => {
      const findCase = cases.find(c => c.id === caseId)
      setSelectedCase(findCase)
      setSelectedTimeSlot(null)
    },
    [cases]
  )

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
      const enhancedSlot = {
        ...slot,
        slotStartTime: slot.slotStartTime || slot.startTime,
        slotEndTime: slot.slotEndTime || slot.endTime,
        startTime: slot.startTime,
        endTime: slot.endTime,
        slotId: slot.slotId,
      }

      setSelectedTimeSlot(enhancedSlot)
      form.setFieldsValue({
        timeSlot: enhancedSlot,
        startDateTime: slot.startTime,
        endDateTime: slot.endTime,
      })
    },
    [form]
  )

  const handleSubmit = useCallback(async () => {
    // Validation
    if (!selectedTimeSlot) {
      message.error(t('appointment.form.slotRequired'))
      return
    }

    if (!selectedCase) {
      message.error(t('appointment.form.caseRequired'))
      return
    }

    if (
      !selectedTimeSlot.startTime ||
      !selectedTimeSlot.endTime ||
      !selectedTimeSlot.slotStartTime ||
      !selectedTimeSlot.slotEndTime
    ) {
      console.error('Invalid time slot data:', selectedTimeSlot)
      message.error(t('appointment.form.slotRequired'))
      return
    }

    if (!validateTimeSlotRange(selectedTimeSlot)) {
      console.error('Time validation failed:', {
        slotStart: selectedTimeSlot.slotStartTime,
        slotEnd: selectedTimeSlot.slotEndTime,
        appointmentStart: selectedTimeSlot.startTime,
        appointmentEnd: selectedTimeSlot.endTime,
      })
      message.error(t('appointment.form.timeRangeError'))
      return
    }

    setLoading(true)

    try {
      const appointmentData = {
        slotId: selectedTimeSlot.slotId || null,
        bookedForId: selectedCase.student?.id,
        isOnline: form.getFieldValue('location') === 'online' ? true : false,
        startDateTime: dayjs(selectedTimeSlot.startTime)
          .local()
          .format('YYYY-MM-DDTHH:mm:ss'),
        endDateTime: dayjs(selectedTimeSlot.endTime)
          .local()
          .format('YYYY-MM-DDTHH:mm:ss'),
        hostType: 'COUNSELOR',
        reasonBooking: form.getFieldValue('reasonBooking') || 'No reasons',
        caseId: selectedCase.id,
      }

      await appointmentAPI.createAppointment(appointmentData)
      message.success(t('appointment.createSuccess'))
      onSuccess()
      handleClose()
    } catch (error) {
      console.error('Error creating appointment:', error)
      if (error.response?.data?.message) {
        message.error(error.response.data.message)
      } else {
        message.error(t('appointment.createError'))
      }
    } finally {
      setLoading(false)
    }
  }, [selectedTimeSlot, selectedCase, form, t, onSuccess])

  const handleClose = useCallback(() => {
    form.resetFields()
    setActiveStep(0)
    setSelectedDate(null)
    setSelectedTimeSlot(null)
    setSelectedCase(null)
    onClose()
  }, [form, onClose])

  const nextStep = useCallback(() => {
    if (activeStep < 2) {
      setActiveStep(activeStep + 1)
    }
  }, [activeStep])

  const prevStep = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }, [activeStep])

  // Dynamic styling with stable references
  const modalClassName = useMemo(() => {
    return `appointment-modal ${isDarkMode ? 'dark' : ''}`
  }, [isDarkMode])

  const cardClassName = useMemo(() => {
    return `transition-all duration-300 hover:shadow-lg ${
      isDarkMode
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
        : 'bg-white border-gray-200 hover:border-blue-300'
    }`
  }, [isDarkMode])

  const timeSlotCardClassName = useMemo(() => {
    return `cursor-pointer transition-all duration-200 hover:scale-105 ${
      isDarkMode
        ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
        : 'bg-white border-gray-200 hover:border-blue-500'
    }`
  }, [isDarkMode])

  const isSelectedTimeSlot = useCallback(
    slot => {
      return (
        dayjs(selectedTimeSlot?.startTime).isSame(dayjs(slot?.startTime)) &&
        dayjs(selectedTimeSlot?.endTime).isSame(dayjs(slot?.endTime))
      )
    },
    [selectedTimeSlot]
  )

  // Memoized steps configuration
  const steps = useMemo(
    () => [
      {
        title: t('appointment.form.caseSection'),
        icon: <FileTextOutlined />,
        content: (
          <div className="space-y-6">
            <div className="text-center">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  isDarkMode
                    ? 'bg-blue-900/20 text-blue-400'
                    : 'bg-blue-50 text-blue-600'
                }`}
              >
                <FileTextOutlined className="text-2xl" />
              </div>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}
              >
                {t('appointment.form.caseSection')}
              </h3>
              <p
                className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {t('appointment.form.caseRequired')}
              </p>
            </div>

            <Form.Item
              name="caseId"
              label={
                <span
                  className={`flex items-center gap-2 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  <UserOutlined />
                  {t('appointment.caseInformation')}
                </span>
              }
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
                className="w-full"
              />
            </Form.Item>

            {selectedCase && (
              <CaseInfoCard
                selectedCase={selectedCase}
                cardClassName={cardClassName}
                isDarkMode={isDarkMode}
                t={t}
              />
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
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  isDarkMode
                    ? 'bg-green-900/20 text-green-400'
                    : 'bg-green-50 text-green-600'
                }`}
              >
                <CalendarOutlined className="text-2xl" />
              </div>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}
              >
                {t('appointment.form.scheduleSection')}
              </h3>
              <p
                className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {t('appointment.form.slotDescription')}
              </p>
            </div>

            <Form.Item
              name="appointmentDate"
              label={
                <span
                  className={`flex items-center gap-2 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  <CalendarOutlined />
                  {t('appointment.form.selectDate')}
                </span>
              }
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
                  <h4
                    className={`font-medium ${
                      isDarkMode ? 'text-gray-100' : 'text-gray-900'
                    }`}
                  >
                    {t('appointment.form.timeSlots')} -{' '}
                    {selectedDate.format('DD/MM/YYYY')}
                  </h4>
                  <div className="flex space-x-2">
                    <Tag color="green" className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {t('appointment.form.availableSlots')}
                    </Tag>
                    <Tag color="red" className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      {t('appointment.form.bookedSlots')}
                    </Tag>
                  </div>
                </div>

                {slotsLoading ? (
                  <div className="text-center py-12">
                    <Spin size="large" />
                    <p
                      className={`mt-4 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {t('appointment.form.loadingSlots')}
                    </p>
                  </div>
                ) : availableTimeSlots.length === 0 ? (
                  <div
                    className={`text-center py-12 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <CalendarOutlined className="text-4xl mb-4 opacity-50" />
                    <p>{t('appointment.form.noSlotsToday')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto overflow-x-hidden p-2">
                    {availableTimeSlots.map((slot, index) => (
                      <TimeSlotCard
                        key={`${slot.slotId}-${index}`}
                        slot={slot}
                        index={index}
                        isSelected={isSelectedTimeSlot(slot)}
                        isBooked={!slot.isAvailable}
                        onSelect={handleTimeSlotSelect}
                        timeSlotCardClassName={timeSlotCardClassName}
                        isDarkMode={isDarkMode}
                        t={t}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="appointmentType"
                label={
                  <span
                    className={`flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    <EnvironmentOutlined />
                    {t('appointment.form.location')}
                  </span>
                }
                initialValue="offline"
              >
                <Select>
                  <Select.Option value="offline">
                    <span className="flex items-center gap-2">
                      <EnvironmentOutlined />
                      {t('appointment.form.locationOffline')}
                    </span>
                  </Select.Option>
                  <Select.Option value="online">
                    <span className="flex items-center gap-2">
                      <VideoCameraOutlined />
                      {t('appointment.form.locationOnline')}
                    </span>
                  </Select.Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              name="reasonBooking"
              label={
                <span
                  className={`flex items-center gap-2 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  <FileTextOutlined />
                  {t('appointment.reasonBooking')}
                </span>
              }
            >
              <TextArea
                rows={3}
                placeholder={t('appointment.form.reasonPlaceholder')}
              />
            </Form.Item>
          </div>
        ),
      },
      {
        title: t('common.confirm'),
        icon: <SettingOutlined />,
        content: (
          <div className="space-y-6">
            <div className="text-center">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  isDarkMode
                    ? 'bg-purple-900/20 text-purple-400'
                    : 'bg-purple-50 text-purple-600'
                }`}
              >
                <SettingOutlined className="text-2xl" />
              </div>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}
              >
                {t('appointment.form.confirmTitle')}
              </h3>
              <p
                className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {t('appointment.form.confirmDescription')}
              </p>
            </div>

            <Card className={`${cardClassName} border-l-4 border-l-purple-500`}>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircleOutlined className="text-purple-500 text-lg" />
                  <span
                    className={`font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    {t('appointment.form.appointmentSummary')}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center">
                    <span
                      className={`font-medium ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {t('appointment.student')}:
                    </span>
                    <Badge
                      color="blue"
                      text={
                        <span
                          className={`font-semibold ${
                            isDarkMode ? 'text-gray-100' : 'text-gray-900'
                          }`}
                        >
                          {selectedCase?.student?.studentCode || '-'}
                        </span>
                      }
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span
                      className={`font-medium ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {t('appointment.caseInformation')}:
                    </span>
                    <span
                      className={`${
                        isDarkMode ? 'text-gray-100' : 'text-gray-900'
                      }`}
                    >
                      {selectedCase?.title || selectedCase?.id || '-'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span
                      className={`font-medium ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {t('appointment.form.dateTime')}:
                    </span>
                    <span
                      className={`${
                        isDarkMode ? 'text-gray-100' : 'text-gray-900'
                      }`}
                    >
                      {selectedTimeSlot
                        ? `${selectedTimeSlot.startTime.toLocaleDateString('vi-VN')} ${selectedTimeSlot.startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                        : '-'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span
                      className={`font-medium ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {t('appointment.form.location')}:
                    </span>
                    <span className="flex items-center gap-2">
                      {form.getFieldValue('location') === 'online' ? (
                        <VideoCameraOutlined className="text-blue-500" />
                      ) : (
                        <EnvironmentOutlined className="text-green-500" />
                      )}
                      <span
                        className={`${
                          isDarkMode ? 'text-gray-100' : 'text-gray-900'
                        }`}
                      >
                        {form.getFieldValue('location') === 'online'
                          ? t('appointment.form.locationOnline')
                          : t('appointment.form.locationOffline')}
                      </span>
                    </span>
                  </div>

                  {form.getFieldValue('reasonBooking') && (
                    <div className="flex justify-between items-center">
                      <span
                        className={`font-medium ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {t('appointment.reasonBooking')}:
                      </span>
                      <span
                        className={`${
                          isDarkMode ? 'text-gray-100' : 'text-gray-900'
                        }`}
                      >
                        {form.getFieldValue('reasonBooking')}
                      </span>
                    </div>
                  )}

                  {form.getFieldValue('notes') && (
                    <div className="flex justify-between items-center">
                      <span
                        className={`font-medium ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {t('appointment.notes')}:
                      </span>
                      <span
                        className={`${
                          isDarkMode ? 'text-gray-100' : 'text-gray-900'
                        }`}
                      >
                        {form.getFieldValue('notes')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        ),
      },
    ],
    [
      t,
      isDarkMode,
      selectedCase,
      cardClassName,
      casesLoading,
      caseOptions,
      handleCaseChange,
      selectedDate,
      handleDateChange,
      availableTimeSlots,
      slotsLoading,
      selectedTimeSlot,
      handleTimeSlotSelect,
      timeSlotCardClassName,
      form,
    ]
  )

  // Memoized navigation conditions
  const canProceedToNextStep = useMemo(() => {
    if (activeStep === 0) return !!selectedCase
    if (activeStep === 1) return !!selectedTimeSlot
    return true
  }, [activeStep, selectedCase, selectedTimeSlot])

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={1000}
      className={modalClassName}
      centered
      destroyOnHidden
      title={
        <div className="text-center">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 mx-auto ${
              isDarkMode
                ? 'bg-blue-900/20 text-blue-400'
                : 'bg-blue-50 text-blue-600'
            }`}
          >
            <CalendarOutlined className="text-3xl" />
          </div>
          <h2
            className={`text-2xl font-bold mb-2 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}
          >
            {t('appointment.form.title')}
          </h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('appointment.form.subtitle')}
          </p>
        </div>
      }
    >
      <div className="py-6">
        <Steps
          current={activeStep}
          items={steps}
          className="mb-8"
          progressDot
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-6"
        >
          <div className="min-h-[400px]">{steps[activeStep].content}</div>

          <Divider />

          <div className="flex justify-between items-center">
            <Button
              onClick={prevStep}
              disabled={activeStep === 0}
              icon={<ClockCircleOutlined />}
              size="large"
              className="flex items-center gap-2"
            >
              {t('common.back')}
            </Button>

            <div className="flex space-x-3">
              {activeStep < steps.length - 1 ? (
                <Button
                  type="primary"
                  onClick={nextStep}
                  disabled={!canProceedToNextStep}
                  size="large"
                  className="flex items-center gap-2"
                >
                  {t('common.next')}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleClose}
                    size="large"
                    className="flex items-center gap-2"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    disabled={!selectedTimeSlot}
                    size="large"
                    className="flex items-center gap-2"
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

// Main component that conditionally renders the content
const CreateAppointmentModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null

  return (
    <CreateAppointmentModalContent
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}

export default CreateAppointmentModal
