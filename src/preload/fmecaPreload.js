'use strict'
const {contextBridge, ipcRenderer} = require('electron')
export const fmecaPreload = () => {
        return {
                // Fmeca
                updateFmeca: (fmeca) => ipcRenderer.invoke('updateFmeca', fmeca),
                updateFmecaByName: (fmeca, name) => ipcRenderer.invoke('updateFmecaByName', fmeca, name),
                getFmeca: (id) => ipcRenderer.invoke('getFmeca', id),
                checkFmecaExist: () => ipcRenderer.invoke('checkFmecaExist'),
                insertFmeca: (fmeca) => ipcRenderer.invoke('insertFmeca', fmeca),
                deleteFmeca: (id) => ipcRenderer.invoke('deleteFmeca', id),
                deleteFmecaByName: (name) => ipcRenderer.invoke('deleteFmecaByName', name),
                getFmecaByName: (name) => ipcRenderer.invoke('getFmecaByName', name),
                getFmecaName: () => ipcRenderer.invoke('getFmecaName'),
        }
}