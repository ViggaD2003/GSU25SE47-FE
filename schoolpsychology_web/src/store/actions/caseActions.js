import { createAsyncThunk } from '@reduxjs/toolkit'
import { caseAPI } from '../../services/caseApi'

// Async thunk for getting all cases
export const getCases = createAsyncThunk(
  'case/getCases',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await caseAPI.getCases(params)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch cases'
      )
    }
  }
)

// Async thunk for getting case by ID
export const getCaseById = createAsyncThunk(
  'case/getCaseById',
  async (caseId, { rejectWithValue }) => {
    try {
      const response = await caseAPI.getCaseById(caseId)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch case details'
      )
    }
  }
)

// Async thunk for getting cases by category ID
export const getCasesByCategoryId = createAsyncThunk(
  'case/getCasesByCategoryId',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await caseAPI.getCasesByCategoryId(categoryId)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch cases by category ID'
      )
    }
  }
)

// Async thunk for creating a case
export const createCase = createAsyncThunk(
  'case/createCase',
  async (caseData, { rejectWithValue }) => {
    try {
      const response = await caseAPI.createCase(caseData)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to create case'
      )
    }
  }
)

// Async thunk for assigning a case
export const assignCase = createAsyncThunk(
  'case/assignCase',
  async (data, { rejectWithValue }) => {
    try {
      const response = await caseAPI.assignCase(data)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to assign case'
      )
    }
  }
)

// Async thunk for updating a case
export const updateCase = createAsyncThunk(
  'case/updateCase',
  async ({ caseId, caseData }, { rejectWithValue }) => {
    try {
      const response = await caseAPI.updateCase(caseId, caseData)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to update case'
      )
    }
  }
)

// Async thunk for adding a case to a survey
export const addCaseToSurvey = createAsyncThunk(
  'case/addCaseToSurvey',
  async (data, { rejectWithValue }) => {
    try {
      const response = await caseAPI.addCaseToSurvey(data)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to add case to survey'
      )
    }
  }
)
