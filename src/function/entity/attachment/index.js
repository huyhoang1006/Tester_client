import { v4 as newUuid } from 'uuid'
import db from '../../datacontext/index'
import * as attachmentContext from '../../attachmentcontext/index'
import { safePathSegment } from '@/utils/fileName'
import fs from 'fs';
import path from 'path';

/**
 * Lấy attachment của MỘT đối tượng.
 *
 * Mỗi (id_foreign, type) đúng ra chỉ có MỘT dòng: một asset một bộ file, một job một
 * bộ, mỗi work_task một bộ. Nhưng bảng `attachment` không có ràng buộc nào bắt điều đó
 * — nó chỉ có PRIMARY KEY(id), không có UNIQUE(id_foreign, type) và cũng không có khoá
 * ngoại nào (id_foreign là con trỏ đa hình: cùng cột trỏ sang asset, work, work_task…
 * tuỳ `type`). Nên SQLite không thể tự dọn theo, và cũng không chặn được dòng thứ hai.
 *
 * `db.get` chỉ trả về dòng ĐẦU TIÊN. Nếu có hai dòng thì dòng còn lại vô hình với mọi
 * lệnh đọc — và vì đường xoá chỉ xoá đúng `entity.attachment.id` vừa đọc được, dòng kia
 * thành rác vĩnh viễn. Đó là cách bảng attachment phình lên.
 *
 * Giờ đếm và cảnh báo, để tình trạng đó không còn im lặng nữa.
 */
export const getAttachmentByForeignIdAndType = async (id_foreign, type) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM attachment where id_foreign=? and type=?", [id_foreign, type], (err, rows) => {
            if (err)  return reject({success: false, err : err, message: 'Get all attachments failed'})
            if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'Attachment not found' })
            if (rows.length > 1) {
                console.warn(`[attachment] CO ${rows.length} dong cho (${id_foreign}, ${type}) — dang la rac, chi 1 dong duoc dung`,
                    rows.map(r => r.id))
            }
            return resolve({success: true, data: rows[0], message: 'Get all attachments completed'})
        })
    })
}

/** Mọi dòng attachment của một đối tượng — dùng khi cần dọn cho sạch, không chỉ đọc. */
export const getAllAttachmentsByForeignIdAndType = async (id_foreign, type) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM attachment where id_foreign=? and type=?", [id_foreign, type], (err, rows) => {
            if (err) return reject({ success: false, err, message: 'Get attachments by foreign id failed' })
            return resolve({ success: true, data: rows || [] })
        })
    })
}

export const getAttachmentById = async (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM attachment where id=?", [id], (err, row) => {
            if (err) return reject({success: false, err : err, message: 'Get attachment by id failed'})
            if (!row) return resolve({ success: false, data: null, message: 'Attachment not found' })
            return resolve({success: true, data: row, message: 'Get attachment by id completed'})
        })
    })
}

export const updateAttachmentById = async (id, attachment) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE attachment
             SET path = ?, name = ?, type = ?, id_foreign = ?
             WHERE id = ?`,
            [attachment.path, attachment.name, attachment.type, attachment.id_foreign, id],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update attachment failed' })
                return resolve({ success: true, data : attachment, message: 'Update attachment completed' })
            }
        )
    })
}

export const uploadAttachment = async (attachment) => {
    return new Promise((resolve, reject) => {
        const id = attachment.id || newUuid();
        db.run(
            `INSERT INTO attachment (id, id_foreign, type, name)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
                 id_foreign = excluded.id_foreign,
                 type = excluded.type,
                 name = excluded.name`,
            [
                id,
                attachment.id_foreign,
                attachment.type,
                attachment.name
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Upload attachment failed' });
                return resolve({ 
                    success: true, 
                    data: attachment, 
                    message: 'Upload attachment completed' 
                });
            }
        );
    });
};


/**
 * Ghi attachment cho một đối tượng.
 *
 * ─── VÌ SAO PHẢI DỌN DÒNG CŨ TRƯỚC ───────────────────────────────────────────
 *
 * `ON CONFLICT(id)` chỉ tránh trùng theo KHOÁ CHÍNH. Nhưng danh tính thật của một
 * attachment là **(id_foreign, type)** — "bộ file của asset X" — chứ không phải `id`.
 * Hai thứ đó không trùng nhau, và đó là chỗ sinh rác:
 *
 *   - Lần lưu đầu: id = A, id_foreign = asset-1  ->  1 dong
 *   - Lần sau chỗ gọi cấp id MỚI (import sinh uuid, nhân bản, tải về từ server đều
 *     làm vậy): id = B, id_foreign = asset-1  ->  ON CONFLICT(id) khong khop
 *                                               ->  THEM dong thu hai
 *
 * Từ đó `getAttachmentByForeignIdAndType` chỉ thấy một trong hai, và lệnh xoá node chỉ
 * xoá đúng dòng nó đọc được. Dòng còn lại không ai đọc, không ai xoá — nằm lại mãi.
 * Đây là nguyên nhân bảng `attachment` đầy dòng mồ côi.
 *
 * Nên trước khi ghi, xoá mọi dòng CÙNG (id_foreign, type) mà KHÁC id. Vậy bất biến
 * "một đối tượng một dòng" được giữ ngay tại chỗ ghi, thay vì trông vào lời hứa rằng
 * mọi chỗ gọi đều truyền lại đúng id cũ.
 */
export const uploadAttachmentTransaction = async (attachment, dbsql) => {
    return new Promise((resolve, reject) => {
        const id = attachment.id || newUuid();
        dbsql.run(
            `DELETE FROM attachment
              WHERE id_foreign = ? AND type = ? AND id <> ?`,
            [attachment.id_foreign, attachment.type, id],
            function (cleanupErr) {
                if (cleanupErr) return reject({ success: false, err: cleanupErr, message: 'Upload attachment failed' })
                if (this && this.changes > 0) {
                    console.warn(`[attachment] da don ${this.changes} dong cu cho (${attachment.id_foreign}, ${attachment.type})`)
                }
                writeAttachmentRow(attachment, id, dbsql, resolve, reject)
            }
        )
    })
}

const writeAttachmentRow = (attachment, id, dbsql, resolve, reject) => {
    dbsql.run(
            `INSERT INTO attachment (id, path, id_foreign, type, name)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
                 path = excluded.path,
                 id_foreign = excluded.id_foreign,
                 type = excluded.type,
                 name = excluded.name`,
            [
                id,
                attachment.path,
                attachment.id_foreign,
                attachment.type,
                attachment.name
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Upload attachment failed' });
                return resolve({
                    success: true,
                    data: { ...attachment, id },
                    message: 'Upload attachment completed'
                });
            }
    );
};

/**
 * Đồng bộ file từ srcList vào destDir, đảm bảo rollback cả file ghi đè và file mới nếu có lỗi
 * @param {Array} srcList - Mảng { path: '...' }
 * @param {String} dest - Thư mục đích - attachmentContext.getAttachmentDir()
 */
export const syncFilesWithFullRollback = (srcList, dest, fatherMrid) => {
    const result = {
        success: false,
        copiedFiles: [],
        skippedFiles: [],
        restoredFiles: [],
        error: null,
    };
    const destDir = path.join(dest || attachmentContext.getAttachmentDir(), fatherMrid || '');
    const backupDir = path.join(destDir, '__backup__');
    const copied = [];

    try {
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        // ✅ 1. Kiểm tra tồn tại của tất cả src file
        const missing = srcList.filter(item => !fs.existsSync(item.path));
        if (missing.length > 0) {
            result.skippedFiles = missing.map(f => path.basename(f.path));
            result.error = 'Some source files do not exist.';
            return result;
        }

        // ✅ 2. Tạo thư mục backup
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }

        // ✅ 3. Copy từng file
        for (const item of srcList) {
            const fileName = path.basename(item.path);
            const destPath = path.join(destDir, fileName);
            const backupPath = path.join(backupDir, fileName);

            // 👉 Nếu file đã tồn tại → di chuyển sang backup
            if (fs.existsSync(destPath)) {
                fs.copyFileSync(destPath, backupPath);
            }

            try {
                fs.copyFileSync(item.path, destPath); // ghi đè
                copied.push(destPath);
                result.copiedFiles.push(fileName);
            } catch (err) {
                // ❌ Rollback toàn bộ nếu lỗi
                for (const filePath of copied) {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                }

                // ✅ Khôi phục file từ backup
                const backupFiles = fs.readdirSync(backupDir);
                for (const bFile of backupFiles) {
                    const from = path.join(backupDir, bFile);
                    const to = path.join(destDir, bFile);
                    fs.copyFileSync(from, to);
                    result.restoredFiles.push(bFile);
                }

                result.error = `Failed copying ${fileName}: ${err.message}`;
                return result;
            }
        }

        // ✅ 4. Xóa backup nếu thành công
        fs.rmSync(backupDir, { recursive: true, force: true });

        result.success = true;
        return result;

    } catch (fatalErr) {
        result.error = fatalErr.message;
        return result;
    }
};

export const backupAllFilesInDir = (srcDir, backupDir, fatherMrid) => {
    srcDir = path.join(srcDir || attachmentContext.getAttachmentDir(), fatherMrid || '');
    backupDir = backupDir || path.join(srcDir, '__backup__');
    try {
        // Check if source directory exists first
        if (!fs.existsSync(srcDir)) {
            // If source directory doesn't exist, create it and return empty array
            fs.mkdirSync(srcDir, { recursive: true });
            return [];
        }

        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const files = fs.readdirSync(srcDir);
        const backedUp = [];

        for (const file of files) {
            const srcPath = path.join(srcDir, file);
            const backupPath = path.join(backupDir, file);

            if (fs.statSync(srcPath).isFile()) {
                fs.copyFileSync(srcPath, backupPath);
                backedUp.push(file);
            }
        }
        return backedUp;
    } catch (err) {
        // Có thể log hoặc trả về thông tin lỗi nếu muốn
        return { success: false, error: err.message };
    }
};

/**
 * Ghi đè các file trong srcList vào destDir.
 * Đồng thời xóa những file trong destDir không có trong srcList.
 */
export const syncFilesWithDeletion = (srcList, destDir, fatherMrid) => {
    const result = {
        success: false,
        copiedFiles: [],
        deletedFiles: [],
        skippedFiles: [],
        data: [],
        error: null
    };

    destDir = destDir || attachmentContext.getAttachmentDir();
    destDir = path.join(destDir, fatherMrid || '');

    try {
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

        // ✅ Chuẩn hóa srcList
        if (!Array.isArray(srcList)) srcList = [];

        const srcFileNames = srcList
            .filter(item => item && item.path)
            .map(item => path.basename(item.path));
        const existingItems = fs.readdirSync(destDir);

        // ✅ Nếu srcList rỗng → xóa hết file
        for (const item of existingItems) {
            const fullPath = path.join(destDir, item);
            if (fs.statSync(fullPath).isDirectory()) continue;

            if (!srcFileNames.includes(item)) {
                fs.unlinkSync(fullPath);
                result.deletedFiles.push(item);
            }
        }

        // copy file mới (nếu có)
        for (const item of srcList) {
            if (!item || !item.path) {
                continue;
            }
            const fileName = path.basename(item.path);
            const destPath = path.join(destDir, fileName);

            if (!fs.existsSync(item.path)) {
                result.skippedFiles.push(fileName);
                continue;
            }

            if (path.resolve(item.path) !== path.resolve(destPath)) {
                fs.copyFileSync(item.path, destPath);
            }
            result.copiedFiles.push(fileName);
            result.data.push({
                ...item,
                path: destPath,
                name: item.name || fileName
            });
        }

        result.success = true;
        return result;

    } catch (err) {
        result.error = err;
        return result;
    }
};


export const deleteBackupFiles = (backupDir, fatherMrid) => {
    backupDir = backupDir || path.join(attachmentContext.getAttachmentDir(), fatherMrid || '', '__backup__');
    if (fs.existsSync(backupDir)) {
        fs.rmSync(backupDir, { recursive: true, force: true });
        return true;
    }
    return false;
};

export const deleteDirectory = (directory, fatherMrid) => {
    directory = directory || path.join(attachmentContext.getAttachmentDir(), fatherMrid);
    if (fs.existsSync(directory)) {
        fs.rmSync(directory, { recursive: true, force: true });
    }
};

/**
 * Xoá HẲN thư mục file của một đối tượng (asset / job / work_task / substation…).
 *
 * ─── VÌ SAO CẦN HÀM RIÊNG, KHÔNG GỌI deleteDirectory TRỰC TIẾP ────────────────
 *
 * `deleteDirectory(null, undefined)` cho ra `path.join(<goc attachment>, undefined)`
 * và `fs.rmSync(recursive: true, force: true)` sẽ xoá SẠCH thư mục attachment gốc —
 * toàn bộ file của mọi node, không hỏi lại, không hoàn tác được.
 *
 * Đó không phải lo xa. Sáu đường xoá từng truyền `data.mrid`, mà các lớp Flatten
 * (SubstationEntity, CurrentTransformerEntity…) KHÔNG có `this.mrid` — chúng chỉ có
 * `this.substation.mrid`, `this.asset.mrid`. Nên tham số đó vẫn luôn là `undefined`,
 * và may là nó rơi vào `syncFilesWithDeletion` (hàm này bỏ qua thư mục con) chứ không
 * rơi vào `rmSync`.
 *
 * Nên chốt an toàn nằm ở đây, một chỗ: mrid rỗng thì TỪ CHỐI và ghi log, thay vì tin
 * rằng mười ba chỗ gọi đều truyền đúng.
 *
 * ─── VÀ VÌ SAO KHÔNG DÙNG syncFilesWithDeletion ĐỂ XOÁ ───────────────────────
 *
 * `syncFilesWithDeletion` là hàm ĐỒNG BỘ KHI LƯU: nó `mkdirSync` thư mục nếu chưa có,
 * rồi bỏ qua mọi thư mục con. Dùng nó để xoá thì folder ở lại — và nếu đối tượng chưa
 * từng có folder, nó còn TẠO một folder rỗng mới.
 *
 * @returns {boolean} đã xoá được hay không
 */
export const deleteAttachmentFolder = (mrid) => {
    const owner = mrid === null || mrid === undefined ? '' : String(mrid).trim()
    if (!owner) {
        console.warn('[attachment] deleteAttachmentFolder bi goi voi mrid rong — bo qua de khong xoa sach thu muc goc')
        return false
    }
    const directory = path.join(attachmentContext.getAttachmentDir(), safePathSegment(owner))
    if (!fs.existsSync(directory)) return false
    try {
        fs.rmSync(directory, { recursive: true, force: true })
        return true
    } catch (error) {
        // Không ném ra ngoài: DB đã COMMIT xong, và một file bị khoá không đáng để
        // báo cho người dùng là "xoá thất bại" khi bản ghi đã biến mất thật.
        console.warn('[attachment] khong xoa duoc thu muc', directory, error && error.message)
        return false
    }
}


export const restoreFiles = (backupDir, destDir, fatherMrid) => {
    const restored = [];
    backupDir = backupDir || path.join(attachmentContext.getAttachmentDir(), fatherMrid || '', '__backup__');
    destDir = destDir || path.join(attachmentContext.getAttachmentDir(), fatherMrid || '');

    if (!fs.existsSync(backupDir)) {
        // If backup directory doesn't exist, there's nothing to restore
        return restored;
    }

    const backupFiles = fs.readdirSync(backupDir);
    for (const fileName of backupFiles) {
        const from = path.join(backupDir, fileName);
        const to = path.join(destDir, fileName);

        fs.copyFileSync(from, to);
        restored.push(fileName);
    }

    return restored;
};

export const deleteAttachmentById = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM attachment WHERE id = ?", [id], (err) => {
            if (err) return reject({ success: false, err, message: 'Delete attachment failed' })
            return resolve({ success: true, data: id, message: 'Delete attachment completed' })
        })
    })
}

export const deleteAttachmentByIdTransaction = (id, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM attachment WHERE id = ?", [id], (err) => {
            if (err) return reject({ success: false, err, message: 'Delete attachment failed' })
            return resolve({ success: true, data: id, message: 'Delete attachment completed' })
        })
    })
}
