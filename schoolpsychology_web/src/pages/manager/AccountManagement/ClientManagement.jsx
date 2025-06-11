import React, { useState } from 'react'
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Avatar,
  Modal,
  Form,
  message,
  Row,
  Col,
  Typography,
  Dropdown,
  Divider,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ReloadOutlined,
  BlockOutlined,
} from '@ant-design/icons'
import { useTheme } from '../../../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'

const { Title, Text } = Typography
const { Option } = Select
const { Search } = Input

const ClientManagement = () => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form] = Form.useForm()

  // Mock data - replace with actual API calls
  const [users, setUsers] = useState([
    {
      id: 1,
      fullName: 'Nguyen Van A',
      email: 'nguyenvana@school.edu.vn',
      phone: '+84 123 456 789',
      role: 'Student',
      status: 'Active',
      createDate: '15/01/2024',
      lastLogin: '25/05/2024',
    },
    {
      id: 2,
      fullName: 'Nguyen Van A',
      email: 'nguyenvana2@school.edu.vn',
      phone: '+84 123 456 790',
      role: 'Student',
      status: 'Active',
      createDate: '15/01/2024',
      lastLogin: '25/05/2024',
    },
    {
      id: 3,
      fullName: 'Nguyen Van A',
      email: 'nguyenvana3@school.edu.vn',
      phone: '+84 123 456 791',
      role: 'Faculty',
      status: 'Active',
      createDate: '15/01/2024',
      lastLogin: '25/05/2024',
    },
    {
      id: 4,
      fullName: 'Nguyen Van A',
      email: 'nguyenvana4@school.edu.vn',
      phone: '+84 123 456 792',
      role: 'Student',
      status: 'Active',
      createDate: '15/01/2024',
      lastLogin: '25/05/2024',
    },
    {
      id: 5,
      fullName: 'Nguyen Van A',
      email: 'nguyenvana5@school.edu.vn',
      phone: '+84 123 456 793',
      role: 'Student',
      status: 'Active',
      createDate: '15/01/2024',
      lastLogin: '25/05/2024',
    },
  ])

  const handleSearch = value => {
    setSearchText(value)
  }

  const handleView = record => {
    Modal.info({
      title: 'User Details',
      width: 600,
      content: (
        <div className="space-y-4 mt-4">
          <div className="flex items-center space-x-4">
            <Avatar size={64} icon={<UserOutlined />} />
            <div>
              <h3 className="text-lg font-semibold">{record.fullName}</h3>
              <p className="text-gray-600">{record.email}</p>
            </div>
          </div>
          <Divider />
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>Role:</Text>
              <br />
              <Tag color={record.role === 'Faculty' ? 'purple' : 'blue'}>
                {record.role}
              </Tag>
            </Col>
            <Col span={12}>
              <Text strong>Status:</Text>
              <br />
              <Tag color="green">{record.status}</Tag>
            </Col>
            <Col span={12}>
              <Text strong>Phone:</Text>
              <br />
              <Text>{record.phone}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Department:</Text>
              <br />
              <Text>{record.department}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Create Date:</Text>
              <br />
              <Text>{record.createDate}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Last Login:</Text>
              <br />
              <Text>{record.lastLogin}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Login Count:</Text>
              <br />
              <Text>{record.loginCount} times</Text>
            </Col>
          </Row>
        </div>
      ),
    })
  }

  const handleEdit = record => {
    setEditingUser(record)
    form.setFieldsValue(record)
    setIsModalVisible(true)
  }

  const handleDelete = record => {
    Modal.confirm({
      title: t('clientManagement.inactiveTitle'),
      content: t('clientManagement.inactiveContent'),
      okText: t('clientManagement.inactiveConfirm'),
      okType: 'danger',
      cancelText: t('clientManagement.inactiveCancel'),
      onOk() {
        setUsers(users.filter(user => user.id !== record.id))
        message.success(t('clientManagement.inactiveSuccess'))
      },
    })
  }

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingUser) {
        // Update existing user
        setUsers(
          users.map(user =>
            user.id === editingUser.id ? { ...user, ...values } : user
          )
        )
        message.success(t('clientManagement.editUserSuccess'))
      } else {
        // Create new user
        const newUser = {
          id: users.length + 1,
          ...values,
          createDate: new Date().toLocaleDateString('en-GB'),
          lastLogin: 'Never',
          loginCount: 0,
        }
        setUsers([...users, newUser])
        message.success(t('clientManagement.addUserSuccess'))
      }
      setIsModalVisible(false)
      setEditingUser(null)
      form.resetFields()
    })
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    setEditingUser(null)
    form.resetFields()
  }

  const moreActions = record => ({
    items: [
      {
        key: 'view',
        label: t('clientManagement.viewDetails'),
        icon: <EyeOutlined />,
        onClick: () => handleView(record),
      },
      {
        key: 'edit',
        label: t('clientManagement.editUser'),
        icon: <EditOutlined />,
        onClick: () => handleEdit(record),
      },
      {
        type: 'divider',
      },
      {
        key: 'inactive',
        label: t('clientManagement.inactiveUser'),
        icon: <BlockOutlined />,
        danger: true,
        onClick: () => handleDelete(record),
      },
    ],
  })

  const columns = [
    {
      title: t('clientManagement.user'),
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => (
        <div className="flex items-center space-x-3">
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: t('clientManagement.role'),
      dataIndex: 'role',
      key: 'role',
      render: role => (
        <Tag color={role === 'Student' ? 'blue' : 'purple'}>
          {role === 'Student'
            ? t('clientManagement.student')
            : t('clientManagement.parent')}
        </Tag>
      ),
      filters: [
        { text: t('clientManagement.student'), value: 'Student' },
        { text: t('clientManagement.parent'), value: 'Parent' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: t('clientManagement.status'),
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      ),
      filters: [
        { text: t('clientManagement.active'), value: 'Active' },
        { text: t('clientManagement.inactive'), value: 'Inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: t('clientManagement.createDate'),
      dataIndex: 'createDate',
      key: 'createDate',
      sorter: (a, b) =>
        new Date(a.createDate.split('/').reverse().join('-')) -
        new Date(b.createDate.split('/').reverse().join('-')),
    },
    {
      title: t('clientManagement.lastLogin'),
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      sorter: (a, b) =>
        new Date(a.lastLogin.split('/').reverse().join('-')) -
        new Date(b.lastLogin.split('/').reverse().join('-')),
    },
    {
      title: '',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Dropdown menu={moreActions(record)} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ]

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchText.toLowerCase())
    return matchesSearch
  })

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title
            level={2}
            className={isDarkMode ? 'text-white' : 'text-gray-900'}
          >
            {t('clientManagement.title')}
          </Title>
          <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            {t('clientManagement.description')}
          </Text>
        </div>
        <div className="flex items-center space-x-3">
          {/* <Button icon={<ExportOutlined />}>Export</Button> */}
          <Button icon={<ReloadOutlined />} onClick={() => setLoading(true)}>
            {t('clientManagement.refresh')}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            {t('clientManagement.addUser')}
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <Search
              placeholder={t('clientManagement.search')}
              allowClear
              onSearch={handleSearch}
              onChange={e => handleSearch(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            total: filteredUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} ${t('clientManagement.of')} ${total} ${t('clientManagement.users')}`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Add/Edit User Modal */}
      {/* <Modal
        title={
          editingUser
            ? t('clientManagement.editeUserModal.title')
            : t('clientManagement.addUserModal.title')
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText={
          editingUser
            ? t('clientManagement.editeUserModal.confirm')
            : t('clientManagement.addUserModal.confirm')
        }
        cancelButtonProps={{
          danger: true,
        }}
        cancelText={
          editingUser
            ? t('clientManagement.editeUserModal.cancel')
            : t('clientManagement.addUserModal.cancel')
        }
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: 'Please input the name!' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter full name"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please input the email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Enter email address"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[
                  { required: true, message: 'Please input the phone number!' },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Enter phone number"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Role"
                name="role"
                rules={[{ required: true, message: 'Please select a role!' }]}
              >
                <Select placeholder="Select role">
                  <Option value="Student">Student</Option>
                  <Option value="Faculty">Faculty</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select a status!' }]}
              >
                <Select placeholder="Select status">
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Department"
                name="department"
                rules={[
                  { required: true, message: 'Please input the department!' },
                ]}
              >
                <Input placeholder="Enter department" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal> */}
    </div>
  )
}

export default ClientManagement
