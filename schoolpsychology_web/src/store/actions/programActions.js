import { createAsyncThunk } from '@reduxjs/toolkit'
import { programAPI } from '@/services/programApi'

// Get all programs
export const getAllPrograms = createAsyncThunk(
  'program/getAllPrograms',
  async (_, { rejectWithValue }) => {
    try {
      return await programAPI.getPrograms()
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Get program by ID
export const getProgramById = createAsyncThunk(
  'program/getProgramById',
  async (programId, { rejectWithValue }) => {
    try {
      const response = await programAPI.getProgramById(programId)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Create program
export const createProgram = createAsyncThunk(
  'program/createProgram',
  async (programData, { rejectWithValue }) => {
    try {
      const response = await programAPI.createProgram(programData)
      return response
    } catch (error) {
      console.log('error', error?.response?.data)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Update program
export const updateProgram = createAsyncThunk(
  'program/updateProgram',
  async ({ programId, programData }, { rejectWithValue }) => {
    try {
      console.log('programData', programData)
      console.log('programId', programId)

      // Check if this is a complex update with thumbnail
      if (
        programData.hasNewThumbnail &&
        programData.existingThumbnail &&
        programData.thumbnail
      ) {
        console.log('updateProgramWithThumbnail')

        return await programAPI.updateProgramWithThumbnail(
          programId,
          programData
        )
      } else {
        console.log('updateProgram')
        // Simple update without thumbnail changes
        return await programAPI.updateProgram(programId, programData.request)
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Update program status
export const updateProgramStatus = createAsyncThunk(
  'program/updateProgramStatus',
  async ({ programId, status }, { rejectWithValue }) => {
    try {
      if (!programId) throw new Error('Program ID is required')
      return await programAPI.updateStatus(programId, status)
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)
