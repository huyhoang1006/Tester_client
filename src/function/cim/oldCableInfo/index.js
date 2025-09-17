import db from '../../datacontext/index'

// Lấy oldCableInfo theo mrid
export const getOldCableInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM old_cable_info WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get oldCableInfo by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'OldCableInfo not found' })
                return resolve({ success: true, data: row, message: 'Get oldCableInfo by id completed' })
            }
        )
    })
}

// Thêm mới oldCableInfo (transaction)
export const insertOldCableInfoTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO old_cable_info(
                mrid, rated_u, max_u, rated_frequency, short_circuit_current, rated_duration_short_circuit,
                installation_method, bonding_type, install_location, length, conductor_size, conductor_class,
                conductor_type, nominal_conductor_diameter, conductor_shield_thickness, diameter_over_shield,
                sheath_multicore, sheath_contruction, sheath_thickness, diameter_over_sheath,
                insulation_max_operating_temp, screen_material, screen_thickness, armour_bedding_material,
                armour_bedding_thickness, diameter_bedding_over_armour, sheath_reinforcing_material,
                sheath_reinforcing_thickness, diameter_over_sheath_reinforcing, sheath_reinforcing_width,
                sheath_reinforcing_length_lay, sheath_reinforcing_no_tape, armour_material, armour_thickness,
                armour_layer_tape, armour_cross_sectional_area_tap, jacket_thickness, concentric_thickness,
                concentric_contruction, concentric_material, concentric_length_lay, concentric_area,
                concentric_no_of_wires, cable_info_id, phase_count, core_count, sheath_type, diameter_over_armour
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                rated_u = excluded.rated_u,
                max_u = excluded.max_u,
                rated_frequency = excluded.rated_frequency,
                short_circuit_current = excluded.short_circuit_current,
                rated_duration_short_circuit = excluded.rated_duration_short_circuit,
                installation_method = excluded.installation_method,
                bonding_type = excluded.bonding_type,
                install_location = excluded.install_location,
                length = excluded.length,
                conductor_size = excluded.conductor_size,
                conductor_class = excluded.conductor_class,
                conductor_type = excluded.conductor_type,
                nominal_conductor_diameter = excluded.nominal_conductor_diameter,
                conductor_shield_thickness = excluded.conductor_shield_thickness,
                diameter_over_shield = excluded.diameter_over_shield,
                sheath_multicore = excluded.sheath_multicore,
                sheath_contruction = excluded.sheath_contruction,
                sheath_thickness = excluded.sheath_thickness,
                diameter_over_sheath = excluded.diameter_over_sheath,
                insulation_max_operating_temp = excluded.insulation_max_operating_temp,
                screen_material = excluded.screen_material,
                screen_thickness = excluded.screen_thickness,
                armour_bedding_material = excluded.armour_bedding_material,
                armour_bedding_thickness = excluded.armour_bedding_thickness,
                diameter_bedding_over_armour = excluded.diameter_bedding_over_armour,
                sheath_reinforcing_material = excluded.sheath_reinforcing_material,
                sheath_reinforcing_thickness = excluded.sheath_reinforcing_thickness,
                diameter_over_sheath_reinforcing = excluded.diameter_over_sheath_reinforcing,
                sheath_reinforcing_width = excluded.sheath_reinforcing_width,
                sheath_reinforcing_length_lay = excluded.sheath_reinforcing_length_lay,
                sheath_reinforcing_no_tape = excluded.sheath_reinforcing_no_tape,
                armour_material = excluded.armour_material,
                armour_thickness = excluded.armour_thickness,
                armour_layer_tape = excluded.armour_layer_tape,
                armour_cross_sectional_area_tap = excluded.armour_cross_sectional_area_tap,
                jacket_thickness = excluded.jacket_thickness,
                concentric_thickness = excluded.concentric_thickness,
                concentric_contruction = excluded.concentric_contruction,
                concentric_material = excluded.concentric_material,
                concentric_length_lay = excluded.concentric_length_lay,
                concentric_area = excluded.concentric_area,
                concentric_no_of_wires = excluded.concentric_no_of_wires,
                cable_info_id = excluded.cable_info_id,
                phase_count = excluded.phase_count,
                core_count = excluded.core_count,
                sheath_type = excluded.sheath_type,
                diameter_over_armour = excluded.diameter_over_armour
            `,
            [
                info.mrid,
                info.rated_u,
                info.max_u,
                info.rated_frequency,
                info.short_circuit_current,
                info.rated_duration_short_circuit,
                info.installation_method,
                info.bonding_type,
                info.install_location,
                info.length,
                info.conductor_size,
                info.conductor_class,
                info.conductor_type,
                info.nominal_conductor_diameter,
                info.conductor_shield_thickness,
                info.diameter_over_shield,
                info.sheath_multicore,
                info.sheath_contruction,
                info.sheath_thickness,
                info.diameter_over_sheath,
                info.insulation_max_operating_temp,
                info.screen_material,
                info.screen_thickness,
                info.armour_bedding_material,
                info.armour_bedding_thickness,
                info.diameter_bedding_over_armour,
                info.sheath_reinforcing_material,
                info.sheath_reinforcing_thickness,
                info.diameter_over_sheath_reinforcing,
                info.sheath_reinforcing_width,
                info.sheath_reinforcing_length_lay,
                info.sheath_reinforcing_no_tape,
                info.armour_material,
                info.armour_thickness,
                info.armour_layer_tape,
                info.armour_cross_sectional_area_tap,
                info.jacket_thickness,
                info.concentric_thickness,
                info.concentric_contruction,
                info.concentric_material,
                info.concentric_length_lay,
                info.concentric_area,
                info.concentric_no_of_wires,
                info.cable_info_id,
                info.phase_count,
                info.core_count,
                info.sheath_type,
                info.diameter_over_armour
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Insert oldCableInfo failed' })
                }
                return resolve({ success: true, data: info, message: 'Insert oldCableInfo completed' })
            }
        )
    })
}

// Cập nhật oldCableInfo (transaction)
export const updateOldCableInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE old_cable_info SET
                rated_u = ?,
                max_u = ?,
                rated_frequency = ?,
                short_circuit_current = ?,
                rated_duration_short_circuit = ?,
                installation_method = ?,
                bonding_type = ?,
                install_location = ?,
                length = ?,
                conductor_size = ?,
                conductor_class = ?,
                conductor_type = ?,
                nominal_conductor_diameter = ?,
                conductor_shield_thickness = ?,
                diameter_over_shield = ?,
                sheath_multicore = ?,
                sheath_contruction = ?,
                sheath_thickness = ?,
                diameter_over_sheath = ?,
                insulation_max_operating_temp = ?,
                screen_material = ?,
                screen_thickness = ?,
                armour_bedding_material = ?,
                armour_bedding_thickness = ?,
                diameter_bedding_over_armour = ?,
                sheath_reinforcing_material = ?,
                sheath_reinforcing_thickness = ?,
                diameter_over_sheath_reinforcing = ?,
                sheath_reinforcing_width = ?,
                sheath_reinforcing_length_lay = ?,
                sheath_reinforcing_no_tape = ?,
                armour_material = ?,
                armour_thickness = ?,
                armour_layer_tape = ?,
                armour_cross_sectional_area_tap = ?,
                jacket_thickness = ?,
                concentric_thickness = ?,
                concentric_contruction = ?,
                concentric_material = ?,
                concentric_length_lay = ?,
                concentric_area = ?,
                concentric_no_of_wires = ?,
                cable_info_id = ?,
                phase_count = ?,
                core_count = ?,
                sheath_type = ?,
                diameter_over_armour = ?
            WHERE mrid = ?`,
            [
                info.rated_u,
                info.max_u,
                info.rated_frequency,
                info.short_circuit_current,
                info.rated_duration_short_circuit,
                info.installation_method,
                info.bonding_type,
                info.install_location,
                info.length,
                info.conductor_size,
                info.conductor_class,
                info.conductor_type,
                info.nominal_conductor_diameter,
                info.conductor_shield_thickness,
                info.diameter_over_shield,
                info.sheath_multicore,
                info.sheath_contruction,
                info.sheath_thickness,
                info.diameter_over_sheath,
                info.insulation_max_operating_temp,
                info.screen_material,
                info.screen_thickness,
                info.armour_bedding_material,
                info.armour_bedding_thickness,
                info.diameter_bedding_over_armour,
                info.sheath_reinforcing_material,
                info.sheath_reinforcing_thickness,
                info.diameter_over_sheath_reinforcing,
                info.sheath_reinforcing_width,
                info.sheath_reinforcing_length_lay,
                info.sheath_reinforcing_no_tape,
                info.armour_material,
                info.armour_thickness,
                info.armour_layer_tape,
                info.armour_cross_sectional_area_tap,
                info.jacket_thickness,
                info.concentric_thickness,
                info.concentric_contruction,
                info.concentric_material,
                info.concentric_length_lay,
                info.concentric_area,
                info.concentric_no_of_wires,
                info.cable_info_id,
                info.phase_count,
                info.core_count,
                info.sheath_type,
                info.diameter_over_armour,
                mrid
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Update oldCableInfo failed' })
                }
                return resolve({ success: true, data: info, message: 'Update oldCableInfo completed' })
            }
        )
    })
}

// Xóa oldCableInfo (transaction)
export const deleteOldCableInfoTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM old_cable_info WHERE mrid=?", [mrid], function (err) {
            if (err) {
                return reject({ success: false, err, message: 'Delete oldCableInfo failed' })
            }
            return resolve({ success: true, data: mrid, message: 'Delete oldCableInfo completed' })
        })
    })
}