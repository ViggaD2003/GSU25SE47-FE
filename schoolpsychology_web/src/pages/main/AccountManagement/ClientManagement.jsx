import React, {
  useState,
  useCallback,
  Suspense,
  lazy,
  useEffect,
  useMemo,
} from 'react'
import {
  Card,
  Button,
  Input,
  Select,
  message,
  Row,
  Col,
  Typography,
} from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useTheme } from '../../../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import UserTable from './UserTable'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAllClasses,
  getClassById,
  getClassesByCode,
} from '../../../store/actions/classActions'
import { clearError } from '../../../store/slices/classSlice'
import { useAuth } from '@/contexts/AuthContext'
import CaseModal from '../CaseManagement/CaseModal'
import { categoriesAPI } from '@/services/categoryApi'
import { createCase } from '@/store/actions'
const { Title, Text } = Typography
const { Option } = Select
const { Search } = Input
const UserModal = lazy(() => import('./UserModal'))

const ClientManagement = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const [searchText, setSearchText] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [isCreateCase, setIsCreateCase] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const [deletedUser, setDeletedUser] = useState(null)
  const [selectedClassCode, setSelectedClassCode] = useState(null)
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
  )
  const [categories, setCategories] = useState([])
  const dispatch = useDispatch()

  // Redux selectors - using individual selectors to avoid new object references
  const classById = useSelector(state => state.class.classById)
  const selectedClass = useSelector(state => state.class.selectedClass)
  const classes = useSelector(state => state.class.classes)
  const loading = useSelector(state => state.class.loading)
  const error = useSelector(state => state.class.error)
  const pagination = useSelector(state => state.class.pagination)

  const fetchCategories = async () => {
    const data = await categoriesAPI.getCategories()
    setCategories(data)
  }

  // Load classes on component mount
  useEffect(() => {
    if (user?.role === 'teacher' && user?.classId) {
      dispatch(getClassById(user.classId))
      fetchCategories()
    } else if (user?.role === 'manager') {
      // Load all classes for manager to populate the dropdown
      dispatch(getAllClasses())
    }
  }, [dispatch, user])

  // Handle error messages
  useEffect(() => {
    if (error) {
      messageApi.error(error)
      dispatch(clearError())
    }
  }, [error, messageApi, dispatch])

  // Handle class code selection for manager
  const handleClassCodeChange = useCallback(
    classCode => {
      setSelectedClassCode(classCode)
      if (classCode) {
        dispatch(getClassesByCode(classCode))
      }
    },
    [dispatch]
  )

  // Handle year selection for manager
  const handleYearChange = useCallback(
    year => {
      setSelectedYear(year)
      // Reset class selection when year changes
      setSelectedClassCode(null)
      // Clear selected class data when year changes
      if (year !== selectedYear) {
        // This will trigger a re-render and clear the students list
      }
    },
    [selectedYear, classes]
  )

  // Filter classes by selected year
  const filteredClasses = useMemo(() => {
    if (!selectedYear) {
      return classes
    }
    // console.log('Debug - selectedYear:', selectedYear)
    // console.log('Debug - classes:', classes)
    // console.log(
    //   'Debug - classes schoolYear values:',
    //   classes.map(c => c.schoolYear)
    // )

    const filtered = classes.filter(classItem => {
      // console.log(
      //   'Comparing:',
      //   classItem.schoolYear,
      //   '===',
      //   selectedYear,
      //   'Result:',
      //   classItem.schoolYear === selectedYear
      // )
      return classItem.schoolYear === selectedYear
    })

    // If no exact match found, try to find classes with similar year format
    if (filtered.length === 0 && classes.length > 0) {
      // console.log('No exact match found, trying to find similar year format')
      const currentYear = new Date().getFullYear()
      const fallbackFiltered = classes.filter(classItem => {
        // Try different year formats
        const yearFormats = [
          `${currentYear}-${currentYear + 1}`,
          `${currentYear} - ${currentYear + 1}`,
          `${currentYear}/${currentYear + 1}`,
          currentYear.toString(),
          (currentYear + 1).toString(),
        ]
        return yearFormats.includes(classItem.schoolYear)
      })
      // console.log('Fallback filtered classes:', fallbackFiltered)
      return fallbackFiltered
    }

    // console.log('Debug - filteredClasses:', filtered)
    return filtered
  }, [classes, selectedYear])

  // Auto-select first class when year is selected
  useEffect(() => {
    // console.log('Auto-select effect triggered')
    // console.log('selectedYear:', selectedYear)
    // console.log('classes.length:', classes.length)
    // console.log('filteredClasses.length:', filteredClasses.length)
    // console.log('selectedClassCode:', selectedClassCode)

    // Only auto-select when classes are loaded and we have a selected year
    if (
      selectedYear &&
      classes.length > 0 &&
      filteredClasses.length > 0 &&
      !selectedClassCode
    ) {
      const firstClassCode = filteredClasses[0].codeClass
      console.log('Auto-selecting class:', firstClassCode)
      setSelectedClassCode(firstClassCode)
      dispatch(getClassesByCode(firstClassCode))
    } else if (
      selectedYear &&
      classes.length > 0 &&
      filteredClasses.length === 0
    ) {
      console.log('No classes found for selected year, clearing selection')
      setSelectedClassCode(null)
    }
  }, [selectedYear, filteredClasses, dispatch, classes, selectedClassCode])

  // Get unique years from classes for the year filter dropdown
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years = [
      currentYear + '-' + (currentYear + 1),
      ...classes
        .map(classItem => classItem.schoolYear)
        .filter((year, index, self) => self.indexOf(year) === index)
        .sort((a, b) => b - a),
    ]
    const uniqueYears = [...new Set(years)]
    return uniqueYears
  }, [classes])

  // Get students from the appropriate source
  const students = useMemo(() => {
    if (user?.role === 'teacher') {
      return classById?.students || []
    } else if (user?.role === 'manager') {
      return selectedClass?.students || []
    }
    return []
  }, [user?.role, classById?.students, selectedClass?.students])

  // Filter students based on search text - memoized to prevent unnecessary recalculations
  const filteredStudents = useMemo(() => {
    return students.filter(
      student =>
        student.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        student.phone?.toLowerCase().includes(searchText.toLowerCase()) ||
        student.studentCode?.toLowerCase().includes(searchText.toLowerCase())
    )
  }, [students, searchText])

  const loadData = useCallback(() => {
    if (user?.role === 'teacher' && user?.classId) {
      dispatch(getClassById(user.classId))
    } else if (user?.role === 'manager' && selectedClassCode) {
      dispatch(getClassesByCode(selectedClassCode))
    } else if (user?.role === 'manager' && !selectedClassCode) {
      // Load all classes for manager to populate the dropdown
      dispatch(getAllClasses())
    }
  }, [dispatch, user?.classId, user?.role, selectedClassCode])

  const handleTableChange = useCallback(
    _pag => {
      // For now, just reload data since we're not implementing server-side pagination
      loadData()
    },
    [loadData]
  )

  const handleSearch = value => {
    setSearchText(value)
  }

  const handleView = record => {
    setSelectedUser(record)
    setIsEdit(false)
    setIsModalVisible(true)
  }

  const handleAdd = () => {
    setSelectedUser(null)
    setIsEdit(false)
    setIsModalVisible(true)
  }

  const handleModalOk = async requestData => {
    try {
      if (isCreateCase) {
        await dispatch(createCase(requestData)).unwrap()
        messageApi.success(t('clientManagement.messages.createCaseSuccess'))
        // sendMessage({
        //   title: 'New Case',
        //   content: 'New case has been created by ' + user.fullName,
        //   username: 'danhkvtse172932@fpt.edu.vn',
        // })
        setIsCreateCase(false)
      } else {
        messageApi.success(
          isEdit
            ? t('clientManagement.messages.editUserSuccess')
            : t('clientManagement.messages.addUserSuccess')
        )
      }
      setIsModalVisible(false)
      loadData(pagination.current, pagination.pageSize)
    } catch (error) {
      console.log('ClientManagement handleModalOk error', error)
      messageApi.error(error.message)
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    setIsCreateCase(false)
  }

  const handleCreateCase = record => {
    setSelectedUser(record)
    setIsCreateCase(true)
  }

  React.useEffect(() => {
    if (deletedUser) {
      messageApi.success(t('clientManagement.messages.inactiveSuccess'))
      setDeletedUser(null)
    }
  }, [deletedUser])

  // Get current class info for display
  const currentClassInfo = useMemo(() => {
    if (user?.role === 'teacher') {
      return classById
    } else if (user?.role === 'manager') {
      return selectedClass
    }
    return null
  }, [user?.role, classById, selectedClass])

  // console.log(currentClassInfo)

  return (
    <>
      {contextHolder}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <Title
              level={2}
              className={isDarkMode ? 'text-white' : 'text-gray-900'}
            >
              {user?.role === 'teacher'
                ? t('clientManagement.manageTitleTeacher') +
                  ' - ' +
                  (currentClassInfo?.codeClass || t('clientManagement.noClass'))
                : t('clientManagement.manageTitle')}
            </Title>
            <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {t('clientManagement.description')}
            </Text>
          </div>
          <div className="flex items-end space-x-3">
            {/* <Button icon={<ExportOutlined />}>Export</Button> */}
            <Button
              icon={<ReloadOutlined />}
              onClick={() => loadData(pagination.current, pagination.pageSize)}
            >
              {t('clientManagement.refresh')}
            </Button>
            {user?.role === 'manager' && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                {t('clientManagement.addUser')}
              </Button>
            )}
          </div>
        </div>

        {/* Search and Class Selection */}
        <Card
          className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} lg={8}>
              <Search
                placeholder={t('clientManagement.search')}
                allowClear
                onSearch={handleSearch}
                onChange={e => handleSearch(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
            {user?.role === 'manager' && (
              <>
                <Col xs={24} sm={12} lg={6}>
                  <Select
                    placeholder={t('clientManagement.selectYear')}
                    style={{ width: '100%' }}
                    value={selectedYear}
                    onChange={handleYearChange}
                    allowClear
                  >
                    {availableYears.map(year => (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Select
                    options={filteredClasses.map(classItem => ({
                      label: classItem.codeClass,
                      value: classItem.codeClass,
                      schoolYear: classItem.schoolYear,
                    }))}
                    placeholder={
                      selectedYear
                        ? t('clientManagement.selectClass')
                        : t('clientManagement.selectClass')
                    }
                    style={{ width: '100%' }}
                    value={selectedClassCode}
                    onChange={handleClassCodeChange}
                    loading={loading}
                    disabled={false}
                    optionRender={option => (
                      <div className={'flex flex-col gap-2'}>
                        <Text strong>{option.value}</Text>
                        <Text type="secondary">
                          {t('clientManagement.schoolYear') +
                            ': ' +
                            ' ' +
                            option.data.schoolYear}
                        </Text>
                      </div>
                    )}
                  />
                </Col>
              </>
            )}
          </Row>
        </Card>

        {/* Users Table */}
        <Card
          className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}
        >
          <UserTable
            user={user}
            data={filteredStudents}
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            onView={handleView}
            onCreateCase={handleCreateCase}
            // onEdit={handleEdit}
            // onDelete={handleDelete}
          />
        </Card>

        {/* Add/Edit User Modal */}
        <Suspense fallback={null}>
          {isModalVisible && (
            <UserModal
              visible={isModalVisible}
              onOk={handleModalOk}
              onCancel={handleModalCancel}
              editingUser={selectedUser}
              isEdit={isEdit}
              onCreateCase={handleCreateCase}
              confirmLoading={false}
            />
          )}
        </Suspense>

        {isCreateCase && (
          <CaseModal
            user={user}
            categories={categories}
            visible={isCreateCase}
            onCancel={handleModalCancel}
            onSubmit={handleModalOk}
            editingCase={selectedUser}
            confirmLoading={false}
          />
        )}
      </div>
    </>
  )
}

export default ClientManagement
