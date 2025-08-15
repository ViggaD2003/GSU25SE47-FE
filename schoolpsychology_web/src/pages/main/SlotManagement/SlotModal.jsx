import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  Modal,
  Form,
  DatePicker,
  Space,
  Button,
  Card,
  Row,
  Col,
  Divider,
  Typography,
  Tag,
  Popconfirm,
  Empty,
  Badge,
  Alert,
} from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  BookOutlined,
  InfoCircleOutlined,
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
  selectCreateLoading,
  selectCreateError,
  clearError,
} from '../../../store/slices/slotSlice'
import { validateSlot, checkSlotConflict } from '../../../utils/slotUtils'
import { slotAPI } from '@/services/slotApi'

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
    }}
  >
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

  useEffect(() => {
    if (createError) {
      dispatch(clearError())
    }
  }, [createError, dispatch])

  // Function to group slots by date and sort by time
  const groupSlotsByDate = slots => {
    const groupedSlots = {}

    slots.forEach(slot => {
      const dateKey = dayjs(slot.startDateTime).format('YYYY-MM-DD')
      if (!groupedSlots[dateKey]) {
        groupedSlots[dateKey] = []
      }
      groupedSlots[dateKey].push(slot)
    })

    return Object.entries(groupedSlots)
      .map(([dateKey, dateSlots]) => ({
        dateKey,
        date: dayjs(dateKey),
        slots: dateSlots.sort((a, b) =>
          dayjs(a.startDateTime).diff(dayjs(b.startDateTime))
        ),
        totalSlots: dateSlots.length,
      }))
      .sort((a, b) => a.date.diff(b.date)) // Sort dates chronologically
  }

  // Function to handle form field changes
  const handleFieldChange = () => {
    // Form field change handler - no longer needed for calculation
  }

  // Function to check if a slot is in conflict
  const isSlotInConflict = slot => {
    return conflictSlots.some(
      conflictSlot =>
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
        conflict.startDateTime ===
          dayjs(slot.startDateTime).format('YYYY-MM-DDTHH:mm:ss') &&
        conflict.endDateTime ===
          dayjs(slot.endDateTime).format('YYYY-MM-DDTHH:mm:ss')
    )
    return conflictSlot?.reason || ''
  }

  // Function to check time conflicts within the same day
  const checkTimeConflictInPreview = (
    start,
    end,
    staffId,
    excludeSlotId = null
  ) => {
    const sameDaySlots = previewSlots.filter(slot => {
      // Exclude the slot being edited
      if (excludeSlotId && slot.id === excludeSlotId) return false

      // Check if same day and same staff
      const slotDate = dayjs(slot.startDateTime).format('YYYY-MM-DD')
      const newSlotDate = dayjs(start).format('YYYY-MM-DD')
      return slotDate === newSlotDate && slot.staffId === staffId
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
  const getConflictDetails = (start, end, staffId, excludeSlotId = null) => {
    const sameDaySlots = previewSlots.filter(slot => {
      // Exclude the slot being edited
      if (excludeSlotId && slot.id === excludeSlotId) return false

      // Check if same day and same staff
      const slotDate = dayjs(slot.startDateTime).format('YYYY-MM-DD')
      const newSlotDate = dayjs(start).format('YYYY-MM-DD')
      return slotDate === newSlotDate && slot.staffId === staffId
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
      startTime: dayjs(slot.startDateTime).format('HH:mm'),
      endTime: dayjs(slot.endDateTime).format('HH:mm'),
    }))
  }

  const handleAddSlot = async () => {
    try {
      const values = await form.validateFields()
      const { startDateTime, endDateTime } = values

      // Calculate start and end times
      const start = dayjs(startDateTime).tz(VN_TZ)
      const end = dayjs(endDateTime).tz(VN_TZ)
      const now = dayjs().tz(VN_TZ)

      // Check if start time is at least 1 day after current time
      if (start.isBefore(now.add(1, 'day').startOf('day'))) {
        message.error(t('slotManagement.validation.startTimeOneDayAfter'))
        return
      }

      // Check if end time is in the future
      if (end.isBefore(now) || end.isSame(now)) {
        message.error(t('slotManagement.validation.endTimeAfterNow'))
        return
      }

      // Check if start and end are on the same day
      if (!start.isSame(end, 'day')) {
        message.error(t('slotManagement.validation.sameDay'))
        return
      }

      // Check minimum duration (1 hour)
      const duration = end.diff(start, 'hour', true)
      if (duration < 1) {
        message.error(t('slotManagement.validation.minimumOneHour'))
        return
      }

      // Validate business rules
      const validationError = validateSlot(
        start,
        end,
        user?.role.toUpperCase(),
        t,
        previewSlots // Pass existing slots for validation
      )
      if (validationError) {
        message.error(validationError)
        return
      }

      // Check for conflicts with existing slots in preview
      const hasConflictInPreview = checkTimeConflictInPreview(
        start,
        end,
        user?.id
      )
      if (hasConflictInPreview) {
        const conflictDetails = getConflictDetails(start, end, user?.id)
        const conflictMessage =
          conflictDetails.length > 0
            ? `${t('slotManagement.validation.slotConflict')}\n\n${t('slotManagement.validation.conflictDetails')}:\n${conflictDetails.map(c => `- ${c.startTime} - ${c.endTime}`).join('\n')}`
            : t('slotManagement.validation.slotConflict')

        message.error(conflictMessage)
        return
      }

      // Check for conflicts with existing slots in database (if available)
      const hasConflict = checkSlotConflict(start, end, user?.id)
      if (hasConflict) {
        message.error(t('slotManagement.validation.slotConflict'))
        return
      }

      const newSlot = {
        id: Date.now(), // Temporary ID for preview
        staffId: user?.id,
        startDateTime: start,
        endDateTime: end,
        status: 'DRAFT',
      }

      const updatedSlots = [...previewSlots, newSlot]
      setPreviewSlots(updatedSlots)

      // Reset form
      form.resetFields(['startDateTime', 'endDateTime'])

      message.success(t('slotManagement.messages.slotAdded'))
    } catch (error) {
      console.error('Error adding slot:', error)
    }
  }

  const handleRemoveSlot = slotId => {
    if (Array.isArray(slotId)) {
      const updatedSlots = previewSlots.filter(
        slot => !slotId.includes(slot.id)
      )
      setPreviewSlots(updatedSlots)
      message.success(t('slotManagement.messages.dayRemoved'))
      return
    }
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
      const { startDateTime, endDateTime } = formValues

      // Get the original date from the slot
      const originalDate = dayjs(slot.startDateTime).format('YYYY-MM-DD')

      // Ensure the new times are on the same date as the original
      const start = dayjs(startDateTime).tz(VN_TZ)
      const end = dayjs(endDateTime).tz(VN_TZ)

      // Rebuild the datetime with original date but new times
      const newStart = dayjs(`${originalDate} ${start.format('HH:mm')}`).tz(
        VN_TZ
      )
      const newEnd = dayjs(`${originalDate} ${end.format('HH:mm')}`).tz(VN_TZ)

      // Validate business rules
      const validationError = validateSlot(
        newStart,
        newEnd,
        user?.role.toUpperCase(),
        t,
        previewSlots.filter(s => s.id !== slot.id) // Exclude current slot from validation
      )
      if (validationError) {
        message.error(validationError)
        return
      }

      // Check for conflicts with existing slots in preview (excluding current slot being edited)
      const hasConflictInPreview = checkTimeConflictInPreview(
        newStart,
        newEnd,
        user?.id,
        slot.id
      )
      if (hasConflictInPreview) {
        const conflictDetails = getConflictDetails(
          newStart,
          newEnd,
          user?.id,
          slot.id
        )
        const conflictMessage =
          conflictDetails.length > 0
            ? `${t('slotManagement.validation.slotConflict')}\n\n${t('slotManagement.validation.conflictDetails')}:\n${conflictDetails.map(c => `- ${c.startTime} - ${c.endTime}`).join('\n')}`
            : t('slotManagement.validation.slotConflict')

        message.error(conflictMessage)
        return
      }

      // Check for conflicts with existing slots in database (if available)
      const hasConflict = checkSlotConflict(newStart, newEnd, user?.id)
      if (hasConflict) {
        message.error(t('slotManagement.validation.slotConflict'))
        return
      }

      const updatedSlot = {
        ...slot,
        staffId: user?.id,
        startDateTime: newStart.format(),
        endDateTime: newEnd.format(),
        status: slot.status || 'DRAFT',
      }

      const updatedSlots = previewSlots.map(s =>
        s.id === slot.id ? updatedSlot : s
      )
      setPreviewSlots(updatedSlots)
      setEditingSlotId(null)
      message.success(t('slotManagement.messages.slotUpdated'))
    } catch (error) {
      console.error('Error updating slot:', error)
      message.error(t('slotManagement.messages.updateError'))
    }
  }

  const handleSubmit = async () => {
    if (previewSlots.length === 0) {
      message.warning(t('slotManagement.messages.noSlotsToCreate'))
      return
    }

    try {
      const slotsToCreate = previewSlots.map(slot => ({
        hostById: user?.id,
        startDateTime: dayjs(slot.startDateTime).tz(VN_TZ).format(VN_TZ_FORMAT),
        endDateTime: dayjs(slot.endDateTime).tz(VN_TZ).format(VN_TZ_FORMAT),
      }))

      const result = await slotAPI.createSlots(slotsToCreate)
      if (result) {
        setPreviewSlots([])
        form.resetFields()
        setConflictSlots([])
        onSuccess(t('slotManagement.messages.createSuccess'))
      }
    } catch (error) {
      console.log('error', error.response?.data)
      setConflictSlots(error.response?.data?.errors || [])
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

  const getCounselorDisabledDate = current => {
    const tomorrow = dayjs().tz(VN_TZ).add(1, 'day').startOf('day')

    // Basic validation: past dates, today, and Sundays
    if (current && (current < tomorrow || current.day() === 0)) {
      return true
    }

    // For counselors, check if the date already has slots in preview
    if (user?.role.toUpperCase() === 'COUNSELOR') {
      const currentDate = current.format('YYYY-MM-DD')
      const hasExistingSlots = previewSlots.some(slot => {
        const slotDate = dayjs(slot.startDateTime).format('YYYY-MM-DD')
        return slotDate === currentDate
      })

      if (hasExistingSlots) {
        return true // Disable date if it already has slots
      }
    }

    return false
  }

  const getSmartDisabledDate = (isEndTime = false) => {
    return current => {
      const tomorrow = dayjs().tz(VN_TZ).add(1, 'day').startOf('day')

      // Basic validation: past dates, today, and Sundays
      if (current && (current < tomorrow || current.day() === 0)) {
        return true
      }

      // If this is for endTime and startTime is selected
      if (isEndTime) {
        const startTime = form.getFieldValue('startDateTime')
        if (startTime) {
          const startDate = dayjs(startTime)
          // End time must be on the same day as start time
          return !current.isSame(startDate, 'day')
        }
      }

      // If this is for startTime and endTime is selected
      if (!isEndTime) {
        const endTime = form.getFieldValue('endDateTime')
        if (endTime) {
          const endDate = dayjs(endTime)
          // Start time must be on the same day as end time
          return !current.isSame(endDate, 'day')
        }
      }

      return false
    }
  }

  const getSmartDisabledTime = (isEndTime = false) => {
    return date => {
      if (!date) return {}

      let disabledHours = []

      // Basic time restrictions (8-17h)
      disabledHours = disabledHours.concat(
        Array.from({ length: 8 }, (_, i) => i)
      )
      disabledHours = disabledHours.concat(
        Array.from({ length: 6 }, (_, i) => i + 18)
      )

      // Counselor restrictions
      if (user?.role.toUpperCase() === 'COUNSELOR') {
        disabledHours.push(12, 13)
      }

      // Smart restrictions based on the other field
      if (isEndTime) {
        const startTime = form.getFieldValue('startDateTime')
        if (startTime && date.isSame(dayjs(startTime), 'day')) {
          const startHour = dayjs(startTime).hour()
          const startMinute = dayjs(startTime).minute()

          // Disable hours before start time + 1 hour minimum
          for (let i = 8; i <= startHour; i++) {
            if (i < startHour || (i === startHour && startMinute >= 30)) {
              disabledHours.push(i)
            }
          }
        }
      } else {
        const endTime = form.getFieldValue('endDateTime')
        if (endTime && date.isSame(dayjs(endTime), 'day')) {
          const endHour = dayjs(endTime).hour()

          // Disable hours after end time - 1 hour minimum
          for (let i = endHour; i <= 17; i++) {
            disabledHours.push(i)
          }
        }
      }

      // Remove duplicates and sort
      disabledHours = Array.from(new Set(disabledHours)).sort((a, b) => a - b)

      // Function to disable minutes
      const getDisabledMinutes = selectedHour => {
        const disabledMinutes = []

        // Only allow 00 and 30 minutes
        for (let i = 1; i <= 29; i++) {
          disabledMinutes.push(i)
        }
        for (let i = 31; i <= 59; i++) {
          disabledMinutes.push(i)
        }

        // Additional minute restrictions for minimum 1 hour duration
        if (isEndTime) {
          const startTime = form.getFieldValue('startDateTime')
          if (startTime && date.isSame(dayjs(startTime), 'day')) {
            const startHour = dayjs(startTime).hour()
            const startMinute = dayjs(startTime).minute()

            if (selectedHour === startHour) {
              // If same hour as start, disable all minutes
              disabledMinutes.push(0, 30)
            } else if (selectedHour === startHour + 1) {
              // If one hour after start, only allow if start minute <= selected minute
              if (startMinute === 30) {
                disabledMinutes.push(0) // Can only select 30
              }
              // If start minute is 0, both 0 and 30 are allowed
            }
          }
        } else {
          const endTime = form.getFieldValue('endDateTime')
          if (endTime && date.isSame(dayjs(endTime), 'day')) {
            const endHour = dayjs(endTime).hour()
            const endMinute = dayjs(endTime).minute()

            if (selectedHour === endHour) {
              // If same hour as end, disable all minutes
              disabledMinutes.push(0, 30)
            } else if (selectedHour === endHour - 1) {
              // If one hour before end, only allow if selected minute <= end minute
              if (endMinute === 0) {
                disabledMinutes.push(30) // Can only select 0
              }
              // If end minute is 30, both 0 and 30 are allowed
            }
          }
        }

        return disabledMinutes
      }

      return {
        disabledHours: () => disabledHours,
        disabledMinutes: getDisabledMinutes,
      }
    }
  }

  const customStartDateTimeValidator = (_, value) => {
    if (!value) return Promise.resolve()
    const now = dayjs().tz(VN_TZ)
    const tomorrow = now.add(1, 'day').startOf('day')

    // Check if start time is at least 1 day after current time
    if (value.isBefore(tomorrow)) {
      return Promise.reject(t('slotManagement.validation.startTimeOneDayAfter'))
    }

    // Check if it's Sunday
    if (value.day() === 0) {
      return Promise.reject(t('slotManagement.validation.noSunday'))
    }

    // Check time range 8-17h
    const hour = value.hour()
    if (hour < 8 || hour >= 17) {
      return Promise.reject(t('slotManagement.validation.timeRange'))
    }

    // If counselor, check specific time restrictions
    if (
      user?.role.toUpperCase() === 'COUNSELOR' &&
      (hour === 12 || hour === 13)
    ) {
      return Promise.reject(
        t('slotManagement.validation.counselorTimeRestriction')
      )
    }

    // Only allow 00 or 30 minutes
    const minute = value.minute()
    if (minute !== 0 && minute !== 30) {
      return Promise.reject(t('slotManagement.validation.minuteRestriction'))
    }

    return Promise.resolve()
  }

  const customEndDateTimeValidator = (_, value) => {
    const start = form.getFieldValue('startDateTime')
    if (!value || !start) return Promise.resolve()

    const startTime = dayjs(start)
    const endTime = dayjs(value)

    // Check if same day
    if (!startTime.isSame(endTime, 'day')) {
      return Promise.reject(t('slotManagement.validation.sameDay'))
    }

    // Check if end is after start
    if (endTime.isBefore(startTime) || endTime.isSame(startTime)) {
      return Promise.reject(t('slotManagement.validation.endAfterStart'))
    }

    // Check minimum duration (1 hour)
    const duration = endTime.diff(startTime, 'hour', true)
    if (duration < 1) {
      return Promise.reject(t('slotManagement.validation.minimumOneHour'))
    }

    // Check time range
    const hour = endTime.hour()
    if (hour < 8 || hour > 17) {
      return Promise.reject(t('slotManagement.validation.timeRange'))
    }

    // Only allow 00 or 30 minutes
    const minute = endTime.minute()
    if (minute !== 0 && minute !== 30) {
      return Promise.reject(t('slotManagement.validation.minuteRestriction'))
    }

    return Promise.resolve()
  }

  const InlineEditForm = ({ slot, onSave, onCancel }) => {
    const [editForm] = Form.useForm()
    const originalDate = dayjs(slot.startDateTime).format('YYYY-MM-DD')

    useEffect(() => {
      editForm.setFieldsValue({
        startDateTime: dayjs(slot.startDateTime),
        endDateTime: dayjs(slot.endDateTime),
      })
    }, [slot, editForm])

    // Only allow the original date for editing
    const getEditDisabledDate = current => {
      if (!current) return false
      const currentDate = current.format('YYYY-MM-DD')
      return currentDate !== originalDate
    }

    // Handle start time change - auto update end time if needed
    const handleStartTimeChange = startDateTime => {
      if (!startDateTime) return

      const currentEndTime = editForm.getFieldValue('endDateTime')
      if (!currentEndTime) return

      // If start time is >= end time, auto update end time to start + 1 hour
      if (startDateTime.isSameOrAfter(currentEndTime)) {
        const newEndTime = startDateTime.add(1, 'hour')

        // Check if new end time exceeds 17:00
        if (
          newEndTime.hour() > 17 ||
          (newEndTime.hour() === 17 && newEndTime.minute() > 0)
        ) {
          message.warning(t('slotManagement.validation.endTimeExceedsLimit'))
          return
        }

        editForm.setFieldsValue({
          endDateTime: newEndTime,
        })
      }
    }

    // Custom disabled time for edit mode - ensures times stay on the same day
    const getEditDisabledTime = (isEndTime = false) => {
      return date => {
        if (!date) return {}

        let disabledHours = []

        // Basic time restrictions (8-17h)
        disabledHours = disabledHours.concat(
          Array.from({ length: 8 }, (_, i) => i)
        )
        disabledHours = disabledHours.concat(
          Array.from({ length: 6 }, (_, i) => i + 18)
        )

        // Counselor restrictions
        if (user?.role.toUpperCase() === 'COUNSELOR') {
          disabledHours.push(12, 13)
        }

        // Smart restrictions based on the other field
        if (isEndTime) {
          const startTime = editForm.getFieldValue('startDateTime')
          if (startTime && date.isSame(dayjs(startTime), 'day')) {
            const startHour = dayjs(startTime).hour()
            const startMinute = dayjs(startTime).minute()

            // Disable hours before start time + 1 hour minimum
            for (let i = 8; i <= startHour; i++) {
              if (i < startHour || (i === startHour && startMinute >= 30)) {
                disabledHours.push(i)
              }
            }
          }
        } else {
          const endTime = editForm.getFieldValue('endDateTime')
          if (endTime && date.isSame(dayjs(endTime), 'day')) {
            const endHour = dayjs(endTime).hour()

            // Disable hours after end time - 1 hour minimum
            for (let i = endHour; i <= 17; i++) {
              disabledHours.push(i)
            }
          }
        }

        // Remove duplicates and sort
        disabledHours = Array.from(new Set(disabledHours)).sort((a, b) => a - b)

        // Function to disable minutes
        const getDisabledMinutes = selectedHour => {
          const disabledMinutes = []

          // Only allow 00 and 30 minutes
          for (let i = 1; i <= 29; i++) {
            disabledMinutes.push(i)
          }
          for (let i = 31; i <= 59; i++) {
            disabledMinutes.push(i)
          }

          // Additional minute restrictions for minimum 1 hour duration
          if (isEndTime) {
            const startTime = editForm.getFieldValue('startDateTime')
            if (startTime && date.isSame(dayjs(startTime), 'day')) {
              const startHour = dayjs(startTime).hour()
              const startMinute = dayjs(startTime).minute()

              if (selectedHour === startHour) {
                // If same hour as start, disable all minutes
                disabledMinutes.push(0, 30)
              } else if (selectedHour === startHour + 1) {
                // If one hour after start, only allow if start minute <= selected minute
                if (startMinute === 30) {
                  disabledMinutes.push(0) // Can only select 30
                }
                // If start minute is 0, both 0 and 30 are allowed
              }
            }
          } else {
            const endTime = editForm.getFieldValue('endDateTime')
            if (endTime && date.isSame(dayjs(endTime), 'day')) {
              const endHour = dayjs(endTime).hour()
              const endMinute = dayjs(endTime).minute()

              if (selectedHour === endHour) {
                // If same hour as end, disable all minutes
                disabledMinutes.push(0, 30)
              } else if (selectedHour === endHour - 1) {
                // If one hour before end, only allow if selected minute <= end minute
                if (endMinute === 0) {
                  disabledMinutes.push(30) // Can only select 0
                }
                // If end minute is 30, both 0 and 30 are allowed
              }
            }
          }

          return disabledMinutes
        }

        return {
          disabledHours: () => disabledHours,
          disabledMinutes: getDisabledMinutes,
        }
      }
    }

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
        <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
          {t('slotManagement.form.editTimeOnlyNote')}
        </div>
        <Form form={editForm} layout="vertical" size="small">
          <Row gutter={8}>
            <Col span={10}>
              <Form.Item
                name="startDateTime"
                rules={[{ required: true, message: 'Required' }]}
              >
                <DatePicker
                  showTime={{ format: 'HH:mm' }}
                  format="MM-DD HH:mm"
                  placeholder="Start time"
                  disabledDate={getEditDisabledDate}
                  disabledTime={getEditDisabledTime(false)}
                  style={{ width: '100%' }}
                  minuteStep={30}
                  onChange={handleStartTimeChange}
                />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="endDateTime"
                rules={[{ required: true, message: 'Required' }]}
              >
                <DatePicker
                  showTime={{ format: 'HH:mm' }}
                  format="MM-DD HH:mm"
                  placeholder="End time"
                  disabledDate={getEditDisabledDate}
                  disabledTime={getEditDisabledTime(true)}
                  minuteStep={30}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>

            <Col span={4}>
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
    const isCounselor = user?.role.toUpperCase() === 'COUNSELOR'

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
            {!isCounselor && !isEditing && (
              <Button
                type="text"
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleStartEdit(slot)}
              />
            )}

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
        {isEditing && !isCounselor ? (
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
                  {dayjs(slot.startDateTime).format('HH:mm')} -{' '}
                  {dayjs(slot.endDateTime).format('HH:mm')}
                </Text>
                {slot.period && (
                  <Tag color={slot.period === 'morning' ? 'blue' : 'green'}>
                    {t(`slotManagement.period.${slot.period}`)}
                  </Tag>
                )}
                <Tag color={slot.status === 'PUBLISHED' ? 'green' : 'orange'}>
                  {t(
                    `slotManagement.statusOptions.${slot.status?.toLowerCase()}`
                  )}
                </Tag>
                {isConflicting && (
                  <Tag color="red" icon={<ExclamationCircleOutlined />}>
                    {t('slotManagement.status.conflict')}
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
                {t('slotManagement.preview.duration')}:{' '}
                {dayjs(slot.endDateTime).diff(
                  dayjs(slot.startDateTime),
                  'hour'
                )}
                h
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

    // Get weekday name
    const weekdayName = dateGroup.date.format('dddd')

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
                {t('slotManagement.status.hasConflicts')}
              </Tag>
            )}

            <Popconfirm
              title={t('slotManagement.preview.deleteDayConfirm')}
              onConfirm={() =>
                handleRemoveSlot(dateGroup.slots.map(slot => slot.id))
              }
              okText={t('common.yes')}
              cancelText={t('common.no')}
            >
              <Button type="text" danger icon={<DeleteOutlined />} size="small">
                {t('slotManagement.preview.deleteDay')}
              </Button>
            </Popconfirm>

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
              {expandedDates.has(dateGroup.dateKey)
                ? t('slotManagement.preview.collapse')
                : t('slotManagement.preview.expand')}
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
              {t(`common.weekdays.${weekdayName.toLowerCase()}`)} -{' '}
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

  // Function to generate counselor slots for a given date
  const generateCounselorSlots = selectedDate => {
    const morningStart = dayjs(selectedDate).hour(8).minute(0).second(0)
    const morningEnd = dayjs(selectedDate).hour(12).minute(0).second(0)
    const afternoonStart = dayjs(selectedDate).hour(13).minute(30).second(0)
    const afternoonEnd = dayjs(selectedDate).hour(17).minute(0).second(0)

    const morningSlot = {
      id: Date.now(), // Temporary ID for preview
      staffId: user?.id,
      startDateTime: morningStart,
      endDateTime: morningEnd,
      status: 'DRAFT',
      period: 'morning',
    }

    const afternoonSlot = {
      id: Date.now() + 1, // Temporary ID for preview
      staffId: user?.id,
      startDateTime: afternoonStart,
      endDateTime: afternoonEnd,
      status: 'DRAFT',
      period: 'afternoon',
    }

    return [morningSlot, afternoonSlot]
  }

  const handleCounselorDateSelect = async date => {
    try {
      if (!date) return

      const now = dayjs().tz(VN_TZ)
      const selectedDate = dayjs(date).tz(VN_TZ)

      // Check if selected date is at least 1 day after current date
      if (selectedDate.isBefore(now.add(1, 'day').startOf('day'))) {
        message.error(t('slotManagement.validation.startTimeOneDayAfter'))
        return
      }

      // Check if selected date is Sunday (0 = Sunday)
      if (selectedDate.day() === 0) {
        message.error(t('slotManagement.validation.noSunday'))
        return
      }

      // Generate morning and afternoon slots
      const newSlots = generateCounselorSlots(selectedDate)

      // Check for conflicts with existing slots in preview
      const hasConflicts = newSlots.some(slot =>
        checkTimeConflictInPreview(
          slot.startDateTime,
          slot.endDateTime,
          user?.id
        )
      )

      if (hasConflicts) {
        message.error(t('slotManagement.validation.slotConflict'))
        return
      }

      // Check for conflicts with existing slots in database
      const hasDbConflicts = newSlots.some(slot =>
        checkSlotConflict(slot.startDateTime, slot.endDateTime, user?.id)
      )

      if (hasDbConflicts) {
        message.error(t('slotManagement.validation.slotConflict'))
        return
      }

      // Add both slots to preview
      setPreviewSlots(prev => [...prev, ...newSlots])
      form.resetFields()
      message.success(t('slotManagement.messages.slotsGenerated'))
    } catch (error) {
      console.error('Error generating counselor slots:', error)
      message.error(t('slotManagement.messages.generateError'))
    }
  }

  // Rules component
  const SlotCreationRules = () => (
    <Card
      title={
        <Space>
          <InfoCircleOutlined style={{ color: '#1890ff' }} />
          <Text strong>{t('slotManagement.rules.title')}</Text>
        </Space>
      }
      size="small"
      style={{ marginBottom: 16 }}
    >
      <div style={{ fontSize: 12, lineHeight: '1.5' }}>
        <div style={{ marginBottom: 8 }}>
          <Text strong style={{ color: '#1890ff' }}>
            {t('slotManagement.rules.timeRestrictions')}:
          </Text>
          <ul style={{ margin: '4px 0', paddingLeft: 16 }}>
            <li>{t('slotManagement.rules.minimumAdvance')}</li>
            <li>{t('slotManagement.rules.noSundays')}</li>
            <li>{t('slotManagement.rules.timeRange')}</li>
            <li>{t('slotManagement.rules.minuteOptions')}</li>
            <li>{t('slotManagement.rules.minimumDuration')}</li>
            <li>{t('slotManagement.rules.sameDay')}</li>
          </ul>
        </div>

        {user?.role.toUpperCase() === 'COUNSELOR' && (
          <div style={{ marginBottom: 8 }}>
            <Text strong style={{ color: '#52c41a' }}>
              {t('slotManagement.rules.counselorSpecific')}:
            </Text>
            <ul style={{ margin: '4px 0', paddingLeft: 16 }}>
              <li>{t('slotManagement.rules.counselorLunchBreak')}</li>
              <li>{t('slotManagement.rules.counselorAutoSlots')}</li>
            </ul>
          </div>
        )}

        <div>
          <Text strong style={{ color: '#fa8c16' }}>
            {t('slotManagement.rules.smartSelection')}:
          </Text>
          <ul style={{ margin: '4px 0', paddingLeft: 16 }}>
            <li>{t('slotManagement.rules.smartDateLock')}</li>
            <li>{t('slotManagement.rules.smartTimeRestriction')}</li>
          </ul>
        </div>
      </div>
    </Card>
  )

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
            <Form form={form} layout="vertical">
              {user?.role.toUpperCase() === 'COUNSELOR' ? (
                // Counselor Form - Only Date Selection
                <>
                  <SlotCreationRules />
                  <Form.Item
                    name="selectedDate"
                    label={
                      <Space>
                        <CalendarOutlined />
                        {t('slotManagement.form.selectDate')}
                      </Space>
                    }
                    rules={[
                      {
                        required: true,
                        message: t('slotManagement.form.dateRequired'),
                      },
                    ]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      size="large"
                      disabledDate={getCounselorDisabledDate}
                      onChange={handleCounselorDateSelect}
                      minuteStep={30}
                      placeholder={t('slotManagement.form.datePlaceholder')}
                    />
                  </Form.Item>
                </>
              ) : (
                // Teacher Form - Start and End DateTime Selection
                <>
                  <SlotCreationRules />
                  <Row gutter={16}>
                    <Col span={12}>
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
                            message: t(
                              'slotManagement.form.startDateTimeRequired'
                            ),
                          },
                          { validator: customStartDateTimeValidator },
                        ]}
                      >
                        <DatePicker
                          showTime={{ format: 'HH:mm' }}
                          format="YYYY-MM-DD HH:mm"
                          placeholder={t(
                            'slotManagement.form.startDateTimeRequired'
                          )}
                          disabledDate={getSmartDisabledDate(false)}
                          disabledTime={getSmartDisabledTime(false)}
                          style={{ width: '100%' }}
                          size="large"
                          minuteStep={30}
                          onChange={handleFieldChange}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="endDateTime"
                        label={
                          <Space>
                            <CalendarOutlined />
                            {t('slotManagement.form.endDateTime')}
                          </Space>
                        }
                        rules={[
                          {
                            required: true,
                            message: t(
                              'slotManagement.form.endDateTimeRequired'
                            ),
                          },
                          { validator: customEndDateTimeValidator },
                        ]}
                      >
                        <DatePicker
                          showTime={{ format: 'HH:mm' }}
                          format="YYYY-MM-DD HH:mm"
                          placeholder={t(
                            'slotManagement.form.endDateTimeRequired'
                          )}
                          disabledDate={getSmartDisabledDate(true)}
                          disabledTime={getSmartDisabledTime(true)}
                          style={{ width: '100%' }}
                          minuteStep={30}
                          size="large"
                          onChange={handleFieldChange}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

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
                </>
              )}
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
                message={t('slotManagement.preview.timeConflictsDetected')}
                description={
                  <div>
                    <Text strong>
                      {t(
                        'slotManagement.preview.timeConflictsDetectedDescription'
                      )}
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
                    {t('slotManagement.preview.clearConflicts')}
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
