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

        <table class="table-strip-input-data" style="width: 150% ; font-size: 12px;">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Measurement</th>
                    <th>Test mode</th>
                    <th>Test voltage (kV)</th>
                    <th>DF ref (%)</th>
                    <th>C ref (pF)</th>
                    <th>DF meas (%)</th>
                    <th>C meas (pF)</th>
                    <th>△C cal (%)</th>
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
                        <div style="display: flex;width: 100%;">
                            <el-input style="width: 80px;" size="mini" type="text"
                                v-model="item.measurement.value"></el-input>
                            <div
                                :class="{ colorTableRed: index % 3 == 0, colorTableYellow: index % 3 == 1, colorTableBlue: index % 3 == 2 }">
                            </div>
                        </div>
                    </td>
                    <td>
                        <el-select size="mini" v-model="item.test_mode.value">
                            <el-option label="GST" value="GST"></el-option>
                            <el-option label="GSTg-A" value="GSTg-A"></el-option>
                            <el-option label="GSTg-B" value="GSTg-B"></el-option>
                            <el-option label="GSTg-A+B" value="GSTg-A+B"></el-option>
                            <el-option label="UST-A" value="UST-A"></el-option>
                            <el-option label="UST-B" value="UST-B"></el-option>
                            <el-option label="UST-A+B" value="UST-A+B"></el-option>
                        </el-select>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.test_voltage.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.df_ref.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.c_ref.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.df_meas.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.c_meas.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.delta_c_percent.value"></el-input>
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
                    <template v-for="(node, i) in element.tree">

                        <!-- root bình thường -->
                        <div v-if="!node.is_default" :key="'node-' + i" class="tree-row">
                            <div class="limit-col">
                                <GroupNode :node="node" mode="limit" />
                            </div>
                            <div class="result-col">
                                <span v-if="node.result === 'Pass'" class="pass">✔ Pass</span>
                                <span v-else-if="node.result === 'Fail'" class="fail">✖ Fail</span>
                                <span v-else>—</span>
                            </div>
                        </div>

                        <!-- root default -->
                        <div v-else :key="'default-' + i" class="tree-row tree-row-default">
                            <div class="limit-col default-label">
                                All other cases
                            </div>
                            <div class="result-col">
                                <span v-if="node.result === 'Pass'" class="pass">✔ Pass</span>
                                <span v-else-if="node.result === 'Fail'" class="fail">✖ Fail</span>
                                <span v-else>—</span>
                            </div>
                        </div>

                    </template>
                </div>
            </div>
        </el-dialog>

        <!-- Condition indicator settings -->
        <el-dialog :modal=true title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog" width="860px"
            append-to-body>
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
    name: "CTDfcap",
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
            return common.buildEmptyTestRow(currentTransformerTestMap['InsulationResistance'].columns)
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
    mounted() {
        this.$nextTick(() => {
            this.initializeTable()
        })
    },
    watch: {
        'testData.table': {
            immediate: true,
            handler: function (newVal) {
                // Auto-convert old array structure to new object structure
                if (newVal && Array.isArray(newVal)) {
                    this.$set(this.testData, 'table', { table1: newVal })
                }
                // Initialize if empty
                if (!newVal || (typeof newVal === 'object' && !newVal.table1)) {
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
                console.log('test standard data', newVal)
                this.option = common.testStandardDataToOption(newVal)
            }
        }
    },
    methods: {
        initializeTable() {
            if (!this.testData.table || (typeof this.testData.table === 'object' && !this.testData.table.table1)) {
                this.$set(this.testData, 'table', { table1: [] })
            }
        },
        add() {
            this.testData.table.table1.push({
                mrid: "",
                measurement: {
                    mrid: "",
                    value: "C H-G",
                    unit: "",
                    type: "string"
                },
                test_mode: {
                    mrid: "",
                    value: "",
                    unit: "",
                    type: "string"
                },
                test_voltage: {
                    mrid: "",
                    value: "",
                    unit: "kV",
                    type: "analog"
                },
                df_ref: {
                    mrid: "",
                    value: "",
                    unit: "%",
                    type: "analog"
                },
                c_ref: {
                    mrid: "",
                    value: "",
                    unit: "pF",
                    type: "analog"
                },
                df_meas: {
                    mrid: "",
                    value: "",
                    unit: "%",
                    type: "analog"
                },
                c_meas: {
                    mrid: "",
                    value: "",
                    unit: "pF",
                    type: "analog"
                },
                delta_c_percent: {
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
                measurement: {
                    mrid: "",
                    value: "C H-G",
                    unit: "",
                    type: "string"
                },
                test_mode: {
                    mrid: "",
                    value: "",
                    unit: "",
                    type: "string"
                },
                test_voltage: {
                    mrid: "",
                    value: "",
                    unit: "kV",
                    type: "analog"
                },
                df_ref: {
                    mrid: "",
                    value: "",
                    unit: "%",
                    type: "analog"
                },
                c_ref: {
                    mrid: "",
                    value: "",
                    unit: "pF",
                    type: "analog"
                },
                df_meas: {
                    mrid: "",
                    value: "",
                    unit: "%",
                    type: "analog"
                },
                c_meas: {
                    mrid: "",
                    value: "",
                    unit: "pF",
                    type: "analog"
                },
                delta_c_percent: {
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
            await this.calcDeltaC()
            await this.calcAssessment()
            this.$message.success('Calculating successfully')
        },
        async calcDeltaC() {
            this.testData.table.table1.forEach(item => {
                if (!isNaN(parseFloat(item.c_ref.value)) && !isNaN(parseFloat(item.c_meas.value)) && item.c_ref.value != 0) {
                    item.delta_c_percent.value = (100 * (parseFloat(item.c_meas.value) - parseFloat(item.c_ref.value)) / parseFloat(item.c_ref.value)).toFixed(4)
                }
            })
        },

        async calcAssessment() {
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
                    row.assessment.value = defaultResult ?? ''  // dùng fallback nếu có
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
            this.testData.table.table1.forEach((element) => {
                element.measurement.value = "",
                    element.test_mode.value = '',
                    element.test_voltage.value = '',
                    element.df_ref.value = '',
                    element.c_ref.value = '',
                    element.df_meas.value = '',
                    element.c_meas.value = '',
                    element.delta_c_percent.value = '',
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
    flex-direction: column;  // ← quan trọng
    border: 1px solid #ebeef5;
    border-radius: 4px;
    // bỏ padding: 10px ở đây, để tree-row tự padding
}

.pass {
    color: #67C23A;
    font-weight: bold;
}

.fail {
    color: #F56C6C;
    font-weight: bold;
}

.tree-row {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ebeef5;
    min-height: 40px;
    padding: 8px 0;
    width: 100%;
}

.tree-row:last-child {
    border-bottom: none;
}

.limit-col {
    flex: 1;
    /* ← co giãn theo nội dung */
    padding: 0 12px;
}

.result-col {
    flex-shrink: 0;
    /* ← không bị co lại */
    width: 100px;
    /* ← fix cứng vừa đủ chữ Pass/Fail */
    text-align: center;
    border-left: 1px solid #ebeef5;
    padding: 0 12px;
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
