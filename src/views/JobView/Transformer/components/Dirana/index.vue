<template>
    <section class="dirana-view">
        <div class="dirana-toolbar">
            <div class="dirana-heading">
                <strong>DIRANA measurements</strong>
                <span>{{ measurements.length }} measurements</span>
            </div>
            <el-radio-group v-model="sweep" size="small" @change="page = 1">
                <el-radio-button label="frequency">Frequency sweep</el-radio-button>
                <el-radio-button label="polarization">Polarization sweep</el-radio-button>
            </el-radio-group>
        </div>
        <div class="dirana-layout">
            <aside class="dirana-measurements">
                <button
                    v-for="(row, index) in measurements"
                    :key="row.mrid || index"
                    type="button"
                    class="dirana-measurement"
                    :class="{ active: selectedIndex === index }"
                    @click="selectMeasurement(index)">
                    <span class="dirana-measurement-name">{{ value(row, 'name') || `Measurement ${index + 1}` }}</span>
                    <span>{{ value(row, 'channel') }} · {{ value(row, 'temperature') }} °C</span>
                    <small>{{ value(row, 'measured_date') }}</small>
                </button>
                <div v-if="!measurements.length" class="dirana-empty">No measurements</div>
            </aside>
            <div class="dirana-points">
                <div class="dirana-point-heading">
                    <strong>{{ activeRow ? value(activeRow, 'name') : 'No measurement selected' }}</strong>
                    <span>{{ points.length }} points</span>
                </div>
                <el-table :data="pagedPoints" border stripe size="mini" height="470" empty-text="No sweep data">
                    <el-table-column type="index" label="No." width="72" :index="rowIndex" />
                    <template v-if="sweep === 'frequency'">
                        <el-table-column prop="frequency" label="Frequency (Hz)" min-width="140" />
                        <el-table-column prop="tangentDelta" label="Tangent delta (%)" min-width="145" />
                        <el-table-column prop="powerFactor" label="Power factor (%)" min-width="145" />
                        <el-table-column prop="capacitanceReal" label="C real (F)" min-width="145" />
                        <el-table-column prop="capacitanceImag" label="C imag (F)" min-width="145" />
                    </template>
                    <template v-else>
                        <el-table-column prop="time" label="Time (s)" min-width="160" />
                        <el-table-column prop="current" label="Current (A)" min-width="180" />
                    </template>
                </el-table>
                <el-pagination
                    class="dirana-pagination"
                    :current-page.sync="page"
                    :page-size="pageSize"
                    :total="points.length"
                    background
                    layout="total, prev, pager, next" />
            </div>
        </div>
    </section>
</template>

<script>
const parsePoints = value => {
    try {
        const points = JSON.parse(value || '[]')
        return Array.isArray(points) ? points : []
    } catch (error) {
        return []
    }
}

export default {
    name: 'Dirana',
    props: { data: { type: Object, default: () => ({ table: { table1: [] } }) } },
    data() {
        return { selectedIndex: 0, sweep: 'frequency', page: 1, pageSize: 100 }
    },
    computed: {
        measurements() {
            const table = this.data && this.data.table
            return table && Array.isArray(table.table1) ? table.table1 : []
        },
        activeRow() { return this.measurements[this.selectedIndex] || null },
        points() {
            if (!this.activeRow) return []
            const field = this.sweep === 'frequency' ? 'frequency_points_json' : 'polarization_points_json'
            return parsePoints(this.value(this.activeRow, field))
        },
        pagedPoints() {
            const start = (this.page - 1) * this.pageSize
            return this.points.slice(start, start + this.pageSize)
        }
    },
    methods: {
        value(row, code) {
            const cell = row && row[code]
            return cell && typeof cell === 'object' ? cell.value : (cell || '')
        },
        selectMeasurement(index) { this.selectedIndex = index; this.page = 1 },
        rowIndex(index) { return (this.page - 1) * this.pageSize + index + 1 }
    }
}
</script>

<style scoped>
.dirana-view { padding: 14px 0; color: #303948; }
.dirana-toolbar, .dirana-point-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dirana-toolbar { padding: 0 0 12px; }
.dirana-heading { display: flex; align-items: baseline; gap: 10px; }
.dirana-heading span, .dirana-point-heading span { color: #788392; font-size: 12px; }
.dirana-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); border: 1px solid #dfe4eb; }
.dirana-measurements { border-right: 1px solid #dfe4eb; max-height: 520px; overflow: auto; }
.dirana-measurement { display: flex; flex-direction: column; width: 100%; padding: 12px; gap: 3px; background: #fff; border: 0; border-bottom: 1px solid #e9edf2; text-align: left; color: #5a6574; cursor: pointer; }
.dirana-measurement.active { background: #edf3ff; box-shadow: inset 3px 0 #163a92; }
.dirana-measurement-name { font-weight: 600; color: #243248; }
.dirana-measurement small { color: #8791a0; }
.dirana-empty { padding: 18px; color: #8791a0; }
.dirana-points { min-width: 0; padding: 12px; }
.dirana-point-heading { padding-bottom: 10px; }
.dirana-pagination { padding-top: 12px; text-align: right; }
@media (max-width: 780px) { .dirana-layout { grid-template-columns: 1fr; } .dirana-measurements { display: flex; border-right: 0; border-bottom: 1px solid #dfe4eb; } .dirana-measurement { min-width: 150px; } }
</style>
