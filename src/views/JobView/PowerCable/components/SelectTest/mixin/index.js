
/* eslint-disable */
import powerCableTestMap from '@/config/test-definitions/PowerCable'
import powerCableConditionMap from '@/config/testing-condition/PowerCable'
import * as common from '../../../../Common/index.js'
export default {
    methods: {
        async initTest(testTypeCode) {
            let data = null
            switch (testTypeCode) {
                case 'InsulationResistance':
                    data = this.initInsulationResistance(testTypeCode)
                    break
                case 'DcVoltageOverSheath':
                    data = await this.initDcVoltageOverSheath(testTypeCode)
                    break
                case 'AcVoltageInsulation':
                    data = await this.initAcVoltageInsulation(testTypeCode)
                    break
                case 'DcVoltageInsulation':
                    data = await this.initDcVoltageInsulation(testTypeCode)
                    break
                case 'VlfTest':
                    data = await this.initVlfTest(testTypeCode)
                    break
                case 'TandeltaVlfSource':
                    data = await this.initTandeltaVlfSource(testTypeCode)
                    break
                case 'TandeltaPowerAcSource':
                    data = await this.initTandeltaPowerAcSource(testTypeCode)
                    break
                case 'ParticalDischarge':
                    data = await this.initParticalDischarge(testTypeCode)
                    break
                case 'GeneralInspection':
                    data = await this.initGeneralInspection(testTypeCode)
                    break
            }

            return data
        },
        async initInsulationResistance(testTypeCode) {
            // Sử dụng nested table structure như SurgeArrester
            const rowDataExample = common.buildEmptyTestRow(powerCableTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(powerCableConditionMap[testTypeCode].columns)
            const row1 = JSON.parse(JSON.stringify(rowDataExample))
            row1.measurement.value = 'Phase A - B'
            const row2 = JSON.parse(JSON.stringify(rowDataExample))
            row2.measurement.value = 'Phase B - C'
            const row3 = JSON.parse(JSON.stringify(rowDataExample))
            row3.measurement.value = 'Phase C - A'
            const row4 = JSON.parse(JSON.stringify(rowDataExample))
            row4.measurement.value = 'Phase - GND'
            let table1 = [
                row1,
                row2,
                row3,
                row4
            ]
            let table = {
                'table1': table1
            }
            return {
                rowDataExampleCondition,
                table,
            }
        },
        async initDcVoltageOverSheath(testTypeCode) {
            let table1 = []
            const rowDataExample = common.buildEmptyTestRow(powerCableTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(powerCableConditionMap[testTypeCode].columns)
            
            // PowerCable specific measurements
            const measurements = ['Phase A-(B+C+GND)', 'Phase B-(A+C+GND)', 'Phase C-(A+B+GND)']
            measurements.forEach(measurement => {
                const rowData = JSON.parse(JSON.stringify(rowDataExample))
                rowData.measurement.value = measurement
                table1.push(rowData)
            })
            
            let table = {
                'table1': table1
            }
            return {
                rowDataExampleCondition,
                table
            }
        },
        async initAcVoltageInsulation(testTypeCode) {
            let table1 = []
            const rowDataExample = common.buildEmptyTestRow(powerCableTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(powerCableConditionMap[testTypeCode].columns)
            
            // PowerCable specific measurements
            const measurements = ['Phase A-(B+C+GND)', 'Phase B-(A+C+GND)', 'Phase C-(A+B+GND)']
            measurements.forEach(measurement => {
                const rowData = JSON.parse(JSON.stringify(rowDataExample))
                rowData.measurement.value = measurement
                table1.push(rowData)
            })
            
            let table = {
                'table1': table1
            }
            return {
                rowDataExampleCondition,
                table
            }
        },
        async initDcVoltageInsulation(testTypeCode) {
            let table1 = []
            const rowDataExample = common.buildEmptyTestRow(powerCableTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(powerCableConditionMap[testTypeCode].columns)
            
            // PowerCable specific measurements
            const measurements = ['Phase A-(B+C+GND)', 'Phase B-(A+C+GND)', 'Phase C-(A+B+GND)']
            measurements.forEach(measurement => {
                const rowData = JSON.parse(JSON.stringify(rowDataExample))
                rowData.measurement.value = measurement
                table1.push(rowData)
            })
            
            let table = {
                'table1': table1
            }
            return {
                rowDataExampleCondition,
                table
            }
        },
        async initVlfTest(testTypeCode) {
            let table1 = []
            const rowDataExample = common.buildEmptyTestRow(powerCableTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(powerCableConditionMap[testTypeCode].columns)
            
            // PowerCable specific measurements
            const measurements = ['Phase A-(B+C+GND)', 'Phase B-(A+C+GND)', 'Phase C-(A+B+GND)']
            measurements.forEach(measurement => {
                const rowData = JSON.parse(JSON.stringify(rowDataExample))
                rowData.measurement.value = measurement
                table1.push(rowData)
            })
            
            let table = {
                'table1': table1
            }
            return {
                rowDataExampleCondition,
                vlfSetting: {
                    frequency: '',
                    waveForm: '',
                    testDuration: '',
                    voltageDisplay: ''
                }, // VlfTest specific setting
                table
            }
        },
        async initTandeltaVlfSource(testTypeCode) {
            let table1 = []
            const rowDataExample = common.buildEmptyTestRow(powerCableTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(powerCableConditionMap[testTypeCode].columns)
            
            // TandeltaVlfSource creates 9 rows (3 measurements × 3 voltage levels each)
            const measurements = ['Phase A-(B+C+GND)', 'Phase B-(A+C+GND)', 'Phase C-(A+B+GND)']
            const voltageLabels = ['0.5', '1.0', '1.5']
            
            measurements.forEach(measurement => {
                voltageLabels.forEach(voltageLabel => {
                    const rowData = JSON.parse(JSON.stringify(rowDataExample))
                    rowData.measurement.value = measurement
                    // Add voltage level label (not in config, but needed for display)
                    rowData.test_voltage_label = {
                        mrid: "",
                        value: voltageLabel,
                        unit: "",
                        type: "string"
                    }
                    table1.push(rowData)
                })
            })
            
            let table = {
                'table1': table1
            }
            return {
                rowDataExampleCondition,
                vlfSetting: {
                    frequency: '',
                    waveForm: '',
                    testDuration: '',
                    voltageDisplay: ''
                }, // TandeltaVlfSource specific setting
                table
            }
        },
        async initTandeltaPowerAcSource(testTypeCode) {
            let table1 = []
            const rowDataExample = common.buildEmptyTestRow(powerCableTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(powerCableConditionMap[testTypeCode].columns)
            
            // PowerCable specific measurements
            const measurements = ['Phase A-(B+C+GND)', 'Phase B-(A+C+GND)', 'Phase C-(A+B+GND)']
            measurements.forEach(measurement => {
                const rowData = JSON.parse(JSON.stringify(rowDataExample))
                rowData.measurement.value = measurement
                table1.push(rowData)
            })
            
            let table = {
                'table1': table1
            }
            return {
                rowDataExampleCondition,
                table
            }
        },
        async initParticalDischarge(testTypeCode) {
                    let table1 = []
                    const rowDataExample = common.buildEmptyTestRow(powerCableTestMap[testTypeCode].columns)
                    const rowDataExampleCondition = common.buildEmptyTestCondition(powerCableConditionMap[testTypeCode].columns)

                    // PowerCable specific measurements
                    const measurements = ['Phase A-(B+C+GND)', 'Phase B-(A+C+GND)', 'Phase C-(A+B+GND)']
                    measurements.forEach(measurement => {
                        const rowData = JSON.parse(JSON.stringify(rowDataExample))
                        rowData.measurement.value = measurement
                        table1.push(rowData)
                    })

                    let table = {
                        'table1': table1
                    }
                    return {
                        rowDataExampleCondition,
                        table
                    }
                }
,
        async initGeneralInspection(testTypeCode) {
            let table1 = []
            const rowDataExample = common.buildEmptyTestRow(powerCableTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(powerCableConditionMap[testTypeCode].columns)
            // PowerCable specific items (không có 'Discharge counter check' như SurgeArrester)
            const data = ['Nameplate', 'Installation check', 'Grounding check']
            data.forEach(element => {
                const rowData = JSON.parse(JSON.stringify(rowDataExample))
                rowData.item.value = element
                table1.push(rowData)
            })
            let table = {
                'table1': table1
            }
            return {
                rowDataExampleCondition,
                table
            }
        }
    }
}