<template>
    <div id="energy-efficiency" class="test-ui">
        <div class="table-scroll">
        <table class="table-strip-input-data test-table">
            <thead>
                <tr>
                    <th></th>
                    <th>E50%</th>
                    <th>Standard</th>
                    <th class="assessment-col">Assessment</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                    <td>{{ item.name.value }}</td>
                    <td><el-input size="mini" type="text" number="positive" v-model="item.e50.value"></el-input></td>
                    <td><el-input size="mini" type="text" number="positive" v-model="item.standard.value"></el-input></td>
                    <td>
                        <el-select class="assessment" size="mini" v-model="item.assessment.value">
                            <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                            <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                        </el-select>
                        <span v-if="item.assessment.value === 'Pass'"
                            class="fa-solid fa-square-check pass icon-status"></span>
                        <span v-else-if="item.assessment.value === 'Fail'"
                            class="fa-solid fa-xmark fail icon-status"></span>
                    </td>
                </tr>
            </tbody>
        </table>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import transformerTestMap from '@/config/test-definitions/Transformer'
import * as common from '../../../Common/index.js'
import GroupNode from '../../../Common/GroupNode.vue'
import { changeTestStandard } from '../../../Common'

export default {
    name: "EnergyEfficiency",
    components: { GroupNode },
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            option: null
        }
    },
    props: {
        data:           { type: Object, require: true },
        asset:          { type: Object, require: true },
        testAssessment: { type: Object, require: true },
        testCondition:  { type: Object, default: function() { return { condition: {} } } }
    },
    computed: {
        testData()     { return this.data },
        assetData()    { return this.asset },
        conditions()   { return (this.testCondition && this.testCondition.condition) ? this.testCondition.condition : {} },
        rowData()      { return common.buildEmptyTestRow(transformerTestMap['EnergyEfficiency'].columns) },
        assessmentData()        { return this.testAssessment ? this.testAssessment.assessment : [] },
        assessmentList() {
            return (this.assessmentData || []).map(function(x) {
                return { code: x.code, name: x.name, type: x.type, mrid: x.mrid }
            })
        },
        filteredAssessmentData() {
            if (!this.option) return []
            return (this.assessmentData || []).filter(function(e) { return e.code === this.option }.bind(this))
        },
        testStandardData() { return this.testAssessment ? this.testAssessment.testStandard : null }
    },
    watch: {
        'option': {
            immediate: true,
            handler: async function (newVal) {
                const standard = this.filteredAssessmentData.find(x => x.code === newVal)
                if (standard) await changeTestStandard(standard.mrid, standard.type, this.testStandardData)
            }
        },
        'testStandardData': {
            immediate: true,
            handler: async function (newVal) {
                const optionData = common.testStandardDataToOption(newVal)
                if(optionData && optionData.mrid) {
                    const standardChosen = this.assessmentData.find(x => x.mrid === optionData.mrid)
                    if(standardChosen) {
                        this.option = standardChosen.code
                    }
                }
            }
        }
    },
    methods: {
        add() {
            if (!this.testData.table) this.$set(this.testData, 'table', {})
            if (!this.testData.table.table1) this.$set(this.testData.table, 'table1', [])
            this.testData.table.table1.push(JSON.parse(JSON.stringify(this.rowData)))
        },
        removeAll() {
            this.$confirm('Delete all?', 'Warning', { confirmButtonText: 'OK', cancelButtonText: 'Cancel', type: 'warning' })
                .then(function() { if (this.testData.table) this.testData.table.table1 = [] }.bind(this))
                .catch(function() {})
        },
        deleteTest(index) {
            if (this.testData.table && this.testData.table.table1)
                this.testData.table.table1.splice(index, 1)
        },
        addTest(index) {
            var data = JSON.parse(JSON.stringify(this.rowData))
            if (this.testData.table && this.testData.table.table1)
                this.testData.table.table1.splice(index + 1, 0, data)
        },
        async calculator() {
            this.computeFields()
            await this.calcAssessment()
            this.$message.success('Calculating successfully')
        },
        computeFields() {
            // No computed fields for this test
        },
        async calcAssessment() {
            var assessmentStandard = this.filteredAssessmentData.find(function(x) { return x.code === this.option }.bind(this))
            if (!assessmentStandard) { this.$message.error('Please select an assessment standard'); return }
            var rows = this.testData.table.table1
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i]
                var measurementMap = {}
                Object.keys(row).forEach(function(key) {
                    var item = row[key]
                    if (!item || typeof item !== 'object') return
                    if (item.measurement_id) measurementMap[item.measurement_id] = item.value
                })
                row.assessment.value = common.resolveAssessmentResult(assessmentStandard, measurementMap)
            }
        },
        evaluateGroup(group, measurementMap) {
            return common.evaluateAssessmentGroup(group, measurementMap)
        },
        clear() {
            if (this.testData.table && this.testData.table.table1) {
                this.testData.table.table1.forEach(function(row) {
                    Object.keys(row).forEach(function(key) {
                        if (key === 'mrid') return
                        if (row[key] && typeof row[key] === 'object' && 'value' in row[key]) row[key].value = ''
                    })
                })
            }
        },
        nameColor(data) {
            if (data === this.$constant.GOOD) return 'Good'
            else if (data === this.$constant.FAIR) return 'Fair'
            else if (data === this.$constant.POOR) return 'Poor'
            else if (data === this.$constant.BAD) return 'Bad'
            else return
        }
    }
}
</script>

<style lang="scss" scoped>
@import "~@/views/JobView/Common/testUi.scss";
.assessment-container { width: 75%; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 16px; overflow: hidden; }
.assessment-header { display: flex; background: #f5f7fa; font-weight: bold; padding: 8px; }
.assessment-body { display: flex; flex-direction: column; border: 1px solid #ebeef5; border-radius: 4px; }
.tree-row { display: flex; align-items: center; border-bottom: 1px solid #ebeef5; min-height: 40px; padding: 8px 0; width: 100%; }
.tree-row:last-child { border-bottom: none; }
.limit-col { flex: 1; padding: 0 12px; }
.result-col { flex-shrink: 0; width: 100px; text-align: center; border-left: 1px solid #ebeef5; padding: 0 12px; align-self: stretch; display: flex; align-items: center; justify-content: center; }
.tree-row-default { background: #fafafa; }
.default-label { font-style: italic; color: #909399; font-size: 13px; }
.pass { color: #67C23A; font-weight: bold; }
.fail { color: #F56C6C; font-weight: bold; }
</style>