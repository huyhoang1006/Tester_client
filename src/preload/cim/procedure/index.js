'use strict'
const {ipcRenderer} = require('electron')
export const procedurePreload = () => {
    return {
        getProcedureByGenericAssetModel : (generic_asset_model) => ipcRenderer.invoke('getProcedureByGenericAssetModel', generic_asset_model),
    }
}