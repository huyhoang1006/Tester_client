'use strict'
const { ipcRenderer } = require('electron')
export const testingEquipmentEntityPreload = () => {
    return {
        insertTestingEquipmentEntity: (old_data, data) => ipcRenderer.invoke('insertTestingEquipmentEntity', old_data, data),
        getAllTestingEquipmentList: (userId, organisationId) => ipcRenderer.invoke('getAllTestingEquipmentList', userId, organisationId),
        getAllAccessories: () => ipcRenderer.invoke('getAllAccessories'),
        getTestingEquipmentEntityByMrid: (mrid) => ipcRenderer.invoke('getTestingEquipmentEntityByMrid', mrid),
        getTestingEquipmentUsage: (mrid) => ipcRenderer.invoke('getTestingEquipmentUsage', mrid),
        deleteTestingEquipmentEntity: (mrid) => ipcRenderer.invoke('deleteTestingEquipmentEntity', mrid),
    }
}
