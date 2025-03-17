export const initTest = async (testTypeCode) => {
    let data = null
    switch (testTypeCode) {
        case 'motorCurrent':
            data = initmotorCurrent()
            break
        case 'cTiming':
            data = initcTiming()
            break
        case 'oTiming':
            data = initoTiming()
            break
        case 'ocTiming':
            data = initocTiming()
            break
        case 'coTiming':
            data = initcoTiming()
            break
        case 'ocoTiming':
            data = initocoTiming()
            break
        case 'cocoTiming':
            data = initcocoTiming()
            break
        case 'ococoTiming':
            data = initococoTiming()
            break
        case 'contactResistance':
            data = initcontactResistance()
            break
        case 'minimumPickup':
            data = initminimumPickup()
            break
        case 'dcWindingTripCoil':
            data = initdcWindingTripCoil()
            break
        case 'dcWindingCloseCoil':
            data = initdcWindingCloseCoil()
            break
        case 'dcWindingMotor':
            data = initdcWindingMotor()
            break
        case 'insulationResistanceCircuit':
            data = initinsulationResistanceCircuit()
            break
        case 'insulationResistanceTripCoil':
            data = initinsulationResistanceTripCoil()
            break
        case 'insulationResistanceCloseCoil':
            data = initinsulationResistanceCloseCoil()
            break
        case 'insulationResistanceMotor':
            data = initinsulationResistanceMotor()
            break
        case 'sf6MoiturePurity':
            data = initsf6MoiturePurity()
            break
        case 'sf6GasAnalysis':
            data = initsf6GasAnalysis()
            break
        case 'pressureGauge':
            data = initpressureGauge()
            break
        case 'overCurrentRelease':
            data = initoverCurrentRelease()
            break
        case 'underVoltageRelease' :
            data = initunderVoltageRelease()
            break
        case 'inspection' :
            data = initinspection()
            break    
    }
    return data
}

function initmotorCurrent() {
    return {
        motorChar : {
            limits : "Absolute",
            abs : [{},{},{},{}],
            rel : [{},{},{},{}], 
        },
        table : []
    }
}
function initcTiming() {
    let table = []
    return {
        limits : "Absolute",
        openTime: {
            abs : [{},{},{},{},{},{},{},{},{}],
            rel : [{},{},{},{},{},{},{},{},{}]
        },
        auxContact : {
            abs : {
                trip : [{},{},{},{},{},{}],
                close : [{},{},{},{},{},{}],
            },
            rel : {
                trip : [{},{},{},{},{},{}],
                close : [{},{},{},{},{},{}],
            }
        }, 
        miscell : {
            abs : [{},{},{},{}],
            rel : [{},{},{},{}], 
        },
        coilCharacter : {
            abs : [{},{},{},{},{},{},{},{}],
            rel : [{},{},{},{},{},{},{},{}], 
        },
        table : table
    }
}
function initoTiming() {
    let table = []
    return {
        limits : "Absolute",
        openTime: {
            abs : [{},{},{},{},{},{},{},{},{}],
            rel : [{},{},{},{},{},{},{},{},{}]
        },
        auxContact : {
            abs : {
                trip : [{},{},{},{},{},{}],
                close : [{},{},{},{},{},{}],
            },
            rel : {
                trip : [{},{},{},{},{},{}],
                close : [{},{},{},{},{},{}],
            }
        }, 
        miscell : {
            abs : [{},{},{},{}],
            rel : [{},{},{},{}], 
        },
        coilCharacter : {
            abs : [{},{},{},{},{},{},{},{}],
            rel : [{},{},{},{},{},{},{},{}], 
        },
        table : table
    }
}
async function initocTiming() {
    let table = []
    return {
        limits : "Absolute",
        openTime: {
            abs : [{},{},{},{},{},{},{},{},{}],
            rel : [{},{},{},{},{},{},{},{},{}]
        },
        auxContact : {
            abs : {
                trip : [{},{},{},{},{},{}],
                close : [{},{},{},{},{},{}],
            },
            rel : {
                trip : [{},{},{},{},{},{}],
                close : [{},{},{},{},{},{}],
            }
        }, 
        miscell : {
            abs : [{},{},{},{}],
            rel : [{},{},{},{}], 
        },
        coilCharacter : {
            abs : [{},{},{},{},{},{},{},{}],
            rel : [{},{},{},{},{},{},{},{}], 
        },
        table : table
    }
}
function initcoTiming() {
    let table = []
    return {
        limits : "Absolute",
        openTime: {
            abs : [{},{},{},{},{},{},{},{},{}],
            rel : [{},{},{},{},{},{},{},{},{}]
        },
        auxContact : {
            abs : {
                trip : [{},{},{},{},{},{}],
                close : [{},{},{},{},{},{}],
            },
            rel : {
                trip : [{},{},{},{},{},{}],
                close : [{},{},{},{},{},{}],
            }
        }, 
        miscell : {
            abs : [{},{},{},{}],
            rel : [{},{},{},{}], 
        },
        coilCharacter : {
            abs : [{},{},{},{},{},{},{},{}],
            rel : [{},{},{},{},{},{},{},{}], 
        },
        table : table
    }
}
async function initocoTiming() {
    // async function getTable(table) {
    //     for(let i =0; i <operating.numberTripCoil; i ++) {
    //         table.push([])
    //     }
    //     table.forEach(element => {
    //         for(let j=0; j < circuitBreaker.numberOfInterruptPhase * circuitBreaker.numberOfPhase; j++) {
    //             element.push({})
    //         }
    //     })
    //     return table
    // }
    // let circuitBreaker = JSON.parse(this.selectedAsset[0].circuitBreaker)
    // let operating = JSON.parse(this.selectedAsset[0].operating)
    let table = []
    // table = await getTable(table)
    return {
        limits : "Absolute",
        openTime: {
            abs : [{},{},{},{},{},{},{},{},{}],
            rel : [{},{},{},{},{},{},{},{},{}]
        },
        auxContact : {
            abs : {
                trip : [{},{},{},{},{},{}],
                close : [{},{},{},{},{},{}],
            },
            rel : {
                trip : [{},{},{},{},{},{}],
                close : [{},{},{},{},{},{}],
            }
        }, 
        miscell : {
            abs : [{},{},{},{}],
            rel : [{},{},{},{}], 
        },
        coilCharacter : {
            abs : [{},{},{},{},{},{},{},{}],
            rel : [{},{},{},{},{},{},{},{}], 
        },
        table : table
    }
}
function initcocoTiming() {
    // let circuitBreaker = JSON.parse(this.selectedAsset[0].circuitBreaker)
    let table = []
    // for(let i =0; i <circuitBreaker.numberOfPhase; i ++) {
    //     table.push({})
    // }
    return {
        limits : "Absolute",
        openTime: {
            abs : [{},{},{},{},{},{},{},{},{}],
            rel : [{},{},{},{},{},{},{},{},{}]
        },
        auxContact : {
            abs : {
                trip : [{},{},{},{},{},{}],
                close : [{},{},{},{},{},{}],
            },
            rel : {
                trip : [{},{},{},{},{},{}],
                close : [{},{},{},{},{},{}],
            }
        }, 
        miscell : {
            abs : [{},{},{},{}],
            rel : [{},{},{},{}], 
        },
        coilCharacter : {
            abs : [{},{},{},{},{},{},{},{}],
            rel : [{},{},{},{},{},{},{},{}], 
        },
        table : table
    }
}
function initococoTiming() {
    // let circuitBreaker = JSON.parse(this.selectedAsset[0].circuitBreaker)
    let table = []
    // for(let i =0; i <circuitBreaker.numberOfPhase; i ++) {
    //     table.push({})
    // }
    return {
        limits : "Absolute",
        openTime: {
            abs : [{},{},{},{},{},{},{},{},{}],
            rel : [{},{},{},{},{},{},{},{},{}]
        },
        auxContact : {
            abs : {
                trip : [{},{},{},{},{},{}],
                close : [{},{},{},{},{},{}],
            },
            rel : {
                trip : [{},{},{},{},{},{}],
                close : [{},{},{},{},{},{}],
            }
        }, 
        miscell : {
            abs : [{},{},{},{}],
            rel : [{},{},{},{}], 
        },
        coilCharacter : {
            abs : [{},{},{},{},{},{},{},{}],
            rel : [{},{},{},{},{},{},{},{}], 
        },
        table : table
    }
}
function initcontactResistance() {
    // let circuitBreaker = JSON.parse(this.selectedAsset[0].circuitBreaker)
    let table = []
    // for(let i=0; i < circuitBreaker.numberOfInterruptPhase * circuitBreaker.numberOfPhase; i++) {
    //     table.push({})
    // }
    return {
        table : table
    }
}
function initminimumPickup() {
    let table = []
    return {
        limits : 'Absolute',
        table : table
    }
}
function initdcWindingTripCoil() {
    let table = []
    return {
        limits : 'Absolute',
        table : table
    }
}
function initdcWindingCloseCoil() {
    let table = []
    return {
        limits : 'Absolute',
        table : table
    }
}
function initdcWindingMotor() {
    let table = []
    return {
        limits : 'Absolute',
        table : table
    }
}
function initinsulationResistanceCircuit() {
    // let circuitBreaker = JSON.parse(this.selectedAsset[0].circuitBreaker)
    let table = []
    // for(let i =0; i <circuitBreaker.numberOfPhase; i ++) {
    //     if(i%circuitBreaker.numberOfPhase === 0) {
    //         table.push({
    //             measure : "Phase A - (B+C+GND)"
    //         })
    //     } else if(i%circuitBreaker.numberOfPhase === 1) {
    //         table.push({
    //             measure : "Phase B - (A+C+GND)"
    //         })
    //     } else {
    //         table.push({
    //             measure : "Phase C - (A+B+GND)"
    //         })
    //     }
    // }
    return {
        assessment : {
            abs : {},
            rel : {}
        },
        limits : 'Absolute',
        table : table
    }
}
function initinsulationResistanceTripCoil() {
    // let circuitBreaker = JSON.parse(this.selectedAsset[0].circuitBreaker)
    let table = []
    // for(let i =0; i <circuitBreaker.numberOfPhase; i ++) {
    //     table.push({})
    // }
    return {
        assessment : {
            abs : {},
            rel : {}
        },
        limits : 'Absolute',
        table : table
    }
}
function initinsulationResistanceCloseCoil() {
    // let circuitBreaker = JSON.parse(this.selectedAsset[0].circuitBreaker)
    let table = []
    // for(let i =0; i <circuitBreaker.numberOfPhase; i ++) {
    //     table.push({})
    // }
    return {
        assessment : {
            abs : {},
            rel : {}
        },
        limits : 'Absolute',
        table : table
    }
}
function initinsulationResistanceMotor() {
    // let circuitBreaker = JSON.parse(this.selectedAsset[0].circuitBreaker)
    let table = []
    // for(let i =0; i <circuitBreaker.numberOfPhase; i ++) {
    //     table.push({})
    // }
    return {
        assessment : {
            abs : {},
            rel : {}
        },
        limits : 'Absolute',
        table : table
    }
}
function initsf6MoiturePurity() {
    let table = []
    // let data = ["moitureTable", "purityTable"]
    // let table = {}
    // data.forEach(element => {
    //     table[element] = []
    // })
    return {
        assessment : {
            abs : {},
            rel : {}
        },
        limits : 'Absolute',
        table : table
    }
}
function initsf6GasAnalysis() {
    // let data = ["decomSf6Table", "so2Sof2Table", "hfTable"]
    let table = {}
    // data.forEach(element => {
    //     table[element] = []
    // })
    return {
        assessment : {
            abs : {},
            rel : {}
        },
        limits : 'Absolute',
        table : table
    }
}
function initpressureGauge() {
    // let data = ["pressureGaugeTable"]
    let table = {}
    // data.forEach(element => {
    //     table[element] = []
    // })
    return {
        assessment : {
            abs : {},
            rel : {}
        },
        limits : 'Absolute',
        table : table
    }
}
function initoverCurrentRelease() {
    return {
        table : []
    }
}
function initunderVoltageRelease() {
    return {
        table : []
    }
}
function initinspection() {
    let table = []
    const data = ['Nameplate', 'Installation check', 'Grounding check', 'SF6 pressure check', 'Mechanical operating', 'Close at 75% control voltage',
    'Ground frame', 'Open at 70% control voltage', 'Checking local control', 'Checking remote control',  'Check interlocking circuit by SF6 gas pressure',
    'Check contact resistance of auxiliary contacts']
    data.forEach(element => {
        table.push({
            items : element,
            assessment : '',
            condition_indicator : ''
        })
    })
    return {
        table
    }
}