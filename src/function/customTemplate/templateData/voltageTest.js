export const initTest = async (testTypeCode) => {
    let data = null
    switch (testTypeCode) {
        case 'InsulationResistance':
            data = initInsulationResistance()
            break
        case 'VTRatio':
            data = await initVTRatio()
            break
        case 'DcWindingRes':
            data = await initDcWindingRes()
            break
        case 'VTDfcap':
            data = await initVTDfcap()
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
            measurement : "Prim - (Sec + GND)",
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
async function initVTRatio() {

    let table = []
    return {
        table
    }
}
async function initDcWindingRes() {
    let table = []
    return {
        table
    }
}
async function initVTDfcap() {
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

