import * as rootOrganisationFunc from './organisationRoot/index'
import * as procedureFunc from './procedure/index'
import * as databaseInitFunc from './database/init'
import { normalizeServerMrids } from '@/function/entity/mRIDCheck/normalizeServerMrid'
import UpdateSchedulerService from '@/function/entity/update/UpdateSchedulerService'
import { entityFunc } from '@/function'
import db from '@/function/datacontext/index'
import { app } from 'electron'
import { migrateLegacySfraTraces } from '@/function/cim/sfraTrace'

const schedulerService = new UpdateSchedulerService()
const { checkForUpdates } = entityFunc.updateEntityFunc

export const createRootOrganisation = async () => {
    try {
        var check = await rootOrganisationFunc.createOrganisationRoot(db)
        if (check.success) {
            console.log('Create root organisation completed')
        } else {
            console.log('Create root organisation failed')
        }
    } catch (err) {
        console.error('Error creating root organisation:', err)
    }
}

/**
 * Chuẩn hoá mrid cũ (id server trần) sang dạng có hậu tố loại node. Chạy đúng 1 lần,
 * đánh dấu bằng app_settings để lần khởi động sau không quét lại.
 */
export const normalizeMridOnce = async () => {
    // ĐỔI KHOÁ LÀ CÁCH CHO NÓ CHẠY LẠI MỘT LƯỢT.
    //
    // Máy nào đã đánh dấu xong bằng khoá cũ vẫn còn tổ chức mang mrid trần, vì
    // `getOrganisationChain` từng dựng lại mrid từ phản hồi server và làm rơi hậu tố
    // '@org' — xem chú thích trong `Download/organisation.js`. Tổ chức nào tải về SAU
    // lần chuẩn hoá đầu tiên thì không có gì quét lại chúng, và lần tải tiếp theo sẽ
    // vỡ khoá ngoại vì con trỏ tới '1000@org' còn cha nằm dưới tên '1000'.
    //
    // Khoá mới bắt quét lại đúng một lượt cho mọi máy. `replaceLocalMrid` là thao tác
    // idempotent — mrid đã có '@' thì bị loại ngay ở câu SELECT — nên máy nào sạch rồi
    // cũng không hề hấn gì.
    const KEY = 'mrid_suffix_normalized_v2'
    try {
        const done = await new Promise((resolve) => {
            db.get(`SELECT value FROM app_settings WHERE key = ?`, [KEY],
                (err, row) => resolve(err ? null : (row && row.value)))
        })
        if (done === '1') {
            console.log('[NORMALIZE-MRID] already done, skipping')
            return
        }

        const rs = await normalizeServerMrids()
        const data = (rs && rs.data) || {}
        console.log('[NORMALIZE-MRID] result:', JSON.stringify(data))

        // Chỉ đánh dấu hoàn tất khi KHÔNG còn node nào lỗi. Node lỗi thường do
        // id server đích đã bị node khác chiếm (trùng serial) — sửa xong dữ liệu
        // thì lần khởi động sau còn chạy lại được, không bị khoá vĩnh viễn.
        const failed = (data.failed || []).length
        if (failed > 0) {
            console.warn(`[NORMALIZE-MRID] ${failed} node(s) not normalized, will retry next start:`,
                JSON.stringify(data.failed))
            return
        }

        await new Promise((resolve) => {
            db.run(`INSERT INTO app_settings(key, value) VALUES(?, '1')
                    ON CONFLICT(key) DO UPDATE SET value = '1'`, [KEY], () => resolve())
        })
        console.log('[NORMALIZE-MRID] completed, marked as done')
    } catch (error) {
        // Không chặn khởi động app nếu chuẩn hoá lỗi
        console.error('[NORMALIZE-MRID] failed:', error)
    }
}

export const updateDatabase = async () => {
    // Version 3 seeds the Dynamic Contact Resistance procedures and their
    // measurement definitions into databases that were created before those
    // tests were added. Without this migration, procedure_asset references a
    // procedure that only exists in the JSON config and SQLite rejects it.
    const LATEST_DB_VERSION = 5;
    const oldVersion = await databaseInitFunc.getDbVersion(db)

    // Tạo những BẢNG còn thiếu, ở mọi lần khởi động.
    //
    // Cố ý đặt NGOÀI cơ chế version: bảng mới thêm vào schema.js không kèm chuyển đổi dữ
    // liệu nào, mà nếu chờ tăng version thì nhánh nâng cấp còn chạy lại cả createProcedure
    // — nặng hơn nhiều so với việc cần làm, và chỉ để có một cái bảng rỗng.
    //
    // Không chặn khởi động nếu hỏng: app còn chạy được với những bảng đã có, và log nói rõ
    // tính năng nào sẽ lỗi.
    try {
        await databaseInitFunc.syncSchemaTables(db)
        await databaseInitFunc.ensureTransformerVectorGroupColumns(db)
        await databaseInitFunc.ensureSubstationOperatingDateColumn(db)
        const sfraMigration = await migrateLegacySfraTraces(db)
        if (sfraMigration.migrated > 0) {
            console.log(`[DB] Migrated ${sfraMigration.migrated} legacy SFRA trace(s)`)
        }
    } catch (schemaError) {
        console.error('[DB] Sync schema failed, tinh nang dung bang moi se loi:', schemaError)
    }

    try {
        await entityFunc.fmecaFunc.ensureFmecaSchema(db)
    } catch (fmecaError) {
        console.error('[DB] FMECA schema/demo sync failed:', fmecaError)
    }

    if (oldVersion) {
        // These procedures were added after databases in the field had already
        // advanced their user_version. Seed only this small, idempotent catalogue
        // slice on every startup so procedure_asset can always satisfy its FKs.
        try {
            await runAsync('BEGIN TRANSACTION', db)
            await procedureFunc.ensureDynamicContactResistanceProcedures(db)
            await runAsync('COMMIT', db)
        } catch (procedureError) {
            await runAsync('ROLLBACK', db).catch(() => {})
            console.error('[DB] Dynamic Contact Resistance procedure sync failed:', procedureError)
        }

        // PTM Transformer imports use measurement definitions that may have been
        // added after an existing database last ran the full procedure migration.
        try {
            await runAsync('BEGIN TRANSACTION', db)
            await procedureFunc.ensureTransformerPtmImportProcedures(db)
            await runAsync('COMMIT', db)
        } catch (procedureError) {
            await runAsync('ROLLBACK', db).catch(() => {})
            console.error('[DB] Transformer PTM procedure sync failed:', procedureError)
        }

        try {
            await runAsync('BEGIN TRANSACTION', db)
            await procedureFunc.ensureRotatingMachineProcedures(db)
            await runAsync('COMMIT', db)
        } catch (procedureError) {
            await runAsync('ROLLBACK', db).catch(() => {})
            console.error('[DB] Rotating Machine procedure sync failed:', procedureError)
        }
    }

    if(!oldVersion) {
        try {
            console.warn('No version found in database. Assuming first run. Setting version to current app version.')
            await runAsync('BEGIN TRANSACTION', db);
            await databaseInitFunc.initializeDatabaseFromSQL(db)
            await procedureFunc.createProcedure(db)
            await databaseInitFunc.setDbVersion(db, LATEST_DB_VERSION) // Lưu version vào database
            return runAsync('COMMIT', db);
        } catch (err) {
            await runAsync('ROLLBACK', db);
            app.quit()
            console.error('Error initializing database on first run:', err)
        }
    } else {
        if(oldVersion && LATEST_DB_VERSION) {
            if (LATEST_DB_VERSION > oldVersion) {
                try {
                    console.log(`Updating database from version ${oldVersion} to ${LATEST_DB_VERSION}`)
                    await runAsync('BEGIN TRANSACTION', db);
                    await databaseInitFunc.updateDatabaseFromSQL(db, oldVersion, LATEST_DB_VERSION)
                    await procedureFunc.updateProcedure(db)
                    await databaseInitFunc.setDbVersion(db, LATEST_DB_VERSION) // Cập nhật version mới vào database
                    return runAsync('COMMIT', db);
                } catch (err) {
                    await runAsync('ROLLBACK', db);
                    app.quit()
                    console.error('Error creating procedure file:', err)
                }
            }
        } else {
            this.$message.error('Version information is missing. Skipping update and initialization')
        }
    }
}

/**
 * Bỏ qua thông báo update cho version hiện tại
 */
export const dismissUpdateNotification = async (version) => {
    schedulerService.dismissVersion(version)
    return { success: true }
}

/**
 * Reset scheduler (force check on next startup)
 */
export const resetScheduler = () => {
    schedulerService.reset()
    return { success: true }
}

/**
 * Lấy trạng thái scheduler
 */
export const getSchedulerStatus = () => {
    return schedulerService.getStatusInfo()
}

/**
 * 🚀 ENTERPRISE STARTUP SEQUENCE
 */
export const active = async () => {
    await updateDatabase()
    await createRootOrganisation()
    await normalizeMridOnce()

    schedulerService.scheduleCheck(async () => {
        await checkForUpdates()
        schedulerService.scheduleNextCheck(async () => {
            await checkForUpdates()
        })
    })
}

const runAsync = (sql, dbsql, params = []) => {
    return new Promise((resolve, reject) => {
        dbsql.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
};
