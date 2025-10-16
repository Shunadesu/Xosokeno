# XOSOKENOVN.COM Frontend

Frontend cho ứng dụng xổ số Keno, được xây dựng với React + Vite + TailwindCSS.

## Tính năng

- 🎮 **Trang chủ**: Hiển thị các banner game với thiết kế đẹp mắt
- 💰 **Ví tiền**: Quản lý số dư và nạp tiền qua QR code
- 📱 **Responsive**: Tối ưu cho mobile và desktop
- 🔐 **Authentication**: Đăng nhập/đăng ký với JWT
- 📊 **Real-time**: Cập nhật dữ liệu real-time

## Công nghệ sử dụng

- **React 18**: UI framework
- **Vite**: Build tool và dev server
- **TailwindCSS**: CSS framework
- **Zustand**: State management
- **Axios**: HTTP client
- **React Router**: Routing
- **Lucide React**: Icons
- **React Hot Toast**: Notifications

## Cài đặt

1. Cài đặt dependencies:

```bash
npm install
```

2. Copy file environment:

```bash
cp env.example .env
```

3. Chạy development server:

```bash
npm run dev
```

4. Build cho production:

```bash
npm run build
```

## Cấu trúc thư mục

```
src/
├── components/          # Reusable components
│   ├── Layout.jsx      # Main layout
│   ├── Header.jsx      # App header
│   ├── BottomNavigation.jsx  # Bottom navigation
│   ├── GameBanner.jsx  # Game banner component
│   └── DepositModal.jsx # Deposit modal
├── pages/              # Page components
│   ├── Home.jsx        # Homepage
│   ├── Login.jsx       # Login page
│   ├── Register.jsx    # Register page
│   ├── Wallet.jsx      # Wallet page
│   ├── CustomerService.jsx # Customer service
│   └── Profile.jsx     # User profile
├── stores/             # Zustand stores
│   └── index.js        # All stores
├── config/             # Configuration
│   └── index.js        # App config
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Luồng nạp tiền

1. User chọn "Nạp tiền" trong ví
2. Chọn phương thức nạp (QR code)
3. Hiển thị thông tin chuyển khoản và QR code
4. User nhập số tiền và ghi chú
5. User upload ảnh chụp màn hình giao dịch
6. Gửi yêu cầu nạp tiền
7. Admin xác nhận trong admin panel
8. User nhận tiền vào tài khoản

## API Integration

Frontend kết nối với backend qua proxy trong Vite config:

- `/api/*` → `http://localhost:5000/api/*`
- `/socket.io/*` → `http://localhost:5000/socket.io/*`

## Environment Variables

Xem file `env.example` để biết các biến môi trường cần thiết.

## Development

```bash
# Chạy dev server
npm run dev

# Lint code
npm run lint

# Preview build
npm run preview
```

## Production

```bash
# Build
npm run build

# Files sẽ được tạo trong thư mục dist/
```


