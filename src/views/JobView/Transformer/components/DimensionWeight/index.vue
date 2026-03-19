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
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                    <td><el-input size="mini" v-model="item.a.value"></el-input></td>
                    <td><el-input size="mini" v-model="item.b.value"></el-input></td>
                    <td><el-input size="mini" v-model="item.c.value"></el-input></td>
                    <td><el-input size="mini" v-model="item.n.value"></el-input></td>
                    <td><el-input size="mini" v-model="item.oil.value"></el-input></td>
                    <td><el-input size="mini" v-model="item.active_part.value"></el-input></td>
                    <td><el-input size="mini" v-model="item.total.value"></el-input></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
import TransformerTestMap from '@/config/test-definitions/Transformer'
import * as common from '../../../Common/index'
export default {
    name: 'DimensionWeight',
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
        },
        rowData() {
            return common.buildEmptyTestRow(TransformerTestMap['DimensionWeight'].columns)
        }
    }
}
</script>
<style lang="scss" scoped></style>
