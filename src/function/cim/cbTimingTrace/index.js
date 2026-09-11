import db from '../../datacontext/index'

const run = (dbsql, sql, params = []) => new Promise((resolve, reject) => {
    dbsql.run(sql, params, function (error) {
        if (error) return reject(error)
        resolve(this)
    })
})

const all = (dbsql, sql, params = []) => new Promise((resolve, reject) => {
    dbsql.all(sql, params, (error, rows) => {
        if (error) return reject(error)
        resolve(rows || [])
    })
})

export const ensureCbTimingTraceTablesTransaction = async (dbsql) => {
    await run(dbsql, `CREATE TABLE IF NOT EXISTS cb_timing_trace (
        mrid TEXT PRIMARY KEY,
        work_task_id TEXT NOT NULL,
        measurement_index INTEGER,
        sequence_number INTEGER,
        column_index INTEGER,
        name TEXT,
        signal_type TEXT,
        phase TEXT,
        interrupter TEXT,
        source_type TEXT,
        source_serial TEXT,
        source_channel_index TEXT,
        channel_group TEXT,
        channel_group_index TEXT,
        data_type TEXT,
        unit TEXT,
        FOREIGN KEY (work_task_id) REFERENCES work_task(mrid) ON DELETE CASCADE
    )`)
    await run(dbsql, `CREATE TABLE IF NOT EXISTS cb_timing_trace_point (
        mrid TEXT PRIMARY KEY,
        trace_id TEXT NOT NULL,
        sequence_number INTEGER NOT NULL,
        time TEXT,
        value TEXT,
        FOREIGN KEY (trace_id) REFERENCES cb_timing_trace(mrid) ON DELETE CASCADE
    )`)
    await run(dbsql, 'CREATE INDEX IF NOT EXISTS idx_cb_timing_trace_work_task ON cb_timing_trace(work_task_id)')
    await run(dbsql, 'CREATE INDEX IF NOT EXISTS idx_cb_timing_trace_point_trace ON cb_timing_trace_point(trace_id, sequence_number)')
}

const insertPoints = (dbsql, traceId, points) => new Promise((resolve, reject) => {
    const list = Array.isArray(points) ? points.filter(Boolean) : []
    if (list.length === 0) return resolve()

    const statement = dbsql.prepare(
        `INSERT INTO cb_timing_trace_point(
            mrid, trace_id, sequence_number, time, value
        ) VALUES (?, ?, ?, ?, ?)`
    )
    let pending = list.length
    let failed = null
    list.forEach((point, index) => {
        statement.run([
            point.mrid || `${traceId}-point-${index}`,
            traceId,
            point.sequence_number == null ? index : point.sequence_number,
            point.time == null ? null : String(point.time),
            point.value == null ? null : String(point.value),
        ], (error) => {
            if (error && !failed) failed = error
            pending -= 1
            if (pending !== 0) return
            statement.finalize(() => failed ? reject(failed) : resolve())
        })
    })
})

/** Replace every raw timing channel belonging to one O/C/CO timing work task. */
export const replaceCbTimingTracesTransaction = async (workTaskId, traces, dbsql) => {
    if (!workTaskId) return { success: true, data: [], message: 'No work task id' }
    await ensureCbTimingTraceTablesTransaction(dbsql)
    await run(dbsql, `DELETE FROM cb_timing_trace_point
        WHERE trace_id IN (SELECT mrid FROM cb_timing_trace WHERE work_task_id = ?)`, [workTaskId])
    await run(dbsql, 'DELETE FROM cb_timing_trace WHERE work_task_id = ?', [workTaskId])

    const list = Array.isArray(traces) ? traces.filter(Boolean) : []
    for (let index = 0; index < list.length; index += 1) {
        const trace = list[index]
        const traceId = trace.mrid || `${workTaskId}-trace-${index}`
        await run(dbsql, `INSERT INTO cb_timing_trace(
            mrid, work_task_id, measurement_index, sequence_number, column_index,
            name, signal_type, phase, interrupter, source_type, source_serial,
            source_channel_index, channel_group, channel_group_index, data_type, unit
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            traceId,
            workTaskId,
            trace.measurement_index == null ? 0 : trace.measurement_index,
            trace.sequence_number == null ? index : trace.sequence_number,
            trace.column_index == null ? null : trace.column_index,
            trace.name || null,
            trace.signal_type || null,
            trace.phase || null,
            trace.interrupter || null,
            trace.source_type || null,
            trace.source_serial || null,
            trace.source_channel_index || null,
            trace.channel_group || null,
            trace.channel_group_index || null,
            trace.data_type || null,
            trace.unit || null,
        ])
        await insertPoints(dbsql, traceId, trace.points)
    }
    return { success: true, data: list, message: 'Circuit Breaker timing traces written' }
}

export const getCbTimingTracesByWorkTaskIds = async (workTaskIds) => {
    const ids = (Array.isArray(workTaskIds) ? workTaskIds : []).filter(Boolean)
    if (ids.length === 0) return { success: true, data: {}, message: 'No work task id' }
    await ensureCbTimingTraceTablesTransaction(db)

    const placeholders = ids.map(() => '?').join(',')
    const traces = await all(db, `SELECT * FROM cb_timing_trace
        WHERE work_task_id IN (${placeholders})
        ORDER BY work_task_id, measurement_index, sequence_number`, ids)
    if (traces.length === 0) return { success: true, data: {}, message: 'No timing trace' }

    const traceIds = traces.map(trace => trace.mrid)
    const pointPlaceholders = traceIds.map(() => '?').join(',')
    const points = await all(db, `SELECT * FROM cb_timing_trace_point
        WHERE trace_id IN (${pointPlaceholders})
        ORDER BY trace_id, sequence_number`, traceIds)
    const pointsByTrace = {}
    points.forEach(point => {
        if (!pointsByTrace[point.trace_id]) pointsByTrace[point.trace_id] = []
        pointsByTrace[point.trace_id].push(point)
    })

    const grouped = {}
    traces.forEach(trace => {
        if (!grouped[trace.work_task_id]) grouped[trace.work_task_id] = []
        grouped[trace.work_task_id].push(Object.assign({}, trace, {
            points: pointsByTrace[trace.mrid] || [],
        }))
    })
    return { success: true, data: grouped, message: 'Get Circuit Breaker timing traces completed' }
}

export const getCbTimingTracesByWorkTaskId = async workTaskId => {
    const result = await getCbTimingTracesByWorkTaskIds([workTaskId])
    return {
        success: result.success,
        data: result.data[workTaskId] || [],
        message: result.message,
    }
}

