<template>
    <div class="vt-test">
        <!-- Cấu hình -->
        <div class="test-toolbar">
            <div class="test-toolbar-group">
                <el-button size="mini" type="primary" @click="calculator">
                    <i class="fas fa-circle-play"></i> Assess results
                </el-button>
                <el-button size="mini" @click="clear">
                    <i class="fas fa-xmark"></i> Clear all
                </el-button>
            </div>
            <div class="test-toolbar-group">
                <el-button size="mini" @click="openAssessmentDialog = true">
                    <i class="fa-solid fa-screwdriver-wrench"></i> Assessment settings
                </el-button>
                <el-button size="mini" @click="openConditionIndicatorDialog = true">
                    <i class="fa-solid fa-hammer"></i> Condition indicator settings
                </el-button>
            </div>
        </div>

        <div class="table-scroll">
        <table class="table-strip-input-data test-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Upr (A)</th>
                    <th>Usr (A)</th>
                    <th>Ratio meas</th>
                    <th>Ratio dev</th>
                    <th>Polarity</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                    <th @click="add()" class="action-col th-btn" title="Add row"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col th-btn th-btn-danger" title="Remove all"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                    <td>
                        <el-input size="mini" type="text" v-model="item.name.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.upr.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.usr.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.ratio_meas.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.ratio_dev.value"></el-input>
                    </td>
                    <td>
                        <el-select size="mini" v-model="item.polarity.value">
                            <el-option value="OK">OK</el-option>
                            <el-option value="Incorrect">Incorrect</el-option>
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
                        <el-button size="mini" type="primary" class="row-btn" title="Insert row below" @click="addTest(index)">
                            <i class="fa-solid fa-plus"></i>
                        </el-button>
                    </td>
                    <td>
                        <el-button size="mini" type="danger" class="row-btn" title="Delete row" @click="deleteTest(index)">
                            <i class="fas fa-trash"></i>
                        </el-button>
                    </td>
                </tr>
            </tbody>
        </table>
        </div>

        <!-- Assessment settings -->
        <el-dialog title="Assessment settings" :visible.sync="openAssessmentDialog" width="min(860px, 92vw)" append-to-body>
            <el-form size="small" label-position="left" label-width="140px">
                <el-form-item label="Option">
                    <el-select style="width: 100%; max-width: 420px;" size="mini" placeholder="please select" v-model="option">
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
        <el-dialog title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog" width="min(860px, 92vw)">
        </el-dialog>
    </div>
</template>

<script>
import voltageTransformerTestMap from '@/config/test-definitions/VoltageTransformer'
import * as common from '@/views/JobView/Common/index'
import GroupNode from '../../Common/GroupNode.vue'
import { changeTestStandard } from '../../Common'

export default {
    name: "VTRatio",
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
        rowData()      { return common.buildEmptyTestRow(voltageTransformerTestMap['VTRatio'].columns) },
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
        async initializeTable() {
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
        async add() {
            if (!this.testData.table.table1) {
                await this.initializeTable()
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

        autoCalculate(index) {
            // Auto calculate when ratio_meas, upr, or usr changes
            this.$nextTick(() => {
                if (this.testData.table.table1 && this.testData.table.table1[index]) {
                    const item = this.testData.table.table1[index]

                    // Calculate ratio_dev
                    if (!isNaN(parseFloat(item.ratio_meas.value)) && item.ratio_meas.value != 0) {
                        if (!isNaN(item.upr.value) && !isNaN(item.usr.value) && item.usr.value != 0) {
                            item.ratio_dev.value = (100 * (parseFloat(item.ratio_meas.value) - (parseFloat(item.upr.value) / parseFloat(item.usr.value))) / (parseFloat(item.upr.value) / parseFloat(item.usr.value))).toFixed(4)
                        } else if (!isNaN(parseFloat(item.upr.value)) && !isNaN(parseFloat(item.usr.value)) && item.usr.value != 0) {
                            item.ratio_dev.value = (100 * (parseFloat(item.ratio_meas.value) - (parseFloat(item.upr.value) / parseFloat(item.usr.value))) / (parseFloat(item.upr.value) / parseFloat(item.usr.value))).toFixed(4)
                        }
                    }
                }
            })
        },

        async calculator() {
            await this.calcRdev()
            await this.calcAssessment()
            this.$message.success('Calculating successfully')
        },

        async calcRdev() {
            if (!this.testData.table.table1) {
                this.initializeTable()
                return
            }
            this.testData.table.table1.forEach(element => {
                if (!isNaN(parseFloat(element.ratio_meas.value)) && element.ratio_meas.value != 0) {
                    if (!isNaN(element.upr.value) && !isNaN(element.usr.value) && element.usr.value != 0) {
                        element.ratio_dev.value = (100 * (parseFloat(element.ratio_meas.value) - (parseFloat(element.upr.value) / parseFloat(element.usr.value))) / (parseFloat(element.upr.value) / parseFloat(element.usr.value))).toFixed(4)
                    } else if (!isNaN(parseFloat(element.upr.value)) && !isNaN(parseFloat(element.usr.value)) && element.usr.value != 0) {
                        element.ratio_dev.value = (100 * (parseFloat(element.ratio_meas.value) - (parseFloat(element.upr.value) / parseFloat(element.usr.value))) / (parseFloat(element.upr.value) / parseFloat(element.usr.value))).toFixed(4)
                    }
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

                // ===== collect tất cả root pass =====
                const passedResults = []

                for (const root of assessmentStandard.tree) {
                    const pass = this.evaluateGroup(root, measurementMap)
                    if (pass === true) {
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
            return common.evaluateAssessmentGroup(group, measurementMap, { absolute: true })
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
.vt-test {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

/* ── Toolbar ─────────────────────────────────────────────── */
.test-toolbar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    padding: 8px 10px;
    background: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
}

.test-toolbar-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
}

.test-toolbar-group .el-button {
    margin-left: 0;
}

.test-toolbar .el-button i {
    margin-right: 4px;
}

/* ── Bảng chuẩn (đè global stripes + viền) ───────────────── */
.table-scroll {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
}

.table-scroll::-webkit-scrollbar {
    height: 5px;
}

.table-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.table-scroll::-webkit-scrollbar-thumb {
    background-color: rgba(120, 120, 120, 0.6);
    border-radius: 6px;
}

.test-table {
    width: max-content;
    min-width: 100%;
    overflow: hidden;
    border: 1px solid #e4e7ed !important;
    border-radius: 4px;
    background: #fff;
    color: #303133;
    font-size: 12px !important;
}

::v-deep(.test-table > thead) {
    background-color: #f5f7fa;
}

::v-deep(.test-table > tbody > tr),
::v-deep(.test-table > tbody > tr:nth-child(even)) {
    background-color: #fff;
}

::v-deep(.test-table > tbody > tr:hover) {
    background-color: #f9fafc;
}

.test-table th {
    background: #f5f7fa;
    color: #606266;
    font-weight: 600;
}

.test-table th,
.test-table td {
    border: 1px solid #e4e7ed !important;
    height: 34px;
    padding: 4px 8px;
    vertical-align: middle;
    white-space: nowrap;
    font-size: 12px;
}

.test-table .action-col {
    width: 44px;
}

/* Nút +/xóa trên header */
.th-btn {
    cursor: pointer;
    text-align: center;
    color: #012596;
}

.th-btn:hover {
    background: #eef1f8;
}

.th-btn-danger {
    color: #cc0514;
}

.th-btn-danger:hover {
    background: #fdeaec;
}

/* Nút thêm/xóa từng hàng: kiểu ghost */
.row-btn {
    width: auto;
    padding: 5px 7px;
    background: transparent;
    border-color: transparent;
}

.row-btn.el-button--primary {
    color: #012596;
}

.row-btn.el-button--primary:hover,
.row-btn.el-button--primary:focus {
    background: #eef1f8;
    border-color: transparent;
    color: #012596;
}

.row-btn.el-button--danger {
    color: #cc0514;
}

.row-btn.el-button--danger:hover,
.row-btn.el-button--danger:focus {
    background: #fdeaec;
    border-color: transparent;
    color: #cc0514;
}

::v-deep(.test-table .el-input),
::v-deep(.test-table .el-select) {
    width: 100%;
    min-width: 90px;
}

::v-deep(.test-table .el-input__inner) {
    width: 100%;
    font-size: 12px !important;
}

/* Màu condition indicator */
.Good ::v-deep(input) {
    background: #00CC00;
}

.Fair ::v-deep(input) {
    background: #ffff00;
}

.Poor ::v-deep(input) {
    background: #ff9900;
}

.Bad ::v-deep(input) {
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
