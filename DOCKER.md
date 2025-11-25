# 🐳 Healthcare System - Docker Deployment Guide

## 📋 Yêu Cầu

- **Docker**: v20.10+
- **Docker Compose**: v1.29+
- **Disk Space**: ~2GB (images + volumes)

### Cài Đặt Docker

**Windows/Mac:**

- Tải [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Cài đặt và khởi chạy

**Linux:**

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

---

## 🚀 Bắt Đầu Nhanh

### 1️⃣ Cấu Hình Environment

```bash
# Copy file cấu hình
cp .env.example .env

# Chỉnh sửa .env với thông tin của bạn
# Đặc biệt thay đổi:
# - MONGO_PASSWORD
# - JWT_ACCESS_SECRET
# - JWT_REFRESH_SECRET
# - SUPER_ADMIN_PASSWORD
```

### 2️⃣ Build & Chạy

#### Windows:

```cmd
docker-setup.bat up
```

#### macOS/Linux:

```bash
chmod +x docker-setup.sh
./docker-setup.sh up
```

#### Hoặc sử dụng docker-compose trực tiếp:

```bash
docker-compose up -d
```

### 3️⃣ Kiểm Tra Containers

```bash
docker-compose ps
```

Output sẽ hiển thị:

```
NAME                 COMMAND                STATUS              PORTS
healthcare_backend   npm start              Up 2 minutes        5000/80
healthcare_frontend  serve -s dist -l 3000 Up 2 minutes        3000/80
healthcare_mongodb   mongod                 Up 2 minutes        27017/80
healthcare_nginx     nginx -g daemon off    Up 2 minutes        80/80, 443/80
```

---

## 🌐 Truy Cập Ứng Dụng

| Dịch Vụ         | URL                            | Mô Tả                |
| --------------- | ------------------------------ | -------------------- |
| **Frontend**    | http://localhost:3000          | Web application      |
| **Backend API** | http://localhost:5000/api      | REST API             |
| **API Docs**    | http://localhost:5000/api-docs | Swagger (if enabled) |
| **Nginx**       | http://localhost               | Reverse proxy        |
| **MongoDB**     | localhost:27017                | Database             |

---

## 📝 Các Lệnh Thường Dùng

### Khởi động/Dừng

```bash
# Khởi động containers
docker-compose up -d

# Dừng containers
docker-compose down

# Dừng và xóa volumes
docker-compose down -v

# Khởi động lại
docker-compose restart
```

### Logs & Debug

```bash
# Xem logs tất cả services
docker-compose logs

# Xem logs của backend
docker-compose logs backend

# Theo dõi logs real-time
docker-compose logs -f

# Xem 100 dòng cuối của logs
docker-compose logs --tail=100
```

### Truy Cập Container

```bash
# Shell vào backend container
docker-compose exec backend sh

# Shell vào frontend container
docker-compose exec frontend sh

# Shell vào MongoDB container
docker-compose exec mongodb mongosh
```

### Xây Dựng Lại Image

```bash
# Build without cache
docker-compose build --no-cache

# Build service cụ thể
docker-compose build --no-cache backend
```

---

## 🔐 Bảo Mật Production

### 1. Thay Đổi Secrets trong .env

```env
# THAY ĐỔI CÁC GIÁ TRỊ NÀY!
MONGO_PASSWORD=YourSecureMongoPassword123!@
JWT_ACCESS_SECRET=YourSecretAccessKey_ChangeThis_12345
JWT_REFRESH_SECRET=YourSecretRefreshKey_ChangeThis_67890
SUPER_ADMIN_PASSWORD=VerySecurePassword!@#$%^&*()
```

### 2. Sử Dụng HTTPS

Bỏ comment trong `nginx.conf`:

```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of config
}
```

### 3. Database Backup

```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --out=/backup

# Restore MongoDB
docker-compose exec mongodb mongorestore /backup
```

---

## 📊 Giám Sát & Health Checks

### Health Check API

```bash
# Backend
curl http://localhost:5000/health

# Frontend
curl http://localhost:3000

# MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Docker Stats

```bash
# Xem resource usage
docker stats

# Chỉ backend
docker stats healthcare_backend
```

---

## 🧹 Dọn Dẹp & Xóa

### Xóa Containers & Volumes

```bash
# Xóa containers, networks
docker-compose down

# Xóa containers, networks, và volumes
docker-compose down -v

# Xóa images cũ
docker image prune -a
```

### Xóa Toàn Bộ (Full Clean)

```bash
# Windows
docker-setup.bat full-clean

# Linux/Mac
./docker-setup.sh full-clean
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Tìm process sử dụng port
# Windows
netstat -ano | findstr :5000

# Linux/Mac
lsof -i :5000

# Hoặc thay đổi port trong docker-compose.yml
# "5001:5000" instead of "5000:5000"
```

### Container Crash/Exit

```bash
# Xem logs chi tiết
docker-compose logs backend

# Xem resource usage
docker stats

# Restart container
docker-compose restart backend
```

### MongoDB Connection Error

```bash
# Kiểm tra MongoDB logs
docker-compose logs mongodb

# Kiểm tra MongoDB status
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Frontend Not Loading

```bash
# Clear browser cache
# Hoặc xóa container và rebuild
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
```

---

## 📈 Scale & Performance

### Tăng Resources

Chỉnh sửa `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 512M
        reservations:
          cpus: "0.5"
          memory: 256M
```

### Database Backup tự động

Tạo script cron (Linux/Mac):

```bash
# Daily backup at 2 AM
0 2 * * * docker-compose exec mongodb mongodump --out=/backups/$(date +\%Y\%m\%d)
```

---

## 🚀 Deployment ke Production

### Sử dụng Docker Registry

```bash
# Build image
docker build -t your-registry/healthcare-backend:1.0.0 ./healthcare-backend

# Push to registry
docker push your-registry/healthcare-backend:1.0.0
```

### Sử dụng Kubernetes

```bash
# Tạo Docker images
docker-compose build

# Sau đó deploy sử dụng kubernetes manifests
kubectl apply -f k8s/
```

---

## 📚 Tài Liệu Thêm

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose](https://docs.docker.com/compose/)
- [MongoDB Docker](https://hub.docker.com/_/mongo)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

## 🤝 Hỗ Trợ

Nếu gặp vấn đề:

1. Kiểm tra Docker logs
2. Đọc file này kỹ lưỡng
3. Mở issue trên GitHub
