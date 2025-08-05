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
      return await programAPI.createProgram(programData)
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Update program
export const updateProgram = createAsyncThunk(
  'program/updateProgram',
  async ({ programId, programData }, { rejectWithValue }) => {
    try {
      return await programAPI.updateProgram(programId, programData)
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Delete program
export const deleteProgram = createAsyncThunk(
  'program/deleteProgram',
  async (programId, { rejectWithValue }) => {
    try {
      await programAPI.deleteProgram(programId)
      return programId
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)
