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
                    <td><el-input size="mini" v-model="testData.load_loss.result"></el-input></td>
                    <td><el-input size="mini" v-model="testData.load_loss.standard"></el-input></td>
                    <td>
                        <el-select size="mini" v-model="testData.load_loss.assessment">
                            <el-option label="Pass" value="Pass"></el-option>
                            <el-option label="Fail" value="Fail"></el-option>
                        </el-select>
                    </td>
                </tr>
                <tr>
                    <th>Short circuit impedance(%)</th>
                    <td><el-input size="mini" v-model="testData.short_circuit_impedance.result"></el-input></td>
                    <td><el-input size="mini" v-model="testData.short_circuit_impedance.standard"></el-input></td>
                    <td>
                        <el-select size="mini" v-model="testData.short_circuit_impedance.assessment">
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
