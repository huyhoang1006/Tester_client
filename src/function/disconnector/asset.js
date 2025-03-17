import { v4 as newUuid } from 'uuid'
import { NIL as EMPTY } from 'uuid'
import db from '../datacontext/index'

export const insertDisconnector = (location_id, asset) => {
    const id = asset.disconnect.id || newUuid()
    
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO disconnector(id, location_id,properties,ratings,config,extend)' +
            ' VALUES(?, ?, ?, ?, ?, ?)',
            [id, location_id,
                JSON.stringify(asset.disconnect.properties), JSON.stringify(asset.disconnect.ratings), JSON.stringify(asset.disconnect.config), JSON.stringify(asset.extend)
            ], function (err) {
                if (err) reject(err)
                resolve({
                    id : id,
                    success : true
                })
            })
    })
}

export const getDisconnectorByLocationId = (location_id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM disconnector where location_id=?", [location_id], (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

export const getDisconnectorById = (id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM disconnector where id=?", [id], (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

export const deleteDisconnector = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM disconnector WHERE id = ?", [id], (err) => {
            if (err) reject(err)
            resolve(true)
        })
    })
}

export const updateDisconnector = (asset) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE disconnector' +
            ' SET properties=?, ratings=?, config=?, extend=?' +
            ' WHERE id=?',
            [JSON.stringify(asset.disconnect.properties), JSON.stringify(asset.disconnect.ratings)
                , JSON.stringify(asset.disconnect.config), JSON.stringify(asset.extend), asset.disconnect.id], (err) => {
                if (err) reject(err)
                resolve({
                    success : true
                })
            })
    })
}

export const getTestDisconnectTypes = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM testDisconnect_type", [], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

export const getAssetDisconnectById = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM disconnector where id = ?", [id], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const relocateAsset = (asset) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE disconnector' +
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
        db.all('SELECT * FROM disconnector where location_id = ?',
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

export const updateDisconnectorImport = (disconnector) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE disconnector' +
            ' SET properties=?, ratings=?, config=?, extend=?' +
            ' WHERE id=?',
            [JSON.stringify(disconnector.properties), JSON.stringify(disconnector.ratings)
                , JSON.stringify(disconnector.config), JSON.stringify(disconnector.extend), disconnector.id], (err) => {
                if (err) reject(err)
                resolve({
                    success : true
                })
            })
    })
}

export const insertDisconnectorImport = (disconnector) => {
    const id = disconnector.id || newUuid()
    
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO disconnector(id, location_id,properties,ratings,config,extend)' +
            ' VALUES(?, ?, ?, ?, ?, ?)',
            [id, disconnector.location_id,
                JSON.stringify(disconnector.properties), JSON.stringify(disconnector.ratings), JSON.stringify(disconnector.config), JSON.stringify(disconnector.extend)
            ], function (err) {
                if (err) reject(err)
                resolve({
                    id : id,
                    success : true
                })
            })
    })
}

export const importAsset = (disconnector, location_id) => {
    const id = disconnector.id || newUuid()
    
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO disconnector(id, location_id,properties,ratings,config,extend)' +
            ' VALUES(?, ?, ?, ?, ?, ?)',
            [id, location_id,
                disconnector.properties, disconnector.ratings, disconnector.config, disconnector.extend
            ], function (err) {
                if (err) reject(err)
                resolve({
                    id : id,
                    success : true
                })
            })
    })
}