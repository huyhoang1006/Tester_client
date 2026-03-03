/* eslint-disable */
import voltageTransformerTestMap from '@/config/test-definitions/VoltageTransformer'
import voltageTransformerConditionMap from '@/config/testing-condition/VoltageTransformer'
import * as common from '../../../../Common/index.js'
export default {
    data() {
        return {}
    },
    methods: {
        async initTest(testTypeCode, assetData) {
            let data = null
            switch (testTypeCode) {
                case 'InsulationResistance':
                    data = this.initInsulationResistance(testTypeCode, assetData)
                    break
                case 'VTRatio':
                    data = await this.initVTRatio(testTypeCode, assetData)
                    break
                case 'DcWindingResistance':
                    data = await this.initDcWindingResistance(testTypeCode, assetData)
                    break
                case 'VTDfcap':
                    data = await this.initVTDfcap(testTypeCode)
                    break
                case 'GeneralInspection':
                    data = await this.initGeneralInspection(testTypeCode)
                    break
            }
            return data
        },
        async initInsulationResistance(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(voltageTransformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(voltageTransformerConditionMap[testTypeCode].columns)
            const row1 = JSON.parse(JSON.stringify(rowDataExample))
            row1.measurement.value = 'Prim - (Sec + GND)'
            let table = [row1]

            let winding = parseInt(assetData.OldPotentialTransformerInfo.windings || 0) || 2
            for (let i = 1; i <= parseInt(winding); i++) {
                const row = JSON.parse(JSON.stringify(rowDataExample))
                ;(row.measurement.value = '(' + i + 'a' + i + 'n' + ')' + ' - GND'), table.push(row)
            }
            return {
                rowDataExampleCondition,
                table
            }
        },
        async initVTRatio(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(voltageTransformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(voltageTransformerConditionMap[testTypeCode].columns)
            let table = []

            function uprData(uprRatio, upr) {
                if (uprRatio == ' / √3') return parseFloat(upr) / Math.sqrt(3)
                if (uprRatio == ' / 3') return parseFloat(upr) / 3
                return parseFloat(upr)
            }
            function uprRatioData(uprRatio) {
                if (uprRatio == '3sqrt') return ' / √3'
                if (uprRatio == '3') return ' / 3'
                return ''
            }
            function usrRatioData(usrRatio) {
                if (usrRatio == '3sqrt') return ' / √3'
                if (usrRatio == '3') return ' / 3'
                return ''
            }
            function usrData(usrRatio, usr) {
                if (usrRatio == ' / √3') return parseFloat(usr) / Math.sqrt(3)
                if (usrRatio == ' / 3') return parseFloat(usr) / 3
                return parseFloat(usr)
            }

            let winding = parseInt(assetData?.OldPotentialTransformerInfo?.windings || 0) || 2

            let ratings = assetData?.OldPotentialTransformerInfo?.ratings || assetData?.ratings || {}
            if (typeof ratings === 'string') {
                try {
                    ratings = JSON.parse(ratings)
                } catch (e) {
                    ratings = {}
                }
            }

            let dataVT = assetData?.OldPotentialTransformerInfo?.dataVT || []
            if (typeof dataVT === 'string') {
                try {
                    dataVT = JSON.parse(dataVT)
                } catch (e) {
                    dataVT = []
                }
            }

            let uprRatio = uprRatioData(ratings?.uprRatio || '')
            let upr = (ratings?.upr || '') + ' ' + uprRatio
            let uprValue = uprData(uprRatio, upr)

            for (let i = 1; i <= parseInt(winding); i++) {
                const row = JSON.parse(JSON.stringify(rowDataExample))

                if (row.name) row.name.value = '(' + i + 'a' + i + 'n' + ')' + ' - GND'
                else if (row.measurement) row.measurement.value = '(' + i + 'a' + i + 'n' + ')' + ' - GND'

                let usrRatio = ''
                let usr = ''
                let usrValue = 0

                if (dataVT && dataVT[i - 1]?.table) {
                    usrRatio = usrRatioData(dataVT[i - 1].table.usrRatio || '')
                    usr = (dataVT[i - 1].table.usr || '') + usrRatio
                    usrValue = usrData(usrRatio, dataVT[i - 1].table.usr || '0')
                }

                if (row.upr) row.upr.value = upr
                if (row.usr) row.usr.value = usr
                if (row.uprValue) row.uprValue.value = uprValue
                if (row.usrValue) row.usrValue.value = usrValue

                table.push(row)
            }

            return {
                rowDataExampleCondition,
                table
            }
        },
        async initDcWindingResistance(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(voltageTransformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(voltageTransformerConditionMap[testTypeCode].columns)

            let table = []
            let winding = parseInt(assetData.OldPotentialTransformerInfo.windings || 0) || 2
            for (let i = 1; i <= parseInt(winding); i++) {
                const row = JSON.parse(JSON.stringify(rowDataExample))
                if (row.name) {
                    row.name.value = i + 'a' + i + 'n'
                } else if (row.measurement) {
                    row.measurement.value = i + 'a' + i + 'n'
                }
                table.push(row)
            }
            return {
                rowDataExampleCondition,
                table
            }
        },
        async initVTDfcap(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(voltageTransformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(voltageTransformerConditionMap[testTypeCode].columns)

            let table = []
            const row = JSON.parse(JSON.stringify(rowDataExample))

            if (row.measurement) {
                row.measurement.value = 'C H-G'
            } else if (row.name) {
                row.name.value = 'C H-G'
            }

            if (row.testMode) {
                row.testMode.value = 'GST'
            }

            table.push(row)

            return {
                rowDataExampleCondition,
                table
            }
        },
        async initGeneralInspection(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(voltageTransformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(voltageTransformerConditionMap[testTypeCode].columns)

            let table = []
            const data = ['Nameplate', 'Installation check', 'Insulation surface', 'Ground frame', 'Terminal box', 'Marking of terminals', 'Oil check']

            data.forEach((element) => {
                const row = JSON.parse(JSON.stringify(rowDataExample))

                if (row.items) {
                    row.items.value = element
                } else if (row.measurement) {
                    row.measurement.value = element
                } else if (row.name) {
                    row.name.value = element
                }

                table.push(row)
            })
            return {
                rowDataExampleCondition,
                table
            }
        }
    }
}
