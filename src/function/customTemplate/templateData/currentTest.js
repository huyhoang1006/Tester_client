

export const initTest = async (testTypeCode) => {
    let data = null
    switch (testTypeCode) {
        case 'InsulationResistance':
            data = initInsulationResistance()
            break
        case 'CTRatio':
            data = await initCTRatio()
            break
        case 'CTExcitation':
            data = await initCTExcitation()
            break
        case 'CTWindingRes':
            data = await initCTWindingRes()
            break
        case 'CTDfcap':
            data = await initCTDfcap()
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
async function initCTRatio() {
    let table = []
    return {
        table
    }
}
async function initCTExcitation() {
    let table = []
    return {
        table
    }
}
async function initCTWindingRes() {
    let table = []
    return {
        table
    }
}

async function initCTDfcap() {
    let table = [
    ]
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

