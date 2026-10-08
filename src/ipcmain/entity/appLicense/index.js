'use strict'

import {ipcMain} from 'electron'
import {entityFunc} from '@/function'

export const active = () => {
    ipcMain.handle('getDeviceFingerprint', async () => {
        try {
            const data = await entityFunc.appLicenseFunc.getDeviceFingerprint()
            return {success: true, data, message: 'Device fingerprint generated'}
        } catch (error) {
            return {
                success: false,
                data: null,
                code: error.code || 'FINGERPRINT_FAILED',
                message: error.message || 'Could not generate device fingerprint'
            }
        }
    })

    ipcMain.handle('getOnlineLicenseSetup', async () => {
        try {
            const data = await entityFunc.appLicenseFunc.getOnlineLicenseSetup()
            return {success: true, data}
        } catch (error) {
            return {
                success: false,
                data: error.config ? {config: error.config} : null,
                code: error.code || 'LICENSE_SETUP_FAILED',
                message: error.message || 'Could not load license setup'
            }
        }
    })

    ipcMain.handle('checkOnlineLicense', async () => {
        try {
            const data = await entityFunc.appLicenseFunc.checkOnlineLicense()
            return {success: true, data}
        } catch (error) {
            return {
                success: false,
                data: error.config ? {config: error.config} : null,
                code: error.code || 'LICENSE_CHECK_FAILED',
                message: error.message || 'Could not verify the application license'
            }
        }
    })

    ipcMain.handle('activateOnlineLicense', async (_event, payload) => {
        try {
            const data = await entityFunc.appLicenseFunc.activateOnlineLicense(payload)
            return {success: true, data, message: 'Application activated'}
        } catch (error) {
            return {
                success: false,
                data: null,
                code: error.code || 'LICENSE_ACTIVATION_FAILED',
                message: error.message || 'Could not activate the application'
            }
        }
    })

    ipcMain.handle('clearOnlineLicense', async () => {
        try {
            const data = entityFunc.appLicenseFunc.clearOnlineLicense()
            return {success: true, data}
        } catch (error) {
            return {
                success: false,
                data: null,
                code: error.code || 'LICENSE_CLEAR_FAILED',
                message: error.message || 'Could not clear local activation'
            }
        }
    })
}

