import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  programs: [],
  program: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  filters: {
    status: undefined,
    category: undefined,
    isOnline: undefined,
    dateRange: undefined,
  },
  sortConfig: {
    field: 'createdDate',
    direction: 'desc',
  },
}

const programSlice = createSlice({
  name: 'program',
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
    // Update filters
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.current = 1 // Reset to first page when filtering
    },
    // Update sort config
    updateSortConfig: (state, action) => {
      state.sortConfig = action.payload
    },
    // Clear programs
    clearPrograms: state => {
      state.programs = []
    },
    // Set selected program
    setProgram: (state, action) => {
      state.program = action.payload
    },
    // Clear selected program
    clearProgram: state => {
      state.program = null
    },
    // Reset filters
    resetFilters: state => {
      state.filters = initialState.filters
      state.pagination.current = 1
    },
  },
  extraReducers: builder => {
    builder
      // getAllPrograms
      .addCase('program/getAllPrograms/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('program/getAllPrograms/fulfilled', (state, action) => {
        state.loading = false
        state.programs = action.payload.data || action.payload
        if (action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination,
          }
        }
      })
      .addCase('program/getAllPrograms/rejected', (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // getProgramById
      .addCase('program/getProgramById/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('program/getProgramById/fulfilled', (state, action) => {
        state.loading = false
        state.program = action.payload.data || action.payload
      })
      .addCase('program/getProgramById/rejected', (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // createProgram
      .addCase('program/createProgram/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('program/createProgram/fulfilled', (state, action) => {
        state.loading = false
        state.programs.unshift(action.payload)
      })
      .addCase('program/createProgram/rejected', (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // updateProgram
      .addCase('program/updateProgram/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('program/updateProgram/fulfilled', (state, action) => {
        state.loading = false
        const index = state.programs.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.programs[index] = action.payload
        }
        if (state.program?.id === action.payload.id) {
          state.program = action.payload
        }
      })
      .addCase('program/updateProgram/rejected', (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // updateProgramStatus
      .addCase('program/updateProgramStatus/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('program/updateProgramStatus/fulfilled', (state, action) => {
        state.loading = false
        const index = state.programs.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.programs[index] = action.payload
        }
        if (state.program?.id === action.payload.id) {
          state.program = action.payload
        }
      })
      .addCase('program/updateProgramStatus/rejected', (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export const {
  clearError,
  updatePagination,
  updateFilters,
  updateSortConfig,
  clearPrograms,
  resetFilters,
  setProgram,
  clearProgram,
} = programSlice.actions

export default programSlice.reducer
