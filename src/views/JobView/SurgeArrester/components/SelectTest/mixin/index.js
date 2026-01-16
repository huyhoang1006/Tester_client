/* eslint-disable */
import surgeArresterTestMap from '@/config/test-definitions/SurgeArrester'
import * as common from '../../../../Common/index.js'
export default {
    methods: {
        async initTest(testTypeCode, assetData) {
            let data = null
            switch (testTypeCode) {
                case 'InsulationResistance':
                    data = this.initInsulationResistance(testTypeCode)
                    break
                case 'GeneralInspection':
                    data = await this.initGeneralInspection(testTypeCode)
                    break
                case 'LeakageCurrent':
                    data = await this.initLeakageCurrent(assetData, testTypeCode)
                    break
                case 'PowerFrequency':
                    data = await this.initPowerFrequency(assetData, testTypeCode)
                    break
            }
            return data
        },
        async initInsulationResistance(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(surgeArresterTestMap[testTypeCode].columns)
            const row1 = JSON.parse(JSON.stringify(rowDataExample))
            row1.measurement.value = 'Phase A - B'
            const row2 = JSON.parse(JSON.stringify(rowDataExample))
            row2.measurement.value = 'Phase B - C'
            const row3 = JSON.parse(JSON.stringify(rowDataExample))
            row3.measurement.value = 'Phase C - A'
            const row4 = JSON.parse(JSON.stringify(rowDataExample))
            row4.measurement.value = 'Phase - GND'
            let table = [
                row1,
                row2,
                row3,
                row4
            ]
            console.log('table', table)
            return {
                table,
            }
        },
        async initLeakageCurrent(assetData, testTypeCode) {
            let units = assetData.unit_count || 0
            let phase = ["A", "B", "C"]
            let table = []
            const rowDataExample = common.buildEmptyTestRow(surgeArresterTestMap[testTypeCode].columns)
            for (let i in phase) {
                for (let j = 1; j <= units; j++) {
                    let data = JSON.parse(JSON.stringify(rowDataExample))
                    data.phase.value = phase[i]
                    data.unit_no.value = j
                    table.push(data)
                }
            }
            return {
                table
            }
        },
        async initPowerFrequency(assetData, testTypeCode) {
            let units = assetData.unit_count || 0
            let phase = ["A", "B", "C"]
            let table = []
            const rowDataExample = common.buildEmptyTestRow(surgeArresterTestMap[testTypeCode].columns)
            for (let i in phase) {
                for (let j = 1; j <= units; j++) {
                    let data = JSON.parse(JSON.stringify(rowDataExample))
                    data.phase.value = phase[i]
                    data.unit_no.value = j
                    table.push(data)
                }
            }
            return {
                table
            }
        },
        async initGeneralInspection(testTypeCode) {
            let table = []
            const rowDataExample = common.buildEmptyTestRow(surgeArresterTestMap[testTypeCode].columns)
            const data = ['Nameplate', 'Installation check', 'Grounding check', 'Discharge counter check']
            data.forEach(element => {
                const rowData = JSON.parse(JSON.stringify(rowDataExample))
                rowData.item.value = element
                table.push(rowData)
            })
            return {
                table
            }
        }
    }
}
