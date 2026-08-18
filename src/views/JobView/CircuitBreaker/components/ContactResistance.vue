<template>
    <div id="dc-winding-resistance-prim" class="test-ui" style="width: 100%; font-size: 12px;">
        <!-- Cấu hình -->
        <div class="test-toolbar">
            <div class="test-toolbar-group">
                <el-button size="mini" type="primary" @click="calculator"><i class="fas fa-circle-play"></i> Assess results</el-button>
                <el-button size="mini" @click="clear"><i class="fas fa-xmark"></i> Clear all</el-button>
            </div>
            <div class="test-toolbar-group">
                <el-button size="mini" @click="openAssessmentSettings()"><i class="fa-solid fa-screwdriver-wrench"></i> Assessment settings</el-button>
                <el-button size="mini" @click="openConditionIndicatorDialog = true"><i class="fa-solid fa-hammer"></i> Condition indicator settings</el-button>
                <el-button size="mini" :type="compareOpen ? 'primary' : ''" @click="$emit('toggle-compare')">
                    <i class="fa-solid fa-scale-balanced"></i> Compare with previous results
                </el-button>
            </div>
        </div>

        <div v-if="!hasInterrupterConfig" class="interrupter-warning-card">
            <div class="interrupter-warning-title">
                <i class="fa-solid fa-triangle-exclamation"></i>
                Please specify number of interrupters
            </div>
            <div class="interrupter-warning-form">
                <span>Number of interrupters per phase</span>
                <el-select size="mini" v-model="interrupterDraft" placeholder="Select">
                    <el-option v-for="item in 16" :key="item" :label="item" :value="item"></el-option>
                </el-select>
                <el-button size="mini" type="primary" :loading="savingInterrupterConfig" @click="saveInterrupterConfig">
                    Save
                </el-button>
            </div>
        </div>

        <div v-else-if="interruptersPerPhase === 1">
            <br />
            <div class="table-scroll"><table class="table-strip-input-data test-table" style="width: 100%; font-size: 12px;">
                <thead class="test">
                    <th>Phase</th>
                    <th>I test (A)</th>
                    <th>Contact resistance (&#181;&#8486;)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in testData.table.table1" :key="index">
                        <td>
                            <div style="display: flex; width: 100%;">
                                <el-select size="mini" v-model="item.phase.value" placeholder="Phase"><el-option label="A" value="A"></el-option><el-option label="B" value="B"></el-option><el-option label="C" value="C"></el-option></el-select>
                                <div
                                    :class="{ colorTableRed: item.phase.value == 'A', colorTableYellow: item.phase.value == 'B', colorTableBlue: item.phase.value == 'C' }">
                                </div>
                            </div>
                        </td>
                        <td>
                            <el-input size="mini" type="text" number="positive" v-model="item.i_test.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" number="positive"
                                v-model="item.contact_resistance.value"></el-input>
                        </td>
                        <td>
                            <el-select class="assessment" size="mini" v-model="item.assessment.value">
                                <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
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

        <div v-else>
            <br />
            <div class="table-scroll"><table class="table-strip-input-data test-table" style="width: 100%; font-size: 12px;">
                <thead class="test">
                    <th>Phase</th>
                    <th>Interrupter no.</th>
                    <th>I test (A)</th>
                    <th>Contact resistance (&#181;&#8486;)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in testData.table.table1" :key="index">
                        <td v-if="index % interruptersPerPhase === 0"
                            :rowspan="interruptersPerPhase">
                            <div style="display: flex; width: 100%;">
                                <el-select size="mini" v-model="item.phase.value" placeholder="Phase"><el-option label="A" value="A"></el-option><el-option label="B" value="B"></el-option><el-option label="C" value="C"></el-option></el-select>
                                <div
                                    :class="{ colorTableRed: item.phase.value == 'A', colorTableYellow: item.phase.value == 'B', colorTableBlue: item.phase.value == 'C' }">
                                </div>
                            </div>
                        </td>
                        <td>
                            <el-input size="mini" disabled v-model="item.interrupter.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" v-model="item.i_test.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" v-model="item.contact_resistance.value"></el-input>
                        </td>
                        <td>
                            <el-select class="assessment" size="mini" v-model="item.assessment.value">
                                <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
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

        <el-dialog class="cb-assessment-dialog" append-to-body title="Assessment settings" :visible.sync="openAssessmentDialog" width="min(1040px, 92vw)">
            <el-radio-group v-radio-clearable v-model="assetData.assessmentLimits.limits" style="margin-bottom:16px;">
                <el-radio label="Absolute">Absolute limits</el-radio>
                <el-radio label="Relative">Relative limits</el-radio>
            </el-radio-group>
            <div class="cb-assessment-card">
                <div class="cb-assessment-card-header"><i class="fa-solid fa-caret-up"></i> Contact resistance</div>
                <div class="cb-assessment-card-body">
            <el-form size="small" label-position="left" label-width="120px">
                <template v-if="assetData.assessmentLimits.limits === 'Absolute'">
                    <el-form-item label="R min (μΩ)">
                        <el-input type="text" number="positive"
                            v-model="assetData.assessmentLimits.contact_resistance.abs.r_min.value" />
                    </el-form-item>
                    <el-form-item label="R max (μΩ)">
                        <el-input type="text" number="positive"
                            v-model="assetData.assessmentLimits.contact_resistance.abs.r_max.value" />
                    </el-form-item>
                </template>
                <template v-else>
                    <el-form-item label="R ref (μΩ)">
                        <el-input type="text" number="positive"
                            v-model="assetData.assessmentLimits.contact_resistance.rel.r_ref.value" />
                    </el-form-item>
                    <el-form-item label="R dev (μΩ)">
                        <el-input type="text" number="positive"
                            v-model="assetData.assessmentLimits.contact_resistance.rel.r_dev.value" />
                    </el-form-item>
                </template>
            </el-form>
                </div>
            </div>
            <template v-slot:footer>
                <span class="dialog-footer-actions">
                    <el-button @click="resetAssessment">Cancel</el-button>
                    <el-button type="primary" @click="updateAssessment">OK</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import assessmentMixin from './assessmentMixin'
import circuitBreakerTestMap from '@/config/test-definitions/CircuitBreaker'
import * as common from '../../Common/index.js'
import * as BreakerMapping from '@/views/Mapping/Breaker/index'
export default {
    mixins: [assessmentMixin],
    name: "ContactResistance",
    data() {
        return {
            openAssessmentDialog: false,
            backupLimits: null,
            assessmentIpcChannel: 'updateContactResistanceLimits',
            openConditionIndicatorDialog: false,
            interrupterDraft: '',
            savingInterrupterConfig: false,
            asset_: {
                contactSys: {
                    abs: {
                        rmin: '',
                        rmax: '',
                        mrid: ''
                    },
                    rel: {
                        rref: '',
                        rdev: '',
                        mrid: ''
                    }
                },
                limits: 'Absolute'
            },
            back_asset: {},
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
        },
        compareOpen:    { type: Boolean, default: false }
    },
    beforeMount() {
        const asset = {
            id: this.asset.id,
            assessmentLimits: this.asset_
        }
        const dataTemp = JSON.parse(JSON.stringify(asset))
        this.back_asset = dataTemp.assessmentLimits
    },
    computed: {
        testData() {
            return this.data
        },
        assetData() {
            return this.asset
        },
        circuitBreakerConfig() {
            return (this.assetData && this.assetData.circuitBreaker) ? this.assetData.circuitBreaker : {}
        },
        interruptersPerPhase() {
            const value = parseInt(this.circuitBreakerConfig.interruptersPerPhase, 10)
            return Number.isFinite(value) && value > 0 ? value : 0
        },
        numberOfPhases() {
            const value = parseInt(this.circuitBreakerConfig.numberOfPhases, 10)
            return Number.isFinite(value) && value > 0 ? value : 3
        },
        hasInterrupterConfig() {
            return this.interruptersPerPhase > 0
        }
    },
    mounted() {
        this.interrupterDraft = this.interruptersPerPhase || ''
        this.normalizeContactResistanceRows()
    },
    watch: {
        'asset.circuitBreaker.interruptersPerPhase': {
            immediate: true,
            handler: function (newVal) {
                const value = parseInt(newVal, 10)
                this.interrupterDraft = Number.isFinite(value) && value > 0 ? value : ''
                this.normalizeContactResistanceRows()
            }
        },
        'asset.circuitBreaker.numberOfPhases': function () {
            this.normalizeContactResistanceRows()
        },
        'asset.circuitBreaker.phase': function () {
            this.normalizeContactResistanceRows()
        },
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
        }
    },
    methods: {
        getPhaseList() {
            const phases = ['A', 'B', 'C']
            if (this.numberOfPhases === 1) {
                return [this.circuitBreakerConfig.phase || 'A']
            }
            return phases.slice(0, Math.min(this.numberOfPhases, phases.length))
        },
        buildContactResistanceRow(phase, interrupterNo, existing) {
            const columns = (circuitBreakerTestMap.ContactResistance && circuitBreakerTestMap.ContactResistance.columns) || []
            const row = existing ? JSON.parse(JSON.stringify(existing)) : common.buildEmptyTestRow(columns)
            if (!row.phase) row.phase = { mrid: '', value: '', unit: '', type: 'string' }
            row.phase.value = phase

            if (this.interruptersPerPhase > 1) {
                if (!row.interrupter) row.interrupter = { mrid: '', value: '', unit: '', type: 'string' }
                row.interrupter.value = String(interrupterNo)
            } else if (row.interrupter) {
                row.interrupter.value = ''
            }

            if (!row.i_test) row.i_test = { mrid: '', value: '', unit: 'A', type: 'analog' }
            if (!row.contact_resistance) row.contact_resistance = { mrid: '', value: '', unit: 'microOhm', type: 'analog' }
            if (!row.assessment) row.assessment = { mrid: '', value: '', unit: '', type: 'string' }
            if (!row.condition_indicator) row.condition_indicator = { mrid: '', value: '', unit: '', type: 'string' }
            return row
        },
        normalizeContactResistanceRows() {
            if (!this.hasInterrupterConfig || !this.testData || !this.testData.table) return

            if (!Array.isArray(this.testData.table.table1)) {
                this.$set(this.testData.table, 'table1', [])
            }

            const oldRows = this.testData.table.table1 || []
            const oldByKey = {}
            const oldInterrupters = this.readExistingInterrupterCount(oldRows)
            oldRows.forEach((row, index) => {
                const inferredPhase = this.phaseFromRowIndex(index, oldInterrupters)
                const inferredInterrupter = this.interrupterFromRowIndex(index, oldInterrupters)
                const phase = row && row.phase && row.phase.value ? row.phase.value : inferredPhase
                const interrupter = row && row.interrupter && row.interrupter.value ? row.interrupter.value : inferredInterrupter
                if (phase) oldByKey[`${phase}|${interrupter}`] = row
            })

            const nextRows = []
            this.getPhaseList().forEach((phase) => {
                for (let i = 1; i <= this.interruptersPerPhase; i++) {
                    nextRows.push(this.buildContactResistanceRow(phase, i, oldByKey[`${phase}|${i}`]))
                }
            })

            this.$set(this.testData.table, 'table1', nextRows)
        },
        readExistingInterrupterCount(rows) {
            const configured = this.interruptersPerPhase
            if (!Array.isArray(rows) || rows.length === 0) return configured || 1

            const values = rows
                .map((row) => parseInt(row && row.interrupter && row.interrupter.value, 10))
                .filter((value) => Number.isFinite(value) && value > 0)
            if (values.length) {
                return Math.max.apply(null, values)
            }

            const phaseCount = this.getPhaseList().length || 1
            return Math.max(1, Math.round(rows.length / phaseCount))
        },
        phaseFromRowIndex(index, interrupterCount) {
            const phases = this.getPhaseList()
            const phaseIndex = Math.floor(index / Math.max(1, interrupterCount))
            return phases[phaseIndex] || ''
        },
        interrupterFromRowIndex(index, interrupterCount) {
            return String((index % Math.max(1, interrupterCount)) + 1)
        },
        async saveInterrupterConfig() {
            const value = parseInt(this.interrupterDraft, 10)
            if (!Number.isFinite(value) || value <= 0) {
                this.$message.warning('Please specify number of interrupters')
                return
            }
            if (!this.assetData || !this.assetData.properties || !this.assetData.properties.mrid) {
                this.$message.error('Circuit breaker asset is not available')
                return
            }

            this.savingInterrupterConfig = true
            try {
                const current = await window.electronAPI.getBreakerEntityByMrid(this.assetData.properties.mrid, this.assetData.psrId)
                const oldDto = current && current.success ? BreakerMapping.mapEntityToDto(current.data) : JSON.parse(JSON.stringify(this.assetData))
                const newDto = JSON.parse(JSON.stringify(oldDto))
                if (!newDto.circuitBreaker) newDto.circuitBreaker = {}
                newDto.circuitBreaker.interruptersPerPhase = value

                const oldEntity = BreakerMapping.mapDtoToEntity(oldDto)
                const newEntity = BreakerMapping.mapDtoToEntity(newDto)
                const result = await window.electronAPI.insertBreakerEntity(oldEntity, newEntity)
                if (!result || !result.success) {
                    this.$message.error((result && result.message) || 'Failed to save circuit breaker')
                    return
                }

                if (!this.assetData.circuitBreaker) {
                    this.$set(this.assetData, 'circuitBreaker', {})
                }
                this.$set(this.assetData.circuitBreaker, 'interruptersPerPhase', value)
                this.normalizeContactResistanceRows()
                this.$emit('asset-config-updated', { changed: result.changed === true })
                this.$message.success('Number of interrupters saved')
            } catch (error) {
                console.error('Error saving circuit breaker interrupter config:', error)
                this.$message.error(error && error.message ? error.message : 'Failed to save circuit breaker')
            } finally {
                this.savingInterrupterConfig = false
            }
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

            // Helper function to extract value safely
            const getValue = (obj) => {
                if (!obj) return ''
                if (typeof obj === 'string' || typeof obj === 'number') return String(obj)
                if (typeof obj === 'object' && obj.value !== undefined) return String(obj.value || '')
                return ''
            }

            // Always initialize contactSys structure first
            normalized.contactSys = {
                abs: {
                    rmin: '',
                    rmax: '',
                    mrid: ''
                },
                rel: {
                    rref: '',
                    rdev: '',
                    mrid: ''
                }
            }

            // Normalize from contact_resistance structure (from backend DTO)
            if (data.contact_resistance) {
                const contactRes = data.contact_resistance

                if (contactRes.abs) {
                    normalized.contactSys.abs.rmin = getValue(contactRes.abs.r_min) || getValue(contactRes.abs.rmin) || ''
                    normalized.contactSys.abs.rmax = getValue(contactRes.abs.r_max) || getValue(contactRes.abs.rmax) || ''
                    normalized.contactSys.abs.mrid = contactRes.abs.mrid || contactRes.mrid || ''
                }

                if (contactRes.rel) {
                    normalized.contactSys.rel.rref = getValue(contactRes.rel.r_ref) || getValue(contactRes.rel.rref) || ''
                    normalized.contactSys.rel.rdev = getValue(contactRes.rel.r_dev) || getValue(contactRes.rel.rdev) || ''
                    normalized.contactSys.rel.mrid = contactRes.rel.mrid || contactRes.mrid || ''
                }
            }
            // Normalize from contact_system structure if exists
            else if (data.contact_system) {
                const contactSys = data.contact_system

                if (contactSys.abs) {
                    normalized.contactSys.abs.rmin = getValue(contactSys.abs.r_min) || getValue(contactSys.abs.rmin) || ''
                    normalized.contactSys.abs.rmax = getValue(contactSys.abs.r_max) || getValue(contactSys.abs.rmax) || ''
                    normalized.contactSys.abs.mrid = contactSys.abs.mrid || ''
                }

                if (contactSys.rel) {
                    normalized.contactSys.rel.rref = getValue(contactSys.rel.r_ref) || getValue(contactSys.rel.rref) || ''
                    normalized.contactSys.rel.rdev = getValue(contactSys.rel.r_dev) || getValue(contactSys.rel.rdev) || ''
                    normalized.contactSys.rel.mrid = contactSys.rel.mrid || ''
                }
            }
            // Normalize from contactSys structure if exists
            else if (data.contactSys) {
                normalized.contactSys.abs.rmin = getValue(data.contactSys.abs?.rmin) || ''
                normalized.contactSys.abs.rmax = getValue(data.contactSys.abs?.rmax) || ''
                normalized.contactSys.abs.mrid = data.contactSys.abs?.mrid || ''
                normalized.contactSys.rel.rref = getValue(data.contactSys.rel?.rref) || ''
                normalized.contactSys.rel.rdev = getValue(data.contactSys.rel?.rdev) || ''
                normalized.contactSys.rel.mrid = data.contactSys.rel?.mrid || ''
            }

            if (!normalized.limits) {
                normalized.limits = data.limits || 'Absolute'
            }

            return normalized
        },


        calculator() {
            var limits = this.assetData && this.assetData.assessmentLimits ? this.assetData.assessmentLimits : null
            if (!limits) { this.$message.error('Assessment limits not configured'); return }
            var cr = limits.contact_resistance
            var mode = limits.limits
            this.testData.table.table1.forEach(function (item) {
                var value = item.contact_resistance ? item.contact_resistance.value : ''
                var result
                if (mode === 'Absolute') {
                    result = this.assessAbsolute(value, cr.abs.r_min, cr.abs.r_max)
                } else {
                    result = this.assessRelative(value, cr.rel.r_ref, cr.rel.r_dev)
                }
                item.assessment.value = result
            }.bind(this))
            this.notifyAssessmentCalculated()
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
        },
        add() { },
        addTest() { },
        deleteTest() { },
        removeAll() { }
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

th {
    text-align: center;
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

.interrupter-warning-card {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 12px;
    padding: 12px 14px;
    border: 1px solid #e6a23c;
    border-radius: 6px;
    background: #fdf6ec;
    color: #303133;
}

.interrupter-warning-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #b36b00;
    font-weight: 600;
}

.interrupter-warning-form {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
}

.interrupter-warning-form .el-select {
    width: 140px;
}
</style>
