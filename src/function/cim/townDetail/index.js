import db from '../../datacontext/index'

export const getTownDetailById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM town_detail WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get town detail by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Town detail not found' })
            return resolve({ success: true, data: row, message: 'Get town detail by id completed' })
        })
    })
}

export const getTownDetailByLocationId = async (locationId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT td.* 
            FROM location l
            JOIN street_address sa ON l.main_address = sa.mrid
            JOIN town_detail td ON sa.town_detail = td.mrid
            WHERE l.mrid = ?
        `;

        db.get(query, [locationId], (err, row) => {
            if (err) {
                return reject({ success: false, err: err, message: 'Get town detail by location id failed' });
            }
            if (!row) {
                return resolve({ success: false, data: null, message: 'Town detail not found' });
            }
            return resolve({ success: true, data: row, message: 'Get town detail by location id completed' });
        });
    });
};

export const insertTownDetail = async (townDetail) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO town_detail(mrid, code, country, section, state_or_province,
             ward_or_commune, city, district_or_town)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                code = excluded.code,
                country = excluded.country,
                section = excluded.section,
                state_or_province = excluded.state_or_province,
                ward_or_commune = excluded.ward_or_commune,
                city = excluded.city,
                district_or_town = excluded.district_or_town`,
            [
                townDetail.mrid,
                townDetail.code,
                townDetail.country,
                townDetail.section,
                townDetail.state_or_province,
                townDetail.ward_or_commune,
                townDetail.city,
                townDetail.district_or_town
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert town detail failed' })
                return resolve({ success: true, data: townDetail, message: 'Insert town detail completed' })
            }
        )
    })
}

export const insertTownDetailTransaction = async (townDetail, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO town_detail(mrid, code, country, section, state_or_province,
             ward_or_commune, city, district_or_town)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                code = excluded.code,
                country = excluded.country,
                section = excluded.section,
                state_or_province = excluded.state_or_province,
                ward_or_commune = excluded.ward_or_commune,
                city = excluded.city,
                district_or_town = excluded.district_or_town`,
            [
                townDetail.mrid,
                townDetail.code,
                townDetail.country,
                townDetail.section,
                townDetail.state_or_province,
                townDetail.ward_or_commune,
                townDetail.city,
                townDetail.district_or_town
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert town detail failed' })
                return resolve({ success: true, data: townDetail, message: 'Insert town detail completed' })
            }
        )
    })
}

export const updateTownDetailById = async (mrid, townDetail) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE town_detail
             SET code = ?, country = ?, section = ?, state_or_province = ?,
                 ward_or_commune = ?, city = ?, district_or_town = ?
             WHERE mrid = ?`,
            [townDetail.code, townDetail.country, townDetail.section, townDetail.state_or_province,
                townDetail.ward_or_commune, townDetail.city, townDetail.district_or_town, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update town detail failed' })
                return resolve({ success: true, data: townDetail, message: 'Update town detail completed' })
            }
        )
    })
}

export const updateTownDetailByIdTransaction = async (mrid, townDetail, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE town_detail
             SET code = ?, country = ?, section = ?, state_or_province = ?,
                 ward_or_commune = ?, city = ?, district_or_town = ?
             WHERE mrid = ?`,
            [townDetail.code, townDetail.country, townDetail.section, townDetail.state_or_province,
                townDetail.ward_or_commune, townDetail.city, townDetail.district_or_town, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update town detail failed' })
                return resolve({ success: true, data: townDetail, message: 'Update town detail completed' })
            }
        )
    })
}

export const deleteTownDetailById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM town_detail WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete town detail failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Town detail not found' })
            return resolve({ success: true, data: null, message: 'Delete town detail completed' })
        })
    })
}

export const deleteTownDetailByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM town_detail WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete town detail failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Town detail not found' })
            return resolve({ success: true, data: null, message: 'Delete town detail completed' })
        })
    })
}