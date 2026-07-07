<template>
    <div class="usg">
        <div class="sec-title">
            <h3>Usage history</h3>
            <span class="hint">Where this equipment has been used for testing</span>
        </div>
        <table>
            <thead>
                <tr>
                    <th style="width:130px">Date</th>
                    <th>Job</th>
                    <th>Asset tested</th>
                    <th style="width:180px">Test type</th>
                    <th style="width:150px">Tested by</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="!records.length"><td colspan="5" class="empty">No usage recorded yet</td></tr>
                <tr v-for="(r, i) in records" :key="i">
                    <td class="mono">{{ r.date }}</td>
                    <td>{{ r.job_name }}</td>
                    <td>{{ r.asset_name }}</td>
                    <td><span class="tag blue">{{ r.test_type }}</span></td>
                    <td>{{ r.tested_by }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    name: 'TeUsageHistory',
    // Read-only: built from *_testing_equipment_test_type JOIN procedure_dataset/work_task
    props: { records: { type: Array, default: () => [] } }
}
</script>

<style scoped>
.usg { --blue-900:#0b2f86; --blue-50:#eef4ff; --gray-900:#111827; --gray-700:#374151; --gray-500:#6b7280; --gray-400:#9ca3af; --gray-300:#d1d5db; --gray-200:#e5e7eb; --gray-100:#f3f4f6; }
.sec-title { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 14px; }
.sec-title h3 { margin: 0; font-size: 16px; color: var(--gray-900); }
.hint { color: var(--gray-500); font-size: 12px; }
table { width: 100%; border-collapse: collapse; border: 1px solid var(--gray-200); border-radius: 10px; overflow: hidden; background: #fff; }
th { background: var(--gray-100); color: var(--gray-700); text-align: left; padding: 11px 12px; font-size: 12px; font-weight: 800; border-bottom: 1px solid var(--gray-300); }
td { padding: 11px 12px; border-bottom: 1px solid var(--gray-200); color: var(--gray-700); }
tr:last-child td { border-bottom: 0; }
.mono { font-variant-numeric: tabular-nums; color: var(--gray-900); font-weight: 600; }
.empty { text-align: center; color: var(--gray-400); padding: 22px; font-weight: 600; }
.tag { display: inline-flex; align-items: center; border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 800; }
.tag.blue { background: var(--blue-50); color: var(--blue-900); }
</style>
