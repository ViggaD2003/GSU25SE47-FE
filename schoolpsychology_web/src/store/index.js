import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import surveyReducer from './slices/surveySlice'
import slotReducer from './slices/slotSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    survey: surveyReducer,
    slot: slotReducer,
  },
})

export default store
