export function showEditPanel(section, targetEl, onSave) {
    const panel = document.getElementById('edit-panel');
    // Save original styles for revert on cancel
    const originalStyles = {
        color: targetEl.style.color,
        fontSize: targetEl.style.fontSize,
        fontFamily: targetEl.style.fontFamily,
        content: targetEl.innerHTML // For text preview if needed, but simple text updates are complex to preview live without breaking HTML
    };

    panel.innerHTML = '';
    // Reset position to center (fix "disappearing" if dragged off-screen previously)
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
         
         <!-- 文字颜色 (新) -->
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

        // Logic Controls
        const contentArea = document.getElementById('edit-content-area');
        const colorInput = document.getElementById('edit-color');
        const sizeInput = document.getElementById('edit-size');
        const fontInput = document.getElementById('edit-font');

        // Toolbar Text Color Input Handler
        const toolbarColorInput = document.getElementById('toolbar-color-input');
        toolbarColorInput.oninput = (e) => {
            document.execCommand('foreColor', false, e.target.value);
            targetEl.innerHTML = contentArea.innerHTML; // Update preview
        };
        // Reset toolbar color input so change event fires even for same color if needed
        toolbarColorInput.onclick = (e) => { e.target.value = null; };

        // Toolbar Handlers
        panel.querySelectorAll('.editor-btn').forEach(btn => {
            if (btn.id === 'toolbar-color-btn') return; // Skip color btn wrapper
            btn.onclick = (e) => {
                e.preventDefault();
                const cmd = btn.dataset.cmd;
                document.execCommand(cmd, false, null);
                contentArea.focus();
                targetEl.innerHTML = contentArea.innerHTML;
            };
        });

        // Live Preview Handlers
        colorInput.oninput = (e) => { targetEl.style.color = e.target.value; };
        sizeInput.onchange = (e) => { targetEl.style.fontSize = e.target.value; };
        fontInput.onchange = (e) => { targetEl.style.fontFamily = e.target.value; };

        // HTML Preview
        contentArea.oninput = (e) => {
            targetEl.innerHTML = contentArea.innerHTML;
        };

        // Save
        document.getElementById('save-btn').onclick = () => {
            section.content = contentArea.innerHTML; // Save HTML
            section.style = section.style || {};
            section.style.fontSize = sizeInput.value;
            section.style.color = colorInput.value;
            section.style.fontFamily = fontInput.value;

            onSave();
            panel.style.display = 'none';
        };

        // Cancel
        document.getElementById('cancel-btn').onclick = () => {
            // Revert DOM styles
            targetEl.style.color = originalStyles.color;
            targetEl.style.fontSize = originalStyles.fontSize;
            targetEl.style.fontFamily = originalStyles.fontFamily;
            targetEl.innerHTML = originalStyles.content; // Revert content

            panel.style.display = 'none';
        };

        // Make Draggable
        const header = panel.querySelector('h3');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        header.onmousedown = dragStart;

        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === header) {
                isDragging = true;
                document.addEventListener('mousemove', drag);
                document.addEventListener('mouseup', dragEnd);
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                setTranslate(currentX, currentY, panel);
            }
        }

        function setTranslate(xPos, yPos, el) {
            // Combining with the CSS generic center transform
            el.style.transform = `translate(calc(-50% + ${xPos}px), ${yPos}px)`;
        }

        function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;

            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', dragEnd);
        }
    }
}