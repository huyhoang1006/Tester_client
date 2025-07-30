'use strict'
const {ipcRenderer} = require('electron')
export const voltageLevelPreload = () => {
    return {
        getVoltageLevelByMrid : (mrid) => ipcRenderer.invoke('getVoltageLevelByMrid', mrid),
        getVoltageLevelBySubstationId : (substationId) => ipcRenderer.invoke('getVoltageLevelBySubstationId', substationId),
        insertVoltageLevel : (data) => ipcRenderer.invoke('insertVoltageLevel', data),
        updateVoltageLevelByMrid : (mrid, data) => ipcRenderer.invoke('updateVoltageLevelByMrid', mrid, data),
        deleteVoltageLevelByMrid : (mrid) => ipcRenderer.invoke('deleteVoltageLevelByMrid', mrid),
    }
}