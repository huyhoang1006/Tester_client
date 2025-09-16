'use strict'
const {ipcRenderer} = require('electron')
export const bushingPreload = () => {
    return {
        getBushingByMrid : (mrid) => ipcRenderer.invoke('getBushingByMrid', mrid),
        getBushingByPsrId : (mrid) => ipcRenderer.invoke('getBushingByPsrId', mrid),
    }
}