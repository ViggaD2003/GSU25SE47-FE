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
        // Handle both array and object with data property
        const surveys = Array.isArray(action.payload)
          ? action.payload
          : action.payload.data || action.payload
        state.surveys = surveys
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
      // updateSurvey
      .addCase('survey/updateSurvey/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('survey/updateSurvey/fulfilled', (state, action) => {
        state.loading = false
        // Update the survey in the list
        if (action.payload) {
          const index = state.surveys.findIndex(
            s => s.surveyId === action.payload.surveyId
          )
          if (index !== -1) {
            state.surveys[index] = action.payload
          }
        }
        state.error = null
      })
      .addCase('survey/updateSurvey/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to update survey'
      })
      // deleteSurvey
      .addCase('survey/deleteSurvey/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('survey/deleteSurvey/fulfilled', (state, action) => {
        state.loading = false
        // Remove the survey from the list
        if (action.payload) {
          state.surveys = state.surveys.filter(
            s => s.surveyId !== action.payload
          )
        }
        state.error = null
      })
      .addCase('survey/deleteSurvey/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to delete survey'
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
