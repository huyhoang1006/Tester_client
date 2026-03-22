/* eslint-disable */
import transformerTestMap from '@/config/test-definitions/Transformer'
import transformerConditionMap from '@/config/testing-condition/Transformer/index.js'
import * as common from '../../../../Common/index.js'

export default {
    methods: {
        async initTest(testTypeCode, assetData) {
            let data = null
            switch (testTypeCode) {
                case 'GeneralInspection':
                    data = await this.initGeneralInspection(testTypeCode)
                    break
                case 'InsulationResistance':
                    data = await this.initInsulationResistance(testTypeCode, assetData)
                    break
                case 'RatioPrimSec':
                    data = await this.initRatioPrimSec(testTypeCode, assetData)
                    break
                case 'DCWindingPrim':
                    if (assetData.tap_changers.winding === this.$constant.PRIM) {
                        data = await this.initDCWindingPrim(testTypeCode, assetData)
                    } else {
                        this.$message.error('Can not choose this one')
                    }
                    break
                case 'DCWindingSec':
                    if (assetData.tap_changers.winding === this.$constant.SEC) {
                        data = await this.initDCWindingSec(testTypeCode, assetData)
                    } else {
                        this.$message.error('Can not choose this one')
                    }
                    break
                case 'DCWindingTert':
                    if (assetData.tap_changers.winding === this.$constant.TERT) {
                        data = await this.initDCWindingTert(testTypeCode, assetData)
                    } else {
                        this.$message.error('Can not choose this one')
                    }
                    break
                case 'MeasurementOfNoLoad':
                    data = await this.initMeasurementOfNoLoad(testTypeCode)
                    break
                case 'MeasurementOfShortCircuit':
                    data = await this.initMeasurementOfShortCircuit(testTypeCode)
                    break
                case 'EnergyEfficiency':
                    data = await this.initEnergyEfficiency(testTypeCode)
                    break
                case 'InducedAcVoltageTests':
                    data = await this.initInducedAcVoltageTests(testTypeCode)
                    break
                case 'MeasurementOfOil':
                    data = await this.initMeasurementOfOil(testTypeCode)
                    break
                case 'DimensionWeight':
                    data = await this.initDimensionWeight(testTypeCode)
                    break
                case 'TestingInstruments':
                    data = await this.initTestingInstruments(testTypeCode)
                    break
                case 'ExcitingCurrent':
                    data = await this.initExcitingCurrent(testTypeCode, assetData)
                    break
                case 'SeparateSourceAc':
                    data = await this.initSeparateSourceAc(testTypeCode)
                    break
                case 'WindingDfCap':
                    data = await this.initWindingDfCap(testTypeCode, assetData)
                    break
                case 'BushingPrimC1':
                    data = await this.initBushingPrimC1(testTypeCode, assetData)
                    break
                case 'BushingPrimC2':
                    data = await this.initBushingPrimC2(testTypeCode, assetData)
                    break
                case 'BushingSecC1':
                    data = await this.initBushingSecC1(testTypeCode, assetData)
                    break
                case 'BushingSecC2':
                    data = await this.initBushingSecC2(testTypeCode, assetData)
                    break
                case 'BushingTertC1':
                    data = await this.initBushingTertC1(testTypeCode, assetData)
                    break
                case 'BushingTertC2':
                    data = await this.initBushingTertC2(testTypeCode, assetData)
                    break
                case 'Dga':
                    data = await this.initDga(testTypeCode)
                    break
                case 'InsulationResistanceYokeCore':
                    data = await this.initInsulationResistanceYokeCore(testTypeCode)
                    break
                case 'ShortCircuitImpedancePrim':
                    data = await this.initShortCircuitImpedancePrim(testTypeCode, assetData)
                    break
                case 'ShortCircuitImpedanceSec':
                    data = await this.initShortCircuitImpedanceSec(testTypeCode, assetData)
                    break
                case 'ShortCircuitImpedanceTert':
                    data = await this.initShortCircuitImpedanceTert(testTypeCode, assetData)
                    break
                case 'GasChromatography':
                    data = await this.initGasChromatography(testTypeCode)
                    break
            }
            return data
        },
        async initGeneralInspection(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []

            const data = [
                'Transformer tank',
                'Nameplate',
                'High voltage bushings',
                'Arresters',
                'Radiators',
                'Fault gas detector relay',
                'Failt pressure relay',
                'Oil flow relay',
                'OLTC',
                'DETC',
                'Oil level of transformer',
                'Oil level of tap changer',
                'Grounding',
                'Valves',
                'Breathers',
                'Desiccant gel/Silica gel',
                'Oil temperature meter',
                'Phase symbols'
            ]

            data.forEach((element) => {
                const row = JSON.parse(JSON.stringify(rowDataExample))

                if (row.item) {
                    row.item.value = element
                } else if (row.items) {
                    row.items.value = element
                } else if (row.name) {
                    row.name.value = element
                }

                table1.push(row)
            })

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initInsulationResistance(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            const asset = assetData

            let table1 = []

            let measurementConfigs = []

            if (asset.properties.type === 'Two-winding') {
                measurementConfigs = [
                    {pos: '(HV + LV) - GND', type: 'HV-E'},
                    {pos: 'HV - (LV + GND)', type: 'HV-E'},
                    {pos: 'LV - (HV + GND)', type: 'LV-E'}
                ]
            } else if (asset.properties.type === 'Three-winding') {
                measurementConfigs = [
                    {pos: 'HV - (LV + TV + GND)', type: 'HV-E'},
                    {pos: 'LV - (HV + LV + GND)', type: 'LV-E'},
                    {pos: '(HV + LV + TV) - GND', type: 'HV-E'},
                    {pos: 'TV - (HV + LV + GND)', type: 'LV-E'}
                ]
            } else if (asset.properties.type === 'Auto w/ tert') {
                measurementConfigs = [
                    {pos: '(HV + LV) - (TV + GND)', type: 'HV-E'},
                    {pos: '(HV + LV + TV) - GND', type: 'HV-E'},
                    {pos: 'TV - (HV + LV + GND)', type: 'LV-E'}
                ]
            } else if (asset.properties.type === 'Auto w/o tert') {
                measurementConfigs = [{pos: '(HV + LV) - GND', type: 'HV-E'}]
            } else {
                measurementConfigs = [{pos: '', type: ''}]
            }

            measurementConfigs.forEach((config) => {
                const row = JSON.parse(JSON.stringify(rowDataExample))

                row.measurement.value = config.pos
                row.type.value = config.type

                table1.push(row)
            })

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initExcitingCurrent(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let tapChangers = assetData?.tap_changers || {}
            if (typeof tapChangers === 'string') {
                try {
                    tapChangers = JSON.parse(tapChangers)
                } catch (e) {
                    tapChangers = {}
                }
            }

            let table1 = []
            const voltage_table = tapChangers.voltage_table || []
            const phases = ['A', 'B', 'C']

            voltage_table.forEach((element) => {
                const tap = element.tap
                const voltage = element.voltage
                const voltage_table_id = element.id

                phases.forEach((phase) => {
                    const row = JSON.parse(JSON.stringify(rowDataExample))

                    if (row.voltage_table_id) row.voltage_table_id.value = voltage_table_id
                    if (row.tap) row.tap.value = tap
                    if (row.phase) row.phase.value = phase

                    table1.push(row)
                })
            })

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initRatioPrimSec(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            const asset = assetData || []
            const tapChangers = asset.tap_changers || {}

            if (!tapChangers.mode || !tapChangers.winding || !tapChangers.tap_scheme || !tapChangers.no_of_taps) {
                return {
                    rowDataExampleCondition,
                    table: {
                        table1: []
                    }
                }
            }

            let table1 = []
            const voltage_table = tapChangers.voltage_table || []
            const phases = ['A', 'B', 'C']

            voltage_table.forEach((element) => {
                const tap = element.tap

                phases.forEach((phase) => {
                    const row = JSON.parse(JSON.stringify(rowDataExample))

                    if (row.tap) row.tap.value = tap
                    if (row.phase) row.phase.value = phase

                    table1.push(row)
                })
            })

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initDCWindingPrim(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let tapChangers = assetData?.tap_changers || {}

            if (typeof tapChangers === 'string') {
                try {
                    tapChangers = JSON.parse(tapChangers)
                } catch (e) {
                    tapChangers = {}
                }
            }

            let table1 = []
            const phases = ['A', 'B', 'C']

            if (tapChangers.mode && tapChangers.winding === this.$constant.PRIM && tapChangers.tap_scheme && tapChangers.no_of_taps) {
                const voltage_table = tapChangers.voltage_table || []
                voltage_table.forEach((element) => {
                    const tap = element.tap
                    phases.forEach((phase) => {
                        const row = JSON.parse(JSON.stringify(rowDataExample))
                        if (row.tap) row.tap.value = tap
                        if (row.name) row.name.value = phase
                        table1.push(row)
                    })
                })
            } else {
                phases.forEach((phase) => {
                    const row = JSON.parse(JSON.stringify(rowDataExample))
                    if (row.phase) row.name.value = phase
                    table1.push(row)
                })
            }
            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initDCWindingSec(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let tapChangers = assetData?.tap_changers || {}

            if (typeof tapChangers === 'string') {
                try {
                    tapChangers = JSON.parse(tapChangers)
                } catch (e) {
                    tapChangers = {}
                }
            }

            let table1 = []
            const phases = ['A', 'B', 'C']

            if (tapChangers.mode && tapChangers.winding === this.$constant.SEC && tapChangers.tap_scheme && tapChangers.no_of_taps) {
                const voltage_table = tapChangers.voltage_table || []
                voltage_table.forEach((element) => {
                    const tap = element.tap
                    phases.forEach((phase) => {
                        const row = JSON.parse(JSON.stringify(rowDataExample))
                        if (row.tap) row.tap.value = tap
                        if (row.name) row.name.value = phase
                        table1.push(row)
                    })
                })
            } else {
                phases.forEach((phase) => {
                    const row = JSON.parse(JSON.stringify(rowDataExample))
                    if (row.phase) row.name.value = phase
                    table1.push(row)
                })
            }
            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initDCWindingTert(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let tapChangers = assetData?.tap_changers || {}

            if (typeof tapChangers === 'string') {
                try {
                    tapChangers = JSON.parse(tapChangers)
                } catch (e) {
                    tapChangers = {}
                }
            }

            let table1 = []
            const phases = ['A', 'B', 'C']

            if (tapChangers.mode && tapChangers.winding === this.$constant.TERT && tapChangers.tap_scheme && tapChangers.no_of_taps) {
                const voltage_table = tapChangers.voltage_table || []
                voltage_table.forEach((element) => {
                    const tap = element.tap
                    phases.forEach((phase) => {
                        const row = JSON.parse(JSON.stringify(rowDataExample))
                        if (row.tap) row.tap.value = tap
                        if (row.name) row.name.value = phase
                        table1.push(row)
                    })
                })
            } else {
                phases.forEach((phase) => {
                    const row = JSON.parse(JSON.stringify(rowDataExample))
                    if (row.phase) row.name.value = phase
                    table1.push(row)
                })
            }
            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initMeasurementOfNoLoad(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []
            let names = ['No-load loss (W)', 'No-load current (%)']

            names.forEach((element) => {
                const row = JSON.parse(JSON.stringify(rowDataExample))
                if (row.name) {
                    row.name.value = element
                }

                table1.push(row)
            })

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initMeasurementOfShortCircuit(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []
            let names = ['Load loss (W)', 'Short circuit impedance(%)']

            names.forEach((element) => {
                const row = JSON.parse(JSON.stringify(rowDataExample))
                if (row.name) {
                    row.name.value = element
                }

                table1.push(row)
            })

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initEnergyEfficiency(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []
            let names = ['HV1', 'HV2']

            names.forEach((element) => {
                const row = JSON.parse(JSON.stringify(rowDataExample))
                if (row.name) {
                    row.name.value = element
                }

                table1.push(row)
            })

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initSeparateSourceAc(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []
            let appliedTerminals = ['HV - (LV+E)', 'LV - (HV+E)']

            appliedTerminals.forEach((element) => {
                const row = JSON.parse(JSON.stringify(rowDataExample))
                if (row.applied_terminal) {
                    row.applied_terminal.value = element
                }

                table1.push(row)
            })

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initInducedAcVoltageTests(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []

            const row = JSON.parse(JSON.stringify(rowDataExample))
            table1.push(row)

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initMeasurementOfOil(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []

            const row = JSON.parse(JSON.stringify(rowDataExample))
            table1.push(row)

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initDimensionWeight(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []

            const row = JSON.parse(JSON.stringify(rowDataExample))
            table1.push(row)

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initTestingInstruments(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []

            const row = JSON.parse(JSON.stringify(rowDataExample))
            table1.push(row)

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initWindingDfCap(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []
            let measurementPositions = []

            if (assetData.properties.type === 'Three-winding') {
                measurementPositions = [
                    'CH+CHL+CHT',
                    'CH+CHL',
                    'CH+CHT',
                    'CH',
                    'CHL',
                    'CHT',
                    'CL+CHL+CLT',
                    'CL+CHL',
                    'CL+CLT',
                    'CL',
                    'CLT',
                    'CT+CHT+CLT',
                    'CT+CHT',
                    'CT+CHL',
                    'CT'
                ]
            } else if (assetData.properties.type === 'Two-winding') {
                measurementPositions = ['CH+CHL', 'CH', 'CHL', 'CL', 'CL+CHL']
            } else {
                measurementPositions = ['CH+CHT', 'CH', 'CHT', 'CT', 'CT+CHT']
            }

            measurementPositions.forEach((pos) => {
                const row = JSON.parse(JSON.stringify(rowDataExample))

                if (row.measurement) {
                    row.measurement.value = pos
                }

                table1.push(row)
            })

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initBushingPrimC1(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []
            const primBushings = assetData.bushing_data.prim || []

            if (primBushings.length > 0) {
                primBushings.forEach((e) => {
                    const row = JSON.parse(JSON.stringify(rowDataExample))

                    if (row.measurement) row.measurement.value = e.pos
                    if (row.df_ref) row.df_ref.value = e.df_c1.value
                    if (row.c_ref) row.c_ref.value = e.cap_c1.value

                    table1.push(row)
                })
            }

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initBushingPrimC2(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []
            const primBushings = assetData.bushing_data.prim || []

            if (primBushings.length > 0) {
                primBushings.forEach((e) => {
                    const row = JSON.parse(JSON.stringify(rowDataExample))

                    if (row.measurement) row.measurement.value = e.pos
                    if (row.df_ref) row.df_ref.value = e.df_c2.value
                    if (row.c_ref) row.c_ref.value = e.cap_c2.value

                    table1.push(row)
                })
            }

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initBushingSecC1(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []
            const secBushings = assetData.bushing_data.sec || []

            if (secBushings.length > 0) {
                secBushings.forEach((e) => {
                    const row = JSON.parse(JSON.stringify(rowDataExample))

                    if (row.measurement) row.measurement.value = e.pos
                    if (row.df_ref) row.df_ref.value = e.df_c1.value
                    if (row.c_ref) row.c_ref.value = e.cap_c1.value

                    table1.push(row)
                })
            }

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initBushingSecC2(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []
            const secBushings = assetData.bushing_data.sec || []

            if (secBushings.length > 0) {
                secBushings.forEach((e) => {
                    const row = JSON.parse(JSON.stringify(rowDataExample))

                    if (row.measurement) row.measurement.value = e.pos
                    if (row.df_ref) row.df_ref.value = e.df_c2.value
                    if (row.c_ref) row.c_ref.value = e.cap_c2.value

                    table1.push(row)
                })
            }

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initBushingTertC1(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []
            const tertBushings = assetData.bushing_data.tert || []

            if (tertBushings.length > 0) {
                tertBushings.forEach((e) => {
                    const row = JSON.parse(JSON.stringify(rowDataExample))

                    if (row.measurement) row.measurement.value = e.pos
                    if (row.df_ref) row.df_ref.value = e.df_c1.value
                    if (row.c_ref) row.c_ref.value = e.cap_c1.value

                    table1.push(row)
                })
            }

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initBushingTertC2(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []
            const tertBushings = assetData.bushing_data.tert || []

            if (tertBushings.length > 0) {
                tertBushings.forEach((e) => {
                    const row = JSON.parse(JSON.stringify(rowDataExample))

                    if (row.measurement) row.measurement.value = e.pos
                    if (row.df_ref) row.df_ref.value = e.df_c2.value
                    if (row.c_ref) row.c_ref.value = e.cap_c2.value

                    table1.push(row)
                })
            }

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initDga(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []

            const row = JSON.parse(JSON.stringify(rowDataExample))
            table1.push(row)

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initGasChromatography(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []

            const row = JSON.parse(JSON.stringify(rowDataExample))
            table1.push(row)

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initInsulationResistanceYokeCore(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []

            const row = JSON.parse(JSON.stringify(rowDataExample))
            table1.push(row)

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initShortCircuitImpedancePrim(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []
            let table2 = []
            let phases = ['A', 'B', 'C']
            let primSec = assetData.impedances.prim_sec || []

            if (primSec.length > 0) {
                primSec.forEach((e) => {
                    phases.forEach((phase) => {
                        const row1 = JSON.parse(JSON.stringify(rowDataExample))
                        const row2 = JSON.parse(JSON.stringify(rowDataExample))

                        if (row1.tap) row1.tap.value = e.oltc_position
                        if (row1.phase) row1.phase.value = phase

                        if (row2.tap) row2.tap.value = e.oltc_position
                        if (row2.phase) row2.phase.value = phase

                        table1.push(row1)
                        table2.push(row2)
                    })
                })
            }

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1,
                    table2: table2
                },
            }
        },
        async initShortCircuitImpedanceSec(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []
            let table2 = []
            let phases = ['A', 'B', 'C']
            let secTert = assetData.impedances.sec_tert || []

            if (secTert.length > 0) {
                secTert.forEach((e) => {
                    phases.forEach((phase) => {
                        const row1 = JSON.parse(JSON.stringify(rowDataExample))
                        const row2 = JSON.parse(JSON.stringify(rowDataExample))

                        if (row1.tap) row1.tap.value = e.oltc_position
                        if (row1.phase) row1.phase.value = phase

                        if (row2.tap) row2.tap.value = e.oltc_position
                        if (row2.phase) row2.phase.value = phase

                        table1.push(row1)
                        table2.push(row2)
                    })
                })
            }

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1,
                    table2: table2
                },
            }
        },
        async initShortCircuitImpedanceTert(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            let table1 = []
            let table2 = []
            let phases = ['A', 'B', 'C']
            let primTert = assetData.impedances.prim_tert || []

            if (primTert.length > 0) {
                primTert.forEach((e) => {
                    phases.forEach((phase) => {
                        const row1 = JSON.parse(JSON.stringify(rowDataExample))
                        const row2 = JSON.parse(JSON.stringify(rowDataExample))

                        if (row1.tap) row1.tap.value = e.oltc_position
                        if (row1.phase) row1.phase.value = phase

                        if (row2.tap) row2.tap.value = e.oltc_position
                        if (row2.phase) row2.phase.value = phase

                        table1.push(row1)
                        table2.push(row2)
                    })
                })
            }

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1,
                    table2: table2
                },
            }
        }
    }
}
