const assert = require('assert')
const fs = require('fs')
const path = require('path')
const Module = require('module')
const babel = require('@babel/core')

const root = path.resolve(__dirname, '..')
const src = path.join(root, 'src') + path.sep
const originalResolve = Module._resolveFilename
const originalLoader = Module._extensions['.js']
Module._resolveFilename = function (request, parent, ...args) {
    const resolved = request.startsWith('@/') ? path.join(src, request.slice(2)) : request
    return originalResolve.call(this, resolved, parent, ...args)
}
Module._extensions['.js'] = function (module, filename) {
    if (!filename.startsWith(src)) return originalLoader(module, filename)
    const source = fs.readFileSync(filename, 'utf8')
    const { code } = babel.transformSync(source, {
        filename, babelrc: false, configFile: false,
        plugins: ['@babel/plugin-transform-modules-commonjs'],
    })
    module._compile(code, filename)
}

const TransformerDto = require('../src/views/Dto/Transformer').default
const { transformerDtoToEntity } = require('../src/views/Mapping/Transformer')
const { regenBranchIds } = require('../src/views/Import/services/importJsonService')
const { validateTransformerImportEntity, prepareTransformerImportDto } =
    require('../src/views/Import/services/transformerImportDto')

let sequence = 0
const uuid = { newUuid: () => `new-${++sequence}` }
const dto = new TransformerDto()
dto.properties.mrid = 'old-asset'
dto.properties.serial_no = 'VN1616'
dto.properties.type = 'Two-winding'
dto.oldPowerTransformerInfoId = 'old-transformer-info'
dto.oldTransformerEndInfo = [
    { mrid: 'old-primary', end_number: 1 },
    { mrid: 'old-secondary', end_number: 2 },
]
dto.ratings.voltage_ratings.push({
    mrid: 'old-voltage-rating', winding: 'Prim',
    voltage_ll: { mrid: 'old-ll', value: '22', unit: 'k|V' },
    voltage_ln: { mrid: 'old-ln', value: '12.7', unit: 'k|V' },
    insul_level_ll: { mrid: 'old-bil', value: '125', unit: 'k|V' },
})
dto.ratings.power_ratings.push({
    mrid: 'old-power-rating',
    rated_power: { mrid: 'old-power', value: '25', unit: 'M|VA' },
    temp_rise_wind: { mrid: 'old-rise', value: '65', unit: 'degC' },
})
dto.impedances.prim_sec.push({
    mrid: 'old-impedance',
    base_power: { mrid: 'old-base-power', data: { mrid: 'old-base-power-value', value: '25', unit: 'M|VA' } },
    base_voltage: { mrid: 'old-base-voltage', data: { mrid: 'old-base-voltage-value', value: '22', unit: 'k|V' } },
    short_circuit_impedances_uk: { mrid: 'old-uk', value: '8', unit: '%' },
    load_losses_pk: { mrid: 'old-pk', value: '100', unit: 'k|W' },
})
dto.shortCircuitTestTransformerEndInfo.push({
    mrid: 'old-impedance-link', short_circuit_test_id: 'old-impedance',
    transformer_end_info_id: 'old-secondary',
})
dto.tap_changers.mrid = 'old-tap'
dto.tap_changers.assetInfoId = 'old-tap-info'
dto.tap_changers.productAssetModelId = 'old-tap-model'
dto.tap_changers.mode = 'OLTC'
dto.tap_changers.winding = 'Prim'
dto.tap_changers.no_of_taps = '1'
dto.tap_changers.voltage_table = [{
    id: 'old-point', tap: 1, voltage: { mrid: 'old-tap-voltage', value: '22', unit: 'k|V' },
}]
dto.surge_arrester.prim.push({
    sign: true,
    properties: {
        mrid: 'old-surge', assetInfoId: 'old-surge-info',
        productAssetModelId: 'old-surge-model', lifecycleDateId: 'old-surge-life',
    },
    ratings: { unit: 0, pos: 'A', table: [] },
})

regenBranchIds({ type: 'transformer', data: dto }, { mrid: 'target-bay' }, uuid)
assert.notStrictEqual(dto.properties.mrid, 'old-asset')
assert.notStrictEqual(dto.oldPowerTransformerInfoId, 'old-transformer-info')
assert.notStrictEqual(dto.tap_changers.assetInfoId, 'old-tap-info')
assert.notStrictEqual(dto.tap_changers.voltage_table[0].id, 'old-point')
assert.notStrictEqual(dto.surge_arrester.prim[0].properties.assetInfoId, 'old-surge-info')
assert.strictEqual(dto.shortCircuitTestTransformerEndInfo[0].short_circuit_test_id, dto.impedances.prim_sec[0].mrid)
assert.strictEqual(dto.psrId, 'target-bay')

const entity = transformerDtoToEntity(dto)
validateTransformerImportEntity(dto, entity)
assert.strictEqual(entity.asset.asset_info, entity.oldPowerTransformerInfo.mrid)
assert.strictEqual(entity.tapChanger.oldTapChangerInfo.power_transformer_info_id, entity.asset.asset_info)
assert.strictEqual(entity.surgeArrester[0].surgeArrester.asset_id, entity.asset.mrid)
assert.strictEqual(entity.voltageRating[0].transformer_end_id, dto.oldTransformerEndInfo[0].mrid)
assert.strictEqual(entity.shortCircuitTestTransformerEndInfo[0].short_circuit_test_id, entity.shortCircuitTest[0].mrid)

const broken = new TransformerDto()
broken.properties.mrid = 'another-asset'
broken.ratings.voltage_ratings.push({ winding: 'Prim' })
assert.throws(() => prepareTransformerImportDto(broken, uuid), /missing winding end/)
assert.throws(() => prepareTransformerImportDto({ properties: {} }, uuid), /missing winding_configuration/)
entity.tapChanger.oldTapChangerInfo.power_transformer_info_id = null
assert.throws(() => validateTransformerImportEntity(dto, entity), /tap changer link/)

console.log('Transformer JSON import links and validation: OK')
