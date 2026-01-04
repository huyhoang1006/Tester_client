'use strict'

import { app, protocol, BrowserWindow, ipcMain, screen } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import sqlite3 from 'sqlite3'
import * as updateModule from "./update/index"
import fs from 'fs'
import path from 'path'
import { v4 as newUuid } from 'uuid'
import { userFunc } from '@/function'
import { ipcUploadCustom } from '@/ipcmain'
import { ipcCim, ipcEntity, ipcAppOption } from '@/ipcmain'
let win;

const nameDB = 'database.db'
const pathDB = path.join(__dirname, `/../database/${nameDB}`)
const pathUpload = path.join(__dirname, `/../attachment`)
const db = new sqlite3.Database(pathDB);
db.run("PRAGMA foreign_keys=ON");



const isDevelopment = process.env.NODE_ENV !== 'development'

// const {dialog} = require('@electron/remote')
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
])


function adjustWindowSize() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize; // Lấy kích thước mà không bao gồm taskbar

    win.setBounds({ x: 0, y: 0, width, height }); // Cập nhật kích thước cửa sổ
}


async function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        show: false,
        frame: false,
        autoHideMenuBar: true,
        webPreferences: {

            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: true,
            contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
            preload: path.join(__dirname, 'preload.js'),
            devTools: true,
            webSecurity: false
        }
    })



    // full screen
    adjustWindowSize()
    win.show();

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        db.close()
        app.quit()
    }
})

app.on('activate', async () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) await createWindow()
})

// upload Attachment

const uploadAttachment = async (id_foreign, type, info) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO attachment(id, id_foreign, type, name)' +
            ' VALUES(?, ?, ?, ?)',
            [
                newUuid(), id_foreign, type, JSON.stringify(info)
            ], function (err) {
                if (err) reject(err)
                resolve(true)
            })
    });
}

const updateAttachment = async (id, info) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE attachment' +
            ' SET name = ?' +
            ' WHERE id_foreign = ?',
            [
                JSON.stringify(info), id,
            ], function (err) {
                if (err) reject(err)
                resolve(true)
            })
    })
}

const getAllAttachment = async (id_foreign, type) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM attachment where id_foreign=? and type=?", [id_foreign, type], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

const deleteAttachment = (id_foreign) => {
    return new Promise((resolve, reject) => {
        db.all("DELETE FROM attachment WHERE id_foreign = ?", [id_foreign], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

const getOnlineMonitoringData = (assetId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM online_monitor where asset_id=?", [assetId], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

const updateOnlineMonitoringData = (online_monitoring) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE online_monitor' +
            ' SET ageing_insulation = ?, moisture_insulation = ?, bushings_online = ?, patital_discharge = ?, dga = ?, bushing_df_worst = ?,  bushing_df_average= ?, bushing_c_worst   = ?, bushing_c_average = ?, condition_mois    = ?, health_index      = ?, weight_bushing_df = ?, weight_bushing_c  = ?, weight_mois = ?' +
            ' WHERE asset_id = ?',
            [
                JSON.stringify(online_monitoring.aois), JSON.stringify(online_monitoring.moip), JSON.stringify(online_monitoring.bushings), JSON.stringify(online_monitoring.pd), JSON.stringify(online_monitoring.dga), online_monitoring.bushing_df_worst, online_monitoring.bushing_df_average, online_monitoring.bushing_c_worst, online_monitoring.bushing_c_average, online_monitoring.condition_mois, online_monitoring.health_index, online_monitoring.weight_bushing_df, online_monitoring.weight_bushing_c, online_monitoring.weight_mois, online_monitoring.asset_id
            ], function (err) {
                if (err) reject(err)
                resolve(true)
            })
    })
}

const insertOnlineMonitoringData = (assetId, online_monitoring) => {
    // const id = online_monitoring.id || newUuid()
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO online_monitor(id, asset_id, ageing_insulation, moisture_insulation, bushings_online, patital_discharge, dga, bushing_df_worst, bushing_df_average, bushing_c_worst, bushing_c_average, condition_mois, health_index, weight_bushing_df, weight_bushing_c, weight_mois, created_on, created_by, updated_on, updated_by )' +
            ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )',
            [online_monitoring.id, assetId,
            JSON.stringify(online_monitoring.aois), JSON.stringify(online_monitoring.moip), JSON.stringify(online_monitoring.bushings), JSON.stringify(online_monitoring.pd), JSON.stringify(online_monitoring.dga), online_monitoring.bushing_df_worst,
            online_monitoring.bushing_df_average, online_monitoring.bushing_c_worst, online_monitoring.bushing_c_average, online_monitoring.condition_mois, online_monitoring.health_index, online_monitoring.weight_bushing_df, online_monitoring.weight_bushing_c, online_monitoring.weight_mois,
            online_monitoring.created_on, online_monitoring.created_by, online_monitoring.updated_on, online_monitoring.updated_by
            ], function (err) {
                if (err) reject(err)
                resolve(true)
            })
    })
}

const deleteMonitorsByAssetId = (asset_id) => {
    return new Promise((resolve, reject) => {
        db.get("DELETE FROM online_monitor WHERE asset_id = ?", [asset_id], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            await installExtension(VUEJS_DEVTOOLS)
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }

    await updateModule.active()

    const nameProcedure = 'procedure.json'
    const userDataPath = app.getPath('userData')
    const procedurePath = path.join(userDataPath, nameProcedure)
    if (!fs.existsSync(procedurePath)) {
        try {
            await updateModule.updateProcedure()
            const defaultData = {
                createdAt: new Date().toISOString(),
                version: 1
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
    }

    ipcMain.handle('login', async function (event, user) {
        const _user = await userFunc.getUser(user)
        if (_user === undefined) return false
        else return _user
    })

    // upload attachment

    ipcMain.handle('uploadAttachment', async function (event, id_foreign, type, info) {
        const rs = await uploadAttachment(id_foreign, type, info);
        if (rs === true) {
            return {
                success: true,
                message: "Success",
            }
        }
    })
    ipcMain.handle('updateAttachment', async function (event, id, info, type) {
        const rt = await getAllAttachment(id, type)
        let rs
        if (rt.length === 0) {
            rs = await uploadAttachment(id, type, info)
        }
        else {
            rs = await updateAttachment(id, info);
        }
        if (rs === true) {
            return {
                success: true,
                message: "Success",
                data: rs
            }
        }
    })
    ipcMain.handle('getAllAttachment', async function (event, id_foreign, type) {
        try {
            const rs = await getAllAttachment(id_foreign, type);
            return {
                success: true,
                message: "",
                data: rs
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })
    ipcMain.handle('deleteAttachmentpath', async function (event, name) {
        try {
            fs.unlinkSync(path.join(pathUpload, `/${name}`))
            return {
                success: true,
                message: "",
            }
        } catch (error) {
            return {
                success: false,
                message: error,
            }
        }
    })
    ipcMain.handle('deleteAttachment', async function (event, id_foreign) {
        const rs = await deleteAttachment(id_foreign);
        if (rs === true) {
            return {
                success: true,
                message: "Success",
            }
        }
    })

    //upload custom
    ipcUploadCustom.active()

    //cim
    ipcCim.active()

    //entity
    ipcEntity.active()

    //app option
    ipcAppOption.active()

    ipcMain.handle('getAllUser', async function (event) {
        const _users = await userFunc.getAllUser()
        if (_users === undefined)
            return false
        else return _users
    })

    ipcMain.handle('signup', async function (event, user) {
        const check = await userFunc.checkUserExist(user)
        if (!check) {
            const rs = await userFunc.insertUser(user)
            if (rs === true) {
                return {
                    success: true,
                    message: "Success",
                }
            }
        }
        else return {
            success: false,
            message: "User is exist"
        }
    })

    ipcMain.handle('changePass', async function (event, user) {
        const rs = await userFunc.changePass(user)
        if (rs === true) {
            return {
                success: true,
                message: "Success"
            }
        }
        else {
            return {
                success: false,
                message: rs
            }
        }
    })

    ipcMain.handle('updateOnlineMonitoringData', async function (event, online_monitoring) {
        try {
            await updateOnlineMonitoringData(online_monitoring)
            return {
                success: true,
                message: "Success"
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })

    ipcMain.handle('deleteMonitorsByAssetId', async function (event, assetId) {
        try {
            await deleteMonitorsByAssetId(assetId)
            return {
                success: true,
                message: "Success"
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })

    ipcMain.handle('getOnlineMonitoringData', async function (event, assetId) {
        try {
            const rows = await getOnlineMonitoringData(assetId)
            return {
                success: true,
                message: "",
                data: rows
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    }),

    ipcMain.handle('insertOnlineMonitoringData', async function (event, assetId, online_monitoring) {
        try {
            await insertOnlineMonitoringData(assetId, online_monitoring)
            return {
                success: true,
                message: "Success"
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    }),

    ipcMain.handle("closeApp", () => {
        db.close()
        app.quit()
    });

    ipcMain.handle("minimizeApp", () => {
        win.minimize()
    });

    ipcMain.handle("maximizeApp", () => {
        win.isMaximized() ? win.unmaximize() : win.maximize();
    });

    await createWindow()

    screen.on('display-metrics-changed', () => {
        adjustWindowSize();
    });
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                db.close()
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            db.close()
            app.quit()
        })
    }
}
