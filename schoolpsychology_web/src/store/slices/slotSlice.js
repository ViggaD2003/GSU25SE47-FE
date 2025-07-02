import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { slotAPI } from '../../services/slotApi'

// Async thunks
export const fetchSlots = createAsyncThunk(
  'slot/fetchSlots',
  async (hostById, { rejectWithValue }) => {
    try {
      const response = await slotAPI.getSlots(hostById)
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

const initialState = {
  slots: [],
  users: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
}

const slotSlice = createSlice({
  name: 'slot',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null
      state.createError = null
    },
    clearSlots: state => {
      state.slots = []
    },
  },
  extraReducers: builder => {
    builder
      // Fetch slots
      .addCase(fetchSlots.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSlots.fulfilled, (state, action) => {
        state.loading = false
        state.slots = action.payload
      })
      .addCase(fetchSlots.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create slots
      .addCase(createSlots.pending, state => {
        state.createLoading = true
        state.createError = null
      })
      .addCase(createSlots.fulfilled, (state, action) => {
        state.createLoading = false
        // Refresh slots after creating new ones
        state.slots = [...state.slots, ...action.payload]
      })
      .addCase(createSlots.rejected, (state, action) => {
        state.createLoading = false
        state.createError = action.payload
      })
      // Fetch users by role
      .addCase(fetchUsersByRole.fulfilled, (state, action) => {
        state.users = action.payload
      })
  },
})

export const { clearError, clearSlots } = slotSlice.actions

// Selectors
export const selectSlots = state => state.slot.slots
export const selectSlotLoading = state => state.slot.loading
export const selectSlotError = state => state.slot.error
export const selectCreateLoading = state => state.slot.createLoading
export const selectCreateError = state => state.slot.createError
export const selectUsers = state => state.slot.users

export default slotSlice.reducer
