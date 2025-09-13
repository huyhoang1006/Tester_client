'use strict'
const { ipcRenderer } = require('electron')
export const powerCableEntityPreload = () => {
    return {
        insertPowerCableEntity: (old_data, data) => ipcRenderer.invoke('insertPowerCableEntity', old_data, data),
    }
}