<template>
    <el-dialog
        title="Duplicate equipment found"
        :visible="visible"
        @update:visible="$emit('update:visible', $event)"
        append-to-body
        width="720px"
        custom-class="app-dialog"
        @close="$emit('cancel')">

        <div class="cf-hint">
            {{ rows.length }} imported equipment already exist in this database.
            Choose what to do with each one — the rest of the file will be imported normally.
        </div>

        <div class="cf-bulk">
            <button class="cf-bulk-btn" @click="setAll('overwrite')">Overwrite all</button>
            <button class="cf-bulk-btn" @click="setAll('keep')">Keep all existing</button>
        </div>

        <div class="cf-table-scroll">
            <table class="cf-table">
                <thead>
                    <tr>
                        <th>Imported equipment</th>
                        <th class="c-serial">Serial no.</th>
                        <th class="c-match">Matched by</th>
                        <th class="c-action">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, i) in rows" :key="i">
                        <td>
                            <div class="cf-name">{{ row.name || '(no name)' }}</div>
                            <div class="cf-sub">{{ [row.manufacturer, row.type, row.model].filter(Boolean).join(' · ') }}</div>
                        </td>
                        <td class="c-serial">{{ row.serial || '—' }}</td>
                        <td class="c-match">
                            <span class="cf-tag" :class="row.reason === 'mrid' ? 'blue' : 'amber'">
                                {{ row.reason === 'mrid' ? 'Same ID' : 'Mfr + Serial + Type' }}
                            </span>
                        </td>
                        <td class="c-action">
                            <el-radio-group v-model="row.choice" size="mini">
                                <el-radio-button label="overwrite">Overwrite</el-radio-button>
                                <el-radio-button label="keep">Keep existing</el-radio-button>
                            </el-radio-group>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="$emit('cancel')">Skip duplicates</el-button>
            <el-button size="small" type="primary" @click="confirm">Apply</el-button>
        </span>
    </el-dialog>
</template>

<script>
/* eslint-disable */
// Dialog chọn cách xử lý thiết bị bị trùng khi import JSON.
// rows: [{ name, model, serial, manufacturer, type, reason: 'mrid'|'attrs', choice }]
export default {
    name: 'ImportConflictDialog',
    props: {
        visible: { type: Boolean, default: false },
        conflicts: { type: Array, default: () => [] }
    },
    data() {
        return { rows: [] }
    },
    watch: {
        conflicts: {
            immediate: true,
            handler(list) {
                // mặc định an toàn: giữ bản có sẵn trong máy
                this.rows = (list || []).map(c => ({ ...c, choice: 'keep' }))
            }
        }
    },
    methods: {
        setAll(choice) {
            this.rows.forEach(r => { r.choice = choice })
        },
        confirm() {
            this.$emit('confirm', this.rows.map(r => ({ index: r.index, choice: r.choice })))
        }
    }
}
</script>

<style scoped>
.cf-hint {
    font-size: 13px;
    color: #606266;
    margin-bottom: 12px;
    line-height: 1.5;
}
.cf-bulk {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
}
.cf-bulk-btn {
    border: 1px solid #dcdfe6;
    background: #fff;
    color: #606266;
    padding: 5px 12px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
}
.cf-bulk-btn:hover { border-color: #409eff; color: #409eff; }

.cf-table-scroll {
    max-height: 320px;
    overflow-y: auto;
    border: 1px solid #ebeef5;
    border-radius: 8px;
}
.cf-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.cf-table th {
    background: #f5f7fa;
    color: #606266;
    text-align: left;
    padding: 8px 12px;
    border-bottom: 1px solid #ebeef5;
    position: sticky;
    top: 0;
    z-index: 1;
}
.cf-table td { padding: 8px 12px; border-bottom: 1px solid #f5f7fa; vertical-align: middle; }
.cf-table tr:last-child td { border-bottom: none; }

.cf-name { font-weight: 600; color: #303133; }
.cf-sub { color: #909399; font-size: 11px; margin-top: 2px; }
.c-serial { width: 120px; white-space: nowrap; }
.c-match { width: 130px; }
.c-action { width: 210px; }

.cf-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
}
.cf-tag.blue { background: #e6f1fb; color: #185fa5; }
.cf-tag.amber { background: #faeeda; color: #854f0b; }
</style>
