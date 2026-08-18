<template>
    <div class="rep">
        <div class="sec-title">
            <h3>Maintenance Events</h3>
            <button class="btn primary sm" type="button" @click="openTicketDialog">Create Repair Ticket</button>
        </div>

        <div v-if="!records.length" class="empty-card">No repair records</div>

        <div class="timeline">
            <div v-for="(r, i) in records" :key="r.mrid || r.ticket_id || i" class="maintenance-row">
                <time class="maintenance-date">{{ formatRepairDate(r.created_date_time) }}</time>
                <article
                    class="maintenance-card"
                    :class="maintenanceCardClass(r)"
                    @dblclick="editTicket(i)"
                >
                    <h4>{{ repairComponentNames(r) || 'No component specified' }}</h4>
                    <p v-if="repairTitle(r)">{{ repairTitle(r) }}</p>
                    <div class="maintenance-badges">
                        <span class="maintenance-badge" :class="statusTone(r)">{{ repairStatusLabel(r) }}</span>
                        <span v-if="r.provider" class="maintenance-badge vendor">Vendor: {{ r.provider }}</span>
                        <span v-if="r.severity" class="maintenance-badge" :class="severityTone(r.severity)">
                            Severity: {{ r.severity }}
                        </span>
                    </div>
                </article>
            </div>
        </div>

        <div v-if="ticketVisible" class="ticket-mask" @click.self="closeTicketDialog">
            <div class="ticket-dialog" @click.stop>
                <div class="ticket-page-head">
                    <div>
                        <div class="ticket-crumb">Assets / Testing Equipment / Repair Ticket</div>
                        <h3>Repair Ticket</h3>
                    </div>
                    <div class="ticket-actions">
                        <button
                            class="btn cancel-button"
                            type="button"
                            @click.stop.prevent="closeTicketDialog"
                        >
                            Cancel
                        </button>
                        <button class="btn primary" type="button" @click.stop="saveTicket">Save Ticket</button>
                    </div>
                </div>

                <div class="ticket-hero">
                    <div class="ticket-icon">RT</div>
                    <div class="ticket-title">
                        <h4>Repair Ticket - {{ draftTicketId }}</h4>
                        <p>{{ draftSubtitle }}</p>
                    </div>
                    <div class="ticket-statuses">
                        <span :class="['status-pill', ticketStatusTone]">{{ ticketStatusLabel }}</span>
                        <span :class="['status-pill', ticketSeverityTone]">{{ ticketSeverity }}</span>
                    </div>
                </div>

                <div class="ticket-grid">
                    <section class="ticket-panel main">
                        <div class="ticket-panel-title">Repair Information</div>

                        <label class="ticket-row textarea-row">
                            <span>Fault Description</span>
                            <textarea
                                class="ticket-field ticket-textarea"
                                v-model="ticketDraft.reason"
                                placeholder="Describe the fault or repair reason..."
                            ></textarea>
                        </label>

                        <div class="ticket-row">
                            <span>Component</span>
                            <div class="component-line">
                                <div class="component-chip-list">
                                    <span v-if="!ticketDraft.components.length" class="component-empty">No component selected</span>
                                    <span v-for="component in ticketDraft.components" :key="component.id" class="component-chip">
                                        <strong>{{ component.name }}</strong>
                                        <button type="button" @mousedown.stop @click.stop="removeComponent(component.id)">x</button>
                                    </span>
                                </div>
                                <button class="btn ghost" type="button" @click.stop="openComponentDialog">+ Add Component</button>
                            </div>
                        </div>

                        <label class="ticket-row">
                            <span>Repair Date</span>
                            <input class="ticket-field ticket-control" type="date" v-model="ticketDraft.created_date_time" />
                        </label>

                        <label class="ticket-row">
                            <span>Status</span>
                            <div class="status-stack ticket-control">
                                <select class="ticket-field" v-model="ticketDraft.ticket_status">
                                    <option v-for="s in ticketStatuses" :key="s.label" :value="s.label">{{ s.label }}</option>
                                </select>
                                <div class="status-options">
                                    <button
                                        v-for="s in ticketStatuses"
                                        :key="s.label"
                                        type="button"
                                        :class="['status-choice', s.tone, { active: ticketDraft.ticket_status === s.label }]"
                                        @click="ticketDraft.ticket_status = s.label"
                                    >
                                        {{ s.label }}
                                    </button>
                                </div>
                            </div>
                        </label>

                        <label class="ticket-row">
                            <span>Vendor</span>
                            <input class="ticket-field ticket-control" v-model="ticketDraft.provider" placeholder="Repair vendor" />
                        </label>

                        <label class="ticket-row">
                            <span>Repair Location</span>
                            <input class="ticket-field ticket-control" v-model="ticketDraft.location" placeholder="Repair location" />
                        </label>

                        <label class="ticket-row">
                            <span>Severity</span>
                            <div class="severity-grid">
                                <button
                                    v-for="s in severities"
                                    :key="s"
                                    type="button"
                                    :class="['severity', s.toLowerCase(), { active: ticketSeverity === s }]"
                                    @click="ticketSeverity = s"
                                >
                                    {{ s }}
                                </button>
                            </div>
                        </label>

                        <label class="ticket-row textarea-row">
                            <span>Note / Action Taken</span>
                            <textarea
                                class="ticket-field ticket-textarea small"
                                v-model="ticketDraft.note"
                                placeholder="Initial diagnostics, repair action, or follow-up..."
                            ></textarea>
                        </label>
                    </section>

                    <aside class="ticket-side">
                        <section class="ticket-panel">
                            <div class="ticket-panel-title">Ticket Summary</div>
                            <div class="summary-row"><span>Ticket ID</span><b>{{ draftTicketId }}</b></div>
                            <div class="summary-row"><span>Created date</span><b>{{ ticketDraft.created_date_time || '-' }}</b></div>
                            <div class="summary-row"><span>Current status</span><b>{{ ticketStatusLabel }}</b></div>
                            <div class="summary-row"><span>Severity</span><b>{{ ticketSeverity }}</b></div>
                            <div class="summary-row"><span>Vendor</span><b>{{ ticketDraft.provider || '-' }}</b></div>
                            <div class="summary-row"><span>Location</span><b>{{ ticketDraft.location || '-' }}</b></div>
                        </section>

                        <section class="ticket-panel legend">
                            <div class="ticket-panel-title">Status Legend</div>
                            <div class="legend-row"><span class="legend-dot red"></span>Critical - Requires immediate attention</div>
                            <div class="legend-row"><span class="legend-dot orange"></span>High - Act soon</div>
                            <div class="legend-row"><span class="legend-dot yellow"></span>Medium - Moderate priority</div>
                            <div class="legend-row"><span class="legend-dot green"></span>Low - Low priority</div>
                        </section>
                    </aside>
                </div>

                <div v-if="componentDialogVisible" class="component-modal-mask" @click.self="closeComponentDialog">
                    <div class="component-modal" @click.stop>
                        <div class="component-modal-head">
                            <h4>Add Component</h4>
                            <button
                                type="button"
                                @pointerdown.stop.prevent="closeComponentDialog"
                                @click.stop.prevent="closeComponentDialog"
                            >x</button>
                        </div>
                        <label class="component-modal-body">
                            <span>Component name</span>
                            <input
                                ref="componentInput"
                                class="ticket-field"
                                v-model="componentDraft"
                                placeholder="Enter component name"
                                @keyup.enter="saveComponent"
                            />
                        </label>
                        <div class="component-modal-actions">
                            <button
                                class="btn cancel-button"
                                type="button"
                                @click.stop.prevent="closeComponentDialog"
                            >
                                Cancel
                            </button>
                            <button class="btn primary" type="button" @click="saveComponent">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
const blankTicket = () => ({
    mrid: '',
    type: 'Repair',
    created_date_time: new Date().toISOString().slice(0, 10),
    reason: '',
    provider: '',
    cost: '',
    status: 'InProgress',
    ticket_status: 'Open',
    components: [],
    location: '',
    note: ''
})

export default {
    name: 'TeRepairHistory',
    props: { records: { type: Array, default: () => [] } },
    data() {
        return {
            ticketVisible: false,
            editingRecordIndex: -1,
            componentDialogVisible: false,
            componentDraft: '',
            ticketDraft: blankTicket(),
            ticketSeverity: 'High',
            ticketStatuses: [
                { label: 'Open', value: 'InProgress', tone: 'blue' },
                { label: 'In Progress', value: 'InProgress', tone: 'purple' },
                { label: 'Sent to Vendor', value: 'InProgress', tone: 'cyan' },
                { label: 'Repaired', value: 'Completed', tone: 'green' },
                { label: 'Closed', value: 'Completed', tone: 'gray' }
            ],
            severities: ['Critical', 'High', 'Medium', 'Low']
        }
    },
    computed: {
        draftTicketId() {
            if (this.editingRecordIndex >= 0) {
                const record = this.records[this.editingRecordIndex] || {}
                if (record.ticket_id) return record.ticket_id
                return `RT-${new Date().getFullYear()}-${String(this.editingRecordIndex + 1).padStart(3, '0')}`
            }
            return `RT-${new Date().getFullYear()}-${String(this.records.length + 1).padStart(3, '0')}`
        },
        ticketStatusLabel() {
            return this.ticketDraft.ticket_status || 'Open'
        },
        ticketStatusTone() {
            const status = this.ticketStatuses.find(item => item.label === this.ticketStatusLabel)
            return status ? status.tone : 'blue'
        },
        ticketSeverityTone() {
            return `severity-${String(this.ticketSeverity || '').toLowerCase()}`
        },
        draftSubtitle() {
            return [
                this.ticketDraft.provider || 'Vendor missing',
                this.ticketDraft.created_date_time || 'Repair date missing'
            ].join(' - ')
        },
        recordCount() {
            return this.records.length
        }
    },
    watch: {
        recordCount() {
            this.$nextTick(this.resizeAllReasons)
        }
    },
    mounted() {
        this.$nextTick(this.resizeAllReasons)
    },
    methods: {
        openTicketDialog() {
            this.editingRecordIndex = -1
            this.ticketDraft = blankTicket()
            this.ticketSeverity = 'High'
            this.componentDialogVisible = false
            this.componentDraft = ''
            this.ticketVisible = true
        },
        closeTicketDialog() {
            this.componentDialogVisible = false
            this.ticketVisible = false
            this.editingRecordIndex = -1
        },
        editTicket(index) {
            const record = this.records[index]
            if (!record) return

            const reasonLines = String(record.reason || '').split(/\r?\n/)
            const faultDescription = record.fault_description || reasonLines.shift() || ''
            const note = record.note != null ? record.note : reasonLines.join('\n')
            const componentNames = Array.isArray(record.components)
                ? record.components
                : String(record.component || '').split(',').map(name => name.trim()).filter(Boolean)

            this.editingRecordIndex = index
            this.ticketDraft = Object.assign(blankTicket(), {
                mrid: record.mrid || '',
                type: record.type || 'Repair',
                created_date_time: String(record.created_date_time || '').slice(0, 10),
                reason: faultDescription,
                provider: record.provider || '',
                cost: record.cost || '',
                status: record.status || 'InProgress',
                ticket_status: record.ticket_status || (record.status === 'Completed' ? 'Closed' : 'In Progress'),
                components: componentNames.map((component, componentIndex) => ({
                    id: typeof component === 'string'
                        ? `${Date.now()}-${componentIndex}-${Math.random().toString(16).slice(2)}`
                        : (component.mrid || component.id || `${Date.now()}-${componentIndex}-${Math.random().toString(16).slice(2)}`),
                    mrid: typeof component === 'string' ? '' : (component.mrid || component.id || ''),
                    name: typeof component === 'string' ? component : component.name
                })).filter(component => component.name),
                location: record.repair_location || record.location || '',
                note
            })
            this.ticketSeverity = record.severity || 'High'
            this.componentDialogVisible = false
            this.componentDraft = ''
            this.ticketVisible = true
        },
        openComponentDialog() {
            this.componentDraft = ''
            this.componentDialogVisible = true
            this.$nextTick(() => {
                if (this.$refs.componentInput) this.$refs.componentInput.focus()
            })
        },
        closeComponentDialog() {
            this.componentDialogVisible = false
            this.componentDraft = ''
        },
        saveComponent() {
            const name = String(this.componentDraft || '').trim()
            if (!name) return
            this.ticketDraft.components.push({
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                name
            })
            this.closeComponentDialog()
        },
        removeComponent(id) {
            const index = this.ticketDraft.components.findIndex(component => component.id === id)
            if (index >= 0) this.ticketDraft.components.splice(index, 1)
        },
        saveTicket() {
            const faultDescription = String(this.ticketDraft.reason || '').trim()
            const note = String(this.ticketDraft.note || '').trim()
            const reason = [faultDescription, note]
                .map(v => String(v || '').trim())
                .filter(Boolean)
                .join('\n')
            const currentRecord = this.editingRecordIndex >= 0 ? this.records[this.editingRecordIndex] : {}
            const record = Object.assign({}, currentRecord, {
                mrid: currentRecord.mrid || '',
                type: 'Repair',
                ticket_id: currentRecord.ticket_id || this.draftTicketId,
                created_date_time: this.ticketDraft.created_date_time,
                reason,
                fault_description: faultDescription,
                note,
                provider: this.ticketDraft.provider,
                cost: this.ticketDraft.cost,
                component: this.ticketDraft.components.map(component => component.name).join(', '),
                components: this.ticketDraft.components.map(component => ({
                    mrid: component.mrid || component.id || '',
                    name: component.name
                })),
                ticket_status: this.ticketDraft.ticket_status,
                status: this.toRepairStatus(this.ticketDraft.ticket_status),
                severity: this.ticketSeverity,
                repair_location: this.ticketDraft.location
            })

            if (this.editingRecordIndex >= 0) this.$set(this.records, this.editingRecordIndex, record)
            else this.records.push(record)

            this.ticketVisible = false
            this.editingRecordIndex = -1
            this.$nextTick(this.resizeAllReasons)
        },
        removeRow(i) { this.records.splice(i, 1) },
        toRepairStatus(ticketStatus) {
            return ['Repaired', 'Closed'].includes(ticketStatus) ? 'Completed' : 'InProgress'
        },
        repairStatusLabel(record) {
            if (record.ticket_status) return record.ticket_status
            return record.status === 'Completed' ? 'Closed' : 'In Progress'
        },
        statusTone(record) {
            const status = this.repairStatusLabel(record)
            if (status === 'Closed' || status === 'Repaired') return 'green'
            if (status === 'Open') return 'blue'
            return 'orange'
        },
        severityTone(severity) {
            return `severity-${String(severity || '').toLowerCase()}`
        },
        maintenanceCardClass(record) {
            return this.toRepairStatus(this.repairStatusLabel(record)) === 'Completed' ? 'closed' : 'active'
        },
        repairTitle(record) {
            if (record.fault_description) return record.fault_description
            const firstLine = String(record.reason || '').split(/\r?\n/)[0]
            return firstLine
        },
        repairComponentNames(record) {
            if (Array.isArray(record.components)) {
                return record.components
                    .map(component => typeof component === 'string' ? component : component.name)
                    .map(name => String(name || '').trim())
                    .filter(Boolean)
                    .join(' / ')
            }

            return String(record.component || '')
                .split(/\s*[,/]\s*/)
                .map(name => name.trim())
                .filter(Boolean)
                .join(' / ')
        },
        repairDescription(record) {
            if (record.note) return record.note
            const lines = String(record.reason || '').split(/\r?\n/)
            return lines.length > 1 ? lines.slice(1).join('\n') : ''
        },
        formatRepairDate(value) {
            const date = String(value || '').slice(0, 10)
            const parts = date.split('-')
            return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : (date || '-')
        },
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
.rep { --blue-900:#0b2f86; --blue-800:#123c9c; --blue-50:#eef4ff; --gray-950:#0f172a; --gray-900:#111827; --gray-700:#374151; --gray-600:#4b5563; --gray-500:#6b7280; --gray-400:#9ca3af; --gray-300:#d1d5db; --gray-200:#e5e7eb; --gray-100:#f3f4f6; --gray-50:#f8fafc; font-family: Tahoma, Arial, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
.rep input,
.rep textarea,
.rep select,
.rep button { font-family: inherit; letter-spacing: 0; }
.sec-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.sec-title h3 { margin: 0; font-size: 16px; color: var(--gray-900); }
.timeline { display: grid; gap: 14px; }
.maintenance-row {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr);
    gap: 14px;
    align-items: start;
}
.maintenance-date {
    padding: 16px 0 0 2px;
    color: #64748b;
    font-size: 13px;
    font-weight: 800;
    white-space: nowrap;
}
.maintenance-card {
    min-width: 0;
    padding: 15px 18px;
    border: 1px solid #dbe2ea;
    border-left: 4px solid #d97706;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.maintenance-card.closed { border-left-color: #16a34a; }
.maintenance-card.active { border-left-color: #dc2626; }
.maintenance-card:hover {
    border-color: #aebcd0;
    border-left-color: var(--blue-900);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}
.maintenance-card h4 {
    margin: 0 0 7px;
    color: var(--gray-950);
    font-size: 14px;
    font-weight: 800;
    line-height: 1.4;
    overflow-wrap: anywhere;
}
.maintenance-card p {
    margin: 0 0 11px;
    color: #334155;
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}
.maintenance-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
}
.maintenance-badge {
    display: inline-flex;
    align-items: center;
    min-height: 26px;
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--gray-100);
    color: #334155;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.2;
}
.maintenance-badge.green { background: #dcfce7; color: #166534; }
.maintenance-badge.orange { background: #ffedd5; color: #9a3412; }
.maintenance-badge.blue,
.maintenance-badge.vendor { background: #eef4ff; color: var(--blue-900); }
.maintenance-badge.severity-critical { background: #fee2e2; color: #b91c1c; }
.maintenance-badge.severity-high { background: #ffedd5; color: #c2410c; }
.maintenance-badge.severity-medium { background: #fef3c7; color: #a16207; }
.maintenance-badge.severity-low { background: #dcfce7; color: #15803d; }
.empty-card { border: 1px dashed var(--gray-300); border-radius: 12px; padding: 30px; text-align: center; color: var(--gray-400); font-weight: 600; }
.btn { border: 1px solid var(--gray-300); background: #fff; padding: 8px 13px; border-radius: 8px; font-weight: 700; cursor: pointer; color: var(--gray-700); font-size: 13px; }
.btn.primary { background: var(--blue-900); border-color: var(--blue-900); color: #fff; }
.btn.primary:hover { background: var(--blue-800); }
.btn.sm { padding: 7px 12px; }
.btn.ghost { color: var(--blue-900); border-color: #b8c7e6; background: #fff; white-space: nowrap; }

.cancel-button {
    position: relative;
    z-index: 1;
    pointer-events: auto;
    -webkit-app-region: no-drag;
}

.ticket-mask {
    position: fixed;
    inset: 0;
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(15, 23, 42, 0.42);
}

.ticket-dialog {
    width: min(1180px, calc(100vw - 48px));
    max-height: calc(100vh - 48px);
    overflow: auto;
    border-radius: 12px;
    background: #f8fbff;
    box-shadow: 0 24px 80px rgba(15, 23, 42, 0.28);
    padding: 18px;
}

.ticket-page-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
}

.ticket-crumb {
    color: var(--gray-500);
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 6px;
}

.ticket-page-head h3 {
    margin: 0;
    color: var(--gray-950);
    font-size: 23px;
    font-weight: 900;
}

.ticket-actions {
    display: flex;
    gap: 10px;
}

.ticket-hero {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 16px;
    padding: 18px 20px;
    border: 1px solid var(--gray-200);
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
    margin-bottom: 16px;
}

.ticket-icon {
    width: 54px;
    height: 54px;
    border-radius: 11px;
    display: grid;
    place-items: center;
    background: var(--blue-50);
    color: var(--blue-900);
    font-size: 18px;
    font-weight: 900;
}

.ticket-title h4 {
    margin: 0 0 6px;
    color: var(--gray-950);
    font-size: 22px;
    font-weight: 900;
}

.ticket-title p {
    margin: 0;
    color: var(--gray-500);
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ticket-statuses {
    display: flex;
    gap: 10px;
    align-items: center;
}

.status-pill {
    min-width: 92px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 900;
}

.status-pill.blue { background: var(--blue-50); color: var(--blue-900); border: 1px solid #bfdbfe; }
.status-pill.purple { background: #f5f3ff; color: #6d28d9; border: 1px solid #ddd6fe; }
.status-pill.cyan { background: #eff6ff; color: #0369a1; border: 1px solid #bfdbfe; }
.status-pill.green,
.status-pill.severity-low { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.status-pill.gray { background: var(--gray-100); color: var(--gray-600); border: 1px solid var(--gray-200); }
.status-pill.severity-critical { background: #fff1f2; color: #dc2626; border: 1px solid #fecdd3; }
.status-pill.severity-high { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
.status-pill.severity-medium { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }

.ticket-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(310px, 34%);
    gap: 16px;
}

.ticket-panel {
    border: 1px solid var(--gray-200);
    border-radius: 10px;
    background: #fff;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.ticket-panel-title {
    padding: 13px 16px;
    border-bottom: 1px solid var(--gray-200);
    background: var(--gray-50);
    color: var(--gray-950);
    font-size: 14px;
    font-weight: 900;
}

.ticket-row {
    display: grid;
    grid-template-columns: 190px minmax(0, 1fr);
    gap: 14px;
    padding: 8px 16px;
    border-bottom: 1px solid var(--gray-200);
    align-items: center;
}

.ticket-row:last-child { border-bottom: 0; }
.ticket-row > span {
    color: #475569;
    font-size: 13px;
    font-weight: 700;
    padding-top: 0;
}

.ticket-field {
    width: 100%;
    height: 38px;
    min-height: 38px;
    border: 1px solid #aeb9c8;
    border-radius: 6px;
    background: #fff;
    color: var(--gray-950);
    font-size: 13px;
    padding: 7px 11px;
    outline: none;
    box-sizing: border-box;
}

.ticket-field:focus {
    border-color: var(--blue-900);
    box-shadow: 0 0 0 3px rgba(11, 47, 134, 0.08);
}

.ticket-control {
    width: 100%;
}

.ticket-textarea {
    height: auto;
    min-height: 84px;
    resize: vertical;
    line-height: 1.45;
}

.ticket-textarea.small {
    min-height: 72px;
}

.component-line {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
}

.component-chip-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 38px;
    align-items: center;
}

.component-empty {
    color: #94a3b8;
    font-size: 13px;
}

.component-chip {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 36px;
    padding: 0 10px 0 14px;
    border: 1px solid var(--gray-200);
    border-radius: 7px;
    background: var(--gray-50);
    color: var(--gray-950);
    font-size: 13px;
}

.component-chip strong {
    font-weight: 700;
}

.component-chip button {
    width: 22px;
    height: 22px;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: #64748b;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
}

.component-chip button:hover {
    background: #e2e8f0;
    color: #0f172a;
}

.component-modal-mask {
    position: fixed;
    inset: 0;
    z-index: 3010;
    display: grid;
    place-items: center;
    padding: 18px;
    background: rgba(15, 23, 42, 0.18);
}

.component-modal {
    width: min(420px, calc(100vw - 36px));
    border: 1px solid var(--gray-200);
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.22);
    overflow: hidden;
}

.component-modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--gray-200);
    background: var(--gray-50);
}

.component-modal-head h4 {
    margin: 0;
    color: var(--gray-950);
    font-size: 15px;
    font-weight: 900;
}

.component-modal-head button {
    border: 0;
    background: transparent;
    color: #64748b;
    cursor: pointer;
    font-size: 18px;
}

.component-modal-body {
    display: grid;
    gap: 8px;
    padding: 16px;
}

.component-modal-body span {
    color: #475569;
    font-size: 13px;
    font-weight: 700;
}

.component-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 0 16px 16px;
}

.status-stack {
    display: grid;
    gap: 8px;
}

.status-options,
.severity-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.status-options button,
.severity {
    min-width: 86px;
    height: 28px;
    border: 1px solid var(--gray-200);
    border-radius: 7px;
    background: var(--gray-100);
    color: var(--gray-600);
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
}

.status-choice.blue {
    background: var(--blue-50);
    border-color: #bfdbfe;
    color: var(--blue-900);
}

.status-choice.purple {
    background: #f5f3ff;
    border-color: #ddd6fe;
    color: #6d28d9;
}

.status-choice.cyan {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #0369a1;
}

.status-choice.green {
    background: #f0fdf4;
    border-color: #bbf7d0;
    color: #15803d;
}

.status-choice.gray {
    background: var(--gray-100);
    border-color: var(--gray-200);
    color: var(--gray-600);
}

.status-choice.active {
    box-shadow: inset 0 0 0 2px currentColor;
}

.severity.critical { background: #fff1f2; color: #dc2626; border-color: #fecdd3; }
.severity.high { background: #fff7ed; color: #ea580c; border-color: #fed7aa; }
.severity.medium { background: #fffbeb; color: #d97706; border-color: #fde68a; }
.severity.low { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
.severity.active { box-shadow: inset 0 0 0 2px currentColor; }

.ticket-side {
    display: grid;
    gap: 16px;
    align-content: start;
}

.summary-row {
    display: grid;
    grid-template-columns: 130px minmax(0, 1fr);
    border-bottom: 1px solid var(--gray-200);
}

.summary-row:last-child { border-bottom: 0; }
.summary-row span,
.summary-row b {
    padding: 9px 12px;
    font-size: 13px;
}
.summary-row span {
    color: #475569;
    font-weight: 800;
    background: #fbfbfc;
    border-right: 1px solid var(--gray-200);
}
.summary-row b {
    color: var(--gray-800);
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.legend {
    padding-bottom: 12px;
}

.legend-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 14px 0;
    color: var(--gray-700);
    font-size: 12px;
    font-weight: 700;
}

.legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex: 0 0 auto;
}
.legend-dot.red { background: #dc2626; }
.legend-dot.orange { background: #ea580c; }
.legend-dot.yellow { background: #d97706; }
.legend-dot.green { background: #16a34a; }

@media (max-width: 1080px) {
    .ticket-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 720px) {
    .ticket-mask {
        padding: 10px;
    }
    .ticket-dialog {
        width: calc(100vw - 20px);
        max-height: calc(100vh - 20px);
        padding: 12px;
    }
    .ticket-page-head,
    .ticket-hero {
        grid-template-columns: 1fr;
        display: grid;
    }
    .ticket-actions,
    .ticket-statuses {
        justify-content: stretch;
    }
    .ticket-actions .btn {
        flex: 1;
    }
    .ticket-row,
    .summary-row,
    .component-line {
        grid-template-columns: 1fr;
        gap: 8px;
    }
    .summary-row span {
        border-right: 0;
        border-bottom: 1px solid var(--gray-200);
    }
    .maintenance-row {
        grid-template-columns: 1fr;
        gap: 6px;
    }
    .maintenance-date {
        padding: 0 2px;
    }
}
</style>
