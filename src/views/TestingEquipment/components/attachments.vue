<template>
    <div class="att">
        <div class="sec-title">
            <h3>Attachments</h3>
            <div class="att-actions">
                <button class="btn sm" title="Download">↓ Download</button>
                <button class="btn primary sm" @click="addRow">+ Add file</button>
            </div>
        </div>

        <div v-if="!files.length" class="empty-card">No attachments</div>

        <div class="att-grid">
            <div v-for="(f, i) in files" :key="i" class="att-card">
                <div class="att-icon" :class="typeClass(f.type)">{{ ext(f) }}</div>
                <div class="att-body">
                    <div class="att-name">{{ f.name }}</div>
                    <div class="att-meta">{{ f.type }} · {{ f.added_date || 'no date' }}</div>
                </div>
                <button class="del" @click="removeRow(i)" title="Remove">✕</button>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    name: 'TeAttachments',
    props: { files: { type: Array, default: () => [] } },
    methods: {
        addRow() { this.files.push({ name: 'new-file.pdf', type: 'PDF', added_date: '' }) },
        removeRow(i) { this.files.splice(i, 1) },
        ext(f) {
            const m = (f.name || '').split('.').pop().toUpperCase()
            return m.length <= 4 ? m : (f.type || 'FILE')
        },
        typeClass(t) {
            const s = (t || '').toLowerCase()
            if (s.includes('pdf')) return 'pdf'
            if (s.includes('img') || s.includes('png') || s.includes('jpg')) return 'img'
            return 'doc'
        }
    }
}
</script>

<style scoped>
.att { --blue-900:#0b2f86; --blue-800:#123c9c; --blue-50:#eef4ff; --gray-900:#111827; --gray-700:#374151; --gray-500:#6b7280; --gray-400:#9ca3af; --gray-300:#d1d5db; --gray-200:#e5e7eb; }
.sec-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.sec-title h3 { margin: 0; font-size: 16px; color: var(--gray-900); }
.att-actions { display: flex; gap: 8px; }
.att-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.att-card { display: flex; align-items: center; gap: 12px; border: 1px solid var(--gray-200); border-radius: 10px; padding: 12px; background: #fff; }
.att-icon { width: 42px; height: 42px; border-radius: 9px; display: grid; place-items: center; font-size: 11px; font-weight: 900; color: #fff; flex-shrink: 0; }
.att-icon.pdf { background: #d90429; }
.att-icon.img { background: #16a34a; }
.att-icon.doc { background: var(--blue-800); }
.att-body { flex: 1; min-width: 0; }
.att-name { font-weight: 700; color: var(--gray-900); font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.att-meta { color: var(--gray-500); font-size: 12px; margin-top: 2px; }
.del { border: none; background: transparent; color: #d90429; font-size: 15px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
.del:hover { background: #fee2e2; }
.empty-card { border: 1px dashed var(--gray-300); border-radius: 12px; padding: 30px; text-align: center; color: var(--gray-400); font-weight: 600; }
.btn { border: 1px solid var(--gray-300); background: #fff; padding: 8px 13px; border-radius: 8px; font-weight: 700; cursor: pointer; color: var(--gray-700); font-size: 13px; }
.btn.primary { background: var(--blue-900); border-color: var(--blue-900); color: #fff; }
.btn.primary:hover { background: var(--blue-800); }
.btn.sm { padding: 7px 12px; }
</style>
