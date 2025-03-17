'use strict'
const {ipcRenderer} = require('electron')

export const userPreload = () => {
    return {    
        // User
        login: (user) => ipcRenderer.invoke('login', user),
        signup: (user) => ipcRenderer.invoke('signup', user),
        changePass: (user) => ipcRenderer.invoke('changePass', user),
        getAllUser: () => ipcRenderer.invoke('getAllUser'),
        editUserInfo: (user) => ipcRenderer.invoke('editUserInfo', user),
        addUser: (user) => ipcRenderer.invoke('addUser', user),
        deleteUser: (id) => ipcRenderer.invoke('deleteUser', id),
    }

}