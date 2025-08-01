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
