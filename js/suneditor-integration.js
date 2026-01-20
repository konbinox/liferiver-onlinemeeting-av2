// suneditor-integration.js
let sunEditorInstance = null;

export function initSunEditor() {
    if (sunEditorInstance) return sunEditorInstance;
    
    sunEditorInstance = SUNEDITOR.create('sun-editor-container', {
        width: '100%',
        height: '300px',
        buttonList: [
            ['undo', 'redo'],
            ['font', 'fontSize', 'formatBlock'],
            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
            ['removeFormat'],
            ['fontColor', 'hiliteColor'],
            ['align', 'horizontalRule', 'list', 'lineHeight'],
            ['table', 'link', 'image', 'video'],
            ['fullScreen', 'showBlocks', 'codeView'],
            ['save']
        ],
        font: [
            '標楷體', 'Microsoft JhengHei', 'PingFang TC',
            'Arial', 'Helvetica', 'sans-serif'
        ],
        defaultStyle: "font-family: 'Microsoft JhengHei', sans-serif; font-size: 16px; line-height: 1.5;",
        lang: SUNEDITOR_LANG['zh_tw'],
        imageUploadUrl: '/api/upload',
        videoFileInput: false,
        videoUrlInput: true,
        charCounter: true,
        charCounterType: 'byte',
        callBackSave: function(contents) {
            console.log('自动保存:', contents);
        }
    });
    
    return sunEditorInstance;
}

export function getSunEditor() {
    return sunEditorInstance;
}

export function setSunEditorContent(html) {
    if (sunEditorInstance) {
        sunEditorInstance.setContents(html);
    }
}

export function getSunEditorContent() {
    return sunEditorInstance ? sunEditorInstance.getContents() : '';
}
// ============ 在您现有代码末尾添加以下内容 ============

// 主编辑面板函数
export async function showEditPanel(section, targetEl, onSave) {
    console.log('🚀 SunEditor showEditPanel 被调用');
    
    const panel = document.getElementById('edit-panel');
    if (!panel) {
        console.error('Edit panel not found!');
        return;
    }

    // 保存原始样式
    const originalStyles = {
        color: targetEl.style.color,
        fontSize: targetEl.style.fontSize,
        fontFamily: targetEl.style.fontFamily,
        content: targetEl.innerHTML
    };

    // 设置面板
    panel.style.transform = 'translateX(-50%)';
    panel.style.top = '10%';
    panel.style.display = 'block';
    panel.style.width = '700px';
    panel.style.maxWidth = '90vw';
    panel.style.maxHeight = '80vh';
    panel.style.overflowY = 'auto';

    // 创建面板HTML
    panel.innerHTML = `
        <h3>編輯內容（專業編輯器）</h3>
        
        <!-- SunEditor容器 -->
        <div id="sun-editor-container"></div>
        
        <!-- 全局样式控制 -->
        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; border: 1px solid #e9ecef;">
            <div style="margin-bottom: 10px; display: flex; align-items: center;">
                <label style="width: 80px; font-size: 14px; color: #495057; font-weight: bold;">字體：</label>
                <select id="edit-font" style="flex: 1; padding: 6px; border: 1px solid #ced4da; border-radius: 4px;">
                    <option value="">使用編輯器字體</option>
                    <option value="標楷體" ${section.style?.fontFamily?.includes('標楷體') ? 'selected' : ''}>標楷體</option>
                    <option value="Microsoft JhengHei" ${section.style?.fontFamily?.includes('JhengHei') ? 'selected' : ''}>正黑體</option>
                    <option value="PingFang TC" ${section.style?.fontFamily?.includes('PingFang') ? 'selected' : ''}>蘋方體</option>
                </select>
            </div>
            
            <div style="margin-bottom: 10px; display: flex; align-items: center;">
                <label style="width: 80px; font-size: 14px; color: #495057; font-weight: bold;">字號：</label>
                <select id="edit-size" style="flex: 1; padding: 6px; border: 1px solid #ced4da; border-radius: 4px;">
                    <option value="">使用編輯器字號</option>
                    <option value="24px" ${section.style?.fontSize === '24px' ? 'selected' : ''}>24px</option>
                    <option value="28px" ${section.style?.fontSize === '28px' ? 'selected' : ''}>28px</option>
                    <option value="32px" ${section.style?.fontSize === '32px' ? 'selected' : ''}>32px</option>
                    <option value="36px" ${section.style?.fontSize === '36px' ? 'selected' : ''}>36px</option>
                    <option value="40px" ${section.style?.fontSize === '40px' ? 'selected' : ''}>40px</option>
                    <option value="48px" ${section.style?.fontSize === '48px' ? 'selected' : ''}>48px</option>
                    <option value="60px" ${section.style?.fontSize === '60px' ? 'selected' : ''}>60px</option>
                    <option value="80px" ${section.style?.fontSize === '80px' ? 'selected' : ''}>80px</option>
                </select>
            </div>
            
            <div style="display: flex; align-items: center;">
                <label style="width: 80px; font-size: 14px; color: #495057; font-weight: bold;">文字顏色：</label>
                <input type="color" id="edit-color" value="${section.style?.color || '#ffffff'}" style="flex: 1; height: 34px; padding: 0; border: 1px solid #ced4da; border-radius: 4px; cursor: pointer;">
            </div>
        </div>

        <!-- 按钮区域 -->
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6;">
            <button id="cancel-btn" style="padding: 8px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">取消</button>
            <button id="save-btn" style="padding: 8px 20px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">確認修改</button>
        </div>
    `;

    // 初始化编辑器
    const editor = await initSunEditor();
    if (!editor) {
        alert('编辑器加载失败，请检查网络连接');
        return;
    }
    
    // 设置内容
    editor.setContents(section.content || '');
    console.log('✅ SunEditor 初始化完成');

    // 获取控制元素
    const colorInput = document.getElementById('edit-color');
    const sizeInput = document.getElementById('edit-size');
    const fontInput = document.getElementById('edit-font');

    // 更新预览函数
    const updatePreview = () => {
        const content = editor.getContents();
        targetEl.innerHTML = content;
        
        // 应用全局样式
        if (fontInput.value) targetEl.style.fontFamily = fontInput.value;
        if (sizeInput.value) targetEl.style.fontSize = sizeInput.value;
        if (colorInput.value) targetEl.style.color = colorInput.value;
    };

    // 监听变化
    editor.onChange = updatePreview;
    colorInput.oninput = updatePreview;
    sizeInput.onchange = updatePreview;
    fontInput.onchange = updatePreview;

    // 初始预览
    updatePreview();

    // === 保存按钮事件 ===
    document.getElementById('save-btn').onclick = () => {
        console.log('💾 保存内容...');
        section.content = editor.getContents();
        section.style = section.style || {};
        section.style.fontSize = sizeInput.value || '';
        section.style.color = colorInput.value;
        section.style.fontFamily = fontInput.value || '';
        
        // 清理空的样式属性
        Object.keys(section.style).forEach(key => {
            if (!section.style[key]) delete section.style[key];
        });
        
        console.log('保存的数据:', section);
        onSave();
        panel.style.display = 'none';
        
        // 可选：清理编辑器实例
        // editor.destroy();
        // sunEditorInstance = null;
    };

    // === 取消按钮事件 ===
    document.getElementById('cancel-btn').onclick = () => {
        console.log('❌ 取消编辑');
        targetEl.style.color = originalStyles.color;
        targetEl.style.fontSize = originalStyles.fontSize;
        targetEl.style.fontFamily = originalStyles.fontFamily;
        targetEl.innerHTML = originalStyles.content;
        panel.style.display = 'none';
    };

    // === 保持原有的拖拽功能 ===
    const header = panel.querySelector('h3');
    let isDragging = false, xOffset = 0, yOffset = 0;
    
    header.onmousedown = (e) => {
        isDragging = true;
        xOffset = e.clientX - parseFloat(panel.style.left || 0);
        yOffset = e.clientY - parseFloat(panel.style.top || 0);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
    };
    
    function drag(e) {
        if (isDragging) {
            panel.style.left = (e.clientX - xOffset) + 'px';
            panel.style.top = (e.clientY - yOffset) + 'px';
            panel.style.transform = 'none';
        }
    }
    
    function dragEnd() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', dragEnd);
    }
}

// ============ 文件结束 ============