<template>
    <div id="dc-winding-resistance-prim">

        <div style="position: sticky; left: 0; display: inline-block;">
            <!-- Cấu hình -->
            <el-row class="mgb-10">
                <el-col>
                    <el-button class="btn-action" size="mini" type="success" @click="openAssessmentSettings()">
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

        <table class="table-strip-input-data" style="width: 100%; font-size: 12px;">
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Trip coil no.</th>
                    <th>Trip current (mA)</th>
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
                        <el-input size="mini" style="width: 100px;" type="text" number="positive"
                            v-model="item.trip_coil_no.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive"
                            v-model="item.trip_current.value"></el-input>
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

        <el-dialog append-to-body title="Assessment settings" :visible.sync="openAssessmentDialog" width="500px">
            <el-radio-group v-model="assetData.assessmentLimits.limits" style="margin-bottom:16px;">
                <el-radio label="Absolute">Absolute limits</el-radio>
                <el-radio label="Relative">Relative limits</el-radio>
            </el-radio-group>
            <el-form size="small" label-position="left" label-width="160px">
                <template v-if="assetData.assessmentLimits.limits === 'Absolute'">
                    <el-form-item label="Min trip current (A)">
                        <el-input type="text" number="positive"
                            v-model="assetData.assessmentLimits.overcurrent_release.abs.oc_replay_trip_current.min.value" />
                    </el-form-item>
                    <el-form-item label="Max trip current (A)">
                        <el-input type="text" number="positive"
                            v-model="assetData.assessmentLimits.overcurrent_release.abs.oc_replay_trip_current.max.value" />
                    </el-form-item>
                </template>
                <template v-else>
                    <el-form-item label="Ref trip current (A)">
                        <el-input type="text" number="positive"
                            v-model="assetData.assessmentLimits.overcurrent_release.rel.oc_replay_trip_current.ref.value" />
                    </el-form-item>
                    <el-form-item label="Dev trip current (A)">
                        <el-input type="text" number="positive"
                            v-model="assetData.assessmentLimits.overcurrent_release.rel.oc_replay_trip_current.dev.value" />
                    </el-form-item>
                </template>
            </el-form>
            <template v-slot:footer>
                <span style="position:absolute;right:10px;bottom:10px;">
                    <el-button @click="resetAssessment">Cancel</el-button>
                    <el-button type="primary" @click="updateAssessment">OK</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import CircuitBreakerTestMap from '@/config/test-definitions/CircuitBreaker'
import * as common from '../../Common/index'
import assessmentMixin from './assessmentMixin'
export default {
    mixins: [assessmentMixin],
    name: "OverCurrentRelease",
    data() {
        return {
            openAssessmentDialog: false,
            backupLimits: null,
            assessmentIpcChannel: 'updateOvercurrentReleaseLimits',
            openConditionIndicatorDialog: false
        }
    },
    props: {
        data: {
            type: Object,
            require: true
        },
        asset: {
            type: Object,
            default: function () { return {} }
        }
    },
    computed: {
        testData() {
            return this.data
        },
        assetData() {
            return this.asset
        },
        assessmentSetting() {
            return this.data.assessment_setting
        },
        conditionIndicator() {
            return this.data.condition_indicator
        },
        rowData() {
            return common.buildEmptyTestRow(CircuitBreakerTestMap['OverCurrentRelease'].columns)
        }
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
            var limits = this.assetData && this.assetData.assessmentLimits ? this.assetData.assessmentLimits : null
            if (!limits) { this.$message.error('Assessment limits not configured'); return }
            var ocr = limits.overcurrent_release
            var mode = limits.limits
            this.testData.table.table1.forEach(function (item) {
                var value = item.trip_current ? item.trip_current.value : ''
                var result
                if (mode === 'Absolute') {
                    result = this.assessAbsolute(value, ocr.abs.oc_replay_trip_current.min, ocr.abs.oc_replay_trip_current.max)
                } else {
                    result = this.assessRelative(value, ocr.rel.oc_replay_trip_current.ref, ocr.rel.oc_replay_trip_current.dev)
                }
                item.assessment.value = result
            }.bind(this))
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
