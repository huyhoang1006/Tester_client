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

                <!-- 4. Import Test Report (Tính năng mới - TES-278) -->
                <button v-if="clientSlide" type="button" class="rail-tab" :class="{ active: activeTab === 'importTestReport' }" title="Import Test Report" @click="handleImportTestReport">
                    <div class="rail-icon"><i class="fa-solid fa-file-circle-plus"></i></div>
                    <span class="rail-label">Import Test Report</span>
                </button>

                <!-- 5. Advanced Import -->
                <el-dropdown v-if="clientSlide" @command="handleImportCommand" @visible-change="handleDropdownVisibleChange" trigger="click" placement="right-start">
                    <button type="button" class="rail-tab" :class="{ active: activeTab === 'import' }" title="Advanced Import">
                        <div class="rail-icon"><i class="fa-solid fa-file-import"></i></div>
                        <span class="rail-label">Advanced Import</span>
                        <i v-if="isExpanded" class="fa-solid fa-chevron-right rail-arrow"></i>
                    </button>
                    <el-dropdown-menu slot="dropdown" class="rail-dropdown-menu">
                        <el-dropdown-item command="importJSON">
                            <i class="fa-solid fa-file-zipper" style="font-size:12px"></i>
                            Import tree package
                        </el-dropdown-item>
                        <el-dropdown-item command="importPTM">
                            <i class="fa-solid fa-file-zipper" style="font-size:12px"></i>
                            Import from PTM (OMICRON)
                        </el-dropdown-item>
                        <el-dropdown-item command="importCPXpert">
                            <i class="fa-solid fa-file-zipper" style="font-size:12px"></i>
                            Import from CPXpert (OMICRON)
                        </el-dropdown-item>
                        <el-dropdown-item command="importExcel">
                            <icon size="12px" fileTypeDetail="excel" folderType="fileType" badgeColor="146EBE"></icon>
                            Import from Excel
                        </el-dropdown-item>
                        <el-dropdown-item command="importWord">
                            <icon size="12px" fileTypeDetail="word" folderType="fileType" badgeColor="146EBE"></icon>
                            Import from Word
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>

                <!-- 6. Advanced Export -->
                <el-dropdown v-if="clientSlide" @command="handleExportCommand" @visible-change="handleDropdownVisibleChange" trigger="click" placement="right-start">
                    <button type="button" class="rail-tab" :class="{ active: activeTab === 'export' }" title="Advanced Export">
                        <div class="rail-icon"><i class="fa-solid fa-file-export"></i></div>
                        <span class="rail-label">Advanced Export</span>
                        <i v-if="isExpanded" class="fa-solid fa-chevron-right rail-arrow"></i>
                    </button>
                    <el-dropdown-menu slot="dropdown" class="rail-dropdown-menu">
                        <el-dropdown-item command="exportJSONOnlyNode">
                            <i class="fa-solid fa-file-zipper" style="font-size:12px"></i>
                            Export package only node
                        </el-dropdown-item>
                        <el-dropdown-item command="exportJSONFullTree">
                            <i class="fa-solid fa-file-zipper" style="font-size:12px"></i>
                            Export package full tree
                        </el-dropdown-item>
                        <el-dropdown-item command="exportExcel">
                            <icon size="12px" fileTypeDetail="excel" folderType="fileType" badgeColor="146EBE"></icon>
                            Export to Excel
                        </el-dropdown-item>
                        <el-dropdown-item command="exportWord">
                            <icon size="12px" fileTypeDetail="word" folderType="fileType" badgeColor="146EBE"></icon>
                            Export to Word
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>

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
import Icon from '@/views/Common/Icon.vue'
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
        Icon,
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
            dropdownActive: false,
            hoverTimer: null
        }
    },
    computed: {
        isExpanded() {
            return this.isPinned || this.isHovered || this.searchOpen || this.dropdownActive
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
        handleDropdownVisibleChange(visible) {
            this.dropdownActive = visible
            this.$emit('dropdown-visible-change', visible)
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
        handleImportTestReport() {
            this.activeTab = 'importTestReport'
            this.$emit('import-test-report')
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
    box-sizing: border-box;
    transition: width 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.toolbar-rail-wrap.is-pinned {
    width: 240px;
}

.toolbar-rail {
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
}

.toolbar-rail::-webkit-scrollbar {
    width: 4px;
}
.toolbar-rail::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
}

/* Quick Peek mode: floating overlay over workspace */
.toolbar-rail.is-floating {
    position: absolute;
    top: 0;
    left: 0;
    width: 240px;
    height: 100%;
    z-index: 1000;
    box-shadow: 4px 0 20px rgba(0, 15, 45, 0.35);
}

/* Smart Pin mode: stays in layout flow */
.toolbar-rail.is-pinned {
    position: relative;
    width: 100%;
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

.rail-spacer {
    flex: 1;
}

.toolbar-rail ::v-deep .el-dropdown {
    width: 100%;
    display: block;
}

.toolbar-rail ::v-deep .el-popover__reference-wrapper {
    width: 100%;
    display: block;
}

.el-dropdown-menu__item {
    font-size: 12px !important;
    font-family: Arial, sans-serif !important;
}
</style>
