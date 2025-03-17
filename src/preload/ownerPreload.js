'use strict'
const {contextBridge, ipcRenderer} = require('electron')
export const ownerPreload = () => {
    return {
        getOwnerByName : (name) => ipcRenderer.invoke('getOwnerByName', name),
        getOwnerByPhone : (phone) => ipcRenderer.invoke('getOwnerByPhone', phone),
        getOwnerById : (id) => ipcRenderer.invoke('getOwnerById', id),
        getOwnerByUserId : (user_id) => ipcRenderer.invoke('getOwnerByUserId', user_id),
        getOwnerByRefId : (ref_id) => ipcRenderer.invoke('getOwnerByRefId', ref_id),
        insertOwner : (data) => ipcRenderer.invoke('insertOwner',data),
        updateOwnerById : (id, data) => ipcRenderer.invoke('updateOwnerById', id, data),
        deleteOwnerById : (id) => ipcRenderer.invoke('deleteOwnerById', id),
        deleteOwner : (ids) => ipcRenderer.invoke('deleteOwner', ids)

    }
}