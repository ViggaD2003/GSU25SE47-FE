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
      if (!classData) {
        return rejectWithValue('Class data is required')
      }
      const data = [
        {
          grade: classData?.grade || 'GRADE_10',
          teacherId: classData?.teacherId || null,
          codeClass: classData?.codeClass || null,
          schoolYear: classData?.schoolYear || null,
          startTime: classData?.startTime || null,
          endTime: classData?.endTime || null,
          isActive: classData?.isActive || true,
        },
      ]
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

// Async thunk for getting a class by id
export const getClassById = createAsyncThunk(
  'class/getClassById',
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue('Class id is required')
      }
      const response = await classAPI.getClassById(id)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch class by id'
      )
    }
  }
)

// Async thunk for enrolling a class
export const enrollClass = createAsyncThunk(
  'class/enrollClass',
  async (data, { rejectWithValue }) => {
    try {
      if (!data) {
        return rejectWithValue('Enrollment data is required')
      }
      const requestBody = {
        classId: data.classId,
        studentIds: data.studentIds || [],
      }
      const response = await classAPI.enrollClass(requestBody)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to enroll class'
      )
    }
  }
)
