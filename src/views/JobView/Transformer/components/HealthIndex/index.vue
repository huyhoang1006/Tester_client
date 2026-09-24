<template>
    <div id="health-index">
        <header class="health-overview">
            <div class="health-overview__title">
                <span class="health-overview__icon"><i class="fa-solid fa-heart-pulse"></i></span>
                <div>
                    <h2>Health index</h2>
                    <span>{{ assessedRows.length }} assessed {{ assessedRows.length === 1 ? 'test' : 'tests' }}</span>
                </div>
            </div>
            <div class="health-overview__metrics">
                <div class="health-metric">
                    <span class="health-metric__label">Average case</span>
                    <strong class="health-metric__value">{{ formatNumber(averageHealthIndex) }}</strong>
                    <span class="health-metric__status" :class="nameColor(judge_average(averageHealthIndex))">
                        {{ judge_average(averageHealthIndex) || 'Not assessed' }}
                    </span>
                </div>
                <div class="health-metric">
                    <span class="health-metric__label">Worst case</span>
                    <strong class="health-metric__value">{{ formatNumber(worstHealthIndex) }}</strong>
                    <span class="health-metric__status" :class="nameColor(judge_worst(worstHealthIndex))">
                        {{ judge_worst(worstHealthIndex) || 'Not assessed' }}
                    </span>
                </div>
            </div>
        </header>

        <section class="health-results">
            <div class="health-results__heading">
                <h3>Test contribution</h3>
            </div>
            <div class="health-table-wrap">
            <table class="table-strip-input-data health-table">
                <colgroup>
                    <col class="health-table__test">
                    <col class="health-table__score">
                    <col class="health-table__assessment">
                    <col class="health-table__total">
                    <col class="health-table__score">
                    <col class="health-table__assessment">
                    <col class="health-table__total">
                </colgroup>
                <thead>
                    <tr>
                        <th rowspan="2">Test</th>
                        <th colspan="3" class="health-table__group health-table__group--average">Average case</th>
                        <th colspan="3" class="health-table__group health-table__group--worst">Worst case</th>
                    </tr>
                    <tr>
                        <th>Score</th>
                        <th>Assessment</th>
                        <th>Weighted score</th>
                        <th>Score</th>
                        <th>Assessment</th>
                        <th>Weighted score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in assessedRows" :key="item.mrid || index">
                        <td class="health-table__test-name">{{ item.name }}</td>
                        <td>{{ formatNumber(itemScore(item, 'average')) }}</td>
                        <td>
                            <span class="assessment-chip" :class="nameColor(scoreAssessment(itemScore(item, 'average')))">
                                {{ scoreAssessment(itemScore(item, 'average')) }}
                            </span>
                        </td>
                        <td>{{ formatNumber(itemTotal(item, 'average')) }}</td>
                        <td>{{ formatNumber(itemScore(item, 'worst')) }}</td>
                        <td>
                            <span class="assessment-chip" :class="nameColor(scoreAssessment(itemScore(item, 'worst')))">
                                {{ scoreAssessment(itemScore(item, 'worst')) }}
                            </span>
                        </td>
                        <td>{{ formatNumber(itemTotal(item, 'worst')) }}</td>
                    </tr>
                    <tr v-if="!assessedRows.length">
                        <td colspan="7" class="health-table__empty">No assessed tests yet</td>
                    </tr>
                </tbody>
            </table>
            </div>
        </section>
    </div>
</template>

<script>
import demoFmeca from '@/config/fmeca/transformer-condition-assessment-rev1.json'

const CONDITION_INDICATOR_SCORES = {
    good: 3,
    fair: 2,
    poor: 1,
    bad: 0
}

const cellValue = cell => {
    if (cell && typeof cell === 'object' && Object.prototype.hasOwnProperty.call(cell, 'cached')) {
        return cell.cached
    }
    return cell
}

const demoWeightingFactor = criterion => {
    const rows = demoFmeca && demoFmeca.tableCalculate &&
        demoFmeca.tableCalculate.weightingFactors &&
        demoFmeca.tableCalculate.weightingFactors.rows
    if (!Array.isArray(rows)) return null
    const normalizedCriterion = String(criterion).trim().toLowerCase()
    const row = rows.slice(1).find(cells => (
        String(cellValue(cells && cells[1]) || '').trim().toLowerCase() === normalizedCriterion
    ))
    return row ? cellValue(row[4]) : null
}

const DGA_WEIGHTING_FACTOR = demoWeightingFactor('DGA main tank')

const indicatorScore = field => {
    const value = field && typeof field === 'object' ? field.value : field
    return CONDITION_INDICATOR_SCORES[String(value || '').trim().toLowerCase()]
}

const testRows = testData => {
    const table = testData && testData.table
    if (!table) return []
    return Object.keys(table).reduce((rows, key) => (
        Array.isArray(table[key]) ? rows.concat(table[key]) : rows
    ), [])
}

export default {

    props: {
        data: {
            type: Array,
            required: true,
            default() {
                return []
            }
        },
        properties: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            isMonitor : false,
            data__ : []
        }
    },

    computed: {
        data_() {
            return Object.values(this.data).map(item => this.withCalculatedScores(item))
        },
        averageHealthIndex() {
            return this.resolveHealthIndex('average', this.properties.average_health_index)
        },
        worstHealthIndex() {
            return this.resolveHealthIndex('worst', this.properties.worst_health_index)
        },
        assessedRows() {
            return this.data_.filter(item => (
                this.isNumber(this.itemScore(item, 'average')) ||
                this.isNumber(this.itemScore(item, 'worst'))
            ))
        }
    },

    async beforeMount() {
    },

    mounted: function() {
    },

    methods: {
        withCalculatedScores(item) {
            if (!item || item.testTypeCode !== 'Dga') return item
            const scores = testRows(item.data)
                .map(row => indicatorScore(row && row.condition_indicator))
                .filter(score => Number.isFinite(score))
            if (!scores.length) return item
            return {
                ...item,
                average_score: scores.reduce((sum, score) => sum + score, 0) / scores.length,
                worst_score: Math.min.apply(null, scores),
                weighting_factor: DGA_WEIGHTING_FACTOR
            }
        },
        itemScore(item, mode) {
            const prefix = mode === 'average' ? 'average_score' : 'worst_score'
            if (['BushingPrimC1', 'BushingPrimC2', 'WindingDfCap'].includes(item.testTypeCode)) {
                if (item.name.includes('(DF)')) return item[`${prefix}_df`]
                if (item.name.includes('(C)')) return item[`${prefix}_c`]
            }
            return item[prefix]
        },
        itemWeightingFactor(item) {
            if (['BushingPrimC1', 'BushingPrimC2', 'WindingDfCap'].includes(item.testTypeCode)) {
                if (item.name.includes('(DF)')) return item.weighting_factor_df
                if (item.name.includes('(C)')) return item.weighting_factor_c
            }
            return item.weighting_factor
        },
        itemTotal(item, mode) {
            const score = this.itemScore(item, mode)
            const weightingFactor = this.itemWeightingFactor(item)
            return this.isNumber(score) && this.isNumber(weightingFactor)
                ? Number(score) * Number(weightingFactor)
                : null
        },
        scoreAssessment(score) {
            if (!this.isNumber(score)) return '--'
            const value = Number(score)
            if (value >= 2.5) return 'Good'
            if (value >= 1.5) return 'Fair'
            if (value >= 0.5) return 'Poor'
            return 'Bad'
        },
        resolveHealthIndex(mode, savedValue) {
            const totals = this.data_.map(item => this.itemTotal(item, mode)).filter(value => value !== null)
            if (totals.length) return totals.reduce((sum, value) => sum + value, 0)
            return savedValue
        },
        isNumber(value) {
            return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
        },
        formatNumber(value) {
            return this.isNumber(value) ? Number(value).toFixed(4) : '--'
        },
        judge_worst(worsrt_score) {
            if(8 <= parseFloat(worsrt_score) && parseFloat(worsrt_score) <= 10) {
                return "Good"
            }
            else if (6 <= parseFloat(worsrt_score) && parseFloat(worsrt_score) < 8) {
                return "Fair"
            } else if (4 <= parseFloat(worsrt_score) && parseFloat(worsrt_score) < 6) {
                return "Poor"
            } else if (2 <= parseFloat(worsrt_score) && parseFloat(worsrt_score) < 4) {
                return "Bad"
            } else if (parseFloat(worsrt_score) < 2) {
                return "Unacceptable"
            } else {
                return ''
            }
        },
        judge_average(average_score) {
            if(8 <= parseFloat(average_score) && parseFloat(average_score) <= 10) {
                return "Good"
            }
            else if (6 <= parseFloat(average_score) && parseFloat(average_score) < 8) {
                return "Fair"
            } else if (4 <= parseFloat(average_score) && parseFloat(average_score) < 6) {
                return "Poor"
            } else if (2 <= parseFloat(average_score) && parseFloat(average_score) < 4) {
                return "Bad"
            } else if (parseFloat(average_score) < 2) {
                return "Unacceptable"
            } else {
                return ''
            }
        },
        nameColor(data) {
            if(data === this.$constant.GOOD) {
                return 'Good'
            }
            else if(data === this.$constant.FAIR) {
                return 'Fair'
            }
            else if(data === this.$constant.POOR) {
                return 'Poor'
            }
            else if(data === this.$constant.BAD) {
                return 'Bad'
            }
            else if(data === 'Unacceptable') {
                return 'Unacceptable'
            }
            else {
                return;
            }
        }             
    }
}
</script>

<style lang="scss" scoped>
#health-index {
    box-sizing: border-box;
    width: 100%;
    height: calc(100vh - 150px);
    padding: 14px 12px 24px;
    overflow-y: auto;
    overflow-x: hidden;
}

.health-overview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 84px;
    padding: 14px 18px;
    border: 1px solid #d7dee9;
    border-top: 3px solid #0b3aa4;
    border-radius: 6px;
    background: #fff;
}

.health-overview__title {
    display: flex;
    align-items: center;
    gap: 12px;
}

.health-overview__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 6px;
    background: #e9effc;
    color: #0b3aa4;
    font-size: 18px;
}

.health-overview__title h2,
.health-results__heading h3 {
    margin: 0;
    color: #202733;
    letter-spacing: 0;
}

.health-overview__title h2 {
    font-size: 18px;
}

.health-overview__title div > span {
    display: block;
    margin-top: 4px;
    color: #77808d;
    font-size: 12px;
}

.health-overview__metrics {
    display: flex;
    gap: 10px;
}

.health-metric {
    display: grid;
    grid-template-columns: auto auto;
    align-items: center;
    column-gap: 16px;
    row-gap: 5px;
    min-width: 220px;
    padding: 10px 12px;
    border-left: 3px solid #a9b5c8;
    background: #f6f8fb;
}

.health-metric__label {
    color: #5f6875;
    font-size: 12px;
    font-weight: 600;
}

.health-metric__value {
    justify-self: end;
    color: #202733;
    font-size: 20px;
    font-weight: 700;
}

.health-metric__status {
    grid-column: 1 / -1;
    justify-self: stretch;
    padding: 4px 10px;
    border-radius: 4px;
    color: #495260;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
}

.health-results {
    box-sizing: border-box;
    width: 100%;
    margin-top: 16px;
    border: 1px solid #d7dee9;
    border-radius: 6px;
    background: #fff;
    overflow: hidden;
}

.health-results__heading {
    padding: 13px 16px;
    border-bottom: 1px solid #d7dee9;
    background: #f6f8fb;
}

.health-results__heading h3 {
    font-size: 14px;
    font-weight: 600;
}

.health-table-wrap {
    width: 100%;
    overflow-x: hidden;
}

.health-table {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
}

.health-table__score {
    width: 9%;
}

.health-table__test {
    width: 28%;
}

.health-table__assessment {
    width: 13%;
}

.health-table__total {
    width: 13%;
}

.health-table th,
.health-table td {
    box-sizing: border-box;
    height: 42px;
    padding: 7px 10px;
    border-right: 1px solid #e0e5ed;
    border-bottom: 1px solid #e0e5ed;
    color: #394250;
    vertical-align: middle;
}

.health-table th:last-child,
.health-table td:last-child {
    border-right: 0;
}

.health-table tbody tr:last-child td {
    border-bottom: 0;
}

.health-table thead th {
    background: #edf1f6;
    color: #323b48;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
    white-space: normal;
}

.health-table__group {
    height: 36px !important;
    color: #173261 !important;
    font-size: 13px !important;
}

.health-table__group--average {
    background: #e9f0fb !important;
}

.health-table__group--worst {
    background: #f0edf8 !important;
}

.health-table tbody tr:nth-child(even) td {
    background: #fafbfd;
}

.health-table tbody tr:hover td {
    background: #f2f6fc;
}

.health-table tbody td:not(:first-child) {
    text-align: center;
}

.health-table__test-name {
    color: #273142 !important;
    font-weight: 600;
    overflow-wrap: anywhere;
}

.assessment-chip {
    display: inline-block;
    width: auto !important;
    min-width: 72px;
    padding: 4px 9px;
    border-radius: 4px;
    color: #111;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
}

.health-table__empty {
    height: 74px;
    color: #9098a4;
    text-align: center !important;
}

@media (max-width: 900px) {
    .health-overview {
        flex-direction: column;
        align-items: stretch;
        gap: 14px;
    }

    .health-overview__metrics {
        width: 100%;
    }

    .health-metric {
        flex: 1;
        min-width: 0;
    }
}

.Good {
    background: #92D050;
}

.Fair {
    background: #FFFF00;
}

.Poor {
    background: #FFC000;
}

.Bad {
    background: #FF0000;
}

.Unacceptable {
    background: #a80000;
    color: #fff;
}
</style>
