'use strict'
const {contextBridge, ipcRenderer} = require('electron')
export const transformerPreload = () => {
    return {
        // Location
        getLocations: (userId) => ipcRenderer.invoke('getLocations', userId),
        getLocationsData : (userId, valueData) => ipcRenderer.invoke('getLocationsData', userId, valueData),
        getLocationByRefId : (userId, valueData, refId) => ipcRenderer.invoke('getLocationsData', userId, valueData, refId),
        getLocationById: (id) => ipcRenderer.invoke('getLocationById', id),
        deleteLocation: (ids) => ipcRenderer.invoke('deleteLocation', ids),
        insertLocation: (userId, location) => ipcRenderer.invoke('insertLocation', userId, location),
        updateLocation: (location) => ipcRenderer.invoke('updateLocation', location),
        getLocationByAssetId: (asset_id) => ipcRenderer.invoke('getLocationByAssetId', asset_id),

        exportLocationCSV: (data) => ipcRenderer.invoke('exportCSV', data),
        importLocationCSV: (userId) => ipcRenderer.invoke('importLocationCSV', userId),

        // Asset
        getAssets: (locationId) => ipcRenderer.invoke('getAssets', locationId),
        getAssetById: (id) => ipcRenderer.invoke('getAssetById', id),
        getTapChangerByAssetId: (id) => ipcRenderer.invoke('getTapChangerByAssetId', id),
        getBushingsByAssetId: (id) => ipcRenderer.invoke('getBushingsByAssetId', id),
        getLocationAssetById: (id) => ipcRenderer.invoke('getLocationAssetById', id),
        deleteAsset: (ids) => ipcRenderer.invoke('deleteAsset', ids),
        insertAsset: (locationId, asset, tapChanger, bushings) => ipcRenderer.invoke('insertAsset', locationId, asset, tapChanger, bushings),
        updateAsset: (asset, tapChanger, bushings) => ipcRenderer.invoke('updateAsset', asset, tapChanger, bushings),
        relocateAsset : (asset) => ipcRenderer.invoke('relocateAsset', asset),

        getAllInforAsset: () => ipcRenderer.invoke('getAllInforAsset'),

        exportAssetXLS: (data) => ipcRenderer.invoke('exportXLS', data),
        importAssetXLS: (locationId) => ipcRenderer.invoke('importAssetXLS', locationId),

        exportAssetCSV: (data) => ipcRenderer.invoke('exportCSV', data),
        importAssetCSV: (locationId) => ipcRenderer.invoke('importAssetCSV', locationId),

        // Job
        getJobs: (assetId) => ipcRenderer.invoke('getJobs', assetId),
        getJobById: (id) => ipcRenderer.invoke('getJobById', id),
        deleteJob: (ids) => ipcRenderer.invoke('deleteJob', ids),
        saveJobTransformer : (job) => ipcRenderer.invoke('saveJobTransformer', job),
        saveTestTransformer : (testList, job_id) => ipcRenderer.invoke('saveTestTransformer', testList, job_id),
        insertJob: (assetId, properties, testList, testConditionArr, attachmentArr) => ipcRenderer.invoke('insertJob', assetId, properties, testList, testConditionArr, attachmentArr),
        updateJob: (properties, testList, testConditionArr, attachmentArr) => ipcRenderer.invoke('updateJob', properties, testList, testConditionArr, attachmentArr),
        deleteTest: (id) => ipcRenderer.invoke('deleteTest', id),
        getTestbyAssetId: (assetId, typeId) => ipcRenderer.invoke('getTestbyAssetId', assetId, typeId),
        getTestByJobId: (id) => ipcRenderer.invoke('getTestByJobId', id),
        getAllTestByJobId: (job_id) => ipcRenderer.invoke('getAllTestByJobId', job_id),

        exportJobCSV: (data) => ipcRenderer.invoke('exportCSV', data),
        importJobCSV: (assetId, assetType) => ipcRenderer.invoke('importJobCSV', assetId, assetType),

        //import excel havec
        importHavec3pha1cap: (locationId) => ipcRenderer.invoke('importHavec3pha1cap', locationId),
        importHavec3pha2cap: (locationId) => ipcRenderer.invoke('importHavec3pha2cap', locationId),
        importHavec1pha1cap: (locationId) => ipcRenderer.invoke('importHavec1pha1cap', locationId),

        //Test
        getTestTypes: () => ipcRenderer.invoke('getTestTypes'),

        // OnlineMonitoringData
        getOnlineMonitoringData: (assetId) => ipcRenderer.invoke('getOnlineMonitoringData', assetId),
        updateOnlineMonitoringData: (online_monitoring) => ipcRenderer.invoke('updateOnlineMonitoringData', online_monitoring),
        insertOnlineMonitoringData: (assetId, online_monitoring) => ipcRenderer.invoke('insertOnlineMonitoringData', assetId, online_monitoring),
        deleteMonitorsByAssetId : (assetId) => ipcRenderer.invoke('deleteMonitorsByAssetId', assetId),

        //
        export: (data) => ipcRenderer.invoke('exportCSV', data),

        // App
        closeApp: () => ipcRenderer.send('closeApp'),
        minimizeApp: () => ipcRenderer.send('minimizeApp'),
        maximizeApp: () => ipcRenderer.send('maximizeApp'),

        // Import(csv, excel)
        uploadCustom: (name) => ipcRenderer.invoke('uploadCustom', name),
        exportCustom: () => ipcRenderer.invoke('exportCustom'),
        getColumnByName : (name) => ipcRenderer.invoke('getColumnByName', name),

        saveTemplate : (data) => ipcRenderer.invoke('saveTemplate', data),
        getNameTemplate : () => ipcRenderer.invoke('getNameTemplate'),
        getTemplateByName : (name) => ipcRenderer.invoke('getTemplateByName', name),
        deleteTempByName : (name) => ipcRenderer.invoke('deleteTempByName', name),
        updateTempByName : (data) => ipcRenderer.invoke('updateTempByName', data),
        updateTempExcel : () => ipcRenderer.invoke('updateTempExcel'),
        uploadReport : (name) => ipcRenderer.invoke('uploadReport', name),

        //export etrc
        exportEtrc : (asset, testList) => ipcRenderer.invoke('exportEtrc', asset, testList)
    }
}
