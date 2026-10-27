<template>
    <div class="winding-terminal-picker" :title="selected.join(', ')">
        <el-select class="winding-terminal-select" size="mini" multiple
            :value="selected" placeholder="" @change="$emit('change', $event)">
            <el-option v-for="terminal in options" :key="terminal" :label="terminal" :value="terminal">
                <span class="terminal-option-dot" :class="toneClass(terminal)"></span>{{ terminal }}
            </el-option>
        </el-select>
        <div class="winding-terminal-chips" aria-hidden="true">
            <span v-for="terminal in selected" :key="terminal"
                class="winding-terminal-chip" :class="toneClass(terminal)">{{ terminal }}</span>
            <span v-if="!selected.length" class="winding-terminal-placeholder">Select terminal</span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'WindingTerminalPicker',
    props: {
        selected: { type: Array, default: () => [] },
        options: { type: Array, default: () => [] }
    },
    methods: {
        toneClass(terminal) {
            if (terminal === 'Prim') return 'terminal-prim'
            if (terminal === 'Sec' || terminal.endsWith(' Sec')) return 'terminal-sec'
            if (terminal === 'Tert') return 'terminal-tert'
            if (terminal === 'GND') return 'terminal-gnd'
            return 'terminal-custom'
        }
    }
}
</script>

<style lang="scss" scoped>
.winding-terminal-picker {
    position: relative;
    width: 100%;
    min-width: 0;
    height: 28px;
}

.winding-terminal-select {
    width: 100%;
}

::v-deep(.winding-terminal-select .el-input) {
    width: 100%;
    min-width: 0;
}

::v-deep(.winding-terminal-select .el-select__tags) {
    display: none;
}

.winding-terminal-chips {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 8px;
    right: 27px;
    display: flex;
    align-items: center;
    gap: 4px;
    overflow: hidden;
    white-space: nowrap;
    pointer-events: none;
}

.winding-terminal-chip {
    display: inline-block;
    flex: 0 1 auto;
    min-width: 0;
    max-width: 104px;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 3px 7px;
    border: 1px solid;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    line-height: 14px;
}

.winding-terminal-placeholder {
    color: #a8b0bd;
}

.terminal-option-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 7px;
    border-radius: 50%;
    vertical-align: middle;
    background: currentColor;
}

.terminal-prim { color: #2457a0; border-color: #bfd2ef; background-color: #edf3fc; }
.terminal-sec { color: #14735e; border-color: #b7dfd2; background-color: #eaf7f2; }
.terminal-tert { color: #74509a; border-color: #ddc9ef; background-color: #f6effb; }
.terminal-gnd { color: #596475; border-color: #d1d7e0; background-color: #f4f6f8; }
.terminal-custom { color: #40546f; border-color: #cad5e5; background-color: #f0f4fa; }
</style>
