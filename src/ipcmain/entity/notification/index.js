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
    ipcMain.handle('getNotificationById', async function (event, mrid) {
        try {
            const rs = await entityFunc.notificationEntityFunc.getNotificationById(mrid)
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
    ipcMain.handle('updateNotification', async function (event, mrid, data) {
        try {
            const rs = await entityFunc.notificationEntityFunc.updateNotification(mrid, data)
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
    ipcMain.handle('markNotificationAsRead', async function (event, mrid) {
        try {
            const rs = await entityFunc.notificationEntityFunc.markAsRead(mrid)
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

export const hmrideNotification = () => {
    ipcMain.handle('hmrideNotification', async function (event, mrid) {
        try {
            const rs = await entityFunc.notificationEntityFunc.hmrideNotification(mrid)
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
    ipcMain.handle('deleteNotification', async function (event, mrid) {
        try {
            const rs = await entityFunc.notificationEntityFunc.deleteNotification(mrid)
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
    hmrideNotification()
    deleteNotification()
}
