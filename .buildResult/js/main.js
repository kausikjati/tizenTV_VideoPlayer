// Tyson Player - Main Application Logic

class TysonPlayer {
    constructor() {
        this.currentScreen = 'browser';
        this.currentPath = '/';
        this.fileList = [];
        this.playlist = [];
        this.currentVideoIndex = -1;
        this.focusedIndex = 0;
        this.videoElement = null;
        this.currentSubtitle = null;
        this.subtitleTracks = [];
        this.isPlaying = false;
        this.controlsVisible = false;
        this.controlsTimeout = null;
        this.resumeData = {};
        this.supportedVideoFormats = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.3gp', '.mpeg', '.mpg'];
        this.supportedSubtitleFormats = ['.srt', '.vtt', '.ass', '.ssa'];
        
        this.init();
    }

    init() {
        console.log('Initializing Tyson Player...');
        
        this.videoElement = document.getElementById('video-player');
        this.registerKeys();
        this.loadResumeData();
        this.setupEventListeners();
        this.scanUSBDevices();
    }

    registerKeys() {
        const usedKeys = [
            'MediaPlay', 'MediaPause', 'MediaPlayPause',
            'MediaRewind', 'MediaFastForward',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue'
        ];
        
        usedKeys.forEach(key => {
            try {
                tizen.tvinputdevice.registerKey(key);
            } catch (e) {
                console.log('Failed to register key:', key);
            }
        });
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        this.videoElement.addEventListener('timeupdate', this.updateProgress.bind(this));
        this.videoElement.addEventListener('ended', this.onVideoEnded.bind(this));
        this.videoElement.addEventListener('loadedmetadata', this.onVideoLoaded.bind(this));
        
        document.getElementById('player-screen').addEventListener('mousemove', () => {
            this.showControls();
        });
        
        this.setupButtonListeners();
    }

    setupButtonListeners() {
        document.getElementById('btn-play-pause').addEventListener('click', () => {
            this.togglePlayPause();
        });
        
        document.getElementById('btn-rewind').addEventListener('click', () => {
            this.seekBackward();
        });
        
        document.getElementById('btn-forward').addEventListener('click', () => {
            this.seekForward();
        });
        
        document.getElementById('btn-subtitle').addEventListener('click', () => {
            this.showScreen('subtitle');
        });
        
        document.getElementById('btn-playlist').addEventListener('click', () => {
            this.showScreen('playlist');
        });
        
        document.getElementById('btn-back').addEventListener('click', () => {
            this.handleBack();
        });
    }

    handleKeyPress(e) {
        console.log('Key pressed:', e.keyCode);
        
        switch(e.keyCode) {
            case 10009:
            case 27:
                this.handleBack();
                break;
            case 13:
                this.handleOK();
                break;
            case 37:
                this.handleLeft();
                break;
            case 38:
                this.handleUp();
                break;
            case 39:
                this.handleRight();
                break;
            case 40:
                this.handleDown();
                break;
            case 415:
            case 19:
            case 10252:
                this.togglePlayPause();
                break;
            case 412:
                this.seekBackward();
                break;
            case 417:
                this.seekForward();
                break;
        }
    }

    handleBack() {
        switch(this.currentScreen) {
            case 'browser':
                if (this.currentPath !== '/') {
                    this.navigateUp();
                } else {
                    tizen.application.getCurrentApplication().exit();
                }
                break;
            case 'player':
                this.saveCurrentPosition();
                this.showScreen('browser');
                this.videoElement.pause();
                break;
            case 'playlist':
            case 'subtitle':
                this.showScreen('player');
                break;
        }
    }

    handleOK() {
        switch(this.currentScreen) {
            case 'browser':
                this.selectFile();
                break;
            case 'playlist':
                this.playFromPlaylist();
                break;
            case 'subtitle':
                this.selectSubtitle();
                break;
        }
    }

    handleUp() {
        if (this.currentScreen === 'browser' || this.currentScreen === 'playlist' || this.currentScreen === 'subtitle') {
            this.moveFocus(-1);
        }
    }

    handleDown() {
        if (this.currentScreen === 'browser' || this.currentScreen === 'playlist' || this.currentScreen === 'subtitle') {
            this.moveFocus(1);
        }
    }

    handleLeft() {
        if (this.currentScreen === 'player') {
            this.seekBackward();
        }
    }

    handleRight() {
        if (this.currentScreen === 'player') {
            this.seekForward();
        }
    }

    scanUSBDevices() {
        console.log('Scanning for USB devices...');
        
        try {
            tizen.filesystem.listStorages((storages) => {
                console.log('Found storages:', storages.length);
                
                const usbDevices = storages.filter(storage => 
                    storage.type === 'EXTERNAL' || storage.type === 'USB'
                );
                
                if (usbDevices.length === 0) {
                    this.showMessage('No USB devices found. Please insert a USB drive.');
                    return;
                }
                
                this.showUSBDevices(usbDevices);
                
            }, (error) => {
                console.error('Error listing storages:', error);
                this.showMessage('Error accessing storage: ' + error.message);
            });
            
        } catch (error) {
            console.error('Error scanning USB:', error);
            this.showMessage('Error: ' + error.message);
        }
    }

    showUSBDevices(devices) {
        const fileListEl = document.getElementById('file-list');
        fileListEl.innerHTML = '';
        
        this.fileList = devices.map((device, index) => ({
            name: device.label || `USB Device ${index + 1}`,
            path: device.label,
            type: 'usb',
            size: this.formatSize(device.availableCapacity || 0),
            icon: '💾'
        }));
        
        this.renderFileList();
    }

    navigateToPath(path) {
        console.log('Navigating to:', path);
        
        try {
            tizen.filesystem.resolve(path, (dir) => {
                this.currentPath = path;
                document.getElementById('current-path').textContent = path;
                
                dir.listFiles((files) => {
                    this.fileList = files.map(file => {
                        const fileName = file.name;
                        const isVideo = this.isVideoFile(fileName);
                        const isDirectory = file.isDirectory;
                        
                        return {
                            name: fileName,
                            path: file.fullPath,
                            type: isDirectory ? 'folder' : (isVideo ? 'video' : 'file'),
                            size: isDirectory ? '' : this.formatSize(file.fileSize),
                            icon: isDirectory ? '📁' : (isVideo ? '🎬' : '📄'),
                            file: file
                        };
                    });
                    
                    this.fileList.sort((a, b) => {
                        if (a.type === 'folder' && b.type !== 'folder') return -1;
                        if (a.type !== 'folder' && b.type === 'folder') return 1;
                        if (a.type === 'video' && b.type !== 'video' && b.type !== 'folder') return -1;
                        if (a.type !== 'video' && a.type !== 'folder' && b.type === 'video') return 1;
                        return a.name.localeCompare(b.name);
                    });
                    
                    this.focusedIndex = 0;
                    this.renderFileList();
                    
                }, (error) => {
                    console.error('Error listing files:', error);
                    this.showMessage('Error reading folder: ' + error.message);
                });
                
            }, (error) => {
                console.error('Error resolving path:', error);
                this.showMessage('Error accessing path: ' + error.message);
            }, 'r');
            
        } catch (error) {
            console.error('Error navigating:', error);
            this.showMessage('Navigation error: ' + error.message);
        }
    }

    navigateUp() {
        const parts = this.currentPath.split('/');
        parts.pop();
        const parentPath = parts.join('/') || '/';
        
        if (parentPath === '/') {
            this.scanUSBDevices();
        } else {
            this.navigateToPath(parentPath);
        }
    }

    renderFileList() {
        const fileListEl = document.getElementById('file-list');
        fileListEl.innerHTML = '';
        
        if (this.fileList.length === 0) {
            fileListEl.innerHTML = '<div class="loading">No files found</div>';
            return;
        }
        
        this.fileList.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'file-item' + (index === this.focusedIndex ? ' focused' : '');
            item.innerHTML = `
                <span class="file-icon">${file.icon}</span>
                <span class="file-name">${file.name}</span>
                <span class="file-size">${file.size}</span>
            `;
            fileListEl.appendChild(item);
        });
    }

    moveFocus(direction) {
        const listLength = this.currentScreen === 'browser' ? this.fileList.length :
                          this.currentScreen === 'playlist' ? this.playlist.length :
                          this.subtitleTracks.length;
        
        this.focusedIndex = Math.max(0, Math.min(listLength - 1, this.focusedIndex + direction));
        
        if (this.currentScreen === 'browser') {
            this.renderFileList();
        } else if (this.currentScreen === 'playlist') {
            this.renderPlaylist();
        } else if (this.currentScreen === 'subtitle') {
            this.renderSubtitleList();
        }
    }

    selectFile() {
        const selectedFile = this.fileList[this.focusedIndex];
        if (!selectedFile) return;
        
        if (selectedFile.type === 'usb') {
            this.navigateToPath(selectedFile.path);
        } else if (selectedFile.type === 'folder') {
            this.navigateToPath(selectedFile.path);
        } else if (selectedFile.type === 'video') {
            this.addToPlaylist(selectedFile);
            this.playVideo(this.playlist.length - 1);
        }
    }

    addToPlaylist(file) {
        if (!this.playlist.find(v => v.path === file.path)) {
            this.playlist.push(file);
        }
    }

    playVideo(index) {
        if (index < 0 || index >= this.playlist.length) return;
        
        this.currentVideoIndex = index;
        const video = this.playlist[index];
        
        console.log('Playing video:', video.name);
        
        this.loadSubtitles(video.path);
        this.videoElement.src = 'file://' + video.path;
        document.getElementById('video-title').textContent = video.name;
        this.showScreen('player');
        
        const resumeTime = this.resumeData[video.path];
        if (resumeTime) {
            this.videoElement.currentTime = resumeTime;
        }
        
        this.videoElement.play();
        this.isPlaying = true;
        this.showControls();
    }

    onVideoLoaded() {
        const duration = this.formatTime(this.videoElement.duration);
        document.getElementById('video-time').textContent = `00:00 / ${duration}`;
    }

    togglePlayPause() {
        if (this.currentScreen !== 'player') return;
        
        if (this.isPlaying) {
            this.videoElement.pause();
            this.isPlaying = false;
            document.getElementById('btn-play-pause').textContent = '▶ Play';
        } else {
            this.videoElement.play();
            this.isPlaying = true;
            document.getElementById('btn-play-pause').textContent = '⏸ Pause';
        }
        
        this.showControls();
    }

    seekBackward() {
        this.videoElement.currentTime = Math.max(0, this.videoElement.currentTime - 10);
        this.showControls();
    }

    seekForward() {
        this.videoElement.currentTime = Math.min(
            this.videoElement.duration,
            this.videoElement.currentTime + 10
        );
        this.showControls();
    }

    updateProgress() {
        const percent = (this.videoElement.currentTime / this.videoElement.duration) * 100;
        document.getElementById('progress-fill').style.width = percent + '%';
        
        const current = this.formatTime(this.videoElement.currentTime);
        const total = this.formatTime(this.videoElement.duration);
        document.getElementById('video-time').textContent = `${current} / ${total}`;
    }

    onVideoEnded() {
        this.saveCurrentPosition();
        
        if (this.currentVideoIndex < this.playlist.length - 1) {
            this.playVideo(this.currentVideoIndex + 1);
        } else {
            this.showScreen('browser');
        }
    }

    showControls() {
        const overlay = document.getElementById('controls-overlay');
        overlay.classList.add('visible');
        
        clearTimeout(this.controlsTimeout);
        this.controlsTimeout = setTimeout(() => {
            overlay.classList.remove('visible');
        }, 5000);
    }

    loadSubtitles(videoPath) {
        const basePath = videoPath.substring(0, videoPath.lastIndexOf('.'));
        const dir = videoPath.substring(0, videoPath.lastIndexOf('/'));
        
        this.subtitleTracks = [{ name: 'No Subtitles', path: null }];
        
        try {
            tizen.filesystem.resolve(dir, (dirFile) => {
                dirFile.listFiles((files) => {
                    files.forEach(file => {
                        if (this.isSubtitleFile(file.name) && file.name.startsWith(basePath.split('/').pop())) {
                            this.subtitleTracks.push({
                                name: file.name,
                                path: file.fullPath
                            });
                        }
                    });
                }, (error) => {
                    console.log('Error loading subtitles:', error);
                });
            }, (error) => {
                console.log('Error accessing subtitle directory:', error);
            }, 'r');
        } catch (error) {
            console.log('Subtitle loading error:', error);
        }
    }

    selectSubtitle() {
        const subtitle = this.subtitleTracks[this.focusedIndex];
        if (!subtitle) return;
        
        this.currentSubtitle = subtitle.path;
        
        if (subtitle.path) {
            this.loadSubtitleFile(subtitle.path);
        } else {
            document.getElementById('subtitle-container').textContent = '';
        }
        
        this.showScreen('player');
    }

    loadSubtitleFile(path) {
        try {
            tizen.filesystem.resolve(path, (file) => {
                file.openStream('r', (stream) => {
                    const content = stream.read(file.fileSize);
                    stream.close();
                    this.parseSubtitle(content);
                }, (error) => {
                    console.error('Error reading subtitle:', error);
                }, 'UTF-8');
            }, (error) => {
                console.error('Error loading subtitle file:', error);
            }, 'r');
        } catch (error) {
            console.error('Subtitle error:', error);
        }
    }

    parseSubtitle(content) {
        console.log('Subtitle loaded, parsing not fully implemented');
    }

    saveCurrentPosition() {
        if (this.currentVideoIndex >= 0) {
            const video = this.playlist[this.currentVideoIndex];
            this.resumeData[video.path] = this.videoElement.currentTime;
            
            try {
                localStorage.setItem('tyson_resume', JSON.stringify(this.resumeData));
            } catch (error) {
                console.log('Error saving resume data:', error);
            }
        }
    }

    loadResumeData() {
        try {
            const data = localStorage.getItem('tyson_resume');
            if (data) {
                this.resumeData = JSON.parse(data);
            }
        } catch (error) {
            console.log('Error loading resume data:', error);
        }
    }

    renderPlaylist() {
        const contentEl = document.getElementById('playlist-content');
        
        if (this.playlist.length === 0) {
            contentEl.innerHTML = '<div class="playlist-empty">No videos in playlist</div>';
            return;
        }
        
        contentEl.innerHTML = '';
        this.playlist.forEach((video, index) => {
            const item = document.createElement('div');
            item.className = 'playlist-item' + 
                            (index === this.focusedIndex ? ' focused' : '') +
                            (index === this.currentVideoIndex ? ' now-playing' : '');
            item.innerHTML = `
                <span class="playlist-number">${index + 1}</span>
                <span class="file-name">${video.name}</span>
                <span class="file-size">${video.size}</span>
            `;
            contentEl.appendChild(item);
        });
    }

    playFromPlaylist() {
        this.playVideo(this.focusedIndex);
    }

    renderSubtitleList() {
        const listEl = document.getElementById('subtitle-list');
        listEl.innerHTML = '';
        
        this.subtitleTracks.forEach((subtitle, index) => {
            const item = document.createElement('div');
            item.className = 'subtitle-item' + (index === this.focusedIndex ? ' focused' : '');
            item.innerHTML = `<span>${subtitle.name}</span>`;
            listEl.appendChild(item);
        });
    }

    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        document.getElementById(screenName + '-screen').classList.add('active');
        this.currentScreen = screenName;
        
        if (screenName === 'playlist') {
            this.focusedIndex = this.currentVideoIndex >= 0 ? this.currentVideoIndex : 0;
            this.renderPlaylist();
        } else if (screenName === 'subtitle') {
            this.focusedIndex = 0;
            this.renderSubtitleList();
        }
    }

    isVideoFile(filename) {
        return this.supportedVideoFormats.some(ext => 
            filename.toLowerCase().endsWith(ext)
        );
    }

    isSubtitleFile(filename) {
        return this.supportedSubtitleFormats.some(ext => 
            filename.toLowerCase().endsWith(ext)
        );
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
        
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    showMessage(message) {
        const fileListEl = document.getElementById('file-list');
        fileListEl.innerHTML = `<div class="loading">${message}</div>`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.tysonPlayer = new TysonPlayer();
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.tysonPlayer) {
        window.tysonPlayer.saveCurrentPosition();
    }
});