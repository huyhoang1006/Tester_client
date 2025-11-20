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
        }
    },
    methods: {
        add() {
            const temp = {
                no: '',
                testingInstrument: '',
                type_ins: ''
            }
            this.testData.dataList.push(temp)
        },
        removeAll() {
            this.$confirm('This will delete all items. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                })
                .then( () => {
                    this.testData.dataList = []
                })
                .catch( () => {
                    // User cancelled, do nothing
                })
        },
        deleteTest(index) {
            this.testData.dataList.splice(index, 1)
        },
        addTest(index) {
            const data = {
                no: '',
                testingInstrument: '',
                type_ins: ''
            }
            this.testData.dataList.splice(index+1, 0, data)
        }
    }
}
</script>
<style lang="scss" scoped></style>
