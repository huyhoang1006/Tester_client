import db from '../../datacontext/index'
import { replaceLocalMrid } from './index'
import { suffixForAssetKind } from '@/utils/serverId'

/**
 * Chuẩn hoá mrid cũ về dạng có hậu tố loại node ("<id server>@<loại>").
 *
 * Node đã upload/download TRƯỚC khi có cơ chế hậu tố đang mang id server trần
 * (ví dụ '5558'). Hệ quả: lần download sau, code dựng ra '5558@ct', tra local
 * không thấy bản cũ ('5558') nên INSERT thêm một bản → NHÂN ĐÔI node.
 *
 * Chạy 1 lần, idempotent: mrid nào đã có '@' hoặc là uuid thì bỏ qua.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const safeAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows || []))
})

const safeGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row || null))
})

const CONTAINER_TABLE_SUFFIX = [
    ['organisation', 'org'],
    ['substation', 'sub'],
    ['voltage_level', 'vl'],
    ['bay', 'bay'],
    ['old_work', 'job']
]

/**
 * Suy ra hậu tố của 1 mrid.
 * Container: xem nó nằm ở bảng nào. Asset: đọc `asset.kind` — schema client KHÔNG có
 * bảng con riêng cho từng loại thiết bị, loại nằm ở cột này.
 */
const resolveSuffix = async (mrid) => {
    for (const [table, suffix] of CONTAINER_TABLE_SUFFIX) {
        const row = await safeGet(`SELECT 1 FROM ${table} WHERE mrid = ? LIMIT 1`, [mrid])
        if (row) return suffix
    }
    const asset = await safeGet(`SELECT kind FROM asset WHERE mrid = ? LIMIT 1`, [mrid])
    if (!asset) return null
    return suffixForAssetKind(asset.kind)
}

export const normalizeServerMrids = async () => {
    const rows = await safeAll(
        `SELECT mrid, name FROM identified_object
         WHERE mrid NOT LIKE '%@%'
           AND mrid GLOB '[0-9]*'
           AND mrid NOT LIKE '%-%'`
    )

    const result = { scanned: rows.length, renamed: 0, skipped: [], failed: [] }

    for (const row of rows) {
        const mrid = String(row.mrid)
        if (UUID_RE.test(mrid)) continue

        let suffix = null
        try {
            suffix = await resolveSuffix(mrid)
        } catch (error) {
            result.failed.push({ mrid, name: row.name, message: error.message })
            continue
        }
        if (!suffix) {
            result.skipped.push({ mrid, name: row.name, reason: 'Cannot determine node type' })
            continue
        }

        const newMrid = `${mrid}@${suffix}`
        const rs = await replaceLocalMrid(mrid, newMrid)
        if (rs && rs.success) {
            result.renamed += 1
        } else {
            // Thường gặp: đã có node khác chiếm chỗ newMrid (trùng serial trên server)
            result.failed.push({ mrid, name: row.name, newMrid, message: rs && rs.message })
        }
    }

    console.log('[NORMALIZE-MRID]', JSON.stringify(result))
    return { success: true, data: result }
}
