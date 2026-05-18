<template>
    <div id="dc-winding-resistance-prim">
        <!-- Cấu hình -->
        <div style="position: sticky; left: 0; display: inline-block;">
            <el-row class="mgb-10">
                <el-col>
                    <el-button class="btn-action" size="mini" type="success" @click="openAssessmentDialog = true">
                        <i class="fa-solid fa-screwdriver-wrench"></i> Assessment settings
                    </el-button>
                    <el-button class="btn-action" size="mini" type="success"
                        @click="openConditionIndicatorDialog = true">
                        <i class="fa-solid fa-hammer"></i> Condition indicatior settings
                    </el-button>
                </el-col>
            </el-row>

            <!-- Tương tác với bảng -->
            <el-row class="mgb-10">
                <el-col>
                    <el-button size="mini" type="primary" class="btn-action" @click="calculator"> <i
                            class="fas fa-circle-play"></i> Assess results </el-button>
                    <el-button size="mini" type="primary" class="btn-action" @click="clear"> <i
                            class="fas fa-xmark"></i> Clear all</el-button>
                </el-col>
            </el-row>
        </div>

        <table class="table-strip-input-data" style="width: 100% ; font-size: 12px;">
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Measurement</th>
                    <th>Test voltage (kV)</th>
                    <th>Frequency (Hz)</th>
                    <th>Test duration (minute)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                    <td>
                        {{ index + 1 }}
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.measurement.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.test_voltage.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.frequency.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.duration.value"></el-input>
                    </td>
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
                    <td>
                        <el-select :class="nameColor(item.condition_indicator.value)" id="condition" type="text"
                            size="mini" v-model="item.condition_indicator.value">
                            <el-option value="Good">Good</el-option>
                            <el-option value="Fair">Fair</el-option>
                            <el-option value="Poor">Poor</el-option>
                            <el-option value="Bad">Bad</el-option>
                        </el-select>
                    </td>
                    <td>
                        <el-button size="mini" type="primary" class="w-100" @click="addTest(index)">
                            <i class="fa-solid fa-plus"></i>
                        </el-button>
                    </td>
                    <td>
                        <el-button size="mini" type="danger" class="w-100" @click="deleteTest(index)">
                            <i class="fas fa-trash"></i>
                        </el-button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Assessment settings -->
                <!-- Assessment settings -->
        <el-dialog title="Assessment settings" :visible.sync="openAssessmentDialog" width="860px" append-to-body>
            <el-form style="width: 75%;" size="small" label-position="left" label-width="140px">
                <el-form-item label="Option">
                    <el-select size="mini" placeholder="please select" v-model="option">
                        <el-option v-for="opt in assessmentList" :key="opt" :label="opt" :value="opt"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div v-for="element in filteredAssessmentData" :key="element.mrid" class="assessment-container">
                <div class="assessment-header">
                    <div class="limit-col">Limit</div>
                    <div class="result-col">Assessment</div>
                </div>
                <div class="assessment-body">
                    <template v-for="(node, i) in element.tree">
                        <div v-if="!node.is_default" :key="'node-' + i" class="tree-row">
                            <div class="limit-col"><GroupNode :node="node" mode="limit" /></div>
                            <div class="result-col">
                                <span v-if="node.result === 'Pass' || node.result === 'Acceptable'" class="pass">✔ {{ node.result }}</span>
                                <span v-else-if="node.result === 'Fail' || node.result === 'Action Required'" class="fail">✖ {{ node.result }}</span>
                                <span v-else class="warn">⚠ {{ node.result }}</span>
                            </div>
                        </div>
                        <div v-else :key="'default-' + i" class="tree-row tree-row-default">
                            <div class="limit-col default-label">All other cases</div>
                            <div class="result-col">
                                <span v-if="node.result === 'Pass' || node.result === 'Acceptable'" class="pass">✔ {{ node.result }}</span>
                                <span v-else-if="node.result === 'Fail' || node.result === 'Action Required'" class="fail">✖ {{ node.result }}</span>
                                <span v-else class="warn">⚠ {{ node.result }}</span>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </el-dialog>

        <!-- Condition indicator settings -->
        <el-dialog title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog" width="860px">
        </el-dialog>
    </div>
</template>

<script>
/* eslint-disable */
import powerCableTestMap from '@/config/test-definitions/PowerCable'
import * as common from '../../Common/index.js'
import GroupNode from '../../Common/GroupNode.vue'
import { changeTestStandard } from '../../Common'

export default {
    name: "AcVoltageInsulation",
    components: { GroupNode },
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            option: null
        }
    },
    props: {
        data: { type: Object, require: true },
        asset: { type: Object, require: true },
        testAssessment: { type: Object, require: true },
        testCondition: { type: Object, default: function() { return {} } }
    },
    computed: {
        testData() { return this.data },
        assetData() { return this.asset },
        rowData() { return common.buildEmptyTestRow(powerCableTestMap['AcVoltageInsulation'].columns) },
        assessmentData() { return this.testAssessment ? this.testAssessment.assessment : [] },
        assessmentList() { return (this.assessmentData || []).map(x => x.type) },
        filteredAssessmentData() {
            if (!this.option) return []
            return (this.assessmentData || []).filter(e => e.type === this.option)
        },
        testStandardData() { return this.testAssessment ? this.testAssessment.testStandard : null }
    },
    watch: {
        'option': {
            immediate: true,
            handler: async function (newVal) {
                const standard = this.filteredAssessmentData.find(x => x.type === newVal)
                if (standard) await changeTestStandard(standard.mrid, newVal, this.testStandardData)
            }
        },
        'testStandardData': {
            immediate: true,
            handler: async function (newVal) {
                this.option = common.testStandardDataToOption(newVal)?.type || null
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
            this.$confirm('This will delete all data. Continue?', 'Warning', {
                confirmButtonText: 'OK', cancelButtonText: 'Cancel', type: 'warning'
            }).then(() => { if (this.testData.table) this.testData.table.table1 = [] }).catch(() => {})
        },
        deleteTest(index) {
            if (this.testData.table && this.testData.table.table1)
                this.testData.table.table1.splice(index, 1)
        },
        addTest(index) {
            const data = JSON.parse(JSON.stringify(this.rowData))
            if (this.testData.table && this.testData.table.table1)
                this.testData.table.table1.splice(index + 1, 0, data)
        },
        async calculator() {
            await this.calcAssessment()
            this.$message.success('Calculating successfully')
        },
        async calcAssessment() {
            const assessmentStandard = this.filteredAssessmentData.find(x => x.type === this.option)
            if (!assessmentStandard) { this.$message.error('Please select an assessment standard'); return }
            for (const row of this.testData.table.table1) {
                const measurementMap = {}
                Object.keys(row).forEach(key => {
                    const item = row[key]
                    if (!item || typeof item !== 'object') return
                    if (item.measurement_id) measurementMap[item.measurement_id] = item.value
                })
                const passedResults = []
                let hasNull = false
                let defaultResult = null
                for (const root of assessmentStandard.tree) {
                    if (root.is_default) { defaultResult = root.result; continue }
                    const pass = this.evaluateGroup(root, measurementMap)
                    if (pass === null) hasNull = true
                    else if (pass === true) passedResults.push(root.result)
                }
                if (hasNull) row.assessment.value = ''
                else if (passedResults.includes('Fail') || passedResults.includes('Action Required')) row.assessment.value = passedResults.find(r => r === 'Fail' || r === 'Action Required')
                else if (passedResults.includes('Further study advised')) row.assessment.value = 'Further study advised'
                else if (passedResults.includes('Acceptable') || passedResults.includes('Pass')) row.assessment.value = passedResults[0]
                else row.assessment.value = (defaultResult !== null && defaultResult !== undefined) ? defaultResult : ''
            }
        },
        evaluateGroup(group, measurementMap) {
            for (const condition of (group.conditions || [])) {
                const value = measurementMap[condition.measurement_id]
                if (value === null || value === undefined || value === '') return null
                if (condition.threshold === null || condition.threshold === undefined || condition.threshold === '') return null
            }
            for (const child of (group.children || [])) {
                if (this.evaluateGroup(child, measurementMap) === null) return null
            }
            const results = []
            for (const condition of (group.conditions || [])) {
                results.push(common.compare(measurementMap[condition.measurement_id], condition.operator, condition.threshold))
            }
            for (const child of (group.children || [])) {
                results.push(this.evaluateGroup(child, measurementMap))
            }
            if (results.length === 0) return null
            const logic = (group.logic || 'AND').toUpperCase()
            if (logic === 'OR') return results.some(x => x)
            return results.every(x => x)
        },
        clear() {
            if (this.testData.table && this.testData.table.table1) {
                this.testData.table.table1.forEach(row => {
                    Object.keys(row).forEach(key => {
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
table,
th,
td,
tr {
    white-space: nowrap;
}

.flex-container {
    display: flex;
    flex-direction: column;

    div {
        padding: 1px;
    }
}

.Good input {
    background: #00CC00;
}

.Fair input {
    background: #ffff00;
}

.Poor input {
    background: #ff9900;
}

.Bad input {
    background: #ff3300;
}

.assessment-container { width: 75%; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 16px; overflow: hidden; }
.assessment-header { display: flex; background: #f5f7fa; font-weight: bold; padding: 8px; }
.assessment-body { display: flex; flex-direction: column; border: 1px solid #ebeef5; border-radius: 4px; }
.tree-row { display: flex; align-items: center; border-bottom: 1px solid #ebeef5; min-height: 40px; padding: 8px 0; width: 100%; }
.tree-row:last-child { border-bottom: none; }
.limit-col { flex: 1; padding: 0 12px; }
.result-col { flex-shrink: 0; width: 120px; text-align: center; border-left: 1px solid #ebeef5; padding: 0 8px; align-self: stretch; display: flex; align-items: center; justify-content: center; }
.tree-row-default { background: #fafafa; }
.default-label { font-style: italic; color: #909399; font-size: 13px; }
.pass { color: #67C23A; font-weight: bold; }
.fail { color: #F56C6C; font-weight: bold; }
.warn { color: #E6A23C; font-weight: bold; }
</style>