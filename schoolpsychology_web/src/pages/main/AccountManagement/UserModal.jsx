import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, DatePicker, Radio, Button } from 'antd'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'

const { Option } = Select

const UserModal = ({
  visible,
  onOk,
  onCancel,
  editingUser,
  isView,
  confirmLoading,
  title,
  statusOptions,
}) => {
  const { t } = useTranslation()
  const [isEdit, setIsEdit] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (visible) {
      const formData = {
        ...editingUser,
        role: editingUser?.roleName || editingUser?.role,
        dob: editingUser?.dob ? dayjs(editingUser.dob) : null,
      }
      form.setFieldsValue(formData)
    } else {
      form.resetFields()
    }
  }, [visible, editingUser, form])

  return (
    <Modal
      open={visible}
      title={
        title ||
        (isView
          ? isEdit
            ? t('userModal.editTitle')
            : t('userModal.viewTitle')
          : t('userModal.addTitle'))
      }
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            const submitData = {
              ...values,
              dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
            }
            onOk(submitData, isEdit)
          })
          .catch(error => {
            console.error('Form validation failed:', error)
          })
      }}
      okButtonProps={{
        hidden: isView && !isEdit,
      }}
      onCancel={onCancel}
      cancelButtonProps={{
        hidden: isView && !isEdit,
        danger: true,
      }}
      confirmLoading={confirmLoading}
      centered
    >
      <Form form={form} layout="vertical" disabled={isView && !isEdit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="fullName"
            label={t('userModal.form.fullName')}
            rules={[
              {
                required: true,
                message: t('userModal.validation.fullNameRequired'),
              },
            ]}
          >
            <Input placeholder={t('userModal.placeholder.fullName')} />
          </Form.Item>

          <Form.Item
            name="email"
            label={t('userModal.form.email')}
            rules={[
              {
                required: true,
                message: t('userModal.validation.emailRequired'),
              },
              {
                type: 'email',
                message: t('userModal.validation.emailInvalid'),
              },
            ]}
          >
            <Input placeholder={t('userModal.placeholder.email')} />
          </Form.Item>
        </div>

        {!editingUser && (
          <Form.Item
            name="password"
            label={t('userModal.form.password')}
            rules={[
              {
                required: true,
                message: t('userModal.validation.passwordRequired'),
              },
              { min: 6, message: t('userModal.validation.passwordMinLength') },
            ]}
          >
            <Input.Password placeholder={t('userModal.placeholder.password')} />
          </Form.Item>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="phoneNumber"
            label={t('userModal.form.phone')}
            rules={[
              {
                required: true,
                message: t('userModal.validation.phoneRequired'),
              },
              {
                pattern: /^[0-9+\-\s()]+$/,
                message: t('userModal.validation.phoneInvalid'),
              },
            ]}
          >
            <Input placeholder={t('userModal.placeholder.phone')} />
          </Form.Item>

          <Form.Item
            name="dob"
            label={t('userModal.form.dob')}
            rules={[
              {
                required: true,
                message: t('userModal.validation.dobRequired'),
              },
            ]}
          >
            <DatePicker
              className="w-full"
              placeholder={t('userModal.placeholder.dob')}
              format="YYYY-MM-DD"
              disabledDate={current =>
                current && current > dayjs().endOf('day')
              }
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="gender"
            label={t('userModal.form.gender')}
            rules={[
              {
                required: true,
                message: t('userModal.validation.genderRequired'),
              },
            ]}
          >
            <Radio.Group>
              <Radio value={true}>{t('userModal.genderOptions.male')}</Radio>
              <Radio value={false}>{t('userModal.genderOptions.female')}</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="role"
            label={t('userModal.form.role')}
            rules={[
              {
                required: true,
                message: t('userModal.validation.roleRequired'),
              },
            ]}
          >
            <Select placeholder={t('userModal.placeholder.role')}>
              {[
                { value: 'STUDENT', label: t('userModal.roleOptions.student') },
                { value: 'PARENTS', label: t('userModal.roleOptions.parents') },
                { value: 'TEACHER', label: t('userModal.roleOptions.teacher') },
                {
                  value: 'COUNSELOR',
                  label: t('userModal.roleOptions.counselor'),
                },
              ].map(opt => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          name="status"
          label={t('userModal.form.status')}
          rules={[
            {
              required: true,
              message: t('userModal.validation.statusRequired'),
            },
          ]}
        >
          <Select placeholder={t('userModal.placeholder.status')}>
            {(
              statusOptions || [
                { value: true, label: t('userModal.statusOptions.active') },
                { value: false, label: t('userModal.statusOptions.inactive') },
              ]
            ).map(opt => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {isView && (
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={onCancel}>{t('common.close')}</Button>
            <Button type="primary" onClick={() => setIsEdit(true)}>
              {t('common.edit')}
            </Button>
          </div>
        )}
      </Form>
    </Modal>
  )
}

export default React.memo(UserModal)
