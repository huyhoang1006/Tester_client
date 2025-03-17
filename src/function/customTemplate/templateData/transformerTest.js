export const initTest = async (testTypeCode) => {
    let data = null
    switch (testTypeCode) {
        case 'InsulationResistance':
            data = initInsulationResistance()
            break
        case 'RatioPrimSec':
            data = initRatioPrimSec()
            break
        case 'DcWindingPrim':
            data = initDcWindingPrim()
            break
        case 'DcWindingSec':
            data = initDcWindingSec()
            break
        case 'DcWindingTert':
            data = initDcWindingTert()
            break
        case 'MeasurementOfOil':
            data = initMeasurementOfOil()
            break
        case 'ExcitingCurrent':
            data = initExcitingCurrent()
            break
        case 'WindingDfCap':
            data = initWindingDfCap()
            break
        case 'BushingPrimC1':
            data = initBushingPrimC1()
            break
        case 'BushingPrimC2':
            data = initBushingPrimC2()
            break
        case 'Dga':
            data = initDga()
            break
        case 'InsulationResistanceYokeCore':
            data = initInsulationResistanceYokeCore()
            break
        case 'ShortCircuitImpedancePrim':
            data = initShortCircuitImpedancePrim()
            break
        case 'ShortCircuitImpedanceSec':
            data = initShortCircuitImpedanceSec()
            break
        case 'ShortCircuitImpedanceTert':
            data = initShortCircuitImpedanceTert()
            break
    }
    return data
}

function initInsulationResistance() {
    const data = {
        code: 'insulationresistance',
        t: '',
        megohmmeter: '',
        top_oil_temperature: '',
        bottom_oil_temperature: '',
        winding_temperature: '',
        reference_temperature : '',
        ambient_temperature: '',
        humidity: '',
        weather: '',
        model: '',
        serial_no: '',
        calibration_date: '',
        comment : '',
        table: [],
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
                        prim: '69',
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
    return data
}
function initExcitingCurrent() {
    let table = []
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
}
function initRatioPrimSec() {
    let table = []

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
                iec: {ratio_dev: 0.5},
                ieee: {ratio_dev: 0.5},
                custom: {ratio_dev: 0.5}
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
function initDcWindingPrim() {
    let table = []

    return {
        code: 'DcWindingPrim',
        measurement_of_winding: '',
        top_oil_temperature: '',
        bottom_oil_temperature: '',
        winding_temperature: '',
        reference_temperature : '',
        ambient_temperature: '',
        humidity: '',
        weather: '',
        model: '',
        serial_no: '',
        calibration_date: '',
        comment : '',
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
}
function initDcWindingSec() {
    let table = []

    return {
        code: 'DcWindingSec',
        measurement_of_winding: '',
        top_oil_temperature: '',
        bottom_oil_temperature: '',
        winding_temperature: '',
        reference_temperature : '',
        ambient_temperature: '',
        humidity: '',
        weather: '',
        model: '',
        serial_no: '',
        calibration_date: '',
        comment : '',
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
}
function initDcWindingTert() {
    let table = []

    return {
        code: 'DcWindingTert',
        measurement_of_winding: '',
        top_oil_temperature: '',
        bottom_oil_temperature: '',
        winding_temperature: '',
        reference_temperature : '',
        ambient_temperature: '',
        humidity: '',
        weather: '',
        model: '',
        serial_no: '',
        calibration_date: '',
        comment : '',
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
}
function initMeasurementOfOil() {
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
                iec: {voltage: 0.5},
                ieee: {voltage: 0.5},
                custom: {voltage: 0.5}
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
}
function initWindingDfCap() {

    return {
        code: 'WindingDfCap',
        option : '',
        top_oil_temperature: '',
        bottom_oil_temperature: '',
        winding_temperature: '',
        reference_temperature : '',
        ambient_temperature: '',
        humidity: '',
        weather: '',
        model: '',
        serial_no: '',
        calibration_date: '',
        comment : '',
        table: [],
        // dữ liệu cấu hình assessment
        assessment_setting: {
            option: 'IEEEnewLiquid',
            data: {
                IEEEnewLiquid: {
                    mineral : {
                        celc25 : {
                            df_meas :  0.05,
                            tri_c_meas : 5
                        },
                        celc100 : {
                            df_meas : 0.4,
                            tri_c_meas : 5
                        }
                    },
                    lfh : {
                        celc25 : {
                            df_meas : 0.1,
                            tri_c_meas : 5
                        },
                        celc100 : {
                            df_meas : 1,
                            tri_c_meas : 5
                        }
                    },
                    silicone : {
                        celc25 : {
                            df_meas : 0.1,
                            tri_c_meas : 5
                        },
                        celc100 : {
                            df_meas : "-",
                            tri_c_meas : 5
                        }
                    },
                    naturalEaster : {
                        celc25 : {
                            df_meas : 0.5,
                            tri_c_meas : 5
                        },
                        celc100 : {
                            df_meas : "-",
                            tri_c_meas : 5
                        }
                    },
                },
                IEEEserviceLiquid: {
                    mineral : {
                        celc25 : {
                            df_meas :  0.5,
                            tri_c_meas : 5
                        },
                        celc100 : {
                            df_meas : 5,
                            tri_c_meas : 5
                        }
                    },
                    lfh : {
                        celc25 : {
                            df_meas : 1,
                            tri_c_meas : 5
                        },
                        celc100 : {
                            df_meas : "-",
                            tri_c_meas : 5
                        }
                    },
                    silicone : {
                        celc25 : {
                            df_meas : 0.2,
                            tri_c_meas : 5
                        },
                        celc100 : {
                            df_meas : "-",
                            tri_c_meas : 5
                        }
                    },
                    naturalEaster : {
                        celc25 : {
                            df_meas : 0.5,
                            tri_c_meas : 5
                        },
                        celc100 : {
                            df_meas : "-",
                            tri_c_meas : 5
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
            good: {df_meas: ['0.5', null], score: '3'},
            fair: {df_meas: ['0.5', '1'], score: '2'},
            poor: {df_meas: ['1', '1.5'], score: '1'},
            bad: {df_meas: [null, '1.5'], score: '0'}
        },
        // dữ liệu cấu hình indicator C
        condition_indicator_c: {
            good: {tri_c_meas: ['5', null], score: '3'},
            fair: {tri_c_meas: ['5', '7'], score: '2'},
            poor: {tri_c_meas: ['7', '10'], score: '1'},
            bad: {tri_c_meas: [null, '10'], score: '0'}
        }
    }
}
function initBushingPrimC1() {
    let table = []
    return {
        code: 'BushingPrimC1',
        top_oil_temperature: '',
        bottom_oil_temperature: '',
        winding_temperature: '',
        reference_temperature : '',
        ambient_temperature: '',
        humidity: '',
        weather: '',
        model: '',
        serial_no: '',
        calibration_date: '',
        comment : '',
        table: table,
        // dữ liệu cấu hình assessment
        assessment_setting: {
            option: 'Custom',
            data: {
                iec: {
                    oip : {
                        df_meas: 0.7,
                        tri_c_meas: 5
                    },
                    rip : {
                        df_meas: 0.7,
                        tri_c_meas: 5
                    },
                    rbp : {
                        df_meas: 1.5,
                        tri_c_meas: 5
                    }
                },
                ieee: {
                    oip : {
                        df_meas: 0.5,
                        tri_c_meas: 5
                    },
                    rip : {
                        df_meas: 0.85,
                        tri_c_meas: 5
                    },
                    rbp : {
                        df_meas: 2,
                        tri_c_meas: 5
                    }
                },
                custom: {
                    oip : {
                        df_meas: 0.5,
                        tri_c_meas: 5
                    },
                    rip : {
                        df_meas: 0.85,
                        tri_c_meas: 5
                    },
                    rbp : {
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
            good: {tri_c_meas: ['5', null], score: '3'},
            fair: {tri_c_meas: ['5', '7'], score: '2'},
            poor: {tri_c_meas: ['7', '10'], score: '1'},
            bad: {tri_c_meas: [null, '10'], score: '0'}
        }
    }
}
function initBushingPrimC2() {
    let table = []
    return {
        code: 'BushingPrimC2',
        top_oil_temperature: '',
        bottom_oil_temperature: '',
        winding_temperature: '',
        reference_temperature : '',
        ambient_temperature: '',
        humidity: '',
        weather: '',
        model: '',
        serial_no: '',
        calibration_date: '',
        comment : '',
        table: table,
        // dữ liệu cấu hình assessment
        assessment_setting: {
            option: 'Custom',
            data: {
                iec: {
                    oip : {
                        df_meas: 0.7,
                        tri_c_meas: 5
                    },
                    rip : {
                        df_meas: 0.7,
                        tri_c_meas: 5
                    },
                    rbp : {
                        df_meas: 1.5,
                        tri_c_meas: 5
                    }
                },
                ieee: {
                    oip : {
                        df_meas: 0.5,
                        tri_c_meas: 5
                    },
                    rip : {
                        df_meas: 0.85,
                        tri_c_meas: 5
                    },
                    rbp : {
                        df_meas: 2,
                        tri_c_meas: 5
                    }
                },
                custom: {
                    oip : {
                        df_meas: 0.5,
                        tri_c_meas: 5
                    },
                    rip : {
                        df_meas: 0.85,
                        tri_c_meas: 5
                    },
                    rbp : {
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
            good: {tri_c_meas: ['5', null], score: '3'},
            fair: {tri_c_meas: ['5', '7'], score: '2'},
            poor: {tri_c_meas: ['7', '10'], score: '1'},
            bad: {tri_c_meas: [null, '10'], score: '0'}
        }
    }
}
function initDga() {
    return {
        code: 'dga',
        top_oil_temperature: '',
        bottom_oil_temperature: '',
        winding_temperature: '',
        reference_temperature : '',
        ambient_temperature: '',
        humidity: '',
        weather: '',
        model: '',
        serial_no: '',
        calibration_date: '',
        comment : '',
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
}

function initInsulationResistanceYokeCore() {
    return {
        code: 'InsulationResistanceYokeCore',
        assessment_setting : {
            option : "IEEEnewTrans",
            data : {
                IEEEnewTrans : {
                    pass : "500"
                },
                IEEEserviceTrans : {
                    pass : "100" ,
                    fail : "10"
                },
                custom : {
                    pass : "",
                    fail : ""
                }
            }
            
        },
        condition_indicator : {
            good : {
                r60s : [null, 500]
            },
            fair : {
                r60s : [100, 500],
                r60sref : [50, null]
            },
            poor : {
                r60s : [10, 100],
                r60sref : [50, null]
            },
            bad : {
                r60s : [10, null]
            }
        },
        table: []
    }
}
function initShortCircuitImpedancePrim() {
    let table = []
    let mode = ""
    
    return {
        code : "ShortCircuitImpedancePrim",
        option : "threePhase",
        mode : mode,
        assessment_setting : {
            option : "IEEE",
            data : {
                ieee : {
                    threePhase : {
                        ukDev : 3
                    },
                    perPhase : {
                        ukDev : 3 
                    }
                },
                cigre : {
                    threePhase : {
                        ukDev : 2
                    },
                    perPhase : {
                        ukDev : 2 
                    }
                },
                custom : {
                    threePhase : {
                        ukDev : ""
                    },
                    perPhase : {
                        ukDev : "" 
                    }
                }
            }
        },
        condition_indicator : {
            good : {
                breakdown_voltage : [60, null],
                score : 4
            },
            fair : {
                breakdown_voltage : [55, 60],
                score : 3
            },
            poor : {
                breakdown_voltage : [40, 55],
                score : 2
            },
            bad : {
                breakdown_voltage : [null , 40],
                score : 1
            }
        },
        table : table
    }
}
function initShortCircuitImpedanceSec() {
    let table = []
    let mode = ""
    return {
        code : "ShortCircuitImpedanceSec",
        option : "threePhase",
        mode : mode,
        assessment_setting : {
            option : "IEEE",
            data : {
                ieee : {
                    threePhase : {
                        ukDev : 3
                    },
                    perPhase : {
                        ukDev : 3 
                    }
                },
                cigre : {
                    threePhase : {
                        ukDev : 2
                    },
                    perPhase : {
                        ukDev : 2 
                    }
                },
                custom : {
                    threePhase : {
                        ukDev : ""
                    },
                    perPhase : {
                        ukDev : "" 
                    }
                }
            }
        },
        condition_indicator : {
            good : {
                breakdown_voltage : [60, null],
                score : 4
            },
            fair : {
                breakdown_voltage : [55, 60],
                score : 3
            },
            poor : {
                breakdown_voltage : [40, 55],
                score : 2
            },
            bad : {
                breakdown_voltage : [null , 40],
                score : 1
            }
        },
        table : table
    }
}
function initShortCircuitImpedanceTert() {
    let table = []
    let mode = ""
    return {
        code : "ShortCircuitImpedanceTert",
        option : "threePhase",
        mode : mode,
        assessment_setting : {
            option : "IEEE",
            data : {
                ieee : {
                    threePhase : {
                        ukDev : 3
                    },
                    perPhase : {
                        ukDev : 3 
                    }
                },
                cigre : {
                    threePhase : {
                        ukDev : 2
                    },
                    perPhase : {
                        ukDev : 2 
                    }
                },
                custom : {
                    threePhase : {
                        ukDev : ""
                    },
                    perPhase : {
                        ukDev : "" 
                    }
                }
            }
        },
        condition_indicator : {
            good : {
                breakdown_voltage : [60, null],
                score : 4
            },
            fair : {
                breakdown_voltage : [55, 60],
                score : 3
            },
            poor : {
                breakdown_voltage : [40, 55],
                score : 2
            },
            bad : {
                breakdown_voltage : [null , 40],
                score : 1
            }
        },
        table : table
    }
}