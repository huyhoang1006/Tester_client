'use strict'
const { ipcRenderer } = require('electron')
export const rotatingMachineEntityPreload = () => {
    return {
        insertRotatingMachineEntity: (data) => ipcRenderer.invoke('insertRotatingMachineEntity', data),
        getRotatingMachineEntityByMrid: (mrid, psrId) => ipcRenderer.invoke('getRotatingMachineEntityByMrid', mrid, psrId),
        deleteRotatingMachineEntity: (data) => ipcRenderer.invoke('deleteRotatingMachineEntity', data),
    }
}