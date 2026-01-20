import { showEditPanel } from './suneditor-integration.js';

class MeetingApp {
    constructor() {
        this.meetingData = null;
        this.currentPageKey = 'page01';
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupNavigation();
        this.selectPage('page01');
        this.setupEventListeners();
    }

    async loadData() {
        console.log('Starting loadData...');
        try {
            const saved = localStorage.getItem('meetingData');
            if (saved) {
                console.log('Loaded from localStorage');
                this.meetingData = JSON.parse(saved);
            } else {
                console.log('Fetching meeting.json...');
                const res = await fetch('data/meeting.json');
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                this.meetingData = await res.json();
                console.log('Fetched meeting.json success', this.meetingData);
            }

            if (!this.meetingData || !this.meetingData.pages) {
                console.error('Invalid meeting data structure:', this.meetingData);
                throw new Error('Invalid data');
            }
        } catch (e) {
            console.error('Load data failed:', e);
            alert('加載失敗，使用默認模板');
            this.createSampleData();
        }
    }

    createSampleData() {
        console.log('Creating sample data...');
        this.meetingData = {
            pages: {
                page01: {
                    title: "歡迎",
                    navLabel: "家",
                    background: "slide1.jpg",
                    sections: [{ type: "text", content: "歡迎來到生命河", style: { fontSize: "48px", textAlign: "center" } }]
                }
            }
        };
    }

    setupNavigation() {
        console.log('Setting up navigation...');
        const panel = document.getElementById('nav-panel');
        if (!panel) {
            console.error('Nav panel not found!');
            return;
        }

        const renderNav = () => {
            panel.innerHTML = '';

            if (!this.meetingData || !this.meetingData.pages) {
                console.error('No pages data found in setupNavigation');
                return;
            }

            const entries = Object.entries(this.meetingData.pages);
            console.log(`Found ${entries.length} pages to render`);

            entries.forEach(([key, page]) => {
                const pageNum = parseInt(key.replace('page', ''));
                const numStr = pageNum.toString().padStart(2, '0');

                const item = document.createElement('div');
                item.className = 'nav-item';
                if (key === this.currentPageKey) item.classList.add('active');

                item.textContent = page.navLabel || page.title.substring(0, 2) || numStr;

                item.onclick = () => this.selectPage(key);
                panel.appendChild(item);
            });
        };

        renderNav();
    }

    selectPage(pageKey) {
        this.currentPageKey = pageKey;
        const page = this.meetingData.pages[pageKey];
        this.renderPage(page);
        this.setupNavigation();
        this.showToast(`第 ${pageKey.replace('page', '')} 頁`);
    }

    // ==================== 修改的关键函数 ====================
    renderPage(page) {
        const main = document.getElementById('main');
        const container = document.getElementById('main-content');
        container.innerHTML = '';

        if (page.background) {
            main.style.backgroundImage = `url('assets/images/${page.background}')`;
        } else {
            main.style.backgroundImage = 'none';
        }

        if (page.title) {
            const titleEl = document.createElement('h1');
            titleEl.className = 'page-title';
            titleEl.textContent = page.title;
            container.appendChild(titleEl);
        }

        if (page.sections) {
            page.sections.forEach(section => {
                const wrapper = document.createElement('div');
                wrapper.className = 'section';
                const el = document.createElement('div');
                
                // ============ 关键修改：处理HTML内容 ============
                let content = section.content || '';
                
                // 1. 处理媒体内容（视频/音频）
                content = this.processMediaContent(content);
                
                // 2. 设置HTML
                el.innerHTML = content;
                // ===============================================
                
                // 编辑功能
                el.style.cursor = 'pointer';
                el.title = '點擊編輯內容';
                el.onclick = (e) => {
                    e.stopPropagation();
                    showEditPanel(section, el, () => {
                        this.saveData();
                        this.selectPage(this.currentPageKey);
                    });
                };

                if (section.style) {
                    Object.assign(el.style, section.style);
                }
                wrapper.appendChild(el);
                container.appendChild(wrapper);
                
                // 3. 绑定媒体播放事件
                this.bindMediaEvents(el);
            });
            
            // 如果 sections 为空，添加一个默认可编辑块
            if (!page.sections || page.sections.length === 0) {
                const wrapper = document.createElement('div');
                wrapper.className = 'section';
                const el = document.createElement('div');
                el.textContent = '點擊此處添加內容';
                el.style.cursor = 'pointer';
                el.style.color = '#ffffff';
                el.style.fontSize = '32px';
                el.title = '點擊編輯內容';
                el.onclick = (e) => {
                    e.stopPropagation();
                    const newSection = {
                        type: 'text',
                        content: '',
                        style: {}
                    };
                    showEditPanel(newSection, el, () => {
                        if (!page.sections) page.sections = [];
                        page.sections.push(newSection);
                        this.saveData();
                        this.selectPage(this.currentPageKey);
                    });
                };
                wrapper.appendChild(el);
                container.appendChild(wrapper);
            }
        }
    }
    
    // ==================== 新增函数：处理媒体内容 ====================
    processMediaContent(html) {
        if (!html) return '';
        
        let processed = html;
        
        // 1. 处理SunEditor的视频iframe（YouTube等）
        // SunEditor通常会把视频转换为iframe
        processed = processed.replace(
            /<iframe[^>]*src="([^"]+youtube[^"]+)"[^>]*><\/iframe>/gi,
            (match, src) => {
                // 提取YouTube视频ID
                const videoId = this.extractYouTubeId(src);
                return `
                    <div class="media-block" data-type="youtube" data-video-id="${videoId}">
                        <div class="media-preview">
                            <div class="play-button">▶</div>
                            <div class="media-label">YouTube影片</div>
                        </div>
                        <div class="media-player" style="display:none;">
                            <iframe src="https://www.youtube.com/embed/${videoId}" 
                                    frameborder="0" 
                                    allowfullscreen
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                            </iframe>
                        </div>
                    </div>
                `;
            }
        );
        
        // 2. 处理直接视频标签
        processed = processed.replace(
            /<video[^>]*src="([^"]+\.(mp4|webm|ogg))"[^>]*>([\s\S]*?)<\/video>/gi,
            (match, src, ext) => {
                return `
                    <div class="media-block" data-type="video" data-src="${src}">
                        <div class="media-preview">
                            <div class="play-button">▶</div>
                            <div class="media-label">影片播放器</div>
                        </div>
                        <div class="media-player" style="display:none;">
                            <video controls style="width:100%; max-width:600px;">
                                <source src="${src}" type="video/${ext}">
                                您的瀏覽器不支援影片播放
                            </video>
                        </div>
                    </div>
                `;
            }
        );
        
        // 3. 处理音频标签
        processed = processed.replace(
            /<audio[^>]*src="([^"]+\.(mp3|wav|ogg))"[^>]*>([\s\S]*?)<\/audio>/gi,
            (match, src, ext) => {
                return `
                    <div class="media-block" data-type="audio" data-src="${src}">
                        <div class="media-preview">
                            <div class="play-button">▶</div>
                            <div class="media-label">音訊播放器</div>
                        </div>
                        <div class="media-player" style="display:none;">
                            <audio controls style="width:100%; max-width:500px;">
                                <source src="${src}" type="audio/${ext}">
                                您的瀏覽器不支援音訊播放
                            </audio>
                        </div>
                    </div>
                `;
            }
        );
        
        // 4. 处理视频链接（没有视频标签，只有链接）
        processed = processed.replace(
            /<a[^>]*href="([^"]+\.(mp4|webm|ogg))"[^>]*>([\s\S]*?)<\/a>/gi,
            (match, src, ext, linkText) => {
                return `
                    <div class="media-block" data-type="video-link" data-src="${src}">
                        <div class="media-preview">
                            <div class="play-button">▶</div>
                            <div class="media-label">${linkText || '影片連結'}</div>
                        </div>
                        <div class="media-player" style="display:none;">
                            <video controls style="width:100%; max-width:600px;">
                                <source src="${src}" type="video/${ext}">
                            </video>
                        </div>
                    </div>
                `;
            }
        );
        
        return processed;
    }
    
    // ==================== 提取YouTube视频ID ====================
    extractYouTubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
    
    // ==================== 绑定媒体播放事件 ====================
    bindMediaEvents(container) {
        // 为所有媒体预览添加点击事件
        container.querySelectorAll('.media-preview').forEach(preview => {
            preview.onclick = (e) => {
                e.stopPropagation(); // 阻止冒泡到编辑事件
                
                const mediaBlock = preview.closest('.media-block');
                const player = mediaBlock.querySelector('.media-player');
                const previewEl = mediaBlock.querySelector('.media-preview');
                
                if (player && player.style.display === 'none') {
                    // 显示播放器，隐藏预览
                    player.style.display = 'block';
                    previewEl.style.display = 'none';
                    
                    // 如果是YouTube iframe，重新加载以确保能播放
                    const iframe = player.querySelector('iframe');
                    if (iframe) {
                        const currentSrc = iframe.src;
                        if (!currentSrc.includes('autoplay=1')) {
                            iframe.src = currentSrc.replace(/(\?|&)autoplay=0/, '') + 
                                        (currentSrc.includes('?') ? '&' : '?') + 'autoplay=1';
                        }
                    }
                    
                    // 如果是视频/音频，尝试播放
                    const video = player.querySelector('video');
                    const audio = player.querySelector('audio');
                    if (video) {
                        video.play().catch(err => console.log('自动播放被阻止:', err));
                    }
                    if (audio) {
                        audio.play().catch(err => console.log('自动播放被阻止:', err));
                    }
                }
            };
            
            // 添加鼠标悬停效果
            preview.style.cursor = 'pointer';
            preview.title = '點擊播放';
        });
        
        // 为播放器添加双击返回预览
        container.querySelectorAll('.media-player').forEach(player => {
            player.ondblclick = (e) => {
                e.stopPropagation();
                const mediaBlock = player.closest('.media-block');
                const preview = mediaBlock.querySelector('.media-preview');
                
                player.style.display = 'none';
                preview.style.display = '';
                
                // 暂停播放
                const video = player.querySelector('video');
                const audio = player.querySelector('audio');
                if (video) video.pause();
                if (audio) audio.pause();
            };
        });
    }

    saveData() {
        try {
            localStorage.setItem('meetingData', JSON.stringify(this.meetingData));
        } catch (e) {
            console.warn('暫存失敗');
        }
    }

    setupEventListeners() {
        // 右边缘 1/3 处：结束并保存按钮
        const exitTrigger = document.getElementById('exit-trigger');
        exitTrigger.onclick = () => {
            const dataStr = JSON.stringify(this.meetingData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'default-meeting.json';
            a.click();
            URL.revokeObjectURL(a.href);
            this.showToast('✅ 模板已導出');
        };
        
        // 全局点击事件：点击页面其他地方时，停止所有媒体播放
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.media-block') && !e.target.closest('#edit-panel')) {
                this.pauseAllMedia();
            }
        });
    }
    
    // ==================== 暂停所有媒体播放 ====================
    pauseAllMedia() {
        document.querySelectorAll('video, audio').forEach(media => {
            media.pause();
        });
    }

    showToast(msg) {
        const el = document.getElementById('toast');
        el.textContent = msg;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 1500);
    }
}

// 启动
window.app = new MeetingApp();

// ==================== 添加到 main.css 的样式 ====================
// 在现有CSS文件中添加以下样式：

/*
.media-block {
    margin: 20px 0;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.media-preview {
    padding: 25px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 120px;
}

.media-preview:hover {
    background: rgba(255, 255, 255, 0.15);
}

.play-button {
    font-size: 48px;
    color: #e74c3c;
    margin-bottom: 10px;
    text-shadow: 0 2px 10px rgba(231, 76, 60, 0.5);
}

.media-label {
    font-size: 16px;
    color: #ecf0f1;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.media-player {
    padding: 15px;
    background: rgba(0, 0, 0, 0.7);
}

.media-player iframe,
.media-player video,
.media-player audio {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    display: block;
    border-radius: 8px;
}

@media (max-width: 768px) {
    .media-preview {
        padding: 15px;
        min-height: 100px;
    }
    
    .play-button {
        font-size: 36px;
    }
    
    .media-player {
        padding: 10px;
    }
}
*/