export function showEditPanel(section, targetEl, onSave) {
    const panel = document.getElementById('edit-panel');
    // Save original styles for revert on cancel
    const originalStyles = {
        color: targetEl.style.color,
        fontSize: targetEl.style.fontSize,
        fontFamily: targetEl.style.fontFamily,
        content: targetEl.innerHTML
    };

    panel.innerHTML = '';
    panel.style.transform = 'translateX(-50%)';
    panel.style.top = '20%';
    panel.style.display = 'block';

    if (section.type === 'text') {
        panel.innerHTML = `
      <h3>編輯內容 (富文本)</h3>
      
      <!-- 工具栏 -->
      <div id="editor-toolbar">
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
      <div id="edit-content-area" contenteditable="true">${section.content}</div>

      <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">
          <label>全局字體：
            <select id="edit-font">
              <option value="">預設</option>
              <option value="標楷體" ${section.style?.fontFamily?.includes('標楷體') ? 'selected' : ''}>標楷體</option>
              <option value="Microsoft JhengHei" ${section.style?.fontFamily?.includes('JhengHei') ? 'selected' : ''}>正黑體</option>
            </select>
          </label>
      </div>
      <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">
          <label>全局字號：
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
          </label>
      </div>
      <div style="display:flex; gap:10px; align-items:center; margin-bottom:20px;">
          <label>全局顏色：<input type="color" id="edit-color" value="${section.style?.color || '#ffffff'}"></label>
          <span style="font-size:12px; color:#666;">(整段变色)</span>
      </div>
      <div style="text-align:right;">
          <button id="cancel-btn">取消</button>
          <button id="save-btn">確認修改</button>
      </div>
    `;

        // === 现有逻辑：工具栏、预览、保存、取消、拖拽 ===
        const contentArea = document.getElementById('edit-content-area');
        const colorInput = document.getElementById('edit-color');
        const sizeInput = document.getElementById('edit-size');
        const fontInput = document.getElementById('edit-font');

        // Toolbar Text Color
        const toolbarColorInput = document.getElementById('toolbar-color-input');
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

        // === 新增：插入音訊 ===
        document.getElementById('insert-audio-btn')?.addEventListener('click', () => {
            const url = prompt('請輸入 MP3 音訊網址\n（例如：assets/music/歡迎歌.mp3）');
            if (url && url.trim()) {
                const cleanUrl = url.trim();
                const audioHtml = `<div class="media-section"><audio controls src="${cleanUrl}" type="audio/mpeg"></audio></div>`;
                document.execCommand('insertHTML', false, audioHtml);
                targetEl.innerHTML = contentArea.innerHTML;
            }
        });

        // === 新增：插入影片 ===
        document.getElementById('insert-video-btn')?.addEventListener('click', () => {
            const url = prompt('請輸入 YouTube 或影片網址');
            if (url && url.trim()) {
                const cleanUrl = url.trim();
                const videoHtml = `<div class="media-section"><a href="${cleanUrl}" target="_blank" style="display:inline-block;padding:8px 16px;background:#2c3e50;color:white;border-radius:4px;text-decoration:none;">▶ 點擊觀看影片</a></div>`;
                document.execCommand('insertHTML', false, videoHtml);
                targetEl.innerHTML = contentArea.innerHTML;
            }
        });

        // Live Preview
        colorInput.oninput = (e) => { targetEl.style.color = e.target.value; };
        sizeInput.onchange = (e) => { targetEl.style.fontSize = e.target.value; };
        fontInput.onchange = (e) => { targetEl.style.fontFamily = e.target.value; };
        contentArea.oninput = (e) => { targetEl.innerHTML = contentArea.innerHTML; };

        // Save
        document.getElementById('save-btn').onclick = () => {
            section.content = contentArea.innerHTML;
            section.style = section.style || {};
            section.style.fontSize = sizeInput.value;
            section.style.color = colorInput.value;
            section.style.fontFamily = fontInput.value;
            onSave();
            panel.style.display = 'none';
        };

        // Cancel
        document.getElementById('cancel-btn').onclick = () => {
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
}