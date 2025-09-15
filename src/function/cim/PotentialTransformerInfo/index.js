import * as AssetInfoFunc from '../assetInfo/index.js'
export const insertPotentialTransformerTransaction = async (potentialTransformer, dbsql) => {

    return new Promise(async (resolve, reject) => {
        console.log('insertPotentialTransformerTransaction')
        try {
            console.log('potentialTransformer_mrid: ', potentialTransformer.mrid)
            const assetInfoResult = await AssetInfoFunc.insertAssetInfoTransaction(potentialTransformer, dbsql)

            if (!assetInfoResult.success) {
                return reject({ success: false, message: 'Insert assetInfo failed', err: assetInfoResult.err })
            }

            dbsql.run(
                `INSERT INTO potential_transformer_info(mrid, accuracy_class, nominal_ratio, primary_ratio, pt_class, rated_voltage, secondary_ratio, tertiary_ratio)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(mrid) DO UPDATE SET
                accuracy_class = excluded.accuracy_class,
                nominal_ratio = excluded.nominal_ratio,
                primary_ratio = excluded.primary_ratio,
                pt_class = excluded.pt_class,
                rated_voltage = excluded.rated_voltage,
                secondary_ratio = excluded.secondary_ratio,
                tertiary_ratio = excluded.tertiary_ratio`,

                [
                    potentialTransformer.mrid,
                    potentialTransformer.accuracy_class || null,
                    potentialTransformer.nominal_ratio || null,
                    potentialTransformer.primary_ratio || null,
                    potentialTransformer.pt_class || null,
                    potentialTransformer.rated_voltage || null,
                    potentialTransformer.secondary_ratio || null,
                    potentialTransformer.tertiary_ratio || null
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert potential transformer failed' })
                    return resolve({ success: true, data: potentialTransformer, message: 'Insert potential transformer completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert potential transformer transaction failed' })
        }
    })
}