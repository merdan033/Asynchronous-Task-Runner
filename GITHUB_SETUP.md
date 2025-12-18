# GitHub Setup Instructions

## Step 1: Create Repository on GitHub
1. Go to https://github.com/new
2. Name your repository (e.g., "async-task-runner" or "Assignment9")
3. Make it Public or Private (your choice)
4. **DO NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

## Step 2: Push to GitHub

After creating the repository, run these commands:

```bash
# Add your GitHub repository as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Or if you prefer SSH:
```bash
git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

## Alternative: Quick GitHub CLI Method

If you have GitHub CLI installed:
```bash
gh repo create async-task-runner --public --source=. --remote=origin --push
```

