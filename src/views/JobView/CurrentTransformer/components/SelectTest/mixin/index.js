import CurrentTransformerTestMap from '@/config/test-definitions/CurrentTransformer'
import CurrentTransformerConditionMap from '@/config/testing-condition/CurrentTransformer'
import * as common from '../../../../Common/index.js'

export default {
    methods: {
        // eslint-disable-next-line no-unused-vars
        async initTest(testTypeCode, assetData) {
            let data = null
            switch (testTypeCode) {
                case 'InsulationResistance':
                    data = this.initInsulationResistance(testTypeCode)
                    break
                case 'CTRatio':
                    data = await this.initCTRatio(testTypeCode)
                    break
                case 'CTExcitation':
                    data = await this.initCTExcitation(testTypeCode)
                    break
                case 'CTWindingRes':
                    data = await this.initCTWindingRes(testTypeCode)
                    break
                case 'CTDfcap':
                    data = await this.initCTDfcap(testTypeCode)
                    break
                case 'GeneralInspection':
                    data = await this.initGeneralInspection(testTypeCode)
                    break
            }

            return data
        },
        async initInsulationResistance(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(CurrentTransformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(CurrentTransformerConditionMap[testTypeCode].columns)
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
            return {
                rowDataExampleCondition,
                table,
            }
        },
        async initCTRatio(testTypeCode) {
            let table = []
            const rowDataExample = common.buildEmptyTestRow(CurrentTransformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(CurrentTransformerConditionMap[testTypeCode].columns)
            
            // Tạo một row mặc định với tất cả field trống
            const row = JSON.parse(JSON.stringify(rowDataExample))
            table.push(row)
            
            return {
                rowDataExampleCondition,
                table
            }
        },
        async initCTExcitation() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Name',
                    code: 'name',
                    unit: '',
                    type: 'string'
                },
                {
                    mrid: '',
                    name: 'I knee',
                    code: 'iknee',
                    unit: 'A',
                    type: 'analog'
                },
                {
                    mrid: '',
                    name: 'V knee',
                    code: 'vknee',
                    unit: 'V',
                    type: 'analog'
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [
                            {mrid: '', value: 0, alias_name: 'Fail'},
                            {mrid: '', value: 1, alias_name: 'Pass'}
                        ]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [
                            {mrid: '', value: 0, alias_name: 'Bad'},
                            {mrid: '', value: 1, alias_name: 'Poor'},
                            {mrid: '', value: 2, alias_name: 'Fair'},
                            {mrid: '', value: 3, alias_name: 'Good'}
                        ]
                    }
                }
            ]
            let table = []
            let measurementProcedure = []
            return {
                table,
                row_data,
                measurementProcedure
            }
        },
        async initCTWindingRes() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Name',
                    code: 'name',
                    unit: '',
                    type: 'string'
                },
                {
                    mrid: '',
                    name: 'R meas',
                    code: 'r_meas',
                    unit: 'Ω',
                    type: 'analog'
                },
                {
                    mrid: '',
                    name: 'R ref',
                    code: 'r_ref',
                    unit: 'Ω',
                    type: 'analog'
                },
                {
                    mrid: '',
                    name: 'R corr',
                    code: 'r_corr',
                    unit: 'Ω',
                    type: 'analog'
                },
                {
                    mrid: '',
                    name: 'R dev',
                    code: 'r_dev',
                    unit: '%',
                    type: 'analog'
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [
                            {mrid: '', value: 0, alias_name: 'Fail'},
                            {mrid: '', value: 1, alias_name: 'Pass'}
                        ]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [
                            {mrid: '', value: 0, alias_name: 'Bad'},
                            {mrid: '', value: 1, alias_name: 'Poor'},
                            {mrid: '', value: 2, alias_name: 'Fair'},
                            {mrid: '', value: 3, alias_name: 'Good'}
                        ]
                    }
                }
            ]
            let table = []
            let measurementProcedure = []
            return {
                table,
                row_data,
                measurementProcedure
            }
        },
        async initCTDfcap(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(CurrentTransformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(CurrentTransformerConditionMap[testTypeCode].columns)
            
            let table = []

            // 2. Clone dòng đầu tiên từ template
            const row = JSON.parse(JSON.stringify(rowDataExample))

            // 3. Gán giá trị mặc định cho cột Measurement (hoặc Name tuỳ vào file map)
            if (row.measurement) {
                row.measurement.value = 'C H-G'
            } else if (row.name) {
                row.name.value = 'C H-G'
            }

            // Gán giá trị mặc định cho cột Test Mode (theo config là test_mode)
            if (row.test_mode) {
                row.test_mode.value = 'GST'
            }

            // Đẩy dòng dữ liệu vào table
            table.push(row)

            // 4. Trả về đúng format chuẩn hệ thống
            return {
                rowDataExampleCondition,
                table
            }
        },
        async initGeneralInspection(testTypeCode) {
            let table = []
            const rowDataExample = common.buildEmptyTestRow(CurrentTransformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(CurrentTransformerConditionMap[testTypeCode].columns)
            
            // Sử dụng defaultRows từ JSON definition nếu có, nếu không thì dùng hardcode
            const testDefinition = CurrentTransformerTestMap[testTypeCode]
            const defaultItems = testDefinition.defaultRows 
                ? testDefinition.defaultRows.map(row => row.items)
                : ['Nameplate', 'Installation check', 'Grounding check', 'Discharge counter check']
            
            defaultItems.forEach(element => {
                const rowData = JSON.parse(JSON.stringify(rowDataExample))
                rowData.item.value = element
                table.push(rowData)
            })
            return {
                rowDataExampleCondition,
                table
            }
        }
    }
}
