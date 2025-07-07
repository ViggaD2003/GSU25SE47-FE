import { createAsyncThunk } from '@reduxjs/toolkit'
import { classAPI } from '../../services/classApi'

// Async thunk for getting all surveys
export const getAllClasses = createAsyncThunk(
  'class/getAllClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await classAPI.getClasses()
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch classes'
      )
    }
  }
)

// Async thunk for getting a class by code
export const getClassesByCode = createAsyncThunk(
  'class/getClassesByCode',
  async (code, { rejectWithValue }) => {
    try {
      if (!code) {
        return rejectWithValue('Class code is required')
      }
      const response = await classAPI.getClassesByCode(code)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch class by code'
      )
    }
  }
)

// Async thunk for creating a survey
export const createClass = createAsyncThunk(
  'class/createClass',
  async (classData, { rejectWithValue }) => {
    try {
      const data = {
        teacherCode: classData?.teacherCode || null,
        codeClass: classData?.codeClass || null,
        classYear: new Date(classData?.classYear, 'YYYY-MM-DD'),
        studentCodes: classData?.studentCodes || [],
      }
      const response = await classAPI.createClass(data)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to create class'
      )
    }
  }
)

// Async thunk for updating a class
export const updateClass = createAsyncThunk(
  'class/updateClass',
  async (code, classData, { rejectWithValue }) => {
    try {
      if (!code) {
        return rejectWithValue('Class code is required')
      }
      const data = {
        teacherCode: classData?.teacherCode || null,
        codeClass: classData?.codeClass || null,
        classYear: new Date(classData?.classYear, 'YYYY-MM-DD'),
        studentCodes: classData?.studentCodes || [],
      }
      const response = await classAPI.updateClass(code, data)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to update class'
      )
    }
  }
)

// Async thunk for deleting a class
export const deleteClass = createAsyncThunk(
  'class/deleteClass',
  async (code, { rejectWithValue }) => {
    try {
      if (!code) {
        return rejectWithValue('Class code is required')
      }
      const response = await classAPI.deleteClass(code)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete class'
      )
    }
  }
)
