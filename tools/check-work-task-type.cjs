const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const babel = require('@babel/core')
const sqlite3 = require('sqlite3')

const source = path.resolve(__dirname, '../src/update/database/init.js')
const transformed = babel.transformSync(fs.readFileSync(source, 'utf8'), {
    filename: source,
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs']
}).code
const migrationModule = new Module(source, module)
migrationModule.filename = source
migrationModule.paths = Module._nodeModulePaths(path.dirname(source))
const originalRequire = migrationModule.require.bind(migrationModule)
migrationModule.require = (id) => id === '@/config/database/schema'
    ? { INIT_SCHEMA: '' }
    : originalRequire(id)
migrationModule._compile(transformed, source)

const db = new sqlite3.Database(':memory:')
const exec = (sql) => new Promise((resolve, reject) => db.exec(sql, (error) => error ? reject(error) : resolve()))
const all = (sql, values = []) => new Promise((resolve, reject) => db.all(sql, values, (error, rows) => error ? reject(error) : resolve(rows)))
const runSql = (sql, values) => new Promise((resolve, reject) => db.run(sql, values, (error) => error ? reject(error) : resolve()))

async function run() {
    await exec(`
        CREATE TABLE app_settings (key TEXT PRIMARY KEY, value TEXT);
        CREATE TABLE work_task (mrid TEXT PRIMARY KEY, work TEXT, job_type TEXT);
        CREATE TABLE document (mrid TEXT PRIMARY KEY, type TEXT, approver TEXT);
        CREATE TABLE identified_object (mrid TEXT PRIMARY KEY, name TEXT);
        CREATE TABLE old_work (mrid TEXT PRIMARY KEY, execution_date TEXT, tested_by TEXT,
            approval_date TEXT, ref_standard TEXT);
        INSERT INTO work_task (mrid, work, job_type) VALUES ('test-1', 'work-1', 'Routine Test');
        INSERT INTO document (mrid, type) VALUES ('work-1', 'Commissioning Test');
        INSERT INTO document (mrid, type) VALUES ('test-1', 'InsulationResistance');
        INSERT INTO identified_object (mrid, name) VALUES ('test-1', 'Insulation resistance');
        INSERT INTO old_work (mrid, execution_date) VALUES ('work-1', '2026-10-20');
    `)
    await migrationModule.exports.ensureWorkTaskMetadataColumns(db)
    await migrationModule.exports.ensureWorkTaskMetadataColumns(db)
    const columns = await all('PRAGMA table_info(work_task)')
    assert(columns.some((column) => column.name === 'type'))
    assert(!columns.some((column) => column.name === 'job_type'))
    const rows = await all('SELECT test_name, type, test_type_code, testing_date FROM work_task')
    assert.deepEqual(rows, [{ test_name: 'Insulation resistance', type: 'Routine Test',
        test_type_code: 'InsulationResistance', testing_date: '2026-10-20' }])

    const taskSource = fs.readFileSync(path.resolve(__dirname, '../src/function/cim/workTask/index.js'), 'utf8')
    const insert = taskSource.match(/`INSERT INTO work_task\(([\s\S]*?)\) VALUES \(([\s\S]*?)\)\s*ON CONFLICT\(mrid\) DO UPDATE SET([\s\S]*?)`/)
    assert(insert, 'work_task insert SQL is present')
    const columnNames = insert[1].split(',').map((name) => name.trim())
    const existing = new Set(columns.map((column) => column.name))
    for (const name of columnNames) {
        if (!existing.has(name)) await exec(`ALTER TABLE work_task ADD COLUMN "${name}" TEXT`)
    }
    const insertValues = columnNames.map((name) => ({
        mrid: 'test-2', test_name: 'SFRA', type: 'Routine Test', test_type_code: 'SFRA',
        testing_date: '2026-10-21', work: 'work-1'
    })[name] ?? null)
    assert.equal((insert[2].match(/\?/g) || []).length, insertValues.length)
    await runSql(insert[0].slice(1, -1), insertValues)
    assert.deepEqual(await all("SELECT type, test_type_code FROM work_task WHERE mrid = 'test-2'"),
        [{ type: 'Routine Test', test_type_code: 'SFRA' }])
    const update = taskSource.match(/`UPDATE work_task SET([\s\S]*?)WHERE mrid = \?`/)
    assert(update, 'work_task update SQL is present')
    const updateValues = [...insertValues.slice(1), 'test-2']
    updateValues[1] = 'Commissioning Test'
    assert.equal((update[0].match(/\?/g) || []).length, updateValues.length)
    await runSql(update[0].slice(1, -1), updateValues)
    assert.deepEqual(await all("SELECT type, test_type_code FROM work_task WHERE mrid = 'test-2'"),
        [{ type: 'Commissioning Test', test_type_code: 'SFRA' }])
    await exec(`
        CREATE TABLE base_work (mrid TEXT PRIMARY KEY);
        INSERT INTO base_work (mrid) VALUES ('test-2');
        INSERT INTO document (mrid, type) VALUES ('test-2', 'SFRA');
        INSERT INTO identified_object (mrid, name) VALUES ('test-2', 'SFRA test');
    `)
    const byWork = taskSource.match(/`SELECT\s+wt\.\*,[\s\S]*?WHERE wt\.work = \?`/)
    assert(byWork, 'work_task load query is present')
    const loaded = await all(byWork[0].slice(1, -1), ['work-1'])
    assert.equal(loaded.find((row) => row.mrid === 'test-2').type, 'Commissioning Test')
    console.log('PASS: work_task type migration, insert/update, and reload preserve the test procedure code')
}

run().catch((error) => {
    console.error(error)
    process.exitCode = 1
}).finally(() => db.close())
