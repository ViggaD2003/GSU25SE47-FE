# School Psychology Mobile App

Ứng dụng di động cho School Psychology được xây dựng bằng React Native và Expo.

## 📁 Cấu trúc thư mục

```
schoolpsychology_mobile/
├── 📁 assets/                 # Tài nguyên tĩnh (icons, images)
├── 📁 components/             # Components tái sử dụng
│   ├── index.js              # Export tất cả components
│   └── ProtectedRoute.js     # Component bảo vệ route
├── 📁 constants/             # Constants và configurations
│   └── index.js              # Tất cả constants (styles, auth config, app config)
├── 📁 context/               # React Context
│   └── AuthContext.js        # Authentication context
├── 📁 navigation/            # Navigation configuration
│   ├── AuthStack.js          # Stack navigation cho authentication
│   └── MainTabs.js           # Tab navigation cho main app
├── 📁 pages/                 # Các màn hình của ứng dụng
│   ├── 📁 Authentication/    # Màn hình đăng nhập/đăng ký
│   ├── 📁 Blog/              # Màn hình blog
│   ├── 📁 Home/              # Màn hình chính
│   ├── 📁 Notification/      # Màn hình thông báo
│   └── 📁 Profile/           # Màn hình profile
├── 📁 utils/                 # Utilities và services
│   ├── authActions.js        # Authentication actions (refresh, logout)
│   ├── AuthService.js        # Authentication service
│   ├── axios.js              # HTTP client configuration
│   ├── hooks.js              # Custom React hooks
│   └── tokenManager.js       # Token management utilities
├── App.js                    # Component gốc của ứng dụng
├── app.json                  # Expo configuration
├── index.js                  # Entry point
└── package.json              # Dependencies
```

## 🔧 Cải tiến đã thực hiện

### 1. **Tối ưu hóa cấu trúc utils**

- ✅ **Gộp constants**: Di chuyển `authConfig.js` và `styles.jsx` vào `constants/index.js`
- ✅ **Tạo hooks.js**: Gộp `useAuthError.js` và thêm các hooks mới (`useLoading`, `useForm`)
- ✅ **Tách biệt chức năng**: `tokenManager.js`, `authActions.js`, `AuthService.js` có trách nhiệm rõ ràng

### 2. **Cấu trúc constants mới**

```javascript
// constants/index.js
export const GlobalStyles = { ... }        // Styles toàn cục
export const AUTH_CONFIG = { ... }         // Cấu hình authentication
export const AUTH_ERRORS = { ... }         // Error messages
export const AUTH_SUCCESS = { ... }        // Success messages
export const APP_CONFIG = { ... }          // Cấu hình ứng dụng
```

## 🚀 Cách sử dụng

### Import constants

```javascript
import { GlobalStyles, AUTH_CONFIG, APP_CONFIG } from "../constants";
```

### Import hooks

```javascript
import { useAuthError, useLoading, useForm } from "../utils/hooks";
```

### Import services

```javascript
import { login, logout, isAuthenticated } from "../utils/AuthService";
```

## 📦 Dependencies chính

- **React Native**: Framework chính
- **Expo**: Development platform
- **React Navigation**: Navigation
- **Axios**: HTTP client
- **AsyncStorage**: Local storage
- **JWT Decode**: Token decoding

## 🔐 Authentication Flow

1. **Login**: `AuthService.login()` → Lưu tokens → Update context
2. **Token Refresh**: `authActions.refreshAccessToken()` → Auto refresh khi 401
3. **Logout**: `authActions.logout()` → Clear tokens → Update context
4. **Protected Routes**: `ProtectedRoute` component kiểm tra authentication

## 🎨 Styling

Sử dụng `GlobalStyles` từ `constants/index.js`:

```javascript
import { GlobalStyles } from "../constants";

const styles = StyleSheet.create({
  button: {
    backgroundColor: GlobalStyles.colors.primary,
  },
});
```
