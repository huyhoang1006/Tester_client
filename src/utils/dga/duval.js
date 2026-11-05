/* eslint-disable */
/**
 * Duval Triangle 1 / Triangle 2 / Pentagon 1–2.
 * Toạ độ tam giác: [CH₄ %, C₂H₄ %, C₂H₂ %] (tổng 100).
 */
import {
    DUVAL_TRIANGLE_2_ZONES, PENTAGON_1_ZONES, PENTAGON_2_ZONES, PENTAGON_AXES
} from './config'

// labelAt: vị trí đặt nhãn vùng (giữ như bản Triangle 1 cũ cho dễ đọc)
const zone = (code, name, color, points, labelAt) => ({ code, name, color, points, labelAt })

// IEEE C57.104-2019 Table 6 / IEC 60599 Figure B.3
export const DUVAL_TRIANGLE_1_ZONES = [
    zone('PD', 'Partial discharges', '#9fc5e8', [[98, 2, 0], [100, 0, 0], [98, 0, 2]], [99, 0.5, 0.5]),
    zone('D1', 'Discharges of low energy', '#f4cf65', [[0, 0, 100], [0, 23, 77], [64, 23, 13], [87, 0, 13]], [25, 8, 67]),
    zone('D2', 'Discharges of high energy', '#ed8b8b', [[0, 23, 77], [0, 71, 29], [31, 40, 29], [47, 40, 13], [64, 23, 13]], [18, 43, 39]),
    zone('DT', 'Mixed thermal and discharge faults', '#c6acd8', [
        [0, 71, 29], [0, 85, 15], [35, 50, 15], [46, 50, 4],
        [96, 0, 4], [87, 0, 13], [47, 40, 13], [31, 40, 29]
    ], [48, 32, 20]),
    zone('T1', 'Thermal faults T < 300 °C', '#b8dcae', [[76, 20, 4], [80, 20, 0], [98, 2, 0], [98, 0, 2], [96, 0, 4]], [88, 10, 2]),
    zone('T2', 'Thermal faults 300 °C < T < 700 °C', '#f3bd72', [[46, 50, 4], [50, 50, 0], [80, 20, 0], [76, 20, 4]], [64, 34, 2]),
    zone('T3', 'Thermal faults T > 700 °C', '#e87768', [[0, 85, 15], [0, 100, 0], [50, 50, 0], [46, 50, 4], [35, 50, 15]], [23, 70, 7])
]
export { DUVAL_TRIANGLE_2_ZONES }

/** % của 3 khí tam giác; null nếu tổng = 0 */
export const trianglePercentages = (gas) => {
    const ch4 = gas.ch4 || 0
    const c2h4 = gas.c2h4 || 0
    const c2h2 = gas.c2h2 || 0
    const total = ch4 + c2h4 + c2h2
    if (!(total > 0)) return null
    return { ch4: 100 * ch4 / total, c2h4: 100 * c2h4 / total, c2h2: 100 * c2h2 / total }
}

/** Triangle 1 — đúng thứ tự xét của Table 6 */
export const classifyTriangle1 = ({ ch4, c2h4, c2h2 }) => {
    if (ch4 >= 98) return 'PD'
    if (c2h4 < 23 && c2h2 >= 13) return 'D1'
    if ((c2h4 >= 23 && c2h2 >= 29) || (c2h4 >= 23 && c2h4 < 40 && c2h2 >= 13 && c2h2 < 29)) return 'D2'
    if ((c2h4 < 50 && c2h2 >= 4 && c2h2 < 13)
        || (c2h4 >= 40 && c2h4 < 50 && c2h2 >= 13 && c2h2 < 29)
        || (c2h4 >= 50 && c2h2 >= 15 && c2h2 < 29)) return 'DT'
    if (ch4 < 98 && c2h4 < 20 && c2h2 < 4) return 'T1'
    if (c2h4 >= 20 && c2h4 < 50 && c2h2 < 4) return 'T2'
    if (c2h4 >= 50 && c2h2 < 15) return 'T3'
    return 'DT'
}

/**
 * Triangle 2 (OLTC) — IEC 60599 Figure B.4. Giá trị đúng bằng ranh giới thuộc
 * vùng "cao hơn" (vd %C₂H₄ = 23 → phía X3/T2).
 */
export const classifyTriangle2 = ({ ch4, c2h4, c2h2 }) => {
    if (c2h4 >= 23) {
        if (c2h2 >= 15) return 'X3'
        return c2h4 >= 50 ? 'T3' : 'T2'
    }
    if (ch4 >= 2 && ch4 <= 19) return c2h4 >= 6 ? 'N' : 'D1'
    return 'X1'
}

export const analyseTriangle = (gas, type = 1) => {
    const percentages = trianglePercentages(gas)
    if (!percentages) return null
    const zones = type === 2 ? DUVAL_TRIANGLE_2_ZONES : DUVAL_TRIANGLE_1_ZONES
    const code = type === 2 ? classifyTriangle2(percentages) : classifyTriangle1(percentages)
    const zoneData = zones.find(item => item.code === code)
    return { percentages, zone: code, name: zoneData ? zoneData.name : code }
}

// ── Pentagon ──
const pointInPolygon = (x, y, points) => {
    let inside = false
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [xi, yi] = points[i]
        const [xj, yj] = points[j]
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
        if (intersect) inside = !inside
    }
    return inside
}

const distanceToSegment = (px, py, [x1, y1], [x2, y2]) => {
    const dx = x2 - x1
    const dy = y2 - y1
    const len = dx * dx + dy * dy
    let t = len > 0 ? ((px - x1) * dx + (py - y1) * dy) / len : 0
    t = Math.max(0, Math.min(1, t))
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

const distanceToPolygon = (x, y, points) => {
    let best = Infinity
    for (let i = 0; i < points.length; i++) {
        best = Math.min(best, distanceToSegment(x, y, points[i], points[(i + 1) % points.length]))
    }
    return best
}

/**
 * Toạ độ điểm DGA trên Pentagon: % từng khí (trên tổng 5 khí) đặt trên trục của nó,
 * khoảng cách = chính giá trị %; điểm = trọng tâm (theo diện tích) của đa giác 5 điểm.
 * Đa giác suy biến (diện tích ~0, vd chỉ 1 khí) → lấy tổng vector / 3 (giới hạn của
 * trọng tâm tam giác mảnh khi các khí còn lại → 0).
 */
export const pentagonPoint = (gas) => {
    const values = PENTAGON_AXES.map(axis => Math.max(0, gas[axis.gas] || 0))
    const total = values.reduce((sum, v) => sum + v, 0)
    if (!(total > 0)) return null
    const percentages = {}
    const vertices = PENTAGON_AXES.map((axis, index) => {
        const pct = 100 * values[index] / total
        percentages[axis.gas] = pct
        const rad = axis.angle * Math.PI / 180
        return [pct * Math.cos(rad), pct * Math.sin(rad)]
    })
    let area = 0
    let cx = 0
    let cy = 0
    for (let i = 0; i < vertices.length; i++) {
        const [x0, y0] = vertices[i]
        const [x1, y1] = vertices[(i + 1) % vertices.length]
        const cross = x0 * y1 - x1 * y0
        area += cross
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross
    }
    area /= 2
    let x
    let y
    if (Math.abs(area) < 1e-9) {
        x = vertices.reduce((s, v) => s + v[0], 0) / 3
        y = vertices.reduce((s, v) => s + v[1], 0) / 3
    } else {
        x = cx / (6 * area)
        y = cy / (6 * area)
    }
    return { x, y, percentages }
}

export const classifyPentagon = (x, y, zones) => {
    const hit = zones.find(item => pointInPolygon(x, y, item.points))
    if (hit) return hit
    // Rơi đúng biên / ngoài khung do làm tròn → lấy vùng gần nhất
    let best = null
    let bestDistance = Infinity
    for (const item of zones) {
        const d = distanceToPolygon(x, y, item.points)
        if (d < bestDistance) { bestDistance = d; best = item }
    }
    return best
}

export const analysePentagon = (gas, type = 1) => {
    const point = pentagonPoint(gas)
    if (!point) return null
    const zones = type === 2 ? PENTAGON_2_ZONES : PENTAGON_1_ZONES
    const zoneData = classifyPentagon(point.x, point.y, zones)
    return { ...point, zone: zoneData ? zoneData.code : '', name: zoneData ? zoneData.name : '' }
}
