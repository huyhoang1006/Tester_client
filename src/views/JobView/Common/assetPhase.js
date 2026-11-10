const PHASES = ['A', 'B', 'C']

export const getAssetPhaseCount = asset => {
  const source = asset || {}
  const assetFields = [source.surgeArrester, source.surge_arrester, source.asset, source.assetData]
    .filter(value => value && typeof value === 'object')
  const configurations = [source.configuration, source.config, source.configsData, source.circuitBreaker, source.winding_configuration]
    .filter(value => value && typeof value === 'object')
  const candidates = [
    source.number_of_phase,
    source.number_of_phases,
    source.numberOfPhase,
    source.numberOfPhases,
    ...configurations.flatMap(value => [value.number_of_phase, value.number_of_phases, value.numberOfPhase, value.numberOfPhases, value.phases]),
    ...assetFields.flatMap(value => [value.number_of_phase, value.number_of_phases, value.numberOfPhase, value.numberOfPhases])
  ]
  const counts = candidates.map(value => parseInt(value && typeof value === 'object' ? value.value : value, 10))
  return counts.find(count => [1, 2, 3].includes(count)) || null
}

export const getAssetPhase = asset => {
  const source = asset || {}
  // Depending on the entry point, an asset can be a DTO, a flattened entity,
  // or an entity containing both the shared and equipment-specific records.
  const assetFields = [source.surgeArrester, source.surge_arrester, source.asset, source.assetData]
    .filter(value => value && typeof value === 'object')
  const configuration = source.configuration || source.config || source.configsData || source.circuitBreaker || source.winding_configuration || {}
  const number = getAssetPhaseCount(source)
  const phase = source.phase || configuration.phase || assetFields.map(value => value.phase).find(value => value !== undefined && value !== null && value !== '')
  const phaseValue = phase && typeof phase === 'object' ? phase.value : phase
  return number === 1 && PHASES.includes(String(phaseValue || '').toUpperCase()) ? String(phaseValue).toUpperCase() : ''
}

export const phaseListForAsset = asset => {
  if (getAssetPhaseCount(asset) === 2) return PHASES.slice(0, 2)
  const phase = getAssetPhase(asset)
  return phase ? [phase] : PHASES
}

export const filterPhaseRows = (rows, asset, field = 'phase') => {
  const phase = getAssetPhase(asset)
  if (!phase) return rows
  return (rows || []).filter(row => {
    const value = row && row[field] && row[field].value
    if (value !== undefined && String(value).trim() !== '') return String(value).toUpperCase() === phase
    const measurement = String(row && row.measurement && row.measurement.value || row && row.name && row.name.value || '')
    if (/^Phase\s+/i.test(measurement)) return measurement.toUpperCase().startsWith(`PHASE ${phase}`)
    if (/^[ABC]\s*[-–]/i.test(measurement)) return measurement.toUpperCase().startsWith(`${phase} `) || measurement.toUpperCase().startsWith(`${phase}-`)
    return !/\b(?:A|B|C)\b/i.test(measurement)
  })
}

export const filterTestTablesByAssetPhase = (data, asset) => {
  const phases = phaseListForAsset(asset)
  if (phases.length === 3 || !data || !data.table) return data
  Object.keys(data.table).forEach(key => {
    if (!Array.isArray(data.table[key])) return
    data.table[key] = data.table[key].filter(row => {
      const value = row && row.phase && row.phase.value
      if (value !== undefined && String(value).trim() !== '') return phases.includes(String(value).toUpperCase())
      const label = String(row && (row.measurement && row.measurement.value || row.name && row.name.value) || '').trim()
      if (/^Phase\s+([ABC])\b/i.test(label)) return phases.includes(label.match(/^Phase\s+([ABC])\b/i)[1].toUpperCase())
      if (/^([ABC])\s*[-–]/i.test(label)) return phases.includes(label.match(/^([ABC])\s*[-–]/i)[1].toUpperCase())
      // Labels such as "Phase - GND" are generic three-phase defaults; a
      // single-phase asset must only get the row explicitly named for its phase.
      if (/^Phase\b/i.test(label)) return false
      return true
    })
  })
  return data
}
