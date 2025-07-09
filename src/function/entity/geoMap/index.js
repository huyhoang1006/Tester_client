import db from '../../datacontext/index'

export const getGeoMapById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM geo_map WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get geo map by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Geo map not found' })
            return resolve({ success: true, data: row, message: 'Get geo map by id completed' })
        })
    })
}

export const getGeoMapByOrganisationId = async (organisationId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM geo_map WHERE organisation_id=?", [organisationId], (err, rows) => {
            if (err) return reject({ success: false, err: err, message: 'Get geo map by organisation id failed' })
            if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'Geo map not found' })
            return resolve({ success: true, data: rows, message: 'Get geo map by organisation id completed' })
        })
    })
}

export const insertGeoMap = async (geoMap) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO geo_map(mrid, organisation_id, x, y, z)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                organisation_id = excluded.organisation_id,
                x = excluded.x,
                y = excluded.y,
                z = excluded.z`,
            [
                geoMap.mrid,
                geoMap.organisation_id,
                geoMap.x,
                geoMap.y,
                geoMap.z
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert geo map failed' })
                return resolve({ success: true, data: geoMap, message: 'Insert geo map completed' })
            }
        )
    })
}

export const insertGeoMapArray = async (geoMaps) => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(geoMaps) || geoMaps.length === 0) {
            return reject({ success: false, message: 'Geo maps array is empty or invalid' })
        }

        db.serialize(() => {
            db.run("BEGIN TRANSACTION", (err) => {
                if (err) return reject({ success: false, err, message: 'Failed to begin transaction' })
            })

            let completedCount = 0
            let hasError = false
            const errors = []

            geoMaps.forEach((geoMap, index) => {
                if (hasError) return

                db.run(
                    `INSERT INTO geo_map(mrid, organisation_id, x, y, z)
                     VALUES (?, ?, ?, ?, ?)
                     ON CONFLICT(mrid) DO UPDATE SET
                        organisation_id = excluded.organisation_id,
                        x = excluded.x,
                        y = excluded.y,
                        z = excluded.z`,
                    [
                        geoMap.mrid,
                        geoMap.organisation_id,
                        geoMap.x,
                        geoMap.y,
                        geoMap.z
                    ],
                    function (err) {
                        if (err) {
                            hasError = true
                            errors.push({ index, error: err, mrid: geoMap.mrid })
                            db.run("ROLLBACK", () => {
                                return reject({
                                    success: false,
                                    err: errors,
                                    message: `Insert geo map array failed at index ${index}`
                                })
                            })
                            return
                        }

                        completedCount++
                        if (completedCount === geoMaps.length) {
                            db.run("COMMIT", (err) => {
                                if (err) {
                                    return reject({ success: false, err, message: 'Failed to commit transaction' })
                                }
                                return resolve({
                                    success: true,
                                    data: geoMaps,
                                    message: `Insert ${geoMaps.length} geo maps completed`
                                })
                            })
                        }
                    }
                )
            })
        })
    })
}


export const insertGeoMapArrayTransaction = async (geoMaps, dbsql) => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(geoMaps) || geoMaps.length === 0) {
            return reject({ success: false, message: 'Geo maps array is empty or invalid' })
        }

        let completedCount = 0
        let hasError = false
        const errors = []

        geoMaps.forEach((geoMap, index) => {
            if (hasError) return

            dbsql.run(
                `INSERT INTO geo_map(mrid, organisation_id, x, y, z)
                 VALUES (?, ?, ?, ?, ?)
                 ON CONFLICT(mrid) DO UPDATE SET
                    organisation_id = excluded.organisation_id,
                    x = excluded.x,
                    y = excluded.y,
                    z = excluded.z`,
                [
                    geoMap.mrid,
                    geoMap.organisation_id,
                    geoMap.x,
                    geoMap.y,
                    geoMap.z
                ],
                function (err) {
                    if (err) {
                        hasError = true
                        errors.push({ index, error: err, mrid: geoMap.mrid })
                        return reject({
                            success: false,
                            err: errors,
                            message: `Insert geo map array failed at index ${index}`
                        })
                    }

                    completedCount++
                    if (completedCount === geoMaps.length) {
                        return resolve({
                            success: true,
                            data: geoMaps,
                            message: `Insert ${geoMaps.length} geo maps completed`
                        })
                    }
                }
            )
        })
    })
}

export const updateGeoMapArrayByIdTransaction = async (geoMaps, dbsql) => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(geoMaps) || geoMaps.length === 0) {
            return reject({ success: false, message: 'Geo maps array is empty or invalid' })
        }

        let completedCount = 0
        let hasError = false
        const errors = []

        geoMaps.forEach((geoMap, index) => {
            if (hasError) return

            dbsql.run(
                `UPDATE geo_map SET
                    organisation_id = ?,
                    z = ?,
                    y = ?,
                    x = ?
                 WHERE mrid = ?`,
                [
                    geoMap.organisation_id,
                    geoMap.z,
                    geoMap.y,
                    geoMap.x,
                    geoMap.mrid
                ],
                function (err) {
                    if (err) {
                        hasError = true
                        errors.push({ index, error: err, mrid: geoMap.mrid })
                        return reject({ 
                            success: false, 
                            err: errors, 
                            message: `Update position point array by id failed at index ${index}` 
                        })
                    }

                    completedCount++
                    if (completedCount === geoMaps.length) {
                        return resolve({ 
                            success: true, 
                            data: geoMaps, 
                            message: `Update ${geoMaps.length} geo maps by id completed` 
                        })
                    }
                }
            )
        })
    })
}

export const updateGeoMapArrayById = async (geoMaps) => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(geoMaps) || geoMaps.length === 0) {
            return reject({ success: false, message: 'Geo maps array is empty or invalid' })
        }

        db.serialize(() => {
            db.run("BEGIN TRANSACTION", (err) => {
                if (err) return reject({ success: false, err, message: 'Failed to begin transaction' })
            })

            let completedCount = 0
            let hasError = false
            const errors = []

            geoMaps.forEach((geoMap, index) => {
                if (hasError) return

                db.run(
                    `UPDATE geo_map SET
                        organisation_id = ?,
                        z = ?,
                        y = ?,
                        x = ?
                     WHERE mrid = ?`,
                    [
                        geoMap.organisation_id,
                        geoMap.z,
                        geoMap.y,
                        geoMap.x,
                        geoMap.mrid
                    ],
                    function (err) {
                        if (err) {
                            hasError = true
                            errors.push({ index, error: err, mrid: geoMap.mrid })
                            db.run("ROLLBACK", () => {
                                return reject({
                                    success: false,
                                    err: errors,
                                    message: `Update geo map array by id failed at index ${index}`
                                })
                            })
                            return
                        }

                        completedCount++
                        if (completedCount === geoMaps.length) {
                            db.run("COMMIT", (err) => {
                                if (err) {
                                    return reject({ success: false, err, message: 'Failed to commit transaction' })
                                }
                                return resolve({
                                    success: true,
                                    data: geoMaps,
                                    message: `Update ${geoMaps.length} geo maps by id completed`
                                })
                            })
                        }
                    }
                )
            })
        })
    })
}

export const deleteGeoMapById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM geo_map WHERE mrid = ?",
            [mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Delete geo map by id failed' })
                return resolve({ success: true, data: mrid, message: 'Delete geo map by id completed' })
            }
        )
    })
}

export const deleteGeoMapByArrayMrid = async (mridArray) => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(mridArray) || mridArray.length === 0) {
            return reject({ success: false, message: 'Mrid array is empty or invalid' })
        }

        db.serialize(() => {
            db.run("BEGIN TRANSACTION", (err) => {
                if (err) return reject({ success: false, err, message: 'Failed to begin transaction' })
            })

            let completedCount = 0
            let hasError = false
            const errors = []

            mridArray.forEach((mrid, index) => {
                if (hasError) return

                db.run(
                    "DELETE FROM geo_map WHERE mrid = ?",
                    [mrid],
                    function (err) {
                        if (err) {
                            hasError = true
                            errors.push({ index, error: err, mrid })
                            db.run("ROLLBACK", () => {
                                return reject({
                                    success: false,
                                    err: errors,
                                    message: `Delete geo map array by mrid failed at index ${index}`
                                })
                            })
                            return
                        }

                        completedCount++
                        if (completedCount === mridArray.length) {
                            db.run("COMMIT", (err) => {
                                if (err) {
                                    return reject({ success: false, err, message: 'Failed to commit transaction' })
                                }
                                return resolve({
                                    success: true,
                                    data: mridArray,
                                    message: `Delete ${mridArray.length} geo maps by mrid completed`
                                })
                            })
                        }
                    }
                )
            })
        })
    })
}

export const deleteGeoMapByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            "DELETE FROM geo_map WHERE mrid = ?",
            [mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Delete geo map by id failed' })
                return resolve({ success: true, data: mrid, message: 'Delete geo map by id completed' })
            }
        )
    })
}

export const deleteGeoMapByArrayMridTransaction = async (mridArray, dbsql) => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(mridArray) || mridArray.length === 0) {
            return reject({ success: false, message: 'Mrid array is empty or invalid' })
        }

        let completedCount = 0
        let hasError = false
        const errors = []

        mridArray.forEach((mrid, index) => {
            if (hasError) return

            dbsql.run(
                "DELETE FROM geo_map WHERE mrid = ?",
                [mrid],
                function (err) {
                    if (err) {
                        hasError = true
                        errors.push({ index, error: err, mrid })
                        return reject({
                            success: false,
                            err: errors,
                            message: `Delete geo map array by mrid failed at index ${index}`
                        })
                    }

                    completedCount++
                    if (completedCount === mridArray.length) {
                        return resolve({
                            success: true,
                            data: mridArray,
                            message: `Delete ${mridArray.length} geo maps by mrid completed`
                        })
                    }
                }
            )
        })
    })
}