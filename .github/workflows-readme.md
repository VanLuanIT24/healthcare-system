# Healthcare System - GitHub Actions Workflows

## 📋 Available Workflows

### 1. CI/CD Workflow (`ci-cd.yml`)

**Purpose:** Build, test, and push Docker images

**Triggers:**

- Push to `main`, `develop`, `feature-*` branches
- Pull requests to `main`, `develop`

**Jobs:**

- Backend Tests (Jest with MongoDB)
- Frontend Build & Lint
- Backend Docker Build & Push
- Frontend Docker Build & Push
- Code Quality Analysis (SonarQube)
- Final Notification

### 2. Deploy Workflow (`deploy.yml`)

**Purpose:** Automatic deployment to production/staging

**Triggers:**

- Push to `main` (production)
- Push to `develop` (staging)
- Workflow completion (CI/CD passed)

**Jobs:**

- Production Deployment (via SSH)
- Staging Deployment (via SSH)
- Slack Notifications

### 3. Security Workflow (`security.yml`)

**Purpose:** Security scanning and vulnerability detection

**Triggers:**

- Push to `main`, `develop`
- Pull requests
- Weekly schedule (Sunday 00:00 UTC)

**Jobs:**

- Dependency Scanning (Snyk)
- SAST Analysis (CodeQL)
- Secret Scanning (TruffleHog)
- Docker Image Scanning (Trivy)
- Code Linting

### 4. Tests Workflow (`tests.yml`)

**Purpose:** Comprehensive testing suite

**Triggers:**

- Push to `main`, `develop`, `feature-*`
- Pull requests

**Jobs:**

- Backend Unit Tests
- Frontend Unit Tests
- Integration Tests
- E2E Tests
- Coverage Upload to Codecov

## 🔑 Required GitHub Secrets

### Essential

```
GITHUB_TOKEN  # Automatically provided, no setup needed
```

### For Docker Registry

Choose one option:

**Option 1: GitHub Container Registry (GHCR)**

- No secrets needed! Uses GITHUB_TOKEN

**Option 2: Docker Hub**

```
DOCKER_USERNAME
DOCKER_PASSWORD
REGISTRY=docker.io
```

### For Production Deployment

```
DEPLOY_HOST           # Production server IP
DEPLOY_USER           # SSH user
DEPLOY_KEY            # Private SSH key (without passphrase)
DEPLOY_PORT           # SSH port (default 22)
DEPLOY_PATH           # Path to application directory
```

### For Staging Deployment

```
STAGING_HOST
STAGING_USER
STAGING_KEY
STAGING_PORT
STAGING_PATH
```

### For Enhanced Security (Optional)

```
SONAR_TOKEN           # SonarCloud token
SNYK_TOKEN            # Snyk token
SLACK_WEBHOOK         # Slack webhook for notifications
CODECOV_TOKEN         # Codecov token for coverage reports
```

## 🚀 Docker Image Naming

### GitHub Container Registry (GHCR)

```
ghcr.io/github-username/healthcare-backend:latest
ghcr.io/github-username/healthcare-backend:main
ghcr.io/github-username/healthcare-backend:develop
ghcr.io/github-username/healthcare-backend:sha-abc1234
```

### Docker Hub

```
docker.io/dockerhub-username/healthcare-backend:latest
docker.io/dockerhub-username/healthcare-backend:main
docker.io/dockerhub-username/healthcare-backend:develop
```

## 📊 Status Badges

Add to your README.md:

```markdown
[![CI/CD Status](https://github.com/your-org/healthcare-system/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/your-org/healthcare-system/actions/workflows/ci-cd.yml)

[![Tests Status](https://github.com/your-org/healthcare-system/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/your-org/healthcare-system/actions/workflows/tests.yml)

[![Security Status](https://github.com/your-org/healthcare-system/actions/workflows/security.yml/badge.svg?branch=main)](https://github.com/your-org/healthcare-system/actions/workflows/security.yml)
```

## 🛠️ Customization

### Change Docker Registry

Edit environment variables in workflows:

```yaml
env:
  REGISTRY: docker.io # or ghcr.io
  IMAGE_NAME: your-image-name
```

### Add More Branches

Edit `on.push.branches`:

```yaml
on:
  push:
    branches:
      - main
      - develop
      - staging
      - production
```

### Conditional Jobs

Run jobs only on specific branches:

```yaml
if: github.ref == 'refs/heads/main'
```

### Schedule Security Scans

Edit cron schedule:

```yaml
schedule:
  - cron: "0 0 * * 0" # Every Sunday
  - cron: "0 2 * * *" # Every day at 2 AM
```

## 📈 Performance Tips

### Cache Dependencies

Already configured in workflows. They use:

- `actions/setup-node@v4` with cache
- `actions/setup-python@v4` (if added)

### Parallel Jobs

Most jobs run in parallel. Set `needs` to create dependencies:

```yaml
needs: [backend-test, frontend-build]
```

### Skip Unnecessary Jobs

Add conditions:

```yaml
if: contains(github.event.head_commit.modified, 'healthcare-backend/')
```

## 🔒 Security Best Practices

### SSH Key Setup

1. Generate key without passphrase:

   ```bash
   ssh-keygen -t rsa -b 4096 -f deploy_key -N ""
   ```

2. Add public key to server:

   ```bash
   cat deploy_key.pub >> ~/.ssh/authorized_keys
   ```

3. Add private key to GitHub Secrets:
   ```bash
   cat deploy_key | base64
   # Paste in GitHub Secrets as DEPLOY_KEY
   ```

### Token Rotation

- Rotate SONAR_TOKEN, SNYK_TOKEN periodically
- Use fine-grained personal access tokens
- Never commit secrets to git

### Branch Protection

1. Go to Settings → Branches
2. Add branch protection rule:
   - Require status checks to pass before merging
   - Require at least 1 pull request review
   - Include administrators

## 📝 Troubleshooting

### Workflow Not Triggering

- Check branch name matches `on.push.branches`
- Verify files changed match workflow scope
- Check GitHub Actions is enabled in repository Settings

### Build Failures

1. Check logs in **Actions** tab
2. Look for specific error messages
3. Reproduce locally:
   ```bash
   npm ci
   npm test
   npm run build
   ```

### Docker Push Failures

- Verify registry credentials in Secrets
- Check image naming convention
- Ensure account has push permissions

### Deployment Fails

- Verify server is reachable
- Check SSH key is working: `ssh -i key user@host`
- Verify paths exist: `DEPLOY_PATH`
- Check Docker is running on server

## 📞 Support

For issues or questions:

1. Check workflow logs in GitHub Actions
2. Review the SETUP_GUIDE.md
3. Check GitHub Actions documentation
4. Create an issue in the repository

---

**Last Updated:** December 2024  
**Workflows Version:** 1.0
