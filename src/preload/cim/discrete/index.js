'use strict'
const {ipcRenderer} = require('electron')
export const discretePreload = () => {
    return {
        getDiscreteByMrid : (mrid) => ipcRenderer.invoke('getDiscreteByMrid', mrid),
        getAllDiscreteByProcedure : (procedureId) => ipcRenderer.invoke('getAllDiscreteByProcedure', procedureId),
        insertDiscrete : (data) => ipcRenderer.invoke('insertDiscrete', data),
        deleteDiscreteByMrid : (mrid) => ipcRenderer.invoke('deleteDiscreteByMrid', mrid),
    }
}