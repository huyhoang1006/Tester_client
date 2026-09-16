const PRIMARY_GROUPS = [
    {client: 'IAB', server: 'I_PHASE_A_B', display: 'I (Phase A-B)'},
    {client: 'IAC', server: 'I_PHASE_A_C', display: 'I (Phase A-C)'},
    {client: 'IBC', server: 'I_PHASE_B_C', display: 'I (Phase B-C)'},
    {client: 'IA', server: 'I_PHASE_A', display: 'I (Phase A)'},
    {client: 'IB', server: 'I_PHASE_B', display: 'I (Phase B)'},
    {client: 'IC', server: 'I_PHASE_C', display: 'I (Phase C)'},
    {client: 'ISpare I', server: 'I_SPARE_I', display: 'I (Spare I)'},
    {client: 'YyNa', server: 'YYNA', display: 'YyNa'},
    {client: 'Yn', server: 'YN', display: 'Yn'},
    {client: 'D', server: 'D', display: 'D'},
    {client: 'Y', server: 'Y', display: 'Y'}
]

const CONNECTION_GROUPS = [
    {client: 'Yn', server: 'YN', display: 'Yn'},
    {client: 'Zn', server: 'ZN', display: 'Zn'},
    {client: 'I', server: 'I', display: 'I'},
    {client: 'D', server: 'D', display: 'D'},
    {client: 'Y', server: 'Y', display: 'Y'},
    {client: 'Z', server: 'Z', display: 'Z'}
]

const ACCESSIBILITY_GROUPS = [
    {client: '4 Accessible', server: 'ACCESSIBLE4'},
    {client: '3 Accessible', server: 'ACCESSIBLE3'},
    {client: '2 Accessible', server: 'ACCESSIBLE2'},
    {client: '1 Accessible', server: 'ACCESSIBLE1'},
    {client: 'Buried', server: 'BURIED'},
    {
        client: 'Buried /w grounding',
        server: 'BURIED_WITH_GROUNDING',
        aliases: ['Buried w/ grounding']
    }
]

const text = (value) => {
    if (value === null || value === undefined) return ''
    return String(value).trim()
}

const aliasesFor = (group) => [group.client, group.server, group.display, ...(group.aliases || [])]
    .filter(Boolean)

const findGroup = (groups, value) => {
    const normalized = text(value).toUpperCase()
    return groups.find((group) => aliasesFor(group).some((alias) => alias.toUpperCase() === normalized))
}

const matchPrefix = (value, groups) => {
    const input = text(value)
    const candidates = groups.flatMap((group) => aliasesFor(group).map((alias) => ({group, alias})))
        .sort((a, b) => b.alias.length - a.alias.length)
    const match = candidates.find(({alias}) => input.toUpperCase().startsWith(alias.toUpperCase()))
    if (!match) return null
    return {value: match.group.client, rest: input.slice(match.alias.length)}
}

const matchClock = (value, required = true) => {
    const input = text(value)
    const match = input.match(/^(10|11|[0-9])/)
    if (!match) return required ? null : {value: '', rest: input}
    return {value: match[1], rest: input.slice(match[1].length)}
}

const matchConnectionClock = (value, requiredClock = true) => {
    const connection = matchPrefix(value, CONNECTION_GROUPS)
    if (!connection) return null
    const clock = matchClock(connection.rest, requiredClock)
    if (!clock) return null
    return {
        connection: connection.value,
        clock: clock.value,
        rest: clock.rest
    }
}

const matchAccessibility = (value) => {
    const input = text(value)
    if (!input) return ''
    const group = findGroup(ACCESSIBILITY_GROUPS, input)
    return group ? group.client : null
}

const emptyVectorGroup = (prim) => ({
    prim,
    sec: {i: '', value: ''},
    tert: {i: '', value: '', accessible: ''}
})

const parseOnePhase = (prim, rest, assetType) => {
    const group = emptyVectorGroup(prim)
    const type = text(assetType).toUpperCase()

    const parseTwoWinding = () => {
        const sec = matchConnectionClock(rest, false)
        if (!sec || sec.connection !== 'I' || sec.rest) return null
        group.sec = {i: sec.connection, value: sec.clock}
        return group
    }
    const parseThreeWinding = () => {
        const sec = matchConnectionClock(rest, false)
        if (!sec || sec.connection !== 'I') return null
        const tert = matchConnectionClock(sec.rest, false)
        if (!tert || tert.connection !== 'I' || tert.rest) return null
        group.sec = {i: sec.connection, value: sec.clock}
        group.tert = {i: tert.connection, value: tert.clock, accessible: ''}
        return group
    }
    const parseAutoWithTert = () => {
        const tert = matchConnectionClock(rest, false)
        if (!tert || tert.connection !== 'I' || tert.rest) return null
        group.tert = {i: tert.connection, value: tert.clock, accessible: ''}
        return group
    }

    if (type === 'TWO-WINDING') return parseTwoWinding()
    if (type === 'THREE-WINDING') return parseThreeWinding()
    if (type === 'AUTO W/ TERT') return parseAutoWithTert()
    if (type === 'AUTO W/O TERT') return rest ? null : group
    return parseThreeWinding() || parseTwoWinding() || parseAutoWithTert() || (!rest ? group : null)
}

const parseThreePhase = (prim, rest, assetType) => {
    const type = text(assetType).toUpperCase()

    const parseTwoWinding = () => {
        const group = emptyVectorGroup(prim)
        const sec = matchConnectionClock(rest)
        if (!sec || sec.rest) return null
        group.sec = {i: sec.connection, value: sec.clock}
        return group
    }
    const parseThreeWinding = () => {
        const group = emptyVectorGroup(prim)
        const sec = matchConnectionClock(rest)
        if (!sec) return null
        const tert = matchConnectionClock(sec.rest)
        if (!tert) return null
        const accessible = matchAccessibility(tert.rest)
        if (accessible === null) return null
        group.sec = {i: sec.connection, value: sec.clock}
        group.tert = {i: tert.connection, value: tert.clock, accessible}
        return group
    }
    const parseAutoWithTert = () => {
        const group = emptyVectorGroup(prim)
        const tert = matchConnectionClock(rest)
        if (!tert) return null
        const accessible = matchAccessibility(tert.rest)
        if (accessible === null) return null
        group.tert = {i: tert.connection, value: tert.clock, accessible}
        return group
    }

    if (type === 'TWO-WINDING') return parseTwoWinding()
    if (type === 'THREE-WINDING') return parseThreeWinding()
    if (type === 'AUTO W/ TERT') return parseAutoWithTert()
    if (type === 'AUTO W/O TERT') return rest ? null : emptyVectorGroup(prim)
    if (prim === 'YyNa') return parseAutoWithTert() || (!rest ? emptyVectorGroup(prim) : null)
    return parseThreeWinding() || parseTwoWinding()
}

export const toServerPrimary = (value) => findGroup(PRIMARY_GROUPS, value)?.server || text(value) || null

export const toServerConnection = (value) => findGroup(CONNECTION_GROUPS, value)?.server || text(value) || null

export const toServerAccessibility = (value) => findGroup(ACCESSIBILITY_GROUPS, value)?.server || text(value) || null

export const fromServerPrimary = (value) => findGroup(PRIMARY_GROUPS, value)?.client || text(value)

export const fromServerConnection = (value) => findGroup(CONNECTION_GROUPS, value)?.client || text(value)

export const fromServerAccessibility = (value) => findGroup(ACCESSIBILITY_GROUPS, value)?.client || ''

export const buildClientVectorGroupText = (vectorGroup) => {
    const vg = vectorGroup || {}
    const prim = findGroup(PRIMARY_GROUPS, vg.prim)?.display || text(vg.prim)
    const sec = findGroup(CONNECTION_GROUPS, vg.sec?.i)?.display || text(vg.sec?.i)
    const tert = findGroup(CONNECTION_GROUPS, vg.tert?.i)?.display || text(vg.tert?.i)
    return `${prim}${sec}${text(vg.sec?.value)}${tert}${text(vg.tert?.value)}${text(vg.tert?.accessible)}`
}

export const buildServerVectorGroup = (windingConfiguration) => {
    const wc = windingConfiguration || {}
    const vg = wc.vector_group || {}
    const hasComponents = Boolean(text(vg.prim) || text(vg.sec?.i) || text(vg.tert?.i))
    if (!hasComponents) {
        return text(wc.vector_group_custom) || text(wc.unsupported_vector_group) || text(wc.vector_group_data) || null
    }

    return [
        toServerPrimary(vg.prim),
        toServerConnection(vg.sec?.i),
        text(vg.sec?.value),
        toServerConnection(vg.tert?.i),
        text(vg.tert?.value),
        toServerAccessibility(vg.tert?.accessible)
    ].filter(Boolean).join('') || null
}

export const parseServerVectorGroup = (value, phases, assetType) => {
    const primary = matchPrefix(value, PRIMARY_GROUPS)
    if (!primary) return null
    const isOnePhase = text(phases).toUpperCase() === 'ONE' || text(phases) === '1'
    const vectorGroup = isOnePhase
        ? parseOnePhase(primary.value, primary.rest, assetType)
        : parseThreePhase(primary.value, primary.rest, assetType)
    if (!vectorGroup) return null
    return {
        vectorGroup,
        vectorGroupData: buildClientVectorGroupText(vectorGroup)
    }
}
