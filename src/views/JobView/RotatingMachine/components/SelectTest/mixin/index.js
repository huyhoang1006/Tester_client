/* eslint-disable */
import rotatingMachineTestMap from '@/config/test-definitions/RotatingMachine'
import rotatingMachineConditionMap from '@/config/testing-condition/RotatingMachine'
import rotatingMachineAssessmentMap from '@/config/testing-assessment/RotatingMachine'
import * as common from '../../../../Common/index.js'

const buildDefaultRows = (definition, rowTemplate) => {
    const defaults = definition.defaultRows || [{}]
    return defaults.map(values => {
        const row = JSON.parse(JSON.stringify(rowTemplate))
        Object.keys(values).forEach(key => {
            if (row[key]) row[key].value = values[key]
        })
        return row
    })
}

export default {
    methods: {
        async initTest(testTypeCode) {
            const definition = rotatingMachineTestMap[testTypeCode]
            if (!definition) {
                throw new Error(`Unsupported Rotating Machine test: ${testTypeCode}`)
            }

            const conditionDefinition = rotatingMachineConditionMap[testTypeCode] || { columns: [] }
            const assessmentDefinition = rotatingMachineAssessmentMap[testTypeCode] || { testStandard: [] }
            const rowDataExample = common.buildEmptyTestRow(definition.columns || [])
            const rowDataExampleCondition = common.buildEmptyTestCondition(conditionDefinition.columns || [])
            const rowDataAssessment = common.buildEmptyTestAssessment(assessmentDefinition.testStandard || [])

            if (testTypeCode === 'StatorWindingDfCap' && rowDataExampleCondition.step) {
                rowDataExampleCondition.step.value = '0.2'
            }
            if (rowDataExampleCondition.temperature_correction) {
                rowDataExampleCondition.temperature_correction.value = 'false'
            }

            const table = testTypeCode === 'StatorWindingDfCap'
                ? []
                : buildDefaultRows(definition, rowDataExample)

            common.markInitialTestValues(table)
            return {
                rowDataExampleCondition,
                rowDataAssessment,
                table
            }
        }
    }
}
