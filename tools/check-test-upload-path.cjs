/* eslint-disable no-console */
const assert = require('assert/strict')
const { createModuleLoader } = require('./check-test-sync-mappers.cjs')

const load = createModuleLoader({ mocks: { './upload-process.js': { default: {} } } })
const methods = load('@/views/TreeNode/Client/mixin/Upload').default.methods

async function run() {
    const organisation = { mrid: 'org', mode: 'organisation', parentId: null }
    const substation = { mrid: 'sub', mode: 'substation', parentId: 'org' }
    const asset = { mrid: 'asset', mode: 'asset', asset: 'Transformer', parentId: 'sub' }
    const test = { mrid: 'test', mode: 'test', job: 'Transformer', parentId: 'asset', name: 'SFRA' }
    const nodes = [organisation, substation, asset, test]
    let executed = 0
    let onlyTest = 0
    const context = {
        ...methods,
        selectedNodes: [test],
        organisationClientList: [organisation],
        findNodeById: id => nodes.find(node => node.mrid === id),
        checkServerNodeExistsForUpload: async node => node.mrid === 'sub',
        executeUploadFullTree: async () => { executed++ },
        $confirm: async () => {},
        runUploadWithLog: async node => { assert.equal(node, test); onlyTest++ },
        processUploadTest: async () => {},
        $message: { warning() {}, error() {} }
    }

    await context.handleUploadNode()
    assert.equal(onlyTest, 1, 'Upload only test calls the single-test handler')
    assert.equal(executed, 0)

    await context.handleUploadPathNode()
    assert.deepEqual(context.uploadFullTreeChain.map(item => item.node.mrid), ['sub', 'asset', 'test'])
    assert.equal(context.uploadFullTreeDecisions['substation::sub'], 'skip', 'existing ancestor is skipped by default')
    assert.equal(context.uploadFullTreeDialogVisible, true)

    context.checkServerNodeExistsForUpload = async () => false
    await context.handleUploadPathNode()
    assert.equal(executed, 1, 'path upload uses the tree uploader')
    assert.deepEqual(context.uploadFullTreeChain.map(item => item.node.mrid), ['sub', 'asset', 'test'])
    console.log('PASS: Upload only test and Upload path node follow separate flows; path orders ancestors before test')
}

run().catch(error => { console.error(error); process.exitCode = 1 })
