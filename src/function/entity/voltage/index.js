import db from '../../datacontext/index.js'
import { insertVoltageTransaction, getVoltageById, deleteVoltageByIdTransaction } from '@/function/cim/voltage';
import { insertBaseVoltageTransaction, getBaseVoltageById, deleteBaseVoltageByIdTransaction } from '@/function/cim/baseVoltage';
import { insertVoltageLevelTransaction, getVoltageLevelById, deleteVoltageLevelByIdTransaction } from '@/function/cim/voltageLevel';
export const insertVoltageLevelEntity = async (entity) => {
    try {
        if(entity.voltageLevel.mrid) {
            await runAsync('BEGIN TRANSACTION');
            if(entity.voltage && entity.voltage.length > 0) {
                for(const voltage of entity.voltage) {
                    await insertVoltageTransaction(voltage, db);
                }
            }
            await insertBaseVoltageTransaction(entity.baseVoltage, db);
            await insertVoltageLevelTransaction(entity.voltageLevel, db);
            await runAsync('COMMIT');
            return { success: true, data: entity, message: 'Voltage level entity inserted successfully' };
        } else {
            return { success: false, message: 'Error retrieving voltage entity, id is required'};
        }
    } catch (error) {
        console.error('Error retrieving voltage entity:', error);
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error retrieving voltage entity'};
    }
}

export const getVoltageLevelEntity = async (id) => {
    const data = {
        voltageLevel : null,
        baseVoltage : null,
        voltage : []
    };
    try {
        const dataVoltageLevel = await getVoltageLevelById(id);
        if (dataVoltageLevel.success) {
            data.voltageLevel = dataVoltageLevel.data;
            const baseVoltage = await getBaseVoltageById(dataVoltageLevel.data.base_voltage);
            if(baseVoltage.success) {
                data.baseVoltage = baseVoltage.data;
                const voltage = await getVoltageById(baseVoltage.data.nominal_voltage);
                if(voltage.success) {
                    data.voltage.push(voltage.data);
                }
            }
            const highVoltageLimitData = await getVoltageById(dataVoltageLevel.data.high_voltage_limit);
            if(highVoltageLimitData.success) {
                data.voltage.push(highVoltageLimitData.data);
            }
            const lowVoltageLimitData = await getVoltageById(dataVoltageLevel.data.low_voltage_limit);
            if(lowVoltageLimitData.success) {
                data.voltage.push(lowVoltageLimitData.data);
            }
            return { success: true, data : data, message: 'Voltage level entity retrieved successfully' };
        } else {
            return { success: false, message: 'Error retrieving voltage level entity' };
        }
    } catch (error) {
        console.error('Error retrieving voltage level entity:', error);
        return { success: false, error, message: 'Error retrieving voltage level entity' };
    }
}

export const deleteVoltageLevelById = async (data) => {
    try {
        await runAsync('BEGIN TRANSACTION')
        if (data.voltageLevel || data.voltageLevel.mrid) {
            await deleteVoltageLevelByIdTransaction(data.voltageLevel.mrid, db);
        }
        if (data.baseVoltage && data.baseVoltage.mrid) {
            await deleteBaseVoltageByIdTransaction(data.baseVoltage.mrid, db);
        }
        if (data.voltage && data.voltage.length > 0) {
            for (const voltage of data.voltage) {
                await deleteVoltageByIdTransaction(voltage.mrid, db);
            }
        }
        await runAsync('COMMIT');
        return { success: true, data: data, message: 'Voltage level deleted successfully' };
    } catch (error) {
        await runAsync('ROLLBACK');
        console.error('Error deleting voltage level by id:', error);
        return { success: false, error, message: 'Error deleting voltage level by id' };
    }
}

const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
};
