import React from 'react'
import { useTranslation } from 'react-i18next'
import { Select, Space } from 'antd'

const { Option } = Select

const SlotFilters = ({ filters, onFiltersChange }) => {
  const { t } = useTranslation()

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <Space wrap>
      <Select
        placeholder={t('slotManagement.table.type')}
        allowClear
        value={filters.slotType}
        onChange={value => handleFilterChange('slotType', value)}
        style={{ minWidth: 150 }}
      >
        <Option value="APPOINTMENT">
          {t('slotManagement.typeOptions.appointment')}
        </Option>
        <Option value="PROGRAM">
          {t('slotManagement.typeOptions.program')}
        </Option>
      </Select>

      <Select
        placeholder={t('slotManagement.table.status')}
        allowClear
        value={filters.status}
        onChange={value => handleFilterChange('status', value)}
        style={{ minWidth: 150 }}
      >
        <Option value={1}>{t('slotManagement.statusOptions.active')}</Option>
        <Option value={0}>{t('slotManagement.statusOptions.inactive')}</Option>
        <Option value={2}>{t('slotManagement.statusOptions.booked')}</Option>
        <Option value={3}>{t('slotManagement.statusOptions.cancelled')}</Option>
      </Select>
    </Space>
  )
}

export default SlotFilters
