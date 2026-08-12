/**
 * Nạp một tab JOB mở từ CÂY SERVER.
 *
 * ─── VÌ SAO CẦN ──────────────────────────────────────────────────────────────
 *
 * `Tabs.vue` có hai bộ nạp: `loadData` cho tab bên client (đọc SQLite) và
 * `loadDataServer` cho tab bên server (gọi API). Bộ thứ hai xử lý trạm, ngăn, cấp
 * điện áp, tổ chức và tám loại thiết bị — nhưng KHÔNG có nhánh nào cho `job`.
 *
 * Trước đây không sao, vì cây server dừng ở cấp thiết bị nên `mode === 'job'` không
 * bao giờ tới được đó. Từ khi cây có thêm nhánh job, nháy đúp vào một job chạy hết
 * chuỗi `if / else if` mà không khớp cái nào: không ai gọi `comp.loadData(...)`, tab
 * dựng lên TRẮNG TINH — không lỗi, không log, không gì để lần.
 *
 * ─── VÌ SAO TÁCH RA FILE RIÊNG ───────────────────────────────────────────────
 *
 * `Tabs.vue` đã hơn 1.700 dòng và nhánh job bên client chiếm gần 200 dòng cho sáu
 * loại. Chép thêm một bản nữa cho phía server là đẩy file đó tới chỗ không ai đọc
 * nổi. Ở đây sáu loại chung một hàm, `REGISTRY` giữ đúng phần khác nhau.
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

import * as transformerAPI from '@/api/demo/Transformer.js'
import * as voltageTransformerAPI from '@/api/demo/VoltageTransformer.js'
import * as currentTransformerAPI from '@/api/demo/CurrentTransformer.js'
import * as circuitBreakerAPI from '@/api/demo/CircuitBreaker.js'
import * as disconnectorAPI from '@/api/demo/Disconnector.js'
import * as surgeArresterAPI from '@/api/demo/SurgeArrester.js'

import * as transformerServerMapper from '@/views/Mapping/ServerToDTO/Transformer/index.js'
import * as voltageTransformerServerMapper from '@/views/Mapping/ServerToDTO/VoltageTransformer/index.js'
import * as currentTransformerServerMapper from '@/views/Mapping/ServerToDTO/CurrentTransformer/index.js'
import * as circuitBreakerServerMapper from '@/views/Mapping/ServerToDTO/CircuitBreaker/index.js'
import * as disconnectorServerMapper from '@/views/Mapping/ServerToDTO/Disconnector/index.js'
import * as surgeArresterServerMapper from '@/views/Mapping/ServerToDTO/SurgeArrester/index.js'

import { normalizeJobDto, applyTestTypeNames } from '@/utils/jobDtoNormalize'

/**
 * Khoá là `tab.job` — nhãn loại THIẾT BỊ mà job thuộc về, do `fetchChildrenServer`
 * gán khi dựng nhánh job. `linkKey` là tên khoá bảng nối thiết bị đo ↔ bài test;
 * sáu mapper đặt sáu tên khác nhau cho cùng một thứ.
 */
const REGISTRY = {
    'Transformer': {
        fetchJob:      (id) => transformerJobAPI.getTransformerJobById(id),
        jobToDto:      transformerJobServerMapper.mapServerToDto,
        fetchAsset:    (id) => transformerAPI.getTransformerById(id),
        assetToDto:    transformerServerMapper.mapServerToDto,
        linkKey:       'transformerTestingEquipmentTestType',
    },
    'Voltage transformer': {
        fetchJob:      (id) => voltageTransformerJobAPI.getVoltageTransformerJobById(id),
        jobToDto:      voltageTransformerJobServerMapper.mapServerToDto,
        fetchAsset:    (id) => voltageTransformerAPI.getVoltageTransformerById(id),
        assetToDto:    voltageTransformerServerMapper.mapServerToDto,
        linkKey:       'voltageTransformerTestingEquipmentTestType',
    },
    'Current transformer': {
        fetchJob:      (id) => currentTransformerJobAPI.getCurrentTransformerJobById(id),
        jobToDto:      currentTransformerJobServerMapper.mapServerToDto,
        fetchAsset:    (id) => currentTransformerAPI.getCurrentTransformerById(id),
        assetToDto:    currentTransformerServerMapper.mapServerToDto,
        linkKey:       'currentTransformerTestingEquipmentTestType',
    },
    'Circuit breaker': {
        fetchJob:      (id) => circuitBreakerJobAPI.getCircuitBreakerJobById(id),
        jobToDto:      circuitBreakerJobServerMapper.mapServerToDto,
        fetchAsset:    (id) => circuitBreakerAPI.getCircuitBreakerById(id),
        assetToDto:    circuitBreakerServerMapper.mapServerToDto,
        linkKey:       'circuitBreakerTestingEquipmentTestType',
    },
    'Disconnector': {
        fetchJob:      (id) => disconnectorJobAPI.getDisconnectorJobById(id),
        jobToDto:      disconnectorJobServerMapper.mapServerToDto,
        fetchAsset:    (id) => disconnectorAPI.getDisconnectorById(id),
        assetToDto:    disconnectorServerMapper.mapServerToDto,
        linkKey:       'disconnectorTestingEquipmentTestType',
    },
    'Surge arrester': {
        fetchJob:      (id) => surgeArresterJobAPI.getSurgeArresterJobById(id),
        jobToDto:      surgeArresterJobServerMapper.mapServerToDto,
        fetchAsset:    (id) => surgeArresterAPI.getSurgeArresterById(id),
        assetToDto:    surgeArresterServerMapper.mapServerToDto,
        linkKey:       'surgeArresterTestingEquipmentTestType',
    },
}

/**
 * Nạp mọi thứ một tab job phía server cần.
 *
 * @param {object} tab node job đang mở; cần `mrid`, `parentId` và `job`
 * @returns {Promise<object|null>} `{ jobDto, assetDto, testTypeList, productAssetModel,
 *          location }`, hoặc null nếu loại chưa hỗ trợ hoặc không tải được job
 */
export async function loadServerJobTab(tab) {
    const entry = REGISTRY[tab && tab.job]
    if (!entry) {
        console.warn('[Server job tab] chua ho tro loai thiet bi:', tab && tab.job)
        return null
    }

    // Danh mục bài test lấy từ DB LOCAL, cố ý. Đây là dữ liệu CONFIG được nạp sẵn
    // trên mọi máy, không phải dữ liệu người dùng — nên dù đang xem tab server thì
    // đọc tại chỗ vẫn đúng, và đỡ một vòng gọi mạng.
    let testTypeList = []
    try {
        const rs = await window.electronAPI.getProcedureByGenericAssetModel(tab.job)
        testTypeList = rs && rs.success ? rs.data : []
    } catch (error) {
        console.warn('[Server job tab] khong lay duoc danh muc bai test:', error)
    }

    // Bối cảnh thiết bị. Hỏng thì vẫn mở tab với phần đầu trống, vì `loadParameter`
    // chỉ cất bốn giá trị này chứ không dùng để dựng bảng đo — mất nó thì thiếu
    // thông tin thiết bị trên đầu trang, còn kết quả thí nghiệm vẫn xem được đủ.
    let assetDto = {}
    try {
        const assetRes = await entry.fetchAsset(tab.parentId)
        const raw = (assetRes && assetRes.data) || assetRes
        if (raw) assetDto = entry.assetToDto(raw) || {}
    } catch (error) {
        console.warn('[Server job tab] khong lay duoc thiet bi', tab.parentId, error)
    }

    let jobDto = null
    let jobVersion = null
    try {
        const jobRes = await entry.fetchJob(tab.mrid)
        const raw = (jobRes && jobRes.data) || jobRes
        jobVersion = raw && raw.version !== undefined ? raw.version : null
        jobDto = normalizeJobDto(entry.jobToDto(raw), entry.linkKey, tab.job)
        jobDto.properties = jobDto.properties || {}
        if (!jobDto.properties.mrid) jobDto.properties.mrid = tab.mrid
        applyTestTypeNames(jobDto, testTypeList)
    } catch (error) {
        console.error('[Server job tab] khong tai duoc job', tab.mrid, error)
        return null
    }

    return {
        jobDto,
        assetDto,
        testTypeList,
        // Phiên bản job tại thời điểm tải. Bắt buộc phải giữ lại: lưu ngược lên
        // server phải gửi đúng con số này trong `baseVersion`, không thì ăn 409 ngay
        // lần lưu đầu. Nó nằm ngoài `jobDto` vì không phải dữ liệu job — nó là mốc
        // đồng bộ, và trộn vào DTO sẽ khiến phép gộp coi nó như một trường thay đổi.
        version: jobVersion,
        // Hai thứ này nằm sẵn trong DTO thiết bị ở chiều server, không phải gọi riêng
        // như đường client — bên đó chúng là hai bảng tách rời trong SQLite.
        productAssetModel: assetDto.productAssetModel || {},
        location: assetDto.location || {},
    }
}
