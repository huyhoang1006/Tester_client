<template>
    <div class="fmeca-view" v-loading="loading">
        <div class="fmeca-toolbar">
            <el-select
                v-if="records.length"
                v-model="selectedId"
                size="small"
                placeholder="FMECA standard"
                aria-label="FMECA standard">
                <el-option
                    v-for="record in records"
                    :key="record.localId"
                    :value="record.localId"
                    :label="`${record.name || record.id} - ${record.version || 'Unversioned'}`" />
            </el-select>
            <el-button
                v-if="activeSection === 'weighting'"
                type="primary"
                size="small"
                :disabled="!selectedRecord"
                title="Calculate FMECA weighting"
                @click="calculate">
                <i class="fa-solid fa-calculator" aria-hidden="true"></i>
                Calculate
            </el-button>
        </div>

        <el-alert v-if="loadError" type="error" :title="loadError" :closable="false" show-icon />
        <div v-else-if="!selectedRecord && !loading" class="fmeca-empty">No FMECA available</div>

        <el-tabs v-if="selectedRecord" v-model="activeSection" type="border-card" class="fmeca-tabs">
            <el-tab-pane name="fmeca">
                <span slot="label"><i class="fa-solid fa-table-list" aria-hidden="true"></i> FMECA table</span>
                <el-table :data="fmecaTableData" row-key="excelRow" border height="calc(100vh - 285px)" empty-text="No FMECA table data">
                    <el-table-column prop="no" label="No" width="100" align="center" />
                    <el-table-column prop="failureMode" label="Failure Mode" min-width="280">
                        <template slot-scope="{ row }">
                            <span :style="indentStyle(row)">{{ row.failureMode }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="sof" label="SoF" width="85" align="center" />
                    <el-table-column prop="pof" label="PoF" width="85" align="center" />
                    <el-table-column prop="conditionIndicator" label="Condition Indicator" min-width="180" />
                    <el-table-column prop="test" label="Test" min-width="180" />
                    <el-table-column prop="sot" label="SoT" width="85" align="center" />
                    <el-table-column prop="rpn" label="RPN" width="100" align="center" />
                </el-table>
            </el-tab-pane>

            <el-tab-pane name="weighting">
                <span slot="label"><i class="fa-solid fa-scale-balanced" aria-hidden="true"></i> Weighting</span>
                <el-table :data="fmecaWeightingTableData" row-key="excelRow" border height="calc(100vh - 285px)" empty-text="No weighting data">
                    <el-table-column prop="no" label="No" width="80" align="center" />
                    <el-table-column prop="tranformerConditionCriteria" label="Transformer Condition Criteria" min-width="260" />
                    <el-table-column prop="totalRPN" label="Total RPN" min-width="120" align="right" />
                    <el-table-column prop="rpnProportion" label="RPN Proportion" min-width="130" align="right" />
                    <el-table-column prop="weightingFactor" label="Weighting Factor" min-width="130" align="right" />
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import { calculateFmeca, mapFmecaRows, mapWeightingRows } from './mapper'

export default {
    name: 'Fmeca',
    data() {
        return {
            records: [],
            selectedId: null,
            loading: false,
            loadError: '',
            loadRequestId: 0,
            activeSection: 'fmeca',
            calculatedFmecaRows: null,
            calculatedWeightingRows: null
        }
    },
    computed: {
        userId() {
            const user = this.$store && this.$store.state && this.$store.state.user
            return user && user.user_id
        },
        selectedRecord() {
            return this.records.find(record => record.localId === this.selectedId) || null
        },
        fmecaTableData() {
            if (this.calculatedFmecaRows) return this.calculatedFmecaRows
            return this.selectedRecord ? mapFmecaRows(this.selectedRecord.tableFmeca) : []
        },
        fmecaWeightingTableData() {
            if (this.calculatedWeightingRows) return this.calculatedWeightingRows
            return this.selectedRecord ? mapWeightingRows(this.selectedRecord.tableCalculate) : []
        }
    },
    watch: {
        userId: {
            immediate: true,
            handler() {
                this.loadFmeca()
            }
        },
        selectedId() {
            this.calculatedFmecaRows = null
            this.calculatedWeightingRows = null
        }
    },
    methods: {
        async loadFmeca() {
            const userId = this.userId
            const requestId = ++this.loadRequestId
            this.records = []
            this.selectedId = null
            this.loadError = ''
            this.loading = false
            if (!userId) return
            if (!window.electronAPI || !window.electronAPI.listFmeca) {
                this.loadError = 'FMECA data is unavailable'
                return
            }

            this.loading = true
            try {
                const records = await window.electronAPI.listFmeca(userId)
                if (this.loadRequestId !== requestId) return
                this.records = Array.isArray(records) ? records : []
                const selected = this.records.find(record => record.scope === 'demo') || this.records[0]
                this.selectedId = selected ? selected.localId : null
            } catch (error) {
                if (this.loadRequestId === requestId) this.loadError = error.message || 'Could not load FMECA'
            } finally {
                if (this.loadRequestId === requestId) this.loading = false
            }
        },
        indentStyle(row) {
            return { paddingLeft: `${Math.min(row.level || 0, 4) * 14}px` }
        },
        calculate() {
            if (!this.selectedRecord) return
            const result = calculateFmeca(
                mapFmecaRows(this.selectedRecord.tableFmeca),
                mapWeightingRows(this.selectedRecord.tableCalculate)
            )
            this.calculatedFmecaRows = result.fmecaRows
            this.calculatedWeightingRows = result.weightingRows
            this.$message.success('FMECA weighting calculated')
        }
    }
}
</script>

<style scoped>
.fmeca-view {
    min-height: 180px;
}

.fmeca-toolbar {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-bottom: 12px;
}

.fmeca-toolbar .el-select {
    width: min(100%, 360px);
}

.fmeca-toolbar .el-button i {
    margin-right: 6px;
}

.fmeca-empty {
    padding: 32px 12px;
    text-align: center;
    color: #6b7280;
}

.fmeca-view ::v-deep .el-table .cell {
    white-space: normal;
    word-break: break-word;
    line-height: 1.4;
}

.fmeca-tabs {
    border: 1px solid #d8dee8;
    box-shadow: none;
}

.fmeca-tabs ::v-deep .el-tabs__header {
    background: #f5f7fa;
}

.fmeca-tabs ::v-deep .el-tabs__item {
    min-width: 150px;
    text-align: center;
}

.fmeca-tabs ::v-deep .el-tabs__item i {
    margin-right: 6px;
}

.fmeca-tabs ::v-deep .el-tabs__content {
    padding: 12px;
}
</style>
