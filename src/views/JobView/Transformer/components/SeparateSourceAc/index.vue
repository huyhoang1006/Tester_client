<template>
    <div id="separate-source">
        <table style="width: 50% ; font-size: 12px;" class="mgb-10" >
            <tbody>
                <tr>
                    <td>Test frequency</td>
                    <td style="width: 150px">50Hz</td>
                </tr>
                <tr>
                    <td>Test duration</td>
                    <td>60 s</td>
                </tr>
            </tbody>
        </table>

        <table class="table-strip-input-data" style="width: 50% ; font-size: 12px;">
            <thead>
                <tr>
                    <th>Applied terminal</th>
                    <th>V test (kV)</th>
                    <th class="assessment-col">Assessment</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>HV - (LV+E)</td>
                    <td><el-input size="mini" v-model="testData.x_hv.test_voltage.value"></el-input></td>
                    <td>
                        <el-select class="assessment" size="mini" v-model="testData.x_hv.assessment.value">
                            <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                            <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                        </el-select>
                        <span v-if="testData.x_hv.assessment.value === 'Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                        <span v-else-if="testData.x_hv.assessment.value === 'Fail'" class="fa-solid fa-xmark fail icon-status"></span>
                    </td>
                </tr>
                <tr>
                    <td>LV - (HV+E)</td>
                    <td><el-input size="mini" v-model="testData.lv.test_voltage.value"></el-input></td>
                    <td>
                        <el-select class="assessment" size="mini" v-model="testData.lv.assessment.value">
                            <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                            <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                        </el-select>
                        <span v-if="testData.lv.assessment.value === 'Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                        <span v-else-if="testData.lv.assessment.value === 'Fail'" class="fa-solid fa-xmark fail icon-status"></span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    props: {
        data: {
            type: Object,
            require: true,
            default() {
                return {
                    code: 'SeparateSourceAc',
                    hv: {
                        test_voltage: '',
                        assessment: ''
                    },
                    lv: {
                        test_voltage: '',
                        assessment: ''
                    }
                }
            }
        }
    },
    computed: {
        testData() {
            return this.data
        }
    }
}
</script>

<style lang="scss" scoped></style>
