export const initTest = async (testTypeCode) => {
    let data = null
    switch (testTypeCode) {
        case 'InsulationResistance':
            data = await initInsulationResistance()
            break
        case 'DcVoltageOverSheath':
            data = await initDcVoltageOverSheath()
            break
        case 'AcVoltageInsulation':
            data = await initAcVoltageInsulation()
            break
        case 'DcVoltageInsulation':
            data = await initDcVoltageInsulation()
            break
        case 'VlfTest':
            data = await initVlfTest()
            break
        case 'TandeltaVlfSource':
            data = await initTandeltaVlfSource()
            break
        case 'TandeltaPowerAcSource':
            data = await initTandeltaPowerAcSource()
            break
        case 'ParticalDischarge':
            data = await initParticalDischarge()
            break
        case 'GeneralInspection':
            data = await initGeneralInspection()
            break
    }
    return data
}

async function initInsulationResistance() {
    let table = [
        {
            measurement : "Phase A-(B+C+GND)",
            test_voltage : '',
            beforeHv : "",
            afterHv : "",
            assessment : '',
            condition_indicator : ''
        },
        {
            measurement : "Phase B-(A+C+GND)",
            test_voltage : '',
            beforeHv : "",
            afterHv : "",
            assessment : '',
            condition_indicator : ''
        },
        {
            measurement : "Phase C-(A+B+GND)",
            test_voltage : '',
            beforeHv : "",
            afterHv : "",
            assessment : '',
            condition_indicator : ''
        }
    ]
    return {
        table
    }
}
async function initDcVoltageOverSheath() {
    let table = [
        {
            measurement : "Phase A-(B+C+GND)",
            test_voltage : '',
            duration : '',
            assessment : '',
            condition_indicator : ''
        },
        {
            measurement : "Phase B-(A+C+GND)",
            test_voltage : '',
            duration : '',
            assessment : '',
            condition_indicator : ''
        },
        {
            measurement : "Phase C-(A+B+GND)",
            test_voltage : '',
            duration : '',
            assessment : '',
            condition_indicator : ''
        }
    ]
    return {
        table
    }
}
async function initAcVoltageInsulation() {
    let table = [
        {
            measurement : "Phase A-(B+C+GND)",
            test_voltage : '',
            frequency : '',
            duration : '',
            assessment : '',
            condition_indicator : ''
        },
        {
            measurement : "Phase B-(A+C+GND)",
            test_voltage : '',
            frequency : '',
            duration : '',
            assessment : '',
            condition_indicator : ''
        },
        {
            measurement : "Phase C-(A+B+GND)",
            test_voltage : '',
            frequency : '',
            duration : '',
            assessment : '',
            condition_indicator : ''
        }
    ]
    return {
        table
    }
}
async function initDcVoltageInsulation() {
    let table = [
        {
            measurement : "Phase A-(B+C+GND)",
            test_voltage : '',
            leakage : '',
            duration : '',
            assessment : '',
            condition_indicator : ''
        },
        {
            measurement : "Phase B-(A+C+GND)",
            test_voltage : '',
            leakage : '',
            duration : '',
            assessment : '',
            condition_indicator : ''
        },
        {
            measurement : "Phase C-(A+B+GND)",
            test_voltage : '',
            leakage : '',
            duration : '',
            assessment : '',
            condition_indicator : ''
        }
    ]
    return {
        table
    }
}
async function initVlfTest() {
    let table = [
        {
            measurement : "Phase A-(B+C+GND)",
            test_voltage : '',
            leakage : '',
            assessment : '',
            condition_indicator : ''
        },
        {
            measurement : "Phase B-(A+C+GND)",
            test_voltage : '',
            leakage : '',
            assessment : '',
            condition_indicator : ''
        },
        {
            measurement : "Phase C-(A+B+GND)",
            test_voltage : '',
            leakage : '',
            assessment : '',
            condition_indicator : ''
        }
    ]
    return {
        vlfSetting : {},
        table
    }
}
async function initTandeltaVlfSource() {
    let table = []
        for(let i= 0; i<9; i++) {
            let data = {
                measurement : "Phase A-(B+C+GND)",
                test_voltage_label : "0.5",
                test_voltage : '',
                capacitance : '',
                mtd : '',
                dtd_eachstep : '',
                dtdu : '',
                tdts : '',
                assessment : '',
                condition_indicator : ''
            }
            if(i%3==0) {
                data.test_voltage_label = '0.5'
            } else if(i%3==1) {
                data.test_voltage_label = '1.0'
            } else {
                data.test_voltage_label = '1.5'
            }
            if(i/3==1) {
                data.measurement = "Phase B-(A+C+GND)"
            }
            else if(i/3 == 2) {
                data.measurement = "Phase C-(A+B+GND)"
            }
            table.push(data)
        }
        return {
            vlfSetting : {},
            table
        }
}
async function initTandeltaPowerAcSource() {
    let table = [
        {
            measurement : "Phase A-(B+C+GND)",
            test_voltage : '',
            frequency : '',
            duration : '',
            tandelta : '',
            assessment : '',
            condition_indicator : ''
        },
        {
            measurement : "Phase B-(A+C+GND)",
            test_voltage : '',
            frequency : '',
            duration : '',
            tandelta : '',
            assessment : '',
            condition_indicator : ''
        },
        {
            measurement : "Phase C-(A+B+GND)",
            test_voltage : '',
            frequency : '',
            duration : '',
            tandelta : '',
            assessment : '',
            condition_indicator : ''
        }
    ]
    return {
        table
    }
}
async function initParticalDischarge() {
    let table = []
    return {
        table
    }
}
async function initGeneralInspection() {
    let table = []
    return {
        table
    }
}

