const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const babel = require('@babel/core')

const root = path.join(__dirname, '..')
const toServerId = id => String(id).split('@')[0]
const load = (relativePath, dependencies, globals = {}) => {
    const file = path.join(root, relativePath)
    const source = babel.transformSync(fs.readFileSync(file, 'utf8'), {
        babelrc: false,
        configFile: false,
        plugins: ['@babel/plugin-transform-modules-commonjs']
    }).code
    const module = { exports: {} }
    vm.runInNewContext(source, {
        module,
        exports: module.exports,
        require: name => {
            if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`)
            return dependencies[name]
        },
        ...globals
    }, { filename: file })
    return module.exports
}

const payload = load('src/utils/testSyncPayload.js', {
    '@/utils/serverId': { toServerId, stripServerIdsDeep: value => value },
    '@/views/TreeNode/Common/Fetch/testDate': { parseTestDate: () => null }
})

const linkKey = 'transformerTestingEquipmentTestType'
const job = {
    testList: [{ mrid: 'test-a@job' }, { mrid: 'test-b@job' }],
    testingEquipmentData: [
        { mrid: 'equipment-a', work_task_ids: ['test-a@job', 'test-b@job'] },
        { mrid: 'equipment-b', work_task_ids: ['test-b@job'] },
        { mrid: 'equipment-stale', work_task_ids: ['test-a@job'] }
    ],
    [linkKey]: [
        { testing_equipment_id: 'equipment-a', work_task_id: 'test-a@job' },
        { testing_equipment_id: 'equipment-b', work_task_id: 'test-b@job' }
    ]
}
const selected = payload.selectTestDto(job, 'test-a@job', linkKey)
assert.deepStrictEqual(JSON.parse(JSON.stringify(selected.testList.map(item => item.mrid))), ['test-a@job'])
assert.deepStrictEqual(JSON.parse(JSON.stringify(selected.testingEquipmentData.map(item => item.mrid))), ['equipment-a'])
assert.deepStrictEqual(JSON.parse(JSON.stringify(selected.testingEquipmentData[0].work_task_ids)), ['test-a@job'])
assert.strictEqual(selected[linkKey].length, 1)
assert.strictEqual(job.testingEquipmentData[0].work_task_ids.length, 2)

const calls = []
const equipmentSync = load('src/utils/testEquipmentSync.js', {
    '@/api/demo/TestingEquipment': {
        getTestingEquipmentById: async id => {
            calls.push(['get', id])
            if (id === 'equipment-a') return { mrid: id }
            throw { response: { status: 404 } }
        },
        findMatchingTestingEquipment: async (serial, manufacturer) => {
            calls.push(['match', serial, manufacturer])
            return serial === '3343' ? { mrid: 'server-equipment' } : null
        }
    },
    '@/views/Mapping/TestingEquipment': {
        mapEntityToDto: entity => ({ properties: entity.properties })
    },
    '@/utils/serverId': { toServerId }
}, {
    window: {
        electronAPI: {
            getTestingEquipmentEntityByMrid: async id => ({
                success: true,
                data: { properties: { serial_no: id === 'equipment-local' ? '3343' : 'missing', manufacturer: 'OMICRON' } }
            })
        }
    }
})

async function verify() {
    const resolved = await equipmentSync.resolveServerEquipmentList([
        { mrid: 'equipment-a', workTaskIds: ['test-a@job'] },
        { mrid: 'equipment-local', workTaskIds: ['test-a@job'] }
    ])
    assert.deepStrictEqual(JSON.parse(JSON.stringify(resolved.map(item => item.mrid))),
        ['equipment-a', 'server-equipment'])
    assert.deepStrictEqual(JSON.parse(JSON.stringify(resolved[1].workTaskIds)), ['test-a@job'])
    assert.deepStrictEqual(calls, [
        ['get', 'equipment-a'], ['get', 'equipment-local'], ['match', '3343', 'OMICRON']
    ])
    await assert.rejects(
        equipmentSync.resolveServerEquipmentList([{ mrid: 'equipment-missing' }]),
        /Push it from Testing equipment first/
    )
    console.log('Single-test equipment links and server ID resolution: OK')
}

verify().catch(error => {
    console.error(error)
    process.exitCode = 1
})
