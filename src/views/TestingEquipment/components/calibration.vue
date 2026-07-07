<template>
    <div class="tbl-wrap">
        <div class="sec-title">
            <h3>Calibration history</h3>
            <button class="btn primary sm" @click="addRow">+ Add record</button>
        </div>
        <table>
            <thead>
                <tr>
                    <th style="min-width:150px">Calibration date</th>
                    <th style="min-width:150px">Due date</th>
                    <th style="width:110px">Interval (mo)</th>
                    <th style="min-width:170px">Provider</th>
                    <th style="min-width:160px">Certificate no.</th>
                    <th style="width:120px">Result</th>
                    <th style="min-width:180px">Notes</th>
                    <th style="width:44px"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="!records.length"><td colspan="8" class="empty">No calibration records</td></tr>
                <tr v-for="(r, i) in records" :key="i">
                    <td><input class="inp" type="date" v-model="r.calibration_date" /></td>
                    <td><input class="inp" type="date" v-model="r.due_date" /></td>
                    <td><input class="inp" type="number" min="0" v-model.number="r.interval_months" /></td>
                    <td><input class="inp" v-model="r.provider" placeholder="Calibration lab" /></td>
                    <td><input class="inp" v-model="r.certificate_number" /></td>
                    <td>
                        <select class="inp" v-model="r.result">
                            <option value="">—</option>
                            <option value="Pass">Pass</option>
                            <option value="Fail">Fail</option>
                            <option value="Adjusted">Adjusted</option>
                        </select>
                    </td>
                    <td><input class="inp" v-model="r.notes" /></td>
                    <td class="ctr"><button class="del" @click="removeRow(i)" title="Remove">✕</button></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    name: 'TeCalibration',
    props: { records: { type: Array, default: () => [] } },
    methods: {
        addRow() {
            this.records.push({ mrid: '', calibration_date: '', due_date: '', interval_months: 12,
                provider: '', certificate_number: '', result: '', notes: '' })
        },
        removeRow(i) { this.records.splice(i, 1) }
    }
}
</script>

<style scoped>
.tbl-wrap { --blue-900:#0b2f86; --blue-800:#123c9c; --gray-900:#111827; --gray-700:#374151; --gray-600:#4b5563; --gray-400:#9ca3af; --gray-300:#d1d5db; --gray-200:#e5e7eb; --gray-100:#f3f4f6; overflow-x: auto; }
.sec-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.sec-title h3 { margin: 0; font-size: 16px; color: var(--gray-900); }
table { width: 100%; min-width: 1040px; border-collapse: collapse; border: 1px solid var(--gray-200); border-radius: 10px; overflow: hidden; background: #fff; }
th { background: var(--gray-100); color: var(--gray-700); text-align: left; padding: 12px 14px; font-size: 12px; font-weight: 800; border-bottom: 1px solid var(--gray-300); white-space: nowrap; }
td { padding: 8px 12px; border-bottom: 1px solid var(--gray-200); vertical-align: middle; }
tr:last-child td { border-bottom: 0; }
.empty { text-align: center; color: var(--gray-400); padding: 22px; font-weight: 600; }
.inp { width: 100%; border: 1px solid var(--gray-200); border-radius: 7px; padding: 6px 8px; font-size: 13px; color: var(--gray-900); background: #fff; outline: none; }
.inp:focus { border-color: var(--blue-900); box-shadow: 0 0 0 3px rgba(11,47,134,0.08); }
.ctr { text-align: center; }
.del { border: none; background: transparent; color: #d90429; font-size: 15px; cursor: pointer; padding: 4px; border-radius: 6px; }
.del:hover { background: #fee2e2; }
.btn { border: 1px solid var(--gray-300); background: #fff; padding: 8px 13px; border-radius: 8px; font-weight: 700; cursor: pointer; color: var(--gray-700); font-size: 13px; }
.btn.primary { background: var(--blue-900); border-color: var(--blue-900); color: #fff; }
.btn.primary:hover { background: var(--blue-800); }
.btn.sm { padding: 7px 12px; }
</style>
