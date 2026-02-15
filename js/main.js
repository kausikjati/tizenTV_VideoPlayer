// Tyson Player - Enhanced with Content API Thumbnails & Improved Folder View

class TysonPlayer {
    constructor() {
        this.currentScreen = 'browser';
        this.currentPath = '/';
        this.fileList = [];
        this.focusedIndex = 0;
        this.headerFocused = false;
        this.controlFocused = -1;
        this.videoElement = null;
        this.imageElement = null;
        this.isPlaying = false;
        this.controlsTimeout = null;
        this.viewMode = 'grid'; // Start with grid view like screenshot
        this.batchSize = 20; // Reduced for smoother scrolling
        this.loadedCount = 0;
        this.supportedVideoFormats = ['.mp4', '.mkv', '.mov', '.wmv', '.webm', '.m4v', '.3gp', '.mpeg', '.mpg', '.avi', '.flv', '.ts', '.m2ts', 'DAT', 'divx'];
        this.supportedImageFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.heic', '.heif'];
        this.thumbnailCache = {}; // Cache for Content API thumbnails
        this.currentUSBDevice = null; // Track current USB
        this.contentManager = null; // Tizen Content API manager
        this.isLoading = false; // Track loading state
        
        this.init();
    }

    init() {
        console.log('Init Tyson Player with Enhanced Features');
        this.videoElement = document.getElementById('video-player');
        this.imageElement = document.getElementById('image-viewer');
        this.useAVPlay = false;
        
        // Check if AVPlay is available for better codec support (HEVC, MKV, etc.)
        try {
            if (typeof webapis !== 'undefined' && webapis.avplay) {
                this.useAVPlay = true;
                console.log('✓ AVPlay available - supports HEVC, 10-bit, HDR, MKV, AVI');
            } else {
                console.log('✗ AVPlay not available - limited to H.264 only');
            }
        } catch (e) {
            console.log('AVPlay check failed, using HTML5 video');
        }
        
        // Initialize Content API for thumbnails
        try {
            this.contentManager = tizen.content;
            console.log('Content API initialized');
        } catch (e) {
            console.warn('Content API not available:', e);
        }
        
        this.registerKeys();
        this.setupEventListeners();
        this.scanUSBDevices();
    }

    registerKeys() {
        try {
            ['MediaPlay', 'MediaPause', 'MediaPlayPause', 'ColorF0Red'].forEach(key => {
                try { tizen.tvinputdevice.registerKey(key); } catch (e) {}
            });
        } catch (e) {}
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        this.videoElement.addEventListener('play', () => {
            this.isPlaying = true;
            document.getElementById('btn-play-pause').innerHTML = '<img src="images/pause.svg">';
        });
        
        this.videoElement.addEventListener('pause', () => {
            this.isPlaying = false;
            document.getElementById('btn-play-pause').innerHTML = '<img src="images/play.svg">';
        });
        
        this.videoElement.addEventListener('timeupdate', () => {
            const percent = (this.videoElement.currentTime / this.videoElement.duration) * 100;
            document.getElementById('progress-fill').style.width = percent + '%';
            const current = this.formatTime(this.videoElement.currentTime);
            const total = this.formatTime(this.videoElement.duration);
            document.getElementById('video-time').textContent = `${current} / ${total}`;
        });
        
        // Lazy load on scroll
        const fileList = document.getElementById('file-list');
        fileList.addEventListener('scroll', () => {
            if (fileList.scrollTop + fileList.clientHeight >= fileList.scrollHeight - 300) {
                this.loadMoreFiles();
            }
        });
        
        document.getElementById('btn-view-toggle').onclick = () => this.toggleViewMode();
        document.getElementById('btn-play-pause').onclick = () => this.togglePlayPause();
        document.getElementById('btn-rewind').onclick = () => this.seekBackward();
        document.getElementById('btn-forward').onclick = () => this.seekForward();
        document.getElementById('btn-back').onclick = () => this.handleBack();
    }

    handleKeyPress(e) {
        if (e.keyCode === 10009 || e.keyCode === 27) this.handleBack();
        else if (e.keyCode === 13) this.handleOK();
        else if (e.keyCode === 38) this.handleUp();
        else if (e.keyCode === 40) this.handleDown();
        else if (e.keyCode === 37) this.handleLeft();
        else if (e.keyCode === 39) this.handleRight();
        else if (e.keyCode === 415 || e.keyCode === 19 || e.keyCode === 10252) {
            if (this.currentScreen === 'player' && this.controlFocused === 0) this.togglePlayPause();
        }
        else if (e.keyCode === 403) {
            if (this.currentScreen === 'browser' && !this.headerFocused) this.toggleViewMode();
        }
    }

    handleBack() {
        if (this.currentScreen === 'image') {
            this.showScreen('browser');
        } else if (this.currentScreen === 'browser') {
            if (this.headerFocused) {
                this.headerFocused = false;
                document.getElementById('btn-view-toggle').classList.remove('focused');
            } else if (this.currentPath !== '/') {
                this.navigateUp();
            } else {
                try { tizen.application.getCurrentApplication().exit(); } catch (e) {}
            }
        } else if (this.currentScreen === 'player') {
            if (this.controlFocused >= 0) {
                this.controlFocused = -1;
                this.updateControlFocus();
            } else {
                // Stop playback
                if (this.useAVPlay) {
                    try {
                        webapis.avplay.stop();
                        webapis.avplay.close();
                    } catch (e) {}
                } else {
                    this.videoElement.pause();
                }
                this.showScreen('browser');
            }
        }
    }

    handleOK() {
        if (this.currentScreen === 'browser') {
            if (this.headerFocused) this.toggleViewMode();
            else this.selectFile();
        } else if (this.currentScreen === 'player') {
            if (this.controlFocused >= 0) this.activateControl();
            else {
                this.controlFocused = 0;
                this.updateControlFocus();
                this.showControls();
            }
        } else if (this.currentScreen === 'image') {
            this.showScreen('browser');
        }
    }

    handleUp() {
        if (this.currentScreen === 'browser') {
            if (this.headerFocused) return;
            if (this.focusedIndex === 0) {
                this.headerFocused = true;
                document.getElementById('btn-view-toggle').classList.add('focused');
            } else {
                this.moveFocus(this.viewMode === 'grid' ? -5 : -1); // 5 columns in grid
            }
        }
    }

    handleDown() {
        if (this.currentScreen === 'browser') {
            if (this.headerFocused) {
                this.headerFocused = false;
                document.getElementById('btn-view-toggle').classList.remove('focused');
            } else {
                this.moveFocus(this.viewMode === 'grid' ? 5 : 1); // 5 columns in grid
            }
        }
    }

    handleLeft() {
        if (this.currentScreen === 'player') {
            if (this.controlFocused >= 0) {
                this.controlFocused = Math.max(0, this.controlFocused - 1);
                this.updateControlFocus();
            } else this.seekBackward();
        } else if (this.currentScreen === 'browser' && this.viewMode === 'grid' && !this.headerFocused) {
            this.moveFocus(-1);
        } else if (this.currentScreen === 'image') {
            this.navigateImage(-1);
        }
    }

    handleRight() {
        if (this.currentScreen === 'player') {
            if (this.controlFocused >= 0) {
                this.controlFocused = Math.min(3, this.controlFocused + 1);
                this.updateControlFocus();
            } else this.seekForward();
        } else if (this.currentScreen === 'browser' && this.viewMode === 'grid' && !this.headerFocused) {
            this.moveFocus(1);
        } else if (this.currentScreen === 'image') {
            this.navigateImage(1);
        }
    }

    updateControlFocus() {
        ['btn-play-pause', 'btn-rewind', 'btn-forward', 'btn-back'].forEach((id, i) => {
            document.getElementById(id).classList.toggle('focused', i === this.controlFocused);
        });
    }

    activateControl() {
        [() => this.togglePlayPause(), () => this.seekBackward(), () => this.seekForward(), () => this.handleBack()][this.controlFocused]();
    }

    moveFocus(direction) {
        if (this.fileList.length === 0) return;
        this.focusedIndex = Math.max(0, Math.min(this.fileList.length - 1, this.focusedIndex + direction));
        
        const items = document.querySelectorAll('.file-item');
        items.forEach((item, i) => {
            if (i === this.focusedIndex) {
                item.classList.add('focused');
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                item.classList.remove('focused');
            }
        });
        
        // Load more if near end
        if (this.focusedIndex > this.loadedCount - 10) this.loadMoreFiles();
    }

    toggleViewMode() {
        this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
        const fileListEl = document.getElementById('file-list');
        const btn = document.getElementById('btn-view-toggle');
        
        if (this.viewMode === 'grid') {
            fileListEl.classList.add('grid-view');
            fileListEl.classList.remove('list-view');
            btn.textContent = '☰ List';
        } else {
            fileListEl.classList.add('list-view');
            fileListEl.classList.remove('grid-view');
            btn.textContent = '⊞ Grid';
        }
        
        this.loadedCount = 0;
        this.renderFileList();
    }

    scanUSBDevices() {
        this.showLoading('Scanning USB devices...');
        try {
            tizen.filesystem.listStorages((storages) => {
                const usbDevices = storages.filter(s => s.type === 'EXTERNAL' || s.type === 'USB');
                if (usbDevices.length === 0) {
                    this.showMessage('No USB found');
                    return;
                }
                
                // Update header to show app name
                document.getElementById('usb-device-name').textContent = 'Tyson Player';
                
                this.fileList = usbDevices.map((device, i) => ({
                    name: device.label || `USB Device ${i + 1}`,
                    path: device.label,
                    type: 'usb',
                    size: '',
                    icon: '💾'
                }));
                
                this.focusedIndex = 0;
                this.loadedCount = 0;
                this.hideLoading();
                this.renderFileList();
            }, (error) => {
                this.hideLoading();
                this.showMessage('Error: ' + error.message);
            });
        } catch (error) {
            this.hideLoading();
            this.showMessage('Error scanning USB');
        }
    }

    showLoading(message = 'Loading...') {
        this.isLoading = true;
        const fileList = document.getElementById('file-list');
        // Clear everything first to avoid showing old files
        fileList.innerHTML = '';
        // Then show loading spinner
        fileList.innerHTML = `
            <div class="loading-container">
                <div class="spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
    }

    hideLoading() {
        this.isLoading = false;
    }

    navigateToPath(path) {
        this.showLoading('Loading...');
        try {
            tizen.filesystem.resolve(path, (dir) => {
                this.currentPath = path;
                document.getElementById('current-path').textContent = path;
                
                // Update header with USB device name
                if (this.currentUSBDevice) {
                    document.getElementById('usb-device-name').textContent = this.currentUSBDevice.name;
                }
                
                dir.listFiles((files) => {
                    setTimeout(() => {
                        this.fileList = files.map(file => ({
                            name: file.name,
                            path: file.fullPath,
                            type: file.isDirectory ? 'folder' : (this.isVideoFile(file.name) ? 'video' : (this.isImageFile(file.name) ? 'image' : 'file')),
                            size: file.isDirectory ? '' : this.formatSize(file.fileSize),
                            icon: file.isDirectory ? '📁' : (this.isVideoFile(file.name) ? '🎬' : (this.isImageFile(file.name) ? '🖼️' : '📄'))
                        }));
                        this.fileList.sort((a, b) => {
                            if (a.type === 'folder' && b.type !== 'folder') return -1;
                            if (a.type !== 'folder' && b.type === 'folder') return 1;
                            return a.name.localeCompare(b.name);
                        });
                        this.focusedIndex = 0;
                        this.loadedCount = 0;
                        this.hideLoading();
                        this.renderFileList();
                    }, 0);
                }, () => {
                    this.hideLoading();
                    this.showMessage('Cannot read folder');
                });
            }, () => {
                this.hideLoading();
                this.showMessage('Cannot open path');
            }, 'r');
        } catch (error) {
            this.hideLoading();
            this.showMessage('Navigation failed');
        }
    }

    navigateUp() {
        const parts = this.currentPath.split('/');
        parts.pop();
        const parentPath = parts.join('/') || '/';
        if (parentPath === '/') this.scanUSBDevices();
        else this.navigateToPath(parentPath);
    }

    renderFileList() {
        document.getElementById('file-list').innerHTML = '';
        if (this.fileList.length === 0) {
            this.showMessage('No files');
            return;
        }
        this.loadMoreFiles();
    }

    loadMoreFiles() {
        if (this.loadedCount >= this.fileList.length) return;
        const fileListEl = document.getElementById('file-list');
        const endIndex = Math.min(this.loadedCount + this.batchSize, this.fileList.length);
        
        // Use document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        for (let i = this.loadedCount; i < endIndex; i++) {
            const file = this.fileList[i];
            const item = document.createElement('div');
            item.className = 'file-item' + (i === this.focusedIndex ? ' focused' : '');
            
            if (this.viewMode === 'grid') {
                if (file.type === 'usb') {
                    // USB device card - simple, no storage info
                    item.classList.add('usb-card');
                    item.innerHTML = `
                        <div class="grid-thumb folder-thumb">
                            <div class="folder-icon">💾</div>
                        </div>
                        <div class="grid-name">${file.name}</div>
                    `;
                } else if (file.type === 'video') {
                    item.innerHTML = `
                        <div class="grid-thumb" data-path="${file.path}" data-index="${i}">
                            <div class="thumb-loading">Loading...</div>
                            <div class="play-icon">▶</div>
                        </div>
                        <div class="grid-name">${file.name}</div>
                        <div class="grid-size">${file.size}</div>
                    `;
                    // Load thumbnail asynchronously to avoid blocking
                    setTimeout(() => this.loadVideoThumbnailFromContentAPI(file.path, item), 100 * (i - this.loadedCount));
                } else if (file.type === 'image') {
                    item.innerHTML = `
                        <div class="grid-thumb">
                            <img src="file://${file.path}" class="thumb-img" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'thumb-loading\\'>🖼️</div>'">
                        </div>
                        <div class="grid-name">${file.name}</div>
                        <div class="grid-size">${file.size}</div>
                    `;
                } else if (file.type === 'folder') {
                    item.innerHTML = `
                        <div class="grid-thumb folder-thumb">
                            <div class="folder-icon">📁</div>
                        </div>
                        <div class="grid-name">${file.name}</div>
                        <div class="grid-size">${file.size}</div>
                    `;
                } else {
                    item.innerHTML = `
                        <div class="grid-icon">${file.icon}</div>
                        <div class="grid-name">${file.name}</div>
                        <div class="grid-size">${file.size}</div>
                    `;
                }
            } else {
                item.innerHTML = `
                    <span class="file-icon">${file.icon}</span>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${file.size}</span>
                `;
            }
            fragment.appendChild(item);
        }
        
        fileListEl.appendChild(fragment);
        this.loadedCount = endIndex;
    }

    // SIMPLIFIED: Video thumbnail loading - try multiple methods
    loadVideoThumbnailFromContentAPI(videoPath, itemElement) {
        const thumbEl = itemElement.querySelector('.grid-thumb');
        if (!thumbEl) return;
        
        // Method 1: Try direct video element snapshot (simplest)
        this.generateThumbnailFromVideo(videoPath, itemElement, () => {
            // Method 2: If that fails, try Content API
            if (this.contentManager) {
                this.tryContentAPIThumbnail(videoPath, itemElement, () => {
                    // Method 3: If all fails, show generic icon
                    this.showGenericVideoIcon(itemElement);
                });
            } else {
                this.showGenericVideoIcon(itemElement);
            }
        });
    }

    generateThumbnailFromVideo(videoPath, itemElement, onError) {
        const thumbEl = itemElement.querySelector('.grid-thumb');
        if (!thumbEl) {
            onError();
            return;
        }
        
        // Check cache first
        if (this.thumbnailCache[videoPath]) {
            thumbEl.style.backgroundImage = `url('${this.thumbnailCache[videoPath]}')`;
            thumbEl.style.backgroundSize = 'cover';
            thumbEl.style.backgroundPosition = 'center';
            const loadingEl = thumbEl.querySelector('.thumb-loading');
            if (loadingEl) loadingEl.style.display = 'none';
            return;
        }
        
        const video = document.createElement('video');
        video.style.position = 'absolute';
        video.style.left = '-9999px';
        video.style.width = '320px';
        video.style.height = '180px';
        video.muted = true;
        video.preload = 'metadata';
        video.crossOrigin = 'anonymous';
        
        let captured = false;
        let attempts = 0;
        const maxAttempts = 3;
        
        let timeout = setTimeout(() => {
            if (!captured) {
                video.remove();
                onError();
            }
        }, 5000);
        
        video.addEventListener('loadedmetadata', () => {
            const seekTime = Math.min(3, video.duration * 0.05, video.duration - 0.1);
            video.currentTime = seekTime;
        }, { once: true });
        
        video.addEventListener('seeked', () => {
            if (captured) return;
            attempts++;
            
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 320;
                canvas.height = 180;
                const ctx = canvas.getContext('2d', { willReadFrequently: false });
                ctx.drawImage(video, 0, 0, 320, 180);
                
                // Check for black frame
                const imageData = ctx.getImageData(160, 90, 1, 1);
                const centerPixel = imageData.data;
                const isBlack = centerPixel[0] < 10 && centerPixel[1] < 10 && centerPixel[2] < 10;
                
                if (isBlack && attempts < maxAttempts) {
                    video.currentTime = Math.min(video.currentTime + 2, video.duration * 0.15);
                    return;
                }
                
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                this.thumbnailCache[videoPath] = dataUrl;
                
                thumbEl.style.backgroundImage = `url('${dataUrl}')`;
                thumbEl.style.backgroundSize = 'cover';
                thumbEl.style.backgroundPosition = 'center';
                const loadingEl = thumbEl.querySelector('.thumb-loading');
                if (loadingEl) loadingEl.style.display = 'none';
                
                captured = true;
                clearTimeout(timeout);
                video.remove();
            } catch (e) {
                console.warn('Canvas capture failed:', e);
                clearTimeout(timeout);
                video.remove();
                onError();
            }
        });
        
        video.addEventListener('error', (e) => {
            clearTimeout(timeout);
            video.remove();
            onError();
        }, { once: true });
        
        video.src = 'file://' + videoPath;
        document.body.appendChild(video);
        video.load();
    }

    tryContentAPIThumbnail(videoPath, itemElement, onError) {
        try {
            const filter = new tizen.AttributeFilter('contentURI', 'EXACTLY', 'file://' + videoPath);
            
            this.contentManager.find(
                (contents) => {
                    if (contents && contents.length > 0 && contents[0].thumbnailURIs && contents[0].thumbnailURIs.length > 0) {
                        const thumbURI = contents[0].thumbnailURIs[0];
                        this.thumbnailCache[videoPath] = thumbURI;
                        this.applyThumbnail(itemElement, thumbURI);
                    } else {
                        onError();
                    }
                },
                (error) => {
                    console.warn('Content API error:', error);
                    onError();
                },
                null,
                filter
            );
        } catch (e) {
            console.warn('Content API exception:', e);
            onError();
        }
    }

    showGenericVideoIcon(itemElement) {
        const thumbEl = itemElement.querySelector('.grid-thumb');
        if (!thumbEl) return;
        
        const loadingEl = thumbEl.querySelector('.thumb-loading');
        if (loadingEl) {
            loadingEl.textContent = '🎬';
            loadingEl.style.fontSize = '64px';
        }
    }

    applyThumbnail(itemElement, thumbURI) {
        const thumbEl = itemElement.querySelector('.grid-thumb');
        if (!thumbEl) return;
        
        thumbEl.style.backgroundImage = `url('${thumbURI}')`;
        thumbEl.style.backgroundSize = 'cover';
        thumbEl.style.backgroundPosition = 'center';
        
        const loadingEl = thumbEl.querySelector('.thumb-loading');
        if (loadingEl) loadingEl.style.display = 'none';
    }

    selectFile() {
        const file = this.fileList[this.focusedIndex];
        if (!file) return;
        
        if (file.type === 'usb') {
            // Store USB device info before navigating
            this.currentUSBDevice = file;
            this.navigateToPath(file.path);
        } else if (file.type === 'folder') {
            this.navigateToPath(file.path);
        } else if (file.type === 'video') {
            this.playVideo(file);
        } else if (file.type === 'image') {
            this.viewImage(file);
        }
    }

    playVideo(file) {
        if (this.useAVPlay) {
            this.playVideoWithAVPlay(file);
        } else {
            this.playVideoWithHTML5(file);
        }
    }

    playVideoWithAVPlay(file) {
        console.log('Playing with AVPlay:', file.name);
        
        try {
            // Stop any existing playback
            try {
                webapis.avplay.stop();
                webapis.avplay.close();
            } catch (e) {}
            
            // Setup AVPlay listeners with detailed error handling
            const avplayListener = {
                onbufferingstart: () => {
                    console.log('Buffering...');
                    this.showBufferingIndicator(true);
                },
                onbufferingcomplete: () => {
                    console.log('Buffering complete');
                    this.showBufferingIndicator(false);
                },
                onstreamcompleted: () => {
                    console.log('Stream completed');
                    try {
                        webapis.avplay.stop();
                        webapis.avplay.close();
                    } catch (e) {}
                    this.showScreen('browser');
                },
                oncurrentplaytime: (currentTime) => {
                    try {
                        const duration = webapis.avplay.getDuration();
                        const percent = (currentTime / duration) * 100;
                        document.getElementById('progress-fill').style.width = percent + '%';
                        document.getElementById('video-time').textContent = 
                            `${this.formatTime(currentTime / 1000)} / ${this.formatTime(duration / 1000)}`;
                    } catch (e) {}
                },
                onerror: (eventType) => {
                    console.error('AVPlay error:', eventType);
                    
                    // Decode error type
                    let errorMsg = 'Playback error occurred.';
                    const errorTypes = {
                        'PLAYER_ERROR_NONE': 'No error',
                        'PLAYER_ERROR_INVALID_PARAMETER': 'Invalid parameter',
                        'PLAYER_ERROR_NO_SUCH_FILE': 'File not found',
                        'PLAYER_ERROR_INVALID_OPERATION': 'Invalid operation',
                        'PLAYER_ERROR_SEEK_FAILED': 'Seek failed',
                        'PLAYER_ERROR_INVALID_STATE': 'Invalid state',
                        'PLAYER_ERROR_NOT_SUPPORTED_FILE': 'File format not supported',
                        'PLAYER_ERROR_INVALID_URI': 'Invalid file path',
                        'PLAYER_ERROR_CONNECTION_FAILED': 'Connection failed',
                        'PLAYER_ERROR_GENREIC': 'Generic error'
                    };
                    
                    // Try to get specific error
                    if (typeof eventType === 'string' && errorTypes[eventType]) {
                        errorMsg = errorTypes[eventType];
                    }
                    
                    // Check file-specific issues
                    const fileName = file.name.toLowerCase();
                    if (fileName.endsWith('.avi')) {
                        errorMsg += '\n\nAVI codec issue.\nThis AVI file may use an unsupported codec (DivX, XviD old versions).\n\nTry:\n1. Converting to MP4 (H.264)\n2. Re-encoding AVI with modern codec';
                    } else if (fileName.includes('hevc') || fileName.includes('x265')) {
                        errorMsg += '\n\nHEVC issue.\nYour TV may not support:\n- 10-bit color depth\n- High bitrate HEVC\n- Specific HEVC profile\n\nTry converting to H.264';
                    } else if (fileName.endsWith('.mkv')) {
                        errorMsg += '\n\nMKV codec issue.\nThe audio/video codec inside may not be supported.\n\nCommon issues:\n- Vorbis audio\n- VP9 video\n- Hi10P anime\n\nTry converting to MP4 with H.264 + AAC';
                    } else if (fileName.endsWith('.flv')) {
                        errorMsg += '\n\nFLV format issue.\nOld Flash video format.\n\nConvert to MP4 for better compatibility';
                    }
                    
                    alert(errorMsg);
                    
                    try {
                        webapis.avplay.stop();
                        webapis.avplay.close();
                    } catch (e) {}
                    this.showScreen('browser');
                },
                onevent: (eventType, eventData) => {
                    console.log('AVPlay event:', eventType, eventData);
                },
                ondrmevent: (drmEvent, drmData) => {
                    console.log('DRM event:', drmEvent, drmData);
                }
            };
            
            // Open and prepare
            const filePath = 'file://' + file.path;
            console.log('Opening:', filePath);
            
            webapis.avplay.open(filePath);
            webapis.avplay.setListener(avplayListener);
            
            // Set display area to full screen
            webapis.avplay.setDisplayRect(0, 0, 1920, 1080);
            
            // Set display method - auto scaling
            webapis.avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_AUTO_ASPECT_RATIO');
            
            document.getElementById('video-title').textContent = file.name;
            this.showScreen('player');
            
            // Hide HTML5 video element
            this.videoElement.style.display = 'none';
            
            // Prepare asynchronously
            webapis.avplay.prepareAsync(() => {
                console.log('Prepared, starting playback');
                webapis.avplay.play();
                this.isPlaying = true;
                document.getElementById('btn-play-pause').innerHTML = '<img src="images/pause.svg">';
            }, (error) => {
                console.error('Prepare failed:', error);
                alert('Failed to prepare video.\n\n' + error);
                this.showScreen('browser');
            });
            
            this.showControls();
            
        } catch (error) {
            console.error('AVPlay setup failed:', error);
            alert('Cannot initialize AVPlay.\n\nError: ' + error.message + '\n\nTry:\n1. Restarting the TV\n2. Converting video to MP4 H.264');
            this.showScreen('browser');
        }
    }

    showBufferingIndicator(show) {
        // Add buffering indicator (optional enhancement)
        if (show) {
            document.getElementById('video-title').textContent += ' (Buffering...)';
        }
    }

    playVideoWithHTML5(file) {
        console.log('Playing with HTML5 video:', file.name);
        this.videoElement.style.display = 'block';
        this.videoElement.src = 'file://' + file.path;
        document.getElementById('video-title').textContent = file.name;
        this.showScreen('player');
        this.controlFocused = -1;
        
        // Better error handling for unsupported codecs
        this.videoElement.play().catch(err => {
            console.error('Playback error:', err);
            let errorMsg = 'Cannot play this video';
            
            // Check for codec issues
            if (file.name.toLowerCase().includes('hevc') || 
                file.name.toLowerCase().includes('x265') || 
                file.name.toLowerCase().includes('h265')) {
                errorMsg = 'HEVC/H.265 codec not supported in HTML5 mode.\n\nAVPlay is needed but unavailable.\n\nPlease convert to H.264 (x264) format.';
            } else if (file.name.toLowerCase().includes('10bit')) {
                errorMsg = '10-bit video not supported.\n\nPlease use 8-bit version.';
            } else if (file.name.toLowerCase().includes('hdr')) {
                errorMsg = 'HDR video may not be supported.\n\nTry SDR version or check TV settings.';
            } else if (file.name.toLowerCase().endsWith('.mkv')) {
                errorMsg = 'MKV container issue or unsupported codec.\n\nTry converting to MP4 with H.264.';
            }
            
            alert(errorMsg);
            this.showScreen('browser');
        });
        this.showControls();
    }

    viewImage(file) {
        // Check if HEIC - these need special handling
        if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
            alert('HEIC/HEIF images are not supported by this TV browser.\n\nPlease convert to JPG or PNG format.');
            return;
        }
        
        this.imageElement.src = 'file://' + file.path;
        this.imageElement.onerror = () => {
            alert('Cannot open this image format.\n\nSupported: JPG, PNG, GIF, BMP, WebP');
            this.showScreen('browser');
        };
        document.getElementById('image-name').textContent = file.name;
        this.showScreen('image');
    }

    navigateImage(direction) {
        let newIndex = this.focusedIndex + direction;
        while (newIndex >= 0 && newIndex < this.fileList.length) {
            if (this.fileList[newIndex].type === 'image') {
                this.focusedIndex = newIndex;
                this.viewImage(this.fileList[newIndex]);
                return;
            }
            newIndex += direction;
        }
    }

    togglePlayPause() {
        if (this.currentScreen !== 'player') return;
        
        if (this.useAVPlay) {
            try {
                const state = webapis.avplay.getState();
                if (state === 'PLAYING') {
                    webapis.avplay.pause();
                    this.isPlaying = false;
                    document.getElementById('btn-play-pause').innerHTML = '<img src="images/play.svg">';
                } else if (state === 'PAUSED') {
                    webapis.avplay.play();
                    this.isPlaying = true;
                    document.getElementById('btn-play-pause').innerHTML = '<img src="images/pause.svg">';
                }
            } catch (e) {
                console.error('AVPlay control error:', e);
            }
        } else {
            if (this.videoElement.paused) {
                this.videoElement.play();
            } else {
                this.videoElement.pause();
            }
        }
        this.showControls();
    }

    seekBackward() {
        if (this.currentScreen !== 'player') return;
        
        if (this.useAVPlay) {
            try {
                const currentTime = webapis.avplay.getCurrentTime();
                const newTime = Math.max(0, currentTime - 10000); // AVPlay uses milliseconds
                webapis.avplay.seekTo(newTime);
            } catch (e) {
                console.error('AVPlay seek error:', e);
            }
        } else {
            this.videoElement.currentTime = Math.max(0, this.videoElement.currentTime - 10);
        }
        this.showControls();
    }

    seekForward() {
        if (this.currentScreen !== 'player') return;
        
        if (this.useAVPlay) {
            try {
                const currentTime = webapis.avplay.getCurrentTime();
                const duration = webapis.avplay.getDuration();
                const newTime = Math.min(duration, currentTime + 10000); // AVPlay uses milliseconds
                webapis.avplay.seekTo(newTime);
            } catch (e) {
                console.error('AVPlay seek error:', e);
            }
        } else {
            this.videoElement.currentTime = Math.min(this.videoElement.duration, this.videoElement.currentTime + 10);
        }
        this.showControls();
    }

    showControls() {
        const overlay = document.getElementById('controls-overlay');
        overlay.classList.add('visible');
        clearTimeout(this.controlsTimeout);
        this.controlsTimeout = setTimeout(() => {
            if (this.controlFocused < 0) overlay.classList.remove('visible');
        }, 5000);
    }

    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const targetScreen = document.getElementById(screenName + '-screen');
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
        this.currentScreen = screenName;
    }

    isVideoFile(filename) {
        return this.supportedVideoFormats.some(ext => filename.toLowerCase().endsWith(ext));
    }

    isImageFile(filename) {
        return this.supportedImageFormats.some(ext => filename.toLowerCase().endsWith(ext));
    }

    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    showMessage(message) {
        document.getElementById('file-list').innerHTML = `
            <div class="loading-container">
                <div class="loading-text">${message}</div>
            </div>
        `;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.tysonPlayer = new TysonPlayer();
});
