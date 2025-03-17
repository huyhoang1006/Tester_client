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
                <el-button size="mini" type="primary" class="btn-action" @click="calculator"> <i class="fas fa-circle-play"></i> Assess results </el-button>
                <el-button size="mini" type="primary" class="btn-action" @click="clear"> <i class="fas fa-xmark"></i> Clear all</el-button>
            </el-col>
        </el-row>
        </div>

        <div v-if="assetData.circuitBreaker.numberOfInterruptPhase === 1">
            <div v-for="items in testData.table.length" :key="items" style="margin-top: 2%">
                <div style="font-weight: bold">Trip coil no. {{ items }}</div>
                <br />
                <table class="table-strip-input-data" style="width: 85%">
                    <thead>
                        <th>Phase</th>
                        <th>Opening (ms)</th>
                        <th>Opening sync. between phase (ms)</th>
                        <th class="assessment-col">Assessment</th>
                        <th class="condition-indicator-col">condition indicator</th>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in testData.table[items - 1]" :key="index">
                            <td>
                                <div style="display: flex; width: 100%;">
                                    <el-input size="mini" v-model="item.phase"></el-input>
                                    <div :class="{colorTableRed : item.phase=='A', colorTableYellow : item.phase=='B', colorTableBlue : item.phase=='C'}"></div>
                                </div>
                                
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.openingTime"></el-input>
                            </td>
                            <td
                                v-if="index % (assetData.circuitBreaker.numberOfInterruptPhase * assetData.circuitBreaker.numberOfPhase) === 0"
                                :rowspan="assetData.circuitBreaker.numberOfInterruptPhase * assetData.circuitBreaker.numberOfPhase">
                                <el-input
                                    :rows="assetData.circuitBreaker.numberOfInterruptPhase * assetData.circuitBreaker.numberOfPhase"
                                    type="textarea"
                                    size="mini"
                                    v-model="item.openingSync"></el-input>
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
                                <el-input size="mini" v-model="item.condition_indicator"></el-input>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="assetData.circuitBreaker.numberOfInterruptPhase > 1">
            <div v-for="items in testData.table.length" :key="items" style="margin-top: 2%">
                <div style="font-weight: bold">Trip coil no. {{ items }}</div>
                <br />
                <table class="table-strip-input-data" style="width: 85%">
                    <thead class="test">
                        <th>Phase</th>
                        <th>Interrupter no.</th>
                        <th>Opening time (ms)</th>
                        <th>Opening sync. between phase (ms)</th>
                        <th>Opening sync. between Interrupter (ms)</th>
                        <th class="assessment-col">Assessment</th>
                        <th class="condition-indicator-col">condition indicator</th>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in testData.table[items - 1]" :key="index">
                            <td v-if="index % assetData.circuitBreaker.numberOfInterruptPhase === 0" :rowspan="assetData.circuitBreaker.numberOfInterruptPhase">
                                <div style="display: flex; width: 100%;">
                                   <el-input size="mini" v-model="item.phase"></el-input>  
                                   <div :class="{colorTableRed : item.phase=='A', colorTableYellow : item.phase=='B', colorTableBlue : item.phase=='C'}"></div>
                                </div>
                               
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.interruptNo"></el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.openingTime"></el-input>
                            </td>
                            <td v-if="index % assetData.circuitBreaker.numberOfInterruptPhase === 0" :rowspan="assetData.circuitBreaker.numberOfInterruptPhase">
                                <el-input :rows="assetData.circuitBreaker.numberOfInterruptPhase" type="textarea" v-model="item.openingSync"></el-input>
                            </td>
                            <td
                                v-if="index % (assetData.circuitBreaker.numberOfInterruptPhase * assetData.circuitBreaker.numberOfPhase) === 0"
                                :rowspan="assetData.circuitBreaker.numberOfInterruptPhase * assetData.circuitBreaker.numberOfPhase">
                                <el-input
                                    :rows="assetData.circuitBreaker.numberOfInterruptPhase * assetData.circuitBreaker.numberOfPhase"
                                    type="textarea"
                                    v-model="item.openingInterrupt"></el-input>
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
                                <el-input size="mini" v-model="item.condition_indicator"></el-input>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

       
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
    name :"oTiming",
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            asset_: {},
            back_asset : {},
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
    beforeMount(){
        const asset = {
            id : this.asset.id,
            assessmentLimits : this.asset_
        }
        const dataTemp = JSON.parse(JSON.stringify(asset))
        this.back_asset = dataTemp.assessmentLimits
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
            this.asset_ = this.back_asset
            this.openAssessmentDialog = false
        },
        async updateAssessment() {
            const asset = {
                id: this.asset.id,
                assessmentLimits: this.asset_
            }
            const data = await window.electronAPI.updateCircuitAssessmentLimits(asset)
            const dataTemp = JSON.parse(JSON.stringify(asset))
            this.back_asset = dataTemp.assessmentLimits
            if (data.success) {
                this.$message.success('Update successfully')
                this.openAssessmentDialog = false
            } else {
                this.$message.error('Update cannot complete')
                this.openAssessmentDialog = false
            }
        },
        calculator() {
            /* eslint-disable */
            const circuitBreaker_ = JSON.parse(this.$store.state.selectedAsset[0].circuitBreaker)
            console.log(circuitBreaker_)
            this.testData.table.forEach((element, i) => {
                if (this.testData.limits === 'Absolute'){
                    element.forEach((e, index) => {
                        //Opening Sync la [2]
                        if(index%(circuitBreaker_.numberOfInterruptPhase * circuitBreaker_.numberOfPhase)==0) {
                            if (parseFloat(e.openingSync) < parseFloat(this.asset_.openTime.abs[2].tmin) || parseFloat(e.openingSync) > parseFloat(this.asset_.openTime.abs[2].tmax)){
                                for(let j=0; j<circuitBreaker_.numberOfInterruptPhase*circuitBreaker_.numberOfPhase; j++) {
                                    this.testData.table[i][index+j].assessment= 'Fail'
                                    console.log('Opening Sync Fail')
                                }
                            }
                            else {
                                for(let j=0; j<circuitBreaker_.numberOfInterruptPhase*circuitBreaker_.numberOfPhase; j++) {
                                    console.log(this.testData.table[i][index+j].assessment= '1')
                                    console.log('Passed Opening Sync')
                                }
                            }
                        }
                        //Opening Interrupt la [1]
                        if(e.assessment !== 'Fail'){
                            if(index%(circuitBreaker_.numberOfInterruptPhase)==0){
                                if(parseFloat(e.openingInterrupt) < parseFloat(this.asset_.openTime.abs[1].tmin) || parseFloat(e.openingInterrupt) > parseFloat(this.asset_.openTime.abs[1].tmax)){
                                    for (let j=0; i<circuitBreaker_.numberOfInterruptPhase; j++){
                                        this.testData.table[i][index+j].assessment = 'Fail'
                                    }
                                }
                            }
                            //Opening Time [0]
                            if(e.assessment !== 'Fail'){
                                if (parseFloat(e.openingTime) < parseFloat(this.asset_.openTime.abs[0].tmin) || parseFloat(e.openingTime) > parseFloat(this.asset_.openTime.abs[0].tmax)){
                                    e.assessment = 'Fail'
                                }
                                else e.assessment = 'Pass'
                            }
                        }
                    })
                }
                else if (this.testData.limits === 'Relative'){
                    element.forEach((e, index) => {
                        //Opening Sync la [2]
                        if(index%(circuitBreaker_.numberOfInterruptPhase * circuitBreaker_.numberOfPhase)==0) {
                            if (parseFloat(e.openingSync) < parseFloat(this.asset_.openTime.rel[2].rref)){
                                if (parseFloat(e.openingSync) < (parseFloat(this.asset_.openTime.rel[2].rref) - parseFloat(this.asset_.openTime.rel[2].tdevZ)))
                                {
                                    for(let j=0; j<circuitBreaker_.numberOfInterruptPhase*circuitBreaker_.numberOfPhase; j++) {
                                    this.testData.table[i][index+j].assessment= 'Fail'
                                    console.log('Failed')
                                    }
                                }
                                else {
                                for(let j=0; j<circuitBreaker_.numberOfInterruptPhase*circuitBreaker_.numberOfPhase; j++) {
                                    console.log(this.testData.table[i][index+j].assessment= '1')
                                    }
                                }
                                console.log('Co if <')
                            }
                            else if (parseFloat(e.openingSync) >= parseFloat(this.asset_.openTime.rel[2].rref)){
                                if (parseFloat(e.openingSync) > (parseFloat(this.asset_.openTime.rel[2].rref) + parseFloat(this.asset_.openTime.rel[2].tdevN)))
                                {
                                    for(let j=0; j<circuitBreaker_.numberOfInterruptPhase*circuitBreaker_.numberOfPhase; j++) {
                                    this.testData.table[i][index+j].assessment= 'Fail'
                                    }
                                }
                                else {
                                for(let j=0; j<circuitBreaker_.numberOfInterruptPhase*circuitBreaker_.numberOfPhase; j++) {
                                    this.testData.table[i][index+j].assessment= '1'
                                    }
                                }
                                console.log('co if >=')
                            }
                        }
                        //Opening Interrupt la [1]
                        if(e.assessment !== 'Fail'){
                            if(index%(circuitBreaker_.numberOfInterruptPhase)==0){
                                if (parseFloat(e.openingInterrupt) < parseFloat(this.asset_.openTime.rel[1].rref)){
                                    if (parseFloat(e.openingInterrupt) < (parseFloat(this.asset_.openTime.rel[1].rref) - parseFloat(this.asset_.openTime.rel[1].tdevZ)))
                                    {
                                        for(let j=0; j<circuitBreaker_.numberOfInterruptPhase; j++) {
                                        this.testData.table[i][index+j].assessment= 'Fail'
                                        }
                                    }
                                }
                                else if (parseFloat(e.closingInterrupt) >= parseFloat(this.asset_.openTime.rel[1].rref)){
                                    if (parseFloat(e.closingInterrupt) > (parseFloat(this.asset_.openTime.rel[1].rref) + parseFloat(this.asset_.openTime.rel[1].tdevN)))
                                    {
                                        for(let j=0; j<circuitBreaker_.numberOfInterruptPhase; j++) {
                                        this.testData.table[i][index+j].assessment= 'Fail'
                                        }
                                    }
                                }
                            }
                            // Open Time [0]
                            if(e.assessment !== 'Fail'){
                                if (parseFloat(e.openingTime) < parseFloat(this.asset_.openTime.rel[0].rref)){
                                    if(parseFloat(e.openingTime) < (parseFloat(this.asset_.openTime.rel[0].rref) - parseFloat(this.asset_.openTime.rel[0].tdevZ)))
                                    {
                                        e.assessment = 'Fail'
                                    }
                                    else e.assessment = 'Pass'
                                }
                                else if(parseFloat(e.openingTime) >= parseFloat(this.asset_.openTime.rel[0].rref)){
                                    if (parseFloat(e.openingTime) > (parseFloat(this.asset_.openTime.rel[0].rref) + parseFloat(this.asset_.openTime.rel[0].tdevN)))
                                    {
                                        e.assessment = 'Fail'
                                    }
                                    else e.assessment = 'Pass'
                                }
                            }
                        }
                    })
                }
            })
        },

        clear() {
            this.testData.table.forEach((element) => {
                element.forEach((ele) => {
                    Object.keys(ele).forEach((key) => {
                        ele[key] = ''
                    })
                })
            })
        },
        nameColor(data) {
            if (data === this.$constant.GOOD) {
                return 'Good'
            } else if (data === this.$constant.FAIR) {
                return 'Fair'
            } else if (data === this.$constant.POOR) {
                return 'Poor'
            } else if (data === this.$constant.BAD) {
                return 'Bad'
            } else {
                return
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
