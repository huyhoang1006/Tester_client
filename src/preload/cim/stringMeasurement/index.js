'use strict'
const {ipcRenderer} = require('electron')
export const stringMeasurementPreload = () => {
    return {
        getStringMeasurementByMrid : (mrid) => ipcRenderer.invoke('getStringMeasurementByMrid', mrid),
        getAllStringMeasurementByProcedure : (procedureId) => ipcRenderer.invoke('getAllStringMeasurementByProcedure', procedureId),
        insertStringMeasurement : (data) => ipcRenderer.invoke('insertStringMeasurement', data),
        deleteStringMeasurementByMrid : (mrid) => ipcRenderer.invoke('deleteStringMeasurementByMrid', mrid),
    }
}