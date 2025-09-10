'use strict'
const {ipcRenderer} = require('electron')
export const valueAliasSetPreload = () => {
    return {
        getValueAliasSetByMrids : (mrids) => ipcRenderer.invoke('getValueAliasSetByMrids', mrids),
        getValueAliasSetByMrid : (mrid) => ipcRenderer.invoke('getValueAliasSetByMrid', mrid),
        getValueAliasSetAndValueToAliasByMrid : (mrid) => ipcRenderer.invoke('getValueAliasSetAndValueToAliasByMrid', mrid),
    }
}