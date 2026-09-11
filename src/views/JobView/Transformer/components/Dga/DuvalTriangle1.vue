<template>
    <div class="duval-triangle-one">
        <div v-if="samples.length === 0" class="duval-empty">
            Enter CH4, C2H4 and C2H2 values for at least one DGA sample.
        </div>

        <template v-else>
            <div class="duval-chart-wrap">
                <svg class="duval-chart" viewBox="0 0 760 560" role="img"
                    aria-label="Duval Triangle 1 diagnostic chart">
                    <g class="duval-zones">
                        <polygon v-for="item in renderedZones" :key="item.code"
                            :points="item.svgPoints" :fill="item.color" />
                    </g>

                    <g class="duval-grid">
                        <line v-for="line in gridLines" :key="line.key"
                            :x1="line.from.x" :y1="line.from.y"
                            :x2="line.to.x" :y2="line.to.y" />
                    </g>

                    <polygon class="duval-outline" :points="triangleOutline" />

                    <g class="duval-zone-labels">
                        <text v-for="label in zoneLabels" :key="label.code"
                            :x="label.point.x" :y="label.point.y">{{ label.code }}</text>
                    </g>

                    <g class="duval-axis-labels">
                        <text x="380" y="17" text-anchor="middle">100% CH4</text>
                        <text x="78" y="510" text-anchor="middle">100% C2H2</text>
                        <text x="682" y="510" text-anchor="middle">100% C2H4</text>
                        <text x="174" y="253" text-anchor="middle" transform="rotate(-60 174 253)">% CH4</text>
                        <text x="586" y="253" text-anchor="middle" transform="rotate(60 586 253)">% C2H4</text>
                        <text x="380" y="535" text-anchor="middle">% C2H2</text>
                    </g>

                    <g class="duval-samples">
                        <g v-for="sample in renderedSamples" :key="sample.index">
                            <circle :cx="sample.point.x" :cy="sample.point.y" r="8"
                                :fill="sample.color" />
                            <circle :cx="sample.point.x" :cy="sample.point.y" r="11"
                                fill="none" :stroke="sample.color" stroke-width="2" />
                            <text v-if="renderedSamples.length > 1"
                                :x="sample.point.x + 14" :y="sample.point.y - 11">
                                {{ sample.sampleNumber }}
                            </text>
                            <title>{{ tooltipText(sample) }}</title>
                        </g>
                    </g>
                </svg>
            </div>

            <div class="duval-results-wrap">
                <table class="duval-results">
                    <thead>
                        <tr>
                            <th>Sample</th>
                            <th>CH4 (%)</th>
                            <th>C2H4 (%)</th>
                            <th>C2H2 (%)</th>
                            <th>Diagnosis</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="sample in renderedSamples" :key="'result-' + sample.index">
                            <td>
                                <span class="sample-dot" :style="{ backgroundColor: sample.color }"></span>
                                {{ sample.label }}
                            </td>
                            <td>{{ formatPercent(sample.percentages.ch4) }}</td>
                            <td>{{ formatPercent(sample.percentages.c2h4) }}</td>
                            <td>{{ formatPercent(sample.percentages.c2h2) }}</td>
                            <td>
                                <strong>{{ sample.zone }}</strong>
                                <span class="diagnosis-text">{{ sample.diagnosis }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>
    </div>
</template>

<script>
import {
    DUVAL_TRIANGLE_1_ZONES,
    analyseDuvalTriangle1Rows
} from './duvalTriangle1'

const LEFT = 110
const TOP = 28
const WIDTH = 540
const HEIGHT = 468

const LABEL_POSITIONS = {
    PD: [99, 0.5, 0.5],
    D1: [25, 8, 67],
    D2: [18, 43, 39],
    DT: [48, 32, 20],
    T1: [88, 10, 2],
    T2: [64, 34, 2],
    T3: [23, 70, 7]
}

export default {
    name: 'DuvalTriangle1',
    props: {
        rows: { type: Array, default: () => [] }
    },
    computed: {
        samples() {
            return analyseDuvalTriangle1Rows(this.rows)
        },
        renderedZones() {
            return DUVAL_TRIANGLE_1_ZONES.map(item => ({
                ...item,
                svgPoints: item.points.map(this.toPointText).join(' ')
            }))
        },
        triangleOutline() {
            return [[100, 0, 0], [0, 100, 0], [0, 0, 100]]
                .map(this.toPointText)
                .join(' ')
        },
        zoneLabels() {
            return DUVAL_TRIANGLE_1_ZONES.map(item => ({
                code: item.code,
                point: this.toPoint(LABEL_POSITIONS[item.code])
            }))
        },
        gridLines() {
            const lines = []
            for (let value = 10; value < 100; value += 10) {
                lines.push({
                    key: `ch4-${value}`,
                    from: this.toPoint([value, 0, 100 - value]),
                    to: this.toPoint([value, 100 - value, 0])
                })
                lines.push({
                    key: `c2h4-${value}`,
                    from: this.toPoint([0, value, 100 - value]),
                    to: this.toPoint([100 - value, value, 0])
                })
                lines.push({
                    key: `c2h2-${value}`,
                    from: this.toPoint([0, 100 - value, value]),
                    to: this.toPoint([100 - value, 0, value])
                })
            }
            return lines
        },
        renderedSamples() {
            const colors = ['#0b57d0', '#d93025', '#188038', '#a142f4', '#e37400', '#007b83', '#5f6368']
            return this.samples.map((sample, index) => ({
                ...sample,
                color: colors[index % colors.length],
                point: this.toPoint([
                    sample.percentages.ch4,
                    sample.percentages.c2h4,
                    sample.percentages.c2h2
                ])
            }))
        }
    },
    methods: {
        toPoint(values) {
            const ch4 = Number(values[0]) || 0
            const c2h4 = Number(values[1]) || 0
            return {
                x: LEFT + WIDTH * (c2h4 + ch4 / 2) / 100,
                y: TOP + HEIGHT * (1 - ch4 / 100)
            }
        },
        toPointText(values) {
            const point = this.toPoint(values)
            return `${point.x},${point.y}`
        },
        formatPercent(value) {
            return Number(value).toFixed(2)
        },
        tooltipText(sample) {
            return `${sample.label}: ${sample.zone} - ${sample.diagnosis}; `
                + `CH4 ${this.formatPercent(sample.percentages.ch4)}%, `
                + `C2H4 ${this.formatPercent(sample.percentages.c2h4)}%, `
                + `C2H2 ${this.formatPercent(sample.percentages.c2h2)}%`
        }
    }
}
</script>

<style scoped>
.duval-triangle-one {
    width: 100%;
    min-width: 0;
}

.duval-chart-wrap {
    width: min(760px, 100%);
    margin: 0 auto 16px;
}

.duval-chart {
    display: block;
    width: 100%;
    height: auto;
}

.duval-zones polygon {
    stroke: #ffffff;
    stroke-width: 1.4;
    stroke-linejoin: round;
}

.duval-grid line {
    stroke: rgba(55, 65, 81, 0.18);
    stroke-width: 0.8;
    pointer-events: none;
}

.duval-outline {
    fill: none;
    stroke: #303846;
    stroke-width: 2;
    stroke-linejoin: round;
}

.duval-zone-labels text {
    fill: #172033;
    font-size: 15px;
    font-weight: 700;
    text-anchor: middle;
    dominant-baseline: middle;
    pointer-events: none;
}

.duval-axis-labels text {
    fill: #4b5563;
    font-size: 13px;
    font-weight: 600;
}

.duval-samples circle {
    stroke: #ffffff;
    stroke-width: 2;
}

.duval-samples text {
    fill: #111827;
    font-size: 13px;
    font-weight: 700;
    paint-order: stroke;
    stroke: #ffffff;
    stroke-width: 4px;
    stroke-linejoin: round;
}

.duval-results-wrap {
    max-width: 100%;
    overflow-x: auto;
    border: 1px solid #d9dee8;
}

.duval-results {
    width: 100%;
    min-width: 650px;
    border-collapse: collapse;
    table-layout: fixed;
}

.duval-results th,
.duval-results td {
    padding: 9px 12px;
    border-right: 1px solid #d9dee8;
    border-bottom: 1px solid #d9dee8;
    text-align: left;
    vertical-align: middle;
}

.duval-results th:last-child,
.duval-results td:last-child {
    border-right: 0;
}

.duval-results tbody tr:last-child td {
    border-bottom: 0;
}

.duval-results th {
    background: #f3f5f8;
    color: #4b5563;
    font-weight: 600;
}

.sample-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    margin-right: 7px;
    border-radius: 50%;
    vertical-align: 1px;
}

.diagnosis-text {
    margin-left: 8px;
    color: #5b6575;
}

.duval-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 260px;
    padding: 24px;
    color: #8b95a5;
    text-align: center;
    border: 1px dashed #cfd6e2;
}
</style>
