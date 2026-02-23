const { ipcRenderer } = require('electron')

export const notificationEntityPreload = () => {
    return {
        getAllNotifications: async () => {
            return await ipcRenderer.invoke('getAllNotifications')
        },
        getNotificationById: async (mrid) => {
            return await ipcRenderer.invoke('getNotificationById', mrid)
        },
        insertNotification: async (data) => {
            return await ipcRenderer.invoke('insertNotification', data)
        },
        updateNotification: async (mrid, data) => {
            return await ipcRenderer.invoke('updateNotification', mrid, data)
        },
        markNotificationAsRead: async (mrid) => {
            return await ipcRenderer.invoke('markNotificationAsRead', mrid)
        },
        hmrideNotification: async (mrid) => {
            return await ipcRenderer.invoke('hmrideNotification', mrid)
        },
        deleteNotification: async (mrid) => {
            return await ipcRenderer.invoke('deleteNotification', mrid)
        }
    }
}
