const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(fullPath) : [fullPath]
})

const definitions = ['test-definitions', 'testing-condition'].flatMap(group =>
    walk(path.join(root, 'src/config', group)).filter(file => file.endsWith('.json')))
const typesByMrid = new Map()
let analogColumns = 0
for (const file of definitions) {
    const definition = JSON.parse(fs.readFileSync(file, 'utf8'))
    for (const column of definition.columns || []) {
        if (!['analog', 'string', 'discrete'].includes(column.type)) {
            throw new Error(`${file}: unsupported type for ${column.code}: ${column.type}`)
        }
        if (column.type === 'analog') analogColumns += 1
        if (column.mrid && typesByMrid.has(column.mrid) && typesByMrid.get(column.mrid) !== column.type) {
            throw new Error(`${file}: ${column.mrid} has conflicting measurement types`)
        }
        if (column.mrid) typesByMrid.set(column.mrid, column.type)
    }
}

// Read a component's opening tag without treating > inside a quoted Vue expression as its end.
const inputTags = source => {
    const tags = []
    const pattern = /<el-input(?=[\s/>])/g
    let match
    while ((match = pattern.exec(source))) {
        let quote = null
        let end = match.index + match[0].length
        for (; end < source.length; end += 1) {
            const char = source[end]
            if (quote) {
                if (char === quote) quote = null
            } else if (char === '"' || char === "'") {
                quote = char
            } else if (char === '>') {
                end += 1
                break
            }
        }
        tags.push({ start: match.index, end, source: source.slice(match.index, end) })
        pattern.lastIndex = end
    }
    return tags
}

const fix = process.argv.includes('--fix')
const components = walk(path.join(root, 'src/views/JobView')).filter(file => file.endsWith('.vue'))
let bound = 0
let unbound = 0
let changed = 0
const otherModels = []
for (const file of components) {
    const source = fs.readFileSync(file, 'utf8')
    const additions = []
    for (const tag of inputTags(source)) {
        const match = tag.source.match(/\bv-model\s*=\s*"([^"]+)"/)
        if (!match) continue
        if (!match[1].endsWith('.value')) {
            otherModels.push(`${path.relative(root, file)}: ${match[1]}`)
            continue
        }
        if (/\s:measurement\s*=/.test(tag.source)) {
            bound += 1
            continue
        }
        unbound += 1
        additions.push({ index: tag.start + '<el-input'.length, cell: match[1].slice(0, -'.value'.length) })
    }
    if (fix && additions.length) {
        let updated = source
        for (const addition of additions.reverse()) {
            updated = updated.slice(0, addition.index) + ` :measurement="${addition.cell}"` + updated.slice(addition.index)
        }
        fs.writeFileSync(file, updated)
        changed += 1
    }
}

console.log(`${definitions.length} test and condition definitions, ${analogColumns} analog columns; ${bound} bound inputs, ${unbound} inputs missing measurement binding${fix ? `, ${changed} files updated` : ''}`)
if (process.argv.includes('--verbose')) console.log(otherModels.join('\n'))
if (unbound && !fix) process.exitCode = 1
