/* eslint-disable */
/**
 * TẢI JOB TỪ SERVER VỀ MÁY.
 *
 * Trước file này, job chỉ đi MỘT CHIỀU lên server: sáu hàm `getXxxJobById` có sẵn
 * nhưng chỉ được gọi để kiểm tra job có tồn tại hay không rồi vứt kết quả đi, cây
 * server dừng ở cấp thiết bị, và sáu hàm `mapServerToDto` của job là code chết.
 *
 * ─── MỘT BẢN, SÁU CỬA ────────────────────────────────────────────────────────
 *
 * Tám file cùng thư mục này mỗi file lo một loại thiết bị, vì mỗi loại có bộ
 * trường riêng. Job thì khác: sáu loại dùng CHUNG một hình dạng dữ liệu — cây
 * job không phụ thuộc loại thiết bị, chỉ có nội dung bài test là khác. Chép sáu
 * bản gần y hệt nhau ở đây chỉ tạo ra sáu chỗ để quên sửa. Nên phần việc nằm
 * trong hai hàm dùng chung, còn `REGISTRY` giữ đúng những gì thật sự khác nhau:
 * gọi API nào, dùng mapper nào, ghi vào bảng nào.
 *
 * ─── GỘP CHỨ KHÔNG GHI ĐÈ ────────────────────────────────────────────────────
 *
 * Tải về KHÔNG xoá công người dùng đang sửa dở. Ba bản được gộp theo kiểu git:
 *
 *     base   bản gốc đã cất ở lần đồng bộ trước (`entity_snapshot`, type 'work')
 *     client bản đang có ở máy
 *     server bản vừa tải về
 *
 * Chỗ chỉ một bên đổi thì tự quyết, không hỏi. Chỉ hỏi ở chỗ CẢ HAI cùng đổi mà
 * khác nhau — thực tế thường là 0 hoặc 1 chỗ trong cả job.
 *
 * Hai trường hợp không gộp được, và cả hai đều đúng khi lấy nguyên bản server:
 *
 *   - job chưa có ở máy    -> không có gì để mà giữ
 *   - chưa có bản gốc      -> không phân biệt được bên nào vừa sửa (xem
 *                             `jobConflict.js`), nên đoán là đoán mò
 *
 * Trường hợp thứ hai xảy ra với job đã tải về từ trước khi có cơ chế này. Người
 * dùng vẫn được chặn một lớp: `handleDownloadOnlyNode` hỏi "đã tồn tại, ghi đè?"
 * trước khi tới đây.
 */

import * as voltageTransformerJobAPI from '@/api/demo/VoltageTransformerJob.js'
import * as currentTransformerJobAPI from '@/api/demo/CurrentTransformerJob.js'
import * as circuitBreakerJobAPI from '@/api/demo/CircuitBreakerJob.js'
import * as surgeArresterJobAPI from '@/api/demo/SurgeArresterJob.js'
import * as disconnectorJobAPI from '@/api/demo/DisconnectorJob.js'
import * as transformerJobAPI from '@/api/demo/TransformerJob.js'

import * as voltageTransformerJobMapper from '@/views/Mapping/VoltageTransformerJob/index.js'
import * as currentTransformerJobMapper from '@/views/Mapping/CurrentTransformerJob/index.js'
import * as circuitBreakerJobMapper from '@/views/Mapping/CircuitBreakerJob/index.js'
import * as surgeArresterJobMapper from '@/views/Mapping/SurgerArresterJob/index.js'
import * as disconnectorJobMapper from '@/views/Mapping/DisconnectorJob/index.js'
import * as transformerJobMapper from '@/views/Mapping/TransformerJob/index.js'

import * as voltageTransformerJobServerMapper from '@/views/Mapping/ServerToDTO/VoltageTransformerJob/index.js'
import * as currentTransformerJobServerMapper from '@/views/Mapping/ServerToDTO/CurrentTransformerJob/index.js'
import * as circuitBreakerJobServerMapper from '@/views/Mapping/ServerToDTO/CircuitBreakerJob/index.js'
import * as surgeArresterJobServerMapper from '@/views/Mapping/ServerToDTO/SurgeArresterJob/index.js'
import * as disconnectorJobServerMapper from '@/views/Mapping/ServerToDTO/DisconnectorJob/index.js'
import * as transformerJobServerMapper from '@/views/Mapping/ServerToDTO/TransformerJob/index.js'

import { fetchWithRetry } from './core-utils.js'
import { saveJobSnapshot, getJobSnapshot } from '@/utils/jobSnapshot'
import { normalizeJobDto } from '@/utils/jobDtoNormalize'
import { scopeJobDtoForUser } from './job-id-scope'
import { mergeJob, applyJobResolution } from '@/utils/jobConflict'
import { showJobConflictDialog } from '@/views/TreeNode/dialogs/showJobConflictDialog'

/**
 * Những gì thật sự khác nhau giữa sáu loại. Khoá là `node.job`, tức nhãn loại
 * THIẾT BỊ mà job thuộc về — `fetchChildrenServer` gán khi dựng nhánh job.
 *
 * `linkKey` là tên khoá của bảng nối thiết bị đo ↔ bài test trong DTO. Sáu mapper
 * đặt sáu tên khác nhau cho cùng một thứ, và mỗi mapper chỉ đọc đúng tên của nó.
 * Đây là chỗ duy nhất trong cả file có sự khác biệt thật sự về cấu trúc dữ liệu.
 */
const REGISTRY = {
    'Transformer': {
        fetch:        (id) => transformerJobAPI.getTransformerJobById(id),
        toDto:        transformerJobServerMapper.mapServerToDto,
        toEntity:     transformerJobMapper.jobDtoToEntity,
        entityToDto:  transformerJobMapper.JobEntityToDto,
        readLocal:    (mrid) => window.electronAPI.getTransformerJobByMrid(mrid),
        write:        (oldE, newE) => window.electronAPI.insertTransformerJob(oldE, newE),
        linkKey:      'transformerTestingEquipmentTestType',
    },
    'Voltage transformer': {
        fetch:        (id) => voltageTransformerJobAPI.getVoltageTransformerJobById(id),
        toDto:        voltageTransformerJobServerMapper.mapServerToDto,
        toEntity:     voltageTransformerJobMapper.jobDtoToEntity,
        entityToDto:  voltageTransformerJobMapper.JobEntityToDto,
        readLocal:    (mrid) => window.electronAPI.getVoltageTransformerJobByMrid(mrid),
        write:        (oldE, newE) => window.electronAPI.insertVoltageTransformerJob(oldE, newE),
        linkKey:      'voltageTransformerTestingEquipmentTestType',
    },
    'Current transformer': {
        fetch:        (id) => currentTransformerJobAPI.getCurrentTransformerJobById(id),
        toDto:        currentTransformerJobServerMapper.mapServerToDto,
        toEntity:     currentTransformerJobMapper.jobDtoToEntity,
        entityToDto:  currentTransformerJobMapper.JobEntityToDto,
        readLocal:    (mrid) => window.electronAPI.getCurrentTransformerJobByMrid(mrid),
        write:        (oldE, newE) => window.electronAPI.insertCurrentTransformerJob(oldE, newE),
        linkKey:      'currentTransformerTestingEquipmentTestType',
    },
    'Circuit breaker': {
        fetch:        (id) => circuitBreakerJobAPI.getCircuitBreakerJobById(id),
        toDto:        circuitBreakerJobServerMapper.mapServerToDto,
        toEntity:     circuitBreakerJobMapper.jobDtoToEntity,
        entityToDto:  circuitBreakerJobMapper.JobEntityToDto,
        readLocal:    (mrid) => window.electronAPI.getCircuitBreakerJobByMrid(mrid),
        write:        (oldE, newE) => window.electronAPI.insertCircuitBreakerJob(oldE, newE),
        linkKey:      'circuitBreakerTestingEquipmentTestType',
    },
    'Disconnector': {
        fetch:        (id) => disconnectorJobAPI.getDisconnectorJobById(id),
        toDto:        disconnectorJobServerMapper.mapServerToDto,
        toEntity:     disconnectorJobMapper.jobDtoToEntity,
        entityToDto:  disconnectorJobMapper.JobEntityToDto,
        readLocal:    (mrid) => window.electronAPI.getDisconnectorJobByMrid(mrid),
        write:        (oldE, newE) => window.electronAPI.insertDisconnectorJob(oldE, newE),
        linkKey:      'disconnectorTestingEquipmentTestType',
    },
    'Surge arrester': {
        fetch:        (id) => surgeArresterJobAPI.getSurgeArresterJobById(id),
        toDto:        surgeArresterJobServerMapper.mapServerToDto,
        toEntity:     surgeArresterJobMapper.jobDtoToEntity,
        entityToDto:  surgeArresterJobMapper.JobEntityToDto,
        readLocal:    (mrid) => window.electronAPI.getSurgeArresterJobByMrid(mrid),
        write:        (oldE, newE) => window.electronAPI.insertSurgeArresterJob(oldE, newE),
        linkKey:      'surgeArresterTestingEquipmentTestType',
    },
}

/** Tra bộ hàm theo loại thiết bị, ném lỗi rõ ràng nếu chưa hỗ trợ. */
function registryFor(assetType) {
    const entry = REGISTRY[assetType]
    if (!entry) throw new Error(`No job download strategy for asset type "${assetType}"`)
    return entry
}

// ─── Bước 1: lấy dữ liệu từ server ───────────────────────────────────────────

async function fetchJobChain(assetType, id, parentId) {
    const entry = registryFor(assetType)
    try {
        const data = await fetchWithRetry(() => entry.fetch(id))
        // Khoá dữ liệu là `jobData`, KHÔNG phải `job`. Ở cấp này `job` đã mang nhãn
        // loại thiết bị để `core-utils` chọn đúng chiến lược — dùng lại tên đó cho
        // khối dữ liệu thì cái sau đè lên cái trước và cả nhánh im lặng gãy.
        // Các file asset không gặp chuyện này vì khoá dữ liệu của chúng là tên loại
        // ('voltageTransformer'), khác hẳn với khoá phân nhánh ('asset').
        return {
            jobData: {
                id:          id,
                mrid:        String(id),
                name:        data?.job?.name || data?.properties?.name || '',
                parentId:    String(parentId),
                _type:       'job',
                _serverData: data || {},
            },
            _type:         'job',
            job:           assetType,
            parentAssetId: String(parentId),
        }
    } catch (error) {
        console.error(`Error fetching ${assetType} job with id ${id}:`, error)
        throw new Error(`Error fetching ${assetType} job with id ${id}: ${error.message}`)
    }
}

// ─── Bước 2: ghi xuống DB ────────────────────────────────────────────────────

/**
 * Bản "cũ" để tầng ghi biết cái gì cần xoá.
 *
 * `insertXxxJob(old, new)` so hai bên theo mrid và xoá những bản ghi có ở `old`
 * mà không có ở `new`. Nó truy cập thẳng `old.workTasks`, `old.analogValues`…
 * nên KHÔNG được truyền null. Job chưa có ở máy thì đưa một bản sao rỗng: cùng
 * hình dạng, mọi mảng rỗng, nên phép so ra "không có gì để xoá".
 */
function emptyArraysClone(obj) {
    if (Array.isArray(obj)) return []
    if (obj && typeof obj === 'object') {
        const out = {}
        for (const k of Object.keys(obj)) {
            const v = obj[k]
            if (Array.isArray(v)) out[k] = []
            else if (v && typeof v === 'object') out[k] = emptyArraysClone(v)
            else out[k] = v
        }
        return out
    }
    return obj
}

// `ctx` không dùng tới, nhưng giữ trong chữ ký cho khớp với tám file cùng thư mục.
// Hộp thoại gộp KHÔNG đi qua `ctx` — xem `showJobConflictDialog.js` giải thích vì sao.
async function saveJobChain(assetType, data, ctx) {  // eslint-disable-line no-unused-vars
    const entry   = registryFor(assetType)
    const jobRef  = data.jobData
    const mrid    = jobRef.mrid
    const jobName = jobRef.name || mrid

    // 1. server -> dto, rồi vá những chỗ mapper không chịu được null
    const userId = ctx && ctx.$store && ctx.$store.state && ctx.$store.state.user
        ? ctx.$store.state.user.user_id
        : null
    const serverDto = normalizeJobDto(entry.toDto(jobRef._serverData), entry.linkKey, assetType, userId)
    scopeJobDtoForUser(serverDto, userId, entry.linkKey)
    serverDto.properties = serverDto.properties || {}
    serverDto.properties.mrid = mrid

    // 2. bản đang có ở máy
    let clientEntity = null
    try {
        const existing = await entry.readLocal(mrid)
        clientEntity = existing && existing.success ? existing.data : null
    } catch (error) {
        console.warn('[Download job] khong doc duoc ban o may:', mrid, error)
    }

    // 3. GỘP BA CHIỀU
    //
    // Cả ba bản phải ở CÙNG dạng DTO thì phép so mới có nghĩa. Bản client đi qua
    // `entityToDto`, bản server qua `mapServerToDto`, còn bản gốc thì được cất
    // sẵn ở dạng DTO ngay từ lúc ghi — nếu cất ở dạng payload server thì mọi khoá
    // đều lệch tên và phép so ra "khác nhau hết".
    // Gắn hậu tố cho CẢ HAI bản trước khi so. Bản ở máy vốn đã mang hậu tố, nên đây
    // là thao tác vô hại với nó; nhưng bỏ qua thì bản server còn id trần, phép so đem
    // 'abc@val@u-21' đối chiếu với 'abc' và sinh xung đột giả ở mọi ô.
    const clientDto = clientEntity
        ? scopeJobDtoForUser(entry.entityToDto(clientEntity), userId, entry.linkKey)
        : null
    const baseDto = clientDto ? await getJobSnapshot(mrid) : null

    let finalDto
    if (!clientDto || !baseDto) {
        // Chưa có gì ở máy, hoặc chưa có bản gốc để so. Lấy nguyên bản server —
        // đoán mò ở đây tệ hơn nhiều so với ghi đè có báo trước.
        finalDto = serverDto
    } else {
        const { merged, conflicts } = mergeJob(baseDto, clientDto, serverDto)
        if (conflicts.length === 0) {
            finalDto = merged
        } else {
            // Ném CANCELED nếu người dùng huỷ. `executeDownload` bắt sẵn mã đó và
            // im lặng dừng, không hiện thông báo lỗi đỏ.
            const decided = await showJobConflictDialog(conflicts, jobName)
            finalDto = applyJobResolution(baseDto, clientDto, serverDto, decided)
        }
        normalizeJobDto(finalDto, entry.linkKey, assetType, userId)
        finalDto.properties = finalDto.properties || {}
        finalDto.properties.mrid = mrid
    }

    // 4. dto -> entity, rồi ghi
    const newEntity = entry.toEntity(finalDto)
    const oldEntity = clientEntity || emptyArraysClone(newEntity)

    const rs = await entry.write(oldEntity, newEntity)
    if (!rs || !rs.success) {
        throw new Error(`Database Insert ${assetType} Job Error: ${rs && rs.message}`)
    }

    // 5. CẤT BẢN GỐC — bước quan trọng nhất của cả hàm này.
    //
    // Cất bản SERVER, không phải bản đã gộp. Bản gốc mang nghĩa "thứ server đang
    // giữ ở lần đồng bộ này"; cất bản gộp thì lần sau máy tưởng server đã có cả
    // phần sửa cục bộ, và phần đó biến mất khỏi mọi phép so về sau.
    //
    // Làm SAU khi ghi DB thành công: ghi hỏng mà đã cất bản gốc thì máy tưởng
    // mình đang đồng bộ với server trong khi dữ liệu ở máy vẫn là bản cũ.
    const version = jobRef._serverData && jobRef._serverData.version
    await saveJobSnapshot(mrid, serverDto, version)
}

// ─── Sáu cửa vào, cùng một bản ───────────────────────────────────────────────

export const getTransformerJobChain        = (id, parentId) => fetchJobChain('Transformer', id, parentId)
export const getVoltageTransformerJobChain = (id, parentId) => fetchJobChain('Voltage transformer', id, parentId)
export const getCurrentTransformerJobChain = (id, parentId) => fetchJobChain('Current transformer', id, parentId)
export const getCircuitBreakerJobChain     = (id, parentId) => fetchJobChain('Circuit breaker', id, parentId)
export const getDisconnectorJobChain       = (id, parentId) => fetchJobChain('Disconnector', id, parentId)
export const getSurgeArresterJobChain      = (id, parentId) => fetchJobChain('Surge arrester', id, parentId)

export const downloadTransformerJobChain        = (data, ctx) => saveJobChain('Transformer', data, ctx)
export const downloadVoltageTransformerJobChain = (data, ctx) => saveJobChain('Voltage transformer', data, ctx)
export const downloadCurrentTransformerJobChain = (data, ctx) => saveJobChain('Current transformer', data, ctx)
export const downloadCircuitBreakerJobChain     = (data, ctx) => saveJobChain('Circuit breaker', data, ctx)
export const downloadDisconnectorJobChain       = (data, ctx) => saveJobChain('Disconnector', data, ctx)
export const downloadSurgeArresterJobChain      = (data, ctx) => saveJobChain('Surge arrester', data, ctx)
