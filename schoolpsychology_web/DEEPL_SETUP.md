# DeepL API Setup Guide

## 1. Đăng ký DeepL API

### Bước 1: Tạo tài khoản

- Truy cập: https://www.deepl.com/pro-api
- Đăng ký tài khoản DeepL

### Bước 2: Lấy API Key

- Sau khi đăng ký, vào phần "Account" → "API Keys"
- Tạo API key mới
- Copy API key để sử dụng

## 2. Cấu hình trong dự án

### Tạo file .env.local

```bash
# DeepL API Configuration
VITE_DEEPL_API_KEY=your_deepl_api_key_here
VITE_DEEPL_PRO=false  # true nếu dùng DeepL Pro, false nếu dùng DeepL Free
```

### Ví dụ:

```bash
VITE_DEEPL_API_KEY=12345678-1234-1234-1234-123456789abc
VITE_DEEPL_PRO=false
```

## 3. Sử dụng trong code

### Sử dụng hook:

```jsx
import { useAutoTranslation } from '@hooks/useAutoTranslation'

const { autoTranslate } = useAutoTranslation()

// Dịch text
const translatedText = await autoTranslate('key', 'Original text')
```

### Sử dụng component:

```jsx
import AutoTranslatedText from '@components/common/AutoTranslatedText'
;<AutoTranslatedText
  text="Hello World"
  key="hello.world"
  loadingComponent={<span>Loading...</span>}
/>
```

### Sử dụng service trực tiếp:

```jsx
import translationService from '@services/translationService'

// Dịch đơn lẻ
const result = await translationService.translateText('Hello', 'vi', 'en')

// Dịch hàng loạt
const results = await translationService.translateBatch(
  ['Hello', 'World'],
  'vi',
  'en'
)
```

## 4. Kiểm tra trạng thái API

Component `DeepLStatusChecker` sẽ hiển thị:

- Trạng thái kết nối API
- Loại tài khoản (Free/Pro)
- Thông tin sử dụng (số ký tự đã dùng)
- Nút test translation

## 5. Ngôn ngữ được hỗ trợ

DeepL hỗ trợ các ngôn ngữ sau:

- **Tiếng Việt (VI)**
- **Tiếng Anh (EN)**
- **Tiếng Đức (DE)**
- **Tiếng Pháp (FR)**
- **Tiếng Tây Ban Nha (ES)**
- **Tiếng Bồ Đào Nha (PT)**
- **Tiếng Ý (IT)**
- **Tiếng Hà Lan (NL)**
- **Tiếng Ba Lan (PL)**
- **Tiếng Nga (RU)**
- **Tiếng Nhật (JA)**
- **Tiếng Trung (ZH)**
- **Tiếng Hàn (KO)**

## 6. Giới hạn sử dụng

### DeepL Free:

- 500,000 ký tự/tháng
- Không hỗ trợ một số ngôn ngữ

### DeepL Pro:

- Không giới hạn ký tự
- Hỗ trợ tất cả ngôn ngữ
- Tốc độ nhanh hơn

## 7. Xử lý lỗi

Service sẽ tự động xử lý các lỗi:

- API key không hợp lệ
- Hết quota
- Lỗi mạng
- Ngôn ngữ không được hỗ trợ

Trong trường hợp lỗi, service sẽ trả về text gốc.

## 8. Cache

Hệ thống có cache để tránh gọi API nhiều lần cho cùng một text:

- Cache được lưu trong memory
- Tự động clear khi đổi ngôn ngữ
- Có thể clear thủ công bằng `clearCache()`

## 9. Best Practices

1. **Ưu tiên sử dụng i18next** cho các text tĩnh
2. **Chỉ dùng DeepL** cho data động từ API
3. **Cache kết quả** để tiết kiệm API calls
4. **Xử lý lỗi gracefully** với fallback text
5. **Monitor usage** để tránh vượt quota
