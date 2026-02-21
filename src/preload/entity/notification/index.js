const { ipcRenderer } = require('electron')

export const notificationEntityPreload = () => {
    return {
        getAllNotifications: async () => {
            return await ipcRenderer.invoke('getAllNotifications')
        },
        getNotificationById: async (id) => {
            return await ipcRenderer.invoke('getNotificationById', id)
        },
        insertNotification: async (data) => {
            return await ipcRenderer.invoke('insertNotification', data)
        },
        updateNotification: async (id, data) => {
            return await ipcRenderer.invoke('updateNotification', id, data)
        },
        markNotificationAsRead: async (id) => {
            return await ipcRenderer.invoke('markNotificationAsRead', id)
        },
        hideNotification: async (id) => {
            return await ipcRenderer.invoke('hideNotification', id)
        },
        deleteNotification: async (id) => {
            return await ipcRenderer.invoke('deleteNotification', id)
        }
    }
}
