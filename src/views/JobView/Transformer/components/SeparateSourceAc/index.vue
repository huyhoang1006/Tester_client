<template>
    <div id="separate-source">
        <table style="width: 400px" class="mgb-10">
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
                    <td><el-input size="mini" v-model="testData.hv.test_voltage"></el-input></td>
                    <td>
                        <el-select size="mini" v-model="testData.hv.assessment">
                            <el-option label="Pass" value="Pass"></el-option>
                            <el-option label="Fail" value="Fail"></el-option>
                        </el-select>
                    </td>
                </tr>
                <tr>
                    <td>LV - (HV+E)</td>
                    <td><el-input size="mini" v-model="testData.lv.test_voltage"></el-input></td>
                    <td>
                        <el-select size="mini" v-model="testData.lv.assessment">
                            <el-option label="Pass" value="Pass"></el-option>
                            <el-option label="Fail" value="Fail"></el-option>
                        </el-select>
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
