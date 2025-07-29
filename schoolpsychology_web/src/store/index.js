import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import surveyReducer from './slices/surveySlice'
import slotReducer from './slices/slotSlice'
import appointmentReducer from './slices/appointmentSlice'
import classReducer from './slices/classSlice'
import programReducer from './slices/programSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    survey: surveyReducer,
    slot: slotReducer,
    appointment: appointmentReducer,
    class: classReducer,
    program: programReducer,
  },
})

export default store
