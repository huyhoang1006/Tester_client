'use strict'
const { ipcRenderer } = require('electron')
export const rotatingMachineEntityPreload = () => {
    return {
        insertRotatingMachineEntity: (old_data, data) => ipcRenderer.invoke('insertRotatingMachineEntity', old_data, data),
    }
}