<template>
    <div id="dc-winding-resistance-tert" class="test-ui">
        <!-- Cấu hình -->
        <div class="test-toolbar">
            <div class="test-toolbar-group">
                <el-button size="mini" type="primary" @click="calculator"> <i class="fas fa-circle-play"></i> Assess results </el-button>
                <el-button size="mini" @click="clear"> <i class="fas fa-xmark"></i> Clear all </el-button>
            </div>
            <div class="test-toolbar-group">
                <el-button size="mini" @click="openAssessmentDialog = true"> <i class="fa-solid fa-screwdriver-wrench"></i> Assessment settings </el-button>
                <el-button size="mini" @click="openConditionIndicatorDialog = true"> <i class="fa-solid fa-hammer"></i> Condition indicator settings </el-button>
            </div>
        </div>

        <div class="table-scroll">
        <table class="table-strip-input-data test-table">
            <thead>
                <tr>
                    <th class="no-col" v-if="assetData.tap_changers.winding === $constant.TERT">Tap</th>
                    <th class="phase-col">Name</th>
                    <th>R meas</th>
                    <th>R ref</th>
                    <th>R corr</th>
                    <th>Dev with R ref (%)</th>
                    <th>Dev within phases (%)</th>
                    <!-- <th>Mean value</th> -->
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                    <td v-if="assetData.tap_changers.winding === $constant.TERT">{{ item.tap.value }}</td>
                    <td style="width: 100px">
                        <div class="col-phase">
                            <div class="phase">
                                <el-input size="mini" type="text" v-model="item.name.value"></el-input>
                            </div>
                            <div class="rectangle"
                                :class="{ red: item.name.value == 'A', yellow: item.name.value == 'B', blue: item.name.value == 'C' }">
                            </div>
                        </div>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.r_meas.value"><template
                                slot="append">Ω</template></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.r_ref.value"><template
                                slot="append">Ω</template></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.r_corr.value"><template
                                slot="append">Ω</template></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.dev_r_ref.value"></el-input>
                    </td>
                    <template v-if="index % 3 == 0 && assetData.tap_changers.winding === $constant.TERT">
                        <td rowspan="3">
                            <el-input size="mini" type="text" number="positive" v-model="item.dev_phase.value"></el-input>
                        </td>

                        <!-- <td rowspan="3">
                                <el-input size="mini" type="text" v-model="item.mean_value.value"><template slot="append">Ω</template></el-input>
</td> -->
                    </template>
                    <template v-else-if="index % 3 == 0 && assetData.tap_changers.winding !== $constant.TERT">
                        <td rowspan="3">
                            <el-input size="mini" type="text" number="positive" v-model="item.dev_phase.value"></el-input>
                        </td>

                        <!-- <td rowspan="3">
                                <el-input size="mini" type="text" v-model="item.mean_value.value"><template slot="append">Ω</template></el-input>
</td> -->
                    </template>
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
                </tr>
            </tbody>
        </table>
        </div>

        <!-- Assessment settings -->
        <!-- Assessment settings -->
        <el-dialog title="Assessment settings" :visible.sync="openAssessmentDialog" width="min(860px, 92vw)" append-to-body>
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
        <el-dialog append-to-body title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog"
            width="870px">
            <!-- <div class="table-scroll">
        <table class="table-strip-input-data test-table">
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
                            % Error between phase or Error with R ref % ≤
                            <el-input size="mini" class="w-100px"
                                v-model="conditionIndicatorSetting.good.error_between_phase[0].value"></el-input>
                        </td>
                        <td class="Good">Good</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.good.score.value"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <el-input size="mini" class="w-100px"
                                v-model="conditionIndicatorSetting.fair.error_between_phase[0].value"></el-input> &lt; %
                            Error
                            between phase or Error with R ref % ≤
                            <el-input size="mini" class="w-100px"
                                v-model="conditionIndicatorSetting.fair.error_between_phase[1].value"></el-input>
                        </td>
                        <td class="Fair">Fair</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.fair.score.value"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <el-input size="mini" class="w-100px"
                                v-model="conditionIndicatorSetting.poor.error_between_phase[0].value"></el-input> &lt; %
                            Error
                            between phase or Error with R ref % ≤
                            <el-input size="mini" class="w-100px"
                                v-model="conditionIndicatorSetting.poor.error_between_phase[1].value"></el-input>
                        </td>
                        <td class="Poor">Poor</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.poor.score.value"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            % Error between phase or Error with R ref % >
                            <el-input size="mini" class="w-100px"
                                v-model="conditionIndicatorSetting.bad.error_between_phase[1].value"></el-input>
                        </td>
                        <td class="Bad">Bad</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.bad.score.value"></el-input></td>
                    </tr>
                </tbody>
            </table>
        </div> -->
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
    name: "DCWindingTert",
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
        rowData()      { return common.buildEmptyTestRow(transformerTestMap['DCWindingTert'].columns) },
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
            var rows = this.testData.table.table1
            if (!rows || rows.length === 0) return
            var cond = this.conditions
            var tMeas = parseFloat(cond.winding_temp   && cond.winding_temp.value)   || 0
            var tRef  = parseFloat(cond.reference_temp && cond.reference_temp.value) || 75
            // conductor_material: Copper → 235, Aluminum → 225
            var props = this.assetData && this.assetData.properties ? this.assetData.properties : {}
            var K = (props.conductor_material === 'Aluminum' || props.conductor_material === 'AL') ? 225 : 235

            for (var i = 0; i < rows.length; i++) {
                var row = rows[i]
                var rMeas = parseFloat(row.r_meas && row.r_meas.value)
                if (!isNaN(rMeas) && tMeas !== 0) {
                    var rCorr = rMeas * (K + tRef) / (K + tMeas)
                    row.r_corr.value = String(Math.round(rCorr * 1000000) / 1000000)
                }
                // dev_r_ref = 100*(r_corr - r_ref) / r_ref
                var rCorr2 = parseFloat(row.r_corr && row.r_corr.value)
                var rRef   = parseFloat(row.r_ref  && row.r_ref.value)
                if (!isNaN(rCorr2) && !isNaN(rRef) && rRef !== 0) {
                    row.dev_r_ref.value = String(Math.round(100 * (rCorr2 - rRef) / rRef * 10000) / 10000)
                }
            }
            // dev_phase per group of 3: 100*(max_r_corr - min_r_corr) / min_r_corr
            for (var g = 0; g < rows.length; g += 3) {
                var group = rows.slice(g, g + 3)
                var rCorrVals = group.map(function(r) { return parseFloat(r.r_corr && r.r_corr.value) }).filter(function(v) { return !isNaN(v) })
                if (rCorrVals.length > 0) {
                    var maxV = Math.max.apply(null, rCorrVals)
                    var minV = Math.min.apply(null, rCorrVals)
                    var devPhase = minV !== 0 ? 100 * (maxV - minV) / minV : 0
                    rows[g].dev_phase.value = String(Math.round(devPhase * 10000) / 10000)
                }
            }
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
                // dev_phase rowspan=3 → lấy từ row đầu nhóm
                var groupFirstRow = rows[Math.floor(i / 3) * 3]
                if (groupFirstRow && groupFirstRow.dev_phase && groupFirstRow.dev_phase.measurement_id) {
                    measurementMap[groupFirstRow.dev_phase.measurement_id] = groupFirstRow.dev_phase.value
                }
                if (row.dev_r_ref && row.dev_r_ref.measurement_id !== undefined) {
                    var _abs_dev_r_ref = parseFloat(measurementMap[row.dev_r_ref.measurement_id])
                    if (!isNaN(_abs_dev_r_ref)) measurementMap[row.dev_r_ref.measurement_id] = Math.abs(_abs_dev_r_ref)
                }
                if (row.dev_phase && row.dev_phase.measurement_id !== undefined) {
                    var _abs_dev_phase = parseFloat(measurementMap[row.dev_phase.measurement_id])
                    if (!isNaN(_abs_dev_phase)) measurementMap[row.dev_phase.measurement_id] = Math.abs(_abs_dev_phase)
                }
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
.w-100px {
    width: 100px;
}

.Good {
    background: #00CC00;
}

.Fair {
    background: #FFFF00;
}

.Poor {
    background: #FFC000;
}

.Bad {
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