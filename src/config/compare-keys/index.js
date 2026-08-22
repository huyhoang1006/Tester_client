import { getCtTapRatio } from '@/utils/ctTapRatio'

/**
 * CỘT MỐC (khoá ghép dòng) khi so sánh kết quả test với lần đo trước.
 *
 * ------------------------------------------------------------------------
 * VÌ SAO CẦN FILE NÀY
 * ------------------------------------------------------------------------
 * Hai lần đo cùng một bài test trên cùng một thiết bị hầu như không bao giờ
 * có số dòng và thứ tự dòng giống hệt nhau — người dùng thêm dòng, bớt dòng,
 * nhập theo thứ tự khác. Vì vậy không thể ghép dòng theo VỊ TRÍ, phải ghép
 * theo GIÁ TRỊ của những cột định danh ra dòng đó.
 *
 * Không suy luận tự động được, vì:
 *
 *   1. Mỗi bài test đặt tên cột mốc một kiểu: 'measurement', 'name', 'item',
 *      'phase', 'type', 'operation', 'applied_terminal', 'trip_coil_no'...
 *
 *   2. Cột mốc thường là TỔ HỢP nhiều cột, không phải một cột:
 *      - ContactResistance (CB): pha A có nhiều buồng cắt → phase + interrupter
 *      - WindingDfCap / *Dfcap: cùng điểm đo nhưng đo cả GST và UST
 *                               → measurement + test_mode
 *      - DCWindingPrim (TR): cùng cuộn dây đo ở nhiều nấc → name + tap
 *
 *   3. Có cột kiểu string nhưng lại là KẾT QUẢ chứ không phải mốc
 *      (ratio_meas, polarity, status). Đưa nhầm vào khoá thì tỉ số đo thay
 *      đổi là dòng mất khớp — đúng cái cần so lại không so được.
 *
 *   4. Ngược lại, có cột kiểu analog nhưng lại là mốc: tap, interrupter,
 *      trip_coil, unit_no — đều là SỐ THỨ TỰ, không có đơn vị.
 *
 * ------------------------------------------------------------------------
 * CÁCH ĐỌC
 * ------------------------------------------------------------------------
 *   [assetKind][testCode] = [ 'mã cột', ... ]
 *
 *   Mảng RỖNG  = bài test chỉ có một dòng (không có gì để định danh dòng).
 *                Khi đó ghép theo VỊ TRÍ dòng, dòng 1 so với dòng 1.
 *   KHÔNG khai = chưa định nghĩa → rơi về quy tắc dự phòng (xem resolveCompareKey).
 *
 * Thêm bài test mới thì khai báo ở đây luôn, đừng để tự đoán.
 */

const COMPARE_KEYS = {
    // =====================================================================
    // Circuit breaker — máy cắt
    // =====================================================================
    CircuitBreaker: {
        // Timing: mỗi dòng là một buồng cắt của một pha.
        // 'interrupter' và 'trip_coil' là SỐ THỨ TỰ (analog không đơn vị).
        OTiming:      ['phase', 'interrupter'],
        CTiming:      ['phase', 'interrupter'],
        OCTiming:     ['phase', 'interrupter'],
        COTiming:     ['phase', 'interrupter'],
        OCOTiming:    ['phase', 'interrupter'],
        COCOTiming:   ['phase', 'interrupter', 'trip_coil'],
        OCOCOTiming:  ['phase', 'interrupter', 'trip_coil'],

        // Điện trở tiếp xúc: một pha nhiều buồng cắt
        ContactResistance: ['phase', 'interrupter'],

        // Cuộn cắt / cuộn đóng: định danh bằng số hiệu cuộn
        DCWindingTripCoil:              ['trip_coil_no'],
        DCWindingCloseCoil:             ['close_coil_no'],
        InsulationResistanceTripCoil:   ['trip_coil_no'],
        InsulationResistanceCloseCoil:  ['close_coil_no'],
        OverCurrentRelease:             ['trip_coil_no'],
        UnderVoltageRelease:            ['trip_coil_no'],

        // Điện áp tác động nhỏ nhất: đóng hay cắt, và cuộn nào
        MinimumPickup: ['operation', 'trip_coil_no', 'close_coil_no'],

        InsulationResistanceCircuit: ['measurement'],
        GeneralInspection:           ['item'],

        // Động cơ tích năng và các phép đo khí SF6: mỗi lần đo một dòng
        DCWindingMotor:            [],
        InsulationResistanceMotor: [],
        MotorCurrent:              [],
        PressureGauge:             [],
        SF6GasAnalysis:            [],
        SF6MoiturePurity:          []
    },

    // =====================================================================
    // Current transformer — biến dòng
    // =====================================================================
    CurrentTransformer: {
        // ratio_meas / polarity là KẾT QUẢ đo, không đưa vào khoá
        CTRatio:              ['name'],
        CTExcitation:         ['name'],
        CTWindingRes:         ['name'],
        CTDfcap:              ['measurement', 'test_mode'],
        InsulationResistance: ['measurement'],
        GeneralInspection:    ['item']
    },

    // =====================================================================
    // Voltage transformer — biến áp đo lường
    // =====================================================================
    VoltageTransformer: {
        VTRatio:              ['name'],
        DcWindingResistance:  ['name'],
        VTDfcap:              ['measurement', 'test_mode'],
        InsulationResistance: ['measurement'],
        GeneralInspection:    ['item']
    },

    // =====================================================================
    // Disconnector — dao cách ly
    // =====================================================================
    Disconnector: {
        ContactResistance:    ['measurement'],
        InsulationResistance: ['measurement'],
        OperatingTest:        ['measurement'],
        ControlCheck:         ['item'],
        GeneralInspection:    ['item'],
        DcWindingMotor:       [],
        InsulationResMotor:   []
    },

    // =====================================================================
    // Surge arrester — chống sét van
    // =====================================================================
    SurgeArrester: {
        // Chống sét van nhiều tầng: mỗi pha có nhiều unit
        LeakageCurrent:       ['phase', 'unit_no'],
        PowerFrequency:       ['phase', 'unit_no'],
        InsulationResistance: ['measurement'],
        GeneralInspection:    ['item']
    },

    // =====================================================================
    // Power cable — cáp lực
    // =====================================================================
    PowerCable: {
        InsulationResistance:   ['measurement'],
        AcVoltageInsulation:    ['measurement'],
        DcVoltageInsulation:    ['measurement'],
        DcVoltageOverSheath:    ['measurement'],
        ParticalDischarge:      ['measurement'],
        TandeltaPowerAcSource:  ['measurement'],
        TandeltaVlfSource:      ['measurement'],
        VlfTest:                ['measurement'],
        GeneralInspection:      ['item']
    },

    // =====================================================================
    // Transformer — máy biến áp lực
    // =====================================================================
    Transformer: {
        // Sứ xuyên: cùng một sứ đo cả GST và UST → phải có test_mode
        BushingPrimC1: ['measurement', 'test_mode'],
        BushingPrimC2: ['measurement', 'test_mode'],
        BushingSecC1:  ['measurement', 'test_mode'],
        BushingSecC2:  ['measurement', 'test_mode'],
        BushingTertC1: ['measurement', 'test_mode'],
        BushingTertC2: ['measurement', 'test_mode'],
        WindingDfCap:  ['measurement', 'test_mode'],

        // Điện trở một chiều cuộn dây: cùng cuộn đo ở nhiều nấc phân áp
        DCWindingPrim: ['name', 'tap'],
        DCWindingSec:  ['name', 'tap'],
        DCWindingTert: ['name', 'tap'],

        // Các phép đo phụ thuộc nấc phân áp. RatioPrimSec có 'ratio_meas' kiểu
        // string nhưng đó là tỉ số ĐO ĐƯỢC, cố ý không đưa vào khoá.
        RatioPrimSec:              ['phase', 'tap'],
        ExcitingCurrent:           ['phase', 'tap'],
        ShortCircuitImpedancePrim: ['phase', 'tap'],
        ShortCircuitImpedanceSec:  ['phase', 'tap'],
        ShortCircuitImpedanceTert: ['phase', 'tap'],

        // 'type' phân biệt điều kiện đo (khô/ẩm, trước/sau) nên là mốc
        InsulationResistance:         ['measurement', 'type'],
        InsulationResistanceYokeCore: ['measurement'],

        SeparateSourceAc:      ['applied_terminal'],
        InducedAcVoltageTest:  ['applied_terminal', 'lv_terminal', 'hv_terminal'],

        // Dầu và hoá nghiệm
        MeasurementOfOil:          ['type'],
        GasChromatography:         ['name', 'method'],
        // 'standard' là giá trị tiêu chuẩn đối chiếu, không định danh dòng
        MeasurementOfNoLoad:       ['name'],
        MeasurementOfShortCircuit: ['name'],
        EnergyEfficiency:          ['name'],

        GeneralInspection:  ['item'],
        TestingInstruments: ['item', 'type'],

        // DGA: mỗi lần lấy mẫu một dòng. 'status' là KẾT LUẬN (Normal/Caution)
        // chứ không phải mốc — đưa vào khoá thì hết so được khi tình trạng đổi.
        Dga: [],

        // Kích thước & khối lượng: bảng một dòng
        DimensionWeight: []
    },

    // =====================================================================
    // Chưa có định nghĩa test — để sẵn cho khớp với các loại thiết bị còn lại
    // =====================================================================
    Bushing: {},
    Capacitor: {},
    Reactor: {},
    RotatingMachine: {}
}

/**
 * Chuẩn hoá tên loại thiết bị.
 * asset.kind trong DB không nhất quán hoa/thường và khoảng trắng
 * ('Surge arrester' vs 'Surge Arrester' vs 'SurgeArrester').
 */
const normalizeAssetKind = (assetKind) => String(assetKind || '').replace(/[\s_-]/g, '').toLowerCase()

const KEYS_BY_NORMALIZED_KIND = Object.keys(COMPARE_KEYS).reduce((acc, kind) => {
    acc[normalizeAssetKind(kind)] = COMPARE_KEYS[kind]
    return acc
}, {})

/**
 * Quy tắc dự phòng khi một bài test CHƯA được khai báo ở trên.
 * Lấy cột string đầu tiên trong định nghĩa — đúng với đa số, nhưng chỉ là
 * phỏng đoán, nên bài test mới vẫn phải khai báo tường minh.
 */
export const fallbackCompareKey = (columns) => {
    const list = columns || []
    if (list.some(col => col && col.code === 'measurement')) return ['measurement']
    const firstString = list.find(col => col && col.type === 'string')
    return firstString ? [firstString.code] : []
}

/**
 * Cột mốc của một bài test.
 *
 * @param assetKind  loại thiết bị, vd 'VoltageTransformer' / 'Voltage transformer'
 * @param testCode   mã bài test, vd 'VTDfcap'
 * @param columns    mảng cột từ test-definitions, chỉ dùng cho nhánh dự phòng
 * @returns { keys, declared }
 *          keys     — mảng mã cột làm khoá; RỖNG nghĩa là ghép theo vị trí dòng
 *          declared — true nếu lấy từ bảng khai báo, false nếu đang đoán
 */
export const resolveCompareKey = (assetKind, testCode, columns) => {
    const byKind = KEYS_BY_NORMALIZED_KIND[normalizeAssetKind(assetKind)]
    if (byKind && Object.prototype.hasOwnProperty.call(byKind, testCode)) {
        return { keys: byKind[testCode].slice(), declared: true }
    }
    return { keys: fallbackCompareKey(columns), declared: false }
}

const getCellValue = (cells, code) => {
    const cell = Object.values(cells || {}).find(item => item && item.aliasName === code)
    if (!cell || cell.value === null || cell.value === undefined || String(cell.value).trim() === '') return ''
    const text = String(cell.value).trim()
    const num = Number(text)
    return Number.isNaN(num) ? text : String(num)
}

const buildCircuitBreakerRowTitle = (cells) => {
    const phase = getCellValue(cells, 'phase')
    const tripCoil = getCellValue(cells, 'trip_coil') || getCellValue(cells, 'trip_coil_no')
    const closeCoil = getCellValue(cells, 'close_coil_no')
    const interrupter = getCellValue(cells, 'interrupter')
    const parts = []
    if (phase) parts.push(`Phase ${phase}`)
    if (tripCoil) parts.push(`Trip ${tripCoil}`)
    if (closeCoil) parts.push(`Close ${closeCoil}`)
    if (interrupter) parts.push(`Interrupter ${interrupter}`)
    return parts.join(' - ')
}

const buildCtExcitationRowTitle = (cells, keyCodes, context = {}) => {
    const name = getCellValue(cells, 'name')
    const ratio = getCtTapRatio(context.assetData, name)
    return [name, ratio].filter(Boolean).join(' · ')
}

const COMPARE_DISPLAY = {
    CurrentTransformer: {
        CTExcitation: {
            rowLabel: buildCtExcitationRowTitle
        }
    },
    CircuitBreaker: {
        OTiming: { rowLabel: buildCircuitBreakerRowTitle },
        CTiming: { rowLabel: buildCircuitBreakerRowTitle },
        OCTiming: { rowLabel: buildCircuitBreakerRowTitle },
        COTiming: { rowLabel: buildCircuitBreakerRowTitle },
        OCOTiming: { rowLabel: buildCircuitBreakerRowTitle },
        COCOTiming: { rowLabel: buildCircuitBreakerRowTitle },
        OCOCOTiming: { rowLabel: buildCircuitBreakerRowTitle },
        ContactResistance: { rowLabel: buildCircuitBreakerRowTitle },
        DCWindingTripCoil: { rowLabel: buildCircuitBreakerRowTitle },
        DCWindingCloseCoil: { rowLabel: buildCircuitBreakerRowTitle },
        InsulationResistanceTripCoil: { rowLabel: buildCircuitBreakerRowTitle },
        InsulationResistanceCloseCoil: { rowLabel: buildCircuitBreakerRowTitle },
        OverCurrentRelease: { rowLabel: buildCircuitBreakerRowTitle },
        UnderVoltageRelease: { rowLabel: buildCircuitBreakerRowTitle },
        MinimumPickup: { rowLabel: buildCircuitBreakerRowTitle },
        SF6GasAnalysis: {
            tableLabels: {
                table1: 'Decomposition of SF6',
                table2: 'SO2 + SOF2',
                table3: 'HF'
            }
        }
    }
}

const DISPLAY_BY_NORMALIZED_KIND = Object.keys(COMPARE_DISPLAY).reduce((acc, kind) => {
    acc[normalizeAssetKind(kind)] = COMPARE_DISPLAY[kind]
    return acc
}, {})

export const resolveCompareDisplay = (assetKind, testCode) => {
    const byKind = DISPLAY_BY_NORMALIZED_KIND[normalizeAssetKind(assetKind)]
    return (byKind && byKind[testCode]) || {}
}

export { COMPARE_KEYS, normalizeAssetKind }
export default COMPARE_KEYS
