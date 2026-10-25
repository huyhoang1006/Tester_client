const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const babel = require('@babel/core')

const source = fs.readFileSync(path.join(__dirname, '../src/views/TestingEquipment/components/list.vue'), 'utf8')
const script = source.match(/<script>([\s\S]*?)<\/script>/)[1]
const compiled = babel.transformSync(script, {
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs']
}).code

const calls = []
let localId = 'local-uuid'
const localEntity = { equipment: true }
const serverDto = {
    mrid: 'server-uuid',
    properties: {
        mrid: 'server-uuid', serial_no: '3343', manufacturer: 'OMICRON',
        owner_organisation_id: '123'
    }
}
const api = {
    pushTestingEquipment: async () => ({ mrid: 'server-uuid' }),
    getTestingEquipmentById: async () => serverDto
}
const mapper = {
    mapEntityToDto: () => ({
        mrid: localId,
        properties: {
            mrid: localId, serial_no: '3343', manufacturer: 'OMICRON',
            owner_organisation_id: 'local-org'
        },
        attachments: [],
        productAssetModelId: 'model-id',
        lifecycleDateId: 'lifecycle-id',
        inUseDateId: 'in-use-id',
        attachmentId: 'attachment-id',
        userIdentifiedObjectId: 'ownership-id'
    }),
    mapDtoToEntity: dto => dto
}
const imports = {
    '@/api/demo/TestingEquipment': api,
    '@/views/Mapping/TestingEquipment': mapper,
    '@/utils/uuid': { newUuid: () => 'generated-id' },
    './importConflictDialog.vue': {},
    './templateImportExport.vue': {},
    './columnMappingImport.vue': {},
    '@/views/TreeNode/dialogs/ImportProgressDialog.vue': {},
    '../services/duplicateCheck': { splitByDuplicate: () => [] },
    '../statusOptions': { equipmentStatusTag: () => ({}) },
    './organisationTreePicker.vue': {},
    '@/utils/constant': { ROOT: 'root' },
    '@/api/demo': {},
    '@/utils/serverId': { toLocalMrid: id => id, toServerId: id => id }
}
const moduleRef = { exports: {} }
const electronAPI = {
    getTestingEquipmentEntityByMrid: async id => ({
        success: id === localId,
        data: id === localId ? localEntity : null
    }),
    getAllTestingEquipmentList: async () => ({
        success: true,
        data: [{ mrid: 'local-uuid', serial: '3343', manufacturer: 'OMICRON' }]
    }),
    replaceLocalMrid: async (oldId, newId) => {
        calls.push(['replace', oldId, newId])
        assert.strictEqual(oldId, localId)
        localId = newId
        return { success: true }
    },
    ensureUserOwnership: async (userId, id) => {
        calls.push(['ownership', userId, id])
        return { success: true }
    },
    markNodeSynced: async (id, type, serverId) => {
        calls.push(['synced', id, type, serverId])
        return { success: true }
    },
    insertTestingEquipmentEntity: async (oldEntity, entity) => {
        calls.push(['save', oldEntity === localEntity, entity.mrid])
        return { success: true }
    }
}
vm.runInNewContext(compiled, {
    module: moduleRef,
    exports: moduleRef.exports,
    require: name => {
        if (!(name in imports)) throw new Error(`Unexpected dependency: ${name}`)
        return imports[name]
    },
    window: { electronAPI },
    console
})

const methods = moduleRef.exports.default.methods
const context = {
    ...methods,
    $store: { getters: { getUser: { user_id: 'user-1' } } },
    $message: {
        success: () => {}, warning: message => { throw new Error(message) },
        error: message => { throw new Error(message) }
    },
    selectedEquipment: () => ({ mrid: 'local-uuid' }),
    findServerParent: async () => '123',
    findLocalParent: async () => 'local-org',
    reload: async () => true,
    _fillMrids: () => {},
    pushing: false,
    syncing: false
}

async function verify() {
    await methods.pushSelected.call(context)
    assert.strictEqual(context.selectedKey, 'server-uuid')
    assert.deepStrictEqual(calls.map(row => row[0]), ['replace', 'ownership', 'synced'])

    calls.length = 0
    localId = 'local-uuid'
    await methods.downloadSelected.call(context)
    assert.deepStrictEqual(calls.map(row => row[0]), ['replace', 'save', 'ownership', 'synced'])
    assert.deepStrictEqual(calls.find(row => row[0] === 'save'), ['save', true, 'server-uuid'])
    console.log('Testing equipment push/download MRID synchronization: OK')
}

verify().catch(error => {
    console.error(error)
    process.exitCode = 1
})
