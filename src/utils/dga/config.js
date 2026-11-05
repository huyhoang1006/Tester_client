/* eslint-disable */
/**
 * Cấu hình DGA (TES-288) — gom MỌI ngưỡng, cách ghép kết luận và nội dung tooltip
 * vào một chỗ. Nghiệp vụ muốn đổi ngưỡng / quy ước thì chỉ sửa file này.
 *
 * Nguồn:
 *  - IEEE C57.104-2019: Table 1–3 (6.1.3), Figure 2 + 6.1.1 (Status), Table 5 (Rogers),
 *    Table 6 (Duval Triangle 1), Annex D.1 (Key gas), D.3/D.5 (Pentagon), G.4 (Doernenburg)
 *  - IEEE C57.104-2008: Condition 1–4 (TDCG + từng khí) — theo ticket
 *  - IEC 60599:2022: Table 1 (basic gas ratios), Table A.2 (P90), Figure B.4 (Triangle 2), A.7.4
 */

// Thứ tự khí
export const GASES = ['h2', 'ch4', 'c2h2', 'c2h4', 'c2h6', 'co', 'co2']
export const GAS_LABELS = {
    h2: 'H₂', ch4: 'CH₄', c2h2: 'C₂H₂', c2h4: 'C₂H₄', c2h6: 'C₂H₆', co: 'CO', co2: 'CO₂', o2: 'O₂', n2: 'N₂'
}
// Thứ tự cột gauge theo ticket: H₂, CH₄, C₂H₆, C₂H₄, C₂H₂, CO, CO₂
export const GAUGE_ORDER = ['h2', 'ch4', 'c2h6', 'c2h4', 'c2h2', 'co', 'co2']
// S₆ = TDCG — KHÔNG cộng CO₂
export const TDCG_GASES = ['h2', 'ch4', 'c2h6', 'c2h4', 'c2h2', 'co']
// Banner nồng độ thấp: H₂ + CH₄ + C₂H₄ + C₂H₂ + C₂H₆ < 50 ppm
export const LOW_GAS_SUM_GASES = ['h2', 'ch4', 'c2h4', 'c2h2', 'c2h6']
export const LOW_GAS_SUM_LIMIT = 50

// ── IEC 60599:2022 — 90 % typical values (Table A.2, lấy cận trên như ticket) ──
export const IEC_P90 = { h2: 150, ch4: 130, c2h6: 90, c2h4: 280, c2h2: 20, co: 600, co2: 14000 }
// "Communicating OLTC" = OLTC thông dầu/khí với thùng chính (Table A.2)
export const IEC_P90_C2H2_COMMUNICATING_OLTC = 280

// ── IEEE C57.104-2019 ──
// Cột tuổi: unknown | 1-9 | 10-30 | >30 ; nhánh O₂/N₂: le (≤ 0.2) | gt (> 0.2)
export const IEEE2019_AGE_GROUPS = ['unknown', '1-9', '10-30', '>30']
export const IEEE2019_TABLE1_P90 = {
    le: {
        h2: [80, 75, 75, 100], ch4: [90, 45, 90, 110], c2h6: [90, 30, 90, 150], c2h4: [50, 20, 50, 90],
        c2h2: [1, 1, 1, 1], co: [900, 900, 900, 900], co2: [9000, 5000, 10000, 10000]
    },
    gt: {
        h2: [40, 40, 40, 40], ch4: [20, 20, 20, 20], c2h6: [15, 15, 15, 15], c2h4: [50, 25, 60, 60],
        c2h2: [2, 2, 2, 2], co: [500, 500, 500, 500], co2: [5000, 3500, 5500, 5500]
    }
}
export const IEEE2019_TABLE2_P95 = {
    le: {
        h2: [200, 200, 200, 200], ch4: [150, 100, 150, 200], c2h6: [175, 70, 175, 250], c2h4: [100, 40, 95, 175],
        c2h2: [2, 2, 2, 4], co: [1100, 1100, 1100, 1100], co2: [12500, 7000, 14000, 14000]
    },
    gt: {
        h2: [90, 90, 90, 90], ch4: [50, 60, 60, 30], c2h6: [40, 30, 40, 40], c2h4: [100, 80, 125, 125],
        c2h2: [7, 7, 7, 7], co: [600, 600, 600, 600], co2: [7000, 5000, 8000, 8000]
    }
}
// Table 3 — Delta giữa 2 lần đo liên tiếp, không chuẩn hoá theo thời gian.
// C₂H₂: 0 = "Any increase" (tăng là vượt)
export const IEEE2019_TABLE3_DELTA = {
    le: { h2: 40, ch4: 30, c2h6: 25, c2h4: 20, c2h2: 0, co: 250, co2: 2500 },
    gt: { h2: 25, ch4: 10, c2h6: 7, c2h4: 20, c2h2: 0, co: 175, co2: 1750 }
}
export const IEEE2019_O2N2_LIMIT = 0.2

// ── IEEE C57.104-2008 ──
export const IEEE2008_TDCG_LIMITS = [720, 1920, 4630]
// Giới hạn trên Condition 1 / 2 / 3, vượt C3 → Condition 4
export const IEEE2008_GAS_LIMITS = {
    h2: [100, 700, 1800], ch4: [120, 400, 1000], c2h2: [1, 9, 35], c2h4: [50, 100, 200],
    c2h6: [65, 100, 150], co: [350, 570, 1400], co2: [2500, 4000, 10000]
}

// ── Doernenburg / Key gas — ngưỡng L1 (IEEE C57.104-2019 Table G.3) ──
export const L1_LIMITS = { h2: 100, ch4: 120, co: 350, c2h2: 1, c2h4: 50, c2h6: 65 }

// ── Pattern (IEEE C57.104-2008 Figure 3) ──
export const PATTERNS = [
    { key: 'arcing', title: 'Arcing in oil', keyGas: 'c2h2',
        gases: ['h2', 'ch4', 'c2h6', 'c2h4', 'c2h2'],
        standard: { h2: 60, ch4: 5, c2h6: 2, c2h4: 3, c2h2: 30 } },
    { key: 'oil', title: 'Overheated oil', keyGas: 'c2h4',
        gases: ['h2', 'ch4', 'c2h6', 'c2h4', 'c2h2'],
        standard: { h2: 2, ch4: 16, c2h6: 19, c2h4: 63, c2h2: 0 } },
    { key: 'pd', title: 'Partial discharge in oil', keyGas: 'h2',
        gases: ['h2', 'ch4', 'c2h6', 'c2h4', 'c2h2'],
        standard: { h2: 85, ch4: 13, c2h6: 1, c2h4: 1, c2h2: 0 } },
    { key: 'cellulose', title: 'Overheated cellulose', keyGas: 'co',
        gases: ['co', 'h2', 'ch4', 'c2h6', 'c2h4', 'c2h2'],
        standard: { co: 92, h2: 0, ch4: 0, c2h6: 0, c2h4: 0, c2h2: 0 } }
]
// Key gas: H₂ chủ đạo + C₂H₂ đứng thứ 2 với tỷ trọng ≥ ngưỡng này → hồ quang (D2)
export const KEY_GAS_ARCING_C2H2_MIN_PERCENT = 10

// ── Hàng của bảng DGA Methods Overview ──
export const FAULT_ROWS = [
    { key: 'NF', label: 'No fault' },
    { key: 'PD', label: 'Partial discharges' },
    { key: 'D1', label: 'Discharges of low energy' },
    { key: 'D2', label: 'Discharges of high energy' },
    { key: 'T1', label: 'Thermal faults (T < 300°C)' },
    { key: 'T2', label: 'Thermal faults (300°C < T < 700°C)' },
    { key: 'T3', label: 'Thermal faults (T > 700°C)' },
    { key: 'DT', label: 'Mixed thermal and discharge faults' }
]

// ── Duval Triangle 2 (IEC 60599 Figure B.4) — toạ độ [CH₄, C₂H₄, C₂H₂] % ──
// X1 vẽ trước làm nền cả dải C₂H₄ < 23, D1 và N vẽ đè lên.
export const DUVAL_TRIANGLE_2_ZONES = [
    { code: 'X1', name: 'Overheating t < 300 °C', color: '#b8dcae',
        points: [[100, 0, 0], [77, 23, 0], [0, 23, 77], [0, 0, 100]] },
    { code: 'D1', name: 'Abnormal arcing D1', color: '#f4cf65',
        points: [[19, 0, 81], [19, 6, 75], [2, 6, 92], [2, 0, 98]] },
    { code: 'N', name: 'Normal operation', color: '#9fc5e8',
        points: [[19, 6, 75], [19, 23, 58], [2, 23, 75], [2, 6, 92]] },
    { code: 'X3', name: 'Coking in progress or abnormal arcing D2', color: '#ed8b8b',
        points: [[62, 23, 15], [0, 23, 77], [0, 85, 15]] },
    { code: 'T2', name: 'Severe coking of contacts t > 300 °C', color: '#f3bd72',
        points: [[77, 23, 0], [62, 23, 15], [35, 50, 15], [50, 50, 0]] },
    { code: 'T3', name: 'Severe coking of contacts t > 700 °C', color: '#e87768',
        points: [[50, 50, 0], [35, 50, 15], [0, 85, 15], [0, 100, 0]] }
]

// ── Duval Pentagon (IEEE C57.104-2019 D.3 / D.5) — tâm (0,0), đỉnh H₂ ở (0,40) ──
// Hai khe hở trong bảng gốc đã được khép lại: T3 (1,-32) → (1,-32.4), T1 (-35,3) → (-35,3.1)
const PENTAGON_COMMON = {
    PD: [[0, 33], [-1, 33], [-1, 24.5], [0, 24.5]],
    D1: [[0, 40], [38, 12], [32, -6.1], [4, 16], [0, 1.5]],
    D2: [[4, 16], [32, -6.1], [24.3, -30], [0, -3], [0, 1.5]],
    S: [[0, 1.5], [-35, 3.1], [-38, 12.4], [0, 40], [0, 33], [-1, 33], [-1, 24.5], [0, 24.5]]
}
export const PENTAGON_1_ZONES = [
    { code: 'PD', name: 'Partial discharges', color: '#9fc5e8', points: PENTAGON_COMMON.PD },
    { code: 'D1', name: 'Discharges of low energy', color: '#f4cf65', points: PENTAGON_COMMON.D1 },
    { code: 'D2', name: 'Discharges of high energy', color: '#ed8b8b', points: PENTAGON_COMMON.D2 },
    { code: 'T3', name: 'Thermal faults T > 700 °C', color: '#e87768',
        points: [[0, -3], [24.3, -30], [23.5, -32.4], [1, -32.4], [-6, -4]] },
    { code: 'T2', name: 'Thermal faults 300 °C < T < 700 °C', color: '#f3bd72',
        points: [[-6, -4], [1, -32.4], [-22.5, -32.4]] },
    { code: 'T1', name: 'Thermal faults T < 300 °C', color: '#b8dcae',
        points: [[-6, -4], [-22.5, -32.4], [-23.5, -32.4], [-35, 3.1], [0, 1.5], [0, -3]] },
    { code: 'S', name: 'Stray gassing', color: '#d9d2e9', points: PENTAGON_COMMON.S }
]
export const PENTAGON_2_ZONES = [
    { code: 'PD', name: 'Partial discharges', color: '#9fc5e8', points: PENTAGON_COMMON.PD },
    { code: 'D1', name: 'Discharges of low energy', color: '#f4cf65', points: PENTAGON_COMMON.D1 },
    { code: 'D2', name: 'Discharges of high energy', color: '#ed8b8b', points: PENTAGON_COMMON.D2 },
    { code: 'T3-H', name: 'Thermal fault T3 in oil only', color: '#e87768',
        points: [[0, -3], [24.3, -30], [23.5, -32.4], [2.5, -32.4], [-3.5, -3]] },
    { code: 'C', name: 'Possible carbonization of paper', color: '#a4805c',
        points: [[-3.5, -3], [2.5, -32.4], [-21.5, -32.4], [-11, -8]] },
    { code: 'O', name: 'Overheating T < 250 °C', color: '#b8dcae',
        points: [[-3.5, -3], [-11, -8], [-21.5, -32.4], [-23.5, -32.4], [-35, 3.1], [0, 1.5], [0, -3]] },
    { code: 'S', name: 'Stray gassing', color: '#d9d2e9', points: PENTAGON_COMMON.S }
]
// Trục Pentagon: góc (độ) tính từ trục x, H₂ trên cùng, theo chiều kim đồng hồ
export const PENTAGON_AXES = [
    { gas: 'h2', angle: 90 },
    { gas: 'c2h2', angle: 18 },
    { gas: 'c2h4', angle: -54 },
    { gas: 'ch4', angle: -126 },
    { gas: 'c2h6', angle: 162 }
]
// Khung ngũ giác bán kính 40 (đỉnh H₂ ở (0,40)). Điểm % của từng khí đặt trên trục
// với khoảng cách = chính giá trị % (0–100) → trọng tâm luôn nằm trong ±33.3, khớp
// với vùng PD (0, 24.5–33) của bảng toạ độ.
export const PENTAGON_RADIUS = 40

// ── Màu trạng thái ──
export const STATUS_COLORS = { green: '#9bd38f', yellow: '#f5e17a', orange: '#f5a54a', red: '#ef6b5b', grey: '#d5d9e0' }

// ── Tooltip (tiếng Anh — hiển thị cho người dùng) ──
export const DGA_TOOLTIPS = {
    o2n2Input: 'Optional. Used only to select the IEEE C57.104-2019 limit section (O₂/N₂ ≤ 0.2 or > 0.2).',
    communicatingOltc: 'Tick if oil or gas can pass between the OLTC compartment and the main tank. The IEC typical C₂H₂ limit becomes 280 ppm instead of 20 ppm (IEC 60599:2022 Table A.2).',
    methodApplied: 'Ticked when the gas levels are high enough for the method to be applied.',
    noDiagnosis: 'Ticked when the method is applied but the gas pattern does not match any of its fault cases.',
    noFault: 'Ticked when gas levels are below the method\'s application limits.',
    duval: 'Duval Triangle 1 (IEEE C57.104-2019 Table 6). Applied when H₂ + CH₄ + C₂H₄ + C₂H₂ + C₂H₆ ≥ 50 ppm; otherwise gas levels are too low for a reliable assessment.',
    iec: 'IEC 60599:2022 Table 1 (R1 = C₂H₂/C₂H₄, R2 = CH₄/H₂, R3 = C₂H₄/C₂H₆). T1 uses R3 < 1 only (CH₄/H₂ is non-significant). Applied when at least one of H₂, CH₄, C₂H₂, C₂H₄, C₂H₆ exceeds the IEC 90 % typical values (§6.1 c). D1 and D2 may both be indicated (dual attribution).',
    rogers: 'IEEE C57.104-2019 Table 5 (C₂H₂/C₂H₄, CH₄/H₂, C₂H₄/C₂H₆). Applied when at least one of H₂, CH₄, C₂H₂, C₂H₄, C₂H₆ exceeds the IEC 90 % typical values.',
    doernenburg: 'IEEE C57.104-2019 Annex G.4. Applied when one of H₂, CH₄, C₂H₂, C₂H₄ exceeds 2×L1 and another gas exceeds L1 (L1: Table G.3). Each ratio needs at least one gas above L1 to be valid. "Thermal decomposition" does not classify temperature, so T1, T2 and T3 are all marked.',
    keyGas: 'Diagnosis by the predominant gas (IEEE C57.104-2019 Annex D.1): C₂H₄ → overheated oil (T3), CO → overheated cellulose (T1), H₂ + C₂H₂ → arcing (D2), H₂ → partial discharge (PD). Applied when at least one gas exceeds L1 (Table G.3).',
    keyGasCellulose: 'Overheated cellulose (CO predominant). The Key Gas method does not classify temperature; shown as T1 by convention.',
    keyGasOil: 'Overheated oil (C₂H₄ predominant). Shown as T3 by convention.',
    mss: 'Rule set not available. The MSS-Scheme is not defined in IEEE C57.104 or IEC 60599.',
    dt: 'Mixed thermal and discharge faults — only provided by Duval Triangle 1.',
    iecSummary: 'IEC 60599:2022 Table A.2 — 90 % typical values (upper bound of the ranges).',
    ieee2019Summary: 'IEEE C57.104-2019 §6.1.1 / Figure 2. Status 1: all gases < Table 1 and all deltas < Table 3. Status 2: a gas between Table 1 and Table 2, or a delta above Table 3. Status 3: a gas above Table 2.',
    ieee2019NoO2n2: 'O₂/N₂ not provided – the O₂/N₂ > 0.2 section is used (IEEE C57.104-2019 §6.1.1 Step 3).',
    ieee2019AgeUnknown: 'Manufacturing year not available – the "Unknown" age column is used.',
    ieee2019NoPrevious: 'No previous sample – gas increase (Table 3 delta) is not evaluated.',
    ieee2019Confirm: 'Confirmation sample recommended within one month (IEEE C57.104-2019 §6.1.1 Step 4b).',
    ieee2019Rates: 'Multi-point rates (Table 4) are not evaluated in this version.',
    ieee2008TdcgSummary: 'IEEE C57.104-2008 — TDCG = H₂ + CH₄ + C₂H₆ + C₂H₄ + C₂H₂ + CO (CO₂ excluded).',
    ieee2008GasSummary: 'IEEE C57.104-2008 Table 1 — individual gas condition limits.',
    status3Icon: 'DGA Status 3 – probably suspicious. Fault identification and transformer assessment are required.',
    lowGas: 'The concentration of hydrocarbon gases and hydrogen is too low for a reliable assessment.',
    pentagonGaps: 'Small gaps in the published zone coordinates are closed so every point receives a zone.',
    triangle2Limits: 'Zone limits from IEC 60599:2022 Figure B.4. Boundary values are assigned to the higher zone.',
    pentagonPoint: 'The relative % of H₂, C₂H₆, CH₄, C₂H₄ and C₂H₂ (in their sum) is plotted on each of the five axes; the DGA point is the centroid of the resulting polygon.',
    oltcNote: 'OLTCs normally produce arcing gases (D1/D2). Main-tank methods are not applicable to OLTC compartment oil – use Duval Triangle 2 and the C₂H₄/C₂H₂ fingerprint (IEC 60599:2022 A.7.4).',
    oltcRatio: 'C₂H₄/C₂H₂ is a fingerprint of the OLTC model and operation mode. Compare it with previous results; a significant change indicates irregularities.',
    gaugeIec: 'Green: ≤ IEC 90 % typical value. Orange: above it.',
    gaugeIeee2019: 'Green: < Table 1 (P90). Yellow: between Table 1 and Table 2 (P95). Orange: > Table 2.',
    gaugeIeee2008: 'Green: Condition 1. Yellow: Condition 2. Orange: Condition 3. Red: Condition 4.',
    pattern: 'IEEE C57.104-2008 Figure 3. Measurement: P(g) = 100 × C(g) / TDCG (S₆ = H₂ + CH₄ + C₂H₆ + C₂H₄ + C₂H₂ + CO).'
}
