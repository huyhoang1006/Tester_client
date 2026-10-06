const emptyTerminal = () => ({
    i: '',
    value: ''
})

const emptyTertiary = () => ({
    ...emptyTerminal(),
    accessible: ''
})

export const transformerHasTertiary = type => (
    type === 'Three-winding' || type === 'Auto w/ tert'
)

export const createDefaultVectorGroup = (type = 'Three-winding') => {
    if (type === 'Auto w/o tert') {
        return {
            prim: 'YyNa',
            sec: emptyTerminal(),
            tert: emptyTertiary()
        }
    }

    if (type === 'Auto w/ tert') {
        return {
            prim: 'YyNa',
            sec: emptyTerminal(),
            tert: { i: 'D', value: '11', accessible: '' }
        }
    }

    return {
        prim: 'Yn',
        sec: { i: 'Yn', value: '0' },
        tert: transformerHasTertiary(type)
            ? { i: 'D', value: '11', accessible: '' }
            : emptyTertiary()
    }
}

export const formatVectorGroup = vectorGroup => {
    const group = vectorGroup || {}
    const secondary = group.sec || {}
    const tertiary = group.tert || {}
    return [
        group.prim,
        secondary.i,
        secondary.value,
        tertiary.i,
        tertiary.value,
        tertiary.accessible
    ].filter(value => value !== undefined && value !== null).join('')
}

export const copyVectorGroup = vectorGroup => JSON.parse(JSON.stringify(
    vectorGroup || createDefaultVectorGroup()
))
