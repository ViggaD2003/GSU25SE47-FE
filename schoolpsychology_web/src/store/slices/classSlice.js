import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  classes: [],
  selectedClass: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
}

const classSlice = createSlice({
  name: 'class',
  initialState,
  reducers: {
    // Clear error when starting new request
    clearError: state => {
      state.error = null
    },
    // Update pagination
    updatePagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    // Clear classes
    clearClasses: state => {
      state.classes = []
    },
    // Set selected class
    setSelectedClass: (state, action) => {
      state.selectedClass = action.payload
    },
    // Clear selected class
    clearSelectedClass: state => {
      state.selectedClass = null
    },
  },
  extraReducers: builder => {
    builder
      // getAllClasses
      .addCase('class/getAllClasses/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('class/getAllClasses/fulfilled', (state, action) => {
        state.loading = false
        state.classes = action.payload.data || action.payload
        if (action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination,
          }
        }
        state.error = null
      })
      .addCase('class/getAllClasses/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch classes'
      })

      // getClassesByCode
      .addCase('class/getClassesByCode/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('class/getClassesByCode/fulfilled', (state, action) => {
        state.loading = false
        state.selectedClass = action.payload
        state.error = null
      })
      .addCase('class/getClassesByCode/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch class by code'
      })

      // createClass
      .addCase('class/createClass/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('class/createClass/fulfilled', (state, action) => {
        state.loading = false
        // Add the new class to the list
        if (action.payload) {
          state.classes.unshift(action.payload)
        }
        state.error = null
      })
      .addCase('class/createClass/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to create class'
      })

      // updateClass
      .addCase('class/updateClass/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('class/updateClass/fulfilled', (state, action) => {
        state.loading = false
        // Update the class in the list
        if (action.payload && action.payload.codeClass) {
          const index = state.classes.findIndex(
            classItem => classItem.codeClass === action.payload.codeClass
          )
          if (index !== -1) {
            state.classes[index] = action.payload
          }
        }
        // Update selected class if it matches
        if (
          state.selectedClass &&
          state.selectedClass.codeClass === action.payload.codeClass
        ) {
          state.selectedClass = action.payload
        }
        state.error = null
      })
      .addCase('class/updateClass/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to update class'
      })

      // deleteClass
      .addCase('class/deleteClass/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('class/deleteClass/fulfilled', (state, action) => {
        state.loading = false
        // Remove the class from the list
        // Note: We need to get the code from the meta.arg since the action might not contain the full class object
        const codeToDelete = action.meta.arg
        state.classes = state.classes.filter(
          classItem => classItem.codeClass !== codeToDelete
        )
        // Clear selected class if it matches the deleted one
        if (
          state.selectedClass &&
          state.selectedClass.codeClass === codeToDelete
        ) {
          state.selectedClass = null
        }
        state.error = null
      })
      .addCase('class/deleteClass/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to delete class'
      })
  },
})

export const {
  clearError,
  updatePagination,
  clearClasses,
  setSelectedClass,
  clearSelectedClass,
} = classSlice.actions

// Selectors
export const selectClasses = state => state.class.classes
export const selectClassLoading = state => state.class.loading
export const selectClassError = state => state.class.error
export const selectClassPagination = state => state.class.pagination
export const selectSelectedClass = state => state.class.selectedClass

// Selector to get class by code
export const selectClassByCode = (state, classCode) => {
  return state.class.classes.find(
    classItem => classItem.codeClass === classCode
  )
}

// Selector to get classes by teacher code
export const selectClassesByTeacher = (state, teacherCode) => {
  return state.class.classes.filter(
    classItem => classItem.teacherCode === teacherCode
  )
}

// Selector to get classes by year
export const selectClassesByYear = (state, year) => {
  return state.class.classes.filter(classItem => {
    const classYear = new Date(classItem.classYear).getFullYear()
    return classYear === year
  })
}

export default classSlice.reducer
