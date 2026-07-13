<template>
    <div id="energy-efficiency" class="test-ui">
        <!-- Cấu hình -->
        <div class="test-toolbar">
            <div class="test-toolbar-group">
                <el-button size="mini" type="primary" @click="calculator"> <i class="fas fa-circle-play"></i> Assess results </el-button>
                <el-button size="mini" @click="clear"> <i class="fas fa-xmark"></i> Clear all </el-button>
            </div>
            <div class="test-toolbar-group">
                <el-button size="mini" @click="openConditionIndicatorDialog = true"> <i class="fa-solid fa-hammer"></i> Condition indicator settings </el-button>
            </div>
        </div>
        <!-- Tính toán đánh giá -->


        <div class="table-scroll">
        <table class="table-strip-input-data test-table">
            <thead>
                <tr>
                    <th>H<sub>2</sub></th>
                    <th>CH<sub>4</sub></th>
                    <th>C<sub>2</sub>H<sub>2</sub></th>
                    <th>C<sub>2</sub>H<sub>4</sub></th>
                    <th>C<sub>2</sub>H<sub>6</sub></th>
                    <th>CO</th>
                    <th>CO<sub>2</sub></th>
                    <th>TDCG</th>
                    <th>Status</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                    <td>
                        <el-input type="text" number="positive" size="mini" v-model="item.h2.value">
                            <template slot="append">ppm</template>
                        </el-input>
                    </td>
                    <td>
                        <el-input type="text" number="positive" size="mini" v-model="item.ch4.value">
                            <template slot="append">ppm</template>
                        </el-input>
                    </td>
                    <td>
                        <el-input type="text" number="positive" size="mini" v-model="item.c2h2.value">
                            <template slot="append">ppm</template>
                        </el-input>
                    </td>
                    <td>
                        <el-input type="text" number="positive" size="mini" v-model="item.c2h4.value">
                            <template slot="append">ppm</template>
                        </el-input>
                    </td>
                    <td>
                        <el-input type="text" number="positive" size="mini" v-model="item.c2h6.value">
                            <template slot="append">ppm</template>
                        </el-input>
                    </td>
                    <td>
                        <el-input type="text" number="positive" size="mini" v-model="item.co.value">
                            <template slot="append">ppm</template>
                        </el-input>
                    </td>
                    <td>
                        <el-input type="text" number="positive" size="mini" v-model="item.co2.value">
                            <template slot="append">ppm</template>
                        </el-input>
                    </td>
                    <td>
                        <el-input type="text" number="positive" size="mini" v-model="item.tdcg.value">
                            <template slot="append">ppm</template>
                        </el-input>
                    </td>
                    <td>
                        <el-select style="width: 120px" size="mini" v-model="item.status.value">
                            <el-option label="Condition 1" value="Condition 1"></el-option>
                            <el-option label="Condition 2" value="Condition 2"></el-option>
                            <el-option label="Condition 3" value="Condition 3"></el-option>
                            <el-option label="Condition 4" value="Condition 4"></el-option>
                        </el-select>
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

        <!-- Condition indicator settings -->
        <el-dialog append-to-body title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog"
            width="1120px">
            <!-- <div class="table-scroll">
        <table class="table-strip-input-data test-table mgb-10">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>H2</th>
                        <th>C2H2</th>
                        <th>C2H4</th>
                        <th>C2H6</th>
                        <th>CH4</th>
                        <th>CO</th>
                        <th>TDCG</th>
                        <th>Condition Indicator</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Condition 1</td>
                        <td>≤ {{ conditionIndicatorSetting.good.h2[0].value }}</td>
                        <td>≤ {{ conditionIndicatorSetting.good.c2h2[0].value }}</td>
                        <td>≤ {{ conditionIndicatorSetting.good.c2h4[0].value }}</td>
                        <td>≤ {{ conditionIndicatorSetting.good.c2h6[0].value }}</td>
                        <td>≤ {{ conditionIndicatorSetting.good.ch4[0].value }}</td>
                        <td>≤ {{ conditionIndicatorSetting.good.co[0].value }}</td>
                        <td>≤ {{ conditionIndicatorSetting.good.tdcg[0].value }}</td>
                        <td class="good">Good</td>
                        <td>{{ conditionIndicatorSetting.good.score.value }}</td>
                    </tr>
                    <tr>
                        <td>Condition 2</td>
                        <td>{{ `${conditionIndicatorSetting.fair.h2[0].value} - ${conditionIndicatorSetting.fair.h2[1].value}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.fair.c2h2[0].value} - ${conditionIndicatorSetting.fair.c2h2[1].value}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.fair.c2h4[0].value} - ${conditionIndicatorSetting.fair.c2h4[1].value}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.fair.c2h6[0].value} - ${conditionIndicatorSetting.fair.c2h6[1].value}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.fair.ch4[0].value} - ${conditionIndicatorSetting.fair.ch4[1].value}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.fair.co[0].value} - ${conditionIndicatorSetting.fair.co[1].value}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.fair.tdcg[0].value} - ${conditionIndicatorSetting.fair.tdcg[1].value}` }}</td>
                        <td class="fair">Fair</td>
                        <td>{{ conditionIndicatorSetting.fair.score.value }}</td>
                    </tr>
                    <tr>
                        <td>Condition 3</td>
                        <td>{{ `${conditionIndicatorSetting.poor.h2[0].value} - ${conditionIndicatorSetting.poor.h2[1].value}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.poor.c2h2[0].value} - ${conditionIndicatorSetting.poor.c2h2[1].value}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.poor.c2h4[0].value} - ${conditionIndicatorSetting.poor.c2h4[1].value}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.poor.c2h6[0].value} - ${conditionIndicatorSetting.poor.c2h6[1].value}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.poor.ch4[0].value} - ${conditionIndicatorSetting.poor.ch4[1].value}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.poor.co[0].value} - ${conditionIndicatorSetting.poor.co[1].value}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.poor.tdcg[0].value} - ${conditionIndicatorSetting.poor.tdcg[1].value}` }}</td>
                        <td class="poor">Poor</td>
                        <td>{{ conditionIndicatorSetting.poor.score.value }}</td>
                    </tr>
                    <tr>
                        <td>Condition 4</td>
                        <td>> {{ conditionIndicatorSetting.bad.h2[1].value }}</td>
                        <td>> {{ conditionIndicatorSetting.bad.c2h2[1].value }}</td>
                        <td>> {{ conditionIndicatorSetting.bad.c2h4[1].value }}</td>
                        <td>> {{ conditionIndicatorSetting.bad.c2h6[1].value }}</td>
                        <td>> {{ conditionIndicatorSetting.bad.ch4[1].value }}</td>
                        <td>> {{ conditionIndicatorSetting.bad.co[1].value }}</td>
                        <td>> {{ conditionIndicatorSetting.bad.tdcg[1].value }}</td>
                        <td class="bad">Bad</td>
                        <td>{{ conditionIndicatorSetting.bad.score.value }}</td>
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
    name: "Dga",
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
        rowData()      { return common.buildEmptyTestRow(transformerTestMap['Dga'].columns) },
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

<style>
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
.result-col { flex-shrink: 0; width: 100px; text-align: center; border-left: 1px solid #ebeef5; padding: 0 12px; align-self: stretch; display: flex; align-items: center; justify-content: center; }
.tree-row-default { background: #fafafa; }
.default-label { font-style: italic; color: #909399; font-size: 13px; }
.pass { color: #67C23A; font-weight: bold; }
.fail { color: #F56C6C; font-weight: bold; }
</style>
<style lang="scss" scoped>
@import "~@/views/JobView/Common/testUi.scss";
</style>
