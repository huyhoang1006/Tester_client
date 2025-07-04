'use strict'
const {ipcRenderer} = require('electron')
export const attachmentPreload = () => {
    return {
        getAttachmentpath : () => ipcRenderer.invoke('getAttachmentpath'),
        insertAttachment : (attachment) => ipcRenderer.invoke('insertAttachment', attachment),
        getAttachmentById : (id_foreign, type) => ipcRenderer.invoke('getAttachmentById', id_foreign, type),
        updateAttachmentById : (id) => ipcRenderer.invoke('updateAttachmentById', id),
        getAttachmentByForeignIdAndType : (id_foreign, type) => ipcRenderer.invoke('getAttachmentByForeignIdAndType', id_foreign, type),
        deleteAttachmentById : (id) => ipcRenderer.invoke('deleteAttachmentById', id),
        openFile : (path) => ipcRenderer.invoke('openFile', path),
        downloadFile : (path) => ipcRenderer.invoke('downloadFile', path),
        readFileData : (file_Path) => ipcRenderer.invoke('readFileData', file_Path),
        downloadFileData : (base64, dirFile) => ipcRenderer.invoke('downloadFileData', base64, dirFile),
    }
}