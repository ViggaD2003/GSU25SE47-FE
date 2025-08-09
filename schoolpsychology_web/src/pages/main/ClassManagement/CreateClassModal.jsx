import React, { useState, useEffect } from 'react'
import {
  Modal,
  Form,
  Select,
  Input,
  Button,
  Space,
  Divider,
  Typography,
  Card,
  Row,
  Col,
  message,
  InputNumber,
  DatePicker,
} from 'antd'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import { GRADE_LEVEL, USER_ROLE } from '@/constants/enums'
import { accountAPI } from '@/services/accountApi'
import dayjs from 'dayjs'

const { Text, Title } = Typography
const { Option } = Select

const CreateClassModal = ({ visible, onCancel, onOk }) => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [teachers, setTeachers] = useState([])
  const [fetchingTeachers, setFetchingTeachers] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(0)

  // Fetch teachers when modal opens
  useEffect(() => {
    if (visible) {
      fetchTeachers()
    }
  }, [visible])

  const fetchTeachers = async () => {
    try {
      setFetchingTeachers(true)
      const data = await accountAPI.getAccounts({ role: USER_ROLE.TEACHER })

      setTeachers(data || [])
    } catch (error) {
      console.error('Error fetching teachers:', error)
      message.error(t('classManagement.messages.fetchTeachersError'))
    } finally {
      setFetchingTeachers(false)
    }
  }

  const handleOk = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()

      const { grade, numberOfClasses, schoolYear, startTime, endTime } = values

      // Generate class data array
      const classDataArray = []

      for (let i = 0; i < numberOfClasses; i++) {
        const classData = {
          grade: grade,
          teacherId: values[`teacherId_${i}`],
          codeClass: values[`codeClass_${i}`],
          schoolYear: schoolYear,
          startTime: dayjs(startTime).toISOString(),
          endTime: dayjs(endTime).toISOString(),
          isActive: true,
        }
        classDataArray.push(classData)
      }

      await onOk(classDataArray)
      form.resetFields()
    } catch (error) {
      console.error('Validation failed:', error)
      // Error message is handled in parent component
      message.error(t('classManagement.messages.createError'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title={t('classManagement.modal.createMultipleClasses')}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={900}
      className={isDarkMode ? 'dark-modal' : ''}
    >
      <Form form={form} layout="vertical" onFinish={handleOk}>
        {/* General Configuration */}
        <Card
          title={t('classManagement.form.generalConfig')}
          size="small"
          className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={t('classManagement.form.grade')}
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
                >
                  <Option value={GRADE_LEVEL.GRADE_10}>
                    {t('classManagement.form.grade10')}
                  </Option>
                  <Option value={GRADE_LEVEL.GRADE_11}>
                    {t('classManagement.form.grade11')}
                  </Option>
                  <Option value={GRADE_LEVEL.GRADE_12}>
                    {t('classManagement.form.grade12')}
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t('classManagement.form.numberOfClasses')}
                name="numberOfClasses"
                rules={[
                  {
                    required: true,
                    message: t('classManagement.form.numberOfClassesRequired'),
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
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t('classManagement.form.schoolYear')}
                name="schoolYear"
                rules={[
                  {
                    required: true,
                    message: t('classManagement.form.schoolYearRequired'),
                  },
                  {
                    pattern: /^\d{4}-\d{4}$/,
                    message: t('classManagement.form.schoolYearFormat'),
                  },
                ]}
              >
                <Input placeholder="2024-2025" size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('classManagement.form.startTime')}
                name="startTime"
                rules={[
                  {
                    required: true,
                    message: t('classManagement.form.startTimeRequired'),
                  },
                ]}
              >
                <DatePicker
                  showTime
                  placeholder={t('classManagement.form.selectStartTime')}
                  size="large"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('classManagement.form.endTime')}
                name="endTime"
                rules={[
                  {
                    required: true,
                    message: t('classManagement.form.endTimeRequired'),
                  },
                ]}
              >
                <DatePicker
                  showTime
                  placeholder={t('classManagement.form.selectEndTime')}
                  size="large"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Dynamic Class Fields */}
        <Form.Item dependencies={['numberOfClasses']}>
          {({ getFieldValue }) => {
            const numberOfClasses = getFieldValue('numberOfClasses') || 0
            return (
              <div className="mb-4">
                <Title
                  level={5}
                  className={isDarkMode ? 'text-white' : 'text-gray-900'}
                >
                  {t('classManagement.form.classDetails')}
                </Title>
                {Array.from({ length: numberOfClasses }, (_, i) => (
                  <Card
                    key={i}
                    title={`${t('classManagement.form.class')} ${i + 1}`}
                    size="small"
                    className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label={t('classManagement.form.codeClass')}
                          name={`codeClass_${i}`}
                          rules={[
                            {
                              required: true,
                              message: t(
                                'classManagement.form.codeClassRequired'
                              ),
                            },
                          ]}
                        >
                          <Input
                            placeholder={t(
                              'classManagement.form.codeClassPlaceholder'
                            )}
                            size="large"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label={t('classManagement.form.teacher')}
                          name={`teacherId_${i}`}
                          dependencies={['numberOfClasses']}
                          rules={[
                            {
                              required: true,
                              message: t(
                                'classManagement.form.teacherRequired'
                              ),
                            },
                          ]}
                        >
                          <Select
                            placeholder={t(
                              'classManagement.form.selectTeacher'
                            )}
                            size="large"
                            loading={fetchingTeachers}
                            showSearch
                            filterOption={(input, option) =>
                              option.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                            }
                            onChange={() => {
                              // Force re-render to update other teacher dropdowns
                              setForceUpdate(prev => prev + 1)
                            }}
                            key={`teacher-${i}-${forceUpdate}`}
                          >
                            {(() => {
                              const numberOfClasses =
                                form.getFieldValue('numberOfClasses') || 0
                              const selectedTeachers = []

                              // Collect all selected teacher IDs from other class fields
                              for (let j = 0; j < numberOfClasses; j++) {
                                if (j !== i) {
                                  const teacherId = form.getFieldValue(
                                    `teacherId_${j}`
                                  )
                                  if (teacherId) {
                                    selectedTeachers.push(teacherId)
                                  }
                                }
                              }

                              // Filter out already selected teachers
                              const availableTeachers = teachers.filter(
                                teacher =>
                                  !selectedTeachers.includes(teacher.id)
                              )

                              return availableTeachers.map(teacher => (
                                <Option key={teacher.id} value={teacher.id}>
                                  {teacher.fullName} ({teacher.teacherCode})
                                </Option>
                              ))
                            })()}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            )
          }}
        </Form.Item>

        <Divider />

        <div className="flex justify-end">
          <Space>
            <Button onClick={handleCancel} size="large">
              {t('common.cancel')}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              {t('common.create')}
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  )
}

export default CreateClassModal
