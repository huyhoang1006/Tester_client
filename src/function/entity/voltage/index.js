import db from '../../datacontext/index.js'
import { insertVoltageTransaction, getVoltageById, deleteVoltageByIdTransaction } from '@/function/cim/voltage';
import { insertBaseVoltageTransaction, getBaseVoltageById, deleteBaseVoltageByIdTransaction } from '@/function/cim/baseVoltage';
import { insertVoltageLevelTransaction, getVoltageLevelById, deleteVoltageLevelByIdTransaction } from '@/function/cim/voltageLevel';
import { deleteBayByIdTransaction, getBayByVoltageLevelOrSubstation } from '@/function/cim/bay';

/**
 * Insert VoltageLevel Entity vào database
 */
export const insertVoltageLevelEntity = async (entity) => {
    try {
        if (entity.voltageLevel.mrid) {
            await runAsync('BEGIN TRANSACTION');
            
            // Insert các Voltage trước
            if (entity.voltage && entity.voltage.length > 0) {
                for (const voltage of entity.voltage) {
                    await insertVoltageTransaction(voltage, db);
                }
            }
            
            // Insert BaseVoltage
            await insertBaseVoltageTransaction(entity.baseVoltage, db);
            
            // Insert VoltageLevel
            await insertVoltageLevelTransaction(entity.voltageLevel, db);
            
            await runAsync('COMMIT');
            return { success: true, data: entity, message: 'Voltage level entity inserted successfully' };
        } else {
            return { success: false, message: 'Error retrieving voltage entity, id is required' };
        }
    } catch (error) {
        console.error('Error retrieving voltage entity:', error);
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error retrieving voltage entity' };
    }
}

/**
 * Get VoltageLevel Entity từ database
 */
export const getVoltageLevelEntity = async (id) => {
    const data = {
        voltageLevel: null,
        baseVoltage: null,
        voltage: []
    };
    
    try {
        // Lấy VoltageLevel
        const dataVoltageLevel = await getVoltageLevelById(id);
        if (!dataVoltageLevel.success) {
            return { success: false, message: 'Error retrieving voltage level entity' };
        }
        
        data.voltageLevel = dataVoltageLevel.data;
        
        // Lấy BaseVoltage
        const baseVoltage = await getBaseVoltageById(dataVoltageLevel.data.base_voltage);
        if (baseVoltage.success) {
            data.baseVoltage = baseVoltage.data;
            
            // Lấy nominal voltage
            const voltage = await getVoltageById(baseVoltage.data.nominal_voltage);
            if (voltage.success) {
                data.voltage.push(voltage.data);
            }
        }
        
        // Lấy high voltage limit
        const highVoltageLimitData = await getVoltageById(dataVoltageLevel.data.high_voltage_limit);
        if (highVoltageLimitData.success) {
            data.voltage.push(highVoltageLimitData.data);
        }
        
        // Lấy low voltage limit
        const lowVoltageLimitData = await getVoltageById(dataVoltageLevel.data.low_voltage_limit);
        if (lowVoltageLimitData.success) {
            data.voltage.push(lowVoltageLimitData.data);
        }
        
        return { success: true, data: data, message: 'Voltage level entity retrieved successfully' };
    } catch (error) {
        console.error('Error retrieving voltage level entity:', error);
        return { success: false, error, message: 'Error retrieving voltage level entity' };
    }
}

/**
 * Delete VoltageLevel Entity từ database
 * Xóa theo thứ tự: Bay con → VoltageLevel → BaseVoltage → Voltage
 */
export const deleteVoltageLevelById = async (data) => {
    try {
        console.log('Starting delete VoltageLevel:', data.voltageLevel && data.voltageLevel.mrid)
        await runAsync('BEGIN TRANSACTION')
        
        // Bước 1: Xóa các Bay con (vì Bay có FK đến VoltageLevel)
        await deleteChildBays(data.voltageLevel)
        
        // Bước 2: Xóa VoltageLevel
        await deleteVoltageLevel(data.voltageLevel)
        
        // Bước 3: Xóa BaseVoltage (nếu không còn VoltageLevel nào dùng)
        await deleteBaseVoltageIfNotUsed(data.baseVoltage)
        
        // Bước 4: Xóa các Voltage (nếu không còn bảng nào dùng)
        await deleteVoltagesIfNotUsed(data.voltage)
        
        await runAsync('COMMIT');
        console.log('VoltageLevel deleted successfully')
        return { success: true, data: data, message: 'Voltage level deleted successfully' };
    } catch (error) {
        await runAsync('ROLLBACK');
        console.error('Error deleting voltage level by id:', error);
        return { success: false, error, message: 'Delete voltage failed' };
    }
}

/**
 * Xóa các Bay con của VoltageLevel
 */
async function deleteChildBays(voltageLevel) {
    if (!voltageLevel || !voltageLevel.mrid) return
    
    console.log('Checking for child Bays...')
    const baysResult = await getBayByVoltageLevelOrSubstation(voltageLevel.mrid, null)
    
    if (baysResult.success && baysResult.data && baysResult.data.length > 0) {
        console.log(`Found ${baysResult.data.length} child Bay(s), deleting...`)
        for (const bay of baysResult.data) {
            console.log('Deleting Bay:', bay.mrid)
            await deleteBayByIdTransaction(bay.mrid, db)
        }
    } else {
        console.log('No child Bays found')
    }
}

/**
 * Xóa VoltageLevel
 */
async function deleteVoltageLevel(voltageLevel) {
    if (!voltageLevel || !voltageLevel.mrid) return
    
    console.log('Deleting VoltageLevel:', voltageLevel.mrid)
    await deleteVoltageLevelByIdTransaction(voltageLevel.mrid, db)
}

/**
 * Xóa BaseVoltage nếu không còn VoltageLevel nào dùng
 */
async function deleteBaseVoltageIfNotUsed(baseVoltage) {
    if (!baseVoltage || !baseVoltage.mrid) return
    
    console.log('Checking if BaseVoltage is used by other VoltageLevels:', baseVoltage.mrid)
    
    const count = await countUsageInTable('voltage_level', 'base_voltage', baseVoltage.mrid)
    
    if (count === 0) {
        console.log('BaseVoltage not used by others, deleting:', baseVoltage.mrid)
        await deleteBaseVoltageByIdTransaction(baseVoltage.mrid, db)
    } else {
        console.log('BaseVoltage still used by', count, 'other VoltageLevel(s), skipping delete')
    }
}

/**
 * Xóa các Voltage nếu không còn bảng nào dùng
 */
async function deleteVoltagesIfNotUsed(voltages) {
    if (!voltages || voltages.length === 0) return
    
    console.log(`Checking ${voltages.length} Voltage(s)`)
    
    for (const voltage of voltages) {
        // Kiểm tra xem Voltage có đang được dùng không
        const usedInVL = await countUsageInVoltageLevelTable(voltage.mrid)
        const usedInBV = await countUsageInTable('base_voltage', 'nominal_voltage', voltage.mrid)
        
        if (usedInVL === 0 && usedInBV === 0) {
            console.log('Voltage not used by others, deleting:', voltage.mrid)
            await deleteVoltageByIdTransaction(voltage.mrid, db)
        } else {
            console.log('Voltage still used by others (VL:', usedInVL, ', BV:', usedInBV, '), skipping delete:', voltage.mrid)
        }
    }
}

/**
 * Đếm số lần một giá trị được dùng trong một bảng
 */
function countUsageInTable(tableName, columnName, value) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT COUNT(*) as count FROM ${tableName} WHERE ${columnName} = ?`, 
            [value], 
            (err, row) => {
                if (err) reject(err)
                else resolve(row.count)
            }
        )
    })
}

/**
 * Đếm số lần một Voltage được dùng trong bảng voltage_level
 * (kiểm tra cả high_voltage_limit và low_voltage_limit)
 */
function countUsageInVoltageLevelTable(voltageMrid) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT COUNT(*) as count FROM voltage_level 
             WHERE high_voltage_limit = ? OR low_voltage_limit = ?`, 
            [voltageMrid, voltageMrid], 
            (err, row) => {
                if (err) reject(err)
                else resolve(row.count)
            }
        )
    })
}

/**
 * Helper function để chạy SQL command
 */
const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
};
