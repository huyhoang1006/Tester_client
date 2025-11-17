import { v4 as newUuid } from 'uuid'
import { NIL as EMPTY } from 'uuid'
import db from '../datacontext/index'

export const insertCircuit = (location_id, asset) => {
    const id = asset.circuit.id || newUuid()

    return new Promise((resolve, reject) => {
        db.run('INSERT INTO circuit_breaker(id, location_id,properties,circuitBreaker,ratings,contactSys,others,operating,assessmentLimits,extend)' +
            ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, location_id,
                JSON.stringify(asset.circuit.properties), JSON.stringify(asset.circuit.circuitBreaker), JSON.stringify(asset.circuit.ratings), JSON.stringify(asset.circuit.contactSys),
                JSON.stringify(asset.circuit.others), JSON.stringify(asset.operating), JSON.stringify(asset.assessmentLimits), JSON.stringify(asset.extend)
            ], function (err) {
                if (err) reject(err)
                resolve({
                    id: id,
                    success: true
                })
            })
    })
}

export const getCircuitByLocationId = (location_id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM circuit_breaker where location_id=?", [location_id], (err, rows) => {
            if (err) reject(err)
            resolve({
                success: true,
                data: rows
            })
        })
    })
}

export const getCircuitId = (id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM circuit_breaker where id=?", [id], (err, rows) => {
            if (err) reject(err)
            resolve({
                success: true,
                data: rows
            })
        })
    })
}

export const deleteCircuit = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM circuit_breaker WHERE id = ?", [id], (err) => {
            if (err) reject(err)
            resolve(true)
        })
    })
}

export const updateCircuit = (asset) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE circuit_breaker' +
            ' SET properties=?, circuitBreaker=?, ratings=?, contactSys=?, others=?, operating=?, assessmentLimits=?, extend=?' +
            ' WHERE id=?',
            [JSON.stringify(asset.circuit.properties), JSON.stringify(asset.circuit.circuitBreaker), JSON.stringify(asset.circuit.ratings)
                , JSON.stringify(asset.circuit.contactSys), JSON.stringify(asset.circuit.others), JSON.stringify(asset.operating)
                , JSON.stringify(asset.assessmentLimits), JSON.stringify(asset.extend), asset.circuit.id], (err) => {
                    if (err) reject(err)
                    resolve({
                        success: true
                    })
                })
    })
}

export const updateCircuitAssessmentLimits = (asset) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE circuit_breaker' +
            ' SET assessmentLimits=?' +
            ' WHERE id=?',
            [JSON.stringify(asset.assessmentLimits), asset.id], (err) => {
                if (err) reject(err)
                resolve({
                    success: true
                })
            })
    })
}

export const getTestCircuitTypes = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM testCircuit_type", [], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

export const getAssetById = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM circuit_breaker where id = ?", [id], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const relocateAsset = (asset) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE circuit_breaker' +
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
        db.all('SELECT * FROM circuit_breaker where location_id = ?',
            [location_id], (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    if (rows.length != 0) {
                        let id = ''
                        for (let i in rows) {
                            let properties = JSON.parse(rows[i].properties)
                            if (properties.serial_no == serial_no) {
                                id = rows[i].id
                            }
                            break
                        }
                        if (id == '') {
                            resolve(
                                {
                                    exist: false,
                                }
                            )
                        }
                        else {
                            resolve(
                                {
                                    exist: true,
                                    id: id
                                }
                            )
                        }
                    } else {
                        resolve(
                            {
                                exist: false,
                            }
                        )
                    }
                }
            })
    })
}

export const updateCircuitImport = (circuit) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE circuit_breaker' +
            ' SET properties=?, circuitBreaker=?, ratings=?, contactSys=?, others=?, operating=?, assessmentLimits=?, extend=?' +
            ' WHERE id=?',
            [JSON.stringify(circuit.properties), JSON.stringify(circuit.circuitBreaker), JSON.stringify(circuit.ratings)
                , JSON.stringify(circuit.contactSys), JSON.stringify(circuit.others), JSON.stringify(circuit.operating)
                , JSON.stringify(circuit.assessmentLimits), JSON.stringify(circuit.extend), circuit.id], (err) => {
                    if (err) reject(err)
                    resolve({
                        success: true
                    })
                })
    })
}

export const insertCircuitImport = (circuit) => {
    const id = circuit.id || newUuid()

    return new Promise((resolve, reject) => {
        db.run('INSERT INTO circuit_breaker(id, location_id,properties,circuitBreaker,ratings,contactSys,others,operating,assessmentLimits,extend)' +
            ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, circuit.location_id,
                JSON.stringify(circuit.properties), JSON.stringify(circuit.circuitBreaker), JSON.stringify(circuit.ratings), JSON.stringify(circuit.contactSys),
                JSON.stringify(circuit.others), JSON.stringify(circuit.operating), JSON.stringify(circuit.assessmentLimits), JSON.stringify(circuit.extend)
            ], function (err) {
                if (err) reject(err)
                resolve({
                    id: id,
                    success: true
                })
            })
    })
}

export const importAsset = (circuit, location_id) => {
    const id = circuit.id || newUuid()

    return new Promise((resolve, reject) => {
        db.run('INSERT INTO circuit_breaker(id, location_id,properties,circuitBreaker,ratings,contactSys,others,operating,assessmentLimits,extend)' +
            ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id,
                location_id,
                circuit.properties,
                circuit.circuitBreaker,
                circuit.ratings,
                circuit.contactSys,
                circuit.others,
                circuit.operating,
                circuit.assessmentLimits,
                circuit.extend
            ], function (err) {
                if (err) reject(err)
                resolve({
                    id: id,
                    success: true
                })
            })
    })
}
