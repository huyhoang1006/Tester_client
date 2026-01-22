<template>
    <div class="explorer">
        <!-- Thanh công cụ -->
        <div v-show="clientSlide" class="toolbar">
            <TopBarClient :pathMapClient.sync="pathMapClient" :organisationClientList="organisationClientList"
                @clear-selection="clearSelection" />
        </div>
        <div v-show="!clientSlide" class="toolbar">
            <TopBarServer 
                :pathMapServer="pathMapServer" 
                @reset-all="resetAllServer" 
                @path-click="resetPathServer" 
            />
        </div>
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
                <i @click="duplicateSelectedNodes" title="Duplicate" style="font-size: 12px"
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
                <el-dropdown @command="handleCommand" trigger="click">
                    <i title="Export" style="font-size: 12px" class="fa-solid fa-file-export"></i>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item class="export-json-parent" @mouseenter.native="showSub = 'json'"
                            @mouseleave.native="showSub = null">
                            <icon size="12px" fileTypeDetail="json" folderType="fileType" badgeColor="146EBE"></icon>
                            export to JSON
                            <div class="export-json-submenu" v-if="showSub === 'json'" @click.stop @mouseenter.stop
                                @mouseleave.stop>
                                <div class="submenu-item" @click="handleCommand('exportJSON')">export JSON</div>
                                <div class="submenu-item" @click="handleCommand('exportJSONCIM')">export JSON by CIM
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
                <i title="Upload" style="font-size: 12px" class="fa-solid fa-upload"></i>
            </div>
            <div v-if="!clientSlide">
                <i @click="handleDownloadNode" title="Download" style="font-size: 12px"
                    class="fa-solid fa-download"></i>
            </div>
            <div>
                <i @click="handleDeleteNode" title="Delete" style="font-size: 12px" class="fa-solid fa-trash"></i>
            </div>
            <div @click="handleClickFmeca">
                <i title="Fmeca" style="font-size: 12px" class="fa-solid fa-table"></i>
            </div>
            <div>
                <i @click="handleMoveNode" title="Move" style="font-size: 12px"
                    class="fa-solid fa-arrows-up-down-left-right"></i>
            </div>
        </div>
        <!-- Thanh điều hướng có thể kéo rộng/kéo hẹp -->
        <div class="resizable-sidebar">
            <div ref="sidebarClient" v-show="clientSlide" class="sidebar">
                <div class="title-temp">
                    <div ref="tabContainer" class="tab-container">
                        <div @contextmenu.prevent="showContext" ref="locationRoot" @click="showLocationRoot"
                            class="location">Location</div>
                        <div ref="ownerRoot" class="tab">Owner</div>
                    </div>
                    <contextMenu @show-addSubs="showAddSubs" ref="contextSubstation"></contextMenu>
                </div>
                <div class="child-nav">
                    <ul>
                        <TreeNode v-for="item in organisationClientList" :key="item.id" :node="item"
                            @double-click-node="doubleClickNode" :selectedNodes.sync="selectedNodes"
                            @fetch-children="fetchChildren" @show-properties="showPropertiesDataClient"
                            @update-selection="updateSelection" @clear-selection="clearSelection"
                            @open-context-menu="openContextMenuClient">
                        </TreeNode>
                    </ul>
                    <contextMenu @delete-data="deleteDataClient" @show-addSubsInTree="showAddSubsInTree"
                        @show-addOrganisation="showAddOrganisation" @show-addVoltageLevel="showAddVoltageLevel"
                        @show-addTransformer="showAddTransformer" @show-addJob="showAddJob"
                        @show-addBushing="showAddBushing" @show-addSurgeArrester="showAddSurgeArrester"
                        @show-addCircuit="showAddCircuitBreaker" @show-addVt="showAddVt" @show-addCt="showAddCt"
                        @show-addPowerCable="showAddPowerCable" @show-addDisconnector="showAddDisconnector"
                        @show-addCapacitor="showAddCapacitor" @show-addReactor="showAddReactor"
                        @show-addRotatingMachine="showAddRotatingMachine" @show-addBay="showAddBay"
                        @export-json="handleExportJSONFromContext" @export-json-cim="handleExportJSONCIMFromContext"
                        @export-xml="handleExportXMLFromContext" @export-excel="handleExportExcelFromContext"
                        @export-word="handleExportWordFromContext" @export-pdf="handleExportPDFFromContext"
                        @duplicate-node="handleDuplicateFromContext" @move-node="handleMoveFromContext"
                        @import-json="handleImportJSONFromContext" @import-json-cim="handleImportJSONCIMFromContext"
                        @show-data="showDataClient" ref="contextMenuClient">
                    </contextMenu>
                </div>
            </div>
            <div ref="sidebarServer" v-show="!clientSlide" class="sidebar">
                <div class="title-temp">
                    <div ref="tabContainer" class="tab-container">
                        <div ref="ownerRootServer" @click="showOwnerServerRoot" class="tab">Owner</div>
                    </div>
                </div>
                <div class="child-nav">
                    <ul>
                        <TreeNode v-for="item in ownerServerList" :key="item.id" :node="item"
                            :selectedNodes.sync="selectedNodes" @fetch-children="fetchChildrenServer"
                            @show-properties="showPropertiesData" @update-selection="updateSelection"
                            @clear-selection="clearSelection" @open-context-menu="openContextMenu"
                            @double-click-node="doubleClickNodeServer">
                        </TreeNode>
                    </ul>
                    <contextMenu @show-data="showData" @export-json="handleExportJSONFromContext"
                        @export-json-cim="handleExportJSONCIMFromContext" @export-xml="handleExportXMLFromContext"
                        @export-excel="handleExportExcelFromContext" @export-word="handleExportWordFromContext"
                        @export-pdf="handleExportPDFFromContext" @duplicate-node="handleDuplicateFromContext"
                        @move-node="handleMoveFromContext" @import-json="handleImportJSONFromContext"
                        @import-json-cim="handleImportJSONCIMFromContext" ref="contextMenu"></contextMenu>
                </div>
            </div>
            <div @mousedown="startResizeClient" v-if="clientSlide" ref="resizerClient" class="resizer"></div>
            <div @mousedown="startResizeServer" v-if="!clientSlide" ref="resizerServer" class="resizer"></div>
            <div ref="contextDataServer" v-show="!clientSlide" class="context-data">
                <div ref="contentData" class="content-data">
                    <div ref="content" class="content">
                        <div class="title-content"></div>
                        <div class="content-content">
                            <Tabs :side="'server'" ref="serverTabs" v-model="activeTab" :tabs="tabs"
                                @close-tab="removeTab" />
                        </div>
                    </div>
                    <div @mousedown="startResizeContentServer" ref="resizerContentServer" class="resizer"></div>
                    <div v-if="propertiesSign" ref="properties" class="properties">
                        <div class="title-properties">
                            <div class="title-wrapper">
                                <div class="title-name">Object Properties</div>
                                <div style="margin-right: 5px">
                                    <i @click="hideProperties" class="fa-solid fa-square-caret-right"></i>
                                </div>
                            </div>
                        </div>
                        <div class="content-properties">
                            <div class="content-properties-header">
                                <i class="fa-solid fa-chevron-down" style="padding-right: 5px; font-size: 10px"></i>
                                Owner & Position
                            </div>
                            <div class="content-properties-table">
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Name</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        properties.name }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Region</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        properties.region }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Plant</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        properties.plant }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Address</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        properties.address }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">City</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        properties.city }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">State/Province</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        properties.state_province }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Postal code</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        properties.postal_code }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Country</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        properties.country }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Geo coordinates</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word"></div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Phone number</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        properties.phone_no }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Email</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        properties.email }}</div>
                                </div>
                            </div>
                            <div v-if="assetPropertySign" class="content-properties-header">
                                <i class="fa-solid fa-chevron-down" style="padding-right: 5px; font-size: 10px"></i>
                                Asset Properties
                            </div>
                            <div v-if="assetPropertySign" class="content-properties-table">
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Asset</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        assetProperties.asset }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Asset type</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        assetProperties.asset_type }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Serial number</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        assetProperties.serial_no }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Manufacturer</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        assetProperties.manufacturer }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Manufacturer type</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        assetProperties.manufacturer_type }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Manufacturing year</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        assetProperties.manufacturing_year }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Country</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        assetProperties.country }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Apparatus id</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        assetProperties.apparatus_id }}</div>
                                </div>
                            </div>
                            <div v-if="jobPropertySign" class="content-properties-header">
                                <i class="fa-solid fa-chevron-down" style="padding-right: 5px; font-size: 10px"></i>
                                Job Properties
                            </div>
                            <div v-if="jobPropertySign" class="content-properties-table">
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Name</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        jobProperties.name }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Work order</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        jobProperties.work_order }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Creation date</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        jobProperties.creation_date }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Execution date</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        jobProperties.execution_date }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Tested by</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        jobProperties.tested_by }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Approved by</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        jobProperties.approved_by }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Ambient condition</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        jobProperties.ambient_condition }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Standard</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        jobProperties.standard }}</div>
                                </div>
                            </div>
                            <div class="content-properties-header">
                                <i class="fa-solid fa-chevron-down" style="padding-right: 5px; font-size: 10px"></i>
                                Configuration Version
                            </div>
                            <div class="content-properties-table">
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Last Modified</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word"></div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Author</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word"></div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Last Saved By</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="!propertiesSign" @click="showProperties" class="trapezoid"></div>
                </div>
                <div ref="logBar" v-if="logSign" class="log-bar">
                    <LogBar :logData="logDataServer" @hideLogBar="hideLogBar"></LogBar>
                </div>
            </div>
            <div ref="contextDataClient" v-show="clientSlide" class="context-data">
                <div ref="contentDataClient" class="content-data">
                    <div ref="contentClient" class="content">
                        <div class="title-content"></div>
                        <div class="content-content">
                            <Tabs :side="'client'" ref="clientTabs" v-model="activeTabClient" :tabs="tabsClient"
                                @close-tab="removeTabClient" />
                        </div>
                    </div>
                    <div @mousedown="startResizeContentClient" ref="resizerContentClient" class="resizer"></div>
                    <div v-if="propertiesSignClient" ref="propertiesClient" class="properties">
                        <div class="title-properties">
                            <div class="title-wrapper">
                                <div class="title-name">Object Properties</div>
                                <div style="margin-right: 5px">
                                    <i @click="hidePropertiesClient" class="fa-solid fa-square-caret-right"></i>
                                </div>
                            </div>
                        </div>
                        <div class="content-properties">
                            <div class="content-properties-header">
                                <i class="fa-solid fa-chevron-down" style="padding-right: 5px; font-size: 10px"></i>
                                Owner & Position
                            </div>
                            <div class="content-properties-table">
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Name</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        propertiesClient.name || '&nbsp;' }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Region</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        propertiesClient.region || '&nbsp;' }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Plant</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        propertiesClient.plant || '&nbsp;' }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Address</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        propertiesClient.address || '&nbsp;' }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">City</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        propertiesClient.city || '&nbsp;' }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">State/Province</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">
                                        {{ propertiesClient.state_province || '&nbsp;' }}
                                    </div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Postal code</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        propertiesClient.postal_code || '&nbsp;' }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Country</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        propertiesClient.country || '&nbsp;' }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Geo coordinates</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">
                                        {{ propertiesClient.geo_coordinates || '&nbsp;' }}
                                    </div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Phone number</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        propertiesClient.phone_no || '&nbsp;' }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Email</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        propertiesClient.email || '&nbsp;' }}</div>
                                </div>
                            </div>
                            <div v-if="assetPropertySignClient" class="content-properties-header">
                                <i class="fa-solid fa-chevron-down" style="padding-right: 5px; font-size: 10px"></i>
                                Asset Properties
                            </div>
                            <div v-if="assetPropertySignClient" class="content-properties-table">
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Asset</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        assetPropertiesClient.asset || '&nbsp;' }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Asset type</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">
                                        {{ assetPropertiesClient.asset_type || '&nbsp;' }}
                                    </div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Serial number</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">
                                        {{ assetPropertiesClient.serial_no || '&nbsp;' }}
                                    </div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Manufacturer</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">
                                        {{ assetPropertiesClient.manufacturer || '&nbsp;' }}
                                    </div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Manufacturer type</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">
                                        {{ assetPropertiesClient.manufacturer_type || '&nbsp;' }}
                                    </div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Manufacturing year</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">
                                        {{ assetPropertiesClient.manufacturing_year || '&nbsp;' }}
                                    </div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Country</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">
                                        {{ assetPropertiesClient.country || '&nbsp;' }}
                                    </div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Apparatus id</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">
                                        {{ assetPropertiesClient.apparatus_id || '&nbsp;' }}
                                    </div>
                                </div>
                            </div>
                            <div v-if="jobPropertySignClient" class="content-properties-header">
                                <i class="fa-solid fa-chevron-down" style="padding-right: 5px; font-size: 10px"></i>
                                Job Properties
                            </div>
                            <div v-if="jobPropertySignClient" class="content-properties-table">
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Name</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        jobPropertiesClient.name }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Work order</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        jobPropertiesClient.work_order }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Creation date</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        jobPropertiesClient.creation_date }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Execution date</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        jobPropertiesClient.execution_date }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Tested by</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        jobPropertiesClient.tested_by }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Approved by</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        jobPropertiesClient.approved_by }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Ambient condition</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        jobPropertiesClient.ambient_condition }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Standard</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        jobPropertiesClient.standard }}</div>
                                </div>
                            </div>
                            <div class="content-properties-header">
                                <i class="fa-solid fa-chevron-down" style="padding-right: 5px; font-size: 10px"></i>
                                Configuration Version
                            </div>
                            <div class="content-properties-table">
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Last Modified</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word"></div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Author</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word"></div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Last Saved By</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="!propertiesSignClient" @click="showPropertiesClient" class="trapezoid"></div>
                </div>
                <div ref="logBarClient" v-if="logSignClient" class="log-bar">
                    <LogBar @reloadLog="reloadLogClient" :logData="logDataClient" @hideLogBar="hideLogBarClient">
                    </LogBar>
                </div>
            </div>
        </div>

        <el-dialog custom-class="app-dialog" title="Add Substation" :visible.sync="signSubs" @close="handleSubsCancel">
            <Substation :parentOrganization="parentOrganization" :personList="personList" :locationList="locationList"
                :organisationId="organisationId" ref="substation"></Substation>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" type="danger" @click="handleSubsCancel">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="handleSubsConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog custom-class="app-dialog" title="Add Organisation" :visible.sync="signOrg" @close="handleOrgCancel">
            <Organisation :parent="parentOrganization" ref="organisation"></Organisation>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" type="danger" @click="handleOrgCancel">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="handleOrgConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog custom-class="app-dialog" title="Add Voltage Level" :visible.sync="signVoltageLevel"
            @close="handleVoltageLevelCancel">
            <VoltageLevel :locationId="locationId" :parent="parentOrganization" ref="voltageLevel"></VoltageLevel>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" type="danger"
                    @click="handleVoltageLevelCancel">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary"
                    @click="handleVoltageLevelConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog custom-class="app-dialog" title="Add Bay Level" :visible.sync="signBay" @close="handleBayCancel">
            <Bay :locationId="locationId" :parent="parentOrganization" ref="bay"></Bay>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" type="danger" @click="handleBayCancel">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="handleBayConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Transformer" :visible.sync="signTransformer" @close="handleTransformerCancel"
            :modal="!isDuplicating" :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'"
            :custom-class="dialogClass">
            <Transformer :locationId="locationId" :parent="parentOrganization" ref="transformer"></Transformer>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" type="danger"
                    @click="handleTransformerCancel">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary"
                    @click="handleTransformerConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Bushing" :visible.sync="signBushing" @close="handleBushingCancel" :modal="!isDuplicating"
            :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'" :custom-class="dialogClass">
            <Bushing :locationId="locationId" :parent="parentOrganization" ref="bushing"></Bushing>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" type="danger" @click="handleBushingCancel">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="handleBushingConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Surge Arrester" :visible.sync="signSurge" @close="handleSurgeCancel"
            :modal="!isDuplicating" :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'"
            :custom-class="dialogClass">
            <SurgeArrester :locationId="locationId" :parent="parentOrganization" ref="surgeArrester"></SurgeArrester>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" type="danger" @click="handleSurgeCancel">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="handleSurgeConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Circuit Breaker" :visible.sync="signCircuit" @close="handleCircuitCancel"
            :modal="!isDuplicating" :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'"
            :custom-class="dialogClass">
            <CircuitBreaker :locationId="locationId" :parent="parentOrganization" ref="circuitBreaker"></CircuitBreaker>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" type="danger" @click="handleCircuitCancel">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="handleCircuitConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Current Transformer" :visible.sync="signCt" @close="handleCtCancel"
            :modal="!isDuplicating" :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'"
            :custom-class="dialogClass">
            <CurrentTransformer :locationId="locationId" :parent="parentOrganization" ref="currentTransformer">
            </CurrentTransformer>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" type="danger" @click="handleCtCancel">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="handleCtConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Voltage Transformer" :visible.sync="signVt" @close="handleVtCancel"
            :modal="!isDuplicating" :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'"
            :custom-class="dialogClass">
            <VoltageTransformer :locationId="locationId" :parent="parentOrganization" ref="voltageTransformer">
            </VoltageTransformer>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" type="danger" @click="handleVtCancel">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="handleVtConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Power Cable" :visible.sync="signPower" @close="handlePowerCancel" :modal="!isDuplicating"
            :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'" :custom-class="dialogClass">
            <PowerCable :locationId="locationId" :parent="parentOrganization" ref="powerCable"></PowerCable>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" type="danger" @click="handlePowerCancel">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="handlePowerConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Disconnector" :visible.sync="signDisconnector" @close="handleDisconnectorCancel"
            :modal="!isDuplicating" :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'"
            :custom-class="dialogClass">
            <Disconnector :locationId="locationId" :parent="parentOrganization" ref="disconnector"></Disconnector>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" type="danger"
                    @click="handleDisconnectorCancel">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary"
                    @click="handleDisconnectorConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Rotating Machine" :visible.sync="signRotating" @close="handleRotatingCancel"
            :modal="!isDuplicating" :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'"
            :custom-class="dialogClass">
            <RotatingMachine :locationId="locationId" :parent="parentOrganization" ref="rotatingMachine">
            </RotatingMachine>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" type="danger"
                    @click="handleRotatingCancel">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary"
                    @click="handleRotatingConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Capacitor" :visible.sync="signCapacitor" @close="handleCapacitorCancel"
            :modal="!isDuplicating" :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'"
            :custom-class="dialogClass">
            <Capacitor :locationId="locationId" :parent="parentOrganization" ref="capacitor"> </Capacitor>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" type="danger"
                    @click="handleCapacitorCancel">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary"
                    @click="handleCapacitorConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Reactor" :visible.sync="signReactor" @close="handleReactorCancel" :modal="!isDuplicating"
            :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'" :custom-class="dialogClass">
            <Reactor :locationId="locationId" :parent="parentOrganization" ref="reactor"> </Reactor>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" type="danger" @click="handleReactorCancel">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="handleReactorConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog custom-class="app-dialog" title="Add Job" :visible.sync="signJob" @close="handleJobCancel">
            <component ref="jobData" :is="checkJobType" :locationData="locationData" :assetData="assetData"
                :productAssetModelData="productAssetModelData" :parent="parentOrganization"
                :testTypeListData="testTypeListData">
            </component>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" type="danger" @click="handleJobCancel">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="handleJobConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog custom-class="app-dialog custom-dialog" title="Export" :visible.sync="openExportDialog">
            <Export :exportType="exportType"></Export>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" type="danger" @click="handleCancelExport">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="handleExportConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog custom-class="app-dialog custom-dialog" title="Import" :visible.sync="openImportDialog">
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" type="danger" @click="handleCancelImport">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="handleImportConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog custom-class="app-dialog" title="Fmeca" :visible.sync="signFmeca" @close="handleFmecaCancel">
            <Fmeca></Fmeca>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button size="small" type="danger" @click="handleFmecaCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleFmecaConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Move Node" :visible.sync="moveDialogVisible" @close="handleMoveCancel"
            custom-class="move-dialog app-dialog custom-dialog">
            <div style="height: 300px; overflow-y: auto">
                <div class="child-nav" style="height: 100%; cursor: pointer">
                    <ul style="list-style: none; padding-left: 0">
                        <TreeNode v-for="item in moveTreeData" :key="item.mrid" :node="item"
                            :selectedNodes="selectedTargetNodes" @fetch-children="fetchChildrenForMove"
                            @update-selection="handleMoveNodeSelection" @open-context-menu="() => { }"
                            style="width: 100%">
                        </TreeNode>
                    </ul>
                </div>
            </div>
            <!-- Dòng kẻ ngăn cách TreeNode và dòng chữ bên dưới -->
            <div style="border-top: 1px solid #e0e0e0; margin: 6px 0 4px 0"></div>
            <div v-if="moveDisplayText" style="
                    margin-top: 8px;
                    font-size: 13px;
                    color: #606266;
                    display: flex;
                    align-items: center;
                    width: 100%;
                    box-sizing: border-box;
                    padding: 0 12px;
                    font-weight: bold;
                ">
                <!-- Cột 1: Move from (trái) -->
                <span style="flex: 1; text-align: center; color: black">
                    {{ moveDisplayText.prefix }}
                </span>

                <!-- Cột 2: icon + node A (giữa trái) -->
                <div style="flex: 1; display: flex; align-items: center; gap: 4px; justify-content: center">
                    <icon v-if="moveDisplayData.sourceIcon" :size="'16px'"
                        :folderType="moveDisplayData.sourceIcon.folderType"
                        :assetDetail="moveDisplayData.sourceIcon.assetDetail"
                        :badgeColor="moveDisplayData.sourceIcon.badgeColor"></icon>
                    <span style="font-weight: 600" :title="moveDisplayText.sourceFull">
                        {{ moveDisplayText.source }}
                    </span>
                </div>

                <!-- Cột 3: to (ở gần giữa, sát 2 node hơn) -->
                <span
                    style="flex: 0; padding: 0 8px; text-align: center; white-space: nowrap; font-weight: bold; color: black">
                    {{ moveDisplayText.middle }}
                </span>

                <!-- Cột 4: icon + node B (phải) -->
                <div style="flex: 1; display: flex; align-items: center; gap: 4px; justify-content: center">
                    <icon v-if="moveDisplayData.targetIcon" :size="'16px'"
                        :folderType="moveDisplayData.targetIcon.folderType"
                        :assetDetail="moveDisplayData.targetIcon.assetDetail"
                        :badgeColor="moveDisplayData.targetIcon.badgeColor"></icon>
                    <span style="font-weight: 600" :title="moveDisplayText.targetFull">
                        {{ moveDisplayText.target }}
                    </span>
                </div>
            </div>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" @click="moveDialogVisible = false"
                    style="background-color: #d63743; color: #fff">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="confirmMoveNode"
                    :disabled="!selectedTargetNode">Move</el-button>
            </span>
        </el-dialog>
        <!-- Dialog chọn cha khi download -->
        <el-dialog custom-class="app-dialog" title="Select Parent Node for Downloaded Asset"
            :visible.sync="downloadDialogVisible" @close="downloadDialogVisible = false">
            <div style="height: 300px; overflow-y: auto">
                <div class="child-nav">
                    <ul style="list-style: none; padding-left: 0">
                        <TreeNode v-for="item in moveTreeData" :key="item.mrid" :node="item"
                            :selectedNodes="selectedDownloadTargetNodes" @fetch-children="fetchChildren"
                            @update-selection="handleDownloadTargetSelection" @open-context-menu="() => { }">
                        </TreeNode>
                    </ul>
                </div>
            </div>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" @click="downloadDialogVisible = false">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="confirmDownloadSelection"
                    :disabled="!selectedDownloadTargetNode">Confirm Download</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
/* eslint-disable */
import LogBar from '@/components/LogBar'
import TreeNode from '@/views/Common/TreeNode.vue'
import Vue from 'vue'
import pageAlign from '@/views/PageAlign/pageAlign.vue'
import spinner from '@/views/Common/Spinner.vue'
import Tabs from '@/views/Common/Tabs.vue'
import contextMenu from '@/views/Common/ContextMenu.vue'

//client
import TopBarClient from './Client/Topbar/index.vue'

// Import Mappers
import mapClientProperties from '@/utils/MapperClient/mapClientProperties'
import mapClientAssetProperties from '@/utils/MapperClient/mapClientAssetProperties'
import mapClientJobProperties from '@/utils/MapperClient/mapClientJobProperties'
import mapProperties from '@/utils/MapperServer/mapProperties'
import mapAssetProperties from '@/utils/MapperServer/mapAssetProperties'
import mapJobProperties from '@/utils/MapperServer/mapJobProperties'

// Import Components
import Substation from '../LocationInsert/locationLevelView.vue'
import Organisation from '@/views/Organisation/index.vue'
import VoltageLevel from '@/views/VoltageLevel/index.vue'
import Bay from '@/views/Bay/index.vue'
import Transformer from '@/views/AssetView/Transformer'
import Bushing from '@/views/AssetView/Bushing'
import SurgeArrester from '@/views/AssetView/SurgeArrester'
import CircuitBreaker from '@/views/AssetView/CircuitBreaker'
import CurrentTransformer from '@/views/AssetView/CurrentTransformer'
import Disconnector from '@/views/AssetView/Disconnector/index.vue'
import PowerCable from '@/views/AssetView/PowerCable'
import VoltageTransformer from '@/views/AssetView/VoltageTransformer'
import Capacitor from '@/views/AssetView/Capacitor/index.vue'
import Reactor from '@/views/AssetView/Reactor/index.vue'
import RotatingMachine from '@/views/AssetView/RotatingMachine/index.vue'

// Import Jobs
import JobSurgeArrester from '@/views/JobView/SurgeArrester/index.vue'
import JobPowerCable from '@/views/JobView/PowerCable/index.vue'
import JobDisconnector from '@/views/JobView/Disconnector/index.vue'
import JobCurrentTransformer from '@/views/JobView/CurrentTrans/index.vue'
import JobVoltageTransformer from '@/views/JobView/VoltageTransformer/index.vue'
import JobCircuitBreaker from '@/views/JobView/CircuitBreaker/index.vue'
import JobTransformer from '@/views/JobView/Transformer/index.vue'

import mixin from './mixin'
import Attachment from '../Common/Attachment.vue'
import Icon from '@/views/Common/Icon.vue'
import Fmeca from '@/views/Fmeca'
import Export from '@/views/Export/index.vue'

// Import Mappings (Quan trọng cho Duplicate)
import * as BreakerMapping from '@/views/Mapping/Breaker/index'
import * as TransformerMapping from '@/views/Mapping/Transformer/index'
import * as SubstationMapping from '@/views/Mapping/Substation/index'
import * as OrganisationMapping from '@/views/Mapping/Organisation/index'
import * as SurgeArresterMapping from '@/views/Mapping/SurgeArrester/index'
import * as PowerCableMapping from '@/views/Mapping/PowerCable/index'
import * as DisconnectorMapping from '@/views/Mapping/Disconnector/index'
import * as CapacitorMapping from '@/views/Mapping/Capacitor/index'
import * as VoltageTransformerMapping from '@/views/Mapping/VoltageTransformer/index'
import * as CurrentTransformerMapping from '@/views/Mapping/CurrentTransformer/index'
import * as ReactorMapping from '@/views/Mapping/Reactor/index'
import * as BushingMapping from '@/views/Mapping/Bushing/index'
import * as rotatingMachineMapping from "@/views/Mapping/RotatingMachine/index"
import * as VoltageLevelMapping from '@/views/Mapping/VoltageLevel/index'
import { exportNodeToJSON as exportNodeToJSONUtil } from '@/function/entity/export/index'
import mixinTreeNavigation from '@/views/Common/mixinTreeNavigation/mixin'
import TopBarServer from './Server/TopBarServer/index.vue'
export default {
    name: 'TreeNavigation',
    components: {
        mapJobProperties,
        mapAssetProperties,
        mapProperties,mapClientProperties,
        mapClientJobProperties,
        mapClientAssetProperties,
        TopBarServer,
        TopBarClient,
        LogBar,
        TreeNode,
        pageAlign,
        spinner,
        contextMenu,
        Tabs,
        Substation,
        Organisation,
        VoltageLevel,
        Bay,
        Transformer,
        Bushing,
        SurgeArrester,
        CircuitBreaker,
        CurrentTransformer,
        VoltageTransformer,
        Disconnector,
        PowerCable,
        RotatingMachine,
        Capacitor,
        Reactor,
        JobSurgeArrester,
        JobPowerCable,
        JobDisconnector,
        JobCurrentTransformer,
        JobVoltageTransformer,
        JobCircuitBreaker,
        JobTransformer,
        Icon,
        Fmeca,
        Export
    },
    data() {
        return {
            exportType: null,
            openExportDialog: false,
            openImportDialog: false,
            signFmeca: false,
            showSub: null,
            showSubImport: null,
            parentOrganization: null,
            logDataServer: [],
            logDataClient: [],
            organisationId: '0000000-0000-0000-0000-000000000000',
            locationId: '',
            locationData: {},
            assetData: {},
            productAssetModelData: {},
            checkJobType: '',
            testTypeListData: [],
            organisationClientList: [],
            signSubs: false,
            signOrg: false,
            signVoltageLevel: false,
            signBay: false,
            signTransformer: false,
            signBushing: false,
            signSurge: false,
            signCircuit: false,
            signCt: false,
            signVt: false,
            signPower: false,
            signDisconnector: false,
            signRotating: false,
            signJob: false,
            signCapacitor: false,
            signReactor: false,
            activeTab: {},
            activeTabClient: {},
            indexTabData: null,
            tabs: [],
            tabsClient: [],
            rightClickNode: null,
            selectedNodes: [],
            assetPropertySign: false,
            jobPropertySign: false,
            assetPropertySignClient: false,
            jobPropertySignClient: false,
            pathMapServer: [],
            pathMapClient: [],
            hideTabContentServer: [],
            hideTabContentClient: [],
            showAssetSub: false,
            currentTabServer: '',
            isDuplicating: false,
            moveDialogVisible: false,
            moveTreeData: [],
            selectedTargetNode: null,
            selectedTargetNodes: [], // Dùng cho hiển thị highlight trong tree dialog
            expandedMoveKeys: [],
            nodeToMove: null, // Lưu node đang được move để dùng trong fetchChildrenForMove
            validParentTypesForMove: [],
            downloadDialogVisible: false,
            nodeToDownloadData: null, // Lưu dữ liệu DTO từ server về
            selectedDownloadTargetNode: null, // Node cha được chọn thủ công
            selectedDownloadTargetNodes: [], // Lưu valid parent types để dùng trong fetchChildrenForMove
            moveTreeProps: {
                children: 'children',
                label: 'name',
                disabled: 'disabled'
            },
            properties: {
                region: '',
                name: '',
                plant: '',
                address: '',
                city: '',
                state_province: '',
                postal_code: '',
                country: '',
                phone_no: '',
                email: ''
            },
            assetProperties: {
                asset: '',
                asset_type: '',
                serial_no: '',
                manufacturer: '',
                manufacturer_type: '',
                manufacturing_year: '',
                apparatus_id: '',
                country: ''
            },
            jobProperties: {
                name: '',
                work_order: '',
                creation_date: '',
                execution_date: '',
                tested_by: '',
                approved_by: '',
                ambient_condition: '',
                standard: ''
            },
            propertiesClient: {
                region: '',
                name: '',
                plant: '',
                address: '',
                city: '',
                state_province: '',
                postal_code: '',
                country: '',
                phone_no: '',
                email: ''
            },
            assetPropertiesClient: {
                asset: '',
                asset_type: '',
                serial_no: '',
                manufacturer: '',
                manufacturer_type: '',
                manufacturing_year: '',
                apparatus_id: '',
                country: ''
            },
            jobPropertiesClient: {
                name: '',
                work_order: '',
                creation_date: '',
                execution_date: '',
                tested_by: '',
                approved_by: '',
                ambient_condition: '',
                standard: ''
            },
            logSign: false,
            logSignClient: false,
            propertiesSign: true,
            propertiesSignClient: true,
            clientSlide: true,
            pageLocationSync: {
                first: 1,
                second: 2,
                third: 3,
                dot: '...',
                end: 10
            },
            displayPageLocationSync: {
                second: true,
                third: true,
                dot: true,
                end: true
            },
            pageLocationSyncInstance: {
                first: '',
                second: '',
                third: '',
                dot: '',
                end: ''
            },
            currentLocationSync: {
                nextP: '',
                previousP: '',
                current: 1
            },
            optionLocationSync: {
                mode: ''
            },
            sl: 10,
            count: '',
            ownerServerList: [],
            clientList: [],
            ownerList: [],
            locationList: [],
            personList: [],
            AssetType: ['Transformer', 'Circuit breaker', 'Current transformer', 'Voltage transformer', 'Disconnector', 'Power cable', 'Surge arrester'],
            LocationType: ['location', 'voltage', 'feeder']
        }
    },
    computed: {
        // ...existing computed properties...
        isCommandAllowed() {
            return (cmd) => {
                const selectedNode = this.selectedNodes && this.selectedNodes.length > 0 ? this.selectedNodes[this.selectedNodes.length - 1] : null

                if (!selectedNode) return false
                return this.getAllowedCommands(selectedNode).includes(cmd)
            }
        },
        // Text + data hiển thị ví dụ: "Move from SourceNode to TargetNode" cùng icon
        // Nếu tên quá dài thì rút gọn 5 ký tự + '...' nhưng khi hover vẫn hiển thị full name
        moveDisplayText() {
            const nodeToMove = this.nodeToMove
            const targetNode = this.selectedTargetNode

            if (!nodeToMove || !targetNode) {
                return null
            }

            // Lấy tên đầy đủ của source
            // Với asset node: ưu tiên serial_number/serial_no trước name (vì name có thể là Apparatus ID)
            let sourceFull
            if (nodeToMove.mode === 'asset') {
                sourceFull = nodeToMove.serial_number || nodeToMove.serial_no || nodeToMove.name
            } else {
                sourceFull = nodeToMove.name || nodeToMove.serial_number || nodeToMove.serial_no
            }
            sourceFull = sourceFull || 'Unknown'

            // Lấy tên đầy đủ của target
            // Với asset node: ưu tiên serial_number/serial_no trước name (vì name có thể là Apparatus ID)
            let targetFull
            if (targetNode.mode === 'asset') {
                targetFull = targetNode.serial_number || targetNode.serial_no || targetNode.name
            } else {
                targetFull = targetNode.name || targetNode.serial_number || targetNode.serial_no
            }
            targetFull = targetFull || 'Unknown'

            // Rút gọn còn 5 ký tự + '...' nếu dài hơn 5
            const truncate = (text) => {
                const str = text != null ? text.toString() : ''
                return str.length > 5 ? str.slice(0, 9) + '...' : str
            }

            return {
                prefix: 'Move from',
                source: truncate(sourceFull),
                sourceFull,
                middle: 'to',
                target: truncate(targetFull),
                targetFull
            }
        },
        moveDisplayData() {
            const nodeToMove = this.nodeToMove
            const targetNode = this.selectedTargetNode

            if (!nodeToMove || !targetNode) {
                return {
                    sourceIcon: null,
                    targetIcon: null
                }
            }

            // Xác định icon cho source và target dựa trên mode
            const getIconConfig = (node) => {
                const mode = node.mode
                if (mode === 'substation') {
                    return { folderType: 'location', assetDetail: 'Unknown', badgeColor: '146EBE' }
                }
                if (mode === 'voltageLevel') {
                    return { folderType: 'voltageLevel', assetDetail: 'Unknown', badgeColor: '146EBE' }
                }
                if (mode === 'bay') {
                    return { folderType: 'bay', assetDetail: 'Unknown', badgeColor: '146EBE' }
                }
                if (mode === 'asset') {
                    return { folderType: 'asset', assetDetail: node.asset || 'Unknown', badgeColor: '146EBE' }
                }
                if (mode === 'job') {
                    return { folderType: 'job', assetDetail: 'Unknown', badgeColor: 'FF0000' }
                }
                if (mode === 'test') {
                    return { folderType: 'test', assetDetail: 'Unknown', badgeColor: '008001' }
                }
                // default: owner/building
                return { folderType: 'building', assetDetail: 'Unknown', badgeColor: '008001' }
            }

            const sourceIcon = getIconConfig(nodeToMove)
            const targetIcon = getIconConfig(targetNode)

            return {
                sourceIcon,
                targetIcon
            }
        },
        dialogClass() {
            return this.isDuplicating
                ? 'app-dialog ghost-dialog'
                : 'app-dialog'
        }
    },
    mixins: [mixin, mixinTreeNavigation,
            ],
    
    async beforeMount() {
        try {
            const data = await window.electronAPI.getAllConfigurationEvents()
            if (data && data.success) {
                this.logDataClient = data.data
            }
        } catch (error) {
            console.error('Error fetching server log data:', error)
            this.$message.error('Failed to fetch log data.')
        }
    },
    methods: {
        serverSwap(serverSign) {
            if (serverSign == true) {
                this.clientSlide = false
            } else {
                this.clientSlide = true
            }
        },

        mappingProperties(data) {
            this.properties = mapProperties(data);
        },

        mappingAssetProperties(data) {
            this.assetProperties = mapAssetProperties(data);
        },

        mappingJobProperties(data) {
            this.jobProperties = mapJobProperties(data);
        },

        async mappingPropertiesClient(data) {
            this.propertiesClient = mapClientProperties(data)
        },

        async mappingAssetPropertiesClient(data) {
            this.assetPropertiesClient = mapClientAssetProperties(data)
        },

        async mappingJobPropertiesClient(data) {
            this.jobPropertiesClient.name = mapClientJobProperties(data)
        },

        async updateSelection(node) {
            this.selectedNodes = [...this.selectedNodes]
            if (Array.isArray(node)) {
                this.selectedNodes = [node]
            } else {
                // Ctrl + Click → bật/tắt node cha mà KHÔNG ảnh hưởng con
                // So sánh bằng mrid (vì mrid là unique) để nhất quán với TreeNode.vue
                // Chỉ so sánh khi cả hai node đều có mrid
                const index = this.selectedNodes.findIndex((n) => {
                    if (!n || !node) return false
                    if (!n.mrid || !node.mrid) return false
                    return n.mrid === node.mrid
                })
                if (index === -1) {
                    // Chưa có trong selection → thêm vào
                    this.selectedNodes.push(node)
                } else {
                    // Đã có trong selection → xóa khỏi selection
                    this.selectedNodes.splice(index, 1)
                }
            }
        },

        async clearSelection() {
            this.selectedNodes = []
        },

        async doubleClickNodeServer(node) {
            await this.showData(node)
            await this.showPropertiesData(node)
        },

    }
}
</script>
<style scoped>
/* style.css */
.explorer {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
    font-size: 12px;
    /* Giảm cỡ chữ toàn trang */
}

.explorer {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.resizable-sidebar {
    display: flex;
    height: calc(100% - 60px);
}

.sidebar {
    width: 20%;
    background-color: white;
    color: #555;
    flex-shrink: 0;
    height: 100%;
    box-sizing: border-box;
}

.sidebar ul {
    list-style: none;
    padding-left: 20px;
}

.sidebar li {
    margin: 5px 0;
    cursor: pointer;
}

.sidebar .folder,
.sidebar .file {
    display: block;
    padding: 5px;
    white-space: nowrap;
    /* Ngăn văn bản xuống dòng */
    overflow: hidden;
    /* Ẩn phần văn bản vượt quá kích thước */
    text-overflow: ellipsis;
    /* Hiển thị dấu ... khi văn bản quá dài */
    font-size: 12px;
    /* Cỡ chữ cho thư mục và tệp */
}

.sidebar .folder:hover,
.sidebar .file:hover {
    background-color: #555;
    color: white;
}

.sidebar .folder i,
.sidebar .file i {
    margin-right: 8px;
    /* Khoảng cách giữa icon và văn bản */
    width: 16px;
    /* Kích thước icon */
    text-align: center;
    font-size: 12px;
    /* Cỡ chữ cho icon */
}

.resizer {
    width: 5px;
    background-color: white;
    cursor: ew-resize;
    /* Con trỏ đổi thành mũi tên kéo ngang */
}

.content {
    width: calc(75% - 5px);
    background-color: white;
    font-size: 12px;
    /* Cỡ chữ cho nội dung */
    box-sizing: border-box;
}

.title-content {
    width: 100%;
    height: 5px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
}

.content-content {
    width: 100%;
    height: calc(100% - 5px);
    box-sizing: border-box;
    border: 1px rgb(224, 222, 222) solid;
    border-bottom: none;
    overflow: hidden;
}

.content-content:hover {
    overflow: auto;
}

.folder-item {
    text-align: center;
    padding: 10px;
    border: 1px solid #ddd;
    cursor: pointer;
    font-size: 12px;
    /* Cỡ chữ cho các mục trong nội dung */
}

.folder-item:hover {
    background-color: #f0f0f0;
}

.child-nav {
    overflow-y: hidden;
    height: calc(100% - 80px);
    box-sizing: border-box;
}

.child-nav:hover {
    overflow-y: auto;
}

.title-node {
    margin-top: 50px;
}

.title-temp {
    height: 40px;
    color: #555;
    font-weight: 600;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    background-color: white;
}

.toolbar {
    background-color: #d9d9d9;
    height: 30px;
    display: flex;
    gap: 10px;
    border-bottom: 1px solid #cccccc;
    /* Độ dày 2px, màu đen */
    align-items: center;
    font-size: 12px;
    color: #555;
    font-weight: 600;
    box-sizing: border-box;
    width: 100%;
    padding-left: 10px;
}

.toolbar-setting {
    background-color: white;
    height: 30px;
    display: flex;
    gap: 30px;
    border-bottom: 1px solid #cccccc;
    /* Độ dày 2px, màu đen */
    align-items: center;
    font-size: 12px;
    color: #555;
    font-weight: 600;
    box-sizing: border-box;
    width: 100%;
    padding-left: 10px;
}

.toolbar-setting div {
    cursor: pointer;
}

.el-dropdown-menu__item {
    font-size: 12px !important;
    font-family: Arial, sans-serif !important;
}

.properties {
    width: 25%;
    height: 100%;
    box-sizing: border-box;
}

.title-properties {
    width: 100%;
    height: 40px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
}

.title-wrapper {
    width: 100%;
    height: 30px;
    border: 2px #b6b3b3 solid;
    display: flex;
    align-items: center;
    box-sizing: border-box;
}

.title-name {
    width: 100%;
    margin-left: 10px;
    color: black;
    font-weight: 750;
}

.content-properties {
    width: 100%;
    height: calc(100% - 40px);
    box-sizing: border-box;
    border: 1px #dad7d7 solid;
    border-bottom: none;
    overflow-y: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
    background-color: #e2e8f0;
}

.content-properties::-webkit-scrollbar {
    display: none;
}

.content-properties-header {
    width: 100%;
    height: 40px;
    display: flex;
    background-color: #e2e8f0;
    align-items: center;
    box-sizing: border-box;
    padding-left: 10px;
}

.content-properties-table {
    width: 100%;
    box-sizing: border-box;
}

.content-properties-table-flex {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding-left: 10px;
    background-color: white;
    box-sizing: border-box;
}

.content-properties-table-header {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 50%;
    box-sizing: border-box;
    padding-top: 5px;
    padding-bottom: 5px;
}

.content-properties-table-content {
    width: 50%;
    padding-top: 5px;
    padding-bottom: 5px;
    box-sizing: border-box;
    border-left: 3px #e2e8f0 solid;
}

.context-data {
    box-sizing: border-box;
    width: calc(80% - 5px);
    height: 100%;
}

.content-data {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
}

.log-bar {
    box-sizing: border-box;
    width: 100%;
    height: 20%;
    border: 1px rgb(224, 222, 222) solid;
}

.hide-icon i {
    visibility: hidden;
}

.hide-icon:hover i {
    visibility: visible;
}

.tab-container {
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    overflow: hidden;
}

.location {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 5px;
    cursor: pointer;
    border-bottom: 2px #e6e4e4 solid;
    box-sizing: border-box;
}

.tab {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    padding-left: 5px;
    width: 100%;
    box-sizing: border-box;
    border-bottom: 2px #e6e4e4 solid;
}

.trapezoid {
    position: absolute;
    top: 50%;
    /* Căn giữa theo chiều dọc */
    right: 0;
    /* Đẩy sát mép phải */
    transform: translateY(-50%);
    /* Căn giữa theo chiều dọc */
    width: 1.2vh !important;
    /* Độ rộng */
    height: 10vh;
    /* Độ cao */
    background: #d9d9d9;
    clip-path: polygon(100% 0%, 100% 100%, 0% 80%, 0% 20%);
}

.page-align {
    width: 100%;
    height: 40px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
}

.path-hover:hover {
    color: black;
    text-decoration: underline;
    cursor: pointer;
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
</style>

<style scoped>
.fixed-box {
    box-sizing: border-box;
}

.pl10 {
    padding-left: 10px;
}

.pt10 {
    padding-top: 10px;
}

.pb10 {
    padding-bottom: 10px;
}

.break-word {
    word-break: break-word;
}

.export-json-parent {
    position: relative;
}

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

.export-json-submenu .submenu-item {
    padding: 1px 20px;
    font-size: 12px;
    cursor: pointer;
    color: #606266;
}

.export-json-submenu .submenu-item:hover {
    background-color: #f5f7fa;
    color: rgb(51.8, 80.6, 171);
}

.import-json-parent {
    position: relative;
}

.import-json-submenu {
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

.import-json-submenu .submenu-item {
    padding: 1px 20px;
    font-size: 12px;
    cursor: pointer;
    color: #606266;
}

.import-json-submenu .submenu-item:hover {
    background-color: #f5f7fa;
    color: rgb(51.8, 80.6, 171);
}

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

.asset-submenu .submenu-item {
    padding: 5px 12px;
    font-size: 12px;
    cursor: pointer;
    color: #606266;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
}

.asset-submenu .submenu-item:hover {
    background-color: #f5f7fa;
    color: rgb(20, 110, 190);
}

.asset-submenu .submenu-item span {
    flex: 1;
}
</style>

<style>
/* Ẩn dialog và tất cả nội dung */
.ghost-dialog {
    visibility: hidden !important;
    opacity: 0 !important;
    display: none !important;
    pointer-events: none !important;
    transition: none !important;
    animation: none !important;
    transform: none !important;
    width: 0 !important;
    height: 0 !important;
    overflow: hidden !important;
}

/* Ẩn backdrop/modal mask - Ẩn TẤT CẢ backdrop khi có dialog với class ghost-dialog */
body>.v-modal {
    transition: none !important;
}

/* Ẩn wrapper của dialog khi có class ghost-dialog */
.el-dialog__wrapper {
    transition: none !important;
}

/* Đảm bảo không có transition/animation khi duplicate */
.ghost-dialog * {
    transition: none !important;
    animation: none !important;
    transform: none !important;
}

/* Ẩn backdrop ngay lập tức khi có class ghost-dialog trong DOM */
body:has(.ghost-dialog) .v-modal,
.el-dialog__wrapper:has(.ghost-dialog) .v-modal {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
}

/* Fallback: Ẩn backdrop nếu browser không support :has() */
body .v-modal {
    transition: opacity 0s !important;
}

/* Ẩn backdrop khi body có class duplicating-mode */
body.duplicating-mode .v-modal {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
    transition: none !important;
}

.move-dialog .el-dialog__body {
    padding-top: 0;
}

/* Ẩn tất cả backdrop ngay khi duplicate */
body.duplicating-mode>.v-modal {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
}
</style>

<style>
.app-dialog {
    box-sizing: border-box;
}

.app-dialog.el-dialog {
    width: 65%;
    margin-top: 5vh !important;
    border-radius: 6px;
    height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.app-dialog .el-dialog__body {
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    flex: 1;
}

.app-dialog .el-dialog__body::-webkit-scrollbar {
    width: 0px;
    height: 0px;
}

.app-dialog .el-dialog__footer {
    padding: 10px 20px;
    border-top: 1px solid #ebeef5;
}

.custom-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.custom-footer .footer-btn {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100px;
}

.custom-dialog {
    max-height: 90vh;
    height: auto !important;
}

.move-dialog {
    width: 35% !important;
}

@media (max-width: 767px) {
    .custom-footer {
        justify-content: center;
    }
}
</style>