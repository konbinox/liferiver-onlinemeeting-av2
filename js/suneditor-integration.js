// suneditor-integration.js - 完整工作版
let sunEditorInstance = null;

// 预加载所有依赖
async function loadDependencies() {
    // 如果已经加载了，直接返回
    if (window.SUNEDITOR && window.suneditor_min_css_loaded) {
        return true;
    }
    
    console.log('加载SunEditor依赖...');
    
    try {
        // 1. 加载CSS
        if (!document.querySelector('link[href*="suneditor"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/suneditor@latest/dist/css/suneditor.min.css';
            document.head.appendChild(link);
        }
        
        // 2. 加载JS
        if (!window.SUNEDITOR) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/suneditor@latest/dist/suneditor.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        
        console.log('✅ SunEditor 加载成功');
        return true;
        
    } catch (error) {
        console.error('依赖加载失败:', error);
        return false;
    }
}

// 主编辑函数
export async function showEditPanel(section, targetEl, onSave) {
    console.log('📝 打开专业编辑器');
    
    // 加载依赖
    const loaded = await loadDependencies();
    if (!loaded) {
        alert('编辑器加载失败，请检查网络连接');
        return;
    }
    
    const panel = document.getElementById('edit-panel');
    if (!panel) {
        console.error('编辑面板不存在');
        return;
    }
    
    // 保存原始内容
    const originalContent = targetEl.innerHTML;
    const originalColor = targetEl.style.color;
    const originalSize = targetEl.style.fontSize;
    const originalFont = targetEl.style.fontFamily;
    
    // 设置面板
    panel.style.cssText = `
        display: block;
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
        width: 700px;
        max-width: 90vw;
        max-height: 80vh;
        overflow-y: auto;
        background: white;
        color: black;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.5);
        z-index: 1000;
    `;
    
    // 面板HTML
    panel.innerHTML = `
        <h3 style="margin-top: 0; cursor: move; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            編輯內容
        </h3>
        
        <!-- 编辑器容器 -->
        <div id="sun-editor-container" style="margin-bottom: 20px;"></div>
        
        <!-- 样式控制 -->
        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <div style="margin-bottom: 10px;">
                <label style="display: inline-block; width: 80px; font-weight: bold;">字體：</label>
                <select id="edit-font" style="padding: 6px; border: 1px solid #ccc; border-radius: 4px;">
                    <option value="">預設</option>
                    <option value="標楷體" ${section.style?.fontFamily?.includes('標楷體') ? 'selected' : ''}>標楷體</option>
                    <option value="Microsoft JhengHei" ${section.style?.fontFamily?.includes('JhengHei') ? 'selected' : ''}>正黑體</option>
                    <option value="Arial" ${section.style?.fontFamily?.includes('Arial') ? 'selected' : ''}>Arial</option>
                </select>
            </div>
            
            <div style="margin-bottom: 10px;">
                <label style="display: inline-block; width: 80px; font-weight: bold;">字號：</label>
                <select id="edit-size" style="padding: 6px; border: 1px solid #ccc; border-radius: 4px;">
                    <option value="24px" ${section.style?.fontSize === '24px' ? 'selected' : ''}>24px</option>
                    <option value="28px" ${section.style?.fontSize === '28px' ? 'selected' : ''}>28px</option>
                    <option value="32px" ${section.style?.fontSize === '32px' ? 'selected' : ''}>32px</option>
                    <option value="36px" ${section.style?.fontSize === '36px' ? 'selected' : ''}>36px</option>
                    <option value="40px" ${section.style?.fontSize === '40px' ? 'selected' : ''}>40px</option>
                    <option value="48px" ${section.style?.fontSize === '48px' ? 'selected' : ''}>48px</option>
                </select>
            </div>
            
            <div>
                <label style="display: inline-block; width: 80px; font-weight: bold;">顏色：</label>
                <input type="color" id="edit-color" value="${section.style?.color || '#ffffff'}" style="height: 30px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
        </div>
        
        <!-- 按钮 -->
        <div style="text-align: right; margin-top: 20px;">
            <button id="cancel-btn" style="
                padding: 8px 20px;
                margin-right: 10px;
                background: #6c757d;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">取消</button>
            <button id="save-btn" style="
                padding: 8px 20px;
                background: #27ae60;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">保存</button>
        </div>
    `;
    
    try {
        // 初始化编辑器（不使用语言包）
        sunEditorInstance = window.SUNEDITOR.create('sun-editor-container', {
            width: '100%',
            height: '250px',
            buttonList: [
                ['undo', 'redo'],
                ['font', 'fontSize', 'formatBlock'],
                ['bold', 'underline', 'italic', 'strike'],
                ['fontColor', 'hiliteColor'],
                ['align', 'horizontalRule', 'list', 'lineHeight'],
                ['table', 'link', 'image', 'video'],
                ['fullScreen', 'showBlocks', 'codeView']
            ],
            font: [
                '標楷體', 'Microsoft JhengHei', 'PingFang TC',
                'Arial', 'Helvetica', 'sans-serif'
            ],
            defaultStyle: "font-family: 'Microsoft JhengHei', sans-serif; font-size: 16px; line-height: 1.5;",
            // 不使用 lang，避免错误
            imageUploadUrl: '', // 关闭上传功能
            videoFileInput: false,
            videoUrlInput: true
        });
        
        console.log('✅ 编辑器初始化成功');
        
        // 设置内容
        if (section.content) {
            sunEditorInstance.setContents(section.content);
        }
        
        // 获取控件
        const colorInput = document.getElementById('edit-color');
        const sizeInput = document.getElementById('edit-size');
        const fontInput = document.getElementById('edit-font');
        
        // 设置当前值
        if (section.style?.color) colorInput.value = section.style.color;
        if (section.style?.fontSize) sizeInput.value = section.style.fontSize;
        if (section.style?.fontFamily) fontInput.value = section.style.fontFamily;
        
        // 实时预览函数
        const updatePreview = () => {
            try {
                const content = sunEditorInstance.getContents();
                targetEl.innerHTML = content;
                
                // 应用样式
                if (fontInput.value) targetEl.style.fontFamily = fontInput.value;
                if (sizeInput.value) targetEl.style.fontSize = sizeInput.value;
                targetEl.style.color = colorInput.value;
                
            } catch (error) {
                console.warn('预览更新失败:', error);
            }
        };
        
        // 监听变化
        sunEditorInstance.onChange = updatePreview;
        colorInput.oninput = updatePreview;
        sizeInput.onchange = updatePreview;
        fontInput.onchange = updatePreview;
        
        // 初始预览
        updatePreview();
        
        // === 保存按钮 ===
        document.getElementById('save-btn').onclick = () => {
            try {
                section.content = sunEditorInstance.getContents();
                section.style = section.style || {};
                section.style.color = colorInput.value;
                section.style.fontSize = sizeInput.value;
                section.style.fontFamily = fontInput.value;
                
                console.log('保存的内容:', section);
                onSave();
                panel.style.display = 'none';
                
            } catch (error) {
                console.error('保存失败:', error);
                alert('保存失败，请重试');
            }
        };
        
        // === 取消按钮 ===
        document.getElementById('cancel-btn').onclick = () => {
            targetEl.innerHTML = originalContent;
            targetEl.style.color = originalColor;
            targetEl.style.fontSize = originalSize;
            targetEl.style.fontFamily = originalFont;
            panel.style.display = 'none';
        };
        
        // === 拖拽功能 ===
        const header = panel.querySelector('h3');
        let isDragging = false, startX, startY, startLeft, startTop;
        
        header.addEventListener('mousedown', startDrag);
        
        function startDrag(e) {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(panel.style.left) || 0;
            startTop = parseInt(panel.style.top) || 0;
            
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
        }
        
        function drag(e) {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            panel.style.left = (startLeft + dx) + 'px';
            panel.style.top = (startTop + dy) + 'px';
            panel.style.transform = 'none';
        }
        
        function stopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
        }
        
    } catch (error) {
        console.error('编辑器初始化失败:', error);
        panel.innerHTML = `
            <div style="color: red; padding: 20px; text-align: center;">
                <h3>编辑器加载失败</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 10px;">
                    刷新页面
                </button>
            </div>
        `;
    }
}