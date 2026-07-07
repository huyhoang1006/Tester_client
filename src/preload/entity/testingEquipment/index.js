'use strict'
const { ipcRenderer } = require('electron')
export const testingEquipmentEntityPreload = () => {
    return {
        insertTestingEquipmentEntity: (old_data, data) => ipcRenderer.invoke('insertTestingEquipmentEntity', old_data, data),
        getAllTestingEquipmentList: (userId) => ipcRenderer.invoke('getAllTestingEquipmentList', userId),
        getAllAccessories: () => ipcRenderer.invoke('getAllAccessories'),
        getTestingEquipmentEntityByMrid: (mrid) => ipcRenderer.invoke('getTestingEquipmentEntityByMrid', mrid),
        deleteTestingEquipmentEntity: (mrid) => ipcRenderer.invoke('deleteTestingEquipmentEntity', mrid),
    }
}
