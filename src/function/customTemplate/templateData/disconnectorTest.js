export const initTest = async (testTypeCode) => {
    let data = null
    switch (testTypeCode) {
        case 'InsulationResistance':
            data = initInsulationResistance()
            break
        case 'ContactResistance':
            data = await initContactResistance()
            break
        case 'InsulationResMotor':
            data = await initInsulationResMotor()
            break
        case 'DcWindingMotor':
            data = await initDcWindingMotor()
            break
        case 'OperatingTest':
            data = await initOperatingTest()
            break
        case 'ControlCheck':
            data = await initControlCheck()
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
            r60s : '',
            assessment : '',
            condition_indicator : ''
        },
        {
            measurement : "Phase B-(A+C+GND)",
            test_voltage : '',
            r60s : '',
            assessment : '',
            condition_indicator : ''
        },
        {
            measurement : "Phase C-(A+B+GND)",
            test_voltage : '',
            r60s : '',
            assessment : '',
            condition_indicator : ''
        }
    ]
    
    return {
        table
    }
}
async function initContactResistance() {
    let table = [
        {
            measurement : "Main contact",
            itest : "",
            contactResistance : "",
            assessment : "",
            condition_indicator : ""
        },
        {
            measurement : "Earth switch",
            itest : "",
            contactResistance : "",
            assessment : "",
            condition_indicator : ""
        }
    ]
    return {
        table
    }
}
async function initInsulationResMotor() {
    let table = []
    return {
        table
    }
}
async function initDcWindingMotor() {
    return {
        table : []
    }
}
async function initOperatingTest() {
    let table = [
        {
            measurement : "Main contact",
            workingTime : "",
            assessment : "",
            condition_indicator : ""
        },
        {
            measurement : "Earth switch",
            workingTime : "",
            assessment : "",
            condition_indicator : ""
        }
    ]
    return {
        table
    }
}
async function initControlCheck() {
    return {
        table : []
    }
}
async function initGeneralInspection() {
    let table = []
    return {
        table
    }
}

