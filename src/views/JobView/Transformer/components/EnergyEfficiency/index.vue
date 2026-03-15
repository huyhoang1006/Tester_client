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
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                    <th>{{ item.name.value }}</th>
                    <td><el-input size="mini" v-model="item.e50.value"></el-input></td>
                    <td><el-input size="mini" v-model="item.standard.value"></el-input></td>
                    <td>
                        <el-select class="assessment" size="mini" v-model="item.assessment.value">
                            <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                            <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                        </el-select>
                        <span v-if="item.assessment.value === 'Pass'"
                            class="fa-solid fa-square-check pass icon-status"></span>
                        <span v-else-if="item.assessment.value === 'Fail'"
                            class="fa-solid fa-xmark fail icon-status"></span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import TransformerTestMap from '@/config/test-definitions/Transformer'
import * as common from '../../../Common/index'
export default {
    name: 'EnergyEfficiency',
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
        },
        rowData() {
            return common.buildEmptyTestRow(TransformerTestMap['MeasurementOfShortCurcuit'].columns)
        }
    }
}
</script>

<style lang="scss" scoped></style>
