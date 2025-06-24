import React from 'react'
import {
  Modal,
  Typography,
  Divider,
  List,
  Tag,
  Space,
  Descriptions,
  Card,
} from 'antd'

const SurveyDetailModal = ({ visible, survey, onClose }) => {
  if (!survey) return null

  return (
    <Modal
      open={visible}
      title={<span style={{ fontWeight: 600 }}>{survey.name}</span>}
      onCancel={onClose}
      footer={null}
      width={1000}
      // bodyProps={{ style: { height: '80vh' } }}
      style={{ top: '5%' }}
    >
      <div className="flex flex-col h-[80vh]">
        <div>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Mô tả" span={2}>
              {survey.description}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  survey.status === 'COMPLETED'
                    ? 'green'
                    : survey.status === 'PENDING'
                      ? 'orange'
                      : 'red'
                }
              >
                {survey.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Bắt đầu">
              {survey.startDate}
            </Descriptions.Item>
            <Descriptions.Item label="Kết thúc">
              {survey.endDate}
            </Descriptions.Item>
            <Descriptions.Item label="Lặp lại" span={2}>
              {survey.isRecurring ? survey.recurringCycle : 'Không'}
            </Descriptions.Item>
            <Descriptions.Item label="Bắt buộc" span={2}>
              {survey.isRequired ? 'Có' : 'Không'}
            </Descriptions.Item>
          </Descriptions>
          <Divider orientation="left" style={{ fontWeight: 600 }}>
            Danh sách câu hỏi
          </Divider>
        </div>
        <div className="h-full" style={{ overflowY: 'auto', marginBottom: 16 }}>
          <List
            style={{ height: 2 }}
            dataSource={survey.questions}
            renderItem={q => (
              <Card
                key={q.questionId}
                style={{ marginBottom: 16, borderRadius: 8 }}
                type="inner"
                title={
                  <Space>
                    <b>{q.text}</b>
                    {q.required && <Tag color="red">Bắt buộc</Tag>}
                  </Space>
                }
                extra={<Tag>{q.category?.name}</Tag>}
              >
                <Typography.Text type="secondary">
                  {q.description}
                </Typography.Text>
                <List
                  size="small"
                  dataSource={q.answers}
                  style={{ marginTop: 8 }}
                  renderItem={a => (
                    <List.Item style={{ paddingLeft: 16 }}>
                      <Space>
                        <Tag color="blue">{a.score}</Tag>
                        {a.text}
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            )}
          />
        </div>
      </div>
    </Modal>
  )
}

export default SurveyDetailModal
