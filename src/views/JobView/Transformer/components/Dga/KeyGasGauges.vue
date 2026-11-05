<template>
    <div class="key-gas-gauges">
        <div v-for="col in columns" :key="col.key" class="gauge">
            <div class="gauge__title">{{ col.label }}</div>
            <svg viewBox="0 0 90 230" role="img" :aria-label="col.label">
                <!-- Vùng màu xếp chồng từ dưới lên -->
                <rect v-for="(band, index) in col.bands" :key="index" :x="BOX_X" :width="BOX_W"
                    :y="yOf(col, band.to)" :height="Math.max(0, yOf(col, band.from) - yOf(col, band.to))"
                    :fill="colors[band.level]" />
                <rect class="box" :x="BOX_X" :y="TOP" :width="BOX_W" :height="H" />
                <!-- Trục Y + vạch chia -->
                <g class="ticks">
                    <g v-for="tick in ticksOf(col)" :key="tick">
                        <line :x1="BOX_X - 4" :x2="BOX_X" :y1="yOf(col, tick)" :y2="yOf(col, tick)" />
                        <text :x="BOX_X - 6" :y="yOf(col, tick)">{{ formatTick(tick) }}</text>
                    </g>
                </g>
                <!-- Kim đo -->
                <g v-if="col.hasValue" class="needle">
                    <line :x1="BOX_X - 3" :x2="BOX_X + BOX_W + 3" :y1="yOf(col, col.value)" :y2="yOf(col, col.value)" />
                    <circle :cx="BOX_X - 3" :cy="yOf(col, col.value)" r="2.6" />
                    <circle :cx="BOX_X + BOX_W + 3" :cy="yOf(col, col.value)" r="2.6" />
                </g>
            </svg>
            <div class="gauge__value">{{ col.hasValue ? formatValue(col.value) + ' ppm' : '—' }}</div>
            <div class="gauge__status" :class="'is-' + levelOf(col)">{{ col.hasValue ? col.status : '' }}</div>
        </div>
    </div>
</template>

<script>
import { STATUS_COLORS } from '@/utils/dga/config'

const TOP = 8
const H = 214
const BOX_X = 44
const BOX_W = 30

export default {
    name: 'KeyGasGauges',
    props: {
        columns: { type: Array, default: () => [] }
    },
    data() {
        return { TOP, H, BOX_X, BOX_W, colors: STATUS_COLORS }
    },
    methods: {
        // y = đáy − H·C/C_max (kim vượt thang thì chặn ở đỉnh)
        yOf(col, value) {
            const ratio = Math.max(0, Math.min(1, (Number(value) || 0) / col.max))
            return TOP + H - H * ratio
        },
        ticksOf(col) {
            return [0, ...col.thresholds, Math.round(col.max)]
        },
        formatTick(value) {
            return value >= 10000 ? `${Math.round(value / 1000)}k` : String(Math.round(value * 10) / 10)
        },
        formatValue(value) {
            return String(Math.round(value * 100) / 100)
        },
        levelOf(col) {
            return col.hasValue ? col.level : 'none'
        }
    }
}
</script>

<style scoped>
.key-gas-gauges {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.gauge {
    flex: 0 0 110px;
    text-align: center;
    font-size: 12px;
}

.gauge__title {
    font-weight: 700;
    color: #303133;
}

.gauge svg {
    display: block;
    width: 100%;
    height: auto;
}

.box {
    fill: none;
    stroke: #111827;
    stroke-width: 1.4;
}

.ticks line {
    stroke: #6b7280;
    stroke-width: 0.8;
}

.ticks text {
    font-size: 8px;
    fill: #4b5563;
    text-anchor: end;
    dominant-baseline: middle;
}

.needle line {
    stroke: #111827;
    stroke-width: 2;
}

.needle circle {
    fill: #111827;
}

.gauge__value {
    font-weight: 600;
    color: #303133;
}

.gauge__status {
    color: #606266;
    min-height: 16px;
}

.gauge__status.is-yellow { color: #a07c00; font-weight: 600; }
.gauge__status.is-orange { color: #c46a12; font-weight: 600; }
.gauge__status.is-red { color: #c62828; font-weight: 600; }
</style>
