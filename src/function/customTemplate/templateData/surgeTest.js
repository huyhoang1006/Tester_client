

export const initTest = async (testTypeCode) => {
    let data = null
    switch (testTypeCode) {
        case 'InsulationResistance':
            data = initInsulationResistance()
            break
        case 'LeakageCurrent':
            data = await initLeakageCurrent()
            break
        case 'PowerFrequency':
            data = await initPowerFrequency()
            break
        case 'GeneralInspection':
            data = await initGeneralInspection()
            break
    }

    return data
}
async function initInsulationResistance() {
    let table = []
    return {
        table
    }
}
async function initLeakageCurrent() {
    let table = []
    return {
        table
    }
}
async function initPowerFrequency() {
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

