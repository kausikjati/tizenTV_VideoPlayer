// Tyson Player - With Performance, Thumbnails & Image Viewer

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
        this.viewMode = 'list';
        this.batchSize = 50; // PERFORMANCE: Load 50 at a time
        this.loadedCount = 0;
        this.supportedVideoFormats = ['.mp4', '.mkv', '.mov', '.wmv', '.webm', '.m4v', '.3gp', '.mpeg', '.mpg', '.flv'];
        this.supportedImageFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
        
        this.init();
    }

    init() {
        console.log('Init with Performance Features');
        this.videoElement = document.getElementById('video-player');
        this.imageElement = document.getElementById('image-viewer');
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
        
        // PERFORMANCE: Lazy load on scroll
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
                this.videoElement.pause();
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
                this.moveFocus(this.viewMode === 'grid' ? -4 : -1);
            }
        }
    }

    handleDown() {
        if (this.currentScreen === 'browser') {
            if (this.headerFocused) {
                this.headerFocused = false;
                document.getElementById('btn-view-toggle').classList.remove('focused');
            } else {
                this.moveFocus(this.viewMode === 'grid' ? 4 : 1);
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
        
        // PERFORMANCE: Load more if near end
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
        try {
            tizen.filesystem.listStorages((storages) => {
                const usbDevices = storages.filter(s => s.type === 'EXTERNAL' || s.type === 'USB');
                if (usbDevices.length === 0) {
                    this.showMessage('No USB found');
                    return;
                }
                this.fileList = usbDevices.map((device, i) => ({
                    name: device.label || `USB ${i + 1}`,
                    path: device.label,
                    type: 'usb',
                    size: this.formatSize(device.availableCapacity || 0),
                    icon: '💾'
                }));
                this.focusedIndex = 0;
                this.loadedCount = 0;
                this.renderFileList();
            }, (error) => this.showMessage('Error: ' + error.message));
        } catch (error) {
            this.showMessage('Error scanning USB');
        }
    }

    navigateToPath(path) {
        this.showMessage('Loading...');
        try {
            tizen.filesystem.resolve(path, (dir) => {
                this.currentPath = path;
                document.getElementById('current-path').textContent = path;
                dir.listFiles((files) => {
                    // PERFORMANCE: Process async
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
                        this.renderFileList();
                    }, 0);
                }, () => this.showMessage('Cannot read folder'));
            }, () => this.showMessage('Cannot open path'), 'r');
        } catch (error) {
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

    // PERFORMANCE: Load files in batches
    loadMoreFiles() {
        if (this.loadedCount >= this.fileList.length) return;
        const fileListEl = document.getElementById('file-list');
        const endIndex = Math.min(this.loadedCount + this.batchSize, this.fileList.length);
        
        for (let i = this.loadedCount; i < endIndex; i++) {
            const file = this.fileList[i];
            const item = document.createElement('div');
            item.className = 'file-item' + (i === this.focusedIndex ? ' focused' : '');
            
            if (this.viewMode === 'grid') {
                if (file.type === 'video') {
                    item.innerHTML = `<div class="grid-thumb"><div class="thumb-loading">🎬</div><div class="play-icon">▶</div></div><div class="grid-name">${file.name}</div><div class="grid-size">${file.size}</div>`;
                    // Note: Canvas thumbnail blocked by Tizen security
                } else if (file.type === 'image') {
                    item.innerHTML = `<div class="grid-thumb" style="background-image: url('file://${file.path}'); background-size: cover; background-position: center;"><div class="play-icon" style="display:none;">🖼️</div></div><div class="grid-name">${file.name}</div><div class="grid-size">${file.size}</div>`;
                } else {
                    item.innerHTML = `<div class="grid-icon">${file.icon}</div><div class="grid-name">${file.name}</div><div class="grid-size">${file.size}</div>`;
                }
            } else {
                item.innerHTML = `<span class="file-icon">${file.icon}</span><span class="file-name">${file.name}</span><span class="file-size">${file.size}</span>`;
            }
            fileListEl.appendChild(item);
        }
        this.loadedCount = endIndex;
    }

    // FEATURE: Real video thumbnails
    loadVideoThumbnail(videoPath, itemElement) {
        console.log('Attempting to load thumbnail for:', videoPath);
        const thumbEl = itemElement.querySelector('.grid-thumb');
        if (!thumbEl) {
            console.log('No thumb element found');
            return;
        }
        
        const video = document.createElement('video');
        video.style.display = 'none';
        video.src = 'file://' + videoPath;
        video.muted = true;
        video.preload = 'metadata';
        video.crossOrigin = 'anonymous';
        
        video.addEventListener('loadeddata', () => {
            console.log('Video loaded, duration:', video.duration);
            video.currentTime = Math.min(5, video.duration * 0.1);
        });
        
        video.addEventListener('seeked', () => {
            console.log('Video seeked, attempting canvas capture');
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 320;
                canvas.height = 180;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, 320, 180);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                console.log('Thumbnail generated successfully');
                thumbEl.style.backgroundImage = `url('${dataUrl}')`;
                thumbEl.style.backgroundSize = 'cover';
                thumbEl.style.backgroundPosition = 'center';
                const loadingEl = thumbEl.querySelector('.thumb-loading');
                if (loadingEl) loadingEl.style.display = 'none';
            } catch (e) {
                console.error('Thumbnail generation error:', e);
                alert('Thumbnail Error: ' + e.message + '\nTizen may block canvas access for security.');
            }
            video.remove();
        });
        
        video.addEventListener('error', (e) => {
            console.error('Video loading error:', e);
            video.remove();
        });
        
        document.body.appendChild(video);
    }

    selectFile() {
        const file = this.fileList[this.focusedIndex];
        if (!file) {
            console.log('No file selected');
            return;
        }
        console.log('File selected:', file.name, 'Type:', file.type);
        if (file.type === 'usb' || file.type === 'folder') this.navigateToPath(file.path);
        else if (file.type === 'video') this.playVideo(file);
        else if (file.type === 'image') this.viewImage(file);
        else console.log('Unknown file type:', file.type);
    }

    playVideo(file) {
        if (file.name.toLowerCase().endsWith('.avi')) {
            alert('⚠️ AVI Not Supported\\n\\nConvert to MP4');
            return;
        }

        this.videoElement.src = 'file://' + file.path;
        document.getElementById('video-title').textContent = file.name;
        this.showScreen('player');
        this.controlFocused = -1;
        this.videoElement.play().catch(err => alert('Cannot play: ' + err.message));
        this.showControls();
    }


    // FEATURE: Image viewer
    viewImage(file) {
        console.log('Opening image viewer for:', file.name, file.path);
        try {
            this.imageElement.src = 'file://' + file.path;
            document.getElementById('image-name').textContent = file.name;
            this.showScreen('image');
            console.log('Image viewer screen should be visible now');
        } catch (e) {
            console.error('Image viewer error:', e);
            alert('Cannot open image: ' + e.message);
        }
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
        if (this.videoElement.paused) this.videoElement.play();
        else this.videoElement.pause();
        this.showControls();
    }

    seekBackward() {
        if (this.currentScreen !== 'player') return;
        this.videoElement.currentTime = Math.max(0, this.videoElement.currentTime - 10);
        this.showControls();
    }

    seekForward() {
        if (this.currentScreen !== 'player') return;
        this.videoElement.currentTime = Math.min(this.videoElement.duration, this.videoElement.currentTime + 10);
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
        console.log('Switching to screen:', screenName);
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const targetScreen = document.getElementById(screenName + '-screen');
        if (targetScreen) {
            targetScreen.classList.add('active');
            console.log('Screen activated:', screenName);
        } else {
            console.error('Screen not found:', screenName + '-screen');
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
        document.getElementById('file-list').innerHTML = `<div class="loading">${message}</div>`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.tysonPlayer = new TysonPlayer();
});
