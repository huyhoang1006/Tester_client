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
                <div class="health-case-column">
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

                <div class="confidence-card">
                    <div class="confidence-card__heading">
                        <span>Assessment confidence</span>
                        <el-popover placement="bottom-end" width="270" trigger="hover">
                            <div class="confidence-help">
                                <strong>Missing core test data:</strong>
                                <ul v-if="assessmentConfidence.missing.length">
                                    <li v-for="test in assessmentConfidence.missing" :key="test">{{ test }}</li>
                                </ul>
                                <span v-else>No missing core test.</span>
                            </div>
                            <button slot="reference" class="confidence-info" aria-label="Show missing core tests">i</button>
                        </el-popover>
                    </div>
                    <strong class="confidence-card__value" :class="confidenceClass">
                        {{ assessmentConfidence.label }}
                    </strong>
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
import {calculateWeighting, toEditableFmeca} from '@/views/Fmeca/mapper'
import {calculateAssessmentConfidence, normalizeAssessedRows} from './calculation'

const CONDITION_INDICATOR_SCORES = {
    good: 3,
    fair: 2,
    poor: 1,
    bad: 0
}

const HEALTH_CRITERIA = [
    {
        key: 'oil-breakdown-voltage',
        name: 'Oil breakdown voltage',
        testTypeCodes: ['MeasurementOfOil'],
        indicatorKey: 'condition_indicator',
        weightingCriterion: 'Oil test main tank'
    },
    {
        key: 'dga-main-tank',
        name: 'DGA',
        testTypeCodes: ['Dga'],
        indicatorKey: 'condition_indicator',
        weightingCriterion: 'DGA main tank'
    },
    {
        key: 'insulation-resistance',
        name: 'Insulation resistance',
        testTypeCodes: ['InsulationResistance'],
        indicatorKey: 'condition_indicator',
        weightingCriterion: 'Insulation resistance'
    },
    {
        key: 'ratio-test',
        name: 'Ratio test',
        testTypeCodes: ['RatioPrimSec'],
        indicatorKey: 'condition_indicator',
        weightingCriterion: 'Ratio test'
    },
    {
        key: 'winding-df',
        name: 'Winding DF',
        testTypeCodes: ['WindingDfCap'],
        indicatorKey: 'condition_indicator_df',
        weightingCriterion: 'Winding PF/DF',
        legacyScoreSuffix: '_df'
    },
    {
        key: 'winding-capacitance',
        name: 'Winding capacitance',
        testTypeCodes: ['WindingDfCap'],
        indicatorKey: 'condition_indicator_c',
        weightingCriterion: 'Winding capacitance',
        legacyScoreSuffix: '_c'
    },
    {
        key: 'dc-winding-resistance',
        name: 'DC winding resistance',
        testTypeCodes: ['DCWindingPrim', 'DCWindingSec', 'DCWindingTert'],
        indicatorKey: 'condition_indicator',
        weightingCriterion: 'DC winding resistance',
        averagePerTest: true
    },
    {
        key: 'bushing-df-c1',
        name: 'Bushing DF C1',
        testTypeCodes: ['BushingPrimC1', 'BushingSecC1', 'BushingTertC1'],
        indicatorKey: 'condition_indicator_df',
        weightingCriterion: 'Bushing PF/DF',
        legacyScoreSuffix: '_df'
    },
    {
        key: 'exciting-current',
        name: 'Exciting current',
        testTypeCodes: ['ExcitingCurrent'],
        indicatorKey: 'condition_indicator',
        weightingCriterion: 'Excitation current'
    },
    {
        key: 'bushing-capacitance-c1',
        name: 'Bushing capacitance C1',
        testTypeCodes: ['BushingPrimC1', 'BushingSecC1', 'BushingTertC1'],
        indicatorKey: 'condition_indicator_c',
        weightingCriterion: 'Bushing C1 capacitance',
        legacyScoreSuffix: '_c'
    }
]

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
            data__ : [],
            fmecaWeightingFactors: null
        }
    },

    computed: {
        userId() {
            const user = this.$store && this.$store.state && this.$store.state.user
            return user && user.user_id ? user.user_id : null
        },
        data_() {
            const tests = Object.values(this.data || {})
            return HEALTH_CRITERIA.map(criterion => this.buildContribution(criterion, tests))
        },
        averageHealthIndex() {
            return this.resolveHealthIndex('average', this.properties.average_health_index)
        },
        worstHealthIndex() {
            return this.resolveHealthIndex('worst', this.properties.worst_health_index)
        },
        assessedRows() {
            return normalizeAssessedRows(this.data_)
        },
        assessmentConfidence() {
            return calculateAssessmentConfidence(this.data_, this.fmecaWeightingFactors !== null)
        },
        confidenceClass() {
            const classes = {
                'Very high confidence': 'Good',
                'High confidence': 'Fair',
                'Moderate confidence': 'Poor',
                'Low confidence': 'Bad',
                Insufficient: 'Unacceptable'
            }
            return classes[this.assessmentConfidence.label] || ''
        }
    },

    watch: {
        userId: {
            immediate: true,
            handler() {
                this.loadFmecaWeightingFactors()
            }
        }
    },

    methods: {
        async loadFmecaWeightingFactors() {
            if (!this.userId || !window.electronAPI || !window.electronAPI.listFmeca) {
                this.fmecaWeightingFactors = null
                return
            }
            try {
                const records = await window.electronAPI.listFmeca(this.userId)
                const source = Array.isArray(records)
                    ? records.find(record => record.isHiSource)
                    : null
                if (!source) {
                    this.fmecaWeightingFactors = null
                    return
                }
                const model = toEditableFmeca(source.tableFmeca, source.tableCalculate)
                const weighting = calculateWeighting(model.components)
                this.fmecaWeightingFactors = weighting.rows.reduce((result, row) => {
                    result[row.test] = row
                    return result
                }, {})
            } catch (error) {
                this.fmecaWeightingFactors = null
            }
        },
        weightingCriterion(criterion) {
            if (this.fmecaWeightingFactors === null) return null
            return Object.prototype.hasOwnProperty.call(this.fmecaWeightingFactors, criterion)
                ? this.fmecaWeightingFactors[criterion]
                : null
        },
        average(values) {
            return values.length
                ? values.reduce((sum, value) => sum + value, 0) / values.length
                : null
        },
        legacyScore(item, criterion, mode) {
            const suffix = criterion.legacyScoreSuffix || ''
            const value = item && item[`${mode}_score${suffix}`]
            return this.isNumber(value) ? Number(value) : null
        },
        summarizeTest(item, criterion) {
            const scores = testRows(item && item.data)
                .map(row => indicatorScore(row && row[criterion.indicatorKey]))
                .filter(score => Number.isFinite(score))
            if (scores.length) {
                return {
                    scores,
                    average: this.average(scores),
                    worst: Math.min.apply(null, scores)
                }
            }
            const average = this.legacyScore(item, criterion, 'average')
            const worst = this.legacyScore(item, criterion, 'worst')
            return {
                scores: [],
                average,
                worst
            }
        },
        buildContribution(criterion, tests) {
            const matchingTests = tests.filter(item => (
                item && criterion.testTypeCodes.includes(item.testTypeCode)
            ))
            const summaries = matchingTests.map(item => this.summarizeTest(item, criterion))
            let averageScore = null
            let worstScore = null

            if (criterion.averagePerTest) {
                const averageScores = summaries.map(summary => summary.average).filter(this.isNumber)
                const worstScores = summaries.map(summary => summary.worst).filter(this.isNumber)
                averageScore = this.average(averageScores.map(Number))
                // The FMECA workbook averages each winding's worst score before
                // applying the single DC winding resistance weighting factor.
                worstScore = this.average(worstScores.map(Number))
            } else {
                const rowScores = summaries.reduce((scores, summary) => scores.concat(summary.scores), [])
                if (rowScores.length) {
                    averageScore = this.average(rowScores)
                    worstScore = Math.min.apply(null, rowScores)
                } else {
                    const averageScores = summaries.map(summary => summary.average).filter(this.isNumber)
                    const worstScores = summaries.map(summary => summary.worst).filter(this.isNumber)
                    averageScore = this.average(averageScores.map(Number))
                    worstScore = worstScores.length ? Math.min.apply(null, worstScores.map(Number)) : null
                }
            }

            const weighting = this.weightingCriterion(criterion.weightingCriterion)
            return {
                mrid: criterion.key,
                name: criterion.name,
                core_test_name: criterion.weightingCriterion,
                average_score: averageScore,
                worst_score: worstScore,
                source_rpn: weighting ? weighting.totalRPN : null,
                source_weighting_factor: weighting ? weighting.weightingFactor : null
            }
        },
        itemScore(item, mode) {
            return item[mode === 'average' ? 'average_score' : 'worst_score']
        },
        itemWeightingFactor(item) {
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
            const totals = this.assessedRows.map(item => this.itemTotal(item, mode)).filter(value => value !== null)
            if (totals.length) return totals.reduce((sum, value) => sum + value, 0)
            return this.fmecaWeightingFactors === null ? savedValue : null
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
    display: grid;
    grid-template-columns: minmax(340px, 1fr) minmax(210px, 0.65fr);
    gap: 10px;
    width: min(690px, 68%);
}

.health-case-column {
    display: grid;
    gap: 7px;
}

.health-metric {
    display: grid;
    grid-template-columns: minmax(92px, 1fr) 82px minmax(112px, 1fr);
    align-items: center;
    column-gap: 12px;
    min-width: 0;
    padding: 8px 10px;
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
    justify-self: stretch;
    padding: 4px 10px;
    border-radius: 4px;
    color: #495260;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
}

.confidence-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    padding: 12px;
    border-left: 3px solid #0b3aa4;
    background: #f6f8fb;
}

.confidence-card__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    color: #5f6875;
    font-size: 12px;
    font-weight: 600;
}

.confidence-info {
    display: inline-grid;
    place-items: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: 1px solid #8291a8;
    border-radius: 50%;
    background: #fff;
    color: #33445f;
    font-size: 12px;
    font-weight: 700;
    cursor: help;
}

.confidence-card__value {
    display: block;
    margin-top: 12px;
    padding: 9px 10px;
    border-radius: 4px;
    color: #202733;
    font-size: 14px;
    text-align: center;
}

.confidence-help {
    color: #344054;
    font-size: 13px;
    line-height: 1.45;
}

.confidence-help strong {
    display: block;
    margin-bottom: 6px;
}

.confidence-help ul {
    margin: 0;
    padding-left: 20px;
}

.confidence-help li + li {
    margin-top: 3px;
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
}

@media (max-width: 620px) {
    .health-overview__metrics {
        grid-template-columns: 1fr;
    }

    .health-metric {
        grid-template-columns: 1fr auto;
    }

    .health-metric__status {
        grid-column: 1 / -1;
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
