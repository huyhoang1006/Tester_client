import db from '../../datacontext/index'

export const getPositionPointById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM position_point WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get position point by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Position point not found' })
            return resolve({ success: true, data: row, message: 'Get position point by id completed' })
        })
    })
}

export const getPositionPointByLocationId = async (locationId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM position_point WHERE location=?", [locationId], (err, rows) => {
            if (err) return reject({ success: false, err: err, message: 'Get position point by location id failed' })
            if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'Position point not found' })
            return resolve({ success: true, data: rows, message: 'Get position point by location id completed' })
        })
    })
}

export const insertPositionPoint = async (positionPoint) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO position_point(mrid, group_number, sequence_number, x_position, y_position,
             z_position, location)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                group_number = excluded.group_number,
                sequence_number = excluded.sequence_number,
                x_position = excluded.x_position,
                y_position = excluded.y_position,
                z_position = excluded.z_position,
                location = excluded.location`,
            [
                positionPoint.mrid,
                positionPoint.group_number,
                positionPoint.sequence_number,
                positionPoint.x_position,
                positionPoint.y_position,
                positionPoint.z_position,
                positionPoint.location
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert position point failed' })
                return resolve({ success: true, data: positionPoint, message: 'Insert position point completed' })
            }
        )
    })
}

export const insertPositionPointArray = async (positionPoints) => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(positionPoints) || positionPoints.length === 0) {
            return reject({ success: false, message: 'Position points array is empty or invalid' })
        }

        db.serialize(() => {
            db.run("BEGIN TRANSACTION", (err) => {
                if (err) return reject({ success: false, err, message: 'Failed to begin transaction' })
            })

            let completedCount = 0
            let hasError = false
            const errors = []

            positionPoints.forEach((positionPoint, index) => {
                if (hasError) return

                db.run(
                    `INSERT INTO position_point(mrid, group_number, sequence_number, x_position, y_position,
                     z_position, location)
                     VALUES (?, ?, ?, ?, ?, ?, ?)
                     ON CONFLICT(mrid) DO UPDATE SET
                        group_number = excluded.group_number,
                        sequence_number = excluded.sequence_number,
                        x_position = excluded.x_position,
                        y_position = excluded.y_position,
                        z_position = excluded.z_position,
                        location = excluded.location`,
                    [
                        positionPoint.mrid,
                        positionPoint.group_number,
                        positionPoint.sequence_number,
                        positionPoint.x_position,
                        positionPoint.y_position,
                        positionPoint.z_position,
                        positionPoint.location
                    ],
                    function (err) {
                        if (err) {
                            hasError = true
                            errors.push({ index, error: err, mrid: positionPoint.mrid })
                            db.run("ROLLBACK", () => {
                                return reject({ 
                                    success: false, 
                                    err: errors, 
                                    message: `Insert position point array failed at index ${index}` 
                                })
                            })
                            return
                        }

                        completedCount++
                        if (completedCount === positionPoints.length) {
                            db.run("COMMIT", (err) => {
                                if (err) {
                                    return reject({ success: false, err, message: 'Failed to commit transaction' })
                                }
                                return resolve({ 
                                    success: true, 
                                    data: positionPoints, 
                                    message: `Insert ${positionPoints.length} position points completed` 
                                })
                            })
                        }
                    }
                )
            })
        })
    })
}


export const insertPositionPointArrayTransaction = async (positionPoints, locationId, dbsql) => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(positionPoints)) {
            return reject({ success: false, message: 'Invalid positionPoints input' });
        }

        dbsql.all(
            "SELECT mrid FROM position_point WHERE location = ?",
            [locationId],
            (err, rows) => {
                if (err) {
                    return reject({ success: false, err, message: 'Failed to fetch existing position points' });
                }

                const existingMrids = rows.map(row => row.mrid);
                const incomingMrids = positionPoints.map(pp => pp.mrid);

                // Xoá các bản ghi không còn trong mảng mới
                const mridsToDelete = existingMrids.filter(mrid => !incomingMrids.includes(mrid));
                for (const mrid of mridsToDelete) {
                    dbsql.run("DELETE FROM position_point WHERE mrid = ?", [mrid]);
                }

                let completedCount = 0;
                let hasError = false;
                const errors = [];

                if (positionPoints.length === 0) {
                    return resolve({ success: true, deleted: mridsToDelete, updated: [], inserted: [], message: 'Sync completed with only deletion' });
                }

                const inserted = [];
                const updated = [];

                positionPoints.forEach((pp, index) => {
                    dbsql.run(
                        `INSERT INTO position_point(mrid, group_number, sequence_number, x_position, y_position, z_position, location)
                         VALUES (?, ?, ?, ?, ?, ?, ?)
                         ON CONFLICT(mrid) DO UPDATE SET
                            group_number = excluded.group_number,
                            sequence_number = excluded.sequence_number,
                            x_position = excluded.x_position,
                            y_position = excluded.y_position,
                            z_position = excluded.z_position,
                            location = excluded.location`,
                        [
                            pp.mrid,
                            pp.group_number,
                            pp.sequence_number,
                            pp.x_position,
                            pp.y_position,
                            pp.z_position,
                            locationId
                        ],
                        function (err) {
                            if (err) {
                                hasError = true;
                                errors.push({ index, error: err, mrid: pp.mrid });
                                return reject({ success: false, err: errors, message: 'Insert/Update failed' });
                            }

                            if (existingMrids.includes(pp.mrid)) {
                                updated.push(pp.mrid);
                            } else {
                                inserted.push(pp.mrid);
                            }

                            completedCount++;
                            if (completedCount === positionPoints.length) {
                                return resolve({
                                    success: true,
                                    inserted,
                                    updated,
                                    deleted: mridsToDelete,
                                    message: `Sync completed: ${inserted.length} inserted, ${updated.length} updated, ${mridsToDelete.length} deleted`
                                });
                            }
                        }
                    );
                });
            }
        );
    });
};



export const updatePositionPointArrayByIdTransaction = async (positionPoints, dbsql) => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(positionPoints) || positionPoints.length === 0) {
            return reject({ success: false, message: 'Position points array is empty or invalid' })
        }

        let completedCount = 0
        let hasError = false
        const errors = []

        positionPoints.forEach((positionPoint, index) => {
            if (hasError) return

            dbsql.run(
                `UPDATE position_point SET
                    group_number = ?,
                    sequence_number = ?,
                    x_position = ?,
                    y_position = ?,
                    z_position = ?,
                    location = ?
                 WHERE mrid = ?`,
                [
                    positionPoint.group_number,
                    positionPoint.sequence_number,
                    positionPoint.x_position,
                    positionPoint.y_position,
                    positionPoint.z_position,
                    positionPoint.location,
                    positionPoint.mrid
                ],
                function (err) {
                    if (err) {
                        hasError = true
                        errors.push({ index, error: err, mrid: positionPoint.mrid })
                        return reject({ 
                            success: false, 
                            err: errors, 
                            message: `Update position point array by id failed at index ${index}` 
                        })
                    }

                    completedCount++
                    if (completedCount === positionPoints.length) {
                        return resolve({ 
                            success: true, 
                            data: positionPoints, 
                            message: `Update ${positionPoints.length} position points by id completed` 
                        })
                    }
                }
            )
        })
    })
}

export const updatePositionPointArrayById = async (positionPoints) => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(positionPoints) || positionPoints.length === 0) {
            return reject({ success: false, message: 'Position points array is empty or invalid' })
        }

        db.serialize(() => {
            db.run("BEGIN TRANSACTION", (err) => {
                if (err) return reject({ success: false, err, message: 'Failed to begin transaction' })
            })

            let completedCount = 0
            let hasError = false
            const errors = []

            positionPoints.forEach((positionPoint, index) => {
                if (hasError) return

                db.run(
                    `UPDATE position_point SET
                        group_number = ?,
                        sequence_number = ?,
                        x_position = ?,
                        y_position = ?,
                        z_position = ?,
                        location = ?
                     WHERE mrid = ?`,
                    [
                        positionPoint.group_number,
                        positionPoint.sequence_number,
                        positionPoint.x_position,
                        positionPoint.y_position,
                        positionPoint.z_position,
                        positionPoint.location,
                        positionPoint.mrid
                    ],
                    function (err) {
                        if (err) {
                            hasError = true
                            errors.push({ index, error: err, mrid: positionPoint.mrid })
                            db.run("ROLLBACK", () => {
                                return reject({ 
                                    success: false, 
                                    err: errors, 
                                    message: `Update position point array by id failed at index ${index}` 
                                })
                            })
                            return
                        }

                        completedCount++
                        if (completedCount === positionPoints.length) {
                            db.run("COMMIT", (err) => {
                                if (err) {
                                    return reject({ success: false, err, message: 'Failed to commit transaction' })
                                }
                                return resolve({ 
                                    success: true, 
                                    data: positionPoints, 
                                    message: `Update ${positionPoints.length} position points by id completed` 
                                })
                            })
                        }
                    }
                )
            })
        })
    })
}

export const deletePositionPointById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM position_point WHERE mrid = ?",
            [mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Delete position point by id failed' })
                return resolve({ success: true, data: mrid, message: 'Delete position point by id completed' })
            }
        )
    })
}

export const deletePositionPointByArrayMrid = async (mridArray) => {
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
                    "DELETE FROM position_point WHERE mrid = ?",
                    [mrid],
                    function (err) {
                        if (err) {
                            hasError = true
                            errors.push({ index, error: err, mrid })
                            db.run("ROLLBACK", () => {
                                return reject({
                                    success: false,
                                    err: errors,
                                    message: `Delete position point array by mrid failed at index ${index}`
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
                                    message: `Delete ${mridArray.length} position points by mrid completed`
                                })
                            })
                        }
                    }
                )
            })
        })
    })
}

export const deletePositionPointByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            "DELETE FROM position_point WHERE mrid = ?",
            [mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Delete position point by id failed' })
                return resolve({ success: true, data: mrid, message: 'Delete position point by id completed' })
            }
        )
    })
}

export const deletePositionPointByArrayMridTransaction = async (mridArray, dbsql) => {
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
                "DELETE FROM position_point WHERE mrid = ?",
                [mrid],
                function (err) {
                    if (err) {
                        hasError = true
                        errors.push({ index, error: err, mrid })
                        return reject({
                            success: false,
                            err: errors,
                            message: `Delete position point array by mrid failed at index ${index}`
                        })
                    }

                    completedCount++
                    if (completedCount === mridArray.length) {
                        return resolve({
                            success: true,
                            data: mridArray,
                            message: `Delete ${mridArray.length} position points by mrid completed`
                        })
                    }
                }
            )
        })
    })
}