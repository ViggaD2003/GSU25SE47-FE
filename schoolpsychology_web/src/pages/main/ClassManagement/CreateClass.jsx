import React, { useState, useCallback, useEffect } from 'react'
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  Card,
  Row,
  Col,
  Divider,
  InputNumber,
  DatePicker,
  Typography,
  message,
  Steps,
  Alert,
  Tooltip,
  Tag,
  Spin,
  Empty,
  Collapse,
  Switch,
  Progress,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '@/contexts/ThemeContext'

import { createClass } from '@/store/actions/classActions'
import { accountAPI } from '@/services/accountApi'
import { GRADE_LEVEL, USER_ROLE } from '@/constants/enums'
import dayjs from 'dayjs'
import { classAPI } from '@/services/classApi'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input
const { Panel } = Collapse
const { Step } = Steps

const CreateClass = () => {
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [t] = useTranslation()
  const [messageApi, contextHolder] = message.useMessage()
  const { isDarkMode } = useTheme()

  // State management
  const [teachers, setTeachers] = useState([])
  const [fetching, setFetching] = useState(false)
  const [selectedTeachers, setSelectedTeachers] = useState({})
  const [schoolYears, setSchoolYears] = useState([])
  const [classes, setClasses] = useState([])

  const [formValues, setFormValues] = useState({})

  // Redux selectors
  const { loading: createLoading } = useSelector(state => state.class)

  // Fetch teachers on component mount
  useEffect(() => {
    Promise.all([fetchData(), fetchTeachers()]).then(() => {
      setFetching(false)
    })
  }, [])

  const fetchData = useCallback(async () => {
    try {
      setFetching(true)
      const response = await classAPI.getSchoolYears()
      setSchoolYears(response || [])
      if (response && response.length > 0) {
        form.setFieldsValue({
          schoolYear: response[0].id,
          startTime: dayjs(response[0].startDate).local(),
          endTime: dayjs(response[0].endDate).local(),
        })
      }
    } catch (error) {
      console.error('Error fetching school years:', error)
    }
  }, [form])

  // Fetch teachers from API
  const fetchTeachers = useCallback(async () => {
    try {
      setFetching(true)
      const response = await accountAPI.getAccounts({ role: USER_ROLE.TEACHER })
      setTeachers(response || [])
    } catch (error) {
      console.error('Error fetching teachers:', error)
    } finally {
      setFetching(false)
    }
  }, [])

  // Handle teacher selection
  const handleTeacherSelection = useCallback((classId, teacherId) => {
    setSelectedTeachers(prev => ({
      ...prev,
      [classId]: teacherId,
    }))

    setClasses(prev =>
      prev.map(cls => (cls.id === classId ? { ...cls, teacherId } : cls))
    )
  }, [])

  // Handle class status change
  const handleClassStatusChange = useCallback((classId, isActive) => {
    setClasses(prev =>
      prev.map(cls => (cls.id === classId ? { ...cls, isActive } : cls))
    )
  }, [])

  // Handle class code change
  const handleClassCodeChange = useCallback((classId, codeClass) => {
    setClasses(prev =>
      prev.map(cls => (cls.id === classId ? { ...cls, codeClass } : cls))
    )
  }, [])

  // Generate classes when grade or numberOfClasses changes
  const generateClasses = useCallback((grade, numberOfClasses) => {
    if (grade && numberOfClasses) {
      const newClasses = Array.from(
        { length: numberOfClasses },
        (_, index) => ({
          id: `temp-${index}`,
          codeClass: `${grade}${String(index + 1).padStart(2, '0')}`, // Auto-generate default code
          teacherId: undefined,
          description: '',
          isActive: true,
        })
      )
      setClasses(newClasses)
    } else {
      setClasses([])
    }
  }, [])

  // Handle school year change
  const handleSchoolYearChange = useCallback(
    value => {
      const selectedSchoolYear = schoolYears.find(
        schoolYear => schoolYear.id === value
      )
      if (selectedSchoolYear) {
        form.setFieldsValue({
          startTime: dayjs(selectedSchoolYear.startDate).local(),
          endTime: dayjs(selectedSchoolYear.endDate).local(),
        })
      }

      // Regenerate classes if grade and numberOfClasses are already set
      const { grade, numberOfClasses } = form.getFieldsValue()
      if (grade && numberOfClasses) {
        generateClasses(grade, numberOfClasses)
      }
    },
    [schoolYears, form, generateClasses]
  )

  // Handle grade change
  const handleGradeChange = useCallback(
    value => {
      // Regenerate classes if numberOfClasses is already set
      const { numberOfClasses } = form.getFieldsValue()
      if (numberOfClasses) {
        generateClasses(value, numberOfClasses)
      }
    },
    [form, generateClasses]
  )

  // Handle numberOfClasses change
  const handleNumberOfClassesChange = useCallback(
    value => {
      // Regenerate classes if grade is already set
      const { grade } = form.getFieldsValue()
      if (grade) {
        generateClasses(grade, value)
      }
    },
    [form, generateClasses]
  )

  // Validate current step
  const validateCurrentStep = useCallback(() => {
    // Lấy giá trị từ form trực tiếp thay vì từ state
    const values = form.getFieldsValue()
    const { grade, numberOfClasses, schoolYear, startTime, endTime } = values

    // Cập nhật formValues state để theo dõi
    setFormValues(prev => ({ ...prev, ...values }))

    switch (currentStep) {
      case 0:
        return grade && numberOfClasses && schoolYear
      case 1:
        return startTime && endTime && dayjs(endTime).isAfter(dayjs(startTime))
      case 2:
        return (
          classes.length > 0 &&
          classes.every(
            cls => cls.teacherId && cls.codeClass && cls.codeClass.trim() !== ''
          )
        )
      default:
        return true
    }
  }, [currentStep, classes, form])

  // Handle next step
  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      // Lưu giá trị hiện tại trước khi chuyển step
      const currentValues = form.getFieldsValue()
      setFormValues(prev => ({ ...prev, ...currentValues }))

      setCurrentStep(prev => prev + 1)
    } else {
      if (currentStep === 2) {
        messageApi.warning(
          t('classManagement.messages.teacherAssignmentRequired')
        )
      } else {
        messageApi.warning(t('classManagement.messages.completeCurrentStep'))
      }
    }
  }, [validateCurrentStep, messageApi, t, currentStep, form])

  // Handle previous step
  const handlePrev = useCallback(() => {
    // Lưu giá trị hiện tại trước khi quay lại
    const currentValues = form.getFieldsValue()
    setFormValues(prev => ({ ...prev, ...currentValues }))

    setCurrentStep(prev => prev - 1)
  }, [])

  // Handle form submission
  const handleCreateClass = useCallback(async () => {
    try {
      setLoading(true)

      // Lấy giá trị từ form trực tiếp
      const { grade, schoolYear, startTime, endTime } = formValues

      // Prepare data for API - Format theo yêu cầu của backend
      const classData = classes.map(cls => ({
        teacherId: cls.teacherId,
        codeClass: cls.codeClass,
        startTime: dayjs(startTime).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        endTime: dayjs(endTime).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        active: cls.isActive,
        grade: grade,
        schoolYearId: schoolYear,
      }))

      console.log(classData)

      // Gửi từng lớp một hoặc gửi tất cả cùng lúc tùy theo API
      await dispatch(createClass(classData)).unwrap()
      messageApi.success(t('classManagement.messages.createMultipleSuccess'))

      // Reset form and state
      form.resetFields()
      setClasses([])
      setSelectedTeachers({})
      setCurrentStep(0)
      setFormValues({})

      // Reset to initial values
      if (schoolYears.length > 0) {
        form.setFieldsValue({
          schoolYear: schoolYears[0].id,
          startTime: dayjs(schoolYears[0].startDate).local(),
          endTime: dayjs(schoolYears[0].endDate).local(),
        })
        // Cập nhật formValues sau khi set
        setFormValues(prev => ({
          ...prev,
          schoolYear: schoolYears[0].id,
          startTime: dayjs(schoolYears[0].startDate).local(),
          endTime: dayjs(schoolYears[0].endDate).local(),
        }))
      }
    } catch (error) {
      console.error('Error creating classes:', error)
      if (error.errorFields) {
        messageApi.error(t('classManagement.messages.validationError'))
      } else {
        messageApi.error(t('classManagement.messages.createError'))
      }
    } finally {
      setLoading(false)
    }
  }, [classes, dispatch, t, messageApi, form, schoolYears, formValues])

  // Get available teachers for a specific class
  const getAvailableTeachers = useCallback(
    excludeClassId => {
      const selectedTeacherIds = Object.values(selectedTeachers).filter(Boolean)
      return teachers.filter(
        teacher =>
          !selectedTeacherIds.includes(teacher.id) ||
          selectedTeachers[excludeClassId] === teacher.id
      )
    },
    [teachers, selectedTeachers]
  )

  // Steps configuration
  const steps = [
    {
      title: t('classManagement.steps.generalConfig'),
      icon: <BookOutlined />,
      description: t('classManagement.steps.generalConfigDesc'),
    },
    {
      title: t('classManagement.steps.timeConfig'),
      icon: <CalendarOutlined />,
      description: t('classManagement.steps.timeConfigDesc'),
    },
    {
      title: t('classManagement.steps.teacherAssignment'),
      icon: <UserOutlined />,
      description: t('classManagement.steps.teacherAssignmentDesc'),
    },
  ]

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card
            title={
              <Space>
                <BookOutlined />
                <span>{t('classManagement.steps.generalConfig')}</span>
              </Space>
            }
            className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
          >
            <div className="mb-4">
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchTeachers}
                  loading={fetching}
                  size="small"
                >
                  {t(
                    'classManagement.form.refreshTeachers',
                    'Refresh Teachers'
                  )}
                </Button>
                <Space size={10}>
                  <Text type="secondary">
                    {t(
                      'classManagement.form.teachersAvailable',
                      'Teachers Available'
                    )}
                    : {teachers.length}
                  </Text>
                  <Divider type="vertical" size="large" />
                  <Text type="secondary">
                    {t('classManagement.form.schoolYear', 'School Year')}:{' '}
                    {
                      schoolYears.find(
                        schoolYear =>
                          schoolYear.id === form.getFieldValue('schoolYear')
                      )?.name
                    }
                  </Text>
                  <Divider type="vertical" size="large" />
                  <Text type="secondary">
                    {t('classManagement.form.grade', 'Grade')}:{' '}
                    {GRADE_LEVEL[form.getFieldValue('grade')]}
                  </Text>
                  <Divider type="vertical" size="large" />
                  <Text type="secondary">Classes: {classes.length}</Text>
                </Space>
              </Space>
            </div>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label={
                    <Space>
                      <span>{t('classManagement.form.schoolYear')}</span>
                      <Tooltip
                        title={t('classManagement.form.tooltips.schoolYear')}
                      >
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  name="schoolYear"
                  rules={[
                    {
                      required: true,
                      message: t('classManagement.form.schoolYearRequired'),
                    },
                  ]}
                >
                  <Select
                    placeholder="2024-2025"
                    size="large"
                    onChange={handleSchoolYearChange}
                    options={schoolYears.map(schoolYear => ({
                      label: schoolYear.name,
                      value: schoolYear.id,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label={
                    <Space>
                      <span>{t('classManagement.form.grade')}</span>
                      <Tooltip
                        title={t(
                          'classManagement.form.tooltips.gradeSelection'
                        )}
                      >
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  name="grade"
                  rules={[
                    {
                      required: true,
                      message: t('classManagement.form.gradeRequired'),
                    },
                  ]}
                >
                  <Select
                    placeholder={t('classManagement.form.selectGrade')}
                    size="large"
                    onChange={handleGradeChange}
                  >
                    {Object.values(GRADE_LEVEL).map(grade => (
                      <Option key={grade} value={grade}>
                        {t(`classManagement.form.${grade.toLowerCase()}`)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label={
                    <Space>
                      <span>{t('classManagement.form.numberOfClasses')}</span>
                      <Tooltip
                        title={t(
                          'classManagement.form.tooltips.numberOfClasses'
                        )}
                      >
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  name="numberOfClasses"
                  rules={[
                    {
                      required: true,
                      message: t(
                        'classManagement.form.numberOfClassesRequired'
                      ),
                    },
                    {
                      type: 'number',
                      min: 1,
                      max: 10,
                      message: t('classManagement.form.numberOfClassesRange'),
                    },
                  ]}
                >
                  <InputNumber
                    placeholder={t(
                      'classManagement.form.numberOfClassesPlaceholder'
                    )}
                    size="large"
                    min={1}
                    max={10}
                    style={{ width: '100%' }}
                    onChange={handleNumberOfClassesChange}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Preview Classes - Show immediately when classes are generated */}
            {classes.length > 0 && (
              <div className="mt-6">
                <Title
                  level={5}
                  className={isDarkMode ? 'text-white' : 'text-gray-900'}
                >
                  {t('classManagement.form.previewClasses', 'Preview Classes')}
                </Title>
                <Alert
                  message={t(
                    'classManagement.form.previewInfo',
                    'Preview Information'
                  )}
                  description={t(
                    'classManagement.form.previewInfoDesc',
                    'These classes will be created with the current settings. You can modify class codes and assign teachers in the next steps.'
                  )}
                  type="info"
                  showIcon
                  style={{ marginBottom: '10px' }}
                />

                <Row gutter={[8, 8]}>
                  {classes.map((cls, index) => (
                    <Col xs={24} sm={12} lg={8} key={cls.id}>
                      <Card
                        size="small"
                        className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <Text
                              strong
                              className={
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }
                            >
                              {cls.codeClass}
                            </Text>
                            <br />
                            <Text type="secondary" className="text-xs">
                              {t('classManagement.form.class')} {index + 1}
                            </Text>
                            <br />
                            <Text type="secondary" className="text-xs">
                              Teacher:{' '}
                              {cls.teacherId
                                ? teachers.find(
                                    teacher => teacher.id === cls.teacherId
                                  )?.fullName
                                : 'N/A'}
                            </Text>
                          </div>
                          <Tag color={cls.teacherId ? 'green' : 'orange'}>
                            {cls.teacherId ? 'Ready' : 'Pending'}
                          </Tag>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Card>
        )

      case 1:
        return (
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>{t('classManagement.steps.timeConfig')}</span>
              </Space>
            }
            className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
          >
            <div className="mb-4">
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchTeachers}
                  loading={fetching}
                  size="small"
                >
                  {t(
                    'classManagement.form.refreshTeachers',
                    'Refresh Teachers'
                  )}
                </Button>
                <Text type="secondary">
                  {t(
                    'classManagement.form.teachersAvailable',
                    'Teachers Available'
                  )}
                  : {teachers.length}
                </Text>
              </Space>
            </div>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <Space>
                      <span>{t('classManagement.form.startTime')}</span>
                      <Tooltip
                        title={t('classManagement.form.tooltips.startTime')}
                      >
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  name="startTime"
                  rules={[
                    {
                      required: true,
                      message: t('classManagement.form.startTimeRequired'),
                    },
                  ]}
                >
                  <DatePicker
                    placeholder={t(
                      'classManagement.form.placeholders.selectDate'
                    )}
                    size="large"
                    style={{ width: '100%' }}
                    disabled={true}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <Space>
                      <span>{t('classManagement.form.endTime')}</span>
                      <Tooltip
                        title={t('classManagement.form.tooltips.endTime')}
                      >
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  name="endTime"
                  rules={[
                    {
                      required: true,
                      message: t('classManagement.form.endTimeRequired'),
                    },
                  ]}
                >
                  <DatePicker
                    placeholder={t(
                      'classManagement.form.placeholders.selectDate'
                    )}
                    size="large"
                    style={{ width: '100%' }}
                    disabled={true}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        )

      case 2:
        return (
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>
                  {t(
                    'classManagement.steps.teacherAssignment',
                    'Teacher Assignment'
                  )}
                </span>
              </Space>
            }
            className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
          >
            <div className="mb-4">
              <Alert
                message={t(
                  'classManagement.form.classCodeInfo',
                  'Class Code Information'
                )}
                description={t(
                  'classManagement.form.classCodeInfoDesc',
                  'You can edit the auto-generated class codes or enter your own custom codes. Each class must have a unique code.'
                )}
                type="info"
                showIcon
                style={{ marginBottom: '10px' }}
              />
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchTeachers}
                  loading={fetching}
                  size="small"
                >
                  {t(
                    'classManagement.form.refreshTeachers',
                    'Refresh Teachers'
                  )}
                </Button>
                <Space size={10}>
                  <Text type="secondary">
                    {t(
                      'classManagement.form.teachersAvailable',
                      'Teachers Available'
                    )}
                    : {teachers.length}
                  </Text>
                  <Divider type="vertical" size="large" />
                  <Text type="secondary">
                    {t('classManagement.form.schoolYear', 'School Year')}:{' '}
                    {
                      schoolYears.find(
                        schoolYear =>
                          schoolYear.id === form.getFieldValue('schoolYear')
                      )?.name
                    }
                  </Text>
                  <Divider type="vertical" size="large" />
                  <Text type="secondary">
                    {t('classManagement.form.grade', 'Grade')}:{' '}
                    {GRADE_LEVEL[form.getFieldValue('grade')]}
                  </Text>
                </Space>
              </Space>
            </div>

            {classes.length > 0 ? (
              <Row gutter={[16, 16]}>
                {classes.map((cls, _index) => {
                  const availableTeachers = getAvailableTeachers(cls.id)
                  const selectedTeacher = teachers.find(
                    t => t.id === cls.teacherId
                  )

                  return (
                    <Col xs={24} lg={12} key={cls.id}>
                      <Card
                        size="small"
                        title={
                          <Space>
                            <TeamOutlined />
                            <span>{cls.codeClass}</span>
                            <Tag color={cls.isActive ? 'green' : 'red'}>
                              {cls.isActive
                                ? t('classManagement.table.active')
                                : t('classManagement.table.inactive')}
                            </Tag>
                          </Space>
                        }
                        className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`}
                        extra={
                          <Switch
                            checked={cls.isActive}
                            onChange={checked =>
                              handleClassStatusChange(cls.id, checked)
                            }
                            size="small"
                          />
                        }
                      >
                        <div className="space-y-3">
                          <div>
                            <Text
                              strong
                              className={
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }
                            >
                              <Space>
                                <span>
                                  {t(
                                    'classManagement.form.classCode',
                                    'Class Code'
                                  )}
                                  :
                                </span>
                                <Tooltip
                                  title={t(
                                    'classManagement.form.tooltips.classCode',
                                    'Class Code'
                                  )}
                                >
                                  <InfoCircleOutlined />
                                </Tooltip>
                              </Space>
                            </Text>
                            <Input
                              placeholder={t(
                                'classManagement.form.placeholders.enterClassCode',
                                'Enter class code'
                              )}
                              value={cls.codeClass}
                              onChange={e =>
                                handleClassCodeChange(cls.id, e.target.value)
                              }
                              className="mt-1"
                              size="large"
                            />
                          </div>

                          <div>
                            <Text
                              strong
                              className={
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }
                            >
                              <Space>
                                <span>
                                  {t('classManagement.form.teacher')}:
                                </span>
                                <Tooltip
                                  title={t(
                                    'classManagement.form.tooltips.teacherAssignment'
                                  )}
                                >
                                  <InfoCircleOutlined />
                                </Tooltip>
                              </Space>
                            </Text>
                            <Select
                              placeholder={t(
                                'classManagement.form.placeholders.searchTeacher',
                                'Search Teacher'
                              )}
                              style={{ width: '100%' }}
                              value={cls.teacherId}
                              onChange={value =>
                                handleTeacherSelection(cls.id, value)
                              }
                              loading={fetching}
                              showSearch
                              filterOption={(input, option) =>
                                option.children
                                  .toLowerCase()
                                  .indexOf(input.toLowerCase()) >= 0
                              }
                            >
                              {availableTeachers.map(teacher => (
                                <Option key={teacher.id} value={teacher.id}>
                                  <Space>
                                    <UserOutlined />
                                    <span>{teacher.fullName}</span>
                                    <Tag size="small">
                                      {teacher.teacherCode}
                                    </Tag>
                                  </Space>
                                </Option>
                              ))}
                            </Select>
                          </div>

                          {selectedTeacher && (
                            <Alert
                              message={t(
                                'classManagement.form.selectedTeacher',
                                'Teacher Information'
                              )}
                              description={
                                <div>
                                  <Text>{selectedTeacher.fullName}</Text>
                                  <br />
                                  <Text type="secondary">
                                    {selectedTeacher.email}
                                  </Text>
                                  <br />
                                  <Text type="secondary">
                                    {selectedTeacher.phoneNumber}
                                  </Text>
                                </div>
                              }
                              type="info"
                              showIcon
                              size="small"
                            />
                          )}
                        </div>
                      </Card>
                    </Col>
                  )
                })}
              </Row>
            ) : (
              <Empty
                description={t('classManagement.form.noClassesToAssign')}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <>
      {contextHolder}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Title
              level={2}
              className={isDarkMode ? 'text-white' : 'text-gray-900'}
            >
              {t('classManagement.modal.createMultipleClasses')}
            </Title>
            <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {t('classManagement.description')}
            </Text>
          </div>
        </div>

        {/* Steps */}
        <Steps
          current={currentStep}
          items={steps}
          style={{ marginBottom: '20px' }}
          className={`mb-6 ${isDarkMode ? 'text-white' : ''}`}
        />

        {/* Form */}
        <Form form={form} layout="vertical">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              onClick={handlePrev}
              disabled={currentStep === 0}
              size="large"
            >
              {t('common.previous')}
            </Button>

            <Space>
              {currentStep < steps.length - 1 ? (
                <Button
                  type="primary"
                  onClick={handleNext}
                  size="large"
                  icon={<CheckCircleOutlined />}
                >
                  {t('common.next')}
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={handleCreateClass}
                  loading={loading || createLoading}
                  size="large"
                  icon={<PlusOutlined />}
                >
                  {t('common.create')}
                </Button>
              )}
            </Space>
          </div>
        </Form>
      </div>
    </>
  )
}

export default CreateClass
