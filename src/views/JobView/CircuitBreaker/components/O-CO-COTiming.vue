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

        <table class="table-strip-input-data" style="width: 100%; font-size: 12px;">
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
            let circuitBreaker = {
                numberOfInterruptPhase: 1,
                numberOfPhase: 3
            }
            let operating = {
                numberCloseCoil: 1,
                numberTripCoil: 1
            }
            
            if (this.asset && this.asset.circuitBreaker) {
                if (typeof this.asset.circuitBreaker === 'string') {
                    try {
                        const parsed = JSON.parse(this.asset.circuitBreaker)
                        circuitBreaker = { ...circuitBreaker, ...parsed }
                    } catch (e) {
                        console.warn('Failed to parse circuitBreaker:', e)
                    }
                } else {
                    circuitBreaker = { ...circuitBreaker, ...this.asset.circuitBreaker }
                }
            }
            
            if (this.asset && this.asset.operating) {
                if (typeof this.asset.operating === 'string') {
                    try {
                        const parsed = JSON.parse(this.asset.operating)
                        operating = { ...operating, ...parsed }
                    } catch (e) {
                        console.warn('Failed to parse operating:', e)
                    }
                } else {
                    operating = { ...operating, ...this.asset.operating }
                }
            }
            
            return {
                circuitBreaker,
                operating
            }
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
        }
    },
    beforeMount() {
        // Store backup for reset - will be updated by watcher
        const dataTemp = JSON.parse(JSON.stringify(this.asset_ || {}))
        this.back_asset = dataTemp
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
            handler: function(newVal) {
                // Sync asset_.limits to testData.limits
                if (newVal && this.testData) {
                    this.$set(this.testData, 'limits', newVal)
                }
            }
        },
        openAssessmentDialog: {
            handler: function(newVal) {
                // When opening dialog, sync limits from asset_ to testData
                if (newVal && this.asset_ && this.asset_.limits && this.testData) {
                    this.$set(this.testData, 'limits', this.asset_.limits)
                }
            }
        }
    },
    methods: {
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
                    'switching_time_type_a', 'diff_to_main_type_a', 'switching_time_type_b',
                    'diff_to_main_type_b', 'switching_time_wiper', 'duration'
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
                    'peak_close_coil_current', 'peak_trip_coil_current', 'average_close_coil_current',
                    'average_trip_coil_current', 'average_close_coil_voltage', 'average_trip_coil_voltage',
                    'close_coil_resistance', 'trip_coil_resistance'
                ]
                normalized.coilCharacter = {
                    abs: Array(8).fill(null).map(() => ({ min: '', max: '', mrid: '' })),
                    rel: Array(8).fill(null).map(() => ({ ref: '', devZ: '', devN: '', mrid: '' }))
                }
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
.table-strip-input-data {
    th, td {
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
