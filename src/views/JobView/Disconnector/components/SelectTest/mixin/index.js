/* eslint-disable */
import {mapState} from 'vuex'
import disconnectorTestMap from '@/config/test-definitions/Disconnector'
import disconnectorConditionMap from '@/config/testing-condition/Disconnector'
import * as common from '@/views/JobView/Common/index'

export default {
    data() {
        return {}
    },
    computed: mapState(['selectedAsset', 'selectedJob']),
    async beforeMount() {},
    methods: {
        async initTest(testTypeCode, assetData) {
            let data = null
            switch (testTypeCode) {
                case 'InsulationResistance':
                    data = this.initInsulationResistance(testTypeCode)
                    break
                case 'ContactResistance':
                    data = await this.initContactResistance(testTypeCode)
                    break
                case 'InsulationResMotor':
                    data = await this.initInsulationResMotor(testTypeCode)
                    break
                case 'DcWindingMotor':
                    data = await this.initDcWindingMotor(testTypeCode)
                    break
                case 'OperatingTest':
                    data = await this.initOperatingTest(testTypeCode)
                    break
                case 'ControlCheck':
                    data = await this.initControlCheck(testTypeCode)
                    break
                case 'GeneralInspection':
                    data = await this.initGeneralInspection(testTypeCode)
                    break
            }

            return data
        },
        async initInsulationResistance(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(disconnectorTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(disconnectorConditionMap[testTypeCode].columns)

            const row1 = JSON.parse(JSON.stringify(rowDataExample))
            row1.measurement.value = 'Phase A-(B+C+GND)'
            const row2 = JSON.parse(JSON.stringify(rowDataExample))
            row2.measurement.value = 'Phase B-(A+C+GND)'
            const row3 = JSON.parse(JSON.stringify(rowDataExample))
            row3.measurement.value = 'Phase C-(A+B+GND)'

            const table1 = [row1, row2, row3]
            const table = {table1}

            return {
                rowDataExampleCondition,
                table
            }
        },
        async initContactResistance(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(disconnectorTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(disconnectorConditionMap[testTypeCode].columns)

            const row1 = JSON.parse(JSON.stringify(rowDataExample))
            row1.measurement.value = 'Main contact'
            const row2 = JSON.parse(JSON.stringify(rowDataExample))
            row2.measurement.value = 'Earth switch'

            const table1 = [row1, row2] // Hoặc có thể tạo nhiều rows
            const table = {table1}

            return {
                rowDataExampleCondition,
                table
            }
        },

        async initInsulationResMotor(testTypeCode) {
            const rowDataExampleCondition = common.buildEmptyTestCondition(disconnectorConditionMap[testTypeCode].columns)
            const rowDataExample = common.buildEmptyTestRow(disconnectorTestMap[testTypeCode].columns)
            const row1 = JSON.parse(JSON.stringify(rowDataExample))
            const table1 = [row1] // Hoặc có thể tạo nhiều rows
            const table = {table1}
            return {
                rowDataExampleCondition,
                table
            }
        },
        async initDcWindingMotor(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(disconnectorTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(disconnectorConditionMap[testTypeCode].columns)

            // Tạo ít nhất 1 row với cấu trúc đúng
            const row1 = JSON.parse(JSON.stringify(rowDataExample))

            const table1 = [row1]
            const table = {table1}

            return {
                rowDataExampleCondition,
                table
            }
        },
        async initOperatingTest(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(disconnectorTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(disconnectorConditionMap[testTypeCode].columns)

            const row1 = JSON.parse(JSON.stringify(rowDataExample))
            row1.measurement.value = 'Main contact'
            const row2 = JSON.parse(JSON.stringify(rowDataExample))
            row2.measurement.value = 'Earth switch'

            const table1 = [row1, row2]
            const table = {table1}

            return {
                rowDataExampleCondition,
                table
            }
        },
        async initControlCheck(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(disconnectorTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(disconnectorConditionMap[testTypeCode].columns)

            // Create default rows based on config
            const defaultItems = ['Control circuit A', 'Control circuit B', 'Control circuit C', 'Auxiliary circuit', 'Heater circuit']

            const table1 = defaultItems.map((itemValue) => {
                const row = JSON.parse(JSON.stringify(rowDataExample))
                if (row.measurement) {
                    row.measurement.value = itemValue
                }
                return row
            })

            const table = {table1}

            return {
                rowDataExampleCondition,
                table
            }
        },
        async initGeneralInspection(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(disconnectorTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(disconnectorConditionMap[testTypeCode].columns)
            const defaultItems = disconnectorTestMap[testTypeCode].defaultRows.map((x) => x.item)

            const table1 = defaultItems.map((itemValue) => {
                const row = JSON.parse(JSON.stringify(rowDataExample))
                if (row.item) {
                    row.item.value = itemValue
                }
                return row
            })

            const table = {table1}
            return {
                rowDataExampleCondition,
                table
            }
        }
    }
}
