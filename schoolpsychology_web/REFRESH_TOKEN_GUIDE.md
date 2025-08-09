# Hướng dẫn Refresh Token

## Tổng quan

Hệ thống đã được cập nhật để xử lý refresh token một cách thông minh hơn:

### 1. Logic Refresh Token

- **Chỉ refresh khi cần thiết**: Token chỉ được refresh khi nhận được lỗi 401 (Unauthorized) từ server
- **Xử lý token vẫn hợp lệ**: Khi backend trả về `success: false` với message "Access token is still valid", hệ thống sẽ coi như refresh thành công
- **Tự động refresh khi khởi tạo**: Khi app khởi động và token đã expired, hệ thống sẽ tự động thử refresh

### 2. Các thay đổi chính

#### `src/services/authApi.js`

- Xử lý response khi token vẫn hợp lệ
- Trả về token hiện tại nếu không cần refresh

#### `src/services/api.js`

- Request interceptor: Chỉ thêm token vào header, không check expiration
- Response interceptor: Chỉ refresh khi nhận 401 error
- Thông báo phù hợp cho user

#### `src/store/actions/authActions.js`

- `initializeAuthFromStorage`: Thử refresh token khi token expired thay vì xóa luôn
- `refreshToken`: Chỉ update localStorage khi có token mới

### 3. Cách test

#### Trong Development Mode

1. Mở Dashboard
2. Sử dụng `TokenDebugger` để xem thông tin token
3. Sử dụng `RefreshTokenDebugger` để test refresh token

#### Test các trường hợp:

1. **Token hợp lệ**: Backend trả về "Access token is still valid"
2. **Token expired**: Backend trả về token mới
3. **Token invalid**: Backend trả về lỗi, user bị logout

### 4. Flow hoạt động

```
1. User truy cập app
   ↓
2. initializeAuthFromStorage chạy
   ↓
3. Kiểm tra token có expired không?
   ↓
4a. Nếu chưa expired → Login thành công
4b. Nếu expired → Thử refresh token
   ↓
5a. Refresh thành công → Login với token mới
5b. Refresh thất bại → Logout user
```

### 5. API Response Format

#### Khi token vẫn hợp lệ:

```json
{
  "message": "Access token is still valid. No need to refresh.",
  "success": false,
  "data": null
}
```

#### Khi refresh thành công:

```json
{
  "message": "Token refreshed successfully",
  "success": true,
  "data": {
    "token": "new_jwt_token_here"
  }
}
```

### 6. Debug Tools

#### Console Logs

- `[Token Check]`: Thông tin về token expiration
- `[refreshToken]`: Logs từ refresh token process
- `🔄 Attempting to refresh token...`: Bắt đầu refresh
- `✅ Token refreshed successfully`: Refresh thành công
- `❌ Token refresh failed`: Refresh thất bại

#### Components Debug

- `TokenDebugger`: Hiển thị thông tin token hiện tại
- `RefreshTokenDebugger`: Test refresh token manually

### 7. Lưu ý

- Token chỉ được refresh khi thực sự cần thiết (401 error)
- Hệ thống sẽ tự động xử lý refresh mà không cần user can thiệp
- User sẽ nhận được thông báo phù hợp về trạng thái session
- Nếu refresh thất bại, user sẽ được logout và redirect về login page
