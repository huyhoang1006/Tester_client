'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

// Tạo mới / cập nhật toàn bộ thông tin của 1 testing equipment
export const insertTestingEquipmentEntity = () => {
    ipcMain.handle('insertTestingEquipmentEntity', async function (event, old_data, data) {
        try {
            const rs = await entityFunc.testingEquipmentEntityFunc.insertTestingEquipmentEntity(old_data, data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            }
            else {
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

// Danh sách rút gọn tất cả testing equipment (cho màn hình list)
export const getAllTestingEquipmentList = () => {
    ipcMain.handle('getAllTestingEquipmentList', async function (event, userId) {
        try {
            const rs = await entityFunc.testingEquipmentEntityFunc.getAllTestingEquipmentList(userId)
            if (rs.success == true) {
                return { success: true, message: "Success", data: rs.data }
            } else {
                return { success: false, message: "fail" }
            }
        } catch (error) {
            return { error, success: false, message: (error && error.message) ? error.message : "Internal error" }
        }
    })
}

// Kho phụ kiện (is_accessory = 1) cho bảng chọn
export const getAllAccessories = () => {
    ipcMain.handle('getAllAccessories', async function () {
        try {
            const rs = await entityFunc.testingEquipmentEntityFunc.getAllAccessories()
            if (rs.success == true) {
                return { success: true, message: "Success", data: rs.data }
            } else {
                return { success: false, message: "fail" }
            }
        } catch (error) {
            return { error, success: false, message: (error && error.message) ? error.message : "Internal error" }
        }
    })
}

// Lấy toàn bộ thông tin của 1 testing equipment theo mrid
export const getTestingEquipmentEntityByMrid = () => {
    ipcMain.handle('getTestingEquipmentEntityByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.testingEquipmentEntityFunc.getTestingEquipmentEntity(mrid)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            console.error("Error retrieving testing equipment entity by MRID:", error)
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

// Xóa toàn bộ thông tin của 1 testing equipment
export const deleteTestingEquipmentEntity = () => {
    ipcMain.handle('deleteTestingEquipmentEntity', async function (event, mrid) {
        try {
            const rs = await entityFunc.testingEquipmentEntityFunc.deleteTestingEquipmentEntity(mrid)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: mrid
                }
            }
            else {
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
    insertTestingEquipmentEntity()
    getAllTestingEquipmentList()
    getAllAccessories()
    getTestingEquipmentEntityByMrid()
    deleteTestingEquipmentEntity()
}
