<template>
    <div id="measurement-of-short-circuit">
        <table class="table-strip-input-data" style="width: 70% ; font-size: 12px;">
            <thead>
                <tr>
                    <th></th>
                    <th>Result</th>
                    <th>Standard</th>
                    <th class="assessment-col">Assessment</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>Load loss (W)</th>
                    <td><el-input size="mini" v-model="testData.load_loss.result.value"></el-input></td>
                    <td><el-input size="mini" v-model="testData.load_loss.standard.value"></el-input></td>
                    <td>
                        <el-select  class="assessment" size="mini" v-model="testData.load_loss.assessment.value">
                            <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                            <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                        </el-select>
                        <span v-if="testData.load_loss.assessment.value === 'Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                        <span v-else-if="testData.load_loss.assessment.value === 'Fail'" class="fa-solid fa-xmark fail icon-status"></span>
                    </td>
                </tr>
                <tr>
                    <th>Short circuit impedance(%)</th>
                    <td><el-input size="mini" v-model="testData.short_circuit_impedance.result.value"></el-input></td>
                    <td><el-input size="mini" v-model="testData.short_circuit_impedance.standard.value"></el-input></td>
                    <td>
                        <el-select  class="assessment" size="mini" v-model="testData.short_circuit_impedance.assessment.value">
                            <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                            <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                        </el-select>
                        <span v-if="testData.short_circuit_impedance.assessment.value === 'Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                        <span v-else-if="testData.short_circuit_impedance.assessment.value === 'Fail'" class="fa-solid fa-xmark fail icon-status"></span>
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
                    code: 'MeasurementOfShortCircuit',
                    load_loss: {
                        result: '',
                        standard: '',
                        assessment: ''
                    },
                    short_circuit_impedance: {
                        result: '',
                        standard: '',
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
