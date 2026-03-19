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
import TransformerTestMap from '@/config/test-definitions/Transformer'
import * as common from '../../../Common/index'
export default {
    name: 'TestingInstruments',
    props: {
        data: {
            type: Object,
            required: true,
            default() {
                return {
                    code: 'TestingInstruments',
                    dataList: [
                        {
                            no: '',
                            testingInstrument: '',
                            type_ins: ''
                        }
                    ]
                }
            }
        }
    },
    computed: {
        testData() {
            return this.data
        },
        rowData() {
            return common.buildEmptyTestRow(TransformerTestMap['TestingInstruments'].columns)
        }
    },
    methods: {
        add() {
            this.testData.table.table1.push(JSON.parse(JSON.stringify(this.rowData)))
        },
        removeAll() {
            this.$confirm('This will delete the file. Continue?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(() => {
                this.testData.table.table1 = []
            })
        },
        deleteTest(index) {
            this.testData.table.table1.splice(index, 1)
        },
        addTest(index) {
            const data = JSON.parse(JSON.stringify(this.rowData))
            this.testData.table.table1.splice(index + 1, 0, data)
        }
    }
}
</script>
<style lang="scss" scoped></style>
