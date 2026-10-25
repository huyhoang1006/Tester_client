<template>
    <main class="records-workspace">
        <header class="records-header">
            <div class="records-heading">
                <span class="records-type">{{ assetType }}</span>
                <h1>{{ assetName }}</h1>
                <span v-if="assetSummary" class="records-summary">{{ assetSummary }}</span>
            </div>
            <el-button class="library-button" plain @click="libraryDialogVisible = true">
                <i class="fa-solid fa-book-open" aria-hidden="true"></i>
                View Maintenance Activity Library
            </el-button>
        </header>

        <nav class="records-tabs" aria-label="Maintenance and failure records">
            <button type="button" :class="{ active: activeSection === 'maintenance' }"
                :aria-current="activeSection === 'maintenance' ? 'page' : null"
                @click="activeSection = 'maintenance'">
                <i class="fa-solid fa-clipboard-check" aria-hidden="true"></i>
                Maintenance Records
            </button>
            <button type="button" :class="{ active: activeSection === 'failure' }"
                :aria-current="activeSection === 'failure' ? 'page' : null"
                @click="activeSection = 'failure'">
                <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                Failure Records
            </button>
        </nav>

        <section v-if="activeSection === 'maintenance'" class="records-section">
            <div class="section-heading">
                <h2>Maintenance Jobs</h2>
                <span>0 records</span>
            </div>
            <div class="table-scroll">
                <table>
                    <thead><tr><th>Reference</th><th>Date</th><th>Performed by</th><th>Activities</th><th>Comment</th></tr></thead>
                    <tbody><tr><td class="empty-row" colspan="5">No maintenance records for this asset</td></tr></tbody>
                </table>
            </div>
        </section>

        <section v-else class="records-section">
            <div class="section-heading">
                <h2>Failure Records</h2>
                <span>0 records</span>
            </div>
            <div class="table-scroll">
                <table>
                    <thead><tr><th>Date</th><th>Component</th><th>Failure mode</th><th>Root cause</th><th>Severity</th><th>Phase</th></tr></thead>
                    <tbody><tr><td class="empty-row" colspan="6">No failure records for this asset</td></tr></tbody>
                </table>
            </div>
        </section>
        <MaintenanceActivityLibraryDialog
            :visible="libraryDialogVisible"
            :asset="asset"
            @close="libraryDialogVisible = false" />
    </main>
</template>

<script>
import MaintenanceActivityLibraryDialog from './MaintenanceActivityLibraryDialog.vue'

export default {
    name: 'MaintenanceFailure',
    components: { MaintenanceActivityLibraryDialog },
    props: {
        asset: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            activeSection: 'maintenance',
            libraryDialogVisible: false
        }
    },
    computed: {
        properties() {
            return (this.asset._cachedEntityData && this.asset._cachedEntityData.properties) || {}
        },
        assetName() {
            return this.asset.apparatus_id || this.properties.apparatus_id || this.asset.name ||
                this.asset.aliasName || this.asset.serial_number || this.properties.serial_no || 'Asset'
        },
        assetType() {
            return this.asset.asset || this.asset.asset_type || 'Asset'
        },
        assetSummary() {
            const serial = this.asset.serial_number || this.asset.serial_no || this.properties.serial_no
            const manufacturer = this.asset.manufacturer || this.properties.manufacturer
            const model = this.asset.asset_info_manufacturer_type || this.asset.manufacturer_type ||
                this.properties.manufacturer_type || this.asset.model
            return [serial && `S/N ${serial}`, manufacturer, model].filter(Boolean).join(' - ')
        }
    },
    watch: {
        'asset.mrid'() {
            this.activeSection = 'maintenance'
            this.libraryDialogVisible = false
        }
    }
}
</script>

<style scoped>
.records-workspace {
    height: 100%;
    overflow: auto;
    background: #fff;
    color: #253247;
}
.records-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 24px 30px 20px;
    border-bottom: 1px solid #dce2eb;
}
.library-button {
    flex-shrink: 0;
}
.library-button i {
    margin-right: 6px;
    color: #0b3c9d;
}
.records-heading {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
}
.records-type {
    color: #596779;
    font-size: 12px;
}
h1 {
    margin: 0;
    font-size: 21px;
    font-weight: 600;
    overflow-wrap: anywhere;
}
.records-summary {
    color: #778397;
    font-size: 12px;
    overflow-wrap: anywhere;
}
.records-tabs {
    display: flex;
    gap: 20px;
    padding: 0 30px;
    border-bottom: 1px solid #dce2eb;
}
.records-tabs button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 46px;
    padding: 0 4px;
    border: 0;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: #526177;
    font: inherit;
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;
}
.records-tabs button.active {
    color: #0b3c9d;
    border-bottom-color: #0b3c9d;
    font-weight: 600;
}
.records-section {
    padding: 24px 30px;
}
.section-heading {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 14px;
}
.section-heading h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
}
.section-heading span {
    color: #778397;
    font-size: 12px;
}
.table-scroll {
    max-width: 100%;
    overflow-x: auto;
    border: 1px solid #dce2eb;
    border-radius: 4px;
}
table {
    width: 100%;
    min-width: 680px;
    border-collapse: collapse;
    text-align: left;
    font-size: 13px;
}
th {
    padding: 12px 14px;
    background: #f4f6f9;
    color: #536073;
    font-weight: 600;
}
.empty-row {
    padding: 48px 14px;
    border-top: 1px solid #dce2eb;
    color: #8590a0;
    text-align: center;
}
@media (max-width: 640px) {
    .records-header, .records-section { padding: 18px 16px; }
    .records-header { align-items: flex-start; flex-direction: column; }
    .records-tabs { gap: 16px; padding: 0 16px; overflow-x: auto; }
}
</style>
