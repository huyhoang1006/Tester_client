<template>
    <div id="dc-winding-resistance-prim">
        <!-- Debug info - Set to false to hide -->
        <div v-if="false" style="background: #f0f0f0; padding: 10px; margin-bottom: 10px; font-size: 11px;">
            <div>testData.table.length: {{ testData && testData.table ? testData.table.length : 'N/A' }}</div>
            <div>numberTripCoil (raw): {{ assetData && assetData.operating ? (assetData.operating.numberTripCoil || assetData.operating.number_of_trip_coil) : 'N/A' }}</div>
            <div>numberOfTripCoils (computed): {{ numberOfTripCoils }}</div>
            <div>Should show {{ testData && testData.table ? testData.table.length : 0 }} table(s)</div>
            <div>Show "Trip coil no."? {{ testData && testData.table && testData.table.length > 1 ? 'YES' : 'NO' }}</div>
            <div>Table needs resize? {{ testData && testData.table && testData.table.length !== numberOfTripCoils ? 'YES - Click "Clear all" to reinitialize' : 'NO' }}</div>
        </div>

        <!-- Warning if asset configuration is incomplete -->
        <el-alert
            v-if="assetData && assetData.circuitBreaker && (!assetData.circuitBreaker.numberOfPhases || !assetData.circuitBreaker.interruptersPerPhase)"
            title="Asset Configuration Incomplete"
            type="warning"
            :closable="false"
            show-icon
            style="margin-bottom: 10px;">
            <div>Please configure the Circuit Breaker asset with the following information:</div>
            <ul style="margin: 5px 0; padding-left: 20px;">
                <li v-if="!assetData.circuitBreaker.numberOfPhases || assetData.circuitBreaker.numberOfPhases === ''">Number of Phases (currently using default: {{ getNumberOfPhases() }})</li>
                <li v-if="!assetData.circuitBreaker.interruptersPerPhase || assetData.circuitBreaker.interruptersPerPhase === ''">Interrupters Per Phase (currently using default: {{ getInterruptersPerPhase() }})</li>
            </ul>
            <div style="margin-top: 5px; font-size: 11px; color: #666;">Go to Asset View → Circuit Breaker Configuration to set these values.</div>
        </el-alert>

        <!-- Cấu hình -->
        <div style="position: sticky; left: 0; display: inline-block;">
            <el-row class="mgb-10">
                <el-col>
                    <el-button class="btn-action" size="mini" type="success" @click="openAssessmentDialog = true">
                        <i class="fa-solid fa-screwdriver-wrench"></i> Assessment settings
                    </el-button>
                    <el-button class="btn-action" size="mini" type="success"
                        @click="openConditionIndicatorDialog = true">
                        <i class="fa-solid fa-hammer"></i> Condition indicatior settings
                    </el-button>
                </el-col>
            </el-row>

            <!-- Tương tác với bảng -->
            <el-row class="mgb-10">
                <el-col>
                    <el-button size="mini" type="primary" class="btn-action" @click="calculator"> <i
                            class="fas fa-circle-play"></i> Assess results </el-button>
                    <el-button size="mini" type="primary" class="btn-action" @click="clear"> <i
                            class="fas fa-xmark"></i> Clear all</el-button>
                </el-col>
            </el-row>
        </div>

        <div
            v-if="testData && testData.table && Object.keys(testData.table).length > 0 && getInterruptersPerPhase() === 1">
            <div v-for="(tableData, tableKey) in testData.table" :key="tableKey" style="margin-top: 2%">
                <div v-if="Object.keys(testData.table).length > 1" style="font-weight: bold ;font-size: 12px;">Trip coil no. {{ tableKey.replace('table', '') }}</div>
                <br v-if="Object.keys(testData.table).length > 1" />
                <table v-if="tableData && Array.isArray(tableData)" class="table-strip-input-data" style="width: 100%; font-size: 12px;">
                    <thead>
                        <th>Phase</th>
                        <th>Opening time (ms)</th>
                        <th>Opening sync. between phase (ms)</th>
                        <th class="assessment-col">Assessment</th>
                        <th class="condition-indicator-col">Condition indicator</th>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in tableData" :key="index">
                            <td>
                                <div style="display: flex; width: 100%;">
                                    <el-input size="mini" v-model="item.phase.value"></el-input>
                                    <div
                                        :class="{ colorTableRed: item.phase.value == 'A', colorTableYellow: item.phase.value == 'B', colorTableBlue: item.phase.value == 'C' }">
                                    </div>
                                </div>
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.opening_time.value"></el-input>
                            </td>
                            <td v-if="index % (getInterruptersPerPhase() * getNumberOfPhases()) === 0"
                                :rowspan="getInterruptersPerPhase() * getNumberOfPhases()">
                                <el-input
                                    :rows="getInterruptersPerPhase() * getNumberOfPhases()"
                                    type="textarea" size="mini"
                                    v-model="item.opening_sync_between_phase.value"></el-input>
                            </td>
                            <td>
                                <el-select class="assessment" size="mini" v-model="item.assessment.value">
                                    <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i>
                                        Pass</el-option>
                                    <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                                </el-select>
                                <span v-if="item.assessment.value === 'Pass'"
                                    class="fa-solid fa-square-check pass icon-status"></span>
                                <span v-else-if="item.assessment.value === 'Fail'"
                                    class="fa-solid fa-xmark fail icon-status"></span>
                            </td>
                            <td>
                                <el-select :class="nameColor(item.condition_indicator.value)" size="mini"
                                    v-model="item.condition_indicator.value">
                                    <el-option value="Good">Good</el-option>
                                    <el-option value="Fair">Fair</el-option>
                                    <el-option value="Poor">Poor</el-option>
                                    <el-option value="Bad">Bad</el-option>
                                </el-select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="testData && testData.table && Object.keys(testData.table).length > 0 && getInterruptersPerPhase() > 1">
            <div v-for="(tableData, tableKey) in testData.table" :key="tableKey" style="margin-top: 2%">
                <div v-if="Object.keys(testData.table).length > 1" style="font-weight: bold ;font-size: 12px;">Trip coil no. {{ tableKey.replace('table', '') }}</div>
                <br v-if="Object.keys(testData.table).length > 1" />
                <table v-if="tableData && Array.isArray(tableData)" class="table-strip-input-data" style="width: 100%; font-size: 12px;">
                    <thead class="test">
                        <th>Phase</th>
                        <th>Interrupter no.</th>
                        <th>Opening time (ms)</th>
                        <th>Opening sync. between phase (ms)</th>
                        <th>Opening sync. between Interrupter (ms)</th>
                        <th class="assessment-col">Assessment</th>
                        <th class="condition-indicator-col">Condition indicator</th>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in tableData" :key="index">
                            <td v-if="index % getInterruptersPerPhase() === 0"
                                :rowspan="getInterruptersPerPhase()">
                                <div style="display: flex; width: 100%;">
                                    <el-input size="mini" v-model="item.phase.value"></el-input>
                                    <div
                                        :class="{ colorTableRed: item.phase.value == 'A', colorTableYellow: item.phase.value == 'B', colorTableBlue: item.phase.value == 'C' }">
                                    </div>
                                </div>

                            </td>
                            <td>
                                <el-input size="mini" v-model="item.interrupter.value"></el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.opening_time.value"></el-input>
                            </td>
                            <td v-if="index % getInterruptersPerPhase() === 0"
                                :rowspan="getInterruptersPerPhase()">
                                <el-input :rows="getInterruptersPerPhase()" type="textarea"
                                    v-model="item.opening_sync_between_phase.value"></el-input>
                            </td>
                            <td v-if="index % (getInterruptersPerPhase() * getNumberOfPhases()) === 0"
                                :rowspan="getInterruptersPerPhase() * getNumberOfPhases()">
                                <el-input
                                    :rows="getInterruptersPerPhase() * getNumberOfPhases()"
                                    type="textarea" v-model="item.opening_sync_between_interrupter.value"></el-input>
                            </td>
                            <td>
                                <el-select class="assessment" size="mini" v-model="item.assessment.value">
                                    <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i>
                                        Pass</el-option>
                                    <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                                </el-select>
                                <span v-if="item.assessment.value === 'Pass'"
                                    class="fa-solid fa-square-check pass icon-status"></span>
                                <span v-else-if="item.assessment.value === 'Fail'"
                                    class="fa-solid fa-xmark fail icon-status"></span>
                            </td>
                            <td>
                                <el-select :class="nameColor(item.condition_indicator.value)" size="mini"
                                    v-model="item.condition_indicator.value">
                                    <el-option value="Good">Good</el-option>
                                    <el-option value="Fair">Fair</el-option>
                                    <el-option value="Poor">Poor</el-option>
                                    <el-option value="Bad">Bad</el-option>
                                </el-select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Assessment settings -->
        <el-dialog append-to-body class="dialog_assess" title="Assessment settings" :visible.sync="openAssessmentDialog"
            width="75%">
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
                                <el-input v-if="index === 1" size="mini" v-model="asset_.miscell.abs[index].min">
                                </el-input>
                                <el-input v-else size="mini" v-model="asset_.miscell.abs[index].min">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input v-if="index === 1" size="mini" v-model="asset_.miscell.abs[index].max">
                                </el-input>
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
                                <el-input v-if="index === 1" size="mini" v-model="asset_.miscell.rel[index].ref">
                                </el-input>
                                <el-input v-else size="mini" v-model="asset_.miscell.rel[index].ref">
                                    <template v-if="item !== 1" slot="append">ms</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input v-if="index === 1" size="mini" v-model="asset_.miscell.rel[index].dev">
                                </el-input>
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
                            <td>
                                <el-input size="mini" v-model="asset_.coilCharacter.rel[index].ref">
                                    <template v-if="index <= 3" slot="append">A</template>
                                    <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                    <template v-else slot="append">&#8486;</template>
                                </el-input>
                            </td>
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
                <span style="margin-top: 20px; width: 100%; position: absolute; right: 10px; bottom: 10px"
                    class="dialog-footer">
                    <el-button @click="resetAssessment">Cancel</el-button>
                    <el-button type="primary" @click="updateAssessment" disabled> Confirm </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: "OTiming",
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            asset_: {
                openTime: {
                    abs: Array(9).fill(null).map(() => ({ tmin: '', tmax: '', mrid: '' })),
                    rel: Array(9).fill(null).map(() => ({ rref: '', tdevZ: '', tdevN: '', mrid: '' }))
                },
                auxContact: {
                    abs: {
                        trip: Array(6).fill(null).map(() => ({ tmin: '', tmax: '', mrid: '' })),
                        close: Array(6).fill(null).map(() => ({ tmin: '', tmax: '', mrid: '' }))
                    },
                    rel: {
                        trip: Array(6).fill(null).map(() => ({ tref: '', tdef: '', mrid: '' })),
                        close: Array(6).fill(null).map(() => ({ tref: '', tdef: '', mrid: '' }))
                    }
                },
                miscell: {
                    abs: Array(4).fill(null).map(() => ({ min: '', max: '', mrid: '' })),
                    rel: Array(4).fill(null).map(() => ({ ref: '', dev: '', mrid: '' }))
                },
                coilCharacter: {
                    abs: Array(8).fill(null).map(() => ({ min: '', max: '', mrid: '' })),
                    rel: Array(8).fill(null).map(() => ({ ref: '', devZ: '', devN: '', mrid: '' }))
                },
                limits: 'Absolute'
            },
            back_asset: {},
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
    beforeMount() {
        // Store backup for reset - will be updated by watcher
        const dataTemp = JSON.parse(JSON.stringify(this.asset_ || {}))
        this.back_asset = dataTemp
    },
    mounted() {
        // Initialize table after component is mounted
        this.$nextTick(() => {
            if (this.testData && (!this.testData.table || Object.keys(this.testData.table).length === 0) && this.assetData && this.assetData.operating) {
                this.initializeTable()
            }
        })
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
            return this.asset
        },
        assessLimitsData() {
            if (!this.asset || !this.asset.assessmentLimits) {
                return {}
            }

            // If it's already an object, return it directly
            if (typeof this.asset.assessmentLimits === 'object') {
                return this.asset.assessmentLimits
            }

            // If it's a string, try to parse it
            if (typeof this.asset.assessmentLimits === 'string') {
                try {
                    return JSON.parse(this.asset.assessmentLimits)
                } catch (error) {
                    console.warn('Error parsing assessmentLimits:', error)
                    return {}
                }
            }

            return {}
        },
        numberOfTripCoils() {
            if (this.assetData && this.assetData.operating) {
                const value = this.assetData.operating.numberTripCoil || 
                             this.assetData.operating.number_of_trip_coil
                const parsed = parseInt(value)
                if (!isNaN(parsed) && parsed > 0) {
                    return parsed
                }
            }
            return 1
        }
    },
    watch: {
        assessLimitsData: {
            deep: true,
            immediate: true,
            handler: function (newVal) {
                if (newVal && Object.keys(newVal).length > 0) {
                    this.asset_ = this.normalizeAssessmentLimits(newVal)
                    // Update backup for reset
                    const dataTemp = JSON.parse(JSON.stringify(this.asset_ || {}))
                    this.back_asset = dataTemp
                    // Sync limits to testData
                    if (this.asset_.limits && this.testData) {
                        this.$set(this.testData, 'limits', this.asset_.limits)
                    }
                }
            }
        },
        'asset_.limits': {
            immediate: true,
            handler: function (newVal) {
                // Sync asset_.limits to testData.limits
                if (newVal && this.testData) {
                    this.$set(this.testData, 'limits', newVal)
                }
            }
        },
        openAssessmentDialog: {
            handler: function (newVal) {
                // When opening dialog, sync limits from asset_ to testData
                if (newVal && this.asset_ && this.asset_.limits && this.testData) {
                    this.$set(this.testData, 'limits', this.asset_.limits)
                }
            }
        },
        assetData: {
            immediate: true,
            deep: true,
            handler: function () {
                // Initialize table if empty when assetData is available
                if (this.testData && (!this.testData.table || Object.keys(this.testData.table).length === 0) && this.assetData && this.assetData.operating) {
                    this.$nextTick(() => {
                        this.initializeTable()
                    })
                }
            }
        },
        'testData.table': {
            immediate: true,
            handler: function (newVal) {
                // Convert array to object if needed (for backward compatibility)
                if (newVal && Array.isArray(newVal) && newVal.length > 0) {
                    console.log('Converting table from array to object structure')
                    const tableObject = {}
                    newVal.forEach((tableData, index) => {
                        tableObject[`table${index + 1}`] = tableData
                    })
                    this.$set(this.testData, 'table', tableObject)
                    return
                }
                
                // Initialize table if empty
                if ((!newVal || Object.keys(newVal).length === 0) && this.assetData && this.assetData.operating) {
                    this.$nextTick(() => {
                        this.initializeTable()
                    })
                }
            }
        },
        numberOfTripCoils: {
            immediate: true,
            handler: function (newVal) {
                // Re-initialize table when number of trip coils changes
                if (this.testData && this.testData.table) {
                    // Check if table needs to be resized
                    if (Object.keys(this.testData.table).length !== newVal) {
                        console.log(`Auto-resizing table from ${Object.keys(this.testData.table).length} to ${newVal} trip coils`)
                        // Clear and re-initialize
                        this.$set(this.testData, 'table', {})
                        this.$nextTick(() => {
                            this.initializeTable()
                        })
                    }
                }
            }
        }
    },
    methods: {
        getInterruptersPerPhase() {
            if (this.assetData && this.assetData.circuitBreaker) {
                const value = this.assetData.circuitBreaker.interruptersPerPhase || 
                             this.assetData.circuitBreaker.numberOfInterruptPhase || 
                             this.assetData.circuitBreaker.number_of_interrupt_phase
                // Parse to number and check if valid
                const parsed = parseInt(value)
                if (!isNaN(parsed) && parsed > 0) {
                    return parsed
                }
            }
            // Default to 1 if not set or invalid
            return 1
        },
        getNumberOfPhases() {
            if (this.assetData && this.assetData.circuitBreaker) {
                const value = this.assetData.circuitBreaker.numberOfPhases || 
                             this.assetData.circuitBreaker.numberOfPhase || 
                             this.assetData.circuitBreaker.number_of_phases
                // Parse to number and check if valid
                const parsed = parseInt(value)
                if (!isNaN(parsed) && parsed > 0) {
                    return parsed
                }
            }
            // Default to 3 if not set or invalid
            return 3
        },
        normalizeAssessmentLimits(data) {
            if (!data || typeof data !== 'object') {
                data = {}
            }

            let normalized = {}
            try {
                normalized = JSON.parse(JSON.stringify(data))
            } catch (e) {
                normalized = {}
            }

            // Always initialize openTime structure
            if (!normalized.openTime) {
                normalized.openTime = {
                    abs: Array(9).fill(null).map(() => ({ tmin: '', tmax: '', mrid: '' })),
                    rel: Array(9).fill(null).map(() => ({ rref: '', tdevZ: '', tdevN: '', mrid: '' }))
                }
            }

            // Helper function to extract value safely
            const getValue = (obj) => {
                if (!obj) return ''
                if (typeof obj === 'string' || typeof obj === 'number') return String(obj)
                if (typeof obj === 'object' && obj.value !== undefined) return String(obj.value || '')
                return ''
            }

            // Normalize from operating_time structure if exists
            if (data.operating_time) {
                const operatingTime = data.operating_time
                const absMapping = [
                    'opening_time', 'opening_sync_within_phase', 'opening_sync_breaker_phase',
                    'closing_time', 'closing_sync_within_phase', 'closing_sync_breaker_phase',
                    'reclosing_time', 'open_close_time', 'close_open_time'
                ]
                const relMapping = [
                    'opening_time', 'opening_sync_within_phase', 'opening_sync_breaker_phase',
                    'closing_time', 'closing_sync_within_phase', 'closing_sync_breaker_phase',
                    'reclosing_time', 'open_close_time', 'close_open_time'
                ]

                if (operatingTime.abs) {
                    absMapping.forEach((key, index) => {
                        const item = operatingTime.abs[key]
                        if (item) {
                            normalized.openTime.abs[index] = {
                                tmin: getValue(item.t_min) || getValue(item.tmin) || '',
                                tmax: getValue(item.t_max) || getValue(item.tmax) || '',
                                mrid: item.mrid || ''
                            }
                        }
                    })
                }

                if (operatingTime.rel) {
                    relMapping.forEach((key, index) => {
                        const item = operatingTime.rel[key]
                        if (item) {
                            normalized.openTime.rel[index] = {
                                rref: getValue(item.t_ref) || getValue(item.rref) || '',
                                tdevZ: getValue(item.minus_t_dev) || getValue(item.tdevZ) || '',
                                tdevN: getValue(item.plus_t_dev) || getValue(item.tdevN) || '',
                                mrid: item.mrid || ''
                            }
                        }
                    })
                }
            }

            // Ensure openTime has proper structure
            if (!normalized.openTime.abs || normalized.openTime.abs.length < 9) {
                normalized.openTime.abs = Array(9).fill(null).map((_, index) =>
                    normalized.openTime.abs && normalized.openTime.abs[index]
                        ? normalized.openTime.abs[index]
                        : { tmin: '', tmax: '', mrid: '' }
                )
            }
            if (!normalized.openTime.rel || normalized.openTime.rel.length < 9) {
                normalized.openTime.rel = Array(9).fill(null).map((_, index) =>
                    normalized.openTime.rel && normalized.openTime.rel[index]
                        ? normalized.openTime.rel[index]
                        : { rref: '', tdevZ: '', tdevN: '', mrid: '' }
                )
            }

            // Normalize auxContact from auxiliary_contacts structure
            if (data.auxiliary_contacts) {
                const auxContacts = data.auxiliary_contacts
                const tripMapping = [
                    'switching_time_type_a',
                    'diff_to_main_type_a',
                    'switching_time_type_b',
                    'diff_to_main_type_b',
                    'switching_time_wiper',
                    'duration'
                ]

                normalized.auxContact = {
                    abs: {
                        trip: Array(6).fill(null).map(() => ({ tmin: '', tmax: '', mrid: '' })),
                        close: Array(6).fill(null).map(() => ({ tmin: '', tmax: '', mrid: '' }))
                    },
                    rel: {
                        trip: Array(6).fill(null).map(() => ({ tref: '', tdef: '', mrid: '' })),
                        close: Array(6).fill(null).map(() => ({ tref: '', tdef: '', mrid: '' }))
                    }
                }

                // Normalize trip_operation.abs
                if (auxContacts.trip_operation && auxContacts.trip_operation.abs) {
                    tripMapping.forEach((key, index) => {
                        const item = auxContacts.trip_operation.abs[key]
                        if (item) {
                            normalized.auxContact.abs.trip[index] = {
                                tmin: getValue(item.t_min) || getValue(item.tmin) || '',
                                tmax: getValue(item.t_max) || getValue(item.tmax) || '',
                                mrid: item.mrid || ''
                            }
                        }
                    })
                }

                // Normalize trip_operation.rel
                if (auxContacts.trip_operation && auxContacts.trip_operation.rel) {
                    tripMapping.forEach((key, index) => {
                        const item = auxContacts.trip_operation.rel[key]
                        if (item) {
                            normalized.auxContact.rel.trip[index] = {
                                tref: getValue(item.t_ref) || getValue(item.tref) || '',
                                tdef: getValue(item.t_dev) || getValue(item.tdef) || '',
                                mrid: item.mrid || ''
                            }
                        }
                    })
                }

                // Normalize close_operation.abs
                if (auxContacts.close_operation && auxContacts.close_operation.abs) {
                    tripMapping.forEach((key, index) => {
                        const item = auxContacts.close_operation.abs[key]
                        if (item) {
                            normalized.auxContact.abs.close[index] = {
                                tmin: getValue(item.t_min) || getValue(item.tmin) || '',
                                tmax: getValue(item.t_max) || getValue(item.tmax) || '',
                                mrid: item.mrid || ''
                            }
                        }
                    })
                }

                // Normalize close_operation.rel
                if (auxContacts.close_operation && auxContacts.close_operation.rel) {
                    tripMapping.forEach((key, index) => {
                        const item = auxContacts.close_operation.rel[key]
                        if (item) {
                            normalized.auxContact.rel.close[index] = {
                                tref: getValue(item.t_ref) || getValue(item.tref) || '',
                                tdef: getValue(item.t_dev) || getValue(item.tdef) || '',
                                mrid: item.mrid || ''
                            }
                        }
                    })
                }
            } else if (data.auxContact) {
                if (!normalized.auxContact) {
                    normalized.auxContact = JSON.parse(JSON.stringify(data.auxContact))
                }
            } else if (!normalized.auxContact) {
                normalized.auxContact = {
                    abs: {
                        trip: Array(6).fill(null).map(() => ({ tmin: '', tmax: '', mrid: '' })),
                        close: Array(6).fill(null).map(() => ({ tmin: '', tmax: '', mrid: '' }))
                    },
                    rel: {
                        trip: Array(6).fill(null).map(() => ({ tref: '', tdef: '', mrid: '' })),
                        close: Array(6).fill(null).map(() => ({ tref: '', tdef: '', mrid: '' }))
                    }
                }
            }

            // Normalize miscell from miscellaneous structure
            if (data.miscellaneous) {
                const misc = data.miscellaneous
                const miscMapping = ['bounce_time', 'bounce_count', 'pir_close_time', 'reaction_time']

                normalized.miscell = {
                    abs: Array(4).fill(null).map(() => ({ min: '', max: '', mrid: '' })),
                    rel: Array(4).fill(null).map(() => ({ ref: '', dev: '', mrid: '' }))
                }

                // Normalize abs
                if (misc.abs) {
                    miscMapping.forEach((key, index) => {
                        const item = misc.abs[key]
                        if (item) {
                            normalized.miscell.abs[index] = {
                                min: getValue(item.min) || '',
                                max: getValue(item.max) || '',
                                mrid: item.mrid || ''
                            }
                        }
                    })
                }

                // Normalize rel
                if (misc.rel) {
                    miscMapping.forEach((key, index) => {
                        const item = misc.rel[key]
                        if (item) {
                            normalized.miscell.rel[index] = {
                                ref: getValue(item.ref) || '',
                                dev: getValue(item.dev) || '',
                                mrid: item.mrid || ''
                            }
                        }
                    })
                }
            } else if (data.miscell) {
                if (!normalized.miscell) {
                    normalized.miscell = JSON.parse(JSON.stringify(data.miscell))
                }
            } else if (!normalized.miscell) {
                normalized.miscell = {
                    abs: Array(4).fill(null).map(() => ({ min: '', max: '', mrid: '' })),
                    rel: Array(4).fill(null).map(() => ({ ref: '', dev: '', mrid: '' }))
                }
            }

            // Normalize coilCharacter from coil_characteristics structure
            if (data.coil_characteristics) {
                const coilChar = data.coil_characteristics
                const coilMapping = [
                    'peak_close_coil_current',
                    'peak_trip_coil_current',
                    'average_close_coil_current',
                    'average_trip_coil_current',
                    'average_close_coil_voltage',
                    'average_trip_coil_voltage',
                    'close_coil_resistance',
                    'trip_coil_resistance'
                ]

                normalized.coilCharacter = {
                    abs: Array(8).fill(null).map(() => ({ min: '', max: '', mrid: '' })),
                    rel: Array(8).fill(null).map(() => ({ ref: '', devZ: '', devN: '', mrid: '' }))
                }

                // Normalize abs
                if (coilChar.abs) {
                    coilMapping.forEach((key, index) => {
                        const item = coilChar.abs[key]
                        if (item) {
                            normalized.coilCharacter.abs[index] = {
                                min: getValue(item.min) || '',
                                max: getValue(item.max) || '',
                                mrid: item.mrid || ''
                            }
                        }
                    })
                }

                // Normalize rel
                if (coilChar.rel) {
                    coilMapping.forEach((key, index) => {
                        const item = coilChar.rel[key]
                        if (item) {
                            normalized.coilCharacter.rel[index] = {
                                ref: getValue(item.ref) || '',
                                devZ: getValue(item.minus_dev) || getValue(item.devZ) || '',
                                devN: getValue(item.plus_dev) || getValue(item.devN) || '',
                                mrid: item.mrid || ''
                            }
                        }
                    })
                }
            } else if (data.coilCharacter) {
                if (!normalized.coilCharacter) {
                    normalized.coilCharacter = JSON.parse(JSON.stringify(data.coilCharacter))
                }
            } else if (!normalized.coilCharacter) {
                normalized.coilCharacter = {
                    abs: Array(8).fill(null).map(() => ({ min: '', max: '', mrid: '' })),
                    rel: Array(8).fill(null).map(() => ({ ref: '', devZ: '', devN: '', mrid: '' }))
                }
            }

            if (!normalized.limits) {
                normalized.limits = data.limits || 'Absolute'
            }

            // Final pass: ensure all values are strings/numbers, not objects
            const ensureStringValue = (obj, key) => {
                if (obj && obj[key] !== undefined) {
                    const val = obj[key]
                    if (typeof val === 'object' && val !== null && val.value !== undefined) {
                        obj[key] = String(val.value || '')
                    } else if (typeof val !== 'string' && typeof val !== 'number') {
                        obj[key] = String(val || '')
                    }
                }
            }

            // Normalize openTime values
            if (normalized.openTime) {
                normalized.openTime.abs.forEach(item => {
                    if (item) {
                        ensureStringValue(item, 'tmin')
                        ensureStringValue(item, 'tmax')
                    }
                })
                normalized.openTime.rel.forEach(item => {
                    if (item) {
                        ensureStringValue(item, 'rref')
                        ensureStringValue(item, 'tdevZ')
                        ensureStringValue(item, 'tdevN')
                    }
                })
            }

            // Normalize auxContact values
            if (normalized.auxContact) {
                if (normalized.auxContact.abs && normalized.auxContact.abs.trip) {
                    normalized.auxContact.abs.trip.forEach(item => {
                        if (item) {
                            ensureStringValue(item, 'tmin')
                            ensureStringValue(item, 'tmax')
                        }
                    })
                }
                if (normalized.auxContact.abs && normalized.auxContact.abs.close) {
                    normalized.auxContact.abs.close.forEach(item => {
                        if (item) {
                            ensureStringValue(item, 'tmin')
                            ensureStringValue(item, 'tmax')
                        }
                    })
                }
                if (normalized.auxContact.rel && normalized.auxContact.rel.trip) {
                    normalized.auxContact.rel.trip.forEach(item => {
                        if (item) {
                            ensureStringValue(item, 'tref')
                            ensureStringValue(item, 'tdef')
                        }
                    })
                }
                if (normalized.auxContact.rel && normalized.auxContact.rel.close) {
                    normalized.auxContact.rel.close.forEach(item => {
                        if (item) {
                            ensureStringValue(item, 'tref')
                            ensureStringValue(item, 'tdef')
                        }
                    })
                }
            }

            // Normalize miscell values
            if (normalized.miscell) {
                normalized.miscell.abs.forEach(item => {
                    if (item) {
                        ensureStringValue(item, 'min')
                        ensureStringValue(item, 'max')
                    }
                })
                normalized.miscell.rel.forEach(item => {
                    if (item) {
                        ensureStringValue(item, 'ref')
                        ensureStringValue(item, 'dev')
                    }
                })
            }

            // Normalize coilCharacter values
            if (normalized.coilCharacter) {
                normalized.coilCharacter.abs.forEach(item => {
                    if (item) {
                        ensureStringValue(item, 'min')
                        ensureStringValue(item, 'max')
                    }
                })
                normalized.coilCharacter.rel.forEach(item => {
                    if (item) {
                        ensureStringValue(item, 'ref')
                        ensureStringValue(item, 'devZ')
                        ensureStringValue(item, 'devN')
                    }
                })
            }

            return normalized
        },
        initializeTable() {
            if (!this.data) return

            // Get numberTripCoil from either camelCase or snake_case
            const numTripCoil = this.assetData?.operating?.numberTripCoil ||
                this.assetData?.operating?.number_of_trip_coil ||
                1
            const numPhase = this.getNumberOfPhases()
            const numInterruptPhase = this.getInterruptersPerPhase()
            const phase = ["A", "B", "C"]

            if (!this.data.table) {
                this.$set(this.data, 'table', {})
            }

            if (Object.keys(this.data.table).length === 0) {
                const newTable = {}
                for (let i = 0; i < numTripCoil; i++) {
                    const tableKey = `table${i + 1}`
                    const tableRow = []
                    for (let phaseIdx = 0; phaseIdx < numPhase; phaseIdx++) {
                        for (let interruptIdx = 0; interruptIdx < numInterruptPhase; interruptIdx++) {
                            tableRow.push({
                                phase: { mrid: '', value: phase[phaseIdx] || '', unit: '', type: 'string' },
                                opening_time: { mrid: '', value: '', unit: 'm|s', type: 'analog' },
                                interrupter: { mrid: '', value: (interruptIdx + 1).toString(), unit: '', type: 'analog' },
                                opening_sync_between_phase: { mrid: '', value: '', unit: 'm|s', type: 'analog' },
                                opening_sync_between_interrupter: { mrid: '', value: '', unit: 'm|s', type: 'analog' },
                                assessment: { mrid: '', value: '', unit: '', type: 'discrete' },
                                condition_indicator: { mrid: '', value: '', unit: '', type: 'discrete' }
                            })
                        }
                    }
                    newTable[tableKey] = tableRow
                }
                this.$set(this.data, 'table', newTable)
            }
        },
        resetAssessment() {
            this.asset_ = JSON.parse(JSON.stringify(this.back_asset))
            // Sync limits back to testData after reset
            if (this.asset_.limits && this.testData) {
                this.$set(this.testData, 'limits', this.asset_.limits)
            }
            this.openAssessmentDialog = false
        },
        async updateAssessment() {
            // Sync testData.limits to asset_.limits before saving
            if (this.testData.limits) {
                this.asset_.limits = this.testData.limits
            }
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
            let circuitBreaker_ = {
                interruptersPerPhase: this.getInterruptersPerPhase(),
                numberOfPhases: this.getNumberOfPhases()
            }
            
            if (this.$store.state.selectedAsset && this.$store.state.selectedAsset[0] && this.$store.state.selectedAsset[0].circuitBreaker) {
                const cb = this.$store.state.selectedAsset[0].circuitBreaker
                if (typeof cb === 'string') {
                    try {
                        const parsed = JSON.parse(cb)
                        circuitBreaker_.interruptersPerPhase = parsed.interruptersPerPhase || parsed.numberOfInterruptPhase || parsed.number_of_interrupt_phase || circuitBreaker_.interruptersPerPhase
                        circuitBreaker_.numberOfPhases = parsed.numberOfPhases || parsed.numberOfPhase || parsed.number_of_phases || circuitBreaker_.numberOfPhases
                    } catch (e) {
                        console.warn('Failed to parse circuitBreaker from store:', e)
                    }
                } else if (cb) {
                    circuitBreaker_.interruptersPerPhase = cb.interruptersPerPhase || cb.numberOfInterruptPhase || cb.number_of_interrupt_phase || circuitBreaker_.interruptersPerPhase
                    circuitBreaker_.numberOfPhases = cb.numberOfPhases || cb.numberOfPhase || cb.number_of_phases || circuitBreaker_.numberOfPhases
                }
            }
            
            // Iterate through object keys (table1, table2, table3)
            Object.keys(this.testData.table).forEach((tableKey) => {
                const element = this.testData.table[tableKey]
                if (this.testData.limits === 'Absolute') {
                    element.forEach((e, index) => {
                        //Opening Sync between phase la [2]
                        if (index % (circuitBreaker_.interruptersPerPhase * circuitBreaker_.numberOfPhases) == 0) {
                            const syncValue = parseFloat(e.opening_sync_between_phase.value)
                            const minValue = parseFloat(this.asset_.openTime.abs[2].tmin)
                            const maxValue = parseFloat(this.asset_.openTime.abs[2].tmax)
                            
                            if (syncValue < minValue || syncValue > maxValue) {
                                for (let j = 0; j < circuitBreaker_.interruptersPerPhase * circuitBreaker_.numberOfPhases; j++) {
                                    this.testData.table[tableKey][index + j].assessment.value = 'Fail'
                                }
                            }
                            else {
                                for (let j = 0; j < circuitBreaker_.interruptersPerPhase * circuitBreaker_.numberOfPhases; j++) {
                                    this.testData.table[tableKey][index + j].assessment.value = 'Pass'
                                }
                            }
                        }
                        //Opening Sync between interrupter la [1]
                        if (e.assessment.value !== 'Fail' && circuitBreaker_.interruptersPerPhase > 1) {
                            if (index % (circuitBreaker_.interruptersPerPhase) == 0) {
                                const syncValue = parseFloat(e.opening_sync_between_interrupter.value)
                                const minValue = parseFloat(this.asset_.openTime.abs[1].tmin)
                                const maxValue = parseFloat(this.asset_.openTime.abs[1].tmax)
                                
                                if (syncValue < minValue || syncValue > maxValue) {
                                    for (let j = 0; j < circuitBreaker_.interruptersPerPhase; j++) {
                                        this.testData.table[tableKey][index + j].assessment.value = 'Fail'
                                    }
                                }
                            }
                        }
                        //Opening Time [0]
                        if (e.assessment.value !== 'Fail') {
                            const openingValue = parseFloat(e.opening_time.value)
                            const minValue = parseFloat(this.asset_.openTime.abs[0].tmin)
                            const maxValue = parseFloat(this.asset_.openTime.abs[0].tmax)
                            
                            if (openingValue < minValue || openingValue > maxValue) {
                                e.assessment.value = 'Fail'
                            }
                            else {
                                e.assessment.value = 'Pass'
                            }
                        }
                    })
                }
                else if (this.testData.limits === 'Relative') {
                    element.forEach((e, index) => {
                        //Opening Sync between phase la [2]
                        if (index % (circuitBreaker_.interruptersPerPhase * circuitBreaker_.numberOfPhases) == 0) {
                            const syncValue = parseFloat(e.opening_sync_between_phase.value)
                            const refValue = parseFloat(this.asset_.openTime.rel[2].rref)
                            const devZ = parseFloat(this.asset_.openTime.rel[2].tdevZ)
                            const devN = parseFloat(this.asset_.openTime.rel[2].tdevN)
                            
                            if (syncValue < refValue) {
                                if (syncValue < (refValue - devZ)) {
                                    for (let j = 0; j < circuitBreaker_.interruptersPerPhase * circuitBreaker_.numberOfPhases; j++) {
                                        this.testData.table[tableKey][index + j].assessment.value = 'Fail'
                                    }
                                }
                                else {
                                    for (let j = 0; j < circuitBreaker_.interruptersPerPhase * circuitBreaker_.numberOfPhases; j++) {
                                        this.testData.table[tableKey][index + j].assessment.value = 'Pass'
                                    }
                                }
                            }
                            else if (syncValue >= refValue) {
                                if (syncValue > (refValue + devN)) {
                                    for (let j = 0; j < circuitBreaker_.interruptersPerPhase * circuitBreaker_.numberOfPhases; j++) {
                                        this.testData.table[tableKey][index + j].assessment.value = 'Fail'
                                    }
                                }
                                else {
                                    for (let j = 0; j < circuitBreaker_.interruptersPerPhase * circuitBreaker_.numberOfPhases; j++) {
                                        this.testData.table[tableKey][index + j].assessment.value = 'Pass'
                                    }
                                }
                            }
                        }
                        //Opening Sync between interrupter la [1]
                        if (e.assessment.value !== 'Fail' && circuitBreaker_.interruptersPerPhase > 1) {
                            if (index % (circuitBreaker_.interruptersPerPhase) == 0) {
                                const syncValue = parseFloat(e.opening_sync_between_interrupter.value)
                                const refValue = parseFloat(this.asset_.openTime.rel[1].rref)
                                const devZ = parseFloat(this.asset_.openTime.rel[1].tdevZ)
                                const devN = parseFloat(this.asset_.openTime.rel[1].tdevN)
                                
                                if (syncValue < refValue) {
                                    if (syncValue < (refValue - devZ)) {
                                        for (let j = 0; j < circuitBreaker_.interruptersPerPhase; j++) {
                                            this.testData.table[tableKey][index + j].assessment.value = 'Fail'
                                        }
                                    }
                                }
                                else if (syncValue >= refValue) {
                                    if (syncValue > (refValue + devN)) {
                                        for (let j = 0; j < circuitBreaker_.interruptersPerPhase; j++) {
                                            this.testData.table[tableKey][index + j].assessment.value = 'Fail'
                                        }
                                    }
                                }
                            }
                        }
                        // Opening Time [0]
                        if (e.assessment.value !== 'Fail') {
                            const openingValue = parseFloat(e.opening_time.value)
                            const refValue = parseFloat(this.asset_.openTime.rel[0].rref)
                            const devZ = parseFloat(this.asset_.openTime.rel[0].tdevZ)
                            const devN = parseFloat(this.asset_.openTime.rel[0].tdevN)
                            
                            if (openingValue < refValue) {
                                if (openingValue < (refValue - devZ)) {
                                    e.assessment.value = 'Fail'
                                }
                                else {
                                    e.assessment.value = 'Pass'
                                }
                            }
                            else if (openingValue >= refValue) {
                                if (openingValue > (refValue + devN)) {
                                    e.assessment.value = 'Fail'
                                }
                                else {
                                    e.assessment.value = 'Pass'
                                }
                            }
                        }
                    })
                }
            })
        },
     

        clear() {
            Object.keys(this.testData.table).forEach((tableKey) => {
                this.testData.table[tableKey].forEach((ele) => {
                    Object.keys(ele).forEach((key) => {
                        if (ele[key] && typeof ele[key] === 'object' && ele[key].value !== undefined) {
                            ele[key].value = ''
                        }
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

.table-strip-input-data {

    th,
    td {
        border-right: 1px solid #fff;

        &:last-child {
            border-right: none;
        }
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
