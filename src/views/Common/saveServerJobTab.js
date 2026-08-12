/**
 * Lưu một job đang mở trên tab CÂY SERVER, ghi thẳng lên server.
 *
 * Khác hẳn `saveJob()` trong sáu mixin JobView — cái đó ghi xuống SQLite ở máy. Tab
 * server không nhất thiết có bản sao ở máy, và người dùng đang sửa dữ liệu trên
 * server, nên phải đi thẳng lên API.
 *
 * ─── PHIÊN BẢN LÀ PHẦN QUAN TRỌNG NHẤT ───────────────────────────────────────
 *
 * Server chỉ ghi khi `baseVersion` còn khớp. Số đó nhận được lúc TẢI JOB VỀ TAB,
 * và `loadServerJobTab` cất nó lên chính đối tượng tab (`tab._jobVersion`) — không
 * nhét vào DTO, vì DTO là dữ liệu job còn phiên bản là mốc đồng bộ; trộn vào nhau
 * thì phép gộp ba chiều sẽ coi nó như một trường thay đổi và sinh xung đột giả.
 *
 * Lưu xong phải cập nhật lại số mới, nếu không lần lưu thứ hai trong cùng phiên
 * sẽ ăn 409 dù chẳng ai tranh chấp.
 *
 * ─── KHÔNG ĐỤNG TỚI BẢN GỐC Ở MÁY ────────────────────────────────────────────
 *
 * Nếu job này cũng có bản sao ở máy thì sau lần lưu từ tab server, bản gốc trong
 * `entity_snapshot` trở nên cũ. CỐ Ý để nguyên: lần lưu từ phía client sau đó sẽ ăn
 * 409, người dùng tải lại và gộp. Đó đúng là hành vi mong muốn — hai bản đã lệch
 * thật, và giả vờ chúng còn đồng bộ mới là chỗ mất dữ liệu.
 */

import * as transformerJobAPI from '@/api/demo/TransformerJob.js'
import * as voltageTransformerJobAPI from '@/api/demo/VoltageTransformerJob.js'
import * as currentTransformerJobAPI from '@/api/demo/CurrentTransformerJob.js'
import * as circuitBreakerJobAPI from '@/api/demo/CircuitBreakerJob.js'
import * as disconnectorJobAPI from '@/api/demo/DisconnectorJob.js'
import * as surgeArresterJobAPI from '@/api/demo/SurgeArresterJob.js'

import * as transformerJobServerMapper from '@/views/Mapping/ServerToDTO/TransformerJob/index.js'
import * as voltageTransformerJobServerMapper from '@/views/Mapping/ServerToDTO/VoltageTransformerJob/index.js'
import * as currentTransformerJobServerMapper from '@/views/Mapping/ServerToDTO/CurrentTransformerJob/index.js'
import * as circuitBreakerJobServerMapper from '@/views/Mapping/ServerToDTO/CircuitBreakerJob/index.js'
import * as disconnectorJobServerMapper from '@/views/Mapping/ServerToDTO/DisconnectorJob/index.js'
import * as surgeArresterJobServerMapper from '@/views/Mapping/ServerToDTO/SurgeArresterJob/index.js'

/**
 * `dtoKey` là tên biến giữ DTO trong mixin của từng JobView. Sáu mixin đặt sáu tên
 * khác nhau cho cùng một thứ, nên phải tra bảng thay vì đoán.
 */
const REGISTRY = {
    'Transformer': {
        dtoKey:   'transformerJobDto',
        toServer: transformerJobServerMapper.mapDtoToServer,
        save:     (payload, deviceId) => transformerJobAPI.createTransformerJob(payload, deviceId),
    },
    'Voltage transformer': {
        dtoKey:   'voltageTransformerJobDto',
        toServer: voltageTransformerJobServerMapper.mapDtoToServer,
        save:     (payload, deviceId) => voltageTransformerJobAPI.createVoltageTransformerJob(payload, deviceId),
    },
    'Current transformer': {
        dtoKey:   'currentTransformerJobDto',
        toServer: currentTransformerJobServerMapper.mapDtoToServer,
        save:     (payload, deviceId) => currentTransformerJobAPI.createCurrentTransformerJob(payload, deviceId),
    },
    'Circuit breaker': {
        dtoKey:   'circuitBreakerJobDto',
        toServer: circuitBreakerJobServerMapper.mapDtoToServer,
        save:     (payload, deviceId) => circuitBreakerJobAPI.createCircuitBreakerJob(payload, deviceId),
    },
    'Disconnector': {
        dtoKey:   'disconnectorJobDto',
        toServer: disconnectorJobServerMapper.mapDtoToServer,
        save:     (payload, deviceId) => disconnectorJobAPI.createDisconnectorJob(payload, deviceId),
    },
    'Surge arrester': {
        dtoKey:   'surgeArresterJobDto',
        toServer: surgeArresterJobServerMapper.mapDtoToServer,
        save:     (payload, deviceId) => surgeArresterJobAPI.createSurgeArresterJob(payload, deviceId),
    },
}

/**
 * Đẩy nội dung đang hiển thị trên tab server lên server.
 *
 * @param {object} component instance JobView đang mở, để lấy DTO người dùng vừa sửa
 * @param {object} tab       node job; cần `mrid`, `parentId`, `job` và `_jobVersion`
 * @returns {Promise<{success: boolean, version?: number, conflict?: boolean, message?: string}>}
 *          `conflict: true` nghĩa là có người lưu trước — KHÔNG phải payload sai
 */
export async function saveServerJobTab(component, tab) {
    const entry = REGISTRY[tab && tab.job]
    if (!entry) {
        return { success: false, message: `Saving is not supported for ${tab && tab.job} jobs yet.` }
    }

    const dto = component && component[entry.dtoKey]
    if (!dto || !dto.properties) {
        return { success: false, message: 'Cannot read job data from the open tab.' }
    }
    if (!dto.properties.name) {
        return { success: false, message: 'Name is required' }
    }

    const payload = entry.toServer(JSON.parse(JSON.stringify(dto)))
    if (!payload) {
        return { success: false, message: 'Cannot build the payload for this job.' }
    }

    // undefined thì bỏ hẳn khoá đi, đừng gửi. Với server, `baseVersion: null` mang
    // nghĩa RẤT cụ thể — "job này chưa từng lên server" — và gửi nhầm nó lên một job
    // đang tồn tại chính là trường hợp server phải từ chối.
    if (tab._jobVersion !== null && tab._jobVersion !== undefined) {
        payload.baseVersion = tab._jobVersion
    }

    try {
        const response = await entry.save(payload, tab.parentId)
        const version = (response && response.data && response.data.version) !== undefined
            ? response.data.version
            : (response && response.version)

        return { success: true, version: version === undefined ? null : version }
    } catch (error) {
        if (error && error.response && error.response.data
            && error.response.data.code === 'VERSION_CONFLICT') {
            return {
                success: false,
                conflict: true,
                message: 'Someone else saved this job after you opened it. '
                    + 'Reload the tab to get their changes, then re-enter yours.'
            }
        }
        const detail = error && error.response && error.response.data
            && (error.response.data.message || error.response.data.error)
        return { success: false, message: detail || (error && error.message) || 'Save failed' }
    }
}
