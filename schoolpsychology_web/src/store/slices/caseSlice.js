import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  cases: [],
  currentCase: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
}

const caseSlice = createSlice({
  name: 'case',
  initialState,
  reducers: {
    // Clear error when starting new request
    clearError: state => {
      state.error = null
    },
    // Clear current case
    clearCurrentCase: state => {
      state.currentCase = null
    },
    // Update pagination
    updatePagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
  },
  extraReducers: builder => {
    builder
      // getCases
      .addCase('case/getCases/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('case/getCases/fulfilled', (state, action) => {
        state.loading = false
        // Handle both array and object with data property
        const cases = Array.isArray(action.payload)
          ? action.payload
          : action.payload.data || action.payload
        state.cases = cases
        if (action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination,
          }
        }
        state.error = null
      })
      .addCase('case/getCases/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch cases'
      })
      // getCaseById
      .addCase('case/getCaseById/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('case/getCaseById/fulfilled', (state, action) => {
        state.loading = false
        state.currentCase = action.payload
        state.error = null
      })
      .addCase('case/getCaseById/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch case details'
      })
      // createCase
      .addCase('case/createCase/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('case/createCase/fulfilled', (state, action) => {
        state.loading = false
        // Add the new case to the list
        if (action.payload) {
          state.cases.unshift(action.payload)
        }
        state.error = null
      })
      .addCase('case/createCase/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to create case'
      })
      // assignCase
      .addCase('case/assignCase/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('case/assignCase/fulfilled', (state, _action) => {
        state.loading = false
        state.error = null
      })
      .addCase('case/assignCase/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to assign case'
      })
      // updateCase
      .addCase('case/updateCase/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('case/updateCase/fulfilled', (state, action) => {
        state.loading = false
        // Update the case in the list
        if (action.payload) {
          const index = state.cases.findIndex(c => c.id === action.payload.id)
          if (index !== -1) {
            state.cases[index] = action.payload
          }
        }
        state.error = null
      })
      .addCase('case/updateCase/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to update case'
      })
  },
})

export const { clearError, clearCurrentCase, updatePagination } =
  caseSlice.actions

export default caseSlice.reducer
