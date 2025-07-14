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
} from 'antd'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'

const { Text } = Typography

const CategoryModal = ({
  visible,
  onCancel,
  onOk,
  selectedCategory,
  isEdit,
  isView,
}) => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible && selectedCategory) {
      form.setFieldsValue({
        name: selectedCategory.name,
        code: selectedCategory.code,
      })
    } else if (visible && !selectedCategory) {
      form.resetFields()
    }
  }, [visible, selectedCategory, form])

  const handleOk = async () => {
    if (isView) {
      onCancel()
      return
    }

    try {
      setLoading(true)
      const values = await form.validateFields()

      // Transform data to match API format
      const categoryData = {
        name: values.name,
        code: values.code,
      }

      await onOk(categoryData)
      form.resetFields()
    } catch (error) {
      console.error('Validation failed:', error)
      message.error(t('categoryManagement.messages.addError'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  const getModalTitle = () => {
    if (isView) return t('categoryManagement.modal.viewTitle')
    if (isEdit) return t('categoryManagement.modal.editTitle')
    return t('categoryManagement.modal.addTitle')
  }

  return (
    <Modal
      title={getModalTitle()}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      className={isDarkMode ? 'dark-modal' : ''}
    >
      <Form form={form} layout="vertical" onFinish={handleOk} disabled={isView}>
        <Card
          title={t('categoryManagement.title')}
          size="small"
          className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={t('categoryManagement.form.name')}
                name="name"
                rules={[
                  {
                    required: true,
                    message: t('categoryManagement.form.nameRequired'),
                  },
                ]}
              >
                <Input
                  placeholder={t('categoryManagement.form.namePlaceholder')}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={t('categoryManagement.form.code')}
                name="code"
                rules={[
                  {
                    required: true,
                    message: t('categoryManagement.form.codeRequired'),
                  },
                ]}
              >
                <Input
                  placeholder={t('categoryManagement.form.codePlaceholder')}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <div className="flex justify-end">
          <Space>
            <Button onClick={handleCancel}>{t('common.cancel')}</Button>
            {!isView && (
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? t('common.save') : t('common.create')}
              </Button>
            )}
          </Space>
        </div>
      </Form>
    </Modal>
  )
}

export default CategoryModal
