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

/**
 * ĐỒNG BỘ BẢNG MỚI VÀO DB ĐANG CÓ — chạy MỖI LẦN KHỞI ĐỘNG.
 *
 * ─── VÌ SAO PHẢI CÓ HÀM NÀY ──────────────────────────────────────────────────
 *
 * `initializeDatabaseFromSQL` chỉ chạy khi DB CHƯA CÓ version, tức đúng lần đầu. DB đã
 * dùng rồi thì rơi vào nhánh so version, mà nhánh đó chỉ chạy khi `LATEST_DB_VERSION`
 * tăng lên. Hệ quả: thêm bảng mới vào `schema.js` thì máy mới có bảng, máy đang dùng
 * KHÔNG có — và lỗi chỉ lộ ra lúc ghi, dưới dạng `SQLITE_ERROR: no such table`.
 *
 * Đúng thứ vừa xảy ra với `ct_excitation_point` và `ct_excitation_knee_point`.
 *
 * ─── VÌ SAO CHẠY LẠI CẢ FILE SCHEMA LÀ AN TOÀN ──────────────────────────────
 *
 * Đã đếm: 241 CREATE TABLE và 6 CREATE INDEX, TẤT CẢ đều `IF NOT EXISTS`, không có một
 * câu DROP / ALTER / INSERT / DELETE nào. Nên chạy lại chỉ tạo thứ còn thiếu và không
 * đụng tới bảng đang có dữ liệu.
 *
 * ─── ĐIỀU HÀM NÀY KHÔNG LÀM ─────────────────────────────────────────────────
 *
 * Nó KHÔNG thêm cột vào bảng đã tồn tại — `CREATE TABLE IF NOT EXISTS` thấy bảng có rồi
 * là bỏ qua toàn bộ, kể cả khi định nghĩa đã đổi. Thêm cột vẫn phải viết ALTER TABLE
 * riêng và tăng version. Ghi rõ ở đây để đừng ai tưởng gọi hàm này là xong mọi thay đổi
 * schema.
 */
export const syncSchemaTables = async (dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.exec(INIT_SCHEMA, (err) => {
            if (err) {
                console.error('❌ Sync schema failed:', err)
                return reject(err)
            }
            resolve()
        })
    })
}

export const updateDatabaseFromSQL = async (dbsql, oldVersion, newVersion) => {
    console.log(`Sync schema for database upgrade ${oldVersion} -> ${newVersion}`)
    await syncSchemaTables(dbsql)
}