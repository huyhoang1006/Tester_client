/**
 * CREATE TABLE "ct_core_info" (
	"mrid"	TEXT NOT NULL,
	"tap_count"	INTEGER,
	"common_tap"	INTEGER,
	"core_application"	TEXT,
	"core_class"	TEXT,
	"fs"	TEXT,
	"alf"	TEXT,
	"winding_resistance"	TEXT,
	"ts"	TEXT,
	"ek"	TEXT,
	"e1"	TEXT,
	"ie"	TEXT,
	"ie1"	TEXT,
	"kssc"	TEXT,
	"val"	TEXT,
	"tp"	TEXT,
	"iai"	TEXT,
	"k"	TEXT,
	"ktd"	TEXT,
	"duty"	TEXT,
	"kx"	TEXT,
	"current_transformer_info_id"	TEXT,
	"ex"	TEXT,
	"vb"	TEXT,
	"vk"	TEXT,
	"vk1"	TEXT,
	"ik"	TEXT,
	"ik1"	TEXT,
	"ratio_error"	TEXT,
	"core_index"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("current_transformer_info_id") REFERENCES "current_transformer_info"("mrid"),
	FOREIGN KEY("ratio_error") REFERENCES "percent"("mrid"),
	FOREIGN KEY("vb") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("winding_resistance") REFERENCES "resistance"("mrid")
);
 */

// Thêm mới ctCoreInfo
// Thêm mới ctCoreInfo (UPSERT)
import dbsql from '@/function/datacontext/index'

// Helper: convert empty string to null for FK fields
const emptyToNull = (val) => (val === '' || val === undefined) ? null : val

export const insertCtCoreInfoTransaction = (info, dbsql) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO ct_core_info (
                mrid, tap_count, common_tap, core_application, core_class, fs, alf, 
                winding_resistance, ts, ek, e1, ie, ie1, kssc, val, tp, iai, k, ktd, 
                duty, kx, current_transformer_info_id, ex, vb, vk, vk1, ik, ik1, ratio_error, core_index
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
            ON CONFLICT(mrid) DO UPDATE SET
                tap_count = excluded.tap_count,
                common_tap = excluded.common_tap,
                core_application = excluded.core_application,
                core_class = excluded.core_class,
                fs = excluded.fs,
                alf = excluded.alf,
                winding_resistance = excluded.winding_resistance,
                ts = excluded.ts,
                ek = excluded.ek,
                e1 = excluded.e1,
                ie = excluded.ie,
                ie1 = excluded.ie1,
                kssc = excluded.kssc,
                val = excluded.val,
                tp = excluded.tp,
                iai = excluded.iai,
                k = excluded.k,
                ktd = excluded.ktd,
                duty = excluded.duty,
                kx = excluded.kx,
                current_transformer_info_id = excluded.current_transformer_info_id,
                ex = excluded.ex,
                vb = excluded.vb,
                vk = excluded.vk,
                vk1 = excluded.vk1,
                ik = excluded.ik,
                ik1 = excluded.ik1,
                ratio_error = excluded.ratio_error,
                core_index = excluded.core_index
        `;

        const params = [
            info.mrid,
            info.tap_count,
            info.common_tap,
            info.core_application,
            info.core_class,
            info.fs,
            info.alf,
            emptyToNull(info.winding_resistance),
            info.ts,
            info.ek,
            info.e1,
            info.ie,
            info.ie1,
            info.kssc,
            info.val,
            info.tp,
            info.iai,
            info.k,
            info.ktd,
            info.duty,
            info.kx,
            info.current_transformer_info_id,
            info.ex,
            emptyToNull(info.vb),
            info.vk,
            info.vk1,
            info.ik,
            info.ik1,
            emptyToNull(info.ratio_error),
            info.core_index
        ];

        dbsql.run(sql, params, function (err) {
            if (err) {
                return reject({ success: false, err, message: "Insert ctCoreInfo failed" });
            }
            return resolve({ success: true, data: info, message: "Insert ctCoreInfo completed" });
        });
    });
};

export const getCtCoreInfoByCurrentTransformerInfoId = (current_transformer_info_id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM ct_core_info WHERE current_transformer_info_id = ?`;
        const params = [current_transformer_info_id];
        dbsql.all(sql, params, function (err, rows) {
            if (err) return reject({ success: false, err, message: 'Get ctCoreInfo failed' });
            return resolve({ success: true, data: rows, message: 'Get ctCoreInfo completed' });
        });
    });
};

export const deleteCtCoreInfoByCurrentTransformerInfoIdTransaction = (current_transformer_info_id, dbsql) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM ct_core_info WHERE current_transformer_info_id = ?`;
        const params = [current_transformer_info_id];
        console.log('delete ct core info : ', current_transformer_info_id);
        dbsql.run(sql, params, function (err) {
            if (err) return reject({ success: false, err, message: 'Delete ctCoreInfo failed' });
            return resolve({ success: true, data: current_transformer_info_id, message: 'Delete ctCoreInfo completed' });
        });
    });
};
