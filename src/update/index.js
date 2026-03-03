import * as rootOrganisationFunc from './organisationRoot/index'
import * as procedureFunc from './procedure/index'
import VersionService from './VersionService'
import { entityFunc } from '@/function'
import db from '@/function/datacontext/index'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

// Initialize enterprise version service
const versionService = new VersionService(db)

export const createRootOrganisation = async () => {
    try {
        var check = await rootOrganisationFunc.createOrganisationRoot(db)
        if (check.success) {
            console.log('Create root organisation completed')
        } else {
            console.log('Create root organisation failed')
        }
    } catch (err) {
        console.error('Error creating root organisation:', err)
    }
}

export const updateProcedure = async () => {
    const currentVersionTest = 1
    const nameProcedure = 'procedure.json'
    const userDataPath = app.getPath('userData')
    const procedurePath = path.join(userDataPath, nameProcedure)
    if (!fs.existsSync(procedurePath)) {
        try {
            await procedureFunc.createProcedure(db)
            const defaultData = {
                createdAt: new Date().toISOString(),
                version: currentVersionTest
            }
            fs.writeFileSync(
                procedurePath,
                JSON.stringify(defaultData, null, 2),
                'utf-8'
            )
        } catch (err) {
            app.quit()
            console.error('Error creating procedure file:', err)
        }
    } else {
        const fileData = fs.readFileSync(procedurePath, 'utf-8')
        const procedureData = JSON.parse(fileData)
        if (procedureData.version === currentVersionTest) {
            try {
                await procedureFunc.createProcedure(db)
            } catch (err) {
                app.quit()
                console.error('Error updating procedure:', err)
            }
        }
    }
}

/**
 * 🏗️ ENTERPRISE VERSION CHECK
 * Tách biệt app version và database schema version
 */
export const checkVersionUpdate = async () => {
    try {
        const result = await versionService.initialize()
        
        if (result.appUpdate && result.appUpdate.needsUpdate) {
            await createUpdateNotification(result.appUpdate)
            return result.appUpdate
        }
        
        return { needsUpdate: false, message: 'Application is up to date' }
        
    } catch (error) {
        console.error('Version system error:', error)
        return { needsUpdate: false, error: error.message }
    }
}

/**
 * Tạo notification cho app update (chỉ app version, không liên quan schema)
 */
const createUpdateNotification = async (appUpdateInfo) => {
    try {
        const { v4: uuid } = await import('uuid')
        const notificationId = uuid()
        
        const notification = {
            mrid: notificationId,
            name: (appUpdateInfo.updateType ? appUpdateInfo.updateType.toUpperCase() : 'UNKNOWN') + ' Update Available',
            message: 'Version ' + appUpdateInfo.latestVersion + ' is ready to install. You\'re currently on ' + appUpdateInfo.currentVersion + '.',
            type: appUpdateInfo.updateType === 'major' ? 'warning' : 'info',
            status: 'unread',
            created_at: new Date().toISOString(),
            metadata: {
                current_version: appUpdateInfo.currentVersion,
                latest_version: appUpdateInfo.latestVersion,
                update_type: appUpdateInfo.updateType,
                needs_update: true
            }
        }
        
        // Lưu vào database
        const result = await entityFunc.notificationEntityFunc.insertNotification(notification)
        
        if (result.success) {
            console.log(appUpdateInfo.updateType + ' update notification created:', notificationId)
            return { success: true, notificationId }
        } else {
            throw new Error(result.message || 'Failed to create notification')
        }
        
    } catch (error) {
        console.error(' Error creating update notification:', error)
        return { success: false, error: error.message }
    }
}

/**
 * 🚀 ENTERPRISE STARTUP SEQUENCE
 */
export const active = async () => {
    
    // Chạy tuần tự để tránh xung đột transaction
    await createRootOrganisation()
    await updateProcedure()
    await checkVersionUpdate()

}