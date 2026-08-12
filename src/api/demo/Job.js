import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'

const prefix = 'api/job'

/**
 * Slug loại thiết bị trên URL job, khớp với sáu file *Job.js bên cạnh.
 *
 * Server chỉ dùng slug này để định tuyến và ghi log — sáu loại thiết bị dùng CHUNG
 * một hình dạng payload, vì cây dữ liệu job không phụ thuộc loại thiết bị. Loại
 * thật của job nằm ở `assetId`, do asset-service quản lý.
 *
 * Khoá là `node.asset` trên cây, tức nhãn hiển thị.
 */
export const JOB_KIND_BY_ASSET = {
    'Transformer':          'transformer',
    'Voltage transformer':  'vt',
    'Current transformer':  'ct',
    'Circuit breaker':      'cb',
    'Disconnector':         'dc',
    'Surge arrester':       'sa',
}

/**
 * TẤT CẢ JOB của một thiết bị — dùng để dựng nhánh job trên cây server.
 *
 * Cố ý để một hàm dùng chung thay vì thêm sáu bản sao vào sáu file *Job.js: sáu
 * file kia tách riêng vì phía client mỗi loại có mapper riêng, còn ở đây thì chỉ
 * khác đúng một chuỗi trên URL.
 *
 * Server trả mảng RỖNG kèm 200 nếu thiết bị chưa có job nào — đó là trạng thái
 * bình thường của một thiết bị mới, không phải 404.
 *
 * @param {string} assetType nhãn loại thiết bị, vd 'Voltage transformer'
 * @param {string} assetId   mrid thiết bị (dạng local cũng được, tự cắt hậu tố)
 * @returns {Promise<Array>} tóm tắt các job, mới nhất trước
 */
export const getJobsByAsset = (assetType, assetId) => {
    const kind = JOB_KIND_BY_ASSET[assetType]
    if (!kind) return Promise.resolve([])
    return client.get(`/${prefix}/${kind}/by-asset/${toServerId(assetId)}`)
}
