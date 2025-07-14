import React from 'react'
import { Modal, Form, Input, Select } from 'antd'
import { useTranslation } from 'react-i18next'

const { Option } = Select

const UserModal = ({
  visible,
  onOk,
  onCancel,
  form,
  editingUser: _editingUser,
  isEdit,
  confirmLoading,
  title,
  roleOptions,
  statusOptions,
}) => {
  const { t } = useTranslation()
  return (
    <Modal
      open={visible}
      title={
        title || (isEdit ? t('userModal.editTitle') : t('userModal.addTitle'))
      }
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="fullName"
          label={t('userModal.fullName')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label={t('userModal.email')}
          rules={[{ required: true, type: 'email' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="phone"
          label={t('userModal.phone')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="role"
          label={t('userModal.role')}
          rules={[{ required: true }]}
        >
          <Select>
            {(
              roleOptions || [
                { value: 'student', label: t('userModal.roleOptions.student') },
                {
                  value: 'guardian',
                  label: t('userModal.roleOptions.guardian'),
                },
                { value: 'teacher', label: t('userModal.roleOptions.teacher') },
                {
                  value: 'counselor',
                  label: t('userModal.roleOptions.counselor'),
                },
              ]
            ).map(opt => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="status"
          label={t('userModal.status')}
          rules={[{ required: true }]}
        >
          <Select>
            {(
              statusOptions || [
                { value: 'active', label: t('userModal.statusOptions.active') },
                {
                  value: 'inactive',
                  label: t('userModal.statusOptions.inactive'),
                },
              ]
            ).map(opt => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default React.memo(UserModal)
