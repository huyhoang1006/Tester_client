import { v5 as uuidv5 } from 'uuid'
import libraries from '@/config/maintenanceActivityLibraries.json'
import linkedTestCodes from '@/config/maintenanceTestLinks.json'
import circuitBreakerCatalog from '@/config/procedures/CircuitBreaker.json'
import Procedure from '@/views/Cim/Procedure'
import * as procedureFunc from '@/function/cim/procedure/index'

const SEED_KEY = 'maintenance_library_seed_v1'
const MRID_NAMESPACE = '45cc6f11-95dc-4c60-82a5-c4b8d0ddc716'

const run = (db, sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, (err) => err ? reject(err) : resolve())
})

const getSeedState = (db) => new Promise((resolve, reject) => {
    db.get('SELECT value FROM app_settings WHERE key = ?', [SEED_KEY], (err, row) => {
        if (err) return reject(err)
        resolve(row && row.value)
    })
})

const makeProcedure = ({ mrid, code, name, kind, instruction }) => {
    const procedure = new Procedure()
    procedure.mrid = mrid
    procedure.alias_name = code
    procedure.name = name
    procedure.instruction = instruction || null
    procedure.kind = kind
    procedure.generic_asset_model = circuitBreakerCatalog.name
    return procedure
}

export const seedMaintenanceLibrary = async (db) => {
    if (await getSeedState(db) === '1') return

    const testProcedures = new Map(circuitBreakerCatalog.procedure.map(item => [item.code, item]))
    const entries = []
    const linkedCodes = new Set()
    const seenActivityCodes = new Set()

    for (const [libraryOrder, [libraryKey, library]] of Object.entries(libraries).entries()) {
        for (const [sequenceNumber, activity] of library.activities.entries()) {
            if (seenActivityCodes.has(activity.code)) throw new Error(`Duplicate maintenance code: ${activity.code}`)
            seenActivityCodes.add(activity.code)

            const codes = activity.linkedTest ? linkedTestCodes[activity.linkedTest] : []
            if (!codes) throw new Error(`Unmapped linked test: ${activity.linkedTest}`)
            codes.forEach(code => {
                if (!testProcedures.has(code)) throw new Error(`Unknown test procedure: ${code}`)
                linkedCodes.add(code)
            })
            entries.push({ libraryKey, libraryLabel: library.label, libraryOrder, sequenceNumber, activity, codes })
        }
    }

    for (const code of linkedCodes) {
        const definition = testProcedures.get(code)
        const result = await procedureFunc.insertProcedureTransaction(makeProcedure({ ...definition, kind: 'test' }), db)
        if (!result.success) throw new Error(`Could not seed test procedure: ${code}`)
    }

    for (const { libraryKey, libraryLabel, libraryOrder, sequenceNumber, activity, codes } of entries) {
        const mrid = uuidv5(`CircuitBreaker:maintenance:${activity.code}`, MRID_NAMESPACE)
        const procedure = makeProcedure({
            mrid,
            code: activity.code,
            name: activity.name,
            kind: 'maintenance',
            instruction: activity.name
        })
        const result = await procedureFunc.insertProcedureTransaction(procedure, db)
        if (!result.success) throw new Error(`Could not seed maintenance procedure: ${activity.code}`)

        await run(db, `INSERT INTO maintenance_procedure
            (mrid, library_key, library_label, library_order, component, activity_type, requirement,
             form_schema, linked_test_label, sequence_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                library_key = excluded.library_key,
                library_label = excluded.library_label,
                library_order = excluded.library_order,
                component = excluded.component,
                activity_type = excluded.activity_type,
                requirement = excluded.requirement,
                form_schema = excluded.form_schema,
                linked_test_label = excluded.linked_test_label,
                sequence_number = excluded.sequence_number`,
        [mrid, libraryKey, libraryLabel, libraryOrder, activity.component, activity.type,
            activity.requirement, activity.schema, activity.linkedTest || null, sequenceNumber])

        for (const code of codes) {
            await run(db, `INSERT OR IGNORE INTO maintenance_test_link
                (maintenance_procedure_mrid, test_procedure_mrid) VALUES (?, ?)`,
            [mrid, testProcedures.get(code).mrid])
        }
    }

    await run(db, `INSERT INTO app_settings(key, value) VALUES(?, '1')
        ON CONFLICT(key) DO UPDATE SET value = '1'`, [SEED_KEY])
}
