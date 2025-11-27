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
                    <td><el-input size="mini" v-model="testData.hv1.e50.value"></el-input></td>
                    <td><el-input size="mini" v-model="testData.hv1.standard.value"></el-input></td>
                    <td>
                        <el-select class="assessment" size="mini" v-model="testData.hv1.assessment.value">
                            <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                            <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                        </el-select>
                        <span v-if="testData.hv1.assessment.value === 'Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                        <span v-else-if="testData.hv1.assessment.value === 'Fail'" class="fa-solid fa-xmark fail icon-status"></span>
                    </td>
                </tr>
                <tr>
                    <th>HV2</th>
                    <td><el-input size="mini" v-model="testData.hv2.e50.value"></el-input></td>
                    <td><el-input size="mini" v-model="testData.hv2.standard.value"></el-input></td>
                    <td>
                        <el-select class="assessment" size="mini" v-model="testData.hv2.assessment.value">
                            <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                            <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                        </el-select>
                        <span v-if="testData.hv2.assessment.value === 'Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                        <span v-else-if="testData.hv2.assessment.value === 'Fail'" class="fa-solid fa-xmark fail icon-status"></span>
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
