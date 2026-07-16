<template>
    <div id="toolbar-setting-id" class="toolbar-rail-wrap" :class="{ collapsed: collapsed }">
        <div v-if="!collapsed" class="toolbar-rail">
            <button type="button" class="rail-tab" :class="{ active: activeTab === 'explorer' }" title="Explorer - Tree View" @click="handleExplorer">
                <i class="fa-solid fa-diagram-project"></i>
            </button>

            <button v-if="clientSlide" type="button" class="rail-tab" :class="{ active: activeTab === 'testingEquipment' }" title="Testing Equipment" @click="handleShowEquipment">
                <i class="fa-solid fa-screwdriver-wrench"></i>
            </button>

            <button v-if="showFmeca" type="button" class="rail-tab" :class="{ active: activeTab === 'fmeca' }" title="FMECA" @click="handleFmeca">
                <i class="fa-solid fa-table"></i>
            </button>

            <el-dropdown v-if="clientSlide" @command="handleImportCommand" trigger="click" placement="bottom-start">
                <button type="button" class="rail-tab" :class="{ active: activeTab === 'import' }" title="Import">
                    <i class="fa-solid fa-file-import"></i>
                </button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="importJSON">
                        <icon size="12px" fileTypeDetail="json" folderType="fileType" badgeColor="146EBE"></icon>
                        Import from JSON
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

            <el-dropdown v-if="clientSlide" @command="handleExportCommand" trigger="click" placement="bottom-start">
                <button type="button" class="rail-tab" :class="{ active: activeTab === 'export' }" title="Export">
                    <i class="fa-solid fa-file-export"></i>
                </button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="exportJSONOnlyNode">
                        <icon size="12px" fileTypeDetail="json" folderType="fileType" badgeColor="146EBE"></icon>
                        Export JSON only node
                    </el-dropdown-item>
                    <el-dropdown-item command="exportJSONFullTree">
                        <icon size="12px" fileTypeDetail="json" folderType="fileType" badgeColor="146EBE"></icon>
                        Export JSON full tree
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

            <div class="rail-spacer"></div>

            <button type="button" class="rail-tab rail-collapse" title="Collapse sidebar tabs" @click="setCollapsed(true)">
                <i class="fa-solid fa-angles-left"></i>
            </button>
        </div>

        <button v-else type="button" class="rail-show-btn" title="Show sidebar tabs" @click="setCollapsed(false)">
            <i class="fa-solid fa-angles-right"></i>
        </button>
    </div>
</template>

<script>
import Icon from '@/views/Common/Icon.vue'

const COLLAPSE_KEY = 'treeToolbarCollapsed'

export default {
    name: 'TreeToolbar',
    components: {
        Icon
    },
    props: {
        clientSlide: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            activeTab: 'explorer',
            collapsed: localStorage.getItem(COLLAPSE_KEY) === '1',
            showFmeca: false
        }
    },
    methods: {
        setCollapsed(value) {
            this.collapsed = value
            localStorage.setItem(COLLAPSE_KEY, value ? '1' : '0')
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
        showDownloadDropdown() {}
    }
}
</script>

<style scoped>
.toolbar-rail-wrap {
    height: 100%;
    width: 44px;
    flex-shrink: 0;
    display: flex;
    align-items: stretch;
    box-sizing: border-box;
}

.toolbar-rail-wrap.collapsed {
    width: 0;
    position: relative;
    overflow: visible;
}

.toolbar-rail {
    width: 44px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    box-sizing: border-box;
    background: #123f83;
    border-right: 1px solid #0b2f66;
    overflow: hidden;
}

.rail-spacer {
    flex: 1;
}

.rail-tab {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border: none;
    border-left: 3px solid transparent;
    border-radius: 0 6px 6px 0;
    background: transparent;
    color: rgba(255, 255, 255, 0.72);
    font-size: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.rail-tab:hover,
.rail-tab.active {
    background: rgba(255, 255, 255, 0.12);
    border-left-color: #ffffff;
    color: #ffffff;
}

.rail-collapse {
    margin-bottom: 2px;
}

.rail-show-btn {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;
    width: 16px;
    height: 64px;
    border: 1px solid #0b2f66;
    border-left: none;
    border-radius: 0 6px 6px 0;
    background: #123f83;
    color: rgba(255, 255, 255, 0.78);
    font-size: 11px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s;
}

.rail-show-btn:hover {
    background: #174c9d;
    color: #ffffff;
}

.el-dropdown-menu__item {
    font-size: 12px !important;
    font-family: Arial, sans-serif !important;
}
</style>
