import sfraDefinition from '@/config/test-definitions/Transformer/SFRA.json'

const FIELD_CODES = [
    'trace_name',
    'group_name',
    'source_standard',
    'reference_terminal',
    'response_terminal',
    'measured_date',
    'tap_position',
    'shorted_terminals',
    'grounded_terminals',
    'output_voltage',
    'trace_color',
    'source_file',
]

const COLUMN_BY_CODE = Object.fromEntries(
    (sfraDefinition.columns || []).map(column => [column.code, column])
)

export const cellValue = (row, code) => {
    const cell = row && row[code]
    return cell && typeof cell === 'object' && Object.prototype.hasOwnProperty.call(cell, 'value')
        ? cell.value
        : cell
}

export const parseSfraPoints = value => {
    if (Array.isArray(value)) return value
    try {
        const parsed = JSON.parse(String(value || '[]'))
        return Array.isArray(parsed) ? parsed : []
    } catch (error) {
        return []
    }
}

const text = value => value === null || value === undefined ? null : String(value)

const pointValue = (point, key, tupleIndex) => {
    if (Array.isArray(point)) return point[tupleIndex]
    return point && point[key]
}

export const sfraTraceFromRow = row => {
    if (!row || !row.mrid) return null
    const traceId = row._sfraTraceMrid || row.sfra_trace_id || row.mrid
    const trace = {
        mrid: traceId,
        procedure_dataset_id: row.mrid,
    }
    FIELD_CODES.forEach(code => {
        trace[code] = text(cellValue(row, code))
    })
    trace.points = parseSfraPoints(cellValue(row, 'points_json')).map((point, index) => ({
        mrid: (point && point.mrid) || `${traceId}-point-${index}`,
        sequence_number: index,
        frequency: text(pointValue(point, 'frequency', 0)),
        magnitude: text(pointValue(point, 'magnitude', 1)),
        phase: text(pointValue(point, 'phase', 2)),
    }))
    return trace
}

const virtualCell = (traceId, code, value) => {
    const column = COLUMN_BY_CODE[code] || {}
    return {
        mrid: `${traceId}-${code}`,
        type: column.type || 'string',
        unit: column.unit || '',
        value: value === null || value === undefined ? '' : value,
        measurement_id: column.mrid || '',
    }
}

export const applySfraTraceToRow = (row, trace) => {
    if (!row || !trace) return row
    const traceId = trace.mrid || row.mrid
    row._sfraTraceMrid = traceId
    FIELD_CODES.forEach(code => {
        row[code] = virtualCell(traceId, code, trace[code])
    })
    const points = (trace.points || []).map(point => ({
        mrid: point.mrid,
        frequency: point.frequency,
        magnitude: point.magnitude,
        phase: point.phase,
    }))
    row.points_json = virtualCell(traceId, 'points_json', JSON.stringify(points))
    return row
}

export const buildSfraTraceMap = testList => {
    const traces = {}
    const sfraTests = (testList || []).filter(test => test && test.testTypeCode === 'SFRA')
    sfraTests.forEach(test => {
        const tables = (test.data && test.data.table) || {}
        Object.values(tables).forEach(rows => {
            const tableRows = Array.isArray(rows) ? rows : []
            tableRows.forEach(row => {
                const trace = sfraTraceFromRow(row)
                if (trace) traces[trace.procedure_dataset_id] = trace
            })
        })
    })
    return traces
}

export const applySfraTracesToTests = (testList, traces) => {
    const map = traces || {}
    const sfraTests = (testList || []).filter(test => test && test.testTypeCode === 'SFRA')
    sfraTests.forEach(test => {
        const tables = (test.data && test.data.table) || {}
        Object.values(tables).forEach(rows => {
            const tableRows = Array.isArray(rows) ? rows : []
            tableRows.forEach(row => {
                if (map[row.mrid]) applySfraTraceToRow(row, map[row.mrid])
            })
        })
    })
    return testList
}

export const sfraTraceToSnapshotCells = trace => {
    const row = applySfraTraceToRow({ mrid: trace.procedure_dataset_id }, trace)
    const cells = {}
    Object.keys(row).forEach(code => {
        const cell = row[code]
        if (!cell || typeof cell !== 'object' || !cell.measurement_id) return
        cells[cell.measurement_id] = {
            measurementId: cell.measurement_id,
            name: (COLUMN_BY_CODE[code] && COLUMN_BY_CODE[code].name) || code,
            aliasName: '',
            kind: cell.type,
            unit: cell.unit || '',
            value: cell.value,
        }
    })
    return cells
}

export const SFRA_FIELD_CODES = FIELD_CODES
