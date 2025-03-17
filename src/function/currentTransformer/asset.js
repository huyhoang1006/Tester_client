import { v4 as newUuid } from 'uuid'
import { NIL as EMPTY } from 'uuid'
import db from '../datacontext/index'

export const insertCurrentVoltage = (location_id, asset) => {
    const id = asset.current.id || newUuid()
    
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO current_voltage(id, location_id,properties,ratings,config,extend)' +
            ' VALUES(?, ?, ?, ?, ?, ?)',
            [id, location_id,
                JSON.stringify(asset.current.properties), JSON.stringify(asset.current.ratings), JSON.stringify(asset.current.config), JSON.stringify(asset.extend)
            ], function (err) {
                if (err) reject(err)
                resolve({
                    id : id,
                    success : true
                })
            })
    })
}

export const getCurrentVoltageByLocationId = (location_id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM current_voltage where location_id=?", [location_id], (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

export const getCurrentVoltageById = (id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM current_voltage where id=?", [id], (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

export const deleteCurrentVoltage = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM current_voltage WHERE id = ?", [id], (err) => {
            if (err) reject(err)
            resolve(true)
        })
    })
}

export const updateCurrentVoltage = (asset) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE current_voltage' +
            ' SET properties=?, ratings=?, config=?, extend=?' +
            ' WHERE id=?',
            [JSON.stringify(asset.current.properties), JSON.stringify(asset.current.ratings)
                , JSON.stringify(asset.current.config), JSON.stringify(asset.extend), asset.current.id], (err) => {
                if (err) reject(err)
                resolve({
                    success : true
                })
            })
    })
}


export const getTestCurrentTypes = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM testCurrent_type", [], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

export const getAssetCurrentById = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM current_voltage where id = ?", [id], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const relocateAsset = (asset) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE current_voltage' +
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
        db.all('SELECT * FROM current_voltage where location_id = ?',
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

export const updateCurrentTransImport = (current) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE current_voltage' +
            ' SET properties=?, ratings=?, config=?, extend=?' +
            ' WHERE id=?',
            [JSON.stringify(current.properties), JSON.stringify(current.ratings)
                , JSON.stringify(current.config), JSON.stringify(current.extend), current.id], (err) => {
                if (err) reject(err)
                resolve({
                    success : true
                })
            })
    })
}

export const insertCurrentTransImport = (current) => {
    const id = current.id || newUuid()
    
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO current_voltage(id, location_id,properties,ratings,config,extend)' +
            ' VALUES(?, ?, ?, ?, ?, ?)',
            [id, current.location_id,
                JSON.stringify(current.properties), JSON.stringify(current.ratings), JSON.stringify(current.config), JSON.stringify(current.extend)
            ], function (err) {
                if (err) reject(err)
                resolve({
                    id : id,
                    success : true
                })
            })
    })
}

export const importAsset = (current, location_id) => {
    const id = current.id || newUuid()
    
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO current_voltage(id, location_id,properties,ratings,config,extend)' +
            ' VALUES(?, ?, ?, ?, ?, ?)',
            [id, location_id,
                current.properties, current.ratings, current.config, current.extend
            ], function (err) {
                if (err) reject(err)
                resolve({
                    id : id,
                    success : true
                })
            })
    })
}