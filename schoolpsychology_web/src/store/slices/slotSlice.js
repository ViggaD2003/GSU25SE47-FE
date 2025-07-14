import { createSlice } from '@reduxjs/toolkit'
import {
  fetchSlots,
  createSlots,
  fetchUsersByRole,
  publishSlot,
} from '../actions/slotActions'

const initialState = {
  slots: [],
  users: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  publishLoading: false,
  publishError: null,
}

const slotSlice = createSlice({
  name: 'slot',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null
      state.createError = null
      state.publishError = null
    },
    clearSlots: state => {
      state.slots = []
    },
    clearUsers: state => {
      state.users = []
    },
  },
  extraReducers: builder => {
    builder
      // Fetch slots cases
      .addCase(fetchSlots.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSlots.fulfilled, (state, action) => {
        state.loading = false
        state.slots = action.payload
        state.error = null
      })
      .addCase(fetchSlots.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Create slots cases
      .addCase(createSlots.pending, state => {
        state.createLoading = true
        state.createError = null
      })
      .addCase(createSlots.fulfilled, (state, action) => {
        state.createLoading = false
        state.createError = null
        // Add new slots to existing ones
        if (Array.isArray(action.payload)) {
          state.slots = [...state.slots, ...action.payload]
        } else {
          state.slots = [...state.slots, action.payload]
        }
      })
      .addCase(createSlots.rejected, (state, action) => {
        state.createLoading = false
        state.createError = action.payload
      })

      // Fetch users by role cases
      .addCase(fetchUsersByRole.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsersByRole.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
        state.error = null
      })
      .addCase(fetchUsersByRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Publish slot cases
      .addCase(publishSlot.pending, state => {
        state.publishLoading = true
        state.publishError = null
      })
      .addCase(publishSlot.fulfilled, (state, action) => {
        state.publishLoading = false
        state.publishError = null
        // Update the slot status to PUBLISHED
        // The action.meta.arg contains the slotId that was passed to the action
        const slotId = action.meta.arg
        state.slots = state.slots.map(slot =>
          slot.id === slotId ? { ...slot, status: 'PUBLISHED' } : slot
        )
      })
      .addCase(publishSlot.rejected, (state, action) => {
        state.publishLoading = false
        state.publishError = action.payload
      })
  },
})

export const { clearError, clearSlots, clearUsers } = slotSlice.actions

// Selectors
export const selectSlots = state => state.slot.slots
export const selectSlotLoading = state => state.slot.loading
export const selectSlotError = state => state.slot.error
export const selectCreateLoading = state => state.slot.createLoading
export const selectCreateError = state => state.slot.createError
export const selectPublishLoading = state => state.slot.publishLoading
export const selectPublishError = state => state.slot.publishError
export const selectUsers = state => state.slot.users

export default slotSlice.reducer
