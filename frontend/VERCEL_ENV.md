# Environment Variables cho Vercel Deployment

**QUAN TRỌNG**: File `vercel.json` đã được cấu hình để proxy `/api` đến backend Render. 
Frontend sẽ dùng relative URLs (`/api`, `/socket.io`) và Vercel sẽ tự động proxy đến backend.
**KHÔNG cần** set `VITE_API_URL` trong production!

## Production Environment Variables

```
VITE_NODE_ENV=production
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=false
```

**Lưu ý**: 
- `VITE_API_URL` và `VITE_SOCKET_URL` **KHÔNG cần set** - để mặc định `/api` và `/socket.io`
- Vercel sẽ tự động proxy các requests này đến `https://xosokeno.onrender.com`
- Backend URL sẽ được ẩn hoàn toàn khỏi client

## Development Environment Variables (Local)

Trong file `.env.local` (không commit lên Git):

```
VITE_API_URL=/api
VITE_SOCKET_URL=
VITE_NODE_ENV=development
VITE_ENABLE_DEBUG=true
```

## Cách thêm vào Vercel:

1. Vào Vercel Dashboard
2. Chọn project của bạn
3. Vào **Settings** > **Environment Variables**
4. Click **Add New**
5. Nhập từng biến theo format trên
6. Chọn environment (Production, Preview, Development)
7. Click **Save**
8. **Redeploy** project để áp dụng thay đổi

## Lưu ý:

- Sau khi thêm environment variables, **phải redeploy** để áp dụng
- Kiểm tra logs trong Vercel để đảm bảo variables được load đúng
- Có thể test bằng cách console.log trong code để verify

