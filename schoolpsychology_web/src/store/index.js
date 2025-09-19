import { combineReducers, configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import surveyReducer from './slices/surveySlice'
import slotReducer from './slices/slotSlice'
import appointmentReducer from './slices/appointmentSlice'
import classReducer from './slices/classSlice'
import programReducer from './slices/programSlice'
import caseReducer from './slices/caseSlice'

const appReducer = combineReducers({
  auth: authReducer,
  survey: surveyReducer,
  slot: slotReducer,
  appointment: appointmentReducer,
  class: classReducer,
  program: programReducer,
  case: caseReducer,
})

const rootReducer = (state, action) => {
  console.log('action', action)

  if (action.type === 'auth/logoutUser/fulfilled') {
    // reset all state
    state = undefined
  }
  return appReducer(state, action)
}

export const store = configureStore({
  reducer: rootReducer,
})

export default store
