# 🔧 GitHub CLI Commands for CI/CD Management

## 📦 Installation

### Windows (PowerShell)

```powershell
# Using Chocolatey
choco install gh

# Using scoop
scoop install gh

# Or download from https://github.com/cli/cli/releases
```

### macOS

```bash
brew install gh
```

### Linux (Ubuntu/Debian)

```bash
curl -fsSLo ~/Downloads/gh_linux_amd64.tar.gz https://github.com/cli/cli/releases/download/v2.32.1/gh_2.32.1_linux_amd64.tar.gz
tar -C /usr/local -xzf ~/Downloads/gh_linux_amd64.tar.gz
/usr/local/gh_2.32.1_linux_amd64/bin/gh --version
```

## 🔐 Login

```bash
# Interactive login
gh auth login

# Use GitHub Token (non-interactive)
echo $GITHUB_TOKEN | gh auth login --with-token
```

## 📊 View Workflows

```bash
# List all workflows
gh workflow list

# View specific workflow
gh workflow view ci-cd

# View workflow runs
gh workflow view ci-cd --json runs

# View all runs (any workflow)
gh run list

# View runs for specific workflow
gh run list --workflow=ci-cd.yml

# View only failed runs
gh run list --status=failure

# View only successful runs
gh run list --status=success
```

## ▶️ Trigger Workflows

```bash
# Run workflow manually
gh workflow run ci-cd.yml

# Run on specific branch
gh workflow run ci-cd.yml -r main

# Run deploy workflow
gh workflow run deploy.yml -r main

# Run security checks
gh workflow run security.yml -r main

# View workflow run inputs
gh workflow view ci-cd.yml --json eventDispatch
```

## 🔄 Monitor Runs

```bash
# Get latest run
gh run list --limit=1

# Get latest run ID
LATEST_RUN=$(gh run list --limit=1 --json databaseId --jq '.[0].databaseId')

# View specific run details
gh run view $LATEST_RUN

# View run logs
gh run view $LATEST_RUN --log

# View run logs (with timestamps)
gh run view $LATEST_RUN --log --verbose

# Follow run in real-time
gh run watch $LATEST_RUN
```

## 📋 Debugging Runs

```bash
# View run in browser
gh run view $LATEST_RUN --web

# Get run status
gh run view $LATEST_RUN --json status

# Get all run information
gh run view $LATEST_RUN --json status,startedAt,completedAt,conclusion

# Check specific job logs
gh run view $LATEST_RUN --job=<job-id>

# List all jobs in run
gh run view $LATEST_RUN --json jobs
```

## 🔄 Retry Runs

```bash
# Re-run all failed jobs
gh run rerun $LATEST_RUN --failed

# Re-run all jobs
gh run rerun $LATEST_RUN

# Re-run failed jobs interactively
gh run rerun $LATEST_RUN --failed --debug
```

## 🗑️ Cancel/Delete Runs

```bash
# Cancel a run
gh run cancel $LATEST_RUN

# Delete a run
gh run delete $LATEST_RUN

# Cancel multiple runs
gh run list --status=in_progress --jq '.[].databaseId' | xargs -I {} gh run cancel {}
```

## 🔐 Manage Secrets

```bash
# List all secrets
gh secret list

# Add a secret
gh secret set MY_SECRET --body "secret_value"

# Add secret from file
gh secret set MY_SECRET < file.txt

# Add secret interactively
gh secret set MY_SECRET  # Will prompt for value

# Remove a secret
gh secret delete MY_SECRET

# Verify secret exists
gh secret list | grep MY_SECRET
```

### Example: Add Deployment Secrets

```bash
# Read private key
SSH_KEY=$(cat ~/.ssh/deploy_key)

# Add secrets
gh secret set DEPLOY_HOST --body "192.168.1.100"
gh secret set DEPLOY_USER --body "ubuntu"
gh secret set DEPLOY_KEY --body "$SSH_KEY"
gh secret set DEPLOY_PORT --body "22"
gh secret set DEPLOY_PATH --body "/home/ubuntu/healthcare-system"
```

## 🌳 Branch Management

```bash
# List branches
gh repo view --json branches

# View branch protection rules
gh api repos/{owner}/{repo}/branches/main/protection

# List pull requests
gh pr list

# Create pull request
gh pr create --title "Feature: Add new endpoint" --body "This PR adds..."

# Merge pull request
gh pr merge --auto  # Auto-merge when checks pass
```

## 🔍 View Repository Info

```bash
# View repo info
gh repo view

# View repo URL
gh repo view --json url

# View repo visibility
gh repo view --json isPrivate

# View collaborators
gh repo view --json collaborators
```

## 📊 Common Workflows

### Check All Workflows Status

```bash
# PowerShell
gh workflow list | ForEach-Object {
    $name = $_.Split()[0]
    Write-Host "Workflow: $name"
    gh run list --workflow=$name --limit=1
}

# Bash
gh workflow list | awk '{print $NF}' | while read name; do
    echo "Workflow: $name"
    gh run list --workflow="$name" --limit=1
done
```

### Get Latest Run Details

```bash
# Get latest run of ci-cd workflow
LATEST=$(gh run list --workflow=ci-cd.yml --limit=1 --json databaseId --jq '.[0].databaseId')

# View details
gh run view $LATEST --json status,startedAt,completedAt,conclusion

# Output:
# {
#   "status": "completed",
#   "startedAt": "2024-12-02T10:30:00Z",
#   "completedAt": "2024-12-02T10:45:30Z",
#   "conclusion": "success"
# }
```

### Monitor Deployment

```bash
# Watch deploy workflow
gh workflow run deploy.yml -r main
gh run watch

# Or get ID and watch specific run
RUN_ID=$(gh run list --workflow=deploy.yml --limit=1 --json databaseId --jq '.[0].databaseId')
gh run watch $RUN_ID
```

### Trigger CI/CD and Wait

```bash
# PowerShell script
$workflow = "ci-cd.yml"
gh workflow run $workflow -r main

# Wait a moment for run to start
Start-Sleep -Seconds 5

# Get latest run
$run_id = gh run list --workflow=$workflow --limit=1 --json databaseId --jq '.[0].databaseId'

# Watch it
gh run watch $run_id
```

## 🎯 Useful Aliases

Add to your shell profile (`.bashrc`, `.zshrc`, or PowerShell $PROFILE):

```bash
# View latest workflow run
alias gh-latest="gh run list --limit=1"

# Watch latest workflow
alias gh-watch="gh run watch $(gh run list --limit=1 --json databaseId --jq '.[0].databaseId')"

# View latest workflow logs
alias gh-logs="gh run view $(gh run list --limit=1 --json databaseId --jq '.[0].databaseId') --log"

# Trigger CI/CD
alias gh-ci="gh workflow run ci-cd.yml -r main"

# Trigger deployment
alias gh-deploy="gh workflow run deploy.yml -r main"
```

## 📝 Useful Queries

### View All Workflow Runs (JSON format)

```bash
gh run list --limit=10 --json number,name,status,updatedAt
```

### Output:

```json
[
  {
    "name": "Healthcare System CI/CD",
    "number": 42,
    "status": "completed",
    "updatedAt": "2024-12-02T10:45:30Z"
  }
]
```

### Filter by Status

```bash
# Failed runs
gh run list --status=failure --limit=5

# In progress
gh run list --status=in_progress

# Success
gh run list --status=success --limit=5
```

### Export to CSV

```bash
# PowerShell
gh run list --limit=20 --json number,status,conclusion,updatedAt | ConvertFrom-Json | Export-Csv runs.csv

# Bash
gh run list --limit=20 --json number,status,conclusion,updatedAt | jq -r '.[] | [.number, .status, .conclusion, .updatedAt] | @csv' > runs.csv
```

## 🐛 Debugging Tips

### Full Verbose Output

```bash
# View with maximum details
gh run view $RUN_ID --verbose

# View in debug mode
gh run rerun $RUN_ID --debug
```

### Check Specific Job

```bash
# List all jobs
gh run view $RUN_ID --json jobs

# View specific job logs
JOB_ID=$(gh run view $RUN_ID --json jobs --jq '.[0].databaseId')
gh run view $RUN_ID --job=$JOB_ID
```

### Compare Runs

```bash
# View multiple runs
gh run list --limit=5 --json number,status,conclusion,updatedAt,head

# Find failed runs
gh run list --status=failure --limit=10
```

## 📚 Resources

```bash
# Get help
gh help workflow
gh help run
gh help secret

# View documentation
gh reference
```

---

**Pro Tip:** Use `--web` flag to open anything in browser:

```bash
gh run view $RUN_ID --web
gh workflow view ci-cd.yml --web
gh repo view --web
```

**Tip 2:** Use `--json` for scripting:

```bash
gh run list --limit=1 --json databaseId,status | jq '.[] | "\(.databaseId): \(.status)"'
```

---

**Last Updated:** December 2024
