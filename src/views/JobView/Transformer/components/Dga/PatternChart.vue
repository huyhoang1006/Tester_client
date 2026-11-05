<template>
    <div class="pattern-chart">
        <div class="pattern-chart__title">{{ chart.title }}</div>
        <svg :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="chart.title">
            <g class="grid">
                <g v-for="tick in ticks" :key="tick">
                    <line :x1="LEFT" :x2="W - 8" :y1="yOf(tick)" :y2="yOf(tick)" />
                    <text :x="LEFT - 6" :y="yOf(tick)">{{ tick }}</text>
                </g>
            </g>
            <text class="axis-title" :x="12" :y="TOP + PLOT_H / 2" :transform="`rotate(-90 12 ${TOP + PLOT_H / 2})`">Relative proportions (%)</text>
            <g v-for="(bar, index) in chart.bars" :key="bar.key">
                <rect class="measured" :x="groupX(index)" :y="yOf(bar.measured)" :width="BAR_W"
                    :height="Math.max(0, TOP + PLOT_H - yOf(bar.measured))">
                    <title>{{ bar.label }} measurement: {{ format(bar.measured) }}%</title>
                </rect>
                <rect class="standard" :x="groupX(index) + BAR_W + 2" :y="yOf(bar.standard)" :width="BAR_W"
                    :height="Math.max(0, TOP + PLOT_H - yOf(bar.standard))">
                    <title>{{ bar.label }} standard pattern: {{ bar.standard }}%</title>
                </rect>
                <text class="x-label" :x="groupX(index) + BAR_W + 1" :y="TOP + PLOT_H + 14">{{ bar.label }}</text>
            </g>
        </svg>
    </div>
</template>

<script>
const W = 340
const H = 210
const LEFT = 44
const TOP = 10
const PLOT_H = 160
const BAR_W = 14

export default {
    name: 'PatternChart',
    props: {
        chart: { type: Object, required: true }
    },
    data() {
        return { W, H, LEFT, TOP, PLOT_H, BAR_W, ticks: [0, 20, 40, 60, 80, 100] }
    },
    methods: {
        yOf(value) {
            const v = Math.max(0, Math.min(100, Number(value) || 0))
            return TOP + PLOT_H - PLOT_H * v / 100
        },
        groupX(index) {
            const n = this.chart.bars.length
            const slot = (W - 8 - LEFT) / n
            return LEFT + slot * index + (slot - (BAR_W * 2 + 2)) / 2
        },
        format(value) {
            return (Math.round(value * 10) / 10).toFixed(1)
        }
    }
}
</script>

<style scoped>
.pattern-chart {
    border: 1px solid #ebeef5;
    border-radius: 6px;
    padding: 8px;
    background: #fff;
}

.pattern-chart__title {
    font-size: 12px;
    font-weight: 700;
    color: #303133;
    text-align: center;
}

.pattern-chart svg {
    display: block;
    width: 100%;
    height: auto;
}

.grid line {
    stroke: #e5e7eb;
    stroke-width: 0.8;
}

.grid text {
    font-size: 9px;
    fill: #6b7280;
    text-anchor: end;
    dominant-baseline: middle;
}

.axis-title {
    font-size: 9px;
    fill: #6b7280;
    text-anchor: middle;
}

.measured {
    fill: #4a90e2;
}

.standard {
    fill: #bdbdbd;
}

.x-label {
    font-size: 9px;
    fill: #374151;
    text-anchor: middle;
}
</style>
