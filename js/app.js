import { showEditPanel } from './editor.js';

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
                // 格式化为 "01", "02" ...
                const numStr = pageNum.toString().padStart(2, '0');

                const item = document.createElement('div');
                item.className = 'nav-item';
                if (key === this.currentPageKey) item.classList.add('active');

                // 仅显示文字标题，自动换行
                // Fallback: if navLabel is missing, use title (first 2 chars) or page number
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
        this.setupNavigation(); // 重新高亮
        this.showToast(`第 ${pageKey.replace('page', '')} 頁`);
    }

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
                // Use innerHTML directly as the new editor saves HTML (with <br>, <div> etc)
                el.innerHTML = section.content || '';

                // Universal Edit: All sections are editable
                // 只要是内容块，都允许点击编辑
                el.style.cursor = 'pointer';
                el.title = '點擊編輯內容';
                el.onclick = (e) => {
                    e.stopPropagation();
                    // Pass the section object AND the DOM element for live preview
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
            });
        }
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