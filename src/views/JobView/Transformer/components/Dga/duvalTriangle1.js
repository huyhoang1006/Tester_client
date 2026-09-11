const zone = (code, name, color, points) => ({ code, name, color, points })

// Published Duval Triangle 1 boundaries, expressed as
// [CH4 %, C2H4 %, C2H2 %]. Every point must total 100.
export const DUVAL_TRIANGLE_1_ZONES = [
    zone('PD', 'Partial discharge', '#9fc5e8', [
        [98, 2, 0], [100, 0, 0], [98, 0, 2]
    ]),
    zone('D1', 'Low-energy discharge', '#f4cf65', [
        [0, 0, 100], [0, 23, 77], [64, 23, 13], [87, 0, 13]
    ]),
    zone('D2', 'High-energy discharge', '#ed8b8b', [
        [0, 23, 77], [0, 71, 29], [31, 40, 29], [47, 40, 13], [64, 23, 13]
    ]),
    zone('DT', 'Thermal and electrical fault', '#c6acd8', [
        [0, 71, 29], [0, 85, 15], [35, 50, 15], [46, 50, 4],
        [96, 0, 4], [87, 0, 13], [47, 40, 13], [31, 40, 29]
    ]),
    zone('T1', 'Thermal fault below 300 C', '#b8dcae', [
        [76, 20, 4], [80, 20, 0], [98, 2, 0], [98, 0, 2], [96, 0, 4]
    ]),
    zone('T2', 'Thermal fault from 300 C to 700 C', '#f3bd72', [
        [46, 50, 4], [50, 50, 0], [80, 20, 0], [76, 20, 4]
    ]),
    zone('T3', 'Thermal fault above 700 C', '#e87768', [
        [0, 85, 15], [0, 100, 0], [50, 50, 0], [46, 50, 4], [35, 50, 15]
    ])
]

const readGasValue = (row, key) => {
    const cell = row && row[key]
    const raw = cell && typeof cell === 'object' ? cell.value : cell
    if (raw === '' || raw === null || raw === undefined) return null
    const value = Number(raw)
    return Number.isFinite(value) && value >= 0 ? value : null
}

export const classifyDuvalTriangle1 = ({ ch4, c2h4, c2h2 }) => {
    if (ch4 >= 98) return 'PD'
    if (c2h4 < 23 && c2h2 >= 13) return 'D1'
    if ((c2h4 >= 23 && c2h2 >= 29)
        || (c2h4 >= 23 && c2h4 < 40 && c2h2 >= 13 && c2h2 < 29)) return 'D2'
    if ((c2h4 < 50 && c2h2 >= 4 && c2h2 < 13)
        || (c2h4 >= 40 && c2h4 < 50 && c2h2 >= 13 && c2h2 < 29)
        || (c2h4 >= 50 && c2h2 >= 15 && c2h2 < 29)) return 'DT'
    if (ch4 < 98 && c2h4 < 20 && c2h2 < 4) return 'T1'
    if (c2h4 >= 20 && c2h4 < 50 && c2h2 < 4) return 'T2'
    if (c2h4 >= 50 && c2h2 < 15) return 'T3'
    return 'DT'
}

export const analyseDuvalTriangle1Row = (row, index) => {
    const values = {
        ch4: readGasValue(row, 'ch4'),
        c2h4: readGasValue(row, 'c2h4'),
        c2h2: readGasValue(row, 'c2h2')
    }
    if (Object.values(values).some(value => value === null)) return null

    const total = values.ch4 + values.c2h4 + values.c2h2
    if (!(total > 0)) return null

    const percentages = {
        ch4: values.ch4 * 100 / total,
        c2h4: values.c2h4 * 100 / total,
        c2h2: values.c2h2 * 100 / total
    }
    const zoneCode = classifyDuvalTriangle1(percentages)
    const zoneData = DUVAL_TRIANGLE_1_ZONES.find(item => item.code === zoneCode)

    return {
        index,
        values,
        percentages,
        zone: zoneCode,
        diagnosis: zoneData ? zoneData.name : zoneCode
    }
}

export const analyseDuvalTriangle1Rows = (rows = []) => {
    const samples = rows
        .map((row, index) => analyseDuvalTriangle1Row(row, index))
        .filter(Boolean)

    return samples.map((sample, index) => ({
        ...sample,
        sampleNumber: index + 1,
        label: samples.length === 1 ? 'Sample' : `Sample ${index + 1}`
    }))
}
