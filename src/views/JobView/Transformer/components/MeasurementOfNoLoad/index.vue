<template>
    <div id="measurement-of-no-load">
        <table class="table-strip-input-data" style="width: 70% ; font-size: 12px;">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Result</th>
                    <th>Standard</th>
                    <th class="assessment-col">Assessment</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                    <th><el-input size="mini" v-model="item.name.value"></el-input></th>
                    <td><el-input size="mini" v-model="item.result.value"></el-input></td>
                    <td><el-input size="mini" v-model="item.standard.value"></el-input></td>
                    <td>
                        <el-select  class="assessment" size="mini" v-model="item.assessment.value">
                            <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                            <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                        </el-select>
                        <span v-if="item.assessment.value === 'Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                        <span v-else-if="item.assessment.value === 'Fail'" class="fa-solid fa-xmark fail icon-status"></span>
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
