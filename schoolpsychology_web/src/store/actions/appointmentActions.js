import { createAsyncThunk } from '@reduxjs/toolkit'
import { appointmentAPI } from '../../services/appointmentApi'

// Async thunk for getting all appointments
export const getAppointments = createAsyncThunk(
  'appointment/getAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await appointmentAPI.getAppointments()
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch appointments'
      )
    }
  }
)

// Async thunk for updating appointment
export const updateAppointment = createAsyncThunk(
  'appointment/updateAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const data = {
        appointmentId: appointmentData.id,
        location: appointmentData.location,
      }
      await appointmentAPI.updateAppointment(data)
      return appointmentData
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to update appointment'
      )
    }
  }
)

// Async thunk for getting appointment records
export const getAppointmentRecords = createAsyncThunk(
  'appointment/getAppointmentRecords',
  async (_, { rejectWithValue }) => {
    try {
      const response = await appointmentAPI.getAppointmentRecords()
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch appointment records'
      )
    }
  }
)

// Async thunk for creating appointment record
export const createAppointmentRecord = createAsyncThunk(
  'appointment/createAppointmentRecord',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response =
        await appointmentAPI.createAppointmentRecord(appointmentData)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to create appointment record'
      )
    }
  }
)
