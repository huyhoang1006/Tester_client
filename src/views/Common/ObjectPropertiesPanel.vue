<template>
    <div class="op-panel">
        <div class="op-title">
            <span class="op-title-text">Object Properties</span>
            <button type="button" class="op-hide-btn" title="Hide panel" @click="$emit('hide')">
                <i class="fa-solid fa-angles-right"></i>
            </button>
        </div>

        <div class="op-body">
            <section v-for="section in visibleSections" :key="section.key" class="op-section">
                <div class="op-section-header" @click="toggleSection(section.key)">
                    <i class="fa-solid fa-angle-right op-chevron" :class="{ open: !collapsed[section.key] }"></i>
                    <span>{{ section.title }}</span>
                </div>
                <div v-show="!collapsed[section.key]" class="op-rows">
                    <div v-for="row in section.rows" :key="row.label" class="op-row">
                        <span class="op-label">{{ row.label }}</span>
                        <span class="op-value" :class="{ empty: !hasValue(row.value) }">{{ hasValue(row.value) ? row.value : '—' }}</span>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
// Panel "Object Properties" dùng chung cho server (treeNavigation) và client (ContextData).
export default {
    name: 'ObjectPropertiesPanel',
    props: {
        properties: {
            type: Object,
            default: () => ({})
        },
        showAsset: {
            type: Boolean,
            default: false
        },
        assetProperties: {
            type: Object,
            default: () => ({})
        },
        showJob: {
            type: Boolean,
            default: false
        },
        jobProperties: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            collapsed: {}
        }
    },
    computed: {
        visibleSections() {
            const p = this.properties || {}
            const a = this.assetProperties || {}
            const j = this.jobProperties || {}
            const sections = [{
                key: 'owner',
                title: 'Owner & Position',
                rows: [
                    { label: 'Name', value: p.name },
                    { label: 'Region', value: p.region },
                    { label: 'Plant', value: p.plant },
                    { label: 'Address', value: p.address },
                    { label: 'City', value: p.city },
                    { label: 'State/Province', value: p.state_province },
                    { label: 'Country', value: p.country },
                    { label: 'Geo coordinates', value: p.geo_coordinates },
                    { label: 'Phone number', value: p.phone_no },
                    { label: 'Email', value: p.email }
                ]
            }]
            if (this.showAsset) {
                sections.push({
                    key: 'asset',
                    title: 'Asset Properties',
                    rows: [
                        { label: 'Asset', value: a.asset },
                        { label: 'Asset type', value: a.asset_type },
                        { label: 'Serial number', value: a.serial_no },
                        { label: 'Manufacturer', value: a.manufacturer },
                        { label: 'Manufacturer type', value: a.manufacturer_type },
                        { label: 'Manufacturing year', value: a.manufacturing_year },
                        { label: 'Country', value: a.country },
                        { label: 'Asset ID', value: a.apparatus_id }
                    ]
                })
            }
            if (this.showJob) {
                sections.push({
                    key: 'job',
                    title: 'Job Properties',
                    rows: [
                        { label: 'Name', value: j.name },
                        { label: 'Work order', value: j.work_order },
                        { label: 'Creation date', value: j.creation_date },
                        { label: 'Execution date', value: j.execution_date },
                        { label: 'Tested by', value: j.tested_by },
                        { label: 'Approved by', value: j.approved_by },
                        { label: 'Ambient condition', value: j.ambient_condition },
                        { label: 'Standard', value: j.standard }
                    ]
                })
            }
            sections.push({
                key: 'config',
                title: 'Configuration Version',
                rows: [
                    { label: 'Last Modified', value: '' },
                    { label: 'Author', value: '' },
                    { label: 'Last Saved By', value: '' }
                ]
            })
            return sections
        }
    },
    methods: {
        hasValue(v) {
            return v !== null && v !== undefined && String(v).trim() !== ''
        },
        toggleSection(key) {
            this.$set(this.collapsed, key, !this.collapsed[key])
        }
    }
}
</script>

<style scoped>
.op-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    overflow: hidden;
    font-size: 12px;
}

.op-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    flex-shrink: 0;
}
.op-title-text {
    font-weight: 600;
    color: #303133;
}
.op-hide-btn {
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 4px;
    color: #909399;
    line-height: 1;
}
.op-hide-btn:hover {
    color: #409eff;
    background: #ecf5ff;
}

.op-body {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
}

.op-section + .op-section {
    border-top: 1px solid #f0f2f5;
}

.op-section-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    font-weight: 600;
    color: #606266;
    cursor: pointer;
    user-select: none;
    background: #fafbfc;
}
.op-section-header:hover {
    background: #f0f2f5;
}
.op-chevron {
    font-size: 11px;
    color: #a8abb2;
    transition: transform 0.15s ease;
}
.op-chevron.open {
    transform: rotate(90deg);
}

.op-rows {
    padding: 2px 10px 8px;
}
.op-row {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding: 4px 0;
    border-bottom: 1px dashed #f0f2f5;
}
.op-row:last-child {
    border-bottom: none;
}
.op-label {
    color: #909399;
    flex-shrink: 0;
    max-width: 45%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.op-value {
    font-weight: 500;
    color: #303133;
    text-align: right;
    word-break: break-word;
    min-width: 0;
}
.op-value.empty {
    color: #c0c4cc;
    font-weight: 400;
}
</style>
