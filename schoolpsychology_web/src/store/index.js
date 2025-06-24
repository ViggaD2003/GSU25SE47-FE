import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import surveyReducer from './slices/surveySlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    survey: surveyReducer,
  },
})

export default store
