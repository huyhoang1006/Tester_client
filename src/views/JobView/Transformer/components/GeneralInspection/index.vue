<template>
    <div id="general-inspection">
        <table class="table-strip-input-data" style="width: 400px">
            <thead>
                <tr>
                    <th></th>
                    <th class="assessment-col">Assessment</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>General inspection</th>
                    <td>
                        <el-select size="mini" v-model="testData.general_inspection">
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
        }
    },
    data() {
        return {
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
