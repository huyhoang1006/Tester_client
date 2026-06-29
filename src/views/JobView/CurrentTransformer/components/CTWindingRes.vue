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
                    <th>Name</th>
                    <th>R meas (Ω)</th>
                    <th>R ref (Ω)</th>
                    <th>R corr (Ω)</th>
                    <th>R dev (%)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                    <td>
                        <el-input size="mini" type="text" v-model="item.name.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.r_meas.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.r_ref.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.r_corr.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.r_dev.value"></el-input>
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
        <el-dialog :modal=true title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog"
            width="860px" append-to-body>
        </el-dialog>
    </div>
</template>

<script>
/* eslint-disable */
import currentTransformerTestMap from '@/config/test-definitions/CurrentTransformer'
import * as common from '../../Common/index'
import GroupNode from '../../Common/GroupNode.vue'
import { changeTestStandard } from '../../Common'

export default {
    name: "CTWindingResistance",
    components: {
        GroupNode
    },
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            option: null
        }
    },
    mounted() {
        // Initialize table if needed
        this.$nextTick(() => {
            this.initializeTable()
        })
    },
    props: {
        data: {
            type: Object,
            require: true
        },
        asset: {
            type: Object,
            require: true
        },
        testAssessment: { type: Object, require: true },
        testCondition:  { type: Object, default: function() { return { condition: {} } } }
    },
    computed: {
        testData() {
            return this.data
        },
        assetData() {
            return this.asset
        },
        testConditionData() {
            return this.testCondition
        },
        rowData()      { return common.buildEmptyTestRow(currentTransformerTestMap['CTWindingRes'].columns) },
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
        'testData.table': {
            immediate: true,
            handler: function (newVal) {
                // Convert array to object if needed (for backward compatibility)
                if (newVal && Array.isArray(newVal)) {
                    const tableObject = { table1: newVal }
                    this.$set(this.testData, 'table', tableObject)
                    return
                }

                // Initialize table if empty
                if (!newVal || (typeof newVal === 'object' && Object.keys(newVal).length === 0)) {
                    this.$nextTick(() => {
                        this.initializeTable()
                    })
                }
            }
        },
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
        initializeTable() {
            if (!this.testData.table) {
                this.$set(this.testData, 'table', {})
            }

            if (Object.keys(this.testData.table).length === 0) {
                this.$set(this.testData.table, 'table1', [])
            }

            // Ensure table1 exists
            if (!this.testData.table.table1) {
                this.$set(this.testData.table, 'table1', [])
            }
        },
        add() {
            if (!this.testData.table.table1) {
                this.initializeTable()
            }
            this.testData.table.table1.push({
                mrid: "",
                name: {
                    mrid: "",
                    value: "",
                    unit: "",
                    type: "string"
                },
                r_meas: {
                    mrid: "",
                    value: "",
                    unit: "Ω",
                    type: "analog"
                },
                r_ref: {
                    mrid: "",
                    value: "",
                    unit: "Ω",
                    type: "analog"
                },
                r_corr: {
                    mrid: "",
                    value: "",
                    unit: "Ω",
                    type: "analog"
                },
                r_dev: {
                    mrid: "",
                    value: "",
                    unit: "%",
                    type: "analog"
                },
                assessment: {
                    mrid: "",
                    value: "",
                    unit: "",
                    type: "discrete"
                },
                condition_indicator: {
                    mrid: "",
                    value: "",
                    unit: "",
                    type: "discrete"
                }
            })
        },
        removeAll() {
            this.$confirm('This will delete the file. Continue?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(() => {
                this.testData.table.table1 = []
            }).catch(() => { })
        },
        deleteTest(index) {
            this.testData.table.table1.splice(index, 1)
        },
        addTest(index) {
            const data = {
                mrid: "",
                name: {
                    mrid: "",
                    value: "",
                    unit: "",
                    type: "string"
                },
                r_meas: {
                    mrid: "",
                    value: "",
                    unit: "Ω",
                    type: "analog"
                },
                r_ref: {
                    mrid: "",
                    value: "",
                    unit: "Ω",
                    type: "analog"
                },
                r_corr: {
                    mrid: "",
                    value: "",
                    unit: "Ω",
                    type: "analog"
                },
                r_dev: {
                    mrid: "",
                    value: "",
                    unit: "%",
                    type: "analog"
                },
                assessment: {
                    mrid: "",
                    value: "",
                    unit: "",
                    type: "discrete"
                },
                condition_indicator: {
                    mrid: "",
                    value: "",
                    unit: "",
                    type: "discrete"
                }
            }
            this.testData.table.table1.splice(index + 1, 0, data)
        },
        async calculator() {
            await this.calcRcorr()
            await this.calcRdev()
            await this.calcAssessment()
            this.$message.success('Calculating successfully')
        },

        async calcRcorr() {
            if (!this.testData.table.table1) {
                return
            }
            this.testData.table.table1.forEach((item) => {
                // Only calculate r_corr if it's empty (don't overwrite user input)
                if (!isNaN(parseFloat(item.r_meas.value)) && (!item.r_corr.value || item.r_corr.value === '')) {
                    // Check if testCondition and condition exist
                    if (this.testConditionData && this.testConditionData.condition &&
                        this.testConditionData.condition.winding_temp &&
                        this.testConditionData.condition.reference_temp &&
                        !isNaN(parseFloat(this.testConditionData.condition.winding_temp.value)) &&
                        !isNaN(parseFloat(this.testConditionData.condition.reference_temp.value))) {
                        item.r_corr.value = parseFloat(parseFloat(item.r_meas.value) * (235 + parseFloat(this.testConditionData.condition.reference_temp.value)) / (235 + parseFloat(this.testConditionData.condition.winding_temp.value))).toFixed(4)
                    }
                    else {
                        item.r_corr.value = item.r_meas.value
                    }
                }
            })
        },
        async calcRdev() {
            if (!this.testData.table.table1) {
                return
            }
            this.testData.table.table1.forEach((item) => {
                // Use r_corr (corrected resistance) instead of r_meas for deviation calculation
                if (!isNaN(parseFloat(item.r_corr.value)) && !isNaN(parseFloat(item.r_ref.value)) && item.r_ref.value != 0) {
                    item.r_dev.value = (100 * (parseFloat(item.r_corr.value) - parseFloat(item.r_ref.value)) / parseFloat(item.r_ref.value)).toFixed(4)
                }
            })
        },

        async calcAssessment() {
            const assessmentStandard = this.filteredAssessmentData.find(x => x.code === this.option)
            if (!assessmentStandard) {
                this.$message.error('Please select an assessment standard')
                return
            }

            for (const row of this.testData.table.table1) {
                const measurementMap = {}
                Object.keys(row).forEach(key => {
                    const item = row[key]
                    if (!item || typeof item !== 'object') return
                    if (item.measurement_id) {
                        measurementMap[item.measurement_id] = item.value
                    }
                })

                // ===== collect =====
                const passedResults = []
                let hasNull = false

                for (const root of assessmentStandard.tree) {
                    const pass = this.evaluateGroup(root, measurementMap)

                    if (pass === null) {
                        hasNull = true
                    } else if (pass === true) {
                        passedResults.push(root.result)  // chỉ push khi root thực sự pass
                    }
                    // pass === false → bỏ qua hoàn toàn
                }

                // ===== kết luận =====
                if (hasNull) {
                    row.assessment.value = ''
                } else if (passedResults.includes('Fail')) {
                    row.assessment.value = 'Fail'
                } else if (passedResults.includes('Pass')) {
                    row.assessment.value = 'Pass'
                } else {
                    row.assessment.value = ''
                }
            }
        },

        evaluateGroup(group, measurementMap) {

            // ===== check đủ data trước, nếu thiếu 1 cái → null ngay =====
            for (const condition of (group.conditions || [])) {
                const value = measurementMap[condition.measurement_id]

                if (value === null || value === undefined || value === '') {
                    return null
                }

                if (condition.threshold === null || condition.threshold === undefined || condition.threshold === '') {
                    return null
                }
            }

            for (const child of (group.children || [])) {
                const childPass = this.evaluateGroup(child, measurementMap)
                if (childPass === null) return null  // child thiếu data → null ngay
            }

            // ===== đủ data rồi, mới so sánh =====
            const results = []

            for (const condition of (group.conditions || [])) {
                const value = measurementMap[condition.measurement_id]
                const pass = common.compare(Math.abs(value), condition.operator, condition.threshold)
                results.push(pass)
            }

            for (const child of (group.children || [])) {
                const childPass = this.evaluateGroup(child, measurementMap)
                results.push(childPass)
            }

            if (results.length === 0) return null

            const logic = (group.logic || 'AND').toUpperCase()
            if (logic === 'OR') return results.some(x => x)
            return results.every(x => x)
        },

        clear() {
            if (!this.testData.table.table1) {
                this.initializeTable()
                return
            }
            this.testData.table.table1.forEach((element) => {
                element.name.value = "",
                    element.r_meas.value = '',
                    element.r_ref.value = '',
                    element.r_corr.value = '',
                    element.r_dev.value = '',
                    element.assessment.value = '',
                    element.condition_indicator.value = ''
            })
        },
        nameColor(data) {
            if (data === this.$constant.GOOD) {
                return 'Good'
            }
            else if (data === this.$constant.FAIR) {
                return 'Fair'
            }
            else if (data === this.$constant.POOR) {
                return 'Poor'
            }
            else if (data === this.$constant.BAD) {
                return 'Bad'
            }
            else {
                return;
            }
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
.result-col { flex-shrink: 0; width: 100px; text-align: center; border-left: 1px solid #ebeef5; padding: 0 12px; align-self: stretch; display: flex; align-items: center; justify-content: center; }
.tree-row-default { background: #fafafa; }
.default-label { font-style: italic; color: #909399; font-size: 13px; }
.pass { color: #67C23A; font-weight: bold; }
.fail { color: #F56C6C; font-weight: bold; }
</style>