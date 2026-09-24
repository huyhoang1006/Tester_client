import db from '../../datacontext/index'
import uuid from '@/utils/uuid'

const run = (dbsql, sql, params = []) => new Promise((resolve, reject) => {
    dbsql.run(sql, params, function (error) {
        if (error) return reject(error)
        resolve(this)
    })
})

const all = (dbsql, sql, params = []) => new Promise((resolve, reject) => {
    dbsql.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows || []))
})

const nullableText = value => value === null || value === undefined ? null : String(value)

const runStatement = (statement, params) => new Promise((resolve, reject) => {
    statement.run(params, error => error ? reject(error) : resolve())
})

const finalizeStatement = statement => new Promise((resolve, reject) => {
    statement.finalize(error => error ? reject(error) : resolve())
})

export const deleteSfraTraceByDatasetIdTransaction = (datasetId, dbsql) => {
    if (!datasetId) return Promise.resolve({ success: true })
    return run(dbsql, 'DELETE FROM sfra_trace WHERE procedure_dataset_id = ?', [datasetId])
}

export const replaceSfraTraceTransaction = async (datasetId, trace, dbsql) => {
    if (!datasetId) return { success: true, data: null }
    await deleteSfraTraceByDatasetIdTransaction(datasetId, dbsql)
    if (!trace) return { success: true, data: null }

    const traceId = trace.mrid || datasetId
    await run(dbsql, `INSERT INTO sfra_trace(
        mrid, procedure_dataset_id, trace_name, group_name, source_standard,
        reference_terminal, response_terminal, measured_date, tap_position,
        shorted_terminals, grounded_terminals, output_voltage, trace_color, source_file
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        traceId,
        datasetId,
        nullableText(trace.trace_name),
        nullableText(trace.group_name),
        nullableText(trace.source_standard),
        nullableText(trace.reference_terminal),
        nullableText(trace.response_terminal),
        nullableText(trace.measured_date),
        nullableText(trace.tap_position),
        nullableText(trace.shorted_terminals),
        nullableText(trace.grounded_terminals),
        nullableText(trace.output_voltage),
        nullableText(trace.trace_color),
        nullableText(trace.source_file),
    ])

    const points = Array.isArray(trace.points) ? trace.points.filter(Boolean) : []
    const statement = dbsql.prepare(`INSERT INTO sfra_trace_point(
        mrid, trace_id, sequence_number, frequency, magnitude, phase
    ) VALUES (?, ?, ?, ?, ?, ?)`)
    try {
        for (let index = 0; index < points.length; index += 1) {
            const point = points[index]
            await runStatement(statement, [
                point.mrid || uuid.newUuid(),
                traceId,
                index,
                nullableText(point.frequency),
                nullableText(point.magnitude),
                nullableText(point.phase),
            ])
        }
    } finally {
        await finalizeStatement(statement)
    }
    return { success: true, data: { ...trace, mrid: traceId } }
}

export const getSfraTracesByDatasetIds = async datasetIds => {
    const ids = [...new Set((Array.isArray(datasetIds) ? datasetIds : []).filter(Boolean))]
    if (!ids.length) return { success: true, data: {} }
    const placeholders = ids.map(() => '?').join(',')
    const traces = await all(db, `SELECT * FROM sfra_trace
        WHERE procedure_dataset_id IN (${placeholders})`, ids)
    if (!traces.length) return { success: true, data: {} }

    const traceIds = traces.map(trace => trace.mrid)
    const pointPlaceholders = traceIds.map(() => '?').join(',')
    const points = await all(db, `SELECT * FROM sfra_trace_point
        WHERE trace_id IN (${pointPlaceholders})
        ORDER BY trace_id, sequence_number`, traceIds)
    const pointsByTrace = {}
    points.forEach(point => {
        if (!pointsByTrace[point.trace_id]) pointsByTrace[point.trace_id] = []
        pointsByTrace[point.trace_id].push(point)
    })
    const result = {}
    traces.forEach(trace => {
        result[trace.procedure_dataset_id] = {
            ...trace,
            points: pointsByTrace[trace.mrid] || [],
        }
    })
    return { success: true, data: result }
}

const STRING_MEASUREMENTS = {
    'd7a7456c-f4fe-4f8b-8ba4-cf0caa0f5102': 'trace_name',
    'd7a7456c-f4fe-4f8b-8ba4-cf0caa0f5103': 'group_name',
    'd7a7456c-f4fe-4f8b-8ba4-cf0caa0f5104': 'source_standard',
    'd7a7456c-f4fe-4f8b-8ba4-cf0caa0f5105': 'reference_terminal',
    'd7a7456c-f4fe-4f8b-8ba4-cf0caa0f5106': 'response_terminal',
    'd7a7456c-f4fe-4f8b-8ba4-cf0caa0f5107': 'measured_date',
    'd7a7456c-f4fe-4f8b-8ba4-cf0caa0f5108': 'tap_position',
    'd7a7456c-f4fe-4f8b-8ba4-cf0caa0f5109': 'shorted_terminals',
    'd7a7456c-f4fe-4f8b-8ba4-cf0caa0f5110': 'grounded_terminals',
    'd7a7456c-f4fe-4f8b-8ba4-cf0caa0f5112': 'trace_color',
    'd7a7456c-f4fe-4f8b-8ba4-cf0caa0f5113': 'source_file',
    'd7a7456c-f4fe-4f8b-8ba4-cf0caa0f5114': 'points_json',
}

/** Move SFRA JSON written by older builds into the normalized trace tables. */
export const migrateLegacySfraTraces = async dbsql => {
    const measurementIds = Object.keys(STRING_MEASUREMENTS)
    const placeholders = measurementIds.map(() => '?').join(',')
    const rows = await all(dbsql, `SELECT pdmv.procedure_dataset_id, smv.string_measurement, smv.value
        FROM procedure_dataset_measurement_value pdmv
        JOIN string_measurement_value smv ON smv.mrid = pdmv.measurement_value_id
        LEFT JOIN sfra_trace st ON st.procedure_dataset_id = pdmv.procedure_dataset_id
        WHERE smv.string_measurement IN (${placeholders}) AND st.mrid IS NULL`, measurementIds)
    if (!rows.length) return { success: true, migrated: 0 }

    const legacy = {}
    rows.forEach(row => {
        if (!legacy[row.procedure_dataset_id]) legacy[row.procedure_dataset_id] = {}
        legacy[row.procedure_dataset_id][STRING_MEASUREMENTS[row.string_measurement]] = row.value
    })

    const datasetIds = Object.keys(legacy)
    const datasetPlaceholders = datasetIds.map(() => '?').join(',')
    const voltageRows = await all(dbsql, `SELECT pdmv.procedure_dataset_id, av.value
        FROM procedure_dataset_measurement_value pdmv
        JOIN analog_value av ON av.mrid = pdmv.measurement_value_id
        WHERE av.analog = 'd7a7456c-f4fe-4f8b-8ba4-cf0caa0f5111'
          AND pdmv.procedure_dataset_id IN (${datasetPlaceholders})`, datasetIds)
    voltageRows.forEach(row => { legacy[row.procedure_dataset_id].output_voltage = row.value })

    let migrated = 0
    await run(dbsql, 'BEGIN TRANSACTION')
    try {
        for (const datasetId of datasetIds) {
            const source = legacy[datasetId]
            let parsed = []
            try {
                const value = JSON.parse(source.points_json || '[]')
                parsed = Array.isArray(value) ? value : []
            } catch (error) {
                parsed = []
            }
            if (!parsed.length) continue
            const trace = {
                mrid: datasetId,
                ...source,
                points: parsed.map((point, index) => ({
                    mrid: (point && point.mrid) || `${datasetId}-point-${index}`,
                    frequency: Array.isArray(point) ? point[0] : point.frequency,
                    magnitude: Array.isArray(point) ? point[1] : point.magnitude,
                    phase: Array.isArray(point) ? point[2] : point.phase,
                })),
            }
            delete trace.points_json
            await replaceSfraTraceTransaction(datasetId, trace, dbsql)
            migrated += 1
        }
        await run(dbsql, 'COMMIT')
    } catch (error) {
        await run(dbsql, 'ROLLBACK').catch(() => {})
        throw error
    }
    return { success: true, migrated }
}
