<template>
    <div>
        <table class="mgb-10" style="width: 500px">
            <tbody>
                <tr>
                    <td>Test frequency (Hz)</td>
                    <td>100 Hz</td>
                </tr>
                <tr>
                    <td>Test voltage</td>
                    <td>2Ur (Rated voltage)</td>
                </tr>
                <tr>
                    <td>Test duration (s)</td>
                    <td>60 s</td>
                </tr>
            </tbody>
        </table>
        <el-divider style="width: 500px"></el-divider>
        <el-button size="mini" type="primary" class="btn-action" plain @click="add(dataTest.dataList)"> <i class="fas fa-plus"></i> Add </el-button>
        <el-button size="mini" type="primary" class="btn-action" plain @click="removeAll"> <i class="fas fa-xmark"></i> Remove all </el-button>
        <table class="w-100 mgt-10 table-strip-input-data">
            <thead>
                <tr>
                    <th colspan="2">Applied terminal</th>
                    <th colspan="4">Test voltage</th>
                    <th rowspan="3" class="assessment-col">Assessment</th>
                    <th rowspan="3" class="action-col"></th>
                </tr>
                <tr>
                    <th rowspan="2">Terminal</th>
                    <th rowspan="2">Rated voltage (V)</th>
                    <th colspan="2">LV</th>
                    <th colspan="2">HV</th>
                </tr>
                <tr>
                    <th>Terminal</th>
                    <th>Tested voltage (V)</th>
                    <th>Terminal</th>
                    <th>Tested voltage (V)</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in dataTest.dataList" :key="index">
                    <td>
                        <el-input size="mini" v-model="item.terminal"> </el-input>
                    </td>
                    <td>
                        <el-input size="mini" v-model="item.ratedVoltage"> </el-input>
                    </td>
                    <td>
                        <el-input size="mini" v-model="item.Lv.terminal"> </el-input>
                    </td>
                    <td>
                        <el-input size="mini" v-model="item.Lv.testedVoltage"> </el-input>
                    </td>
                    <td>
                        <el-input size="mini" v-model="item.Hv.terminal"> </el-input>
                    </td>
                    <td>
                        <el-input size="mini" v-model="item.Hv.testedVoltage"> </el-input>
                    </td>
                        <td>
                            <el-select class="assessment" size="mini" v-model="item.assessment">
                                <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                                <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                            </el-select>
                            <span v-if="item.assessment==='Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                            <span v-else-if="item.assessment==='Fail'" class="fa-solid fa-xmark fail icon-status"></span>
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
                    code: 'InducedAcVoltageTests',
                    dataList: [
                        {
                            terminal: '',
                            ratedVoltage: '',
                            Lv: {
                                terminal: '',
                                testedVoltage: ''
                            },
                            Hv: {
                                terminal: '',
                                testedVoltage: ''
                            },
                            assessment: ''
                        }
                    ]
                }
            }
        }
    },
    computed: {
        dataTest() {
            return this.data
        }
    },
    methods: {
        add(array_list) {
            const induc_temp = {
                terminal: '',
                ratedVoltage: '',
                Lv: {
                    terminal: '',
                    testedVoltage: ''
                },
                Hv: {
                    terminal: '',
                    testedVoltage: ''
                },
                assessment: ''
            }
            array_list.push(induc_temp)
        },
        removeAll() {
            this.dataTest.dataList = []
        },
        deleteTest(index) {
            this.dataTest.dataList.splice(index, 1)
        }
    }
}
</script>
<style lang="scss" scoped>
div.el-divider.el-divider--horizontal {
    width: 500px !important;
}
</style>
