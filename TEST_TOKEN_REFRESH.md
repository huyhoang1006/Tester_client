# Hướng dẫn Test Token Refresh

## Mô tả

Khi access token hết hạn, hệ thống sẽ tự động gọi refresh token để lấy token mới. Chỉ khi refresh token cũng hết hạn mới redirect về trang đăng nhập.

---

## Chuẩn bị

1. Mở app Tester Client
2. Login thành công
3. Mở DevTools (F12)
4. Tab **Application** (Chrome) → **Local Storage**

---

## Test Scenario A: Access Token Hết Hạn (Thành công)

### Bước 1: Simulate access token expired

1. Trong DevTools → Local Storage
2. Click vào giá trị của `token`
3. Đổi thành chuỗi bất kỳ (VD: `expired-token-123`)
4. Click ra ngoài để apply thay đổi

### Bước 2: Trigger API call

Click button bất kỳ trigger API (VD: load data, save, refresh...)

### Bước 3: Kiểm tra kết quả

**Expected:**

| # | Kiểm tra | Kết quả |
|---|----------|---------|
| 1 | Console có request gọi `/oauth/token` | ✅ Có |
| 2 | `localStorage.token` được cập nhật | ✅ Token mới |
| 3 | Request gốc được retry thành công | ✅ Có |
| 4 | UI hoạt động bình thường | ✅ Không bị logout |
| 5 | Bị redirect về login | ❌ Không |

---

## Test Scenario B: Refresh Token Hết Hạn (Thất bại)

### Bước 1: Simulate refresh token expired

1. Trong DevTools → Local Storage
2. Click vào giá trị của `refresh_token`
3. Đổi thành chuỗi bất kỳ (VD: `invalid-refresh-token`)
4. Click ra ngoài để apply thay đổi

### Bước 2: Trigger API call

Click button bất kỳ trigger API

### Bước 3: Kiểm tra kết quả

**Expected:**

| # | Kiểm tra | Kết quả |
|---|----------|---------|
| 1 | Refresh API fail (401/error) | ✅ Có |
| 2 | `localStorage` bị xóa sạch | ✅ Không còn token, user, role |
| 3 | Redirect về trang login | ✅ Có |
| 4 | Hiển thị form đăng nhập | ✅ Có |

---

## Test Scenario C: Nhiều Request Cùng Lúc

### Bước 1: Simulate access token expired

1. Đổi `localStorage.token` thành `expired-token`

### Bước 2: Trigger nhiều API cùng lúc

Click 3-5 button trigger API **gần như cùng lúc** (trong vòng 1-2 giây)

### Bước 3: Kiểm tra kết quả

**Expected:**

| # | Kiểm tra | Kết quả |
|---|----------|---------|
| 1 | Chỉ gọi refresh token 1 lần | ✅ Không phải 3-5 lần |
| 2 | Tất cả request đều được retry | ✅ Tất cả thành công |
| 3 | UI hoạt động bình thường | ✅ Không bị lag |

---

## Console Logs Cần Theo Dõi

Mở tab **Console** trong DevTools để xem:

```
# Khi access token hết hạn & refresh thành công
POST /oauth/token          → 200 OK
GET /api/xxx               → 200 OK (retry thành công)

# Khi refresh token hết hạn  
POST /oauth/token          → 401 Unauthorized
# Redirect to login
```

---

## Các Edge Cases Đã Xử Lý

| Scenario | Xử lý |
|----------|-------|
| Nhiều request 401 cùng lúc | Queue & chỉ refresh 1 lần |
| Request đang refresh mà có thêm 401 | Cho vào queue, đợi token mới |
| Refresh token hết hạn | Logout & redirect login |
| Request refresh mà lỗi 401 | Không retry nữa, logout ngay |

---

## Thay Đổi Code

File: `src/utils/client.js`

- Thêm biến `isRefreshing`, `failedQueue` để quản lý refresh
- Thêm hàm `refreshToken()` gọi API refresh
- Sửa response interceptor: 401 → thử refresh token trước khi logout
