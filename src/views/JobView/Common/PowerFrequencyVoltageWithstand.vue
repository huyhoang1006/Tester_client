<template>
    <div class="test-ui power-frequency-test">
        <div class="test-toolbar">
            <div class="test-toolbar-group">
                <el-button size="mini" @click="clear"><i class="fas fa-xmark"></i> Clear all</el-button>
            </div>
            <div class="test-toolbar-group">
                <el-button size="mini" :type="compareOpen ? 'primary' : ''" @click="$emit('toggle-compare')">
                    <i class="fa-solid fa-scale-balanced"></i> Compare with previous results
                </el-button>
            </div>
        </div>
        <div class="table-scroll">
            <table class="table-strip-input-data test-table">
                <colgroup>
                    <col style="width: 48px">
                    <col style="width: 225px">
                    <col style="width: 28px">
                    <col style="width: 225px">
                    <col style="width: 130px">
                    <col style="width: 130px">
                    <col style="width: 155px">
                    <col style="width: 138px">
                    <col style="width: 145px">
                    <col style="width: 44px">
                    <col style="width: 44px">
                </colgroup>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Terminal 1</th>
                        <th><i class="fa-solid fa-arrows-left-right"></i></th>
                        <th>Terminal 2</th>
                        <th>Test voltage (kV)</th>
                        <th>Frequency (Hz)</th>
                        <th>Test duration (min)</th>
                        <th>Assessment</th>
                        <th>Condition indicator</th>
                        <th class="action-col th-btn" title="Add row" @click="add"><i class="fa-solid fa-plus pointer"></i></th>
                        <th class="action-col th-btn th-btn-danger" title="Remove all" @click="removeAll"><i class="fa-solid fa-trash pointer"></i></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in testData.table.table1" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>
                            <div class="terminal-picker">
                                <el-select class="terminal-select" size="mini" multiple
                                    :value="terminalValues(item, 'terminal1')" placeholder=""
                                    @change="updateTerminalSide(item, 'terminal1', $event)">
                                    <el-option v-for="terminal in availableTerminalOptions(item, 'terminal1')"
                                        :key="'left-' + terminal" :label="terminal" :value="terminal">
                                        <span :style="terminalStyle(terminal)">
                                            <i v-if="terminalColor(terminal)" class="fa-solid fa-circle phase-dot"
                                                :style="{ color: terminalColor(terminal) }"></i>{{ terminal }}
                                        </span>
                                    </el-option>
                                </el-select>
                                <div class="terminal-chips" aria-hidden="true">
                                    <span v-for="terminal in terminalValues(item, 'terminal1')" :key="terminal"
                                        class="terminal-chip" :style="chipStyle(terminal)">{{ terminal }}</span>
                                    <span v-if="!terminalValues(item, 'terminal1').length" class="terminal-placeholder">Select terminal</span>
                                </div>
                            </div>
                        </td>
                        <td><i class="fa-solid fa-arrows-left-right"></i></td>
                        <td>
                            <div class="terminal-picker">
                                <el-select class="terminal-select" size="mini" multiple
                                    :value="terminalValues(item, 'terminal2')" placeholder=""
                                    @change="updateTerminalSide(item, 'terminal2', $event)">
                                    <el-option v-for="terminal in availableTerminalOptions(item, 'terminal2')"
                                        :key="'right-' + terminal" :label="terminal" :value="terminal">
                                        <span :style="terminalStyle(terminal)">
                                            <i v-if="terminalColor(terminal)" class="fa-solid fa-circle phase-dot"
                                                :style="{ color: terminalColor(terminal) }"></i>{{ terminal }}
                                        </span>
                                    </el-option>
                                </el-select>
                                <div class="terminal-chips" aria-hidden="true">
                                    <span v-for="terminal in terminalValues(item, 'terminal2')" :key="terminal"
                                        class="terminal-chip" :style="chipStyle(terminal)">{{ terminal }}</span>
                                    <span v-if="!terminalValues(item, 'terminal2').length" class="terminal-placeholder">Select terminal</span>
                                </div>
                            </div>
                        </td>
                        <td><el-input-number size="mini" :controls="false" :min="0.001" :precision="3"
                            :value="numberValue(item.test_voltage.value)" @change="setNumber(item.test_voltage, $event)" /></td>
                        <td><el-input-number size="mini" :controls="false" :min="0.001" :precision="3"
                            :value="numberValue(item.frequency.value)" @change="setNumber(item.frequency, $event)" /></td>
                        <td><el-input-number size="mini" :controls="false" :min="0.001" :precision="3"
                            :value="numberValue(item.duration.value)" @change="setNumber(item.duration, $event)" /></td>
                        <td>
                            <el-select v-model="item.assessment.value" size="mini" clearable placeholder="Select">
                                <el-option value="Pass" label="Pass" />
                                <el-option value="Fail" label="Fail" />
                            </el-select>
                        </td>
                        <td>
                            <el-select v-model="item.condition_indicator.value" size="mini" clearable placeholder="Select">
                                <el-option value="Good" label="Good" />
                                <el-option value="Fair" label="Fair" />
                                <el-option value="Poor" label="Poor" />
                                <el-option value="Bad" label="Bad" />
                            </el-select>
                        </td>
                        <td><el-button size="mini" type="primary" title="Insert row below" @click="addTest(index)"><i class="fa-solid fa-plus"></i></el-button></td>
                        <td><el-button size="mini" type="danger" title="Delete row" @click="deleteTest(index)"><i class="fas fa-trash"></i></el-button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import * as common from './index'
import { readSides, writeSides } from './terminalSelect'
import { buildCircuitBreakerTerminals, PHASE_COLORS } from './terminalOptions'

export default {
    name: 'PowerFrequencyVoltageWithstand',
    props: {
        data: { type: Object, required: true },
        definition: { type: Object, required: true },
        compareOpen: { type: Boolean, default: false }
    },
    computed: {
        testData() { return this.data },
        terminalOptions() { return buildCircuitBreakerTerminals() },
        rowData() { return common.buildEmptyTestRow(this.definition.columns) }
    },
    methods: {
        terminalColor(terminal) { return PHASE_COLORS[terminal] || null },
        terminalStyle(terminal) {
            const color = this.terminalColor(terminal)
            return color ? { color, fontWeight: 600 } : {}
        },
        chipStyle(terminal) {
            const color = this.terminalColor(terminal)
            const backgrounds = { A: '#fff0f0', B: '#fff8df', C: '#edf8ef' }
            return color ? { color, borderColor: color, backgroundColor: backgrounds[terminal] } : {}
        },
        terminalValues(row, side) { return readSides(row, this.terminalOptions)[side] },
        availableTerminalOptions(row, side) {
            const sides = readSides(row, this.terminalOptions)
            const other = side === 'terminal1' ? sides.terminal2 : sides.terminal1
            return this.terminalOptions.filter(value => !other.includes(value))
        },
        updateTerminalSide(row, side, values) {
            const sides = readSides(row, this.terminalOptions)
            sides[side] = values
            writeSides(row, sides.terminal1, sides.terminal2, this.terminalOptions)
        },
        numberValue(value) {
            return value === '' || value === null || value === undefined ? undefined : Number(value)
        },
        setNumber(cell, value) {
            cell.value = value === null || value === undefined || Number.isNaN(value) ? '' : value
        },
        add() { this.testData.table.table1.push(JSON.parse(JSON.stringify(this.rowData))) },
        addTest(index) { this.testData.table.table1.splice(index + 1, 0, JSON.parse(JSON.stringify(this.rowData))) },
        deleteTest(index) { this.testData.table.table1.splice(index, 1) },
        removeAll() {
            this.$confirm('Remove all rows?', 'Warning', { type: 'warning' })
                .then(() => { this.testData.table.table1 = [] }).catch(() => {})
        },
        clear() { common.clearEditableTestValues(this.testData.table) }
    }
}
</script>

<style lang="scss" scoped>
@import "~@/views/JobView/Common/testUi.scss";
.power-frequency-test { width: 100%; font-size: 12px; }
.test-table { min-width: 1410px; table-layout: fixed; }
.test-table .el-input-number { width: 100%; }
.terminal-picker { position: relative; width: 100%; min-height: 28px; }
.test-table .terminal-select { width: 100%; min-width: 0; max-width: none; }
::v-deep(.test-table .terminal-select .el-input) { width: 100%; min-width: 0; max-width: none; }
::v-deep(.test-table .terminal-select .el-select__tags) { display: none; }
.terminal-chips { position: absolute; top: 0; bottom: 0; left: 8px; right: 25px; display: flex; align-items: center; gap: 4px; overflow: hidden; pointer-events: none; }
.terminal-chip { display: inline-flex; align-items: center; height: 20px; padding: 0 6px; border: 1px solid #d5dae1; border-radius: 3px; background: #f5f7fa; color: #606266; font-size: 11px; font-weight: 600; line-height: 1; }
.terminal-placeholder { color: #b7bec9; }
.phase-dot { margin-right: 5px; font-size: 8px; }
</style>
