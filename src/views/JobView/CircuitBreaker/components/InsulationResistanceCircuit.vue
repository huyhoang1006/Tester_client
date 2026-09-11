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

        <div class="table-scroll"><table class="table-strip-input-data test-table insulation-resistance-table" style="font-size: 12px;">
            <colgroup>
                <col class="number-column">
                <col class="terminal-column">
                <col class="terminal-link-column">
                <col class="terminal-column">
                <col class="value-column">
                <col class="value-column">
                <col class="assessment-column">
                <col class="condition-column">
                <col class="action-column">
                <col class="action-column">
            </colgroup>
            <thead>
                <tr>
                    <th>No</th>
                    <th class="terminal-col">Terminal 1</th>
                    <th class="terminal-link-col"><i class="fa-solid fa-arrows-left-right"></i></th>
                    <th class="terminal-col">Terminal 2</th>
                    <th>Test voltage (V)</th>
                    <th>R60s (M&#8486;)</th>
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
                    <td class="terminal-cell">
                        <el-select class="terminal-select" size="mini" multiple
                            :value="terminalValues(item, 'terminal1')" placeholder="Select terminal"
                            @change="updateTerminalSide(item, 'terminal1', $event)">
                            <el-option v-for="terminal in availableTerminalOptions(item, 'terminal1')"
                                :key="'left-' + terminal" :label="terminal" :value="terminal">
                                <span :style="terminalStyle(terminal)">
                                    <i v-if="terminalColor(terminal)" class="fa-solid fa-circle phase-dot"
                                        :style="{ color: terminalColor(terminal) }"></i>{{ terminal }}
                                </span>
                            </el-option>
                        </el-select>
                    </td>
                    <td class="terminal-link-cell"><i class="fa-solid fa-arrows-left-right"></i></td>
                    <td class="terminal-cell">
                        <el-select class="terminal-select" size="mini" multiple
                            :value="terminalValues(item, 'terminal2')" placeholder="Select terminal"
                            @change="updateTerminalSide(item, 'terminal2', $event)">
                            <el-option v-for="terminal in availableTerminalOptions(item, 'terminal2')"
                                :key="'right-' + terminal" :label="terminal" :value="terminal">
                                <span :style="terminalStyle(terminal)">
                                    <i v-if="terminalColor(terminal)" class="fa-solid fa-circle phase-dot"
                                        :style="{ color: terminalColor(terminal) }"></i>{{ terminal }}
                                </span>
                            </el-option>
                        </el-select>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive"
                            v-model="item.test_voltage.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.r60s.value"></el-input>
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
            <div class="cb-assessment-card">
                <div class="cb-assessment-card-header"><i class="fa-solid fa-caret-up"></i> Insulation resistance</div>
                <div class="cb-assessment-card-body">
            <el-alert type="warning" title="Insulation resistance assessment limits have not been configured in the asset view yet." :closable="false"/>
                </div>
            </div>
            <template v-slot:footer>
                <span class="dialog-footer-actions">
                    <el-button @click="openAssessmentDialog = false">Close</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import CircuitBreakerTestMap from '@/config/test-definitions/CircuitBreaker'
import * as common from '../../Common/index'
import { readSides, writeSides } from '../../Common/terminalSelect'
import { buildCircuitBreakerTerminals, PHASE_COLORS } from '../../Common/terminalOptions'
import assessmentMixin from './assessmentMixin'
export default {
    mixins: [assessmentMixin],
    name: 'InsulationResistanceCircuit',
    data() {
        return {
            openAssessmentDialog: false,
            backupLimits: null,
            openConditionIndicatorDialog: false,
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
    computed: {
        testData() {
            return this.data
        },
        assetData() {
            return this.asset
        },
        terminalOptions() {
            return buildCircuitBreakerTerminals()
        },
        rowData() {
            return common.buildEmptyTestRow(CircuitBreakerTestMap['InsulationResistanceCircuit'].columns)
        }
    },
    watch: {
        assetData: {
            deep: true,
            immediate: true,
            handler: function (newVal) {
                this.asset_ = newVal
                // Sync limits to testData if asset_ has limits
                if (this.asset_ && this.asset_.limits && this.testData) {
                    this.$set(this.testData, 'limits', this.asset_.limits)
                }
            }
        },
        openAssessmentDialog: {
            handler: function (newVal) {
                // When opening dialog, sync limits from asset_ to testData if available
                if (newVal && this.asset_ && this.asset_.limits && this.testData) {
                    this.$set(this.testData, 'limits', this.asset_.limits)
                } else if (newVal && this.testData && !this.testData.limits) {
                    // Initialize limits if not set
                    this.$set(this.testData, 'limits', 'Absolute')
                }
            }
        }
    },
    methods: {
        terminalColor(terminal) {
            return PHASE_COLORS[terminal] || null
        },
        terminalStyle(terminal) {
            const color = this.terminalColor(terminal)
            return color ? { color, fontWeight: 600 } : {}
        },
        terminalValues(row, side) {
            return readSides(row, this.terminalOptions)[side]
        },
        availableTerminalOptions(row, side) {
            const sides = readSides(row, this.terminalOptions)
            const otherSide = side === 'terminal1' ? sides.terminal2 : sides.terminal1
            const existingValues = sides[side].filter(terminal => !this.terminalOptions.includes(terminal))
            return [...this.terminalOptions, ...existingValues].filter(terminal => !otherSide.includes(terminal))
        },
        updateTerminalSide(row, side, values) {
            const sides = readSides(row, this.terminalOptions)
            sides[side] = values
            writeSides(row, sides.terminal1, sides.terminal2, this.terminalOptions)
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
            this.testData.table.table1.forEach(function(item) { item.assessment.value = '' })
            this.$message.warning('Assessment limits for insulation resistance not yet configured in asset')
        },
        clear() {
            common.clearEditableTestValues(this.testData && this.testData.table)
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

.insulation-resistance-table {
    width: 1120px;
    min-width: 1120px;
    table-layout: fixed;
}

.number-column {
    width: 44px;
}

.terminal-column,
.terminal-col {
    width: 190px;
}

.terminal-link-column,
.terminal-link-col {
    width: 44px;
    text-align: center;
}

.value-column {
    width: 132px;
}

.assessment-column,
.assessment-col {
    width: 140px;
}

.condition-column,
.condition-indicator-col {
    width: 160px;
}

.action-column {
    width: 44px;
}

.terminal-cell {
    width: 190px;
    min-width: 190px;
    max-width: 190px;
    box-sizing: border-box;
}

.terminal-link-cell {
    text-align: center;
    color: #c0c4cc;
}

.test-table .terminal-select {
    width: 100%;
    min-width: 0;
    max-width: none;
}

::v-deep(.test-table .terminal-select .el-input) {
    width: 100%;
    min-width: 0;
    max-width: none;
}

::v-deep(.test-table .terminal-select .el-select__tags) {
    display: flex;
    width: calc(100% - 32px);
    max-width: calc(100% - 32px) !important;
    flex-wrap: nowrap;
    overflow: hidden;
}

::v-deep(.test-table .terminal-select .el-select__tags > span) {
    display: flex;
    min-width: 0;
    flex-wrap: nowrap;
}

.phase-dot {
    margin-right: 6px;
    font-size: 8px;
    vertical-align: middle;
}
</style>
