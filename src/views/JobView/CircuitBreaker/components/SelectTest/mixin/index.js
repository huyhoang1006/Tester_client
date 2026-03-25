/* eslint-disable */
import circuitBreakerTestMap from '@/config/test-definitions/CircuitBreaker'
import circuitBreakerConditionMap from '@/config/testing-condition/CircuitBreaker/index.js'
import * as common from '../../../../Common/index.js'

export default {
    methods: {
        async initTest(testTypeCode, assetData) {
            let data = null
            switch (testTypeCode) {
                case 'MotorCurrent':
                    data = await this.initMotorCurrent(testTypeCode)
                    break
                case 'CTiming':
                    data = await this.initCTiming(testTypeCode, assetData)
                    break
                case 'OTiming':
                    data = await this.initOTiming(testTypeCode, assetData)
                    break
                case 'OCTiming':
                    data = await this.initOCTiming(testTypeCode, assetData)
                    break
                case 'COTiming':
                    data = await this.initCOTiming(testTypeCode, assetData)
                    break
                case 'OCOTiming':
                    data = await this.initOCOTiming(testTypeCode, assetData)
                    break
                case 'COCOTiming':
                    data = await this.initCOCOTiming(testTypeCode, assetData)
                    break
                case 'OCOCOTiming':
                    data = await this.initOCOCOTiming(testTypeCode, assetData)
                    break
                case 'ContactResistance':
                    data = await this.initContactResistance(testTypeCode, assetData)
                    break
                case 'MinimumPickup':
                    data = await this.initMinimumPickup(testTypeCode)
                    break
                case 'DCWindingTripCoil':
                    data = await this.initDCWindingTripCoil(testTypeCode, assetData)
                    break
                case 'DCWindingCloseCoil':
                    data = await this.initDCWindingCloseCoil(testTypeCode, assetData)
                    break
                case 'DCWindingMotor':
                    data = await this.initDCWindingMotor(testTypeCode)
                    break
                case 'InsulationResistanceCircuit':
                    data = await this.initInsulationResistanceCircuit(testTypeCode, assetData)
                    break
                case 'InsulationResistanceTripCoil':
                    data = await this.initInsulationResistanceTripCoil(testTypeCode, assetData)
                    break
                case 'InsulationResistanceCloseCoil':
                    data = await this.initInsulationResistanceCloseCoil(testTypeCode, assetData)
                    break
                case 'InsulationResistanceMotor':
                    data = await this.initInsulationResistanceMotor(testTypeCode)
                    break
                case 'SF6MoiturePurity':
                    data = await this.initSF6MoiturePurity(testTypeCode)
                    break
                case 'SF6GasAnalysis':
                    data = await this.initSF6GasAnalysis(testTypeCode)
                    break
                case 'PressureGauge':
                    data = await this.initPressureGauge(testTypeCode)
                    break
                case 'OverCurrentRelease':
                    data = await this.initOverCurrentRelease(testTypeCode)
                    break
                case 'UnderVoltageRelease':
                    data = await this.initUnderVoltageRelease(testTypeCode)
                    break
                case 'GeneralInspection':
                    data = await this.initGeneralInspection(testTypeCode)
                    break
            }
            return data
        },
        async initMotorCurrent(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            const motorChar = {
                limits: 'Absolute',
                abs: [{}, {}, {}, {}],
                rel: [{}, {}, {}, {}]
            }

            let table = []
            const row = JSON.parse(JSON.stringify(rowDataExample))
            table.push(row)

            return {
                rowDataExampleCondition,
                motorChar,
                table: {
                    table1: table
                }
            }
        },
        async initCTiming(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            const {circuitBreaker, operating} = assetData

            const closeCoilsCount = parseInt(operating?.numberCloseCoil || operating?.number_of_close_coil || 1)
            const phaseCount = parseInt(circuitBreaker?.numberOfPhase || circuitBreaker?.numberOfPhases || 3)
            const interruptCount = parseInt(circuitBreaker?.numberOfInterruptPhase || circuitBreaker?.interruptersPerPhase || 1)

            const phaseNames = ['A', 'B', 'C']
            const table = []

            for (let c = 0; c < closeCoilsCount; c++) {
                const coilTable = []

                for (let i = 0; i < phaseCount; i++) {
                    for (let j = 0; j < interruptCount; j++) {
                        const row = JSON.parse(JSON.stringify(rowDataExample))

                        if (row.phase) {
                            row.phase.value = phaseNames[i] || `P${i + 1}`
                        }
                        if (row.interrupter) {
                            row.interrupter.value = (j + 1).toString()
                        }

                        coilTable.push(row)
                    }
                }

                table.push(coilTable)
            }

            // Build table as object {table1: [...], table2: [...]} for consistency with other components
            const tableObj = {}
            table.forEach((coilTable, idx) => {
                tableObj[`table${idx + 1}`] = coilTable
            }) 

            return {
                rowDataExampleCondition,
                limits: 'Absolute',
                openTime: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}, {}]
                },
                auxContact: {
                    abs: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}]
                    },
                    rel: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}]
                    }
                },
                miscell: {
                    abs: [{}, {}, {}, {}],
                    rel: [{}, {}, {}, {}]
                },
                coilCharacter: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}]
                },
                table: tableObj
            }
        },
        async initOTiming(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            const {circuitBreaker, operating} = assetData

            const tripCoilsCount = parseInt(operating?.numberTripCoil || 1)
            const phaseCount = parseInt(circuitBreaker?.numberOfPhase || 3)
            const interruptCount = parseInt(circuitBreaker?.numberOfInterruptPhase || circuitBreaker?.interruptersPerPhase || 1)

            let table = []
            let phaseNames = ['A', 'B', 'C']

            for (let t = 0; t < tripCoilsCount; t++) {
                let coilTable = []

                for (let i = 0; i < phaseCount; i++) {
                    for (let j = 0; j < interruptCount; j++) {
                        const row = JSON.parse(JSON.stringify(rowDataExample))

                        if (row.phase) {
                            row.phase.value = phaseNames[i] || `P${i + 1}`
                        } else if (row.name) {
                            row.name.value = phaseNames[i] || `P${i + 1}`
                        }

                        if (interruptCount > 1) {
                            if (row.interrupt_no) {
                                row.interrupt_no.value = (j + 1).toString()
                            } else {
                                row.interrupt_no = {mrid: '', value: (j + 1).toString(), unit: '', type: 'string'}
                            }
                        }
                        coilTable.push(row)
                    }
                }
                table.push(coilTable)
            }

            return {
                rowDataExampleCondition,
                limits: 'Absolute',
                openTime: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}, {}]
                },
                auxContact: {
                    abs: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}]
                    },
                    rel: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}]
                    }
                },
                miscell: {
                    abs: [{}, {}, {}, {}],
                    rel: [{}, {}, {}, {}]
                },
                coilCharacter: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}]
                },
                table: {
                    table1: table
                }
            }
        },
        async initOCTiming(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            const {circuitBreaker, operating} = assetData

            const tripCoilsCount = parseInt(operating?.number_of_trip_coil || 1)
            const phaseCount = parseInt(circuitBreaker?.numberOfPhase || 3)
            const interruptCount = parseInt(circuitBreaker?.interruptersPerPhase || 1)

            let table = []
            let phaseNames = ['A', 'B', 'C']

            for (let t = 0; t < tripCoilsCount; t++) {
                let coilTable = []

                for (let i = 0; i < phaseCount; i++) {
                    for (let j = 0; j < interruptCount; j++) {
                        const row = JSON.parse(JSON.stringify(rowDataExample))

                        if (row.phase) {
                            row.phase.value = phaseNames[i] || `P${i + 1}`
                        } else if (row.name) {
                            row.name.value = phaseNames[i] || `P${i + 1}`
                        }

                        if (interruptCount > 1) {
                            if (row.interrupt_no) {
                                row.interrupt_no.value = (j + 1).toString()
                            } else {
                                row.interrupt_no = {mrid: '', value: (j + 1).toString(), unit: '', type: 'string'}
                            }
                        }
                        coilTable.push(row)
                    }
                }
                table.push(coilTable)
            }

            return {
                rowDataExampleCondition,
                limits: 'Absolute',
                openTime: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}, {}]
                },
                auxContact: {
                    abs: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}]
                    },
                    rel: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}]
                    }
                },
                miscell: {
                    abs: [{}, {}, {}, {}],
                    rel: [{}, {}, {}, {}]
                },
                coilCharacter: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}]
                },
                table: {
                    table1: table
                }
            }
        },
        async initCOTiming(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            const {circuitBreaker, operating} = assetData

            const closeCoilsCount = parseInt(operating?.numberCloseCoil || operating?.number_of_close_coil || 1)
            const phaseCount = parseInt(circuitBreaker?.numberOfPhase || circuitBreaker?.numberOfPhases || 3)
            const interruptCount = parseInt(circuitBreaker?.numberOfInterruptPhase || circuitBreaker?.interruptersPerPhase || 1)

            let table = []
            let phaseNames = ['A', 'B', 'C']

            for (let c = 0; c < closeCoilsCount; c++) {
                let coilTable = []

                for (let i = 0; i < phaseCount; i++) {
                    for (let j = 0; j < interruptCount; j++) {
                        const row = JSON.parse(JSON.stringify(rowDataExample))

                        if (row.phase) {
                            row.phase.value = phaseNames[i] || `P${i + 1}`
                        } else if (row.name) {
                            row.name.value = phaseNames[i] || `P${i + 1}`
                        }

                        if (interruptCount > 1) {
                            if (row.interrupt_no) {
                                row.interrupt_no.value = (j + 1).toString()
                            } else {
                                row.interrupt_no = {mrid: '', value: (j + 1).toString(), unit: '', type: 'string'}
                            }
                        }

                        coilTable.push(row)
                    }
                }

                table.push(coilTable)
            }

            return {
                rowDataExampleCondition,
                limits: 'Absolute',
                openTime: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}, {}]
                },
                auxContact: {
                    abs: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}]
                    },
                    rel: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}]
                    }
                },
                miscell: {
                    abs: [{}, {}, {}, {}],
                    rel: [{}, {}, {}, {}]
                },
                coilCharacter: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}]
                },
                table: {
                    table1: table
                }
            }
        },
        async initOCOTiming(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            const {circuitBreaker, operating} = assetData

            const tripCoilsCount = parseInt(operating?.numberTripCoil || operating?.number_of_trip_coil || 1)
            const phaseCount = parseInt(circuitBreaker?.numberOfPhase || circuitBreaker?.numberOfPhases || 3)
            const interruptCount = parseInt(circuitBreaker?.numberOfInterruptPhase || circuitBreaker?.interruptersPerPhase || 1)

            let table = []
            let phaseNames = ['A', 'B', 'C']

            for (let t = 0; t < tripCoilsCount; t++) {
                let coilTable = []

                for (let i = 0; i < phaseCount; i++) {
                    for (let j = 0; j < interruptCount; j++) {
                        const row = JSON.parse(JSON.stringify(rowDataExample))

                        if (row.phase) {
                            row.phase.value = phaseNames[i] || `P${i + 1}`
                        } else if (row.name) {
                            row.name.value = phaseNames[i] || `P${i + 1}`
                        }

                        if (interruptCount > 1) {
                            if (row.interrupt_no) {
                                row.interrupt_no.value = (j + 1).toString()
                            } else {
                                row.interrupt_no = {mrid: '', value: (j + 1).toString(), unit: '', type: 'string'}
                            }
                        }

                        coilTable.push(row)
                    }
                }

                table.push(coilTable)
            }

            return {
                rowDataExampleCondition,
                limits: 'Absolute',
                openTime: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}, {}]
                },
                auxContact: {
                    abs: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}]
                    },
                    rel: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}]
                    }
                },
                miscell: {
                    abs: [{}, {}, {}, {}],
                    rel: [{}, {}, {}, {}]
                },
                coilCharacter: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}]
                },
                table: {
                    table1: table
                }
            }
        },
        async initCOCOTiming(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            const {circuitBreaker} = assetData

            const phaseCount = parseInt(circuitBreaker?.numberOfPhase || circuitBreaker?.numberOfPhases || 3)
            const interruptCount = parseInt(circuitBreaker?.numberOfInterruptPhase || circuitBreaker?.interruptersPerPhase || 1)

            let table = []
            let phaseNames = ['A', 'B', 'C']

            for (let i = 0; i < phaseCount; i++) {
                for (let j = 0; j < interruptCount; j++) {
                    const row = JSON.parse(JSON.stringify(rowDataExample))

                    if (row.phase) {
                        row.phase.value = phaseNames[i] || `P${i + 1}`
                    } else if (row.name) {
                        row.name.value = phaseNames[i] || `P${i + 1}`
                    }

                    if (interruptCount > 1) {
                        if (row.interrupt_no) {
                            row.interrupt_no.value = (j + 1).toString()
                        } else {
                            row.interrupt_no = {mrid: '', value: (j + 1).toString(), unit: '', type: 'string'}
                        }
                    }

                    table.push(row)
                }
            }

            return {
                rowDataExampleCondition,
                limits: 'Absolute',
                openTime: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}, {}]
                },
                auxContact: {
                    abs: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}]
                    },
                    rel: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}]
                    }
                },
                miscell: {
                    abs: [{}, {}, {}, {}],
                    rel: [{}, {}, {}, {}]
                },
                coilCharacter: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}]
                },
                table: {
                    table1: table
                }
            }
        },
        async initOCOCOTiming(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            const {circuitBreaker} = assetData

            const phaseCount = parseInt(circuitBreaker?.numberOfPhase || circuitBreaker?.numberOfPhases || 3)
            const interruptCount = parseInt(circuitBreaker?.numberOfInterruptPhase || circuitBreaker?.interruptersPerPhase || 1)

            let table = []
            let phaseNames = ['A', 'B', 'C']

            for (let i = 0; i < phaseCount; i++) {
                for (let j = 0; j < interruptCount; j++) {
                    const row = JSON.parse(JSON.stringify(rowDataExample))

                    if (row.phase) {
                        row.phase.value = phaseNames[i] || `P${i + 1}`
                    } else if (row.name) {
                        row.name.value = phaseNames[i] || `P${i + 1}`
                    }

                    if (interruptCount > 1) {
                        if (row.interrupt_no) {
                            row.interrupt_no.value = (j + 1).toString()
                        } else {
                            row.interrupt_no = {mrid: '', value: (j + 1).toString(), unit: '', type: 'string'}
                        }
                    }

                    table.push(row)
                }
            }

            return {
                rowDataExampleCondition,
                limits: 'Absolute',
                openTime: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}, {}]
                },
                auxContact: {
                    abs: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}]
                    },
                    rel: {
                        trip: [{}, {}, {}, {}, {}, {}],
                        close: [{}, {}, {}, {}, {}, {}]
                    }
                },
                miscell: {
                    abs: [{}, {}, {}, {}],
                    rel: [{}, {}, {}, {}]
                },
                coilCharacter: {
                    abs: [{}, {}, {}, {}, {}, {}, {}, {}],
                    rel: [{}, {}, {}, {}, {}, {}, {}, {}]
                },
                table: {
                    table1: table
                }
            }
        },
        async initContactResistance(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            let table1 = []
            let phase = ['A', 'B', 'C']

            for (let i = 0; i < assetData.circuitBreaker.numberOfPhases; i++) {
                for (let j = 0; j < assetData.circuitBreaker.interruptersPerPhase; j++) {
                    const row = JSON.parse(JSON.stringify(rowDataExample))

                    if (row.phase) {
                        row.phase.value = phase[i] || `Phase ${i + 1}`
                    } else if (row.name) {
                        row.name.value = phase[i] || `Phase ${i + 1}`
                    }

                    if (assetData.circuitBreaker.interruptersPerPhase > 1) {
                        if (row.interrupt_no) {
                            row.interrupt_no.value = (j + 1).toString()
                        } else {
                            row.interrupt_no = {
                                mrid: '',
                                value: (j + 1).toString(),
                                unit: '',
                                type: 'string'
                            }
                        }
                    }

                    table1.push(row)
                }
            }

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initMinimumPickup(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            let table = []

            const row = JSON.parse(JSON.stringify(rowDataExample))

            if (row.operation) {
                row.operation.value = 'Trip'
            }

            table.push(row)

            return {
                rowDataExampleCondition,
                table: {
                    table1: table
                }
            }
        },
        async initDCWindingTripCoil(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            const {operating} = assetData

            const tripCoilsCount = parseInt(operating?.numberTripCoil || operating?.number_of_trip_coil || 1)

            let table = []

            for (let i = 0; i < tripCoilsCount; i++) {
                const row = JSON.parse(JSON.stringify(rowDataExample))

                if (row.tripCoilNo) {
                    row.tripCoilNo.value = (i + 1).toString()
                } else if (row.trip_coil_no) {
                    row.trip_coil_no.value = (i + 1).toString()
                }

                table.push(row)
            }

            return {
                rowDataExampleCondition,
                limits: 'Absolute',
                table: {
                    table1: table
                }
            }
        },
        async initDCWindingCloseCoil(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            const {operating} = assetData

            const closeCoilsCount = parseInt(operating?.numberCloseCoil || operating?.number_of_close_coil || 1)

            let table = []

            for (let i = 0; i < closeCoilsCount; i++) {
                const row = JSON.parse(JSON.stringify(rowDataExample))

                if (row.closeCoilNo) {
                    row.closeCoilNo.value = (i + 1).toString()
                } else if (row.close_coil_no) {
                    row.close_coil_no.value = (i + 1).toString()
                }

                table.push(row)
            }

            return {
                rowDataExampleCondition,
                limits: 'Absolute',
                table: {
                    table1: table
                }
            }
        },
        async initDCWindingMotor(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            let table = []

            const row = JSON.parse(JSON.stringify(rowDataExample))
            table.push(row)

            return {
                rowDataExampleCondition,
                limits: 'Absolute',
                table: {
                    table1: table
                }
            }
        },
        async initInsulationResistanceCircuit(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            const {circuitBreaker} = assetData
            const phaseCount = parseInt(circuitBreaker?.numberOfPhase || circuitBreaker?.numberOfPhases || 3)

            let table = []

            for (let i = 0; i < phaseCount; i++) {
                const row = JSON.parse(JSON.stringify(rowDataExample))

                let measureName = ''
                if (i % phaseCount === 0) {
                    measureName = 'Phase A - (B+C+GND)'
                } else if (i % phaseCount === 1) {
                    measureName = 'Phase B - (A+C+GND)'
                } else {
                    measureName = 'Phase C - (A+B+GND)'
                }

                if (row.measure) {
                    row.measure.value = measureName
                } else if (row.measurement) {
                    row.measurement.value = measureName
                } else if (row.name) {
                    row.name.value = measureName
                }

                table.push(row)
            }

            return {
                rowDataExampleCondition,
                assessment: {
                    abs: {},
                    rel: {}
                },
                limits: 'Absolute',
                table: {
                    table1: table
                }
            }
        },
        async initInsulationResistanceTripCoil(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            const {operating} = assetData

            const tripCoilsCount = parseInt(operating?.numberTripCoil || operating?.number_of_trip_coil || 1)

            let table = []

            for (let i = 0; i < tripCoilsCount; i++) {
                const row = JSON.parse(JSON.stringify(rowDataExample))

                if (row.tripCoilNo) {
                    row.tripCoilNo.value = (i + 1).toString()
                } else if (row.trip_coil_no) {
                    row.trip_coil_no.value = (i + 1).toString()
                }

                table.push(row)
            }

            return {
                rowDataExampleCondition,
                assessment: {
                    abs: {},
                    rel: {}
                },
                limits: 'Absolute',
                table: {
                    table1: table
                }
            }
        },
        async initInsulationResistanceCloseCoil(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            const {operating} = assetData

            const closeCoilsCount = parseInt(operating?.numberCloseCoil || operating?.number_of_close_coil || 1)

            let table = []

            for (let i = 0; i < closeCoilsCount; i++) {
                const row = JSON.parse(JSON.stringify(rowDataExample))

                if (row.closeCoilNo) {
                    row.closeCoilNo.value = (i + 1).toString()
                } else if (row.close_coil_no) {
                    row.close_coil_no.value = (i + 1).toString()
                }

                table.push(row)
            }

            return {
                rowDataExampleCondition,
                assessment: {
                    abs: {},
                    rel: {}
                },
                limits: 'Absolute',
                table: {
                    table1: table
                }
            }
        },
        async initInsulationResistanceMotor(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            let table = []

            const row = JSON.parse(JSON.stringify(rowDataExample))
            table.push(row)

            return {
                rowDataExampleCondition,
                assessment: {
                    abs: {},
                    rel: {}
                },
                limits: 'Absolute',
                table: {
                    table1: table
                }
            }
        },
        async initSF6MoiturePurity(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            let moitureTable = []
            let purityTable = []

            const row1 = JSON.parse(JSON.stringify(rowDataExample))
            moitureTable.push(row1)

            const row2 = JSON.parse(JSON.stringify(rowDataExample))
            purityTable.push(row2)

            return {
                rowDataExampleCondition,
                assessment: {
                    abs: {},
                    rel: {}
                },
                limits: 'Absolute',
                table: {
                    table1: moitureTable,
                    table2: purityTable
                }
            }
        },
        async initSF6GasAnalysis(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            let decomSf6Table = []
            let so2Sof2Table = []
            let hfTable = []

            const row1 = JSON.parse(JSON.stringify(rowDataExample))
            decomSf6Table.push(row1)

            const row2 = JSON.parse(JSON.stringify(rowDataExample))
            so2Sof2Table.push(row2)

            const row3 = JSON.parse(JSON.stringify(rowDataExample))
            hfTable.push(row3)

            return {
                rowDataExampleCondition,
                assessment: {
                    abs: {},
                    rel: {}
                },
                limits: 'Absolute',
                table: {
                    table1: decomSf6Table,
                    table2: so2Sof2Table,
                    table3: hfTable
                }
            }
        },
        async initPressureGauge(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            let table = []

            const row = JSON.parse(JSON.stringify(rowDataExample))
            table.push(row)

            return {
                rowDataExampleCondition,
                limits: 'Absolute',
                table: {
                    table1: table
                }
            }
        },
        async initOverCurrentRelease(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            let table = []

            const row = JSON.parse(JSON.stringify(rowDataExample))
            table.push(row)

            return {
                rowDataExampleCondition,
                table: {
                    table1: table
                }
            }
        },
        async initUnderVoltageRelease(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            let table1 = []

            const row = JSON.parse(JSON.stringify(rowDataExample))
            table1.push(row)

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        },
        async initGeneralInspection(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(circuitBreakerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(circuitBreakerConditionMap[testTypeCode].columns)

            let table1 = []

            const data = [
                'Nameplate',
                'Installation check',
                'Grounding check',
                'SF6 pressure check',
                'Mechanical operating',
                'Electrical operaing',
                'Close at 75% control voltage',
                'Open at 70% control voltage',
                'Checking local control',
                'Checking remote control',
                'Check interlocking circuit by SF6 gas pressure',
                'Check contact resistance of auxiliary contacts'
            ]

            data.forEach((element) => {
                const row = JSON.parse(JSON.stringify(rowDataExample))

                if (row.item) {
                    row.item.value = element
                } else if (row.items) {
                    row.items.value = element
                } else if (row.name) {
                    row.name.value = element
                }

                table1.push(row)
            })

            return {
                rowDataExampleCondition,
                table: {
                    table1: table1
                }
            }
        }
    }
}
