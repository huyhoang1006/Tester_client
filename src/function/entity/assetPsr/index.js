import db from '../../datacontext/index'

// Lấy thông tin assetPsr theo mrid
export const getAssetPsrById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM asset_psr WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get assetPsr by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'AssetPsr not found' })
            return resolve({ success: true, data: row, message: 'Get assetPsr by id completed' })
        })
    })
}

export const getAssetPsrByAssetIdAndPsrId = async (assetId, psrId) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM asset_psr WHERE asset_id=? AND psr_id=?", [assetId, psrId], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get assetPsr by assetId and psrId failed' })
            if (!row) return resolve({ success: false, data: null, message: 'AssetPsr not found' })
            return resolve({ success: true, data: row, message: 'Get assetPsr by assetId completed' })
        })
    })
}

// Thêm mới assetPsr
export const insertAssetPsr = async (data) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            db.run(
                `INSERT INTO asset_psr(
                    mrid, asset_id, psr_id
                ) VALUES (?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    asset_id = excluded.asset_id,
                    psr_id = excluded.psr_id
                `,
                [
                    data.mrid,
                    data.asset_id,
                    data.psr_id
                ],
                function (err) {
                    if (err) {
                        db.run('ROLLBACK')
                        return reject({ success: false, err: err, message: 'Insert assetPsr failed' })
                    }
                    db.run('COMMIT')
                    return resolve({ success: true, data: data, message: 'Insert assetPsr completed' })
                }
            )
        })
    })
}

// Transaction: Thêm mới assetPsr
export const insertAssetPsrTransaction = (data, dbsql) => {
    return new Promise((resolve, reject) => {
        // Validate required fields
        if (!data || !data.mrid || !data.asset_id || !data.psr_id) {
            return reject({ 
                success: false, 
                err: new Error('Missing required fields: mrid, asset_id, or psr_id'), 
                message: 'Insert assetPsr transaction failed - missing required fields' 
            })
        }
        
        dbsql.run(
            `INSERT INTO asset_psr(
                mrid, asset_id, psr_id
            ) VALUES (?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                asset_id = excluded.asset_id,
                psr_id = excluded.psr_id
            `,
            [
                data.mrid,
                data.asset_id,
                data.psr_id
            ],
            function (err) {
                if (err) {
                    console.error('AssetPsr insert error:', err)
                    console.error('AssetPsr data:', data)
                    return reject({ success: false, err: err, message: 'Insert assetPsr transaction failed' })
                }
                return resolve({ success: true, data: data, message: 'Insert assetPsr transaction completed' })
            }
        )
    })
}

// Cập nhật assetPsr
export const updateAssetPsr = async (mrid, data) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            db.run(
                `UPDATE asset_psr SET
                    asset_id = ?,
                    psr_id = ?
                WHERE mrid = ?`,
                [
                    data.asset_id,
                    data.psr_id,
                    mrid
                ],
                function (err) {
                    if (err) {
                        db.run('ROLLBACK')
                        return reject({ success: false, err: err, message: 'Update assetPsr failed' })
                    }
                    db.run('COMMIT')
                    return resolve({ success: true, data: data, message: 'Update assetPsr completed' })
                }
            )
        })
    })
}

// Transaction: Cập nhật assetPsr
export const updateAssetPsrTransaction = (mrid, data, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE asset_psr SET
                asset_id = ?,
                psr_id = ?
            WHERE mrid = ?`,
            [
                data.asset_id,
                data.psr_id,
                mrid
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err: err, message: 'Update assetPsr transaction failed' })
                }
                return resolve({ success: true, data: data, message: 'Update assetPsr transaction completed' })
            }
        )
    })
}

// Xóa assetPsr theo mrid
export const deleteAssetPsrById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM asset_psr WHERE mrid=?", [mrid], function (err) {
            if (err) {
                return reject({ success: false, err: err, message: 'Delete assetPsr failed' })
            }
            return resolve({ success: true, data: mrid, message: 'Delete assetPsr completed' })
        })
    })
}

// Transaction: Xóa assetPsr
export const deleteAssetPsrTransaction = (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM asset_psr WHERE mrid=?", [mrid], function (err) {
            if (err) {
                return reject({ success: false, err: err, message: 'Delete assetPsr transaction failed' })
            }
            return resolve({ success: true, data: mrid, message: 'Delete assetPsr transaction completed' })
        })
    })
}