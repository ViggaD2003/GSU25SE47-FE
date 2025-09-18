import { Dropdown, Menu, Button, Tooltip } from 'antd'
import { MoreOutlined } from '@ant-design/icons'

const ActionDropdown = ({ actions }) => {
  return (
    <Dropdown
      menu={{ items: actions }}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button type="text" icon={<MoreOutlined />} />
    </Dropdown>
  )
}

export default ActionDropdown
