import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  appointments: [],
  appointmentRecords: [],
  selectedAppointment: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
}

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    // Clear error when starting new request
    clearError: state => {
      state.error = null
    },
    // Update pagination
    updatePagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    // Clear appointments
    clearAppointments: state => {
      state.appointments = []
    },
    // Clear appointment records
    clearAppointmentRecords: state => {
      state.appointmentRecords = []
    },
    // Set selected appointment
    setSelectedAppointment: (state, action) => {
      state.selectedAppointment = action.payload
    },
    // Clear selected appointment
    clearSelectedAppointment: state => {
      state.selectedAppointment = null
    },
  },
  extraReducers: builder => {
    builder
      // getAppointments
      .addCase('appointment/getAppointments/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('appointment/getAppointments/fulfilled', (state, action) => {
        state.loading = false
        state.appointments = action.payload.data || action.payload
        if (action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination,
          }
        }
        state.error = null
      })
      .addCase('appointment/getAppointments/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch appointments'
      })

      // updateAppointment
      .addCase('appointment/updateAppointment/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('appointment/updateAppointment/fulfilled', (state, action) => {
        state.loading = false
        // Update the appointment in the list
        if (action.payload && action.payload.id) {
          const index = state.appointments.findIndex(
            appointment => appointment.id === action.payload.id
          )
          if (index !== -1) {
            state.appointments[index] = action.payload
          }
        }
        state.error = null
      })
      .addCase('appointment/updateAppointment/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to update appointment'
      })

      // getAppointmentRecords
      .addCase('appointment/getAppointmentRecords/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase(
        'appointment/getAppointmentRecords/fulfilled',
        (state, action) => {
          state.loading = false
          state.appointmentRecords = action.payload.data || action.payload
          state.error = null
        }
      )
      .addCase(
        'appointment/getAppointmentRecords/rejected',
        (state, action) => {
          state.loading = false
          state.error = action.payload || 'Failed to fetch appointment records'
        }
      )

      // createAppointmentRecord
      .addCase('appointment/createAppointmentRecord/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase(
        'appointment/createAppointmentRecord/fulfilled',
        (state, action) => {
          state.loading = false
          // Add the new appointment record to the list
          if (action.payload) {
            state.appointmentRecords.unshift(action.payload)
          }
          state.error = null
        }
      )
      .addCase(
        'appointment/createAppointmentRecord/rejected',
        (state, action) => {
          state.loading = false
          state.error = action.payload || 'Failed to create appointment record'
        }
      )
  },
})

export const {
  clearError,
  updatePagination,
  clearAppointments,
  clearAppointmentRecords,
  clearAppointment,
  setSelectedAppointment,
  clearSelectedAppointment,
} = appointmentSlice.actions

// Selectors
export const selectAppointments = state => state.appointment.appointments
export const selectAppointmentRecords = state =>
  state.appointment.appointmentRecords
export const selectAppointmentLoading = state => state.appointment.loading
export const selectAppointmentError = state => state.appointment.error
export const selectAppointmentPagination = state => state.appointment.pagination

// Selector to get appointment by id
export const selectAppointmentById = (state, appointmentId) => {
  return state.appointment.appointments.find(
    appointment => String(appointment.id) === String(appointmentId)
  )
}

// Selector to get appointment record by id
export const selectAppointmentRecordById = (state, recordId) => {
  return state.appointment.appointmentRecords.find(
    record => String(record.id) === String(recordId)
  )
}

// Selector to get appointment record by appointment id
export const selectAppointmentRecordByAppointmentId = (
  state,
  appointmentId
) => {
  return state.appointment.appointmentRecords.find(
    record => String(record.appointment?.id) === String(appointmentId)
  )
}

// Selector to get selected appointment
export const selectSelectedAppointment = state =>
  state.appointment.selectedAppointment

export default appointmentSlice.reducer
