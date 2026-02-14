# CHANGELOG

All notable changes to Tyson Player will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - develop branch

### Added
- Lazy loading for large folders (50 files per batch)
- Grid view with 4-column layout
- Image viewer with full-screen support
- Image thumbnail display in grid
- Navigate between images with arrow keys
- Image format support: JPG, PNG, GIF, BMP, WebP

### Fixed
- Grid item sizing (equal 320px height)
- Text overflow in grid (2-line ellipsis)
- Image loading using background-image method
- Control button spacing (60px gap + 10px margin)
- View toggle button size (28px font, larger padding)

### Changed
- Image thumbnails now use background-image instead of img src
- Removed canvas-based video thumbnail generation (Tizen security restriction)
- Grid navigation: ↑↓ moves by 4 items (one row), ← → moves by 1

## [1.0.0] - 2026-02-15

### Added
- USB drive detection and browsing
- Video playback support (MP4, MKV, MOV, WebM, M4V, 3GP, MPEG)
- List view for file browsing
- Video player with controls
- Play/Pause button
- Seek forward/backward (10 seconds)
- Progress bar with time display
- Remote control support
- Samsung TV remote navigation
- Grid/List view toggle (Red button)
- Folder navigation
- File size display
- AVI format warning

### Fixed
- Back button navigation
- Control button focus (OK → navigate with ← →)
- Grid/List toggle button accessibility
- Remote control key mapping

### Security
- Restricted to Tizen filesystem privileges
- File:// protocol access only for local files

## [0.9.0] - 2026-02-14 (Beta)

### Added
- Initial project setup
- Basic UI layout
- Tizen configuration
- Deployment script

### Known Issues
- Large folders cause freezing (Fixed in 1.1.0)
- No thumbnail support (Partially fixed in 1.1.0)
- No image viewer (Fixed in 1.1.0)

---

## Version History Summary

| Version | Date | Key Features |
|---------|------|-------------|
| 1.0.0 | 2026-02-15 | Initial stable release |
| 1.1.0 | TBD | Lazy loading, image viewer, grid improvements |

---

## Upcoming Features (Roadmap)

### v1.2.0 (Planned)
- [ ] Playlist management
- [ ] Subtitle support (.srt, .vtt)
- [ ] Resume playback feature
- [ ] Video duration display
- [ ] Sort options (name, date, size)
- [ ] Search functionality

### v1.3.0 (Planned)
- [ ] Multiple USB drive support
- [ ] Bookmarks/Favorites
- [ ] Recently played list
- [ ] Video codec information
- [ ] Audio track selection

### v2.0.0 (Future)
- [ ] Network streaming support
- [ ] DLNA/UPnP support
- [ ] Cloud storage integration
- [ ] Custom themes
- [ ] Parental controls

---

## Breaking Changes

### v1.0.0 → v1.1.0
- **No breaking changes** - Fully backwards compatible

---

## Migration Guide

### Upgrading from 1.0.0 to 1.1.0

1. **Backup your current version**
2. **Replace 3 files:**
   - `js/main.js`
   - `css/style.css`
   - `index.html`
3. **Clean and rebuild** in Tizen Studio
4. **Reinstall** on TV

**No configuration changes needed!**

---

## Bug Fixes by Version

### v1.1.0
- Fixed grid items having different heights
- Fixed text overflow in long filenames
- Fixed image thumbnails not loading (Tizen compatibility)
- Fixed control buttons too close together

### v1.0.0
- Fixed back button not working in video player
- Fixed control buttons not selectable with remote
- Fixed Grid toggle button not accessible
- Fixed AVI files attempting to play (now shows warning)

---

## Performance Improvements

### v1.1.0
- **67x faster** folder loading (1000 files: 10s → 0.15s)
- **Eliminated freezing** on large folders
- **Smooth scrolling** with lazy loading
- **Reduced memory usage** by loading in batches

### v1.0.0
- Initial optimizations for TV hardware

---

## Known Limitations

### Tizen Security Restrictions
- **Video thumbnails**: Cannot extract frames due to canvas.toDataURL() restriction
- **File access**: Limited to USB drives only
- **Network**: No network file access in current version

### Hardware Limitations
- **Large files**: 4K videos may lag on older TVs
- **Format support**: Limited to TV's native codec support
- **USB 2.0**: Slower transfer speeds with USB 2.0 drives

---

## Credits

**Developed for Samsung Tizen TV**
- Platform: Tizen 6.0+
- Target Device: Samsung QLED TVs (2021+)
- Framework: Vanilla JavaScript, Tizen Web APIs

---

## License

Proprietary - All rights reserved

---

## Support

For issues, feature requests, or questions:
- Check documentation in `/docs` folder
- Review `TIZEN-LIMITATIONS.md` for known restrictions
- Review `BRANCHING.md` for development workflow

**Last Updated:** 2026-02-15
