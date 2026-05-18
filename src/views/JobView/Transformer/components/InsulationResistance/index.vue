<template>
    <div id="insulation-resistance">
        <div style="position: sticky; left: 0; display: inline-block;">
            <!-- Cấu hình -->
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

            <el-row :gutter="20" class="mgt-10">
                <el-col :span="24">
                    <el-button size="mini" type="primary" class="btn-action" @click="calculator"> <i
                            class="fas fa-circle-play"></i> Assess results </el-button>
                    <el-button size="mini" type="primary" class="btn-action" @click="clear"> <i
                            class="fas fa-xmark"></i> Clear all </el-button>
                </el-col>
            </el-row>
        </div>

        <table class="mgt-10 table-strip-input-data" style=" width: 130%; font-size: 12px; text-align: center;">
            <thead>
                <tr>
                    <th class="no-col">No</th>
                    <th style="width: 160px;" @click="displayType">Measurement</th>
                    <th @click="displayType">Type</th>
                    <th>R<sub>15s</sub> (MΩ)</th>
                    <th>R<sub>60s</sub> (MΩ)</th>
                    <th style="width: 90px;">R<sub>10min</sub> (MΩ)</th>
                    <th>DAR</th>
                    <th>PI</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="assessment-col">Condition indicator</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                    <td style="text-align: center;">
                        {{ index + 1 }}
                    </td>
                    <td style="display: flex; width: 100%;">
                        <el-input size="mini" v-model="item.measurement.value"></el-input>
                        <div
                            :class="{ colorTableRed: index % 3 == 0, colorTableYellow: index % 3 == 1, colorTableBlue: index % 3 == 2 }">
                        </div>
                    </td>
                    <td>
                        <el-select size="mini" v-model="item.type.value">
                            <el-option label="HV-E" value="HV-E"></el-option>
                            <el-option label="LV-E" value="LV-E"></el-option>
                        </el-select>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.r15s.value"> </el-input>
                    </td>
                    <td><el-input size="mini" type="text" number="positive" v-model="item.r60s.value"> </el-input></td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.r_10m.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.dar.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.pi.value"></el-input>
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
            <el-form style="width:75%;" size="small" label-position="left" label-width="140px">
                <el-form-item label="Option">
                    <el-select size="mini" placeholder="please select" v-model="option">
                        <el-option v-for="opt in assessmentList" :key="opt.mrid" :label="opt.name" :value="opt.code"></el-option>
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
                                <span v-if="node.result === 'Pass'" class="pass">✔ Pass</span>
                                <span v-else-if="node.result === 'Fail'" class="fail">✖ Fail</span>
                                <span v-else>—</span>
                            </div>
                        </div>
                        <div v-else :key="'default-' + i" class="tree-row tree-row-default">
                            <div class="limit-col default-label">All other cases</div>
                            <div class="result-col">
                                <span v-if="node.result === 'Pass'" class="pass">✔ Pass</span>
                                <span v-else-if="node.result === 'Fail'" class="fail">✖ Fail</span>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </el-dialog>

        <!-- Condition indicator settings -->
        <el-dialog :modal="false" title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog"
            width="670px">
            <!-- <table class="table-strip-input-data">
                <thead>
                    <tr>
                        <th>Result</th>
                        <th class="condition-indicator-col">Condition Indicator</th>
                        <th class="score-col">Score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <div class="flex-container">
                                <div>Kht ≥ {{ conditionIndicatorSetting.good.kht[1].value }}</div>
                                <div>R60s_HV-E ≥ {{ conditionIndicatorSetting.good.r60s_hve[1].value }} MΩ</div>
                                <div>R60s_LV-E ≥ {{ conditionIndicatorSetting.good.r60s_lve[1].value }} MΩ</div>
                            </div>
                        </td>
                        <td class="good">Good</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.good.score.value"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <div class="flex-container">
                                <div>{{ conditionIndicatorSetting.fair.kht[1].value }} > Kht ≥ {{
                                    conditionIndicatorSetting.fair.kht[0].value }}</div>
                                <div>{{ conditionIndicatorSetting.fair.r60s_hve[1].value }} MΩ > R60s_HV-E ≥ {{
                                    conditionIndicatorSetting.fair.r60s_hve[0].value }} MΩ</div>
                                <div>{{ conditionIndicatorSetting.fair.r60s_lve[1].value }} MΩ > R60s_LV-E ≥ {{
                                    conditionIndicatorSetting.fair.r60s_lve[0].value }} MΩ</div>
                            </div>
                        </td>
                        <td class="fair">Fair</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.fair.score.value"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <div class="flex-container">
                                <div>{{ conditionIndicatorSetting.poor.kht[1].value }} > Kht ≥ {{
                                    conditionIndicatorSetting.poor.kht[0].value }}</div>
                                <div>{{ conditionIndicatorSetting.poor.r60s_hve[1].value }} MΩ > R60s_HV-E ≥ {{
                                    conditionIndicatorSetting.poor.r60s_hve[0].value }} MΩ</div>
                                <div>{{ conditionIndicatorSetting.poor.r60s_lve[1].value }} MΩ > R60s_LV-E ≥ {{
                                    conditionIndicatorSetting.poor.r60s_lve[0].value }} MΩ</div>
                            </div>
                        </td>
                        <td class="poor">Poor</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.poor.score.value"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <div class="flex-container">
                                <div>Kht &lt; {{ conditionIndicatorSetting.bad.kht[0].value }}</div>
                                <div>R60s_HV-E &lt; {{ conditionIndicatorSetting.bad.r60s_hve[0].value }} MΩ</div>
                                <div>R60s_LV-E &lt; {{ conditionIndicatorSetting.bad.r60s_lve[0].value }} MΩ</div>
                            </div>
                        </td>
                        <td class="bad">Bad</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.bad.score.value"></el-input></td>
                    </tr>
                </tbody>
            </table> -->
        </el-dialog>
    </div>
</template>

<script>
/* eslint-disable */
import transformerTestMap from '@/config/test-definitions/Transformer'
import * as common from '../../../Common/index.js'
import GroupNode from '../../../Common/GroupNode.vue'
import { changeTestStandard } from '../../../Common'

export default {
    name: "InsulationResistance",
    components: { GroupNode },
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            option: null,
            displayType : true
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
        rowData()      { return common.buildEmptyTestRow(transformerTestMap['InsulationResistance'].columns) },
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
                var passedResults = []
                var hasNull = false
                var defaultResult = null
                for (var ri = 0; ri < assessmentStandard.tree.length; ri++) {
                    var root = assessmentStandard.tree[ri]
                    if (root.is_default) { defaultResult = root.result; continue }
                    var pass = this.evaluateGroup(root, measurementMap)
                    if (pass === null) hasNull = true
                    else if (pass === true) passedResults.push(root.result)
                }
                var finalResult
                if (hasNull && passedResults.length === 0) finalResult = ''
                else if (passedResults.includes('Fail'))  finalResult = 'Fail'
                else if (passedResults.includes('Pass'))  finalResult = 'Pass'
                else if (defaultResult === 'Pass')        finalResult = 'Pass'
                else if (defaultResult)                   finalResult = 'Fail'
                else                                      finalResult = ''
                row.assessment.value = finalResult
            }
        },
        evaluateGroup(group, measurementMap) {
            for (var ci = 0; ci < (group.conditions || []).length; ci++) {
                var cond = group.conditions[ci]
                var value = measurementMap[cond.measurement_id]
                if (value === null || value === undefined || value === '') return null
                if (cond.threshold === null || cond.threshold === undefined || cond.threshold === '') return null
            }
            for (var chi = 0; chi < (group.children || []).length; chi++) {
                if (this.evaluateGroup(group.children[chi], measurementMap) === null) return null
            }
            var results = []
            for (var ci2 = 0; ci2 < (group.conditions || []).length; ci2++) {
                var cond2 = group.conditions[ci2]
                results.push(common.compare(measurementMap[cond2.measurement_id], cond2.operator, cond2.threshold))
            }
            for (var chi2 = 0; chi2 < (group.children || []).length; chi2++) {
                results.push(this.evaluateGroup(group.children[chi2], measurementMap))
            }
            if (results.length === 0) return null
            var logic = (group.logic || 'AND').toUpperCase()
            if (logic === 'OR') return results.some(function(x) { return x })
            return results.every(function(x) { return x })
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
div.el-divider.el-divider--horizontal {
    width: 500px !important;
}

.flex-container {
    display: flex;
    flex-direction: column;

    div {
        padding: 1px;
        height: 30px;
        line-height: 30px;
    }
}

.Good input {
    background: #00CC00;
}

.Fair input {
    background: #FFFF00;
}

.Poor input {
    background: #FFC000;
}

.Bad input {
    background: #FF0000;
}

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