import React, { useState, useEffect } from 'react'
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Card,
  Row,
  Col,
  message,
  DatePicker,
  InputNumber,
  Switch,
  Select,
} from 'antd'
import { BulbOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import dayjs from 'dayjs'
import { ProgramCreationHelper } from '@/components'

const { Text } = Typography
const { TextArea } = Input
const { Option } = Select
const { RangePicker } = DatePicker

const ProgramModal = ({
  visible,
  onCancel,
  onOk,
  selectedProgram,
  isEdit,
  isView,
  categories = [],
}) => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [startDate, setStartDate] = useState(null)
  const [showHelper, setShowHelper] = useState(false)

  useEffect(() => {
    if (visible && selectedProgram) {
      const programIsOnline = selectedProgram.isOnline
      setIsOnline(programIsOnline)
      setStartDate(dayjs(selectedProgram.startDate))

      form.setFieldsValue({
        name: selectedProgram.name,
        description: selectedProgram.description,
        maxParticipants: selectedProgram.maxParticipants,
        dateRange: [
          dayjs(selectedProgram.startDate),
          dayjs(selectedProgram.endDate),
        ],
        isOnline: programIsOnline,
        location: selectedProgram.location,
        categoryId: selectedProgram.category?.id || selectedProgram.categoryId,
      })
    } else if (visible && !selectedProgram) {
      form.resetFields()
      setIsOnline(true)
      setStartDate(null)
      // Set default values for new program
      form.setFieldsValue({
        isOnline: true,
        maxParticipants: 10,
      })
    }
  }, [visible, selectedProgram, form])

  const handleOk = async () => {
    if (isView) {
      onCancel()
      return
    }

    try {
      setLoading(true)
      const values = await form.validateFields()

      // Transform data to match API format
      const programData = {
        name: values.name,
        description: values.description,
        maxParticipants: values.maxParticipants,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        isOnline: values.isOnline,
        status: values.status,
        location: values.location || '',
        categoryId: values.categoryId,
      }

      await onOk(programData)
      form.resetFields()
    } catch (error) {
      console.error('Validation failed:', error)
      message.error(t('programManagement.messages.formError'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  const getModalTitle = () => {
    const title = isView
      ? t('programManagement.modal.viewTitle')
      : isEdit
        ? t('programManagement.modal.editTitle')
        : t('programManagement.modal.addTitle')

    return (
      <div className="flex items-center justify-between">
        <span>{title}</span>
        {!isView && (
          <Button
            type="text"
            icon={<BulbOutlined className="text-yellow-500" />}
            onClick={() => setShowHelper(!showHelper)}
            className="mr-4"
            size="small"
          >
            {t('programHelper.toggle')}
          </Button>
        )}
      </div>
    )
  }

  const validateDateRange = (_, value) => {
    if (!value || value.length !== 2) {
      return Promise.reject(
        new Error(t('programManagement.form.dateRangeRequired'))
      )
    }

    const [selectedStartDate, selectedEndDate] = value
    const minStartDate = dayjs().add(5, 'day')

    // Ngày bắt đầu phải cách ngày hiện tại ít nhất 5 ngày
    if (selectedStartDate.isBefore(minStartDate, 'day')) {
      return Promise.reject(
        new Error(t('programManagement.form.startDateMinDays'))
      )
    }

    // Ngày kết thúc phải sau ngày bắt đầu ít nhất 1 ngày
    if (selectedEndDate.isBefore(selectedStartDate.add(1, 'day'), 'day')) {
      return Promise.reject(
        new Error(t('programManagement.form.endDateMinDays'))
      )
    }

    return Promise.resolve()
  }

  // Handle online/offline change
  const handleTypeChange = checked => {
    setIsOnline(checked)
    // Clear location if switching to online
    if (checked) {
      form.setFieldsValue({ location: '' })
    }
  }

  // Handle date range change
  const handleDateRangeChange = dates => {
    if (dates && dates.length === 2) {
      setStartDate(dates[0])
    } else {
      setStartDate(null)
    }
  }

  // Disable dates before minimum start date
  const disabledDate = current => {
    const minDate = dayjs().add(5, 'day')
    return current && current < minDate.startOf('day')
  }

  return (
    <Modal
      title={getModalTitle()}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={900}
      className={isDarkMode ? 'dark-modal' : ''}
      style={{ maxHeight: '90vh' }}
      styles={{
        body: { maxHeight: '70vh', overflowY: 'auto', padding: '20px' },
      }}
    >
      <Form form={form} layout="vertical" onFinish={handleOk} disabled={isView}>
        {/* Program Creation Helper */}
        <ProgramCreationHelper
          visible={showHelper}
          onClose={() => setShowHelper(false)}
        />

        {/* Basic Information */}
        <Card
          title={t('programManagement.form.basicInfo')}
          size="small"
          className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('programManagement.form.name')}
                name="name"
                rules={[
                  {
                    required: true,
                    message: t('programManagement.form.nameRequired'),
                  },
                  {
                    min: 3,
                    message: t('programManagement.form.nameMinLength'),
                  },
                  {
                    max: 100,
                    message: t('programManagement.form.nameMaxLength'),
                  },
                ]}
              >
                <Input
                  placeholder={t('programManagement.form.namePlaceholder')}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('programManagement.form.category')}
                name="categoryId"
                rules={[
                  {
                    required: true,
                    message: t('programManagement.form.categoryRequired'),
                  },
                ]}
              >
                <Select
                  placeholder={t('programManagement.form.categoryPlaceholder')}
                  size="large"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {categories.map(category => (
                    <Option key={category.id} value={category.id}>
                      {category.name} ({category.code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={t('programManagement.form.description')}
                name="description"
                rules={[
                  {
                    required: true,
                    message: t('programManagement.form.descriptionRequired'),
                  },
                  {
                    min: 10,
                    message: t('programManagement.form.descriptionMinLength'),
                  },
                  {
                    max: 500,
                    message: t('programManagement.form.descriptionMaxLength'),
                  },
                ]}
              >
                <TextArea
                  placeholder={t(
                    'programManagement.form.descriptionPlaceholder'
                  )}
                  rows={4}
                  size="large"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Program Settings */}
        <Card
          title={t('programManagement.form.settings')}
          size="small"
          className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={t('programManagement.form.maxParticipants')}
                name="maxParticipants"
                rules={[
                  {
                    required: true,
                    message: t(
                      'programManagement.form.maxParticipantsRequired'
                    ),
                  },
                  {
                    type: 'number',
                    min: 10,
                    message: t('programManagement.form.maxParticipantsMin'),
                  },
                  {
                    type: 'number',
                    max: 50,
                    message: t('programManagement.form.maxParticipantsMax'),
                  },
                ]}
              >
                <InputNumber
                  placeholder={t(
                    'programManagement.form.maxParticipantsPlaceholder'
                  )}
                  size="large"
                  style={{ width: '100%' }}
                  min={10}
                  max={50}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t('programManagement.form.type')}
                name="isOnline"
                valuePropName="checked"
              >
                <div className="flex items-center space-x-2">
                  <Switch size="default" onChange={handleTypeChange} />
                  <Text type="secondary">
                    {isOnline
                      ? t('programManagement.form.typeOnline')
                      : t('programManagement.form.typeOffline')}
                  </Text>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Schedule & Location */}
        <Card
          title={t('programManagement.form.schedule')}
          size="small"
          className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('programManagement.form.dateRange')}
                name="dateRange"
                rules={[
                  {
                    required: true,
                    message: t('programManagement.form.dateRangeRequired'),
                  },
                  {
                    validator: validateDateRange,
                  },
                ]}
              >
                <RangePicker
                  size="large"
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder={[
                    t('programManagement.form.startDate'),
                    t('programManagement.form.endDate'),
                  ]}
                  disabledDate={disabledDate}
                  onChange={handleDateRangeChange}
                />
              </Form.Item>
            </Col>
            {!isOnline && (
              <Col span={12}>
                <Form.Item
                  label={t('programManagement.form.location')}
                  name="location"
                  rules={[
                    {
                      required: !isOnline,
                      message: t('programManagement.form.locationRequired'),
                    },
                    {
                      max: 200,
                      message: t('programManagement.form.locationMaxLength'),
                    },
                  ]}
                >
                  <Input
                    placeholder={t(
                      'programManagement.form.locationPlaceholder'
                    )}
                    size="large"
                  />
                </Form.Item>
              </Col>
            )}
            {isOnline && startDate && (
              <Col span={12}>
                <Form.Item label={t('programManagement.form.programInfo')}>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Text type="secondary" className="text-sm">
                      {t('programManagement.form.onlineInfo')}
                    </Text>
                  </div>
                </Form.Item>
              </Col>
            )}
          </Row>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Space size="middle">
            <Button onClick={handleCancel} size="large">
              {t('common.cancel')}
            </Button>
            {!isView && (
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
              >
                {isEdit ? t('common.save') : t('common.create')}
              </Button>
            )}
          </Space>
        </div>
      </Form>
    </Modal>
  )
}

export default ProgramModal
