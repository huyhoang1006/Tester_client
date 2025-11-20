import { mapState } from 'vuex'

export default {
    data() {
        return {}
    },
    computed: mapState(['selectedAsset', 'selectedJob']),
    async beforeMount() { },
    methods: {
        initTest(testTypeCode, assetData = null) {
            let data = null
            switch (testTypeCode) {
                case 'GeneralInspection':
                    data = this.initGeneralInspection()
                    break
                case 'InsulationResistance':
                    data = this.initInsulationResistance(assetData)
                    break
                case 'RatioPrimSec':
                    data = this.initRatioPrimSec()
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
                    data = this.initMeasurementOfNoLoad()
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
                    data = this.initMeasurementOfOil()
                    break
                case 'DimensionWeight':
                    data = this.initDimensionWeight()
                    break
                case 'TestingInstruments':
                    data = this.initTestingInstruments()
                    break
                case 'ExcitingCurrent':
                    data = this.initExcitingCurrent()
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
                    data = this.initDga()
                    break
                case 'DielectricResponseAnalysis':
                    data = this.initDielectricResponseAnalysis()
                    break
                case 'motorCurrent':
                    data = this.initmotorCurrent()
                    break
                case 'InsulationResistanceYokeCore':
                    data = this.initInsulationResistanceYokeCore()
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
                    data = this.initGasChromatography()
            }

            return data
        },
        initGeneralInspection() {
            const test_object = [
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
            ];

            return {
                row_data: [
                    {
                        mrid: '',
                        name: 'Test object',
                        code: 'test_object',
                        unit: '',
                        type: 'string'
                    },
                    {
                        mrid: '',
                        name: 'Assessment',
                        code: 'assessment',
                        unit: '',
                        type: 'discrete',
                        pool: {
                            mrid: '',
                            valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                        }
                    },
                    {
                        mrid: '',
                        name: 'Condition indicator',
                        code: 'condition_indicator',
                        unit: '',
                        type: 'discrete',
                        pool: {
                            mrid: '',
                            valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                            { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                        }
                    }
                ],

                table: test_object.map(obj => ({
                    mrid: '',
                    test_object: {
                        mrid: '',
                        value: obj,
                        unit: '',
                        type: 'string'
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
                })),

                measurementProcedure: []

            }
        },
        initInsulationResistance(assetData = null) {
            const asset = assetData || this.asset || {}
            const data = {
                code: 'insulationresistance',
                t: '',
                megohmmeter: '',
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
                // dữ liệu cấu hình indicator
                assessment_setting: {
                    option: 'cigre',
                    data: {
                        cigre: {
                            pass_1: {
                                prim: '69',
                                r60s: '1000'
                            },
                            pass_2: {
                                prim: '69',
                                r60s: '500'
                            }
                        },
                        custom: {
                            pass_1: {
                                prim: '1',
                                r60s: '1000'
                            },
                            pass_2: {
                                prim: '69',
                                r60s: '500'
                            }
                        }
                    }
                },
                condition_indicator_setting: {
                    good: {
                        kht: [null, '1.4'],
                        r60s_hve: [null, '1000'],
                        r60s_lve: [null, '500'],
                        score: '3'
                    },
                    fair: {
                        kht: ['1.3', '1.4'],
                        r60s_hve: ['600', '1000'],
                        r60s_lve: ['300', '500'],
                        score: '2'
                    },
                    poor: {
                        kht: ['1.2', '1.3'],
                        r60s_hve: ['400', '600'],
                        r60s_lve: ['200', '300'],
                        score: '1'
                    },
                    bad: {
                        kht: ['1.2', null],
                        r60s_hve: ['400', null],
                        r60s_lve: ['200', null],
                        score: '0'
                    }
                }
            }

            if (asset && asset.asset_type === 'Two-winding') {
                data.table = [
                    {
                        measured_position: '(HV + LV) - GND',
                        type: 'HV-E',
                        r15s: '',
                        r60s: '',
                        r10min: '',
                        kht: '',
                        pi: '',
                        assessment: '',
                        condition_indicator: ''
                    },
                    {
                        measured_position: 'HV - (LV + GND)',
                        type: 'HV-E',
                        r15s: '',
                        r60s: '',
                        r10min: '',
                        kht: '',
                        pi: '',
                        assessment: '',
                        condition_indicator: ''
                    },
                    {
                        measured_position: 'LV - (HV + GND)',
                        type: 'LV-E',
                        r15s: '',
                        r60s: '',
                        r10min: '',
                        kht: '',
                        pi: '',
                        assessment: '',
                        condition_indicator: ''
                    }
                ]
            } else if (asset && asset.asset_type === 'Three-winding') {
                data.table = [
                    {
                        measured_position: 'HV - (LV + TV + GND)',
                        type: 'HV-E',
                        r15s: '',
                        r60s: '',
                        r10min: '',
                        kht: '',
                        pi: '',
                        assessment: '',
                        condition_indicator: ''
                    },
                    {
                        measured_position: 'LV - (HV + LV + GND)',
                        type: 'LV-E',
                        r15s: '',
                        r60s: '',
                        r10min: '',
                        kht: '',
                        pi: '',
                        assessment: '',
                        condition_indicator: ''
                    },
                    {
                        measured_position: '(HV + LV + TV) - GND',
                        type: 'HV-E',
                        r15s: '',
                        r60s: '',
                        r10min: '',
                        kht: '',
                        pi: '',
                        assessment: '',
                        condition_indicator: ''
                    },
                    {
                        measured_position: 'TV - (HV + LV + GND)',
                        type: 'LV-E',
                        r15s: '',
                        r60s: '',
                        r10min: '',
                        kht: '',
                        pi: '',
                        assessment: '',
                        condition_indicator: ''
                    }
                ]
            } else if (asset && asset.asset_type === 'Auto w/ tert') {
                data.table = [
                    {
                        measured_position: '(HV + LV) - (TV + GND)',
                        type: 'HV-E',
                        r15s: '',
                        r60s: '',
                        r10min: '',
                        kht: '',
                        pi: '',
                        assessment: '',
                        condition_indicator: ''
                    },
                    {
                        measured_position: '(HV + LV + TV) - GND',
                        type: 'HV-E',
                        r15s: '',
                        r60s: '',
                        r10min: '',
                        kht: '',
                        pi: '',
                        assessment: '',
                        condition_indicator: ''
                    },
                    {
                        measured_position: 'TV - (HV + LV + GND)',
                        type: 'LV-E',
                        r15s: '',
                        r60s: '',
                        r10min: '',
                        kht: '',
                        pi: '',
                        assessment: '',
                        condition_indicator: ''
                    }
                ]
            } else if (asset && asset.asset_type === 'Auto w/o tert') {
                data.table = [
                    {
                        measured_position: '(HV + LV) - GND',
                        type: 'HV-E',
                        r15s: '',
                        r60s: '',
                        r10min: '',
                        kht: '',
                        pi: '',
                        assessment: '',
                        condition_indicator: ''
                    }
                ]
            } else {
                data.table = []
            }

            return data
        },
        initExcitingCurrent() {
            const tapChangers = this.tapChangers
            if (!tapChangers.mode || !tapChangers.winding || !tapChangers.tap_scheme || !tapChangers.no_of_taps) {
                return {
                    code: 'ExcitingCurrent',
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
                    condition_indicator_setting: {
                        good: {
                            dev_per: ['10', null],
                            score: '3'
                        },
                        fair: {
                            dev_per: ['10', '15'],
                            score: '2'
                        },
                        poor: {
                            dev_per: ['15', '20'],
                            score: '1'
                        },
                        bad: {
                            dev_per: [null, '20'],
                            score: '0'
                        }
                    }
                }
            }

            let table = []
            const voltage_table = tapChangers.voltage_table || []
            const phases = ['A', 'B', 'C']
            voltage_table.forEach((element) => {
                const tap = element.tap
                const voltage = element.voltage
                const voltage_table_id = element.id
                phases.forEach((phase) => {
                    table.push({
                        voltage_table_id,
                        tap,
                        phase,
                        _phase: phase,
                        _voltage: voltage,
                        i_out: '',
                        watt_losses: '',
                        assessment: '',
                        i_ref: '',
                        dev_per: '',
                        condition_indicator: ''
                    })
                })
            })

            return {
                code: 'ExcitingCurrent',
                model: '',
                serial_no: '',
                calibration_date: '',
                table,
                condition_indicator_setting: {
                    good: {
                        dev_per: ['10', null],
                        score: '3'
                    },
                    fair: {
                        dev_per: ['10', '15'],
                        score: '2'
                    },
                    poor: {
                        dev_per: ['15', '20'],
                        score: '1'
                    },
                    bad: {
                        dev_per: [null, '20'],
                        score: '0'
                    }
                }
            }
        },
        initRatioPrimSec() {
            const tapChangers = this.tapChangers || {}
            if (!tapChangers.mode || !tapChangers.winding || !tapChangers.tap_scheme || !tapChangers.no_of_taps) {
                return {
                    code: 'RatioPrimSec',
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
                        option: 'IEC',
                        data: {
                            iec: { ratio_dev: 0.5 },
                            ieee: { ratio_dev: 0.5 },
                            custom: { ratio_dev: 0.5 }
                        }
                    },
                    condition_indicator_setting: {
                        good: {
                            ratio_dev: ['0.3', null],
                            score: '3'
                        },
                        fair: {
                            ratio_dev: ['0.3', '0.5'],
                            score: '2'
                        },
                        poor: {
                            ratio_dev: ['0.5', '0.7'],
                            score: '1'
                        },
                        bad: {
                            ratio_dev: [null, '0.7'],
                            score: '0'
                        }
                    }
                }
            }

            let table = []
            const voltage_table = tapChangers.voltage_table || []
            const phases = ['A', 'B', 'C']
            voltage_table.forEach((element) => {
                const tap = element.tap
                const voltage = element.voltage
                const voltage_table_id = element.id
                phases.forEach((phase) => {
                    table.push({
                        voltage_table_id,
                        tap,
                        _voltage: voltage,
                        phase,
                        _phase: phase,
                        hv1: '',
                        lv: '',
                        nominal_ratio: '',
                        v_ratio: '',
                        ratio_dev: '',
                        assessment: '',
                        condition_indicator: ''
                    })
                })
            })

            return {
                code: 'RatioPrimSec',
                table,
                model: '',
                serial_no: '',
                calibration_date: '',
                // dữ liệu cấu hình assessment
                assessment_setting: {
                    option: 'IEC',
                    data: {
                        iec: { ratio_dev: 0.5 },
                        ieee: { ratio_dev: 0.5 },
                        custom: { ratio_dev: 0.5 }
                    }
                },
                condition_indicator_setting: {
                    good: {
                        ratio_dev: ['0.3', null],
                        score: '3'
                    },
                    fair: {
                        ratio_dev: ['0.3', '0.5'],
                        score: '2'
                    },
                    poor: {
                        ratio_dev: ['0.5', '0.7'],
                        score: '1'
                    },
                    bad: {
                        ratio_dev: [null, '0.7'],
                        score: '0'
                    }
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
                        option: 'IEEE',
                        data: {
                            iec: {
                                error_between_phase: '2.00',
                                error_r_ref: ''
                            },
                            ieee: {
                                error_between_phase: '2.00',
                                error_r_ref: ''
                            },
                            cigre: {
                                error_between_phase: '',
                                error_r_ref: '1.00'
                            },
                            custom: {
                                error_between_phase: '2.00',
                                error_r_ref: '1.00'
                            }
                        }
                    },
                    condition_indicator_setting: {
                        good: {
                            error_between_phase: ['1', null],
                            score: '3'
                        },
                        fair: {
                            error_between_phase: ['1', '2'],
                            score: '2'
                        },
                        poor: {
                            error_between_phase: ['2', '3'],
                            score: '1'
                        },
                        bad: {
                            error_between_phase: [null, '3'],
                            score: '0'
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
                            voltage_table_id,
                            tap,
                            phase,
                            _phase: phase,
                            _voltage: voltage,
                            r_meas: '',
                            r_ref: '',
                            r_corr: '',
                            error_between_phase: '',
                            error_r_ref: '',
                            mean_value: '',
                            assessment: '',
                            condition_indicator: ''
                        })
                    })
                })
            } else {
                const phases = ['A', 'B', 'C']
                phases.forEach((phase) => {
                    table.push({
                        tap: '',
                        phase,
                        _phase: phase,
                        r_meas: '',
                        r_ref: '',
                        r_corr: '',
                        error_between_phase: '',
                        error_r_ref: '',
                        mean_value: '',
                        assessment: '',
                        condition_indicator: ''
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
                    option: 'IEEE',
                    data: {
                        iec: {
                            error_between_phase: '2.00',
                            error_r_ref: ''
                        },
                        ieee: {
                            error_between_phase: '2.00',
                            error_r_ref: ''
                        },
                        cigre: {
                            error_between_phase: '',
                            error_r_ref: '1.00'
                        },
                        custom: {
                            error_between_phase: '2.00',
                            error_r_ref: '1.00'
                        }
                    }
                },
                condition_indicator_setting: {
                    good: {
                        error_between_phase: ['1', null],
                        score: '3'
                    },
                    fair: {
                        error_between_phase: ['1', '2'],
                        score: '2'
                    },
                    poor: {
                        error_between_phase: ['2', '3'],
                        score: '1'
                    },
                    bad: {
                        error_between_phase: [null, '3'],
                        score: '0'
                    }
                }
            }
        },
        initDcWindingSec() {
            const tapChangers = this.tapChangers || {}
            if (!tapChangers.mode || !tapChangers.winding || !tapChangers.tap_scheme || !tapChangers.no_of_taps) {
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
                    table: [],
                    // dữ liệu cấu hình assessment
                    assessment_setting: {
                        option: 'IEEE',
                        data: {
                            iec: {
                                error_between_phase: '2.00',
                                error_r_ref: ''
                            },
                            ieee: {
                                error_between_phase: '2.00',
                                error_r_ref: ''
                            },
                            cigre: {
                                error_between_phase: '',
                                error_r_ref: '1.00'
                            },
                            custom: {
                                error_between_phase: '',
                                error_r_ref: ''
                            }
                        }
                    },
                    condition_indicator_setting: {
                        good: {
                            error_between_phase: ['1', null],
                            score: '3'
                        },
                        fair: {
                            error_between_phase: ['1', '2'],
                            score: '2'
                        },
                        poor: {
                            error_between_phase: ['2', '3'],
                            score: '1'
                        },
                        bad: {
                            error_between_phase: [null, '3'],
                            score: '0'
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
                            voltage_table_id,
                            tap,
                            _phase: phase,
                            _voltage: voltage,
                            phase,
                            r_meas: '',
                            r_ref: '',
                            r_corr: '',
                            error_between_phase: '',
                            error_r_ref: '',
                            mean_value: '',
                            assessment: '',
                            condition_indicator: ''
                        })
                    })
                })
            } else {
                const phases = ['A', 'B', 'C']
                phases.forEach((phase) => {
                    table.push({
                        tap: '',
                        phase,
                        _phase: phase,
                        r_meas: '',
                        r_ref: '',
                        r_corr: '',
                        error_between_phase: '',
                        error_r_ref: '',
                        mean_value: '',
                        assessment: '',
                        condition_indicator: ''
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
                    option: 'IEEE',
                    data: {
                        iec: {
                            error_between_phase: '2.00',
                            error_r_ref: ''
                        },
                        ieee: {
                            error_between_phase: '2.00',
                            error_r_ref: ''
                        },
                        cigre: {
                            error_between_phase: '',
                            error_r_ref: '1.00'
                        },
                        custom: {
                            error_between_phase: '2.00',
                            error_r_ref: '1.00'
                        }
                    }
                },
                condition_indicator_setting: {
                    good: {
                        error_between_phase: ['1', null],
                        score: '3'
                    },
                    fair: {
                        error_between_phase: ['1', '2'],
                        score: '2'
                    },
                    poor: {
                        error_between_phase: ['2', '3'],
                        score: '1'
                    },
                    bad: {
                        error_between_phase: [null, '3'],
                        score: '0'
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
                        option: 'IEEE',
                        data: {
                            iec: {
                                error_between_phase: '2.00',
                                error_r_ref: ''
                            },
                            ieee: {
                                error_between_phase: '2.00',
                                error_r_ref: ''
                            },
                            cigre: {
                                error_between_phase: '',
                                error_r_ref: '1.00'
                            },
                            custom: {
                                error_between_phase: '',
                                error_r_ref: ''
                            }
                        }
                    },
                    condition_indicator_setting: {
                        good: {
                            error_between_phase: ['1', null],
                            score: '3'
                        },
                        fair: {
                            error_between_phase: ['1', '2'],
                            score: '2'
                        },
                        poor: {
                            error_between_phase: ['2', '3'],
                            score: '1'
                        },
                        bad: {
                            error_between_phase: [null, '3'],
                            score: '0'
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
                            voltage_table_id,
                            tap,
                            _phase: phase,
                            phase,
                            r_meas: '',
                            r_ref: '',
                            r_corr: '',
                            error_between_phase: '',
                            error_r_ref: '',
                            mean_value: '',
                            assessment: '',
                            condition_indicator: ''
                        })
                    })
                })
            } else {
                const phases = ['A', 'B', 'C']
                phases.forEach((phase) => {
                    table.push({
                        tap: '',
                        phase,
                        _phase: phase,
                        r_meas: '',
                        r_ref: '',
                        r_corr: '',
                        error_between_phase: '',
                        error_r_ref: '',
                        mean_value: '',
                        assessment: '',
                        condition_indicator: ''
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
                    option: 'IEEE',
                    data: {
                        iec: {
                            error_between_phase: '2.00',
                            error_r_ref: ''
                        },
                        ieee: {
                            error_between_phase: '2.00',
                            error_r_ref: ''
                        },
                        cigre: {
                            error_between_phase: '',
                            error_r_ref: '1.00'
                        },
                        custom: {
                            error_between_phase: '',
                            error_r_ref: ''
                        }
                    }
                },
                condition_indicator_setting: {
                    good: {
                        error_between_phase: ['1', null],
                        score: '3'
                    },
                    fair: {
                        error_between_phase: ['1', '2'],
                        score: '2'
                    },
                    poor: {
                        error_between_phase: ['2', '3'],
                        score: '1'
                    },
                    bad: {
                        error_between_phase: [null, '3'],
                        score: '0'
                    }
                }
            }
        },
        initMeasurementOfNoLoad() {
            return {
                code: 'MeasurementOfNoLoad',
                no_load_loss: {
                    result: '',
                    standard: '',
                    assessment: ''
                },
                no_load_current: {
                    result: '',
                    standard: '',
                    assessment: ''
                }
            }
        },
        initMeasurementOfShortCircuit() {
            return {
                code: 'MeasurementOfShortCircuit',
                load_loss: {
                    result: '',
                    standard: '',
                    assessment: ''
                },
                short_circuit_impedance: {
                    result: '',
                    standard: '',
                    assessment: ''
                }
            }
        },
        initEnergyEfficiency() {
            return {
                code: 'EnergyEfficiency',
                hv1: {
                    e50: '',
                    standard: '',
                    assessment: ''
                },
                hv2: {
                    e50: '',
                    standard: '',
                    assessment: ''
                }
            }
        },
        initSeparateSourceAc() {
            return {
                code: 'SeparateSourceAc',
                hv: {
                    test_voltage: '',
                    assessment: ''
                },
                lv: {
                    test_voltage: '',
                    assessment: ''
                }
            }
        },
        initInducedAcVoltageTests() {
            return {
                code: 'InducedAcVoltageTests',
                dataList: []
            }
        },
        initMeasurementOfOil() {
            return {
                code: 'MeasurementOfOil',
                type_oil: '',
                election_gap: '',
                result: '',
                assessment: '',
                condition_indicator: '',
                // dữ liệu cấu hình assessment
                assessment_setting: {
                    option: 'IEC',
                    data: {
                        iec: { voltage: 0.5 },
                        ieee: { voltage: 0.5 },
                        custom: { voltage: 0.5 }
                    }
                },
                condition_indicator_setting: {
                    good: {
                        breakdown_voltage: [null, '60'],
                        score: '3'
                    },
                    fair: {
                        breakdown_voltage: ['55', '60'],
                        score: '2'
                    },
                    poor: {
                        breakdown_voltage: ['40', '55'],
                        score: '1'
                    },
                    bad: {
                        breakdown_voltage: ['40', null],
                        score: '0'
                    }
                }
            }
        },
        initDimensionWeight() {
            return {
                code: 'DimensionWeight',
                table: {
                    dimension: {
                        a: '',
                        b: '',
                        c: '',
                        n: ''
                    },
                    weight: {
                        oil: '',
                        active: '',
                        total: ''
                    }
                }
            }
        },
        initTestingInstruments() {
            return {
                code: 'TestingInstruments',
                dataList: []
            }
        },
        initWindingDfCap(assetData = null) {
            const selectedAsset = this.selectedAsset || []
            const asset = assetData || (selectedAsset[0] || {})
            const dataTwoWinding = ["CH+CHL", "CH", "CHL", "CL", "CL+CHL"]
            const dataThreeWinding = ["CH+CHL+CHT", "CH+CHL", "CH+CHT", "CH", "CHL", "CHT", "CL+CHL+CLT", "CL+CHL", "CL+CLT", "CL",
                "CLT", "CT+CHT+CLT", "CT+CHT", "CT+CHL", "CT"]
            const dataTert = ["CH+CHT", "CH", "CHT", "CT", "CT+CHT"]
            var table = []
            if (asset.asset_type == "Three-winding") {
                dataThreeWinding.forEach(element => {
                    table.push({
                        measurement: element,
                        test_mode: '',
                        test_voltage: '',
                        df_ref: '',
                        c_ref: '',
                        df_meas: '',
                        c_meas: '',
                        df_change: '',
                        tri_c_meas: '',
                        assessment: '',
                        condition_indicator_df: '',
                        condition_indicator_c: ''
                    })
                })
            } else if (asset.asset_type == "Two-winding") {
                dataTwoWinding.forEach(element => {
                    table.push({
                        measurement: element,
                        test_mode: '',
                        test_voltage: '',
                        df_ref: '',
                        c_ref: '',
                        df_meas: '',
                        c_meas: '',
                        df_change: '',
                        tri_c_meas: '',
                        assessment: '',
                        condition_indicator_df: '',
                        condition_indicator_c: ''
                    })
                })
            } else {
                dataTert.forEach(element => {
                    table.push({
                        measurement: element,
                        test_mode: '',
                        test_voltage: '',
                        df_ref: '',
                        c_ref: '',
                        df_meas: '',
                        c_meas: '',
                        df_change: '',
                        tri_c_meas: '',
                        assessment: '',
                        condition_indicator_df: '',
                        condition_indicator_c: ''
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
                    option: 'IEEEnewLiquid',
                    data: {
                        IEEEnewLiquid: {
                            mineral: {
                                celc25: {
                                    df_meas: 0.05,
                                    tri_c_meas: 5
                                },
                                celc100: {
                                    df_meas: 0.4,
                                    tri_c_meas: 5
                                }
                            },
                            lfh: {
                                celc25: {
                                    df_meas: 0.1,
                                    tri_c_meas: 5
                                },
                                celc100: {
                                    df_meas: 1,
                                    tri_c_meas: 5
                                }
                            },
                            silicone: {
                                celc25: {
                                    df_meas: 0.1,
                                    tri_c_meas: 5
                                },
                                celc100: {
                                    df_meas: "-",
                                    tri_c_meas: 5
                                }
                            },
                            naturalEaster: {
                                celc25: {
                                    df_meas: 0.5,
                                    tri_c_meas: 5
                                },
                                celc100: {
                                    df_meas: "-",
                                    tri_c_meas: 5
                                }
                            },
                        },
                        IEEEserviceLiquid: {
                            mineral: {
                                celc25: {
                                    df_meas: 0.5,
                                    tri_c_meas: 5
                                },
                                celc100: {
                                    df_meas: 5,
                                    tri_c_meas: 5
                                }
                            },
                            lfh: {
                                celc25: {
                                    df_meas: 1,
                                    tri_c_meas: 5
                                },
                                celc100: {
                                    df_meas: "-",
                                    tri_c_meas: 5
                                }
                            },
                            silicone: {
                                celc25: {
                                    df_meas: 0.2,
                                    tri_c_meas: 5
                                },
                                celc100: {
                                    df_meas: "-",
                                    tri_c_meas: 5
                                }
                            },
                            naturalEaster: {
                                celc25: {
                                    df_meas: 0.5,
                                    tri_c_meas: 5
                                },
                                celc100: {
                                    df_meas: "-",
                                    tri_c_meas: 5
                                }
                            },
                        },
                        cirge: {
                            df_meas: 0.5,
                        },
                        custom: {
                            df_meas: 0.5,
                            tri_c_meas: 5
                        }
                    }
                },
                // dữ liệu cấu hình indicator
                condition_indicator_df: {
                    good: { df_meas: ['0.5', null], score: '3' },
                    fair: { df_meas: ['0.5', '1'], score: '2' },
                    poor: { df_meas: ['1', '1.5'], score: '1' },
                    bad: { df_meas: [null, '1.5'], score: '0' }
                },
                // dữ liệu cấu hình indicator C
                condition_indicator_c: {
                    good: { tri_c_meas: ['5', null], score: '3' },
                    fair: { tri_c_meas: ['5', '7'], score: '2' },
                    poor: { tri_c_meas: ['7', '10'], score: '1' },
                    bad: { tri_c_meas: [null, '10'], score: '0' }
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
                        option: 'Custom',
                        data: {
                            iec: {
                                oip: { df_meas: 0.7, tri_c_meas: 5 },
                                rip: { df_meas: 0.7, tri_c_meas: 5 },
                                rbp: { df_meas: 1.5, tri_c_meas: 5 }
                            },
                            ieee: {
                                oip: { df_meas: 0.5, tri_c_meas: 5 },
                                rip: { df_meas: 0.85, tri_c_meas: 5 },
                                rbp: { df_meas: 2, tri_c_meas: 5 }
                            },
                            custom: {
                                oip: { df_meas: 0.5, tri_c_meas: 5 },
                                rip: { df_meas: 0.85, tri_c_meas: 5 },
                                rbp: { df_meas: 2, tri_c_meas: 5 }
                            }
                        }
                    },
                    condition_indicator_df: {
                        good: { df_meas: ['0.4', null], df_change: ['1.3', null], score: '3' },
                        fair: { df_meas: ['0.4', '0.7'], df_change: ['1.3', '2'], score: '2' },
                        poor: { df_meas: ['0.7', '1'], df_change: ['2', '3'], score: '1' },
                        bad: { df_meas: [null, '1'], df_change: [null, '3'], score: '0' }
                    },
                    condition_indicator_c: {
                        good: { tri_c_meas: ['5', null], score: '3' },
                        fair: { tri_c_meas: ['5', '7'], score: '2' },
                        poor: { tri_c_meas: ['7', '10'], score: '1' },
                        bad: { tri_c_meas: [null, '10'], score: '0' }
                    }
                }
            }
            let table = []
            Object.keys(data.DataShow).forEach(element => {
                Object.keys(data.DataShow[element]).forEach(e => {
                    if (data.DataShow[element][e] === true) {
                        if (data[element][e].toString()) {
                            if (data[element][e].toString() !== "Without tap") {
                                let temp = {
                                    measurement: data.NameOfPos[element][e],
                                    df_ref: (bushings.df_c1 && bushings.df_c1[element] && bushings.df_c1[element][e]) || '',
                                    c_ref: (bushings.cap_c1 && bushings.cap_c1[element] && bushings.cap_c1[element][e]) || '',
                                    insulation: (bushings.insulation_type && bushings.insulation_type[element] && bushings.insulation_type[element][e]) || '',
                                    test_voltage: '',
                                    df_meas: '',
                                    c_meas: '',
                                    df_change: '',
                                    tri_c_meas: '',
                                    assessment: '',
                                    condition_indicator_df: '',
                                    condition_indicator_c: '',
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
                    option: 'Custom',
                    data: {
                        iec: {
                            oip: {
                                df_meas: 0.7,
                                tri_c_meas: 5
                            },
                            rip: {
                                df_meas: 0.7,
                                tri_c_meas: 5
                            },
                            rbp: {
                                df_meas: 1.5,
                                tri_c_meas: 5
                            }
                        },
                        ieee: {
                            oip: {
                                df_meas: 0.5,
                                tri_c_meas: 5
                            },
                            rip: {
                                df_meas: 0.85,
                                tri_c_meas: 5
                            },
                            rbp: {
                                df_meas: 2,
                                tri_c_meas: 5
                            }
                        },
                        custom: {
                            oip: {
                                df_meas: 0.5,
                                tri_c_meas: 5
                            },
                            rip: {
                                df_meas: 0.85,
                                tri_c_meas: 5
                            },
                            rbp: {
                                df_meas: 2,
                                tri_c_meas: 5
                            }
                        }
                    }
                },
                // dữ liệu cấu hình indicator
                condition_indicator_df: {
                    good: {
                        df_meas: ['0.4', null],
                        df_change: ['1.3', null],
                        score: '3'
                    },
                    fair: {
                        df_meas: ['0.4', '0.7'],
                        df_change: ['1.3', '2'],
                        score: '2'
                    },
                    poor: {
                        df_meas: ['0.7', '1'],
                        df_change: ['2', '3'],
                        score: '1'
                    },
                    bad: {
                        df_meas: [null, '1'],
                        df_change: [null, '3'],
                        score: '0'
                    }
                },
                // dữ liệu cấu hình indicator C
                condition_indicator_c: {
                    good: { tri_c_meas: ['5', null], score: '3' },
                    fair: { tri_c_meas: ['5', '7'], score: '2' },
                    poor: { tri_c_meas: ['7', '10'], score: '1' },
                    bad: { tri_c_meas: [null, '10'], score: '0' }
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
                        option: 'Custom',
                        data: {
                            iec: {
                                oip: { df_meas: 0.7, tri_c_meas: 5 },
                                rip: { df_meas: 0.7, tri_c_meas: 5 },
                                rbp: { df_meas: 1.5, tri_c_meas: 5 }
                            },
                            ieee: {
                                oip: { df_meas: 0.5, tri_c_meas: 5 },
                                rip: { df_meas: 0.85, tri_c_meas: 5 },
                                rbp: { df_meas: 2, tri_c_meas: 5 }
                            },
                            custom: {
                                oip: { df_meas: 0.5, tri_c_meas: 5 },
                                rip: { df_meas: 0.85, tri_c_meas: 5 },
                                rbp: { df_meas: 2, tri_c_meas: 5 }
                            }
                        }
                    },
                    condition_indicator_df: {
                        good: { df_meas: ['0.4', null], df_change: ['1.3', null], score: '3' },
                        fair: { df_meas: ['0.4', '0.7'], df_change: ['1.3', '2'], score: '2' },
                        poor: { df_meas: ['0.7', '1'], df_change: ['2', '3'], score: '1' },
                        bad: { df_meas: [null, '1'], df_change: [null, '3'], score: '0' }
                    },
                    condition_indicator_c: {
                        good: { tri_c_meas: ['5', null], score: '3' },
                        fair: { tri_c_meas: ['5', '7'], score: '2' },
                        poor: { tri_c_meas: ['7', '10'], score: '1' },
                        bad: { tri_c_meas: [null, '10'], score: '0' }
                    }
                }
            }
            let table = []
            Object.keys(data.DataShow).forEach(element => {
                Object.keys(data.DataShow[element]).forEach(e => {
                    if (data.DataShow[element][e] === true) {
                        if (data[element][e].toString()) {
                            if (data[element][e].toString() !== "Without tap") {
                                let temp = {
                                    measurement: data.NameOfPos[element][e],
                                    df_ref: (bushings.df_c1 && bushings.df_c1[element] && bushings.df_c1[element][e]) || '',
                                    c_ref: (bushings.cap_c1 && bushings.cap_c1[element] && bushings.cap_c1[element][e]) || '',
                                    insulation: (bushings.insulation_type && bushings.insulation_type[element] && bushings.insulation_type[element][e]) || '',
                                    test_voltage: '',
                                    df_meas: '',
                                    c_meas: '',
                                    df_change: '',
                                    tri_c_meas: '',
                                    assessment: '',
                                    condition_indicator_df: '',
                                    condition_indicator_c: '',
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
                    option: 'Custom',
                    data: {
                        iec: {
                            oip: {
                                df_meas: 0.7,
                                tri_c_meas: 5
                            },
                            rip: {
                                df_meas: 0.7,
                                tri_c_meas: 5
                            },
                            rbp: {
                                df_meas: 1.5,
                                tri_c_meas: 5
                            }
                        },
                        ieee: {
                            oip: {
                                df_meas: 0.5,
                                tri_c_meas: 5
                            },
                            rip: {
                                df_meas: 0.85,
                                tri_c_meas: 5
                            },
                            rbp: {
                                df_meas: 2,
                                tri_c_meas: 5
                            }
                        },
                        custom: {
                            oip: {
                                df_meas: 0.5,
                                tri_c_meas: 5
                            },
                            rip: {
                                df_meas: 0.85,
                                tri_c_meas: 5
                            },
                            rbp: {
                                df_meas: 2,
                                tri_c_meas: 5
                            }
                        }
                    }
                },
                // dữ liệu cấu hình indicator
                condition_indicator_df: {
                    good: {
                        df_meas: ['0.4', null],
                        df_change: ['1.3', null],
                        score: '3'
                    },
                    fair: {
                        df_meas: ['0.4', '0.7'],
                        df_change: ['1.3', '2'],
                        score: '2'
                    },
                    poor: {
                        df_meas: ['0.7', '1'],
                        df_change: ['2', '3'],
                        score: '1'
                    },
                    bad: {
                        df_meas: [null, '1'],
                        df_change: [null, '3'],
                        score: '0'
                    }
                },
                // dữ liệu cấu hình indicator C
                condition_indicator_c: {
                    good: { tri_c_meas: ['5', null], score: '3' },
                    fair: { tri_c_meas: ['5', '7'], score: '2' },
                    poor: { tri_c_meas: ['7', '10'], score: '1' },
                    bad: { tri_c_meas: [null, '10'], score: '0' }
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
                table: []
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
                table: []
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
                table: []
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
                table: []
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
        initDga() {
            return {
                code: 'dga',
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
                h2: '',
                ch4: '',
                c2h2: '',
                c2h4: '',
                c2h6: '',
                co: '',
                co2: '',
                tdcg: '',
                status: '',
                condition_indicator: '',
                // dữ liệu cấu hình indicator
                condition_indicator_setting: {
                    good: {
                        h2: [100, null],
                        c2h2: [35, null],
                        c2h4: [50, null],
                        c2h6: [65, null],
                        ch4: [120, null],
                        co: [350, null],
                        tdcg: [720, null],
                        score: 3
                    },
                    fair: {
                        h2: [101, 700],
                        c2h2: [36, 50],
                        c2h4: [51, 100],
                        c2h6: [66, 100],
                        ch4: [121, 400],
                        co: [351, 570],
                        tdcg: [721, 1920],
                        score: 2
                    },
                    poor: {
                        h2: [701, 1800],
                        c2h2: [51, 80],
                        c2h4: [101, 200],
                        c2h6: [101, 150],
                        ch4: [401, 1000],
                        co: [571, 1400],
                        tdcg: [1921, 4630],
                        score: 1
                    },
                    bad: {
                        h2: [null, 1800],
                        c2h2: [null, 80],
                        c2h4: [null, 200],
                        c2h6: [null, 150],
                        ch4: [null, 1000],
                        co: [null, 1400],
                        tdcg: [null, 4630],
                        score: 1
                    }
                }
            }
        },
        initGasChromatography() {
            return {
                option: {},
                code: 'GasChromatography',
                assessment_setting: {
                    option: "IEEEnewTrans",
                    data: {
                    }

                },
                condition_indicator: {
                    good: {
                    },
                    fair: {
                    },
                    poor: {
                    },
                    bad: {
                    }
                },
                table: []
            }
        },
        initDielectricResponseAnalysis() {
            return {
                code: 'DielectricResponseAnalysis',
                table: []
            }
        },
        initInsulationResistanceYokeCore() {
            return {
                code: 'InsulationResistanceYokeCore',
                assessment_setting: {
                    option: "IEEEnewTrans",
                    data: {
                        IEEEnewTrans: {
                            pass: "500"
                        },
                        IEEEserviceTrans: {
                            pass: "100",
                            fail: "10"
                        },
                        custom: {
                            pass: "",
                            fail: ""
                        }
                    }

                },
                condition_indicator: {
                    good: {
                        r60s: [null, 500]
                    },
                    fair: {
                        r60s: [100, 500],
                        r60sref: [50, null]
                    },
                    poor: {
                        r60s: [10, 100],
                        r60sref: [50, null]
                    },
                    bad: {
                        r60s: [10, null]
                    }
                },
                table: []
            }
        },
        initShortCircuitImpedancePrim() {
            const tapChangers = this.tapChangers || {}
            const selectedAsset = this.selectedAsset || []
            const asset = selectedAsset[0] || {}
            let table = []
            let mode = ""
            const phase = ['A', 'B', 'C']
            if (tapChangers.mode === "oltc") {
                mode = "oltc_position"
                if (asset.prim_sec && JSON.parse(asset.prim_sec).length !== 0) {
                    JSON.parse(asset.prim_sec).forEach(element => {
                        phase.forEach(e => {
                            table.push({
                                tap: element.oltc_position,
                                phase: e,
                                ukCal: "",
                                ukDev: "",
                                assessment: "",
                                condition_indicator: ""
                            })
                        })
                    })
                }
            } else {
                mode = "detc_position"
                if (asset.prim_sec && JSON.parse(asset.prim_sec).length !== 0) {
                    JSON.parse(asset.prim_sec).forEach(element => {
                        phase.forEach(e => {
                            table.push({
                                tap: element.detc_position,
                                phase: e,
                                ukCal: "",
                                ukDev: "",
                                assessment: "",
                                condition_indicator: ""
                            })
                        })
                    })
                }
            }

            return {
                code: "ShortCircuitImpedancePrim",
                option: "threePhase",
                mode: mode,
                assessment_setting: {
                    option: "IEEE",
                    data: {
                        ieee: {
                            threePhase: {
                                ukDev: 3
                            },
                            perPhase: {
                                ukDev: 3
                            }
                        },
                        cigre: {
                            threePhase: {
                                ukDev: 2
                            },
                            perPhase: {
                                ukDev: 2
                            }
                        },
                        custom: {
                            threePhase: {
                                ukDev: ""
                            },
                            perPhase: {
                                ukDev: ""
                            }
                        }
                    }
                },
                condition_indicator: {
                    good: {
                        breakdown_voltage: [60, null],
                        score: 4
                    },
                    fair: {
                        breakdown_voltage: [55, 60],
                        score: 3
                    },
                    poor: {
                        breakdown_voltage: [40, 55],
                        score: 2
                    },
                    bad: {
                        breakdown_voltage: [null, 40],
                        score: 1
                    }
                },
                table: table
            }
        },
        initShortCircuitImpedanceSec() {
            const tapChangers = this.tapChangers || {}
            const selectedAsset = this.selectedAsset || []
            const asset = selectedAsset[0] || {}
            let table = []
            let mode = ""
            const phase = ['A', 'B', 'C']
            if (tapChangers.mode === "oltc") {
                mode = "oltc_position"
                if (asset.sec_tert && JSON.parse(asset.sec_tert).length !== 0) {
                    JSON.parse(asset.sec_tert).forEach(element => {
                        phase.forEach(e => {
                            table.push({
                                tap: element.oltc_position,
                                phase: e,
                                ukCal: "",
                                ukDev: "",
                                assessment: "",
                                condition_indicator: ""
                            })
                        })
                    })
                }
            } else {
                mode = "detc_position"
                if (asset.sec_tert && JSON.parse(asset.sec_tert).length !== 0) {
                    JSON.parse(asset.sec_tert).forEach(element => {
                        phase.forEach(e => {
                            table.push({
                                tap: element.detc_position,
                                phase: e,
                                ukCal: "",
                                ukDev: "",
                                assessment: "",
                                condition_indicator: ""
                            })
                        })
                    })
                }
            }

            return {
                code: "ShortCircuitImpedanceSec",
                option: "threePhase",
                mode: mode,
                assessment_setting: {
                    option: "IEEE",
                    data: {
                        ieee: {
                            threePhase: {
                                ukDev: 3
                            },
                            perPhase: {
                                ukDev: 3
                            }
                        },
                        cigre: {
                            threePhase: {
                                ukDev: 2
                            },
                            perPhase: {
                                ukDev: 2
                            }
                        },
                        custom: {
                            threePhase: {
                                ukDev: ""
                            },
                            perPhase: {
                                ukDev: ""
                            }
                        }
                    }
                },
                condition_indicator: {
                    good: {
                        breakdown_voltage: [60, null],
                        score: 4
                    },
                    fair: {
                        breakdown_voltage: [55, 60],
                        score: 3
                    },
                    poor: {
                        breakdown_voltage: [40, 55],
                        score: 2
                    },
                    bad: {
                        breakdown_voltage: [null, 40],
                        score: 1
                    }
                },
                table: table
            }
        },
        initShortCircuitImpedanceTert() {
            const tapChangers = this.tapChangers || {}
            const selectedAsset = this.selectedAsset || []
            const asset = selectedAsset[0] || {}
            let table = []
            let mode = ""
            const phase = ['A', 'B', 'C']
            if (tapChangers.mode === "oltc") {
                mode = "oltc_position"
                if (asset.prim_tert && JSON.parse(asset.prim_tert).length !== 0) {
                    JSON.parse(asset.prim_tert).forEach(element => {
                        phase.forEach(e => {
                            table.push({
                                tap: element.oltc_position,
                                phase: e,
                                ukCal: "",
                                ukDev: "",
                                assessment: "",
                                condition_indicator: ""
                            })
                        })
                    })
                }
            } else {
                mode = "detc_position"
                if (asset.prim_tert && JSON.parse(asset.prim_tert).length !== 0) {
                    JSON.parse(asset.prim_tert).forEach(element => {
                        phase.forEach(e => {
                            table.push({
                                tap: element.detc_position,
                                phase: e,
                                ukCal: "",
                                ukDev: "",
                                assessment: "",
                                condition_indicator: ""
                            })
                        })
                    })
                }
            }

            return {
                code: "ShortCircuitImpedanceTert",
                option: "threePhase",
                mode: mode,
                assessment_setting: {
                    option: "IEEE",
                    data: {
                        ieee: {
                            threePhase: {
                                ukDev: 3
                            },
                            perPhase: {
                                ukDev: 3
                            }
                        },
                        cigre: {
                            threePhase: {
                                ukDev: 2
                            },
                            perPhase: {
                                ukDev: 2
                            }
                        },
                        custom: {
                            threePhase: {
                                ukDev: ""
                            },
                            perPhase: {
                                ukDev: ""
                            }
                        }
                    }
                },
                condition_indicator: {
                    good: {
                        breakdown_voltage: [60, null],
                        score: 4
                    },
                    fair: {
                        breakdown_voltage: [55, 60],
                        score: 3
                    },
                    poor: {
                        breakdown_voltage: [40, 55],
                        score: 2
                    },
                    bad: {
                        breakdown_voltage: [null, 40],
                        score: 1
                    }
                },
                table: table
            }
        }
    }
}
