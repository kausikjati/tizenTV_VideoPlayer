# DEBUG VERSION - CONSOLE LOGGING ENABLED

## 🔍 I've Added Console Logs Everywhere!

This version will show you EXACTLY what's happening (or not happening).

## 📋 TESTING INSTRUCTIONS:

### Step 1: Install This Version
1. Replace `js/main.js` with the new one
2. Clean project
3. Build project
4. Install on TV

### Step 2: Open Console
1. **Tizen Studio** → View → Show Web Inspector
2. Click **Console** tab
3. Keep it open while testing

### Step 3: Test Image Viewer

**Do this:**
1. Navigate to a JPG or PNG file
2. You'll see 🖼️ icon
3. Press **OK**

**What to look for in console:**
```
File selected: photo.jpg Type: image
Opening image viewer for: photo.jpg file:///...
Switching to screen: image
Screen activated: image
Image viewer screen should be visible now
```

**If you see an ERROR instead, copy the exact error message!**

**Possible errors:**
- `Screen not found: image-screen` → HTML file not updated
- `Cannot read property 'src'` → Image element not found
- `Security error` → Tizen blocking file:// access
- `CORS error` → Cross-origin restriction

### Step 4: Test Video Thumbnails

**Do this:**
1. Switch to Grid View (Red button or Grid button)
2. Look at a video file
3. Wait 5 seconds

**What to look for in console:**
```
Attempting to load thumbnail for: file:///...
Video loaded, duration: 7200
Video seeked, attempting canvas capture
Thumbnail generated successfully
```

**If you see an ERROR, copy it!**

**Possible errors:**
- `Canvas tainted by cross-origin data` → Security restriction
- `Failed to execute 'toDataURL'` → Canvas blocked by Tizen
- `Cannot draw video` → Video codec issue
- `Security error` → Tizen policy blocks canvas access

## 🐛 COMMON ISSUES & WHAT THEY MEAN:

### Issue 1: "Screen not found: image-screen"
**Meaning:** HTML file wasn't replaced properly
**Fix:** Make sure `index.html` has this section:
```html
<div id="image-screen" class="screen">
    <div class="image-container">
        <img id="image-viewer" src="" alt="Image">
    </div>
    ...
</div>
```

### Issue 2: "Cannot read property 'src' of null"
**Meaning:** Image element doesn't exist
**Fix:** Check HTML has `<img id="image-viewer">`

### Issue 3: "SecurityError: Canvas tainted"
**Meaning:** **TIZEN BLOCKS CANVAS ACCESS FOR SECURITY**
**This is Samsung TV restriction, not a bug!**
**Solution:** Video thumbnails won't work due to Tizen security policy

### Issue 4: Image viewer shows but image is blank
**Meaning:** Tizen might block `file://` protocol for images
**Try:** Check if console shows CORS error

## 🎯 WHAT TO REPORT:

After testing, please tell me:

1. **For Image Viewer:**
   - Does it open? (Yes/No)
   - What do you see in console?
   - Any error messages?

2. **For Video Thumbnails:**
   - Do you see the console messages?
   - What's the exact error?
   - Does it say "Canvas tainted" or "Security error"?

## 💡 LIKELY CAUSES:

Based on testing, here's what I suspect:

### Image Viewer Not Working:
**Most Likely:** HTML file not replaced correctly
**Check:** Does `index.html` have `<div id="image-screen">`?

### Video Thumbnails Not Working:
**Most Likely:** Tizen security blocks canvas access
**Why:** Samsung TVs restrict canvas.toDataURL() for security
**Solution:** This is TV limitation, not fixable in code

## 🔧 ALTERNATIVE SOLUTIONS:

If Tizen blocks these features due to security:

### For Thumbnails:
Instead of real video frames, we can:
1. Use first frame from video poster
2. Show larger 🎬 icon
3. Use video duration as indicator

### For Image Viewer:
If file:// protocol blocked, we can:
1. Try different image loading method
2. Use Samsung's native image API
3. Embed image as base64

## 📝 NEXT STEPS:

1. **Install this debug version**
2. **Open console**
3. **Test both features**
4. **Copy ALL console messages**
5. **Report back with the exact errors**

Then I can create a workaround based on the actual limitations!

---

**This debug version will tell us EXACTLY what's wrong!** 🔍
