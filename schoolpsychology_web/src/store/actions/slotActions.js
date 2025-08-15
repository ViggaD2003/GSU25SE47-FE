import { createAsyncThunk } from '@reduxjs/toolkit'
import { slotAPI } from '../../services/slotApi'

// Async thunks
export const fetchSlots = createAsyncThunk(
  'slot/fetchSlots',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await slotAPI.getSlots(userId)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createSlots = createAsyncThunk(
  'slot/createSlots',
  async (slots, { rejectWithValue }) => {
    try {
      const response = await slotAPI.createSlots(slots)
      return response.data
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const publishSlot = createAsyncThunk(
  'slot/publishSlot',
  async (slotId, { rejectWithValue }) => {
    try {
      const response = await slotAPI.publishSlot(slotId)
      console.log('response', response)
      return response.data
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const fetchUsersByRole = createAsyncThunk(
  'slot/fetchUsersByRole',
  async (role, { rejectWithValue }) => {
    try {
      const response = await slotAPI.getUsersByRole(role)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)
