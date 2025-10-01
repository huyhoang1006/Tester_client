/**
 * CREATE TABLE "current_transformer_info" (
	"mrid"	TEXT NOT NULL,
	"accuracy_class"	TEXT,
	"accuracy_limit"	TEXT,
	"core_count"	INTEGER,
	"ct_class"	TEXT,
	"knee_point_current"	TEXT,
	"knee_point_voltage"	TEXT,
	"max_ratio"	TEXT,
	"nominal_ratio"	TEXT,
	"primary_fls_rating"	TEXT,
	"primary_ratio"	TEXT,
	"rated_current"	TEXT,
	"secondary_fls_rating"	TEXT,
	"secondary_ratio"	TEXT,
	"tertiary_fls_rating"	TEXT,
	"tertiary_ratio"	TEXT,
	"usage"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("accuracy_limit") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("knee_point_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("knee_point_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("max_ratio") REFERENCES "ratio"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset_info"("mrid") on delete cascade,
	FOREIGN KEY("nominal_ratio") REFERENCES "ratio"("mrid"),
	FOREIGN KEY("primary_fls_rating") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("primary_ratio") REFERENCES "ratio"("mrid"),
	FOREIGN KEY("rated_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("secondary_fls_rating") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("secondary_ratio") REFERENCES "ratio"("mrid"),
	FOREIGN KEY("tertiary_fls_rating") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("tertiary_ratio") REFERENCES "ratio"("mrid")
);
 */
import * as AssetInfoFunc from '../assetInfo/index'
import db from '../../datacontext/index'

// Thêm mới currentTransformerInfo (transaction)
export const insertCurrentTransformerInfo = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run(
                `INSERT INTO current_transformer_info(
                    mrid, accuracy_class, accuracy_limit, core_count, ct_class, knee_point_current, knee_point_voltage, max_ratio, nominal_ratio, primary_fls_rating, primary_ratio, rated_current, secondary_fls_rating, secondary_ratio, tertiary_fls_rating, tertiary_ratio, usage
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    accuracy_class = excluded.accuracy_class,
                    accuracy_limit = excluded.accuracy_limit,
                    core_count = excluded.core_count,
                    ct_class = excluded.ct_class,
                    knee_point_current = excluded.knee_point_current,
                    knee_point_voltage = excluded.knee_point_voltage,
                    max_ratio = excluded.max_ratio,
                    nominal_ratio = excluded.nominal_ratio,
                    primary_fls_rating = excluded.primary_fls_rating,
                    primary_ratio = excluded.primary_ratio,
                    rated_current = excluded.rated_current,
                    secondary_fls_rating = excluded.secondary_fls_rating,
                    secondary_ratio = excluded.secondary_ratio,
                    tertiary_fls_rating = excluded.tertiary_fls_rating,
                    tertiary_ratio = excluded.tertiary_ratio,
                    usage = excluded.usage
                `,
                [
                    info.mrid,
                    info.accuracy_class,
                    info.accuracy_limit,
                    info.core_count,
                    info.ct_class,
                    info.knee_point_current,
                    info.knee_point_voltage,
                    info.max_ratio,
                    info.nominal_ratio,
                    info.primary_fls_rating,
                    info.primary_ratio,
                    info.rated_current,
                    info.secondary_fls_rating,
                    info.secondary_ratio,
                    info.tertiary_fls_rating,
                    info.tertiary_ratio,
                    info.usage
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert currentTransformerInfo failed' })
                    }
                    return resolve({ success: true, data: info, message: 'Insert currentTransformerInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert currentTransformerInfo transaction failed' })
        }
    })
}

export const getCurrentTransformerInfoById = async (mrid) => {
    try {
        const baseResult = await AssetInfoFunc.getAssetInfoById(mrid)
        if (!baseResult.success) {
            return { success: false, data: null, message: 'CurrentTransformerInfo not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM current_transformer_info WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get currentTransformerInfo by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'CurrentTransformerInfo not found' })
                    return resolve({ success: true, data: { ...baseResult.data, ...row }, message: 'Get currentTransformerInfo by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get currentTransformerInfo by id failed' }
    }
}