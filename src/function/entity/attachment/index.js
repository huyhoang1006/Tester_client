import { v4 as newUuid } from 'uuid'
import db from '../../datacontext/index'
import * as attachmentContext from '../../attachmentcontext/index'
import fs from 'fs';
import path from 'path';

export const getAttachmentByForeignIdAndType = async (id_foreign, type) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM attachment where id_foreign=? and type=?", [id_foreign, type], (err, row) => {
            if (err)  return reject({success: false, err : err, message: 'Get all attachments failed'})
            if (!row) return resolve({ success: false, data: null, message: 'Attachment not found' })
            return resolve({success: true, data: row, message: 'Get all attachments completed'})
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


export const uploadAttachmentTransaction = async (attachment, dbsql) => {
    return new Promise((resolve, reject) => {
        const id = attachment.id || newUuid();
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
    });
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
    console.log('Backup directory:', backupDir);
    try {
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
        data : [],
        error: null
    };

    destDir = destDir || attachmentContext.getAttachmentDir();
    destDir = path.join(destDir, fatherMrid || '');

    try {
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

        if(srcList === null || srcList.length === '') {
            srcList = [];
        }
        const srcFileNames = srcList.map(item => path.basename(item.path));
        const existingItems = fs.readdirSync(destDir);

        for (const item of existingItems) {
            const fullPath = path.join(destDir, item);
            if (fs.statSync(fullPath).isDirectory()) continue;
            if (!srcFileNames.includes(item)) {
                fs.unlinkSync(fullPath);
                result.deletedFiles.push(item);
            }
        }

        for (const item of srcList) {
            const fileName = path.basename(item.path);
            const destPath = path.join(destDir, fileName);
            if (!fs.existsSync(item.path)) {
                result.skippedFiles.push(fileName);
                continue;
            }
            fs.copyFileSync(item.path, destPath);
            result.copiedFiles.push(fileName);

            result.data.push({ path: destPath });
        }

        result.success = true;
        return result;

    } catch (err) {
        result.error = err.message;
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
    console.log('Deleting directory:', directory);
    directory = directory || path.join(attachmentContext.getAttachmentDir(), fatherMrid);
    if (fs.existsSync(directory)) {
        fs.rmSync(directory, { recursive: true, force: true });
    }
};


export const restoreFiles = (backupDir, destDir, fatherMrid) => {
    const restored = [];
    backupDir = backupDir || path.join(attachmentContext.getAttachmentDir(), fatherMrid || '', '__backup__');
    destDir = destDir || path.join(attachmentContext.getAttachmentDir(), fatherMrid || '');

    if (!fs.existsSync(backupDir)) {
        throw new Error(`Thư mục backup không tồn tại: ${backupDir}`);
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