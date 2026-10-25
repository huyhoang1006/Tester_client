const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { v5: uuidv5 } = require('uuid')

const libraries = require('../src/config/maintenanceActivityLibraries.json')
const linkedTestCodes = require('../src/config/maintenanceTestLinks.json')
const clientCatalog = require('../src/config/procedures/CircuitBreaker.json')
const serverRoot = path.resolve(__dirname, '../../Tester_server/job-service')
const serverCatalog = require(path.join(serverRoot, 'src/main/resources/config/procedures/CircuitBreaker.json'))
const target = path.join(serverRoot, 'src/main/resources/db/migration/V15__maintenance_activity_library.sql')
const namespace = '45cc6f11-95dc-4c60-82a5-c4b8d0ddc716'

const quote = value => value == null ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`
const clientTests = new Map(clientCatalog.procedure.map(item => [item.code, item]))
const serverTests = new Map(serverCatalog.procedure.map(item => [item.code, item]))
const activities = []
const links = []
const referencedTests = new Map()
const codes = new Set()

assert.strictEqual(clientCatalog.name, serverCatalog.name, 'Circuit breaker catalog names differ')

Object.entries(libraries).forEach(([libraryKey, library], libraryOrder) => {
    assert(library.label && Array.isArray(library.activities), `Invalid library: ${libraryKey}`)
    library.activities.forEach((activity, sequenceNumber) => {
        assert(!codes.has(activity.code), `Duplicate maintenance code: ${activity.code}`)
        codes.add(activity.code)
        assert(activity.name && activity.component && activity.type && activity.requirement && activity.schema)

        const mrid = uuidv5(`CircuitBreaker:maintenance:${activity.code}`, namespace)
        activities.push({ ...activity, mrid, libraryKey, libraryLabel: library.label, libraryOrder, sequenceNumber })

        const testCodes = activity.linkedTest ? linkedTestCodes[activity.linkedTest] : []
        assert(Array.isArray(testCodes), `Unmapped linked test: ${activity.linkedTest}`)
        for (const code of testCodes) {
            const clientTest = clientTests.get(code)
            const serverTest = serverTests.get(code)
            assert(clientTest && serverTest, `Missing linked test in client/server catalog: ${code}`)
            assert.strictEqual(serverTest.mrid, clientTest.mrid, `Client/server test mRID differs: ${code}`)
            referencedTests.set(code, serverTest)
            links.push({ maintenanceMrid: mrid, testMrid: clientTest.mrid })
        }
    })
})

assert.strictEqual(activities.length, 144)
assert.strictEqual(links.length, 45)

const requiredTestValues = [...referencedTests.values()].map(item =>
    `        (${quote(item.mrid)}, ${quote(item.code)})`)
const procedureValues = activities.map(item =>
    `    (${[item.mrid, item.name, item.code, 'maintenance', clientCatalog.name, item.name].map(quote).join(', ')}, 2)`)
const metadataValues = activities.map(item =>
    `    (${[item.mrid, item.libraryKey, item.libraryLabel, item.libraryOrder, item.component,
        item.type, item.requirement, item.schema, item.linkedTest || null, item.sequenceNumber].map(quote).join(', ')})`)
const linkValues = links.map(item =>
    `    (${quote(item.maintenanceMrid)}, ${quote(item.testMrid)})`)

const sql = `-- Maintenance activity library for Circuit breaker. Generated from the client catalog.
-- Run after V14 when Flyway is disabled. Safe to rerun: seed rows are insert-only.
-- Keep maintenance Procedure mRIDs identical to the client UUIDv5 seed.
-- Linked tests must already have their complete measurement definitions on the server.
DO $$
DECLARE missing_codes TEXT;
BEGIN
    SELECT STRING_AGG(required.code, ', ' ORDER BY required.code) INTO missing_codes
    FROM (VALUES
${requiredTestValues.join(',\n')}
    ) AS required(mrid, code)
    LEFT JOIN public."procedure" p ON p.mrid = required.mrid AND p.kind = 'test'
    WHERE p.mrid IS NULL
       OR NOT EXISTS (SELECT 1 FROM public.measurement_procedure mp
                      WHERE mp.procedure_id = required.mrid);
    IF missing_codes IS NOT NULL THEN
        RAISE EXCEPTION 'V15 requires test procedures with measurement definitions: %', missing_codes;
    END IF;
END $$;

ALTER TABLE public."procedure" ADD COLUMN IF NOT EXISTS instruction TEXT;

CREATE TABLE IF NOT EXISTS public.maintenance_procedure (
    mrid TEXT PRIMARY KEY REFERENCES public."procedure"(mrid) ON DELETE CASCADE,
    library_key TEXT NOT NULL,
    library_label TEXT NOT NULL,
    library_order INTEGER NOT NULL,
    component TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    requirement TEXT NOT NULL,
    form_schema TEXT NOT NULL,
    linked_test_label TEXT,
    sequence_number INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_maintenance_procedure_library
    ON public.maintenance_procedure (library_key, sequence_number);

CREATE TABLE IF NOT EXISTS public.maintenance_test_link (
    maintenance_procedure_mrid TEXT NOT NULL REFERENCES public.maintenance_procedure(mrid) ON DELETE CASCADE,
    test_procedure_mrid TEXT NOT NULL REFERENCES public."procedure"(mrid) ON DELETE CASCADE,
    PRIMARY KEY (maintenance_procedure_mrid, test_procedure_mrid)
);
CREATE INDEX IF NOT EXISTS idx_maintenance_test_link_test
    ON public.maintenance_test_link (test_procedure_mrid);

INSERT INTO public."procedure" (mrid, name, alias_name, kind, generic_asset_model, instruction, status) VALUES
${procedureValues.join(',\n')}
ON CONFLICT (mrid) DO NOTHING;

INSERT INTO public.maintenance_procedure
    (mrid, library_key, library_label, library_order, component, activity_type, requirement,
     form_schema, linked_test_label, sequence_number) VALUES
${metadataValues.join(',\n')}
ON CONFLICT (mrid) DO NOTHING;

INSERT INTO public.maintenance_test_link (maintenance_procedure_mrid, test_procedure_mrid) VALUES
${linkValues.join(',\n')}
ON CONFLICT (maintenance_procedure_mrid, test_procedure_mrid) DO NOTHING;

-- Expected for this release: 144 maintenance activities and 45 test links.
SELECT (SELECT COUNT(*) FROM public.maintenance_procedure
        WHERE library_key IN ('SF6_OUTDOOR', 'VCB_OUTDOOR', 'MV_SWGR')) AS maintenance_activities,
       (SELECT COUNT(*) FROM public.maintenance_test_link l
        JOIN public.maintenance_procedure p ON p.mrid = l.maintenance_procedure_mrid
        WHERE p.library_key IN ('SF6_OUTDOOR', 'VCB_OUTDOOR', 'MV_SWGR')) AS test_links;
`

if (process.argv.includes('--write')) {
    if (fs.existsSync(target)) {
        assert.strictEqual(fs.readFileSync(target, 'utf8'), sql, 'V15 already exists with different content')
    } else {
        fs.writeFileSync(target, sql, 'utf8')
    }
    console.log(`Wrote ${target}`)
}
console.log(`Validated ${activities.length} activities, ${links.length} links, ${referencedTests.size} referenced tests`)
