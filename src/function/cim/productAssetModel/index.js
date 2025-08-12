import db from '../../datacontext/index'
import * as IdentifiedObjectFunc from '../identifiedObject/index.js'

// Lấy thông tin product asset model theo mrid
export const getProductAssetModelById = async (mrid) => {
    try {
        const identifiedResult = await IdentifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedResult.success) {
            return { success: false, data: null, message: 'Identified object not found' }
        }
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM product_asset_model WHERE mrid=?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err: err, message: 'Get product asset model by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'ProductAssetModel not found' })
                const data = { ...identifiedResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get product asset model by id completed' })
            })
        })
    } catch (err) {
        return { success: false, err: err, message: 'Get product asset model by id failed' }
    }
}

// Thêm mới product asset model
export const insertProductAssetModel = async (model) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            IdentifiedObjectFunc.insertIdentifiedObjectTransaction(model, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `INSERT INTO product_asset_model(
                            mrid, catalogue_number, manufacturer, corporate_standard_kind,
                            drawing_number, instruction_manual, model_number, model_version, overall_length,
                            style_number, weight_total
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            catalogue_number = excluded.catalogue_number,
                            manufacturer = excluded.manufacturer,
                            corporate_standard_kind = excluded.corporate_standard_kind,
                            drawing_number = excluded.drawing_number,
                            instruction_manual = excluded.instruction_manual,
                            model_number = excluded.model_number,
                            model_version = excluded.model_version,
                            overall_length = excluded.overall_length,
                            style_number = excluded.style_number,
                            weight_total = excluded.weight_total
                        `,
                        [
                            model.mrid,
                            model.catalogue_number,
                            model.manufacturer,
                            model.corporate_standard_kind,
                            model.drawing_number,
                            model.instruction_manual,
                            model.model_number,
                            model.model_version,
                            model.overall_length,
                            model.style_number,
                            model.weight_total
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err: err, message: 'Insert product asset model failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: model, message: 'Insert product asset model completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err: err, message: 'Insert product asset model transaction failed' })
                })
        })
    })
}

// Transaction: Thêm mới product asset model
export const insertProductAssetModelTransaction = (model, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const identifiedResult = await IdentifiedObjectFunc.insertIdentifiedObjectTransaction(model, dbsql)
            if (!identifiedResult.success) {
                return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
            }
            dbsql.run(
                `INSERT INTO product_asset_model(
                    mrid, catalogue_number, manufacturer, corporate_standard_kind,
                    drawing_number, instruction_manual, model_number, model_version, overall_length,
                    style_number, weight_total
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    catalogue_number = excluded.catalogue_number,
                    manufacturer = excluded.manufacturer,
                    corporate_standard_kind = excluded.corporate_standard_kind,
                    drawing_number = excluded.drawing_number,
                    instruction_manual = excluded.instruction_manual,
                    model_number = excluded.model_number,
                    model_version = excluded.model_version,
                    overall_length = excluded.overall_length,
                    style_number = excluded.style_number,
                    weight_total = excluded.weight_total
                `,
                [
                    model.mrid,
                    model.catalogue_number,
                    model.manufacturer,
                    model.corporate_standard_kind,
                    model.drawing_number,
                    model.instruction_manual,
                    model.model_number,
                    model.model_version,
                    model.overall_length,
                    model.style_number,
                    model.weight_total
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Insert product asset model transaction failed' })
                    }
                    return resolve({ success: true, data: model, message: 'Insert product asset model transaction completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err: err, message: 'Insert product asset model transaction failed' })
        }
    })
}

// Cập nhật product asset model
export const updateProductAssetModel = async (mrid, model) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            IdentifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, model, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `UPDATE product_asset_model SET
                            catalogue_number = ?,
                            manufacturer = ?,
                            corporate_standard_kind = ?,
                            drawing_number = ?,
                            instruction_manual = ?,
                            model_number = ?,
                            model_version = ?,
                            overall_length = ?,
                            style_number = ?,
                            weight_total = ?
                        WHERE mrid = ?`,
                        [
                            model.catalogue_number,
                            model.manufacturer,
                            model.corporate_standard_kind,
                            model.drawing_number,
                            model.instruction_manual,
                            model.model_number,
                            model.model_version,
                            model.overall_length,
                            model.style_number,
                            model.weight_total,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err: err, message: 'Update product asset model failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: model, message: 'Update product asset model completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err: err, message: 'Update product asset model transaction failed' })
                })
        })
    })
}

// Transaction: Cập nhật product asset model
export const updateProductAssetModelTransaction = (mrid, model, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const identifiedResult = await IdentifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, model, dbsql)
            if (!identifiedResult.success) {
                return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
            }
            dbsql.run(
                `UPDATE product_asset_model SET
                    catalogue_number = ?,
                    manufacturer = ?,
                    corporate_standard_kind = ?,
                    drawing_number = ?,
                    instruction_manual = ?,
                    model_number = ?,
                    model_version = ?,
                    overall_length = ?,
                    style_number = ?,
                    weight_total = ?
                WHERE mrid = ?`,
                [
                    model.catalogue_number,
                    model.manufacturer,
                    model.corporate_standard_kind,
                    model.drawing_number,
                    model.instruction_manual,
                    model.model_number,
                    model.model_version,
                    model.overall_length,
                    model.style_number,
                    model.weight_total,
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Update product asset model transaction failed' })
                    }
                    return resolve({ success: true, data: model, message: 'Update product asset model transaction completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err: err, message: 'Update product asset model transaction failed' })
        }
    })
}

// Xóa product asset model theo mrid
export const deleteProductAssetModelById = async (mrid) => {
    return new Promise((resolve, reject) => {
        IdentifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                }
                db.run("DELETE FROM product_asset_model WHERE mrid=?", [mrid], function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Delete product asset model failed' })
                    }
                    return resolve({ success: true, data: mrid, message: 'Delete product asset model completed' })
                })
            })
            .catch(err => {
                return reject({ success: false, err: err, message: 'Delete product asset model transaction failed' })
            })
    })
}

export const deleteProductAssetModelByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        IdentifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                }
                dbsql.run("DELETE FROM product_asset_model WHERE mrid=?", [mrid], function (err) {
                    if (err) {
                        return reject({ success: false, err: err, message: 'Delete product asset model failed' })
                    }
                    return resolve({ success: true, data: mrid, message: 'Delete product asset model completed' })
                })
            })
            .catch(err => {
                return reject({ success: false, err: err, message: 'Delete product asset model transaction failed' })
            })
    })
}

