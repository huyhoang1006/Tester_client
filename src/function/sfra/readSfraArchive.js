import fs from 'fs'
import path from 'path'
import PizZip from 'pizzip'
import { parseXml, childrenNamed, child, textOf } from '../ptm/xmlLite'

const clean = value => String(value == null ? '' : value).trim()

const numberText = value => {
    const number = Number(value)
    return Number.isFinite(number) ? String(number) : ''
}

const friendlyName = value => clean(value)
    .replace(/\.(?:xml|xfra)$/i, '')
    .replace(/^\d+__?/, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const groupNameOf = fileName => {
    const normalized = String(fileName || '').replace(/\\/g, '/')
    const parts = normalized.split('/').filter(Boolean)
    return parts.length > 1 ? friendlyName(parts[parts.length - 2]) : 'SFRA'
}

const parseIecTrace = (content, fileName) => {
    const root = parseXml(content)
    if (root.name !== 'IECFraFile') throw new Error(`${fileName} is not an IEC SFRA file`)

    const transformer = child(root, 'Transformer') || { attrs: {}, children: [] }
    const setup = child(root, 'MeasurementSetup') || { children: [] }
    const result = child(root, 'MeasurementResult') || { children: [] }
    const date = clean(textOf(setup, 'Date'))
    const time = clean(textOf(setup, 'Time'))

    return {
        transformer: {
            id: clean(transformer.attrs && transformer.attrs.identifier),
            manufacturer: clean(textOf(transformer, 'Manufacturer')),
            serialNumber: clean(textOf(transformer, 'SerialNumber')),
        },
        trace: {
            name: friendlyName(path.basename(fileName)),
            groupName: groupNameOf(fileName),
            sourceStandard: 'IEC',
            sourceFile: path.basename(fileName),
            referenceTerminal: clean(textOf(setup, 'ReferenceTerminal')),
            responseTerminal: clean(textOf(setup, 'ResponseTerminal')),
            shortedTerminals: clean(textOf(setup, 'ConnectedTerminals')),
            groundedTerminals: clean(textOf(setup, 'EarthedTerminals')),
            tapPosition: clean(textOf(setup, 'OLTC')),
            measuredDate: [date, time].filter(Boolean).join(' '),
            outputVoltage: numberText(textOf(setup, 'PeakVoltage')),
            color: '',
            enabled: true,
            points: childrenNamed(result, 'Point').map(point => ({
                frequency: numberText(point.attrs && point.attrs.frequency),
                magnitude: numberText(point.attrs && point.attrs.amplitude),
                phase: numberText(point.attrs && point.attrs.phase),
            })).filter(point => point.frequency && point.magnitude && point.phase),
        },
    }
}

const normalizeHeaderKey = value => clean(value).toLowerCase().replace(/\s+/g, ' ')

const parseCigreTrace = (content, fileName) => {
    const lines = String(content || '').replace(/^\uFEFF/, '').split(/\r?\n/)
    const headers = {}
    const points = []
    let readingPoints = false

    for (const line of lines) {
        const value = clean(line)
        if (!value) continue
        if (/^frequency\s*\(hz\)/i.test(value)) {
            readingPoints = true
            continue
        }
        if (readingPoints) {
            const columns = value.split(/\t+|\s{2,}/).map(clean).filter(Boolean)
            if (columns.length < 3) continue
            const point = {
                frequency: numberText(columns[0]),
                magnitude: numberText(columns[1]),
                phase: numberText(columns[2]),
            }
            if (point.frequency && point.magnitude && point.phase) points.push(point)
            continue
        }
        const separator = value.indexOf(':')
        if (separator < 0) continue
        headers[normalizeHeaderKey(value.slice(0, separator))] = clean(value.slice(separator + 1))
    }

    if (!points.length) throw new Error(`${fileName} contains no CIGRE SFRA points`)
    return {
        transformer: {
            id: '',
            manufacturer: headers['transformer manufacturer'] || '',
            serialNumber: headers['transformer serial number'] || '',
            manufacturingYear: headers['year of mfr'] || '',
            vectorGroup: headers['vector group'] || '',
        },
        trace: {
            name: headers.identifier || friendlyName(path.basename(fileName)),
            groupName: groupNameOf(fileName),
            sourceStandard: 'CIGRE',
            sourceFile: path.basename(fileName),
            referenceTerminal: headers['reference terminal'] || '',
            responseTerminal: headers['response terminal'] || '',
            shortedTerminals: headers['shorted terminals'] || '',
            groundedTerminals: headers['grounded terminals'] || '',
            tapPosition: headers['tap position'] || '',
            measuredDate: [headers.date, headers.time].filter(Boolean).join(' '),
            outputVoltage: '',
            color: '',
            enabled: true,
            points,
        },
    }
}

const parseEntry = (content, fileName) => {
    const extension = path.extname(fileName).toLowerCase()
    if (extension === '.xml') return parseIecTrace(content, fileName)
    if (extension === '.xfra') return parseCigreTrace(content, fileName)
    return null
}

const readZipEntries = (buffer, prefix = '') => {
    const zip = new PizZip(buffer)
    const entries = []
    Object.keys(zip.files).forEach(name => {
        const entry = zip.files[name]
        if (entry.dir) return
        const qualifiedName = prefix ? `${prefix}/${name}` : name
        if (/\.(?:xml|xfra)$/i.test(name)) {
            entries.push({ name: qualifiedName, content: entry.asText() })
            return
        }
        if (/\.zip$/i.test(name)) {
            entries.push(...readZipEntries(Buffer.from(entry.asUint8Array()), qualifiedName))
        }
    })
    return entries
}

const readEntries = filePath => {
    const extension = path.extname(filePath).toLowerCase()
    if (extension !== '.zip') {
        return [{ name: path.basename(filePath), content: fs.readFileSync(filePath, 'utf8') }]
    }
    return readZipEntries(fs.readFileSync(filePath))
}

const firstNonEmpty = (items, key) => {
    const found = items.find(item => clean(item.transformer && item.transformer[key]))
    return found ? clean(found.transformer[key]) : ''
}

export const readSfraArchive = filePath => {
    const parsed = readEntries(filePath)
        .map(entry => parseEntry(entry.content, entry.name))
        .filter(Boolean)

    if (!parsed.length) throw new Error('No IEC XML or CIGRE XFRA trace was found')

    const standards = Array.from(new Set(parsed.map(item => item.trace.sourceStandard)))
    const sourceLabel = standards.length === 1 ? `SFRA ${standards[0]}` : 'SFRA'
    const transformerId = firstNonEmpty(parsed, 'id') || 'sfra-import-transformer'
    const serialNumber = firstNonEmpty(parsed, 'serialNumber')
    const manufacturer = firstNonEmpty(parsed, 'manufacturer')
    const manufacturingYear = firstNonEmpty(parsed, 'manufacturingYear')
    const vectorGroup = firstNonEmpty(parsed, 'vectorGroup')
    const groups = new Map()

    parsed.forEach(item => {
        const baseGroupName = item.trace.groupName || 'SFRA'
        const groupName = standards.length > 1
            ? `${baseGroupName} (${item.trace.sourceStandard})`
            : baseGroupName
        item.trace.groupName = groupName
        if (!groups.has(groupName)) groups.set(groupName, [])
        groups.get(groupName).push(item.trace)
    })

    const tests = Array.from(groups.entries()).map(([name, measurements], index) => ({
        exportId: `sfra-${index + 1}`,
        type: 'FRATest',
        name,
        assetId: transformerId,
        executionDate: measurements.map(item => item.measuredDate).find(Boolean) || '',
        conditions: {},
        measurements,
    }))
    const executionDate = tests.map(test => test.executionDate).find(Boolean) || ''

    return {
        sourceLabel,
        meta: { standard: standards.join(', ') },
        job: {
            exportId: `sfra-job-${Date.now()}`,
            name: friendlyName(path.basename(filePath)) || 'Imported SFRA',
            assetId: transformerId,
            jobAssetId: transformerId,
            creationDate: executionDate,
            executionDate,
            conditions: {},
        },
        assets: [{
            exportId: transformerId,
            type: 'Transformer',
            serialNumber,
            manufacturer,
            manufacturerType: '',
            manufacturingYear,
            apparatusId: serialNumber,
            raw: {},
            components: [],
            transformerProfile: {
                windings: [],
                powerRatings: [],
                shortCircuitImpedances: [],
                zeroSequenceImpedances: [],
                vectorGroup,
            },
        }],
        substations: [],
        voltageLevels: [],
        bays: [],
        tests,
        unsupportedTests: [],
    }
}

export default { readSfraArchive }
