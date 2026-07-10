<template>
    <div id="CTiming" class="test-ui" style="width: 100%; font-size: 12px;">
        <!-- UI đồng bộ theo VoltageTransformer -->
        <!-- Cấu hình -->
        <div class="test-toolbar">
            <div class="test-toolbar-group">
                <el-button size="mini" type="primary" @click="calculator"><i class="fas fa-circle-play"></i> Assess results</el-button>
                <el-button size="mini" @click="clear"><i class="fas fa-xmark"></i> Clear all</el-button>
            </div>
            <div class="test-toolbar-group">
                <el-button size="mini" @click="openAssessmentSettings()"><i class="fa-solid fa-screwdriver-wrench"></i> Assessment settings</el-button>
                <el-button size="mini" @click="openConditionIndicatorDialog = true"><i class="fa-solid fa-hammer"></i> Condition indicator settings</el-button>
            </div>
        </div>

        <!-- Debug info - Set to false to hide -->
        <!-- <div v-if="false" style="background: #f0f0f0; padding: 10px; margin-bottom: 10px; font-size: 11px;">
            <div>testData exists: {{ testData ? 'YES' : 'NO' }}</div>
            <div>testData.table exists: {{ testData && testData.table ? 'YES' : 'NO' }}</div>
            <div>testData.table type: {{ testData && testData.table ? (Array.isArray(testData.table) ? 'ARRAY' : typeof testData.table) : 'N/A' }}</div>
            <div>testData.table keys: {{ testData && testData.table && typeof testData.table === 'object' ? Object.keys(testData.table).length : 'N/A' }}</div>
            <div>testData.table content: {{ testData && testData.table ? JSON.stringify(Object.keys(testData.table)) : 'N/A' }}</div>
            <div>numberTripCoil (raw): {{ assetData && assetData.operating ? (assetData.operating.numberTripCoil || assetData.operating.number_of_trip_coil) : 'N/A' }}</div>
            <div>numberOfTripCoils (computed): {{ numberOfTripCoils }}</div>
            <div>getInterruptersPerPhase(): {{ getInterruptersPerPhase() }}</div>
            <div>Should show {{ testData && testData.table ? Object.keys(testData.table).length : 0 }} table(s)</div>
            <div style="color: red; font-weight: bold;">Condition check for interruptersPerPhase === 1: {{ getInterruptersPerPhase() === 1 ? 'TRUE (will show first div)' : 'FALSE' }}</div>
            <div style="color: red; font-weight: bold;">Condition check for interruptersPerPhase > 1: {{ getInterruptersPerPhase() > 1 ? 'TRUE (will show second div)' : 'FALSE' }}</div>
            <div v-if="testData && testData.table">
                <div v-for="(tableData, tableKey) in testData.table" :key="tableKey">
                    Table {{ tableKey }}: {{ tableData && Array.isArray(tableData) ? tableData.length + ' rows' : 'NOT AN ARRAY' }}
                </div>
            </div>
        </div> -->

        <div
            v-if="testData && testData.table && Object.keys(testData.table).length > 0 && getInterruptersPerPhase() === 1">
            <div v-for="(tableData, tableKey) in testData.table" :key="tableKey" style="margin-top: 2%">
                <div v-if="Object.keys(testData.table).length > 1" style="font-weight: bold ;font-size: 12px;">Close
                    coil no. {{ tableKey.replace('table', '') }}</div>
                <br v-if="Object.keys(testData.table).length > 1" />
                <div class="table-scroll"><table v-if="tableData && Array.isArray(tableData)" class="table-strip-input-data test-table"
                    style="width: 100%; font-size: 12px;">
                    <thead>
                        <th>Phase</th>
                        <th>Closing time (ms)</th>
                        <th>Closing sync. between phase (ms)</th>
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
                                <el-input size="mini" type="text" number="positive"
                                    v-model="item.closing_time.value"></el-input>
                            </td>
                            <td v-if="index % (getInterruptersPerPhase() * getNumberOfPhases()) === 0"
                                :rowspan="getInterruptersPerPhase() * getNumberOfPhases()">
                                <el-input :rows="getInterruptersPerPhase() * getNumberOfPhases()" type="textarea"
                                    size="mini" number="positive"
                                    v-model="item.closing_sync_between_phase.value"></el-input>
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
                </table></div>
            </div>
        </div>

        <div
            v-if="testData && testData.table && Object.keys(testData.table).length > 0 && getInterruptersPerPhase() > 1">
            <div v-for="(tableData, tableKey) in testData.table" :key="tableKey" style="margin-top: 2%">
                <div v-if="Object.keys(testData.table).length > 1" style="font-weight: bold ;font-size: 12px;">Close
                    coil no. {{ tableKey.replace('table', '') }}</div>
                <br v-if="Object.keys(testData.table).length > 1" />
                <div class="table-scroll"><table v-if="tableData && Array.isArray(tableData)" class="table-strip-input-data test-table"
                    style="width: 100%; font-size: 12px;">
                    <thead class="test">
                        <th>Phase</th>
                        <th>Interrupter no.</th>
                        <th>Closing time (ms)</th>
                        <th>Closing sync. between interrupter (ms)</th>
                        <th>Closing sync. between phase (ms)</th>
                        <th class="assessment-col">Assessment</th>
                        <th class="condition-indicator-col">Condition indicator</th>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in tableData" :key="index">
                            <td v-if="index % getInterruptersPerPhase() === 0" :rowspan="getInterruptersPerPhase()">
                                <div style="display: flex; width: 100%;">
                                    <el-input size="mini" v-model="item.phase.value"></el-input>
                                    <div
                                        :class="{ colorTableRed: item.phase.value == 'A', colorTableYellow: item.phase.value == 'B', colorTableBlue: item.phase.value == 'C' }">
                                    </div>
                                </div>
                            </td>
                            <td>
                                <el-input size="mini" type="text" number="positive"
                                    v-model="item.interrupter.value"></el-input>
                            </td>
                            <td>
                                <el-input type="text" number="positive" size="mini"
                                    v-model="item.closing_time.value"></el-input>
                            </td>
                            <td v-if="index % getInterruptersPerPhase() === 0" :rowspan="getInterruptersPerPhase()">
                                <el-input :rows="getInterruptersPerPhase()" type="textarea" number="positive"
                                    v-model="item.closing_sync_between_interrupter.value"></el-input>
                            </td>
                            <td v-if="index % (getInterruptersPerPhase() * getNumberOfPhases()) === 0"
                                :rowspan="getInterruptersPerPhase() * getNumberOfPhases()">
                                <el-input :rows="getInterruptersPerPhase() * getNumberOfPhases()" type="textarea"
                                    number="positive" v-model="item.closing_sync_between_phase.value"></el-input>
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
                </table></div>
            </div>
        </div>

        <!-- Assessment settings -->
        <el-dialog append-to-body class="dialog_assess cb-assessment-dialog" title="Assessment settings" :visible.sync="openAssessmentDialog"
            width="min(1040px, 92vw)">
            <el-radio-group v-model="testData.limits" style="margin-bottom: 20px">
                <el-radio label="Absolute">Absolute</el-radio>
                <el-radio label="Relative">Relative</el-radio>
            </el-radio-group>
            <div class="cb-assessment-card">
                <div class="cb-assessment-card-header"><i class="fa-solid fa-caret-up"></i> Operating time</div>
                <div class="cb-assessment-card-body">

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
                                <el-input size="mini" type="text" number="positive"
                                    v-model="asset_.openTime.abs[index].tmin">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" type="text" number="positive"
                                    v-model="asset_.openTime.abs[index].tmax">
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
                                <el-input size="mini" type="text" number="positive"
                                    v-model="asset_.openTime.rel[index].rref">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" type="text" number="positive"
                                    v-model="asset_.openTime.rel[index].tdevZ">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" type="text" number="positive"
                                    v-model="asset_.openTime.rel[index].tdevN">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </transition>

                </div>
            </div>

            <!-- Auxiliary_contact -->
            <div class="cb-assessment-card">
                <div class="cb-assessment-card-header"><i class="fa-solid fa-caret-up"></i> Auxiliary contacts</div>
                <div class="cb-assessment-card-body">
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
                                <el-input size="mini" type="text" number="positive"
                                    v-model="asset_.auxContact.abs.trip[index].tmin">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" type="text" number="positive"
                                    v-model="asset_.auxContact.abs.trip[index].tmax">
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
                                <el-input size="mini" type="text" number="positive"
                                    v-model="asset_.auxContact.rel.trip[index].tref">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" type="text" number="positive"
                                    v-model="asset_.auxContact.rel.trip[index].tdef">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </transition>

                </div>
            </div>

            <!-- //miscellaneous -->
            <div class="cb-assessment-card">
                <div class="cb-assessment-card-header"><i class="fa-solid fa-caret-up"></i> Miscellaneous</div>
                <div class="cb-assessment-card-body">
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
                                <el-input v-if="index === 1" size="mini" type="text" number="positive"
                                    v-model="asset_.miscell.abs[index].min">
                                </el-input>
                                <el-input v-else size="mini" type="text" number="positive"
                                    v-model="asset_.miscell.abs[index].min">
                                    <template slot="append">ms</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input v-if="index === 1" size="mini" type="text" number="positive"
                                    v-model="asset_.miscell.abs[index].max">
                                </el-input>
                                <el-input v-else size="mini" type="text" number="positive"
                                    v-model="asset_.miscell.abs[index].max">
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
                                <el-input v-if="index === 1" size="mini" type="text" number="positive"
                                    v-model="asset_.miscell.rel[index].ref">
                                </el-input>
                                <el-input v-else size="mini" type="text" number="positive"
                                    v-model="asset_.miscell.rel[index].ref">
                                    <template v-if="item !== 1" slot="append">ms</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input v-if="index === 1" size="mini" type="text" number="positive"
                                    v-model="asset_.miscell.rel[index].dev">
                                </el-input>
                                <el-input v-else size="mini" type="text" number="positive"
                                    v-model="asset_.miscell.rel[index].dev">
                                    <template v-if="item !== 1" slot="append">ms</template>
                                </el-input>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </transition>

                </div>
            </div>

            <!-- //coilCharacteristics -->
            <div class="cb-assessment-card">
                <div class="cb-assessment-card-header"><i class="fa-solid fa-caret-up"></i> Coil Characteristics</div>
                <div class="cb-assessment-card-body">
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
                                <el-input size="mini" type="text" number="positive"
                                    v-model="asset_.coilCharacter.abs[index].min">
                                    <template v-if="index <= 3" slot="append">A</template>
                                    <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                    <template v-else slot="append">&#8486;</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" type="text" number="positive"
                                    v-model="asset_.coilCharacter.abs[index].max">
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
                            <el-input size="mini" type="text" number="positive"
                                v-model="asset_.coilCharacter.rel[index].ref">
                                <template v-if="index <= 3" slot="append">A</template>
                                <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                <template v-else slot="append">&#8486;</template>
                            </el-input>
                            <td>
                                <el-input size="mini" type="text" number="positive"
                                    v-model="asset_.coilCharacter.rel[index].devZ">
                                    <template v-if="index <= 3" slot="append">A</template>
                                    <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                    <template v-else slot="append">&#8486;</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" type="text" number="positive"
                                    v-model="asset_.coilCharacter.rel[index].devN">
                                    <template v-if="index <= 3" slot="append">A</template>
                                    <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                    <template v-else slot="append">&#8486;</template>
                                </el-input>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </transition>
                </div>
            </div>
            <template #footer>
                <span style="margin-top: 20px; width: 100%; position: absolute; right: 10px; bottom: 10px"
                    class="dialog-footer">
                    <el-button @click="resetAssessment">Cancel</el-button>
                    <el-button type="primary" @click="updateAssessment">Confirm</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import timingMixin from './timingMixin'
export default {
    mixins: [timingMixin],
    name: 'CTiming',
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
        // Initialize asset_ from assessLimitsData if available
        if (this.assessLimitsData && Object.keys(this.assessLimitsData).length > 0) {
            this.asset_ = this.normalizeAssessmentLimits(this.assessLimitsData)
        }
        // Store backup for reset
        const dataTemp = JSON.parse(JSON.stringify(this.asset_ || {}))
        this.back_asset = dataTemp
    },
    mounted() {
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
        numberOfCloseCoils() {
            if (this.assetData && this.assetData.operating) {
                const value = this.assetData.operating.numberCloseCoil ||
                    this.assetData.operating.number_of_close_coil
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
                this.asset_ = this.normalizeAssessmentLimits(newVal)
                // Sync limits to testData
                if (this.asset_.limits && this.testData) {
                    this.$set(this.testData, 'limits', this.asset_.limits)
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
                // Convert array [[...], [...]] to object {table1: [...], table2: [...]} for consistency
                if (newVal && Array.isArray(newVal) && newVal.length > 0) {
                    const tableObj = {}
                    newVal.forEach((coilTable, idx) => {
                        tableObj[`table${idx + 1}`] = coilTable
                    })
                    this.$set(this.testData, 'table', tableObj)
                    return
                }
                // Initialize table if empty
                if ((!newVal || (typeof newVal === 'object' && !Array.isArray(newVal) && Object.keys(newVal).length === 0)) && this.assetData && this.assetData.operating) {
                    this.$nextTick(() => {
                        this.initializeTable()
                    })
                }
            }
        },
        numberOfCloseCoils: {
            handler: function (newVal) {
                // Re-initialize table when number of close coils changes
                if (this.testData && this.testData.table && !Array.isArray(this.testData.table)) {
                    if (Object.keys(this.testData.table).length > 0 && Object.keys(this.testData.table).length !== newVal) {
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
        normalizeAssessmentLimits(data) {
            if (!data || typeof data !== 'object') {
                data = {}
            }

            // Normalize from operating_time structure to openTime structure
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
            } else if (data.openTime) {
                // If openTime already exists, ensure it's properly structured
                normalized.openTime = JSON.parse(JSON.stringify(data.openTime))
            }

            // Map operating_time to openTime if it exists
            if (data.operating_time) {
                const operatingTime = data.operating_time
                const absMapping = [
                    'opening_time',
                    'opening_sync_within_phase',
                    'opening_sync_breaker_phase',
                    'closing_time',
                    'closing_sync_within_phase',
                    'closing_sync_breaker_phase',
                    'reclosing_time',
                    'open_close_time',
                    'close_open_time'
                ]

                const relMapping = [
                    'opening_time',
                    'opening_sync_within_phase',
                    'opening_sync_breaker_phase',
                    'closing_time',
                    'closing_sync_within_phase',
                    'closing_sync_breaker_phase',
                    'reclosing_time',
                    'open_close_time',
                    'close_open_time'
                ]

                // Ensure openTime structure exists
                if (!normalized.openTime) {
                    normalized.openTime = {
                        abs: [],
                        rel: []
                    }
                }

                // Normalize abs array
                if (operatingTime.abs) {
                    absMapping.forEach((key, index) => {
                        const item = operatingTime.abs[key]
                        if (item) {
                            // Extract value safely - handle both object.value and direct value
                            const getValue = (obj) => {
                                if (!obj) return ''
                                if (typeof obj === 'string' || typeof obj === 'number') return String(obj)
                                if (typeof obj === 'object' && obj.value !== undefined) return String(obj.value || '')
                                return ''
                            }

                            normalized.openTime.abs[index] = {
                                tmin: getValue(item.t_min) || getValue(item.tmin) || '',
                                tmax: getValue(item.t_max) || getValue(item.tmax) || '',
                                mrid: item.mrid || ''
                            }
                        } else {
                            // Ensure index exists
                            if (!normalized.openTime.abs[index]) {
                                normalized.openTime.abs[index] = {
                                    tmin: '',
                                    tmax: '',
                                    mrid: ''
                                }
                            }
                        }
                    })
                }

                // Normalize rel array
                if (operatingTime.rel) {
                    relMapping.forEach((key, index) => {
                        const item = operatingTime.rel[key]
                        if (item) {
                            // Extract value safely - handle both object.value and direct value
                            const getValue = (obj) => {
                                if (!obj) return ''
                                if (typeof obj === 'string' || typeof obj === 'number') return String(obj)
                                if (typeof obj === 'object' && obj.value !== undefined) return String(obj.value || '')
                                return ''
                            }

                            normalized.openTime.rel[index] = {
                                rref: getValue(item.t_ref) || getValue(item.rref) || '',
                                tdevZ: getValue(item.minus_t_dev) || getValue(item.tdevZ) || '',
                                tdevN: getValue(item.plus_t_dev) || getValue(item.tdevN) || '',
                                mrid: item.mrid || ''
                            }
                        } else {
                            // Ensure index exists
                            if (!normalized.openTime.rel[index]) {
                                normalized.openTime.rel[index] = {
                                    rref: '',
                                    tdevZ: '',
                                    tdevN: '',
                                    mrid: ''
                                }
                            }
                        }
                    })
                }
            }

            // Ensure openTime has proper structure even if not from operating_time
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

                // Helper function to extract value safely
                const getValue = (obj) => {
                    if (!obj) return ''
                    if (typeof obj === 'string' || typeof obj === 'number') return String(obj)
                    if (typeof obj === 'object' && obj.value !== undefined) return String(obj.value || '')
                    return ''
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
                // Keep auxContact structure but ensure values are normalized
                if (!normalized.auxContact) {
                    normalized.auxContact = JSON.parse(JSON.stringify(data.auxContact))
                }
            } else if (!normalized.auxContact) {
                // Initialize default auxContact structure
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

                // Helper function to extract value safely
                const getValue = (obj) => {
                    if (!obj) return ''
                    if (typeof obj === 'string' || typeof obj === 'number') return String(obj)
                    if (typeof obj === 'object' && obj.value !== undefined) return String(obj.value || '')
                    return ''
                }

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

                // Helper function to extract value safely
                const getValue = (obj) => {
                    if (!obj) return ''
                    if (typeof obj === 'string' || typeof obj === 'number') return String(obj)
                    if (typeof obj === 'object' && obj.value !== undefined) return String(obj.value || '')
                    return ''
                }

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

            // Ensure limits property exists
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

            const numCloseCoil = parseInt(
                this.assetData?.operating?.numberCloseCoil ||
                this.assetData?.operating?.number_of_close_coil ||
                1
            )
            const numPhase = this.getNumberOfPhases()
            const numInterruptPhase = this.getInterruptersPerPhase()
            const phase = ["A", "B", "C"]

            if (!this.data.table) {
                this.$set(this.data, 'table', {})
            }

            if (Object.keys(this.data.table).length === 0) {
                const newTable = {}
                for (let i = 0; i < numCloseCoil; i++) {
                    const tableRow = []
                    for (let phaseIdx = 0; phaseIdx < numPhase; phaseIdx++) {
                        for (let interruptIdx = 0; interruptIdx < numInterruptPhase; interruptIdx++) {
                            tableRow.push({
                                phase: { mrid: '', value: phase[phaseIdx] || '', unit: '', type: 'string' },
                                closing_time: { mrid: '', value: '', unit: 'm|s', type: 'analog' },
                                interrupter: { mrid: '', value: (interruptIdx + 1).toString(), unit: '', type: 'analog' },
                                closing_sync_between_phase: { mrid: '', value: '', unit: 'm|s', type: 'analog' },
                                closing_sync_between_interrupter: { mrid: '', value: '', unit: 'm|s', type: 'analog' },
                                assessment: { mrid: '', value: '', unit: '', type: 'discrete' },
                                condition_indicator: { mrid: '', value: '', unit: '', type: 'discrete' }
                            })
                        }
                    }
                    newTable[`table${i + 1}`] = tableRow
                }
                this.$set(this.data, 'table', newTable)
            }
        },
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


        getCircuitBreakerConfig() {
            var iPerPhase = 1
            var nPhases = 3
            try {
                if (this.assetData && this.assetData.operating) {
                    var p = parseInt(this.assetData.operating.numberOfInterruptPhase || this.assetData.operating.number_of_interrupt_phase || 1)
                    if (!isNaN(p) && p > 0) iPerPhase = p
                    var n = parseInt(this.assetData.operating.numberOfPhase || this.assetData.operating.number_of_phases || 3)
                    if (!isNaN(n) && n > 0) nPhases = n
                }
            } catch (e) { /* ignore */ }
            return { interruptersPerPhase: iPerPhase, numberOfPhases: nPhases }
        },

        calculator() {
            var entries = this.getTableEntries()
            var cb = this.getCircuitBreakerConfig()
            var iPerPhase = cb.interruptersPerPhase
            var nPhases = cb.numberOfPhases

            entries.forEach(function (entry) {
                var tableKey = entry.key
                var rows = entry.rows
                rows.forEach(function (e, index) {
                    var result = 'Pass'
                    // closing_sync_between_phase [5] - only first row of each phase group
                    if (index % (iPerPhase * nPhases) === 0) {
                        var r1 = this.assessTiming(e.closing_sync_between_phase ? e.closing_sync_between_phase.value : '', 5)
                        if (r1 === 'Fail') { result = 'Fail' }
                        else if (r1 === null) { result = '' }
                    }
                    // closing_sync_between_interrupter [4]
                    if (result !== 'Fail' && iPerPhase > 1 && index % iPerPhase === 0) {
                        var r2 = this.assessTiming(e.closing_sync_between_interrupter ? e.closing_sync_between_interrupter.value : '', 4)
                        if (r2 === 'Fail') { result = 'Fail' }
                        else if (r2 === null && result === 'Pass') { result = '' }
                    }
                    // closing_time [3]
                    if (result !== 'Fail') {
                        var r3 = this.assessTiming(e.closing_time ? e.closing_time.value : '', 3)
                        if (r3 === 'Fail') { result = 'Fail' }
                        else if (r3 === null && result === 'Pass') { result = '' }
                    }
                    this.testData.table[tableKey][index].assessment.value = result
                }.bind(this))
            }.bind(this))
            this.$message.success('Calculating successfully')
        },
        clear() {
            this.getTableEntries().forEach(function (entry) {
                entry.rows.forEach(function (ele) {
                    Object.keys(ele).forEach(function (key) {
                        if (ele[key] && typeof ele[key] === 'object' && ele[key].value !== undefined) {
                            ele[key].value = ''
                        }
                    })
                })
            }.bind(this))
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
@import "~@/views/JobView/Common/testUi.scss";

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

.Good input {
    background: #00cc00;
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
