const POWER_PLANT_ICONS = Object.freeze({
    'wind power': 'fa-solid fa-wind',
    'solar power': 'fa-solid fa-solar-panel',
    'waste to energy': 'fa-solid fa-recycle',
    'biomass power': 'fa-solid fa-leaf',
    'thermal power': 'fa-solid fa-fire',
    hydropower: 'fa-solid fa-water',
    'nuclear power': 'fa-solid fa-atom'
})

const normalizePowerPlantType = (plantType) => String(plantType || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')

export const getPowerPlantIcon = (plantType) => {
    return POWER_PLANT_ICONS[normalizePowerPlantType(plantType)] || 'fa-solid fa-industry'
}

export default POWER_PLANT_ICONS
