'use strict'

const {contextBridge, ipcRenderer} = require('electron')
export const attachmentPreload = () => {
    return {
        getAttachmentpath : () => ipcRenderer.invoke('getAttachmentpath'),
        uploadAttachment : (id_foreign, type, info) => ipcRenderer.invoke('uploadAttachment', id_foreign, type, info),
        getAllAttachment : (id_foreign, type) => ipcRenderer.invoke('getAllAttachment', id_foreign, type),
        updateAttachment : (id, info, type) => ipcRenderer.invoke('updateAttachment', id, info, type),
        deleteAttachmentpath : (name) => ipcRenderer.invoke('deleteAttachmentpath', name),
        openFile : (path) => ipcRenderer.invoke('openFile', path),
        downloadFile : (path) => ipcRenderer.invoke('downloadFile', path),
        readFileData : (file_Path) => ipcRenderer.invoke('readFileData', file_Path),
        downloadFileData : (base64, dirFile) => ipcRenderer.invoke('downloadFileData', base64, dirFile),
        deleteAttachment : (id_foreign) => ipcRenderer.invoke('deleteAttachment', id_foreign)
    }
}