import { createAsyncThunk } from '@reduxjs/toolkit'
import { appointmentAPI } from '../../services/appointmentApi'

// Async thunk for getting active appointments
export const getActiveAppointments = createAsyncThunk(
  'appointment/getActiveAppointments',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await appointmentAPI.getActiveAppointments(accountId)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch active appointments'
      )
    }
  }
)

// Async thunk for getting past appointments
export const getPastAppointments = createAsyncThunk(
  'appointment/getPastAppointments',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await appointmentAPI.getPastAppointments(accountId)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch past appointments'
      )
    }
  }
)

// Async thunk for getting appointment by id
export const getAppointmentById = createAsyncThunk(
  'appointment/getAppointmentById',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await appointmentAPI.getAppointmentById(appointmentId)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch appointment details'
      )
    }
  }
)

// Async thunk for updating appointment
export const updateAppointment = createAsyncThunk(
  'appointment/updateAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await appointmentAPI.updateAppointment(
        appointmentData.id,
        appointmentData
      )
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to update appointment'
      )
    }
  }
)

// Async thunk for updating appointment with assessment data
export const updateAppointmentWithAssessment = createAsyncThunk(
  'appointment/updateAppointmentWithAssessment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await appointmentAPI.updateAppointment(
        appointmentData.appointmentId,
        appointmentData
      )
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to update appointment with assessment'
      )
    }
  }
)

// Async thunk for updating appointment status
export const updateAppointmentStatus = createAsyncThunk(
  'appointment/updateAppointmentStatus',
  async ({ appointmentId, status = 'IN_PROGRESS' }, { rejectWithValue }) => {
    try {
      const response = await appointmentAPI.updateAppointmentStatus(
        appointmentId,
        status
      )
      return { id: appointmentId, status, ...response }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to update appointment status'
      )
    }
  }
)
