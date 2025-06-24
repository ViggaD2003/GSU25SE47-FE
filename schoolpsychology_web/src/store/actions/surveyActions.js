import { createAsyncThunk } from '@reduxjs/toolkit'
import { surveyAPI } from '../../services/surveyApi'

// Async thunk for getting all surveys
export const getAllSurveys = createAsyncThunk(
  'survey/getAllSurveys',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await surveyAPI.getAllSurveys(params)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch surveys'
      )
    }
  }
)

// Async thunk for creating a survey
export const createSurvey = createAsyncThunk(
  'survey/createSurvey',
  async (surveyData, { rejectWithValue }) => {
    try {
      const response = await surveyAPI.createSurvey(surveyData)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to create survey'
      )
    }
  }
)

// Async thunk for getting categories
export const getCategories = createAsyncThunk(
  'survey/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await surveyAPI.getCategories()
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch categories'
      )
    }
  }
)
