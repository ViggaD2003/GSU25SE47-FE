import React, { useState, useEffect } from 'react'
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Button,
  Space,
  Divider,
  Typography,
  Card,
  Row,
  Col,
  message,
} from 'antd'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { useTheme } from '@/contexts/ThemeContext'

const { Text } = Typography

const ClassModal = ({
  visible,
  onCancel,
  onOk,
  selectedClass,
  isEdit,
  isView,
}) => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible && selectedClass) {
      form.setFieldsValue({
        codeClass: selectedClass.codeClass,
        classYear: selectedClass.classYear
          ? dayjs(selectedClass.classYear)
          : null,
        teacherCode: selectedClass.teacher?.teacherCode,
        teacherName: selectedClass.teacher?.fullName,
        teacherPhone: selectedClass.teacher?.phoneNumber,
        teacherEmail: selectedClass.teacher?.email,
      })
    } else if (visible && !selectedClass) {
      form.resetFields()
    }
  }, [visible, selectedClass, form])

  const handleOk = async () => {
    if (isView) {
      onCancel()
      return
    }

    try {
      setLoading(true)
      const values = await form.validateFields()

      // Transform data to match API format
      const classData = {
        codeClass: values.codeClass,
        classYear: values.classYear
          ? values.classYear.format('YYYY-MM-DD')
          : null,
        teacher: {
          teacherCode: values.teacherCode,
          fullName: values.teacherName,
          phoneNumber: values.teacherPhone,
          email: values.teacherEmail,
        },
      }

      await onOk(classData)
      form.resetFields()
    } catch (error) {
      console.error('Validation failed:', error)
      message.error(t('classManagement.messages.addError'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  const getModalTitle = () => {
    if (isView) return t('classManagement.modal.viewTitle')
    if (isEdit) return t('classManagement.modal.editTitle')
    return t('classManagement.modal.addTitle')
  }

  const validateEmail = (_, value) => {
    if (!value) return Promise.resolve()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return Promise.reject(
        new Error(t('classManagement.form.teacherEmailInvalid'))
      )
    }
    return Promise.resolve()
  }

  return (
    <Modal
      title={getModalTitle()}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      className={isDarkMode ? 'dark-modal' : ''}
    >
      <Form form={form} layout="vertical" onFinish={handleOk} disabled={isView}>
        <Card
          title={t('classManagement.form.codeClass')}
          size="small"
          className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('classManagement.form.codeClass')}
                name="codeClass"
                rules={[
                  {
                    required: true,
                    message: t('classManagement.form.codeClassRequired'),
                  },
                ]}
              >
                <Input
                  placeholder={t('classManagement.form.codeClassPlaceholder')}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('classManagement.form.classYear')}
                name="classYear"
                rules={[
                  {
                    required: true,
                    message: t('classManagement.form.classYearRequired'),
                  },
                ]}
              >
                <DatePicker
                  picker="year"
                  placeholder={t('classManagement.form.classYearRequired')}
                  size="large"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          title={t('classManagement.form.teacherInfo')}
          size="small"
          className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('classManagement.form.teacherCode')}
                name="teacherCode"
                rules={[
                  {
                    required: true,
                    message: t('classManagement.form.teacherCodeRequired'),
                  },
                ]}
              >
                <Input
                  placeholder={t('classManagement.form.teacherCodePlaceholder')}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('classManagement.form.teacherName')}
                name="teacherName"
                rules={[
                  {
                    required: true,
                    message: t('classManagement.form.teacherNameRequired'),
                  },
                ]}
              >
                <Input
                  placeholder={t('classManagement.form.teacherNamePlaceholder')}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('classManagement.form.teacherPhone')}
                name="teacherPhone"
                rules={[
                  {
                    required: true,
                    message: t('classManagement.form.teacherPhoneRequired'),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'classManagement.form.teacherPhonePlaceholder'
                  )}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('classManagement.form.teacherEmail')}
                name="teacherEmail"
                rules={[
                  {
                    required: true,
                    message: t('classManagement.form.teacherEmailRequired'),
                  },
                  {
                    validator: validateEmail,
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'classManagement.form.teacherEmailPlaceholder'
                  )}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Divider />

        <div className="flex justify-end">
          <Space>
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

export default ClassModal
