
import { ipcMain } from 'electron'
import { checkLicenseLimitation, initLicenseLimitation } from '../../../function/cim/license/index'

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
        return new Promise((resolve) => {
            db.all("SELECT * FROM limitation_license", [], (err, rows) => {
                resolve(rows || []);
            });
        });
    });
}
