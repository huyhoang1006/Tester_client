<template>
    <div class="rep">
        <div class="sec-title">
            <h3>Repair history</h3>
            <button class="btn primary sm" @click="addRow">+ Add record</button>
        </div>

        <div v-if="!records.length" class="empty-card">No repair records</div>

        <div class="timeline">
            <div v-for="(r, i) in records" :key="i" class="tl-card" :class="{ closed: r.status === 'Completed' }">
                <div class="tl-top">
                    <input class="tl-date" type="date" v-model="r.created_date_time" />
                    <div class="tl-badges">
                        <span class="tag" :class="r.status === 'Completed' ? 'green' : 'orange'">
                            {{ r.status === 'Completed' ? 'Completed' : 'In progress' }}
                        </span>
                        <button class="del" @click="removeRow(i)" title="Remove">x</button>
                    </div>
                </div>
                <textarea
                    class="tl-title"
                    v-model="r.reason"
                    placeholder="Fault description"
                    rows="1"
                    @input="resizeReason"
                    @focus="resizeReason"
                ></textarea>
                <div class="tl-meta">
                    <div class="tm">
                        <span class="tm-k">Provider</span>
                        <input class="tm-inp" v-model="r.provider" placeholder="Repair vendor" />
                    </div>
                    <div class="tm">
                        <span class="tm-k">Cost</span>
                        <input class="tm-inp" v-model="r.cost" />
                    </div>
                    <div class="tm">
                        <span class="tm-k">Status</span>
                        <select class="tm-inp" v-model="r.status">
                            <option value="InProgress">In progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    name: 'TeRepairHistory',
    props: { records: { type: Array, default: () => [] } },
    mounted() {
        this.$nextTick(this.resizeAllReasons)
    },
    updated() {
        this.$nextTick(this.resizeAllReasons)
    },
    methods: {
        addRow() {
            this.records.push({ mrid: '', type: 'Repair', created_date_time: '',
                reason: '', provider: '', cost: '', status: 'Completed' })
            this.$nextTick(this.resizeAllReasons)
        },
        removeRow(i) { this.records.splice(i, 1) },
        resizeReason(event) {
            const el = event && event.target ? event.target : event
            if (!el) return
            el.style.height = 'auto'
            el.style.height = `${Math.max(el.scrollHeight, 42)}px`
        },
        resizeAllReasons() {
            const nodes = this.$el ? this.$el.querySelectorAll('.tl-title') : []
            nodes.forEach(node => this.resizeReason(node))
        }
    }
}
</script>

<style scoped>
.rep { --blue-900:#0b2f86; --blue-800:#123c9c; --gray-900:#111827; --gray-700:#374151; --gray-600:#4b5563; --gray-500:#6b7280; --gray-400:#9ca3af; --gray-300:#d1d5db; --gray-200:#e5e7eb; --gray-100:#f3f4f6; font-family: Tahoma, Arial, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
.rep input,
.rep textarea,
.rep select,
.rep button { font-family: inherit; letter-spacing: 0; }
.sec-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.sec-title h3 { margin: 0; font-size: 16px; color: var(--gray-900); }
.timeline { display: grid; gap: 12px; }
.tl-card { border: 1px solid var(--gray-200); border-left: 4px solid #ea580c; border-radius: 10px; padding: 14px 18px; background: #fff; overflow: visible; }
.tl-card.closed { border-left-color: #16a34a; }
.tl-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.tl-date { border: 1px solid var(--gray-200); border-radius: 7px; padding: 5px 8px; font-size: 13px; font-weight: 700; color: var(--gray-700); outline: none; }
.tl-badges { display: flex; align-items: center; gap: 8px; }
.tl-title {
    display: block;
    width: 100%;
    min-height: 42px;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: 15px;
    font-weight: 700;
    line-height: 1.45;
    color: var(--gray-900);
    outline: none;
    margin-bottom: 12px;
    resize: none;
    overflow: hidden;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}
.tl-title::placeholder { color: var(--gray-400); }
.tl-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.tm { display: grid; gap: 4px; }
.tm-k { font-size: 12px; font-weight: 700; color: var(--gray-500); }
.tm-inp { border: 1px solid var(--gray-200); border-radius: 7px; padding: 6px 8px; font-size: 13px; color: var(--gray-900); background: #fff; outline: none; }
.tm-inp:focus { border-color: var(--blue-900); box-shadow: 0 0 0 3px rgba(11,47,134,0.08); }
.tag { display: inline-flex; align-items: center; border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 700; }
.tag.green { background: #dcfce7; color: #166534; }
.tag.orange { background: #ffedd5; color: #9a3412; }
.del { border: none; background: transparent; color: #d90429; font-size: 15px; font-weight: 700; cursor: pointer; padding: 4px 8px; border-radius: 6px; font-family: inherit; }
.del:hover { background: #fee2e2; }
.empty-card { border: 1px dashed var(--gray-300); border-radius: 12px; padding: 30px; text-align: center; color: var(--gray-400); font-weight: 600; }
.btn { border: 1px solid var(--gray-300); background: #fff; padding: 8px 13px; border-radius: 8px; font-weight: 700; cursor: pointer; color: var(--gray-700); font-size: 13px; }
.btn.primary { background: var(--blue-900); border-color: var(--blue-900); color: #fff; }
.btn.primary:hover { background: var(--blue-800); }
.btn.sm { padding: 7px 12px; }
</style>

