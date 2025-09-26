import React, { useEffect, useState } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Descriptions,
  Button,
  Space,
  Switch,
} from 'antd'
import { useTranslation } from 'react-i18next'
import { categoriesAPI } from '@/services/categoryApi'

const { TextArea } = Input
const { Option } = Select

const CaseModal = ({
  user,
  categories = [],
  visible,
  onCancel,
  onSubmit,
  student,
  confirmLoading,
}) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [levelOptions, setLevelOptions] = useState([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [formData, setFormData] = useState(null)
  const initialLevelId = student?.latestSurveyRecord?.level?.id
  const initCategoryId = student?.latestSurveyRecord?.survey?.category?.id

  const fetchLevelOptions = async () => {
    const data = await categoriesAPI.getCategoryLevels(selectedCategoryId)
    setLevelOptions(data)
    form.setFieldValue('levelId', data[0]?.id)
  }

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedCategoryId(categories[0]?.id)
    }
  }, [categories])

  useEffect(() => {
    if (selectedCategoryId) {
      fetchLevelOptions(selectedCategoryId)
    }
  }, [selectedCategoryId, categories])

  useEffect(() => {
    if (visible) {
      if (student) {
        if (initialLevelId) {
          form.setFieldsValue({
            progressTrend: 'DECLINED',
            currentLevelId: initialLevelId || undefined,
            initialLevelId: initialLevelId || undefined,
          })
        }
      } else {
        form.resetFields()
        form.setFieldsValue({
          progressTrend: 'DECLINED',
        })
      }
    }
  }, [visible, student, form])

  const surveyRecord = student?.latestSurveyRecord

  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
        // Lưu form data để hiển thị trong modal xác nhận
        setFormData({ ...values, progressTrend: 'DECLINED' })
        setShowConfirmModal(true)
      })
      .catch(info => {
        console.log('Validate Failed:', info)
      })
  }

  const handleConfirmSave = async () => {
    const requestData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      progressTrend: 'DECLINED',
      studentId: student.id,
      createBy: user.id || user.teacherId,
      currentLevelId: formData.levelId || initialLevelId,
      initialLevelId: formData.levelId || initialLevelId,
      notify: Boolean(formData.notify),
    }
    // console.log(student)
    onSubmit(requestData, setFormData, setShowConfirmModal, form)
  }

  const handleCancelConfirm = () => {
    setFormData(null)
    setShowConfirmModal(false)
  }

  const handleCancel = () => {
    form.resetFields()
    setShowConfirmModal(false)
    setFormData(null)
    onCancel()
  }

  const handleCategoryChange = value => {
    setSelectedCategoryId(value)
  }

  // Hàm lấy tên category từ ID
  const getCategoryName = categoryId => {
    const category = categories.find(cat => cat.id === categoryId)
    return category?.name || ''
  }

  // Hàm lấy tên level từ ID
  const getLevelName = levelId => {
    const level = levelOptions.find(lvl => lvl.id === levelId)
    return level ? `${level.code} - ${level.description}` : ''
  }

  return (
    <>
      <Modal
        title={t('caseManagement.createCase')}
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        okText={t('caseManagement.form.save')}
        cancelText={t('caseManagement.form.cancel')}
        width={900}
        centered
      >
        <Form form={form} layout="vertical" name="caseForm">
          <Form.Item
            name="title"
            label={t('caseManagement.form.title')}
            rules={[
              {
                required: true,
                message: t('caseManagement.form.titleRequired'),
              },
            ]}
          >
            <Input placeholder={t('caseManagement.form.titlePlaceholder')} />
          </Form.Item>

          <Form.Item
            name="description"
            label={t('caseManagement.form.description')}
            rules={[
              {
                required: true,
                message: t('caseManagement.form.descriptionRequired'),
              },
            ]}
          >
            <TextArea
              rows={3}
              placeholder={t('caseManagement.form.descriptionPlaceholder')}
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label={t('caseManagement.form.priority')}
            rules={[
              {
                required: true,
                message: t('caseManagement.form.priorityRequired'),
              },
            ]}
          >
            <Select placeholder={t('caseManagement.form.priorityPlaceholder')}>
              <Option value="HIGH">
                {t('caseManagement.priorityOptions.HIGH')}
              </Option>
              <Option value="MEDIUM">
                {t('caseManagement.priorityOptions.MEDIUM')}
              </Option>
              <Option value="LOW">
                {t('caseManagement.priorityOptions.LOW')}
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="categoryId"
            label={t('caseManagement.form.category')}
            initialValue={initCategoryId || categories[0]?.id}
            rules={[
              {
                required: !surveyRecord,
                message: t('caseManagement.form.categoryRequired'),
              },
            ]}
          >
            <Select
              placeholder={t('caseManagement.form.categoryPlaceholder')}
              onChange={handleCategoryChange}
            >
              {categories?.map(category => (
                <Option key={category?.id} value={category?.id}>
                  {category?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="levelId"
            label={t('caseManagement.form.level')}
            disabled={!selectedCategoryId}
            initialValue={initialLevelId || levelOptions[0]?.id}
            rules={[
              {
                required: !surveyRecord,
                message: t('caseManagement.form.levelRequired'),
              },
            ]}
          >
            <Select placeholder={t('caseManagement.form.levelPlaceholder')}>
              {levelOptions?.map(level => (
                <Option key={level?.id} value={level?.id}>
                  {level?.code} - {level?.description}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="notify"
            label={t('caseManagement.form.notifyParents')}
            initialValue={true}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xác nhận thông tin */}
      <Modal
        title={t('caseManagement.confirmModal.title')}
        open={showConfirmModal}
        onCancel={handleCancelConfirm}
        footer={[
          <Button key="cancel" onClick={handleCancelConfirm}>
            {t('caseManagement.form.cancel')}
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={handleConfirmSave}
            loading={confirmLoading}
          >
            {t('caseManagement.form.save')}
          </Button>,
        ]}
        width={700}
        centered
      >
        <div style={{ marginBottom: 16, color: '#666' }}>
          {t('caseManagement.confirmModal.confirmMessage')}
        </div>
        {formData && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label={t('caseManagement.form.title')}>
              {formData.title}
            </Descriptions.Item>
            <Descriptions.Item label={t('caseManagement.form.description')}>
              {formData.description}
            </Descriptions.Item>
            <Descriptions.Item label={t('caseManagement.form.priority')}>
              {t(`caseManagement.priorityOptions.${formData.priority}`)}
            </Descriptions.Item>
            {formData.categoryId && (
              <Descriptions.Item label={t('caseManagement.form.category')}>
                {getCategoryName(formData.categoryId)}
              </Descriptions.Item>
            )}
            {formData.levelId && (
              <Descriptions.Item
                label={t('caseManagement.form.initialLevelId')}
              >
                {getLevelName(formData.levelId)}
              </Descriptions.Item>
            )}
            <Descriptions.Item label={t('caseManagement.form.notifyParents')}>
              {formData.notify ? t('common.yes') : t('common.no')}
            </Descriptions.Item>
            <Descriptions.Item label={t('caseManagement.confirmModal.student')}>
              {student?.fullName || student?.name || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label={t('caseManagement.confirmModal.creator')}>
              {user?.fullName || user?.name || 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  )
}

export default CaseModal
