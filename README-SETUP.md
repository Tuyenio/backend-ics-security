# Backend ICS Security - Hướng Dẫn Sử Dụng

## Tổng Quan

Backend API cho hệ thống ICS Security được xây dựng bằng NestJS, TypeORM và PostgreSQL (Supabase).

## Cấu Hình

### Database
- **Host:** db.myjjfkwbpbdgmkocobkk.supabase.co
- **Port:** 5432
- **Database:** postgres
- **User:** postgres
- **Project ID:** myjjfkwbpbdgmkocobkk

### Tính Năng Bảo Mật

✅ Mã hóa mật khẩu bằng bcrypt (salt rounds: 10)
✅ JWT authentication với expiration 7 ngày
✅ Password reset với secure token (hết hạn sau 1 giờ)
✅ Validation đầy đủ cho tất cả input
✅ CORS được cấu hình an toàn
✅ SSL connection với database

## Cài Đặt

```bash
# Cài đặt dependencies
pnpm install

# Chạy migrations và seed dữ liệu
pnpm run seed

# Khởi động development server
pnpm run start:dev

# Build production
pnpm run build

# Chạy production
pnpm run start:prod
```

## Tài Khoản Mẫu

### Admin
- **Email:** tt98tuyen@gmail.com
- **Password:** 12345678
- **Role:** admin

### User
- **Email:** tuyenkoikop@gmail.com
- **Password:** 12345678
- **Role:** user
- **Android Times:** 45
- **iOS Times:** 50

## API Endpoints

### Authentication

#### 1. Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "tt98tuyen@gmail.com",
  "password": "12345678"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "tt98tuyen@gmail.com",
    "firstName": "Admin",
    "lastName": "ICS",
    "role": "admin",
    ...
  }
}
```

#### 2. Forgot Password
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "tt98tuyen@gmail.com"
}

Response:
{
  "message": "Email reset mật khẩu đã được gửi"
}
```

#### 3. Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "secure-reset-token",
  "password": "newpassword123"
}

Response:
{
  "message": "Mật khẩu đã được reset thành công"
}
```

## Cấu Trúc Database

### Bảng Users
```sql
CREATE TABLE users (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email                 VARCHAR UNIQUE NOT NULL,
  password              VARCHAR NOT NULL,
  firstName             VARCHAR NOT NULL,
  lastName              VARCHAR NOT NULL,
  role                  ENUM('admin', 'user') DEFAULT 'user',
  country               VARCHAR,
  companyName           VARCHAR,
  position              VARCHAR,
  androidTimes          INT DEFAULT 0,
  iosTimes              INT DEFAULT 0,
  resetPasswordToken    VARCHAR,
  resetPasswordExpires  TIMESTAMP,
  createdAt             TIMESTAMP DEFAULT NOW(),
  updatedAt             TIMESTAMP DEFAULT NOW()
);
```

## Các Lệnh Hữu Ích

```bash
# Xem logs database
pnpm run start:dev

# Chạy lại migrations
pnpm run seed

# Revert migration
pnpm run migration:revert

# Generate migration từ entity changes
pnpm run migration:generate -- src/migrations/MigrationName
```

## Environment Variables

File `.env` cần có các biến sau:

```env
# Server
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=https://myjjfkwbpbdgmkocobkk.supabase.co
SUPABASE_ANON_KEY=...

# Database
DATABASE_URL=postgresql://postgres:123456@db.myjjfkwbpbdgmkocobkk.supabase.co:5432/postgres
DB_HOST=db.myjjfkwbpbdgmkocobkk.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=123456

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tt98tuyen@gmail.com
SMTP_PASS=jlgkasahfsugrqrk

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Testing API

Có thể test API bằng curl hoặc Postman:

```bash
# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tt98tuyen@gmail.com","password":"12345678"}'

# Test với token
curl -X GET http://localhost:3001/api/protected-route \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Lưu Ý Quan Trọng

1. ✅ Mật khẩu được hash trước khi lưu vào database
2. ✅ Reset token có thời hạn 1 giờ
3. ✅ JWT token hết hạn sau 7 ngày
4. ✅ CORS được cấu hình cho frontend
5. ✅ Validation được áp dụng cho tất cả input
6. ✅ Database connection sử dụng SSL

## Troubleshooting

### Không kết nối được database
- Kiểm tra file `.env` có đúng thông tin không
- Đảm bảo IP của bạn được whitelist trong Supabase
- Kiểm tra firewall/network settings

### Migration lỗi
```bash
# Xóa bảng migrations và chạy lại
pnpm run seed
```

### CORS errors
- Kiểm tra `FRONTEND_URL` trong `.env`
- Đảm bảo frontend đang chạy đúng port

## Liên Hệ

Nếu có vấn đề, vui lòng liên hệ team development.
