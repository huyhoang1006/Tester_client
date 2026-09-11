import { child, textOf } from './xmlLite'

const clean = value => String(value == null ? '' : value).trim()

const phaseFromIndex = (value) => {
    const normalized = clean(value)
    if (normalized === '') return ''
    const index = Number(normalized)
    if (!Number.isInteger(index) || index < 0 || index > 2) return ''
    return ['A', 'B', 'C'][index]
}

/**
 * OMICRON uses both IEC phase labels (L1/L2/L3) and application labels (A/B/C).
 * Only accept an explicit phase token so names such as "Channel 2" are not
 * accidentally interpreted as phase B.
 */
const phaseFromLabel = (value) => {
    const label = clean(value).toUpperCase()
    if (!label) return ''

    const compact = label.replace(/[\s_-]+/g, '')
    const exact = {
        A: 'A', L1: 'A', PHASEA: 'A', PHASEL1: 'A',
        B: 'B', L2: 'B', PHASEB: 'B', PHASEL2: 'B',
        C: 'C', L3: 'C', PHASEC: 'C', PHASEL3: 'C',
    }
    if (exact[compact]) return exact[compact]

    const leading = label.match(/^(?:PHASE\s*)?(A|B|C|L1|L2|L3)(?:\s|[-_/]|$)/)
    if (!leading) return ''
    return { A: 'A', L1: 'A', B: 'B', L2: 'B', C: 'C', L3: 'C' }[leading[1]] || ''
}

const readModuleChannels = moduleNode => {
    const channelsNode = child(moduleNode, 'Channels')
    return (channelsNode ? channelsNode.children : []).map(channelNode => ({
        name: clean(textOf(channelNode, 'Name')),
        position: clean(textOf(channelNode, 'Position')),
        phaseIndex: clean(textOf(channelNode, 'PhaseIndex')),
        isActive: clean(textOf(channelNode, 'IsActive')) !== 'false',
    }))
}

/**
 * Read the test-device configuration into a small transient channel index.
 * This data is used to interpret PTM measurements only; it is not persisted as
 * Circuit Breaker asset data.
 */
export const readPtmChannelConfiguration = (testNode) => {
    const configuration = child(testNode, 'TestDeviceConfiguration')
    if (!configuration) return { modules: [] }

    const modules = []
    for (const container of configuration.children || []) {
        if (!/Modules$/.test(container.name)) continue
        for (const moduleNode of container.children || []) {
            const name = clean(textOf(moduleNode, 'Name'))
            const serialNumber = clean(textOf(moduleNode, 'SerialNumber'))
            const phaseIndex = clean(textOf(moduleNode, 'PhaseIndex'))
            modules.push({
                moduleType: moduleNode.name,
                name,
                serialNumber,
                phaseIndex,
                phase: phaseFromIndex(phaseIndex) || phaseFromLabel(name),
                channels: readModuleChannels(moduleNode),
            })
        }
    }

    return { modules }
}

const equals = (left, right) => clean(left).toUpperCase() === clean(right).toUpperCase()

const findModule = (configuration, measurement) => {
    const modules = Array.isArray(configuration.modules) ? configuration.modules : []
    const serialCandidates = [measurement.serialNumber, measurement.measuringDevice].filter(Boolean)
    for (const serial of serialCandidates) {
        const matched = modules.find(module => equals(module.serialNumber, serial))
        if (matched) return { module: matched, source: 'module-serial' }
    }

    const channelCandidates = [measurement.channelName, measurement.name, measurement.mainContact].filter(Boolean)
    for (const channelName of channelCandidates) {
        const byModuleName = modules.find(module => equals(module.name, channelName))
        if (byModuleName) return { module: byModuleName, source: 'module-name' }

        const byChannelName = modules.find(module =>
            module.channels.some(channel => equals(channel.name, channelName)))
        if (byChannelName) return { module: byChannelName, source: 'module-channel' }
    }

    return { module: null, source: '' }
}

/**
 * Resolve the electrical phase for any PTM measurement.
 *
 * Priority:
 *  1. Test-device module matched by serial/channel.
 *  2. Explicit phase label (A/B/C or L1/L2/L3).
 *  3. Measurement PhaseIndex as a final fallback.
 */
export const resolvePtmMeasurementChannel = (configuration, measurement) => {
    const matched = findModule(configuration || { modules: [] }, measurement || {})
    if (matched.module && matched.module.phase) {
        return {
            phase: matched.module.phase,
            phaseIndex: ['A', 'B', 'C'].indexOf(matched.module.phase),
            source: matched.source,
            moduleName: matched.module.name,
            moduleSerialNumber: matched.module.serialNumber,
            channelName: clean(measurement.channelName || measurement.name),
        }
    }

    const labels = [measurement.channelName, measurement.name, measurement.mainContact]
    for (const label of labels) {
        const phase = phaseFromLabel(label)
        if (phase) {
            return {
                phase,
                phaseIndex: ['A', 'B', 'C'].indexOf(phase),
                source: 'measurement-label',
                moduleName: '',
                moduleSerialNumber: '',
                channelName: clean(measurement.channelName || measurement.name),
            }
        }
    }

    const phase = phaseFromIndex(measurement.phaseIndex)
    return {
        phase,
        phaseIndex: phase ? ['A', 'B', 'C'].indexOf(phase) : null,
        source: phase ? 'measurement-phase-index' : 'unresolved',
        moduleName: '',
        moduleSerialNumber: '',
        channelName: clean(measurement.channelName || measurement.name),
    }
}

export default {
    readPtmChannelConfiguration,
    resolvePtmMeasurementChannel,
}
