import db from '../../datacontext/index.js'
import { insertBayTransaction, getBayById, deleteBayByIdTransaction} from '@/function/cim/bay';

export const insertBayEntity = async (entity) => {
    console.log('insertBayEntity', entity);
    try {
        if(entity.mrid) {
            await runAsync('BEGIN TRANSACTION');
            await insertBayTransaction(entity, db);
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

export const getBayEntity = async (id) => {
    try {
        const dataBay = await getBayById(id);
        if (dataBay.success) {
            return { success: true, data : dataBay.data, message: 'Bay entity retrieved successfully' };
        } else {
            return { success: false, message: 'Error retrieving bay entity' };
        }
    } catch (error) {
        console.error('Error retrieving bay entity:', error);
        return { success: false, error, message: 'Error retrieving bay entity' };
    }
}

export const deleteBayEntityById = async (data) => {
    try {
        await runAsync('BEGIN TRANSACTION')
        await deleteBayByIdTransaction(data.mrid, db);
        await runAsync('COMMIT');
        return { success: true, data: data, message: 'Bay deleted successfully' };
    } catch (error) {
        await runAsync('ROLLBACK');
        console.error('Error deleting bay by id:', error);
        return { success: false, error, message: 'Error deleting bay by id' };
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
