/* eslint-disable */
import voltageTransformerTestMap from '@/config/test-definitions/VoltageTransformer'
import voltageTransformerConditionMap from '@/config/testing-condition/VoltageTransformer'
import voltageTransformerAssessmentMap from '@/config/testing-assessment/VoltageTransformer'
import * as common from '../../../../Common/index.js'
import { uprValueFromCode } from '@/config/upr-options'

/**
 * assetData tới đây ở HAI DẠNG KHÁC NHAU tuỳ đường vào — đây là nguồn của bug
 * "khai 3 cuộn nhưng bảng chỉ sinh 2 dòng":
 *
 *   - Mở job có sẵn trong tab (Tabs.vue)  → DTO, đã map:
 *         assetData.vt_Configuration.windings
 *         assetData.ratings.upr
 *   - Dialog Add Job (showAddJob.js)      → ENTITY thô từ DB, CHƯA map:
 *         assetData.OldPotentialTransformerInfo.windings
 *         assetData.OldPotentialTransformerInfo.upr_formula
 *
 * Code cũ chỉ đọc nhánh DTO nên ở dialog luôn rơi về mặc định 2 cuộn và UPR rỗng.
 * Hai hàm dưới đọc được cả hai dạng.
 */
const parseMaybeJson = (value) => {
    if (typeof value !== 'string') return value || {}
    try {
        return JSON.parse(value) || {}
    } catch (e) {
        return {}
    }
}

/** Số cuộn thứ cấp; không đọc được thì mặc định 2 */
const readWindings = (assetData) => {
    const vtConfig = parseMaybeJson(assetData?.vt_Configuration)
    const info = parseMaybeJson(assetData?.OldPotentialTransformerInfo)
    const raw = vtConfig?.windings ?? info?.windings
    return parseInt(raw, 10) || 2
}

/** Mã hệ số Upr: '1' | '3' | '3sqrt' */
const readUprCode = (assetData) => {
    const ratings = parseMaybeJson(assetData?.ratings)
    const info = parseMaybeJson(assetData?.OldPotentialTransformerInfo)
    return ratings?.upr || info?.upr_formula || ''
}

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
            const rowDataAssessment = common.buildEmptyTestAssessment(voltageTransformerAssessmentMap[testTypeCode].testStandard)
            const row1 = JSON.parse(JSON.stringify(rowDataExample))
            row1.measurement.value = 'Prim - (Sec + GND)'
            let insulation = [row1]

            // Đọc được cả DTO (mở tab) lẫn entity thô (dialog Add Job)
            const winding = readWindings(assetData)

            for (let i = 1; i <= winding; i++) {
                const row = JSON.parse(JSON.stringify(rowDataExample))
                row.measurement.value = '(' + i + 'a' + i + 'n' + ')' + ' - GND'
                insulation.push(row)
            }
            
            return {
                rowDataExampleCondition,
                rowDataAssessment,
                table: {
                    "table1": insulation
                }
            }
        },
        async initVTRatio(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(voltageTransformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(voltageTransformerConditionMap[testTypeCode].columns)
            const rowDataAssessment = common.buildEmptyTestAssessment(voltageTransformerAssessmentMap[testTypeCode].testStandard)

            let table = []

            // Đọc được cả DTO (mở tab) lẫn entity thô (dialog Add Job)
            const winding = readWindings(assetData)

            // 'upr' bên Ratings LÀ mã hệ số ('1'|'3'|'3sqrt'), không phải điện áp.
            // Điện áp nằm ở ratings.rated_voltage, cố ý không dùng ở đây.
            // Quy đổi sang số ngay: dropdown ở bảng test hiện nhãn "1 / √3" nhưng
            // ô luôn lưu số — xem config/upr-options để biết vì sao.
            const upr = uprValueFromCode(readUprCode(assetData))

            for (let i = 1; i <= winding; i++) {
                const row = JSON.parse(JSON.stringify(rowDataExample))

                if (row.name) row.name.value = '(' + i + 'a' + i + 'n' + ')' + ' - GND'
                else if (row.measurement) row.measurement.value = '(' + i + 'a' + i + 'n' + ')' + ' - GND'

                if (row.upr) row.upr.value = upr

                // USR để trống cho kỹ thuật viên tự nhập.

                table.push(row)
            }

            return {
                rowDataExampleCondition,
                rowDataAssessment,
                table: {
                    "table1": table
                }
            }
        },
        async initDcWindingResistance(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(voltageTransformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(voltageTransformerConditionMap[testTypeCode].columns)
            const rowDataAssessment = common.buildEmptyTestAssessment(voltageTransformerAssessmentMap[testTypeCode].testStandard)

            let table = []
            
            // Đọc được cả DTO (mở tab) lẫn entity thô (dialog Add Job)
            const winding = readWindings(assetData)

            for (let i = 1; i <= winding; i++) {
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
                rowDataAssessment,
                table: {
                    "table1": table
                }
            }
        },
        async initVTDfcap(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(voltageTransformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(voltageTransformerConditionMap[testTypeCode].columns)
            const rowDataAssessment = common.buildEmptyTestAssessment(voltageTransformerAssessmentMap[testTypeCode].testStandard)

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
                rowDataAssessment,
                table: {
                    "table1": table // Changed to use table1 structure
                }
            }
        },
        async initGeneralInspection(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(voltageTransformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(voltageTransformerConditionMap[testTypeCode].columns)
            const rowDataAssessment = common.buildEmptyTestAssessment(voltageTransformerAssessmentMap[testTypeCode].testStandard || [])

            let table = []
            const data = ['Nameplate', 'Installation check', 'Insulation surface', 'Ground frame', 'Terminal box', 'Marking of terminals', 'Oil check']

            data.forEach((element) => {
                const row = JSON.parse(JSON.stringify(rowDataExample))

                if (row.item) {
                    row.item.value = element
                } else if (row.items) {
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
                rowDataAssessment,
                table: {
                    "table1": table // Changed to use table1 structure
                }
            }
        }
    }
}
