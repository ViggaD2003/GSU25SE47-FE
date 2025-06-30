# Cấu trúc dự án React Native Mobile

## Tổng quan

Dự án được tổ chức theo cấu trúc chuẩn React Native với các thư mục được phân chia rõ ràng theo chức năng.

## Cấu trúc thư mục

```
schoolpsychology_mobile/
├── src/                          # Thư mục chính chứa source code
│   ├── components/               # Các component tái sử dụng
│   │   ├── common/              # Components chung (Loading, Toast, SurveyCard)
│   │   ├── ui/                  # UI components (Container, ProtectedRoute)
│   │   ├── forms/               # Form components (tương lai)
│   │   └── index.js             # Export tất cả components
│   │
│   ├── screens/                 # Các màn hình của ứng dụng
│   │   ├── Authentication/      # Màn hình đăng nhập/đăng ký
│   │   ├── Home/               # Màn hình chính
│   │   ├── Survey/             # Màn hình khảo sát
│   │   ├── Profile/            # Màn hình hồ sơ
│   │   ├── Blog/               # Màn hình blog
│   │   ├── Notification/       # Màn hình thông báo
│   │   └── index.js            # Export tất cả screens
│   │
│   ├── services/               # Các service gọi API
│   │   ├── api/                # API services
│   │   │   ├── axios.js        # Axios instance và interceptors
│   │   │   └── SurveyService.js # Service cho survey
│   │   ├── auth/               # Authentication services
│   │   │   ├── AuthService.js  # Service xác thực
│   │   │   ├── authActions.js  # Actions cho auth
│   │   │   └── tokenManager.js # Quản lý token
│   │   └── index.js            # Export tất cả services
│   │
│   ├── utils/                  # Các utility functions
│   │   ├── hooks.js            # Custom hooks
│   │   └── index.js            # Export tất cả utils
│   │
│   ├── constants/              # Các hằng số
│   │   ├── index.js            # Constants chính
│   │   ├── survey.js           # Constants cho survey
│   │   └── index.js            # Export tất cả constants
│   │
│   ├── contexts/               # React Context
│   │   ├── AuthContext.js      # Context cho authentication
│   │   └── index.js            # Export tất cả contexts
│   │
│   ├── navigation/             # Navigation configuration
│   │   ├── AuthStack.js        # Stack navigation cho auth
│   │   ├── MainTabs.js         # Tab navigation chính
│   │   └── index.js            # Export tất cả navigation
│   │
│   ├── assets/                 # Tài nguyên (images, icons, fonts)
│   │   ├── adaptive-icon.png
│   │   └── logo.svg
│   │
│   ├── types/                  # TypeScript types (tương lai)
│   ├── hooks/                  # Custom hooks (tương lai)
│   ├── config/                 # Configuration files (tương lai)
│   └── index.js                # Export chính của src
│
├── App.js                      # Component gốc của ứng dụng
├── index.js                    # Entry point
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── README.md                   # Documentation
└── PROJECT_STRUCTURE.md        # File này
```

## Quy tắc tổ chức

### 1. Components

- **common/**: Components được sử dụng ở nhiều nơi (Loading, Toast, SurveyCard)
- **ui/**: UI components cơ bản (Container, ProtectedRoute)
- **forms/**: Form components (sẽ thêm trong tương lai)

### 2. Screens

- Mỗi tính năng có thư mục riêng
- Tên file theo format: `TênScreen.jsx`
- Export default cho mỗi screen

### 3. Services

- **api/**: Các service gọi API
- **auth/**: Các service liên quan đến authentication
- Mỗi service có trách nhiệm riêng biệt

### 4. Utils

- **hooks.js**: Custom React hooks
- Các utility functions khác

### 5. Constants

- Tách biệt constants theo domain
- Export tập trung qua index.js

### 6. Contexts

- Mỗi context quản lý một state domain
- Export Provider và Hook

### 7. Navigation

- Tách biệt navigation theo flow
- AuthStack cho authentication
- MainTabs cho main app

## Import/Export Pattern

### 1. Barrel Exports

Mỗi thư mục có file `index.js` để export tất cả:

```javascript
// src/components/index.js
export { default as Loading } from "./common/Loading";
export { default as SurveyCard } from "./common/SurveyCard";
```

### 2. Relative Imports

Sử dụng relative imports trong cùng thư mục:

```javascript
// Trong cùng thư mục
import { Loading } from "./Loading";

// Từ thư mục khác
import { Loading } from "../components/common/Loading";
```

### 3. Absolute Imports (Tương lai)

Có thể cấu hình để sử dụng absolute imports:

```javascript
import { Loading } from "@/components/common/Loading";
```

## Lợi ích của cấu trúc này

1. **Tổ chức rõ ràng**: Mỗi file có vị trí logic
2. **Dễ bảo trì**: Tìm file nhanh chóng
3. **Scalable**: Dễ dàng mở rộng
4. **Reusable**: Components có thể tái sử dụng
5. **Testable**: Dễ dàng viết test
6. **Team collaboration**: Nhiều developer có thể làm việc song song

## Hướng dẫn thêm file mới

### Thêm Component mới:

1. Xác định loại component (common/ui/forms)
2. Tạo file trong thư mục phù hợp
3. Export trong `index.js` của thư mục đó

### Thêm Screen mới:

1. Tạo thư mục mới trong `screens/` nếu cần
2. Tạo file screen với tên `TênScreen.jsx`
3. Export trong `screens/index.js`

### Thêm Service mới:

1. Xác định loại service (api/auth)
2. Tạo file trong thư mục phù hợp
3. Export trong `services/index.js`

## Lưu ý

- Luôn cập nhật file `index.js` khi thêm file mới
- Sử dụng consistent naming convention
- Giữ cấu trúc thư mục sạch sẽ
- Không tạo thư mục con quá sâu (tối đa 3 cấp)
