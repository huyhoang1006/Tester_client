/* eslint-disable */
/**
 * Toàn bộ chẩn đoán DGA (TES-288). Hàm thuần — không đụng Vue, chạy lại mỗi lần
 * người dùng sửa số khí (computed), nên phải nhẹ.
 */
import {
    GASES, GAS_LABELS, TDCG_GASES, LOW_GAS_SUM_GASES, LOW_GAS_SUM_LIMIT,
    IEC_P90, IEC_P90_C2H2_COMMUNICATING_OLTC,
    IEEE2019_TABLE1_P90, IEEE2019_TABLE2_P95, IEEE2019_TABLE3_DELTA, IEEE2019_O2N2_LIMIT,
    IEEE2008_TDCG_LIMITS, IEEE2008_GAS_LIMITS, L1_LIMITS, PATTERNS,
    KEY_GAS_ARCING_C2H2_MIN_PERCENT, GAUGE_ORDER, DGA_TOOLTIPS
} from './config'
import { analyseTriangle, analysePentagon } from './duval'

const RATIO_GASES = ['h2', 'ch4', 'c2h2', 'c2h4', 'c2h6']
const SIX_GASES = ['h2', 'ch4', 'c2h6', 'c2h4', 'c2h2', 'co']

export const toNumber = (raw) => {
    if (raw && typeof raw === 'object' && Object.prototype.hasOwnProperty.call(raw, 'value')) raw = raw.value
    if (raw === null || raw === undefined) return null
    const text = String(raw).trim().replace(',', '.')
    if (text === '') return null
    const n = Number(text)
    return Number.isFinite(n) ? n : null
}

/** Đọc khí từ 1 dòng bảng nhập (ô {value}) */
export const readGases = (row) => {
    const out = {}
    for (const key of [...GASES, 'o2', 'n2']) out[key] = toNumber(row && row[key])
    return out
}

const val = (gas, key) => (gas[key] === null || gas[key] === undefined ? 0 : gas[key])

/** Tỷ số: mẫu = 0 thì tử > 0 → ∞, 0/0 → 0 (không có khí) */
export const ratio = (a, b) => {
    a = a || 0
    b = b || 0
    if (b > 0) return a / b
    return a > 0 ? Infinity : 0
}

const fmt = (value) => {
    if (value === null || value === undefined) return '—'
    if (value === Infinity) return '∞'
    const rounded = Math.round(value * 100) / 100
    return String(rounded)
}
const gasWithValue = (gas, key) => `${GAS_LABELS[key]} (${fmt(val(gas, key))})`
const joinList = (items) => items.join(', ')

export const tdcgOf = (gas) => TDCG_GASES.reduce((sum, key) => sum + val(gas, key), 0)
export const hasAnyGas = (gas) => GASES.some(key => gas[key] !== null && gas[key] !== undefined)

const result = (applied, faults, extra = {}) => ({ applied, faults, ...extra })

// ── IEC 60599 Table 1 ──
export const iecLimits = (communicatingOltc) => ({
    ...IEC_P90,
    c2h2: communicatingOltc ? IEC_P90_C2H2_COMMUNICATING_OLTC : IEC_P90.c2h2
})

const ratiosApplicable = (gas, limits) => RATIO_GASES.some(key => val(gas, key) > limits[key])

export const iecRatioMethod = (gas, communicatingOltc) => {
    const limits = iecLimits(communicatingOltc)
    const r1 = ratio(gas.c2h2, gas.c2h4)
    const r2 = ratio(gas.ch4, gas.h2)
    const r3 = ratio(gas.c2h4, gas.c2h6)
    const ratios = { r1, r2, r3 }
    if (!ratiosApplicable(gas, limits)) return result(false, ['NF'], { ratios })
    const faults = []
    const pd = r2 < 0.1 && r3 < 0.2
    if (pd) faults.push('PD')
    if (r1 > 1 && r2 >= 0.1 && r2 <= 0.5 && r3 > 1) faults.push('D1')
    if (r1 >= 0.6 && r1 <= 2.5 && r2 >= 0.1 && r2 <= 1 && r3 > 2) faults.push('D2')
    // T1: CH₄/H₂ không đáng kể (NS) — chỉ xét C₂H₄/C₂H₆ < 1; tránh trùng với PD
    if (!pd && r3 < 1) faults.push('T1')
    if (r1 < 0.1 && r2 > 1 && r3 >= 1 && r3 <= 4) faults.push('T2')
    if (r1 < 0.2 && r2 > 1 && r3 > 4) faults.push('T3')
    return result(true, faults.length ? faults : ['ND'], { ratios })
}

// ── Rogers — IEEE C57.104-2019 Table 5 ──
export const rogersMethod = (gas, communicatingOltc) => {
    const limits = iecLimits(communicatingOltc)
    const ra = ratio(gas.c2h2, gas.c2h4)
    const rb = ratio(gas.ch4, gas.h2)
    const rc = ratio(gas.c2h4, gas.c2h6)
    const ratios = { ra, rb, rc }
    if (!ratiosApplicable(gas, limits)) return result(false, ['NF'], { ratios })
    const inRange = (v, lo, hi) => v >= lo && v <= hi
    let fault = null
    if (ra < 0.1 && inRange(rb, 0.1, 1.0) && rc < 1.0) fault = 'NF'
    else if (ra < 0.1 && rb < 0.1 && rc < 1.0) fault = 'PD'
    else if (inRange(ra, 0.1, 3.0) && inRange(rb, 0.1, 1.0) && rc > 3.0) fault = 'D2'
    else if (ra < 0.1 && inRange(rb, 0.1, 1.0) && inRange(rc, 1.0, 3.0)) fault = 'T1'
    else if (ra < 0.1 && rb > 1.0 && inRange(rc, 1.0, 3.0)) fault = 'T2'
    else if (ra < 0.1 && rb > 1.0 && rc > 3.0) fault = 'T3'
    return result(true, [fault || 'ND'], { ratios })
}

// ── Doernenburg — IEEE C57.104-2019 Annex G.4 ──
export const doernenburgMethod = (gas) => {
    const above = (key, factor = 1) => val(gas, key) > factor * L1_LIMITS[key]
    const r1 = ratio(gas.ch4, gas.h2)
    const r2 = ratio(gas.c2h2, gas.c2h4)
    const r3 = ratio(gas.c2h2, gas.ch4)
    const r4 = ratio(gas.c2h6, gas.c2h2)
    const ratios = { r1, r2, r3, r4 }
    if (!SIX_GASES.some(key => above(key))) return result(false, ['NF'], { ratios })
    // Step 2: 1 khí trong H₂, CH₄, C₂H₂, C₂H₄ > 2×L1 và 1 khí khác > L1
    const faulty = ['h2', 'ch4', 'c2h2', 'c2h4'].some(key => above(key, 2)
        && SIX_GASES.some(other => other !== key && above(other)))
    if (!faulty) return result(false, ['NF'], { ratios })
    // Step 3: mỗi tỷ số phải có ít nhất 1 khí > L1
    const valid = [['ch4', 'h2'], ['c2h2', 'c2h4'], ['c2h2', 'ch4'], ['c2h6', 'c2h2']]
        .every(pair => pair.some(key => above(key)))
    if (!valid) return result(true, ['ND'], { ratios, note: 'Ratios are not significant (Step 3).' })
    if (r1 > 1.0 && r2 < 0.75 && r3 < 0.3 && r4 > 0.4) return result(true, ['T1', 'T2', 'T3'], { ratios, detail: 'Thermal decomposition' })
    if (r1 < 0.1 && r3 < 0.3 && r4 > 0.4) return result(true, ['PD'], { ratios, detail: 'Corona (low intensity PD)' })
    if (r1 > 0.1 && r1 < 1.0 && r2 > 0.75 && r3 > 0.3 && r4 < 0.4) return result(true, ['D2'], { ratios, detail: 'Arcing (high intensity PD)' })
    return result(true, ['ND'], { ratios })
}

// ── Key gas — IEEE C57.104-2019 Annex D.1 ──
export const gasProportions = (gas, keys = SIX_GASES) => {
    const total = keys.reduce((sum, key) => sum + val(gas, key), 0)
    const out = {}
    for (const key of keys) out[key] = total > 0 ? 100 * val(gas, key) / total : 0
    return { total, proportions: out }
}

export const keyGasMethod = (gas) => {
    if (!SIX_GASES.some(key => val(gas, key) > L1_LIMITS[key])) return result(false, ['NF'])
    const { proportions } = gasProportions(gas)
    const sorted = SIX_GASES.slice().sort((a, b) => proportions[b] - proportions[a])
    const top = sorted[0]
    const second = sorted[1]
    if (top === 'c2h4') return result(true, ['T3'], { detail: 'Overheated oil', note: DGA_TOOLTIPS.keyGasOil })
    if (top === 'co') return result(true, ['T1'], { detail: 'Overheated cellulose', note: DGA_TOOLTIPS.keyGasCellulose })
    if (top === 'c2h2') return result(true, ['D2'], { detail: 'Arcing' })
    if (top === 'h2') {
        if (second === 'c2h2' && proportions.c2h2 >= KEY_GAS_ARCING_C2H2_MIN_PERCENT) {
            return result(true, ['D2'], { detail: 'Arcing (H₂ + C₂H₂)' })
        }
        return result(true, ['PD'], { detail: 'Partial discharge' })
    }
    return result(true, ['ND'], { detail: `${GAS_LABELS[top]} is predominant – not a key gas` })
}

// ── Duval Triangle 1 cho bảng Overview ──
export const lowGasSum = (gas) => LOW_GAS_SUM_GASES.reduce((sum, key) => sum + val(gas, key), 0)

export const duvalMethod = (gas) => {
    if (lowGasSum(gas) < LOW_GAS_SUM_LIMIT) return result(false, ['NF'])
    const triangle = analyseTriangle(gas, 1)
    if (!triangle) return result(true, ['ND'])
    return result(true, [triangle.zone], { detail: triangle.name })
}

// ── IEC 60599 summary ──
export const iecSummary = (gas, communicatingOltc) => {
    const limits = iecLimits(communicatingOltc)
    const exceeded = GASES.filter(key => val(gas, key) > limits[key])
    if (!exceeded.length) {
        return { level: 'green', label: 'Within Range', message: 'All gas concentrations are below or within the normal margins.', exceeded }
    }
    const scope = communicatingOltc ? 'transformers with communicating OLTC' : 'transformers without OLTC'
    const details = exceeded.map(key => `${GAS_LABELS[key]} = ${fmt(val(gas, key))} ppm > ${limits[key]} ppm`)
    return {
        level: 'yellow',
        label: 'Exceeded',
        message: `The concentration of ${joinList(exceeded.map(k => GAS_LABELS[k]))} exceeded typical 90th percentile (P90) values for ${scope}: ${joinList(details)}. Action: calculate basic gas ratios and verify rate of increase.`,
        exceeded
    }
}

// ── IEEE C57.104-2019 ──
export const ageGroupIndex = (age) => {
    if (age === null || age === undefined || !Number.isFinite(age) || age < 0) return 0
    if (age <= 9) return 1
    if (age <= 30) return 2
    return 3
}

/**
 * @param options.age         tuổi máy (năm) hoặc null
 * @param options.previous    khí lần đo trước (readGases) hoặc null
 */
export const ieee2019Section = (gas) => {
    const o2 = gas.o2
    const n2 = gas.n2
    if (o2 === null || o2 === undefined || n2 === null || n2 === undefined || !(n2 > 0)) {
        return { section: 'gt', ratio: null, provided: false }
    }
    const r = o2 / n2
    return { section: r <= IEEE2019_O2N2_LIMIT ? 'le' : 'gt', ratio: r, provided: true }
}

export const ieee2019Limits = (gas, age) => {
    const { section } = ieee2019Section(gas)
    const index = ageGroupIndex(age)
    const p90 = {}
    const p95 = {}
    for (const key of GASES) {
        p90[key] = IEEE2019_TABLE1_P90[section][key][index]
        p95[key] = IEEE2019_TABLE2_P95[section][key][index]
    }
    return { section, ageIndex: index, p90, p95, delta: IEEE2019_TABLE3_DELTA[section] }
}

export const ieee2019Summary = (gas, options = {}) => {
    const age = options.age
    const previous = options.previous || null
    const sectionInfo = ieee2019Section(gas)
    const limits = ieee2019Limits(gas, age)
    const aboveP95 = GASES.filter(key => val(gas, key) > limits.p95[key])
    const atOrAboveP90 = GASES.filter(key => val(gas, key) >= limits.p90[key] && !aboveP95.includes(key))

    let deltaExceeded = []
    const deltas = {}
    if (previous) {
        for (const key of GASES) {
            if (gas[key] === null || previous[key] === null || previous[key] === undefined) continue
            const delta = val(gas, key) - val(previous, key)
            deltas[key] = delta
            const limit = limits.delta[key]
            // Chỉ xét mức TĂNG (6.1.1 Step 4d: "does not indicate an increase").
            // C₂H₂: "Any increase"; khí khác: tăng vượt ngưỡng Table 3
            const exceeded = key === 'c2h2' ? delta > 0 : delta > limit
            if (exceeded) deltaExceeded.push(key)
        }
    }

    const notes = []
    notes.push(sectionInfo.provided
        ? `O₂/N₂ = ${fmt(sectionInfo.ratio)} → ${sectionInfo.section === 'le' ? 'O₂/N₂ ≤ 0.2 (sealed)' : 'O₂/N₂ > 0.2 (breathing)'} section.`
        : DGA_TOOLTIPS.ieee2019NoO2n2)
    notes.push(age === null || age === undefined || !Number.isFinite(age)
        ? DGA_TOOLTIPS.ieee2019AgeUnknown
        : `Transformer age: ${age} year(s) → "${['Unknown', '1–9', '10–30', '>30'][limits.ageIndex]}" column.`)
    if (previous) {
        notes.push(`Previous sample: ${options.previousDate || 'unknown date'}${options.daysBetween !== null && options.daysBetween !== undefined ? ` (${options.daysBetween} days)` : ''}.`)
    } else {
        notes.push(DGA_TOOLTIPS.ieee2019NoPrevious)
    }
    notes.push(DGA_TOOLTIPS.ieee2019Rates)

    if (aboveP95.length) {
        return {
            level: 'orange', status: 3, label: 'DGA Status 3',
            message: `Perform fault identification and transformer assessment. Take appropriate action based on transformer assessment results. The concentration of some gases exceeded following limits: absolute gas value ${joinList(aboveP95.map(k => gasWithValue(gas, k)))}.`,
            limits, notes, deltas, deltaExceeded, gases: aboveP95
        }
    }
    if (atOrAboveP90.length || deltaExceeded.length) {
        const list = [...new Set([...atOrAboveP90, ...deltaExceeded])]
        if (deltaExceeded.length) notes.push(DGA_TOOLTIPS.ieee2019Confirm)
        return {
            level: 'yellow', status: 2, label: 'DGA Status 2',
            message: `Take confirmation sample within 1-3 months. The concentration or generation rate of ${joinList(list.map(k => gasWithValue(gas, k)))} exceeded P90 or Delta P95 levels. Fault may be developing.`,
            limits, notes, deltas, deltaExceeded, gases: list
        }
    }
    return {
        level: 'green', status: 1, label: 'DGA Status 1',
        message: 'Continue routine operation. All gas levels and rates of increase are within P90 typical limits.',
        limits, notes, deltas, deltaExceeded, gases: []
    }
}

// ── IEEE C57.104-2008 ──
const conditionOf = (value, limits) => {
    if (value <= limits[0]) return 1
    if (value <= limits[1]) return 2
    if (value <= limits[2]) return 3
    return 4
}
const CONDITION_LEVEL = { 1: 'green', 2: 'yellow', 3: 'orange', 4: 'red' }

export const ieee2008GasConditions = (gas) => {
    const out = {}
    for (const key of GASES) out[key] = conditionOf(val(gas, key), IEEE2008_GAS_LIMITS[key])
    return out
}

export const ieee2008TdcgSummary = (gas) => {
    const tdcg = tdcgOf(gas)
    const condition = conditionOf(tdcg, IEEE2008_TDCG_LIMITS)
    const gasConditions = ieee2008GasConditions(gas)
    const exceeding = GASES.filter(key => gasConditions[key] > 1)
    const messages = {
        1: 'TDCG within this level indicates the transformer is operating satisfactorily.',
        2: 'TDCG indicates greater than normal combustible gas level. Advise additional testing. Caution advised.',
        3: 'TDCG indicates a high level of decomposition. Significant fault probably exists. Plan for outage.',
        4: 'TDCG indicates excessive decomposition. Continued operation could result in failure. Proceed to immediately remove from service.'
    }
    let message = messages[condition]
    if (condition === 1 && exceeding.length) {
        message += ` The concentration of ${joinList(exceeding.map(k => gasWithValue(gas, k)))} exceeds the specified level.`
    }
    return { level: CONDITION_LEVEL[condition], condition, label: `Condition ${condition}`, tdcg, message }
}

export const ieee2008GasSummary = (gas) => {
    const gasConditions = ieee2008GasConditions(gas)
    const condition = Math.max(...GASES.map(key => gasConditions[key]))
    const list = GASES.filter(key => gasConditions[key] === condition).map(k => gasWithValue(gas, k))
    const messages = {
        1: 'All individual combustible gas concentrations are within normal limits (Condition 1).',
        2: `The concentration of ${joinList(list)} exceeds the expected level of a transformer in satisfactory condition. Actions should be taken to establish a trend. Faults are probably present.`,
        3: `The concentration of ${joinList(list)} exceeds Condition 2 limits. Immediate investigation of fault source recommended.`,
        4: `Excessive combustible gas levels detected for ${joinList(list)}. Dangerous condition present.`
    }
    return { level: CONDITION_LEVEL[condition], condition, label: `Condition ${condition}`, message: messages[condition], gasConditions }
}

// ── Gauge (tab Key Gas Analysis) ──
export const GAUGE_STANDARDS = [
    { key: 'ieee2019', label: 'IEEE-2019 C57.104' },
    { key: 'iec', label: 'IEC 60599:2022' },
    { key: 'ieee2008', label: 'IEEE-2008 C57.104' }
]

/**
 * Mỗi cột: bands [{from, to, color}] theo đơn vị ppm, max thang đo, nhãn trạng thái.
 */
export const gaugeColumns = (gas, standard, options = {}) => {
    return GAUGE_ORDER.map(key => {
        const value = val(gas, key)
        let thresholds
        let status
        let levels
        let level
        if (standard === 'iec') {
            const limit = iecLimits(options.communicatingOltc)[key]
            thresholds = [limit]
            levels = ['green', 'orange']
            status = value <= limit ? 'Within Range' : 'Above P90'
            level = value <= limit ? 'green' : 'orange'
        } else if (standard === 'ieee2008') {
            thresholds = IEEE2008_GAS_LIMITS[key]
            levels = ['green', 'yellow', 'orange', 'red']
            const condition = conditionOf(value, thresholds)
            status = `Condition ${condition}`
            level = CONDITION_LEVEL[condition]
        } else {
            const limits = ieee2019Limits(gas, options.age)
            thresholds = [limits.p90[key], limits.p95[key]]
            levels = ['green', 'yellow', 'orange']
            status = value > limits.p95[key] ? 'DGA Status 3' : (value >= limits.p90[key] ? 'DGA Status 2' : 'DGA Status 1')
            level = value > limits.p95[key] ? 'orange' : (value >= limits.p90[key] ? 'yellow' : 'green')
        }
        const top = thresholds[thresholds.length - 1]
        const max = Math.max(top * 1.5, value * 1.1, 1)
        const bounds = [0, ...thresholds, max]
        const bands = levels.map((level, index) => ({ level, from: bounds[index], to: bounds[index + 1] }))
        return { key, label: GAS_LABELS[key], value, max, thresholds, bands, status, level, hasValue: gas[key] !== null && gas[key] !== undefined }
    })
}

// ── Pattern (IEEE C57.104-2008 Figure 3) — P(g) = 100·C(g)/S₆ ──
export const patternCharts = (gas) => {
    const tdcg = tdcgOf(gas)
    return PATTERNS.map(pattern => ({
        ...pattern,
        bars: pattern.gases.map(key => ({
            key,
            label: GAS_LABELS[key],
            measured: tdcg > 0 ? 100 * val(gas, key) / tdcg : 0,
            standard: pattern.standard[key] || 0
        }))
    }))
}

// ── Tổng hợp ──
export const analyseDga = (gas, options = {}) => {
    const hasData = hasAnyGas(gas)
    const methods = {
        duval: duvalMethod(gas),
        iec: iecRatioMethod(gas, options.communicatingOltc),
        rogers: rogersMethod(gas, options.communicatingOltc),
        doernenburg: doernenburgMethod(gas),
        keyGas: keyGasMethod(gas),
        mss: { applied: false, faults: [], disabled: true }
    }
    return {
        hasData,
        tdcg: tdcgOf(gas),
        lowGas: lowGasSum(gas) < LOW_GAS_SUM_LIMIT,
        methods,
        summary: {
            iec: iecSummary(gas, options.communicatingOltc),
            ieee2019: ieee2019Summary(gas, options),
            ieee2008Tdcg: ieee2008TdcgSummary(gas),
            ieee2008Gas: ieee2008GasSummary(gas)
        },
        triangle1: analyseTriangle(gas, 1),
        pentagon1: analysePentagon(gas, 1),
        pentagon2: analysePentagon(gas, 2),
        patterns: patternCharts(gas)
    }
}

export const analyseOltc = (gas) => ({
    hasData: hasAnyGas(gas),
    lowGas: lowGasSum(gas) < LOW_GAS_SUM_LIMIT,
    triangle2: analyseTriangle(gas, 2),
    c2h4c2h2: (val(gas, 'c2h2') > 0) ? val(gas, 'c2h4') / val(gas, 'c2h2') : null
})
