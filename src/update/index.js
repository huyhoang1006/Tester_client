import * as rootOrganisationFunc from './organisationRoot/index'
import * as procedureFunc from './procedure/index'
import VersionService from './VersionService'
import LatestYmlService from './LatestYmlService'
import BlockmapService from './BlockmapService'
import UpdateSchedulerService from './UpdateSchedulerService'
import { entityFunc } from '@/function'
import db from '@/function/datacontext/index'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import semver from 'semver'

const versionService = new VersionService(db)
const latestYmlService = new LatestYmlService()
const blockmapService = new BlockmapService()
const schedulerService = new UpdateSchedulerService()

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
 * Chỉ check khi cần (lần đầu hoặc sau 6h)
 */
export const checkVersionUpdate = async (forceCheck = false) => {
    try {
        if (!forceCheck && !schedulerService.shouldCheckUpdate()) {
            console.log('[Update] Skipping check - not time yet. Next check in:', schedulerService.formatTimeUntilNextCheck())
            const statusInfo = schedulerService.getStatusInfo()
            return { 
                needsUpdate: false, 
                skipped: true, 
                message: 'Not time for update check yet',
                statusInfo 
            }
        }

        const latestYmlData = await latestYmlService.getLatestYml()
        const currentVersion = versionService.getCurrentAppVersion()
        const latestVersion = latestYmlData.version

        const currentParsed = semver.parse(currentVersion)
        const latestParsed = semver.parse(latestVersion)

        let needsUpdate = false
        if (currentParsed && latestParsed) {
            needsUpdate = semver.gt(latestParsed, currentParsed)
        } else {
            needsUpdate = latestVersion !== currentVersion
        }

        const updateType = needsUpdate ? getUpdateType(currentVersion, latestVersion) : null

        const result = {
            needsUpdate: needsUpdate,
            currentVersion: currentVersion,
            latestVersion: latestVersion,
            updateType: updateType,
            releaseNotes: latestYmlData.releaseNotes || '',
            releaseDate: latestYmlData.releaseDate,
            files: latestYmlData.files,
            tagName: latestYmlData.tagName,
            fromYml: latestYmlData.fromYml,
            timestamp: Date.now()
        }

        schedulerService.markChecked(result)

        if (needsUpdate) {
            const alreadyNotified = schedulerService.hasNotified(latestVersion)
            const isDismissed = schedulerService.isDismissed(latestVersion)

            if (!alreadyNotified && !isDismissed) {
                await createUpdateNotification(result)
                schedulerService.markNotified(latestVersion)
            }

            return result
        }
        
        return { needsUpdate: false, message: 'Application is up to date', ...result }
        
    } catch (error) {
        console.error('Version system error:', error)
        return { needsUpdate: false, error: error.message }
    }
}

/**
 * Xác định loại update: major, minor, patch
 */
const getUpdateType = (current, latest) => {
    if (!semver.gt(latest, current)) return null
    
    const currentParsed = semver.parse(current)
    const latestParsed = semver.parse(latest)
    
    if (!currentParsed || !latestParsed) return 'patch'
    
    if (latestParsed.major > currentParsed.major) return 'major'
    if (latestParsed.minor > currentParsed.minor) return 'minor'
    return 'patch'
}

/**
 * Thực hiện update khi user bấm Update
 */
export const performUpdate = async (onProgress) => {
    try {
        const latestYmlData = await latestYmlService.getLatestYml()
        
        if (!latestYmlData.files || !latestYmlData.files.installer) {
            throw new Error('No installer found in release')
        }

        const installerInfo = latestYmlData.files.installer
        const blockmapInfo = latestYmlData.files.blockmap

        const downloadResult = await blockmapService.downloadAndVerify(
            installerInfo.url,
            blockmapInfo.url || null,
            installerInfo.sha512 || null,
            onProgress
        )

        if (!downloadResult.verified) {
            throw new Error('Checksum verification failed')
        }

        await blockmapService.runInstaller(downloadResult.installer)

        return {
            success: true,
            message: 'Update installer started. The application will update on next restart.',
            installerPath: downloadResult.installer
        }

    } catch (error) {
        console.error('Update failed:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Lấy thông tin update mới nhất (dùng cho UI Check for Update)
 */
export const getUpdateInfo = async () => {
    try {
        const latestYmlData = await latestYmlService.getLatestYml()
        const currentVersion = versionService.getCurrentAppVersion()

        return {
            currentVersion,
            latestVersion: latestYmlData.version,
            releaseNotes: latestYmlData.releaseNotes,
            releaseDate: latestYmlData.releaseDate,
            files: latestYmlData.files,
            tagName: latestYmlData.tagName,
            schedulerStatus: schedulerService.getStatusInfo()
        }
    } catch (error) {
        console.error('Failed to get update info:', error)
        return { error: error.message }
    }
}

/**
 * Bỏ qua thông báo update cho version hiện tại
 */
export const dismissUpdateNotification = async (version) => {
    schedulerService.dismissVersion(version)
    return { success: true }
}

/**
 * Reset scheduler (force check on next startup)
 */
export const resetScheduler = () => {
    schedulerService.reset()
    return { success: true }
}

/**
 * Lấy trạng thái scheduler
 */
export const getSchedulerStatus = () => {
    return schedulerService.getStatusInfo()
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
    await createRootOrganisation()
    await updateProcedure()
    
    schedulerService.scheduleCheck(async () => {
        await checkVersionUpdate()
        schedulerService.scheduleNextCheck(async () => {
            await checkVersionUpdate()
        })
    })
}