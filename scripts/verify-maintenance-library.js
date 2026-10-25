const assert = require('assert')
const fs = require('fs')
const path = require('path')
const libraries = require('../src/config/maintenanceActivityLibraries.json')
const links = require('../src/config/maintenanceTestLinks.json')
const catalog = require('../src/config/procedures/CircuitBreaker.json')
const { v5: uuidv5 } = require('uuid')

const namespace = '45cc6f11-95dc-4c60-82a5-c4b8d0ddc716'
const testCodes = new Set(catalog.procedure.map(procedure => procedure.code))
const activityCodes = new Set()
const mrids = new Set()
let linkCount = 0

for (const [key, library] of Object.entries(libraries)) {
    assert(library.label && Array.isArray(library.activities), `Invalid library: ${key}`)
    for (const activity of library.activities) {
        assert(!activityCodes.has(activity.code), `Duplicate activity code: ${activity.code}`)
        activityCodes.add(activity.code)
        assert(activity.component && activity.name && activity.type && activity.schema && activity.requirement)
        const mrid = uuidv5(`CircuitBreaker:maintenance:${activity.code}`, namespace)
        assert(!mrids.has(mrid), `Duplicate mRID: ${mrid}`)
        mrids.add(mrid)

        const testLinks = activity.linkedTest ? links[activity.linkedTest] : []
        assert(Array.isArray(testLinks), `Missing linked-test mapping: ${activity.linkedTest}`)
        for (const testCode of testLinks) {
            assert(testCodes.has(testCode), `Unknown test procedure: ${testCode}`)
            linkCount++
        }
    }
}

assert.strictEqual(libraries.SF6_OUTDOOR.activities.length, 43)
assert.strictEqual(libraries.VCB_OUTDOOR.activities.length, 42)
assert.strictEqual(libraries.MV_SWGR.activities.length, 59)
assert.strictEqual(activityCodes.size, 144)
console.log(`Maintenance library valid: ${activityCodes.size} procedures, ${linkCount} procedure links`)

const sqlite3 = require('@journeyapps/sqlcipher')
const schemaSource = fs.readFileSync(path.join(__dirname, '../src/config/database/schema.js'), 'utf8')
const schema = schemaSource.slice(schemaSource.indexOf('`') + 1, schemaSource.lastIndexOf('`'))
const db = new sqlite3.Database(':memory:')
db.exec(`PRAGMA foreign_keys = ON; ${schema}`, (schemaError) => {
    if (schemaError) throw schemaError

    const maintenanceMrid = uuidv5('CircuitBreaker:maintenance:MCSF6-A1', namespace)
    const testMrid = catalog.procedure.find(procedure => procedure.code === 'PressureGauge').mrid
    db.exec(`
        INSERT INTO identified_object(mrid, name) VALUES ('${maintenanceMrid}', 'MCSF6-A1');
        INSERT INTO document(mrid) VALUES ('${maintenanceMrid}');
        INSERT INTO procedure(mrid, kind) VALUES ('${maintenanceMrid}', 'maintenance');
        INSERT INTO maintenance_procedure
            (mrid, library_key, library_label, library_order, component, activity_type,
             requirement, form_schema, sequence_number)
            VALUES ('${maintenanceMrid}', 'SF6_OUTDOOR', 'Outdoor SF6 CB', 0,
                    'General Inspection', 'SL', 'Mandatory', 'SF6_PRESS', 0);
        INSERT INTO identified_object(mrid, name) VALUES ('${testMrid}', 'Pressure gauge');
        INSERT INTO document(mrid) VALUES ('${testMrid}');
        INSERT INTO procedure(mrid, kind) VALUES ('${testMrid}', 'test');
        INSERT INTO maintenance_test_link(maintenance_procedure_mrid, test_procedure_mrid)
            VALUES ('${maintenanceMrid}', '${testMrid}');
    `, (insertError) => {
        if (insertError) throw insertError
        db.get(`SELECT p.kind, mp.activity_type, t.kind AS test_kind
                FROM maintenance_test_link link
                JOIN maintenance_procedure mp ON mp.mrid = link.maintenance_procedure_mrid
                JOIN procedure p ON p.mrid = mp.mrid
                JOIN procedure t ON t.mrid = link.test_procedure_mrid`, (queryError, row) => {
            if (queryError) throw queryError
            assert.deepStrictEqual(row, { kind: 'maintenance', activity_type: 'SL', test_kind: 'test' })
            db.close()
            console.log('SQLite schema and Procedure-to-Procedure link valid')
        })
    })
})
