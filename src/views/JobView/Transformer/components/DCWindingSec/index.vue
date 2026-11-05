<template>
    <div id="dc-winding-resistance-sec" class="test-ui">
        <!-- Cấu hình -->
        <div class="test-toolbar">
            <div class="test-toolbar-group">
                <el-button size="mini" type="primary" @click="calculator"> <i class="fas fa-circle-play"></i> Assess results </el-button>
                <el-button size="mini" type="success" @click="calculateConditionIndicator">
                    <i class="fa-solid fa-calculator"></i> Calculate CI
                </el-button>
                <el-button size="mini" @click="clear"> <i class="fas fa-xmark"></i> Clear all </el-button>
            </div>
            <div class="test-toolbar-group">
                <el-button size="mini" @click="openAssessmentDialog = true"> <i class="fa-solid fa-screwdriver-wrench"></i> Assessment settings </el-button>
                <el-button size="mini" @click="openConditionIndicatorDialog = true"> <i class="fa-solid fa-hammer"></i> Condition indicator settings </el-button>
                <el-button size="mini" :type="compareOpen ? 'primary' : ''" @click="$emit('toggle-compare')">
                    <i class="fa-solid fa-scale-balanced"></i> Compare with previous results
                </el-button>
            </div>
        </div>

        <div class="table-scroll">
        <table class="table-strip-input-data test-table">
            <thead>
                <tr>
                    <th class="tap-col" v-if="assetData.tap_changers.winding === $constant.SEC">Tap</th>
                    <th class="phase-col">Name</th>
                    <th>R meas</th>
                    <th>R ref</th>
                    <th>
                        <el-tooltip placement="top">
                            <div slot="content" style="white-space: pre-line; max-width: 360px; line-height: 1.5;">{{ rcorrHint }}</div>
                            <span class="th-hint">R corr <i class="fa-regular fa-circle-question"></i></span>
                        </el-tooltip>
                    </th>
                    <th>Dev with R ref (%)</th>
                    <!-- Máy 1 pha không có Dev within phases -->
                    <th v-if="phaseCount > 1">Dev within phases (%)</th>
                    <!-- <th>Mean value</th> -->
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                    <td class="tap-col" v-if="assetData.tap_changers.winding === $constant.SEC">{{ item.tap.value }}</td>
                    <td class="phase-col">
                        <div class="col-phase">
                            <div class="phase">
                                <!-- Máy 1 pha: chỉ cho chọn đúng pha khai báo trong asset -->
                                <el-select size="mini" v-model="item.name.value" placeholder="Phase">
                                    <el-option v-for="phase in phaseOptions" :key="phase" :label="phase" :value="phase"></el-option>
                                </el-select>
                            </div>
                            <div class="rectangle"
                                :class="{ red: item.name.value == 'A', yellow: item.name.value == 'B', blue: item.name.value == 'C' }">
                            </div>
                        </div>
                    </td>
                    <td>
                        <el-input :measurement="item.r_meas" size="mini" type="text" number="positive" v-model="item.r_meas.value" @input="computeFields"><template
                                slot="append">Ω</template></el-input>
                    </td>
                    <td>
                        <el-input :measurement="item.r_ref" size="mini" type="text" number="positive" v-model="item.r_ref.value" @input="computeFields"><template
                                slot="append">Ω</template></el-input>
                    </td>
                    <td>
                        <!-- R corr do phần mềm tính, user không sửa được -->
                        <el-input :measurement="item.r_corr" class="rcorr-readonly" size="mini" type="text" disabled
                            v-model="item.r_corr.value"><template
                                slot="append">Ω</template></el-input>
                    </td>
                    <td>
                        <el-input :measurement="item.dev_r_ref" size="mini" type="text" v-model="item.dev_r_ref.value" readonly></el-input>
                    </td>
                    <template v-if="phaseCount > 1 && index % phaseCount == 0 && assetData.tap_changers.winding === $constant.SEC">
                        <td :rowspan="phaseCount">
                            <el-input :measurement="item.dev_phase" size="mini" type="text" v-model="item.dev_phase.value" readonly></el-input>
                        </td>

                        <!-- <td rowspan="3">
                                <el-input size="mini" type="text" v-model="item.mean_value"><template slot="append">Ω</template></el-input>
</td> -->
                    </template>
                    <template v-else-if="phaseCount > 1 && index % phaseCount == 0 && assetData.tap_changers.winding !== $constant.SEC">
                        <td :rowspan="phaseCount">
                            <el-input :measurement="item.dev_phase" size="mini" type="text" v-model="item.dev_phase.value" readonly></el-input>
                        </td>
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
                            size="mini" disabled v-model="item.condition_indicator.value">
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
                            <div class="result-col"><assessment-result-label :result="node.result" /></div>
                        </div>
                        <div v-else :key="'default-' + i" class="tree-row tree-row-default">
                            <div class="limit-col default-label">All other cases</div>
                            <div class="result-col"><assessment-result-label :result="node.result" /></div>
                        </div>
                    </template>
                </div>
            </div>
        </el-dialog>

        <!-- Condition indicator settings -->
        <el-dialog append-to-body title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog"
            width="870px">
            <TransformerConditionIndicatorSettings :test-code="$options.name" />
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
                            <el-input :measurement="conditionIndicatorSetting.good.error_between_phase[0]" size="mini" class="size"
                                v-model="conditionIndicatorSetting.good.error_between_phase[0].value"></el-input>
                        </td>
                        <td class="Good">Good</td>
                        <td><el-input :measurement="conditionIndicatorSetting.good.score" size="mini" v-model="conditionIndicatorSetting.good.score.value"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <el-input :measurement="conditionIndicatorSetting.fair.error_between_phase[0]" size="mini" class="size"
                                v-model="conditionIndicatorSetting.fair.error_between_phase[0].value"></el-input> &lt; %
                            Error
                            between phase or Error with R ref % ≤
                            <el-input :measurement="conditionIndicatorSetting.fair.error_between_phase[1]" size="mini" class="size"
                                v-model="conditionIndicatorSetting.fair.error_between_phase[1].value"></el-input>
                        </td>
                        <td class="Fair">Fair</td>
                        <td><el-input :measurement="conditionIndicatorSetting.fair.score" size="mini" v-model="conditionIndicatorSetting.fair.score.value"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <el-input :measurement="conditionIndicatorSetting.poor.error_between_phase[0]" size="mini" class="size"
                                v-model="conditionIndicatorSetting.poor.error_between_phase[0].value"></el-input> &lt; %
                            Error
                            between phase or Error with R ref % ≤
                            <el-input :measurement="conditionIndicatorSetting.poor.error_between_phase[1]" size="mini" class="size"
                                v-model="conditionIndicatorSetting.poor.error_between_phase[1].value"></el-input>
                        </td>
                        <td class="Poor">Poor</td>
                        <td><el-input :measurement="conditionIndicatorSetting.poor.score" size="mini" v-model="conditionIndicatorSetting.poor.score.value"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            % Error between phase or Error with R ref % >
                            <el-input :measurement="conditionIndicatorSetting.bad.error_between_phase[1]" size="mini" class="size"
                                v-model="conditionIndicatorSetting.bad.error_between_phase[1].value"></el-input>
                        </td>
                        <td class="Bad">Bad</td>
                        <td><el-input :measurement="conditionIndicatorSetting.bad.score" size="mini" v-model="conditionIndicatorSetting.bad.score.value"></el-input></td>
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
import conditionIndicatorMixin from '../MixinCommon/MixinConditionIndicator'
import dcWindingPhaseMixin from '../MixinCommon/MixinDcWindingPhase'
import {
    RCORR_HINT, conductorMaterialOf, conductorConstant, toNumberOrNull, computeDcWindingRows
} from '@/utils/dcWindingCorrection'

export default {
    mixins: [conditionIndicatorMixin, dcWindingPhaseMixin],
    name: "DCWindingSec",
    components: { GroupNode },
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            option: null,
            rcorrHint: RCORR_HINT
        }
    },
    props: {
        data:           { type: Object, require: true },
        asset:          { type: Object, require: true },
        testAssessment: { type: Object, require: true },
        testCondition:  { type: Object, default: function() { return { condition: {} } } },
        compareOpen:    { type: Boolean, default: false }
    },
    computed: {
        testData()     { return this.data },
        assetData()    { return this.asset },
        conditions()   { return (this.testCondition && this.testCondition.condition) ? this.testCondition.condition : {} },
        rowData()      { return common.buildEmptyTestRow(transformerTestMap['DCWindingSec'].columns) },
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
        testStandardData() { return this.testAssessment ? this.testAssessment.testStandard : null },
        windingTemp()   { return toNumberOrNull(this.conditions.winding_temp && this.conditions.winding_temp.value) },
        referenceTemp() { return toNumberOrNull(this.conditions.reference_temp && this.conditions.reference_temp.value) },
        // Hằng số K theo Conductor material của cuộn dây (Others → Winding): Copper 235, Aluminum 225
        conductorK()    { return conductorConstant(conductorMaterialOf(this.assetData, 'DCWindingSec')) },
        rcorrAvailable() { return this.windingTemp !== null && this.referenceTemp !== null }
    },
    watch: {
        // Đổi nhiệt độ hoặc vật liệu dây dẫn → tính lại R corr và các Dev
        windingTemp()   { this.computeFields() },
        referenceTemp() { this.computeFields() },
        conductorK()    { this.computeFields() },
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
    mounted() {
        this.$nextTick(this.computeFields)
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
            var rows = this.testData && this.testData.table ? this.testData.table.table1 : null
            if (!rows || rows.length === 0) return
            // Thiếu Winding temp hoặc Ref temp → không có R corr, Dev cũng để trống (đặc tả 5.2.3.2)
            computeDcWindingRows(rows, { tMeas: this.windingTemp, tRef: this.referenceTemp, K: this.conductorK, phaseCount: this.phaseCount })
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
                // dev_phase gộp theo nhóm pha (rowspan) → lấy từ row đầu nhóm; máy 1 pha không có
                var groupFirstRow = this.phaseCount > 1 ? rows[Math.floor(i / this.phaseCount) * this.phaseCount] : null
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
            common.clearEditableTestValues(this.testData && this.testData.table)
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
.th-hint { cursor: help; white-space: nowrap; }
.th-hint i { color: #909399; font-size: 11px; margin-left: 2px; }
/* R corr: làm mờ, chỉ đọc */
.rcorr-readonly ::v-deep(.el-input__inner) { background: #f5f7fa; color: #909399; cursor: not-allowed; }
.size {
    width: 15%;
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
.result-col { flex-shrink: 0; width: 168px; text-align: center; border-left: 1px solid #ebeef5; padding: 0 12px; align-self: stretch; display: flex; align-items: center; justify-content: center; }
.tree-row-default { background: #fafafa; }
.default-label { font-style: italic; color: #909399; font-size: 13px; }
.pass { color: #67C23A; font-weight: bold; }
.fail { color: #F56C6C; font-weight: bold; }
</style>
