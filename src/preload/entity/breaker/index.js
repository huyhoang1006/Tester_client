'use strict'
const { ipcRenderer } = require('electron')
export const breakerEntityPreload = () => {
    return {
        insertBreakerEntity: (old_data, data) => ipcRenderer.invoke('insertBreakerEntity', old_data, data),
        getBreakerEntityByMrid: (mrid, prsId) => ipcRenderer.invoke('getBreakerEntityByMrid', mrid, prsId),
        deleteBreakerEntity: (data) => ipcRenderer.invoke('deleteBreakerEntity', data),
        updateMotorCharacteristicsLimits: ({assetId, assessmentLimits}) => ipcRenderer.invoke('updateMotorCharacteristicsLimits', assetId, assessmentLimits),
        updateContactResistanceLimits: ({assetId, assessmentLimits}) => ipcRenderer.invoke('updateContactResistanceLimits', assetId, assessmentLimits),
        updateCoilCharacteristicsLimits: ({assetId, assessmentLimits, sectionKeys}) => ipcRenderer.invoke('updateCoilCharacteristicsLimits', assetId, assessmentLimits, sectionKeys),
        updatePickupVoltageLimits: ({assetId, assessmentLimits}) => ipcRenderer.invoke('updatePickupVoltageLimits', assetId, assessmentLimits),
        updateUnderVoltageReleaseLimits: ({assetId, assessmentLimits}) => ipcRenderer.invoke('updateUnderVoltageReleaseLimits', assetId, assessmentLimits),
        updateOvercurrentReleaseLimits: ({assetId, assessmentLimits}) => ipcRenderer.invoke('updateOvercurrentReleaseLimits', assetId, assessmentLimits),
        updateOperatingTimeLimits: ({assetId, assessmentLimits}) => ipcRenderer.invoke('updateOperatingTimeLimits', assetId, assessmentLimits),
        updateAuxContactsLimits: ({assetId, assessmentLimits}) => ipcRenderer.invoke('updateAuxContactsLimits', assetId, assessmentLimits),
        updateMiscellaneousLimits: ({assetId, assessmentLimits}) => ipcRenderer.invoke('updateMiscellaneousLimits', assetId, assessmentLimits),
        updateTimingAssessmentLimits: ({assetId, assessmentLimits}) => ipcRenderer.invoke('updateTimingAssessmentLimits', assetId, assessmentLimits),
        
        
    }
}