<template>
    <el-dialog
        :title="`Import failed for ${failures.length} item(s)`"
        :visible="visible"
        width="900px"
        :close-on-click-modal="false"
        custom-class="import-failure-dialog"
        append-to-body
        @close="$emit('close')">

        <!--
          Gộp theo THÔNG BÁO LỖI, không liệt kê phẳng.
          39 thiết bị hỏng cùng một nguyên nhân thì đó là MỘT vấn đề, không phải 39 —
          danh sách phẳng bắt người đọc tự nhận ra điều đó bằng cách cuộn hết 39 dòng.
        -->
        <div class="fail-summary">
            <span>{{ groups.length }} distinct error(s) across {{ failures.length }} item(s).</span>
            <el-button size="mini" plain icon="el-icon-document-copy" @click="copyAll">
                Copy details
            </el-button>
        </div>

        <div class="fail-groups">
            <div v-for="(g, gi) in groups" :key="gi" class="fail-group">
                <div class="fail-group-head" @click="toggle(gi)">
                    <i :class="expanded[gi] ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"></i>
                    <span class="fail-count">{{ g.items.length }}</span>
                    <span class="fail-message" :title="g.message">{{ g.message }}</span>
                </div>

                <el-table
                    v-if="expanded[gi]"
                    :data="g.items"
                    size="mini"
                    border
                    max-height="260"
                    class="fail-table">
                    <el-table-column type="index" label="#" width="50" />
                    <el-table-column prop="name" label="Name" min-width="180" show-overflow-tooltip />
                    <el-table-column prop="typeLabel" label="Type" width="150" />
                    <el-table-column prop="mrid" label="mRID" min-width="220" show-overflow-tooltip />
                </el-table>
            </div>
        </div>

        <span slot="footer">
            <el-button @click="$emit('close')">Close</el-button>
        </span>
    </el-dialog>
</template>

<script>
export default {
    name: 'ImportFailureDialog',
    props: {
        visible:  { type: Boolean, default: false },
        failures: { type: Array,   default: () => [] },
    },
    data() {
        return { expanded: {} }
    },
    computed: {
        /** Gom các node fail theo thông báo lỗi, nhóm đông nhất lên đầu. */
        groups() {
            const byMessage = new Map()
            for (const f of this.failures) {
                const message = (f && f.message) || 'Unknown error'
                if (!byMessage.has(message)) byMessage.set(message, [])
                byMessage.get(message).push({
                    name:      (f && f.name) || 'Unnamed',
                    typeLabel: (f && (f.asset || f.type)) || '',
                    mrid:      (f && f.mrid) || '',
                })
            }
            return [...byMessage.entries()]
                .map(([message, items]) => ({ message, items }))
                .sort((a, b) => b.items.length - a.items.length)
        },
    },
    watch: {
        // Nhóm lớn nhất mở sẵn — gần như luôn là nguyên nhân cần xem. Các nhóm còn lại thu
        // gọn để một lỗi lẻ không bị 38 dòng cùng loại đẩy khuất.
        visible(open) {
            if (open) this.expanded = this.groups.length ? { 0: true } : {}
        },
    },
    methods: {
        toggle(index) {
            this.$set(this.expanded, index, !this.expanded[index])
        },
        /** Chép ra dạng text để dán vào báo lỗi — thứ hộp thoại cũ không làm được. */
        copyAll() {
            const lines = []
            for (const g of this.groups) {
                lines.push(`### ${g.message}  (${g.items.length} item)`)
                for (const it of g.items) {
                    lines.push(`  - ${it.name} [${it.typeLabel}] ${it.mrid}`)
                }
                lines.push('')
            }
            const text = lines.join('\n')
            const done = () => this.$message.success('Copied')
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done).catch(() => this.fallbackCopy(text, done))
            } else {
                this.fallbackCopy(text, done)
            }
        },
        fallbackCopy(text, done) {
            const area = document.createElement('textarea')
            area.value = text
            area.style.position = 'fixed'
            area.style.opacity = '0'
            document.body.appendChild(area)
            area.select()
            try { document.execCommand('copy'); done() } catch (e) { console.error(e) }
            document.body.removeChild(area)
        },
    },
}
</script>

<style scoped>
.fail-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 13px;
    color: #606266;
}

.fail-groups {
    max-height: 460px;
    overflow: auto;
}

.fail-group {
    border: 1px solid #ebeef5;
    border-radius: 4px;
    margin-bottom: 10px;
}

.fail-group-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: #fef0f0;
    cursor: pointer;
    user-select: none;
}

.fail-count {
    flex: none;
    min-width: 26px;
    padding: 1px 6px;
    border-radius: 10px;
    background: #f56c6c;
    color: #fff;
    font-size: 12px;
    text-align: center;
}

.fail-message {
    font-size: 13px;
    color: #303133;
    word-break: break-word;
}

.fail-table {
    border-top: 1px solid #ebeef5;
}
</style>
