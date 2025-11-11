<template>
    <div id="dc-winding-resistance-prim">

        <!-- Cấu hình -->
        <div style="position: sticky; left: 0; display: inline-block;">
        <el-row class="mgb-10">
            <el-col>
                <el-button class="btn-action" size="mini" type="success" @click="openAssessmentDialog = true">
                    <i class="fa-solid fa-screwdriver-wrench"></i> Assessment settings
                </el-button>
                <el-button class="btn-action" size="mini" type="success" @click="openConditionIndicatorDialog = true">
                    <i class="fa-solid fa-hammer"></i> Condition indicatior settings
                </el-button>
            </el-col>
        </el-row>

        <!-- Tương tác với bảng -->
        <el-row class="mgb-10">
            <el-col>
                <el-button size="mini" type="primary" class="btn-action" @click="calculator" > <i class="fas fa-circle-play"></i> Assess results </el-button>
                <el-button size="mini" type="primary" class="btn-action" @click="clear"> <i class="fas fa-xmark"></i> Clear all</el-button>
            </el-col>
        </el-row>
        </div>

        <table class="table-strip-input-data" style="width: 80%">
            <thead class="test">
                <tr>
                    <th>Phase</th>
                    <th>Trip coil</th>
                    <th>Interrupter</th>
                    <th>Opening time (ms)</th>
                    <th>Opening sync. (ms) </th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <template v-for="(item, index) in testData.table">
                    <tr :key="index">
                        <td>
                            <div style="display: flex;width: 100%;">   
                                <el-input size="mini" type="text" v-model="item.phase"></el-input>
                                <div :class="{colorTableRed : index%3==0, colorTableYellow : index%3==1, colorTableBlue : index%3==2}"></div>
                            </div>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.tripCoil"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.interrupter"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.openingTime"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.openingSync"></el-input>
                        </td>
                        <td>
                            <el-select class="assessment" size="mini" v-model="item.assessment">
                                <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                                <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                            </el-select>
                            <span v-if="item.assessment === 'Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                            <span v-else-if="item.assessment === 'Fail'" class="fa-solid fa-xmark fail icon-status"></span>
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
                </template>
            </tbody>
        </table>

        <!-- Assessment settings -->
        <el-dialog class="dialog_assess" title="Assessment settings" :visible.sync="openAssessmentDialog" width="75%">
            <el-radio-group v-model="testData.limits" style="margin-bottom: 20px">
                <el-radio label="Absolute" value="Absolute"></el-radio>
                <el-radio label="Relative" value="Relative"></el-radio>
            </el-radio-group>

            <!-- opening_times -->
            <transition>
                <table class="table-strip-input-data" v-if="testData.limits === 'Absolute'">
                    <thead>
                        <tr>
                            <th></th>
                            <th>t min</th>
                            <th>t max</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in opening_times" :key="index">
                            <td>{{ item }}</td>
                            <td>
                                <el-input size="mini" v-model="asset_.openTime.abs[index].tmin">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="asset_.openTime.abs[index].tmax">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table class="table-strip-input-data" v-if="testData.limits === 'Relative'">
                    <thead>
                        <tr>
                            <th></th>
                            <th>t ref</th>
                            <th>- t dev</th>
                            <th>+ t dev</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in opening_times" :key="index">
                            <td>{{ item }}</td>
                            <td>
                                <el-input size="mini" v-model="asset_.openTime.rel[index].rref">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="asset_.openTime.rel[index].tdevZ">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="asset_.openTime.rel[index].tdevN">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </transition>

            <!-- Auxiliary_contact -->
            <transition>
                <table class="table-strip-input-data" v-if="testData.limits === 'Absolute'">
                    <thead>
                        <tr>
                            <th></th>
                            <th>t min</th>
                            <th>t max</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in Auxiliary_contact" :key="index">
                            <td>
                                {{ item }}
                                <sub v-if="index === 0">switch,a</sub>
                                <sub v-if="index === 1">a</sub>
                                <sub v-if="index === 2">switch,b</sub>
                                <sub v-if="index === 3">b</sub>
                                <sub v-if="index === 4">switch,w</sub>
                                <sub v-if="index === 5">w</sub>
                            </td>
                            <td>
                                <el-input size="mini" v-model="asset_.auxContact.abs.trip[index].tmin">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="asset_.auxContact.abs.trip[index].tmax">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table class="table-strip-input-data" v-if="testData.limits === 'Relative'">
                    <thead>
                        <tr>
                            <th></th>
                            <th>t ref</th>
                            <th>t dev</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in Auxiliary_contact" :key="index">
                            <td>
                                {{ item }}
                                <sub v-if="index === 0">switch,a</sub>
                                <sub v-if="index === 1">a</sub>
                                <sub v-if="index === 2">switch,b</sub>
                                <sub v-if="index === 3">b</sub>
                                <sub v-if="index === 4">switch,w</sub>
                                <sub v-if="index === 5">w</sub>
                            </td>
                            <td>
                                <el-input size="mini" v-model="asset_.auxContact.rel.trip[index].tref">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="asset_.auxContact.rel.trip[index].tdef">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </transition>

            <!-- //miscellaneous -->
            <transition>
                <table class="table-strip-input-data" v-if="testData.limits === 'Absolute'">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Minimum</th>
                            <th>Maximum</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in miscellaneous" :key="index">
                            <td>{{ item }}</td>
                            <td>
                                <el-input v-if="index === 1" size="mini" v-model="asset_.miscell.abs[index].min"> </el-input>
                                <el-input v-else size="mini" v-model="asset_.miscell.abs[index].min">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input v-if="index === 1" size="mini" v-model="asset_.miscell.abs[index].max"> </el-input>
                                <el-input v-else size="mini" v-model="asset_.miscell.abs[index].max">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table class="table-strip-input-data" v-if="testData.limits === 'Relative'">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Reference</th>
                            <th>Deviation</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in miscellaneous" :key="index">
                            <td>{{ item }}</td>
                            <td>
                                <el-input v-if="index === 1" size="mini" v-model="asset_.miscell.rel[index].ref"> </el-input>
                                <el-input v-else size="mini" v-model="asset_.miscell.rel[index].ref">
                                    <template v-if="item !== 1" slot="append">ms</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input v-if="index === 1" size="mini" v-model="asset_.miscell.rel[index].dev"> </el-input>
                                <el-input v-else size="mini" v-model="asset_.miscell.rel[index].dev">
                                    <template v-if="item !== 1" slot="append">ms</template>
                                </el-input>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </transition>

            <!-- //coilCharacteristics -->
            <transition>
                <table class="table-strip-input-data" v-if="testData.limits === 'Absolute'">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Minimum</th>
                            <th>Maximum</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in coilCharacteristics" :key="index">
                            <td>{{ item }}</td>
                            <td>
                                <el-input size="mini" v-model="asset_.coilCharacter.abs[index].min">
                                    <template v-if="index <= 3" slot="append">A</template>
                                    <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                    <template v-else slot="append">&#8486;</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="asset_.coilCharacter.abs[index].max">
                                    <template v-if="index <= 3" slot="append">A</template>
                                    <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                    <template v-else slot="append">&#8486;</template>
                                </el-input>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table class="table-strip-input-data" v-if="testData.limits === 'Relative'">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Reference</th>
                            <th>- Deviation</th>
                            <th>+ Deviation</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in coilCharacteristics" :key="index">
                            <td>{{ item }}</td>
                            <el-input size="mini" v-model="asset_.coilCharacter.rel[index].ref">
                                <template v-if="index <= 3" slot="append">A</template>
                                <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                <template v-else slot="append">&#8486;</template>
                            </el-input>
                            <td>
                                <el-input size="mini" v-model="asset_.coilCharacter.rel[index].devZ">
                                    <template v-if="index <= 3" slot="append">A</template>
                                    <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                    <template v-else slot="append">&#8486;</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="asset_.coilCharacter.rel[index].devN">
                                    <template v-if="index <= 3" slot="append">A</template>
                                    <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                    <template v-else slot="append">&#8486;</template>
                                </el-input>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </transition>
            <br />
            <template #footer>
                <span style="margin-top: 20px; width: 100%; position: absolute; right: 10px; bottom: 10px" class="dialog-footer">
                    <el-button @click="resetAssessment">Cancel</el-button>
                    <el-button type="primary" @click="updateAssessment"> Confirm </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name :"ococoTiming",
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            asset_: {},
            opening_times: [
                'Opening time',
                'Opening sync. (contacts within a phase)',
                'Opening sync. (between breaker phases)',
                'Closing time',
                'Closing sync. (contacts within a phase)',
                'Closing sync. (between breaker phases)',
                'Reclosing time',
                'Open-Close time',
                'Close-Open time'
            ],
            Auxiliary_contact: [
                'Switching time (a-type),t',
                'diff. to main (a-type),Δt',
                'Switching time (b-type),t',
                'diff. to main (b-type),Δt',
                'Switching time (wiper),t',
                'Duration (wiper),Δt '
            ],
            miscellaneous: ['Bounce time', 'Bounce count', 'PIR close time', 'Reaction time'],
            coilCharacteristics: [
                'Peak close coil current',
                'Peak trip coil current',
                'Average close coil current',
                'Average trip coil current',
                'Average close coil voltage',
                'Average trip coil voltage',
                'Close coil resistance',
                'Trip coil resistance'
            ]
        }
    },
    props: {
        data: {
            type: Object,
            require: true
        },
        asset: {
            type: Object,
            require: true
        }
    },
    computed: {
        testData() {
            return this.data
        },
        assetData() {
            return {
                circuitBreaker: JSON.parse(this.asset.circuitBreaker),
                operating: JSON.parse(this.asset.operating)
            }
        },
        assessLimitsData() {
            return JSON.parse(this.asset.assessmentLimits)
        }
    },
    watch: {
        assessLimitsData: {
            deep: true,
            immediate: true,
            handler: function (newVal) {
                this.asset_ = newVal
            }
        }
    },
    methods: {
        resetAssessment() {
            this.asset_ = JSON.parse(this.asset.assessmentLimits)
            this.openAssessmentDialog = false
        },
        async updateAssessment() {
            const asset = {
                id: this.asset.id,
                assessmentLimits: this.asset_
            }
            const data = await window.electronAPI.updateCircuitAssessmentLimits(asset)
            if (data.success) {
                this.$message.success('Update successfully')
                this.openAssessmentDialog = false
            } else {
                this.$message.error('Update cannot complete')
                this.openAssessmentDialog = false
            }
        },
        add() {
            this.testData.table.push({
                phase : "",
                tripCoil : "",
                interrupter : '',
                openingTime : '',
                openingSync : '',
                assessment : '',
                condition_indicator : ''
            })
        },
        removeAll() {
            this.$confirm('This will delete the file. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                })
                .then( () => {
                    this.testData.table = []
                })
                .catch( () => {
                    // User cancelled, do nothing
                })
        },
        deleteTest(index) {
            this.testData.table.splice(index, 1)
        },
        addTest(index) {
            const data = {
                phase : "",
                tripCoil : "",
                interrupter : '',
                openingTime : '',
                openingSync : '',
                assessment : '',
                condition_indicator : ''
            }
            this.testData.table.splice(index+1, 0, data)
        },
        calculator() {
            this.$message.success('Calculating successfully')
        },

        clear() {
            this.testData.table.forEach((element) => {
                element.phase = "",
                element.tripCoil = "",
                element.interrupter = '',
                element.openingTime = '',
                element.openingSync = '',
                element.assessment = '',
                element.condition_indicator = ''
            })
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
.test {
    th:not(:nth-child(1)) {
        white-space: nowrap;
    }
    th:nth-child(1) {
        min-width: 50px;
    }
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
</style>
