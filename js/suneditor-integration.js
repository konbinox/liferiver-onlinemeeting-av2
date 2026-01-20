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