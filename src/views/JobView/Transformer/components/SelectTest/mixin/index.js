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
                case 'DcWindingPrim':
                    data = this.initDcWindingPrim()
                    break
                case 'DcWindingSec':
                    data = this.initDcWindingSec()
                    break
                case 'DcWindingTert':
                    data = this.initDcWindingTert()
                    break
                case 'MeasurementOfNoLoad':
                    data = await this.initMeasurementOfNoLoad(testTypeCode)
                    break
                case 'MeasurementOfShortCircuit':
                    data = this.initMeasurementOfShortCircuit()
                    break
                case 'EnergyEfficiency':
                    data = this.initEnergyEfficiency()
                    break
                case 'InducedAcVoltageTests':
                    data = this.initInducedAcVoltageTests()
                    break
                case 'MeasurementOfOil':
                    data = this.initMeasurementOfOil(testTypeCode)
                    break
                case 'DimensionWeight':
                    data = this.initDimensionWeight()
                    break
                case 'TestingInstruments':
                    data = this.initTestingInstruments()
                    break
                case 'ExcitingCurrent':
                    data = this.initExcitingCurrent(assetData)
                    break
                case 'SeparateSourceAc':
                    data = this.initSeparateSourceAc()
                    break
                case 'WindingDfCap':
                    data = this.initWindingDfCap(assetData)
                    break
                case 'BushingPrimC1':
                    data = this.initBushingPrimC1()
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
                case 'DielectricResponseAnalysis':
                    data = this.initDielectricResponseAnalysis()
                    break
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
        initExcitingCurrent(assetData) {
            // const tapChangers = this.tapChangers
            const tapChangers = assetData.tap_changers || {}
            const row_data = [
                {
                    mrid: '',
                    name: 'Voltage Table ID',
                    code: 'voltage_table_id',
                    unit: '',
                    type: 'string'
                },
                {
                    mrid: '',
                    name: 'Tap',
                    code: 'tap',
                    unit: '',
                    type: 'string'
                },
                {
                    mrid: '',
                    name: 'Phase',
                    code: 'phase',
                    unit: '',
                    type: 'string'
                },
                {
                    mrid: '',
                    name: 'I Out',
                    code: 'i_out',
                    unit: 'A',
                    type: 'analog'
                },
                {
                    mrid: '',
                    name: 'Watt Losses',
                    code: 'watt_losses',
                    unit: 'W',
                    type: 'analog'
                },
                {
                    mrid: '',
                    name: 'I Ref',
                    code: 'i_ref',
                    unit: 'A',
                    type: 'analog'
                },
                {
                    mrid: '',
                    name: 'Dev %',
                    code: 'dev_per',
                    unit: '%',
                    type: 'analog'
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [
                            {mrid: '', value: 0, alias_name: 'Fail'},
                            {mrid: '', value: 1, alias_name: 'Pass'}
                        ]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition Indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [
                            {mrid: '', value: 0, alias_name: 'Bad'},
                            {mrid: '', value: 1, alias_name: 'Poor'},
                            {mrid: '', value: 2, alias_name: 'Fair'},
                            {mrid: '', value: 3, alias_name: 'Good'}
                        ]
                    }
                }
            ]
            let table = []
            const voltage_table = tapChangers.voltage_table || []
            const phases = ['A', 'B', 'C']
            voltage_table.forEach((element) => {
                const tap = element.tap
                const voltage = element.voltage
                const voltage_table_id = element.id
                phases.forEach((phase) => {
                    table.push({
                        voltage_table_id: {
                            mrid: '',
                            value: voltage_table_id,
                            unit: '',
                            type: 'string'
                        },
                        tap: {
                            mrid: '',
                            value: tap,
                            unit: '',
                            type: 'string'
                        },
                        phase: {
                            mrid: '',
                            value: phase,
                            unit: '',
                            type: 'string'
                        },
                        _phase: {
                            mrid: '',
                            value: phase,
                            unit: '',
                            type: 'string'
                        },
                        _voltage: {
                            mrid: '',
                            value: voltage,
                            unit: '',
                            type: 'analog'
                        },
                        i_out: {
                            mrid: '',
                            value: '',
                            unit: 'A',
                            type: 'analog'
                        },
                        watt_losses: {
                            mrid: '',
                            value: '',
                            unit: 'W',
                            type: 'analog'
                        },
                        assessment: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        },
                        i_ref: {
                            mrid: '',
                            value: '',
                            unit: 'A',
                            type: 'analog'
                        },
                        dev_per: {
                            mrid: '',
                            value: '',
                            unit: '%',
                            type: 'analog'
                        },
                        condition_indicator: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        }
                    })
                })
            })

            // if (!tapChangers.mode || !tapChangers.winding || !tapChangers.tap_scheme || !tapChangers.no_of_taps) {
            return {
                code: 'ExcitingCurrent',
                // top_oil_temperature: '',
                // bottom_oil_temperature: '',
                // winding_temperature: '',
                // reference_temperature: '',
                // ambient_temperature: '',
                // humidity: '',
                // weather: '',
                // model: '',
                // serial_no: '',
                // calibration_date: '',
                // comment: '',
                // table: [],
                model: '',
                serial_no: '',
                calibration_date: '',
                table,
                row_data,
                condition_indicator_setting: {
                    good: {
                        dev_per: [
                            {
                                mrid: '',
                                value: '10',
                                unit: '%',
                                type: 'analog'
                            },
                            {
                                mrid: '',
                                value: null,
                                unit: '%',
                                type: 'analog'
                            }
                        ],

                        score: {
                            mrid: '',
                            value: '3',
                            unit: '',
                            type: 'string'
                        }
                    },
                    fair: {
                        dev_per: [
                            {
                                mrid: '',
                                value: '10',
                                unit: '%',
                                type: 'analog'
                            },
                            {
                                mrid: '',
                                value: '15',
                                unit: '%',
                                type: 'analog'
                            }
                        ],

                        score: {
                            mrid: '',
                            value: '2',
                            unit: '',
                            type: 'string'
                        }
                    },
                    poor: {
                        dev_per: [
                            {
                                mrid: '',
                                value: '15',
                                unit: '%',
                                type: 'analog'
                            },
                            {
                                mrid: '',
                                value: '20',
                                unit: '%',
                                type: 'analog'
                            }
                        ],

                        score: {
                            mrid: '',
                            value: '1',
                            unit: '',
                            type: 'string'
                        }
                    },
                    bad: {
                        dev_per: [
                            {
                                mrid: '',
                                value: null,
                                unit: '%',
                                type: 'analog'
                            },
                            {
                                mrid: '',
                                value: '20',
                                unit: '%',
                                type: 'analog'
                            }
                        ],

                        score: {
                            mrid: '',
                            value: '0',
                            unit: '',
                            type: 'string'
                        }
                    }
                }
            }
            // }
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
        initDcWindingPrim() {
            const tapChangers = this.tapChangers || {}
            if (!tapChangers.mode || !tapChangers.winding || !tapChangers.tap_scheme || !tapChangers.no_of_taps) {
                return {
                    code: 'DcWindingPrim',
                    measurement_of_winding: '',
                    top_oil_temperature: '',
                    bottom_oil_temperature: '',
                    winding_temperature: '',
                    reference_temperature: '',
                    ambient_temperature: '',
                    humidity: '',
                    weather: '',
                    model: '',
                    serial_no: '',
                    calibration_date: '',
                    comment: '',
                    table: [],
                    // dữ liệu cấu hình assessment
                    assessment_setting: {
                        option: {
                            mrid: '',
                            value: 'IEEE',
                            unit: '',
                            type: 'string'
                        },
                        data: {
                            iec: {
                                error_between_phase: {
                                    mrid: '',
                                    value: '2.00',
                                    unit: '',
                                    type: 'analog'
                                },
                                error_r_ref: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            ieee: {
                                error_between_phase: {
                                    mrid: '',
                                    value: '2.00',
                                    unit: '',
                                    type: 'analog'
                                },
                                error_r_ref: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            cigre: {
                                error_between_phase: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                },
                                error_r_ref: {
                                    mrid: '',
                                    value: '1.00',
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            custom: {
                                error_between_phase: {
                                    mrid: '',
                                    value: '2.00',
                                    unit: '',
                                    type: 'analog'
                                },
                                error_r_ref: {
                                    mrid: '',
                                    value: '1.00',
                                    unit: '',
                                    type: 'analog'
                                }
                            }
                        }
                    },
                    condition_indicator_setting: {
                        good: {
                            error_between_phase: [
                                {
                                    mrid: '',
                                    value: '1',
                                    unit: '',
                                    type: 'analog'
                                },
                                {
                                    mrid: '',
                                    value: null,
                                    unit: '',
                                    type: 'analog'
                                }
                            ],
                            score: {
                                mrid: '',
                                value: '3',
                                unit: '',
                                type: 'analog'
                            }
                        },
                        fair: {
                            error_between_phase: [
                                {
                                    mrid: '',
                                    value: '1',
                                    unit: '',
                                    type: 'analog'
                                },
                                {
                                    mrid: '',
                                    value: '2',
                                    unit: '',
                                    type: 'analog'
                                }
                            ],
                            score: {
                                mrid: '',
                                value: '2',
                                unit: '',
                                type: 'analog'
                            }
                        },
                        poor: {
                            error_between_phase: [
                                {
                                    mrid: '',
                                    value: '2',
                                    unit: '',
                                    type: 'analog'
                                },
                                {
                                    mrid: '',
                                    value: '3',
                                    unit: '',
                                    type: 'analog'
                                }
                            ],
                            score: {
                                mrid: '',
                                value: '1',
                                unit: '',
                                type: 'analog'
                            }
                        },
                        bad: {
                            error_between_phase: [
                                {
                                    mrid: '',
                                    value: null,
                                    unit: '',
                                    type: 'analog'
                                },
                                {
                                    mrid: '',
                                    value: '3',
                                    unit: '',
                                    type: 'analog'
                                }
                            ],
                            score: {
                                mrid: '',
                                value: '0',
                                unit: '',
                                type: 'analog'
                            }
                        }
                    }
                }
            }

            let table = []
            const winding = tapChangers.winding
            if (winding === this.$constant.PRIM) {
                const voltage_table = tapChangers.voltage_table
                const phases = ['A', 'B', 'C']
                voltage_table.forEach((element) => {
                    const voltage_table_id = element.id
                    const voltage = element.voltage
                    const tap = element.tap
                    phases.forEach((phase) => {
                        table.push({
                            voltage_table_id: {
                                mrid: '',
                                value: voltage_table_id,
                                unit: '',
                                type: 'analog'
                            },
                            tap: {
                                mrid: '',
                                value: tap,
                                unit: '',
                                type: 'analog'
                            },
                            phase: {
                                mrid: '',
                                value: phase,
                                unit: '',
                                type: 'analog'
                            },
                            _phase: {
                                mrid: '',
                                value: phase,
                                unit: '',
                                type: 'analog'
                            },
                            _voltage: {
                                mrid: '',
                                value: voltage,
                                unit: '',
                                type: 'analog'
                            },
                            r_meas: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            r_ref: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            r_corr: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            error_between_phase: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            error_r_ref: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            mean_value: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            assessment: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            condition_indicator: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            }
                        })
                    })
                })
            } else {
                const phases = ['A', 'B', 'C']
                phases.forEach((phase) => {
                    table.push({
                        tap: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        phase: {
                            mrid: '',
                            value: phase,
                            unit: '',
                            type: 'analog'
                        },
                        _phase: {
                            mrid: '',
                            value: phase,
                            unit: '',
                            type: 'analog'
                        },
                        r_meas: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        r_ref: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        r_corr: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        error_between_phase: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        error_r_ref: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        mean_value: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        assessment: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        condition_indicator: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        }
                    })
                })
            }

            return {
                code: 'DcWindingPrim',
                measurement_of_winding: '',
                top_oil_temperature: '',
                bottom_oil_temperature: '',
                winding_temperature: '',
                reference_temperature: '',
                ambient_temperature: '',
                humidity: '',
                weather: '',
                model: '',
                serial_no: '',
                calibration_date: '',
                comment: '',
                table,
                // dữ liệu cấu hình assessment
                assessment_setting: {
                    option: {
                        mrid: '',
                        value: 'IEEE',
                        unit: '',
                        type: 'string'
                    },
                    data: {
                        iec: {
                            error_between_phase: {
                                mrid: '',
                                value: '2.00',
                                unit: '',
                                type: 'analog'
                            },
                            error_r_ref: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            }
                        },
                        ieee: {
                            error_between_phase: {
                                mrid: '',
                                value: '2.00',
                                unit: '',
                                type: 'analog'
                            },
                            error_r_ref: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            }
                        },
                        cigre: {
                            error_between_phase: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            error_r_ref: {
                                mrid: '',
                                value: '1.00',
                                unit: '',
                                type: 'analog'
                            }
                        },
                        custom: {
                            error_between_phase: {
                                mrid: '',
                                value: '2.00',
                                unit: '',
                                type: 'analog'
                            },
                            error_r_ref: {
                                mrid: '',
                                value: '1.00',
                                unit: '',
                                type: 'analog'
                            }
                        }
                    }
                },
                condition_indicator_setting: {
                    good: {
                        error_between_phase: [
                            {
                                mrid: '',
                                value: '1',
                                unit: '',
                                type: 'analog'
                            },
                            {
                                mrid: '',
                                value: null,
                                unit: '',
                                type: 'analog'
                            }
                        ],
                        score: {
                            mrid: '',
                            value: '3',
                            unit: '',
                            type: 'analog'
                        }
                    },
                    fair: {
                        error_between_phase: [
                            {
                                mrid: '',
                                value: '1',
                                unit: '',
                                type: 'analog'
                            },
                            {
                                mrid: '',
                                value: '2',
                                unit: '',
                                type: 'analog'
                            }
                        ],
                        score: {
                            mrid: '',
                            value: '2',
                            unit: '',
                            type: 'analog'
                        }
                    },
                    poor: {
                        error_between_phase: [
                            {
                                mrid: '',
                                value: '2',
                                unit: '',
                                type: 'analog'
                            },
                            {
                                mrid: '',
                                value: '3',
                                unit: '',
                                type: 'analog'
                            }
                        ],
                        score: {
                            mrid: '',
                            value: '1',
                            unit: '',
                            type: 'analog'
                        }
                    },
                    bad: {
                        error_between_phase: [
                            {
                                mrid: '',
                                value: null,
                                unit: '',
                                type: 'analog'
                            },
                            {
                                mrid: '',
                                value: '3',
                                unit: '',
                                type: 'analog'
                            }
                        ],
                        score: {
                            mrid: '',
                            value: '0',
                            unit: '',
                            type: 'analog'
                        }
                    }
                }
            }
        },
        initDcWindingSec() {
            const tapChangers = this.tapChangers || {}
            if (!tapChangers.mode || !tapChangers.winding || !tapChangers.tap_scheme || !tapChangers.no_of_taps) {
                return {
                    code: 'DcWindingSec',
                    measurement_of_winding: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    top_oil_temperature: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    bottom_oil_temperature: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    winding_temperature: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    reference_temperature: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    ambient_temperature: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    humidity: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    weather: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    model: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    serial_no: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    calibration_date: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    comment: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    table: [],
                    // dữ liệu cấu hình assessment
                    assessment_setting: {
                        option: {
                            mrid: '',
                            value: 'IEEE',
                            unit: '',
                            type: 'string'
                        },
                        data: {
                            iec: {
                                error_between_phase: {
                                    mrid: '',
                                    value: '2.00',
                                    unit: '',
                                    type: 'analog'
                                },
                                error_r_ref: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            ieee: {
                                error_between_phase: {
                                    mrid: '',
                                    value: '2.00',
                                    unit: '',
                                    type: 'analog'
                                },
                                error_r_ref: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            cigre: {
                                error_between_phase: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                },
                                error_r_ref: {
                                    mrid: '',
                                    value: '1.00',
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            custom: {
                                error_between_phase: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                },
                                error_r_ref: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                }
                            }
                        }
                    },
                    condition_indicator_setting: {
                        good: {
                            error_between_phase: [
                                {mrid: '', value: '1', unit: '', type: 'analog'},
                                {mrid: '', value: null, unit: '', type: 'analog'}
                            ],
                            score: {mrid: '', value: '3', unit: '', type: 'analog'}
                        },
                        fair: {
                            error_between_phase: [
                                {mrid: '', value: '1', unit: '', type: 'analog'},
                                {mrid: '', value: '2', unit: '', type: 'analog'}
                            ],
                            score: {mrid: '', value: '2', unit: '', type: 'analog'}
                        },
                        poor: {
                            error_between_phase: [
                                {mrid: '', value: '2', unit: '', type: 'analog'},
                                {mrid: '', value: '3', unit: '', type: 'analog'}
                            ],
                            score: {mrid: '', value: '1', unit: '', type: 'analog'}
                        },
                        bad: {
                            error_between_phase: [
                                {mrid: '', value: null, unit: '', type: 'analog'},
                                {mrid: '', value: '3', unit: '', type: 'analog'}
                            ],
                            score: {mrid: '', value: '0', unit: '', type: 'analog'}
                        }
                    }
                }
            }

            let table = []
            const winding = tapChangers.winding
            if (winding === this.$constant.SEC) {
                const voltage_table = tapChangers.voltage_table
                const phases = ['A', 'B', 'C']
                voltage_table.forEach((element) => {
                    const voltage_table_id = element.id
                    const voltage = element.voltage
                    const tap = element.tap
                    phases.forEach((phase) => {
                        table.push({
                            voltage_table_id: {
                                mrid: '',
                                value: voltage_table_id,
                                unit: '',
                                type: 'analog'
                            },
                            tap: {
                                mrid: '',
                                value: tap,
                                unit: '',
                                type: 'analog'
                            },
                            _phase: {
                                mrid: '',
                                value: phase,
                                unit: '',
                                type: 'analog'
                            },
                            _voltage: {
                                mrid: '',
                                value: voltage,
                                unit: '',
                                type: 'analog'
                            },
                            phase: {
                                mrid: '',
                                value: phase,
                                unit: '',
                                type: 'analog'
                            },
                            r_meas: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            r_ref: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            r_corr: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            error_between_phase: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            error_r_ref: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            mean_value: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            assessment: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            condition_indicator: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            }
                        })
                    })
                })
            } else {
                const phases = ['A', 'B', 'C']
                phases.forEach((phase) => {
                    table.push({
                        tap: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        phase: {
                            mrid: '',
                            value: phase,
                            unit: '',
                            type: 'analog'
                        },
                        _phase: {
                            mrid: '',
                            value: phase,
                            unit: '',
                            type: 'analog'
                        },
                        r_meas: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        r_ref: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        r_corr: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        error_between_phase: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        error_r_ref: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        mean_value: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        assessment: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        condition_indicator: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        }
                    })
                })
            }

            return {
                code: 'DcWindingSec',
                measurement_of_winding: '',
                top_oil_temperature: '',
                bottom_oil_temperature: '',
                winding_temperature: '',
                reference_temperature: '',
                ambient_temperature: '',
                humidity: '',
                weather: '',
                model: '',
                serial_no: '',
                calibration_date: '',
                comment: '',
                table,
                // dữ liệu cấu hình assessment
                assessment_setting: {
                    option: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    data: {
                        iec: {
                            error_between_phase: {
                                mrid: '',
                                value: '2.00',
                                unit: '',
                                type: 'analog'
                            },
                            error_r_ref: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            }
                        },
                        ieee: {
                            error_between_phase: {
                                mrid: '',
                                value: '2.00',
                                unit: '',
                                type: 'analog'
                            },
                            error_r_ref: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            }
                        },
                        cigre: {
                            error_between_phase: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            error_r_ref: {
                                mrid: '',
                                value: '1.00',
                                unit: '',
                                type: 'analog'
                            }
                        },
                        custom: {
                            error_between_phase: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            error_r_ref: {
                                mrid: '',
                                value: '1.00',
                                unit: '',
                                type: 'analog'
                            }
                        }
                    }
                },
                condition_indicator_setting: {
                    good: {
                        error_between_phase: [
                            {mrid: '', value: '1', unit: '', type: 'analog'},
                            {mrid: '', value: null, unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: '3',
                            unit: '',
                            type: 'analog'
                        }
                    },
                    fair: {
                        error_between_phase: [
                            {mrid: '', value: '1', unit: '', type: 'analog'},
                            {mrid: '', value: '2', unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: '2',
                            unit: '',
                            type: 'analog'
                        }
                    },
                    poor: {
                        error_between_phase: [
                            {mrid: '', value: '2', unit: '', type: 'analog'},
                            {mrid: '', value: '3', unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: '1',
                            unit: '',
                            type: 'analog'
                        }
                    },
                    bad: {
                        error_between_phase: [
                            {mrid: '', value: null, unit: '', type: 'analog'},
                            {mrid: '', value: '3', unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: '0',
                            unit: '',
                            type: 'analog'
                        }
                    }
                }
            }
        },
        initDcWindingTert() {
            const tapChangers = this.tapChangers || {}
            if (!tapChangers.mode || !tapChangers.winding || !tapChangers.tap_scheme || !tapChangers.no_of_taps) {
                return {
                    code: 'DcWindingTert',
                    measurement_of_winding: '',
                    top_oil_temperature: '',
                    bottom_oil_temperature: '',
                    winding_temperature: '',
                    reference_temperature: '',
                    ambient_temperature: '',
                    humidity: '',
                    weather: '',
                    model: '',
                    serial_no: '',
                    calibration_date: '',
                    comment: '',
                    table: [],
                    // dữ liệu cấu hình assessment
                    assessment_setting: {
                        option: {
                            mrid: '',
                            value: 'IEEE',
                            unit: '',
                            type: 'string'
                        },
                        data: {
                            iec: {
                                error_between_phase: {
                                    mrid: '',
                                    value: '2.00',
                                    unit: '',
                                    type: 'analog'
                                },
                                error_r_ref: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            ieee: {
                                error_between_phase: {
                                    mrid: '',
                                    value: '2.00',
                                    unit: '',
                                    type: 'analog'
                                },
                                error_r_ref: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            cigre: {
                                error_between_phase: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                },
                                error_r_ref: {
                                    mrid: '',
                                    value: '1.00',
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            custom: {
                                error_between_phase: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                },
                                error_r_ref: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                }
                            }
                        }
                    },
                    condition_indicator_setting: {
                        good: {
                            error_between_phase: [
                                {mrid: '', value: '1', unit: '', type: 'analog'},
                                {mrid: '', value: null, unit: '', type: 'analog'}
                            ],
                            score: {mrid: '', value: '3', unit: '', type: 'analog'}
                        },
                        fair: {
                            error_between_phase: [
                                {mrid: '', value: '1', unit: '', type: 'analog'},
                                {mrid: '', value: '2', unit: '', type: 'analog'}
                            ],
                            score: {mrid: '', value: '2', unit: '', type: 'analog'}
                        },
                        poor: {
                            error_between_phase: [
                                {mrid: '', value: '2', unit: '', type: 'analog'},
                                {mrid: '', value: '3', unit: '', type: 'analog'}
                            ],
                            score: {mrid: '', value: '1', unit: '', type: 'analog'}
                        },
                        bad: {
                            error_between_phase: [
                                {mrid: '', value: null, unit: '', type: 'analog'},
                                {mrid: '', value: '3', unit: '', type: 'analog'}
                            ],
                            score: {mrid: '', value: '0', unit: '', type: 'analog'}
                        }
                    }
                }
            }

            let table = []
            const winding = tapChangers.winding
            if (winding === this.$constant.TERT) {
                const voltage_table = tapChangers.voltage_table
                const phases = ['A', 'B', 'C']
                voltage_table.forEach((element) => {
                    const voltage_table_id = element.id
                    const tap = element.tap
                    phases.forEach((phase) => {
                        table.push({
                            voltage_table_id: {
                                mrid: '',
                                value: voltage_table_id,
                                unit: '',
                                type: 'analog'
                            },
                            tap: {
                                mrid: '',
                                value: tap,
                                unit: '',
                                type: 'analog'
                            },
                            _phase: {
                                mrid: '',
                                value: phase,
                                unit: '',
                                type: 'string'
                            },
                            phase: {
                                mrid: '',
                                value: phase,
                                unit: '',
                                type: 'string'
                            },
                            r_meas: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            r_ref: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            r_corr: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            error_between_phase: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            error_r_ref: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            mean_value: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            assessment: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'string'
                            },
                            condition_indicator: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'string'
                            }
                        })
                    })
                })
            } else {
                const phases = ['A', 'B', 'C']
                phases.forEach((phase) => {
                    table.push({
                        tap: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        phase: {
                            mrid: '',
                            value: phase,
                            unit: '',
                            type: 'string'
                        },
                        _phase: {
                            mrid: '',
                            value: phase,
                            unit: '',
                            type: 'string'
                        },
                        r_meas: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        r_ref: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        r_corr: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        error_between_phase: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        error_r_ref: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        mean_value: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        assessment: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'string'
                        },
                        condition_indicator: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'string'
                        }
                    })
                })
            }

            return {
                code: 'DcWindingTert',
                measurement_of_winding: '',
                top_oil_temperature: '',
                bottom_oil_temperature: '',
                winding_temperature: '',
                reference_temperature: '',
                ambient_temperature: '',
                humidity: '',
                weather: '',
                model: '',
                serial_no: '',
                calibration_date: '',
                comment: '',
                table,
                // dữ liệu cấu hình assessment
                assessment_setting: {
                    option: {
                        mrid: '',
                        value: 'IEEE',
                        unit: '',
                        type: 'string'
                    },
                    data: {
                        iec: {
                            error_between_phase: {
                                mrid: '',
                                value: '2.00',
                                unit: '',
                                type: 'analog'
                            },
                            error_r_ref: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            }
                        },
                        ieee: {
                            error_between_phase: {
                                mrid: '',
                                value: '2.00',
                                unit: '',
                                type: 'analog'
                            },
                            error_r_ref: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            }
                        },
                        cigre: {
                            error_between_phase: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            error_r_ref: {
                                mrid: '',
                                value: '1.00',
                                unit: '',
                                type: 'analog'
                            }
                        },
                        custom: {
                            error_between_phase: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            },
                            error_r_ref: {
                                mrid: '',
                                value: '',
                                unit: '',
                                type: 'analog'
                            }
                        }
                    }
                },

                condition_indicator_setting: {
                    good: {
                        error_between_phase: [
                            {mrid: '', value: '1', unit: '', type: 'analog'},
                            {mrid: '', value: null, unit: '', type: 'analog'}
                        ],
                        score: {mrid: '', value: '3', unit: '', type: 'analog'}
                    },
                    fair: {
                        error_between_phase: [
                            {mrid: '', value: '1', unit: '', type: 'analog'},
                            {mrid: '', value: '2', unit: '', type: 'analog'}
                        ],
                        score: {mrid: '', value: '2', unit: '', type: 'analog'}
                    },
                    poor: {
                        error_between_phase: [
                            {mrid: '', value: '2', unit: '', type: 'analog'},
                            {mrid: '', value: '3', unit: '', type: 'analog'}
                        ],
                        score: {mrid: '', value: '1', unit: '', type: 'analog'}
                    },
                    bad: {
                        error_between_phase: [
                            {mrid: '', value: null, unit: '', type: 'analog'},
                            {mrid: '', value: '3', unit: '', type: 'analog'}
                        ],
                        score: {mrid: '', value: '0', unit: '', type: 'analog'}
                    }
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
        initMeasurementOfShortCircuit() {
            return {
                code: 'MeasurementOfShortCircuit',
                load_loss: {
                    result: {mrid: '', value: '', unit: '', type: 'analog'},
                    standard: {mrid: '', value: '', unit: '', type: 'analog'},
                    assessment: {mrid: '', value: '', unit: '', type: 'string'}
                },

                short_circuit_impedance: {
                    result: {mrid: '', value: '', unit: '', type: 'analog'},
                    standard: {mrid: '', value: '', unit: '', type: 'analog'},
                    assessment: {mrid: '', value: '', unit: '', type: 'string'}
                }
            }
        },
        initEnergyEfficiency() {
            return {
                code: 'EnergyEfficiency',
                hv1: {
                    e50: {mrid: '', value: '3', unit: '', type: 'analog'},
                    standard: {mrid: '', value: '3', unit: '', type: 'analog'},
                    assessment: {mrid: '', value: 'Pass', unit: '', type: 'string'}
                },

                hv2: {
                    e50: {mrid: '', value: '33', unit: '', type: 'analog'},
                    standard: {mrid: '', value: '33', unit: '', type: 'analog'},
                    assessment: {mrid: '', value: 'Pass', unit: '', type: 'string'}
                }
            }
        },
        initSeparateSourceAc() {
            return {
                code: 'SeparateSourceAc',
                x_hv: {
                    test_voltage: {mrid: '', value: '3', unit: '', type: 'analog'},
                    assessment: {mrid: '', value: 'Pass', unit: '', type: 'string'}
                },

                lv: {
                    test_voltage: {mrid: '', value: '3', unit: '', type: 'analog'},
                    assessment: {mrid: '', value: 'Pass', unit: '', type: 'string'}
                }
            }
        },
        initInducedAcVoltageTests() {
            return {
                code: 'InducedAcVoltageTests',
                dataList: [
                    {
                        terminal: {mrid: '', value: '1', unit: '', type: 'string'},
                        ratedVoltage: {mrid: '', value: '2', unit: '', type: 'string'},
                        Lv: {
                            terminal: {mrid: '', value: '2', unit: '', type: 'string'},
                            testedVoltage: {mrid: '', value: '3', unit: '', type: 'string'}
                        },
                        Hv: {
                            terminal: {mrid: '', value: '1', unit: '', type: 'string'},
                            testedVoltage: {mrid: '', value: '2', unit: '', type: 'string'}
                        },
                        assessment: {mrid: '', value: 'Pass', unit: '', type: 'string'},
                        condition_indicator: {mrid: '', value: '4', unit: '', type: 'string'}
                    }
                ]
            }
        },
        initMeasurementOfOil(testTypeCode) {
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
        initDimensionWeight() {
            return {
                code: 'DimensionWeight',
                table: {
                    dimension: {
                        a: {mrid: '', value: '', unit: '', type: 'analog'},
                        b: {mrid: '', value: '', unit: '', type: 'analog'},
                        c: {mrid: '', value: '', unit: '', type: 'analog'},
                        n: {mrid: '', value: '', unit: '', type: 'analog'}
                    },
                    weight: {
                        oil: {mrid: '', value: '', unit: '', type: 'analog'},
                        active: {mrid: '', value: '', unit: '', type: 'analog'},
                        total: {mrid: '', value: '', unit: '', type: 'analog'}
                    }
                }
            }
        },
        initTestingInstruments() {
            return {
                code: 'TestingInstruments',
                dataList: [
                    {
                        no: {mrid: '', value: '1', unit: '', type: 'analog'},
                        testingInstrument: {mrid: '', value: 'Transformer Turns Ratio Tester', unit: '', type: 'string'},
                        type_ins: {mrid: '', value: 'Type A', unit: '', type: 'string'}
                    }
                ]
            }
        },
        initWindingDfCap(assetData = null) {
            const selectedAsset = this.selectedAsset || []
            const asset = assetData || selectedAsset[0] || {}
            const dataTwoWinding = ['CH+CHL', 'CH', 'CHL', 'CL', 'CL+CHL']
            const dataThreeWinding = [
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
            const dataTert = ['CH+CHT', 'CH', 'CHT', 'CT', 'CT+CHT']
            var table = []
            if (asset.asset_type == 'Three-winding') {
                dataThreeWinding.forEach((element) => {
                    table.push({
                        measurement: element, // element có thể giữ nguyên
                        test_mode: {mrid: '', value: '', unit: '', type: 'string'},
                        test_voltage: {mrid: '', value: '', unit: '', type: 'analog'},
                        df_ref: {mrid: '', value: '', unit: '', type: 'analog'},
                        c_ref: {mrid: '', value: '', unit: '', type: 'analog'},
                        df_meas: {mrid: '', value: '', unit: '', type: 'analog'},
                        c_meas: {mrid: '', value: '', unit: '', type: 'analog'},
                        df_change: {mrid: '', value: '', unit: '', type: 'analog'},
                        tri_c_meas: {mrid: '', value: '', unit: '', type: 'analog'},
                        assessment: {mrid: '', value: '', unit: '', type: 'string'},
                        condition_indicator_df: {mrid: '', value: '', unit: '', type: 'string'},
                        condition_indicator_c: {mrid: '', value: '', unit: '', type: 'string'}
                    })
                })
            } else if (asset.asset_type == 'Two-winding') {
                dataTwoWinding.forEach((element) => {
                    table.push({
                        measurement: element, // element giữ nguyên
                        test_mode: {mrid: '', value: '', unit: '', type: 'string'},
                        test_voltage: {mrid: '', value: '', unit: '', type: 'analog'},
                        df_ref: {mrid: '', value: '', unit: '', type: 'analog'},
                        c_ref: {mrid: '', value: '', unit: '', type: 'analog'},
                        df_meas: {mrid: '', value: '', unit: '', type: 'analog'},
                        c_meas: {mrid: '', value: '', unit: '', type: 'analog'},
                        df_change: {mrid: '', value: '', unit: '', type: 'analog'},
                        tri_c_meas: {mrid: '', value: '', unit: '', type: 'analog'},
                        assessment: {mrid: '', value: '', unit: '', type: 'string'},
                        condition_indicator_df: {mrid: '', value: '', unit: '', type: 'string'},
                        condition_indicator_c: {mrid: '', value: '', unit: '', type: 'string'}
                    })
                })
            } else {
                dataTert.forEach((element) => {
                    table.push({
                        measurement: element, // giữ nguyên
                        test_mode: {mrid: '', value: '', unit: '', type: 'string'},
                        test_voltage: {mrid: '', value: '', unit: '', type: 'analog'},
                        df_ref: {mrid: '', value: '', unit: '', type: 'analog'},
                        c_ref: {mrid: '', value: '', unit: '', type: 'analog'},
                        df_meas: {mrid: '', value: '', unit: '', type: 'analog'},
                        c_meas: {mrid: '', value: '', unit: '', type: 'analog'},
                        df_change: {mrid: '', value: '', unit: '', type: 'analog'},
                        tri_c_meas: {mrid: '', value: '', unit: '', type: 'analog'},
                        assessment: {mrid: '', value: '', unit: '', type: 'string'},
                        condition_indicator_df: {mrid: '', value: '', unit: '', type: 'string'},
                        condition_indicator_c: {mrid: '', value: '', unit: '', type: 'string'}
                    })
                })
            }
            return {
                code: 'WindingDfCap',
                option: asset.insulation_medium || '',
                top_oil_temperature: '',
                bottom_oil_temperature: '',
                winding_temperature: '',
                reference_temperature: '',
                ambient_temperature: '',
                humidity: '',
                weather: '',
                model: '',
                serial_no: '',
                calibration_date: '',
                comment: '',
                table: table,
                // dữ liệu cấu hình assessment
                assessment_setting: {
                    option: {mrid: '', value: 'IEEEnewLiquid', unit: '', type: 'string'},
                    data: {
                        IEEEnewLiquid: {
                            mineral: {
                                celc25: {
                                    df_meas: {mrid: '', value: 0.05, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                },
                                celc100: {
                                    df_meas: {mrid: '', value: 0.4, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                }
                            },
                            lfh: {
                                celc25: {
                                    df_meas: {mrid: '', value: 0.1, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                },
                                celc100: {
                                    df_meas: {mrid: '', value: 1, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                }
                            },
                            silicone: {
                                celc25: {
                                    df_meas: {mrid: '', value: 0.1, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                },
                                celc100: {
                                    df_meas: {mrid: '', value: '-', unit: '', type: 'string'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                }
                            },
                            naturalEaster: {
                                celc25: {
                                    df_meas: {mrid: '', value: 0.5, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                },
                                celc100: {
                                    df_meas: {mrid: '', value: '-', unit: '', type: 'string'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                }
                            }
                        },
                        IEEEserviceLiquid: {
                            mineral: {
                                celc25: {
                                    df_meas: {mrid: '', value: 0.5, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                },
                                celc100: {
                                    df_meas: {mrid: '', value: 5, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                }
                            },
                            lfh: {
                                celc25: {
                                    df_meas: {mrid: '', value: 1, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                },
                                celc100: {
                                    df_meas: {mrid: '', value: '-', unit: '', type: 'string'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                }
                            },
                            silicone: {
                                celc25: {
                                    df_meas: {mrid: '', value: 0.2, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                },
                                celc100: {
                                    df_meas: {mrid: '', value: '-', unit: '', type: 'string'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                }
                            },
                            naturalEaster: {
                                celc25: {
                                    df_meas: {mrid: '', value: 0.5, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                },
                                celc100: {
                                    df_meas: {mrid: '', value: '-', unit: '', type: 'string'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                }
                            }
                        },
                        cigre: {
                            df_meas: {mrid: '', value: 0.5, unit: '', type: 'analog'}
                        },
                        custom: {
                            df_meas: {mrid: '', value: 0.5, unit: '', type: 'analog'},
                            tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                        }
                    }
                },
                // dữ liệu cấu hình indicator
                condition_indicator_df: {
                    good: {
                        df_meas: [
                            {mrid: '', value: '0.5', unit: '', type: 'analog'},
                            {mrid: '', value: null, unit: '', type: 'analog'}
                        ],
                        score: {mrid: '', value: '3', unit: '', type: 'analog'}
                    },
                    fair: {
                        df_meas: [
                            {mrid: '', value: '0.5', unit: '', type: 'analog'},
                            {mrid: '', value: '1', unit: '', type: 'analog'}
                        ],
                        score: {mrid: '', value: '2', unit: '', type: 'analog'}
                    },
                    poor: {
                        df_meas: [
                            {mrid: '', value: '1', unit: '', type: 'analog'},
                            {mrid: '', value: '1.5', unit: '', type: 'analog'}
                        ],
                        score: {mrid: '', value: '1', unit: '', type: 'analog'}
                    },
                    bad: {
                        df_meas: [
                            {mrid: '', value: null, unit: '', type: 'analog'},
                            {mrid: '', value: '1.5', unit: '', type: 'analog'}
                        ],
                        score: {mrid: '', value: '0', unit: '', type: 'analog'}
                    }
                },
                // dữ liệu cấu hình indicator C
                condition_indicator_c: {
                    good: {
                        tri_c_meas: [
                            {mrid: '', value: '5', unit: '', type: 'analog'},
                            {mrid: '', value: null, unit: '', type: 'analog'}
                        ],
                        score: {mrid: '', value: '3', unit: '', type: 'analog'}
                    },
                    fair: {
                        tri_c_meas: [
                            {mrid: '', value: '5', unit: '', type: 'analog'},
                            {mrid: '', value: '7', unit: '', type: 'analog'}
                        ],
                        score: {mrid: '', value: '2', unit: '', type: 'analog'}
                    },
                    poor: {
                        tri_c_meas: [
                            {mrid: '', value: '7', unit: '', type: 'analog'},
                            {mrid: '', value: '10', unit: '', type: 'analog'}
                        ],
                        score: {mrid: '', value: '1', unit: '', type: 'analog'}
                    },
                    bad: {
                        tri_c_meas: [
                            {mrid: '', value: null, unit: '', type: 'analog'},
                            {mrid: '', value: '10', unit: '', type: 'analog'}
                        ],
                        score: {mrid: '', value: '0', unit: '', type: 'analog'}
                    }
                }
            }
        },
        initBushingPrimC1() {
            const bushings = this.bushings || {}
            const data = bushings.asset_type || {}
            if (!data.DataShow) {
                return {
                    code: 'BushingPrimC1',
                    top_oil_temperature: '',
                    bottom_oil_temperature: '',
                    winding_temperature: '',
                    reference_temperature: '',
                    ambient_temperature: '',
                    humidity: '',
                    weather: '',
                    model: '',
                    serial_no: '',
                    calibration_date: '',
                    comment: '',
                    table: [],
                    assessment_setting: {
                        option: {
                            mrid: '',
                            value: 'Custom',
                            unit: '',
                            type: 'string'
                        },
                        data: {
                            iec: {
                                oip: {
                                    df_meas: {mrid: '', value: 0.7, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                },
                                rip: {
                                    df_meas: {mrid: '', value: 0.7, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                },
                                rbp: {
                                    df_meas: {mrid: '', value: 1.5, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                }
                            },
                            ieee: {
                                oip: {
                                    df_meas: {mrid: '', value: 0.5, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                },
                                rip: {
                                    df_meas: {mrid: '', value: 0.85, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                },
                                rbp: {
                                    df_meas: {mrid: '', value: 2, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                }
                            },
                            custom: {
                                oip: {
                                    df_meas: {mrid: '', value: 0.5, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                },
                                rip: {
                                    df_meas: {mrid: '', value: 0.85, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                },
                                rbp: {
                                    df_meas: {mrid: '', value: 2, unit: '', type: 'analog'},
                                    tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}
                                }
                            }
                        }
                    },
                    condition_indicator_df: {
                        good: {
                            df_meas: [
                                {mrid: '', value: '0.4', unit: '', type: 'analog'},
                                {mrid: '', value: null, unit: '', type: 'analog'}
                            ],
                            df_change: [
                                {mrid: '', value: '1.3', unit: '', type: 'analog'},
                                {mrid: '', value: null, unit: '', type: 'analog'}
                            ],
                            score: {mrid: '', value: '3', unit: '', type: 'string'}
                        },
                        fair: {
                            df_meas: [
                                {mrid: '', value: '0.4', unit: '', type: 'analog'},
                                {mrid: '', value: '0.7', unit: '', type: 'analog'}
                            ],
                            df_change: [
                                {mrid: '', value: '1.3', unit: '', type: 'analog'},
                                {mrid: '', value: '2', unit: '', type: 'analog'}
                            ],
                            score: {mrid: '', value: '2', unit: '', type: 'string'}
                        },
                        poor: {
                            df_meas: [
                                {mrid: '', value: '0.7', unit: '', type: 'analog'},
                                {mrid: '', value: '1', unit: '', type: 'analog'}
                            ],
                            df_change: [
                                {mrid: '', value: '2', unit: '', type: 'analog'},
                                {mrid: '', value: '3', unit: '', type: 'analog'}
                            ],
                            score: {mrid: '', value: '1', unit: '', type: 'string'}
                        },
                        bad: {
                            df_meas: [
                                {mrid: '', value: null, unit: '', type: 'analog'},
                                {mrid: '', value: '1', unit: '', type: 'analog'}
                            ],
                            df_change: [
                                {mrid: '', value: null, unit: '', type: 'analog'},
                                {mrid: '', value: '3', unit: '', type: 'analog'}
                            ],
                            score: {mrid: '', value: '0', unit: '', type: 'string'}
                        }
                    },

                    condition_indicator_c: {
                        good: {
                            tri_c_meas: [
                                {mrid: '', value: '5', unit: '', type: 'analog'},
                                {mrid: '', value: null, unit: '', type: 'analog'}
                            ],
                            score: {mrid: '', value: '3', unit: '', type: 'string'}
                        },
                        fair: {
                            tri_c_meas: [
                                {mrid: '', value: '5', unit: '', type: 'analog'},
                                {mrid: '', value: '7', unit: '', type: 'analog'}
                            ],
                            score: {mrid: '', value: '2', unit: '', type: 'string'}
                        },
                        poor: {
                            tri_c_meas: [
                                {mrid: '', value: '7', unit: '', type: 'analog'},
                                {mrid: '', value: '10', unit: '', type: 'analog'}
                            ],
                            score: {mrid: '', value: '1', unit: '', type: 'string'}
                        },
                        bad: {
                            tri_c_meas: [
                                {mrid: '', value: null, unit: '', type: 'analog'},
                                {mrid: '', value: '10', unit: '', type: 'analog'}
                            ],
                            score: {mrid: '', value: '0', unit: '', type: 'string'}
                        }
                    }
                }
            }
            let table = []
            Object.keys(data.DataShow).forEach((element) => {
                Object.keys(data.DataShow[element]).forEach((e) => {
                    if (data.DataShow[element][e] === true) {
                        if (data[element][e].toString()) {
                            if (data[element][e].toString() !== 'Without tap') {
                                let temp = {
                                    measurement: {
                                        mrid: '',
                                        value: data.NameOfPos[element][e],
                                        unit: '',
                                        type: 'analog'
                                    },
                                    df_ref: {
                                        mrid: '',
                                        value: (bushings.df_c1 && bushings.df_c1[element] && bushings.df_c1[element][e]) || '',
                                        unit: '',
                                        type: 'analog'
                                    },
                                    c_ref: {
                                        mrid: '',
                                        value: (bushings.cap_c1 && bushings.cap_c1[element] && bushings.cap_c1[element][e]) || '',
                                        unit: '',
                                        type: 'analog'
                                    },
                                    insulation: {
                                        mrid: '',
                                        value: (bushings.insulation_type && bushings.insulation_type[element] && bushings.insulation_type[element][e]) || '',
                                        unit: '',
                                        type: 'analog'
                                    },
                                    test_voltage: {
                                        mrid: '',
                                        value: '',
                                        unit: '',
                                        type: 'analog'
                                    },
                                    df_meas: {
                                        mrid: '',
                                        value: '',
                                        unit: '',
                                        type: 'analog'
                                    },
                                    c_meas: {
                                        mrid: '',
                                        value: '',
                                        unit: '',
                                        type: 'analog'
                                    },
                                    df_change: {
                                        mrid: '',
                                        value: '',
                                        unit: '',
                                        type: 'analog'
                                    },
                                    test_mode: {
                                        mrid: '',
                                        value: '',
                                        unit: '',
                                        type: 'analog'
                                    },
                                    tri_c_meas: {
                                        mrid: '',
                                        value: '',
                                        unit: '',
                                        type: 'analog'
                                    },

                                    assessment: {
                                        mrid: '',
                                        value: '',
                                        unit: '',
                                        type: 'analog'
                                    },

                                    condition_indicator_df: {
                                        mrid: '',
                                        value: '',
                                        unit: '',
                                        type: 'analog'
                                    },
                                    condition_indicator_c: {
                                        mrid: '',
                                        value: '',
                                        unit: '',
                                        type: 'analog'
                                    }
                                }
                                table.push(temp)
                            }
                        }
                    }
                })
            })
            return {
                code: 'BushingPrimC1',
                top_oil_temperature: '',
                bottom_oil_temperature: '',
                winding_temperature: '',
                reference_temperature: '',
                ambient_temperature: '',
                humidity: '',
                weather: '',
                model: '',
                serial_no: '',
                calibration_date: '',
                comment: '',
                table: table,
                // dữ liệu cấu hình assessment
                assessment_setting: {
                    option: {mrid: '', value: 'Custom', unit: '', type: 'string'},
                    data: {
                        iec: {
                            oip: {df_meas: {mrid: '', value: 0.7, unit: '', type: 'analog'}, tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}},
                            rip: {df_meas: {mrid: '', value: 0.7, unit: '', type: 'analog'}, tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}},
                            rbp: {df_meas: {mrid: '', value: 1.5, unit: '', type: 'analog'}, tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}}
                        },
                        ieee: {
                            oip: {df_meas: {mrid: '', value: 0.5, unit: '', type: 'analog'}, tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}},
                            rip: {df_meas: {mrid: '', value: 0.85, unit: '', type: 'analog'}, tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}},
                            rbp: {df_meas: {mrid: '', value: 2, unit: '', type: 'analog'}, tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}}
                        },
                        custom: {
                            oip: {df_meas: {mrid: '', value: 0.5, unit: '', type: 'analog'}, tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}},
                            rip: {df_meas: {mrid: '', value: 0.85, unit: '', type: 'analog'}, tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}},
                            rbp: {df_meas: {mrid: '', value: 2, unit: '', type: 'analog'}, tri_c_meas: {mrid: '', value: 5, unit: '', type: 'analog'}}
                        }
                    }
                },

                condition_indicator_df: {
                    good: {
                        df_meas: [
                            {mrid: '', value: '0.4', unit: '', type: 'analog'},
                            {mrid: '', value: '', unit: '', type: 'analog'}
                        ],
                        df_change: [
                            {mrid: '', value: '1.3', unit: '', type: 'analog'},
                            {mrid: '', value: '', unit: '', type: 'analog'}
                        ],
                        score: '3'
                    },
                    fair: {
                        df_meas: [
                            {mrid: '', value: '0.4', unit: '', type: 'analog'},
                            {mrid: '', value: '0.7', unit: '', type: 'analog'}
                        ],
                        df_change: [
                            {mrid: '', value: '1.3', unit: '', type: 'analog'},
                            {mrid: '', value: '2', unit: '', type: 'analog'}
                        ],
                        score: '2'
                    },
                    poor: {
                        df_meas: [
                            {mrid: '', value: '0.7', unit: '', type: 'analog'},
                            {mrid: '', value: '1', unit: '', type: 'analog'}
                        ],
                        df_change: [
                            {mrid: '', value: '2', unit: '', type: 'analog'},
                            {mrid: '', value: '3', unit: '', type: 'analog'}
                        ],
                        score: '1'
                    },
                    bad: {
                        df_meas: [
                            {mrid: '', value: '', unit: '', type: 'analog'},
                            {mrid: '', value: '1', unit: '', type: 'analog'}
                        ],
                        df_change: [
                            {mrid: '', value: '', unit: '', type: 'analog'},
                            {mrid: '', value: '3', unit: '', type: 'analog'}
                        ],
                        score: '0'
                    }
                },

                condition_indicator_c: {
                    good: {
                        tri_c_meas: [
                            {mrid: '', value: '5', unit: '', type: 'analog'},
                            {mrid: '', value: '', unit: '', type: 'analog'}
                        ],
                        score: '3'
                    },
                    fair: {
                        tri_c_meas: [
                            {mrid: '', value: '5', unit: '', type: 'analog'},
                            {mrid: '', value: '7', unit: '', type: 'analog'}
                        ],
                        score: '2'
                    },
                    poor: {
                        tri_c_meas: [
                            {mrid: '', value: '7', unit: '', type: 'analog'},
                            {mrid: '', value: '10', unit: '', type: 'analog'}
                        ],
                        score: '1'
                    },
                    bad: {
                        tri_c_meas: [
                            {mrid: '', value: '', unit: '', type: 'analog'},
                            {mrid: '', value: '10', unit: '', type: 'analog'}
                        ],
                        score: '0'
                    }
                }
            }
        },
        initBushingPrimC2() {
            const bushings = this.bushings || {}
            const data = bushings.asset_type || {}
            if (!data.DataShow) {
                return {
                    code: 'BushingPrimC2',
                    top_oil_temperature: '',
                    bottom_oil_temperature: '',
                    winding_temperature: '',
                    reference_temperature: '',
                    ambient_temperature: '',
                    humidity: '',
                    weather: '',
                    model: '',
                    serial_no: '',
                    calibration_date: '',
                    comment: '',
                    table: [],
                    assessment_setting: {
                        option: {
                            mrid: '',
                            value: 'Custom',
                            unit: '',
                            type: 'string'
                        },
                        data: {
                            iec: {
                                oip: {
                                    df_meas: {
                                        mrid: '',
                                        value: 0.7,
                                        unit: '',
                                        type: 'analog'
                                    },
                                    tri_c_meas: {
                                        mrid: '',
                                        value: 5,
                                        unit: '',
                                        type: 'analog'
                                    }
                                },
                                rip: {
                                    df_meas: {
                                        mrid: '',
                                        value: 0.7,
                                        unit: '',
                                        type: 'analog'
                                    },
                                    tri_c_meas: {
                                        mrid: '',
                                        value: 5,
                                        unit: '',
                                        type: 'analog'
                                    }
                                },
                                rbp: {
                                    df_meas: {
                                        mrid: '',
                                        value: 1.5,
                                        unit: '',
                                        type: 'analog'
                                    },
                                    tri_c_meas: {
                                        mrid: '',
                                        value: 5,
                                        unit: '',
                                        type: 'analog'
                                    }
                                }
                            },
                            ieee: {
                                oip: {
                                    df_meas: {
                                        mrid: '',
                                        value: 0.5,
                                        unit: '',
                                        type: 'analog'
                                    },
                                    tri_c_meas: {
                                        mrid: '',
                                        value: 5,
                                        unit: '',
                                        type: 'analog'
                                    }
                                },
                                rip: {
                                    df_meas: {
                                        mrid: '',
                                        value: 0.85,
                                        unit: '',
                                        type: 'analog'
                                    },
                                    tri_c_meas: {
                                        mrid: '',
                                        value: 5,
                                        unit: '',
                                        type: 'analog'
                                    }
                                },
                                rbp: {
                                    df_meas: {
                                        mrid: '',
                                        value: 2,
                                        unit: '',
                                        type: 'analog'
                                    },
                                    tri_c_meas: {
                                        mrid: '',
                                        value: 5,
                                        unit: '',
                                        type: 'analog'
                                    }
                                }
                            },
                            custom: {
                                oip: {
                                    df_meas: {
                                        mrid: '',
                                        value: 0.5,
                                        unit: '',
                                        type: 'analog'
                                    },
                                    tri_c_meas: {
                                        mrid: '',
                                        value: 5,
                                        unit: '',
                                        type: 'analog'
                                    }
                                },
                                rip: {
                                    df_meas: {
                                        mrid: '',
                                        value: 0.85,
                                        unit: '',
                                        type: 'analog'
                                    },
                                    tri_c_meas: {
                                        mrid: '',
                                        value: 5,
                                        unit: '',
                                        type: 'analog'
                                    }
                                },
                                rbp: {
                                    df_meas: {
                                        mrid: '',
                                        value: 2,
                                        unit: '',
                                        type: 'analog'
                                    },
                                    tri_c_meas: {
                                        mrid: '',
                                        value: 5,
                                        unit: '',
                                        type: 'analog'
                                    }
                                }
                            }
                        }
                    },
                    condition_indicator_df: {
                        good: {
                            df_meas: [
                                {mrid: '', value: '0.4', unit: '', type: 'analog'},
                                {mrid: '', value: null, unit: '', type: 'analog'}
                            ],
                            df_change: [
                                {mrid: '', value: '1.3', unit: '', type: 'analog'},
                                {mrid: '', value: null, unit: '', type: 'analog'}
                            ],
                            score: {
                                mrid: '',
                                value: '3',
                                unit: '',
                                type: 'string'
                            }
                        },
                        fair: {
                            df_meas: [
                                {mrid: '', value: '0.4', unit: '', type: 'analog'},
                                {mrid: '', value: '0.7', unit: '', type: 'analog'}
                            ],
                            df_change: [
                                {mrid: '', value: '1.3', unit: '', type: 'analog'},
                                {mrid: '', value: '2', unit: '', type: 'analog'}
                            ],
                            score: {
                                mrid: '',
                                value: '2',
                                unit: '',
                                type: 'string'
                            }
                        },
                        poor: {
                            df_meas: [
                                {mrid: '', value: '0.7', unit: '', type: 'analog'},
                                {mrid: '', value: '1', unit: '', type: 'analog'}
                            ],
                            df_change: [
                                {mrid: '', value: '2', unit: '', type: 'analog'},
                                {mrid: '', value: '3', unit: '', type: 'analog'}
                            ],
                            score: {
                                mrid: '',
                                value: '1',
                                unit: '',
                                type: 'string'
                            }
                        },
                        bad: {
                            df_meas: [
                                {mrid: '', value: null, unit: '', type: 'analog'},
                                {mrid: '', value: '1', unit: '', type: 'analog'}
                            ],
                            df_change: [
                                {mrid: '', value: null, unit: '', type: 'analog'},
                                {mrid: '', value: '3', unit: '', type: 'analog'}
                            ],
                            score: {
                                mrid: '',
                                value: '0',
                                unit: '',
                                type: 'string'
                            }
                        }
                    },
                    condition_indicator_c: {
                        good: {
                            tri_c_meas: [
                                {mrid: '', value: '5', unit: '', type: 'analog'},
                                {mrid: '', value: null, unit: '', type: 'analog'}
                            ],
                            score: {
                                mrid: '',
                                value: '3',
                                unit: '',
                                type: 'string'
                            }
                        },
                        fair: {
                            tri_c_meas: [
                                {mrid: '', value: '5', unit: '', type: 'analog'},
                                {mrid: '', value: '7', unit: '', type: 'analog'}
                            ],
                            score: {
                                mrid: '',
                                value: '2',
                                unit: '',
                                type: 'string'
                            }
                        },
                        poor: {
                            tri_c_meas: [
                                {mrid: '', value: '7', unit: '', type: 'analog'},
                                {mrid: '', value: '10', unit: '', type: 'analog'}
                            ],
                            score: {
                                mrid: '',
                                value: '1',
                                unit: '',
                                type: 'string'
                            }
                        },
                        bad: {
                            tri_c_meas: [
                                {mrid: '', value: null, unit: '', type: 'analog'},
                                {mrid: '', value: '10', unit: '', type: 'analog'}
                            ],
                            score: {
                                mrid: '',
                                value: '0',
                                unit: '',
                                type: 'string'
                            }
                        }
                    }
                }
            }
            let table = []
            Object.keys(data.DataShow).forEach((element) => {
                Object.keys(data.DataShow[element]).forEach((e) => {
                    if (data.DataShow[element][e] === true) {
                        if (data[element][e].toString()) {
                            if (data[element][e].toString() !== 'Without tap') {
                                let temp = {
                                    measurement: {
                                        mrid: '',
                                        value: data.NameOfPos[element][e],
                                        unit: '',
                                        type: 'string'
                                    },
                                    df_ref: {
                                        mrid: '',
                                        value: (bushings.df_c1 && bushings.df_c1[element] && bushings.df_c1[element][e]) || '',
                                        unit: '',
                                        type: 'analog'
                                    },
                                    c_ref: {
                                        mrid: '',
                                        value: (bushings.cap_c1 && bushings.cap_c1[element] && bushings.cap_c1[element][e]) || '',
                                        unit: '',
                                        type: 'analog'
                                    },
                                    test_mode: {
                                        mrid: '',
                                        value: '',
                                        unit: '',
                                        type: 'discrete'
                                    },
                                    insulation: {
                                        mrid: '',
                                        value: (bushings.insulation_type && bushings.insulation_type[element] && bushings.insulation_type[element][e]) || '',
                                        unit: '',
                                        type: 'analog'
                                    },
                                    test_voltage: {
                                        mrid: '',
                                        value: '',
                                        unit: '',
                                        type: 'analog'
                                    },
                                    df_meas: {
                                        mrid: '',
                                        value: '',
                                        unit: '',
                                        type: 'analog'
                                    },
                                    c_meas: {
                                        mrid: '',
                                        value: '',
                                        unit: '',
                                        type: 'analog'
                                    },
                                    df_change: {
                                        mrid: '',
                                        value: '',
                                        unit: '',
                                        type: 'analog'
                                    },
                                    tri_c_meas: {
                                        mrid: '',
                                        value: '',
                                        unit: '',
                                        type: 'analog'
                                    },
                                    assessment: {
                                        mrid: '',
                                        value: '',
                                        unit: '',
                                        type: 'discrete'
                                    },
                                    condition_indicator_df: {
                                        mrid: '',
                                        value: '',
                                        unit: '',
                                        type: 'discrete'
                                    },
                                    condition_indicator_c: {
                                        mrid: '',
                                        value: '',
                                        unit: '',
                                        type: 'discrete'
                                    }
                                }
                                table.push(temp)
                            }
                        }
                    }
                })
            })
            return {
                code: 'BushingPrimC2',
                top_oil_temperature: '',
                bottom_oil_temperature: '',
                winding_temperature: '',
                reference_temperature: '',
                ambient_temperature: '',
                humidity: '',
                weather: '',
                model: '',
                serial_no: '',
                calibration_date: '',
                comment: '',
                table: table,
                // dữ liệu cấu hình assessment
                assessment_setting: {
                    option: {
                        mrid: '',
                        value: 'Custom',
                        unit: '',
                        type: 'string'
                    },
                    data: {
                        iec: {
                            oip: {
                                df_meas: {
                                    mrid: '',
                                    value: 0.7,
                                    unit: '',
                                    type: 'analog'
                                },
                                tri_c_meas: {
                                    mrid: '',
                                    value: 5,
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            rip: {
                                df_meas: {
                                    mrid: '',
                                    value: 0.7,
                                    unit: '',
                                    type: 'analog'
                                },
                                tri_c_meas: {
                                    mrid: '',
                                    value: 5,
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            rbp: {
                                df_meas: {
                                    mrid: '',
                                    value: 1.5,
                                    unit: '',
                                    type: 'analog'
                                },
                                tri_c_meas: {
                                    mrid: '',
                                    value: 5,
                                    unit: '',
                                    type: 'analog'
                                }
                            }
                        },
                        ieee: {
                            oip: {
                                df_meas: {
                                    mrid: '',
                                    value: 0.5,
                                    unit: '',
                                    type: 'analog'
                                },
                                tri_c_meas: {
                                    mrid: '',
                                    value: 5,
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            rip: {
                                df_meas: {
                                    mrid: '',
                                    value: 0.85,
                                    unit: '',
                                    type: 'analog'
                                },
                                tri_c_meas: {
                                    mrid: '',
                                    value: 5,
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            rbp: {
                                df_meas: {
                                    mrid: '',
                                    value: 2,
                                    unit: '',
                                    type: 'analog'
                                },
                                tri_c_meas: {
                                    mrid: '',
                                    value: 5,
                                    unit: '',
                                    type: 'analog'
                                }
                            }
                        },
                        custom: {
                            oip: {
                                df_meas: {
                                    mrid: '',
                                    value: 0.5,
                                    unit: '',
                                    type: 'analog'
                                },
                                tri_c_meas: {
                                    mrid: '',
                                    value: 5,
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            rip: {
                                df_meas: {
                                    mrid: '',
                                    value: 0.85,
                                    unit: '',
                                    type: 'analog'
                                },
                                tri_c_meas: {
                                    mrid: '',
                                    value: 5,
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            rbp: {
                                df_meas: {
                                    mrid: '',
                                    value: 2,
                                    unit: '',
                                    type: 'analog'
                                },
                                tri_c_meas: {
                                    mrid: '',
                                    value: 5,
                                    unit: '',
                                    type: 'analog'
                                }
                            }
                        }
                    }
                },
                // dữ liệu cấu hình indicator
                condition_indicator_df: {
                    good: {
                        df_meas: [
                            {mrid: '', value: '0.4', unit: '', type: 'analog'},
                            {mrid: '', value: null, unit: '', type: 'analog'}
                        ],
                        df_change: [
                            {mrid: '', value: '1.3', unit: '', type: 'analog'},
                            {mrid: '', value: null, unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: '3',
                            unit: '',
                            type: 'analog'
                        }
                    },
                    fair: {
                        df_meas: [
                            {mrid: '', value: '0.4', unit: '', type: 'analog'},
                            {mrid: '', value: null, unit: '', type: 'analog'}
                        ],
                        df_change: [
                            {mrid: '', value: '1.3', unit: '', type: 'analog'},
                            {mrid: '', value: null, unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: '2',
                            unit: '',
                            type: 'analog'
                        }
                    },
                    poor: {
                        df_meas: [
                            {mrid: '', value: '0.7', unit: '', type: 'analog'},
                            {mrid: '', value: '1', unit: '', type: 'analog'}
                        ],
                        df_change: [
                            {mrid: '', value: '2', unit: '', type: 'analog'},
                            {mrid: '', value: '3', unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: '1',
                            unit: '',
                            type: 'analog'
                        }
                    },
                    bad: {
                        df_meas: [
                            {mrid: '', value: null, unit: '', type: 'analog'},
                            {mrid: '', value: '1', unit: '', type: 'analog'}
                        ],
                        df_change: [
                            {mrid: '', value: null, unit: '', type: 'analog'},
                            {mrid: '', value: '3', unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: '0',
                            unit: '',
                            type: 'analog'
                        }
                    }
                },
                // dữ liệu cấu hình indicator C
                condition_indicator_c: {
                    good: {
                        tri_c_meas: [
                            {mrid: '', value: '5', unit: '', type: 'analog'},
                            {mrid: '', value: null, unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: '3',
                            unit: '',
                            type: 'analog'
                        }
                    },
                    fair: {
                        tri_c_meas: [
                            {mrid: '', value: '5', unit: '', type: 'analog'},
                            {mrid: '', value: '7', unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: '2',
                            unit: '',
                            type: 'analog'
                        }
                    },
                    poor: {
                        tri_c_meas: [
                            {mrid: '', value: '7', unit: '', type: 'analog'},
                            {mrid: '', value: '10', unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: '1',
                            unit: '',
                            type: 'analog'
                        }
                    },
                    bad: {
                        tri_c_meas: [
                            {mrid: '', value: null, unit: '', type: 'analog'},
                            {mrid: '', value: '10', unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: '0',
                            unit: '',
                            type: 'analog'
                        }
                    }
                }
            }
        },
        initBushingSecC1() {
            return {
                code: 'BushingSecC1',
                top_oil_temperature: '',
                bottom_oil_temperature: '',
                winding_temperature: '',
                reference_temperature: '',
                ambient_temperature: '',
                humidity: '',
                weather: '',
                model: '',
                serial_no: '',
                calibration_date: '',
                comment: '',
                table: [
                    {
                        measurement: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'string'
                        },
                        test_mode: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        },
                        test_voltage: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        df_ref: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        c_ref: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        df_meas: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        c_meas: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        df_change: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        tri_c_meas: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        assessment: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        },
                        condition_indicator_df: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        },
                        condition_indicator_c: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        }
                    }
                ]
            }
        },
        initBushingSecC2() {
            return {
                code: 'BushingSecC2',
                top_oil_temperature: '',
                bottom_oil_temperature: '',
                winding_temperature: '',
                reference_temperature: '',
                ambient_temperature: '',
                humidity: '',
                weather: '',
                model: '',
                serial_no: '',
                calibration_date: '',
                comment: '',
                table: [
                    {
                        measurement: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'string'
                        },
                        test_mode: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        },
                        test_voltage: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        df_ref: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        c_ref: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        df_meas: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        c_meas: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        assessment: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        },
                        condition_indicator_df: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        },
                        condition_indicator_c: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        }
                    }
                ]
            }
        },
        initBushingTertC1() {
            return {
                code: 'BushingTertC1',
                top_oil_temperature: '',
                bottom_oil_temperature: '',
                winding_temperature: '',
                reference_temperature: '',
                ambient_temperature: '',
                humidity: '',
                weather: '',
                model: '',
                serial_no: '',
                calibration_date: '',
                comment: '',
                table: [
                    {
                        measurement: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'string'
                        },
                        test_mode: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        },
                        test_voltage: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        df_ref: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        c_ref: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        df_meas: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        c_meas: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        df_change: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        tri_c_meas: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        assessment: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        },
                        condition_indicator_df: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        },
                        condition_indicator_c: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        }
                    }
                ]
            }
        },
        initBushingTertC2() {
            return {
                code: 'BushingTertC2',
                top_oil_temperature: '',
                bottom_oil_temperature: '',
                winding_temperature: '',
                reference_temperature: '',
                ambient_temperature: '',
                humidity: '',
                weather: '',
                model: '',
                serial_no: '',
                calibration_date: '',
                comment: '',
                table: [
                    {
                        measurement: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'string'
                        },
                        test_mode: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        },
                        test_voltage: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        df_ref: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        c_ref: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        df_meas: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        c_meas: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'analog'
                        },
                        assessment: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        },
                        condition_indicator_df: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        },
                        condition_indicator_c: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        }
                    }
                ]
            }
        },
        initShortPrimSec() {
            return {
                code: 'ShortPrimSec',
                table: []
            }
        },
        initShortSecTert() {
            return {
                code: 'ShortSecTert',
                table: []
            }
        },
        initShortPrimTert() {
            return {
                code: 'ShortPrimTert',
                table: []
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

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        initDielectricResponseAnalysis() {
            return {
                code: 'DielectricResponseAnalysis',
                table: []
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
        initShortCircuitImpedancePrim() {
            const tapChangers = this.tapChangers || {}
            const selectedAsset = this.selectedAsset || []
            const asset = selectedAsset[0] || {}
            let table = [
                {
                    tap: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'string'
                    },
                    phase: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'string'
                    },
                    rk: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    xk: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    zk: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    ukCal: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    ukDev: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    assessment: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    },
                    condition_indicator: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    }
                }
            ]
            let mode = ''
            const phase = ['A', 'B', 'C']
            if (tapChangers.mode === 'oltc') {
                mode = 'oltc_position'
                if (asset.prim_sec && JSON.parse(asset.prim_sec).length !== 0) {
                    JSON.parse(asset.prim_sec).forEach((element) => {
                        phase.forEach((e) => {
                            table.push({
                                tap: {
                                    mrid: '',
                                    value: element.oltc_position,
                                    unit: '',
                                    type: 'string'
                                },
                                phase: {
                                    mrid: '',
                                    value: e,
                                    unit: '',
                                    type: 'string'
                                },
                                ukCal: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                },
                                ukDev: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                },
                                assessment: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'discrete'
                                },
                                condition_indicator: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'discrete'
                                }
                            })
                        })
                    })
                }
            } else {
                mode = 'detc_position'
                if (asset.prim_sec && JSON.parse(asset.prim_sec).length !== 0) {
                    JSON.parse(asset.prim_sec).forEach((element) => {
                        phase.forEach((e) => {
                            table.push({
                                tap: {
                                    mrid: '',
                                    value: element.detc_position,
                                    unit: '',
                                    type: 'string'
                                },
                                phase: {
                                    mrid: '',
                                    value: e,
                                    unit: '',
                                    type: 'string'
                                },
                                ukCal: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                },
                                ukDev: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                },
                                assessment: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'discrete'
                                },
                                condition_indicator: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'discrete'
                                }
                            })
                        })
                    })
                }
            }

            return {
                code: 'ShortCircuitImpedancePrim',
                option: 'threePhase',
                mode: mode,
                assessment_setting: {
                    option: {
                        mrid: '',
                        value: 'IEEE',
                        unit: '',
                        type: 'string'
                    },
                    data: {
                        ieee: {
                            threePhase: {
                                ukDev: {
                                    mrid: '',
                                    value: '3',
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            perPhase: {
                                ukDev: {
                                    mrid: '',
                                    value: '3',
                                    unit: '',
                                    type: 'analog'
                                }
                            }
                        },
                        cigre: {
                            threePhase: {
                                ukDev: {
                                    mrid: '',
                                    value: '2',
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            perPhase: {
                                ukDev: {
                                    mrid: '',
                                    value: '2',
                                    unit: '',
                                    type: 'analog'
                                }
                            }
                        },
                        custom: {
                            threePhase: {
                                ukDev: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            perPhase: {
                                ukDev: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                }
                            }
                        }
                    }
                },
                condition_indicator: {
                    good: {
                        breakdown_voltage: [
                            {mrid: '', value: 60, unit: '', type: 'analog'},
                            {mrid: '', value: null, unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: 4,
                            unit: '',
                            type: 'analog'
                        }
                    },
                    fair: {
                        breakdown_voltage: [
                            {mrid: '', value: 55, unit: '', type: 'analog'},
                            {mrid: '', value: 60, unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: 3,
                            unit: '',
                            type: 'analog'
                        }
                    },
                    poor: {
                        breakdown_voltage: [
                            {mrid: '', value: 40, unit: '', type: 'analog'},
                            {mrid: '', value: 55, unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: 2,
                            unit: '',
                            type: 'analog'
                        }
                    },
                    bad: {
                        breakdown_voltage: [
                            {mrid: '', value: null, unit: '', type: 'analog'},
                            {mrid: '', value: 40, unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: 1,
                            unit: '',
                            type: 'analog'
                        }
                    }
                },
                table: table
            }
        },
        initShortCircuitImpedanceSec() {
            const tapChangers = this.tapChangers || {}
            const selectedAsset = this.selectedAsset || []
            const asset = selectedAsset[0] || {}
            let table = [
                {
                    tap: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'string'
                    },
                    phase: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'string'
                    },
                    rk: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    xk: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    zk: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    ukCal: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    ukDev: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    assessment: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    },
                    condition_indicator: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    }
                }
            ]
            let mode = ''
            const phase = ['A', 'B', 'C']
            if (tapChangers.mode === 'oltc') {
                mode = 'oltc_position'
                if (asset.sec_tert && JSON.parse(asset.sec_tert).length !== 0) {
                    JSON.parse(asset.sec_tert).forEach((element) => {
                        phase.forEach((e) => {
                            table.push({
                                tap: {
                                    mrid: '',
                                    value: element.oltc_position,
                                    unit: '',
                                    type: 'string'
                                },
                                phase: {
                                    mrid: '',
                                    value: e,
                                    unit: '',
                                    type: 'string'
                                },
                                ukCal: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                },
                                ukDev: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                },
                                assessment: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'discrete'
                                },
                                condition_indicator: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'discrete'
                                }
                            })
                        })
                    })
                }
            } else {
                mode = 'detc_position'
                if (asset.sec_tert && JSON.parse(asset.sec_tert).length !== 0) {
                    JSON.parse(asset.sec_tert).forEach((element) => {
                        phase.forEach((e) => {
                            table.push({
                                tap: {
                                    mrid: '',
                                    value: element.oltc_position,
                                    unit: '',
                                    type: 'string'
                                },
                                phase: {
                                    mrid: '',
                                    value: e,
                                    unit: '',
                                    type: 'string'
                                },
                                ukCal: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                },
                                ukDev: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                },
                                assessment: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'discrete'
                                },
                                condition_indicator: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'discrete'
                                }
                            })
                        })
                    })
                }
            }

            return {
                code: 'ShortCircuitImpedanceSec',
                option: {
                    mrid: '',
                    value: 'threePhase',
                    unit: '',
                    type: 'string'
                },
                mode: {
                    mrid: '',
                    value: mode,
                    unit: '',
                    type: 'string'
                },
                assessment_setting: {
                    option: {
                        mrid: '',
                        value: 'IEEE',
                        unit: '',
                        type: 'string'
                    },
                    data: {
                        ieee: {
                            threePhase: {
                                ukDev: {
                                    mrid: '',
                                    value: 3,
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            perPhase: {
                                ukDev: {
                                    mrid: '',
                                    value: 3,
                                    unit: '',
                                    type: 'analog'
                                }
                            }
                        },
                        cigre: {
                            threePhase: {
                                ukDev: {
                                    mrid: '',
                                    value: 2,
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            perPhase: {
                                ukDev: {
                                    mrid: '',
                                    value: 2,
                                    unit: '',
                                    type: 'analog'
                                }
                            }
                        },
                        custom: {
                            threePhase: {
                                ukDev: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            perPhase: {
                                ukDev: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                }
                            }
                        }
                    }
                },
                condition_indicator: {
                    good: {
                        breakdown_voltage: [
                            {mrid: '', value: 60, unit: '', type: 'analog'},
                            {mrid: '', value: null, unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: 4,
                            unit: '',
                            type: 'analog'
                        }
                    },
                    fair: {
                        breakdown_voltage: [
                            {mrid: '', value: 55, unit: '', type: 'analog'},
                            {mrid: '', value: 60, unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: 3,
                            unit: '',
                            type: 'analog'
                        }
                    },
                    poor: {
                        breakdown_voltage: [
                            {mrid: '', value: 40, unit: '', type: 'analog'},
                            {mrid: '', value: 55, unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: 2,
                            unit: '',
                            type: 'analog'
                        }
                    },
                    bad: {
                        breakdown_voltage: [
                            {mrid: '', value: null, unit: '', type: 'analog'},
                            {mrid: '', value: 40, unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: 1,
                            unit: '',
                            type: 'analog'
                        }
                    }
                },
                table: table
            }
        },
        initShortCircuitImpedanceTert() {
            const tapChangers = this.tapChangers || {}
            const selectedAsset = this.selectedAsset || []
            const asset = selectedAsset[0] || {}
            let table = [
                {
                    tap: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'string'
                    },
                    phase: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'string'
                    },
                    rk: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    xk: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    zk: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    ukCal: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    ukDev: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'analog'
                    },
                    assessment: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    },
                    condition_indicator: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    }
                }
            ]
            let mode = ''
            const phase = ['A', 'B', 'C']
            if (tapChangers.mode === 'oltc') {
                mode = 'oltc_position'
                if (asset.prim_tert && JSON.parse(asset.prim_tert).length !== 0) {
                    JSON.parse(asset.prim_tert).forEach((element) => {
                        phase.forEach((e) => {
                            table.push({
                                tap: {
                                    mrid: '',
                                    value: element.oltc_position,
                                    unit: '',
                                    type: 'string'
                                },
                                phase: {
                                    mrid: '',
                                    value: e,
                                    unit: '',
                                    type: 'string'
                                },
                                ukCal: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                },
                                ukDev: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                },
                                assessment: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'discrete'
                                },
                                condition_indicator: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'discrete'
                                }
                            })
                        })
                    })
                }
            } else {
                mode = 'detc_position'
                if (asset.prim_tert && JSON.parse(asset.prim_tert).length !== 0) {
                    JSON.parse(asset.prim_tert).forEach((element) => {
                        phase.forEach((e) => {
                            table.push({
                                tap: {
                                    mrid: '',
                                    value: element.detc_position,
                                    unit: '',
                                    type: 'string'
                                },
                                phase: {
                                    mrid: '',
                                    value: e,
                                    unit: '',
                                    type: 'string'
                                },
                                ukCal: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                },
                                ukDev: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                },
                                assessment: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'discrete'
                                },
                                condition_indicator: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'discrete'
                                }
                            })
                        })
                    })
                }
            }

            return {
                code: 'ShortCircuitImpedanceTert',
                option: 'threePhase',
                mode: mode,
                assessment_setting: {
                    option: {
                        mrid: '',
                        value: 'IEEE',
                        unit: '',
                        type: 'string'
                    },
                    data: {
                        ieee: {
                            threePhase: {
                                ukDev: {
                                    mrid: '',
                                    value: 3,
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            perPhase: {
                                ukDev: {
                                    mrid: '',
                                    value: 3,
                                    unit: '',
                                    type: 'analog'
                                }
                            }
                        },
                        cigre: {
                            threePhase: {
                                ukDev: {
                                    mrid: '',
                                    value: 2,
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            perPhase: {
                                ukDev: {
                                    mrid: '',
                                    value: 2,
                                    unit: '',
                                    type: 'analog'
                                }
                            }
                        },
                        custom: {
                            threePhase: {
                                ukDev: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                }
                            },
                            perPhase: {
                                ukDev: {
                                    mrid: '',
                                    value: '',
                                    unit: '',
                                    type: 'analog'
                                }
                            }
                        }
                    }
                },
                condition_indicator: {
                    good: {
                        breakdown_voltage: [
                            {
                                mrid: '',
                                value: 60,
                                unit: '',
                                type: 'analog'
                            },
                            {
                                mrid: '',
                                value: null,
                                unit: '',
                                type: 'analog'
                            }
                        ],
                        score: {
                            mrid: '',
                            value: 4,
                            unit: '',
                            type: 'analog'
                        }
                    },
                    fair: {
                        breakdown_voltage: [
                            {mrid: '', value: 55, unit: '', type: 'analog'},
                            {mrid: '', value: 60, unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: 3,
                            unit: '',
                            type: 'analog'
                        }
                    },
                    poor: {
                        breakdown_voltage: [
                            {mrid: '', value: 40, unit: '', type: 'analog'},
                            {mrid: '', value: 55, unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: 2,
                            unit: '',
                            type: 'analog'
                        }
                    },
                    bad: {
                        breakdown_voltage: [
                            {mrid: '', value: null, unit: '', type: 'analog'},
                            {mrid: '', value: 40, unit: '', type: 'analog'}
                        ],
                        score: {
                            mrid: '',
                            value: 1,
                            unit: '',
                            type: 'analog'
                        }
                    }
                },
                table: table
            }
        }
    }
}
