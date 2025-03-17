'use strict'
const {contextBridge, ipcRenderer} = require('electron')
export const conditionPreload = () => {
    return {
        getTestingCondition : (id_foreign) => ipcRenderer.invoke('getTestingCondition', id_foreign),
        insertTestingCondition : (id_foreign, info) => ipcRenderer.invoke('getTestingCondition', id_foreign, info),
        updateTestingCondition : (id_foreign, info) => ipcRenderer.invoke('updateTestingCondition', id_foreign, info),
        deleteTestingCondition : (id_foreign) => ipcRenderer.invoke('deleteTestingCondition', id_foreign),
    }
}