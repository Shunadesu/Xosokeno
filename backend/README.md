# Zuna Xosokeno Backend

Backend API cho ứng dụng xổ số Keno MERN Stack.

## 🚀 Tính năng chính

### 🔐 Authentication & Authorization

- Đăng ký/Đăng nhập với JWT
- Xác thực email/SMS
- Quên mật khẩu
- Refresh token
- Role-based access control (User, Admin, Super Admin)

### 🎮 Game System

- 4 loại trò chơi: Keno, Big/Small, Even/Odd, Special
- Quản lý game real-time
- Tự động tính toán kết quả
- Lịch sử game

### 💰 Wallet System

- Nạp tiền qua QR Code
- Quản lý QR Code (Admin)
- Xác nhận giao dịch thủ công
- Hệ thống khuyến mãi
- Lịch sử giao dịch

### 🎯 Betting System

- Đặt cược real-time
- Tính toán tiền thắng tự động
- Lịch sử cược
- Thống kê

### 🖼️ Banner Management

- Quản lý banner (Admin)
- Upload hình ảnh với Cloudinary
- Tùy chỉnh hiển thị
- Thống kê click/view

### 📊 Admin Panel

- Dashboard tổng quan
- Quản lý người dùng
- Quản lý game
- Quản lý giao dịch
- Thống kê hệ thống

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB với Mongoose
- **Authentication**: JWT + bcrypt
- **File Upload**: Cloudinary + Multer
- **Real-time**: Socket.io
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## 📦 Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd backend
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình environment variables

```bash
cp env.example .env
```

Chỉnh sửa file `.env` với thông tin của bạn:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/zuna-xosokeno

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_REFRESH_EXPIRE=30d

# Frontend URLs
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

### 4. Chạy server

```bash
# Development
npm run dev

# Production
npm start
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu
- `POST /api/auth/refresh-token` - Refresh token
- `POST /api/auth/verify-email` - Xác thực email
- `POST /api/auth/verify-phone` - Xác thực SMS

### User Endpoints

- `GET /api/users/profile` - Lấy thông tin profile
- `PUT /api/users/profile` - Cập nhật profile
- `PUT /api/users/change-password` - Đổi mật khẩu
- `GET /api/users/stats` - Thống kê người dùng
- `GET /api/users/favorite-numbers` - Số yêu thích
- `PUT /api/users/favorite-numbers` - Cập nhật số yêu thích
- `PUT /api/users/preferences` - Cập nhật preferences

### Game Endpoints

- `GET /api/games` - Lấy danh sách game
- `GET /api/games/active` - Game đang hoạt động
- `GET /api/games/upcoming` - Game sắp tới
- `GET /api/games/completed` - Game đã hoàn thành
- `GET /api/games/:id` - Chi tiết game
- `GET /api/games/:id/stats` - Thống kê game
- `POST /api/games` - Tạo game (Admin)
- `PUT /api/games/:id` - Cập nhật game (Admin)
- `DELETE /api/games/:id` - Xóa game (Admin)

### Bet Endpoints

- `GET /api/bets` - Lấy danh sách cược
- `GET /api/bets/user` - Cược của user
- `GET /api/bets/game/:gameId` - Cược của game
- `GET /api/bets/winning/:gameId` - Cược thắng
- `GET /api/bets/stats` - Thống kê cược
- `GET /api/bets/:id` - Chi tiết cược
- `POST /api/bets` - Đặt cược
- `POST /api/bets/:id/cancel` - Hủy cược

### Wallet Endpoints

- `GET /api/wallet/balance` - Số dư
- `GET /api/wallet/transactions` - Lịch sử giao dịch
- `GET /api/wallet/transactions/:id` - Chi tiết giao dịch
- `GET /api/wallet/stats` - Thống kê ví
- `GET /api/wallet/balance-history` - Lịch sử số dư

### Deposit Endpoints

- `GET /api/deposits` - Lấy danh sách nạp tiền
- `GET /api/deposits/:id` - Chi tiết nạp tiền
- `POST /api/deposits` - Tạo yêu cầu nạp tiền
- `PUT /api/deposits/:id/status` - Cập nhật trạng thái (Admin)
- `POST /api/deposits/:id/confirm` - Xác nhận nạp tiền (Admin)
- `POST /api/deposits/:id/reject` - Từ chối nạp tiền (Admin)

### QR Code Endpoints

- `GET /api/qr-codes/active` - QR Code hoạt động
- `GET /api/qr-codes/amount/:amount` - QR Code theo số tiền
- `GET /api/qr-codes/:id` - Chi tiết QR Code
- `GET /api/qr-codes` - Danh sách QR Code (Admin)
- `POST /api/qr-codes` - Tạo QR Code (Admin)
- `PUT /api/qr-codes/:id` - Cập nhật QR Code (Admin)
- `DELETE /api/qr-codes/:id` - Xóa QR Code (Admin)

### Promotion Endpoints

- `GET /api/promotions/active` - Khuyến mãi hoạt động
- `GET /api/promotions/applicable` - Khuyến mãi áp dụng
- `GET /api/promotions` - Danh sách khuyến mãi (Admin)
- `GET /api/promotions/stats` - Thống kê khuyến mãi (Admin)
- `GET /api/promotions/:id` - Chi tiết khuyến mãi (Admin)
- `POST /api/promotions` - Tạo khuyến mãi (Admin)
- `PUT /api/promotions/:id` - Cập nhật khuyến mãi (Admin)
- `DELETE /api/promotions/:id` - Xóa khuyến mãi (Admin)

### Banner Endpoints

- `GET /api/banners` - Danh sách banner
- `GET /api/banners/active` - Banner hoạt động
- `GET /api/banners/type/:type` - Banner theo loại
- `GET /api/banners/game` - Banner game
- `GET /api/banners/:id` - Chi tiết banner
- `POST /api/banners/:id/view` - Tăng view count
- `POST /api/banners/:id/click` - Tăng click count
- `POST /api/banners` - Tạo banner (Admin)
- `PUT /api/banners/:id` - Cập nhật banner (Admin)
- `DELETE /api/banners/:id` - Xóa banner (Admin)

### Admin Endpoints

- `GET /api/admin/dashboard` - Dashboard admin
- `GET /api/admin/stats` - Thống kê hệ thống
- `GET /api/admin/settings` - Cài đặt hệ thống
- `PUT /api/admin/settings` - Cập nhật cài đặt
- `GET /api/admin/logs` - Log hệ thống
- `GET /api/admin/users` - Danh sách user
- `GET /api/admin/users/:id` - Chi tiết user
- `PUT /api/admin/users/:id` - Cập nhật user
- `DELETE /api/admin/users/:id` - Xóa user (Super Admin)

## 🔌 Socket.io Events

### Client Events

- `join_game` - Tham gia game
- `leave_game` - Rời game
- `place_bet` - Đặt cược
- `deposit_created` - Tạo yêu cầu nạp tiền

### Server Events

- `game_update` - Cập nhật game
- `game_result` - Kết quả game
- `bet_placed` - Xác nhận đặt cược
- `bet_won` - Thông báo thắng
- `bet_lost` - Thông báo thua
- `deposit_confirmed` - Xác nhận nạp tiền
- `balance_updated` - Cập nhật số dư
- `new_bet` - Cược mới (Admin)
- `new_deposit` - Nạp tiền mới (Admin)

## 🗄️ Database Models

### User

- Thông tin người dùng
- Xác thực và bảo mật
- Preferences và settings

### Game

- Thông tin game
- Kết quả và trạng thái
- Cấu hình payout

### Bet

- Thông tin cược
- Kết quả và tiền thắng
- Lịch sử cược

### QRCode

- Thông tin QR Code
- Thống kê sử dụng
- Cấu hình ngân hàng

### Deposit

- Yêu cầu nạp tiền
- Trạng thái xác nhận
- Lịch sử giao dịch

### Promotion

- Thông tin khuyến mãi
- Điều kiện áp dụng
- Thống kê sử dụng

### Banner

- Thông tin banner
- Cấu hình hiển thị
- Thống kê click/view

## 🔒 Security Features

- JWT Authentication
- Password hashing với bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection protection
- XSS protection

## 📊 Monitoring & Logging

- Morgan HTTP logging
- Error handling middleware
- Request validation
- Performance monitoring
- Health check endpoint

## 🚀 Deployment

### Environment Variables

Đảm bảo cấu hình đúng các biến môi trường:

- Database connection
- JWT secrets
- Cloudinary credentials
- Email/SMS configuration

### Production Checklist

- [ ] Cấu hình MongoDB production
- [ ] Setup Cloudinary account
- [ ] Cấu hình email service
- [ ] Setup SMS service (Twilio)
- [ ] Cấu hình CORS cho production
- [ ] Setup SSL certificate
- [ ] Cấu hình rate limiting
- [ ] Setup monitoring

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.





