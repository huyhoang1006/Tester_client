const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const babel = require('@babel/core')
const { parse } = require('csv-parse/sync')
const { randomUUID } = require('crypto')

const root = path.join(__dirname, '..')
const ptmPath = process.argv[2]
const csvPath = process.argv[3]
if (!ptmPath || !csvPath) {
    throw new Error('Usage: node scripts/verify-dirana-ptm.js <file.ptm> <file.csv>')
}

const cache = new Map()
const load = file => {
    const resolved = path.resolve(file)
    if (cache.has(resolved)) return cache.get(resolved).exports
    const source = babel.transformSync(fs.readFileSync(resolved, 'utf8'), {
        babelrc: false,
        configFile: false,
        plugins: ['@babel/plugin-transform-modules-commonjs']
    }).code
    const module = { exports: {} }
    cache.set(resolved, module)
    const localRequire = name => name.startsWith('.')
        ? load(path.resolve(path.dirname(resolved), name.endsWith('.js') ? name : `${name}.js`))
        : require(name)
    vm.runInNewContext(source, {
        module, exports: module.exports, require: localRequire,
        Buffer, console, Set, Map, Number, String, Math
    }, { filename: resolved })
    return module.exports
}

const sections = {}
let section = ''
for (const line of fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/)) {
    if (/^\[[^\]]+\]$/.test(line.trim())) {
        section = line.trim().slice(1, -1)
        sections[section] = []
    } else if (section && line.trim()) {
        sections[section].push(line)
    }
}
const rows = name => parse(sections[name].join('\n'), { columns: true, skip_empty_lines: true })
const close = (actual, expected, label, tolerance = 1e-6) => {
    const a = Number(actual)
    const e = Number(expected)
    assert(Number.isFinite(a) && Number.isFinite(e), `${label}: non-numeric value`)
    assert(Math.abs(a - e) <= tolerance * Math.max(1e-15, Math.abs(e)), `${label}: ${a} != ${e}`)
}

const ptm = load(path.join(root, 'src/function/ptm/readPtmArchive.js')).readPtmArchive(ptmPath)
const dra = ptm.tests.find(test => test.type === 'DRATest')
assert(dra, 'DRATest was not imported')
const csvTest = rows('Test')[0]
assert.strictEqual(dra.name, csvTest.Name)
assert.strictEqual(dra.comment, csvTest.Comment)
assert.strictEqual(dra.uniqueId, csvTest.UniqueId)
assert.strictEqual(dra.insulationMedium, csvTest.InsulationMedium)
assert.strictEqual(dra.firmwareVersion, csvTest['Firmware Version'])
assert.strictEqual(ptm.job.tester, csvTest.Tester)
const testedAsset = ptm.assets.find(asset => asset.exportId === dra.assetId)
assert(testedAsset, 'DIRANA asset reference is missing')
assert.strictEqual(testedAsset.serialNumber, csvTest['Test Object Serial'])
close(dra.fdsVoltage.value, csvTest['FDS Voltage'], 'FDS voltage')
close(dra.pdcVoltage.value, csvTest['PDC Voltage'], 'PDC voltage')

const csvMeasurements = rows('Measurements')
const frequencyRows = rows('FrequencySweeps')
const polarizationRows = rows('PolarizationSweeps')
assert.strictEqual(dra.measurements.length, csvMeasurements.length)
let frequencyCount = 0
let polarizationCount = 0
for (const [index, measurement] of dra.measurements.entries()) {
    const csv = csvMeasurements[index]
    const id = String(index + 1)
    assert.strictEqual(measurement.name, csv.Name)
    assert.strictEqual(measurement.measurementId, csv.MeasId)
    assert.strictEqual(measurement.parentTestId, csv.ParentTestId)
    assert.strictEqual(measurement.channel, csv.Channel)
    assert.strictEqual(measurement.color, csv.Color)
    const date = csv.Date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2}):(\d{2}) (AM|PM)$/)
    assert(date, `${id} date format`)
    const hour = (Number(date[4]) % 12) + (date[7] === 'PM' ? 12 : 0)
    const csvDate = `${date[3]}-${date[2].padStart(2, '0')}-${date[1].padStart(2, '0')}T${String(hour).padStart(2, '0')}:${date[5]}:${date[6]}Z`
    assert.strictEqual(measurement.measuredDate, csvDate, `${id} measured date`)
    assert.strictEqual(measurement.copiedForComparison, csv.CopyForComparison === 'True')
    close(measurement.temperature, csv.Temperature, `${id} temperature`)
    close(measurement.epsilonR, csv.EpsilonR, `${id} epsilon R`)

    const frequency = frequencyRows.filter(row => row.ID === id)
    const polarization = polarizationRows.filter(row => row.ID === id)
    assert.strictEqual(measurement.frequencyPoints.length, frequency.length, `${id} frequency count`)
    assert.strictEqual(measurement.polarizationPoints.length, polarization.length, `${id} PDC count`)
    frequency.forEach((point, pointIndex) => {
        const actual = measurement.frequencyPoints[pointIndex]
        for (const [key, csvKey] of [
            ['frequency', 'Frequency'], ['tangentDelta', 'Tangent Delta'],
            ['powerFactor', 'Power Factor'], ['capacitanceReal', 'C(Real)'],
            ['capacitanceImag', 'C(Imag)']
        ]) close(actual[key], point[csvKey], `${id} FDS ${pointIndex} ${key}`)
    })
    polarization.forEach((point, pointIndex) => {
        const actual = measurement.polarizationPoints[pointIndex]
        close(actual.time, point.Time, `${id} PDC ${pointIndex} time`)
        close(actual.current, point.Current, `${id} PDC ${pointIndex} current`)
    })
    frequencyCount += frequency.length
    polarizationCount += polarization.length
}

const configDir = type => path.join(root, 'src/config', type, 'Transformer/Dirana.json')
const definition = JSON.parse(fs.readFileSync(configDir('test-definitions'), 'utf8'))
const conditionDefinition = JSON.parse(fs.readFileSync(configDir('testing-condition'), 'utf8'))
const assessmentDefinition = JSON.parse(fs.readFileSync(configDir('testing-assessment'), 'utf8'))
const procedure = JSON.parse(fs.readFileSync(path.join(root, 'src/config/procedures/Transformer.json'), 'utf8'))
    .procedure.find(item => item.code === 'Dirana')
assert.strictEqual(procedure.mrid, definition.testId)
assert.strictEqual(conditionDefinition.testId, definition.testId)
assert.strictEqual(assessmentDefinition.testId, definition.testId)

const emptyCells = columns => Object.fromEntries(columns.map(column => [column.code, {
    mrid: '', value: '', type: column.type, unit: column.unit || '', measurement_id: column.mrid
}]))
const mappingConfig = JSON.parse(fs.readFileSync(path.join(root, 'src/config/ptm-import/transformer.json'), 'utf8')).Dirana
const mapperFile = path.join(root, 'src/utils/ptm/ptmToTransformerJobDto.js')
const mapperSource = babel.transformSync(fs.readFileSync(mapperFile, 'utf8'), {
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs']
}).code
const mapperModule = { exports: {} }
const dependencies = {
    '@/utils/uuid': { newUuid: randomUUID },
    '@/views/Flatten/Attachment': class Attachment {},
    '@/views/Cim/TestStandard': class TestStandard {},
    '@/views/Dto/Job/Transformer': class TransformerJobDto {
        constructor() { this.properties = {}; this.testList = [] }
    },
    '@/config/test-definitions/Transformer': { Dirana: definition },
    '@/config/testing-condition/Transformer': { Dirana: conditionDefinition },
    '@/config/testing-assessment/Transformer': { Dirana: assessmentDefinition },
    '@/views/JobView/Common/index': {
        buildEmptyTestRow: emptyCells,
        buildEmptyTestCondition: emptyCells,
        buildEmptyTestAssessment: () => []
    },
    '@/config/ptm-import': {
        findTestConfig: (assetType, type) => assetType === 'Transformer' && type === 'DRATest'
            ? { testCode: 'Dirana', config: mappingConfig }
            : null
    }
}
vm.runInNewContext(mapperSource, {
    module: mapperModule,
    exports: mapperModule.exports,
    require: name => {
        if (!(name in dependencies)) throw new Error(`Unexpected mapper dependency: ${name}`)
        return dependencies[name]
    },
    JSON, Number, String, Object, Set, Map
}, { filename: mapperFile })
const mapped = mapperModule.exports.ptmToTransformerJobDto(ptm, 'test-transformer-asset')
assert.strictEqual(mapped.jobDto.testList.length, 1, 'DIRANA should become one Transformer test')
assert.strictEqual(mapped.jobDto.testList[0].testTypeId, definition.testId)
const importedRows = mapped.jobDto.testList[0].data.table.table1
assert.strictEqual(importedRows.length, csvMeasurements.length)
importedRows.forEach((row, index) => {
    const id = String(index + 1)
    assert.strictEqual(row.measurement_id.value, csvMeasurements[index].MeasId)
    assert.strictEqual(row.name.value, csvMeasurements[index].Name)
    assert.strictEqual(JSON.parse(row.frequency_points_json.value).length,
        frequencyRows.filter(point => point.ID === id).length)
    assert.strictEqual(JSON.parse(row.polarization_points_json.value).length,
        polarizationRows.filter(point => point.ID === id).length)
})
assert.strictEqual(mapped.jobDto.testList[0].testCondition.condition.fds_voltage.value, '200')
assert.strictEqual(mapped.jobDto.testList[0].testCondition.comment, csvTest.Comment)
console.log(`DIRANA verified: ${dra.measurements.length} measurements, ${frequencyCount} FDS points, ${polarizationCount} PDC points`)
