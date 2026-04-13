import * as rootOrganisationFunc from './organisationRoot/index'
import * as procedureFunc from './procedure/index'
import * as databaseInitFunc from './database/init'
import UpdateSchedulerService from '@/function/entity/update/UpdateSchedulerService'
import { entityFunc } from '@/function'
import db from '@/function/datacontext/index'
import { app } from 'electron'
import compareVersions from 'compare-versions';

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

export const updateDatabase = async () => {
    const LATEST_DB_VERSION = 1;
    const oldVersion = await databaseInitFunc.getDbVersion(db)
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
            if (compareVersions.compare(LATEST_DB_VERSION, oldVersion, '>')) {
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