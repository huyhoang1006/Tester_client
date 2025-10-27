'use strict'
const {ipcRenderer} = require('electron')
export const testTypeRotatingMachinePreload = () => {
    return {
        insertTestTypeRotatingMachine : (data) => ipcRenderer.invoke('insertTestTypeRotatingMachine', data),
        getTestTypeRotatingMachineByMrid : (mrid) => ipcRenderer.invoke('getTestTypeRotatingMachineByMrid', mrid),
        deleteTestTypeRotatingMachineByMrid : (mrid) => ipcRenderer.invoke('deleteTestTypeRotatingMachineByMrid', mrid),
        getAllTestTypeRotatingMachine : () => ipcRenderer.invoke('getAllTestTypeRotatingMachine'),
        updateTestTypeRotatingMachineByMrid : (mrid, data) => ipcRenderer.invoke('updateTestTypeRotatingMachineByMrid', mrid, data),
    }
}