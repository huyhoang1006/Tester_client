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

const getTableColumns = async (dbsql, table) => {
    return new Promise((resolve, reject) => {
        dbsql.all(`PRAGMA table_info("${table}")`, (err, rows) => {
            if (err) return reject(err)
            resolve(new Set((rows || []).map((row) => row.name)))
        })
    })
}

const run = async (dbsql, sql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(sql, (err) => {
            if (err) return reject(err)
            resolve()
        })
    })
}

/**
 * Store computed, customized and unsupported vector groups independently.
 * The backfill preserves records written by older versions that used one value
 * plus vector_group_type to represent all three inputs.
 */
export const ensureTransformerVectorGroupColumns = async (dbsql) => {
    const table = 'old_power_transformer_info'
    const columns = await getTableColumns(dbsql, table)
    const additions = [
        ['vector_group_data', 'TEXT'],
        ['vector_group_custom', 'TEXT'],
        ['unsupported_vector_group', 'TEXT']
    ]

    for (const [name, type] of additions) {
        if (!columns.has(name)) {
            await run(dbsql, `ALTER TABLE "${table}" ADD COLUMN "${name}" ${type}`)
        }
    }

    await run(dbsql, `
        UPDATE "${table}"
        SET vector_group_data = CASE
                WHEN COALESCE(vector_group_data, '') = ''
                    AND COALESCE(vector_group_type, '') NOT IN ('custom', 'unsupport')
                THEN vector_group
                ELSE vector_group_data
            END,
            vector_group_custom = CASE
                WHEN COALESCE(vector_group_custom, '') = '' AND vector_group_type = 'custom'
                THEN vector_group
                ELSE vector_group_custom
            END,
            unsupported_vector_group = CASE
                WHEN COALESCE(unsupported_vector_group, '') = '' AND vector_group_type = 'unsupport'
                THEN vector_group
                ELSE unsupported_vector_group
            END
    `)
}

export const ensureSubstationOperatingDateColumn = async (dbsql) => {
    const table = 'substation'
    const columns = await getTableColumns(dbsql, table)
    if (!columns.has('operating_date')) {
        await run(dbsql, `ALTER TABLE "${table}" ADD COLUMN "operating_date" TEXT`)
    }
}

export const ensureCtCoreInfoClassRatingColumns = async (dbsql) => {
    const table = 'ct_core_info'
    const columns = await getTableColumns(dbsql, table)
    const additions = [
        ['t1', 'TEXT'],
        ['tal1', 'TEXT'],
        ['tpts', 'TEXT']
    ]

    for (const [name, type] of additions) {
        if (!columns.has(name)) {
            await run(dbsql, `ALTER TABLE "${table}" ADD COLUMN "${name}" ${type}`)
        }
    }
}

export const ensureWorkTaskMetadataColumns = async (dbsql) => {
    const table = 'work_task'
    const migrationKey = 'work_task_metadata_v3'
    const columns = await getTableColumns(dbsql, table)
    const additions = [
        ['test_name', 'TEXT'],
        ['type', 'TEXT'],
        ['test_type_code', 'TEXT'],
        ['testing_date', 'TEXT'],
        ['tested_by', 'TEXT'],
        ['approved_by', 'TEXT'],
        ['approved_date', 'TEXT'],
        ['reference_standard', 'TEXT']
    ]

    for (const [name, type] of additions) {
        if (!columns.has(name)) {
            await run(dbsql, `ALTER TABLE "${table}" ADD COLUMN "${name}" ${type}`)
        }
    }

    const migrated = await new Promise((resolve, reject) => {
        dbsql.get('SELECT value FROM app_settings WHERE key = ?', [migrationKey], (err, row) => {
            if (err) return reject(err)
            resolve(row && row.value === '1')
        })
    })
    if (migrated) return

    if (columns.has('job_type')) {
        await run(dbsql, `UPDATE work_task SET type = COALESCE(NULLIF(type, ''), job_type)`)
    }

    await run(dbsql, `
        UPDATE work_task
        SET test_name = COALESCE(NULLIF(test_name, ''), (
                SELECT io.name FROM identified_object io WHERE io.mrid = work_task.mrid
            )),
            test_type_code = COALESCE(NULLIF(test_type_code, ''), (
                SELECT d.type FROM document d WHERE d.mrid = work_task.mrid
            )),
            type = COALESCE(NULLIF(type, ''), (
                SELECT d.type FROM document d WHERE d.mrid = work_task.work
            )),
            testing_date = COALESCE(NULLIF(testing_date, ''), (
                SELECT ow.execution_date FROM old_work ow WHERE ow.mrid = work_task.work
            )),
            tested_by = COALESCE(NULLIF(tested_by, ''), (
                SELECT ow.tested_by FROM old_work ow WHERE ow.mrid = work_task.work
            )),
            approved_by = COALESCE(NULLIF(approved_by, ''), (
                SELECT d.approver FROM document d WHERE d.mrid = work_task.work
            )),
            approved_date = COALESCE(NULLIF(approved_date, ''), (
                SELECT ow.approval_date FROM old_work ow WHERE ow.mrid = work_task.work
            )),
            reference_standard = COALESCE(NULLIF(reference_standard, ''), (
                SELECT ow.ref_standard FROM old_work ow WHERE ow.mrid = work_task.work
            ))
    `)

    if (columns.has('job_type')) {
        await run(dbsql, 'ALTER TABLE work_task DROP COLUMN job_type')
    }

    await new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO app_settings(key, value) VALUES(?, '1')
             ON CONFLICT(key) DO UPDATE SET value = '1'`,
            [migrationKey],
            (err) => err ? reject(err) : resolve()
        )
    })
}

export const updateDatabaseFromSQL = async (dbsql, oldVersion, newVersion) => {
    console.log(`Sync schema for database upgrade ${oldVersion} -> ${newVersion}`)
    await syncSchemaTables(dbsql)
    await ensureTransformerVectorGroupColumns(dbsql)
    await ensureSubstationOperatingDateColumn(dbsql)
    await ensureCtCoreInfoClassRatingColumns(dbsql)
    await ensureWorkTaskMetadataColumns(dbsql)
}
