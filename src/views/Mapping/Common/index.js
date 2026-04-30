export const getUnitMeasurment = (unit_multiplier, unit_symbol) => {
    if(unit_multiplier) {
        if(unit_symbol) {
            return unit_multiplier + '|' + unit_symbol
        } else {
            return ''
        }
    } else {
        if(unit_symbol) {
            return unit_symbol
        } else {
            return ''
        }
    }
}