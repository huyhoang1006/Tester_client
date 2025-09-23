'use strict'
const { ipcRenderer } = require('electron')
export const rotatingMachineEntityPreload = () => {
    return {
        insertRotatingMachineEntity: (data) => ipcRenderer.invoke('insertRotatingMachineEntity', data),
    }
}