import { INIT_SCHEMA } from '@/config/database/schema';

export const initializeDatabaseFromSQL = async (dbsql) => {
    try {
        console.log('⏳ Starting database initialization from SQL file...');

        // 2. Thực thi file SQL
        // Lưu ý: sqlite3.Database.exec() có thể chạy nhiều câu lệnh cùng lúc phân tách bằng dấu ;
        await new Promise((resolve, reject) => {
            dbsql.exec(INIT_SCHEMA, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log('✅ Database initialized successfully.');
    } catch (err) {
        console.error('❌ Failed to initialize database:', err);
        throw err;
    }
};

// Thêm vào src/update/index.js hoặc file utility của bạn
export const getDbVersion = async (dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.get('PRAGMA user_version', (err, row) => {
            if (err) reject(err);
            else resolve(row.user_version);
        });
    });
};

export const setDbVersion = async (dbsql, version) => {
    return new Promise((resolve, reject) => {
        dbsql.run(`PRAGMA user_version = ${version}`, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

export const updateDatabaseFromSQL = async (dbsql, oldVersion, newVersion) => {
    console.log(dbsql)
}