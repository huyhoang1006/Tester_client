import { mapState } from 'vuex'

export default {
    data() {
        return {}
    },
    computed: mapState(['selectedAsset', 'selectedJob']),
    async beforeMount() { },
    methods: {
        getAssetData(assetData = null) {
            // Extract circuitBreaker and operating from assetData
            // Similar to how SurgeArrester handles assetData directly
            let circuitBreaker = null
            let operating = null

            if (assetData) {
                // Handle case where circuitBreaker might be a string that needs parsing
                if (assetData.circuitBreaker) {
                    circuitBreaker = typeof assetData.circuitBreaker === 'string'
                        ? JSON.parse(assetData.circuitBreaker)
                        : assetData.circuitBreaker
                } else if (assetData.oldBreakerInfo && assetData.oldBreakerInfo.circuitBreaker) {
                    circuitBreaker = typeof assetData.oldBreakerInfo.circuitBreaker === 'string'
                        ? JSON.parse(assetData.oldBreakerInfo.circuitBreaker)
                        : assetData.oldBreakerInfo.circuitBreaker
                }

                // Handle case where operating might be a string that needs parsing
                if (assetData.operating) {
                    operating = typeof assetData.operating === 'string'
                        ? JSON.parse(assetData.operating)
                        : assetData.operating
                } else if (assetData.oldOperatingMechanism) {
                    operating = typeof assetData.oldOperatingMechanism === 'string'
                        ? JSON.parse(assetData.oldOperatingMechanism)
                        : assetData.oldOperatingMechanism
                }
            }

            // Default values if not found
            circuitBreaker = circuitBreaker || {
                numberOfPhase: 3,
                numberOfInterruptPhase: 1
            }
            operating = operating || {
                numberTripCoil: 1,
                numberCloseCoil: 1
            }

            return { circuitBreaker, operating }
        },
        async initTest(testTypeCode, assetData) {
            let data = null
            switch (testTypeCode) {
                case 'motorCurrent':
                    data = this.initmotorCurrent()
                    break
                case 'cTiming':
                    data = await this.initcTiming(assetData)
                    break
                case 'oTiming':
                    data = await this.initoTiming(assetData)
                    break
                case 'ocTiming':
                    data = await this.initocTiming(assetData)
                    break
                case 'coTiming':
                    data = await this.initcoTiming(assetData)
                    break
                case 'ocoTiming':
                    data = await this.initocoTiming(assetData)
                    break
                case 'cocoTiming':
                    data = await this.initcocoTiming(assetData)
                    break
                case 'ococoTiming':
                    data = await this.initococoTiming(assetData)
                    break
                case 'contactResistance':
                    data = await this.initcontactResistance(assetData)
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
                case 'underVoltageRelease':
                    data = await this.initunderVoltageRelease()
                    break
                case 'inspection':
                    data = await this.initinspection()
                    break
            }

            return data
        },
        initmotorCurrent() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Inrush current',
                    code: 'inrushCurrent',
                    unit: 'A',
                    type: 'string',

                },
                {
                    mrid: '',
                    name: 'Charging',
                    code: 'charging',
                    unit: 's',
                    type: 'analog',
                }
                ,
                {
                    mrid: '',
                    name: 'Charging current',
                    code: 'chargingCurrent',
                    unit: 'A',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Minimum voltage',
                    code: 'miniVoltage',
                    unit: 'V',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }

                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            const motorChar = {
                limits: "Absolute",
                abs: [{}, {}, {}, {}],
                rel: [{}, {}, {}, {}],
            }
            // const table = [
            //     {
            //         inrushCurrent: '',
            //         charging: '',
            //         chargingCurrent: '',
            //         miniVoltage: '',
            //         assessment: '',
            //         condition_indicator: ''
            //     }
            // ]
            let table = [
                {
                    mrid: '',
                    inrushCurrent: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'string'
                    },
                    charging: {
                        mrid: '',
                        value: '',
                        unit: 's',
                        type: 'analog'
                    },
                    chargingCurrent: {
                        mrid: '',
                        value: '',
                        unit: 'A',
                        type: 'analog'
                    },
                    miniVoltage: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },
                    assessment: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    },
                    condition_indicator: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    }
                }
            ]
            let measurementProcedure = []
            return {
                row_data,
                motorChar,
                table,
                measurementProcedure
            }
        },
        async initcTiming(assetData = null) {
            const { circuitBreaker, operating } = this.getAssetData(assetData)
            let table = []
            let phase = ["A", "B", "C"]
            for (let i = 0; i < operating.numberCloseCoil; i++) {
                table.push([])
            }

            table.forEach(element => {
                for (let i = 0; i < circuitBreaker.numberOfPhase; i++) {
                    for (let j = 0; j < circuitBreaker.numberOfInterruptPhase; j++) {
                        element.push({
                            phase: phase[i],
                            assessment: ''
                        })
                    }
                }
            })
            return {
                limits: "Absolute",
                openTime: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}, {}]
                },
                auxContact: {
                    abs: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}],
                    },
                    rel: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}],
                    }
                },
                miscell: {
                    abs: [{}, {}, {}, {}],
                    rel: [{}, {}, {}, {}],
                },
                coilCharacter: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}],
                },
                table: table
            }
        },
        async initoTiming(assetData = null) {
            const { circuitBreaker, operating } = this.getAssetData(assetData)
            let table = []
            let phase = ["A", "B", "C"]
            for (let i = 0; i < operating.numberTripCoil; i++) {
                table.push([])
            }

            table.forEach(element => {
                for (let i = 0; i < circuitBreaker.numberOfPhase; i++) {
                    for (let j = 0; j < circuitBreaker.numberOfInterruptPhase; j++) {
                        element.push({
                            phase: phase[i],
                            assessment: ''
                        })
                    }
                }
            })
            return {
                limits: "Absolute",
                openTime: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}, {}]
                },
                auxContact: {
                    abs: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}],
                    },
                    rel: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}],
                    }
                },
                miscell: {
                    abs: [{}, {}, {}, {}],
                    rel: [{}, {}, {}, {}],
                },
                coilCharacter: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}],
                },
                table: table
            }
        },
        async initocTiming(assetData = null) {
            const { circuitBreaker, operating } = this.getAssetData(assetData)
            async function getTable(table) {
                let phase = ["A", "B", "C"]
                for (let i = 0; i < operating.numberTripCoil; i++) {
                    table.push([])
                }
                table.forEach(element => {
                    for (let i = 0; i < circuitBreaker.numberOfPhase; i++) {
                        for (let j = 0; j < circuitBreaker.numberOfInterruptPhase; j++) {
                            element.push({
                                phase: phase[i],
                                assessment: '',
                            })
                        }
                    }
                })
                return table
            }
            let table = []
            table = await getTable(table)
            return {
                limits: "Absolute",
                openTime: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}, {}]
                },
                auxContact: {
                    abs: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}],
                    },
                    rel: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}],
                    }
                },
                miscell: {
                    abs: [{}, {}, {}, {}],
                    rel: [{}, {}, {}, {}],
                },
                coilCharacter: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}],
                },
                table: table
            }
        },
        async initcoTiming(assetData = null) {
            const { circuitBreaker, operating } = this.getAssetData(assetData)
            let phase = ["A", "B", "C"]
            let table = []
            for (let i = 0; i < operating.numberCloseCoil; i++) {
                table.push([])
            }
            table.forEach(element => {
                for (let i = 0; i < circuitBreaker.numberOfPhase; i++) {
                    for (let j = 0; j < circuitBreaker.numberOfInterruptPhase; j++) {
                        element.push({
                            phase: phase[i],
                            assessment: ''
                        })
                    }
                }
            })
            return {
                limits: "Absolute",
                openTime: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}, {}]
                },
                auxContact: {
                    abs: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}],
                    },
                    rel: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}],
                    }
                },
                miscell: {
                    abs: [{}, {}, {}, {}],
                    rel: [{}, {}, {}, {}],
                },
                coilCharacter: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}],
                },
                table: table
            }
        },
        async initocoTiming(assetData = null) {
            const { circuitBreaker, operating } = this.getAssetData(assetData)
            async function getTable(table) {
                let phase = ["A", "B", "C"]
                for (let i = 0; i < operating.numberTripCoil; i++) {
                    table.push([])
                }
                table.forEach(element => {
                    for (let i = 0; i < circuitBreaker.numberOfPhase; i++) {
                        for (let j = 0; j < circuitBreaker.numberOfInterruptPhase; j++) {
                            element.push({
                                assessment: '',
                                phase: phase[i]
                            })
                        }
                    }
                })
                return table
            }
            let table = []
            table = await getTable(table)
            return {
                limits: "Absolute",
                openTime: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}, {}]
                },
                auxContact: {
                    abs: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}],
                    },
                    rel: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}],
                    }
                },
                miscell: {
                    abs: [{}, {}, {}, {}],
                    rel: [{}, {}, {}, {}],
                },
                coilCharacter: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}],
                },
                table: table
            }
        },
        async initcocoTiming(assetData = null) {
            const { circuitBreaker } = this.getAssetData(assetData)
            let table = []
            let phase = ["A", "B", "C"]
            for (let i = 0; i < circuitBreaker.numberOfPhase; i++) {
                table.push({
                    phase: phase[i],
                    assessment: ""
                })
            }
            return {
                limits: "Absolute",
                openTime: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}, {}]
                },
                auxContact: {
                    abs: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}],
                    },
                    rel: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}],
                    }
                },
                miscell: {
                    abs: [{}, {}, {}, {}],
                    rel: [{}, {}, {}, {}],
                },
                coilCharacter: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}],
                },
                table: table
            }
        },
        async initococoTiming(assetData = null) {
            const { circuitBreaker } = this.getAssetData(assetData)
            let table = []
            let phase = ["A", "B", "C"]
            for (let i = 0; i < circuitBreaker.numberOfPhase; i++) {
                table.push({
                    assessment: "",
                    phase: phase[i]
                })
            }
            return {
                limits: "Absolute",
                openTime: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}, {}]
                },
                auxContact: {
                    abs: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}],
                    },
                    rel: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}],
                    }
                },
                miscell: {
                    abs: [{}, {}, {}, {}],
                    rel: [{}, {}, {}, {}],
                },
                coilCharacter: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}],
                },
                table: table
            }
        },
        async initcontactResistance(assetData = null) {
            const { circuitBreaker } = this.getAssetData(assetData)
            let table = []
            let phase = ["A", "B", "C"]
            for (let i = 0; i < circuitBreaker.numberOfPhase; i++) {
                for (let j = 0; j < circuitBreaker.numberOfInterruptPhase; j++) {
                    table.push({
                        assessment: "",
                        phase: phase[i]
                    })
                }
            }
            return {
                table: table
            }
        },
        async initminimumPickup() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Operation',
                    code: 'operation',
                    unit: '',
                    type: 'string',

                },
                {
                    mrid: '',
                    name: 'Trip Coil No',
                    code: 'tripCoilNo',
                    unit: '',
                    type: 'string',
                }
                ,
                {
                    mrid: '',
                    name: 'Close Coil No',
                    code: 'closeCoilNo',
                    unit: '',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'V pickup',
                    code: 'vPickup',
                    unit: 'V',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }

                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = [
                {
                    operation: {
                        mrid: "",
                        value: "Trip",
                        unit: "",
                        type: "string"
                    },
                    tripCoilNo: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "string"
                    },
                    closeCoilNo: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "string"
                    },
                    vPickup: {
                        mrid: "",
                        value: "",
                        unit: "V",
                        type: "string"
                    },
                    assessment: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    },
                    condition_indicator: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    }
                },
            ]
            return {
                table,
                row_data,
                measurementProcedure: []
            }
        },
        async initdcWindingTripCoil() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Trip Coil No',
                    code: 'tripCoilNo',
                    unit: '',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'R meas',
                    code: 'rmeas',
                    unit: 'Ω',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = [
                {
                    tripCoilNo: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "string"
                    },
                    rmeas: {
                        mrid: "",
                        value: "",
                        unit: "Ω",
                        type: "analog"
                    },
                    assessment: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    },
                    condition_indicator: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    }
                },
            ]
            return {
                limits: 'Absolute',
                table: table,
                row_data: row_data,
                measurementProcedure: []
            }
        },
        async initdcWindingCloseCoil() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Close Coil No',
                    code: 'closeCoilNo',
                    unit: '',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'R meas',
                    code: 'rmeas',
                    unit: 'Ω',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = [
                {
                    closeCoilNo: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "string"
                    },
                    rmeas: {
                        mrid: "",
                        value: "",
                        unit: "Ω",
                        type: "analog"
                    },
                    assessment: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    },
                    condition_indicator: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    }
                },
            ]
            return {
                limits: 'Absolute',
                table: table,
                row_data: row_data,
                measurementProcedure: []
            }
        },
        async initdcWindingMotor() {
            const row_data = [
                {
                    mrid: '',
                    name: 'R meas',
                    code: 'rmeas',
                    unit: 'Ω',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = [
                {
                    rmeas: {
                        mrid: "",
                        value: "",
                        unit: "Ω",
                        type: "analog"
                    },
                    assessment: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    },
                    condition_indicator: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    }
                }
            ]
            return {
                row_data: row_data,
                limits: 'Absolute',
                table: table
            }
        },
        async initinsulationResistanceCircuit(assetData = null) {
            const { circuitBreaker } = this.getAssetData(assetData)
            let table = []
            for (let i = 0; i < circuitBreaker.numberOfPhase; i++) {
                if (i % circuitBreaker.numberOfPhase === 0) {
                    table.push({
                        measure: "Phase A - (B+C+GND)"
                    })
                } else if (i % circuitBreaker.numberOfPhase === 1) {
                    table.push({
                        measure: "Phase B - (A+C+GND)"
                    })
                } else {
                    table.push({
                        measure: "Phase C - (A+B+GND)"
                    })
                }
            }
            return {
                assessment: {
                    abs: {},
                    rel: {}
                },
                limits: 'Absolute',
                table: table
            }
        },
        async initinsulationResistanceTripCoil() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Trip coil no.',
                    code: 'tripCoilNo',
                    unit: '',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'Test voltage',
                    code: 'testVoltage',
                    unit: 'V',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'R60s',
                    code: 'r60s',
                    unit: 'MΩ',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = [
                {
                    tripCoilNo: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "string"
                    },
                    testVoltage: {
                        mrid: "",
                        value: "",
                        unit: "V",
                        type: "analog"
                    },
                    r60s: {
                        mrid: "",
                        value: "",
                        unit: "MΩ",
                        type: "analog"
                    },
                    assessment: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    },
                    condition_indicator: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    }
                },
            ]
            return {
                assessment: {
                    abs: {},
                    rel: {}
                },
                limits: 'Absolute',
                table: table,
                row_data: row_data
            }
        },
        async initinsulationResistanceCloseCoil() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Close coil no.',
                    code: 'closeCoilNo',
                    unit: '',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'Test voltage',
                    code: 'testVoltage',
                    unit: 'V',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'R60s',
                    code: 'r60s',
                    unit: 'MΩ',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = [
                {
                    closeCoilNo: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "string"
                    },
                    testVoltage: {
                        mrid: "",
                        value: "",
                        unit: "V",
                        type: "analog"
                    },
                    r60s: {
                        mrid: "",
                        value: "",
                        unit: "MΩ",
                        type: "analog"
                    },
                    assessment: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    },
                    condition_indicator: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    }
                },
            ]
            return {
                assessment: {
                    abs: {},
                    rel: {}
                },
                limits: 'Absolute',
                table: table,
                row_data: row_data
            }
        },
        async initinsulationResistanceMotor() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Test voltage',
                    code: 'testVoltage',
                    unit: 'V',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'R60s',
                    code: 'r60s',
                    unit: 'MΩ',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = [
                {
                    testVoltage: {
                        mrid: "",
                        value: "",
                        unit: "V",
                        type: "analog"
                    },
                    r60s: {
                        mrid: "",
                        value: "",
                        unit: "MΩ",
                        type: "analog"
                    },
                    assessment: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    },
                    condition_indicator: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    }
                },
            ]
            return {
                assessment: {
                    abs: {},
                    rel: {}
                },
                limits: 'Absolute',
                table: table,
                row_data: row_data
            }
        },
        async initsf6MoiturePurity() {
            let data = ["moitureTable", "purityTable"]
            const moitureRow_data = [
                {
                    mrid: '',
                    name: 'Moiture',
                    code: 'moiture',
                    unit: 'ppm',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            const purityRow_data = [
                {
                    mrid: '',
                    name: 'Purity',
                    code: 'purity',
                    unit: '%',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let moitureTable = []
            let purityTable = []
            data.forEach(element => {
                if (element === "moitureTable") {
                    moitureTable.push({
                        moiture: {
                            mrid: "",
                            value: "",
                            unit: "ppm",
                            type: "analog"
                        },
                        assessment: {
                            mrid: "",
                            value: "",
                            unit: "",
                            type: "discrete"
                        },
                        condition_indicator: {
                            mrid: "",
                            value: "",
                            unit: "",
                            type: "discrete"
                        }
                    })
                }
                else if (element === "purityTable") {
                    purityTable.push({
                        purity: {
                            mrid: "",
                            value: "",
                            unit: "%",
                            type: "analog"
                        },
                        assessment: {
                            mrid: "",
                            value: "",
                            unit: "",
                            type: "discrete"
                        },
                        condition_indicator: {
                            mrid: "",
                            value: "",
                            unit: "",
                            type: "discrete"
                        }
                    })
                }
            })
            return {
                assessment: {
                    abs: {},
                    rel: {}
                },
                limits: 'Absolute',
                table: {
                    moitureTable: moitureTable,
                    purityTable: purityTable
                },
                row_data: {
                    moitureRow_data: moitureRow_data,
                    purityRow_data: purityRow_data
                }
            }
        },
        async initsf6GasAnalysis() {

            let data = ["decomSf6Table", "so2Sof2Table", "hfTable"]
            const decomSf6Row_data = [
                {
                    mrid: '',
                    name: 'Decomposition of SF6',
                    code: 'decomSf6',
                    unit: 'ppm',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            const so2Sof2Row_data = [
                {
                    mrid: '',
                    name: 'SO2 + SOF2',
                    code: 'so2Sof2',
                    unit: 'ppm',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            const hfRow_data = [
                {
                    mrid: '',
                    name: 'HF',
                    code: 'hf',
                    unit: 'ppm',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let decomSf6Table = []
            let so2Sof2Table = []
            let hfTable = []
            data.forEach(element => {
                if (element === "decomSf6Table") {
                    decomSf6Table.push({
                        decomSf6: {
                            mrid: "",
                            value: "123",
                            unit: "ppm",
                            type: "analog"
                        },
                        assessment: {
                            mrid: "",
                            value: "333",
                            unit: "",
                            type: "discrete"
                        },
                        condition_indicator: {
                            mrid: "",
                            value: "2323",
                            unit: "",
                            type: "discrete"
                        }
                    })
                }
                else if (element === "so2Sof2Table") {
                    so2Sof2Table.push({
                        so2Sof2: {
                            mrid: "",
                            value: "",
                            unit: "ppm",
                            type: "analog"
                        },
                        assessment: {
                            mrid: "",
                            value: "",
                            unit: "",
                            type: "discrete"
                        },
                        condition_indicator: {
                            mrid: "",
                            value: "",
                            unit: "",
                            type: "discrete"
                        }
                    })
                }
                else if (element === "hfTable") {
                    hfTable.push({
                        hf: {
                            mrid: "",
                            value: "",
                            unit: "ppm",
                            type: "analog"
                        },
                        assessment: {
                            mrid: "",
                            value: "",
                            unit: "",
                            type: "discrete"
                        },
                        condition_indicator: {
                            mrid: "",
                            value: "",
                            unit: "",
                            type: "discrete"
                        }
                    })
                }
            })
            return {
                assessment: {
                    abs: {},
                    rel: {}
                },
                limits: 'Absolute',
                table: {
                    decomSf6Table: decomSf6Table,
                    so2Sof2Table: so2Sof2Table,
                    hfTable: hfTable
                },
                row_data: {
                    decomSf6Row_data: decomSf6Row_data,
                    so2Sof2Row_data: so2Sof2Row_data,
                    hfRow_data: hfRow_data
                }
            }
        },
        async initpressureGauge() {
            const row_data = [
                {
                    mrid: '',
                    name: 'SF6 pressure',
                    code: 'sf6Pressure',
                    unit: 'MPa',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Alarm',
                    code: 'alarm',
                    unit: 'MPa',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Lockout',
                    code: 'lockout',
                    unit: 'MPa',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let pressureGaugeTable = [{
                sf6Pressure: {
                    mrid: "",
                    value: "",
                    unit: "MPa",
                    type: "analog"
                },
                alarm: {
                    mrid: "",
                    value: "",
                    unit: "MPa",
                    type: "analog"
                },
                lockout: {
                    mrid: "",
                    value: "",
                    unit: "MPa",
                    type: "analog"
                },
                assessment: {
                    mrid: "",
                    value: "",
                    unit: "",
                    type: "discrete"
                },
                condition_indicator: {
                    mrid: "",
                    value: "",
                    unit: "",
                    type: "discrete"
                }
            }]
            return {
                row_data: row_data,
                limits: 'Absolute',
                table: {
                    pressureGaugeTable: pressureGaugeTable
                }
            }
        },
        async initoverCurrentRelease() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Trip coil no.',
                    code: 'tripCoilNo',
                    unit: '',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'Trip current',
                    code: 'tripCurrent',
                    unit: 'mA',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = [
                {
                    tripCoilNo: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "string"
                    },
                    tripCurrent: {
                        mrid: "",
                        value: "",
                        unit: "mA",
                        type: "analog"
                    },
                    assessment: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    },
                    condition_indicator: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    }
                },
            ]
            return {
                row_data: row_data,
                table: table
            }
        },
        async initunderVoltageRelease() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Trip coil no.',
                    code: 'tripCoilNo',
                    unit: '',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'Trip voltage',
                    code: 'tripVoltage',
                    unit: 'V',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = [
                {
                    tripCoilNo: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "string"
                    },
                    tripVoltage: {
                        mrid: "",
                        value: "",
                        unit: "V",
                        type: "analog"
                    },
                    assessment: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    },
                    condition_indicator: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    }
                }
            ]
            return {
                row_data: row_data,
                table: table
            }
        },
        async initinspection() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Items',
                    code: 'items',
                    unit: '',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = []
            const data = ['Nameplate', 'Installation check', 'Grounding check', 'SF6 pressure check', 'Mechanical operating', 'Close at 75% control voltage',
                'Ground frame', 'Open at 70% control voltage', 'Checking local control', 'Checking remote control', 'Check interlocking circuit by SF6 gas pressure',
                'Check contact resistance of auxiliary contacts']
            data.forEach(element => {
                table.push({
                    items: {
                        mrid: "",
                        value: element,
                        unit: "",
                        type: "string"
                    },
                    assessment: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    },
                    condition_indicator: {
                        mrid: "",
                        value: "",
                        unit: "",
                        type: "discrete"
                    }
                })
            })
            return {
                row_data: row_data,
                table: table
            }
        }
    }
}
