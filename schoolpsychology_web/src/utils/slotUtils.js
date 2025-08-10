import dayjs from 'dayjs'

/**
 * Validate slot based on business rules
 * @param {dayjs.Dayjs} start - Start date time
 * @param {dayjs.Dayjs} end - End date time
 * @param {string} slotType - Type of slot (APPOINTMENT/PROGRAM)
 * @param {string} userRole - User role (MANAGER/COUNSELOR/TEACHER)
 * @param {Function} t - Translation function
 * @param {Array} existingSlots - Array of existing slots for the same day
 * @returns {string|null} Error message or null if valid
 */
export const validateSlot = (start, end, userRole, t, existingSlots = []) => {
  // Check if start time is before end time
  if (start.isAfter(end) || start.isSame(end)) {
    return t('slotManagement.validation.startTimeBeforeEndTime')
  }

  // Check duration is at least 1 hour
  const duration = end.diff(start, 'hour', true)
  if (duration < 1) {
    return t('slotManagement.validation.durationMin')
  }

  // Check duration is integer
  // if (duration % 1 !== 0) {
  //   return t('slotManagement.validation.durationInteger')
  // }

  // Check end time is not after 17:00
  const endHour = end.hour()
  if (endHour > 17 || (endHour === 17 && end.minute() > 0)) {
    return t('slotManagement.validation.endTimeBefore17')
  }

  // Check start time is not before 8:00
  const startHour = start.hour()
  if (startHour < 8) {
    return t('slotManagement.validation.startTimeAfter8')
  }

  // Manager cannot create slots
  if (userRole === 'MANAGER') {
    return t('slotManagement.validation.managerProgramOnly')
  }

  // Get existing slots for the same day
  const sameDay = existingSlots.filter(slot => {
    const slotDate = dayjs(slot.startDateTime).format('YYYY-MM-DD')
    const newSlotDate = start.format('YYYY-MM-DD')
    return slotDate === newSlotDate
  })

  // Counselor specific validations
  if (userRole === 'COUNSELOR') {
    // Check if slot is either morning (8-12) or afternoon (14-17)
    const isMorningSlot = startHour >= 8 && endHour <= 12
    const isAfternoonSlot = startHour >= 14 && endHour <= 17

    if (!isMorningSlot && !isAfternoonSlot) {
      return t('slotManagement.validation.counselorTimeSlots')
    }

    // Check existing slots for the day
    const existingMorningSlot = sameDay.some(slot => {
      const slotStart = dayjs(slot.startDateTime)
      return slotStart.hour() >= 8 && slotStart.hour() < 12
    })

    const existingAfternoonSlot = sameDay.some(slot => {
      const slotStart = dayjs(slot.startDateTime)
      return slotStart.hour() >= 14 && slotStart.hour() < 17
    })

    // If creating morning slot but already exists
    if (isMorningSlot && existingMorningSlot) {
      return t('slotManagement.validation.counselorMorningExists')
    }

    // If creating afternoon slot but already exists
    if (isAfternoonSlot && existingAfternoonSlot) {
      return t('slotManagement.validation.counselorAfternoonExists')
    }

    // Must create both slots
    if (sameDay.length >= 2) {
      return t('slotManagement.validation.counselorMaxSlots')
    }
  }

  // Teacher specific validations
  if (userRole === 'TEACHER') {
    // Teachers can create multiple slots, no additional validation needed
    return null
  }

  return null
}

/**
 * Check if slot conflicts with existing slots
 * @param {dayjs.Dayjs} start - Start date time
 * @param {dayjs.Dayjs} end - End date time
 * @param {number} staffId - Staff user ID
 * @param {Array} existingSlots - Array of existing slots
 * @returns {boolean} True if conflict exists
 */
export const checkSlotConflict = (start, end, staffId, existingSlots = []) => {
  if (!existingSlots || !Array.isArray(existingSlots) || !existingSlots.length)
    return false

  return existingSlots.some(slot => {
    if (!slot || slot.staffId !== staffId) return false

    const slotStart = dayjs(slot.startDateTime)
    const slotEnd = dayjs(slot.endDateTime)

    // Check if the new slot overlaps with existing slot
    return (
      (start.isBefore(slotEnd) && end.isAfter(slotStart)) ||
      start.isSame(slotStart) ||
      end.isSame(slotEnd)
    )
  })
}

/**
 * Get disabled time options for DatePicker
 * @param {dayjs.Dayjs} date - Selected date
 * @returns {Object} Disabled time options
 */
export const getDisabledTime = date => {
  if (!date) return {}

  return {
    disabledHours: () => {
      const hours = []
      // Disable hours before 8:00 and after 17:00
      for (let i = 0; i < 8; i++) hours.push(i)
      for (let i = 18; i < 24; i++) hours.push(i)
      return hours
    },
  }
}

/**
 * Get disabled date function for DatePicker
 * @returns {Function} Disabled date function
 */
export const getDisabledDate = () => {
  return current => {
    // Disable past dates
    return current && current < dayjs().startOf('day')
  }
}

/**
 * Format date time for display
 * @param {string|dayjs.Dayjs} dateTime - Date time to format
 * @returns {string} Formatted date time string
 */
export const formatDateTime = dateTime => {
  return dayjs(dateTime).format('HH:mm - DD/MM/YYYY')
}

/**
 * Get status badge configuration
 * @param {number} status - Status code
 * @param {Function} t - Translation function
 * @returns {Object} Badge configuration
 */
export const getStatusBadgeConfig = (status, t) => {
  const statusMap = {
    PUBLISHED: {
      text: t('slotManagement.statusOptions.published'),
      color: 'green',
    },
    DRAFT: { text: t('slotManagement.statusOptions.draft'), color: 'gray' },
    CLOSED: { text: t('slotManagement.statusOptions.closed'), color: 'red' },
  }

  return statusMap[status] || statusMap[0]
}

/**
 * Get slot type text
 * @param {string} type - Slot type
 * @param {Function} t - Translation function
 * @returns {string} Translated type text
 */
export const getSlotTypeText = (type, t) => {
  const typeMap = {
    APPOINTMENT: t('slotManagement.typeOptions.appointment'),
    PROGRAM: t('slotManagement.typeOptions.program'),
  }
  return typeMap[type] || type
}

/**
 * Generate 30-minute time slots between start and end time
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time
 * @returns {Array} Array of time slots
 */
export const generateTimeSlots = (startTime, endTime) => {
  const slots = []
  const current = new Date(startTime)
  const end = new Date(endTime)

  while (current < end) {
    const slotStart = new Date(current)
    const slotEnd = new Date(current.getTime() + 30 * 60 * 1000) // 30 minutes

    if (slotEnd <= end) {
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        duration: 30,
        isAvailable: true,
      })
    }

    current.setTime(current.getTime() + 30 * 60 * 1000)
  }

  return slots
}

/**
 * Mark booked slots as unavailable
 * @param {Array} timeSlots - Array of time slots
 * @param {Array} bookedSlots - Array of booked slots
 * @returns {Array} Updated time slots with availability status
 */
export const markBookedSlots = (timeSlots, bookedSlots) => {
  return timeSlots.map(slot => {
    const isBooked = bookedSlots.some(booked => {
      const bookedStart = new Date(booked.startDateTime)
      const bookedEnd = new Date(booked.endDateTime)
      return slot.startTime >= bookedStart && slot.endTime <= bookedEnd
    })

    return {
      ...slot,
      isAvailable: !isBooked,
    }
  })
}

/**
 * Format time slot for display
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted time string
 */
export const formatTimeSlot = (startTime, endTime, locale = 'vi-VN') => {
  const start = new Date(startTime)
  const end = new Date(endTime)

  const dateStr = start.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const timeStr = start.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })

  const duration = Math.round((end - start) / (1000 * 60))

  return { dateStr, timeStr, duration }
}

/**
 * Group time slots by date
 * @param {Array} timeSlots - Array of time slots
 * @returns {Object} Time slots grouped by date
 */
export const groupSlotsByDate = timeSlots => {
  const grouped = {}

  timeSlots.forEach(slot => {
    const dateKey = slot.startTime.toDateString()
    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(slot)
  })

  return grouped
}

/**
 * Check if a time slot conflicts with existing appointments
 * @param {Object} newSlot - New appointment slot
 * @param {Array} existingSlots - Existing appointment slots
 * @returns {boolean} True if there's a conflict
 */
export const hasTimeConflict = (newSlot, existingSlots) => {
  return existingSlots.some(existing => {
    const newStart = new Date(newSlot.startDateTime)
    const newEnd = new Date(newSlot.endDateTime)
    const existingStart = new Date(existing.startDateTime)
    const existingEnd = new Date(existing.endDateTime)

    return newStart < existingEnd && newEnd > existingStart
  })
}
