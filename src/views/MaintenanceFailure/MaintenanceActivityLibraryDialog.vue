<template>
    <el-dialog
        title="Maintenance Activity Library"
        :visible="visible"
        width="1020px"
        custom-class="maintenance-library-dialog"
        append-to-body
        :close-on-click-modal="false"
        @close="$emit('close')">
        <div class="library-controls">
            <div class="library-type-control">
                <label for="maintenance-library-type">Circuit breaker type</label>
                <el-select id="maintenance-library-type" v-model="selectedKey" placeholder="Select type">
                    <el-option v-for="key in libraryKeys" :key="key" :label="libraries[key].label" :value="key" />
                </el-select>
            </div>
            <div class="library-search-control">
                <label for="maintenance-library-search">Search activities</label>
                <el-input id="maintenance-library-search" v-model="search" clearable
                    prefix-icon="el-icon-search" placeholder="Code, component, activity, linked test" />
            </div>
        </div>

        <div class="library-count">{{ filteredActivities.length }} / {{ activities.length }} activities</div>
        <div v-loading="loading" class="library-table-scroll">
            <table>
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Component</th>
                        <th>Maintenance Activity</th>
                        <th>Type</th>
                        <th>Requirement</th>
                        <th>Linked Test</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="activity in filteredActivities" :key="activity.code">
                        <td class="library-code">{{ activity.code }}</td>
                        <td>{{ activity.component }}</td>
                        <td class="library-name">{{ activity.name }}</td>
                        <td>{{ activity.type }}</td>
                        <td>
                            <span :class="['library-requirement', activity.requirement === 'Mandatory' ? 'mandatory' : 'optional']">
                                {{ activity.requirement }}
                            </span>
                        </td>
                        <td>{{ activity.linkedTest || '-' }}</td>
                    </tr>
                    <tr v-if="!loading && !filteredActivities.length">
                        <td class="library-empty" colspan="6">{{ error || 'No matching activities' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <span slot="footer">
            <el-button type="primary" @click="$emit('close')">Close</el-button>
        </span>
    </el-dialog>
</template>

<script>
export default {
    name: 'MaintenanceActivityLibraryDialog',
    props: {
        visible: { type: Boolean, default: false },
        asset: { type: Object, required: true }
    },
    data() {
        return {
            libraries: {},
            libraryKeys: [],
            selectedKey: '',
            search: '',
            loading: false,
            error: '',
            requestId: 0
        }
    },
    computed: {
        activities() {
            const library = this.libraries[this.selectedKey]
            return library ? library.activities : []
        },
        filteredActivities() {
            const query = this.search.trim().toLowerCase()
            if (!query) return this.activities
            return this.activities.filter(activity => [
                activity.code,
                activity.component,
                activity.name,
                activity.type,
                activity.requirement,
                activity.linkedTest
            ].some(value => String(value || '').toLowerCase().includes(query)))
        }
    },
    watch: {
        visible(value) {
            if (value) this.resetView()
            else {
                this.requestId++
                this.loading = false
            }
        },
        'asset.mrid'() {
            if (this.visible) this.resetView()
        }
    },
    methods: {
        resetView() {
            const properties = (this.asset._cachedEntityData && this.asset._cachedEntityData.properties) || {}
            const type = [this.asset.type, this.asset.asset_type, this.asset.breaker_type,
                this.asset.model, this.asset.asset_info_manufacturer_type, this.asset.apparatus_id,
                this.asset.name, this.asset.aliasName, properties.type, properties.apparatus_id,
                properties.manufacturer_type].filter(Boolean).join(' ').toLowerCase()
            if (/metal.clad|switchgear/.test(type)) this.selectedKey = 'MV_SWGR'
            else if (/sf6|sf 6/.test(type)) this.selectedKey = 'SF6_OUTDOOR'
            else if (/vacuum|vcb/.test(type)) this.selectedKey = 'VCB_OUTDOOR'
            else this.selectedKey = ''
            this.search = ''
            this.loadLibraries()
        },
        async loadLibraries() {
            const requestId = ++this.requestId
            this.loading = true
            this.error = ''
            try {
                const result = await window.electronAPI.getMaintenanceActivityLibrary()
                if (requestId !== this.requestId) return
                if (!result || !result.success) throw new Error(result && result.message ? result.message : 'Could not load maintenance activities')

                const libraries = {}
                for (const activity of result.data || []) {
                    if (!libraries[activity.libraryKey]) {
                        libraries[activity.libraryKey] = { label: activity.libraryLabel, activities: [] }
                    }
                    libraries[activity.libraryKey].activities.push(activity)
                }
                this.libraries = libraries
                this.libraryKeys = Object.keys(libraries)
                if (!libraries[this.selectedKey]) this.selectedKey = this.libraryKeys[0] || ''
            } catch (error) {
                if (requestId !== this.requestId) return
                this.libraries = {}
                this.libraryKeys = []
                this.error = error.message || 'Could not load maintenance activities'
            } finally {
                if (requestId === this.requestId) this.loading = false
            }
        }
    }
}
</script>

<style>
.maintenance-library-dialog {
    max-width: calc(100vw - 32px);
    margin-top: 6vh !important;
}
.maintenance-library-dialog .el-dialog__body {
    padding: 18px 24px 0;
}
.maintenance-library-dialog .el-dialog__title {
    font-size: 18px;
    font-weight: 600;
}
.library-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}
.library-controls > div {
    display: flex;
    flex: 1 1 270px;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
}
.library-controls label {
    color: #526177;
    font-size: 12px;
    font-weight: 600;
}
.library-controls .el-select {
    width: 100%;
}
.library-count {
    padding: 16px 0 10px;
    color: #66758a;
    font-size: 12px;
}
.library-table-scroll {
    max-height: 55vh;
    overflow: auto;
    border: 1px solid #dce2eb;
    border-radius: 4px;
}
.library-table-scroll table {
    width: 100%;
    min-width: 820px;
    border-collapse: collapse;
    text-align: left;
    font-size: 12px;
}
.library-table-scroll th {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 11px 12px;
    background: #f4f6f9;
    color: #536073;
    font-weight: 600;
    white-space: nowrap;
}
.library-table-scroll td {
    padding: 10px 12px;
    border-top: 1px solid #e5e9ef;
    color: #334155;
    vertical-align: top;
}
.library-table-scroll tbody tr:hover {
    background: #f8faff;
}
.library-table-scroll .library-code,
.library-table-scroll .library-name {
    font-weight: 600;
}
.library-requirement {
    white-space: nowrap;
}
.library-requirement.mandatory { color: #0b3c9d; }
.library-requirement.optional { color: #68778a; }
.library-empty {
    padding: 35px 12px !important;
    color: #8590a0 !important;
    text-align: center;
}
@media (max-width: 640px) {
    .maintenance-library-dialog .el-dialog__body { padding: 14px 16px 0; }
}
</style>
