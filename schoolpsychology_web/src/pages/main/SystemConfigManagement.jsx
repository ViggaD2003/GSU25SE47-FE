import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Divider,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import { useTranslation } from 'react-i18next'
import { useSystemConfig } from '@/contexts/SystemConfigContext'

const { Title, Text } = Typography

const columnsBuilder = (t, editingMap, setEditingMap) => [
  {
    title: t('systemConfig.table.id'),
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: t('systemConfig.table.group'),
    dataIndex: 'configGroup',
    key: 'configGroup',
    width: 180,
    render: value => value,
  },
  {
    title: t('systemConfig.table.key'),
    dataIndex: 'configKey',
    key: 'configKey',
    width: 300,
  },
  {
    title: t('systemConfig.table.value'),
    dataIndex: 'configValue',
    key: 'configValue',
    render: (value, record) => {
      const isEditing = !!editingMap[record.id]
      const type = (
        editingMap[record.id]?.valueType ||
        record?.valueType ||
        'string'
      ).toLowerCase()
      const current = editingMap[record.id]?.configValue ?? value

      if (!isEditing) return <Text code>{String(value)}</Text>

      if (type === 'boolean') {
        const checked =
          current === true ||
          current === 'true' ||
          current === 1 ||
          current === '1'
        return (
          <Switch
            checked={checked}
            onChange={val =>
              setEditingMap(prev => ({
                ...prev,
                [record.id]: { ...record, configValue: val },
              }))
            }
          />
        )
      }

      if (type === 'integer' || type === 'long' || type === 'number') {
        const numericValue =
          typeof current === 'number' ? current : Number(current ?? 0)
        return (
          <InputNumber
            value={Number.isNaN(numericValue) ? 0 : numericValue}
            onChange={val =>
              setEditingMap(prev => ({
                ...prev,
                [record.id]: { ...record, configValue: val },
              }))
            }
            style={{ width: 160 }}
          />
        )
      }

      if (type === 'json') {
        return (
          <Input.TextArea
            autoSize={{ minRows: 1, maxRows: 6 }}
            value={
              typeof current === 'string'
                ? current
                : JSON.stringify(current, null, 2)
            }
            onChange={e =>
              setEditingMap(prev => ({
                ...prev,
                [record.id]: { ...record, configValue: e.target.value },
              }))
            }
          />
        )
      }

      return (
        <Input
          value={current}
          onChange={e =>
            setEditingMap(prev => ({
              ...prev,
              [record.id]: { ...record, configValue: e.target.value },
            }))
          }
        />
      )
    },
  },
  {
    title: t('systemConfig.table.type'),
    dataIndex: 'valueType',
    key: 'valueType',
    render: (value, record) => {
      const isEditing = !!editingMap[record.id]
      const current = editingMap[record.id]?.valueType ?? value
      return isEditing ? (
        <Select
          value={current}
          onChange={val =>
            setEditingMap(prev => ({
              ...prev,
              [record.id]: { ...record, valueType: val },
            }))
          }
          options={[
            { value: 'string', label: 'string' },
            { value: 'integer', label: 'integer' },
            { value: 'long', label: 'long' },
            { value: 'number', label: 'number' },
            { value: 'boolean', label: 'boolean' },
            { value: 'json', label: 'json' },
          ]}
          style={{ width: 120 }}
        />
      ) : (
        <Tag>{value}</Tag>
      )
    },
  },
  {
    title: t('systemConfig.table.category'),
    dataIndex: 'category',
    key: 'category',
  },
  {
    title: t('systemConfig.table.description'),
    dataIndex: 'description',
    key: 'description',
    width: 260,
    ellipsis: true,
  },
  {
    title: t('systemConfig.table.active'),
    dataIndex: 'isActive',
    key: 'isActive',
    render: value =>
      value ? (
        <Tag color="green">{t('common.active')}</Tag>
      ) : (
        <Tag color="red">{t('common.inactive')}</Tag>
      ),
  },
  {
    title: t('systemConfig.table.editable'),
    dataIndex: 'isEditable',
    key: 'isEditable',
    render: value =>
      value ? <Tag>{t('common.yes')}</Tag> : <Tag>{t('common.no')}</Tag>,
  },
  {
    title: t('systemConfig.table.updatedAt'),
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    render: value => (value ? new Date(value).toLocaleString() : '-'),
  },
  {
    key: 'actions',
    fixed: 'right',
    width: 100,
    render: (_, record) => {
      const isEditing = !!editingMap[record.id]
      const toggleEditing = () =>
        setEditingMap(prev =>
          isEditing
            ? { ...prev, [record.id]: undefined }
            : { ...prev, [record.id]: { ...record } }
        )
      return (
        <Space>
          {record.isEditable ? (
            <Button size="small" onClick={toggleEditing}>
              {isEditing ? t('common.cancel') : t('common.edit')}
            </Button>
          ) : null}
        </Space>
      )
    },
  },
]

const SystemConfigManagement = () => {
  const { t } = useTranslation()
  const { configs, loading, fetchSystemConfigs, updateSystemConfigs } =
    useSystemConfig()
  const [editingMap, setEditingMap] = useState({})
  const [groupFilter, setGroupFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchSystemConfigs()
  }, [fetchSystemConfigs])

  const filteredData = useMemo(() => {
    let data = configs
    if (groupFilter !== 'all')
      data = data.filter(item => item.configGroup === groupFilter)
    if (search)
      data = data.filter(item =>
        `${item.configKey} ${item.description}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    return data
  }, [configs, groupFilter, search])

  const groups = useMemo(
    () => Array.from(new Set(configs.map(c => c.configGroup))),
    [configs]
  )

  const hasChanges = useMemo(
    () => Object.values(editingMap).some(Boolean),
    [editingMap]
  )

  const handleSave = async () => {
    const payload = Object.values(editingMap).filter(Boolean)
    if (payload.length === 0) return
    await updateSystemConfigs(payload)
    setEditingMap({})
  }

  const columns = useMemo(
    () => columnsBuilder(t, editingMap, setEditingMap),
    [t, editingMap]
  )

  return (
    <div className="p-4">
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <div>
            <Title level={3} className="m-0">
              {t('systemConfig.title')}
            </Title>
            <Text type="secondary">{t('systemConfig.description')}</Text>
          </div>
          <Space>
            <Button onClick={() => fetchSystemConfigs()}>
              {t('common.refresh')}
            </Button>
            <Button onClick={() => setEditingMap({})} disabled={!hasChanges}>
              {t('systemConfig.resetChanges')}
            </Button>
            <Button type="primary" disabled={!hasChanges} onClick={handleSave}>
              {t('common.save')}
            </Button>
          </Space>
        </div>

        <Alert
          type="info"
          message={t('systemConfig.rawValueNoteTitle')}
          description={t('systemConfig.rawValueNote')}
          showIcon
        />

        <Card>
          <div className="flex flex-wrap gap-3 items-center">
            <Input.Search
              placeholder={t('systemConfig.searchPlaceholder')}
              allowClear
              style={{ maxWidth: 360 }}
              onSearch={setSearch}
              onChange={e => setSearch(e.target.value)}
              value={search}
            />
            <Divider type="vertical" />
            <Text strong>{t('systemConfig.filters.group')}</Text>
            <Select
              value={groupFilter}
              onChange={setGroupFilter}
              options={[
                { value: 'all', label: t('systemConfig.allGroups') },
                ...groups.map(g => ({ value: g, label: g })),
              ]}
              style={{ width: 220 }}
            />
          </div>
        </Card>

        <Card>
          <Table
            rowKey="id"
            dataSource={filteredData}
            columns={columns}
            loading={loading}
            scroll={{ x: 1800 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${t('common.showing')} ${range[0]}-${range[1]} ${t('common.of')} ${total} ${t('common.items')}`,
            }}
          />
        </Card>
      </Space>
    </div>
  )
}

export default SystemConfigManagement
