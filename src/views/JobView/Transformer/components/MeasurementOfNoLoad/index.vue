<template>
    <div id="measurement-of-no-load">
        <table class="table-strip-input-data" style="width: 700px">
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
                    <th>No-load loss (W)</th>
                    <td><el-input size="mini" v-model="testData.no_load_loss.result"></el-input></td>
                    <td><el-input size="mini" v-model="testData.no_load_loss.standard"></el-input></td>
                    <td>
                        <el-select size="mini" v-model="testData.no_load_loss.assessment">
                            <el-option label="Pass" value="Pass"></el-option>
                            <el-option label="Fail" value="Fail"></el-option>
                        </el-select>
                    </td>
                </tr>
                <tr>
                    <th>No-load current (%)</th>
                    <td><el-input size="mini" v-model="testData.no_load_current.result"></el-input></td>
                    <td><el-input size="mini" v-model="testData.no_load_current.standard"></el-input></td>
                    <td>
                        <el-select size="mini" v-model="testData.no_load_current.assessment">
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
                    code: 'MeasurementOfNoLoad',
                    no_load_loss: {
                        result: '',
                        standard: '',
                        assessment: ''
                    },
                    no_load_current: {
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
