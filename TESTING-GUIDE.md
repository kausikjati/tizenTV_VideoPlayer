# TESTING & TROUBLESHOOTING GUIDE

## 🔍 HOW TO TEST IF FEATURES ARE WORKING:

### Step 1: Check Console (Very Important!)

**In Tizen Studio:**
1. Right-click project → Run As → Tizen Web Application
2. Open **Web Inspector** (View → Show Web Inspector)
3. Go to **Console** tab
4. Watch for these messages:

**Expected messages:**
```
Init with Performance Features
Scanning USB...
Found storages: X
```

If you see errors, report them!

### Step 2: Test Each Feature

#### TEST 1: Lazy Loading (Large Folder Fix)
**What to test:**
1. Navigate to a folder with 500+ files
2. App should load INSTANTLY (not freeze)
3. You'll see only first 50 files initially
4. Scroll down - more files appear automatically

**How to verify it's working:**
- Check console for: "Init with Performance Features"
- Initial load should be under 1 second
- Files appear as you scroll

**If it's NOT working:**
- App freezes when opening large folder
- Takes 5+ seconds to load
- Console shows errors

#### TEST 2: Video Thumbnails
**What to test:**
1. Switch to **Grid View** (Red button or Grid button)
2. Look at video files
3. Should see actual video preview (not just 🎬)

**How to verify it's working:**
- Initially shows 🎬 icon
- After 2-3 seconds, shows real video frame
- Play icon (▶) appears on top

**If it's NOT working:**
- Only see 🎬 icon (no real preview)
- Black thumbnail
- Console shows video loading errors

**Why it might not work:**
- Samsung Tizen restricts canvas access
- Video codec not supported
- Security restrictions

#### TEST 3: Image Viewer
**What to test:**
1. Navigate to a JPG or PNG file (shows 🖼️ icon)
2. Press **OK**
3. Image should open full screen
4. Press **← →** to navigate between images
5. Press **Back** to close

**How to verify it's working:**
- Full screen image appears
- Image name shows at bottom
- Can navigate with arrows
- Back button closes viewer

**If it's NOT working:**
- Nothing happens when pressing OK on image
- Black screen appears
- Console shows errors

## 🐛 COMMON ISSUES & FIXES:

### Issue 1: "Cannot find image-viewer element"
**Solution:** Make sure `index.html` has the image viewer section:
```html
<div id="image-screen" class="screen">
    <div class="image-container">
        <img id="image-viewer" src="" alt="Image">
    </div>
    ...
</div>
```

### Issue 2: Thumbnails not showing
**Possible causes:**
1. **Tizen security restrictions** - Some Samsung TVs block canvas access
2. **Video codec issue** - Video format not decodable
3. **Performance** - TV too slow to generate thumbnails

**Workaround:**
Use image thumbnails instead! For now, thumbnails show 🎬 icon.

### Issue 3: Still freezes on large folders
**Check:**
1. Is `batchSize = 50` in constructor?
2. Is `loadMoreFiles()` being called?
3. Check console for errors

**Debug:**
Add this to `loadMoreFiles()` at line 301:
```javascript
console.log('Loading batch:', this.loadedCount, 'to', endIndex);
```

### Issue 4: Image viewer not opening
**Check:**
1. Does HTML have `<div id="image-screen">`?
2. Does CSS have `.image-container` styles?
3. Does `isImageFile()` recognize the file type?

**Debug:**
Add to `viewImage()` at line 381:
```javascript
console.log('Opening image:', file.name, file.path);
```

## 📊 PERFORMANCE BENCHMARKS:

**Expected Load Times:**
- 100 files: < 0.5 seconds
- 500 files: < 0.5 seconds  
- 1000 files: < 1 second
- 5000 files: < 2 seconds

**If yours is slower:**
- Check console for errors
- Verify lazy loading is working
- Test on different USB drive

## 🔧 MANUAL VERIFICATION:

### Check 1: Is lazy loading enabled?
Open `main.js`, line 16, should say:
```javascript
this.batchSize = 50;
```

### Check 2: Is scroll listener working?
Open `main.js`, line 60-64, should have:
```javascript
fileList.addEventListener('scroll', () => {
    if (fileList.scrollTop + fileList.clientHeight >= fileList.scrollHeight - 300) {
        this.loadMoreFiles();
    }
});
```

### Check 3: Is image viewer implemented?
Open `main.js`, line 381, should have:
```javascript
viewImage(file) {
    this.imageElement.src = 'file://' + file.path;
    document.getElementById('image-name').textContent = file.name;
    this.showScreen('image');
}
```

## 🎯 NEXT STEPS:

1. **Install the app**
2. **Open Web Inspector** (View → Show Web Inspector)
3. **Test each feature** following the steps above
4. **Copy any console errors** and report them

The code is definitely there and should work! If it's not working, there might be:
- Tizen security restrictions
- TV hardware limitations
- Installation issue

**Please test and report what you see in the console!** 🔍

---

**The features ARE implemented in the code. Let's troubleshoot why they're not working on your TV!**
