<template>
    <div id="toolbar-setting-id" class="toolbar-setting">
        <div>
            <el-dropdown ref="addDropdown" @command="handleAddCommand" @visible-change="handleDropdownVisibleChange"
                trigger="click">
                <span class="icon-wrapper">
                    <i title="Add" style="font-size: 12px" class="fa-solid fa-square-plus"></i>
                </span>
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
                        <div class="asset-submenu" v-if="showAssetSub" @click.stop @mouseenter.stop
                            @mouseleave.stop>
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
        </div>
        <div>
            <i @click="handleOpenNode" title="Open" style="font-size: 12px" class="fa-regular fa-folder-open"></i>
        </div>
        <div>
            <i @click="handleDuplicate" title="Duplicate" style="font-size: 12px"
                class="fa-solid fa-clone"></i>
        </div>
        <div>
            <el-dropdown @command="handleImportCommand" trigger="click">
                <i title="Import" style="font-size: 12px" class="fa-solid fa-file-import"></i>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item class="import-json-parent" @mouseenter.native="showSubImport = 'json'"
                        @mouseleave.native="showSubImport = null">
                        <icon size="12px" fileTypeDetail="json" folderType="fileType" badgeColor="146EBE"></icon>
                        import from JSON
                        <div class="import-json-submenu" v-if="showSubImport === 'json'" @click.stop
                            @mouseenter.stop @mouseleave.stop>
                            <div class="submenu-item" @click="handleImportCommand('importJSON')">import JSON</div>
                            <div class="submenu-item" @click="handleImportCommand('importJSONCIM')">import JSON by
                                CIM</div>
                        </div>
                    </el-dropdown-item>
                    <el-dropdown-item command="importXML">
                        <icon size="12px" fileTypeDetail="xml" folderType="fileType" badgeColor="146EBE"></icon>
                        import from XML
                    </el-dropdown-item>
                    <el-dropdown-item command="importExcel">
                        <icon size="12px" fileTypeDetail="excel" folderType="fileType" badgeColor="146EBE"></icon>
                        import from Excel
                    </el-dropdown-item>
                    <el-dropdown-item command="importWord">
                        <icon size="12px" fileTypeDetail="word" folderType="fileType" badgeColor="146EBE"></icon>
                        import from Word
                    </el-dropdown-item>
                    <el-dropdown-item command="importPDF">
                        <icon size="12px" fileTypeDetail="pdf" folderType="fileType" badgeColor="146EBE"></icon>
                        import from PDF
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <div>
            <el-dropdown @command="handleExportCommand" trigger="click">
                <i title="Export" style="font-size: 12px" class="fa-solid fa-file-export"></i>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item class="export-json-parent" @mouseenter.native="showSub = 'json'"
                        @mouseleave.native="showSub = null">
                        <icon size="12px" fileTypeDetail="json" folderType="fileType" badgeColor="146EBE"></icon>
                        export to JSON
                        <div class="export-json-submenu" v-if="showSub === 'json'" @click.stop @mouseenter.stop
                            @mouseleave.stop>
                            <div class="submenu-item" @click="handleExportCommand('exportJSON')">export JSON</div>
                            <div class="submenu-item" @click="handleExportCommand('exportJSONCIM')">export JSON by CIM
                            </div>
                        </div>
                    </el-dropdown-item>
                    <el-dropdown-item command="exportXML">
                        <icon size="12px" fileTypeDetail="xml" folderType="fileType" badgeColor="146EBE"></icon>
                        export to XML
                    </el-dropdown-item>
                    <el-dropdown-item command="exportExcel">
                        <icon size="12px" fileTypeDetail="excel" folderType="fileType" badgeColor="146EBE"></icon>
                        export to Excel
                    </el-dropdown-item>
                    <el-dropdown-item command="exportWord">
                        <icon size="12px" fileTypeDetail="word" folderType="fileType" badgeColor="146EBE"></icon>
                        export to Word
                    </el-dropdown-item>
                    <el-dropdown-item command="exportPDF">
                        <icon size="12px" fileTypeDetail="pdf" folderType="fileType" badgeColor="146EBE"></icon>
                        export to PDF
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <div v-if="clientSlide">
            <i @click="handleUpload" title="Upload" style="font-size: 12px; cursor: pointer;"
                class="fa-solid fa-upload"></i>
        </div>
        <div v-if="!clientSlide">
            <i @click="handleDownload" title="Download" style="font-size: 12px"
                class="fa-solid fa-download"></i>
        </div>
        <div>
            <i @click="handleDelete" title="Delete" style="font-size: 12px" class="fa-solid fa-trash"></i>
        </div>
        <div @click="handleFmeca">
            <i title="Fmeca" style="font-size: 12px" class="fa-solid fa-table"></i>
        </div>
        <div>
            <i @click="handleMove" title="Move" style="font-size: 12px"
                class="fa-solid fa-arrows-up-down-left-right"></i>
        </div>
    </div>
</template>

<script>
import Icon from '@/views/Common/Icon.vue'

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
            showSubImport: null
        }
    },
    methods: {
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
        handleDownload() {
            this.$emit('download')
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
        
        // Command validation method
        isCommandAllowed(command) {
            // Emit to parent to check if command is allowed
            return this.$parent.isCommandAllowed ? this.$parent.isCommandAllowed(command) : true
        }
    }
}
</script>

<style scoped>
/* Toolbar styles - copy from treeNavigation.vue */
.toolbar-setting {
    background-color: white;
    height: 30px;
    display: flex;
    gap: 30px;
    border-bottom: 1px solid #cccccc;
    align-items: center;
    font-size: 12px;
    color: #555;
    font-weight: 600;
    box-sizing: border-box;
    width: 100%;
    padding-left: 10px;
}

.toolbar-setting > div {
    cursor: pointer;
}

.icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Asset submenu styles */
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

/* Import/Export submenu styles */
.import-json-parent,
.export-json-parent {
    position: relative;
}

.import-json-submenu,
.export-json-submenu {
    position: absolute;
    left: 100%;
    top: 0;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    min-width: 170px;
    z-index: 1000;
    padding: 1px 0;
}

.import-json-submenu .submenu-item,
.export-json-submenu .submenu-item {
    padding: 1px 20px;
    font-size: 12px;
    cursor: pointer;
    color: #606266;
}

.import-json-submenu .submenu-item:hover,
.export-json-submenu .submenu-item:hover {
    background-color: #f5f7fa;
    color: rgb(51.8, 80.6, 171);
}
</style>
<style scoped>
/* Kiểu dáng dropdown */
.dropdown {
    width: 35%;
    margin-right: 10px;
}

/* Ô input */
.dropdown-input {
    width: 100%;
    padding-right: 80px;
    cursor: pointer;
    background-color: #fff;
    padding: 0 0 0 10px;
    height: 40px;
}

/* Style menu dropdown */
.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 0;
    margin: 5px 0;
    list-style: none;
    display: none;
    /* Ẩn mặc định */
    z-index: 10;
}

/* Style cho từng mục */
.dropdown-menu li {
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.2s;
}

/* Hover làm nổi bật */
.dropdown-menu li:hover {
    background-color: #f0f0f0;
}
.el-dropdown-menu__item {
    font-size: 12px !important;
    font-family: Arial, sans-serif !important;
}
</style>