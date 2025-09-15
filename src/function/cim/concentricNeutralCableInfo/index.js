import db from '../../datacontext/index'

// Lấy concentricNeutralCableInfo theo mrid
export const getConcentricNeutralCableInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        dbsql.get(
            `SELECT * FROM concentric_neutral_cable_info WHERE mrid = ?`,
            [mrid],
            function (err, row) {
                if (err) reject(err);
                else resolve(row);
            }
        );
    });
}

// Thêm mới concentricNeutralCableInfo (transaction)
export const insertConcentricNeutralCableInfoTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO concentric_neutral_cable_info(
                mrid, diameter_over_neutral, neutral_strand_count, neutral_strand_gmr, neutral_strand_radius, neutral_strand_rdc
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                info.mrid,
                info.diameter_over_neutral,
                info.neutral_strand_count,
                info.neutral_strand_gmr,
                info.neutral_strand_radius,
                info.neutral_strand_rdc
            ],
            function (err) {
                if (err) reject(err);
                else resolve({ success: true, id: this.lastID });
            }
        );
    });
};



// Cập nhật concentricNeutralCableInfo (transaction)
export const updateConcentricNeutralCableInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE concentric_neutral_cable_info SET
                diameter_over_neutral = ?,
                neutral_strand_count = ?,
                neutral_strand_gmr = ?,
                neutral_strand_radius = ?,
                neutral_strand_rdc = ?
            WHERE mrid = ?`,
            [
                info.diameter_over_neutral,
                info.neutral_strand_count,
                info.neutral_strand_gmr,
                info.neutral_strand_radius,
                info.neutral_strand_rdc,
                info.mrid
            ],
            function (err) {
                if (err) reject(err);
                else resolve({ success: true, changes: this.changes });
            }
        );
    });
};

// Xóa concentricNeutralCableInfo (transaction)
export const deleteConcentricNeutralCableInfoTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `DELETE FROM concentric_neutral_cable_info WHERE mrid = ?`,
            [mrid],
            function (err) {
                if (err) reject(err);
                else resolve({ success: true, changes: this.changes });
            }
        );
    });
};