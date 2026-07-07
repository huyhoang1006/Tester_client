<template>
    <div class="te-root">
        <!-- Equipment header card -->
        <div class="te-header">
            <div class="te-title">
                <div class="te-avatar">{{ initials }}</div>
                <div>
                    <h2>{{ testingEquipmentDto.properties.name || 'New testing equipment' }}</h2>
                    <div class="te-subtitle">
                        <span>{{ testingEquipmentDto.properties.manufacturer || '—' }}</span>
                        <span class="dot-sep">S/N {{ testingEquipmentDto.properties.serial_no || '—' }}</span>
                        <span class="dot-sep">{{ testingEquipmentDto.properties.model || '—' }}</span>
                    </div>
                </div>
            </div>
            <div class="te-header-side">
                <span class="tag" :class="statusTag.cls">{{ statusTag.label }}</span>
                <span v-if="calibrationTag" class="tag" :class="calibrationTag.cls">{{ calibrationTag.label }}</span>
            </div>
        </div>

        <!-- KPI row -->
        <div class="te-kpi-row">
            <div class="te-kpi">
                <div class="te-kpi-label">Status</div>
                <div class="te-kpi-value">{{ statusTag.label }}</div>
            </div>
            <div class="te-kpi">
                <div class="te-kpi-label">Calibrations</div>
                <div class="te-kpi-value">{{ testingEquipmentDto.calibration.length }}</div>
                <div class="te-kpi-note">{{ nextDue }}</div>
            </div>
            <div class="te-kpi">
                <div class="te-kpi-label">Licenses</div>
                <div class="te-kpi-value">{{ enabledLicenses }}<span class="te-kpi-sub">/{{ testingEquipmentDto.licenses.length }}</span></div>
                <div class="te-kpi-note">enabled</div>
            </div>
            <div class="te-kpi">
                <div class="te-kpi-label">Repairs</div>
                <div class="te-kpi-value">{{ testingEquipmentDto.repairs.length }}</div>
            </div>
            <div class="te-kpi">
                <div class="te-kpi-label">Accessories</div>
                <div class="te-kpi-value">{{ testingEquipmentDto.accessories.length }}</div>
            </div>
        </div>

        <!-- Tabs -->
        <div class="te-tabs-shell">
            <div class="te-tabs">
                <div v-for="t in tabs" :key="t.key" class="te-tab"
                    :class="{ active: activeTab === t.key }" @click="activeTab = t.key">
                    {{ t.label }}
                </div>
                <div class="te-tab-spacer"></div>
                <button class="te-btn primary te-tab-save" @click="onSave">Save</button>
            </div>
            <div class="te-tab-body">
                <overview v-if="activeTab === 'overview'" :data="testingEquipmentDto.properties" />
                <calibration v-else-if="activeTab === 'calibration'" :records="testingEquipmentDto.calibration" />
                <software-license v-else-if="activeTab === 'license'" :licenses="testingEquipmentDto.licenses" />
                <repair-history v-else-if="activeTab === 'repair'" :records="testingEquipmentDto.repairs" />
                <usage-history v-else-if="activeTab === 'usage'" :records="testingEquipmentDto.usage" />
                <accessories v-else-if="activeTab === 'accessories'" :items="testingEquipmentDto.accessories" />
                <attachment-common v-else-if="activeTab === 'attachments'"
                    :attachment_="testingEquipmentDto.attachments" height="240px"
                    @data-attachment="onAttachmentData" />
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import overview from './components/overview.vue'
import calibration from './components/calibration.vue'
import softwareLicense from './components/softwareLicense.vue'
import repairHistory from './components/repairHistory.vue'
import usageHistory from './components/usageHistory.vue'
import accessories from './components/accessories.vue'
import attachmentCommon from '@/views/Common/Attachment.vue'
import mixin from './mixin'

export default {
    name: 'TestingEquipment',
    mixins: [mixin],
    components: {
        overview, calibration, softwareLicense,
        repairHistory, usageHistory, accessories, attachmentCommon
    },
    props: {
        equipmentMrid: { type: String, default: null },
        // equipment selected from the list (one item of equipmentData)
        equipment: { type: Object, default: null }
    },
    data() {
        return {
            activeTab: 'overview',
            tabs: [
                { key: 'overview', label: 'Overview' },
                { key: 'calibration', label: 'Calibration' },
                { key: 'license', label: 'Software License' },
                { key: 'repair', label: 'Repair History' },
                { key: 'usage', label: 'Usage History' },
                { key: 'accessories', label: 'Accessories' },
                { key: 'attachments', label: 'Attachments' }
            ]
        }
    },
    created() {
        this.initForm()
    },
    watch: {
        equipmentMrid() { this.initForm() },
        equipment() { this.initForm() }
    },
    computed: {
        initials() {
            const n = this.testingEquipmentDto.properties.name || 'TE'
            return n.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
        },
        statusTag() {
            const map = {
                Available:   { label: 'Available',    cls: 'green' },
                InUse:       { label: 'In use',        cls: 'blue' },
                UnderRepair: { label: 'Under repair',  cls: 'orange' },
                Retired:     { label: 'Retired',       cls: 'gray' }
            }
            return map[this.testingEquipmentDto.properties.status] || { label: '—', cls: 'gray' }
        },
        enabledLicenses() { return this.testingEquipmentDto.licenses.filter(l => l.enabled).length },
        nextDue() {
            const dues = this.testingEquipmentDto.calibration.map(c => c.due_date).filter(Boolean).sort()
            return dues.length ? 'next due ' + dues[0] : 'no due date'
        },
        calibrationTag() {
            const dues = this.testingEquipmentDto.calibration.map(c => c.due_date).filter(Boolean).sort()
            if (!dues.length) return null
            const days = Math.round((new Date(dues[0]) - new Date()) / 86400000)
            if (days < 0)  return { label: 'Calibration expired', cls: 'red' }
            if (days < 30) return { label: 'Calibration due',     cls: 'yellow' }
            return { label: 'Calibration valid', cls: 'green' }
        }
    },
    methods: {
        // Nạp form: ưu tiên mrid (đọc DB) -> bản ghi Excel -> form trống (create)
        initForm() {
            this.activeTab = 'overview'
            if (this.equipmentMrid) {
                this.loadFromDb(this.equipmentMrid)
            } else {
                this.loadData(this.equipment)
            }
        },
        // đồng bộ danh sách file đính kèm ([{path}]) từ component Attachment vào dto
        onAttachmentData(rows) {
            this.testingEquipmentDto.attachments = Array.isArray(rows) ? rows : []
        },
        async onSave() {
            const rs = await this.saveTestingEquipment()
            if (rs && rs.success) this.$emit('saved', this.testingEquipmentDto)
        }
    }
}
</script>

<style scoped>
.te-root {
    --blue-900: #0b2f86; --blue-800: #123c9c; --blue-50: #eef4ff;
    --gray-900: #111827; --gray-700: #374151; --gray-600: #4b5563;
    --gray-500: #6b7280; --gray-400: #9ca3af; --gray-200: #e5e7eb;
    --gray-100: #f3f4f6; --gray-50: #f9fafb;
    --shadow: 0 8px 24px rgba(15, 23, 42, 0.08); --radius: 12px;
    background: #edf1f7; padding: 18px;
    font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif; color: var(--gray-700);
}
.te-header {
    background: #fff; border-radius: var(--radius); box-shadow: var(--shadow);
    padding: 20px; display: grid; grid-template-columns: 1fr auto; gap: 18px; margin-bottom: 16px;
}
.te-title { display: flex; align-items: flex-start; gap: 14px; }
.te-avatar {
    width: 54px; height: 54px; border-radius: 14px; background: var(--blue-50);
    color: var(--blue-900); display: grid; place-items: center; font-size: 20px; font-weight: 900; flex-shrink: 0;
}
.te-title h2 { margin: 0 0 6px; font-size: 21px; color: var(--gray-900); }
.te-subtitle { color: var(--gray-600); display: flex; flex-wrap: wrap; gap: 8px; font-size: 13px; }
.dot-sep::before { content: "•"; margin-right: 8px; color: var(--gray-400); }
.te-header-side { display: grid; gap: 8px; justify-items: end; align-content: start; }
.tag {
    display: inline-flex; align-items: center; gap: 5px; border-radius: 999px;
    padding: 5px 11px; font-size: 12px; font-weight: 800; white-space: nowrap;
}
.tag.blue { background: var(--blue-50); color: var(--blue-900); }
.tag.green { background: #dcfce7; color: #166534; }
.tag.orange { background: #ffedd5; color: #9a3412; }
.tag.red { background: #fee2e2; color: #991b1b; }
.tag.gray { background: var(--gray-100); color: var(--gray-700); }
.tag.yellow { background: #fef9c3; color: #854d0e; }
.te-kpi-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 16px; }
.te-kpi { background: #fff; border-radius: var(--radius); box-shadow: var(--shadow); padding: 15px; }
.te-kpi-label { color: var(--gray-500); font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
.te-kpi-value { margin-top: 8px; font-size: 24px; font-weight: 900; color: var(--gray-900); }
.te-kpi-sub { font-size: 15px; color: var(--gray-400); font-weight: 700; }
.te-kpi-note { margin-top: 2px; color: var(--gray-500); font-size: 12px; }
.te-tabs-shell { background: #fff; border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
.te-tabs { display: flex; align-items: center; border-bottom: 1px solid var(--gray-200); background: #fbfcff; padding: 0 12px; gap: 2px; }
.te-tab {
    padding: 15px 14px 12px; border-bottom: 3px solid transparent;
    color: var(--gray-600); font-weight: 800; font-size: 13px; white-space: nowrap; cursor: pointer;
}
.te-tab:hover { color: var(--blue-800); }
.te-tab.active { color: var(--blue-900); border-color: var(--blue-900); }
.te-tab-spacer { flex: 1; }
.te-tab-save { margin: 8px 4px; }
.te-tab-body { padding: 20px; }
.te-btn {
    border: 1px solid var(--gray-200); background: #fff; padding: 9px 14px;
    border-radius: 9px; font-weight: 700; cursor: pointer; color: var(--gray-700); font-size: 13px;
}
.te-btn.primary { background: var(--blue-900); border-color: var(--blue-900); color: #fff; }
.te-btn.primary:hover { background: var(--blue-800); }
</style>
