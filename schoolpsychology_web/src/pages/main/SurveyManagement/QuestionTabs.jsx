import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  Form,
  Input,
  Checkbox,
  Button,
  Select,
  Row,
  Col,
  Space,
  InputNumber,
  Tabs,
} from 'antd'
import { useTranslation } from 'react-i18next'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'

const { Option } = Select

const QuestionTabs = ({ fields, add, remove, surveyCode }) => {
  const { t } = useTranslation()
  const [activeKey, setActiveKey] = useState()
  const prevFieldsLength = useRef(0)
  const isInitialized = useRef(false)

  // Check if current survey code has limited questions and forces required
  const isLimitedSurvey = surveyCode === 'GAD-7' || surveyCode === 'PHQ-9'

  useEffect(() => {
    if (!isInitialized.current && fields.length === 0) {
      addQuestion()
      isInitialized.current = true
    }
  }, [fields.length, add])

  useEffect(() => {
    if (fields.length > prevFieldsLength.current) {
      const newKey = fields[fields.length - 1].key.toString()
      setActiveKey(newKey)
    }
    prevFieldsLength.current = fields.length
  }, [fields])

  useEffect(() => {
    if (fields.length > 0 && !activeKey) {
      setActiveKey(fields[0].key.toString())
    }
  }, [fields, activeKey])

  const addQuestion = useCallback(() => {
    add({
      required: true, // Always default to required
      questionType: 'LINKERT_SCALE',
      answers: [
        { text: '', score: 0 },
        { text: '', score: 1 },
        { text: '', score: 2 },
        { text: '', score: 3 },
      ],
    })
  }, [add])

  const removeQuestion = targetKey => {
    const index = fields.findIndex(field => field.key.toString() === targetKey)
    if (index > -1) {
      if (activeKey === targetKey) {
        if (fields.length > 1) {
          const newIndex = index > 0 ? index - 1 : 0
          setActiveKey(fields[newIndex].key.toString())
        } else {
          setActiveKey(undefined)
        }
      }
      remove(index)
    }
  }

  const onEdit = (targetKey, action) => {
    if (action === 'add') {
      addQuestion()
    } else if (action === 'remove') {
      removeQuestion(targetKey)
    }
  }

  const items = useMemo(() => {
    return fields.map(({ key, name, ...restField }, index) => ({
      label: `${t('surveyManagement.form.question')} ${index + 1}`,
      key: key.toString(),
      children: (
        <div className="px-5">
          <Row gutter={16} align={'bottom'}>
            <Col span={16}>
              <Form.Item
                {...restField}
                name={[name, 'text']}
                label={'Question'}
                rules={[
                  {
                    required: true,
                    message: 'Question text is required',
                  },
                ]}
              >
                <Input placeholder="Question Text" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                {...restField}
                name={[name, 'required']}
                valuePropName="checked"
                initialValue={isLimitedSurvey ? true : undefined}
              >
                <Checkbox disabled={isLimitedSurvey}>
                  Required
                  {isLimitedSurvey && (
                    <span
                      style={{
                        color: '#666',
                        fontSize: '12px',
                        marginLeft: '8px',
                      }}
                    >
                      (Bắt buộc cho {surveyCode})
                    </span>
                  )}
                </Checkbox>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            {...restField}
            name={[name, 'description']}
            label="Description"
          >
            <Input placeholder="Question Description" />
          </Form.Item>
          <Form.Item
            {...restField}
            name={[name, 'questionType']}
            label="Question Type"
          >
            <Select>
              <Option value="LINKERT_SCALE">Linkert Scale</Option>
              <Option value="MULTIPLE_CHOICE">Multiple Choice</Option>
              <Option value="TEXT">Text</Option>
            </Select>
          </Form.Item>
          <>
            <Form.Item
              {...restField}
              hidden
              name={[name, 'moduleType']}
              label="Module Type"
              initialValue="SURVEY"
            >
              <Input disabled />
            </Form.Item>
          </>

          <div>
            <Form.List name={[name, 'answers']}>
              {(answerFields, { add: addAnswer, remove: removeAnswer }) => (
                <>
                  <Row gutter={16}>
                    {answerFields.map(
                      ({
                        key: answerKey,
                        name: answerName,
                        ...restAnswerField
                      }) => (
                        <Space
                          key={answerKey}
                          style={{
                            display: 'flex',
                            marginBottom: 8,
                            marginLeft: 10,
                          }}
                          align="baseline"
                        >
                          <Form.Item
                            {...restAnswerField}
                            name={[answerName, 'text']}
                            rules={[
                              {
                                required: true,
                                message: 'Answer text is required',
                              },
                            ]}
                          >
                            <Input placeholder="Answer Text" />
                          </Form.Item>
                          <Form.Item
                            {...restAnswerField}
                            name={[answerName, 'score']}
                            rules={[
                              {
                                required: true,
                                message: 'Score is required',
                              },
                            ]}
                          >
                            <InputNumber
                              placeholder="Score"
                              style={{ width: 50 }}
                            />
                          </Form.Item>
                          <MinusCircleOutlined
                            style={{ color: 'red' }}
                            onClick={() => removeAnswer(answerName)}
                          />
                        </Space>
                      )
                    )}
                  </Row>
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => addAnswer()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Answer
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>
        </div>
      ),
    }))
  }, [fields, t, isLimitedSurvey, surveyCode])

  return (
    <Tabs
      type="editable-card"
      onChange={setActiveKey}
      activeKey={activeKey}
      onEdit={onEdit}
      items={items}
    />
  )
}

export default QuestionTabs
