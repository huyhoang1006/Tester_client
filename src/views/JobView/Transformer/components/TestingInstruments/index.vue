<template>
    <div id="testing-instruments" style="width: 100%; font-size: 12px;">
        <table style="width: 60%; font-size: 12px;" class="mgt-10 table-strip-input-data">
            <thead>
                <tr>
                    <th class="no-col">No.</th>
                    <th>Testing instrument</th>
                    <th>Type</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                    <td>
                        {{ index + 1 }}
                    </td>
                    <td>
                        <el-input size="mini" v-model="item.item.value"> </el-input>
                    </td>
                    <td>
                        <el-input size="mini" v-model="item.type.value"> </el-input>
                    </td>
                    <td>
                        <el-button size="mini" type="primary" class="w-100" @click="addTest(index)">
                            <i class="fa-solid fa-plus"></i>
                        </el-button>
                    </td>
                    <td>
                        <el-button size="mini" type="danger" class="w-100" @click="deleteTest(index)">
                            <i class="fas fa-trash"></i>
                        </el-button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
/* eslint-disable */
import transformerTestMap from '@/config/test-definitions/Transformer'
import * as common from '../../../Common/index.js'
import GroupNode from '../../../Common/GroupNode.vue'
import { changeTestStandard } from '../../../Common'

export default {
    name: "TestingInstruments",
    components: { GroupNode },
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            option: null
        }
    },
    props: {
        data:           { type: Object, require: true },
        asset:          { type: Object, require: true },
        testAssessment: { type: Object, require: true },
        testCondition:  { type: Object, default: function() { return { condition: {} } } }
    },
    computed: {
        testData()     { return this.data },
        assetData()    { return this.asset },
        rowData()      { return common.buildEmptyTestRow(transformerTestMap['TestingInstruments'].columns) },
        assessmentData()        { return this.testAssessment ? this.testAssessment.assessment : [] },
        assessmentList() {
            return (this.assessmentData || []).map(function(x) {
                return { code: x.code, name: x.name, type: x.type, mrid: x.mrid }
            })
        },
        filteredAssessmentData() {
            if (!this.option) return []
            return (this.assessmentData || []).filter(function(e) { return e.code === this.option }.bind(this))
        },
        testStandardData() { return this.testAssessment ? this.testAssessment.testStandard : null }
    },
    watch: {
        'option': {
            immediate: true,
            handler: async function (newVal) {
                const standard = this.filteredAssessmentData.find(x => x.code === newVal)
                if (standard) await changeTestStandard(standard.mrid, standard.type, this.testStandardData)
            }
        },
        'testStandardData': {
            immediate: true,
            handler: async function(newVal) {
                this.option = common.testStandardDataToOption(newVal)
            }
        }
    },
    methods: {
        add() {
            if (!this.testData.table) this.$set(this.testData, 'table', {})
            if (!this.testData.table.table1) this.$set(this.testData.table, 'table1', [])
            this.testData.table.table1.push(JSON.parse(JSON.stringify(this.rowData)))
        },
        removeAll() {
            this.$confirm('Delete all?', 'Warning', { confirmButtonText: 'OK', cancelButtonText: 'Cancel', type: 'warning' })
                .then(function() { if (this.testData.table) this.testData.table.table1 = [] }.bind(this))
                .catch(function() {})
        },
        deleteTest(index) {
            if (this.testData.table && this.testData.table.table1) this.testData.table.table1.splice(index, 1)
        },
        addTest(index) {
            var data = JSON.parse(JSON.stringify(this.rowData))
            if (this.testData.table && this.testData.table.table1) this.testData.table.table1.splice(index + 1, 0, data)
        },
        async calculator() {
            this.$message.success('No computed fields for this test')
        },
        clear() {
            if (this.testData.table && this.testData.table.table1) {
                this.testData.table.table1.forEach(function(row) {
                    Object.keys(row).forEach(function(key) {
                        if (key === 'mrid') return
                        if (row[key] && typeof row[key] === 'object' && 'value' in row[key]) row[key].value = ''
                    })
                })
            }
        },
        nameColor(data) {
            if (data === this.$constant.GOOD) return 'Good'
            else if (data === this.$constant.FAIR) return 'Fair'
            else if (data === this.$constant.POOR) return 'Poor'
            else if (data === this.$constant.BAD) return 'Bad'
            else return
        }
    }
}
</script>

<style lang="scss" scoped>
.assessment-container { width: 75%; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 16px; overflow: hidden; }
.assessment-header { display: flex; background: #f5f7fa; font-weight: bold; padding: 8px; }
.assessment-body { display: flex; flex-direction: column; border: 1px solid #ebeef5; border-radius: 4px; }
.tree-row { display: flex; align-items: center; border-bottom: 1px solid #ebeef5; min-height: 40px; padding: 8px 0; width: 100%; }
.tree-row:last-child { border-bottom: none; }
.limit-col { flex: 1; padding: 0 12px; }
.result-col { flex-shrink: 0; width: 100px; text-align: center; border-left: 1px solid #ebeef5; padding: 0 12px; align-self: stretch; display: flex; align-items: center; justify-content: center; }
.tree-row-default { background: #fafafa; }
.default-label { font-style: italic; color: #909399; font-size: 13px; }
.pass { color: #67C23A; font-weight: bold; }
.fail { color: #F56C6C; font-weight: bold; }
</style>