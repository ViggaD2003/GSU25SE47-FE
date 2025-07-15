import React, { useState, useEffect } from 'react'
import {
  Modal,
  Typography,
  Divider,
  List,
  Tag,
  Space,
  Descriptions,
  Card,
  Button,
  Form,
  Input,
  Switch,
  DatePicker,
  Select,
} from 'antd'
import { surveyAPI } from '../../../services/surveyApi'
import { categoriesAPI } from '../../../services/categoryApi'
import dayjs from 'dayjs'

const SurveyDetailModal = ({
  visible,
  survey,
  onClose,
  onUpdated,
  messageApi,
}) => {
  const [editMode, setEditMode] = useState(false)
  const [formValue, setFormValue] = useState(null)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [fieldErrors, setFieldErrors] = useState({})

  const recurringOptions = [
    { value: 'daily', label: 'Hàng ngày' },
    { value: 'monthly', label: 'Hàng tháng' },
    { value: 'yearly', label: 'Hàng năm' },
  ]

  useEffect(() => {
    if (visible && survey) {
      setFormValue({
        ...survey,
        startDate: dayjs(survey.startDate),
        endDate: dayjs(survey.endDate),
        questions:
          survey.questions?.map(q => ({
            ...q,
            categoryId: q.categoryId ?? q.category?.id ?? null,
          })) || [],
      })
      setEditMode(false)
      setFieldErrors({})
    }
  }, [visible, survey])

  useEffect(() => {
    // Lấy danh sách categories cho dropdown
    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getCategories()
        setCategories(res.data || [])
      } catch {
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  if (!survey || !formValue) return null

  const handleEdit = () => {
    setEditMode(true)
    setFieldErrors({})
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    setFormValue({
      ...survey,
      startDate: survey.startDate ? dayjs(survey.startDate) : null,
      endDate: survey.endDate ? dayjs(survey.endDate) : null,
    })
    setFieldErrors({})
  }

  const handleChange = (field, value) => {
    setFormValue(prev => ({ ...prev, [field]: value }))
  }

  const handleQuestionChange = (idx, field, value) => {
    setFormValue(prev => {
      const questions = [...prev.questions]
      questions[idx] = { ...questions[idx], [field]: value }
      return { ...prev, questions }
    })
  }

  const handleAnswerChange = (qIdx, aIdx, field, value) => {
    setFormValue(prev => {
      const questions = [...prev.questions]
      const answers = [...questions[qIdx].answers]
      answers[aIdx] = { ...answers[aIdx], [field]: value }
      questions[qIdx] = { ...questions[qIdx], answers }
      return { ...prev, questions }
    })
  }

  const handleUpdate = async () => {
    if (!formValue) return

    // Validate các trường bắt buộc
    const errors = {}
    if (!formValue.description || !formValue.description.trim()) {
      errors.description = 'Không được để trống mô tả'
    }
    if (!formValue.startDate) {
      errors.startDate = 'Không được để trống ngày bắt đầu'
    }
    if (dayjs(formValue.startDate).isBefore(dayjs())) {
      errors.startDate = 'Ngày bắt đầu phải lớn hơn hoặc bằng ngày hiện tại'
    }
    if (dayjs(formValue.startDate).isAfter(dayjs(formValue.endDate))) {
      errors.startDate = 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc'
    }
    if (!formValue.endDate) {
      errors.endDate = 'Không được để trống ngày kết thúc'
    }
    if (formValue.isRecurring && !formValue.recurringCycle) {
      errors.recurringCycle = 'Vui lòng chọn chu kỳ lặp lại'
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)

    try {
      const payload = {
        ...formValue,
        startDate: formValue.startDate
          ? formValue.startDate.format('YYYY-MM-DD')
          : null,
        endDate: formValue.endDate
          ? formValue.endDate.format('YYYY-MM-DD')
          : null,
      }

      await surveyAPI.updateSurvey(survey.id || survey.surveyId, payload)

      // console.log(updatedSurvey);

      messageApi.success('Cập nhật thành công')

      setEditMode(false)
      setFieldErrors({})
      // Cập nhật lại formValue để view hiển thị đúng category mới
      // setFormValue({
      //   ...updatedSurvey.data,
      //   startDate: updatedSurvey.data.startDate ? dayjs(updatedSurvey.data.startDate) : dayjs(survey.startDate),
      //   endDate: updatedSurvey.data.endDate ? dayjs(updatedSurvey.data.endDate) : dayjs(survey.endDate),
      //   questions: updatedSurvey.data.questions?.map(q => ({
      //     ...q,
      //     categoryId: q.categoryId ?? q.category?.id ?? null,
      //   })) || [],
      // })
      onUpdated()
    } catch (err) {
      let msg = 'Cập nhật thất bại'
      let apiErrors = {}
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data
        } else if (typeof err.response.data === 'object') {
          apiErrors = err.response.data
          msg = Object.values(apiErrors).join(', ')
        }
      } else if (err?.message) {
        msg = err.message
      }
      setFieldErrors(apiErrors)
      messageApi.error(msg)
      console.error('Lỗi cập nhật:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Modal
        open={visible}
        title={<span style={{ fontWeight: 600 }}>{formValue.name}</span>}
        onCancel={onClose}
        footer={null}
        width={1000}
        style={{ top: '5%' }}
      >
        <div className="flex flex-col h-[80vh]">
          <div>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Mô tả" span={2}>
                {editMode ? (
                  <div>
                    <Input.TextArea
                      value={formValue.description}
                      onChange={e =>
                        handleChange('description', e.target.value)
                      }
                      rows={2}
                    />
                    {fieldErrors.description && (
                      <div style={{ color: 'red', fontSize: 12 }}>
                        {fieldErrors.description}
                      </div>
                    )}
                  </div>
                ) : (
                  formValue.description
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag
                  color={
                    formValue.status === 'COMPLETED'
                      ? 'green'
                      : formValue.status === 'PENDING'
                        ? 'orange'
                        : 'red'
                  }
                >
                  {formValue.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Bắt đầu">
                {editMode ? (
                  <div>
                    <DatePicker
                      value={formValue.startDate}
                      onChange={date => handleChange('startDate', date)}
                      format="YYYY-MM-DD"
                      status={fieldErrors.startDate ? 'error' : undefined}
                    />
                    {fieldErrors.startDate && (
                      <div style={{ color: 'red', fontSize: 12 }}>
                        {fieldErrors.startDate}
                      </div>
                    )}
                  </div>
                ) : formValue.startDate ? (
                  dayjs(formValue.startDate).format('YYYY-MM-DD')
                ) : (
                  ''
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Kết thúc">
                {editMode ? (
                  <div>
                    <DatePicker
                      value={formValue.endDate}
                      onChange={date => handleChange('endDate', date)}
                      format="YYYY-MM-DD"
                      status={fieldErrors.endDate ? 'error' : undefined}
                    />
                    {fieldErrors.endDate && (
                      <div style={{ color: 'red', fontSize: 12 }}>
                        {fieldErrors.endDate}
                      </div>
                    )}
                  </div>
                ) : formValue.endDate ? (
                  dayjs(formValue.endDate).format('YYYY-MM-DD')
                ) : (
                  ''
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Lặp lại" span={2}>
                {editMode ? (
                  <div>
                    <Select
                      value={formValue.recurringCycle}
                      onChange={value => handleChange('recurringCycle', value)}
                      options={recurringOptions}
                      placeholder="Chọn chu kỳ lặp lại"
                      style={{ width: 200 }}
                      allowClear
                      status={fieldErrors.recurringCycle ? 'error' : undefined}
                    />
                    {fieldErrors.recurringCycle && (
                      <div style={{ color: 'red', fontSize: 12 }}>
                        {fieldErrors.recurringCycle}
                      </div>
                    )}
                  </div>
                ) : formValue.isRecurring ? (
                  recurringOptions.find(
                    opt => opt.value === formValue.recurringCycle
                  )?.label || formValue.recurringCycle
                ) : (
                  'Không'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Bắt buộc" span={2}>
                {editMode ? (
                  <Switch
                    checked={formValue.isRequired}
                    onChange={checked => handleChange('isRequired', checked)}
                    checkedChildren="Có"
                    unCheckedChildren="Không"
                  />
                ) : formValue.isRequired ? (
                  'Có'
                ) : (
                  'Không'
                )}
              </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left" style={{ fontWeight: 600 }}>
              Danh sách câu hỏi
            </Divider>
          </div>
          <div
            className="h-full"
            style={{ overflowY: 'auto', marginBottom: 16 }}
          >
            <List
              dataSource={formValue.questions}
              renderItem={(q, qIdx) => (
                <Card
                  key={q.questionId || qIdx}
                  style={{ marginBottom: 16, borderRadius: 8 }}
                  type="inner"
                  title={
                    <Space>
                      {editMode ? (
                        <Input
                          value={q.text}
                          onChange={e =>
                            handleQuestionChange(qIdx, 'text', e.target.value)
                          }
                          style={{ fontWeight: 600, minWidth: 300 }}
                        />
                      ) : (
                        <Typography.Text>{q.text}</Typography.Text>
                      )}
                    </Space>
                  }
                  extra={
                    editMode ? (
                      <Select
                        value={q.categoryId}
                        style={{ width: 180 }}
                        onChange={value =>
                          handleQuestionChange(qIdx, 'categoryId', value)
                        }
                        options={categories.map(c => ({
                          value: c.id,
                          label: c.name,
                        }))}
                        placeholder="Chọn danh mục"
                      />
                    ) : (
                      <Tag>
                        {q.category?.name ||
                          categories.find(c => c.id === q.categoryId)?.name ||
                          ''}
                      </Tag>
                    )
                  }
                >
                  <Typography.Text type="secondary">
                    {editMode ? (
                      <Input
                        value={q.description}
                        onChange={e =>
                          handleQuestionChange(
                            qIdx,
                            'description',
                            e.target.value
                          )
                        }
                        placeholder="Mô tả"
                      />
                    ) : (
                      q.description
                    )}
                  </Typography.Text>
                  <div style={{ marginTop: 8 }}>
                    <List
                      size="small"
                      dataSource={q.answers}
                      renderItem={(a, aIdx) => (
                        <List.Item style={{ paddingLeft: 16 }}>
                          <Space>
                            {editMode ? (
                              <Input
                                value={a.score}
                                onChange={e =>
                                  handleAnswerChange(
                                    qIdx,
                                    aIdx,
                                    'score',
                                    e.target.value
                                  )
                                }
                                style={{ width: 60 }}
                                placeholder="Score"
                              />
                            ) : (
                              <Tag color="blue">{a.score}</Tag>
                            )}
                            {editMode ? (
                              <Input
                                value={a.text}
                                onChange={e =>
                                  handleAnswerChange(
                                    qIdx,
                                    aIdx,
                                    'text',
                                    e.target.value
                                  )
                                }
                                placeholder="Đáp án"
                              />
                            ) : (
                              a.text
                            )}
                          </Space>
                        </List.Item>
                      )}
                    />
                  </div>
                </Card>
              )}
            />
          </div>
          <div style={{ textAlign: 'right' }}>
            {!editMode ? (
              <Button type="primary" onClick={handleEdit}>
                Update
              </Button>
            ) : (
              <>
                <Button onClick={handleCancelEdit} style={{ marginRight: 8 }}>
                  Cancel
                </Button>
                <Button type="primary" onClick={handleUpdate} loading={loading}>
                  Update
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}

export default SurveyDetailModal
