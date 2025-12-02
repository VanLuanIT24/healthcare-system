# CI/CD Setup Guide for Healthcare System

## 📋 Tổng Quan

Repository này đã được cấu hình để sử dụng GitHub Actions cho CI/CD. Dưới đây là hướng dẫn thiết lập hoàn chỉnh.

## 🔄 Workflows

### 1. **ci-cd.yml** - Pipeline chính

- ✅ Backend Tests (Jest + Supertest)
- ✅ Frontend Build & Lint
- ✅ Docker Build & Push (ghcr.io)
- ✅ Code Quality Analysis (SonarQube - optional)

**Trigger:** Push/PR trên main, develop, feature-\*

### 2. **deploy.yml** - Deployment

- 🚀 Deploy to Production (main branch)
- 🚀 Deploy to Staging (develop branch)

**Trigger:** Push trên main/develop hoặc workflow_run

### 3. **security.yml** - Security Checks

- 🔐 Dependency Scanning (Snyk)
- 🔐 SAST Analysis (CodeQL)
- 🔐 Secret Scanning
- 🔐 Docker Image Scan (Trivy)

**Trigger:** Push/PR/Weekly schedule

### 4. **tests.yml** - Automated Tests

- 🧪 Backend Unit Tests
- 🧪 Frontend Unit Tests
- 🧪 Integration Tests
- 🧪 E2E Tests

**Trigger:** Push/PR

---

## 🛠️ Setup Instructions

### Step 1: Cấu hình Secrets trên GitHub

Vào **Settings → Secrets and variables → Actions** và thêm các secrets sau:

#### 🔓 Bắt Buộc - Container Registry (chọn 1)

**Option A: GitHub Container Registry (GHCR) - Khuyến nghị**

```
Không cần setup - tự động dùng GITHUB_TOKEN
```

**Option B: Docker Hub**

```
DOCKER_USERNAME: your_docker_username
DOCKER_PASSWORD: your_docker_token
REGISTRY: docker.io
```

#### 🚀 Optional - Deployment

```
DEPLOY_HOST: your_server_ip
DEPLOY_USER: your_ssh_user
DEPLOY_KEY: (copy private key from ~/.ssh/id_rsa)
DEPLOY_PORT: 22
DEPLOY_PATH: /home/user/healthcare-system

STAGING_HOST: staging_server_ip
STAGING_USER: staging_user
STAGING_KEY: staging_private_key
STAGING_PORT: 22
STAGING_PATH: /home/user/healthcare-system
```

#### 📊 Optional - Analysis & Monitoring

```
SONAR_TOKEN: your_sonarcloud_token
SNYK_TOKEN: your_snyk_token
SLACK_WEBHOOK: your_slack_webhook_url
CODECOV_TOKEN: your_codecov_token
```

### Step 2: Cấu hình Docker Registry Output

**Nếu dùng Docker Hub**, sửa `ci-cd.yml`:

```yaml
env:
  REGISTRY: docker.io
  IMAGE_NAME: ${{ github.repository_owner }}/healthcare
```

### Step 3: Customize Environment Variables

Tạo `.env.production` cho production deployment:

```bash
cp .env.docker .env.production
# Chỉnh sửa với production credentials
```

---

## 📝 Workflow Details

### CI/CD Pipeline Flow

```
Push to GitHub
    ↓
├─ [Parallel] Backend Tests
│  └─ Install → Lint → Test → Coverage
│
├─ [Parallel] Frontend Build
│  └─ Install → Lint → Build → Artifacts
│
└─ [After Both Pass]
   ├─ Backend Docker Build & Push
   └─ Frontend Docker Build & Push
```

### Deployment Flow

```
Push to main/develop
    ↓
CI/CD Pipeline Passes
    ↓
Deploy Workflow Triggers
    ↓
├─ [if main] Deploy to Production
│  └─ SSH → Pull → Docker Compose Up
│
└─ [if develop] Deploy to Staging
   └─ SSH → Pull → Docker Compose Up
```

---

## 🔐 Security Features

### Secret Scanning

- Tự động quét commits để phát hiện private keys, credentials
- TruffleHog integration
- GitHub Native secret scanning

### Dependency Security

- Snyk scans tất cả npm packages
- CodeQL analyzes code vulnerabilities
- Trivy scans Docker images

### Automated Fixes

Nếu Snyk tìm thấy vulnerabilities, tự động tạo PR:

1. Vào **Settings → Code security → Dependabot**
2. Enable "Dependabot alerts", "Dependabot security updates", "Dependabot version updates"

---

## 📦 Docker Image Registry

### Option 1: GitHub Container Registry (GHCR) - Recommended

Images được push đến:

```
ghcr.io/your-username/healthcare-backend:main
ghcr.io/your-username/healthcare-backend:develop
ghcr.io/your-username/healthcare-backend:sha-abc123
ghcr.io/your-username/healthcare-frontend:main
ghcr.io/your-username/healthcare-frontend:develop
```

**Pull image:**

```bash
docker pull ghcr.io/your-username/healthcare-backend:main
```

**Make image public:**
Settings → Packages → Select Package → Change visibility to Public

### Option 2: Docker Hub

Modify `ci-cd.yml`:

```yaml
env:
  REGISTRY: docker.io
  IMAGE_NAME: yourusername/healthcare
```

---

## 🚀 Manual Workflows

### Re-run CI/CD Pipeline

1. Vào **Actions tab**
2. Select workflow
3. Click "Re-run jobs"

### Manual Deployment

Nếu muốn deploy mà không thay đổi code:

```bash
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

---

## 📊 Monitoring & Badges

### Add Status Badge to README

```markdown
[![CI/CD](https://github.com/your-username/healthcare-system/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/your-username/healthcare-system/actions/workflows/ci-cd.yml)

[![Deploy](https://github.com/your-username/healthcare-system/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-username/healthcare-system/actions/workflows/deploy.yml)

[![Security](https://github.com/your-username/healthcare-system/actions/workflows/security.yml/badge.svg)](https://github.com/your-username/healthcare-system/actions/workflows/security.yml)
```

### View Workflow Status

- **Actions tab**: Xem tất cả workflows và status
- **Pull Requests**: Status checks hiện ở dưới description
- **Commits**: Xem status badge bên cạnh commit hash

---

## 🔧 Troubleshooting

### Workflow không trigger

1. Kiểm tra branch protection rules
2. Kiểm tra `on:` trigger conditions
3. Xem logs ở **Actions → Workflow → Run**

### Docker build fail

```bash
# Debug locally
docker build -f healthcare-backend/Dockerfile healthcare-backend
```

### Tests fail

1. Xem workflow logs
2. Kiểm tra `.env` variables
3. Verify MongoDB version

### Push to registry fail

1. Kiểm tra GITHUB_TOKEN permissions (đã có public scope?)
2. Verify Registry credentials
3. Xem action logs

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Action](https://github.com/docker/build-push-action)
- [Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [SonarCloud](https://sonarcloud.io)
- [Snyk](https://snyk.io)
- [Trivy](https://aquasecurity.github.io/trivy/)

---

## 🎯 Next Steps

1. Push workflows to GitHub
2. Configure Secrets on GitHub Settings
3. Trigger first workflow by pushing to main/develop
4. Monitor Actions tab for logs
5. Set up branch protection rules:
   - Require status checks to pass before merging
   - Require reviews
   - Include administrators

---

## ⚡ Quick Commands

```bash
# Local test backend
cd healthcare-backend
npm test

# Local test frontend
cd healthcare-frontend
npm test

# Build Docker images locally
docker-compose build

# View workflow logs locally (requires gh CLI)
gh workflow view ci-cd
gh run list

# Trigger workflow manually
gh workflow run ci-cd.yml -r main
```
