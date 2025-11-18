import db from '../../datacontext/index'

export const getCurrentRatingById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM current_rating WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get current rating by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Current rating not found' })
            return resolve({ success: true, data: row, message: 'Get current rating by id completed' })
        })
    })
}

export const getCurrentRatingByIds = async (mrids) => {
    return new Promise((resolve, reject) => {
        if (!mrids || mrids.length === 0) {
            return resolve({ success: false, data: [], message: 'No mrids provided' })
        }

        const placeholders = mrids.map(() => '?').join(',')

        db.all(
            `SELECT * FROM current_rating WHERE mrid IN (${placeholders})`,
            mrids,
            (err, rows) => {
                if (err) {
                    return reject({ success: false, err, message: 'Get current ratings by ids failed' })
                }
                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: [], message: 'Current ratings not found' })
                }
                return resolve({ success: true, data: rows, message: 'Get current ratings by ids completed' })
            }
        )
    })
}

export const getCurrentRatingByEndIdAndPower = async (endId, ratedPower) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM current_rating
             WHERE transformer_end_id = ? AND rated_power = ?`,
            [endId, ratedPower],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get current rating failed' })
                if (!row) return resolve({ success: false, data: null, message: 'Current rating not found' })
                return resolve({ success: true, data: row, message: 'Get current rating completed' })
            }
        )
    })
}

export const insertCurrentRatingTransaction = async (rating, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO current_rating(mrid, transformer_end_id, rated_power, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                transformer_end_id = excluded.transformer_end_id,
                rated_power        = excluded.rated_power,
                value              = excluded.value`,
            [
                rating.mrid,
                rating.transformer_end_id,
                rating.rated_power,
                rating.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert current rating failed' })
                return resolve({ success: true, data: rating, message: 'Insert current rating completed' })
            }
        )
    })
}

export const updateCurrentRatingByIdTransaction = async (mrid, rating, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE current_rating
             SET transformer_end_id=?, rated_power=?, value=?
             WHERE mrid=?`,
            [rating.transformer_end_id, rating.rated_power, rating.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update current rating failed' })
                return resolve({ success: true, data: rating, message: 'Update current rating completed' })
            }
        )
    })
}

export const deleteCurrentRatingByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM current_rating WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete current rating failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Current rating not found' })
            return resolve({ success: true, data: null, message: 'Delete current rating completed' })
        })
    })
}