export const insertStatusTransaction = (status, dbsql) => {
    if (!status || !status.mrid) {
        return Promise.resolve({ success: true, data: null, message: 'Status insert skipped' })
    }

    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO status (mrid, date_time, reason, remark, value)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                date_time = excluded.date_time,
                reason = excluded.reason,
                remark = excluded.remark,
                value = excluded.value`,
            [
                status.mrid,
                status.date_time || new Date().toISOString(),
                status.reason || null,
                status.remark || null,
                status.value || null
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert status transaction failed' })
                return resolve({ success: true, data: status, message: 'Insert status transaction completed' })
            }
        )
    })
}
