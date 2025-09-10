'use strict'
const {ipcRenderer} = require('electron')
export const valueToAliasPreload = () => {
    return {
        getValueToAliasBySetId : (setId) => ipcRenderer.invoke('getValueToAliasBySetId', setId),
        getValueToAliasByMrid : (mrid) => ipcRenderer.invoke('getValueToAliasByMrid', mrid),
    }
}