'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const getAllNotifications = () => {
    ipcMain.handle('getAllNotifications', async function (event) {
        try {
            const rs = await entityFunc.notificationEntityFunc.getAllNotifications()
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            } else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const getNotificationById = () => {
    ipcMain.handle('getNotificationById', async function (event, id) {
        try {
            const rs = await entityFunc.notificationEntityFunc.getNotificationById(id)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            } else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const insertNotification = () => {
    ipcMain.handle('insertNotification', async function (event, data) {
        try {
            const rs = await entityFunc.notificationEntityFunc.insertNotification(data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            } else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const updateNotification = () => {
    ipcMain.handle('updateNotification', async function (event, id, data) {
        try {
            const rs = await entityFunc.notificationEntityFunc.updateNotification(id, data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            } else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const markAsRead = () => {
    ipcMain.handle('markNotificationAsRead', async function (event, id) {
        try {
            const rs = await entityFunc.notificationEntityFunc.markAsRead(id)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success"
                }
            } else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const hideNotification = () => {
    ipcMain.handle('hideNotification', async function (event, id) {
        try {
            const rs = await entityFunc.notificationEntityFunc.hideNotification(id)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success"
                }
            } else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const deleteNotification = () => {
    ipcMain.handle('deleteNotification', async function (event, id) {
        try {
            const rs = await entityFunc.notificationEntityFunc.deleteNotification(id)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success"
                }
            } else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const active = () => {
    getAllNotifications()
    getNotificationById()
    insertNotification()
    updateNotification()
    markAsRead()
    hideNotification()
    deleteNotification()
}
