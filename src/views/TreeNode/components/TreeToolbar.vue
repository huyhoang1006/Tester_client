<template>
    <div id="toolbar-setting-id" class="toolbar-rail-wrap" :class="{ collapsed: collapsed }">
        <!-- Rail dọc -->
        <div v-if="!collapsed" class="toolbar-rail">
            <!-- Nhóm tạo mới -->
            <el-dropdown v-if="clientSlide" ref="addDropdown" @command="handleAddCommand"
                @visible-change="handleDropdownVisibleChange" trigger="click" placement="bottom-start">
                <button type="button" class="rail-btn" title="Add">
                    <i class="fa-solid fa-plus"></i>
                </button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-if="isCommandAllowed('organisation')" command="organisation">
                        <icon size="12px" folderType="building" badgeColor="146EBE"></icon> add Organisation
                    </el-dropdown-item>
                    <el-dropdown-item v-if="isCommandAllowed('substation')" command="substation">
                        <icon size="12px" folderType="location" badgeColor="146EBE"></icon> add Substation
                    </el-dropdown-item>
                    <el-dropdown-item v-if="isCommandAllowed('voltageLevel')" command="voltageLevel">
                        <icon size="12px" folderType="voltageLevel" badgeColor="146EBE"></icon> add Voltage Level
                    </el-dropdown-item>
                    <el-dropdown-item v-if="isCommandAllowed('bay')" command="bay">
                        <icon size="12px" folderType="bay" badgeColor="146EBE"></icon> add Bay
                    </el-dropdown-item>
                    <el-dropdown-item v-if="isCommandAllowed('asset')" command="asset" class="asset-submenu-parent"
                        @mouseenter.native="showAssetSub = true" @mouseleave.native="showAssetSub = false">
                        <icon size="12px" folderType="asset" badgeColor="146EBE"></icon> add Asset
                        <div class="asset-submenu" v-if="showAssetSub" @click.stop @mouseenter.stop @mouseleave.stop>
                            <div class="submenu-item" @click="handleAssetCommand('Transformer')">
                                <i class="fa-solid fa-bolt"></i>
                                <span>Add Transformer</span>
                            </div>
                            <div class="submenu-item" @click="handleAssetCommand('Surge arrester')">
                                <i class="fa-solid fa-shield-halved"></i>
                                <span>Add Surge arrester</span>
                            </div>
                            <div class="submenu-item" @click="handleAssetCommand('Bushing')">
                                <i class="fa-solid fa-shield"></i>
                                <span>Add Bushing</span>
                            </div>
                            <div class="submenu-item" @click="handleAssetCommand('Voltage transformer')">
                                <i class="fa-solid fa-bolt-lightning"></i>
                                <span>Add VT</span>
                            </div>
                            <div class="submenu-item" @click="handleAssetCommand('Disconnector')">
                                <i class="fa-solid fa-plug-circle-xmark"></i>
                                <span>Add Disconnector</span>
                            </div>
                            <div class="submenu-item" @click="handleAssetCommand('Power cable')">
                                <i class="fa-solid fa-route"></i>
                                <span>Add Power cable</span>
                            </div>
                            <div class="submenu-item" @click="handleAssetCommand('Current transformer')">
                                <i class="fa-solid fa-ruler"></i>
                                <span>Add CT</span>
                            </div>
                            <div class="submenu-item" @click="handleAssetCommand('Circuit breaker')">
                                <i class="fa-solid fa-plug"></i>
                                <span>Add Circuit breaker</span>
                            </div>
                            <div class="submenu-item" @click="handleAssetCommand('Rotating machine')">
                                <i class="fa-solid fa-group-arrows-rotate"></i>
                                <span>Add Rotating machine</span>
                            </div>
                            <div class="submenu-item" @click="handleAssetCommand('Capacitor')">
                                <i class="fa-solid fa-bolt"></i>
                                <span>Add Capacitor</span>
                            </div>
                            <div class="submenu-item" @click="handleAssetCommand('Reactor')">
                                <i class="fa-solid fa-bolt"></i>
                                <span>Add Reactor</span>
                            </div>
                        </div>
                    </el-dropdown-item>
                    <el-dropdown-item v-if="isCommandAllowed('job')" command="job">
                        <icon size="12px" folderType="job" badgeColor="146EBE"></icon> add Job
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>

            <button type="button" class="rail-btn" title="Open" @click="handleOpenNode">
                <i class="fa-regular fa-folder-open"></i>
            </button>
            <button v-if="clientSlide" type="button" class="rail-btn" title="Duplicate" @click="handleDuplicate">
                <i class="fa-solid fa-clone"></i>
            </button>

            <div class="rail-sep"></div>

            <!-- Nhóm dữ liệu vào/ra -->
            <el-dropdown v-if="clientSlide" @command="handleImportCommand" trigger="click" placement="bottom-start">
                <button type="button" class="rail-btn" title="Import">
                    <i class="fa-solid fa-file-import"></i>
                </button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="importJSON">
                        <icon size="12px" fileTypeDetail="json" folderType="fileType" badgeColor="146EBE"></icon>
                        import from JSON
                    </el-dropdown-item>
                    <el-dropdown-item command="importExcel">
                        <icon size="12px" fileTypeDetail="excel" folderType="fileType" badgeColor="146EBE"></icon>
                        import from Excel
                    </el-dropdown-item>
                    <el-dropdown-item command="importWord">
                        <icon size="12px" fileTypeDetail="word" folderType="fileType" badgeColor="146EBE"></icon>
                        import from Word
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>

            <el-dropdown v-if="clientSlide" @command="handleExportCommand" trigger="click" placement="bottom-start">
                <button type="button" class="rail-btn" title="Export">
                    <i class="fa-solid fa-file-export"></i>
                </button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="exportJSONOnlyNode">
                        <icon size="12px" fileTypeDetail="json" folderType="fileType" badgeColor="146EBE"></icon>
                        export JSON only Node
                    </el-dropdown-item>
                    <el-dropdown-item command="exportJSONFullTree">
                        <icon size="12px" fileTypeDetail="json" folderType="fileType" badgeColor="146EBE"></icon>
                        export JSON Full Tree
                    </el-dropdown-item>
                    <el-dropdown-item command="exportExcel">
                        <icon size="12px" fileTypeDetail="excel" folderType="fileType" badgeColor="146EBE"></icon>
                        export to Excel
                    </el-dropdown-item>
                    <el-dropdown-item command="exportWord">
                        <icon size="12px" fileTypeDetail="word" folderType="fileType" badgeColor="146EBE"></icon>
                        export to Word
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>

            <button v-if="clientSlide" type="button" class="rail-btn" title="Upload" @click="handleUpload">
                <i class="fa-solid fa-upload"></i>
            </button>

            <el-dropdown v-if="!clientSlide" @command="handleDownloadCommand" ref="downloadDropdown" trigger="manual"
                placement="bottom-start">
                <button type="button" class="rail-btn" title="Download" @click="openDropdown">
                    <i class="fa-solid fa-download"></i>
                </button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="downloadOnlyNode">
                        <icon size="12px" fileTypeDetail="xml" folderType="fileType" badgeColor="146EBE"></icon>
                        Download only node
                    </el-dropdown-item>
                    <el-dropdown-item command="downloadPathNode">
                        <icon size="12px" fileTypeDetail="xml" folderType="fileType" badgeColor="146EBE"></icon>
                        Download path node
                    </el-dropdown-item>
                    <el-dropdown-item command="downloadEveryNode">
                        <icon size="12px" fileTypeDetail="xml" folderType="fileType" badgeColor="146EBE"></icon>
                        Download every node
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>

            <div class="rail-sep"></div>

            <!-- Nhóm thao tác -->
            <button type="button" class="rail-btn" title="Move" @click="handleMove">
                <i class="fa-solid fa-arrows-up-down-left-right"></i>
            </button>
            <button type="button" class="rail-btn" title="FMECA" @click="handleFmeca">
                <i class="fa-solid fa-table"></i>
            </button>
            <button v-if="clientSlide" type="button" class="rail-btn" title="Show Equipment" @click="handleShowEquipment">
                <i class="fa-solid fa-screwdriver-wrench"></i>
            </button>
            <button type="button" class="rail-btn" title="Delete" @click="handleDelete">
                <i class="fa-solid fa-trash"></i>
            </button>

            <div class="rail-spacer"></div>

            <!-- Thu gọn -->
            <button type="button" class="rail-btn" title="Collapse toolbar" @click="setCollapsed(true)">
                <i class="fa-solid fa-angles-left"></i>
            </button>
        </div>

        <!-- Nút hiện lại (như Object Properties) -->
        <button v-else type="button" class="rail-show-btn" title="Show toolbar" @click="setCollapsed(false)">
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
            showAssetSub: false,
            showSub: null,
            collapsed: localStorage.getItem(COLLAPSE_KEY) === '1'
        }
    },
    methods: {
        setCollapsed(v) {
            this.collapsed = v
            localStorage.setItem(COLLAPSE_KEY, v ? '1' : '0')
        },
        // Add dropdown methods
        handleAddCommand(command) {
            this.$emit('add-command', command)
        },
        handleDropdownVisibleChange(visible) {
            this.$emit('dropdown-visible-change', visible)
        },
        handleAssetCommand(assetType) {
            this.$emit('asset-command', assetType)
        },

        // Import/Export methods
        handleImportCommand(command) {
            this.$emit('import-command', command)
        },
        handleExportCommand(command) {
            this.$emit('export-command', command)
        },

        // Action methods
        handleOpenNode() {
            this.$emit('open-node')
        },
        handleDuplicate() {
            this.$emit('duplicate')
        },
        handleUpload() {
            this.$emit('upload')
        },
        handleDownloadCommand(command) {
            if (command === "downloadOnlyNode") {
                this.downloadOnlyNode()
            }

            if (command === "downloadPathNode") {
                this.downloadPathNode()
            }

            if (command === "downloadEveryNode") {
                this.downloadEveryNode()
            }
        },
        openDropdown() {
            this.$emit('openDropdown')
        },
        showDownloadDropdown() {
            this.$refs.downloadDropdown.show()
        },
        downloadOnlyNode() {
            this.$emit('download-only-node')
        },
        downloadPathNode() {
            this.$emit('download')
        },
        downloadEveryNode() {
            this.$emit('download-every-node')
        },
        handleDelete() {
            this.$emit('delete')
        },
        handleFmeca() {
            this.$emit('fmeca')
        },
        handleMove() {
            this.$emit('move')
        },
        handleShowEquipment() {
            this.$emit('show-equipment')
        },
        // Command validation method
        isCommandAllowed(command) {
            // Emit to parent to check if command is allowed
            return this.$parent.isCommandAllowed ? this.$parent.isCommandAllowed(command) : true
        }
    }
}
</script>

<style scoped>
/* ===== Rail dọc bên trái ===== */
.toolbar-rail-wrap {
    height: 100%;
    flex-shrink: 0;
    display: flex;
    align-items: stretch;
    box-sizing: border-box;
}
/* ẩn hết như Object Properties: không chiếm cột, chỉ còn nút nổi ở mép trái */
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
    gap: 4px;
    padding: 8px 0;
    box-sizing: border-box;
    background: #fafbfc;
    border-right: 1px solid #e4e7ed;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
}
.toolbar-rail::-webkit-scrollbar {
    display: none;
}

.rail-btn {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #909399;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s;
}
/* hover: đậm lên — nền xanh đặc, icon trắng */
.rail-btn:hover {
    background: #409eff;
    color: #fff;
}

.rail-sep {
    width: 24px;
    height: 1px;
    flex-shrink: 0;
    background: #e4e7ed;
    margin: 3px 0;
}
.rail-spacer {
    flex: 1;
}

/* Nút hiện lại khi đã thu gọn — đối xứng với nút hiện Object Properties */
.rail-show-btn {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    width: 16px;
    height: 64px;
    border: 1px solid #e4e7ed;
    border-left: none;
    border-radius: 0 6px 6px 0;
    background: #f5f7fa;
    color: #909399;
    font-size: 11px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s;
}
.rail-show-btn:hover {
    background: #ecf5ff;
    color: #409eff;
    border-color: #b5d4f4;
}

/* ===== Submenu Add Asset (giữ từ bản cũ) ===== */
.asset-submenu-parent {
    position: relative;
}

.asset-submenu {
    position: absolute;
    left: 100%;
    top: 0;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    min-width: 200px;
    z-index: 1000;
    padding: 5px 0;
}

.submenu-item {
    padding: 5px 12px;
    font-size: 12px;
    cursor: pointer;
    color: #606266;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
}

.submenu-item:hover {
    background-color: #f5f7fa;
    color: rgb(20, 110, 190);
}

.submenu-item span {
    flex: 1;
}

.el-dropdown-menu__item {
    font-size: 12px !important;
    font-family: Arial, sans-serif !important;
}
</style>
