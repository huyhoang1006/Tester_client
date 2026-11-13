const assert = require('assert')
const fs = require('fs')
const path = require('path')

async function main() {
    const source = fs.readFileSync(path.join(__dirname, '../src/utils/conflictUtils.js'))
    const { detectConflicts, applyResolved, SUBSTATION_FIELD_DEFS } = await import(
        `data:text/javascript;base64,${source.toString('base64')}`
    )

    const base = { name: 'Substation', city: 'Old city', phoneNumber: '' }
    const client = { ...base, name: 'Local name' }
    const server = { ...base, city: 'New city' }
    let fields = detectConflicts(base, client, server, SUBSTATION_FIELD_DEFS)
    assert.strictEqual(fields.filter(field => field.status === 'conflict').length, 0)
    assert.deepStrictEqual(
        (({ name, city }) => ({ name, city }))(applyResolved(fields, client)),
        { name: 'Local name', city: 'New city' }
    )

    fields = detectConflicts(base, client, { ...server, name: 'Server name' }, SUBSTATION_FIELD_DEFS)
    assert.strictEqual(fields.find(field => field.key === 'name').status, 'conflict')
    fields.find(field => field.key === 'name').resolved = 'Server name'
    assert.strictEqual(applyResolved(fields, client).name, 'Server name')

    fields = detectConflicts(base, client, { ...server, name: 'Local name' }, SUBSTATION_FIELD_DEFS)
    assert.strictEqual(fields.find(field => field.key === 'name').status, 'auto')

    console.log('Substation conflict cases passed')
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
