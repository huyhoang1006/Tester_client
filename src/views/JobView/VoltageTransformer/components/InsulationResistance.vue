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

        <table class="table-strip-input-data" style="width: 90% ; font-size: 12px;">
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Measurement</th>
                    <th>Test voltage (V)</th>
                    <th>R<sub>60s</sub> (MΩ)</th>
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
                            <el-input style="width: 140px;" size="mini" type="text"
                                v-model="item.measurement.value"></el-input>
                            <div
                                :class="{ colorTableRed: index % 3 == 0, colorTableYellow: index % 3 == 1, colorTableBlue: index % 3 == 2 }">
                            </div>
                        </div>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.test_voltage.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.r60s.value"></el-input>
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
        <el-dialog :modal=true  title="Assessment settings" :visible.sync="openAssessmentDialog" width="860px" append-to-body>
            <el-form style="width: 75%;" size="small" label-position="left" label-width="140px">
                <el-form-item label="Option">
                    <el-select size="mini" placeholder="please select" v-model="option">
                        <el-option v-for="option in assessmentList" :key="option" :label="option" :value="option"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <table v-for="(element, index) in assessmentData" :key="index" style="width: 75%;" class="table-strip-input-data w-50">
                <thead>
                    <tr>
                        <th colspan="2">Limit</th>
                        <th>Assessment</th>
                    </tr>
                </thead>
                <tbody v-if="element.type === option">
                    <tr v-for="(record, recordIndex) in element.records" :key="'record' + recordIndex">
                        <th v-html="record.label"></th>
                        <td>{{ record.description }} <el-input style="width: 100px;" size="mini" v-model="record.r60s.value"></el-input></td>
                        <th v-if="record.assessment.value === 'Pass'">
                            <i class="fas fa-check-square pass"></i> {{ record.assessment.value }}
                        </th>
                        <th v-else-if="record.assessment.value === 'Fail'">
                            <i class="fas fa-xmark fail"></i> {{ record.assessment.value }}
                        </th>
                    </tr>
                </tbody>
            </table>
        </el-dialog>

        <!-- Condition indicator settings -->
        <el-dialog :modal=false title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog" width="860px">
        </el-dialog>
    </div>
</template>

<script>
/* eslint-disable */
import voltageTransformerTestMap from '@/config/test-definitions/VoltageTransformer'
import * as common from '@/views/JobView/Common/index'

export default {
    name: "InsulationResistance",
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
        testAssessment: {
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
            return common.buildEmptyTestRow(voltageTransformerTestMap['InsulationResistance'].columns)
        },
        assessmentData() {
            return this.testAssessment.assessment
        },
        assessmentList() {
            return this.testAssessment.assessment.map(x => x.type)
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
        option : {
            immediate : true,
            handler: function (newVal) {
                const standard = this.assessmentData.find(x => x.type === newVal)
                if(standard) {
                    const standard = this.assessmentData.find(x => x.type === newVal)
                    this.$emit('update-standard', standard.mrid, standard.type)
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
        calculator() {
            const standardRecord = this.assessmentData.find(x => x.type === this.option)
            for(const row of this.testData.table.table1) {
                for(const record of standardRecord.records) {
                    if(common.compare(parseFloat(row.r60s.value), record.description, parseFloat(record.r60s.value))) {
                        row.assessment.value = record.assessment.value
                    }
                }
            }
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
</style>
