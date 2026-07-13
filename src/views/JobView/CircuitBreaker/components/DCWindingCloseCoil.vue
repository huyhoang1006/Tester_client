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
            </div>
        </div>

        <div class="table-scroll"><table class="table-strip-input-data test-table" style="width: 100%; font-size: 12px;">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Close coil no.</th>
                    <th>Rmeas (&#8486;)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                    <th @click="add()" class="action-col th-btn" title="Add row"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col th-btn th-btn-danger" title="Remove all"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                    <td>
                        {{ index + 1 }}
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive"
                            v-model="item.close_coil_no.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.r_meas.value"></el-input>
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
                        <el-select :class="nameColor(item.condition_indicator.value)" id="condition" type="text"
                            size="mini" v-model="item.condition_indicator.value">
                            <el-option value="Good">Good</el-option>
                            <el-option value="Fair">Fair</el-option>
                            <el-option value="Poor">Poor</el-option>
                            <el-option value="Bad">Bad</el-option>
                        </el-select>
                    </td>
                    <td>
                        <el-button size="mini" type="primary" class="row-btn" title="Insert row below" @click="addTest(index)">
                            <i class="fa-solid fa-plus"></i>
                        </el-button>
                    </td>
                    <td>
                        <el-button size="mini" type="danger" class="row-btn" title="Delete row" @click="deleteTest(index)">
                            <i class="fas fa-trash"></i>
                        </el-button>
                    </td>
                </tr>
            </tbody>
        </table></div>

        <el-dialog class="cb-assessment-dialog" append-to-body title="Assessment settings" :visible.sync="openAssessmentDialog" width="min(1040px, 92vw)">
            <el-radio-group v-model="assetData.assessmentLimits.limits" style="margin-bottom:16px;">
                <el-radio label="Absolute">Absolute limits</el-radio>
                <el-radio label="Relative">Relative limits</el-radio>
            </el-radio-group>
            <div class="cb-assessment-card">
                <div class="cb-assessment-card-header"><i class="fa-solid fa-caret-up"></i> Coil Characteristics</div>
                <div class="cb-assessment-card-body">
            <el-form size="small" label-position="left" label-width="140px">
                <template v-if="assetData.assessmentLimits.limits === 'Absolute'">
                    <el-form-item label="Minimum (Ω)">
                        <el-input type="text" number="positive"
                            v-model="assetData.assessmentLimits.coil_characteristics.abs.close_coil_resistance.min.value" />
                    </el-form-item>
                    <el-form-item label="Maximum (Ω)">
                        <el-input type="text" number="positive"
                            v-model="assetData.assessmentLimits.coil_characteristics.abs.close_coil_resistance.max.value" />
                    </el-form-item>
                </template>
                <template v-else>
                    <el-form-item label="Reference (Ω)">
                        <el-input type="text" number="positive"
                            v-model="assetData.assessmentLimits.coil_characteristics.rel.close_coil_resistance.ref.value" />
                    </el-form-item>
                    <el-form-item label="- Deviation (Ω)">
                        <el-input type="text" number="positive"
                            v-model="assetData.assessmentLimits.coil_characteristics.rel.close_coil_resistance.minus_dev.value" />
                    </el-form-item>
                    <el-form-item label="+ Deviation (Ω)">
                        <el-input type="text" number="positive"
                            v-model="assetData.assessmentLimits.coil_characteristics.rel.close_coil_resistance.plus_dev.value" />
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
import CircuitBreakerTestMap from '@/config/test-definitions/CircuitBreaker'
import * as common from '../../Common/index'
import assessmentMixin from './assessmentMixin'
export default {
    mixins: [assessmentMixin],
    name: 'DCWindingCloseCoil',
    data() {
        return {
            openAssessmentDialog: false,
            backupLimits: null,
            assessmentIpcChannel: 'updateCoilCharacteristicsLimits',
            assessmentSectionKeys: ['close_coil_resistance'],
            openConditionIndicatorDialog: false,
            asset_: {
                coilCharacter: {
                    abs: Array(8).fill(null).map(() => ({ min: '', max: '', mrid: '' })),
                    rel: Array(8).fill(null).map(() => ({ ref: '', devZ: '', devN: '', mrid: '' }))
                },
                limits: 'Absolute'
            },
            coilCharacteristics: [
                "Peak close coil current",
                "Peak trip coil current",
                "Average close coil current",
                "Average trip coil current",
                "Average close coil voltage",
                "Average trip coil voltage",
                "Close coil resistance",
                "Trip coil resistance",
            ],
        }
    },
    beforeMount() {
        const asset = {
            id: this.asset.id,
            assessmentLimits: this.asset_
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
            return this.asset
        },
        rowData() {
            return common.buildEmptyTestRow(CircuitBreakerTestMap['DCWindingCloseCoil'].columns)
        }
    },
    watch: {
        // assetData: {
        //     deep: true,
        //     immediate: true,
        //     handler: function (newVal) {
        //         if (newVal && Object.keys(newVal).length > 0) {
        //             this.asset_ = this.normalizeAssessmentLimits(newVal)
        //             // Update backup for reset
        //             const dataTemp = JSON.parse(JSON.stringify(this.asset_ || {}))
        //             this.back_asset = dataTemp
        //             // Sync limits to testData
        //             if (this.asset_.limits && this.testData) {
        //                 this.$set(this.testData, 'limits', this.asset_.limits)
        //             }
        //         }
        //     }
        // },
        // 'asset_.limits': {
        //     immediate: true,
        //     handler: function (newVal) {
        //         // Sync asset_.limits to testData.limits
        //         if (newVal && this.testData) {
        //             this.$set(this.testData, 'limits', newVal)
        //         }
        //     }
        // },
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

            // Normalize coilCharacter from coil_characteristics structure if exists
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
                // Keep coilCharacter structure but ensure values are normalized
                normalized.coilCharacter = {
                    abs: Array(8).fill(null).map((_, index) => ({
                        min: getValue(data.coilCharacter.abs?.[index]?.min) || '',
                        max: getValue(data.coilCharacter.abs?.[index]?.max) || '',
                        mrid: data.coilCharacter.abs?.[index]?.mrid || ''
                    })),
                    rel: Array(8).fill(null).map((_, index) => ({
                        ref: getValue(data.coilCharacter.rel?.[index]?.ref) || '',
                        devZ: getValue(data.coilCharacter.rel?.[index]?.devZ) || '',
                        devN: getValue(data.coilCharacter.rel?.[index]?.devN) || '',
                        mrid: data.coilCharacter.rel?.[index]?.mrid || ''
                    }))
                }
            } else {
                // Initialize default coilCharacter structure
                normalized.coilCharacter = {
                    abs: Array(8).fill(null).map(() => ({ min: '', max: '', mrid: '' })),
                    rel: Array(8).fill(null).map(() => ({ ref: '', devZ: '', devN: '', mrid: '' }))
                }
            }

            // Ensure abs and rel arrays have 8 items
            if (!normalized.coilCharacter.abs || normalized.coilCharacter.abs.length !== 8) {
                normalized.coilCharacter.abs = Array(8).fill(null).map((_, index) =>
                    normalized.coilCharacter.abs && normalized.coilCharacter.abs[index]
                        ? normalized.coilCharacter.abs[index]
                        : { min: '', max: '', mrid: '' }
                )
            }
            if (!normalized.coilCharacter.rel || normalized.coilCharacter.rel.length !== 8) {
                normalized.coilCharacter.rel = Array(8).fill(null).map((_, index) =>
                    normalized.coilCharacter.rel && normalized.coilCharacter.rel[index]
                        ? normalized.coilCharacter.rel[index]
                        : { ref: '', devZ: '', devN: '', mrid: '' }
                )
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


        add() {
            this.testData.table.table1.push(JSON.parse(JSON.stringify(this.rowData)))
        },
        removeAll() {
            this.$confirm('This will delete the file. Continue?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(() => {
                this.testData.table.table1 = []
            }).catch(() => { })
        },
        deleteTest(index) {
            this.testData.table.table1.splice(index, 1)
        },
        addTest(index) {
            const data = JSON.parse(JSON.stringify(this.rowData))
            this.testData.table.table1.splice(index + 1, 0, data)
        },
        calculator() {
            var limits = this.assetData && this.assetData.assessmentLimits ? this.assetData.assessmentLimits : null
            if (!limits) { this.$message.error('Assessment limits not configured'); return }
            var cc = limits.coil_characteristics
            var mode = limits.limits
            this.testData.table.table1.forEach(function (item) {
                var value = item.r_meas ? item.r_meas.value : ''
                var result
                if (mode === 'Absolute') {
                    result = this.assessAbsolute(value, cc.abs.close_coil_resistance.min, cc.abs.close_coil_resistance.max)
                } else {
                    result = this.assessRelativeAsym(value, cc.rel.close_coil_resistance.ref, cc.rel.close_coil_resistance.minus_dev, cc.rel.close_coil_resistance.plus_dev)
                }
                item.assessment.value = result
            }.bind(this))
            this.notifyAssessmentCalculated()
        },
        clear() {
            this.testData.table.table1.forEach(row => {
                Object.keys(row).forEach(key => {
                    if (key === "mrid") return;
                    if (row[key] && typeof row[key] === "object" && "value" in row[key]) {
                        row[key].value = ""
                    }
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
@import "~@/views/JobView/Common/testUi.scss";
table,
th,
tr,
td {
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
