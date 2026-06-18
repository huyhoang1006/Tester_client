<template>
    <div id="CTiming">
        <!-- Cấu hình -->
        <div style="position: sticky; left: 0; display: inline-block;">
            <el-row class="mgb-10">
                <el-col>
                    <el-button class="btn-action" size="mini" type="success" @click="openAssessmentSettings()">
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
                <div v-if="Object.keys(testData.table).length > 1" style="font-weight: bold ;font-size: 12px;">Close coil no. {{ tableKey.replace('table', '') }}</div>
                <br v-if="Object.keys(testData.table).length > 1" />
                <table class="table-strip-input-data" style="width: 100%; font-size: 12px;">
                    <thead>
                        <th>Phase</th>
                        <th>Closing time (ms)</th>
                        <th>Closing sync. between phase (ms)</th>
                        <th>Close-Open time (ms)</th>
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
                                <el-input size="mini" type="text" number="positive" v-model="item.closing_time.value"></el-input>
                            </td>
                            <td v-if="index % (getInterruptersPerPhase() * getNumberOfPhases()) === 0"
                                :rowspan="getInterruptersPerPhase() * getNumberOfPhases()">
                                <el-input
                                    :rows="getInterruptersPerPhase() * getNumberOfPhases()"
                                    type="textarea" number="positive" size="mini"
                                    v-model="item.closing_sync_between_phase.value"></el-input>
                            </td>
                            <td>
                                <el-input type="text" number="positive" size="mini" v-model="item.close_open_time.value"></el-input>
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
                <div v-if="Object.keys(testData.table).length > 1" style="font-weight: bold ;font-size: 12px;">Close coil no. {{ tableKey.replace('table', '') }}</div>
                <br v-if="Object.keys(testData.table).length > 1" />
                <table class="table-strip-input-data" style="width: 100%; font-size: 12px;">
                    <thead class="test">
                        <th>Phase</th>
                        <th>Interrupter no.</th>
                        <th>Closing time (ms)</th>
                        <th>Closing sync. between phase (ms)</th>
                        <th>Closing sync. between Interrupter (ms)</th>
                        <th>Close-Open time (ms)</th>
                        <th class="assessment-col">Assessment</th>
                        <th class="condition-indicator-col">condition indicator</th>
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
                                <el-input size="mini" type="text" number="positive" v-model="item.interrupter.value"></el-input>
                            </td>
                            <td>
                                <el-input size="mini" type="text" number="positive" v-model="item.closing_time.value"></el-input>
                            </td>
                            <td v-if="index % getInterruptersPerPhase() === 0"
                                :rowspan="getInterruptersPerPhase()">
                                <el-input :rows="getInterruptersPerPhase()" type="textarea" number="positive"
                                    v-model="item.closing_sync_between_phase.value"></el-input>
                            </td>
                            <td v-if="index % (getInterruptersPerPhase() * getNumberOfPhases()) === 0"
                                :rowspan="getInterruptersPerPhase() * getNumberOfPhases()">
                                <el-input
                                    :rows="getInterruptersPerPhase() * getNumberOfPhases()"
                                    type="textarea" number="positive" v-model="item.closing_sync_between_interrupter.value"></el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.close_open_time.value"></el-input>
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
        <el-dialog append-to-body class="dialog_assess" title="Assessment settings" :visible.sync="openAssessmentDialog" width="75%">
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
import timingMixin from './timingMixin'
export default {
    mixins: [timingMixin],
    name: 'COTiming',
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            asset_: {
                openTime: {
                    abs: Array(9).fill(null).map(() => ({ tmin: '', tmax: '', mrid: '' })),
                    rel: Array(9).fill(null).map(() => ({ rref: '', tdevZ: '', tdevN: '', mrid: '' }))
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
                // table giữ dạng object {table1, table2} — KHÔNG convert sang array
                // (convert khiến lưu DB title thành '0','1' thay vì 'table1').
                if ((!newVal || (typeof newVal === 'object' && Object.keys(newVal).length === 0))
                    && this.assetData && this.assetData.operating) {
                    this.$nextTick(() => {
                        this.initializeTable()
                    })
                }
            }
        },
        numberOfCloseCoils: {
            immediate: true,
            handler: function (newVal) {
                // Re-initialize table when number of close coils changes
                if (this.testData && this.testData.table) {
                    // Check if table needs to be resized
                    if (Object.keys(this.testData.table).length !== newVal) {
                        console.log(`Auto-resizing table to ${newVal} close coils`)
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

            // Get numberCloseCoil from either camelCase or snake_case
            const numCloseCoil = this.assetData?.operating?.numberCloseCoil ||
                this.assetData?.operating?.number_of_close_coil ||
                1
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
                                close_open_time: { mrid: '', value: '', unit: 'm|s', type: 'analog' },
                                assessment: { mrid: '', value: '', unit: '', type: 'discrete' },
                                condition_indicator: { mrid: '', value: '', unit: '', type: 'discrete' }
                            })
                        }
                    }
                    newTable['table' + (i + 1)] = tableRow
                }
                this.$set(this.data, 'table', newTable)
            }
        },


        getCircuitBreakerConfig() {
            var iPerPhase = 1
            var nPhases   = 3
            try {
                if (this.assetData && this.assetData.operating) {
                    var p = parseInt(this.assetData.operating.numberOfInterruptPhase || this.assetData.operating.number_of_interrupt_phase || 1)
                    if (!isNaN(p) && p > 0) iPerPhase = p
                    var n = parseInt(this.assetData.operating.numberOfPhase || this.assetData.operating.number_of_phases || 3)
                    if (!isNaN(n) && n > 0) nPhases = n
                }
            } catch(e) { /* ignore */ }
            return { interruptersPerPhase: iPerPhase, numberOfPhases: nPhases }
        },

        calculator() {
            var entries = this.getTableEntries()
            var cb = this.getCircuitBreakerConfig()
            var iPerPhase  = cb.interruptersPerPhase
            var nPhases    = cb.numberOfPhases

            entries.forEach(function(entry) {
                var tableKey = entry.key
                var rows     = entry.rows
                rows.forEach(function(e, index) {
                    var result = 'Pass'
                    // closing_sync_between_phase [5]
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
                    // close_open_time [8]
                    if (result !== 'Fail') {
                        var r4 = this.assessTiming(e.close_open_time ? e.close_open_time.value : '', 8)
                        if (r4 === 'Fail') { result = 'Fail' }
                        else if (r4 === null && result === 'Pass') { result = '' }
                    }
                    this.testData.table[tableKey][index].assessment.value = result
                }.bind(this))
            }.bind(this))
            this.$message.success('Calculating successfully')
        },

        clear() {
            this.getTableEntries().forEach(function(entry) {
                entry.rows.forEach(function(ele) {
                    Object.keys(ele).forEach(function(key) {
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
.test {
    th:not(:nth-child(1)) {
        white-space: nowrap;
    }

    th:nth-child(1) {
        min-width: 50px;
    }
}

table {
    margin-bottom: 2% !important;
    border: white !important;
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