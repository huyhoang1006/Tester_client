<template>
    <div>
        <table class="table-strip-input-data" style="width: 100% ; font-size: 12px;">
            <thead>
                <tr>
                    <th colspan="4">Dimension (mm)</th>
                    <th colspan="3">Weight (kg)</th>
                </tr>
                <tr>
                    <th>A</th>
                    <th>B</th>
                    <th>C</th>
                    <th>N</th>
                    <th>Oil</th>
                    <th>Active part</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <el-input size="mini" v-model="testData.table.dimension.a.value"> </el-input>
                    </td>
                    <td>
                        <el-input size="mini" v-model="testData.table.dimension.b.value"> </el-input>
                    </td>
                    <td>
                        <el-input size="mini" v-model="testData.table.dimension.c.value"> </el-input>
                    </td>
                    <td>
                        <el-input size="mini" v-model="testData.table.dimension.n.value"> </el-input>
                    </td>
                    <td>
                        <el-input size="mini" v-model="testData.table.weight.oil.value"> </el-input>
                    </td>
                    <td>
                        <el-input size="mini" v-model="testData.table.weight.active.value"> </el-input>
                    </td>
                    <td>
                        <el-input size="mini" v-model="testData.table.weight.total.value"> </el-input>
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
            openConditionIndicatorDialog: false
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
