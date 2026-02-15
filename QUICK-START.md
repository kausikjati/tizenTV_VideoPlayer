# 🚀 QUICK START GUIDE

## For First-Time Users

### Step 1: Prepare USB Drive
```
1. Format USB as FAT32, exFAT, or NTFS
2. Copy video files to USB drive
3. Plug USB into Samsung TV
```

### Step 2: Install App
```bash
# Connect to TV
sdb connect <YOUR_TV_IP>

# Install
sdb install TysonPlayer.wgt
```

### Step 3: Launch
```
1. Open Samsung Apps on TV
2. Find "Tyson Player"
3. Press OK to launch
```

### Step 4: Browse Files
```
↑ ↓ - Navigate
OK - Select
Back - Go back
Red Button - Toggle Grid/List
```

---

## For Developers

### One-Time Setup
```bash
# Install Tizen Studio
# Download from: https://developer.tizen.org/development/tizen-studio/download

# Enable TV Developer Mode
# TV: Settings → General → System Manager → Developer Mode

# Get TV IP address
# TV: Settings → General → Network → Network Status

# Create certificate (if needed)
tizen certificate -a MyApp -p password -c KR -s Seoul \
  -ct Seoul -o Company -n Name -e email@example.com
```

### Build and Deploy (Using Script)
```bash
# Make executable
chmod +x deploy_tyson.sh

# Edit TV IP in script
nano deploy_tyson.sh
# Change: sdb -s 192.168.31.124 to your TV IP

# Run deployment
./deploy_tyson.sh
```

### Manual Build
```bash
# Build
tizen build-web

# Package
tizen package -t wgt -s TysonProfile

# Install
sdb install TysonPlayer.wgt
```

---

## Git Setup

### First Commit
```bash
cd TysonPlayer

# Initialize
git init
git add .
git commit -m "chore: initial commit"

# Create branches
git branch -M main
git checkout -b develop

# Push to remote
git remote add origin <your-repo-url>
git push -u origin main
git push -u origin develop
```

### Daily Workflow
```bash
# Update develop
git checkout develop
git pull

# Create feature
git checkout -b feature/my-feature

# Work and commit
git add .
git commit -m "feat: add my feature"

# Push
git push origin feature/my-feature

# Create PR on GitHub/GitLab
```

---

## Common Tasks

### Update TV IP
```bash
# In deploy_tyson.sh
sdb -s NEW_IP_ADDRESS install TysonPlayer.wgt

# Or set default TV
sdb connect NEW_IP_ADDRESS
```

### View Logs
```bash
# Real-time logs
sdb dlog TysonPlayer

# Or
sdb shell dlogutil TysonPlayer
```

### Uninstall App
```bash
sdb uninstall aJI6LdvAFz.TysonPlayer
```

### Reinstall (Clean)
```bash
# Uninstall
sdb uninstall aJI6LdvAFz.TysonPlayer

# Wait 3 seconds
sleep 3

# Reinstall
sdb install TysonPlayer.wgt
```

---

## Testing Checklist

Quick tests before commit:

```
[ ] Connects to USB
[ ] Lists files
[ ] Plays MP4 video
[ ] Grid view works
[ ] Remote control responds
[ ] No console errors
[ ] App doesn't crash
```

---

## Troubleshooting

### "Device not found"
```bash
# Check connection
sdb devices

# Reconnect
sdb disconnect
sdb connect <TV_IP>
```

### "Certificate error"
```bash
# Create new certificate
tizen certificate -a TysonProfile -p password

# Sign again
tizen package -t wgt -s TysonProfile
```

### "App won't install"
```bash
# Uninstall first
sdb uninstall aJI6LdvAFz.TysonPlayer

# Clean build
rm -f *.wgt
tizen clean
tizen build-web
tizen package -t wgt -s TysonProfile

# Install
sdb install TysonPlayer.wgt
```

### "Black screen on TV"
```bash
# Check console
sdb dlog TysonPlayer

# Common fixes:
1. Check index.html exists
2. Check js/main.js loads
3. Check all SVG images present
4. Clear TV cache (uninstall/reinstall)
```

---

## Quick Reference

### File Locations
```
index.html     → Entry point
js/main.js     → Main logic
css/style.css  → Styles
config.xml     → App config
images/        → Icons
```

### Key Functions
```javascript
scanUSBDevices()    → Find USB drives
navigateToPath()    → Open folder
playVideo()         → Play video
viewImage()         → Show image
toggleViewMode()    → Grid/List
```

### Important Classes
```css
.file-list         → File container
.file-item         → Each file
.focused           → Selected item
.grid-view         → Grid mode
.list-view         → List mode
```

---

## Next Steps

After setup:
1. ✅ Read [README.md](README.md)
2. ✅ Review [BRANCHING.md](BRANCHING.md)
3. ✅ Check [CHANGELOG.md](CHANGELOG.md)
4. ✅ Understand [TIZEN-LIMITATIONS.md](TIZEN-LIMITATIONS.md)

---

**You're ready to develop! Happy coding!** 🎉
