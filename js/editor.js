// === 全新SunEditor集成版本 ===
export async function showEditPanel(section, targetEl, onSave) {
    const panel = document.getElementById('edit-panel');
    if (!panel) {
        console.error('Edit panel not found!');
        return;
    }

    // Save original styles for revert on cancel
    const originalStyles = {
        color: targetEl.style.color,
        fontSize: targetEl.style.fontSize,
        fontFamily: targetEl.style.fontFamily,
        content: targetEl.innerHTML
    };

    // 重置面板
    panel.style.transform = 'translateX(-50%)';
    panel.style.top = '10%';
    panel.style.display = 'block';
    panel.style.width = '700px';
    panel.style.maxWidth = '90vw';
    panel.style.maxHeight = '80vh';
    panel.style.overflowY = 'auto';

    // 创建包含SunEditor的面板内容
    panel.innerHTML = `
        <h3>編輯內容（專業編輯器）</h3>
        
        <!-- SunEditor容器 -->
        <div id="sun-editor-container"></div>
        
        <!-- 全局样式控制（与SunEditor共存） -->
        <div class="sun-editor-controls">
            <div class="control-group">
                <label>字體：</label>
                <select id="edit-font">
                    <option value="">使用編輯器字體</option>
                    <option value="標楷體" ${section.style?.fontFamily?.includes('標楷體') ? 'selected' : ''}>標楷體</option>
                    <option value="Microsoft JhengHei" ${section.style?.fontFamily?.includes('JhengHei') ? 'selected' : ''}>正黑體</option>
                    <option value="PingFang TC" ${section.style?.fontFamily?.includes('PingFang') ? 'selected' : ''}>蘋方體</option>
                </select>
            </div>
            
            <div class="control-group">
                <label>字號：</label>
                <select id="edit-size">
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
            
            <div class="control-group">
                <label>文字顏色：</label>
                <input type="color" id="edit-color" value="${section.style?.color || '#ffffff'}">
            </div>
        </div>

        <!-- 保存/取消按钮 -->
        <div class="editor-actions">
            <button id="cancel-btn">取消</button>
            <button id="save-btn" style="background: #27ae60; color: white;">確認修改</button>
        </div>
    `;

    // 初始化SunEditor
    const editor = await initSunEditor();
    editor.setContents(section.content || '');
    
    // 获取控制元素
    const colorInput = panel.querySelector('#edit-color');
    const sizeInput = panel.querySelector('#edit-size');
    const fontInput = panel.querySelector('#edit-font');

    // 实时预览功能
    const updatePreview = () => {
        const content = editor.getContents();
        targetEl.innerHTML = content;
        
        // 应用全局样式
        if (fontInput.value) targetEl.style.fontFamily = fontInput.value;
        if (sizeInput.value) targetEl.style.fontSize = sizeInput.value;
        if (colorInput.value) targetEl.style.color = colorInput.value;
    };

    // 监听编辑器变化
    editor.onChange = updatePreview;
    colorInput.oninput = updatePreview;
    sizeInput.onchange = updatePreview;
    fontInput.onchange = updatePreview;

    // 保存按钮
    panel.querySelector('#save-btn').onclick = () => {
        section.content = editor.getContents();
        section.style = section.style || {};
        section.style.fontSize = sizeInput.value || '';
        section.style.color = colorInput.value;
        section.style.fontFamily = fontInput.value || '';
        
        // 清除空的样式属性
        Object.keys(section.style).forEach(key => {
            if (!section.style[key]) delete section.style[key];
        });
        
        onSave();
        panel.style.display = 'none';
        
        // 清理编辑器
        editor.destroy();
        sunEditorInstance = null;
    };

    // 取消按钮
    panel.querySelector('#cancel-btn').onclick = () => {
        targetEl.style.color = originalStyles.color;
        targetEl.style.fontSize = originalStyles.fontSize;
        targetEl.style.fontFamily = originalStyles.fontFamily;
        targetEl.innerHTML = originalStyles.content;
        panel.style.display = 'none';
        
        // 清理编辑器
        editor.destroy();
        sunEditorInstance = null;
    };

    // 保持原有的拖拽功能
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
            panel.style.transform = 'none'; // 取消居中
        }
    }
    
    function dragEnd() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', dragEnd);
    }
}