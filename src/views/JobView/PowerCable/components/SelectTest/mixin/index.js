
export default {
    data() {
        return {}
    },
    methods: {
        async initTest(testTypeCode) {
            let data = null
            switch (testTypeCode) {
                case 'InsulationResistance':
                    data = this.initInsulationResistance()
                    break
                case 'DcVoltageOverSheath':
                    data = await this.initDcVoltageOverSheath()
                    break
                case 'AcVoltageInsulation':
                    data = await this.initAcVoltageInsulation()
                    break
                case 'DcVoltageInsulation':
                    data = await this.initDcVoltageInsulation()
                    break
                case 'VlfTest':
                    data = await this.initVlfTest()
                    break
                case 'TandeltaVlfSource':
                    data = await this.initTandeltaVlfSource()
                    break
                case 'TandeltaPowerAcSource':
                    data = await this.initTandeltaPowerAcSource()
                    break
                case 'ParticalDischarge':
                    data = await this.initParticalDischarge()
                    break
                case 'GeneralInspection':
                    data = await this.initGeneralInspection()
                    break
            }

            return data
        },
        async initInsulationResistance() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Measurement',
                    code: 'measurement',
                    unit: '',
                    type: 'string',

                },
                {
                    mrid: '',
                    name: 'Test voltage',
                    code: 'test_voltage',
                    unit: 'V',
                    type: 'analog',
                }
                ,
                {
                    mrid: '',
                    name: 'Before HV test',
                    code: 'beforeHv',
                    unit: 'M|Ω',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'After HV test',
                    code: 'afterHv',
                    unit: 'M|Ω',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
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
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = [
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase A-(B+C+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },
                    beforeHv: {
                        mrid: '',
                        value: '',
                        unit: 'M|Ω',
                        type: 'analog'
                    },
                    afterHv: {
                        mrid: '',
                        value: '',
                        unit: 'M|Ω',
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
                },
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase B-(A+C+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },
                    beforeHv: {
                        mrid: '',
                        value: '',
                        unit: 'M|Ω',
                        type: 'analog'
                    },
                    afterHv: {
                        mrid: '',
                        value: '',
                        unit: 'M|Ω',
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
                },
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase C-(A+B+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },
                    beforeHv: {
                        mrid: '',
                        value: '',
                        unit: 'M|Ω',
                        type: 'analog'
                    },
                    afterHv: {
                        mrid: '',
                        value: '',
                        unit: 'M|Ω',
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
                },
            ]
            let measurementProcedure = []
            return {
                row_data,
                measurementProcedure,
                table
            }
        },
        async initDcVoltageOverSheath() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Measurement',
                    code: 'measurement',
                    unit: '',
                    type: 'string',

                },
                {
                    mrid: '',
                    name: 'Test voltage',
                    code: 'test_voltage',
                    unit: 'k|V',
                    type: 'analog',
                }
                ,
                {
                    mrid: '',
                    name: 'Test duration',
                    code: 'test_duration',
                    unit: 'min',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
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
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = [
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase A-(B+C+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },
                    test_duration: {
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
                },
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase B-(A+C+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },
                    test_duration: {
                        mrid: '',
                        value: '',
                        unit: 'min',
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
                },
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase C-(A+B+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },
                    test_duration: {
                        mrid: '',
                        value: '',
                        unit: 'min',
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
                },
            ]
            let measurementProcedure = []
            return {
                row_data,
                measurementProcedure,
                table
            }
        },
        async initAcVoltageInsulation() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Measurement',
                    code: 'measurement',
                    unit: '',
                    type: 'string',

                },
                {
                    mrid: '',
                    name: 'Test voltage',
                    code: 'test_voltage',
                    unit: 'k|V',
                    type: 'analog',
                }
                ,
                {
                    mrid: '',
                    name: 'Frequency',
                    code: 'frequency',
                    unit: 'Hz',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Test duration ',
                    code: 'test_duration',
                    unit: 'min',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
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
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = [
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase A-(B+C+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },

                    frequency: {
                        mrid: '',
                        value: '',
                        unit: 'Hz',
                        type: 'analog'
                    },
                    test_duration: {
                        mrid: '',
                        value: '',
                        unit: 'min',
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
                },
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase B-(A+C+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },

                    frequency: {
                        mrid: '',
                        value: '',
                        unit: 'Hz',
                        type: 'analog'
                    },
                    test_duration: {
                        mrid: '',
                        value: '',
                        unit: 'min',
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
                },
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase C-(A+B+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },

                    frequency: {
                        mrid: '',
                        value: '',
                        unit: 'Hz',
                        type: 'analog'
                    },
                    test_duration: {
                        mrid: '',
                        value: '',
                        unit: 'min',
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
                },
            ]
            return {
                row_data,
                measurementProcedure: [],
                table

            }
        },
        async initDcVoltageInsulation() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Measurement',
                    code: 'measurement',
                    unit: '',
                    type: 'string',

                },
                {
                    mrid: '',
                    name: 'Test voltage',
                    code: 'test_voltage',
                    unit: 'k|V',
                    type: 'analog',
                }
                ,

                {
                    mrid: '',
                    name: 'Test duration ',
                    code: 'test_duration',
                    unit: 'min',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Leakage current',
                    code: 'leakage_current',
                    unit: 'm|A',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
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
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = [
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase A-(B+C+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },

                    test_duration: {
                        mrid: '',
                        value: '',
                        unit: 'min',
                        type: 'analog'
                    },
                    leakage_current: {
                        mrid: '',
                        value: '',
                        unit: 'm|A',
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
                },
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase B-(A+C+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },

                    test_duration: {
                        mrid: '',
                        value: '',
                        unit: 'min',
                        type: 'analog'
                    },
                    leakage_current: {
                        mrid: '',
                        value: '',
                        unit: 'm|A',
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
                },
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase C-(B+A+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },
                    test_duration: {
                        mrid: '',
                        value: '',
                        unit: 'min',
                        type: 'analog'
                    },
                    leakage_current: {
                        mrid: '',
                        value: '',
                        unit: 'm|A',
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
                },

            ]
            return {
                row_data,
                measurementProcedure: [],
                table
            }
        },
        async initVlfTest() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Measurement',
                    code: 'measurement',
                    unit: '',
                    type: 'string',

                },
                {
                    mrid: '',
                    name: 'Test voltage',
                    code: 'test_voltage',
                    unit: 'k|V',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Leakage current ',
                    code: 'leakage_current',
                    unit: 'm|A',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
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
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = [
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase A-(B+C+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },

                    leakage_current: {
                        mrid: '',
                        value: '',
                        unit: 'm|A',
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
                },
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase B-(A+C+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },

                    leakage_current: {
                        mrid: '',
                        value: '',
                        unit: 'm|A',
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
                },
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase C-(B+A+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },

                    leakage_current: {
                        mrid: '',
                        value: '',
                        unit: 'm|A',
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
                },

            ]
            return {
                row_data,
                measurementProcedure: [],
                vlfSetting: {},
                table
            }
        },
        async initTandeltaVlfSource() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Measurement',
                    code: 'measurement',
                    unit: '',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'Test voltage label',
                    code: 'test_voltage_label',
                    unit: 'k|V',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'Test voltage',
                    code: 'test_voltage',
                    unit: 'k|V',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Capacitance',
                    code: 'capacitance',
                    unit: 'p|F',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'MTD',
                    code: 'mtd',
                    unit: 's',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'DTD each step',
                    code: 'dtd_eachstep',
                    unit: 's',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'DTDU',
                    code: 'dtdu',
                    unit: 's',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'TDTS',
                    code: 'tdts',
                    unit: 's',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
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
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                },
            ]
            let table = []
            for (let i = 0; i < 9; i++) {
                let data = {
                    measurement: {
                        mrid: '',
                        value: "Phase A-(B+C+GND)",
                        unit: '',
                        type: 'string'
                    },
                    test_voltage_label: {
                        mrid: '',
                        value: "0.5",
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'k|V',
                        type: 'analog'
                    },
                    capacitance: {
                        mrid: '',
                        value: '',
                        unit: 'p|F',
                        type: 'analog'
                    },
                    mtd: {
                        mrid: '',
                        value: '',
                        unit: 's',
                        type: 'analog'
                    },
                    dtd_eachstep: {
                        mrid: '',
                        value: '',
                        unit: 's',
                        type: 'analog'
                    },
                    dtdu: {
                        mrid: '',
                        value: '',
                        unit: 's',
                        type: 'analog'
                    },
                    tdts: {
                        mrid: '',
                        value: '',
                        unit: 's',
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
                if (i % 3 == 0) {
                    data.test_voltage_label = '0.5'
                } else if (i % 3 == 1) {
                    data.test_voltage_label = '1.0'
                } else {
                    data.test_voltage_label = '1.5'
                }
                if (i / 3 == 1) {
                    data.measurement = "Phase B-(A+C+GND)"
                }
                else if (i / 3 == 2) {
                    data.measurement = "Phase C-(A+B+GND)"
                }
                table.push(data)
            }
            let measurementProcedure = []
            return {
                row_data,
                vlfSetting: {},
                table,
                measurementProcedure
            }
        },
        async initTandeltaPowerAcSource() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Measurement',
                    code: 'measurement',
                    unit: '',
                    type: 'string',

                },
                {
                    mrid: '',
                    name: 'Test voltage',
                    code: 'test_voltage',
                    unit: 'kV',
                    type: 'analog',
                }
                ,
                {
                    mrid: '',
                    name: 'Frequency',
                    code: 'frequency',
                    unit: 'Hz',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Test duration ',
                    code: 'test_duration',
                    unit: 's',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Tan delta  ',
                    code: 'tan_delta ',
                    unit: '10-3',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
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
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = [
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase A-(B+C+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },

                    frequency: {
                        mrid: '',
                        value: '',
                        unit: 'Hz',
                        type: 'analog'
                    },
                    test_duration: {
                        mrid: '',
                        value: '',
                        unit: 's',
                        type: 'analog'
                    },
                    tan_delta: {
                        mrid: '',
                        value: '',
                        unit: '10-3',
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
                },
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase B-(A+C+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },

                    frequency: {
                        mrid: '',
                        value: '',
                        unit: 'Hz',
                        type: 'analog'
                    },
                    test_duration: {
                        mrid: '',
                        value: '',
                        unit: 's',
                        type: 'analog'
                    },
                    tan_delta: {
                        mrid: '',
                        value: '',
                        unit: '10-3',
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
                },
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase C-(B+A+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },

                    frequency: {
                        mrid: '',
                        value: '',
                        unit: 'Hz',
                        type: 'analog'
                    },
                    test_duration: {
                        mrid: '',
                        value: '',
                        unit: 's',
                        type: 'analog'
                    },
                    tan_delta: {
                        mrid: '',
                        value: '',
                        unit: '10-3',
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
                },

            ]
            return {
                row_data,
                measurementProcedure: [],
                table
            }
        },
        async initParticalDischarge() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Measurement',
                    code: 'measurement',
                    unit: '',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'Test voltage',
                    code: 'test_voltage',
                    unit: 'kV',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'R60s',
                    code: 'r60s',
                    unit: 'mΩ',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
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
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = [
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase A-(B+C+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'k|V',
                        type: 'analog'
                    },
                    r60s: {
                        mrid: '',
                        value: '',
                        unit: 'm|Ω',
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
                },
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase B-(A+C+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'k|V',
                        type: 'analog'
                    },
                    r60s: {
                        mrid: '',
                        value: '',
                        unit: 'm|Ω',
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
                },
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Phase C-(A+B+GND)',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'k|V',
                        type: 'analog'
                    },
                    r60s: {
                        mrid: '',
                        value: '',
                        unit: 'm|Ω',
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
            return {
                row_data,
                measurementProcedure: [],
                table
            }
        },
        async initGeneralInspection() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Item',
                    code: 'item',
                    unit: '',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
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
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = [
                {
                    mrid: '',
                    item: {
                        mrid: '',
                        value: 'Nameplate',
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
                },
                {
                    mrid: '',
                    item: {
                        mrid: '',
                        value: 'Installation check',
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
                },
                {
                    mrid: '',
                    item: {
                        mrid: '',
                        value: 'Grounding check',
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
                }
            ]
            return {
                row_data,
                measurementProcedure: [],
                table
            }
        }
    }
}