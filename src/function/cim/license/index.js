// src/function/cim/license/index.js
import db from '../../datacontext/index'

export const initLicenseLimitation = () => {

    const defaultLicenses = [
        { name: 'Organisation', limit: 999999999 },
        { name: 'Substation', limit: 999999999 },
        { name: 'Voltage Level', limit: 999999999 },
        { name: 'Bay', limit: 999999999 },
        { name: 'Transformer', limit: 999999999 },
        { name: 'Power cable', limit: 999999999 },
        { name: 'Circuit breaker', limit: 999999999 },
        { name: 'Current transformer', limit: 999999999 },
        { name: 'Voltage transformer', limit: 999999999 },
        { name: 'Disconnector', limit: 999999999 },
        { name: 'Bushing', limit: 999999999 },
        { name: 'Reactor', limit: 999999999 },
        { name: 'Capacitor', limit: 999999999 },
        { name: 'Rotating machine', limit: 999999999 },
        { name: 'Surge Arrester', limit: 999999999 }
    ];

    db.serialize(() => {
        defaultLicenses.forEach(item => {

            const fixedMrid = `LIC_${item.name.toUpperCase().replace(/\s+/g, '_')}`;


            db.get("SELECT number_of_liscense FROM limitation_license WHERE mrid = ?", [fixedMrid], (err, row) => {
                if (err) return;

                if (row) {

                    if (row.number_of_liscense !== item.limit) {
                        db.run(
                            "UPDATE limitation_license SET number_of_liscense = ?, name = ? WHERE mrid = ?",
                            [item.limit, item.name, fixedMrid],
                            (updErr) => {
                                if (!updErr) console.log(`[License] Updated ${item.name} limit to: ${item.limit}`);
                            }
                        );
                    }
                } else {

                    db.run(
                        "INSERT INTO limitation_license (name, number_of_liscense, mrid) VALUES (?, ?, ?)",
                        [item.name, item.limit, fixedMrid],
                        (insErr) => {
                            if (!insErr) console.log(`[License] Initialized ${item.name} with limit: ${item.limit}`);
                        }
                    );
                }
            });
        });
    });
};


export const checkLicenseLimitation = (name) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT number_of_liscense FROM limitation_license WHERE name = ?", [name], (err, row) => {
            if (err) return reject({ success: false, message: 'Database error' });
            if (!row) return resolve({ success: true, allowed: true });

            const limit = row.number_of_liscense;
            let countQuery = "";
            let params = [];

            if (name === 'Organisation') countQuery = "SELECT COUNT(*) as total FROM organisation";
            else if (name === 'Substation') countQuery = "SELECT COUNT(*) as total FROM substation";
            else if (name === 'Voltage Level') countQuery = "SELECT COUNT(*) as total FROM voltage_level";
            else if (name === 'Bay') countQuery = "SELECT COUNT(*) as total FROM bay";
            else {
                countQuery = "SELECT COUNT(*) as total FROM asset WHERE kind = ?";
                params = [name];
            }

            db.get(countQuery, params, (err, countRow) => {
                if (err) return reject({ success: false, message: 'Count error' });
                const current = countRow.total;
                if (current >= limit) {
                    resolve({
                        success: true,
                        allowed: false,
                        message: `License Limit Reached: Only ${limit} ${name}(s) allowed. (Current: ${current})`
                    });
                } else {
                    resolve({ success: true, allowed: true });
                }
            });
        });
    });
};