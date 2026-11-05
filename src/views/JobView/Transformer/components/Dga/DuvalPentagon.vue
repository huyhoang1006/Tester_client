<template>
    <div class="duval-pentagon">
        <div class="duval-pentagon__title">
            {{ title }}
            <info-tip :text="tip" />
        </div>
        <svg viewBox="-52 -50 104 100" role="img" :aria-label="title">
            <g class="zones">
                <polygon v-for="item in zones" :key="item.code" :points="toSvg(item.points)" :fill="item.color"
                    :class="{ 'is-dim': activeZone && activeZone !== item.code, 'is-active': activeZone === item.code }" />
            </g>
            <polygon class="outline" :points="outline" />
            <g class="axes">
                <line v-for="axis in axisLines" :key="axis.gas" x1="0" y1="0" :x2="axis.x" :y2="axis.y" />
            </g>
            <g class="zone-labels">
                <text v-for="label in zoneLabels" :key="label.code" :x="label.x" :y="label.y">{{ label.code }}</text>
            </g>
            <g class="summit-labels">
                <text v-for="axis in summitLabels" :key="'s-' + axis.gas" :x="axis.x" :y="axis.y"
                    :text-anchor="axis.anchor">{{ axis.label }}</text>
            </g>
            <g v-if="point" class="marker">
                <circle :cx="point.x" :cy="-point.y" r="1.9" />
                <line :x1="point.x - 1.2" :y1="-point.y - 1.2" :x2="point.x + 1.2" :y2="-point.y + 1.2" />
                <line :x1="point.x - 1.2" :y1="-point.y + 1.2" :x2="point.x + 1.2" :y2="-point.y - 1.2" />
                <title>{{ activeZone }} ({{ point.x.toFixed(1) }}, {{ point.y.toFixed(1) }})</title>
            </g>
        </svg>
        <div class="duval-pentagon__legend">
            <div v-for="item in zones" :key="'l-' + item.code" class="legend-item" :class="{ 'is-active': activeZone === item.code }">
                <span class="legend-swatch" :style="{ backgroundColor: item.color }"></span>
                <strong>{{ item.code }}</strong>
                <span>{{ item.name }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import InfoTip from './InfoTip.vue'
import { PENTAGON_AXES, PENTAGON_RADIUS, GAS_LABELS } from '@/utils/dga/config'

// Hệ toạ độ tiêu chuẩn có trục y hướng lên; SVG hướng xuống nên lật dấu y khi vẽ
export default {
    name: 'DuvalPentagon',
    components: { InfoTip },
    props: {
        title: { type: String, default: 'Pentagon' },
        tip: { type: String, default: '' },
        zones: { type: Array, default: () => [] },
        // { x, y } theo hệ toạ độ tiêu chuẩn, hoặc null
        point: { type: Object, default: null },
        activeZone: { type: String, default: '' }
    },
    computed: {
        summits() {
            return PENTAGON_AXES.map(axis => {
                const rad = axis.angle * Math.PI / 180
                return { gas: axis.gas, x: PENTAGON_RADIUS * Math.cos(rad), y: PENTAGON_RADIUS * Math.sin(rad) }
            })
        },
        outline() {
            return this.summits.map(p => `${p.x},${-p.y}`).join(' ')
        },
        axisLines() {
            return this.summits.map(p => ({ gas: p.gas, x: p.x, y: -p.y }))
        },
        summitLabels() {
            return this.summits.map(p => {
                const scale = 1.13
                return {
                    gas: p.gas,
                    label: GAS_LABELS[p.gas],
                    x: p.x * scale,
                    y: -p.y * scale + (p.y < 0 ? 3 : 0),
                    anchor: Math.abs(p.x) < 1 ? 'middle' : (p.x > 0 ? 'start' : 'end')
                }
            })
        },
        zoneLabels() {
            return this.zones.map(item => {
                const n = item.points.length
                const x = item.points.reduce((s, p) => s + p[0], 0) / n
                const y = item.points.reduce((s, p) => s + p[1], 0) / n
                return { code: item.code, x, y: -y }
            })
        }
    },
    methods: {
        toSvg(points) {
            return points.map(p => `${p[0]},${-p[1]}`).join(' ')
        }
    }
}
</script>

<style scoped>
.duval-pentagon {
    flex: 1 1 360px;
    min-width: 0;
    max-width: 560px;
}

.duval-pentagon__title {
    font-size: 13px;
    font-weight: 700;
    color: #303133;
    margin-bottom: 6px;
}

.duval-pentagon svg {
    display: block;
    width: 100%;
    height: auto;
}

.zones polygon {
    stroke: #ffffff;
    stroke-width: 0.3;
    transition: opacity 0.15s;
}

.zones polygon.is-dim {
    opacity: 0.45;
}

.zones polygon.is-active {
    stroke: #1f2937;
    stroke-width: 0.5;
}

.outline {
    fill: none;
    stroke: #303846;
    stroke-width: 0.5;
}

.axes line {
    stroke: rgba(55, 65, 81, 0.25);
    stroke-width: 0.2;
}

.zone-labels text {
    font-size: 3px;
    font-weight: 700;
    fill: #172033;
    text-anchor: middle;
    dominant-baseline: middle;
    pointer-events: none;
}

.summit-labels text {
    font-size: 3.2px;
    font-weight: 600;
    fill: #4b5563;
}

.marker circle {
    fill: #ffffff;
    stroke: #d93025;
    stroke-width: 0.6;
}

.marker line {
    stroke: #d93025;
    stroke-width: 0.5;
}

.duval-pentagon__legend {
    margin-top: 6px;
    font-size: 12px;
    color: #374151;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 6px;
    border-radius: 4px;
    border: 1px solid transparent;
}

.legend-item.is-active {
    background: #fff4e5;
    border-color: #f5a54a;
    font-weight: 600;
}

.legend-swatch {
    width: 14px;
    height: 14px;
    border-radius: 3px;
    flex: 0 0 14px;
    border: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
