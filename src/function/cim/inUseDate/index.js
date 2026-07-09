import db from '../../datacontext/index'

export const getInUseDateById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM in_use_date WHERE mrid=?', [mrid], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get in-use date by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'In-use date not found' })
            return resolve({ success: true, data: row, message: 'Get in-use date by id completed' })
        })
    })
}

export const insertInUseDateTransaction = (data, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO in_use_date(
                mrid, in_use_date, not_ready_for_use_date, ready_for_use_date
            ) VALUES (?, ?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                in_use_date = excluded.in_use_date,
                not_ready_for_use_date = excluded.not_ready_for_use_date,
                ready_for_use_date = excluded.ready_for_use_date
            `,
            [
                data.mrid,
                data.in_use_date,
                data.not_ready_for_use_date,
                data.ready_for_use_date
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert in-use date transaction failed' })
                return resolve({ success: true, data, message: 'Insert in-use date transaction completed' })
            }
        )
    })
}
