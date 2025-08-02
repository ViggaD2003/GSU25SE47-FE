import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  classes: [],
  listCodeClasses: [],
  classById: null,
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
    // Set list code classes
    setListCodeClasses: (state, action) => {
      state.listCodeClasses = action.payload
    },
    // Clear list code classes
    clearListCodeClasses: state => {
      state.listCodeClasses = []
    },
    // Set class by id
    setClassById: (state, action) => {
      state.classById = action.payload
    },
    // Clear class by id
    clearClassById: state => {
      state.classById = null
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

      // enrollClass
      .addCase('class/enrollClass/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('class/enrollClass/fulfilled', (state, _action) => {
        state.loading = false
        state.error = null
      })
      .addCase('class/enrollClass/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to enroll class'
      })

      // getClassById
      .addCase('class/getClassById/pending', state => {
        state.loading = true
        state.error = null
      })
      .addCase('class/getClassById/fulfilled', (state, action) => {
        state.loading = false
        state.classById = action.payload
        state.error = null
      })
      .addCase('class/getClassById/rejected', (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch class by id'
      })
  },
})

export const {
  clearError,
  updatePagination,
  clearClasses,
  setSelectedClass,
  clearSelectedClass,
  setClassById,
  clearClassById,
  setListCodeClasses,
  clearListCodeClasses,
} = classSlice.actions

// Selectors
export const selectClasses = state => state.class.classes
export const selectClassLoading = state => state.class.loading
export const selectClassError = state => state.class.error
export const selectClassPagination = state => state.class.pagination
export const selectSelectedClass = state => state.class.selectedClass
export const selectClassById = state => state.class.classById
export const selectClassByIdLoading = state => state.class.loading
export const selectClassByIdError = state => state.class.error

// Selector to get list code classes
export const selectListCodeClasses = state => {
  return state.class.classes.map(classItem => classItem.codeClass)
}

// Selector to get class by code
export const selectClassByCode = (state, classCode) => {
  return state.class.classes.find(
    classItem => classItem.codeClass === classCode
  )
}

// Selector to get classes by teacher code
export const selectClassesByTeacher = (state, teacherId) => {
  return state.class.classes.filter(
    classItem => classItem.teacher.id === teacherId
  )
}

// Selector to get classes by year
export const selectClassesByYear = (state, year) => {
  return state.class.classes.filter(classItem => {
    const schoolYear = new Date(classItem.schoolYear).getFullYear()
    return schoolYear === year
  })
}

export default classSlice.reducer
