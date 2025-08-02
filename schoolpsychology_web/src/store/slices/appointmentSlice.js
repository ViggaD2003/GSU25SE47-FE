import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  activeAppointments: [],
  pastAppointments: [],
  appointmentDetails: null,
  selectedAppointment: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  statistics: {
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    inProgress: 0,
    absent: 0,
    expired: 0,
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

    // Set appointment details
    setAppointmentDetails: (state, action) => {
      state.appointmentDetails = action.payload
    },
    // Clear appointment details
    clearAppointmentDetails: state => {
      state.appointmentDetails = null
    },
    // Set selected appointment
    setSelectedAppointment: (state, action) => {
      state.selectedAppointment = action.payload
    },
    // Clear selected appointment
    clearSelectedAppointment: state => {
      state.selectedAppointment = null
    },
    // Update statistics
    updateStatistics: (state, action) => {
      state.statistics = { ...state.statistics, ...action.payload }
    },
  },
  extraReducers: builder => {
    builder
      // getActiveAppointments
      .addCase('appointment/getActiveAppointments/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase(
        'appointment/getActiveAppointments/fulfilled',
        (state, action) => {
          state.loading = false
          state.activeAppointments = action.payload.data || action.payload
          state.error = null
        }
      )
      .addCase(
        'appointment/getActiveAppointments/rejected',
        (state, action) => {
          state.loading = false
          state.error = action.payload || 'Failed to fetch active appointments'
        }
      )

      // getPastAppointments
      .addCase('appointment/getPastAppointments/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('appointment/getPastAppointments/fulfilled', (state, action) => {
        state.loading = false
        state.pastAppointments = action.payload.data || action.payload
        state.error = null
      })
      .addCase('appointment/getPastAppointments/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch past appointments'
      })

      // getAppointmentById
      .addCase('appointment/getAppointmentById/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('appointment/getAppointmentById/fulfilled', (state, action) => {
        state.loading = false
        state.appointmentDetails = action.payload.data || action.payload
        state.error = null
      })
      .addCase('appointment/getAppointmentById/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch appointment details'
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
          const updateAppointmentInList = list => {
            const index = list.findIndex(
              appointment => appointment.id === action.payload.id
            )
            if (index !== -1) {
              list[index] = { ...list[index], ...action.payload }
            }
          }

          updateAppointmentInList(state.activeAppointments)
          updateAppointmentInList(state.pastAppointments)

          // Update appointment details if it's the same appointment
          if (
            state.appointmentDetails &&
            state.appointmentDetails.id === action.payload.id
          ) {
            state.appointmentDetails = {
              ...state.appointmentDetails,
              ...action.payload,
            }
          }
        }
        state.error = null
      })
      .addCase('appointment/updateAppointment/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to update appointment'
      })

      // updateAppointmentStatus
      .addCase('appointment/updateAppointmentStatus/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase(
        'appointment/updateAppointmentStatus/fulfilled',
        (state, action) => {
          state.loading = false
          // Update the appointment status in all lists
          if (action.payload && action.payload.id) {
            const updateAppointmentInList = list => {
              const index = list.findIndex(
                appointment => appointment.id === action.payload.id
              )
              if (index !== -1) {
                list[index] = { ...list[index], status: action.payload.status }
              }
            }

            updateAppointmentInList(state.activeAppointments)
            updateAppointmentInList(state.pastAppointments)

            // Update appointment details if it's the same appointment
            if (
              state.appointmentDetails &&
              state.appointmentDetails.id === action.payload.id
            ) {
              state.appointmentDetails = {
                ...state.appointmentDetails,
                status: action.payload.status,
              }
            }
          }
          state.error = null
        }
      )
      .addCase(
        'appointment/updateAppointmentStatus/rejected',
        (state, action) => {
          state.loading = false
          state.error = action.payload || 'Failed to update appointment status'
        }
      )
  },
})

export const {
  clearError,
  updatePagination,
  setAppointmentDetails,
  clearAppointmentDetails,
  setSelectedAppointment,
  clearSelectedAppointment,
  updateStatistics,
} = appointmentSlice.actions

// Selectors
export const selectActiveAppointments = state =>
  state.appointment.activeAppointments
export const selectPastAppointments = state =>
  state.appointment.pastAppointments
export const selectAppointmentDetails = state =>
  state.appointment.appointmentDetails
export const selectSelectedAppointment = state =>
  state.appointment.selectedAppointment
export const selectAppointmentLoading = state => state.appointment.loading
export const selectAppointmentError = state => state.appointment.error
export const selectAppointmentStatistics = state => state.appointment.statistics

// Selector to get active appointment by id
export const selectActiveAppointmentById = (state, appointmentId) => {
  return state.appointment.activeAppointments.find(
    appointment => String(appointment.id) === String(appointmentId)
  )
}

// Selector to get past appointment by id
export const selectPastAppointmentById = (state, appointmentId) => {
  return state.appointment.pastAppointments.find(
    appointment => String(appointment.id) === String(appointmentId)
  )
}

export default appointmentSlice.reducer
