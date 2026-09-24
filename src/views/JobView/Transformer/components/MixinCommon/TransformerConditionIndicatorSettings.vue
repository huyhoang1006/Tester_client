<template>
    <div class="transformer-ci-settings">
        <template v-if="settings && settings.type === 'dga'">
            <div class="transformer-ci-settings__scroll">
                <table class="transformer-ci-settings__table transformer-ci-settings__table--dga">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th v-for="column in settings.columns" :key="column.key">{{ column.label }}</th>
                            <th>Condition indicator</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in settings.rows" :key="row.status">
                            <td>{{ row.status }}</td>
                            <td v-for="column in settings.columns" :key="column.key">
                                {{ row.values[column.key] }}
                            </td>
                            <td>
                                <span class="transformer-ci-settings__status" :class="statusClass(row.indicator)">
                                    {{ row.indicator }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>

        <div v-else-if="settings" class="transformer-ci-settings__scroll">
            <table class="transformer-ci-settings__table transformer-ci-settings__table--standard">
                <thead>
                    <tr>
                        <th>Criterion</th>
                        <th>Good</th>
                        <th>Fair</th>
                        <th>Poor</th>
                        <th>Bad</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in settings.rows" :key="row.criterion">
                        <td>{{ row.criterion }}</td>
                        <td v-for="(range, index) in row.ranges" :key="index">
                            <span class="transformer-ci-settings__status" :class="statusClass(statuses[index])">
                                {{ range }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else class="transformer-ci-settings__empty">
            No automatic condition indicator thresholds are defined for this test.
        </div>

        <p v-if="settings && settings.note" class="transformer-ci-settings__note">
            {{ settings.note }}
        </p>
    </div>
</template>

<script>
import { getTransformerConditionIndicatorSettings } from '@/utils/transformerConditionIndicator'

export default {
    name: 'TransformerConditionIndicatorSettings',
    props: {
        testCode: { type: String, required: true }
    },
    data() {
        return {
            statuses: ['Good', 'Fair', 'Poor', 'Bad']
        }
    },
    computed: {
        settings() {
            return getTransformerConditionIndicatorSettings(this.testCode)
        }
    },
    methods: {
        statusClass(status) {
            return `transformer-ci-settings__status--${String(status).toLowerCase()}`
        }
    }
}
</script>

<style scoped>
.transformer-ci-settings__scroll {
    overflow-x: auto;
}

.transformer-ci-settings__table {
    width: 100%;
    border-collapse: collapse;
    color: #30343b;
    font-size: 13px;
}

.transformer-ci-settings__table--dga {
    min-width: 980px;
}

.transformer-ci-settings__table--standard {
    table-layout: fixed;
}

.transformer-ci-settings__table th,
.transformer-ci-settings__table td {
    padding: 10px 12px;
    border: 1px solid #d8dee8;
    text-align: center;
    white-space: nowrap;
}

.transformer-ci-settings__table th:first-child,
.transformer-ci-settings__table td:first-child {
    text-align: left;
}

.transformer-ci-settings__table th {
    background: #f2f5f9;
    font-weight: 600;
}

.transformer-ci-settings__table--standard th,
.transformer-ci-settings__table--standard td {
    padding: 10px 8px;
    white-space: normal;
    overflow-wrap: normal;
    word-break: normal;
}

.transformer-ci-settings__table--standard th:first-child {
    width: 24%;
}

.transformer-ci-settings__table--standard .transformer-ci-settings__status {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    line-height: 1.35;
}

.transformer-ci-settings__status {
    display: inline-block;
    min-width: 92px;
    padding: 5px 8px;
    border-radius: 3px;
    font-weight: 600;
}

.transformer-ci-settings__status--good {
    color: #000000;
    background: #92d050;
}

.transformer-ci-settings__status--fair {
    color: #000000;
    background: #ffff00;
}

.transformer-ci-settings__status--poor {
    color: #000000;
    background: #ffc000;
}

.transformer-ci-settings__status--bad {
    color: #000000;
    background: #ff0000;
}

.transformer-ci-settings__note {
    margin: 12px 0 0;
    color: #606773;
    line-height: 1.5;
}

.transformer-ci-settings__empty {
    padding: 22px;
    border: 1px dashed #c8d0dc;
    color: #69717e;
    text-align: center;
}
</style>

<style>
.test-ui .el-select.Good .el-input__inner,
.test-ui .el-select.Good .el-input.is-disabled .el-input__inner {
    color: #000000 !important;
    background-color: #92d050 !important;
    border-color: #6fa337 !important;
    -webkit-text-fill-color: #000000 !important;
    opacity: 1;
}

.test-ui .el-select.Fair .el-input__inner,
.test-ui .el-select.Fair .el-input.is-disabled .el-input__inner {
    color: #000000 !important;
    background-color: #ffff00 !important;
    border-color: #cccc00 !important;
    -webkit-text-fill-color: #000000 !important;
    opacity: 1;
}

.test-ui .el-select.Poor .el-input__inner,
.test-ui .el-select.Poor .el-input.is-disabled .el-input__inner {
    color: #000000 !important;
    background-color: #ffc000 !important;
    border-color: #cc9900 !important;
    -webkit-text-fill-color: #000000 !important;
    opacity: 1;
}

.test-ui .el-select.Bad .el-input__inner,
.test-ui .el-select.Bad .el-input.is-disabled .el-input__inner {
    color: #000000 !important;
    background-color: #ff0000 !important;
    border-color: #cc0000 !important;
    -webkit-text-fill-color: #000000 !important;
    opacity: 1;
}

.test-ui .el-select.Good .el-select__caret {
    color: #000000 !important;
}

.test-ui .el-select.Fair .el-select__caret,
.test-ui .el-select.Poor .el-select__caret {
    color: #000000 !important;
}

.test-ui .el-select.Bad .el-select__caret {
    color: #000000 !important;
}
</style>
