'use strict'
const { ipcRenderer } = require('electron')

export const powerPlantPreload = () => ({
    insertPowerPlantEntity: (data) => ipcRenderer.invoke('insertPowerPlantEntity', data),
    getPowerPlantEntityByMrid: (mrid, userId, organisationId) => (
        ipcRenderer.invoke('getPowerPlantEntityByMrid', mrid, userId, organisationId)
    ),
    getPowerPlantsInOrganisationForUser: (organisationId, userId) => (
        ipcRenderer.invoke('getPowerPlantsInOrganisationForUser', organisationId, userId)
    )
})
