<template>
    <div id="induced-ac-voltage-tests" style="width: 100%; font-size: 12px;">
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
        
        <table class="w-100 mgt-10 table-strip-input-data" style="width: 100% ; font-size: 12px;">
            <thead>
                <tr>
                    <th colspan="2">Applied terminal</th>
                    <th colspan="4">Test voltage</th>
                    <th rowspan="3" class="assessment-col">Assessment</th>
                    <th rowspan="3" class="condition-indicator-col">Condition indicator</th>
                    <th rowspan="3" @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th rowspan="3" @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
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
                        <el-input :class="nameColor(item.condition_indicator)" id="condition" type="text" size="mini" v-model="item.condition_indicator">
                        </el-input>
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
    name: 'InducedAcVoltageTests',
    data() {
        return {
        }
    },
    props: {
        data: {
            type: Object,
            required: true,
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
                            assessment: '',
                            condition_indicator: ''
                        }
                    ]
                }
            }
        },
        asset: {
            type: Object,
            required: false,
            default: () => ({})
        }
    },
    computed: {
        dataTest() {
            return this.data
        },
        assetData() {
            return this.asset
        },
    },
    methods: {
        add() {
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
                assessment: '',
                condition_indicator: ''
            }
            this.dataTest.dataList.push(induc_temp)
        },
        removeAll() {
            this.$confirm('This will delete all items. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                })
                .then( () => {
                    this.dataTest.dataList = []
                })
                .catch( () => {
                    // User cancelled, do nothing
                })
        },
        deleteTest(index) {
            this.dataTest.dataList.splice(index, 1)
        },
        addTest(index) {
            const data = {
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
                assessment: '',
                condition_indicator: ''
            }
            this.dataTest.dataList.splice(index+1, 0, data)
        },
        nameColor(data) {
            if(data === this.$constant.GOOD) {
                return 'Good'
            }
            else if(data === this.$constant.FAIR) {
                return 'Fair'
            }
            else if(data === this.$constant.POOR) {
                return 'Poor'
            }
            else if(data === this.$constant.BAD) {
                return 'Bad'
            }
            else {
                return;
            }
        }
    }
}
</script>
<style lang="scss" scoped>
div.el-divider.el-divider--horizontal {
    width: 500px !important;
}

table, th, td, tr {
    white-space: nowrap;
}
.flex-container {
    display: flex;
    flex-direction: column;

    div {
        padding: 1px;
    }
}
.Good input {
    background: #00CC00;
}

.Fair input {
    background: #ffff00;
}

.Poor input {
    background: #ff9900;
}

.Bad input {
    background: #ff3300;
}

td, th {
    font-size: 12px;
}
</style>
