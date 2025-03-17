import { v4 as newUuid } from 'uuid'
import { NIL as EMPTY } from 'uuid'
import db from '../datacontext/index'

export const insertVoltageTrans = (location_id, asset) => {
    const id = asset.voltage.id || newUuid()
    
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO voltage_trans(id, location_id,properties,ratings,config,extend)' +
            ' VALUES(?, ?, ?, ?, ?, ?)',
            [id, location_id,
                JSON.stringify(asset.voltage.properties), JSON.stringify(asset.voltage.ratings), JSON.stringify(asset.voltage.config), JSON.stringify(asset.extend)
            ], function (err) {
                if (err) reject(err)
                resolve({
                    id : id,
                    success : true
                })
            })
    })
}

export const getVoltageTransByLocationId = (location_id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM voltage_trans where location_id=?", [location_id], (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

export const getVoltageTransById = (id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM voltage_trans where id=?", [id], (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

export const deleteVoltageTrans = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM voltage_trans WHERE id = ?", [id], (err) => {
            if (err) reject(err)
            resolve(true)
        })
    })
}

export const updateVoltageTrans = (asset) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE voltage_trans' +
            ' SET properties=?, ratings=?, config=?, extend=?' +
            ' WHERE id=?',
            [JSON.stringify(asset.voltage.properties), JSON.stringify(asset.voltage.ratings)
                , JSON.stringify(asset.voltage.config), JSON.stringify(asset.extend), asset.voltage.id], (err) => {
                if (err) reject(err)
                resolve({
                    success : true
                })
            })
    })
}


export const getTestVoltageTypes = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM testVoltage_type", [], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

export const getAssetVoltageById = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM voltage_trans where id = ?", [id], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const relocateAsset = (asset) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE voltage_trans' +
            ' SET location_id=?, extend=?' +
            ' WHERE id=?',
            [asset.location_id, JSON.stringify(asset.extend), asset.id], (err) => {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const checkAssetNameExist = (location_id, serial_no) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM voltage_trans where location_id = ?',
            [location_id], (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    if(rows.length != 0) {
                        let id = ''
                        for(let i in rows) {
                            let properties = JSON.parse(rows[i].properties)
                            if(properties.serial_no == serial_no) {
                                id = rows[i].id
                            }
                            break
                        }
                        if(id == '') {
                            resolve(
                                {
                                    exist : false,
                                }
                            )
                        }
                        else {
                            resolve(
                                {
                                    exist : true,
                                    id : id
                                }
                            )
                        }
                    } else {
                        resolve(
                            {
                                exist : false,
                            }
                        )
                    }
                }
            })
    })
}

export const updateVoltageTransImport = (voltage) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE voltage_trans' +
            ' SET properties=?, ratings=?, config=?, extend=?' +
            ' WHERE id=?',
            [JSON.stringify(voltage.properties), JSON.stringify(voltage.ratings)
                , JSON.stringify(voltage.config), JSON.stringify(voltage.extend), voltage.id], (err) => {
                if (err) reject(err)
                resolve({
                    success : true
                })
            })
    })
}

export const insertVoltageTransImport = (voltage) => {
    const id = voltage.id || newUuid()
    
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO voltage_trans(id, location_id,properties,ratings,config,extend)' +
            ' VALUES(?, ?, ?, ?, ?, ?)',
            [id, voltage.location_id,
                JSON.stringify(voltage.properties), JSON.stringify(voltage.ratings), JSON.stringify(voltage.config), JSON.stringify(voltage.extend)
            ], function (err) {
                if (err) reject(err)
                resolve({
                    id : id,
                    success : true
                })
            })
    })
}

export const importAsset = (voltage, location_id) => {
    const id = voltage.id || newUuid()
    
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO voltage_trans(id, location_id,properties,ratings,config,extend)' +
            ' VALUES(?, ?, ?, ?, ?, ?)',
            [id, location_id,
                voltage.properties, voltage.ratings, voltage.config, voltage.extend
            ], function (err) {
                if (err) reject(err)
                resolve({
                    id : id,
                    success : true
                })
            })
    })
}