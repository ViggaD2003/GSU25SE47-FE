import React, { useEffect, useMemo, useState } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Radio,
  Button,
  Divider,
  Tag,
  Space,
  message,
} from 'antd'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { accountAPI } from '../../../services/accountApi'

const { Option } = Select

const MAX_CHILDREN = 2

const UserModal = ({
  visible,
  onOk,
  onCancel,
  editingUser,
  isView,
  confirmLoading,
  title,
  statusOptions,
  students = [],
  updateAccounts,
}) => {
  const { t } = useTranslation()
  const [isEdit, setIsEdit] = useState(false)
  const [form] = Form.useForm()
  const [linkChildIds, setLinkChildIds] = useState([])
  const [unlinkChildIds, setUnlinkChildIds] = useState([])
  const [relationType, setRelationType] = useState('PARENT')
  const [relLoading, setRelLoading] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    if (visible) {
      const formData = {
        ...editingUser,
        role: editingUser?.roleName || editingUser?.role,
        dob: editingUser?.dob ? dayjs(editingUser.dob) : null,
      }
      form.setFieldsValue(formData)
      // Prefill relation type default
      setRelationType('PARENT')
    } else {
      form.resetFields()
      setLinkChildIds([])
      setUnlinkChildIds([])
    }
  }, [visible, editingUser, form])

  const currentChildren = useMemo(
    () => editingUser?.student || [],
    [editingUser]
  )
  const currentChildrenCount = currentChildren?.length || 0
  const canAddCount = Math.max(0, MAX_CHILDREN - currentChildrenCount)

  const studentOptions = useMemo(
    () =>
      (students || []).map(s => ({
        label: s.fullName
          ? `${s.studentCode} - ${s.fullName} (${s.email})`
          : s.email,
        value: s.id,
        disabled: currentChildren?.some(c => c?.id === s.id),
      })),
    [students, currentChildren]
  )

  const filteredStudentOptions = useMemo(() => {
    return (studentOptions || []).filter(opt =>
      String(opt.label || '')
        .toLowerCase()
        .includes(String(searchValue || '').toLowerCase())
    )
  }, [studentOptions, searchValue])

  const currentChildOptions = useMemo(
    () =>
      (currentChildren || []).map(c => ({
        label: c.fullName
          ? `${c.studentCode} - ${c.fullName} (${c.email})`
          : c.email,
        value: c.id,
      })),
    [currentChildren]
  )

  const handleLink = async () => {
    if (!editingUser?.id) return
    if (!linkChildIds?.length) {
      message.warning(t('userModal.relations.message.linkRequired'))
      return
    }
    if (linkChildIds.length > canAddCount) {
      message.warning(
        t('userModal.relations.message.linkMax', { max: canAddCount })
      )
      return
    }
    setRelLoading(true)
    try {
      await accountAPI.linkRelationship({
        parentId: editingUser.id,
        childIds: linkChildIds,
        type: relationType,
      })
      message.success(t('userModal.relations.message.linkSuccess'))
      setLinkChildIds([])
      // Find the student objects corresponding to the linked IDs
      const linkedStudents = students.filter(s => linkChildIds.includes(s.id))
      updateAccounts(editingUser.id, {
        student: [...currentChildren, ...linkedStudents],
      })
    } catch {
      message.error(t('userModal.relations.message.linkError'))
    } finally {
      setRelLoading(false)
    }
  }

  const handleUnlink = async () => {
    if (!editingUser?.id) return
    if (!unlinkChildIds?.length) {
      message.warning(t('userModal.relations.message.unlinkRequired'))
      return
    }
    setRelLoading(true)
    try {
      await accountAPI.removeRelationship({
        parentId: editingUser.id,
        childIds: unlinkChildIds,
      })
      message.success(t('userModal.relations.message.unlinkSuccess'))
      setUnlinkChildIds([])
      updateAccounts(editingUser.id, {
        student: currentChildren.filter(c => !unlinkChildIds.includes(c.id)),
      })
    } catch {
      message.error(t('userModal.relations.message.unlinkError'))
    } finally {
      setRelLoading(false)
    }
  }

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
      okButtonProps={{
        hidden: isView || isEdit,
      }}
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
      onCancel={onCancel}
      cancelButtonProps={{
        hidden: isView && !isEdit,
        danger: true,
      }}
      confirmLoading={confirmLoading}
      centered
      width={1200}
      styles={{
        body: {
          maxHeight: '75vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '16px 24px',
        },
      }}
    >
      <Form form={form} layout="vertical" disabled={isView}>
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

        {(form.getFieldValue('role') === 'PARENTS' ||
          editingUser?.roleName === 'PARENTS') && (
          <div className="mt-2">
            <Divider orientation="left">
              {t('userModal.relations.title', { max: MAX_CHILDREN })}
            </Divider>
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-sm mb-1">
                  {t('userModal.relations.linked')}
                </div>
                <Space size={[8, 8]} wrap>
                  {(currentChildren || []).length === 0 && (
                    <span className="text-gray-400">
                      {t('userModal.relations.noChildren')}
                    </span>
                  )}
                  {(currentChildren || []).map(child => (
                    <Tag key={child.id}>{child.fullName || child.email}</Tag>
                  ))}
                </Space>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="text-sm">
                    {t('userModal.relations.selectChildren')}
                  </div>
                  <Select
                    mode="multiple"
                    placeholder={t('userModal.relations.selectMax', {
                      max: canAddCount,
                    })}
                    value={linkChildIds}
                    onChange={setLinkChildIds}
                    options={filteredStudentOptions}
                    showSearch
                    filterOption={false}
                    allowClear
                    searchValue={searchValue}
                    onSearch={setSearchValue}
                    maxCount={canAddCount}
                    disabled={
                      (isView && !isEdit) ||
                      currentChildrenCount >= MAX_CHILDREN
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-sm">
                    {t('userModal.relations.relation')}
                  </div>
                  <Radio.Group
                    value={relationType}
                    onChange={e => setRelationType(e.target.value)}
                    disabled={isView && !isEdit}
                  >
                    <Radio value="PARENT">
                      {t('userModal.relations.parent')}
                    </Radio>
                    <Radio value="GUARDIAN">
                      {t('userModal.relations.guardian')}
                    </Radio>
                  </Radio.Group>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="primary"
                  onClick={handleLink}
                  loading={relLoading}
                  disabled={
                    (isView && !isEdit) || currentChildrenCount >= MAX_CHILDREN
                  }
                >
                  {t('userModal.relations.link')}
                </Button>
              </div>

              <Divider className="my-2" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="flex flex-col gap-2">
                  <div className="text-sm">
                    {t('userModal.relations.selectChildren')}
                  </div>
                  <Select
                    mode="multiple"
                    placeholder={t('userModal.relations.selectChildren')}
                    value={unlinkChildIds}
                    onChange={setUnlinkChildIds}
                    options={currentChildOptions}
                    maxTagCount={2}
                    disabled={isView && !isEdit}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    danger
                    onClick={handleUnlink}
                    loading={relLoading}
                    disabled={isView && !isEdit}
                  >
                    {t('userModal.relations.unlink')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* {isView && (
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={onCancel}>{t('common.close')}</Button>
            <Button type="primary" onClick={() => setIsEdit(true)}>
              {t('common.edit')}
            </Button>
          </div>
        )} */}
      </Form>
      {isView && !isEdit && (
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>{t('common.close')}</Button>
          <Button type="primary" onClick={() => setIsEdit(true)}>
            {t('common.edit')}
          </Button>
        </div>
      )}
    </Modal>
  )
}

export default React.memo(UserModal)
