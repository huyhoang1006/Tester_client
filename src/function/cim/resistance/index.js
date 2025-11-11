/**
 * CREATE TABLE "resistance" (
	"mrid"	TEXT NOT NULL,
	"multiplier"	TEXT,
	"unit"	TEXT,
	"value"	REAL,
	PRIMARY KEY("mrid")
);
 */

import db from '../../datacontext/index'

export const insertResistanceTransaction = async (resistance, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO resistance(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                resistance.mrid,
                resistance.multiplier,
                resistance.unit,
                resistance.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert resistance failed' })
                return resolve({ success: true, data: resistance, message: 'Insert resistance completed' })
            }
        )
    })
}

export const getResistanceById = async (mrid) => {
    try {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM resistance WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get resistance by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'Resistance not found' })
                    return resolve({ success: true, data: row, message: 'Get resistance by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get resistance by id failed' }
    }
}

export const getResistanceByIds = async (mrids) => {
    return new Promise((resolve, reject) => {
        if (!mrids || mrids.length === 0) {
            return resolve({ success: false, data: [], message: 'No mrids provided' })
        }

        // Tạo chuỗi placeholder (?, ?, ?) tùy theo số lượng mrid
        const placeholders = mrids.map(() => '?').join(',')

        db.all(
            `SELECT * FROM resistance WHERE mrid IN (${placeholders})`,
            mrids,
            (err, rows) => {
                if (err) {
                    return reject({ success: false, err: err, message: 'Get resistances by ids failed' })
                }
                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: [], message: 'Resistances not found' })
                }
                return resolve({ success: true, data: rows, message: 'Get resistances by ids completed' })
            }
        )
    })
}

export const deleteResistanceByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM resistance WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete resistance failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Resistance not found' })
            return resolve({ success: true, data: null, message: 'Delete resistance completed' })
        })
    })
}