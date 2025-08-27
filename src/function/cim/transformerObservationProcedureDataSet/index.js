import db from '../../datacontext/index'

// Lấy transformerObservationProcedureDataSet theo mrid
export const getTransformerObservationProcedureDataSetById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM transformerObservationProcedureDataSet WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get transformerObservationProcedureDataSet by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'TransformerObservationProcedureDataSet not found' })
                return resolve({ success: true, data: row, message: 'Get transformerObservationProcedureDataSet by id completed' })
            }
        )
    })
}

// Thêm mới transformerObservationProcedureDataSet
export const insertTransformerObservationProcedureDataSetTransaction = async (dataSet, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO transformerObservationProcedureDataSet(
                mrid, transformer_observation_id, procedure_dataset_id
            ) VALUES (?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                transformer_observation_id = excluded.transformer_observation_id,
                procedure_dataset_id = excluded.procedure_dataset_id
            `,
            [
                dataSet.mrid,
                dataSet.transformer_observation_id,
                dataSet.procedure_dataset_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert transformerObservationProcedureDataSet failed' })
                return resolve({ success: true, data: dataSet, message: 'Insert transformerObservationProcedureDataSet completed' })
            }
        )
    })
}

// Cập nhật transformerObservationProcedureDataSet
export const updateTransformerObservationProcedureDataSetByIdTransaction = async (mrid, dataSet, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE transformerObservationProcedureDataSet SET
                transformer_observation_id = ?,
                procedure_dataset_id = ?
            WHERE mrid = ?`,
            [
                dataSet.transformer_observation_id,
                dataSet.procedure_dataset_id,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update transformerObservationProcedureDataSet failed' })
                return resolve({ success: true, data: dataSet, message: 'Update transformerObservationProcedureDataSet completed' })
            }
        )
    })
}

// Xóa transformerObservationProcedureDataSet
export const deleteTransformerObservationProcedureDataSetByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM transformerObservationProcedureDataSet WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete transformerObservationProcedureDataSet failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'TransformerObservationProcedureDataSet not found' })
            return resolve({ success: true, data: null, message: 'Delete transformerObservationProcedureDataSet completed' })
        })
    })
}