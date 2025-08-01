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
  editingCase,
  confirmLoading,
}) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [levelOptions, setLevelOptions] = useState([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [formData, setFormData] = useState(null)

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
      if (editingCase) {
        form.setFieldsValue({
          title: editingCase.title || '',
          description: editingCase.description || '',
          priority: editingCase.priority || 'MEDIUM',
          progressTrend: editingCase.progressTrend || 'STABLE',
          currentLevelId: editingCase.currentLevelId || undefined,
          initialLevelId: editingCase.initialLevelId || undefined,
        })
      } else {
        form.resetFields()
        form.setFieldsValue({
          priority: 'MEDIUM',
          progressTrend: 'STABLE',
        })
      }
    }
  }, [visible, editingCase, form])
  //   console.log(editingCase)
  //   console.log(user)

  const surveyRecord = editingCase?.latestSurveyRecord

  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
        // Lưu form data để hiển thị trong modal xác nhận
        setFormData(values)
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
      progressTrend: formData.progressTrend,
      studentId: editingCase.id,
      createBy: user.id || user.teacherId,
      currentLevelId: formData.levelId || surveyRecord?.level?.id,
      initialLevelId: formData.levelId || surveyRecord?.level?.id,
    }
    // console.log(requestData)
    setShowConfirmModal(false)
    setFormData(null)
    onSubmit(requestData)
  }

  const handleCancelConfirm = () => {
    setShowConfirmModal(false)
    setFormData(null)
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
        title={
          editingCase
            ? t('caseManagement.editCase')
            : t('caseManagement.createCase')
        }
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        okText={t('caseManagement.form.save')}
        cancelText={t('caseManagement.form.cancel')}
        width={900}
        style={{ top: '5%' }}
        styles={{ body: { maxHeight: '80vh' } }}
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
            name="progressTrend"
            label={t('caseManagement.form.progressTrend')}
            rules={[
              {
                required: true,
                message: t('caseManagement.form.progressTrendRequired'),
              },
            ]}
          >
            <Select
              placeholder={t('caseManagement.form.progressTrendPlaceholder')}
            >
              <Option value="IMPROVED">
                {t('caseManagement.progressTrendOptions.IMPROVED')}
              </Option>
              <Option value="STABLE">
                {t('caseManagement.progressTrendOptions.STABLE')}
              </Option>
              <Option value="DECLINED">
                {t('caseManagement.progressTrendOptions.DECLINED')}
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="categoryId"
            label={t('caseManagement.form.category')}
            initialValue={categories[0]?.id}
            rules={[
              {
                required: !surveyRecord,
                message: t('caseManagement.form.categoryRequired'),
              },
            ]}
          >
            {!surveyRecord ? (
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
            ) : (
              <Input value={surveyRecord?.survey?.category?.name} disabled />
            )}
          </Form.Item>

          <Form.Item
            name="levelId"
            label={t('caseManagement.form.level')}
            disabled={!selectedCategoryId}
            rules={[
              {
                required: !surveyRecord,
                message: t('caseManagement.form.levelRequired'),
              },
            ]}
          >
            {!surveyRecord ? (
              <Select placeholder={t('caseManagement.form.levelPlaceholder')}>
                {levelOptions?.map(level => (
                  <Option key={level?.id} value={level?.id}>
                    {level?.code} - {level?.description}
                  </Option>
                ))}
              </Select>
            ) : (
              <Input value={surveyRecord?.level?.code} disabled />
            )}
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
            <Descriptions.Item label={t('caseManagement.form.progressTrend')}>
              {t(
                `caseManagement.progressTrendOptions.${formData.progressTrend}`
              )}
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
            <Descriptions.Item label={t('caseManagement.confirmModal.student')}>
              {editingCase?.fullName || editingCase?.name || 'N/A'}
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
