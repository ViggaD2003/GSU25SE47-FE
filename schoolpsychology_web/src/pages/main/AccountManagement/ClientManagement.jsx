import React, { useState, useCallback, useEffect, useMemo } from 'react'
import {
  Card,
  Button,
  Input,
  Select,
  message,
  Row,
  Col,
  Typography,
  Alert,
} from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { useTheme } from '../../../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import UserTable from './UserTable'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAllClasses,
  getClassesByCode,
} from '../../../store/actions/classActions'
import {
  clearSelectedClass,
  updatePagination,
} from '../../../store/slices/classSlice'
import { useAuth } from '@/contexts/AuthContext'
import CaseModal from '../CaseManagement/CaseModal'
import { categoriesAPI } from '@/services/categoryApi'
import { createCase } from '@/store/actions'
import { useNavigate } from 'react-router-dom'
const { Title, Text } = Typography
const { Option } = Select
const { Search } = Input
// const UserModal = lazy(() => import('./UserModal'))

const ClientManagement = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const [searchText, setSearchText] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isCreateCase, setIsCreateCase] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const [deletedUser, setDeletedUser] = useState(null)
  const [selectedClassCode, setSelectedClassCode] = useState(null)
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
  )
  const [categories, setCategories] = useState([])
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Redux selectors - using individual selectors to avoid new object references
  const selectedClass = useSelector(state => state.class.selectedClass)
  const classes = useSelector(state => state.class.classes)
  const loading = useSelector(state => state.class.loading)
  const pagination = useSelector(state => state.class.pagination)

  const fetchCategories = async () => {
    const data = await categoriesAPI.getCategories()
    setCategories(data)
  }

  const loadData = useCallback(
    code => {
      const classCode = code || selectedClassCode
      if (classCode) {
        dispatch(getClassesByCode(classCode))
      }
    },
    [dispatch, selectedClassCode]
  )

  // Load classes on component mount
  useEffect(() => {
    if (!user) return
    if (classes.length === 0) {
      Promise.all([
        dispatch(getAllClasses()).unwrap(),
        user.role !== 'manager' && fetchCategories(),
      ])
    }
  }, [classes.length, user])

  // Handle class code selection for manager
  const handleClassCodeChange = useCallback(
    classCode => {
      setSelectedClassCode(classCode)
      if (classCode) {
        loadData(classCode)
      }
    },
    [loadData]
  )

  // Handle year selection for manager
  const handleYearChange = useCallback(year => {
    setSelectedYear(year)

    setSelectedClassCode(null)
  }, [])

  // Filter classes by selected year
  const filteredClasses = useMemo(() => {
    if (!selectedYear) {
      return classes
    }

    const filtered = classes.filter(classItem => {
      return classItem.schoolYear.name === selectedYear
    })

    // If no exact match found, try to find classes with similar year format
    if (filtered.length === 0 && classes.length > 0) {
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
        return yearFormats.includes(classItem.schoolYear.name)
      })
      return fallbackFiltered
    }

    return filtered
  }, [classes, selectedYear])

  // Auto-select first class when year is selected
  useEffect(() => {
    const autoSelectFirstClass = async () => {
      if (
        selectedYear &&
        classes.length > 0 &&
        filteredClasses.length > 0 &&
        !selectedClassCode
      ) {
        const firstClassCode = filteredClasses[0].codeClass
        setSelectedClassCode(firstClassCode)
        // console.log('firstClassCode', firstClassCode)
        loadData(firstClassCode)
      } else if (
        selectedYear &&
        classes.length > 0 &&
        filteredClasses.length === 0
      ) {
        setSelectedClassCode(null)
      }
    }
    autoSelectFirstClass()
  }, [selectedYear, filteredClasses, classes, selectedClassCode, loadData])

  // Get unique years from classes for the year filter dropdown
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years = [
      currentYear + '-' + (currentYear + 1),
      ...classes
        .map(classItem => classItem.schoolYear.name)
        .filter((year, index, self) => self.indexOf(year) === index)
        .sort((a, b) => b - a),
    ]
    const uniqueYears = [...new Set(years)]
    return uniqueYears
  }, [classes])

  // Get students from the appropriate source
  const students = useMemo(() => {
    if (!selectedYear) {
      return []
    }
    return selectedClass?.students || []
  }, [selectedClass?.students, selectedYear])

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

  const handleTableChange = useCallback(
    pag => {
      // Controlled pagination: update current page and page size in the store
      dispatch(
        updatePagination({ current: pag.current, pageSize: pag.pageSize })
      )
    },
    [dispatch]
  )

  const handleSearch = value => {
    setSearchText(value)
  }

  const handleView = (id, type) => {
    dispatch(clearSelectedClass())
    setSelectedClassCode(null)
    if (type === 'case') {
      navigate(`/case-management/details/${id}`)
    } else {
      navigate(`/student-management/${id}`)
    }
  }

  const handleModalOk = async requestData => {
    if (isCreateCase) {
      await dispatch(createCase(requestData))
        .then(() => {
          messageApi.success(t('clientManagement.messages.createCaseSuccess'))
          setIsCreateCase(false)
        })
        .catch(error => {
          console.log(error)
          messageApi.error(error.message)
        })
    } else {
      messageApi.success(t('clientManagement.messages.addUserSuccess'))
    }
    await loadData()
  }

  const handleModalCancel = () => {
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
                ? t('clientManagement.manageTitleTeacher')
                : t('clientManagement.manageTitle')}
            </Title>
            <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {t('clientManagement.description')}
            </Text>
          </div>
          <div className="flex items-end space-x-3">
            {/* <Button icon={<ExportOutlined />}>Export</Button> */}
            <Button icon={<ReloadOutlined />} onClick={() => loadData()}>
              {t('clientManagement.refresh')}
            </Button>
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
                    schoolYear: classItem.schoolYear.name,
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
            pagination={{ ...pagination, total: filteredStudents.length }}
            onChange={handleTableChange}
            onView={handleView}
            onCreateCase={handleCreateCase}
          />
        </Card>

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
