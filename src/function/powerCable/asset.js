import { v4 as newUuid } from 'uuid'
import { NIL as EMPTY } from 'uuid'
import db from '../datacontext/index'

export const insertPowerCable = (location_id, asset) => {
    const id = asset.power.id || newUuid()
    
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO power_cable(id, location_id,properties, powerCable, assessories,extend)' +
            ' VALUES(?, ?, ?, ?, ?, ?)',
            [id, location_id,
                JSON.stringify(asset.power.properties), JSON.stringify(asset.power.powerCable), JSON.stringify(asset.power.assessories), JSON.stringify(asset.power.extend)
            ], function (err) {
                if (err) reject(err)
                resolve({
                    id : id,
                    success : true
                })
            })
    })
}

export const getPowerCableByLocationId = (location_id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM power_cable where location_id=?", [location_id], (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

export const getPowerCableById = (id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM power_cable where id=?", [id], (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

export const deletePowerCable = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM power_cable WHERE id = ?", [id], (err) => {
            if (err) reject(err)
            resolve(true)
        })
    })
}

export const updatePowerCable = (asset) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE power_cable' +
            ' SET properties=?, powerCable=?, assessories=?, extend=?' +
            ' WHERE id=?',
            [JSON.stringify(asset.power.properties), JSON.stringify(asset.power.powerCable)
                , JSON.stringify(asset.power.assessories), JSON.stringify(asset.extend), asset.power.id], (err) => {
                if (err) reject(err)
                resolve({
                    success : true
                })
            })
    })
}


export const getTestPowerTypes = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM testPower_type", [], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

export const getAssetPowerById = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM power_cable where id = ?", [id], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const relocateAsset = (asset) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE power_cable' +
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
        db.all('SELECT * FROM power_cable where location_id = ?',
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

export const updatePowerCableImport = (powerCable) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE power_cable' +
            ' SET properties=?, powerCable=?, assessories=?, extend=?' +
            ' WHERE id=?',
            [JSON.stringify(powerCable.powerCable.properties), JSON.stringify(powerCable.powerCable)
                , JSON.stringify(powerCable.assessories), JSON.stringify(powerCable.extend), disconnector.id], (err) => {
                if (err) reject(err)
                resolve({
                    success : true
                })
            })
    })
}

export const insertPowerCableImport = (powerCable) => {
    const id = powerCable.id || newUuid()
    
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO power_cable(id, location_id,properties,powerCable,assessories,extend)' +
            ' VALUES(?, ?, ?, ?, ?, ?)',
            [id, powerCable.location_id,
                JSON.stringify(powerCable.powerCable.properties), JSON.stringify(powerCable.powerCable), JSON.stringify(powerCable.assessories), JSON.stringify(powerCable.extend)
            ], function (err) {
                if (err) reject(err)
                resolve({
                    id : id,
                    success : true
                })
            })
    })
}

export const importAsset = (powerCable, location_id) => {
    const id = powerCable.id || newUuid()
    
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO power_cable(id, location_id,properties,powerCable,assessories,extend)' +
            ' VALUES(?, ?, ?, ?, ?, ?)',
            [id, location_id,
                powerCable.properties, powerCable.powerCable, powerCable.assessories, powerCable.extend
            ], function (err) {
                if (err) reject(err)
                resolve({
                    id : id,
                    success : true
                })
            })
    })
}