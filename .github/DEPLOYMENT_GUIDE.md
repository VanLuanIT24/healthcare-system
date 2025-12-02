# 🚀 GitHub Actions Deployment Guide

## 📋 Prerequisites

- Linux server (Ubuntu/Debian/CentOS) với Docker & Docker Compose
- SSH access to server
- GitHub repository with admin access

## 🔑 Step 1: Generate SSH Key for Deployment

On your local machine:

```bash
# Generate SSH key (without passphrase - important!)
ssh-keygen -t rsa -b 4096 -f deploy_key -N ""

# This creates:
# - deploy_key (private key - for GitHub Secrets)
# - deploy_key.pub (public key - for server)
```

## 🖥️ Step 2: Setup Server

### Add Public Key to Server

```bash
# On your local machine, copy public key
cat deploy_key.pub | pbcopy  # Mac
# or
type deploy_key.pub | clip   # Windows PowerShell
# or
cat deploy_key.pub            # Linux (then copy manually)

# SSH into your server
ssh -u root@your_server_ip

# Add public key
mkdir -p ~/.ssh
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Exit server
exit
```

### Create Deployment Directory

```bash
ssh -i deploy_key ubuntu@your_server_ip

# Create app directory
sudo mkdir -p /home/ubuntu/healthcare-system
sudo chown ubuntu:ubuntu /home/ubuntu/healthcare-system

# Clone repository
cd /home/ubuntu/healthcare-system
git clone https://github.com/your-org/healthcare-system.git .

# Create .env file for production
nano .env.production
# Add production environment variables

exit
```

### Install Docker & Docker Compose (if not already installed)

```bash
ssh -i deploy_key ubuntu@your_server_ip

# Install Docker
sudo apt update
sudo apt install -y docker.io docker-compose

# Add current user to docker group
sudo usermod -aG docker ubuntu
newgrp docker

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

exit
```

## 🔐 Step 3: Add Secrets to GitHub

### Option A: Using Web UI

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **"New repository secret"** and add each:

```
Name: DEPLOY_HOST
Value: your_server_ip (e.g., 192.168.1.100)
```

```
Name: DEPLOY_USER
Value: ubuntu  # or your SSH user
```

```
Name: DEPLOY_KEY
Value: [contents of deploy_key - the private key]
```

```
Name: DEPLOY_PORT
Value: 22  # or your SSH port
```

```
Name: DEPLOY_PATH
Value: /home/ubuntu/healthcare-system
```

### Option B: Using GitHub CLI

```bash
# Install GitHub CLI
# From https://cli.github.com/

# Authenticate
gh auth login

# Add secrets
gh secret set DEPLOY_HOST --body "your_server_ip"
gh secret set DEPLOY_USER --body "ubuntu"
gh secret set DEPLOY_KEY --body "$(cat deploy_key)"
gh secret set DEPLOY_PORT --body "22"
gh secret set DEPLOY_PATH --body "/home/ubuntu/healthcare-system"
```

### Option C: Using SSH Config

For easier SSH management, edit local `~/.ssh/config`:

```
Host healthcare-prod
    HostName your_server_ip
    User ubuntu
    IdentityFile ~/.ssh/deploy_key
    StrictHostKeyChecking no
```

Then test:

```bash
ssh healthcare-prod "echo 'SSH connection successful'"
```

## 🧪 Step 4: Test Manual Deployment

Before automating, test manual deployment:

```bash
# SSH into server
ssh -i deploy_key ubuntu@your_server_ip

# Navigate to app
cd /home/ubuntu/healthcare-system

# Pull latest code
git pull origin main

# Load environment variables
set -a
source .env.production
set +a

# Pull latest Docker images
docker-compose pull

# Start/update containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

exit
```

## 🤖 Step 5: Configure GitHub Actions for Deployment

The workflow files are already configured! Just ensure:

1. **deploy.yml** uses your secrets correctly
2. **Secrets are set** on GitHub (Step 3)
3. **Server is accessible** via SSH

### How Deployment Works

When you push to `main` or `develop`:

```
Git Push
    ↓
CI/CD Pipeline (tests pass)
    ↓
Deploy Workflow Triggers
    ↓
SSH Connection (using DEPLOY_KEY)
    ↓
cd DEPLOY_PATH
git pull origin [branch]
docker-compose pull
docker-compose up -d
    ↓
Deployment Complete ✅
```

## 📊 Monitoring Deployments

### View Deployment Logs

1. Go to GitHub → **Actions** tab
2. Click on **deploy** workflow
3. Click on the latest run
4. Expand the job to see logs

### SSH into Server & Check Status

```bash
ssh -i deploy_key ubuntu@your_server_ip

# Check if containers are running
docker-compose ps

# View service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Check if API is responding
curl http://localhost:5000/health

# Check frontend is serving
curl http://localhost:3000

exit
```

### Common Checks

```bash
# SSH to server
ssh -i deploy_key ubuntu@your_server_ip

# 1. Verify Docker images are present
docker images | grep healthcare

# 2. Check container status
docker-compose ps

# 3. View recent logs
docker-compose logs --tail=50

# 4. Test API endpoints
curl -X GET http://localhost:5000/api/health

# 5. Check disk space
df -h

# 6. Check memory usage
free -h

exit
```

## 🔄 Database Migrations

If you need to run migrations on deployment, edit `deploy.yml`:

```yaml
script: |
  cd ${{ secrets.DEPLOY_PATH }}
  git pull origin main
  docker-compose pull
  docker-compose up -d
  # Run migrations
  docker-compose exec -T backend npm run migrate || true
```

## 🛑 Rollback Deployment

If deployment fails, you can quickly rollback:

```bash
# SSH to server
ssh -i deploy_key ubuntu@your_server_ip

cd /home/ubuntu/healthcare-system

# View git history
git log --oneline -n 10

# Rollback to previous commit
git checkout <previous-commit-hash>

# Restart containers
docker-compose down
docker-compose up -d

exit
```

Or use GitHub Actions to revert:

```bash
# Go back to working commit
git revert <bad-commit-hash>
git push origin main
# Let GitHub Actions deploy the revert
```

## 🆘 Troubleshooting

### SSH Connection Fails

```bash
# Test SSH connection locally
ssh -i deploy_key -v ubuntu@your_server_ip

# Check if key has correct permissions
ls -la ~/.ssh/deploy_key
# Should be: -rw------- (600)

# Check server side
ssh ubuntu@your_server_ip
ls -la ~/.ssh/authorized_keys
# Should be: -rw------- (600)
```

### Workflow Fails with "Permission denied"

1. Verify SSH key is correct:

   ```bash
   # Locally
   ssh-keygen -y -f deploy_key > deploy_key.pub
   # Compare with server's authorized_keys
   ```

2. Check GitHub Secret value:

   - Settings → Secrets → DEPLOY_KEY
   - Should contain entire contents of deploy_key file
   - No newlines at end

3. Test connectivity:
   ```bash
   # In workflow logs, it might show:
   # Permission denied (publickey)
   # → Check DEPLOY_KEY secret value
   ```

### Docker Commands Fail

```bash
# SSH to server and check
ssh -i deploy_key ubuntu@your_server_ip

# Verify docker works
docker ps

# Check user permissions
groups ubuntu
# Should include: docker

# If not, add user to docker group:
sudo usermod -aG docker ubuntu
newgrp docker

exit
```

### Port Already in Use

```bash
# Find what's using ports
sudo lsof -i :5000    # Backend
sudo lsof -i :3000    # Frontend
sudo lsof -i :27017   # MongoDB

# Stop conflicting container
docker stop container_name

# Or use different ports in .env.production
```

## 🔐 Security Best Practices

1. **Never commit deploy_key**

   ```bash
   echo "deploy_key" >> .gitignore
   ```

2. **Limit SSH key permissions**

   - Key is only for deployment
   - Use different keys for different servers
   - Rotate keys periodically

3. **Use SSH key passphrase for local development**

   ```bash
   # Generate with passphrase
   ssh-keygen -t rsa -b 4096 -f deploy_key
   # Keep password secure!
   ```

   - But GitHub Secrets must have the passphrase-less version

4. **Restrict server access**

   ```bash
   # Only allow SSH from GitHub CI IP ranges
   # Or allow only from your office IP
   ```

5. **Monitor deployments**
   - Check logs after each deployment
   - Set up monitoring/alerts
   - Use Slack notifications

## 📝 Deployment Checklist

Before first deployment:

- [ ] SSH key generated without passphrase
- [ ] Public key added to `~/.ssh/authorized_keys` on server
- [ ] Tested SSH manually: `ssh -i deploy_key user@host`
- [ ] Created deployment directory on server
- [ ] Cloned repository to server
- [ ] Created `.env.production` on server
- [ ] Docker & Docker Compose installed on server
- [ ] All 5 secrets added to GitHub
- [ ] Tested manual deployment workflow
- [ ] Reviewed `deploy.yml` workflow
- [ ] Set up monitoring/alerts
- [ ] Documented server access info

## 🎊 Deployment Complete!

Your healthcare system now has:
✅ Automated testing on every push
✅ Automated deployment on main/develop
✅ One-command rollback if needed
✅ Production-grade CI/CD pipeline

## 📞 Support

For SSH issues:

- Check GitHub Actions workflow logs
- Test SSH command locally first
- Review ~/.ssh/config and authorized_keys
- Verify firewall allows port 22 (or custom port)

---

**Happy Deploying!** 🚀
