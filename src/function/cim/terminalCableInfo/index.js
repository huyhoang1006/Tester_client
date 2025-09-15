
export const insertTerminalCableInfoTransaction = async (tci, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO terminal_cable_info (
                mrid,
                rated_u,
                bil,
                bsl,
                type,
                connector_type,
                service_condition,
                cable_info_id,
                class
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                tci.mrid,
                tci.rated_u,
                tci.bil,
                tci.bsl,
                tci.type,
                tci.connector_type,
                tci.service_condition,
                tci.cable_info_id,
                tci.class
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, message: "Insert failed", err });
                }
            }
        );
    });
};

export const getTerminalCableInfoById = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.get(
            "SELECT * FROM terminal_cable_info WHERE mrid = ?",
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err });
                resolve({ success: true, data: row });
            }
        );
    });
};

export const updateTerminalCableInfoTransaction = async (tci, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE terminal_cable_info SET
                rated_u = ?,
                bil = ?,
                bsl = ?,
                type = ?,
                connector_type = ?,
                service_condition = ?,
                cable_info_id = ?,
                class = ?
                WHERE mrid = ?`,
            [
                tci.rated_u,
                tci.bil,
                tci.bsl,
                tci.type,
                tci.connector_type,
                tci.service_condition,
                tci.cable_info_id,
                tci.class,
                tci.mrid
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, message: "Update failed", err });
                }
            }
        );
    });
};

export const deleteTerminalCableInfoTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            "DELETE FROM terminal_cable_info WHERE mrid = ?",
            [mrid],
            function (err) {
                if (err) {
                    dbsql.run("ROLLBACK");
                    return reject({ success: false, message: "Delete failed", err });
                }
                resolve({ success: true });
            }
        );
    });
};
