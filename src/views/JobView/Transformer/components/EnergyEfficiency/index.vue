<template>
    <div id="energy-efficiency">
        <table class="table-strip-input-data" style="width: 60% ; font-size: 12px; ">
            <thead>
                <tr>
                    <th></th>
                    <th>E50%</th>
                    <th>Standard</th>
                    <th class="assessment-col">Assessment</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>HV1</th>
                    <td><el-input size="mini" v-model="testData.hv1.e50"></el-input></td>
                    <td><el-input size="mini" v-model="testData.hv1.standard"></el-input></td>
                    <td>
                        <el-select size="mini" v-model="testData.hv1.assessment">
                            <el-option label="Pass" value="Pass"></el-option>
                            <el-option label="Fail" value="Fail"></el-option>
                        </el-select>
                    </td>
                </tr>
                <tr>
                    <th>HV2</th>
                    <td><el-input size="mini" v-model="testData.hv2.e50"></el-input></td>
                    <td><el-input size="mini" v-model="testData.hv2.standard"></el-input></td>
                    <td>
                        <el-select size="mini" v-model="testData.hv2.assessment">
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
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
        }
    },
    props: {
        data: {
            type: Object,
            require: true,
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
