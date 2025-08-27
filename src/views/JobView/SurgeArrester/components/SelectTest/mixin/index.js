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
            let table = [
                {
                    mrid : '',
                    measurement : {
                        mrid : '',
                        value : 'Phase A - GND',
                        unit : ''
                    },
                    vTest : {
                        mrid : '',
                        value : '',
                        unit : 'V'
                    },
                    r60s : {
                        mrid : '',
                        value : '',
                        unit : 'M|Ω'
                    },
                    assessment : {
                        mrid : '',
                        value : '',
                        unit : ''
                    },
                    condition_indicator : {
                        mrid : '',
                        value : '',
                        unit : ''
                    }
                },
                {
                    mrid : '',
                    measurement : {
                        mrid : '',
                        value : 'Phase B - GND',
                        unit : ''
                    },
                    vTest : {
                        mrid : '',
                        value : '',
                        unit : 'V'
                    },
                    r60s : {
                        mrid : '',
                        value : '',
                        unit : 'M|Ω'
                    },
                    assessment : {
                        mrid : '',
                        value : '',
                        unit : ''
                    },
                    condition_indicator : {
                        mrid : '',
                        value : '',
                        unit : ''
                    }
                },
                {
                    mrid : '',
                    measurement : {
                        mrid : '',
                        value : 'Phase C - GND',
                        unit : ''
                    },
                    vTest : {
                        mrid : '',
                        value : '',
                        unit : 'V'
                    },
                    r60s : {
                        mrid : '',
                        value : '',
                        unit : 'M|Ω'
                    },
                    assessment : {
                        mrid : '',
                        value : '',
                        unit : ''
                    },
                    condition_indicator : {
                        mrid : '',
                        value : '',
                        unit : ''
                    }
                },
                {
                    mrid : '',
                    measurement : {
                        mrid : '',
                        value : "Base - GND",
                        unit : ''
                    },
                    vTest : {
                        mrid : '',
                        value : '',
                        unit : 'V'
                    },
                    r60s : {
                        mrid : '',
                        value : '',
                        unit : 'M|Ω'
                    },
                    assessment : {
                        mrid : '',
                        value : '',
                        unit : ''
                    },
                    condition_indicator : {
                        mrid : '',
                        value : '',
                        unit : ''
                    }
                }
            ]
            return {
                table
            }
        },
        async initLeakageCurrent(assetData) {
            let units = assetData.unit_count || 0
            let phase = ["A", "B", "C"]
            let table = []
            for(let i in phase) {
                for(let j = 1; j <= units; j ++) {
                    let data = {
                        phase : {
                            mrid : '',
                            value : phase[i],
                            unit : ''
                        },
                        unit_no : {
                            mrid : '',
                            value : j,
                            unit : ''
                        },
                        vTest : {
                            mrid : '',
                            value : '',
                            unit : 'V'
                        },
                        iMeas : {
                            mrid : '',
                            value : '',
                            unit : 'm|A'
                        },
                        assessment : {
                            mrid : '',
                            value : '',
                            unit : ''
                        },
                        condition_indicator : {
                            mrid : '',
                            value : '',
                            unit : ''
                        }
                    }
                    table.push(data)
                }
            }
            return {
                table
            }
        },
        async initPowerFrequency(assetData) {
            let units = assetData.unit_count || 0
            let phase = ["A", "B", "C"]
            let table = []
            for(let i in phase) {
                for(let j = 1; j <= units; j ++) {
                    let data = {
                        phase : {
                            mrid : '',
                            value : phase[i],
                            unit : ''
                        },
                        unit_no : {
                            mrid : '',
                            value : j,
                            unit : ''
                        },
                        refCurrent : {
                            mrid : '',
                            value : '',
                            unit : 'm|A'
                        },
                        vmeas : {
                            mrid : '',
                            value : '',
                            unit : 'k|V'
                        },
                        assessment : {
                            mrid : '',
                            value : '',
                            unit : ''
                        },
                        condition_indicator : {
                            mrid : '',
                            value : '',
                            unit : ''
                        }
                    }
                    table.push(data)
                }
            }
            return {
                table
            }
        },
        async initGeneralInspection() {
            let table = []
            const data = ['Nameplate', 'Installation check', 'Grounding check', 'Discharge counter check']
            data.forEach(element => {
                table.push({
                    items : {
                        mrid : '',
                        value : element,
                        unit : ''
                    },
                    assessment : {
                        mrid : '',
                        value : '',
                        unit : ''
                    },
                    condition_indicator : {
                        mrid : '',
                        value : '',
                        unit : ''
                    }
                })
            })
            return {
                table
            }
        }
    }
}
