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
                    data = await this.initDcWindingPrim(testTypeCode, assetData)
                    break
                case 'DCWindingSec':
                    data = this.initDcWindingSec(testTypeCode, assetData)
                    break
                case 'DCWindingTert':
                    data = this.initDcWindingTert(testTypeCode, assetData)
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
                    data = this.initWindingDfCap(assetData)
                    break
                case 'BushingPrimC1':
                    data = await this.initBushingPrimC1(testTypeCode)
                    break
                case 'BushingPrimC2':
                    data = this.initBushingPrimC2()
                    break
                case 'BushingSecC1':
                    data = this.initBushingSecC1()
                    break
                case 'BushingSecC2':
                    data = this.initBushingSecC2()
                    break
                case 'BushingTertC1':
                    data = this.initBushingTertC1()
                    break
                case 'BushingTertC2':
                    data = this.initBushingTertC2()
                    break
                case 'ShortPrimSec':
                    data = this.initShortPrimSec()
                    break
                case 'ShortSecTert':
                    data = this.initShortSecTert()
                    break
                case 'ShortPrimTert':
                    data = this.initShortPrimTert()
                    break
                case 'Dga':
                    data = await this.initDga(testTypeCode)
                    break
                // case 'DielectricResponseAnalysis':
                //     data = await this.initDielectricResponseAnalysis(testTypeCode)
                //     break
                case 'motorCurrent':
                    data = this.initmotorCurrent()
                    break
                case 'InsulationResistanceYokeCore':
                    data = await this.initInsulationResistanceYokeCore(testTypeCode)
                    break
                case 'ShortCircuitImpedancePrim':
                    data = this.initShortCircuitImpedancePrim()
                    break
                case 'ShortCircuitImpedanceSec':
                    data = this.initShortCircuitImpedanceSec()
                    break
                case 'ShortCircuitImpedanceTert':
                    data = this.initShortCircuitImpedanceTert()
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
            console.log(assetData)

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
            console.log(assetData)

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

            let table = []
            const voltage_table = tapChangers.voltage_table || []
            const phases = ['A', 'B', 'C']

            voltage_table.forEach((element) => {
                const tap = element.tap
                const voltage = element.voltage.value

                phases.forEach((phase) => {
                    const row = JSON.parse(JSON.stringify(rowDataExample))

                    if (row.tap) row.tap.value = tap
                    if (row._voltage) row._voltage.value = voltage
                    if (row.phase) row.phase.value = phase
                    if (row._phase) row._phase.value = phase

                    table.push(row)
                })
            })

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initDcWindingPrim(testTypeCode, assetData) {
            // const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            // const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)
            // let tapChangers = assetData?.tap_changers || {}
            // if (typeof tapChangers === 'string') {
            //     try {
            //         tapChangers = JSON.parse(tapChangers)
            //     } catch (e) {
            //         tapChangers = {}
            //     }
            // }
            // let table1 = []
            // const phases = ['A', 'B', 'C']
            // if (tapChangers.mode && tapChangers.winding === this.$constant.PRIM && tapChangers.tap_scheme && tapChangers.no_of_taps) {
            //     // TRƯỜNG HỢP 1: Có bộ chuyển nấc -> Lặp qua từng nấc, từng pha
            //     const voltage_table = tapChangers.voltage_table || []
            //     voltage_table.forEach((element) => {
            //         const voltage_table_id = element.id
            //         const voltage = element.voltage
            //         const tap = element.tap
            //         phases.forEach((phase) => {
            //             // Clone template chuẩn
            //             const row = JSON.parse(JSON.stringify(rowDataExample))
            //             // Gán các thông số của Nấc và Pha vào object
            //             if (row.voltage_table_id) row.voltage_table_id.value = voltage_table_id
            //             if (row.tap) row.tap.value = tap
            //             if (row.phase) row.name.value = phase
            //             console.log(row)
            //             table1.push(row)
            //         })
            //     })
            // } else {
            //     // TRƯỜNG HỢP 2: Không có bộ chuyển nấc -> Chỉ tạo 3 dòng cho 3 pha A, B, C
            //     phases.forEach((phase) => {
            //         const row = JSON.parse(JSON.stringify(rowDataExample))
            //         if (row.phase) row.name.value = phase
            //         table1.push(row)
            //     })
            // }
            // return {
            //     rowDataExampleCondition,
            //     table: {
            //         table1: table1
            //     }
            // }
        },
        async initDcWindingSec(testTypeCode, assetData) {},
        async initDcWindingTert(testTypeCode, assetData) {},
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
            // const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            // const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)
            // let table1 = []
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
        initWindingDfCap(assetData = null) {},
        async initBushingPrimC1(testTypeCode) {
            // const rowDataExample = common.buildEmptyTestRow(transformerTestMap[testTypeCode].columns)
            // const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

            // let table1 = []

        },
        initBushingPrimC2() {},
        initBushingSecC1() {},
        initBushingSecC2() {},
        initBushingTertC1() {},
        initBushingTertC2() {},
        initShortPrimSec() {},
        initShortSecTert() {},
        initShortPrimTert() {},
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
        // async initDielectricResponseAnalysis(testTypeCode) {
        //     const rowDataExample = common.buildEmptyTestRow(testConfig.columns)
        //     const rowDataExampleCondition = common.buildEmptyTestCondition(transformerConditionMap[testTypeCode].columns)

        //     let table1 = []
            
        //     const row = JSON.parse(JSON.stringify(rowDataExample))
        //     table1.push(row)

        //     return {
        //         rowDataExampleCondition,
        //         table: {
        //             table1: table1
        //         }
        //     }
        // },
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
        initShortCircuitImpedancePrim() {},
        initShortCircuitImpedanceSec() {},
        initShortCircuitImpedanceTert() {}
    }
}
