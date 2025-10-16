# Zuna Xosokeno Admin Panel

Admin Panel cho ứng dụng xổ số Keno MERN Stack.

## 🚀 Tính năng chính

### 📊 Dashboard

- Tổng quan hệ thống
- Thống kê người dùng, game, cược, nạp tiền
- Hoạt động gần đây
- Biểu đồ thống kê

### 👥 Quản lý người dùng

- Danh sách người dùng với filter
- Xem chi tiết thông tin
- Khóa/mở khóa tài khoản
- Cập nhật thông tin người dùng
- Xóa người dùng (Super Admin)

### 🎮 Quản lý Game

- Danh sách game với filter
- Tạo game mới
- Cập nhật game
- Tạo kết quả game
- Xóa game
- Thống kê game

### 🎯 Quản lý Cược

- Xem tất cả cược của người dùng
- Filter theo trạng thái
- Xem chi tiết cược
- Thống kê cược

### 💰 Quản lý Nạp tiền

- Danh sách yêu cầu nạp tiền
- Xác nhận/từ chối nạp tiền
- Filter theo trạng thái
- Thống kê giao dịch

### 💳 Quản lý QR Code

- Danh sách QR code
- Thêm QR code mới
- Cập nhật thông tin QR code
- Xóa QR code
- Upload hình ảnh QR code

### 🎁 Quản lý Khuyến mãi

- Danh sách khuyến mãi
- Tạo khuyến mãi mới
- Cập nhật khuyến mãi
- Xóa khuyến mãi
- Upload banner khuyến mãi

### 🖼️ Quản lý Banner

- Danh sách banner
- Thêm banner mới
- Cập nhật banner
- Xóa banner
- Upload hình ảnh banner
- Quản lý vị trí hiển thị

### ⚙️ Cài đặt hệ thống

- Cài đặt chung
- Cấu hình game
- Cài đặt tài chính
- Chế độ bảo trì

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **Forms**: React Hook Form

## 📦 Cài đặt

### 1. Cài đặt dependencies

```bash
cd admin
npm install
```

### 2. Chạy development server

```bash
npm run dev
```

Admin panel sẽ chạy trên `http://localhost:3001`

### 3. Build cho production

```bash
npm run build
```

## 🔐 Đăng nhập

### Demo Account

- **Email**: admin@zuna-xosokeno.com
- **Password**: admin123

### Super Admin Account

- **Email**: admin@zuna-xosokeno.com
- **Password**: admin123

## 📱 Responsive Design

Admin panel được thiết kế responsive với:

- **Desktop**: Sidebar cố định
- **Tablet**: Sidebar có thể thu gọn
- **Mobile**: Sidebar overlay

## 🎨 UI Components

### Buttons

- Primary, Secondary, Destructive
- Small, Medium, Large sizes
- With icons support

### Cards

- Standard card layout
- Header, content, footer sections

### Tables

- Sortable columns
- Pagination
- Filter support
- Action buttons

### Forms

- Input validation
- Error handling
- File upload support

## 🔄 State Management

Sử dụng Zustand stores:

- `useAuthStore`: Authentication
- `useDashboardStore`: Dashboard data
- `useUsersStore`: User management
- `useGamesStore`: Game management
- `useDepositsStore`: Deposit management
- `useQRCodesStore`: QR code management
- `useBannersStore`: Banner management
- `usePromotionsStore`: Promotion management

## 📊 Real-time Updates

- Socket.io integration
- Real-time notifications
- Live data updates
- Auto-refresh functionality

## 🔒 Security Features

- JWT authentication
- Role-based access control
- Protected routes
- API request validation
- Error handling

## 🔧 Proxy Configuration

Admin panel đã được cấu hình proxy để che giấu backend URL trong development:

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
    secure: false,
  },
  '/socket.io': {
    target: 'http://localhost:5000',
    changeOrigin: true,
    ws: true,
  },
}
```

**Lợi ích:**

- ✅ Che giấu backend URL khỏi frontend
- ✅ Tránh CORS issues
- ✅ Dễ dàng development
- ✅ Bảo mật tốt hơn

## 🚀 Deployment

### Environment Variables

Tạo file `.env` từ `.env.example`:

```bash
cp env.example .env
```

Cấu hình các biến môi trường trong file `.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=Zuna Xosokeno Admin
VITE_APP_VERSION=1.0.0

# Environment
VITE_NODE_ENV=development

# Features Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true

# File Upload
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Pagination
VITE_DEFAULT_PAGE_SIZE=20
VITE_MAX_PAGE_SIZE=100

# Real-time Updates
VITE_ENABLE_REALTIME=true
VITE_SOCKET_RECONNECT_ATTEMPTS=5
VITE_SOCKET_RECONNECT_DELAY=1000

# UI Configuration
VITE_DEFAULT_THEME=light
VITE_ENABLE_DARK_MODE=true

# Security
VITE_ENABLE_CSRF_PROTECTION=true
VITE_TOKEN_REFRESH_INTERVAL=300000
```

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 📁 Cấu trúc dự án

```
admin/
├── src/
│   ├── components/
│   │   └── Layout.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Users.jsx
│   │   ├── Games.jsx
│   │   ├── Bets.jsx
│   │   ├── Deposits.jsx
│   │   ├── QRCodes.jsx
│   │   ├── Promotions.jsx
│   │   ├── Banners.jsx
│   │   └── Settings.jsx
│   ├── stores/
│   │   └── index.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
└── index.html
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.
