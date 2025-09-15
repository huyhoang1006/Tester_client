
export const insertPotentialTransformerTable = async (potentialTransformerTable, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('insertPotentialTransformerTable check poin1 ' + potentialTransformerTable)

            dbsql.run(`INSERT INTO potential_transformer_table(mrid, name, usr_formula, rated_burden, rated_power_factor, usr_rated_voltage, potential_transformer_info_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(mrid) DO UPDATE SET
                name = excluded.name,
                usr_formula = excluded.usr_formula,
                rated_burden = excluded.rated_burden,
                rated_power_factor = excluded.rated_power_factor,
                usr_rated_voltage = excluded.usr_rated_voltage,
                potential_transformer_info_id = excluded.potential_transformer_info_id`,
                [
                    potentialTransformerTable.mrid,
                    potentialTransformerTable.name || null,
                    potentialTransformerTable.usr_formula || null,
                    potentialTransformerTable.rated_burden || null,
                    potentialTransformerTable.rated_power_factor || null,
                    potentialTransformerTable.usr_rated_voltage || null,
                    potentialTransformerTable.potential_transformer_info_id || null
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert potentialTransformerTable failed' })
                    return resolve({ success: true, data: potentialTransformerTable, message: 'Insert potentialTransformerTable completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert potentialTransformerTable transaction failed' })
        }
    })
}