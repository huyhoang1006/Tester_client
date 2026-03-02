export default {
    data() {
        return {}
    },
    methods: {
        // eslint-disable-next-line no-unused-vars
        async initTest(testTypeCode, _assetData) {
            let data = null
            switch (testTypeCode) {
                case 'InsulationResistance':
                    data = this.initInsulationResistance()
                    break
                case 'CTRatio':
                    data = await this.initCTRatio()
                    break
                case 'CTExcitation':
                    data = await this.initCTExcitation()
                    break
                case 'CTWindingRes':
                    data = await this.initCTWindingRes()
                    break
                case 'CTDfcap':
                    data = await this.initCTDfcap()
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
                    name: 'V test',
                    code: 'v_test',
                    unit: 'V',
                    type: 'analog',
                }
                ,
                {
                    mrid: '',
                    name: 'R60s',
                    code: 'r60s',
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
                        value: 'Prim - (Sec + GND)',
                        unit: '',
                        type: 'string'
                    },
                    v_test: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },
                    r60s: {
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
                }
            ]
            let measurementProcedure = []
            return {
                table,
                row_data,
                measurementProcedure
            }
        },
        async initCTRatio() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Name',
                    code: 'name',
                    unit: '',
                    type: 'string',

                },
                {
                    mrid: '',
                    name: 'IPR',
                    code: 'ipr',
                    unit: 'A',
                    type: 'analog',
                }
                ,
                {
                    mrid: '',
                    name: 'ISR',
                    code: 'isr',
                    unit: 'A',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Ratio meas',
                    code: 'ratio_meas',
                    unit: '',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'Ratio dev',
                    code: 'ratio_dev',
                    unit: '',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'Polarity',
                    code: 'polarity',
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
            let table = []
            let measurementProcedure = []
            return {
                table,
                row_data,
                measurementProcedure
            }
        },
        async initCTExcitation() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Name',
                    code: 'name',
                    unit: '',
                    type: 'string',

                },
                {
                    mrid: '',
                    name: 'I knee',
                    code: 'iknee',
                    unit: 'A',
                    type: 'analog',
                }
                ,
                {
                    mrid: '',
                    name: 'V knee',
                    code: 'vknee',
                    unit: 'V',
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
            let table = []
            let measurementProcedure = []
            return {
                table,
                row_data,
                measurementProcedure
            }
        },
        async initCTWindingRes() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Name',
                    code: 'name',
                    unit: '',
                    type: 'string',

                },
                {
                    mrid: '',
                    name: 'R meas',
                    code: 'rmeas',
                    unit: 'Ω',
                    type: 'analog',
                }
                ,
                {
                    mrid: '',
                    name: 'R ref',
                    code: 'rref',
                    unit: 'Ω',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'R corr',
                    code: 'rcorr',
                    unit: 'Ω',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'R dev',
                    code: 'rdev',
                    unit: '%',
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
            let table = []
            let measurementProcedure = []
            return {
                table,
                row_data,
                measurementProcedure
            }
        },
        async initCTDfcap() {
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
                    name: 'Test mode',
                    code: 'testMode',
                    unit: '',
                    type: 'string',
                }
                ,
                {
                    mrid: '',
                    name: 'Test voltage',
                    code: 'test_voltage',
                    unit: 'kV',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'DF ref',
                    code: 'dfref',
                    unit: '%',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'C ref',
                    code: 'cref',
                    unit: 'pF',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'DF meas',
                    code: 'dfmeas',
                    unit: '%',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'C meas',
                    code: 'cmeas',
                    unit: 'pF',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: '△C cal',
                    code: 'ccal',
                    unit: '%',
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
                        value: 'C H-G',
                        unit: '',
                        type: 'string'
                    },
                    testMode: {
                        mrid: '',
                        value: 'GST',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'kV',
                        type: 'analog'
                    },
                    dfref: {
                        mrid: '',
                        value: '',
                        unit: '%',
                        type: 'analog'
                    },
                    cref: {
                        mrid: '',
                        value: '',
                        unit: 'pF',
                        type: 'analog'
                    },
                    dfmeas: {
                        mrid: '',
                        value: '',
                        unit: '%',
                        type: 'analog'
                    },
                    cmeas: {
                        mrid: '',
                        value: '',
                        unit: 'pF',
                        type: 'analog'
                    },
                    ccal: {
                        mrid: '',
                        value: '',
                        unit: '%',
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
                table,
                row_data,
                measurementProcedure
            }
        },
        async initGeneralInspection() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Items',
                    code: 'items',
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
                    items: {
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
                    items: {
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
                    items: {
                        mrid: '',
                        value: 'Insulation surface',
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
                    items: {
                        mrid: '',
                        value: 'Ground frame',
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
                    items: {
                        mrid: '',
                        value: 'Terminal box',
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
                    items: {
                        mrid: '',
                        value: 'Marking of terminals',
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
                    items: {
                        mrid: '',
                        value: 'Oil check',
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
            let measurementProcedure = []
            return {
                table,
                row_data,
                measurementProcedure
            }
        }
    }
}
