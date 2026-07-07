import db from '../../datacontext/index'
import { insertAssetTransaction, getAssetById, deleteAssetByIdTransaction } from '@/function/cim/asset'
import { insertProductAssetModelTransaction, getProductAssetModelById } from '@/function/cim/productAssetModel'
import { insertLifecycleDateTransaction, getLifecycleDateById } from '@/function/cim/lifecycleDate'
import {
    insertSoftwareLicenseTransaction,
    getSoftwareLicenseById
} from '@/function/entity/softwareLicense'
import {
    insertSoftwareLicenseTestingEquipmentTransaction,
    getSoftwareLicenseByTestingEquipmentId,
    deleteSoftwareLicenseTestingEquipmentTransaction,
    deleteSoftwareLicenseTestingEquipmentByTestingEquipmentIdTransaction
} from '@/function/entity/softwareLicenseTestingEquipment'
import {
    insertCalibrationRecordTransaction,
    getCalibrationRecordByTestingEquipmentId,
    deleteCalibrationRecordByIdTransaction
} from '@/function/entity/calibrationRecord'
import {
    insertAccessoryTestingEquipmentTransaction,
    getAccessoriesByEquipmentId,
    getAccessoryDetailsByEquipmentId,
    deleteAccessoryTestingEquipmentTransaction,
    deleteAccessoryTestingEquipmentByEquipmentIdTransaction
} from '@/function/entity/accessoryTestingEquipment'
import {
    insertActivityRecordTransaction,
    getActivityRecordByAssetId,
    deleteActivityRecordByIdTransaction
} from '@/function/cim/activityRecord'
import {
    uploadAttachmentTransaction,
    getAttachmentByForeignIdAndType
} from '@/function/entity/attachment'
import {
    insertUserIdentifiedObjectTransaction,
    getUserIdentifiedObjectByIdentifiedObjectId
} from '@/function/entity/userIdentifiedObject'
import { insertUserTransaction } from '@/function/entity/user'

// Chạy 1 câu lệnh SQL trực tiếp trên connection chính (dùng cho BEGIN/COMMIT/ROLLBACK)
const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err)
            else resolve()
        })
    })
}

// Danh sách rút gọn cho màn hình list (join asset + product_asset_model + đếm repair).
// Lọc theo user hiện tại qua user_identified_object; loại phụ kiện.
export const getAllTestingEquipmentList = async (userId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT te.mrid AS mrid,
                    io.name AS name,
                    a.serial_number AS serial,
                    pam.manufacturer AS manufacturer,
                    pam.model_number AS model,
                    te.asset_tag AS asset_tag,
                    (SELECT cr.calibration_date FROM calibration_record cr
                     WHERE cr.testing_equipment = te.mrid
                     ORDER BY substr(cr.calibration_date,7,4)||substr(cr.calibration_date,1,2)||substr(cr.calibration_date,4,2) DESC
                     LIMIT 1) AS calibration_date,
                    te.is_accessory AS is_accessory,
                    (SELECT COUNT(*) FROM activity_record ar
                     WHERE ar.asset = te.mrid AND ar.type = 'Repair') AS repair_count
             FROM testing_equipment te
             JOIN asset a ON a.mrid = te.mrid
             LEFT JOIN identified_object io ON io.mrid = te.mrid
             LEFT JOIN product_asset_model pam ON pam.mrid = a.product_asset_model
             WHERE
                -- máy chính thuộc user
                te.mrid IN (SELECT identified_object_id FROM user_identified_object WHERE user_id = ?)
                -- hoặc là phụ kiện của máy chính thuộc user (qua junction)
                OR te.mrid IN (
                    SELECT x.accessory FROM accessory_testing_equipment x
                    WHERE x.equipment IN (
                        SELECT identified_object_id FROM user_identified_object WHERE user_id = ?
                    )
                )
             ORDER BY COALESCE(te.is_accessory, 0), io.name`,
            [userId, userId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get testing equipment list failed' })
                return resolve({ success: true, data: rows || [], message: 'Get testing equipment list completed' })
            }
        )
    })
}

// Kho phụ kiện: các testing_equipment được đánh dấu is_accessory = 1 (cho bảng chọn khi Add accessory)
export const getAllAccessories = async () => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT te.mrid AS mrid,
                    io.name AS name,
                    io.description AS description,
                    a.serial_number AS serial_no,
                    a.product_asset_model AS product_asset_model,
                    pam.model_number AS model
             FROM testing_equipment te
             JOIN asset a ON a.mrid = te.mrid
             LEFT JOIN identified_object io ON io.mrid = te.mrid
             LEFT JOIN product_asset_model pam ON pam.mrid = a.product_asset_model
             WHERE te.is_accessory = 1
             ORDER BY io.name`,
            [],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get accessories pool failed' })
                return resolve({ success: true, data: rows || [], message: 'Get accessories pool completed' })
            }
        )
    })
}

// Lấy testingEquipment theo mrid
export const getTestingEquipmentById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM testing_equipment WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get testingEquipment by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'TestingEquipment not found' })
                return resolve({ success: true, data: row, message: 'Get testingEquipment by id completed' })
            }
        )
    })
}

export const getTestingEquipmentByWorkId = async (workId) => {
    return new Promise((resolve, reject) => {
        // JOIN để lấy lại model/serial/calibration cho JobView
        // (các cột này đã chuyển sang asset/identified_object/product_asset_model/calibration_record)
        db.all(
            `SELECT te.*,
                    COALESCE(pam.model_number, io.name) AS model,
                    a.serial_number AS serial_number,
                    (SELECT cr.calibration_date FROM calibration_record cr
                     WHERE cr.testing_equipment = te.mrid
                     ORDER BY substr(cr.calibration_date,7,4)||substr(cr.calibration_date,1,2)||substr(cr.calibration_date,4,2) DESC
                     LIMIT 1) AS calibration_date
             FROM testing_equipment te
             JOIN asset a ON a.mrid = te.mrid
             LEFT JOIN identified_object io ON io.mrid = te.mrid
             LEFT JOIN product_asset_model pam ON pam.mrid = a.product_asset_model
             WHERE te.work_id=?`,
            [workId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get testingEquipment by workId failed' })
                if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'TestingEquipment not found' })
                return resolve({ success: true, data: rows, message: 'Get testingEquipment by workId completed' })
            }
        )
    })
}

// Thêm mới testingEquipment
export const insertTestingEquipmentTransaction = async (testingEquipment, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO testing_equipment(
                mrid, work_id, asset_tag, is_accessory
            ) VALUES (?, ?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                work_id = excluded.work_id,
                asset_tag = excluded.asset_tag,
                is_accessory = excluded.is_accessory
            `,
            [
                testingEquipment.mrid,
                testingEquipment.work_id,
                testingEquipment.asset_tag,
                testingEquipment.is_accessory != null ? testingEquipment.is_accessory : 0
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert testingEquipment failed' })
                return resolve({ success: true, data: testingEquipment, message: 'Insert testingEquipment completed' })
            }
        )
    })
}

// Đảm bảo asset nền tồn tại (FK: testing_equipment.mrid -> asset.mrid).
// Dùng cho luồng save job: equipment gõ tay chưa có trong kho -> tạo asset tối thiểu,
// equipment chọn từ kho -> ON CONFLICT DO NOTHING, không đụng data manager.
export const ensureTestingEquipmentAssetTransaction = async (equipment, dbsql) => {
    const runOne = (sql, params) => new Promise((resolve, reject) => {
        dbsql.run(sql, params, function (err) {
            if (err) return reject({ success: false, err, message: 'Ensure asset for testingEquipment failed' })
            return resolve()
        })
    })
    // Thứ tự FK: identified_object -> asset (asset.mrid FK -> identified_object.mrid)
    await runOne(
        `INSERT INTO identified_object(mrid, name) VALUES (?, ?)
         ON CONFLICT(mrid) DO NOTHING`,
        [equipment.mrid, equipment.model || null]
    )
    await runOne(
        `INSERT INTO asset(mrid, serial_number) VALUES (?, ?)
         ON CONFLICT(mrid) DO NOTHING`,
        [equipment.mrid, equipment.serial_number || null]
    )
    return { success: true, data: equipment, message: 'Ensure asset for testingEquipment completed' }
}

// calibration_date của form job -> calibration_record (cột trong testing_equipment đã bị bỏ).
// PHẢI gọi SAU insertTestingEquipmentTransaction (FK: calibration_record.testing_equipment -> testing_equipment.mrid).
// mrid định danh '<te>-jobcal' để save nhiều lần không nhân bản; bỏ qua nếu đã có record trùng ngày.
export const persistJobCalibrationTransaction = async (equipment, dbsql) => {
    if (!equipment.calibration_date) return { success: true, data: null, message: 'No calibration date to persist' }
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO calibration_record(mrid, testing_equipment, calibration_date)
             SELECT ?, ?, ?
             WHERE NOT EXISTS (
                SELECT 1 FROM calibration_record WHERE testing_equipment = ? AND calibration_date = ?
             )
             ON CONFLICT(mrid) DO UPDATE SET calibration_date = excluded.calibration_date`,
            [
                `${equipment.mrid}-jobcal`, equipment.mrid, equipment.calibration_date,
                equipment.mrid, equipment.calibration_date
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Persist job calibration failed' })
                return resolve({ success: true, data: equipment, message: 'Persist job calibration completed' })
            }
        )
    })
}

// Gỡ equipment khỏi work (không xóa bản ghi — equipment có thể là máy trong kho manager)
export const unlinkTestingEquipmentFromWorkTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE testing_equipment SET work_id = NULL WHERE mrid = ?`,
            [mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Unlink testingEquipment from work failed' })
                return resolve({ success: true, data: null, message: 'Unlink testingEquipment from work completed' })
            }
        )
    })
}

// Cập nhật testingEquipment
export const updateTestingEquipmentByIdTransaction = async (mrid, testingEquipment, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE testing_equipment SET
                asset_tag = ?, work_id = ?, is_accessory = ?
            WHERE mrid = ?`,
            [
                testingEquipment.asset_tag,
                testingEquipment.work_id,
                testingEquipment.is_accessory != null ? testingEquipment.is_accessory : 0,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update testingEquipment failed' })
                return resolve({ success: true, data: testingEquipment, message: 'Update testingEquipment completed' })
            }
        )
    })
}

// Xóa testingEquipment
export const deleteTestingEquipmentByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM testing_equipment WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete testingEquipment failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'TestingEquipment not found' })
            return resolve({ success: true, data: null, message: 'Delete testingEquipment completed' })
        })
    })
}

/* =========================================================================
 * FULL ENTITY (gom tất cả thông tin của 1 testing equipment)
 *
 * entity = {
 *   asset:            {...},   // bản ghi cim asset (asset.mrid === testingEquipment.mrid)
 *   testingEquipment: { mrid, work_id, asset_tag },
 *   softwareLicenses: [ { mrid, option_name, ... } ],          // n-n qua software_license_testing_equipment
 *   calibrations:     [ { mrid, testing_equipment, ... } ],    // 1-n calibration_record
 *   repairs:          [ { mrid, reason, status, provider, cost, ... } ], // 1-n activity_record (type='Repair', asset=mrid)
 *   accessories:      [ { equipment, accessory } ]             // n-n accessory_testing_equipment (accessory = mrid của TE phụ kiện)
 * }
 * old_entity: trạng thái cũ (cùng shape) để tính phần cần xóa. Truyền {} khi tạo mới.
 * ========================================================================= */

// Tạo mới / cập nhật toàn bộ thông tin của 1 testing equipment trong 1 transaction
export const insertTestingEquipmentEntity = async (old_entity, entity) => {
    try {
        const teMrid = entity.testingEquipment && entity.testingEquipment.mrid
        if (!teMrid) {
            return { success: false, error: new Error('MRID is required for testing equipment entity'), message: '' }
        }

        old_entity = old_entity || {}
        const oldLicenses     = old_entity.softwareLicenses || []
        const oldCalibrations = old_entity.calibrations || []
        const oldRepairs      = old_entity.repairs || []
        const oldAccessories  = old_entity.accessories || []

        await runAsync('BEGIN TRANSACTION')

        // 0a) đảm bảo user tồn tại trong bảng user (FK cho user_identified_object)
        if (entity.user && entity.user.user_id) {
            await insertUserTransaction(entity.user, db)
        }

        // 0) product_asset_model + lifecycle_date (asset tham chiếu FK tới 2 bảng này -> insert trước)
        if (entity.lifecycleDate && entity.lifecycleDate.mrid) {
            await insertLifecycleDateTransaction(entity.lifecycleDate, db)
            entity.asset.lifecycle_date = entity.lifecycleDate.mrid
        }
        if (entity.productAssetModel && entity.productAssetModel.mrid) {
            await insertProductAssetModelTransaction(entity.productAssetModel, db)
            entity.asset.product_asset_model = entity.productAssetModel.mrid
        }

        // 1) asset (nền) — nếu vướng FK location thì thử lại với location = null
        let assetResult = await insertAssetTransaction(entity.asset, db)
        if (!assetResult.success && assetResult.err && assetResult.err.code === 'SQLITE_CONSTRAINT') {
            entity.asset.location = null
            assetResult = await insertAssetTransaction(entity.asset, db)
        }
        if (!assetResult.success) {
            throw new Error(`Insert asset failed: ${assetResult.message}`)
        }

        // 2) testing_equipment
        await insertTestingEquipmentTransaction(entity.testingEquipment, db)

        // 3) software licenses (n-n): upsert license + đảm bảo có link; link cũ bị bỏ thì xóa link
        const newLicenseIds = (entity.softwareLicenses || []).map(l => l.mrid).filter(Boolean)
        for (const lic of (entity.softwareLicenses || [])) {
            if (!lic.mrid) continue
            await insertSoftwareLicenseTransaction(lic, db)
            await insertSoftwareLicenseTestingEquipmentTransaction(
                { software_license: lic.mrid, testing_equipment: teMrid }, db
            )
        }
        for (const oldLic of oldLicenses) {
            if (oldLic.mrid && !newLicenseIds.includes(oldLic.mrid)) {
                // chỉ gỡ liên kết, không xóa hẳn license (có thể đang dùng chung máy khác)
                await deleteSoftwareLicenseTestingEquipmentTransaction(oldLic.mrid, teMrid, db)
            }
        }

        // 4) calibration records (1-n): upsert; bản ghi cũ bị bỏ thì xóa hẳn
        const newCalibIds = (entity.calibrations || []).map(c => c.mrid).filter(Boolean)
        for (const cal of (entity.calibrations || [])) {
            if (!cal.mrid) continue
            cal.testing_equipment = teMrid
            await insertCalibrationRecordTransaction(cal, db)
        }
        for (const oldCal of oldCalibrations) {
            if (oldCal.mrid && !newCalibIds.includes(oldCal.mrid)) {
                await deleteCalibrationRecordByIdTransaction(oldCal.mrid, db)
            }
        }

        // 5) repairs (activity_record type='Repair', 1-n theo asset); insert tự lo identified_object cha
        const newRepairIds = (entity.repairs || []).map(r => r.mrid).filter(Boolean)
        for (const rep of (entity.repairs || [])) {
            if (!rep.mrid) continue
            rep.type = 'Repair'
            rep.asset = teMrid
            await insertActivityRecordTransaction(rep, db)
        }
        for (const oldRep of oldRepairs) {
            if (oldRep.mrid && !newRepairIds.includes(oldRep.mrid)) {
                await deleteActivityRecordByIdTransaction(oldRep.mrid, db)
            }
        }

        // 6) accessories (n-n): mỗi phụ kiện là 1 testing_equipment con (asset) + link
        const newAccIds = (entity.accessories || []).map(a => a.asset && a.asset.mrid).filter(Boolean)
        for (const acc of (entity.accessories || [])) {
            if (!acc.asset || !acc.asset.mrid) continue
            // 6a) model -> product_asset_model (nếu có)
            if (acc.productAssetModel && acc.productAssetModel.mrid && acc.productAssetModel.model_number) {
                await insertProductAssetModelTransaction(acc.productAssetModel, db)
                acc.asset.product_asset_model = acc.productAssetModel.mrid
            } else {
                acc.asset.product_asset_model = null
            }
            // 6b) asset (+ identified_object) của phụ kiện
            await insertAssetTransaction(acc.asset, db)
            // 6c) testing_equipment con
            await insertTestingEquipmentTransaction(acc.testingEquipment, db)
            // 6d) link n-n
            await insertAccessoryTestingEquipmentTransaction({ equipment: teMrid, accessory: acc.asset.mrid }, db)
            // 6e) gán phụ kiện cho user (để hiện trong list của user)
            if (acc.userIdentifiedObject && acc.userIdentifiedObject.mrid && acc.userIdentifiedObject.user_id) {
                acc.userIdentifiedObject.identified_object_id = acc.asset.mrid
                await insertUserIdentifiedObjectTransaction(acc.userIdentifiedObject, db)
            }
        }
        // gỡ link phụ kiện bị bỏ (giữ nguyên asset vì có thể dùng chung máy khác)
        for (const oldAcc of oldAccessories) {
            const oldMrid = oldAcc.asset ? oldAcc.asset.mrid : (oldAcc.mrid || oldAcc.accessory)
            if (oldMrid && !newAccIds.includes(oldMrid)) {
                await deleteAccessoryTestingEquipmentTransaction(teMrid, oldMrid, db)
            }
        }

        // 7) attachment (1 record, path = JSON danh sách file [{path}])
        if (entity.attachment && entity.attachment.id) {
            entity.attachment.id_foreign = teMrid
            entity.attachment.type = 'asset'
            await uploadAttachmentTransaction(entity.attachment, db)
        }

        // 8) user link (user_identified_object): gán thiết bị cho user hiện tại
        if (entity.userIdentifiedObject && entity.userIdentifiedObject.mrid && entity.userIdentifiedObject.user_id) {
            entity.userIdentifiedObject.identified_object_id = teMrid
            await insertUserIdentifiedObjectTransaction(entity.userIdentifiedObject, db)
        }

        await runAsync('COMMIT')
        return { success: true, data: entity, message: 'Testing equipment entity saved successfully' }
    } catch (error) {
        await runAsync('ROLLBACK')
        console.error('Error in insertTestingEquipmentEntity:', error)
        return { success: false, error, message: `Error saving testing equipment entity: ${error.message || 'Unknown error'}` }
    }
}

// Lấy toàn bộ thông tin của 1 testing equipment theo mrid
export const getTestingEquipmentEntity = async (mrid) => {
    try {
        if (!mrid) return { success: false, error: new Error('Invalid ID') }

        const entity = {
            asset: null,
            productAssetModel: null,
            lifecycleDate: null,
            testingEquipment: null,
            attachment: null,
            userIdentifiedObject: null,
            softwareLicenses: [],
            calibrations: [],
            repairs: [],
            accessories: []
        }

        const assetRes = await getAssetById(mrid)
        if (!assetRes.success) {
            return { success: false, error: assetRes.err || new Error('Asset not found'), message: `Asset ${mrid} not found` }
        }
        entity.asset = assetRes.data

        // product_asset_model + lifecycle_date (theo FK trên asset)
        if (entity.asset.product_asset_model) {
            const pamRes = await getProductAssetModelById(entity.asset.product_asset_model)
            if (pamRes.success && pamRes.data) entity.productAssetModel = pamRes.data
        }
        if (entity.asset.lifecycle_date) {
            const lcRes = await getLifecycleDateById(entity.asset.lifecycle_date)
            if (lcRes.success && lcRes.data) entity.lifecycleDate = lcRes.data
        }

        const teRes = await getTestingEquipmentById(mrid)
        if (teRes.success) entity.testingEquipment = teRes.data

        // calibration records
        const calRes = await getCalibrationRecordByTestingEquipmentId(mrid)
        if (calRes.success && calRes.data) entity.calibrations = calRes.data

        // repairs (activity_record type='Repair')
        const repRes = await getActivityRecordByAssetId(mrid, 'Repair')
        if (repRes.success && repRes.data) entity.repairs = repRes.data

        // software licenses (qua bảng link)
        const linkRes = await getSoftwareLicenseByTestingEquipmentId(mrid)
        if (linkRes.success && linkRes.data) {
            for (const link of linkRes.data) {
                const licRes = await getSoftwareLicenseById(link.software_license)
                if (licRes.success && licRes.data) entity.softwareLicenses.push(licRes.data)
            }
        }

        // accessories (chi tiết từ testing_equipment con)
        const accRes = await getAccessoryDetailsByEquipmentId(mrid)
        if (accRes.success && accRes.data) entity.accessories = accRes.data

        // attachment (1 record theo id_foreign = mrid, type='asset')
        const attRes = await getAttachmentByForeignIdAndType(mrid, 'asset')
        if (attRes.success && attRes.data) entity.attachment = attRes.data

        // user link
        const uioRes = await getUserIdentifiedObjectByIdentifiedObjectId(mrid)
        if (uioRes.success && uioRes.data) entity.userIdentifiedObject = uioRes.data

        return { success: true, data: entity, message: 'Testing equipment entity retrieved successfully' }
    } catch (error) {
        console.error('Error in getTestingEquipmentEntity:', error)
        return { success: false, error, message: 'Error retrieving testing equipment entity' }
    }
}

// Xóa toàn bộ thông tin của 1 testing equipment
// (calibration_record / software_license_testing_equipment / accessory_testing_equipment
//  đều FK ON DELETE CASCADE tới testing_equipment, nên xóa testing_equipment rồi asset là đủ.
//  Vẫn gỡ tường minh các link để chắc chắn, kể cả khi phụ kiện này được máy khác tham chiếu.)
export const deleteTestingEquipmentEntity = async (mrid) => {
    try {
        if (!mrid) return { success: false, error: new Error('Invalid ID') }

        await runAsync('BEGIN TRANSACTION')

        // gỡ các quan hệ mà mrid này đóng vai trò máy chính hoặc phụ kiện
        await deleteAccessoryTestingEquipmentByEquipmentIdTransaction(mrid, db)
        await deleteSoftwareLicenseTestingEquipmentByTestingEquipmentIdTransaction(mrid, db)

        // xóa testing_equipment (kéo theo calibration_record + link còn lại nhờ cascade)
        await deleteTestingEquipmentByIdTransaction(mrid, db)

        // xóa asset nền
        await deleteAssetByIdTransaction(mrid, db)

        await runAsync('COMMIT')
        return { success: true, data: null, message: 'Testing equipment entity deleted successfully' }
    } catch (error) {
        await runAsync('ROLLBACK')
        console.error('Error in deleteTestingEquipmentEntity:', error)
        return { success: false, error, message: `Error deleting testing equipment entity: ${error.message || 'Unknown error'}` }
    }
}