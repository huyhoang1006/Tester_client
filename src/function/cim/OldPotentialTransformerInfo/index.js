import { insertPotentialTransformerTransaction } from '../PotentialTransformerInfo/index.js'
/**
 CREATE TABLE "old_ potential_transformer_info" (
    "mrid"	TEXT NOT NULL,
    "standard"	TEXT,
    "rated_frequency"	TEXT,
    "upr_formula"	TEXT,
    "windings"	INTEGER,
    PRIMARY KEY("mrid"),
    FOREIGN KEY("mrid") REFERENCES "potential_transformer_info"("mrid"),
    FOREIGN KEY("rated_frequency") REFERENCES "frequency"("mrid")
);
 */
export const insertOldPotentialTransformerTransaction = async (oldPotentialTransformer, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const potentialTransformerResult = await insertPotentialTransformerTransaction(oldPotentialTransformer, dbsql)
            if (!potentialTransformerResult.success) {
                return reject({ success: false, message: 'Insert potentialTransformer failed', err: potentialTransformerResult.err })
            }
            dbsql.run(
                `INSERT INTO old_potential_transformer_info(mrid, standard, rated_frequency, upr_formula, windings)
                 VALUES (?, ?, ?, ?, ?)
                 ON CONFLICT(mrid) DO UPDATE SET
                standard = excluded.standard,
                rated_frequency = excluded.rated_frequency,
                upr_formula = excluded.upr_formula,
                windings = excluded.windings`,
                [
                    oldPotentialTransformer.mrid,
                    oldPotentialTransformer.standard || null,
                    oldPotentialTransformer.rated_frequency || null,
                    oldPotentialTransformer.upr_formula || null,
                    oldPotentialTransformer.windings || null
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert oldPotentialTransformer failed' })
                    return resolve({ success: true, data: oldPotentialTransformer, message: 'Insert oldPotentialTransformer completed' })
                }
            )
        } catch (error) {
            return reject({ success: false, err: error, message: 'Insert oldPotentialTransformer transaction failed' })
        }
    })
}

/**
 * 
 CREATE TABLE "potential_transformer_table" (
    "mrid"	TEXT NOT NULL,
    "name"	TEXT,
    "usr_formula"	TEXT,
    "rated_burden"	TEXT,
    "rated_power_factor"	REAL,
    "usr_rated_voltage"	TEXT,
    "potential_transformer_info_id"	TEXT,
    PRIMARY KEY("mrid"),
    FOREIGN KEY("potential_transformer_info_id") REFERENCES "potential_transformer_info"("mrid"),
    FOREIGN KEY("rated_burden") REFERENCES "apparent_power"("mrid"),
    FOREIGN KEY("usr_rated_voltage") REFERENCES "voltage"("mrid")
);
 */
