# Chat Interface Component

## Tổng quan

Chat Interface là một component React được thiết kế để counselor có thể giao tiếp với học sinh thông qua hệ thống chat đơn giản, tương tự như Messenger nhưng tối giản hơn.

## Các component chính

### 1. ChatInterface

Component chính quản lý toàn bộ giao diện chat:

- Hiển thị danh sách học sinh bên trái
- Hiển thị khu vực chat bên phải
- Quản lý state của tin nhắn và học sinh được chọn

### 2. ChatList

Hiển thị danh sách học sinh:

- Avatar và tên học sinh
- Trạng thái online/offline
- Số tin nhắn chưa đọc
- Tin nhắn cuối cùng

### 3. ChatHeader

Header của khu vực chat:

- Thông tin học sinh đang chat
- Trạng thái online/offline
- Các nút chức năng (gọi điện, video call, menu)

### 4. ChatMessage

Hiển thị tin nhắn:

- Tin nhắn của counselor (màu xanh, bên phải)
- Tin nhắn của học sinh (màu trắng, bên trái)
- Thời gian gửi tin nhắn

### 5. ChatInput

Khu vực nhập tin nhắn:

- Textarea có thể resize
- Nút gửi tin nhắn
- Hỗ trợ Enter để gửi, Shift+Enter để xuống dòng

### 6. TypingIndicator

Hiển thị khi học sinh đang nhập tin nhắn:

- 3 chấm nhảy lên nhảy xuống
- Animation mượt mà

## Tính năng

### Cơ bản

- ✅ Chat real-time giữa counselor và học sinh
- ✅ Danh sách học sinh với trạng thái online/offline
- ✅ Hiển thị số tin nhắn chưa đọc
- ✅ Auto-scroll xuống tin nhắn mới nhất
- ✅ Responsive design

### Nâng cao

- ✅ Typing indicator
- ✅ Timestamp cho tin nhắn
- ✅ Hỗ trợ đa ngôn ngữ (Việt-Anh)
- ✅ Role-based access control (chỉ counselor)
- ✅ Dark mode support
- ✅ Giao diện tối giản (không có call/video)

## Cách sử dụng

### 1. Import component

```jsx
import { ChatInterface } from '@/components/chat'
```

### 2. Sử dụng trong component

```jsx
const MyComponent = () => {
  return (
    <div>
      <ChatInterface />
    </div>
  )
}
```

### 3. Truy cập qua route

```
/chat-management
```

## Cấu trúc dữ liệu

### Student Object

```javascript
{
  id: number,
  name: string,
  avatar: string, // Emoji hoặc URL
  lastMessage: string,
  unread: number,
  online: boolean
}
```

### Message Object

```javascript
{
  id: number,
  text: string,
  sender: 'counselor' | 'student',
  timestamp: Date,
  studentId: number
}
```

## Tùy chỉnh

### Thay đổi màu sắc

Các class Tailwind CSS có thể được thay đổi trong từng component:

- Màu chủ đạo: `bg-blue-500`
- Màu tin nhắn counselor: `bg-blue-500`
- Màu tin nhắn student: `bg-white dark:bg-gray-700`

### Dark Mode

Tất cả components đều hỗ trợ dark mode với Tailwind CSS:

- Light mode: `bg-white`, `text-gray-900`, `border-gray-200`
- Dark mode: `dark:bg-gray-800`, `dark:text-gray-100`, `dark:border-gray-700`
- Tự động chuyển đổi theo theme của hệ thống

### Thay đổi kích thước

- Chiều rộng sidebar: `w-80` (320px)
- Chiều cao tin nhắn tối đa: `max-h-120px`

## Tích hợp API

Để tích hợp với backend thực tế, cần:

1. **WebSocket Connection**: Kết nối real-time
2. **Message API**: CRUD operations cho tin nhắn
3. **Student API**: Lấy danh sách học sinh
4. **Authentication**: Xác thực counselor

## Tương lai

- [ ] Hỗ trợ gửi file/ảnh
- [ ] Emoji picker
- [ ] Search tin nhắn
- [ ] Push notifications
- [ ] Message reactions
- [ ] Hỗ trợ gửi stickers
- [ ] Chat groups
- [ ] Message forwarding
