# Tyson Player - Enhanced Tizen TV Media Player

## Features
✅ USB media browsing with folder navigation
✅ Video thumbnail support using Tizen Content API
✅ Grid view (5 columns) and List view
✅ Storage usage display
✅ Video playback with controls
✅ Image viewer with navigation
✅ Support for MP4, MKV, MOV, AVI and more
✅ Remote control navigation

## Key Improvements in This Version

### 1. Content API Thumbnail Support
- Uses Tizen Content API to fetch pre-generated video thumbnails
- Falls back to canvas-based thumbnail generation if needed
- Caches thumbnails for better performance

### 2. Improved Grid Layout
- 5-column grid matching Samsung TV file browser
- Better folder icons and video thumbnails
- Enhanced focus effects and animations

### 3. Storage Information
- Displays used and available space in header
- Updates when navigating USB devices

### 4. Better Performance
- Lazy loading of file items (40 at a time)
- Thumbnail caching
- Efficient DOM updates

## Installation

### Prerequisites
1. Tizen Studio installed
2. Samsung TV in Developer Mode
3. Certificate profile created

### Deploy to TV

#### Method 1: Using Deploy Script
```bash
# Edit the IP address in deploy_tyson.sh
nano deploy_tyson.sh

# Make executable
chmod +x deploy_tyson.sh

# Run
./deploy_tyson.sh
```

#### Method 2: Using Tizen Studio GUI
1. Open Tizen Studio
2. File > Open Projects from File System
3. Select TysonPlayer folder
4. Right-click project > Run As > Tizen Web Application

#### Method 3: Manual CLI
```bash
# Package
cd TysonPlayer
tizen package -t wgt -s <your-profile>

# Install
sdb connect <TV-IP>
sdb install TysonPlayer.wgt
```

## Usage

### Remote Control Keys
- **Arrow Keys**: Navigate files
- **OK/Enter**: Select file/folder or play video
- **Back**: Go back or exit
- **Red Button**: Toggle grid/list view
- **Play/Pause**: Control video playback

### Navigation
1. App opens showing USB devices
2. Select a USB drive to browse
3. Navigate folders and files
4. Select video to play or image to view

## Troubleshooting

### No Thumbnails Showing
The app tries multiple methods:
1. Tizen Content API (best quality)
2. Canvas extraction (may fail due to security)
3. Fallback to generic icons

If thumbnails don't work, the video files still play fine.

### Video Won't Play
- Ensure format is supported (MP4 recommended)
- AVI files may require conversion
- Check file isn't corrupted

### Can't Find USB
- Ensure USB is properly inserted
- TV must recognize the USB drive
- Try reformatting USB to FAT32 or exFAT

## Supported Formats

### Video
- .mp4, .mkv, .mov, .wmv, .webm, .m4v, .3gp, .mpeg, .mpg, .avi

### Images
- .jpg, .jpeg, .png, .gif, .bmp, .webp

## File Structure
```
TysonPlayer/
├── index.html          # Main HTML
├── config.xml          # Tizen configuration
├── css/
│   └── style.css       # Styles
├── js/
│   └── main.js         # Application logic
├── images/
│   ├── play.svg
│   ├── pause.svg
│   ├── rewind.svg
│   ├── forward.svg
│   └── back.svg
└── icon.png            # App icon (add your own)
```

## Technical Notes

### Content API Integration
The app uses `tizen.content.find()` to locate media files and retrieve their `thumbnailURIs`. This is the recommended method for Tizen TV applications.

### Canvas Fallback
If Content API thumbnails aren't available, the app attempts to generate thumbnails using the `<video>` element and `<canvas>`. This may be blocked by Tizen security policies.

### Performance Optimization
- Files loaded in batches of 40
- Thumbnails cached in memory
- Smooth scrolling with lazy rendering

## License
Free to use and modify

## Credits
Created for Tizen TV Web Applications
