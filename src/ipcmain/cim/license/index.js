
import { ipcMain } from 'electron'
import {
    checkLicenseLimitation,
    getAllLicenses,
    initLicenseLimitation,
    updateLicenseLimit
} from '../../../function/cim/license/index'

export const active = () => {
    initLicenseLimitation();
    ipcMain.handle('updateLicenseLimit', async (event, name, limit) => {
        return await updateLicenseLimit(name, limit);
    });
    ipcMain.handle('checkLicenseLimitation', async (event, name) => {
        try {
            return await checkLicenseLimitation(name);
        } catch (error) {
            return { success: false, message: error.message };
        }
    });
    ipcMain.handle('getAllLicenses', async () => {
        return await getAllLicenses();
    });
}
