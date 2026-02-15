# TYSON PLAYER - GIT BRANCHING STRATEGY

## 📋 Project Structure

```
TysonPlayer/
├── .git/                          # Git repository
├── config.xml                     # Tizen app configuration
├── index.html                     # Main HTML entry point
├── deploy_tyson.sh               # Deployment script
├── icon.png                      # App icon
├── css/
│   └── style.css                 # Main stylesheet
├── js/
│   └── main.js                   # Main JavaScript application
├── images/
│   ├── play.svg
│   ├── pause.svg
│   ├── rewind.svg
│   ├── forward.svg
│   ├── back.svg
│   ├── playlist.svg
│   └── subtitle.svg
└── docs/
    ├── BRANCHING.md              # This file
    ├── FEATURES.md
    ├── TIZEN-LIMITATIONS.md
    └── CHANGELOG.md
```

## 🌿 Branch Structure

### Main Branches

**1. `main` (or `master`)**
- Production-ready code
- Always deployable to Samsung TV
- Protected branch (no direct commits)
- Only updated via pull requests from `release/*`

**2. `develop`**
- Integration branch for features
- Latest development changes
- Pre-release testing happens here
- Base branch for all feature branches

### Supporting Branches

**3. Feature Branches: `feature/*`**
- Created from: `develop`
- Merged back to: `develop`
- Naming: `feature/feature-name`

Examples:
- `feature/lazy-loading`
- `feature/image-viewer`
- `feature/video-thumbnails`
- `feature/grid-view`
- `feature/subtitle-support`

**4. Bugfix Branches: `bugfix/*`**
- Created from: `develop`
- Merged back to: `develop`
- Naming: `bugfix/bug-description`

Examples:
- `bugfix/grid-sizing`
- `bugfix/control-buttons`
- `bugfix/image-loading`

**5. Hotfix Branches: `hotfix/*`**
- Created from: `main`
- Merged to: `main` AND `develop`
- Naming: `hotfix/critical-fix`

Examples:
- `hotfix/crash-on-large-folders`
- `hotfix/video-playback-error`

**6. Release Branches: `release/*`**
- Created from: `develop`
- Merged to: `main` AND `develop`
- Naming: `release/v1.0.0`

Examples:
- `release/v1.0.0`
- `release/v1.1.0`

---

## 🚀 Workflow

### 1. Starting a New Feature

```bash
# Make sure develop is up to date
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/image-viewer

# Work on feature...
# ... make commits ...

# Push to remote
git push origin feature/image-viewer

# Create Pull Request to develop
```

### 2. Working on a Bug Fix

```bash
# Create bugfix branch from develop
git checkout develop
git pull origin develop
git checkout -b bugfix/grid-sizing

# Fix the bug...
# ... make commits ...

# Push and create PR
git push origin bugfix/grid-sizing
```

### 3. Creating a Release

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.1.0

# Update version in config.xml
# Test thoroughly on TV
# Fix any last-minute bugs

# Merge to main
git checkout main
git merge release/v1.1.0
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge release/v1.1.0
git push origin develop

# Delete release branch
git branch -d release/v1.1.0
```

### 4. Emergency Hotfix

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-crash

# Fix the issue...
# ... make commits ...

# Merge to main
git checkout main
git merge hotfix/critical-crash
git tag -a v1.0.1 -m "Hotfix version 1.0.1"
git push origin main --tags

# Merge to develop
git checkout develop
git merge hotfix/critical-crash
git push origin develop

# Delete hotfix branch
git branch -d hotfix/critical-crash
```

---

## 📝 Commit Message Convention

### Format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding tests
- **chore**: Maintenance tasks

### Examples:

```bash
feat(player): add lazy loading for large folders

Implemented batch loading of 50 files at a time to prevent
freezing when opening folders with 1000+ files.

Closes #123
```

```bash
fix(grid): correct unequal grid item heights

All grid items now have fixed 320px height with proper
text ellipsis for long filenames.

Fixes #456
```

```bash
perf(thumbnails): optimize image loading in grid view

Changed from img src to background-image for better
compatibility with Tizen file:// protocol.
```

---

## 🏷️ Version Numbering (Semantic Versioning)

**Format: MAJOR.MINOR.PATCH**

- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

Examples:
- `v1.0.0` - Initial release
- `v1.1.0` - Added image viewer feature
- `v1.1.1` - Fixed grid sizing bug
- `v2.0.0` - Complete UI overhaul (breaking changes)

---

## 📂 Current Branch Status

### `main` (v1.0.0)
- ✅ USB device detection
- ✅ Video playback (MP4, MKV, MOV, WebM)
- ✅ List view
- ✅ Basic controls
- ✅ Remote control support

### `develop` (v1.1.0-dev)
- ✅ Lazy loading (50 files batch)
- ✅ Grid view with thumbnails
- ✅ Image viewer
- ✅ Image thumbnail support
- ✅ Fixed grid sizing
- ⏳ Video thumbnail support (blocked by Tizen)

### Active Feature Branches:
- `feature/lazy-loading` - ✅ Merged to develop
- `feature/image-viewer` - ✅ Merged to develop
- `feature/grid-view` - ✅ Merged to develop

### Completed Bugfixes:
- `bugfix/grid-sizing` - ✅ Merged
- `bugfix/image-loading` - ✅ Merged
- `bugfix/control-buttons` - ✅ Merged

---

## 🔄 Quick Reference Commands

### Initialize Repository
```bash
# First time setup
git init
git add .
git commit -m "chore: initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main

# Create develop branch
git checkout -b develop
git push -u origin develop
```

### Daily Workflow
```bash
# Start working
git checkout develop
git pull origin develop

# Create feature
git checkout -b feature/my-feature

# Commit changes
git add .
git commit -m "feat(scope): description"

# Push to remote
git push origin feature/my-feature

# Create PR on GitHub/GitLab
```

### View Branches
```bash
# List local branches
git branch

# List remote branches
git branch -r

# List all branches
git branch -a

# See branch graph
git log --oneline --graph --all
```

### Switch Branches
```bash
# Switch to existing branch
git checkout develop

# Create and switch to new branch
git checkout -b feature/new-feature

# Switch to remote branch
git checkout -b feature/remote-feature origin/feature/remote-feature
```

### Update Branch
```bash
# Update current branch from remote
git pull

# Update develop and merge to current branch
git checkout develop
git pull
git checkout feature/my-feature
git merge develop
```

### Delete Branches
```bash
# Delete local branch
git branch -d feature/completed-feature

# Force delete unmerged branch
git branch -D feature/abandoned-feature

# Delete remote branch
git push origin --delete feature/old-feature
```

---

## 🎯 Best Practices

### 1. Branch Naming
- Use lowercase and hyphens
- Be descriptive but concise
- Include issue number if applicable

✅ Good:
- `feature/image-viewer`
- `bugfix/grid-sizing-issue-123`
- `hotfix/crash-on-startup`

❌ Bad:
- `feature/new_stuff`
- `fix`
- `john-working-branch`

### 2. Commit Messages
- Use present tense ("add feature" not "added feature")
- Be descriptive
- Reference issues/tickets
- Keep subject line under 50 characters
- Use body for detailed explanation

### 3. Pull Requests
- Include description of changes
- Reference related issues
- Add screenshots/videos for UI changes
- Request reviews from team members
- Test on actual TV before merging

### 4. Branch Hygiene
- Delete merged branches
- Keep branches short-lived
- Regularly merge develop into feature branches
- Don't let branches diverge too much

### 5. Testing Before Merge
- ✅ Test on Samsung TV
- ✅ Test with large folders (1000+ files)
- ✅ Test all video formats
- ✅ Test remote control navigation
- ✅ Check console for errors
- ✅ Verify no performance regression

---

## 📱 Samsung TV Testing Checklist

Before merging to `develop` or `main`:

- [ ] App installs successfully
- [ ] USB drives detected
- [ ] Files load without freezing
- [ ] Grid view displays correctly
- [ ] List view displays correctly
- [ ] Videos play smoothly
- [ ] Images display in viewer
- [ ] Remote control works
- [ ] Navigation is responsive
- [ ] No console errors
- [ ] Memory usage acceptable
- [ ] App doesn't crash

---

## 🔍 Troubleshooting

### "Branch already exists"
```bash
# Delete old branch first
git branch -d feature/my-feature
git checkout -b feature/my-feature
```

### "Conflicts during merge"
```bash
# Resolve conflicts in files
# Then:
git add .
git commit -m "merge: resolve conflicts"
```

### "Can't switch branches (uncommitted changes)"
```bash
# Option 1: Commit changes
git add .
git commit -m "wip: work in progress"

# Option 2: Stash changes
git stash
git checkout other-branch
git stash pop
```

---

## 📞 Support

For questions about branching strategy:
1. Check this documentation
2. Review Git documentation
3. Ask team lead

---

**Keep branches organized, commit often, and test thoroughly!** 🚀
