<template>
    <div id="dc-winding-resistance-prim">
        <el-row class="mgb-10">
            <el-col>
                <el-button size="mini" type="primary" class="" plain> <i class="fas fa-setting"></i> Assessment settings </el-button>
                <el-button size="mini" type="primary" class="" plain> <i class="fas fa-setting"></i> Condition indicatior settings </el-button>
            </el-col>
        </el-row>
        <el-row class="mgb-10">
            <el-col>
                <el-button size="mini" type="primary" class="btn-action" plain> <i class="fas fa-circle-play"></i> Assess results </el-button>
                <el-button size="mini" type="primary" class="btn-action" plain> <i class="fas fa-xmark"></i> Clear all </el-button>
            </el-col>
        </el-row>

        <el-row class="mgb-10">
            <el-col>
                <el-button size="mini" type="primary" class="btn-action" plain @click="add()"> <i class="fas fa-plus"></i> Add </el-button>
                <el-button size="mini" type="primary" class="btn-action" plain @click="removeAll()"> <i class="fas fa-xmark"></i> Remove all </el-button>
            </el-col>
        </el-row>

        <table class="table-strip-input-data" style="width: 2000px">
            <thead>
                <tr>
                    <th class="no-col">No</th>
                    <th>Measurement</th>
                    <th>Test mode</th>
                    <th>V test (kV)</th>
                    <th>DF ref (%)</th>
                    <th>C ref (pF)</th>
                    <th>DF meas (%)</th>
                    <th>C meas (pF)</th>
                    <th class="assessment-col">Assessment</th>
                    <th>Condition indicator DF</th>
                    <th>Condition indicator C</th>
                    <th class="action-col"></th>
                </tr>
            </thead>
            <tbody>
                <template v-for="(item, index) in testData.table">
                    <tr :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.measurement"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.test_mode"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.test_voltage"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.df_ref"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.c_ref"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.df_meas"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.c_meas"></el-input>
                        </td>
                        <td>
                            <el-select class="assessment" size="mini" v-model="item.assessment">
                                <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                                <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                            </el-select>
                            <span v-if="item.assessment==='Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                            <span v-else-if="item.assessment==='Fail'" class="fa-solid fa-xmark fail icon-status"></span>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.condition_indicator_df"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.condition_indicator_c"></el-input>
                        </td>
                        <td>
                            <el-button size="mini" type="danger" class="w-100" @click="deleteTest(index)">
                                <i class="fas fa-trash"></i>
                            </el-button>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false
        }
    },
    props: {
        data: {
            type: Object,
            require: true
        }
    },
    computed: {
        testData() {
            return this.data
        }
    },
    methods: {
        add() {
            this.testData.table.push({
                measurement: '',
                test_mode: '',
                test_voltage: '',
                df_ref: '',
                c_ref: '',
                df_meas: '',
                c_meas: '',
                assessment: '',
                condition_indicator_df: '',
                condition_indicator_c: ''
            })
        },
        removeAll() {
            this.testData.table = []
        },
        deleteTest(index) {
            this.testData.table.splice(index, 1)
        }
    }
}
</script>

<style lang="scss" scoped></style>
