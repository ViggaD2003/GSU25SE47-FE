import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  surveys: [],
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
}

const surveySlice = createSlice({
  name: 'survey',
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
  },
  extraReducers: builder => {
    builder
      // getAllSurveys
      .addCase('survey/getAllSurveys/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('survey/getAllSurveys/fulfilled', (state, action) => {
        state.loading = false
        state.surveys = action.payload.data || action.payload
        if (action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination,
          }
        }
        state.error = null
      })
      .addCase('survey/getAllSurveys/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch surveys'
      })
      // createSurvey
      .addCase('survey/createSurvey/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('survey/createSurvey/fulfilled', (state, action) => {
        state.loading = false
        // Optionally add the new survey to the list
        if (action.payload) {
          state.surveys.unshift(action.payload)
        }
        state.error = null
      })
      .addCase('survey/createSurvey/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to create survey'
      })
  },
})

export const { clearError, updatePagination } = surveySlice.actions

// Selectors
export const selectSurveys = state => state.survey.surveys
export const selectSurveyLoading = state => state.survey.loading
export const selectSurveyError = state => state.survey.error
export const selectSurveyPagination = state => state.survey.pagination

export default surveySlice.reducer
