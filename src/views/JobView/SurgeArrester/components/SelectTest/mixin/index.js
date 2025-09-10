export default {
    data() {
        return {}
    },
    methods: {
        async initTest(testTypeCode, assetData) {
            let data = null
            switch (testTypeCode) {
                case 'InsulationResistance':
                    data = this.initInsulationResistance()
                    break
                case 'GeneralInspection':
                    data = await this.initGeneralInspection()
                    break
                case 'LeakageCurrent':
                    data = await this.initLeakageCurrent(assetData)
                    break
                case 'PowerFrequency':
                    data = await this.initPowerFrequency(assetData)
                    break
            }
            return data
        },
        async initInsulationResistance() {
            const row_data = [
                {
                    mrid : '',
                    name : 'Measurement',
                    code : 'measurement',
                    unit : '',
                    type : 'string',

                },
                {
                    mrid : '',
                    name : 'V test',
                    code : 'v_test',
                    unit : 'V',
                    type : 'analog',
                }
                ,
                {
                    mrid : '',
                    name : 'R60s',
                    code : 'r60s',
                    unit : 'M|Ω',
                    type : 'analog',
                },
                {
                    mrid : '',
                    name : 'Assessment',
                    code : 'assessment',
                    type : 'discrete',
                    pool : {
                        mrid : '',
                        valueToAlias : [{mrid : '', value : 0, alias_name : 'Fail'}, {mrid : '', value : 1, alias_name : 'Pass'}]
                    }

                },
                {
                    mrid : '',
                    name : 'Condition indicator',
                    code : 'condition_indicator',
                    type : 'discrete',
                    pool : {
                        mrid : '',
                        valueToAlias : [{mrid : '', value : 0, alias_name : 'Bad'}, {mrid : '', value : 1, alias_name : 'Poor'},
                        {mrid : '', value : 2, alias_name : 'Fair'}, {mrid : '', value : 3, alias_name : 'Good'}]
                    }
                }
            ]
            let table = [
                {
                    mrid : '',
                    measurement : {
                        mrid : '',
                        value : 'Phase A - GND',
                        unit : '',
                        type : 'string'
                    },
                    v_test : {
                        mrid : '',
                        value : '',
                        unit : 'V',
                        type : 'analog'
                    },
                    r60s : {
                        mrid : '',
                        value : '',
                        unit : 'M|Ω',
                        type : 'analog'
                    },
                    assessment : {
                        mrid : '',
                        value : '',
                        unit : '',
                        type : 'discrete'
                    },
                    condition_indicator : {
                        mrid : '',
                        value : '',
                        unit : '',
                        type : 'discrete'
                    }
                },
                {
                    mrid : '',
                    measurement : {
                        mrid : '',
                        value : 'Phase B - GND',
                        unit : '',
                        type : 'string'
                    },
                    v_test : {
                        mrid : '',
                        value : '',
                        unit : 'V',
                        type : 'analog'
                    },
                    r60s : {
                        mrid : '',
                        value : '',
                        unit : 'M|Ω',
                        type : 'analog'
                    },
                    assessment : {
                        mrid : '',
                        value : '',
                        unit : '',
                        type : 'discrete'
                    },
                    condition_indicator : {
                        mrid : '',
                        value : '',
                        unit : '',
                        type : 'discrete'
                    }
                },
                {
                    mrid : '',
                    measurement : {
                        mrid : '',
                        value : 'Phase C - GND',
                        unit : '',
                        type : 'string'
                    },
                    v_test : {
                        mrid : '',
                        value : '',
                        unit : 'V',
                        type : 'analog'
                    },
                    r60s : {
                        mrid : '',
                        value : '',
                        unit : 'M|Ω',
                        type : 'analog'
                    },
                    assessment : {
                        mrid : '',
                        value : '',
                        unit : '',
                        type : 'discrete'
                    },
                    condition_indicator : {
                        mrid : '',
                        value : '',
                        unit : '',
                        type : 'discrete'
                    }
                },
                {
                    mrid : '',
                    measurement : {
                        mrid : '',
                        value : "Base - GND",
                        unit : '',
                        type : 'string'
                    },
                    v_test : {
                        mrid : '',
                        value : '',
                        unit : 'V',
                        type : 'analog'
                    },
                    r60s : {
                        mrid : '',
                        value : '',
                        unit : 'M|Ω',
                        type : 'analog'
                    },
                    assessment : {
                        mrid : '',
                        value : '',
                        unit : '',
                        type : 'discrete'
                    },
                    condition_indicator : {
                        mrid : '',
                        value : '',
                        unit : '',
                        type : 'discrete'
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
        async initLeakageCurrent(assetData) {
            let units = assetData.unit_count || 0
            let phase = ["A", "B", "C"]
            let table = []
            const row_data = [
                {
                    mrid : '',
                    name : 'Phase',
                    code : 'phase',
                    type : 'string',
                },
                {
                    mrid : '',
                    name : 'Unit number',
                    code : 'unit_no',
                    type : 'analog',
                }
                ,
                {
                    mrid : '',
                    name : 'V test',
                    code : 'v_test',
                    type : 'analog',
                },
                {
                    mrid : '',
                    name : 'I measurement',
                    code : 'i_meas',
                    type : 'analog',
                },
                {
                    mrid : '',
                    name : 'Assessment',
                    code : 'assessment',
                    type : 'discrete',
                    pool : {
                        mrid : '',
                        valueToAlias : [{mrid : '', value : 0, alias_name : 'Fail'}, {mrid : '', value : 1, alias_name : 'Pass'}]
                    }
                },
                {
                    mrid : '',
                    name : 'Condition indicator',
                    code : 'condition_indicator',
                    type : 'discrete',
                    pool : {
                        mrid : '',
                        valueToAlias : [{mrid : '', value : 0, alias_name : 'Bad'}, {mrid : '', value : 1, alias_name : 'Poor'},
                            {mrid : '', value : 2, alias_name : 'Fair'}, {mrid : '', value : 3, alias_name : 'Good'}]
                    }
                }
            ]
            for(let i in phase) {
                for(let j = 1; j <= units; j ++) {
                    let data = {
                        phase : {
                            mrid : '',
                            value : phase[i],
                            unit : '',
                            type : 'string'
                        },
                        unit_no : {
                            mrid : '',
                            value : j,
                            unit : '',
                            type : 'analog'
                        },
                        v_test : {
                            mrid : '',
                            value : '',
                            unit : 'V',
                            type : 'analog'
                        },
                        i_meas : {
                            mrid : '',
                            value : '',
                            unit : 'm|A',
                            type : 'analog'
                        },
                        assessment : {
                            mrid : '',
                            value : '',
                            unit : '',
                            type : 'discrete'
                        },
                        condition_indicator : {
                            mrid : '',
                            value : '',
                            unit : '',
                            type : 'discrete'
                        }
                    }
                    table.push(data)
                }
            }
            let measurementProcedure = []
            return {
                table,
                row_data,
                measurementProcedure
            }
        },
        async initPowerFrequency(assetData) {
            let units = assetData.unit_count || 0
            let phase = ["A", "B", "C"]
            let table = []
            const row_data = [
                {
                    mrid : '',
                    name : 'Phase',
                    code : 'phase',
                    type : 'string',
                },
                {
                    mrid : '',
                    name : 'Unit number',
                    code : 'unit_no',
                    type : 'analog',
                }
                ,
                {
                    mrid : '',
                    name : 'Reference current',
                    code : 'ref_current',
                    type : 'analog',
                },
                {
                    mrid : '',
                    name : 'V measurement',
                    code : 'v_meas',
                    type : 'analog',
                },
                {
                    mrid : '',
                    name : 'Assessment',
                    code : 'assessment',
                    type : 'discrete',
                    pool : {
                        mrid : '',
                        valueToAlias : [
                            {mrid : '', value : 0, alias_name : 'Fail'},
                            {mrid : '', value : 1, alias_name : 'Pass'}
                        ]
                    }
                },
                {
                    mrid : '',
                    name : 'Condition indicator',
                    code : 'condition_indicator',
                    type : 'discrete',
                    pool : {
                        mrid : '',
                        valueToAlias : [
                            {mrid : '', value : 0, alias_name : 'Bad'},
                            {mrid : '', value : 1, alias_name : 'Poor'},
                            {mrid : '', value : 2, alias_name : 'Fair'},
                            {mrid : '', value : 3, alias_name : 'Good'}
                        ]
                    }
                }
            ] 
            for(let i in phase) {
                for(let j = 1; j <= units; j ++) {
                    let data = {
                        phase : {
                            mrid : '',
                            value : phase[i],
                            unit : '',
                            type : 'string'
                        },
                        unit_no : {
                            mrid : '',
                            value : j,
                            unit : '',
                            type : 'analog'
                        },
                        ref_current : {
                            mrid : '',
                            value : '',
                            unit : 'm|A',
                            type : 'analog'
                        },
                        v_meas : {
                            mrid : '',
                            value : '',
                            unit : 'k|V',
                            type : 'analog'
                        },
                        assessment : {
                            mrid : '',
                            value : '',
                            unit : '',
                            type : 'discrete'
                        },
                        condition_indicator : {
                            mrid : '',
                            value : '',
                            unit : '',
                            type : 'discrete'
                        }
                    }
                    table.push(data)
                }
            }
            let measurementProcedure = []
            return {
                table,
                row_data,
                measurementProcedure
            }
        },
        async initGeneralInspection() {
            let table = []
            const data = ['Nameplate', 'Installation check', 'Grounding check', 'Discharge counter check']
            let row_data = [
                {
                    mrid : '',
                    name : 'Items',
                    code : 'items',
                    type : 'string',
                },
                {
                    mrid : '',
                    name : 'Assessment',
                    code : 'assessment',
                    type : 'discrete',
                    pool : {
                        mrid : '',
                        valueToAlias : [
                            {mrid : '', value : 0, alias_name : 'Fail'},
                            {mrid : '', value : 1, alias_name : 'Pass'}
                        ]
                    }
                },
                {
                    mrid : '',
                    name : 'Condition indicator',
                    code : 'condition_indicator',
                    type : 'discrete',
                    pool : {
                        mrid : '',
                        valueToAlias : [
                            {mrid : '', value : 0, alias_name : 'Bad'},
                            {mrid : '', value : 1, alias_name : 'Poor'},
                            {mrid : '', value : 2, alias_name : 'Fair'},
                            {mrid : '', value : 3, alias_name : 'Good'}
                        ]
                    }
                }
            ]
            data.forEach(element => {
                table.push({
                    items : {
                        mrid : '',
                        value : element,
                        unit : '',
                        type : 'string'
                    },
                    assessment : {
                        mrid : '',
                        value : '',
                        unit : '',
                        type : 'discrete'
                    },
                    condition_indicator : {
                        mrid : '',
                        value : '',
                        unit : '',
                        type : 'discrete'
                    }
                })
            })
            let measurementProcedure = []
            return {
                table,
                row_data,
                measurementProcedure
            }
        }
    }
}
