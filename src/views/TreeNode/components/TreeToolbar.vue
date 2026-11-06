<template>
    <div id="toolbar-setting-id" class="toolbar-rail-wrap" :class="{ 'is-pinned': isPinned }"
        @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
        <div class="toolbar-rail" :class="{ 'is-expanded': isExpanded, 'is-floating': !isPinned && isExpanded, 'is-pinned': isPinned }">
            <!-- Header có nút Ghim (Smart Pin) -->
            <div class="rail-header">
                <span v-show="isExpanded" class="rail-header-title">Navigation</span>
                <button type="button"
                    class="rail-pin-btn"
                    :class="{ pinned: isPinned }"
                    :title="isPinned ? 'Unpin sidebar (Quick Peek mode)' : 'Pin sidebar (Fixed mode)'"
                    @click="togglePin">
                    <i class="fa-solid fa-thumbtack"></i>
                </button>
            </div>

            <div class="rail-menu-list">
                <!-- 1. Asset Overview -->
                <button type="button" class="rail-tab" :class="{ active: activeTab === 'explorer' }" title="Asset Overview" @click="handleExplorer">
                    <div class="rail-icon"><i class="fa-solid fa-diagram-project"></i></div>
                    <span class="rail-label">Asset Overview</span>
                </button>

                <!-- 2. Testing Equipment -->
                <button type="button" class="rail-tab" :class="{ active: activeTab === 'testingEquipment' }" title="Testing Equipment" @click="handleShowEquipment">
                    <div class="rail-icon"><i class="fa-solid fa-screwdriver-wrench"></i></div>
                    <span class="rail-label">Testing Equipment</span>
                </button>

                <!-- 3. FMECA & Health Index -->
                <button type="button" class="rail-tab" :class="{ active: activeTab === 'fmeca' }" title="FMECA & Health Index" @click="handleFmeca">
                    <div class="rail-icon"><i class="fa-solid fa-table"></i></div>
                    <span class="rail-label">FMECA & Health Index</span>
                </button>

                <!-- Advanced Import -->
                <div v-if="clientSlide" class="rail-group">
                    <button type="button" class="rail-tab" :class="{ active: activeTab === 'import' || expandedGroups.import }"
                        title="Advanced Import" :aria-expanded="expandedGroups.import" aria-controls="advanced-import-menu"
                        @click="toggleSubmenu('import')">
                        <div class="rail-icon"><i class="fa-solid fa-file-import"></i></div>
                        <span class="rail-label">Advanced Import</span>
                        <i v-if="isExpanded" class="fa-solid rail-arrow"
                            :class="expandedGroups.import ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
                    </button>
                    <div v-if="isExpanded && expandedGroups.import" id="advanced-import-menu" class="rail-submenu">
                        <button type="button" class="rail-subitem" @click="handleImportCommand('importJSON')">
                            <i class="fa-solid fa-file-code"></i><span>Import Tree Package</span>
                        </button>
                        <button type="button" class="rail-subitem" title="Import From PTM (OMICRON)" @click="handleImportCommand('importPTM')">
                            <i class="fa-solid fa-file-zipper"></i><span>Import PTM</span>
                        </button>
                        <button type="button" class="rail-subitem" title="Import From CPXpert (OMICRON)" @click="handleImportCommand('importCPXpert')">
                            <i class="fa-solid fa-file-zipper"></i><span>Import CPXpert</span>
                        </button>
                        <button type="button" class="rail-subitem" @click="handleImportCommand('importExcel')">
                            <i class="fa-solid fa-file-excel"></i>
                            <span>Import From Excel</span>
                        </button>
                        <button type="button" class="rail-subitem" @click="handleImportCommand('importWord')">
                            <i class="fa-solid fa-file-word"></i>
                            <span>Import From Word</span>
                        </button>
                    </div>
                </div>

                <!-- 6. Advanced Export -->
                <div v-if="clientSlide" class="rail-group">
                    <button type="button" class="rail-tab" :class="{ active: activeTab === 'export' || expandedGroups.export }"
                        title="Advanced Export" :aria-expanded="expandedGroups.export" aria-controls="advanced-export-menu"
                        @click="toggleSubmenu('export')">
                        <div class="rail-icon"><i class="fa-solid fa-file-export"></i></div>
                        <span class="rail-label">Advanced Export</span>
                        <i v-if="isExpanded" class="fa-solid rail-arrow"
                            :class="expandedGroups.export ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
                    </button>
                    <div v-if="isExpanded && expandedGroups.export" id="advanced-export-menu" class="rail-submenu">
                        <button type="button" class="rail-subitem" @click="handleExportCommand('exportJSONOnlyNode')">
                            <i class="fa-solid fa-file-code"></i><span>Export Package Only Node</span>
                        </button>
                        <button type="button" class="rail-subitem" @click="handleExportCommand('exportJSONFullTree')">
                            <i class="fa-solid fa-file-code"></i><span>Export Package Full Tree</span>
                        </button>
                        <button type="button" class="rail-subitem" @click="handleExportCommand('exportExcel')">
                            <i class="fa-solid fa-file-excel"></i>
                            <span>Export To Excel</span>
                        </button>
                        <button type="button" class="rail-subitem" @click="handleExportCommand('exportWord')">
                            <i class="fa-solid fa-file-word"></i>
                            <span>Export To Word</span>
                        </button>
                    </div>
                </div>

                <!-- Contextual: Maintenance & Failure Record -->
                <button v-if="maintenanceFailureEnabled && clientSlide" type="button" class="rail-tab"
                    :class="{ active: activeTab === 'maintenanceFailure' }"
                    :disabled="selectedMode !== 'asset'"
                    :title="selectedMode === 'asset' ? 'Maintenance & Failure Record' : 'Select an asset to open Maintenance & Failure Record'"
                    aria-label="Maintenance & Failure Record" @click="handleMaintenanceFailure">
                    <div class="rail-icon"><i class="fa-solid fa-clipboard-check"></i></div>
                    <span class="rail-label">Maintenance Record</span>
                </button>

                <!-- Contextual: Upload / Download test -->
                <button v-if="selectedMode === 'test' && clientSlide" type="button" class="rail-tab" title="Upload only test" aria-label="Upload only test" @click="$emit('upload')">
                    <div class="rail-icon"><i class="fa-solid fa-file-arrow-up"></i></div>
                    <span class="rail-label">Upload test</span>
                </button>
                <button v-if="selectedMode === 'test' && !clientSlide" type="button" class="rail-tab" title="Download test" aria-label="Download test" @click="$emit('download-test')">
                    <div class="rail-icon"><i class="fa-solid fa-file-arrow-down"></i></div>
                    <span class="rail-label">Download test</span>
                </button>

                <!-- Search Popover -->
                <el-popover
                    v-model="searchOpen"
                    placement="right-start"
                    trigger="click"
                    :visible-arrow="false"
                    popper-class="tree-search-popper"
                    width="380"
                    @after-enter="onSearchOpened">
                    <TreeSearchPanel
                        ref="searchPanel"
                        :client-slide="clientSlide"
                        :preview-data="searchPreviewData"
                        @select="onSearchSelect"
                        @preview="$emit('search-preview', $event)"
                        @close="searchOpen = false" />
                    <button slot="reference" type="button" class="rail-tab" :class="{ active: searchOpen }" title="Search">
                        <div class="rail-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
                        <span class="rail-label">Search</span>
                    </button>
                </el-popover>
            </div>

            <div class="rail-spacer"></div>
        </div>
    </div>
</template>

<script>
import TreeSearchPanel from '@/views/TreeNode/components/TreeSearchPanel.vue'
import { MAINTENANCE_FAILURE_ENABLED } from '@/config/featureFlags'

const PIN_KEY = 'treeToolbarPinned'

const getCurrentUserSuffix = () => {
    try {
        const rawUser = localStorage.getItem('user')
        if (!rawUser) return ''
        const user = JSON.parse(rawUser)
        const userId = user && (user.user_id || user.id)
        return userId ? `@u-${userId}` : ''
    } catch (error) {
        return ''
    }
}

const getPinKey = () => `${PIN_KEY}${getCurrentUserSuffix()}`

export default {
    name: 'TreeToolbar',
    components: {
        TreeSearchPanel
    },
    props: {
        clientSlide: {
            type: Boolean,
            default: false
        },
        selectedMode: {
            type: String,
            default: ''
        },
        searchPreviewData: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            maintenanceFailureEnabled: MAINTENANCE_FAILURE_ENABLED,
            activeTab: 'explorer',
            isPinned: localStorage.getItem(getPinKey()) === '1',
            isHovered: false,
            searchOpen: false,
            expandedGroups: { import: false, export: false },
            hoverTimer: null
        }
    },
    computed: {
        isExpanded() {
            return this.isPinned || this.isHovered || this.searchOpen
        }
    },
    beforeDestroy() {
        if (this.hoverTimer) {
            clearTimeout(this.hoverTimer)
            this.hoverTimer = null
        }
    },
    methods: {
        handleMouseEnter() {
            if (this.hoverTimer) {
                clearTimeout(this.hoverTimer)
                this.hoverTimer = null
            }
            this.isHovered = true
        },
        handleMouseLeave() {
            if (this.isPinned) return
            this.hoverTimer = setTimeout(() => {
                this.isHovered = false
                this.hoverTimer = null
            }, 160)
        },
        togglePin() {
            this.isPinned = !this.isPinned
            localStorage.setItem(getPinKey(), this.isPinned ? '1' : '0')
        },
        toggleSubmenu(group) {
            this.isHovered = true
            this.expandedGroups[group] = !this.expandedGroups[group]
        },
        onSearchOpened() {
            const panel = this.$refs.searchPanel
            if (panel && typeof panel.focus === 'function') panel.focus()
        },
        onSearchSelect(result) {
            this.searchOpen = false
            this.$emit('search-select', result)
        },
        handleExplorer() {
            this.activeTab = 'explorer'
            this.$emit('explorer-tab')
        },
        handleImportCommand(command) {
            this.activeTab = 'import'
            this.$emit('import-command', command)
        },
        handleExportCommand(command) {
            this.activeTab = 'export'
            this.$emit('export-command', command)
        },
        handleFmeca() {
            this.activeTab = 'fmeca'
            this.$emit('fmeca')
        },
        handleShowEquipment() {
            this.activeTab = 'testingEquipment'
            this.$emit('show-equipment')
        },
        handleMaintenanceFailure() {
            if (this.selectedMode !== 'asset') return
            this.activeTab = 'maintenanceFailure'
            this.$emit('maintenance-failure')
        },
        showDownloadDropdown() {}
    }
}
</script>

<style scoped>
.toolbar-rail-wrap {
    height: 100%;
    width: 52px;
    flex-shrink: 0;
    position: relative;
    z-index: 100;
    box-sizing: border-box;
    transition: width 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.toolbar-rail-wrap.is-pinned {
    width: 240px;
    z-index: 100;
}

.toolbar-rail {
    position: absolute;
    top: 0;
    left: 0;
    width: 52px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    background: #123f83;
    border-right: 1px solid #0b2f66;
    box-sizing: border-box;
    transition: width 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s ease;
    overflow-x: hidden;
    overflow-y: auto;
    user-select: none;
    z-index: 100;
}

.toolbar-rail::-webkit-scrollbar {
    width: 4px;
}
.toolbar-rail::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
}

/* Expanded state: width expands to 240px */
.toolbar-rail.is-expanded {
    width: 240px;
}

/* Quick Peek mode: floating overlay over workspace */
.toolbar-rail.is-floating {
    z-index: 1000;
    box-shadow: 4px 0 20px rgba(0, 15, 45, 0.35);
}

/* Smart Pin mode: stays in layout flow */
.toolbar-rail.is-pinned {
    box-shadow: none;
}

.rail-header {
    height: 42px;
    min-height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 6px;
    box-sizing: border-box;
}

.toolbar-rail.is-expanded .rail-header {
    justify-content: space-between;
}

.rail-header-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: rgba(255, 255, 255, 0.65);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-left: 6px;
}

.rail-pin-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: rgba(255, 255, 255, 0.65);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: color 0.15s, background 0.15s, transform 0.2s;
    outline: none;
}

.rail-pin-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.12);
}

.rail-pin-btn.pinned {
    color: #409eff;
    background: rgba(64, 158, 255, 0.18);
    transform: rotate(0deg);
}

.rail-pin-btn:not(.pinned) {
    transform: rotate(-45deg);
}

.rail-menu-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0;
    flex: 1;
}

.rail-tab {
    width: 100%;
    height: 38px;
    min-height: 38px;
    flex-shrink: 0;
    border: none;
    border-left: 3px solid transparent;
    border-radius: 0 4px 4px 0;
    background: transparent;
    color: rgba(255, 255, 255, 0.78);
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0;
    box-sizing: border-box;
    text-align: left;
    transition: background 0.15s, color 0.15s, border-left-color 0.15s;
    outline: none;
}

.rail-tab:hover,
.rail-tab.active {
    background: rgba(255, 255, 255, 0.12);
    border-left-color: #ffffff;
    color: #ffffff;
}

.rail-tab:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.rail-tab:disabled:hover {
    background: transparent;
    border-left-color: transparent;
    color: rgba(255, 255, 255, 0.78);
}

.rail-icon {
    width: 52px;
    min-width: 52px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
}

.rail-label {
    flex: 1;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 8px;
    opacity: 0;
    transform: translateX(-4px);
    transition: opacity 0.18s ease, transform 0.18s ease;
    pointer-events: none;
}

.toolbar-rail.is-expanded .rail-label {
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
}

.rail-arrow {
    font-size: 10px;
    margin-right: 12px;
    color: rgba(255, 255, 255, 0.4);
    flex-shrink: 0;
}

.rail-group {
    width: 100%;
    flex-shrink: 0;
}

.rail-submenu {
    margin: 2px 8px 6px 35px;
    border-left: 1px solid rgba(255, 255, 255, 0.25);
    padding-left: 8px;
}

.rail-subitem {
    width: 100%;
    min-height: 38px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 7px;
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: rgba(255, 255, 255, 0.78);
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.3;
    text-align: left;
    cursor: pointer;
}

.rail-subitem:hover,
.rail-subitem:focus-visible {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    outline: none;
}

.rail-subitem > *:first-child {
    flex: 0 0 16px;
    text-align: center;
}

.rail-subitem > i {
    font-size: 15px;
}

.rail-subitem span {
    min-width: 0;
    overflow-wrap: anywhere;
}

.rail-spacer {
    flex: 1;
}

.toolbar-rail ::v-deep .el-popover__reference-wrapper {
    width: 100%;
    display: block;
}

</style>
