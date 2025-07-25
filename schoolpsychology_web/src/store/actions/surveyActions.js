import { createAsyncThunk } from '@reduxjs/toolkit'
import { surveyAPI } from '../../services/surveyApi'

// Async thunk for getting all surveys
export const getAllSurveys = createAsyncThunk(
  'survey/getAllSurveys',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await surveyAPI.getAllSurveys(params)
      const data = response.map(survey => ({
        ...survey,
        targetGrade: survey.targetGrade.map(grade => grade.targetLevel),
      }))
      return data
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

// Async thunk for updating a survey
export const updateSurvey = createAsyncThunk(
  'survey/updateSurvey',
  async ({ surveyId, surveyData }, { rejectWithValue }) => {
    try {
      // Transform form data to match new API structure
      const transformedData = {
        title: surveyData.name || surveyData.title,
        description: surveyData.description,
        isRequired: surveyData.isRequired,
        isRecurring: surveyData.isRecurring,
        recurringCycle: surveyData.isRecurring
          ? surveyData.recurringCycle
          : 'NONE',
        round: surveyData.round,
        surveyType: surveyData.surveyType,
        status: surveyData.status,
        targetScope: surveyData.targetScope,
        targetGrade: surveyData.targetGrade,
        startDate: surveyData.startDate,
        endDate: surveyData.endDate,
        categoryId: surveyData.categoryId,
        questions:
          surveyData.questions?.map(question => ({
            text: question.text,
            description: question.description || '',
            questionType: question.questionType,
            moduleType: 'SURVEY',
            answers:
              question.answers?.map(answer => ({
                score: answer.score,
                text: answer.text,
              })) || [],
            required: question.required || false,
          })) || [],
      }

      const response = await surveyAPI.updateSurvey(surveyId, transformedData)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to update survey'
      )
    }
  }
)

// Async thunk for deleting a survey
export const deleteSurvey = createAsyncThunk(
  'survey/deleteSurvey',
  async (surveyId, { rejectWithValue }) => {
    try {
      await surveyAPI.deleteSurvey(surveyId)
      return surveyId
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete survey'
      )
    }
  }
)
