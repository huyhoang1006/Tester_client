const hasValue = value => value !== null && value !== undefined && value !== ''
const isEnabledSurge = surge => Number(surge.sign) === 1

const hasTapChanger = tap => Boolean(tap && (
    hasValue(tap.mode) || hasValue(tap.serial_no) || hasValue(tap.tap_scheme) ||
    (Number(tap.no_of_taps) > 0) || (tap.voltage_table || []).length > 0
))

const fillValueIds = (value, uuid) => {
    if (!value || typeof value !== 'object') return
    if (Array.isArray(value)) {
        value.forEach(item => fillValueIds(item, uuid))
        return
    }
    if (Object.prototype.hasOwnProperty.call(value, 'mrid') && !value.mrid &&
        Object.keys(value).some(key => !['mrid', 'unit', 'label', 'type'].includes(key) &&
            typeof value[key] !== 'object' && hasValue(value[key]))) {
        value.mrid = uuid.newUuid()
    }
    Object.values(value).forEach(item => fillValueIds(item, uuid))
}

export const prepareTransformerImportDto = (dto, uuid, { regenerateTapPointIds = false } = {}) => {
    for (const section of ['properties', 'winding_configuration', 'ratings', 'impedances', 'others',
        'tap_changers', 'bushing_data', 'surge_arrester']) {
        if (!dto || !dto[section]) throw new Error(`Transformer import is missing ${section}`)
    }
    if (!dto.winding_configuration.vector_group) {
        throw new Error('Transformer import is missing winding_configuration.vector_group')
    }

    if (!dto.properties.mrid) dto.properties.mrid = uuid.newUuid()
    if (!dto.oldPowerTransformerInfoId) dto.oldPowerTransformerInfoId = uuid.newUuid()
    if (!dto.assetPsrId) dto.assetPsrId = uuid.newUuid()
    if (!dto.productAssetModelId) dto.productAssetModelId = uuid.newUuid()
    if (!dto.lifecycleDateId) dto.lifecycleDateId = uuid.newUuid()

    if (!Array.isArray(dto.oldTransformerEndInfo)) dto.oldTransformerEndInfo = []
    dto.oldTransformerEndInfo.forEach(end => {
        end.end_number = Number(end.end_number)
        if (!end.mrid) end.mrid = uuid.newUuid()
    })
    const requiredEnds = new Set()
    for (const row of dto.ratings?.voltage_ratings || []) {
        requiredEnds.add({ Prim: 1, Sec: 2, Tert: 3 }[row.winding])
    }
    for (const row of dto.ratings?.current_ratings || []) {
        if (row.prim?.mrid) requiredEnds.add(1)
        if (row.sec?.mrid) requiredEnds.add(2)
        if (row.tert?.mrid) requiredEnds.add(3)
    }
    if ((dto.impedances?.prim_sec || []).length) { requiredEnds.add(1); requiredEnds.add(2) }
    if ((dto.impedances?.prim_tert || []).length) { requiredEnds.add(1); requiredEnds.add(3) }
    if ((dto.impedances?.sec_tert || []).length) { requiredEnds.add(2); requiredEnds.add(3) }
    if (hasTapChanger(dto.tap_changers)) {
        requiredEnds.add({ Prim: 1, Sec: 2, Tert: 3 }[dto.tap_changers.winding])
    }
    for (const [winding, number] of [['prim', 1], ['sec', 2], ['tert', 3]]) {
        if ((dto.bushing_data?.[winding] || []).length ||
            (dto.surge_arrester?.[winding] || []).some(isEnabledSurge)) {
            requiredEnds.add(number)
        }
    }
    for (const number of requiredEnds) {
        if (!number || !dto.oldTransformerEndInfo.some(end => end.end_number === number)) {
            throw new Error(`Transformer import is missing winding end ${number || 'for a rating'}`)
        }
    }

    if (!Array.isArray(dto.shortCircuitTestTransformerEndInfo)) dto.shortCircuitTestTransformerEndInfo = []
    for (const key of ['prim_sec', 'prim_tert', 'sec_tert']) {
        for (const row of dto.impedances?.[key] || []) {
            if (!row.mrid) row.mrid = uuid.newUuid()
            if (!dto.shortCircuitTestTransformerEndInfo.some(link => link.short_circuit_test_id === row.mrid)) {
                dto.shortCircuitTestTransformerEndInfo.push({
                    mrid: uuid.newUuid(),
                    short_circuit_test_id: row.mrid,
                    transformer_end_info_id: ''
                })
            }
        }
    }

    const tap = dto.tap_changers
    if (hasTapChanger(tap)) {
        if (!tap.mrid) tap.mrid = uuid.newUuid()
        if (!tap.assetInfoId) tap.assetInfoId = uuid.newUuid()
        if (!tap.productAssetModelId) tap.productAssetModelId = uuid.newUuid()
        for (const point of tap.voltage_table || []) {
            if (regenerateTapPointIds || !point.id) point.id = uuid.newUuid()
        }
    }

    for (const winding of ['prim', 'sec', 'tert']) {
        for (const bushing of dto.bushing_data?.[winding] || []) {
            if (!bushing.mrid) bushing.mrid = uuid.newUuid()
            if (!bushing.assetInfoId) bushing.assetInfoId = uuid.newUuid()
            if (!bushing.productAssetModelId) bushing.productAssetModelId = uuid.newUuid()
            if (!bushing.lifecycleDateId) bushing.lifecycleDateId = uuid.newUuid()
        }
        for (const surge of dto.surge_arrester?.[winding] || []) {
            if (!isEnabledSurge(surge)) continue
            if (!surge.properties) throw new Error('Transformer surge arrester is missing properties')
            const properties = surge.properties
            if (!properties.mrid) properties.mrid = uuid.newUuid()
            if (!properties.assetInfoId) properties.assetInfoId = uuid.newUuid()
            if (!properties.productAssetModelId) properties.productAssetModelId = uuid.newUuid()
            if (!properties.lifecycleDateId) properties.lifecycleDateId = uuid.newUuid()
            for (const unit of surge.ratings?.table || []) {
                if (!unit.mrid) unit.mrid = uuid.newUuid()
                if (!unit.assetInfoId) unit.assetInfoId = uuid.newUuid()
            }
        }
    }

    fillValueIds(dto, uuid)
    return dto
}

export const validateTransformerImportEntity = (dto, entity) => {
    if (!entity.asset.asset_info || entity.asset.asset_info !== entity.oldPowerTransformerInfo.mrid) {
        throw new Error('Transformer import has no linked asset info')
    }
    if (entity.oldTransformerEndInfo.length !== dto.oldTransformerEndInfo.length) {
        throw new Error('Transformer import lost winding end information')
    }
    if (entity.oldTransformerEndInfo.some(end => end.power_transformer_info_id !== entity.asset.asset_info)) {
        throw new Error('Transformer import lost a winding end link')
    }
    if (entity.voltageRating.length !== (dto.ratings?.voltage_ratings || []).length ||
        entity.coolingPowerRating.length !== (dto.ratings?.power_ratings || []).length) {
        throw new Error('Transformer import lost rating rows')
    }
    if (entity.voltageRating.some(row => !row.transformer_end_id ||
        !dto.oldTransformerEndInfo.some(end => end.mrid === row.transformer_end_id))) {
        throw new Error('Transformer import lost a voltage rating link')
    }
    const expectedImpedances = ['prim_sec', 'prim_tert', 'sec_tert']
        .reduce((count, key) => count + (dto.impedances?.[key] || []).length, 0)
    if (entity.shortCircuitTest.length !== expectedImpedances) {
        throw new Error('Transformer import lost impedance rows')
    }
    if (entity.shortCircuitTest.some(row => !row.energised_end ||
        !dto.oldTransformerEndInfo.some(end => end.mrid === row.energised_end) ||
        !entity.shortCircuitTestTransformerEndInfo.some(link =>
            link.short_circuit_test_id === row.mrid &&
            dto.oldTransformerEndInfo.some(end => end.mrid === link.transformer_end_info_id)))) {
        throw new Error('Transformer import lost an impedance winding link')
    }
    if (hasTapChanger(dto.tap_changers) &&
        (!entity.tapChanger.asset.mrid || !entity.tapChanger.asset.asset_info ||
            entity.tapChanger.asset.asset_info !== entity.tapChanger.oldTapChangerInfo.mrid ||
            entity.tapChanger.oldTapChangerInfo.power_transformer_info_id !== entity.asset.asset_info ||
            !dto.oldTransformerEndInfo.some(end => end.mrid === entity.tapChanger.oldTapChangerInfo.transformer_end_info) ||
            entity.tapChanger.tapChangerTablePoint.length !== (dto.tap_changers.voltage_table || []).length)) {
        throw new Error('Transformer import lost the tap changer link')
    }
    const expectedBushings = ['prim', 'sec', 'tert']
        .reduce((count, key) => count + (dto.bushing_data?.[key] || []).length, 0)
    if (entity.bushing.length !== expectedBushings || entity.bushing.some(item =>
        !item.bushing.asset_info || item.bushing.asset_info !== item.oldBushingInfo.mrid ||
        !dto.oldTransformerEndInfo.some(end => end.mrid === item.oldBushingInfo.transformer_end_info))) {
        throw new Error('Transformer import lost a bushing link')
    }
    const expectedSurges = ['prim', 'sec', 'tert']
        .reduce((count, key) => count + (dto.surge_arrester?.[key] || []).filter(isEnabledSurge).length, 0)
    if (entity.surgeArrester.length !== expectedSurges || entity.surgeArrester.some(item =>
        !item.surgeArrester.asset_info ||
        item.surgeArrester.asset_info !== item.oldSurgeArresterInfo.mrid ||
        item.surgeArrester.asset_id !== entity.asset.mrid ||
        !dto.oldTransformerEndInfo.some(end => end.mrid === item.oldSurgeArresterInfo.transformer_end_info) ||
        item.assetUnit.some(unit => !unit.asset_info || unit.asset_id !== item.surgeArrester.mrid))) {
        throw new Error('Transformer import lost a surge arrester link')
    }
}
