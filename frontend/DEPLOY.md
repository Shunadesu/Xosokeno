# Hướng dẫn Deploy Frontend lên Vercel

## Prerequisites
- Tài khoản Vercel (miễn phí)
- Backend đã được deploy trên Render: https://xosokeno.onrender.com

## Các bước deploy:

### 1. Chuẩn bị code
Đảm bảo code đã được commit và push lên Git repository (GitHub, GitLab, hoặc Bitbucket)

### 2. Tạo project trên Vercel
1. Truy cập https://vercel.com và đăng nhập
2. Click "Add New Project"
3. Import Git repository của bạn
4. Vercel sẽ tự động detect Vite project

### 3. Cấu hình Environment Variables
Trong phần Settings > Environment Variables của project trên Vercel:

**Lưu ý quan trọng**: File `vercel.json` đã được cấu hình để proxy `/api` đến backend Render, nên bạn KHÔNG cần set `VITE_API_URL` trong production. Frontend sẽ tự động dùng `/api` (relative URL).

Chỉ cần set các biến sau (nếu cần):

```
VITE_NODE_ENV=production
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=false
```

**KHÔNG set**: `VITE_API_URL` và `VITE_SOCKET_URL` - để mặc định dùng `/api` và `/socket.io` (relative URLs)

### 4. Cấu hình Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build` (hoặc `npm run build`)
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Deploy
Click "Deploy" và chờ quá trình build hoàn tất.

### 6. Cấu hình CORS trên Backend (Render)
**QUAN TRỌNG**: Cần cập nhật CORS trên Render để cho phép domain Vercel của bạn.

1. Truy cập Render Dashboard > Web Service của backend
2. Vào phần **Environment** 
3. Thêm hoặc cập nhật biến môi trường:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
   (Thay `your-app.vercel.app` bằng domain thực tế từ Vercel)

4. Nếu có admin panel riêng, thêm:
   ```
   ADMIN_URL=https://your-admin.vercel.app
   ```

5. **Redeploy** backend trên Render để áp dụng thay đổi

**Lưu ý**: Nếu chưa có domain Vercel (vẫn đang dùng preview URL), bạn có thể:
- Thêm nhiều URL vào CORS (cách tốt nhất)
- Hoặc tạm thời dùng wildcard `*` cho development (không khuyến khích cho production)

### 7. Kiểm tra
Sau khi deploy thành công, truy cập URL được Vercel cung cấp và kiểm tra:
- ✅ Trang chủ hiển thị đúng
- ✅ API calls hoạt động
- ✅ Đăng nhập/đăng ký hoạt động
- ✅ Socket connection (nếu có)

## Lưu ý:
- Vercel sẽ tự động tạo preview deployments cho mỗi commit/pull request
- Production deployment sẽ được trigger khi merge vào branch chính (thường là `main` hoặc `master`)
- Mỗi lần update environment variables, cần redeploy để áp dụng thay đổi

## Troubleshooting:
- **CORS Error**: Kiểm tra CORS config trên backend
- **API 404**: Kiểm tra VITE_API_URL trong Environment Variables
- **Socket Connection Failed**: Kiểm tra VITE_SOCKET_URL và cấu hình CORS cho WebSocket

