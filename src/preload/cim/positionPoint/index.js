'use strict'
const {ipcRenderer} = require('electron')
export const positionPointPreload = () => {
    return {
        getPositionPointMrid : (mrid) => ipcRenderer.invoke('getPositionPointMrid', mrid),
        getPositionPointByLocationId : (locationId) => ipcRenderer.invoke('getPositionPointByLocationId', locationId),
    }
}