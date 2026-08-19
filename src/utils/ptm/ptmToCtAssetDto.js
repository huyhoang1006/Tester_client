/* eslint-disable */
import currentTransformerConfig from '@/config/ptm-import/current-transformer.json'

/**
 * ÁP THÔNG SỐ THIẾT BỊ TỪ PTM LÊN DTO ASSET ĐANG CÓ.
 *
 * Chỉ dùng khi người dùng chọn GHI ĐÈ trong hộp thoại xem trước. Không tạo asset mới:
 * job luôn được import vào một asset đã chọn sẵn trên cây.
 *
 * ─── VÌ SAO SỬA TẠI CHỖ CHỨ KHÔNG DỰNG DTO MỚI ──────────────────────────────
 *
 * DTO asset CT có hàng trăm trường (ctConfiguration với 4 lõi, các bảng tap…) mà PTM
 * không mang theo. Dựng DTO mới rồi ghi đè là XOÁ SẠCH những phần PTM không có — người
 * dùng mất toàn bộ cấu hình lõi/tap đã nhập tay, chỉ để cập nhật vài dòng nameplate.
 *
 * Nên lấy DTO đang có làm gốc và chỉ chạm vào đúng những trường ánh xạ được.
 *
 * ─── Ô RỖNG TRONG PTM THÌ KHÔNG GHI ĐÈ ──────────────────────────────────────
 *
 * `NaN` đã thành `''` ở tầng đọc. Ghi `''` đè lên số người dùng đã nhập là mất dữ liệu mà
 * không ai yêu cầu — "ghi đè" nghĩa là cập nhật thứ PTM BIẾT, không phải xoá thứ nó
 * không biết.
 */

const str = (v) => (v === null || v === undefined) ? '' : String(v)

/** Đọc một thẻ trong `asset.raw`, có thể lùi sang thẻ dự phòng. */
const readRaw = (raw, spec) => {
    const primary = raw && raw[spec.from]
    if (primary && str(primary.value).trim() !== '') return primary
    if (spec.fallback) {
        const alt = raw && raw[spec.fallback]
        if (alt && str(alt.value).trim() !== '') return alt
    }
    return null
}

const scaled = (entry, factor) => {
    const raw = entry && entry.value
    if (raw === '' || raw === null || raw === undefined) return ''
    const n = Number(raw)
    if (!Number.isFinite(n)) return str(raw)
    const f = (factor === null || factor === undefined) ? 1 : Number(factor)
    // factor 1 thì giữ NGUYÊN chuỗi gốc, không đi vòng qua Number.
    return f === 1 ? str(raw) : str(n * f)
}

/**
 * Áp thông số PTM lên DTO asset.
 *
 * @param {object} assetDto DTO asset đang có trên cây — SỬA TẠI CHỖ
 * @param {object} ptmAsset thiết bị đã gộp (bản job + lấp từ bản kho)
 * @returns {{ dto, applied: [], skipped: [] }} applied/skipped để báo cho người dùng
 */
export const applyPtmToCtAssetDto = (assetDto, ptmAsset) => {
    const config = currentTransformerConfig._asset
    const raw = (ptmAsset && ptmAsset.raw) || {}
    const applied = []
    const skipped = []

    const put = (target, key, value, label) => {
        if (!target || value === '' || value === null || value === undefined) return false
        if (target[key] && typeof target[key] === 'object' && 'value' in target[key]) {
            const before = str(target[key].value)
            target[key].value = str(value)
            applied.push({ field: label, from: before || '(empty)', to: str(value) })
        } else {
            const before = str(target[key])
            target[key] = str(value)
            applied.push({ field: label, from: before || '(empty)', to: str(value) })
        }
        return true
    }

    // properties — chuỗi thuần
    for (const key of Object.keys(config.properties || {})) {
        const spec = config.properties[key]
        const entry = readRaw(raw, spec)
        if (!entry) { skipped.push({ field: `properties.${key}`, reason: 'empty in PTM file' }); continue }
        put(assetDto.properties, key, entry.value, `properties.${key}`)
    }

    // ratings — có đơn vị, phải KIỂM đơn vị trước khi ghi
    for (const key of Object.keys(config.ratings || {})) {
        const spec = config.ratings[key]
        const entry = readRaw(raw, spec)
        if (!entry) { skipped.push({ field: `ratings.${key}`, reason: 'empty in PTM file' }); continue }

        // Đơn vị thực tế lệch với đơn vị khai trong config → BỎ QUA và nói ra.
        // Bản PTM sau có thể đổi đơn vị; ghi bừa thì con số vào sai thang mà không ai biết.
        const actual = str(entry.unit)
        if (spec.ptmUnit && actual && actual !== spec.ptmUnit) {
            skipped.push({
                field: `ratings.${key}`,
                reason: `unit mismatch — PTM says "${actual}", expected "${spec.ptmUnit}"`,
            })
            continue
        }
        put(assetDto.ratings, key, scaled(entry, spec.factor), `ratings.${key}`)
    }

    // trường phẳng, đường dẫn dạng 'ratings.rating_factor'
    for (const path of Object.keys(config.plain || {})) {
        if (path.indexOf('_') === 0) continue
        const spec = config.plain[path]
        const entry = readRaw(raw, spec)
        if (!entry) { skipped.push({ field: path, reason: 'empty in PTM file' }); continue }
        const [group, key] = path.split('.')
        const target = key ? assetDto[group] : assetDto
        put(target, key || group, entry.value, path)
    }

    return { dto: assetDto, applied, skipped }
}

/**
 * DỰNG CẤU HÌNH LÕI/TAP TỪ BÀI CT EXCITATION.
 *
 * ─── ÁNH XẠ ĐÃ ĐỐI CHIẾU TRÊN FILE THẬT, KHÔNG SUY ĐOÁN ─────────────────────
 *
 * Trước đây tôi ghi trong config là "chưa rõ Ipn/Isn ứng với cột nào". Đã đối chiếu xong:
 * mỗi lõi trong PTM có ĐÚNG ba phép đo, và ba cờ trong file chỉ thẳng vào ba khối của
 * client:
 *
 *   core  tap       IsMain  IsFull   Ipn    Isn      ->  khối trong ctConfiguration
 *   1     1S1-1S3   true    true     800 A  1 A          fullTap
 *   1     1S1-1S2   true    false    400 A  1 A          mainTap.data[0]
 *   1     1S2-1S3   false   false    400 A  1 A          interTap.data[0]
 *
 * BẪY: dòng full tap có IsMain=true LUÔN. Nên phải xét `isFull` TRƯỚC; xét `isMain`
 * trước thì full tap rơi vào ô main tap, mà nhìn bảng vẫn thấy "có số" nên không ai
 * phát hiện.
 *
 * ─── taps VÀ commonTap SUY TỪ TÊN ĐẦU DÂY, KHÔNG ĐẶT CỨNG ───────────────────
 *
 * `taps` = số đầu dây khác nhau của lõi (1S1, 1S2, 1S3 -> 3). `commonTap` = đầu dây dùng
 * chung giữa full tap và main tap (1S1 -> 1). File mẫu ra taps=3, commonTap=1 — đúng thứ
 * người dùng sẽ tự chọn nếu nhập tay. CT khác có 4-5 đầu dây thì công thức này vẫn đúng,
 * còn đặt cứng 3 thì sai ngay file thứ hai.
 *
 * ─── DUY NHẤT MỘT TRƯỜNG LÀ SUY LUẬN: inUse ─────────────────────────────────
 *
 * File không có thẻ nào nói "tap này đang dùng". Tôi đánh dấu `inUse` cho tap CÓ ĐIỂM ĐO,
 * vì OMICRON chỉ đo tap thật sự đấu. Đây là suy luận, không phải số đọc được — người dùng
 * bỏ tick lại được, và hộp thoại xem trước nói rõ điều này.
 */

/** '1S3' -> 3 ; 'S2' -> 2 ; không đọc được -> null */
const terminalIndex = (name) => {
    const m = str(name).trim().match(/S(\d+)\s*$/i)
    return m ? Number(m[1]) : null
}

/** Khối class rating rỗng cho main/inter tap — PTM không mang gánh (burden). */
const buildSmallClassRating = () => ({
    mrid: '',
    rated_burden: { mrid: '', value: '', unit: 'VA' },
    extended_burden: false,
    burden: { mrid: '', value: '', unit: 'VA' },
    burdenCos: '',
    operatingBurden: { mrid: '', value: '', unit: 'VA' },
    operatingBurdenCos: '',
})

/** Bảng tap RỖNG đúng khuôn TableDto. Dựng mới chứ không chép từ full tap: chép thì ô
 *  nào PTM để trống sẽ mang theo số của full tap, và nhìn bảng không thể biết. */
const buildEmptyTapTable = (type) => ({
    isShow: false,
    name: '',
    ipn: { mrid: '', value: '', unit: 'A' },
    isn: { mrid: '', value: '', unit: 'A' },
    inUse: false,
    type,
    mrid: '',
})

const buildTapTable = (base, measurement, mismatches) => {
    const table = base
    const first = str(measurement.firstTapName).trim()
    const second = str(measurement.secondTapName).trim()
    // Tên theo ĐÚNG khuôn của client — dấu cách quanh gạch nối ('1S1 - 1S3'), giống hệt
    // chuỗi mà màn hình cấu hình tự sinh khi nhập tay.
    if (first && second) table.name = `${first} - ${second}`

    const put = (cell, entry, label) => {
        if (!entry) return
        const value = str(entry.value).trim()
        if (value === '') return
        const unit = str(entry.unit).trim()
        // Đơn vị phải là A. Lệch thì BỎ, và nói ra — số vào sai thang thì nhìn vẫn hợp lý.
        if (unit && unit !== 'A') {
            mismatches.push({ field: `${table.name || 'tap'}.${label}`, reason: `unit mismatch — PTM says "${unit}", expected "A"` })
            return
        }
        cell.value = value
    }
    put(table.ipn, measurement.nominalPrimaryCurrent, 'ipn')
    put(table.isn, measurement.nominalSecondaryCurrent, 'isn')

    table.inUse = Array.isArray(measurement.points) && measurement.points.length > 0
    return table
}

/**
 * @param {object} ctExcitationTest bài CTExcitationTest đã đọc (có `measurements`)
 * @returns {{ config, mismatches, notes }} `config` gán thẳng vào dto.ctConfiguration
 */
export const buildCtConfigurationFromPtm = (ctExcitationTest, CTConfigurationDto, CoreDto) => {
    const mismatches = []
    const notes = []
    const measurements = (ctExcitationTest && ctExcitationTest.measurements) || []
    if (measurements.length === 0) {
        return { config: null, mismatches, notes: ['No CT Excitation measurements — core configuration left empty'] }
    }

    // Gom theo số lõi. Dùng số lõi CÓ THẬT trong phép đo, không dùng thẻ <Cores>: nếu hai
    // cái lệch nhau thì phép đo mới là cái có dữ liệu đi kèm.
    const byCore = new Map()
    for (const m of measurements) {
        const key = str(m.coreNumber).trim() || '1'
        if (!byCore.has(key)) byCore.set(key, [])
        byCore.get(key).push(m)
    }
    const coreKeys = [...byCore.keys()].sort((a, b) => Number(a) - Number(b))

    const declared = str(ctExcitationTest.cores).trim()
    if (declared && Number(declared) !== coreKeys.length) {
        notes.push(`File declares ${declared} core(s) but ${coreKeys.length} core(s) have measurements — using ${coreKeys.length}`)
    }

    const config = new CTConfigurationDto()
    config.cores = String(coreKeys.length)
    config.dataCT = []

    for (const key of coreKeys) {
        const list = byCore.get(key)
        const core = new CoreDto()

        // Số đầu dây khác nhau của lõi này.
        const terminals = new Set()
        for (const m of list) {
            if (str(m.firstTapName).trim()) terminals.add(str(m.firstTapName).trim())
            if (str(m.secondTapName).trim()) terminals.add(str(m.secondTapName).trim())
        }
        // Màn hình cấu hình chỉ nhận 2..6; ngoài khoảng đó mapper tự ép về 2 và cấu hình
        // sẽ sai lặng lẽ, nên chặn ở đây và nói ra.
        const tapCount = terminals.size
        if (tapCount >= 2 && tapCount <= 6) {
            core.taps = String(tapCount)
        } else {
            notes.push(`Core ${key}: ${tapCount} tap terminal(s) is outside the supported range 2-6, left at default`)
        }

        const full = list.find(m => m.isFull)
        // isFull TRƯỚC isMain — dòng full tap cũng có isMain=true.
        const mains = list.filter(m => !m.isFull && m.isMain)
        const inters = list.filter(m => !m.isFull && !m.isMain)

        if (full) {
            buildTapTable(core.fullTap.table, full, mismatches)
            // Đầu dây dùng chung = đầu có mặt ở CẢ full tap lẫn main tap.
            const firstIdx = terminalIndex(full.firstTapName)
            const secondIdx = terminalIndex(full.secondTapName)
            if (mains.length > 0 && firstIdx !== null && secondIdx !== null) {
                const mainTerminals = new Set()
                for (const m of mains) {
                    mainTerminals.add(str(m.firstTapName).trim())
                    mainTerminals.add(str(m.secondTapName).trim())
                }
                if (mainTerminals.has(str(full.firstTapName).trim())) core.commonTap = String(firstIdx)
                else if (mainTerminals.has(str(full.secondTapName).trim())) core.commonTap = String(secondIdx)
            }
        } else {
            notes.push(`Core ${key}: no full-tap measurement in the file`)
        }

        core.mainTap.data = mains.map(m => ({
            table: buildTapTable(buildEmptyTapTable('maintap'), m, mismatches),
            classRating: buildSmallClassRating(),
        }))
        core.interTap.data = inters.map(m => ({
            table: buildTapTable(buildEmptyTapTable('intertap'), m, mismatches),
            classRating: buildSmallClassRating(),
        }))

        config.dataCT.push(core)
    }

    return { config, mismatches, notes }
}

export default { applyPtmToCtAssetDto, buildCtConfigurationFromPtm }
