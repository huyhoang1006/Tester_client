/* eslint-disable */
import db from '../../datacontext/index'

// ─── Lấy toàn bộ template ────────────────────────────────────────────────────
export const getAllTemplates = async () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM template ORDER BY name', [], (err, rows) => {
            if (err) return reject({ success: false, err, message: 'Get templates failed' })
            return resolve({ success: true, data: rows })
        })
    })
}

// ─── Lấy 1 template theo name ─────────────────────────────────────────────────
export const getTemplateByName = async (name) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM template WHERE name = ?', [name], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get template failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Template not found' })
            return resolve({ success: true, data: row })
        })
    })
}

// ─── Tạo mới template ─────────────────────────────────────────────────────────
export const insertTemplate = async (template) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO template (name, path, variable) VALUES (?, ?, ?)`,
            [template.name, template.path, template.variable],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert template failed' })
                return resolve({ success: true, data: template, message: 'Insert template completed' })
            }
        )
    })
}

// ─── Cập nhật template ────────────────────────────────────────────────────────
export const updateTemplate = async (template) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE template SET path = ?, variable = ? WHERE name = ?`,
            [template.path, template.variable, template.name],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update template failed' })
                return resolve({ success: true, data: template, message: 'Update template completed' })
            }
        )
    })
}

// ─── Xóa template ────────────────────────────────────────────────────────────
export const deleteTemplate = async (name) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM template WHERE name = ?', [name], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete template failed' })
            return resolve({ success: true, message: 'Delete template completed' })
        })
    })
}
