import db from '../../datacontext/index'
import * as IdentifiedObjectFunc from '../identifiedObject/index.js'

// Lấy thông tin assetInfo theo mrid
export const getAssetInfoById = async (mrid) => {
    try {
        const identifiedResult = await IdentifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedResult.success) {
            return { success: false, data: null, message: 'Identified object not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM asset_info WHERE mrid=?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err: err, message: 'Get assetInfo by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'AssetInfo not found' })
                const data = { ...identifiedResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get assetInfo by id completed' })
            })
        })
    } catch (err) {
        return { success: false, err: err, message: 'Get assetInfo by id failed' }
    }
}

// Thêm mới assetInfo
export const insertAssetInfo = async (info) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            IdentifiedObjectFunc.insertIdentifiedObjectTransaction(info, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `INSERT INTO asset_info(
                            mrid, manufacturer_type, product_asset_model
                        ) VALUES (?, ?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            manufacturer_type = excluded.manufacturer_type,
                            product_asset_model = excluded.product_asset_model
                        `,
                        [
                            info.mrid,
                            info.manufacturer_type,
                            info.product_asset_model
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err: err, message: 'Insert assetInfo failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: info, message: 'Insert assetInfo completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err: err, message: 'Insert assetInfo transaction failed' })
                })
        })
    })
}

// Transaction: Thêm mới assetInfo
export const insertAssetInfoTransaction = (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const identifiedResult = await IdentifiedObjectFunc.insertIdentifiedObjectTransaction(info, dbsql)
            if (!identifiedResult.success) {
                return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
            }
            dbsql.run(
                `INSERT INTO asset_info(
                    mrid, manufacturer_type, product_asset_model
                ) VALUES (?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    manufacturer_type = excluded.manufacturer_type,
                    product_asset_model = excluded.product_asset_model
                `,
                [
                    info.mrid,
                    info.manufacturer_type,
                    info.product_asset_model
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Insert assetInfo transaction failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert assetInfo transaction completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err: err, message: 'Insert assetInfo transaction failed' })
        }
    })
}

// Cập nhật assetInfo
export const updateAssetInfo = async (mrid, info) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            IdentifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, info, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `UPDATE asset_info SET
                            manufacturer_type = ?,
                            product_asset_model = ?
                        WHERE mrid = ?`,
                        [
                            info.manufacturer_type,
                            info.product_asset_model,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err: err, message: 'Update assetInfo failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: info, message: 'Update assetInfo completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err: err, message: 'Update assetInfo transaction failed' })
                })
        })
    })
}

// Transaction: Cập nhật assetInfo
export const updateAssetInfoTransaction = (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const identifiedResult = await IdentifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, info, dbsql)
            if (!identifiedResult.success) {
                return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
            }
            dbsql.run(
                `UPDATE asset_info SET
                    manufacturer_type = ?,
                    product_asset_model = ?
                WHERE mrid = ?`,
                [
                    info.manufacturer_type,
                    info.product_asset_model,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Update assetInfo transaction failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Update assetInfo transaction completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err: err, message: 'Update assetInfo transaction failed' })
        }
    })
}

// Xóa assetInfo theo mrid
export const deleteAssetInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        // Xóa asset_info TRƯỚC (vì nó reference đến identified_object)
        db.run("DELETE FROM asset_info WHERE mrid=?", [mrid], function (err) {
            if (err) {
                return reject({ success: false, err: err, message: 'Delete assetInfo failed' })
            }
            // Sau đó xóa identified_object
            IdentifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, db)
                .then(result => {
                    if (!result.success) {
                        return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                    }
                    return resolve({ success: true, data: mrid, message: 'Delete assetInfo completed' })
                })
                .catch(err => {
                    return reject({ success: false, err: err, message: 'Delete identified object failed' })
                })
        })
    })
}

// Transaction: Xóa assetInfo theo mrid
export const deleteAssetInfoByIdTransaction = (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        // Xóa asset_info TRƯỚC (vì nó reference đến identified_object)
        dbsql.run("DELETE FROM asset_info WHERE mrid=?", [mrid], function (err) {
            if (err) {
                return reject({ success: false, err: err, message: 'Delete assetInfo transaction failed' })
            }
            // Sau đó xóa identified_object
            IdentifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
                .then(result => {
                    if (!result.success) {
                        return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                    }
                    return resolve({ success: true, data: mrid, message: 'Delete assetInfo transaction completed' })
                })
                .catch(err => {
                    console.log(err);
                    return reject({ success: false, err: err, message: 'Delete identified object failed' })
                })
        })
    })
}