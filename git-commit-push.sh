#!/bin/bash

# Tyson Player - Git Commit & Push Script
# This script will commit all changes and push to repository

echo "🎬 Tyson Player - Git Commit & Push"
echo "===================================="
echo ""

# Step 1: Check Git status
echo "Step 1: Checking Git status..."
git status
echo ""

# Step 2: Stage all changes
echo "Step 2: Staging all changes..."
git add .
echo "✅ All files staged"
echo ""

# Step 3: Show what will be committed
echo "Step 3: Files to be committed:"
git status --short
echo ""

# Step 4: Commit with detailed message
echo "Step 4: Committing changes..."
git commit -m "feat(thumbnails): implement video thumbnail display using video element

- Added video element-based thumbnail generation
- Bypasses Tizen canvas security restrictions
- Displays paused video frame at 2 seconds
- Added play icon overlay with z-index
- Improved thumbnail loading with metadata preload
- Fixed grid item sizing (320px height)
- Fixed text overflow (2-line ellipsis)
- Added comprehensive Git branching documentation
- Added README, CHANGELOG, and project docs

Features:
- Video thumbnails now show actual frame
- Image thumbnails working with background-image
- Lazy loading for large folders (50 files batch)
- Image viewer with full-screen support
- Grid/List view toggle
- Remote control navigation

Fixes:
- Grid sizing issues
- Image loading compatibility
- Control button spacing
- View toggle button accessibility

Documentation:
- BRANCHING.md - Git workflow
- README.md - Project overview
- CHANGELOG.md - Version history
- QUICK-START.md - Setup guide
- VIDEO-THUMBNAIL-SOLUTION.md - Thumbnail implementation

Closes #1, #2, #3"

echo "✅ Changes committed"
echo ""

# Step 5: Show commit details
echo "Step 5: Commit details:"
git log -1 --stat
echo ""

# Step 6: Push to remote
echo "Step 6: Pushing to remote repository..."
echo "Which branch are you on?"
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

read -p "Push to origin/$CURRENT_BRANCH? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    git push origin $CURRENT_BRANCH
    echo "✅ Pushed to origin/$CURRENT_BRANCH"
else
    echo "⚠️  Push cancelled"
fi

echo ""
echo "🎉 Done!"
echo ""
echo "Next steps:"
echo "1. Create Pull Request if on feature branch"
echo "2. Test on Samsung TV"
echo "3. Merge to develop when ready"
