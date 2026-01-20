// === 全新全能编辑器 ===
export function showEditPanel(section, targetEl, onSave) {
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

    // Reset panel position and display
    panel.style.transform = 'translateX(-50%)';
    panel.style.top = '20%';
    panel.style.display = 'block';
    panel.className = 'editor-panel'; // 应用新样式

    // Create editor content
    panel.innerHTML = `
      <h3>編輯內容 (富文本)</h3>
      
      <!-- 工具栏 -->
      <div class="editor-toolbar">
         <button class="editor-btn" data-cmd="bold" title="加粗"><b>B</b></button>
         <button class="editor-btn" data-cmd="italic" title="斜體"><i>I</i></button>
         <button class="editor-btn" data-cmd="underline" title="下劃線"><u>U</u></button>
         
         <!-- 文字颜色 -->
         <span style="position:relative; display:inline-block;">
            <button class="editor-btn" id="toolbar-color-btn" title="文字顏色"><span style="color:red">A</span></button>
            <input type="color" id="toolbar-color-input" style="position:absolute; left:0; top:0; width:100%; height:100%; opacity:0; cursor:pointer;" title="文字顏色">
         </span>

         <span style="width:1px;background:#ddd;margin:0 4px;"></span>
         <button class="editor-btn" data-cmd="justifyLeft" title="靠左">L</button>
         <button class="editor-btn" data-cmd="justifyCenter" title="居中">C</button>
         <button class="editor-btn" data-cmd="justifyRight" title="靠右">R</button>
         <span style="width:1px;background:#ddd;margin:0 4px;"></span>
         <button class="editor-btn" data-cmd="insertUnorderedList" title="清單">List</button>
         
         <!-- 新增多媒体按钮 -->
         <span style="width:1px;background:#ddd;margin:0 4px;"></span>
         <button class="editor-btn" id="insert-audio-btn" title="插入音訊">🎵</button>
         <button class="editor-btn" id="insert-video-btn" title="插入影片">🎥</button>
      </div>

      <!-- 可编辑区域 -->
      <div class="edit-content-area" contenteditable="true">${section.content || ''}</div>

      <!-- 全局样式控制 -->
      <div class="editor-controls">
          <label>字體：</label>
          <select id="edit-font">
              <option value="">預設</option>
              <option value="標楷體" ${section.style?.fontFamily?.includes('標楷體') ? 'selected' : ''}>標楷體</option>
              <option value="Microsoft JhengHei" ${section.style?.fontFamily?.includes('JhengHei') ? 'selected' : ''}>正黑體</option>
          </select>
      </div>
      <div class="editor-controls">
          <label>字號：</label>
          <select id="edit-size">
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
      <div class="editor-controls">
          <label>顏色：</label>
          <input type="color" id="edit-color" value="${section.style?.color || '#ffffff'}">
      </div>

      <!-- 保存/取消按钮 -->
      <div class="editor-actions">
          <button id="cancel-btn">取消</button>
          <button id="save-btn">確認修改</button>
      </div>
    `;

    // 获取 DOM 元素
    const contentArea = panel.querySelector('.edit-content-area');
    const colorInput = panel.querySelector('#edit-color');
    const sizeInput = panel.querySelector('#edit-size');
    const fontInput = panel.querySelector('#edit-font');

    // Toolbar Text Color
    const toolbarColorInput = panel.querySelector('#toolbar-color-input');
    toolbarColorInput.oninput = (e) => {
        document.execCommand('foreColor', false, e.target.value);
        targetEl.innerHTML = contentArea.innerHTML;
    };
    toolbarColorInput.onclick = (e) => { e.target.value = null; };

    // Bold, Italic, etc.
    panel.querySelectorAll('.editor-btn:not(#toolbar-color-btn):not(#insert-audio-btn):not(#insert-video-btn)').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const cmd = btn.dataset.cmd;
            document.execCommand(cmd, false, null);
            contentArea.focus();
            targetEl.innerHTML = contentArea.innerHTML;
        };
    });

    // === 新增：打开多媒体插入面板 ===
function openMediaInsertPanel(type, contentArea, targetEl) {
    // 创建或获取面板
    let panel = document.getElementById('media-insert-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'media-insert-panel';
        panel.innerHTML = `
            <h4>插入${type === 'audio' ? '音訊' : '影片'}</h4>
            <input type="text" id="media-url" placeholder="輸入網址" />
            <div>
                <button id="confirm-media">確定</button>
                <button id="cancel-media">取消</button>
            </div>
        `;
        document.body.appendChild(panel);
    }

    panel.style.display = 'block';

    // 确认插入
    const confirmBtn = panel.querySelector('#confirm-media');
    const cancelBtn = panel.querySelector('#cancel-media');
    const urlInput = panel.querySelector('#media-url');

    const insertMedia = () => {
        const url = urlInput.value.trim();
        if (url) {
            const mediaType = type === 'audio' ? 'audio' : 'video';
            const mediaBlock = `
                <div class="custom-media-block" data-type="${mediaType}" data-src="${url}">
                    <button class="play-btn">▶ ${type === 'audio' ? '播放音訊' : '觀看影片'}</button>
                    <div class="media-player">
                        ${type === 'audio' 
                            ? `<audio src="${url}" controls></audio>` 
                            : `<a href="${url}" target="_blank" style="display:inline-block;padding:8px 16px;background:#2c3e50;color:white;border-radius:4px;text-decoration:none;">點擊開啟影片</a>`}
                    </div>
                </div>
            `;
            
            contentArea.insertAdjacentHTML('beforeend', mediaBlock);
            targetEl.innerHTML = contentArea.innerHTML;
        }
        panel.style.display = 'none';
    };

    confirmBtn.onclick = insertMedia;
    cancelBtn.onclick = () => panel.style.display = 'none';
    urlInput.onkeypress = (e) => { if (e.key === 'Enter') insertMedia(); };
    urlInput.focus();
}

// === 替换原有按钮事件 ===
panel.querySelector('#insert-audio-btn')?.addEventListener('click', () => {
    openMediaInsertPanel('audio', contentArea, targetEl);
});

panel.querySelector('#insert-video-btn')?.addEventListener('click', () => {
    openMediaInsertPanel('video', contentArea, targetEl);
});

    // Live Preview
    colorInput.oninput = (e) => { targetEl.style.color = e.target.value; };
    sizeInput.onchange = (e) => { targetEl.style.fontSize = e.target.value; };
    fontInput.onchange = (e) => { targetEl.style.fontFamily = e.target.value; };
    contentArea.oninput = (e) => { targetEl.innerHTML = contentArea.innerHTML; };

    // Save
    panel.querySelector('#save-btn').onclick = () => {
        section.content = contentArea.innerHTML;
        section.style = section.style || {};
        section.style.fontSize = sizeInput.value;
        section.style.color = colorInput.value;
        section.style.fontFamily = fontInput.value;
        onSave();
        panel.style.display = 'none';
    };

    // Cancel
    panel.querySelector('#cancel-btn').onclick = () => {
        targetEl.style.color = originalStyles.color;
        targetEl.style.fontSize = originalStyles.fontSize;
        targetEl.style.fontFamily = originalStyles.fontFamily;
        targetEl.innerHTML = originalStyles.content;
        panel.style.display = 'none';
    };

    // Draggable
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
        }
    }
    function dragEnd() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', dragEnd);
    }
}