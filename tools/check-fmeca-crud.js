const assert = require('assert')
const fs = require('fs')
const Module = require('module')
const path = require('path')
const babel = require('@babel/core')
const sqlite3 = require('@journeyapps/sqlcipher')

const projectRoot = path.resolve(__dirname, '..')
const compileModule = (filePath, transformSource = value => value) => {
    const source = transformSource(fs.readFileSync(filePath, 'utf8'))
    const compiled = babel.transformSync(source, {
        filename: filePath,
        presets: [['@babel/preset-env', {targets: {node: 'current'}}]]
    }).code
    const targetModule = new Module(filePath, module)
    targetModule.filename = filePath
    targetModule.paths = Module._nodeModulePaths(path.dirname(filePath))
    targetModule._compile(compiled, filePath)
    return targetModule.exports
}

const sourcePath = path.join(projectRoot, 'src', 'function', 'entity', 'fmeca', 'index.js')
const fmeca = compileModule(sourcePath, source => (
    source.replace("import db from '../../datacontext/index'", 'const db = null')
))
const mapperPath = path.join(projectRoot, 'src', 'views', 'Fmeca', 'mapper.js')
const mapper = compileModule(mapperPath)
const healthCalculationPath = path.join(
    projectRoot,
    'src',
    'views',
    'JobView',
    'Transformer',
    'components',
    'HealthIndex',
    'calculation.js'
)
const healthCalculation = compileModule(healthCalculationPath)
const demoFmeca = require(path.join(
    projectRoot,
    'src',
    'config',
    'fmeca',
    'transformer-condition-assessment-rev1.json'
))

const connection = new sqlite3.Database(':memory:')
const run = (sql, params = []) => new Promise((resolve, reject) => {
    connection.run(sql, params, error => error ? reject(error) : resolve())
})
const close = () => new Promise((resolve, reject) => connection.close(error => error ? reject(error) : resolve()))

const main = async () => {
    await run("PRAGMA key = 'fmeca-test'")
    await run('CREATE TABLE "user" (user_id TEXT PRIMARY KEY)')
    const userId = 'fmeca-smoke-user'

    const editable = mapper.toEditableFmeca(demoFmeca.tableFmeca, demoFmeca.tableCalculate)
    const failures = editable.components.flatMap(component => component.failureModes)
    const weighting = mapper.calculateWeighting(editable.components)
    assert.strictEqual(failures.length, 65)
    assert.ok(editable.components.every(component => component.id && component.name))
    assert.ok(failures.every(failure => failure.id && failure.name && failure.test))
    assert.strictEqual(weighting.rows.length, 10)
    assert.strictEqual(weighting.totalRpn, 1871)

    const normalized = healthCalculation.normalizeAssessedRows([
        {name: 'Insulation resistance', source_rpn: 296, average_score: 2, worst_score: 1},
        {name: 'Ratio test', source_rpn: 50, average_score: 3, worst_score: 2}
    ])
    assert.strictEqual(normalized.length, 2)
    assert.ok(Math.abs(normalized[0].rpn_proportion - (296 / 346)) < 1e-12)
    assert.ok(Math.abs(normalized[1].rpn_proportion - (50 / 346)) < 1e-12)
    assert.ok(Math.abs(normalized.reduce((sum, row) => sum + row.rpn_proportion, 0) - 1) < 1e-12)
    assert.ok(Math.abs(normalized.reduce((sum, row) => sum + row.weighting_factor, 0) - 3.33) < 1e-12)

    const confidence = healthCalculation.calculateAssessmentConfidence([
        {core_test_name: 'Insulation resistance', source_rpn: 296, average_score: 2},
        {core_test_name: 'Remaining core tests', source_rpn: 1575}
    ], true)
    assert.strictEqual(confidence.label, 'Insufficient')
    assert.ok(Math.abs(confidence.ratio - (296 / 1871)) < 1e-12)
    assert.deepStrictEqual(confidence.missing, ['Remaining core tests'])
    assert.strictEqual(healthCalculation.confidenceLevel(0.3), 'Low confidence')
    assert.strictEqual(healthCalculation.confidenceLevel(0.6), 'Moderate confidence')
    assert.strictEqual(healthCalculation.confidenceLevel(0.8), 'High confidence')
    assert.strictEqual(healthCalculation.confidenceLevel(0.9), 'Very high confidence')

    await fmeca.ensureFmecaSchema(connection)
    let records = await fmeca.listFmeca(userId, connection)
    assert.strictEqual(records.length, 1)
    assert.strictEqual(records[0].name, 'ATDigital FMECA')
    assert.strictEqual(records[0].protected, true)
    assert.strictEqual(records[0].isHiSource, true)

    const created = await fmeca.createFmeca({
        name: 'Local FMECA',
        templateId: records[0].localId
    }, userId, connection)
    assert.strictEqual(created.name, 'Local FMECA')

    await fmeca.setHiFmeca(created.localId, userId, connection)
    records = await fmeca.listFmeca(userId, connection)
    assert.strictEqual(records.filter(record => record.isHiSource).length, 1)
    assert.strictEqual(records.find(record => record.isHiSource).localId, created.localId)

    await fmeca.renameFmeca(created.localId, 'Renamed FMECA', userId, connection)
    await fmeca.updateFmeca({
        localId: created.localId,
        tableFmeca: {schemaVersion: 2, components: []},
        tableCalculate: created.tableCalculate,
        total: created.total
    }, userId, connection)
    const updated = await fmeca.getFmecaById(created.localId, userId, connection)
    assert.strictEqual(updated.name, 'Renamed FMECA')
    assert.deepStrictEqual(updated.tableFmeca.components, [])

    await fmeca.deleteFmeca(created.localId, userId, connection)
    records = await fmeca.listFmeca(userId, connection)
    assert.strictEqual(records.length, 1)
    assert.strictEqual(records[0].localId, fmeca.DEMO_FMECA_ID)
    assert.strictEqual(records[0].isHiSource, true)

    await assert.rejects(
        () => fmeca.deleteFmeca(fmeca.DEMO_FMECA_ID, userId, connection),
        /cannot be deleted/
    )

    console.log('FMECA CRUD and HI source smoke test passed')
}

main()
    .then(close)
    .catch(async error => {
        console.error(error)
        await close().catch(() => {})
        process.exitCode = 1
    })
