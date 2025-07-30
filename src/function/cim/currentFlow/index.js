import db from '../../datacontext/index'

export const getCurrentFlowById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM current_flow WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get current flow by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Current flow not found' })
            return resolve({ success: true, data: row, message: 'Get current flow by id completed' })
        })
    })
}

export const insertCurrentFlow = async (currentFlow) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO current_flow(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                currentFlow.mrid,
                currentFlow.multiplier,
                currentFlow.unit,
                currentFlow.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert current flow failed' })
                return resolve({ success: true, data: currentFlow, message: 'Insert current flow completed' })
            }
        )
    })
}

export const insertCurrentFlowTransaction = async (currentFlow, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO current_flow(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                currentFlow.mrid,
                currentFlow.multiplier,
                currentFlow.unit,
                currentFlow.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert current flow failed' })
                return resolve({ success: true, data: currentFlow, message: 'Insert current flow completed' })
            }
        )
    })
}

export const updateCurrentFlowById = async (mrid, currentFlow) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE current_flow
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [currentFlow.multiplier, currentFlow.unit, currentFlow.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update current flow failed' })
                return resolve({ success: true, data: currentFlow, message: 'Update current flow completed' })
            }
        )
    })
}

export const updateCurrentFlowByIdTransaction = async (mrid, currentFlow, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE current_flow
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [currentFlow.multiplier, currentFlow.unit, currentFlow.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update current flow failed' })
                return resolve({ success: true, data: currentFlow, message: 'Update current flow completed' })
            }
        )
    })
}

export const deleteCurrentFlowById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM current_flow WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete current flow failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Current flow not found' })
            return resolve({ success: true, data: null, message: 'Delete current flow completed' })
        })
    })
}

export const deleteCurrentFlowByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM current_flow WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete current flow failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Current flow not found' })
            return resolve({ success: true, data: null, message: 'Delete current flow completed' })
        })
    })
}