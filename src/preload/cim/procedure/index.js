'use strict'
const {ipcRenderer} = require('electron')
export const procedurePreload = () => {
    return {
        getProcedureByGenericAssetModel : (generic_asset_model, kind = 'test') => ipcRenderer.invoke('getProcedureByGenericAssetModel', generic_asset_model, kind),
        getMaintenanceActivityLibrary: () => ipcRenderer.invoke('getMaintenanceActivityLibrary'),
    }
}
