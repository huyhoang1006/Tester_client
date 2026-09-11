'use strict'
const { ipcRenderer } = require('electron')

export const cbMotorCurrentPointPreload = () => ({
    getCbMotorCurrentPointsByDatasetId: datasetId =>
        ipcRenderer.invoke('getCbMotorCurrentPointsByDatasetId', datasetId),
    getCbMotorCurrentPointsByDatasetIds: datasetIds =>
        ipcRenderer.invoke('getCbMotorCurrentPointsByDatasetIds', datasetIds),
})

