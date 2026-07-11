import db from '../../datacontext/index'

// Lấy procedureDataSetMeasurementValue theo mrid
export const getProcedureDataSetMeasurementValueById = async (procedure_dataset_id, measurement_value_id) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM procedure_dataset_measurement_value 
             WHERE procedure_dataset_id=? AND measurement_value_id=?`,
            [procedure_dataset_id, measurement_value_id],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get failed' });
                if (!row) return resolve({ success: false, data: null, message: 'Not found' });

                return resolve({ success: true, data: row, message: 'Get completed' });
            }
        );
    });
};


// Thêm mới procedureDataSetMeasurementValue (transaction)
export const insertProcedureDataSetMeasurementValueTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO procedure_dataset_measurement_value(
                procedure_dataset_id,
                measurement_value_id
            ) VALUES (?, ?)
            ON CONFLICT(procedure_dataset_id, measurement_value_id) DO NOTHING`,
            [
                info.procedure_dataset_id,
                info.measurement_value_id
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Insert failed' });
                }
                return resolve({ success: true, data: info, message: 'Insert completed' });
            }
        );
    });
};

export const insertProcedureDataSetMeasurementValuesTransaction = async (items = [], dbsql) => {
    if (!items || items.length === 0) {
        return { success: true, data: [], message: 'Insert completed' };
    }

    const stmt = dbsql.prepare(
        `INSERT INTO procedure_dataset_measurement_value(
            procedure_dataset_id,
            measurement_value_id
        ) VALUES (?, ?)
        ON CONFLICT(procedure_dataset_id, measurement_value_id) DO NOTHING`
    );

    try {
        for (const item of items) {
            await runStatement(stmt, [
                item.procedure_dataset_id,
                item.measurement_value_id
            ]);
        }
        return { success: true, data: items, message: 'Insert completed' };
    } catch (err) {
        return Promise.reject({ success: false, err, message: 'Insert failed' });
    } finally {
        await finalizeStatement(stmt);
    }
};

// Cập nhật procedureDataSetMeasurementValue (transaction)
export const updateProcedureDataSetMeasurementValueTransaction = async (
    old_procedure_dataset_id,
    old_measurement_value_id,
    info,
    dbsql
) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE procedure_dataset_measurement_value SET
                procedure_dataset_id = ?,
                measurement_value_id = ?
             WHERE procedure_dataset_id = ? AND measurement_value_id = ?`,
            [
                info.procedure_dataset_id,
                info.measurement_value_id,
                old_procedure_dataset_id,
                old_measurement_value_id
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Update failed' });
                }
                return resolve({ success: true, data: info, message: 'Update completed' });
            }
        );
    });
};

// Xóa procedureDataSetMeasurementValue (transaction)
export const deleteProcedureDataSetMeasurementValueTransaction = async (
    procedure_dataset_id,
    measurement_value_id,
    dbsql
) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `DELETE FROM procedure_dataset_measurement_value 
             WHERE procedure_dataset_id=? AND measurement_value_id=?`,
            [procedure_dataset_id, measurement_value_id],
            function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Delete failed' });
                }
                return resolve({
                    success: true,
                    data: { procedure_dataset_id, measurement_value_id },
                    message: 'Delete completed'
                });
            }
        );
    });
};

const runStatement = (stmt, params) => {
    return new Promise((resolve, reject) => {
        stmt.run(params, function (err) {
            if (err) return reject(err);
            return resolve(this);
        });
    });
};

const finalizeStatement = (stmt) => {
    return new Promise((resolve, reject) => {
        stmt.finalize((err) => {
            if (err) return reject(err);
            return resolve();
        });
    });
};
