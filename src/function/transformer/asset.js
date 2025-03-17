import { v4 as newUuid } from 'uuid'
import { NIL as EMPTY } from 'uuid'
import db from '../datacontext/index'

export const getAssets = (locationId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM assets where location_id=?", [locationId], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

export const insertAsset = (locationId, asset) => {
    const id = asset.properties.id || newUuid()
    
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO assets(id, location_id,	asset,	asset_type,	serial_no,	manufacturer,	manufacturer_type,	manufacturing_year,	asset_system_code,	apparatus_id,	feeder, date_of_warehouse_receipt, date_of_warehouse_delivery, progress, standard, date_of_delivery, date_of_production_order, comment, thermal_meter,	phases,	vector_group, vector_group_custom , unsupported_vector_group,	rated_frequency, voltage_ratings, voltage_regulation, power_ratings, current_ratings,	max_short_circuit_current_ka,	max_short_circuit_current_s,	ref_temp, prim_sec, prim_tert, sec_tert,	base_power,	base_voltage, zero_percent,	category,	status,	tank_type,	insulation_medium, oil_type, insulation_weight,	insulation_volume,	total_weight, winding)' +
            ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, locationId,
                asset.properties.asset, asset.properties.asset_type, asset.properties.serial_no, asset.properties.manufacturer, asset.properties.manufacturer_type, asset.properties.manufacturing_year, asset.properties.asset_system_code, asset.properties.apparatus_id, asset.properties.feeder, asset.properties.date_of_warehouse_receipt, asset.properties.date_of_warehouse_delivery, asset.properties.progress, asset.properties.standard, asset.properties.date_of_delivery, asset.properties.date_of_production_order, asset.properties.comment, asset.properties.thermal_meter,
                asset.winding_configuration.phases, JSON.stringify(asset.winding_configuration.vector_group), asset.winding_configuration.vector_group_custom, asset.winding_configuration.unsupported_vector_group,
                asset.ratings.rated_frequency !== 'Custom' ? asset.ratings.rated_frequency : asset.ratings.rated_frequency_custom, JSON.stringify(asset.ratings.voltage_ratings), JSON.stringify(asset.ratings.voltage_regulation), JSON.stringify(asset.ratings.power_ratings), JSON.stringify(asset.ratings.current_ratings), JSON.stringify(asset.ratings.short_circuit.ka), asset.ratings.short_circuit.s,
                asset.impedances.ref_temp, JSON.stringify(asset.impedances.prim_sec), JSON.stringify(asset.impedances.prim_tert), JSON.stringify(asset.impedances.sec_tert), JSON.stringify(asset.impedances.zero_sequence_impedance.base_power), JSON.stringify(asset.impedances.zero_sequence_impedance.base_voltage), asset.impedances.zero_sequence_impedance.zero_percent,
                asset.others.category, asset.others.status, asset.others.tank_type, asset.others.insulation_medium, asset.others.oil_type, asset.others.insulation.key === 'Weight' ? asset.others.insulation.weight : null, asset.others.insulation.key === 'Volume' ? asset.others.insulation.volume : null, asset.others.total_weight, JSON.stringify(asset.others.winding),
            ], function (err) {
                if (err) reject(err)
                resolve(id)
            })
    })
}

export const insertTapChanger = (tapChanger, assetId) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO tap_changers(id, asset_id, mode, serial_no,	manufacturer,	manufacturer_type, winding,	tap_scheme,	no_of_taps,	voltage_table)' +
            ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [tapChanger.id || newUuid(), assetId, tapChanger.mode, tapChanger.serial_no, tapChanger.manufacturer, tapChanger.manufacturer_type, tapChanger.winding, tapChanger.tap_scheme, tapChanger.no_of_taps, JSON.stringify(tapChanger.voltage_table)],
            function (err) {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const insertBushings = (bushings, assetId) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO bushings(id, asset_id, asset_type, serial_no,	manufacturer,	manufacturer_type, manufacturer_year,	insull_level,	voltage_gr,	max_sys_voltage, rate_current, df_c1, cap_c1, df_c2, cap_c2, insulation_type)' +
            ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [bushings.id || newUuid(), assetId, JSON.stringify(bushings.asset_type), JSON.stringify(bushings.serial_no), JSON.stringify(bushings.manufacturer), JSON.stringify(bushings.manufacturer_type), JSON.stringify(bushings.manufacturer_year), JSON.stringify(bushings.insull_level), JSON.stringify(bushings.voltage_gr), JSON.stringify(bushings.max_sys_voltage), JSON.stringify(bushings.rate_current), JSON.stringify(bushings.df_c1), JSON.stringify(bushings.cap_c1), JSON.stringify(bushings.df_c2), JSON.stringify(bushings.cap_c2), JSON.stringify(bushings.insulation_type)],
            function (err) {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const checkAssetExist = (asset) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM assets where serial_no = ? and asset_type = ? and id != ? ',
            [asset.properties.serial_no, asset.properties.asset_type, asset.properties.id], (err, row) => {
                if (err) reject(err)
                resolve(row !== undefined)
            })
    })
}

export const deleteAsset = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM assets WHERE id = ?", [id], (err) => {
            if (err) reject(err)
            resolve(true)
        })
    })
}

export const getAssetById = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM assets where id = ?", [id], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const updateAsset = (asset) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE assets' +
            ' SET asset=?,	asset_type=?,	serial_no=?,	manufacturer=?,	manufacturer_type=?,	manufacturing_year=?,	asset_system_code=?,	apparatus_id=?,	feeder=?,	date_of_warehouse_receipt=?, date_of_warehouse_delivery=?, progress=?, standard=?,	date_of_delivery=?,	date_of_production_order=?,	comment=?, thermal_meter=?,	phases=?,	vector_group=?,	vector_group_custom=?,	unsupported_vector_group=?, rated_frequency=?, voltage_ratings=?, voltage_regulation=?, power_ratings=?, current_ratings=?,	max_short_circuit_current_ka=?,	max_short_circuit_current_s=?,	ref_temp=?, prim_sec=?, prim_tert=?, sec_tert=?,	base_power=?,	base_voltage=?, zero_percent=?,	category=?,	status=?,	tank_type=?,	insulation_medium=?, oil_type=?, insulation_weight=?,	insulation_volume=?,	total_weight=?, winding=?' +
            ' WHERE id=?',
            [asset.properties.asset, asset.properties.asset_type, asset.properties.serial_no, asset.properties.manufacturer, asset.properties.manufacturer_type, asset.properties.manufacturing_year, asset.properties.asset_system_code, asset.properties.apparatus_id, asset.properties.feeder, asset.properties.date_of_warehouse_receipt, asset.properties.date_of_warehouse_delivery, asset.properties.progress, asset.properties.standard, asset.properties.date_of_delivery, asset.properties.date_of_production_order, asset.properties.comment, asset.properties.thermal_meter,
            asset.winding_configuration.phases, JSON.stringify(asset.winding_configuration.vector_group), asset.winding_configuration.vector_group_custom, asset.winding_configuration.unsupported_vector_group,
            asset.ratings.rated_frequency !== 'Custom' ? asset.ratings.rated_frequency : asset.ratings.rated_frequency_custom, JSON.stringify(asset.ratings.voltage_ratings), JSON.stringify(asset.ratings.voltage_regulation), JSON.stringify(asset.ratings.power_ratings), JSON.stringify(asset.ratings.current_ratings), JSON.stringify(asset.ratings.short_circuit.ka), asset.ratings.short_circuit.s,
            asset.impedances.ref_temp, JSON.stringify(asset.impedances.prim_sec), JSON.stringify(asset.impedances.prim_tert), JSON.stringify(asset.impedances.sec_tert), JSON.stringify(asset.impedances.zero_sequence_impedance.base_power), JSON.stringify(asset.impedances.zero_sequence_impedance.base_voltage), asset.impedances.zero_sequence_impedance.zero_percent,
            asset.others.category, asset.others.status, asset.others.tank_type, asset.others.insulation_medium, asset.others.oil_type, asset.others.insulation.key === 'Weight' ? asset.others.insulation.weight : null, asset.others.insulation.key === 'Volume' ? asset.others.insulation.volume : null, asset.others.total_weight, JSON.stringify(asset.others.winding),
            asset.properties.id], (err) => {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const importAsset = (locationId, asset) => {
        const id = newUuid()
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO assets(id, location_id, asset,	asset_type,	serial_no,	manufacturer,	manufacturer_type,	manufacturing_year,	asset_system_code,	apparatus_id,	feeder, date_of_warehouse_receipt, date_of_warehouse_delivery, progress, standard, date_of_delivery, date_of_production_order, comment, thermal_meter,	phases,	vector_group, vector_group_custom , unsupported_vector_group,	rated_frequency, voltage_ratings, voltage_regulation, power_ratings, current_ratings,	max_short_circuit_current_ka,	max_short_circuit_current_s,	ref_temp, prim_sec, prim_tert, sec_tert,	base_power,	base_voltage, zero_percent,	category,	status,	tank_type,	insulation_medium, oil_type, insulation_weight,	insulation_volume,	total_weight, winding)' +
                ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                locationId,
                asset.asset,
                asset.asset_type,
                asset.serial_no,
                asset.manufacturer,
                asset.manufacturer_type,
                asset.manufacturing_year,
                asset.asset_system_code,
                asset.apparatus_id,
                asset.feeder,
                asset.date_of_warehouse_receipt,
                asset.date_of_warehouse_delivery,
                asset.progress,
                asset.standard,
                asset.date_of_delivery,
                asset.date_of_production_order,
                asset.comment,
                asset.thermal_meter,
                asset.phases,
                asset.vector_group,
                asset.vector_group_custom,
                asset.unsupported_vector_group,
                asset.rated_frequency,
                asset.voltage_ratings,
                asset.voltage_regulation,
                asset.power_ratings,
                asset.current_ratings,
                asset.max_short_circuit_current_ka,
                asset.max_short_circuit_current_s,
                asset.ref_temp,
                asset.prim_sec,
                asset.prim_tert,
                asset.sec_tert,
                asset.base_power,
                asset.base_voltage,
                asset.zero_percent,
                asset.category,
                asset.status,
                asset.tank_type,
                asset.insulation_medium,
                asset.oil_type,
                asset.insulation_weight,
                asset.insulation_volume,
                asset.total_weight,
                asset.winding
            ],
            function (err) {
                if (err) reject(err)
                resolve(id)
            }
        )
    })
}

export const getTapChangerByAssetId = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM tap_changers where asset_id = ?", [id], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const getBushingsByAssetId = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM bushings where asset_id = ?", [id], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}



export const updateTapChanger = (tapChanger) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE tap_changers' +
            ' SET mode=?, serial_no=?, manufacturer=?,	manufacturer_type=?, winding=?,	tap_scheme=?,	no_of_taps=?,	voltage_table=?' +
            ' WHERE id=?',
            [tapChanger.mode, tapChanger.serial_no, tapChanger.manufacturer, tapChanger.manufacturer_type, tapChanger.winding, tapChanger.tap_scheme, tapChanger.no_of_taps, JSON.stringify(tapChanger.voltage_table),
            tapChanger.id],
            (err) => {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const updateBushings = (bushings) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE bushings' +
            ' SET asset_type=?, serial_no=?,  manufacturer=?, manufacturer_type=?,  manufacturer_year=?,  insull_level=?, voltage_gr=?, max_sys_voltage=?, rate_current=?,  df_c1=?, cap_c1=?,  df_c2=?, cap_c2=?,  insulation_type=?' +
            ' WHERE id=?',
            [JSON.stringify(bushings.asset_type), JSON.stringify(bushings.serial_no), JSON.stringify(bushings.manufacturer), JSON.stringify(bushings.manufacturer_type), JSON.stringify(bushings.manufacturer_year), JSON.stringify(bushings.insull_level), JSON.stringify(bushings.voltage_gr), JSON.stringify(bushings.max_sys_voltage), JSON.stringify(bushings.rate_current), JSON.stringify(bushings.df_c1), JSON.stringify(bushings.cap_c1), JSON.stringify(bushings.df_c2), JSON.stringify(bushings.cap_c2), JSON.stringify(bushings.insulation_type),
            bushings.id],
            (err) => {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const importBushing = (bushing, assetId) => {
    const id = newUuid()
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO bushings(id, asset_id, asset_type, serial_no,	manufacturer,	manufacturer_type, manufacturer_year,	insull_level,	voltage_gr,	max_sys_voltage, rate_current, df_c1, cap_c1, df_c2, cap_c2, insulation_type)' +
                ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                assetId,
                bushing.asset_type,
                bushing.serial_no,
                bushing.manufacturer,
                bushing.manufacturer_type,
                bushing.manufacturer_year,
                bushing.insull_level,
                bushing.voltage_gr,
                bushing.max_sys_voltage,
                bushing.rate_current,
                bushing.df_c1,
                bushing.cap_c1,
                bushing.df_c2,
                bushing.cap_c2,
                bushing.insulation_type
            ],
            function (err) {
                if (err) reject(err)
                resolve(id)
            }
        )
    })
}

export const importTapChanger = (tapChanger, assetId) => {
    const id = newUuid()
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO tap_changers(id, asset_id, mode, serial_no,	manufacturer,	manufacturer_type, winding,	tap_scheme,	no_of_taps,	voltage_table)' +
                ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                assetId,
                tapChanger.mode,
                tapChanger.serial_no,
                tapChanger.manufacturer,
                tapChanger.manufacturer_type,
                tapChanger.winding,
                tapChanger.tap_scheme,
                tapChanger.no_of_taps,
                tapChanger.voltage_table
            ],
            function (err) {
                if (err) reject(err)
                resolve(id)
            }
        )
    })
}

export const checkAssetNameExist = (serial_no) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM assets where serial_no = ?',
            [serial_no], (err, row) => {
                if (err) {
                    reject(err)
                } else {
                    if(row !== undefined) {
                        resolve(
                            {
                                exist : row !== undefined,
                                id : row.id
                            }
                        )
                    } else {
                        resolve(
                            {
                                exist : row !== undefined,
                            }
                        )
                    }
                }
            })
    })
}

export const importTransformerData = (asset) => {
    const id = newUuid()
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO assets(id, location_id, asset,	asset_type,	serial_no,	manufacturer,	manufacturer_type,	manufacturing_year,	asset_system_code,	apparatus_id,	feeder, date_of_warehouse_receipt, date_of_warehouse_delivery, progress, standard, date_of_delivery, date_of_production_order, comment, thermal_meter,	phases,	vector_group, vector_group_custom , unsupported_vector_group,	rated_frequency, voltage_ratings, voltage_regulation, power_ratings, current_ratings,	max_short_circuit_current_ka,	max_short_circuit_current_s,	ref_temp, prim_sec, prim_tert, sec_tert,	base_power,	base_voltage, zero_percent,	category,	status,	tank_type,	insulation_medium, oil_type, insulation_weight,	insulation_volume,	total_weight, winding)' +
                ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                asset.location_id,
                asset.asset,
                asset.asset_type,
                asset.serial_no,
                asset.manufacturer,
                asset.manufacturer_type,
                asset.manufacturing_year,
                asset.asset_system_code,
                asset.apparatus_id,
                asset.feeder,
                asset.date_of_warehouse_receipt,
                asset.date_of_warehouse_delivery,
                asset.progress,
                asset.standard,
                asset.date_of_delivery,
                asset.date_of_production_order,
                asset.comment,
                asset.thermal_meter,
                asset.phases,
                JSON.stringify(asset.vector_group),
                asset.vector_group_custom,
                asset.unsupported_vector_group,
                asset.rated_frequency,
                JSON.stringify(asset.voltage_ratings),
                JSON.stringify(asset.voltage_regulation),
                JSON.stringify(asset.power_ratings),
                JSON.stringify(asset.current_ratings),
                JSON.stringify(asset.max_short_circuit_current_ka),
                asset.max_short_circuit_current_s,
                asset.ref_temp,
                JSON.stringify(asset.prim_sec),
                JSON.stringify(asset.prim_tert),
                JSON.stringify(asset.sec_tert),
                JSON.stringify(asset.base_power),
                JSON.stringify(asset.base_voltage),
                asset.zero_percent,
                asset.category,
                asset.status,
                asset.tank_type,
                asset.insulation_medium,
                asset.oil_type,
                asset.insulation_weight,
                asset.insulation_volume,
                asset.total_weight,
                JSON.stringify(asset.winding)
            ],
            function (err) {
                if (err) reject(err)
                resolve(id)
            }
        )
    })
}

export const updateTransformerData = (asset) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE assets' +
            ' SET asset=?,	asset_type=?,	serial_no=?,	manufacturer=?,	manufacturer_type=?,	manufacturing_year=?,	asset_system_code=?,	apparatus_id=?,	feeder=?,	date_of_warehouse_receipt=?, date_of_warehouse_delivery=?, progress=?, standard=?,	date_of_delivery=?,	date_of_production_order=?,	comment=?, thermal_meter=?,	phases=?,	vector_group=?,	vector_group_custom=?,	unsupported_vector_group=?, rated_frequency=?, voltage_ratings=?, voltage_regulation=?, power_ratings=?, current_ratings=?,	max_short_circuit_current_ka=?,	max_short_circuit_current_s=?,	ref_temp=?, prim_sec=?, prim_tert=?, sec_tert=?,	base_power=?,	base_voltage=?, zero_percent=?,	category=?,	status=?,	tank_type=?,	insulation_medium=?, oil_type=?, insulation_weight=?,	insulation_volume=?,	total_weight=?, winding=?' +
            ' WHERE id=?',
            [asset.asset, asset.asset_type, asset.serial_no, asset.manufacturer, asset.manufacturer_type, asset.manufacturing_year, asset.asset_system_code, asset.apparatus_id, asset.feeder, asset.date_of_warehouse_receipt, asset.date_of_warehouse_delivery, asset.progress, asset.standard, asset.date_of_delivery, asset.date_of_production_order, asset.comment, asset.thermal_meter,
            asset.phases, JSON.stringify(asset.vector_group), asset.vector_group_custom, asset.unsupported_vector_group,
            asset.rated_frequency !== 'Custom' ? asset.rated_frequency : asset.rated_frequency_custom, JSON.stringify(asset.voltage_ratings), JSON.stringify(asset.voltage_regulation), JSON.stringify(asset.power_ratings), JSON.stringify(asset.current_ratings), JSON.stringify(asset.max_short_circuit_current_ka), asset.max_short_circuit_current_s,
            asset.ref_temp, JSON.stringify(asset.prim_sec), JSON.stringify(asset.prim_tert), JSON.stringify(asset.sec_tert), JSON.stringify(asset.base_power), JSON.stringify(asset.base_voltage), asset.zero_percent,
            asset.category, asset.status, asset.tank_type, asset.insulation_medium, asset.oil_type, asset.insulation_weight, asset.insulation_volume, asset.total_weight, JSON.stringify(asset.winding),
            asset.id], (err) => {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const checkBushingExist = (asset_id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM bushings where asset_id = ?", [asset_id], (err, row) => {
            if (err) reject(err)
            else {
                if(row !== undefined) {
                    resolve({
                        exist : row !== undefined,
                        id : row.id
                    })
                } else {
                    resolve({
                        exist : row !== undefined,
                    })
                }
            }
        })
    })
}
export const checkTapChangerExist = (asset_id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM tap_changers where asset_id = ?", [asset_id], (err, row) => {
            if (err) reject(err)
            else {
                if(row !== undefined) {
                    resolve({
                        exist : row !== undefined,
                        id : row.id
                    })
                } else {
                    resolve({
                        exist : row !== undefined,
                    })
                }
            }
        })
    })
}

export const relocateAsset = (asset) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE assets' +
            ' SET location_id=?, extend=?' +
            ' WHERE id=?',
            [asset.location_id, JSON.stringify(asset.extend), asset.id], (err) => {
                if (err) reject(err)
                resolve(true)
            })
    })
}
