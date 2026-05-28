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
                    <th>I knee (A)</th>
                    <th>V knee (V)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.name.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.i_knee.value"
                            @blur="validateIKnee(item, index)">
                        </el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.v_knee.value"></el-input>
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
        <el-dialog title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog" width="860px">
        </el-dialog>
    </div>
</template>

<script>
/* eslint-disable */
import currentTransformerTestMap from '@/config/test-definitions/CurrentTransformer'
import currentTransformerAssessmentMap from '@/config/testing-assessment/CurrentTransformer'
import * as common from '../../Common/index'
import GroupNode from '../../Common/GroupNode.vue'
import { changeTestStandard } from '../../Common'

export default {
    name: "CTExcitation",
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
        rowData()      { return common.buildEmptyTestRow(currentTransformerTestMap['CTExcitation'].columns) },
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
                i_knee: {
                    mrid: "",
                    value: "",
                    unit: "A",
                    type: "analog"
                },
                v_knee: {
                    mrid: "",
                    value: "",
                    unit: "V",
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
                i_knee: {
                    mrid: "",
                    value: "",
                    unit: "A",
                    type: "analog"
                },
                v_knee: {
                    mrid: "",
                    value: "",
                    unit: "V",
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
            await this.calcAssessment()
            this.$message.success('Calculating successfully')
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

                const passedResults = []
                let hasNull = false
                let defaultResult = null  // lấy từ root is_default

                for (const root of assessmentStandard.tree) {

                    // root default → không evaluate, chỉ giữ làm fallback
                    if (root.is_default) {
                        defaultResult = root.result
                        continue
                    }

                    const pass = this.evaluateGroup(root, measurementMap)

                    if (pass === null) {
                        hasNull = true
                    } else if (pass === true) {
                        passedResults.push(root.result)
                    }
                }

                // kết luận
                if (hasNull) {
                    row.assessment.value = ''
                } else if (passedResults.includes('Fail')) {
                    row.assessment.value = 'Fail'
                } else if (passedResults.includes('Pass')) {
                    row.assessment.value = 'Pass'
                } else {
                    row.assessment.value = (defaultResult !== null && defaultResult !== undefined) ? defaultResult : ''  // dùng fallback nếu có
                }
            }
        },

        evaluateGroup(group, measurementMap) {

            // ===== vòng 1: check đủ data trước =====
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

            // ===== vòng 2: đủ data, mới so sánh =====
            const results = []

            for (const condition of (group.conditions || [])) {
                const value = measurementMap[condition.measurement_id]
                const pass = common.compare(value, condition.operator, condition.threshold)
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
                    element.i_knee.value = '',
                    element.v_knee.value = '',
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
        },
        validateIKnee(item, index) {
            const iKneeValue = parseFloat(item.i_knee.value)

            // Check if value is empty
            if (!item.i_knee.value || item.i_knee.value.trim() === '') {
                return
            }

            // Check if value is a valid number
            if (isNaN(iKneeValue)) {
                this.$message.error(`Row ${index + 1}: I knee must be a valid number`)
                item.i_knee.value = ''
                return
            }

            // Check if value is positive
            if (iKneeValue <= 0) {
                this.$message.error(`Row ${index + 1}: I knee must be a positive number`)
                item.i_knee.value = ''
                return
            }

            // Get Isn value for this row from assetData
            const isnValue = this.getIsnForRow(item.name.value)

            if (isnValue && !isNaN(parseFloat(isnValue))) {
                const isn = parseFloat(isnValue)

                // Check if I knee is greater than Isn
                if (iKneeValue > isn) {
                    this.$message.error(`Row ${index + 1}: I knee (${iKneeValue} A) cannot be greater than Isn (${isn} A)`)
                    item.i_knee.value = ''
                    return
                }
            }
        },
        getIsnForRow(rowName) {
            // Try to get Isn from Entity (CtTapInfo)
            if (this.assetData && this.assetData.CtTapInfo && this.assetData.currentFlow) {
                const tap = this.assetData.CtTapInfo.find(t => t.tap_name === rowName)
                if (tap && tap.isn) {
                    const isnObj = this.assetData.currentFlow.find(cf => cf.mrid === tap.isn)
                    return isnObj ? isnObj.value : null
                }
            }

            // Try to get Isn from DTO (ctConfiguration.dataCT)
            if (this.assetData && this.assetData.ctConfiguration && this.assetData.ctConfiguration.dataCT) {
                for (const core of this.assetData.ctConfiguration.dataCT) {
                    // Check Full tap
                    if (core.fullTap && core.fullTap.table && core.fullTap.table.name === rowName) {
                        return core.fullTap.table.isn.value
                    }

                    // Check Main taps
                    if (core.mainTap && core.mainTap.data) {
                        const mainTap = core.mainTap.data.find(t => t.table && t.table.name === rowName)
                        if (mainTap) {
                            return mainTap.table.isn.value
                        }
                    }

                    // Check Inter taps
                    if (core.interTap && core.interTap.data) {
                        const interTap = core.interTap.data.find(t => t.table && t.table.name === rowName)
                        if (interTap) {
                            return interTap.table.isn.value
                        }
                    }
                }
            }

            return null
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