'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog, remote, screen } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import sqlite3 from 'sqlite3'
import * as updateModule from "./update/index"
import path, { resolve } from 'path'
import fs from 'fs'
import { v4 as newUuid } from 'uuid'
import { NIL as EMPTY } from 'uuid'
import { parse } from 'csv-parse'
import { userFunc, locationFunc, assetFunc, jobFunc, importHavec1pha1capFunc, importHavec3pha1capFunc, importHavec3pha2capFunc } from '@/function'
import {circuitFunc, jobAssetFunc, jobCircuitFunc, currentTransFunc, voltageTransFunc, disconnectorFunc, surgeArresterFunc, powerCableFunc} from "@/function"
import {currentTransJobFunc, voltageTransJobFunc, disconnectorJobFunc, surgeArresterJobFunc, powerCableJobFunc} from '@/function'
import {ipcCircuit, ipcJobCircuit, ipcAttachment, ipcTransformer, ipcCurrentTrans, ipcVoltageTrans, ipcDisconnector, ipcSurgeArrester, ipcPowerCable} from '@/ipcmain'
import { ipcJobCurrent, ipcJobVoltage, ipcJobDisconnector, ipcJobSurge, ipcJobPower, ipcJobTransformer } from '@/ipcmain'
import { ipcUploadCustom, ipcUpdateManu, ipcOwner } from '@/ipcmain'
import { ipcCim } from '@/ipcmain'
let win;

const nameDB = 'database.db'
const pathDB = path.join(__dirname, `/../database/${nameDB}`)
const pathTemplate = path.join(__dirname,`/../template`)
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

const getWindow = async () => BrowserWindow.getFocusedWindow()

const getAllInforAsset = async () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM assets", [], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

const importHavec3pha1cap = async (location_id, filePath) => {
    const data = await importHavec3pha1capFunc.readExcel3pha1cap(filePath)
    await importHavec3pha1capFunc.importAsset3pha1cap(location_id, data.Asset, db)
    var asset_id = await getAssetId()
    await importHavec3pha1capFunc.importHavecTapChangers(asset_id.id, data.Test.ratio_prim_sec, db)
    await importHavec3pha1capFunc.importJob3pha1cap(asset_id.id, data.Job, db)
    var job_id = await getJobId()
    await importHavec3pha1capFunc.importTest3pha1cap(job_id.id, data.Test, db)
    await importHavecBushing(asset_id.id)
}

const getAssetId = async () => {
    return new Promise((resolve, reject) => {
        db.get("SELECT last_insert_rowid() as id FROM assets;", [], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}
const getJobId = async () => {
    return new Promise((resolve, reject) => {
        db.get("SELECT last_insert_rowid() as id FROM jobs", [], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

const importHavecBushing = async (asset_id) => {
    const bushing = {
        asset_type: {
            prim: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            sec: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            tert: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            }
        },
        serial_no: {
            prim: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            sec: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            tert: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            }
        },
        manufacturer: {
            prim: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            sec: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            tert: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            }
        },
        manufacturer_type: {
            prim: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            sec: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            tert: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            }
        },
        manufacturer_year: {
            prim: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            sec: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            tert: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            }
        },
        insull_level: {
            prim: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            sec: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            tert: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            }
        },
        voltage_gr: {
            prim: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            sec: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            tert: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            }
        },
        max_sys_voltage: {
            prim: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            sec: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            tert: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            }
        },
        rate_current: {
            prim: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            sec: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            tert: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            }
        },
        df_c1: {
            prim: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            sec: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            tert: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            }
        },
        cap_c1: {
            prim: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            sec: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            tert: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            }
        },
        df_c2: {
            prim: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            sec: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            tert: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            }
        },
        cap_c2: {
            prim: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            sec: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            tert: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            }
        },
        insulation_type: {
            prim: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            sec: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            },
            tert: {
                fi: '',
                se: '',
                th: '',
                fo: ''
            }
        }
    }
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO bushings(asset_id, asset_type, serial_no, manufacturer, manufacturer_type,manufacturer_year, insull_level, voltage_gr, max_sys_voltage, rate_current, df_c1, cap_c1, df_c2, cap_c2, insulation_type)' +
            'VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [asset_id, JSON.stringify(bushing.asset_type), JSON.stringify(bushing.serial_no), JSON.stringify(bushing.manufacturer), JSON.stringify(bushing.manufacturer_type), JSON.stringify(bushing.manufacturer_year), JSON.stringify(bushing.insull_level), JSON.stringify(bushing.voltage_gr), JSON.stringify(bushing.max_sys_voltage), JSON.stringify(bushing.rate_current), JSON.stringify(bushing.df_c1), JSON.stringify(bushing.cap_c1), JSON.stringify(bushing.df_c2), JSON.stringify(bushing.cap_c2), JSON.stringify(bushing.insulation_type)], (err) => {
                if (err) reject(err)
                resolve(true)
            })
    })
}

const importHavec3pha2cap = async (location_id, filePath) => {
    const data = await importHavec3pha2capFunc.readExcel3pha2cap(filePath)
    await importHavec3pha2capFunc.importAsset3pha2cap(location_id, data.Asset, db)
    var asset_id = await getAssetId()
    await importHavec3pha2capFunc.importHavecTapChangers(asset_id.id, [data.Test.ratio_prim_sec, data.Test.ratio_prim_sec_1], db)
    await importHavec3pha2capFunc.importJob3pha2cap(asset_id.id, data.Job, db)
    var job_id = await getJobId()
    await importHavec3pha2capFunc.importTest3pha2cap(job_id.id, data.Test, db)
    await importHavecBushing(asset_id.id)

}

const importHavec1pha1cap = async (location_id, filePath) => {
    const data = await importHavec1pha1capFunc.readExcel1pha1cap(filePath)
    await importHavec1pha1capFunc.importAsset1pha1cap(location_id, data.Asset, db)
    var asset_id = await getAssetId()
    await importHavec1pha1capFunc.importHavecTapChangers(asset_id.id, data.Test.ratio_prim_sec, db)
    await importHavec1pha1capFunc.importJob1pha1cap(asset_id.id, data.Job, db)
    var job_id = await getJobId()
    await importHavec1pha1capFunc.importTest1pha1cap(job_id.id, data.Test, db)
    await importHavecBushing(asset_id.id)

}

// const importJob = (assetId, data) => {
//     return new Promise((resolve, reject) => {
//         db.run('INSERT INTO jobs(asset_id, name, work_order, creation_date, execution_date, tested_by, approved_by, approval_date)' +
//             ' VALUES(?, ?, ?, ?, ?, ?, ?, ?)',
//             [assetId,
//                 data.Name, data.Work_Order, data.Creation_Date, data.Execution_Date, data.Tested_By, data.Approved_By, data.Approval_Date], (err) => {
//                     if (err) reject(err)
//                     resolve(true)
//                 })
//     })
// }

// const getTestIdByJobId = (jobId) => {
//     return new Promise((resolve, reject) => {
//         db.all("SELECT test_id FROM job_test where job_id = ?", [jobId], (err, rows) => {
//             if (err) reject(err)
//             resolve(rows)
//         })
//     })
// }

// upload Attachment

const uploadAttachment = async (id_foreign, type, info) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO attachment(id, id_foreign, type, name)' +
        ' VALUES(?, ?, ?, ?)',
        [
            newUuid(), id_foreign , type, JSON.stringify(info)
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

// testing condition
const getTestingCondition = (id_foreign) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM testing_condition where id_foreign=?", [id_foreign], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

const insertTestingCondition = (id_foreign, info) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO testing_condition(id, id_foreign, condition, equipment, comment)' +
        ' VALUES(?, ?, ?, ?, ?)',
        [
            newUuid(), id_foreign , JSON.stringify(info.condition), JSON.stringify(info.equipment), info.comment
        ], function (err) {
            if (err) reject(err)
            resolve(true)
        }) 
    });
}

const updateTestingCondition = async (id_foreign, info) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE testing_condition' +
        ' SET condition = ?, equipment=?, comment=?' +
        ' WHERE id_foreign = ?',
        [
            JSON.stringify(info.condition), JSON.stringify(info.equipment) ,info.comment, id_foreign
        ], function (err) {
            if (err) reject(err)
            resolve(true)
        })
    })
}

const deleteTestingCondition = (id_foreign) => {
    return new Promise((resolve, reject) => {
        db.all("DELETE FROM testing_condition WHERE id_foreign = ?", [id_foreign], (err, row) => {
            if (err) reject(err)
            resolve(true)
        })
    })
}

const getTestTypes = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM test_types", [], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

const updateFmeca = (fmeca) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE fmeca' +
            ' SET table_fmeca = ?, table_calculate = ?, total = ?, name=?' +
            ' WHERE id = ?',
            [
                JSON.stringify(fmeca.table_fmeca),  JSON.stringify(fmeca.table_calculate), JSON.stringify(fmeca.total), fmeca.name, fmeca.id
            ], function (err) {
                if (err) reject(err)
                resolve(true)
            })
    })
}

const updateFmecaByName = (fmeca, name) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE fmeca' +
            ' SET table_fmeca = ?, table_calculate = ?, total = ?' +
            ' WHERE name = ?',
            [
                JSON.stringify(fmeca.table_fmeca),  JSON.stringify(fmeca.table_calculate), JSON.stringify(fmeca.total), name,
            ], function (err) {
                if (err) reject(err)
                resolve(true)
            })
    })
}

const insertFmeca = (fmeca) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO fmeca(id, table_fmeca , table_calculate , total, name)' +
            ' VALUES(?, ?, ?, ?, ? )',
            [
                fmeca.id, JSON.stringify(fmeca.table_fmeca), JSON.stringify(fmeca.table_calculate), JSON.stringify(fmeca.total), fmeca.name
            ], function (err) {
                if (err) reject(err)
                resolve(true)
            })
    })
}

const getFmeca = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM fmeca", (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

const getFmecaByName = (name) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM fmeca WHERE name=?", [name], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

const getFmecaName = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT name FROM fmeca", (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

const checkFmecaExist = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM fmeca", (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

const deleteFmeca = (id) => {
    return new Promise((resolve, reject) => {
        db.get("DELETE FROM fmeca WHERE id = ?", [id], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

const deleteFmecaByName = (name) => {
    return new Promise((resolve, reject) => {
        db.get("DELETE FROM fmeca WHERE name = ?", [name], (err, row) => {
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
                JSON.stringify(online_monitoring.aois),  JSON.stringify(online_monitoring.moip), JSON.stringify(online_monitoring.bushings), JSON.stringify(online_monitoring.pd), JSON.stringify(online_monitoring.dga), online_monitoring.bushing_df_worst, online_monitoring.bushing_df_average, online_monitoring.bushing_c_worst, online_monitoring.bushing_c_average, online_monitoring.condition_mois, online_monitoring.health_index,  online_monitoring.weight_bushing_df, online_monitoring.weight_bushing_c, online_monitoring.weight_mois, online_monitoring.asset_id
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
            [online_monitoring.id,assetId,
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

const objectToCsv = (data) => {
    const csvRows = []
    const headers = Object.keys(data[0])
    csvRows.push(headers.join(','))

    // Loop to get value of each objects key
    for (const row of data) {
        const values = headers.map((header) => {
            const val = String(row[header])
            return `"${val}"`
        })
        // To add, sepearater between each value
        csvRows.push(values.join(','))
    }
    return csvRows.join('\r\n')
}

const objectToXls = (data) => {
    const csvRows = []
    const headers = Object.keys(data[0])
    csvRows.push(headers.join('\t'))

    // Loop to get value of each objects key
    for (const row of data) {
        const values = headers.map((header) => {
            const val = row[header]
            return `${val}`
        })
        // To add, sepearater between each value
        csvRows.push(values.join('\t'))
    }
    return csvRows.join('\n')
}

const csvToObject = (csvData) => {
    return new Promise((resolve, reject) => {
        parse(csvData, {columns: true, delimiter: ','}, function (err, data_) {
            if (err) reject(err)
            else {
                var data = JSON.stringify(data_, null, 2)
                var data = JSON.parse(data)
                resolve(data)
            }
        })
    })
}

const importAssetXls = (locationId, data) => {
    const VECTOR_GROUP_JSON = `{"prim":"","sec":{"I":"","Value":""},"tert":{"I":"","Value":"","accessibility":""}}`
    const VOLTAGE_RATINGS_JSON = `{"prim":{"voltage_ll":"","voltage_ln":"","insul_level_ll":"","comment":""},"sec":{"voltage_ll":"","voltage_ln":"","insul_level_ll":"","comment":""},"tert":{"voltage_ll":"","voltage_ln":"","insul_level_ll":"","comment":""}}`
    const POWER_RATINGS_JSON = `[]`
    const CURRENT_RATINGS_JSON = `[]`
    const PRIM_SEC_JSON = `[]`
    const SEC_TERT_JSON = `[]`
    const PRIM_TERT__JSON = `[]`
    const WINDING_JSON = `{"prim":"Copper","sec":"Copper","tert":"Copper"}`

    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO assets(id, location_id, serial_no, feeder, manufacturer, manufacturing_year, manufacturer_type, apparatus_id, asset_system_code, rated_frequency, comment, unsupported_vector_group, phases, base_power, base_voltage, ref_temp, max_short_circuit_current_ka, insulation_weight,  insulation_volume, total_weight, category, tank_type, insulation_medium, asset, asset_type, vector_group, voltage_ratings, power_ratings, current_ratings, prim_sec, prim_tert, sec_tert, winding)' +
                ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                data.Id,
                locationId,
                data.SerialNumber,
                data.Feeder,
                data.Manufacturer,
                data.ManufacturingYear,
                data.ManufacturerType,
                data.ApparatusId,
                data.AssetSystemCode,
                data.RatedFrequency,
                data.Comment,
                data.CustomVectorGroup,
                data.NumberOfPhases,
                data.ImpedancesBasePower,
                data.ImpedancesBaseVoltage,
                data.ImpedancesReferenceTemperature,
                data.MaxShortCircuitCurrent,
                data.FluidWeight,
                data.FluidVolume,
                data.TotalWeight,
                data.Category,
                data.TankType,
                data.FluidType,
                data.AssetKind,
                data.AssetType,
                VECTOR_GROUP_JSON,
                VOLTAGE_RATINGS_JSON,
                POWER_RATINGS_JSON,
                CURRENT_RATINGS_JSON,
                PRIM_SEC_JSON,
                PRIM_TERT__JSON,
                SEC_TERT_JSON,
                WINDING_JSON
            ],
            (err) => {
                if (err) reject(err)
                resolve(true)
            }
        )
    })
}

export const importBushingXls = (assetId, data) => {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO bushings(id, asset_id, asset_type, serial_no, manufacturer, manufacturer_type, manufacturer_year, insull_level, voltage_gr, max_sys_voltage, rate_current, df_c1, cap_c1, df_c2, cap_c2, insulation_type)' +
                ' VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                data.Id,
                assetId,
                data.AssetType,
                data.SerialNumber,
                data.Manufacturer,
                data.ManufacturerType,
                data.ManufacturingYear,
                data.InsulationLevelLL,
                data.VoltageLGround,
                data.RatedVoltage,
                data.RatedCurrent,
                data.PF1,
                data.Cap1,
                data.PF2,
                data.Cap2,
                data.InsulationType
            ],
            (err) => {
                if (err) reject(err)
                resolve(true)
            }
        )
    })
}

 const importTapChangersXls = (asset_id, data) => {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO tap_changers(id, asset_id, mode, serial_no, manufacturer, manufacturer_type, winding, tap_scheme, no_of_taps, voltage_table)' +
                ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                data.Id,
                asset_id,
                data.AssetType,
                data.SerialNumber,
                data.Manufacturer,
                data.ManufacturerType,
                data.Winding,
                data.TapScheme,
                data.NoOfTaps,
                data.VoltageTable
            ],
            (err) => {
                if (err) reject(err)
                resolve(true)
            }
        )
    })
}

 const xlsToObject = (xlsData) => {
    return new Promise((resolve, reject) => {
        var data = String(xlsData).split('\n')
        var data_arr = []
        data.forEach((element) => {
            let data_element = String(element).split('\t')
            data_arr.push(data_element)
        })
        var data_format_dict = []
        data_arr.slice(1, data_arr.length).forEach((element) => {
            let data_ = {}
            data_arr[0].forEach(function (key, i) {
                data_[key] = element[i]
            })
            data_format_dict.push(data_)
        })
        resolve(data_format_dict)
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
    await updateModule.updateManufacturer()
    await updateModule.updateOwnerTable()
    await updateModule.updateLocationTable()
    await updateModule.insertTestType()
    await updateModule.active()
    
    ipcMain.handle('login', async function (event, user) {
        const _user = await userFunc.getUser(user)
        if (_user === undefined) return false
        else return _user
    })

    ipcMain.handle('getAllInforAsset', async function (event, locationId) {
        const data = await getAllInforAsset()
        return data
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
        if(rt.length === 0) {
            rs = await uploadAttachment(id, type, info)
        }
        else {
            rs = await updateAttachment(id, info);
        }
        if (rs === true) {
            return {
                success: true,
                message: "Success",
                data : rs
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

    //testing condition
    ipcMain.handle('getTestingCondition', async function (event, id_foreign) {
        try {
            const rs = await getTestingCondition(id_foreign)
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

    ipcMain.handle('insertTestingCondition', async function (event, id_foreign, info) {
        const rs = await insertTestingCondition(id_foreign, info);
        if (rs === true) {
            return {
                success: true,
                message: "Success",
            }
        }
    })

    ipcMain.handle('updateTestingCondition', async function (event, id_foreign, info) {
        const rs = await updateTestingCondition(id_foreign, info);
        if (rs === true) {
            return {
                success: true,
                message: "Success",
                data : rs
            }
        }
    })
    ipcMain.handle('deleteTestingCondition', async function (event, id_foreign, type) {
        const rs = await deleteTestingCondition(id_foreign);
        if (rs === true) {
            return {
                success: true,
                message: "Success",
            }
        }
    })

    // circuit breaker
    ipcMain.handle('insertCircuit', async function (event, location_id, asset) {
        const rs = await circuitFunc.insertCircuit(location_id, asset);
        if (rs.success === true) {
            return {
                success: true,
                message: "Success",
            }
        }
        else {
            return {
                success: false,
                message: "fail",
            }
        }
    })

    ipcMain.handle('getCircuitByLocationId', async function (event, location_id) {
        const rs = await circuitFunc.getCircuitByLocationId(location_id);
        if (rs.success === true) {
            return {
                success: true,
                message: "Success",
                data : rs.data
            }
        }
        else {
            return {
                success: false,
                message: "fail",
            }
        }
    })

    ipcMain.handle('getCircuitId', async function (event, id) {
        const rs = await circuitFunc.getCircuitId(id);
        if (rs.success === true) {
            return {
                success: true,
                message: "Success",
                data : rs.data
            }
        }
        else {
            return {
                success: false,
                message: "fail",
            }
        }
    })

    ipcMain.handle('deleteCircuit', async function (event, ids) {
        try {
            for(let k in ids) {
                let element = ids[k]
                let jobs = await jobCircuitFunc.getJobByAssetId(element)
                for(let i in jobs) {
                    let jobId = jobs[i].id
                    let testList = await jobCircuitFunc.getTestByJobId(jobId)
                    for(let j in testList) {
                        await deleteTestingCondition(testList[j].id)
                        const rs = await getAllAttachment(testList[j].id, "test")
                        if(rs.length != 0) {
                            for(let n in rs) {
                                JSON.parse(rs[n].name).forEach(e => {
                                    let pathFile = path.join(pathUpload, `/${e.path}`)
                                    fs.unlinkSync(pathFile)
                                })
                            }
                            await deleteAttachment(testList[j].id)
                        }
                    }
                }
                await circuitFunc.deleteCircuit(element)
            }
            return {
                success: true,
                message: "",
                data: null
            }
        } catch(error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })
    ipcMain.handle('updateCircuit', async function (event, asset) {
        const rs = await circuitFunc.updateCircuit(asset);
        if (rs.success === true) {
            return {
                success: true,
                message: "Success",
            }
        }
        else {
            return {
                success: false,
                message: "fail",
            }
        }
    })

    ipcMain.handle('getTestCircuitTypes', async function (event) {
        try {
            const rows = await circuitFunc.getTestCircuitTypes();
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
    })

    //circuit
    ipcCircuit.updateCircuitAssessmentLimits()
    ipcCircuit.relocateCircuit()
    ipcJobCircuit.deleteCircuitTest()
    ipcJobCircuit.saveJobCircuit()
    ipcJobCircuit.saveTestCircuit()
    ipcJobCircuit.getTestCircuitByJobId()
    
    ipcTransformer.exportEtrc()

    //current Trans

    ipcJobCurrent.saveJobCurrent()
    ipcJobCurrent.saveTestCurrent()
    ipcJobCurrent.getTestCurrentByJobId()

    ipcCurrentTrans.insertCurrentVoltage()
    ipcCurrentTrans.getCurrentVoltageByLocationId()
    ipcCurrentTrans.getCurrentVoltageById()
    ipcCurrentTrans.deleteCurrentVoltage()
    ipcCurrentTrans.updateCurrentVoltage()
    ipcCurrentTrans.getLocationAssetByIdCurrentVoltage()
    ipcCurrentTrans.getTestCurrentVoltageTypes()
    ipcCurrentTrans.insertJobCurrentVoltage()
    ipcCurrentTrans.getJobCurrentVoltage()
    ipcCurrentTrans.updateJobCurrentVoltage()
    ipcCurrentTrans.deleteJobCurrentVoltage()
    ipcCurrentTrans.getJobCurrentVoltageById()
    ipcCurrentTrans.deleteCurrentVoltageTest()
    ipcCurrentTrans.relocateCurrent()

    //Voltage Trans
    ipcJobVoltage.saveJobVoltage()
    ipcJobVoltage.saveTestVoltage()
    ipcJobVoltage.getTestVoltageByJobId()

    ipcVoltageTrans.insertVoltageTrans()
    ipcVoltageTrans.getVoltageTransByLocationId()
    ipcVoltageTrans.getVoltageTransById()
    ipcVoltageTrans.deleteVoltageTrans()
    ipcVoltageTrans.updateVoltageTrans()
    ipcVoltageTrans.getLocationAssetByIdVoltageTrans()
    ipcVoltageTrans.getTestVoltageTransTypes()
    ipcVoltageTrans.insertJobVoltageTrans()
    ipcVoltageTrans.getJobVoltageTrans()
    ipcVoltageTrans.updateJobVoltageTrans()
    ipcVoltageTrans.deleteJobVoltageTrans()
    ipcVoltageTrans.getJobVoltageTransById()
    ipcVoltageTrans.deleteVoltageTransTest()
    ipcVoltageTrans.relocateVoltage()

    //Disconnecter
    ipcJobDisconnector.saveJobDisconnector()
    ipcJobDisconnector.saveTestDisconnector()
    ipcJobDisconnector.getTestDisconnectorByJobId()

    ipcDisconnector.insertDisconnector()
    ipcDisconnector.getDisconnectorByLocationId()
    ipcDisconnector.getDisconnectorById()
    ipcDisconnector.deleteDisconnector()
    ipcDisconnector.updateDisconnector()
    ipcDisconnector.getLocationAssetByIdDisconnector()
    ipcDisconnector.getTestDisconnectorTypes()
    ipcDisconnector.insertJobDisconnector()
    ipcDisconnector.getJobDisconnector()
    ipcDisconnector.updateJobDisconnector()
    ipcDisconnector.deleteJobDisconnector()
    ipcDisconnector.getJobDisconnectorById()
    ipcDisconnector.deleteDisconnectorTest()
    ipcDisconnector.relocateDisconnector()

    // Surge Arrester
    ipcJobSurge.saveJobSurge()
    ipcJobSurge.saveTestSurge()
    ipcJobSurge.getTestSurgeByJobId()

    ipcSurgeArrester.insertSurgeArrester()
    ipcSurgeArrester.getSurgeArresterByLocationId()
    ipcSurgeArrester.getSurgeArresterById()
    ipcSurgeArrester.deleteSurgeArrester()
    ipcSurgeArrester.updateSurgeArrester()
    ipcSurgeArrester.getLocationAssetByIdSurgeArrester()
    ipcSurgeArrester.getTestSurgeArresterTypes()
    ipcSurgeArrester.insertJobSurgeArrester()
    ipcSurgeArrester.getJobSurgeArrester()
    ipcSurgeArrester.updateJobSurgeArrester()
    ipcSurgeArrester.deleteJobSurgeArrester()
    ipcSurgeArrester.getJobSurgeArresterById()
    ipcSurgeArrester.deleteSurgeArresterTest()
    ipcSurgeArrester.relocateSurgeArrester()

    // Power Cable
    ipcJobPower.saveJobPower()
    ipcJobPower.saveTestPower()
    ipcJobPower.getTestPowerByJobId()

    ipcPowerCable.insertPowerCable()
    ipcPowerCable.getPowerCableByLocationId()
    ipcPowerCable.getPowerCableById()
    ipcPowerCable.deletePowerCable()
    ipcPowerCable.updatePowerCable()
    ipcPowerCable.getLocationAssetByIdPowerCable()
    ipcPowerCable.getTestPowerCableTypes()
    ipcPowerCable.insertJobPowerCable()
    ipcPowerCable.getJobPowerCable()
    ipcPowerCable.updateJobPowerCable()
    ipcPowerCable.deleteJobPowerCable()
    ipcPowerCable.getJobPowerCableById()
    ipcPowerCable.deletePowerCableTest()
    ipcPowerCable.relocatePowerCable()

    //transformer
    ipcTransformer.deleteAsset()

    ipcJobTransformer.saveJobTransformer()
    ipcJobTransformer.saveTestTransformer()

    //upload custom
    ipcUploadCustom.active()

    //update manufacturer
    ipcUpdateManu.active()

    //owner
    ipcOwner.active()

    //attachment
    ipcAttachment.active()

    //cim
    ipcCim.active()

    ipcMain.handle('importHavec3pha1cap', async function (event, locationId) {
        const rs = await dialog.showOpenDialog({
            title: 'Select the file to be uploaded',
            buttonLabel: 'Upload',
            filters: [
                {
                    name: 'xlsx',
                    extensions: ['xlsx']
                }
            ],
            properties: ['openFile']
        })
        if (!rs.canceled) {
            await importHavec3pha1cap(locationId, rs.filePaths.toString())
            return {
                success: true,
                message: ''
            }
        }
        else {
            return {
                success: false,
                message: ""
            }
        }
    })

    ipcMain.handle('importHavec3pha2cap', async function (event, locationId) {
        const rs = await dialog.showOpenDialog({
            title: 'Select the file to be uploaded',
            buttonLabel: 'Upload',
            filters: [
                {
                    name: 'xlsx',
                    extensions: ['xlsx']
                }
            ],
            properties: ['openFile']
        })
        if (!rs.canceled) {
            await importHavec3pha2cap(locationId, rs.filePaths.toString())
            return {
                success: true,
                message: ''
            }
        }
        else {
            return {
                success: false,
                message: ""
            }
        }
    })

    ipcMain.handle('importHavec1pha1cap', async function (event, locationId) {
        const rs = await dialog.showOpenDialog({
            title: 'Select the file to be uploaded',
            buttonLabel: 'Upload',
            filters: [
                {
                    name: 'xlsx',
                    extensions: ['xlsx']
                }
            ],
            properties: ['openFile']
        })
        if (!rs.canceled) {
            await importHavec1pha1cap(locationId, rs.filePaths.toString())
            return {
                success: true,
                message: ''
            }
        }
        else {
            return {
                success: false,
                message: ""
            }
        }
    })

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

    ipcMain.handle('editUserInfo', async function (event, user) {
        const rs = await userFunc.editUserInfo(user)
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

    ipcMain.handle('addUser', async function (event, user) {
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

    ipcMain.handle('deleteUser', async function (event, id) {
        try {
            const user = await userFunc.getUserById(id)
            if (user.username === 'admin') {
                return {
                    success: false,
                    message: "Can't delete admin",
                    data: null
                }
            }
            await userFunc.deleteUser(id)
            return {
                success: true,
                message: "",
                data: null
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })

    ipcMain.handle('getLocations', async function (event, userId) {
        try {
            const rows = await locationFunc.getLocations(userId)
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
    })

    ipcMain.handle('getLocationsData', async function (event, userId, valueData) {
        try {
            const rows = await locationFunc.getLocationsData(userId, valueData)
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
    })

    ipcMain.handle('getLocationByRefId', async function (event, userId, valueData, refId) {
        try {
            const rows = await locationFunc.getLocationByRefId(userId, valueData, refId)
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
    })

    ipcMain.handle('getLocationByAssetId', async function (event, asset_id) {
        try {
            const row = await locationFunc.getLocationByAssetId(asset_id)
            return {
                success: true,
                message: "",
                data: row
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })

    ipcMain.handle('getLocationById', async function (event, id) {
        try {
            const row = await locationFunc.getLocationById(id)
            return {
                success: true,
                message: "",
                data: row
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })

    ipcMain.handle('deleteLocation', function (event, ids) {
        try {
            ids.forEach(async (id) => {
                // let Transformer = await assetFunc.getAssets(id)
                await locationFunc.deleteLocation(id)
                const atm = await getAllAttachment(id, "location")
                const condi = await getTestingCondition(id)
                if(atm.length !== 0) {
                    atm.forEach(element => {
                        JSON.parse(element.name).forEach((e) => {
                            fs.unlinkSync(path.join(pathUpload, `/${e.path}`))
                        })
                    })
                    await deleteAttachment(id)
                }
                if(condi.length !== 0) {
                    await deleteTestingCondition(id)
                }

            })
            return {
                success: true,
                message: "",
                data: null
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })

    ipcMain.handle('insertLocation', async function (event, userId, location) {
        try {
            const check = await locationFunc.checkLocationExist(location)
            if (check) {
                return {
                    success: false,
                    message: "Name already exists"
                }
            }
            else {
                await locationFunc.insertLocation(userId, location)
                return {
                    success: true,
                    message: "Success"
                }
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: error
            }
        }
    })

    ipcMain.handle('updateLocation', async function (event, location) {
        try {
            const check = await locationFunc.checkLocationExist(location)
            if (check) {
                return {
                    success: false,
                    message: "Name already exists"
                }
            }
            else {
                await locationFunc.updateLocation(location)
                return {
                    success: true,
                    message: "Success"
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })

    ipcMain.handle('exportXLS', async function (event, data) {
        const rs = await dialog.showSaveDialog({
            title: 'Select the file path to save',
            buttonLabel: 'Save',
            filters: [
                { name: 'xls', extensions: ['xls'] }
            ],
            properties: []
        })

        try {
            if (!rs.canceled) {
                const _data = objectToXls(data)
                fs.writeFileSync(rs.filePath.toString(), _data);
                return {
                    success: true,
                    message: ""
                }
            }
            else {
                return {
                    success: false,
                    message: "cancel"
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }

    })

    ipcMain.handle('exportCSV', async function (event, data) {
        const rs = await dialog.showSaveDialog({
            title: 'Select the file path to save',
            buttonLabel: 'Save',
            filters: [
                { name: 'json', extensions: ['json'] }
            ],
            properties: []
        })
        try {
            if (!rs.canceled) {
                console.log(data)
                fs.writeFileSync(rs.filePath.toString(), JSON.stringify(data, null, 4))
                return {
                    success: true,
                    message: ''
                }
            } else {
                return {
                    success: false,
                    message: 'cancel'
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    })

    ipcMain.handle('importAssetXLS', async function (event, locationId) {
        const rs = await dialog.showOpenDialog({
            title: 'Select the file to be uploaded',
            buttonLabel: 'Upload',
            filters: [
                {
                    name: 'xls',
                    extensions: ['xls']
                },],
            properties: ['openFile']
        })

        if (!rs.canceled) {
            const xlsData = fs.readFileSync(rs.filePaths[0].toString(), { encoding: 'utf-8' })
            var data = await xlsToObject(xlsData)
            await importAssetXls(locationId, data[0])
            await importBushingXls(data[0].Id, data[1])
            await importTapChangersXls(data[0].Id, data[2])
            return {
                success: true,
                message: ""
            }
        }
        else {
            return {
                success: false,
                message: "Import cancel"
            }
        }
    })

    ipcMain.handle('importLocationCSV', async function (event, userId) {
        const rs = await dialog.showOpenDialog({
            title: 'Select the file to be uploaded',
            buttonLabel: 'Upload',
            filters: [
                {
                    name: 'json',
                    extensions: ['json']
                },],
            properties: ['openFile']
        })

            try {
                 if (!rs.canceled) {
                     const jsonStr = fs.readFileSync(rs.filePaths[0].toString(), {encoding: 'utf-8'})
                     const locations = JSON.parse(jsonStr)
                     console.log(locations)
                     locations.forEach(async (location, index, arr) => {
                        try {
                            await locationFunc.importLocation(userId, location)
                        } catch (error) {}
                     })

                     return {
                         success: true,
                         message: ''
                     }
                 } else {
                     return {
                         success: false,
                         message: 'Import cancel'
                     }
                 }   
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    })

    ipcMain.handle('importAssetCSV', async function (event, locationId) {
        const rs = await dialog.showOpenDialog({
            title: 'Select the file to be uploaded',
            buttonLabel: 'Upload',
            filters: [
                {
                    name: 'json',
                    extensions: ['json']
                }
            ],
            properties: ['openFile']
        })

        try {
            if (!rs.canceled) {
                const jsonStr = fs.readFileSync(rs.filePaths[0].toString(), {encoding: 'utf-8'})
                const fullAssets = JSON.parse(jsonStr)
                fullAssets.forEach(async (fullAsset, index, arr) => {
                    try {
                        const {asset, bushing, tap_changer} = fullAsset
                        if(asset.asset == "Transformer") {
                            const assetId = await assetFunc.importAsset(locationId, asset)
                            await assetFunc.importBushing(bushing, assetId)
                            await assetFunc.importTapChanger(tap_changer, assetId)
                        } else if(asset.asset == "Circuit breaker") {
                            circuitFunc.importAsset(asset, locationId)
                        } else if(asset.asset == "Current transformer") {
                            currentTransFunc.importAsset(asset, locationId)
                        } else if(asset.asset == "Voltage transformer") {
                            voltageTransFunc.importAsset(asset, locationId)
                        } else if(asset.asset == "Disconnector") {
                            disconnectorFunc.importAsset(asset, locationId)
                        } else if(asset.asset == "Surge arrester") {
                            surgeArresterFunc.importAsset(asset, locationId)
                        } else if(asset.asset == "Power cable") {
                            powerCableFunc.importAsset(asset, locationId)
                        }
                    } catch (error) { }
                })

                return {
                    success: true,
                    message: ''
                }
            } else {
                return {
                    success: false,
                    message: 'Import cancel'
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    })

    ipcMain.handle('getAllTestByJobId', async function (event, jobId) {
        try {
                    const testList = await jobFunc.getAllTestByJobId(jobId)
                    return {
                        success: true,
                        message: '',
                        data: testList
                    }
                } catch (error) {
                    return {
                        success: false,
                        message: error.message,
                        data: null
                    }
                }
    })

    ipcMain.handle('getTestByJobId', async function (event, jobId) {
        try {
                    let testList = await jobFunc.getTestByJobId(jobId)
                    testList = testList.map((test) => ({...test, job_id: jobId}))
                    return {
                        success: true,
                        message: '',
                        data: testList
                    }
                } catch (error) {
                    return {
                        success: false,
                        message: error.message,
                        data: null
                    }
                }
    })

    ipcMain.handle('getAssets', async function (event, locationId) {
        try {
            const rows = await assetFunc.getAssets(locationId)
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
    })

    ipcMain.handle('insertAsset', async function (event, locationId, asset, tapChangers, bushings) {
        try {
            const check = await assetFunc.checkAssetExist(asset)
            if (check) {
                return {
                    success: false,
                    message: "Serial number is exist"
                }
            }
            else {
                const assetId = await assetFunc.insertAsset(locationId, asset)
                await assetFunc.insertTapChanger(tapChangers, assetId)
                await assetFunc.insertBushings(bushings, assetId)
                return {
                    success: true,
                    message: "Success"
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })

    ipcMain.handle('updateAsset', async function (event, asset, tapChangers, bushings) {
        try {
            const check = await assetFunc.checkAssetExist(asset)
            if (check) {
                return {
                    success: false,
                    message: "Serial number is exist"
                }
            }
            else {
                await assetFunc.updateAsset(asset)
                await assetFunc.updateTapChanger(tapChangers)
                await assetFunc.updateBushings(bushings)
                // await jobFunc.updateJobRelated(asset.properties.id, tapChangers)
                return {
                    success: true,
                    message: "Success"
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })

    ipcMain.handle('relocateAsset', async function (event, asset) {
        try {
            await assetFunc.relocateAsset(asset)
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

    ipcMain.handle('getAssetById', async function (event, id) {
        try {
            const asset = await assetFunc.getAssetById(id)
            const tapChanger = await assetFunc.getTapChangerByAssetId(id)
            if (tapChanger) {
                tapChanger['_mode'] = tapChanger.mode
                tapChanger['_winding'] = tapChanger.winding
            }
            const bushings = await assetFunc.getBushingsByAssetId(id)
            return {
                success: true,
                message: "",
                data: {
                    asset,
                    tap_changer: tapChanger,
                    bushings: bushings
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })

    ipcMain.handle('getTapChangerByAssetId', async function (event, id) {
        try {
            const tapChanger = await assetFunc.getTapChangerByAssetId(id)
            return {
                success: true,
                message: "",
                data: tapChanger
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })

    ipcMain.handle('getBushingsByAssetId', async function (event, id) {
        try {
            const bushings = await assetFunc.getBushingsByAssetId(id)
            return {
                success: true,
                message: "",
                data: bushings
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })

    ipcMain.handle('getLocationAssetById', async function (event, assetId) {
        try {
            const asset = await assetFunc.getAssetById(assetId)

            const locationId = asset.location_id
            const location = await locationFunc.getLocationById(locationId)
            const tapChangers = await assetFunc.getTapChangerByAssetId(assetId)
            const bushing = await assetFunc.getBushingsByAssetId(assetId)
            return {
                success: true,
                message: "",
                data: {
                    asset,
                    location,
                    bushing,
                    tapChangers
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })

    ipcMain.handle('getJobs', async function (event, assetId) {
        try {
            const rows = await jobFunc.getJobs(assetId)
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
    })

    ipcMain.handle('getTestbyAssetId', async function (event, assetId, typeId) {
        try {
            const rows = await jobFunc.getTestbyAssetId(assetId, typeId)
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
    })

    // transformer
    ipcMain.handle('insertJob', async function (event, assetId, properties, testList, testConditionArr, attachmentArr) {
        properties.asset_id = assetId
        try {
            const check = await jobFunc.checkJobExist(properties)
            if (check) {
                return {
                    success: false,
                    message: "Name already exists"
                }
            }
            else {
                let i = 0;
                //insert job
                const jobId = await jobFunc.insertJob(assetId, properties)

                //insert test
                if(!(testConditionArr == undefined) && !(attachmentArr == undefined)) {
                    for(const item of testList) {
                        const testId = await jobFunc.insertTest(jobId, item)
                        await insertTestingCondition(testId, testConditionArr[i])
                        await uploadAttachment(testId, "test", attachmentArr[i])
                        i = i + 1
                    }
                }
                else {
                    for(const item of testList) {
                        await jobFunc.insertTest(jobId, item)
                    }
                }

                return {
                    success: true,
                    message: 'Success',
                    data: jobId
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })

    ipcMain.handle('deleteJob', function (event, ids) {
        try {
            ids.forEach(async (jobId) => {
                const testIds = await jobFunc.getTestIdByJobId(jobId)
                testIds.forEach(async (element) => {
                    const testId = element.id
                    const rs = await getAllAttachment(testId, "test")
                        if(rs.length !== 0) {
                            rs.forEach(element => {
                                JSON.parse(element.name).forEach(e => {
                                    let pathFile = path.join(pathUpload, `/${e.path}`)
                                    fs.unlinkSync(pathFile)
                                })
                            })
                            await deleteAttachment(testId)
                        }
                    await deleteTestingCondition(testId)
                })
                await jobFunc.deleteJob(jobId)
            })
            return {
                success: true,
                message: ""
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    }) 

    ipcMain.handle('getJobById', async function (event, id) {
        try {
            const job = await jobFunc.getJobById(id)
            const job_id = job.id
            let testList = await jobFunc.getTestByJobId(id)
            testList = testList.map((test) => ({...test, job_id}))
            return {
                success: true,
                message: "",
                data: {
                    job,
                    testList
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })

    ipcMain.handle('updateJob', async function (event, properties, testList, testConditionArr, attachmentArr) {
        try {
            const check = await jobFunc.checkJobExist(properties)
            if (check) {
                return {
                    success: false,
                    message: "Name already exists"
                }
            }
            else {
                // update job
                const jobId = properties.id
                await jobFunc.updateJob(properties)

                // update test
                testList.forEach(async (item, index) => {
                    let testId = item.id

                    // testId khác 0 là test cũ nên cập nhật vào db, ngược lại thêm vào db
                    if (testId != EMPTY ) {
                        await jobFunc.updateTest(item)
                        const rs = await getTestingCondition(testId)
                        if(rs.length !== 0) {
                            await updateTestingCondition(testId, testConditionArr[index])
                        } else {
                            await insertTestingCondition(testId, testConditionArr[index])
                        }
                        const rt = await getAllAttachment(testId, "test")
                        if(rt.length !== 0) {
                            await updateAttachment(testId, attachmentArr[index])
                        }
                        else {
                            await uploadAttachment(testId,"test",attachmentArr[index])
                        }
                    }
                    else {
                        let id = await jobFunc.insertTest(jobId, item)
                        await insertTestingCondition(id, testConditionArr[index])
                        await uploadAttachment(id,"test",attachmentArr[index])
                    }

                })

                return {
                    success: true,
                    message: "Success"
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })

    ipcMain.handle('deleteTest', async function (event, id) {
        try {
            await jobFunc.deleteTest(id)
            await deleteTestingCondition(id)
            let fileData = await getAllAttachment(id, 'test')
            await deleteAttachment(id)
            for(let i in fileData) {
                let name = fileData[i].name
                for(let j in name) {
                    let path = name[j].path
                    if(fs.existsSync(path)) {
                        fs.unlinkSync(path)
                    }
                }
            }
            return {
                success: true,
                message: ""
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })

    // other
    ipcMain.handle('insertJobdata', async function (event, assetId, properties, testList, testConditionArr, attachmentArr) {
        properties.asset_id = assetId
        try {
            const check = await jobCircuitFunc.checkJobExist(properties)
            if (check) {
                return {
                    success: false,
                    message: "Name already exists"
                }
            }
            else {
                properties.id = newUuid()
                //insert job_asset
                await jobAssetFunc.insertJobasset(assetId, properties.id)
                //insert job
                const jobId = await jobCircuitFunc.insertJob(assetId, properties)

                //insert test
                testList.forEach(async (item, index) => {
                    const testId = await jobCircuitFunc.insertTest(jobId, item)
                    const testCondition = await insertTestingCondition(testId, testConditionArr[index])
                    const attachment = await uploadAttachment(testId, "test", attachmentArr[index])
                })

                return {
                    success: true,
                    message: 'Success',
                    data: jobId
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })

    ipcMain.handle('updateJobdata', async function (event, properties, testList, testConditionArr, attachmentArr) {
        try {
            const check = await jobCircuitFunc.checkJobExist(properties)
            if (check) {
                return {
                    success: false,
                    message: "Name already exists"
                }
            }
            else {
                // update job
                const jobId = properties.id
                await jobCircuitFunc.updateJob(properties)

                for(let i in testList) {
                    let testId = testList[i].id
                    if (testId != EMPTY ) {
                        await jobCircuitFunc.updateTest(testList[i])
                        const rs = await getTestingCondition(testId)
                        if(rs.length !== 0) {
                            await updateTestingCondition(testId, testConditionArr[i])
                        } else {
                            await insertTestingCondition(testId, testConditionArr[i])
                        }

                        const rt = await getAllAttachment(testId, "test")
                        if(rt.length !== 0) {
                            await updateAttachment(testId, attachmentArr[i])
                        }
                        else {
                            await uploadAttachment(testId,"test",attachmentArr[i])
                        }
                    } else {
                        let id = await jobCircuitFunc.insertTest(jobId, testList[i])
                        await insertTestingCondition(id, testConditionArr[i])
                        await uploadAttachment(id,"test",attachmentArr[i])
                    }
                }

                // update test
                // testList.forEach(async (item, index) => {
                //     let testId = item.id

                //     // testId khác 0 là test cũ nên cập nhật vào db, ngược lại thêm vào db
                //     if (testId != EMPTY ) {
                //         await jobCircuitFunc.updateTest(item)
                //         const rs = await getTestingCondition(testId)
                //         if(rs.length !== 0) {
                //             await updateTestingCondition(testId, testConditionArr[index])
                //         } else {
                //             await insertTestingCondition(testId, testConditionArr[index])
                //         }
                //         const rt = await getAllAttachment(testId, "test")
                //         if(rt.length !== 0) {
                //             await updateAttachment(testId, attachmentArr[index])
                //         }
                //         else {
                //             await uploadAttachment(testId,"test",attachmentArr[index])
                //         }
                //     }
                //     else {
                //         await jobCircuitFunc.insertTest(jobId, item)
                //         await insertTestingCondition(testId, testConditionArr[index])
                //         await uploadAttachment(testId,"test",attachmentArr[index])
                        
                //     }

                // })

                return {
                    success: true,
                    message: "Success"
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })

    ipcMain.handle('getJobCircuit', async function (event, assetId) {
        try {
            const rows = await jobCircuitFunc.getJobs(assetId)
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
    })

    ipcMain.handle('getLocationAssetByIdCircuit', async function (event, assetId) {
        try {
            const asset = await circuitFunc.getAssetById(assetId)

            const locationId = asset.location_id
            const location = await locationFunc.getLocationById(locationId)
            return {
                success: true,
                message: "",
                data: {
                    asset,
                    location,
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })

    ipcMain.handle('getJobCircuitById', async function (event, id) {
        try {
            const job = await jobCircuitFunc.getJobById(id)
            const job_id = job.id
            let testList = await jobCircuitFunc.getTestByJobId(id)
            testList = testList.map((test) => ({...test, job_id}))
            return {
                success: true,
                message: "",
                data: {
                    job,
                    testList
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })
    ipcMain.handle('deleteJobCircuit', function (event, ids) {
        try {
            ids.forEach(async (jobId) => {
                const testIds = await jobCircuitFunc.getTestIdByJobId(jobId)
                testIds.forEach(async (element) => {
                    const testId = element.id
                    const rs = await getAllAttachment(testId, "test")
                        if(rs.length !== 0) {
                            rs.forEach(element => {
                                JSON.parse(element.name).forEach(e => {
                                    let pathFile = path.join(pathUpload, `/${e.path}`)
                                    fs.unlinkSync(pathFile)
                                })
                            })
                            await deleteAttachment(testId)
                        }
                    await deleteTestingCondition(testId)
                })
                await jobCircuitFunc.deleteJob(jobId)
                await jobAssetFunc.deleteCircuitByJobId(jobId)
            })
            return {
                success: true,
                message: ""
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })
    
    ipcMain.handle('importJobCSV', async function (event, assetId, assetType) {
        const rs = await dialog.showOpenDialog({
            title: 'Select the file to be uploaded',
            buttonLabel: 'Upload',
            filters: [
                {
                    name: 'json',
                    extensions: ['json']
                },],
            properties: ['openFile']
        })

        try {
            if (!rs.canceled) {
                const jsonStr = fs.readFileSync(rs.filePaths[0].toString(), {encoding: 'utf-8'})
                const fullJobs = JSON.parse(jsonStr)
                fullJobs.forEach(async (fullJob) => {
                    const { job, tests } = fullJob
                    if(assetType == "Transformer") {
                        const jobId = await jobFunc.importJob(assetId, job)
                        tests.forEach(async (test) => {
                            await jobFunc.importTest(jobId, test)
                        })
                    } else if(assetType == "Circuit breaker") {
                        await jobAssetFunc.insertJobasset(assetId, job.id)
                        const jobId = await jobCircuitFunc.insertJob(assetId, job)
                        tests.forEach(async (test) => {
                            test.data = JSON.parse(test.data)
                            await jobCircuitFunc.insertTest(jobId, test)
                        })
                    } else if(assetType == "Current transformer") {
                        const jobId = await currentTransJobFunc.insertJob(assetId, job)
                        tests.forEach(async (test) => {
                            test.data = JSON.parse(test.data)
                            await currentTransJobFunc.insertTest(jobId, test)
                        })
                    } else if(assetType == "Voltage transformer") {
                        const jobId = await voltageTransJobFunc.insertJob(assetId, job)
                        tests.forEach(async (test) => {
                            test.data = JSON.parse(test.data)
                            await voltageTransJobFunc.insertTest(jobId, test)
                        })
                    } else if(assetType == "Disconnector") {
                        const jobId = await disconnectorJobFunc.insertJob(assetId, job)
                        tests.forEach(async (test) => {
                            test.data = JSON.parse(test.data)
                            await disconnectorJobFunc.insertTest(jobId, test)
                        })
                    } else if(assetType == "Surge arrester") {
                        const jobId = await surgeArresterJobFunc.insertJob(assetId, job)
                        tests.forEach(async (test) => {
                            test.data = JSON.parse(test.data)
                            await surgeArresterJobFunc.insertTest(jobId, test)
                        })
                    } else if(assetType == "Power cable") {
                        const jobId = await powerCableJobFunc.insertJob(assetId, job)
                        tests.forEach(async (test) => {
                            test.data = JSON.parse(test.data)
                            await powerCableJobFunc.insertTest(jobId, test)
                        })
                    }
                })
                return {
                    success: true,
                    message: ''
                }
            } else {
                return {
                    success: false,
                    message: 'Import cancel'
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })

    ipcMain.handle('getTestTypes', async function (event) {
        try {
            const rows = await getTestTypes()
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
    })

    ipcMain.handle('updateFmeca', async function (event, fmeca) {
        try {
            await updateFmeca(fmeca)
            return {
                success: true,
                message: "Success"
            }
        }catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })

    ipcMain.handle('updateFmecaByName', async function (event, fmeca, name) {
        try {
            await updateFmecaByName(fmeca, name)
            return {
                success: true,
                message: "Success"
            }
        }catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })

    ipcMain.handle('getFmecaByName', async function (event, name) {
        try {
            const fmeca = await getFmecaByName(name)
            return {
                success: true,
                message: "",
                fmeca
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    }),

    ipcMain.handle('getFmecaName', async function (event) {
        try {
            const fmeca = await getFmecaName()
            return {
                success: true,
                message: "",
                fmeca
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    }),

    ipcMain.handle('getFmeca', async function (event, id) {
        try {
            const fmeca = await getFmeca(id)
            return {
                success: true,
                message: "",
                data: {
                    fmeca
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    }),

    ipcMain.handle('checkFmecaExist', async function (event) {
        try {
            const fmeca = await checkFmecaExist()
            return {
                success: true,
                message: "",
                data: {
                    fmeca
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    }),

    ipcMain.handle('insertFmeca', async function (event, fmeca) {
        try {
            await insertFmeca(fmeca)
            return {
                success: true,
                message: "Success"
            }
        }catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })

    ipcMain.handle('deleteFmeca', async function (event, id) {
        try {
            await deleteFmeca(id)
            return {
                success: true,
                message: "Success"
            }
        }catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })

    ipcMain.handle('deleteFmecaByName', async function (event, name) {
        try {
            await deleteFmecaByName(name)
            return {
                success: true,
                message: "Success"
            }
        }catch (error) {
            return {
                success: false,
                message: error
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
        }catch (error) {
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
        }catch (error) {
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
        }catch (error) {
            return {
                success: false,
                message: error
            }
        }
    }),

    ipcMain.on("closeApp", () => {
        db.close()
        app.quit()
    });

    ipcMain.on("minimizeApp", () => {
        
        win.minimize()
    });

    ipcMain.on("maximizeApp", () => {
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
