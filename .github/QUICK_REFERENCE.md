# ⚡ CI/CD Quick Reference Card

## 🚀 Start Here

### 1. Push Workflows

```bash
cd d:\training-code\healthcare-system
git add .github/
git commit -m "feat: Add CI/CD workflows"
git push origin feature-phai
```

### 2. Enable on GitHub

- Go to: Settings → Actions
- Ensure "Allow all actions" is selected

### 3. Test First Run

```bash
git commit --allow-empty -m "test: trigger CI/CD"
git push origin feature-phai
# Go to GitHub → Actions tab
```

---

## 📋 4 Main Workflows

| Workflow     | File           | Trigger       | What It Does             |
| ------------ | -------------- | ------------- | ------------------------ |
| **CI/CD**    | `ci-cd.yml`    | Push/PR       | Test, build, push Docker |
| **Deploy**   | `deploy.yml`   | CI passed     | Deploy to prod/staging   |
| **Security** | `security.yml` | Weekly + push | Scan vulnerabilities     |
| **Tests**    | `tests.yml`    | Push/PR       | Run all tests            |

---

## 🔧 Essential Secrets (if deploying)

Go to **Settings → Secrets and variables → Actions**

```
DEPLOY_HOST=your_server_ip
DEPLOY_USER=ssh_user
DEPLOY_KEY=private_ssh_key_contents
DEPLOY_PORT=22
DEPLOY_PATH=/home/user/healthcare-system
```

---

## 📊 View Status

- **GitHub Actions tab** - All runs
- **Pull Request** - Status checks
- **Commit page** - Workflow badge
- **CLI:** `gh run list`

---

## 🔍 Troubleshooting

| Problem              | Solution                                                                         |
| -------------------- | -------------------------------------------------------------------------------- |
| Workflow not running | Check branch name matches `on.push.branches`                                     |
| Tests fail           | Run locally first: `npm test`                                                    |
| Docker build fails   | Test locally: `docker build -f healthcare-backend/Dockerfile healthcare-backend` |
| Secrets not working  | Verify they're set: Settings → Secrets                                           |
| SSH deployment fails | Test SSH: `ssh -i key user@host`                                                 |

---

## 🛠️ Common Commands

```bash
# Local testing before push
npm install
npm test
npm run build

# GitHub CLI
gh workflow run ci-cd.yml -r main
gh run list
gh run view <id> --log

# Skip CI
git commit -m "docs: update [skip ci]"
```

---

## 📖 Full Documentation

| File                  | Content                |
| --------------------- | ---------------------- |
| `README.md`           | Overview & quick start |
| `SETUP_GUIDE.md`      | Complete setup guide   |
| `DEPLOYMENT_GUIDE.md` | SSH deployment         |
| `CLI_COMMANDS.md`     | GitHub CLI reference   |
| `CHECKLIST.md`        | Implementation steps   |

---

## ✅ What Gets Tested

- ✅ Backend tests (Jest)
- ✅ Frontend build & lint
- ✅ Docker image security
- ✅ Code quality (optional)
- ✅ Dependencies (weekly)

---

## 🐳 Docker Images

Pushed to: `ghcr.io/your-username/healthcare-*:main`

Pull with:

```bash
docker pull ghcr.io/your-username/healthcare-backend:main
```

---

## 📝 File Structure Added

```
.github/workflows/
├── ci-cd.yml              Main pipeline
├── deploy.yml             Deployment
├── security.yml           Security scanning
└── tests.yml              Testing

healthcare-backend/
├── .eslintrc.json         Linting
├── jest.config.js         Testing config
└── tests/setup.js         Test setup

healthcare-frontend/
└── .eslintrc.json         Linting
```

---

## 🎯 Next Step

👉 **Go to: `.github/README.md` for full overview**

---

**Questions?** See `.github/SETUP_GUIDE.md`  
**Deploying?** See `.github/DEPLOYMENT_GUIDE.md`  
**Need CLI?** See `.github/CLI_COMMANDS.md`
