import { mapState } from 'vuex'

export default {
    data() {
        return {}
    },
    computed: mapState(['selectedAsset', 'selectedJob']),
    async beforeMount() {},
    methods: {
        async initTest(testTypeCode) {
            let data = null
            switch (testTypeCode) {
                case 'motorCurrent':
                    data = this.initmotorCurrent()
                    break
                case 'cTiming':
                    data = await this.initcTiming()
                    break
                case 'oTiming':
                    data = await this.initoTiming()
                    break
                case 'ocTiming':
                    data = await this.initocTiming()
                    break
                case 'coTiming':
                    data = await this.initcoTiming()
                    break
                case 'ocoTiming':
                    data = await this.initocoTiming()
                    break
                case 'cocoTiming':
                    data = await this.initcocoTiming()
                    break
                case 'ococoTiming':
                    data = await this.initococoTiming()
                    break
                case 'contactResistance':
                    data = await this.initcontactResistance()
                    break
                case 'minimumPickup':
                    data = await this.initminimumPickup()
                    break
                case 'dcWindingTripCoil':
                    data = await this.initdcWindingTripCoil()
                    break
                case 'dcWindingCloseCoil':
                    data = await this.initdcWindingCloseCoil()
                    break
                case 'dcWindingMotor':
                    data = await this.initdcWindingMotor()
                    break
                case 'insulationResistanceCircuit':
                    data = await this.initinsulationResistanceCircuit()
                    break
                case 'insulationResistanceTripCoil':
                    data = await this.initinsulationResistanceTripCoil()
                    break
                case 'insulationResistanceCloseCoil':
                    data = await this.initinsulationResistanceCloseCoil()
                    break
                case 'insulationResistanceMotor':
                    data = await this.initinsulationResistanceMotor()
                    break
                case 'sf6MoiturePurity':
                    data = await this.initsf6MoiturePurity()
                    break
                case 'sf6GasAnalysis':
                    data = await this.initsf6GasAnalysis()
                    break
                case 'pressureGauge':
                    data = await this.initpressureGauge()
                    break
                case 'overCurrentRelease':
                    data = await this.initoverCurrentRelease()
                    break
                case 'underVoltageRelease' :
                    data = await this.initunderVoltageRelease()
                    break
                case 'inspection' :
                    data = await this.initinspection()
                    break    
            }

            return data
        },
        initmotorCurrent() {
            return {
                motorChar : {
                    limits : "Absolute",
                    abs : [{},{},{},{}],
                    rel : [{},{},{},{}], 
                },
                table : [
                    {
                        inrushCurrent: '',
                        charging: '',
                        chargingCurrent: '',
                        miniVoltage: '',
                        assessment: '',
                        condition_indicator: ''
                    }
                ]
            }
        },
        async initcTiming() {
            let circuitBreaker = JSON.parse(this.selectedAsset[0].circuitBreaker)
            let operating = JSON.parse(this.selectedAsset[0].operating)
            let table = []
            let phase = ["A", "B", "C"]
            for(let i =0; i <operating.numberCloseCoil; i ++) {
                table.push([])
            }

            table.forEach(element => {
                for(let i=0; i < circuitBreaker.numberOfPhase; i++) {
                    for(let j=0; j < circuitBreaker.numberOfInterruptPhase; j++) {
                        element.push({
                            phase : phase[i],
                            assessment : ''
                        })
                    }      
                }
            })
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
        },
        async initoTiming() {
            let circuitBreaker = JSON.parse(this.selectedAsset[0].circuitBreaker)
            let operating = JSON.parse(this.selectedAsset[0].operating)
            let table = []
            let phase = ["A", "B", "C"]
            for(let i =0; i <operating.numberTripCoil; i ++) {
                table.push([])
            }

            table.forEach(element => {
                for(let i=0; i < circuitBreaker.numberOfPhase; i ++) {
                    for(let j=0; j < circuitBreaker.numberOfInterruptPhase; j++) {
                        element.push({
                            phase : phase[i],
                            assessment : ''
                        })
                    }
                }
            })
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
        },
        async initocTiming() {
            async function getTable(table) {
                let phase = ["A", "B", "C"]
                for(let i =0; i <operating.numberTripCoil; i ++) {
                    table.push([])
                }
                table.forEach(element => {
                    for(let i=0; i < circuitBreaker.numberOfPhase; i ++) {
                        for(let j=0; j < circuitBreaker.numberOfInterruptPhase; j++) {
                            element.push({
                                phase : phase[i], 
                                assessment: '',
                            })
                        }
                    }
                })
                return table
            }
            let circuitBreaker = JSON.parse(this.selectedAsset[0].circuitBreaker)
            let operating = JSON.parse(this.selectedAsset[0].operating)
            let table = []
            table = await getTable(table)
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
        },
        async initcoTiming() {
            let circuitBreaker = JSON.parse(this.selectedAsset[0].circuitBreaker)
            let operating = JSON.parse(this.selectedAsset[0].operating)
            let phase = ["A", "B", "C"]
            let table = []
            for(let i =0; i <operating.numberCloseCoil; i ++) {
                table.push([])
            }
            table.forEach(element => {
                for(let i=0; i < circuitBreaker.numberOfPhase; i ++) {
                    for(let j=0; j < circuitBreaker.numberOfInterruptPhase; j++) {
                        element.push({
                            phase : phase[i],
                            assessment : ''
                        })
                    }
                }
            })
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
        },
        async initocoTiming() {
            async function getTable(table) {
                let phase = ["A", "B", "C"]
                for(let i =0; i <operating.numberTripCoil; i ++) {
                    table.push([])
                }
                table.forEach(element => {
                    for(let i=0; i < circuitBreaker.numberOfPhase; i ++) {
                        for(let j=0; j < circuitBreaker.numberOfInterruptPhase; j++) {
                            element.push({
                                assessment : '',
                                phase : phase[i]
                            })
                        }
                    }
                })
                return table
            }
            let circuitBreaker = JSON.parse(this.selectedAsset[0].circuitBreaker)
            let operating = JSON.parse(this.selectedAsset[0].operating)
            let table = []
            table = await getTable(table)
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
        },
        async initcocoTiming() {
            let circuitBreaker = JSON.parse(this.selectedAsset[0].circuitBreaker)
            let table = []
            let phase = ["A", "B", "C"]
            for(let i =0; i <circuitBreaker.numberOfPhase; i ++) {
                table.push({
                    phase : phase[i],
                    assessment : ""
                })
            }
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
        },
        async initococoTiming() {
            let circuitBreaker = JSON.parse(this.selectedAsset[0].circuitBreaker)
            let table = []
            let phase = ["A", "B", "C"]
            for(let i =0; i <circuitBreaker.numberOfPhase; i ++) {
                table.push({
                    assessment : "",
                    phase : phase[i]
                })
            }
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
        },
        async initcontactResistance() {
            let circuitBreaker = JSON.parse(this.selectedAsset[0].circuitBreaker)
            let table = []
            let phase = ["A", "B", "C"]
            for(let i=0; i < circuitBreaker.numberOfPhase; i ++) {
                for(let j=0; j < circuitBreaker.numberOfInterruptPhase; j++) {
                    table.push({
                        assessment : "",
                        phase : phase[i]
                    })
                }
            }
            return {
                table : table
            }
        },
        async initminimumPickup() {
            let table = [
                {
                    operation : "Trip",
                    assessment : ""
                },
                {
                    operation : "Close",
                    assessment : ""
                }
            ]
            return {
                limits : 'Absolute',
                table : table
            }
        },
        async initdcWindingTripCoil() {
            let table = [
                {
                    assessment : ""
                }
            ]
            return {
                limits : 'Absolute',
                table : table
            }
        },
        async initdcWindingCloseCoil() {
            let table = [
                {
                    assessment : ""
                }
            ]
            return {
                limits : 'Absolute',
                table : table
            }
        },
        async initdcWindingMotor() {
            let table = [
                {
                    assessment : ""
                }
            ]
            return {
                limits : 'Absolute',
                table : table
            }
        },
        async initinsulationResistanceCircuit() {
            let circuitBreaker = JSON.parse(this.selectedAsset[0].circuitBreaker)
            let table = []
            for(let i =0; i <circuitBreaker.numberOfPhase; i ++) {
                if(i%circuitBreaker.numberOfPhase === 0) {
                    table.push({
                        measure : "Phase A - (B+C+GND)"
                    })
                } else if(i%circuitBreaker.numberOfPhase === 1) {
                    table.push({
                        measure : "Phase B - (A+C+GND)"
                    })
                } else {
                    table.push({
                        measure : "Phase C - (A+B+GND)"
                    })
                }
            }
            return {
                assessment : {
                    abs : {},
                    rel : {}
                },
                limits : 'Absolute',
                table : table
            }
        },
        async initinsulationResistanceTripCoil() {
            let table = [{
                assessment : ""
            }]
            return {
                assessment : {
                    abs : {},
                    rel : {}
                },
                limits : 'Absolute',
                table : table
            }
        },
        async initinsulationResistanceCloseCoil() {
            let table = [{
                assessment : ""
            }]
            return {
                assessment : {
                    abs : {},
                    rel : {}
                },
                limits : 'Absolute',
                table : table
            }
        },
        async initinsulationResistanceMotor() {
            let table = [{
                assessment : ""
            }]
            return {
                assessment : {
                    abs : {},
                    rel : {}
                },
                limits : 'Absolute',
                table : table
            }
        },
        async initsf6MoiturePurity() {
            let data = ["moitureTable", "purityTable"]
            let table = {}
            data.forEach(element => {
                table[element] = [
                    {
                        assessment : ""
                    }
                ]
            })
            return {
                assessment : {
                    abs : {},
                    rel : {}
                },
                limits : 'Absolute',
                table : table
            }
        },
        async initsf6GasAnalysis() {
            let data = ["decomSf6Table", "so2Sof2Table", "hfTable"]
            let table = {}
            data.forEach(element => {
                table[element] = [{
                    assessment : ""
                }]
            })
            return {
                assessment : {
                    abs : {},
                    rel : {}
                },
                limits : 'Absolute',
                table : table
            }
        },
        async initpressureGauge() {
            let data = ["pressureGaugeTable"]
            let table = {}
            data.forEach(element => {
                table[element] = [{
                    assessment : ""
                }]
            })
            return {
                assessment : {
                    abs : {},
                    rel : {}
                },
                limits : 'Absolute',
                table : table
            }
        },
        async initoverCurrentRelease() {
            return {
                table : [
                    {
                        assessment : "",
                    },
                    {
                        assessment : "",
                    }
                ]
            }
        },
        async initunderVoltageRelease() {
            return {
                table : [
                    {
                        assessment : ""
                    },
                    {
                        assessment : ""
                    }
                ]
            }
        },
        async initinspection() {
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
    }
}
