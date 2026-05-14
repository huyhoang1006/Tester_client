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
                    <th>Ipr (A)</th>
                    <th>Isr (A)</th>
                    <th>Ratio meas</th>
                    <th>Ratio dev</th>
                    <th>Polarity</th>
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
                        <el-input size="mini" type="text" v-model="item.ipr.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.isr.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.ratio_meas.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.ratio_dev.value"></el-input>
                    </td>
                    <td>
                        <el-select size="mini" v-model="item.polarity.value">
                            <el-option label="OK" value="OK"></el-option>
                            <el-option label="Incorrect" value="Incorrect"></el-option>
                        </el-select>
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
        <el-dialog :modal=true title="Assessment settings" :visible.sync="openAssessmentDialog" width="860px"
            append-to-body>
            <el-form style="width: 75%;" size="small" label-position="left" label-width="140px">
                <el-form-item label="Option">
                    <el-select size="mini" placeholder="please select" v-model="option">
                        <el-option v-for="option in assessmentList" :key="option" :label="option"
                            :value="option"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div v-for="element in filteredAssessmentData" :key="element.mrid" class="assessment-container">

                <!-- HEADER -->
                <div class="assessment-header">
                    <div class="limit-col">Limit</div>
                    <div class="result-col">Assessment</div>
                </div>

                <!-- BODY -->
                <div class="assessment-body">

                    <!-- LIMIT -->
                    <div class="limit-col">
                        <GroupNode v-for="(node, i) in element.tree || []" :key="i" :node="node" mode="limit" />
                    </div>

                    <!-- RESULT -->
                    <div class="result-col">
                        <GroupNode v-for="(node, i) in element.tree || []" :key="'rs' + i" :node="node" mode="result" />
                    </div>

                </div>
            </div>
        </el-dialog>

        <!-- Condition indicator settings -->
        <el-dialog title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog" width="860px">
        </el-dialog>
    </div>
</template>

<script>
import CurrentTransformerTestMap from '@/config/test-definitions/CurrentTransformer'
import * as common from '../../Common/index'
import GroupNode from '../../Common/GroupNode.vue'
import { changeTestStandard } from '../../Common'

export default {
    name: "CTRatio",
    components: {
        GroupNode
    },
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            option: null,
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
        testAssessment: {
            type: Object,
            require: true
        },
        testStandard: {
            type: Object,
            require: true
        }
    },
    computed: {
        testData() {
            return this.data
        },
        assetData() {
            return this.asset
        },
        rowData() {
            return common.buildEmptyTestRow(CurrentTransformerTestMap['CTRatio'].columns)
        },
        assessmentData() {
            return this.testAssessment.assessment
        },
        assessmentList() {
            return this.testAssessment.assessment.map(x => x.type)
        },
        filteredAssessmentData() {
            if (!this.option) return [] // 👈 fix ở đây
            return (this.assessmentData || []).filter(e => e.type === this.option)
        },
        testStandardData() {
            return this.testAssessment.testStandard
        }
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
                const standard = this.filteredAssessmentData.find(x => x.type === newVal)
                if (standard) {
                    await changeTestStandard(standard.mrid, newVal, this.testStandardData)
                }
            }
        },
        'testStandardData': {
            immediate: true,
            handler: async function (newVal) {
                this.option = common.testStandardDataToOption(newVal)
            }
        },
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
            this.testData.table.table1.push(
                JSON.parse(JSON.stringify(this.rowData))
            )
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
            const data = JSON.parse(JSON.stringify(this.rowData))
            this.testData.table.table1.splice(index + 1, 0, data)
        },
        async calculator() {
            await this.calcRdev()
            await this.calcAsessment()
            this.$message.success('Calculating successfully')
        },

        async calcAsessment() {
            const assessmentStandard = this.filteredAssessmentData.find(x => x.type === this.option)
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

                // ===== collect tất cả root pass =====
                const passedResults = []

                for (const root of assessmentStandard.tree) {
                    const pass = this.evaluateGroup(root, measurementMap)
                    if (pass) {
                        passedResults.push(root.result)
                    }
                }

                // ===== kết luận =====
                // Ưu tiên: Fail > Pass > ''
                if (passedResults.includes('Fail')) {
                    row.assessment.value = 'Fail'
                } else if (passedResults.includes('Pass')) {
                    row.assessment.value = 'Pass'
                } else {
                    row.assessment.value = ''
                }
            }
        },

        evaluateGroup(group, measurementMap) {

            const results = []

            // ===== evaluate conditions =====

            for (const condition of (group.conditions || [])) {

                const value = measurementMap[
                    condition.measurement_id
                ]

                if (
                    value === null ||
                    value === undefined ||
                    value === ''
                ) {
                    return null
                }

                const pass = common.compare(
                    value,
                    condition.operator,
                    condition.threshold
                )

                results.push(pass)
            }

            // ===== evaluate children =====

            for (const child of (group.children || [])) {

                const childPass = this.evaluateGroup(
                    child,
                    measurementMap
                )

                // child chưa đủ data
                if (childPass === null) {
                    return null
                }

                results.push(childPass)
            }

            // ===== empty =====

            if (results.length === 0) {
                return false
            }

            // ===== logic =====

            const logic = (group.logic || 'AND')
                .toUpperCase()

            if (logic === 'OR') {

                return results.some(x => x)
            }

            return results.every(x => x)
        },

        clear() {
            if (!this.testData.table.table1) {
                this.initializeTable()
                return
            }
            this.testData.table.table1.forEach(row => {
                Object.keys(row).forEach(key => {
                    if (key === "mrid") return;
                    if (row[key] && typeof row[key] === "object" && "value" in row[key]) {
                        row[key].value = ""
                    }
                })
            })
        },
        async calcRdev() {
            if (!this.testData.table.table1) {
                return
            }
            this.testData.table.table1.forEach((element) => {
                if (!isNaN(parseFloat(element.ratio_meas.value)) && element.ratio_meas.value != 0) {
                    if (!isNaN(parseFloat(element.ipr.value)) && !isNaN(parseFloat(element.isr.value)) && element.isr.value != 0) {
                        element.ratio_dev.value = (100 * (parseFloat(element.ratio_meas.value) - (parseFloat(element.ipr.value) / parseFloat(element.isr.value))) / (parseFloat(element.ipr.value) / parseFloat(element.isr.value))).toFixed(4)
                    }
                }
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

.assessment-container {
    width: 75%;
    border: 1px solid #ddd;
    border-radius: 6px;
    margin-bottom: 16px;
    overflow: hidden;
}

.assessment-header {
    display: flex;
    background: #f5f7fa;
    font-weight: bold;
    padding: 8px;
}

.assessment-body {
    display: flex;
    padding: 10px;
}

.limit-col {
    flex: 2;
    padding-right: 10px;
    border-right: 1px solid #eee;
}

.result-col {
    flex: 1;
    padding-left: 10px;
}

.pass {
    color: #67C23A;
    font-weight: bold;
}

.fail {
    color: #F56C6C;
    font-weight: bold;
}
</style>
