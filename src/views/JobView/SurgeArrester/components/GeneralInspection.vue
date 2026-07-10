<template>
    <div class="surge-test">

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

            <!-- Tương tác với bảng -->
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
                    <th>No.</th>
                    <th>Item</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                    <th @click="add()" class="action-col th-btn" title="Add row"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col th-btn th-btn-danger" title="Remove all"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                    <td class="cell-center">
                        {{ index + 1 }}
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.item.value"></el-input>
                    </td>
                    <td>
                        <el-select class="assessment" size="mini" v-model="item.assessment.value">
                            <el-option value="Pass" label="Pass"><i class="fa-solid fa-square-check pass"></i>
                                Pass</el-option>
                            <el-option value="Fail" label="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
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
                    <td class="cell-center">
                        <el-button size="mini" type="primary" class="row-btn" title="Insert row below" @click="addTest(index)">
                            <i class="fa-solid fa-plus"></i>
                        </el-button>
                    </td>
                    <td class="cell-center">
                        <el-button size="mini" type="danger" class="row-btn" title="Delete row" @click="deleteTest(index)">
                            <i class="fas fa-trash"></i>
                        </el-button>
                    </td>
                </tr>
            </tbody>
        </table>
        </div>

        <!-- Assessment settings -->
        <el-dialog :modal="false" title="Assessment settings" :visible.sync="openAssessmentDialog" width="min(860px, 92vw)">
        </el-dialog>

        <!-- Condition indicator settings -->
        <el-dialog :modal="false" title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog"
            width="min(860px, 92vw)">
        </el-dialog>
    </div>
</template>

<script>
import surgeArresterTestMap from '@/config/test-definitions/SurgeArrester'
import * as common from '../../Common/index'
export default {
    name: "GeneralInspection",
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
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
            return common.buildEmptyTestRow(surgeArresterTestMap['GeneralInspection'].columns)
        }
    },
    watch: {
    },
    methods: {
        add() {
            this.testData.table.table1.push(JSON.parse(JSON.stringify(this.rowData)))
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
        calculator() {
            this.$message.success('Calculating successfully')
        },
        clear() {
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
.surge-test {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

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

.cell-center {
    text-align: center;
}

.test-table .action-col {
    width: 44px;
}

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
</style>
