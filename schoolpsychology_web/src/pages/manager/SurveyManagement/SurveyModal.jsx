import React from 'react'
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Checkbox,
  Button,
  Select,
  Row,
  Col,
  InputNumber,
  Typography,
} from 'antd'
import { useTranslation } from 'react-i18next'
import QuestionTabs from './QuestionTabs'

const { TextArea } = Input
const { Option } = Select
const { Title } = Typography

const SurveyModal = ({ visible, onCancel, onOk }) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()

  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
        onOk(values)
        form.resetFields()
      })
      .catch(info => {
        console.log('Validate Failed:', info)
      })
  }

  return (
    <Modal
      title={t('surveyManagement.addSurvey')}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={1300}
      okText={t('common.create')}
      cancelText={t('common.cancel')}
      cancelButtonProps={{
        style: {
          color: 'red',
          borderColor: 'red',
        },
      }}
      style={{ height: '70vh', top: '8%' }}
    >
      <Form form={form} layout="vertical" name="surveyForm">
        <Row gutter={24}>
          {/* Survey Info Column (Left) */}
          <Col span={11}>
            <Title level={5}>Survey Information</Title>
            <Form.Item
              name="name"
              label={t('surveyManagement.form.name')}
              rules={[
                {
                  required: true,
                  message: t('surveyManagement.form.nameRequired'),
                },
              ]}
            >
              <Input placeholder={t('surveyManagement.form.namePlaceholder')} />
            </Form.Item>

            <Form.Item
              name="description"
              label={t('surveyManagement.form.description')}
            >
              <TextArea
                rows={3}
                placeholder={t('surveyManagement.form.descriptionPlaceholder')}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="isRequired" valuePropName="checked">
                  <Checkbox>{t('surveyManagement.form.isRequired')}</Checkbox>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="isRecurring" valuePropName="checked">
                  <Checkbox>{t('surveyManagement.form.isRecurring')}</Checkbox>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.isRecurring !== currentValues.isRecurring
              }
            >
              {({ getFieldValue }) =>
                getFieldValue('isRecurring') ? (
                  <Form.Item
                    name="recurringCycle"
                    label={t('surveyManagement.form.recurringCycle')}
                    rules={[
                      {
                        required: true,
                        message: t(
                          'surveyManagement.form.recurringCycleRequired'
                        ),
                      },
                    ]}
                  >
                    <Select
                      defaultValue={'DAILY'}
                      placeholder={t(
                        'surveyManagement.form.recurringCyclePlaceholder'
                      )}
                    >
                      <Option value="DAILY">{t('common.daily')}</Option>
                      <Option value="WEEKLY">{t('common.weekly')}</Option>
                      <Option value="MONTHLY">{t('common.monthly')}</Option>
                    </Select>
                  </Form.Item>
                ) : null
              }
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="startDate"
                  label={t('surveyManagement.form.startDate')}
                  rules={[
                    {
                      required: true,
                      message: t('surveyManagement.form.startDateRequired'),
                    },
                  ]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endDate"
                  label={t('surveyManagement.form.endDate')}
                  rules={[
                    {
                      required: true,
                      message: t('surveyManagement.form.endDateRequired'),
                    },
                  ]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          {/* Questions Column (Right) */}
          <Col span={13}>
            <Title level={5}>{t('surveyManagement.form.questions')}</Title>
            <div
              style={{
                height: 'calc(70vh - 40px)',
                overflowY: 'auto',
                padding: '0 1px',
              }}
            >
              <Form.List name="questions">
                {(fields, { add, remove }) => (
                  <QuestionTabs fields={fields} add={add} remove={remove} />
                )}
              </Form.List>
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default SurveyModal
