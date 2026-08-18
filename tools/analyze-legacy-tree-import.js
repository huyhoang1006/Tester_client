const fs = require('fs')
const path = require('path')
const sqlite3 = require('@journeyapps/sqlcipher')

const sourcePath = process.argv[2]
if (!sourcePath) {
    throw new Error('Usage: node tools/analyze-legacy-tree-import.js <export.json>')
}

const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
const references = {
    procedure: new Set(),
    analog: new Set(),
    string_measurement: new Set(),
    discrete: new Set(),
}

const jobs = []
const visitObject = (value) => {
    if (!value || typeof value !== 'object') return
    if (Array.isArray(value)) {
        value.forEach(visitObject)
        return
    }
    if (value.measurement_id && value.type && references[value.type]) {
        references[value.type].add(value.measurement_id)
    }
    Object.values(value).forEach(visitObject)
}

const visitNode = (node, parents = []) => {
    const nodeName = node.name || (node.data && node.data.properties && node.data.properties.name) || node.type
    const currentPath = parents.concat(nodeName)
    if (node.type === 'job' && node.asset === 'Circuit breaker') {
        const data = node.data || {}
        for (const test of (data.testList || [])) {
            if (test.testTypeId) references.procedure.add(test.testTypeId)
            visitObject(test)
        }
        jobs.push({
            path: currentPath.join(' > '),
            name: data.properties && data.properties.name,
            tests: (data.testList || []).length,
        })
    }
    for (const child of (node.children || [])) visitNode(child, currentPath)
}

for (const root of (source.roots || source)) visitNode(root)

const dbPath = path.resolve(__dirname, '..', 'database', 'database.db')
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY)
db.serialize(() => {
    db.run("PRAGMA key = 'attester'")
    const tableNames = Object.keys(references)
    let pending = tableNames.length
    const result = { jobs, references: {} }
    for (const table of tableNames) {
        const ids = Array.from(references[table])
        if (!ids.length) {
            result.references[table] = { source: 0, found: 0, missing: [] }
            if (--pending === 0) finish()
            continue
        }
        const placeholders = ids.map(() => '?').join(',')
        db.all(`SELECT mrid FROM ${table} WHERE mrid IN (${placeholders})`, ids, (error, rows) => {
            if (error) {
                result.references[table] = { error: error.message }
            } else {
                const found = new Set(rows.map(row => row.mrid))
                result.references[table] = {
                    source: ids.length,
                    found: found.size,
                    missing: ids.filter(id => !found.has(id)),
                }
            }
            if (--pending === 0) finish()
        })
    }

    function finish() {
        console.log(JSON.stringify(result, null, 2))
        db.close()
    }
})
