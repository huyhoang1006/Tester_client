export const insertBreakerEntity = async (old_entity, entity) => {
    return {
        success: true,
        data: entity,
        message: 'insert Breaker entity successfully',
    };
}

export const getBreakerEntity = async (id, psrId) => {
    return {
        success: true,
        data: [],
        message: 'get Breaker entity successfully',
    };
}

export const deleteBreakerEntity = async (entity) => {
    return {
        success: true,
        data: entity,
        message: 'delete Breaker entity successfully',
    };
}

const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
}; 