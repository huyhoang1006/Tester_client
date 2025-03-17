import { v4 as newUuid } from 'uuid'
import { NIL as EMPTY } from 'uuid'
import db from '../datacontext/index'

export const insertSurgeArrester = (location_id, asset) => {
    const id = asset.surge.id || newUuid()
    
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO surge_arrester(id, location_id,properties,ratings,config,extend)' +
            ' VALUES(?, ?, ?, ?, ?, ?)',
            [id, location_id,
                JSON.stringify(asset.surge.properties), JSON.stringify(asset.surge.ratings), JSON.stringify(asset.surge.config), JSON.stringify(asset.extend)
            ], function (err) {
                if (err) reject(err)
                resolve({
                    id : id,
                    success : true
                })
            })
    })
}

export const getSurgeArresterByLocationId = (location_id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM surge_arrester where location_id=?", [location_id], (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

export const getSurgeArresterById = (id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM surge_arrester where id=?", [id], (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

export const deleteSurgeArrester = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM surge_arrester WHERE id = ?", [id], (err) => {
            if (err) reject(err)
            resolve(true)
        })
    })
}

export const updateSurgeArrester = (asset) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE surge_arrester' +
            ' SET properties=?, ratings=?, config=?, extend=?' +
            ' WHERE id=?',
            [JSON.stringify(asset.surge.properties), JSON.stringify(asset.surge.ratings)
                , JSON.stringify(asset.surge.config), JSON.stringify(asset.extend), asset.surge.id], (err) => {
                if (err) reject(err)
                resolve({
                    success : true
                })
            })
    })
}


export const getTestSurgeTypes = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM testSurge_type", [], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

export const getAssetSurgeById = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM surge_arrester where id = ?", [id], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const relocateAsset = (asset) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE surge_arrester' +
            ' SET location_id=?, extend=?' +
            ' WHERE id=?',
            [asset.location_id, JSON.stringify(asset.extend), asset.id], (err) => {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const importAsset = (surge, location_id) => {
    const id = surge.id || newUuid()
    
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO surge_arrester(id, location_id,properties,ratings,config,extend)' +
            ' VALUES(?, ?, ?, ?, ?, ?)',
            [id, location_id,
                surge.properties, surge.ratings, surge.config, surge.extend
            ], function (err) {
                if (err) reject(err)
                resolve({
                    id : id,
                    success : true
                })
            })
    })
}

export const checkAssetNameExist = (location_id, serial_no) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM surge_arrester where location_id = ?',
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

export const updateSurgeImport = (surge) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE surge_arrester' +
            ' SET properties=?, ratings=?, config=?, extend=?' +
            ' WHERE id=?',
            [JSON.stringify(surge.properties), JSON.stringify(surge.ratings)
                , JSON.stringify(surge.config), JSON.stringify(surge.extend), surge.id], (err) => {
                if (err) reject(err)
                resolve({
                    success : true
                })
            })
    })
}

export const insertSurgeImport = (surge) => {
    const id = surge.id || newUuid()
    
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO surge_arrester(id, location_id,properties,ratings,config,extend)' +
            ' VALUES(?, ?, ?, ?, ?, ?)',
            [id, surge.location_id,
                JSON.stringify(surge.properties), JSON.stringify(surge.ratings), JSON.stringify(surge.config), JSON.stringify(surge.extend)
            ], function (err) {
                if (err) reject(err)
                resolve({
                    id : id,
                    success : true
                })
            })
    })
}