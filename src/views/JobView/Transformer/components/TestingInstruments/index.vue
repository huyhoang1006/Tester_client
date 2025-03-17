<template>
    <div>
        <el-button size="mini" type="primary" class="btn-action" plain @click="add(testData.dataList)"> <i class="fas fa-plus"></i> Add </el-button>
        <el-button size="mini" type="primary" class="btn-action" plain @click="removeAll()"> <i class="fas fa-xmark"></i> Remove all </el-button>
        <table style="width: 600px" class="mgt-10 table-strip-input-data">
            <thead>
                <tr>
                    <th class="no-col">No.</th>
                    <th>Testing instrument</th>
                    <th>Type</th>
                    <th class="action-col"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.dataList" :key="index">
                    <td>
                        {{ index + 1 }}
                    </td>
                    <td>
                        <el-input size="mini" v-model="item.testingInstrument"> </el-input>
                    </td>
                    <td>
                        <el-input size="mini" v-model="item.type_ins"> </el-input>
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
export default {
    props: {
        data: {
            type: Object,
            require: true,
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
        }
    },
    methods: {
        add(array_list) {
            const temp = {
                no: '',
                testingInstrument: '',
                type_ins: ''
            }
            array_list.push(temp)
        },
        removeAll() {
            this.testData.dataList = []
        },
        deleteTest(index) {
            this.testData.dataList.splice(index, 1)
        }
    }
}
</script>
<style lang="scss" scoped></style>
