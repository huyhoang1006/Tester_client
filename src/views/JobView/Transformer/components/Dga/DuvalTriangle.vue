<template>
    <div class="duval-triangle">
        <div class="duval-triangle__chart">
            <svg viewBox="0 0 760 560" role="img" :aria-label="title">
                <g class="zones">
                    <polygon v-for="item in renderedZones" :key="item.code"
                        :points="item.svgPoints" :fill="item.color"
                        :class="{ 'is-dim': activeZone && activeZone !== item.code, 'is-active': activeZone === item.code }" />
                </g>
                <g class="grid">
                    <line v-for="line in gridLines" :key="line.key"
                        :x1="line.from.x" :y1="line.from.y" :x2="line.to.x" :y2="line.to.y" />
                </g>
                <polygon class="outline" :points="outline" />
                <g class="zone-labels">
                    <text v-for="label in zoneLabels" :key="label.code" :x="label.point.x" :y="label.point.y">{{ label.code }}</text>
                </g>
                <g class="axis-labels">
                    <text x="380" y="17" text-anchor="middle">100% CH₄</text>
                    <text x="78" y="510" text-anchor="middle">100% C₂H₂</text>
                    <text x="682" y="510" text-anchor="middle">100% C₂H₄</text>
                    <text x="174" y="253" text-anchor="middle" transform="rotate(-60 174 253)">% CH₄</text>
                    <text x="586" y="253" text-anchor="middle" transform="rotate(60 586 253)">% C₂H₄</text>
                    <text x="380" y="535" text-anchor="middle">% C₂H₂</text>
                </g>
                <!-- Điểm đo: vòng tròn trắng viền đỏ + dấu chéo đỏ -->
                <g v-if="marker" class="marker">
                    <circle :cx="marker.x" :cy="marker.y" r="10" />
                    <line :x1="marker.x - 6" :y1="marker.y - 6" :x2="marker.x + 6" :y2="marker.y + 6" />
                    <line :x1="marker.x - 6" :y1="marker.y + 6" :x2="marker.x + 6" :y2="marker.y - 6" />
                    <title>{{ markerTitle }}</title>
                </g>
            </svg>
        </div>

        <div class="duval-triangle__legend">
            <div class="legend-title">{{ title }}</div>
            <div v-for="item in zones" :key="'legend-' + item.code" class="legend-item"
                :class="{ 'is-active': activeZone === item.code }">
                <span class="legend-swatch" :style="{ backgroundColor: item.color }"></span>
                <strong>{{ item.code }}</strong>
                <span>{{ item.name }}</span>
            </div>
            <div v-if="percentages" class="legend-values">
                CH₄ {{ format(percentages.ch4) }}% · C₂H₄ {{ format(percentages.c2h4) }}% · C₂H₂ {{ format(percentages.c2h2) }}%
            </div>
        </div>
    </div>
</template>

<script>
// Tam giác Duval dùng chung cho Triangle 1 (thùng chính) và Triangle 2 (OLTC)
const LEFT = 110
const TOP = 28
const WIDTH = 540
const HEIGHT = 468

export default {
    name: 'DuvalTriangle',
    props: {
        title: { type: String, default: 'Duval Triangle' },
        zones: { type: Array, default: () => [] },
        // { ch4, c2h4, c2h2 } % hoặc null
        percentages: { type: Object, default: null },
        activeZone: { type: String, default: '' }
    },
    computed: {
        renderedZones() {
            return this.zones.map(item => ({ ...item, svgPoints: item.points.map(this.toPointText).join(' ') }))
        },
        outline() {
            return [[100, 0, 0], [0, 100, 0], [0, 0, 100]].map(this.toPointText).join(' ')
        },
        zoneLabels() {
            // Nhãn đặt tại trung bình các đỉnh của vùng
            return this.zones.map(item => {
                const n = item.points.length
                const avg = [0, 1, 2].map(i => item.points.reduce((s, p) => s + p[i], 0) / n)
                return { code: item.code, point: this.toPoint(item.labelAt || avg) }
            })
        },
        gridLines() {
            const lines = []
            for (let v = 10; v < 100; v += 10) {
                lines.push({ key: `a${v}`, from: this.toPoint([v, 0, 100 - v]), to: this.toPoint([v, 100 - v, 0]) })
                lines.push({ key: `b${v}`, from: this.toPoint([0, v, 100 - v]), to: this.toPoint([100 - v, v, 0]) })
                lines.push({ key: `c${v}`, from: this.toPoint([0, 100 - v, v]), to: this.toPoint([100 - v, 0, v]) })
            }
            return lines
        },
        marker() {
            if (!this.percentages) return null
            return this.toPoint([this.percentages.ch4, this.percentages.c2h4, this.percentages.c2h2])
        },
        markerTitle() {
            if (!this.percentages) return ''
            const p = this.percentages
            return `${this.activeZone}: CH₄ ${this.format(p.ch4)}%, C₂H₄ ${this.format(p.c2h4)}%, C₂H₂ ${this.format(p.c2h2)}%`
        }
    },
    methods: {
        toPoint(values) {
            const ch4 = Number(values[0]) || 0
            const c2h4 = Number(values[1]) || 0
            return { x: LEFT + WIDTH * (c2h4 + ch4 / 2) / 100, y: TOP + HEIGHT * (1 - ch4 / 100) }
        },
        toPointText(values) {
            const p = this.toPoint(values)
            return `${p.x},${p.y}`
        },
        format(value) {
            return Number(value).toFixed(1)
        }
    }
}
</script>

<style scoped>
.duval-triangle {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: flex-start;
}

.duval-triangle__chart {
    flex: 1 1 420px;
    max-width: 640px;
    min-width: 0;
}

.duval-triangle__chart svg {
    display: block;
    width: 100%;
    height: auto;
}

.zones polygon {
    stroke: #ffffff;
    stroke-width: 1.4;
    transition: opacity 0.15s;
}

.zones polygon.is-dim {
    opacity: 0.45;
}

.zones polygon.is-active {
    stroke: #1f2937;
    stroke-width: 2.5;
}

.grid line {
    stroke: rgba(55, 65, 81, 0.15);
    stroke-width: 0.8;
    pointer-events: none;
}

.outline {
    fill: none;
    stroke: #303846;
    stroke-width: 2;
}

.zone-labels text {
    fill: #172033;
    font-size: 15px;
    font-weight: 700;
    text-anchor: middle;
    dominant-baseline: middle;
    pointer-events: none;
}

.axis-labels text {
    fill: #4b5563;
    font-size: 13px;
    font-weight: 600;
}

.marker circle {
    fill: #ffffff;
    stroke: #d93025;
    stroke-width: 3;
}

.marker line {
    stroke: #d93025;
    stroke-width: 2.5;
}

.duval-triangle__legend {
    flex: 0 1 280px;
    font-size: 12px;
    color: #374151;
}

.legend-title {
    font-weight: 700;
    margin-bottom: 8px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 6px;
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

.legend-values {
    margin-top: 10px;
    color: #6b7280;
}
</style>
