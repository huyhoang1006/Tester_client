<template>
    <div class="explorer">
        <!-- Thanh công cụ -->
        <div v-show="!clientSlide" class="toolbar">
            <div style="display: flex; align-items: center;">
                <div @click="resetAllServer" class="path-hover">Database manage</div>
                <i style="margin-left: 10px;" class="fa-solid fa-angle-right"></i>
            </div>
            <div style="display: flex; align-items: center;" v-for="(item, index) in pathMapServer" :key="index">
                <div @click="resetPathServer(index)" class="path-hover"> {{ item.parent }}</div>
                <i style="margin-left: 10px;" class="fa-solid fa-angle-right"></i>
            </div>
        </div>
        <div v-show="clientSlide" class="toolbar">
            <div style="display: flex; align-items: center;">
                <div @click="resetAllClient" class="path-hover">Database manage</div>
                <i style="margin-left: 10px;" class="fa-solid fa-angle-right"></i>
            </div>
            <div style="display: flex; align-items: center;" v-for="(item, index) in pathMapClient" :key="index">
                <div class="path-hover"> {{ item.parent }}</div>
                <i style="margin-left: 10px;" class="fa-solid fa-angle-right"></i>
            </div>
        </div>
        <div id="toolbar-setting-id" class="toolbar-setting">
            <div>
                <el-dropdown 
                ref="addDropdown"
                @command="handleAddCommand" 
                @visible-change="handleDropdownVisibleChange"
                trigger="click">
                    <span class="icon-wrapper">
                        <i title="Add" style="font-size: 12px;" class="fa-solid fa-square-plus"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item 
                            v-if="isCommandAllowed('organisation')" 
                            command="organisation">
                            <icon size="12px" folderType="building" badgeColor="146EBE"></icon> add Organisation
                        </el-dropdown-item>
                        <el-dropdown-item 
                            v-if="isCommandAllowed('substation')" 
                            command="substation">
                            <icon size="12px" folderType="location" badgeColor="146EBE"></icon> add Substation
                        </el-dropdown-item>
                        <el-dropdown-item 
                            v-if="isCommandAllowed('voltageLevel')" 
                            command="voltageLevel">
                            <icon size="12px" folderType="voltageLevel" badgeColor="146EBE"></icon> add Voltage Level
                        </el-dropdown-item>
                        <el-dropdown-item 
                            v-if="isCommandAllowed('bay')" 
                            command="bay">
                            <icon size="12px" folderType="bay" badgeColor="146EBE"></icon> add Bay
                        </el-dropdown-item>
                        <el-dropdown-item 
                            v-if="isCommandAllowed('asset')" 
                            command="asset"
                            class="asset-submenu-parent"
                            @mouseenter.native="showAssetSub = true"
                            @mouseleave.native="showAssetSub = false">
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
                        <el-dropdown-item 
                            v-if="isCommandAllowed('job')" 
                            command="job">
                            <icon size="12px" folderType="job" badgeColor="146EBE"></icon> add Job
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
            <div>
                <i @click="handleOpenNode" title="Open" style="font-size: 12px;" class="fa-regular fa-folder-open"></i>
            </div>
            <div>
                <i @click="duplicateSelectedNodes" title="Duplicate" style="font-size: 12px;" class="fa-solid fa-clone"></i>
            </div>
            <div>
                <el-dropdown @command="handleImportCommand" trigger="click">
                    <i title="Import" style="font-size: 12px;" class="fa-solid fa-file-import"></i>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item class="import-json-parent" @mouseenter.native="showSubImport = 'json'" @mouseleave.native="showSubImport = null">
                            <icon size="12px" fileTypeDetail="json" folderType="fileType" badgeColor="146EBE"></icon> import from JSON
                            <div class="import-json-submenu" v-if="showSubImport === 'json'" @click.stop @mouseenter.stop @mouseleave.stop>
                                <div class="submenu-item" @click="handleImportCommand('importJSON')">import JSON</div>
                                <div class="submenu-item" @click="handleImportCommand('importJSONCIM')">import JSON by CIM</div>
                            </div>
                        </el-dropdown-item>
                        <el-dropdown-item command="importXML">
                            <icon size="12px" fileTypeDetail="xml" folderType="fileType" badgeColor="146EBE"></icon> import from XML
                        </el-dropdown-item>
                        <el-dropdown-item command="importExcel">
                            <icon size="12px" fileTypeDetail="excel" folderType="fileType" badgeColor="146EBE"></icon> import from Excel
                        </el-dropdown-item>
                        <el-dropdown-item command="importWord"> 
                            <icon size="12px" fileTypeDetail="word" folderType="fileType" badgeColor="146EBE"></icon> import from Word
                        </el-dropdown-item>
                        <el-dropdown-item command="importPDF">
                            <icon size="12px" fileTypeDetail="pdf" folderType="fileType" badgeColor="146EBE"></icon> import from PDF
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>        
            </div>
            <div>
                <el-dropdown @command="handleCommand" trigger="click">
                    <i title="Export" style="font-size: 12px;" class="fa-solid fa-file-export"></i>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item class="export-json-parent" @mouseenter.native="showSub = 'json'" @mouseleave.native="showSub = null">
                            <icon size="12px" fileTypeDetail="json" folderType="fileType" badgeColor="146EBE"></icon> export to JSON
                            <div class="export-json-submenu" v-if="showSub === 'json'" @click.stop @mouseenter.stop @mouseleave.stop>
                                <div class="submenu-item" @click="handleCommand('exportJSON')">export JSON</div>
                                <div class="submenu-item" @click="handleCommand('exportJSONCIM')">export JSON by CIM</div>
                            </div>
                        </el-dropdown-item>
                        <el-dropdown-item command="exportXML">
                            <icon size="12px" fileTypeDetail="xml" folderType="fileType" badgeColor="146EBE"></icon> export to XML
                        </el-dropdown-item>
                        <el-dropdown-item command="exportExcel">
                            <icon size="12px" fileTypeDetail="excel" folderType="fileType" badgeColor="146EBE"></icon> export to Excel
                        </el-dropdown-item>
                        <el-dropdown-item command="exportWord"> 
                            <icon size="12px" fileTypeDetail="word" folderType="fileType" badgeColor="146EBE"></icon> export to Word
                        </el-dropdown-item>
                        <el-dropdown-item command="exportPDF">
                            <icon size="12px" fileTypeDetail="pdf" folderType="fileType" badgeColor="146EBE"></icon> export to PDF
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
            <div v-if="clientSlide">
                <i title="Upload" style="font-size: 12px;" class="fa-solid fa-upload"></i>
            </div>
            <div v-if="!clientSlide">
                <i title="Download" style="font-size: 12px;" class="fa-solid fa-download"></i>
            </div>
            <div>
                <i @click="handleDeleteNode" title="Delete" style="font-size: 12px;" class="fa-solid fa-trash"></i>
            </div>
            <div @click="handleClickFmeca">
                <i title="Fmeca" style="font-size: 12px;" class="fa-solid fa-table"></i>
            </div>
            <div>
                <i @click="handleMoveNode" title="Move" style="font-size: 12px;" class="fa-solid fa-arrows-up-down-left-right"></i>
            </div>
        </div>
        <!-- Thanh điều hướng có thể kéo rộng/kéo hẹp -->
        <div class="resizable-sidebar">
            <div ref="sidebarClient" v-show="clientSlide" class="sidebar">
                <div class="title-temp">
                    <div ref="tabContainer" class="tab-container">
                        <div @contextmenu.prevent="showContext" ref="locationRoot" @click="showLocationRoot"
                            class="location">
                            Location
                        </div>
                        <div ref="ownerRoot" class="tab">
                            Owner
                        </div>
                    </div>
                    <contextMenu @show-addSubs="showAddSubs" ref="contextSubstation"></contextMenu>
                </div>
                <div class="child-nav">
                    <ul>
                        <TreeNode v-for="item in organisationClientList" :key="item.id" :node="item"
                            @double-click-node="doubleClickNode" :selectedNodes.sync="selectedNodes"
                            @fetch-children="fetchChildren" @show-properties="showPropertiesData"
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
                        @duplicate-node="handleDuplicateFromContext"
                        @move-node="handleMoveFromContext"
                        @import-json="handleImportJSONFromContext" @import-json-cim="handleImportJSONCIMFromContext"
                        @show-data="showDataClient" ref="contextMenuClient">
                    </contextMenu>
                </div>
            </div>
            <div ref="sidebarServer" v-show="!clientSlide" class="sidebar">
                <div class="title-temp">
                    <div ref="tabContainer" class="tab-container">
                        <div ref="ownerRootServer" @click="showOwnerServerRoot" class="tab">
                            Owner
                        </div>
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
                    <contextMenu @show-data="showData" 
                        @export-json="handleExportJSONFromContext" @export-json-cim="handleExportJSONCIMFromContext"
                        @export-xml="handleExportXMLFromContext" @export-excel="handleExportExcelFromContext"
                        @export-word="handleExportWordFromContext" @export-pdf="handleExportPDFFromContext"
                        @duplicate-node="handleDuplicateFromContext"
                        @move-node="handleMoveFromContext"
                        @import-json="handleImportJSONFromContext" @import-json-cim="handleImportJSONCIMFromContext"
                        ref="contextMenu"></contextMenu>
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
                                <div class="title-name">
                                    Object Properties
                                </div>
                                <div style="margin-right: 5px;">
                                    <i @click="hideProperties" class="fa-solid fa-square-caret-right"></i>
                                </div>
                            </div>
                        </div>
                        <div class="content-properties">
                            <div class="content-properties-header">
                                <i class="fa-solid fa-chevron-down" style="padding-right: 5px; font-size: 10px;"></i>
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
                                <i class="fa-solid fa-chevron-down" style="padding-right: 5px; font-size: 10px;"></i>
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
                                <i class="fa-solid fa-chevron-down" style="padding-right: 5px; font-size: 10px;"></i>
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
                                <i class="fa-solid fa-chevron-down" style="padding-right: 5px; font-size: 10px;"></i>
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
                    <div v-if="!propertiesSign" @click="showProperties" class="trapezoid">
                    </div>
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
                                <div class="title-name">
                                    Object Properties
                                </div>
                                <div style="margin-right: 5px;">
                                    <i @click="hidePropertiesClient" class="fa-solid fa-square-caret-right"></i>
                                </div>
                            </div>
                        </div>
                        <div class="content-properties">
                            <div class="content-properties-header">
                                <i class="fa-solid fa-chevron-down" style="padding-right: 5px; font-size: 10px;"></i>
                                Owner & Position
                            </div>
                            <div class="content-properties-table">
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Name</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word"> {{
                                        propertiesClient.name || '&nbsp;' }} </div>
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
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        propertiesClient.state_province || '&nbsp;' }}</div>
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
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        propertiesClient.geo_coordinates || '&nbsp;' }}</div>
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
                                <i class="fa-solid fa-chevron-down" style="padding-right: 5px; font-size: 10px;"></i>
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
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        assetPropertiesClient.asset_type || '&nbsp;' }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Serial number</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        assetPropertiesClient.serial_no || '&nbsp;' }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Manufacturer</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        assetPropertiesClient.manufacturer || '&nbsp;' }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Manufacturer type</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        assetPropertiesClient.manufacturer_type || '&nbsp;' }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Manufacturing year</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        assetPropertiesClient.manufacturing_year || '&nbsp;' }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Country</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        assetPropertiesClient.country || '&nbsp;' }}</div>
                                </div>
                                <div class="content-properties-table-flex">
                                    <div class="content-properties-table-header">Apparatus id</div>
                                    <div class="content-properties-table-content fixed-box pl10 break-word">{{
                                        assetPropertiesClient.apparatus_id || '&nbsp;' }}</div>
                                </div>
                            </div>
                            <div v-if="jobPropertySignClient" class="content-properties-header">
                                <i class="fa-solid fa-chevron-down" style="padding-right: 5px; font-size: 10px;"></i>
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
                                <i class="fa-solid fa-chevron-down" style="padding-right: 5px; font-size: 10px;"></i>
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
                    <div v-if="!propertiesSignClient" @click="showPropertiesClient" class="trapezoid">
                    </div>
                </div>
                <div ref="logBarClient" v-if="logSignClient" class="log-bar">
                    <LogBar @reloadLog="reloadLogClient" :logData="logDataClient" @hideLogBar="hideLogBarClient">
                    </LogBar>
                </div>
            </div>
        </div>
        <el-dialog title="Add Substation" :visible.sync="signSubs" width="1000px" @close="handleSubsCancel">
            <Substation :parentOrganization="parentOrganization" :personList="personList" :locationList="locationList"
                :organisationId="organisationId" ref="substation"></Substation>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleSubsCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleSubsConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Organisation" :visible.sync="signOrg" width="1000px" @close="handleOrgCancel">
            <Organisation :parent="parentOrganization" ref="organisation"></Organisation>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleOrgCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleOrgConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Voltage Level" :visible.sync="signVoltageLevel" width="1000px"
            @close="handleVoltageLevelCancel">
            <VoltageLevel :locationId="locationId" :parent="parentOrganization" ref="voltageLevel"></VoltageLevel>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleVoltageLevelCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleVoltageLevelConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Bay Level" :visible.sync="signBay" width="1000px" @close="handleBayCancel">
            <Bay :locationId="locationId" :parent="parentOrganization" ref="bay"></Bay>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleBayCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleBayConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Transformer" :visible.sync="signTransformer" width="1000px"
            @close="handleTransformerCancel"
            :modal="!isDuplicating" 
    :show-close="!isDuplicating"
    :transition="isDuplicating ? '' : 'dialog-fade'"
    :custom-class="isDuplicating ? 'ghost-dialog' : ''">
            <Transformer :locationId="locationId" :parent="parentOrganization" ref="transformer"></Transformer>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleTransformerCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleTransformerConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Bushing" :visible.sync="signBushing" width="1000px" @close="handleBushingCancel"
            :modal="!isDuplicating" 
            :show-close="!isDuplicating"
            :transition="isDuplicating ? '' : 'dialog-fade'"
            :custom-class="isDuplicating ? 'ghost-dialog' : ''">
            <Bushing :locationId="locationId" :parent="parentOrganization" ref="bushing"></Bushing>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleBushingCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleBushingConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Surge Arrester" :visible.sync="signSurge" width="1000px" @close="handleSurgeCancel"
            :modal="!isDuplicating" 
            :show-close="!isDuplicating"
            :transition="isDuplicating ? '' : 'dialog-fade'"
            :custom-class="isDuplicating ? 'ghost-dialog' : ''">
            <SurgeArrester :locationId="locationId" :parent="parentOrganization" ref="surgeArrester"></SurgeArrester>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleSurgeCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleSurgeConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Circuit Breaker" :visible.sync="signCircuit" width="1000px" @close="handleCircuitCancel"
            :modal="!isDuplicating" 
            :show-close="!isDuplicating"
            :transition="isDuplicating ? '' : 'dialog-fade'"
            :custom-class="isDuplicating ? 'ghost-dialog' : ''">
            <CircuitBreaker :locationId="locationId" :parent="parentOrganization" ref="circuitBreaker"></CircuitBreaker>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleCircuitCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleCircuitConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Current Transformer" :visible.sync="signCt" width="1000px" @close="handleCtCancel"
            :modal="!isDuplicating" 
            :show-close="!isDuplicating"
            :transition="isDuplicating ? '' : 'dialog-fade'"
            :custom-class="isDuplicating ? 'ghost-dialog' : ''">
            <CurrentTransformer :locationId="locationId" :parent="parentOrganization" ref="currentTransformer">
            </CurrentTransformer>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleCtCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleCtConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Voltage Transformer" :visible.sync="signVt" width="1000px" @close="handleVtCancel"
            :modal="!isDuplicating" 
            :show-close="!isDuplicating"
            :transition="isDuplicating ? '' : 'dialog-fade'"
            :custom-class="isDuplicating ? 'ghost-dialog' : ''">
            <VoltageTransformer :locationId="locationId" :parent="parentOrganization" ref="voltageTransformer">
            </VoltageTransformer>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleVtCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleVtConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Power Cable" :visible.sync="signPower" width="1000px" @close="handlePowerCancel"
            :modal="!isDuplicating" 
            :show-close="!isDuplicating"
            :transition="isDuplicating ? '' : 'dialog-fade'"
            :custom-class="isDuplicating ? 'ghost-dialog' : ''">
            <PowerCable :locationId="locationId" :parent="parentOrganization" ref="powerCable"></PowerCable>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handlePowerCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handlePowerConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Disconnector" :visible.sync="signDisconnector" width="1000px"
            @close="handleDisconnectorCancel"
            :modal="!isDuplicating" 
            :show-close="!isDuplicating"
            :transition="isDuplicating ? '' : 'dialog-fade'"
            :custom-class="isDuplicating ? 'ghost-dialog' : ''">
            <Disconnector :locationId="locationId" :parent="parentOrganization" ref="disconnector"></Disconnector>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleDisconnectorCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleDisconnectorConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Rotating Machine" :visible.sync="signRotating" width="1000px"
            @close="handleRotatingCancel"
            :modal="!isDuplicating" 
            :show-close="!isDuplicating"
            :transition="isDuplicating ? '' : 'dialog-fade'"
            :custom-class="isDuplicating ? 'ghost-dialog' : ''">
            <RotatingMachine :locationId="locationId" :parent="parentOrganization" ref="rotatingMachine">
            </RotatingMachine>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleRotatingCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleRotatingConfirm">Save</el-button>
            </span>
        </el-dialog>
        <el-dialog title="Add Capacitor" :visible.sync="signCapacitor" width="1000px" @close="handleCapacitorCancel"
            :modal="!isDuplicating" 
            :show-close="!isDuplicating"
            :transition="isDuplicating ? '' : 'dialog-fade'"
            :custom-class="isDuplicating ? 'ghost-dialog' : ''">
            <Capacitor :locationId="locationId" :parent="parentOrganization" ref="capacitor">
            </Capacitor>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleCapacitorCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleCapacitorConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Reactor" :visible.sync="signReactor" width="1000px" @close="handleReactorCancel"
            :modal="!isDuplicating" 
            :show-close="!isDuplicating"
            :transition="isDuplicating ? '' : 'dialog-fade'"
            :custom-class="isDuplicating ? 'ghost-dialog' : ''">
            <Reactor :locationId="locationId" :parent="parentOrganization" ref="reactor">
            </Reactor>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleReactorCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleReactorConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Job" :visible.sync="signJob" width="1000px" @close="handleJobCancel">
            <component ref="jobData" :is="checkJobType" :locationData="locationData" :assetData="assetData"
                :productAssetModelData="productAssetModelData" :parent="parentOrganization"
                :testTypeListData="testTypeListData">
            </component>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleJobCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleJobConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Export" width="1000px" :visible.sync="openExportDialog">
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleCancelExport">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleExportConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Import" width="1000px" :visible.sync="openImportDialog">
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleCancelImport">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleImportConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Fmeca" width="1000px" :visible.sync="signFmeca" @close="handleFmecaCancel">
            <Fmeca></Fmeca>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleFmecaCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleFmecaConfirm">Save</el-button>
            </span>
        </el-dialog>
        <el-dialog title="Move Node" :visible.sync="moveDialogVisible" width="500px">
    <div style="height: 400px; overflow-y: auto;">
        <el-tree 
            ref="moveTree"
            :data="moveTreeData" 
            :props="moveTreeProps" 
            node-key="mrid"
            :expand-on-click-node="false"
            :default-expanded-keys="expandedMoveKeys"
            @node-click="handleTargetNodeClick"
            highlight-current>
            <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>
                    <!-- Icon tương ứng với loại node -->
                    <i v-if="data.mode === 'organisation'" class="fa-regular fa-building"></i>
                    <i v-if="data.mode === 'substation'" class="fa-solid fa-industry"></i>
                    <i v-if="data.mode === 'voltageLevel'" class="fa-solid fa-bolt"></i>
                    <i v-if="data.mode === 'bay'" class="fa-solid fa-cube"></i>
                    <i v-if="data.mode === 'asset'" class="fa-solid fa-box"></i>
                    {{ node.label }}
                </span>
            </span>
        </el-tree>
    </div>
    <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="moveDialogVisible = false">Cancel</el-button>
        <el-button size="small" type="primary" @click="confirmMoveNode" :disabled="!selectedTargetNode">Move</el-button>
    </span>
</el-dialog>
    </div>
    
</template>
<script>
/* eslint-disable */
import LogBar from '@/components/LogBar'
import TreeNode from '@/views/Common/TreeNode.vue'
import Vue from "vue";
import pageAlign from '@/views/PageAlign/pageAlign.vue'
import spinner from '@/views/Common/Spinner.vue'
import Tabs from '@/views/Common/Tabs.vue'
import contextMenu from "@/views/Common/ContextMenu.vue";

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
import Attachment from '../Common/Attachment.vue';
import * as demoAPI from '@/api/demo'
import Icon from '@/views/Common/Icon.vue'
import Fmeca from '@/views/Fmeca'

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

import { exportNodeToJSON as exportNodeToJSONUtil } from '@/function/entity/export/index'
import { importNodeFromJSON as importNodeFromJSONUtil } from '@/function/entity/import/index'

import TransformerMixin from '@/views/AssetView/Transformer/mixin/index.js'
import SurgeArresterMixin from '@/views/AssetView/SurgeArrester/mixin/index.js'
import BushingMixin from '@/views/AssetView/Bushing/mixin/index.js'
import VoltageTransformerMixin from '@/views/AssetView/VoltageTransformer/mixin/index.js'
import DisconnectorMixin from '@/views/AssetView/Disconnector/mixin/index.js'
import PowerCableMixin from '@/views/AssetView/PowerCable/mixin/index.js'
import CurrentTransformerMixin from '@/views/AssetView/CurrentTransformer/mixin/index.js'
import CircuitBreakerMixin from '@/views/AssetView/CircuitBreaker/mixin/index.js'
import RotatingMachineMixin from '@/views/AssetView/RotatingMachine/mixin/index.js'
import CapacitorMixin from '@/views/AssetView/Capacitor/mixin/index.js'
import ReactorMixin from '@/views/AssetView/Reactor/mixin/index.js'
import BayMixin from '@/views/Bay/mixin/index.js'
export default {
    name: 'TreeNavigation',
    components: {
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
        Fmeca
    },
    data() {
        return {
            openExportDialog: false,
            openImportDialog: false,
            signFmeca: false,
            showSub : null,
            showSubImport : null,
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
            expandedMoveKeys: [],
            moveTreeProps: {
            children: 'children',
            label: 'name',
            disabled: 'disabled' // Thuộc tính để chặn click vào node không hợp lệ
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
                country: '',
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
                country: '',
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
                dot: "...",
                end: 10,
            },
            displayPageLocationSync: {
                second: true,
                third: true,
                dot: true,
                end: true
            },
            pageLocationSyncInstance: {
                first: "",
                second: "",
                third: "",
                dot: "",
                end: "",
            },
            currentLocationSync: {
                nextP: '',
                previousP: '',
                current: 1,
            },
            optionLocationSync: {
                mode: ''
            },
            sl: 10,
            count: '',
            ownerServerList: [],
            ownerList: [],
            locationList: [],
            personList: [],
            AssetType: ["Transformer", "Circuit breaker", "Current transformer", "Voltage transformer", "Disconnector", "Power cable", "Surge arrester"],
            LocationType: ["location", "voltage", "feeder"]
        }
    },
    computed: {
    // ...existing computed properties...
    isCommandAllowed() {
        return (cmd) => {
            const selectedNode = this.selectedNodes && this.selectedNodes.length > 0 
                ? this.selectedNodes[this.selectedNodes.length - 1] 
                : null;
            
            if (!selectedNode) return false;
            return this.getAllowedCommands(selectedNode).includes(cmd);
        }
    }
},
    mixins: [mixin],
    async beforeMount() {
        try {
            const data = await window.electronAPI.getAllConfigurationEvents()
            if (data && data.success) {
                this.logDataClient = data.data;
            }
        } catch (error) {
            console.error("Error fetching server log data:", error);
            this.$message.error("Failed to fetch log data.");
        }
    },
    methods: {
        handleDropdownVisibleChange(visible) {
        // Nếu dropdown muốn mở mà chưa có node selected, ngăn nó mở
        if (visible && (!this.selectedNodes || this.selectedNodes.length === 0)) {
            this.$message.warning("Please select a node first");
            // Ngăn dropdown mở bằng cách set visible = false
            this.$nextTick(() => {
                // Tìm ref dropdown và close nó
                if (this.$refs.addDropdown) {
                    this.$refs.addDropdown.visible = false;
                }
            });
        }
    },
        handleCommand(cmd) {
            console.log("Command received:", cmd);
            if (cmd === 'exportExcel') {
                this.openExportDialog = true
            } else if (cmd === 'exportJSON') {
                this.exportTreeToJSON('dto')
            } else if (cmd === 'exportJSONCIM') {
                this.exportTreeToJSON('cim')
            } else if (cmd === 'exportXML') {
                this.openExportDialog = true
            } else if (cmd === 'exportWord') {
                this.openExportDialog = true
            } else if (cmd === 'exportPDF') {
                this.openExportDialog = true
            } 
        },
        async exportTreeToJSON(type) {
            // Yêu cầu phải chọn ít nhất 1 node để export
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select at least one node to export')
                return
            }

            const dependencies = {
                electronAPI: window.electronAPI,
                mappings: {
                    SubstationMapping,
                    OrganisationMapping,
                    SurgeArresterMapping,
                    PowerCableMapping,
                    DisconnectorMapping,
                    rotatingMachineMapping,
                    CapacitorMapping,
                    VoltageTransformerMapping,
                    CurrentTransformerMapping,
                    TransformerMapping,
                    BreakerMapping,
                    ReactorMapping,
                    BushingMapping
                },
                userId: this.$store.state.user.user_id,
                messageHandler: this.$message
            }

            await exportNodeToJSONUtil(this.selectedNodes, type, dependencies)
        },
        async handleImportCommand(cmd) {
           if (cmd === 'importExcel') {
                this.openImportDialog = true
            } else if(cmd === 'importJSON'){
                await this.importTreeFromJSON('dto')
            } else if(cmd === 'importJSONCIM'){
                // TODO: Implement import JSON by CIM (sau khi có import JSON thường)
                this.$message.info('Import JSON by CIM feature is coming soon')
            } else if(cmd === 'importXML'){
                this.openImportDialog = true
            } else if(cmd === 'importWord'){
                this.openImportDialog = true
            } else if(cmd === 'importPDF'){
                this.openImportDialog = true
            }  
        },
        async importTreeFromJSON(type) {
            // Validate: Phải có selectedNode (giống export)
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select at least one node to import into')
                return
            }

            // Lấy parent node (node được chọn đầu tiên)
            const parentNode = this.selectedNodes[0]

            try {
                // Mở file picker để chọn JSON file
                const fileResult = await window.electronAPI.importJSON()
                
                if (!fileResult.success || !fileResult.data) {
                    if (fileResult.message !== 'Import cancelled') {
                        this.$message.error(fileResult.message || 'Failed to load JSON file')
                    }
                    return
                }

                const dtos = fileResult.data

                // Prepare dependencies
                const dependencies = {
                    electronAPI: window.electronAPI,
                    mappings: {
                        SubstationMapping,
                        OrganisationMapping,
                        SurgeArresterMapping,
                        PowerCableMapping,
                        DisconnectorMapping,
                        rotatingMachineMapping,
                        CapacitorMapping,
                        VoltageTransformerMapping,
                        CurrentTransformerMapping,
                        TransformerMapping,
                        BreakerMapping,
                        ReactorMapping,
                        BushingMapping
                    },
                    userId: this.$store.state.user.user_id,
                    messageHandler: this.$message
                }

                // Import với parent node
                const result = await importNodeFromJSONUtil(dtos, parentNode, dependencies)

                // Refresh tree sau khi import thành công
                if (result.success && result.successCount > 0) {
                    // Refresh tree bằng cách reload children của parent node
                    this.refreshTreeAfterImport(parentNode)
                }
            } catch (error) {
                console.error('Error importing JSON:', error)
                this.$message.error('An error occurred while importing JSON')
            }
        },
        refreshTreeAfterImport(parentNode) {
            // Refresh tree bằng cách trigger reload children
            if (parentNode) {
                // Emit event để reload children của parent node
                this.$nextTick(() => {
                    // Có thể cần gọi method reload tree tùy vào implementation
                    // Tạm thời chỉ log
                    console.log('Tree should be refreshed after import')
                })
            }
        },
        handleCancelImport(){
            this.openImportDialog = false
        },

        handleImportConfirm(){
            this.openImportDialog = false
            this.$message.success("Import successfully")
        },
        handleCancelExport(){
            this.openExportDialog = false
        },

        handleExportConfirm() {
            this.openExportDialog = false
            this.$message.success("Export successfully")
        },

        handleFmecaCancel() {
            this.signFmeca = false
        },

        handleFmecaConfirm() {
            this.signFmeca = false
            this.$message.success("Save successfully")
        },

        handleClickFmeca() {
            this.signFmeca = true;
        },
        async handleExportJSONFromContext(node) {
            await this.exportSingleNodeToJSON(node, 'dto')
        },
        async handleExportJSONCIMFromContext(node) {
            await this.exportSingleNodeToJSON(node, 'cim')
        },
        async handleDuplicateFromContext(node) {
            // Set selectedNodes để duplicateSelectedNodes có thể sử dụng
            this.selectedNodes = [node];
            // Gọi hàm duplicate
            await this.duplicateSelectedNodes();
        },
        async handleMoveFromContext(node) {
            // Set selectedNodes để handleMoveNode có thể sử dụng
            this.selectedNodes = [node];
            await this.handleMoveNode();
        },
        // Import handlers từ context menu
        async handleImportJSONFromContext(node) {
            // Validate: Phải có node
            if (!node) {
                this.$message.warning('Please select a node to import into')
                return
            }

            try {
                // Mở file picker để chọn JSON file
                const fileResult = await window.electronAPI.importJSON()
                
                if (!fileResult.success || !fileResult.data) {
                    if (fileResult.message !== 'Import cancelled') {
                        this.$message.error(fileResult.message || 'Failed to load JSON file')
                    }
                    return
                }

                const dtos = fileResult.data

                // Prepare dependencies
                const dependencies = {
                    electronAPI: window.electronAPI,
                    mappings: {
                        SubstationMapping,
                        OrganisationMapping,
                        SurgeArresterMapping,
                        PowerCableMapping,
                        DisconnectorMapping,
                        rotatingMachineMapping,
                        CapacitorMapping,
                        VoltageTransformerMapping,
                        CurrentTransformerMapping,
                        TransformerMapping,
                        BreakerMapping,
                        ReactorMapping,
                        BushingMapping
                    },
                    userId: this.$store.state.user.user_id,
                    messageHandler: this.$message
                }

                // Import với node làm parent
                const result = await importNodeFromJSONUtil(dtos, node, dependencies)

                // Refresh tree sau khi import thành công
                if (result.success && result.successCount > 0) {
                    this.refreshTreeAfterImport(node)
                }
            } catch (error) {
                console.error('Error importing JSON:', error)
                this.$message.error('An error occurred while importing JSON')
            }
        },
        async handleImportJSONCIMFromContext(node) {
            this.$message.info('Import JSON by CIM feature is coming soon')
        },
        // Export một node duy nhất từ context menu (không dùng selectedNodes)
        async exportSingleNodeToJSON(node, type) {
            if (!node) {
                this.$message.warning('No node selected to export')
                return
            }

            const dependencies = {
                electronAPI: window.electronAPI,
                mappings: {
                    SubstationMapping,
                    OrganisationMapping,
                    SurgeArresterMapping,
                    PowerCableMapping,
                    DisconnectorMapping,
                    rotatingMachineMapping,
                    CapacitorMapping,
                    VoltageTransformerMapping,
                    CurrentTransformerMapping,
                    TransformerMapping,
                    BreakerMapping,
                    ReactorMapping,
                    BushingMapping
                },
                userId: this.$store.state.user.user_id,
                messageHandler: this.$message
            }

            // Truyền trực tiếp node, không dùng selectedNodes
            await exportNodeToJSONUtil(node, type, dependencies)
        },
        handleExportXMLFromContext(node) {
            this.openExportDialog = true
        },
        handleExportExcelFromContext(node) {
            this.openExportDialog = true
        },
        handleExportWordFromContext(node) {
            this.openExportDialog = true
        },
        handleExportPDFFromContext(node) {
            this.openExportDialog = true
        },

        async reloadLogClient(doneCallback) {
            try {
                const data = await window.electronAPI.getAllConfigurationEvents()
                if (data && data.success) {
                    this.logDataClient = data.data;
                    await new Promise(resolve => setTimeout(resolve, 500));
                    this.$message.success("Log data reloaded successfully.");
                }
            } catch (error) {
                console.error("Error fetching server log data:", error);
                this.$message.error("Failed to fetch log data.");
            } finally {
                if (typeof doneCallback === 'function') doneCallback();
            }
        },
        removeTab(index) {
            if (this.activeTab.id == this.tabs[index].id) {
                this.activeTab = {}
            }
            this.tabs.splice(index, 1);
        },
        removeTabClient(index) {
            if (this.activeTabClient.mrid == this.tabsClient[index].mrid) {
                this.activeTabClient = {}
            }
            this.tabsClient.splice(index, 1);
        },
        hideLogBar(sign) {
            this.logSign = false
            const element = this.$refs.contentData;
            element.style.height = "100%";
        },

        hideLogBarClient(sign) {
            this.logSignClient = false
            const element = this.$refs.contentDataClient;
            element.style.height = "100%";
        },
        startResizeClient() {
            document.addEventListener("mousemove", this.resizeClient);
            document.addEventListener("mouseup", this.stopResizeClient);
        },
        resizeClient(event) {
            if (!this.$refs.sidebarClient) return
            let newWidth = (event.clientX / window.innerWidth) * 100;
            let finalWidth = Math.max(10, Math.min(40, newWidth));
            // Cập nhật width của sidebar và context-data
            this.$refs.sidebarClient.style.width = finalWidth + "vw";
            this.$refs.contextDataClient.style.width = 100 - finalWidth + "vw";
        },
        stopResizeClient() {
            document.removeEventListener("mousemove", this.resizeClient);
            document.removeEventListener("mouseup", this.stopResizeClient);
        },
        startResizeContentClient() {
            document.addEventListener("mousemove", this.resizeContentClient);
            document.addEventListener("mouseup", this.stopResizeContentClient);
        },
        resizeContentClient(event) {
            if (!this.$refs.propertiesClient || !this.$refs.contentDataClient) return;
            const parentWidth = this.$refs.contextDataClient.clientWidth;
            let newWidth = parentWidth - event.clientX + this.$refs.contextDataClient.getBoundingClientRect().left;
            const minWidth = parentWidth * 0.1;
            const maxWidth = parentWidth * 0.4;
            newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
            newWidth = (newWidth / parentWidth) * 100
            // Cập nhật width của sidebar và context-data
            this.$refs.propertiesClient.style.width = `${newWidth}%`;
            this.$refs.contentClient.style.width = `${100 - newWidth}%`;
        },
        stopResizeContentClient() {
            document.removeEventListener("mousemove", this.resizeContentClient);
            document.removeEventListener("mouseup", this.stopResizeContentClient);
        },
        startResizeServer() {
            document.addEventListener("mousemove", this.resizeServer);
            document.addEventListener("mouseup", this.stopResizeServer);
        },
        resizeServer(event) {
            if (!this.$refs.sidebarServer) return
            let newWidth = (event.clientX / window.innerWidth) * 100;
            let finalWidth = Math.max(10, Math.min(40, newWidth));
            // Cập nhật width của sidebar và context-data
            this.$refs.sidebarServer.style.width = finalWidth + "vw";
            this.$refs.contextDataServer.style.width = 100 - finalWidth + "vw";

        },
        stopResizeServer() {
            document.removeEventListener("mousemove", this.resizeServer);
            document.removeEventListener("mouseup", this.stopResizeServer);
        },
        startResizeContentServer() {
            document.addEventListener("mousemove", this.resizeContentServer);
            document.addEventListener("mouseup", this.stopResizeContentServer);
        },
        resizeContentServer(event) {
            if (!this.$refs.properties || !this.$refs.contentData) return;
            const parentWidth = this.$refs.contextDataServer.clientWidth;
            let newWidth = parentWidth - event.clientX + this.$refs.contextDataServer.getBoundingClientRect().left;
            const minWidth = parentWidth * 0.1;
            const maxWidth = parentWidth * 0.4;
            newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
            newWidth = (newWidth / parentWidth) * 100
            // Cập nhật width của sidebar và context-data
            this.$refs.properties.style.width = `${newWidth}%`;
            this.$refs.content.style.width = `${100 - newWidth}%`;
        },
        stopResizeContentServer() {
            document.removeEventListener("mousemove", this.resizeContentServer);
            document.removeEventListener("mouseup", this.stopResizeContentServer);
        },
        showLogBar(sign) {
            this.logSign = true
            const element = this.$refs.contentData;
            element.style.height = "80%";
            this.$nextTick(() => {
                const elementLog = this.$refs.logBar;
                elementLog.style.height = "20%";
            });
        },

        showLogBarClient(sign) {
            this.logSignClient = true
            const element = this.$refs.contentDataClient;
            element.style.height = "80%";
            this.$nextTick(() => {
                const elementLog = this.$refs.logBarClient;
                elementLog.style.height = "20%";
            });
        },

        showLocationRoot() {
            const locationRoot = this.$refs.locationRoot;
            const ownerRoot = this.$refs.ownerRoot;
            if (locationRoot) {
                locationRoot.style.borderBottom = "2px #aba7a7 solid"; // Thêm viền màu đen dày 2px
                locationRoot.style.color = "rgba(0, 0, 0, 1)"; // Chữ rõ nét
            }
            if (ownerRoot) {
                ownerRoot.style.borderBottom = "2px #e6e4e4 solid";
                ownerRoot.style.color = "rgba(0, 0, 0, 0.5)"; // Chữ bị làm mờ nhưng border vẫn giữ nguyên
            }

            this.$nextTick(async () => {
                try {
                    let rs = await window.electronAPI.getParentOrganizationByMrid(this.$constant.ROOT)
                    if (rs.success) {
                        this.organisationClientList = [rs.data] || []
                    } else {
                        this.$message.error("Cannot load root organisation")
                    }
                } catch (error) {
                    this.$message.error("Error fetching root data")
                    console.error("Error fetching data:", error)
                }
            })
        },

        async fetchChildren(node) {
            // Lưu children hiện có (nếu có) để merge sau
            // Điều này đảm bảo không mất asset đã add trước đó khi node chưa được expand
            const existingChildren = Array.isArray(node.children) ? [...node.children] : [];
            
            // Chỉ fetch nếu:
            // 1. Chưa có children (chưa fetch lần nào)
            // 2. Hoặc có children nhưng chưa được fetch từ server (chỉ có asset mới add)
            // 3. Hoặc có children đã fetch nhưng có asset mới add (cần merge)
            const hasExistingChildren = existingChildren.length > 0;
            const needsFetch = !node.children || !node._childrenFetched || hasExistingChildren;
            if (needsFetch) {
                try {
                    let newRows = [];
                    if (node.mode == 'asset') {
                        const clickedRow = node;
                        if (node.asset && node.asset == 'Surge arrester') {
                            const jobsReturn = await this.fetchJobsByAssetId(node.mrid);
                            if (jobsReturn.success) {
                                jobsReturn.data.forEach(row => {
                                    row.parentId = clickedRow.mrid;
                                    row.mode = 'job';
                                    row.job = 'Surge arrester';
                                    let parentName = clickedRow.parentName + "/" + clickedRow.name
                                    row.parentName = parentName
                                    row.parentArr = [...clickedRow.parentArr || []]
                                    row.parentArr.push({
                                        mrid: clickedRow.mrid,
                                        parent: clickedRow.name
                                    })
                                });
                                newRows.push(...jobsReturn.data);
                            }
                        }
                    } else if (node.mode == 'substation') {
                        const clickedRow = node;
                        const [voltageLevelReturn, bayReturn] = await Promise.all([
                            window.electronAPI.getVoltageLevelBySubstationId(clickedRow.mrid),
                            window.electronAPI.getBayByVoltageBySubstationId(null, clickedRow.mrid)
                        ]);
                        const [assetTransformerReturn, assetSurgeReturn, assetBushingReturn, assetVtReturn, assetDisconnectorReturn, assetPowerCableReturn,
                            assetRotatingMachineReturn, assetCurrentTransformerReturn, assetCapacitorReturn, assetBreakerReturn, assetReactorReturn] = await this.fetchAssetByPsr(clickedRow.mrid);
                        if (voltageLevelReturn.success) {
                            voltageLevelReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'voltageLevel';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...voltageLevelReturn.data);
                        }

                        if (bayReturn.success) {
                            bayReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'bay';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...bayReturn.data);
                        }

                        if (assetTransformerReturn.success) {
                            assetTransformerReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Transformer';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetTransformerReturn.data);
                        }

                        if (assetSurgeReturn.success) {
                            assetSurgeReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Surge arrester';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetSurgeReturn.data);
                        }

                        if (assetBushingReturn.success) {
                            assetBushingReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Bushing';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetBushingReturn.data);
                        }

                        if (assetVtReturn.success) {
                            assetVtReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Voltage transformer';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetVtReturn.data);
                        }

                        if (assetDisconnectorReturn.success) {
                            assetDisconnectorReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Disconnector';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetDisconnectorReturn.data);
                        }

                        if (assetPowerCableReturn.success) {
                            assetPowerCableReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Power cable';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetPowerCableReturn.data);
                        }

                        if (assetRotatingMachineReturn.success) {
                            assetRotatingMachineReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Rotating machine';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetRotatingMachineReturn.data);
                        }

                        if (assetCapacitorReturn.success) {
                            assetCapacitorReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Capacitor';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                            });
                            newRows.push(...assetCapacitorReturn.data);
                        }

                        if (assetReactorReturn.success) {
                            assetReactorReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Reactor';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetReactorReturn.data);
                        }

                        if (assetCurrentTransformerReturn.success) {
                            assetCurrentTransformerReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Current transformer';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetCurrentTransformerReturn.data);
                        }

                        if (assetCurrentTransformerReturn.success) {
                            assetCurrentTransformerReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Current transformer';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetCurrentTransformerReturn.data);
                        }

                        if (assetBreakerReturn.success) {
                            assetBreakerReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Circuit breaker';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetBreakerReturn.data);
                        }

                    } else if (node.mode == 'voltageLevel') {
                        const clickedRow = node;
                        const [bayReturn] = await Promise.all([
                            window.electronAPI.getBayByVoltageBySubstationId(clickedRow.mrid, null)
                        ]);

                        if (bayReturn.success) {
                            bayReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'bay';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...bayReturn.data);
                        }

                    } else if (node.mode == 'bay') {
                        const clickedRow = node;
                        const [assetTransformerReturn, assetSurgeReturn, assetBushingReturn, assetVtReturn, assetDisconnectorReturn, assetPowerCableReturn,
                            assetRotatingMachineReturn, assetCurrentTransformerReturn, assetCapacitorReturn, assetBreakerReturn, assetReactorReturn] = await this.fetchAssetByPsr(clickedRow.mrid);
                        if (assetTransformerReturn.success) {
                            assetTransformerReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Transformer';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetTransformerReturn.data);
                        }
                        if (assetSurgeReturn.success) {
                            assetSurgeReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Surge arrester';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetSurgeReturn.data);
                        }
                        if (assetBushingReturn.success) {
                            assetBushingReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Bushing';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetBushingReturn.data);
                        }
                        if (assetVtReturn.success) {
                            assetVtReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Voltage transformer';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetVtReturn.data);
                        }
                        if (assetDisconnectorReturn.success) {
                            assetDisconnectorReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Disconnector';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetVtReturn.data);
                        }
                        if (assetPowerCableReturn.success) {
                            assetPowerCableReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Power cable';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetPowerCableReturn.data);
                        }
                        if (assetCurrentTransformerReturn.success) {
                            assetCurrentTransformerReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Current transformer';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetCurrentTransformerReturn.data);
                        }
                        if (assetRotatingMachineReturn.success) {
                            assetRotatingMachineReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Rotating machine';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetRotatingMachineReturn.data);
                        }
                        if (assetCapacitorReturn.success) {
                            assetCapacitorReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Capacitor';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetCapacitorReturn.data);
                        }
                        
                        if (assetReactorReturn.success) {
                            assetReactorReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'asset';
                                row.asset = 'Reactor';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...assetReactorReturn.data);
                        }
                    } else {
                        const clickedRow = node;
                        const [organisationReturn, substationReturn] = await Promise.all([
                            window.electronAPI.getParentOrganizationByParentMrid(clickedRow.mrid),
                            window.electronAPI.getSubstationsInOrganisationForUser(clickedRow.mrid, this.$store.state.user.user_id)
                        ]);
                        if (organisationReturn.success && organisationReturn.data && organisationReturn.data.length > 0) {
                            organisationReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'organisation';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...organisationReturn.data);
                        }

                        if (substationReturn.success && substationReturn.data && substationReturn.data.length > 0) {
                            substationReturn.data.forEach(row => {
                                row.parentId = clickedRow.mrid;
                                row.mode = 'substation';
                                let parentName = clickedRow.parentName + "/" + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...clickedRow.parentArr || []]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: clickedRow.name
                                })
                            });
                            newRows.push(...substationReturn.data);
                        }
                    }
                    // Merge với children hiện có (nếu có) để không mất asset đã add trước đó
                    if (existingChildren.length > 0) {
                        // Tạo map của mrid để tránh duplicate
                        const existingMrids = new Set(existingChildren.map(c => c.mrid));
                        // Chỉ thêm children mới nếu chưa có trong existingChildren
                        const newChildrenToAdd = newRows.filter(row => !existingMrids.has(row.mrid));
                        Vue.set(node, "children", [...existingChildren, ...newChildrenToAdd]);
                    } else {
                    Vue.set(node, "children", newRows); // Đảm bảo Vue reactive
                    }
                    // Đánh dấu đã fetch để tránh fetch lại không cần thiết
                    Vue.set(node, "_childrenFetched", true);
                } catch (error) {
                    console.error("Error fetching children:", error);
                    this.$message.error("Có lỗi xảy ra khi tải dữ liệu: " + error.message);
                }
            }
        },

        async fetchAssetByPsr(psrId) {
            try {
                const [responseTransformer, responseSurge, responseBushing, responseVT, responseDisconnector, responsePowerCale, responseRotatingMachine, responseCurrentTransformer, responseCapacitor, responseBreaker , responseReactor] = await Promise.all([
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Transformer'),
                    window.electronAPI.getSurgeArresterByPsrId(psrId),
                    window.electronAPI.getBushingByPsrId(psrId),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Voltage transformer'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Disconnector'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Power cable'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Rotating machine'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Current transformer'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Capacitor'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Circuit breaker'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Reactor')
                ])
                return [responseTransformer, responseSurge, responseBushing, responseVT, responseDisconnector, responsePowerCale, responseRotatingMachine, responseCurrentTransformer, responseCapacitor, responseBreaker, responseReactor];
            } catch (error) {
                console.error("Error fetching asset by substation:", error);
                return {
                    success: false,
                    data: [],
                    message: "Error fetching asset by substation"
                };
            }
        },

        async fetchJobsByAssetId(assetId) {
            try {
                const result = await window.electronAPI.getOldWorkByAssetId(assetId);
                return result;
            } catch (error) {
                console.error("Error fetching jobs by asset ID:", error);
                return {
                    success: false,
                    data: [],
                    message: "Error fetching jobs by asset ID"
                };
            }
        },

        async checkChildren(node) {
            if (!node.children) {
                try {
                    let newRows = [];
                    if (node.mode == 'asset') {
                        if (node.asset && node.asset != 'Surge arrester') {
                            const jobsReturn = await this.fetchJobsByAssetId(node.mode, node.mrid);
                            if (jobsReturn.success) {
                                newRows.push(...jobsReturn.data);
                            }
                        }
                    } else if (node.mode == 'substation') {
                        const clickedRow = node;
                        const [voltageLevelReturn, bayReturn] = await Promise.all([
                            window.electronAPI.getVoltageLevelBySubstationId(clickedRow.mrid),
                            window.electronAPI.getBayByVoltageBySubstationId(null, clickedRow.mrid)
                        ]);
                        const [assetSurgeReturn, assetBushingReturn, assetVtReturn, assetDisconnectorReturn, assetPowerCableReturn, assetRotatingMachineReturn, assetCurrentTransformerReturn, assetCapacitorReturn, assetReactorReturn] = await this.fetchAssetByPsr(clickedRow.mrid);
                        if (assetSurgeReturn.success) {
                            newRows.push(...assetSurgeReturn.data);
                        }

                        if (assetBushingReturn.success) {
                            newRows.push(...assetBushingReturn.data);
                        }

                        if (assetVtReturn.success) {
                            newRows.push(...assetVtReturn.data);
                        }

                        if (assetDisconnectorReturn.success) {
                            newRows.push(...assetDisconnectorReturn.data);
                        }

                        if (assetPowerCableReturn.success) {
                            newRows.push(...assetPowerCableReturn.data);
                        }

                        if (assetRotatingMachineReturn.success) {
                            newRows.push(...assetRotatingMachineReturn.data);
                        }

                        if (assetCurrentTransformerReturn.success) {
                            newRows.push(...assetCurrentTransformerReturn.data);
                        }

                        if (assetCapacitorReturn.success) {
                            newRows.push(...assetCapacitorReturn.data);
                        }
                        if (assetReactorReturn.success) {
                            newRows.push(...assetReactorReturn.data);
                        }

                        if (voltageLevelReturn.success) {
                            newRows.push(...voltageLevelReturn.data);
                        }

                        if (bayReturn.success) {
                            newRows.push(...bayReturn.data);
                        }

                    } else if (node.mode == 'voltageLevel') {
                        const clickedRow = node;
                        const [bayReturn] = await Promise.all([
                            window.electronAPI.getBayByVoltageBySubstationId(clickedRow.mrid, null)
                        ]);

                        if (bayReturn.success) {
                            newRows.push(...bayReturn.data);
                        }

                    } else if (node.mode == 'bay') {
                        const clickedRow = node;
                        const [assetSurgeReturn, assetBushingReturn, assetVtReturn, assetDisconnectorReturn, assetPowerCableReturn, assetRotatingMachineReturn, assetCurrentTransformerReturn, assetCapacitorReturn, assetReactorReturn] = await this.fetchAssetByPsr(clickedRow.mrid);
                        if (assetSurgeReturn.success) {
                            newRows.push(...assetSurgeReturn.data);
                        }
                        if (assetBushingReturn.success) {
                            newRows.push(...assetBushingReturn.data);
                        }
                        if (assetVtReturn.success) {
                            newRows.push(...assetVtReturn.data);
                        }

                        if (assetDisconnectorReturn.success) {
                            newRows.push(...assetVtReturn.data);
                        }

                        if (assetPowerCableReturn.success) {
                            newRows.push(...assetPowerCableReturn.data);
                        }

                        if (assetRotatingMachineReturn.success) {
                            newRows.push(...assetRotatingMachineReturn.data);
                        }

                        if (assetCurrentTransformerReturn.success) {
                            newRows.push(...assetCurrentTransformerReturn.data);
                        }

                        if (assetCapacitorReturn.success) {
                            newRows.push(...assetCapacitorReturn.data);
                        }
                        if(assetReactorReturn.success){
                            newRows.push(...assetReactorReturn.data);
                        }
                    }

                    if (newRows.length > 0) {
                        return {
                            success: false,
                            data: newRows
                        }
                    } else {
                        return {
                            success: false,
                            data: []
                        }
                    }
                } catch (error) {
                    console.error("Error fetching children:", error);
                    return {
                        success: false,
                        message: "Error fetching children data"
                    }
                }
            } else {
                return {
                    success: false,
                    message: "Error fetching children data"
                }
            }
        },

        async fetchChildrenServer(node) {
            if (!node.children) {
                try {
                    let newRows = [];
                    if (node.mode == 'organisation') {
                        const newRowsOwner = await demoAPI.getChildOrganisation(node.id)
                        if (newRowsOwner && newRowsOwner.length > 0) {
                            newRowsOwner.forEach(row => {
                                row.id = row.mrid;
                                row.parentId = node.mrid;
                                row.mode = 'organisation';
                                row.parentName = node.parentName + "/" + node.name;
                                row.parentArr = [...node.parentArr];
                                row.parentArr.push({
                                    id: node.id,
                                    parent: node.name
                                });
                            });
                            newRows.push(...newRowsOwner);
                        }
                        const newRowsSubstation = await demoAPI.getChildSubstation(node.id)
                        if (newRowsSubstation && newRowsSubstation.length > 0) {
                            newRowsSubstation.forEach(row => {
                                row.id = row.mrid;
                                row.parentId = node.mrid;
                                row.mode = 'substation';
                                row.parentName = node.parentName + "/" + node.name;
                                row.parentArr = [...node.parentArr];
                                row.parentArr.push({
                                    id: node.id,
                                    parent: node.name
                                });
                            });
                            newRows.push(...newRowsSubstation);
                        }
                    } else if (node.mode == 'substation') {
                        try {
                            const newRowsBay = await demoAPI.getChildBay(node.id)
                            if (newRowsBay && newRowsBay.length > 0) {
                                newRowsBay.forEach(row => {
                                    row.parentId = node.mrid;
                                    row.mode = 'bay';
                                    row.parentName = node.parentName + "/" + node.name;
                                    row.parentArr = [...node.parentArr];
                                    row.parentArr.push({
                                        id: node.id,
                                        parent: node.name
                                    });
                                });
                                newRows.push(...newRowsBay);
                            }
                        } catch (error) {
                            console.log(error)
                        }
                        try {
                            const newRowsVoltageLevel = await demoAPI.getVoltageLevelBySubstationId(node.id)
                            if (newRowsVoltageLevel && newRowsVoltageLevel.length > 0) {
                                newRowsVoltageLevel.forEach(row => {
                                    row.id = row.mrid;
                                    row.parentId = node.mrid;
                                    row.mode = 'voltageLevel';
                                    row.parentName = node.parentName + "/" + node.name;
                                    row.parentArr = [...node.parentArr];
                                    row.parentArr.push({
                                        id: node.id,
                                        parent: node.name
                                    });
                                });
                                newRows.push(...newRowsVoltageLevel);
                            }
                        } catch (error) {
                            console.log(error)
                        }

                        try {
                            const newRowsVoltageLevel = await demoAPI.getAssetByOwner('Substation')
                            if (newRowsVoltageLevel && newRowsVoltageLevel.length > 0) {
                                newRowsVoltageLevel.forEach(row => {
                                    row.id = row.mrid;
                                    row.parentId = node.mrid;
                                    row.mode = 'asset';
                                    row.parentName = node.parentName + "/" + node.name;
                                    row.parentArr = [...node.parentArr];
                                    row.parentArr.push({
                                        id: node.id,
                                        parent: node.name
                                    });
                                });
                                newRows.push(...newRowsVoltageLevel);
                            }
                        } catch (error) {
                            console.log(error)
                        }



                    } else if (node.mode == 'voltageLevel') {
                        try {
                            const newRowsBay = await demoAPI.getBayByVoltageLevel(node.id)
                            if (newRowsBay && newRowsBay.length > 0) {
                                newRowsBay.forEach(row => {
                                    row.parentId = node.mrid;
                                    row.mode = 'bay';
                                    row.parentName = node.parentName + "/" + node.name;
                                    row.parentArr = [...node.parentArr];
                                    row.parentArr.push({
                                        id: node.id,
                                        parent: node.name
                                    });
                                });
                                newRows.push(...newRowsBay);
                            }
                        } catch (error) {
                            console.log(error)
                        }
                        try {
                            const newRowsVoltageLevel = await demoAPI.getAssetByOwner('VoltageLevel')
                            if (newRowsVoltageLevel && newRowsVoltageLevel.length > 0) {
                                newRowsVoltageLevel.forEach(row => {
                                    row.id = row.mrid;
                                    row.parentId = node.mrid;
                                    row.mode = 'asset';
                                    row.parentName = node.parentName + "/" + node.name;
                                    row.parentArr = [...node.parentArr];
                                    row.parentArr.push({
                                        id: node.id,
                                        parent: node.name
                                    });
                                });
                                newRows.push(...newRowsVoltageLevel);
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    } else if (node.mode == 'bay') {
                        try {
                            const newRowsVoltageLevel = await demoAPI.getAssetByOwner('Bay')
                            if (newRowsVoltageLevel && newRowsVoltageLevel.length > 0) {
                                newRowsVoltageLevel.forEach(row => {
                                    row.id = row.mrid;
                                    row.parentId = node.mrid;
                                    row.mode = 'asset';
                                    row.serial_number = row.serialNumber;
                                    row.parentName = node.parentName + "/" + node.name;
                                    row.parentArr = [...node.parentArr];
                                    row.parentArr.push({
                                        id: node.id,
                                        parent: node.name
                                    });
                                });
                                newRows.push(...newRowsVoltageLevel);
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    }


                    Vue.set(node, "children", newRows);
                } catch (error) {
                    console.error("Lỗi khi lấy dữ liệu:", error);
                }
            }
        },

        async hideProperties() {
            this.propertiesSign = false
            const content = this.$refs.content;
            content.style.width = "100%";
        },

        async hidePropertiesClient() {
            this.propertiesSignClient = false
            const content = this.$refs.contentClient;
            content.style.width = "100%";
        },

        async showProperties() {
            this.propertiesSign = true
            const content = this.$refs.content;
            content.style.width = `calc(75% - 5px)`;
        },

        async showPropertiesClient() {
            this.propertiesSignClient = true
            const content = this.$refs.contentClient;
            content.style.width = `calc(75% - 5px)`;
        },

        serverSwap(serverSign) {
            if (serverSign == true) {
                this.clientSlide = false
            } else {
                this.clientSlide = true
            }
        },

        async showOwnerServerRoot() {
            const ownerRootServer = this.$refs.ownerRootServer;
            if (ownerRootServer) {
                ownerRootServer.style.borderBottom = "2px #aba7a7 solid"; // Thêm viền màu đen dày 2px
                ownerRootServer.style.color = "rgba(0, 0, 0, 1)"; // Chữ rõ nét
            }
            this.$nextTick(async () => {
                await this.getOwnerLocation()
            })
        },

        async showPropertiesData(node) {
            this.assetPropertySign = false
            this.jobPropertySign = false
            if (node.asset != undefined) {
                this.assetPropertySign = true
                await this.mappingAssetProperties(node)
                await this.mappingProperties(node.parent)
                await this.loadPathMap(node)
                this.pathMapServer.push({
                    id: node.id,
                    parent: node.serial_no
                })
            } else if (node.type == 'test') {
                this.assetPropertySign = true
                this.jobPropertySign = true
                await this.mappingProperties(node.parent.parent.parent)
                await this.mappingAssetProperties(node.parent.parent)
                await this.mappingJobProperties(node.parent)
                await this.loadPathMap(node)
                this.pathMapServer.push({
                    id: node.id,
                    parent: node.name
                })
            } else if (node.type == 'job') {
                this.assetPropertySign = true
                this.jobPropertySign = true
                await this.mappingProperties(node.parent.parent)
                await this.mappingAssetProperties(node.parent)
                await this.mappingJobProperties(node)
                await this.loadPathMap(node)
                this.pathMapServer.push({
                    id: node.id,
                    parent: node.name
                })
            } else {
                await this.mappingProperties(node)
                await this.loadPathMap(node)
                this.pathMapServer.push({
                    id: node.id,
                    parent: node.name
                })
            }
        },

        async loadPathMap(node) {
            this.pathMapServer = []
            if (node != undefined) {
                if (node.parentArr != undefined) {
                    this.pathMapServer = [...node.parentArr]
                }
            }
        },

        async mappingProperties(data) {
            if (data != undefined) {
                this.properties.name = data.name == undefined || data.name == null ? '' : data.name
                this.properties.region = data.region == undefined || data.region == null ? '' : data.region
                this.properties.address = data.address == undefined || data.address == null ? '' : data.address
                this.properties.city = data.city == undefined || data.city == null ? '' : data.city
                this.properties.state_province = data.state_province == undefined || data.state_province == null ? '' : data.state_province
                this.properties.postal_code = data.postal_code == undefined || data.postal_code == null ? '' : data.postal_code
                this.properties.country = data.country == undefined || data.country == null ? '' : data.country
                this.properties.phone_no = data.phone_no == undefined || data.phone_no == null ? '' : data.phone_no
                this.properties.email = data.email == undefined || data.email == null ? '' : data.email
            }
        },

        async mappingAssetProperties(data) {
            if (data != undefined) {
                this.assetProperties.asset = data.asset == undefined || data.asset == null ? '' : data.asset
                this.assetProperties.asset_type = data.asset_type == undefined || data.asset_type == null ? '' : data.asset_type
                this.assetProperties.serial_no = data.serial_no == undefined || data.serial_no == null ? '' : data.serial_no
                this.assetProperties.manufacturer = data.manufacturer == undefined || data.manufacturer == null ? '' : data.manufacturer
                this.assetProperties.manufacturer_type = data.manufacturer_type == undefined || data.manufacturer_type == null ? '' : data.manufacturer_type
                this.assetProperties.manufacturing_year = data.manufacturing_year == undefined || data.manufacturing_year == null ? '' : data.manufacturing_year
                this.assetProperties.country = data.country == undefined || data.country == null ? '' : data.country
                this.assetProperties.apparatus_id = data.apparatus_id == undefined || data.apparatus_id == null ? '' : data.apparatus_id
            }
        },

        async mappingJobProperties(data) {
            if (data != undefined) {
                this.jobProperties.name = data.name == undefined || data.name == null ? '' : data.name
                this.jobProperties.work_order = data.work_order == undefined || data.work_order == null ? '' : data.work_order
                this.jobProperties.creation_date = data.creation_date == undefined || data.creation_date == null ? '' : data.creation_date
                this.jobProperties.execution_date = data.execution_date == undefined || data.execution_date == null ? '' : data.execution_date
                this.jobProperties.approved_by = data.approved_by == undefined || data.approved_by == null ? '' : data.approved_by
                this.jobProperties.ambient_condition = data.ambient_condition == undefined || data.ambient_condition == null ? '' : data.ambient_condition
                this.jobProperties.tested_by = data.tested_by == undefined || data.tested_by == null ? '' : data.tested_by
                this.jobProperties.standard = data.standard == undefined || data.standard == null ? '' : data.standard
            }
        },

        async getOwnerLocation() {
            try {
                const res = await demoAPI.getOwnerOrganisation();
                if (res !== null) {
                    this.ownerServerList = [res].map(item => {
                        return {
                            id: item.mrid || '',
                            name: item.name || '',
                            parentName: '',
                            parentArr: [],
                            mode: item.mode || '',
                            parentId: '',
                            mode: 'organisation',
                        }
                    });
                } else {
                    this.ownerServerList = [];
                    this.$message.warning("Không tìm thấy dữ liệu tổ chức chủ sở hữu.");
                }
            } catch (error) {
                this.$message.error("Có lỗi xảy ra khi lấy danh sách tổ chức chủ sở hữu.");
                console.error("getOwnerLocation error:", error);
                this.ownerServerList = [];
            }
        },

        async updateSelection(node) {
            this.selectedNodes = [...this.selectedNodes];
            if (Array.isArray(node)) {
                // Click thường → bỏ hết, chỉ chọn 1 dòng
                this.selectedNodes = [node];
            } else {
                // Ctrl + Click → bật/tắt node cha mà KHÔNG ảnh hưởng con
                // So sánh bằng mrid (vì mrid là unique) để nhất quán với TreeNode.vue
                // Chỉ so sánh khi cả hai node đều có mrid
                const index = this.selectedNodes.findIndex(n => {
                    if (!n || !node) return false;
                    if (!n.mrid || !node.mrid) return false;
                    return n.mrid === node.mrid;
                });
                if (index === -1) {
                    // Chưa có trong selection → thêm vào
                    this.selectedNodes.push(node);
                } else {
                    // Đã có trong selection → xóa khỏi selection
                    this.selectedNodes.splice(index, 1);
                }
            }
        },

        async clearSelection() {
            this.selectedNodes = []
        },

        async openContextMenu(event, node) {
            this.$refs.contextMenu.openContextMenu(event, node);
        },

        async openContextMenuClient(event, node) {
            const menu = this.$refs.contextMenuClient.$el;
            const menuHeight = menu.offsetHeight || 320; // fallback nếu chưa render
            const menuWidth = menu.offsetWidth || 180;
            // Lấy vị trí click
            const clickX = event.clientX;
            const clickY = event.clientY;
            // Lấy kích thước cửa sổ
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;

            // Tính toán vị trí hiển thị
            let top = clickY;
            let left = clickX;

            // Nếu click quá gần mép dưới, hiện menu lên trên
            if (clickY + menuHeight > windowHeight) {
                top = clickY - menuHeight;
                if (top < 0) top = 0;
            }

            // Nếu click quá gần mép phải, hiện menu sang trái
            if (clickX + menuWidth > windowWidth) {
                left = clickX - menuWidth;
                if (left < 0) left = 0;
            }
            this.$refs.contextMenuClient.openContextMenu(event, node, { top, left });
        },

        async showContext(event) {
            this.$refs.contextSubstation.openContextMenuSubstation(event, this.$constant.ROOT);
        },

        async handleSubsCancel() {
            this.signSubs = false
        },

        async handleOrgCancel() {
            this.signOrg = false
        },

        async handleVoltageLevelCancel() {
            this.signVoltageLevel = false
        },

        async handleBayCancel() {
            this.signBay = false
        },

        async handleTransformerCancel() {
            this.signTransformer = false
        },

        handleBushingCancel() {
            this.signBushing = false
        },

        handleSurgeCancel() {
            this.signSurge = false
        },

        handleCircuitCancel() {
            this.signCircuit = false
        },

        handleVtCancel() {
            this.signVt = false
        },

        handleCtCancel() {
            this.signCt = false
        },

        handlePowerCancel() {
            this.signPower = false
        },

        handleDisconnectorCancel() {
            this.signDisconnector = false
        },

        handleRotatingCancel() {
            this.signRotating = false
        },

        handleCapacitorCancel() {
            this.signCapacitor = false
        },

        handleReactorCancel() {
            this.signReactor = false
        },

        handleJobCancel() {
            this.signJob = false
        },

        async handleSubsConfirm() {
            try {
                const subs = this.$refs.substation
                if (subs) {
                    const { success, data } = await subs.saveSubstation()
                    if (success) {
                        this.$message.success("Substation saved successfully")
                        this.signSubs = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.substation.mrid,
                                name: data.substation.name,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'substation',
                            }
                            newRows.push(newRow);
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList);
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : [];
                                Vue.set(node, "children", [...children, ...newRows]);
                            } else {
                                this.$message.error("Parent node not found in tree");
                            }
                        }
                    }
                }
            } catch (error) {
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async handleOrgConfirm() {
            try {
                const org = this.$refs.organisation
                if (org) {
                    const { success, data } = await org.saveOrganisation()
                    if (success) {
                        this.$message.success("Organisation saved successfully")
                        this.signOrg = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.organisation.mrid,
                                name: data.organisation.name,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'organisation',
                            }
                            newRows.push(newRow);
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList);
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : [];
                                Vue.set(node, "children", [...children, ...newRows]);
                            } else {
                                this.$message.error("Parent node not found in tree");
                            }
                        }
                    }
                }
            } catch (error) {
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async handleVoltageLevelConfirm() {
            try {
                const voltageLevel = this.$refs.voltageLevel
                if (voltageLevel) {
                    const { success, data } = await voltageLevel.saveVoltageLevel()
                    if (success) {
                        this.$message.success("Voltage Level saved successfully")
                        this.signVoltageLevel = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.voltageLevel.mrid,
                                name: data.voltageLevel.name,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'voltageLevel',
                            }
                            newRows.push(newRow);
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList);
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : [];
                                Vue.set(node, "children", [...children, ...newRows]);
                            } else {
                                this.$message.error("Parent node not found in tree");
                            }
                        }
                    }
                }
            } catch (error) {
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async handleBayConfirm() {
            try {
                const bay = this.$refs.bay
                if (bay) {
                    const { success, data } = await bay.saveBay()
                    if (success) {
                        this.$message.success("Bay saved successfully")
                        this.signBay = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.mrid,
                                name: data.name,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'bay',
                            }
                            newRows.push(newRow);
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList);
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : [];
                                Vue.set(node, "children", [...children, ...newRows]);
                            } else {
                                this.$message.error("Parent node not found in tree");
                            }
                        }
                    } else {
                        this.$message.error("Failed to save bay")
                    }
                }
            } catch (error) {
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async handleTransformerConfirm() {
            try {
                const transformer = this.$refs.transformer
                if (transformer) {
                    const { success, data } = await transformer.saveAsset()
                    if (success) {
                        this.$message.success("Transformer saved successfully")
                        this.signTransformer = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.asset.mrid,
                                name: data.asset.name,
                                serial_number: data.asset.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Transformer',
                            }
                            newRows.push(newRow);
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList);
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : [];
                                Vue.set(node, "children", [...children, ...newRows]);
                            } else {
                                this.$message.error("Parent node not found in tree");
                            }
                        }
                    } else {
                        this.$message.error("Failed to save transformer")
                    }
                }
            } catch (error) {
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async handleBushingConfirm() {
            try {
                const bushing = this.$refs.bushing
                if (bushing) {
                    const { success, data } = await bushing.saveAsset()
                    if (success) {
                        this.$message.success("Bushing saved successfully")
                        this.signBushing = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.bushing.mrid,
                                name: data.bushing.name,
                                serial_number: data.bushing.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Bushing',
                            }
                            newRows.push(newRow);
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList);
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : [];
                                Vue.set(node, "children", [...children, ...newRows]);
                            } else {
                                this.$message.error("Parent node not found in tree");
                            }
                        }
                    } else {
                        this.$message.error("Failed to save bushing")
                    }
                }
            } catch (error) {
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async handleSurgeConfirm() {
            try {
                const surgeArrester = this.$refs.surgeArrester
                if (surgeArrester) {
                    const { success, data } = await surgeArrester.saveAsset();
                    if (success) {
                        this.$message.success("Surge Arrester saved successfully")
                        this.signSurge = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.surgeArrester.mrid,
                                name: data.surgeArrester.name,
                                serial_number: data.surgeArrester.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Surge arrester',
                            }
                            newRows.push(newRow);
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList);
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : [];
                                Vue.set(node, "children", [...children, ...newRows]);
                            } else {
                                this.$message.error("Parent node not found in tree");
                            }
                        }
                    } else {
                        this.$message.error("Failed to save Surge Arrester")
                    }
                }
            } catch (error) {
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async handleCircuitConfirm() {
            try {
                const breaker = this.$refs.circuitBreaker
                if (breaker) {
                    const { success, data } = await breaker.saveAsset();
                    if (success) {
                        this.$message.success("Circuit breaker saved successfully")
                        this.signCircuit = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.asset.mrid,
                                name: data.asset.name,
                                serial_number: data.asset.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Circuit breaker',
                            }
                            newRows.push(newRow);
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList);
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : [];
                                Vue.set(node, "children", [...children, ...newRows]);
                            } else {
                                this.$message.error("Parent node not found in tree");
                            }
                        }
                    } else {
                        this.$message.error("Failed to save Circuit breaker")
                    }
                }
            } catch (error) {
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async handleCtConfirm() {
            try {
                const currentTransformer = this.$refs.currentTransformer
                if (currentTransformer) {
                    const { success, data } = await currentTransformer.saveAsset();
                    if (success) {
                        this.$message.success("Current transformer saved successfully")
                        this.signCt = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.asset.mrid,
                                name: data.asset.name,
                                serial_number: data.asset.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Current transformer',
                            }
                            newRows.push(newRow);
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList);
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : [];
                                Vue.set(node, "children", [...children, ...newRows]);
                            } else {
                                this.$message.error("Parent node not found in tree");
                            }
                        }
                    } else {
                        this.$message.error("Failed to save Current transformer")
                    }
                }
            } catch (error) {
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async handleVtConfirm() {
            try {
                const voltageTransformer = this.$refs.voltageTransformer
                if (voltageTransformer) {
                    const { success, data } = await voltageTransformer.saveAsset();
                    if (success) {
                        this.$message.success("Voltage transformer saved successfully")
                        this.signVt = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.asset.mrid,
                                name: data.asset.name,
                                serial_number: data.asset.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Voltage transformer',
                            }
                            newRows.push(newRow);
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList);
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : [];
                                Vue.set(node, "children", [...children, ...newRows]);
                            } else {
                                this.$message.error("Parent node not found in tree");
                            }
                        }
                    } else {
                        this.$message.error("Failed to save Voltage transformer")
                    }
                }
            } catch (error) {
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async handlePowerConfirm() {
            try {
                const powerCable = this.$refs.powerCable
                if (powerCable) {
                    const { success, data } = await powerCable.saveAsset();
                    if (success) {
                        this.$message.success("Power cable saved successfully")
                        this.signPower = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.asset.mrid,
                                name: data.asset.name,
                                serial_number: data.asset.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Power cable',
                            }
                            newRows.push(newRow);
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList);
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : [];
                                Vue.set(node, "children", [...children, ...newRows]);
                            } else {
                                this.$message.error("Parent node not found in tree");
                            }
                        }
                    } else {
                        this.$message.error("Failed to save Power Cable")
                    }
                }
            } catch (error) {
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async handleDisconnectorConfirm() {
            try {
                const disconnector = this.$refs.disconnector
                if (disconnector) {
                    const { success, data } = await disconnector.saveAsset();
                    if (success) {
                        this.$message.success("Disconnector saved successfully")
                        this.signDisconnector = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.asset.mrid,
                                name: data.asset.name,
                                serial_number: data.asset.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Disconnector',
                            }
                            newRows.push(newRow);
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList);
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : [];
                                Vue.set(node, "children", [...children, ...newRows]);
                            } else {
                                this.$message.error("Parent node not found in tree");
                            }
                        }
                    } else {
                        this.$message.error("Failed to save Voltage transformer")
                    }
                }
            } catch (error) {
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async handleRotatingConfirm() {
            try {
                const rotatingMachine = this.$refs.rotatingMachine
                if (rotatingMachine) {
                    const { success, data } = await rotatingMachine.saveAsset();
                    if (success) {
                        this.$message.success("Rotating machine saved successfully")
                        this.signRotating = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.asset.mrid,
                                name: data.asset.name,
                                serial_number: data.asset.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Rotating machine',
                            }
                            newRows.push(newRow);
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList);
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : [];
                                Vue.set(node, "children", [...children, ...newRows]);
                            } else {
                                this.$message.error("Parent node not found in tree");
                            }
                        }
                    } else {
                        this.$message.error("Failed to save Rotating machine")
                    }
                }
            } catch (error) {
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async handleCapacitorConfirm() {
            try {
                const capacitor = this.$refs.capacitor
                if (capacitor) {
                    const { success, data } = await capacitor.saveAsset();
                    if (success) {
                        this.$message.success("Capacitor saved successfully")
                        this.signCapacitor = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.asset.mrid,
                                name: data.asset.name,
                                serial_number: data.asset.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Capacitor',
                            }
                            newRows.push(newRow);
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList);
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : [];
                                Vue.set(node, "children", [...children, ...newRows]);
                            } else {
                                this.$message.error("Parent node not found in tree");
                            }
                        }
                    } else {
                        this.$message.error("Failed to save Capacitor")
                    }
                }
            } catch (error) {
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async handleReactorConfirm() {
           try {
                const reactor = this.$refs.reactor
                if (reactor) {
                    const { success, data } = await reactor.saveAsset();
                    if (success) {
                        this.$message.success("Reactor saved successfully")
                        this.signReactor = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.asset.mrid,
                                name: data.asset.name,
                                serial_number: data.asset.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Reactor',
                            }
                            newRows.push(newRow);
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList);
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : [];
                                Vue.set(node, "children", [...children, ...newRows]);
                            } else {
                                this.$message.error("Parent node not found in tree");
                            }
                        }
                    } else {
                        this.$message.error("Failed to save Capacitor")
                    }
                }
            } catch (error) {
                this.$message.error("Some error occur")
                console.error(error)
            }
        },
        generateUuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
        async handleJobConfirm() {
            try {
                const job = this.$refs.jobData
                if (job) {
                    const { success, data } = await job.saveJob();
                    if (success) {
                        this.$message.success("Job saved successfully")
                        this.signJob = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            let jobType = '';
                            // Xác định loại job, ví dụ dựa vào checkJobType hoặc assetData
                            if (this.checkJobType === 'JobSurgeArrester') {
                                jobType = 'Surge arrester';
                            } else if (this.checkJobType === 'JobPowerCable') {
                                jobType = 'Power cable';
                            } else if (this.checkJobType === 'JobDisconnector') {
                                jobType = 'Disconnector';
                            } else if (this.checkJobType === 'JobCurrentTransformer') {
                                jobType = 'Current transformer';
                            }
                            else if (this.checkJobType === 'JobVoltageTransformer') {
                                jobType = 'Voltage transformer';
                            }
                            else if (this.checkJobType === 'JobCircuitBreaker') {
                                jobType = 'Circuit breaker';
                            }
                            else if (this.checkJobType === 'JobTransformer') {
                                jobType = 'Transformer';
                            }
                            const newRow = {
                                mrid: data.oldWork.mrid,
                                name: data.oldWork.name,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'job',
                                job: jobType,
                            }
                            newRows.push(newRow);
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList);
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : [];
                                Vue.set(node, "children", [...children, ...newRows]);
                            } else {
                                this.$message.error("Parent node not found in tree");
                            }
                        }
                    } else {
                        this.$message.error("Failed to save Job")
                    }
                }
            } catch (error) {
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async showData(node) {
            try {
                // Tạo bản sao của node để đảm bảo reactivity
                const newNode = { ...node };
                // Sử dụng mrid hoặc id để check tab đã tồn tại
                const nodeKey = newNode.mrid || newNode.id;
                const existingTab = this.tabs.find(item => (item.mrid || item.id) === nodeKey);

                if (existingTab) {
                    // Nếu tab đã tồn tại, active nó
                    this.activeTab = existingTab;
                    const index = this.tabs.findIndex(item => (item.mrid || item.id) === nodeKey);
                    this.$refs.serverTabs.selectTab(this.activeTab, index);
                } else {
                    const newTabs = [...this.tabs]; // Tạo mảng mới
                    let insertIndex;
                    if (this.activeTab?.mrid || this.activeTab?.id) {
                        const activeKey = this.activeTab.mrid || this.activeTab.id;
                        const index = newTabs.findIndex(item => (item.mrid || item.id) === activeKey);
                        insertIndex = index + 1;
                        newTabs.splice(insertIndex, 0, newNode);
                    } else {
                        insertIndex = newTabs.length;
                        newTabs.push(newNode);
                    }
                    // Gán lại để trigger reactivity
                    this.tabs = newTabs;
                    this.activeTab = newNode;
                    this.$nextTick(() => {
                        if (this.$refs.serverTabs) {
                            this.$refs.serverTabs.selectTab(this.activeTab, insertIndex);
                            this.$refs.serverTabs.loadData(newNode, insertIndex);
                        }
                    });
                }
            } catch (error) {
                this.$message.error("Some error occur when loading data");
                console.error(error);
            }
        },

        async showDataClient(node) {
            try {
                // Tạo bản sao của node để đảm bảo reactivity
                const newNode = { ...node };
                const index = this.tabsClient.findIndex(item => item.mrid === newNode.mrid);
                if (index !== -1) {
                    // Nếu tab đã tồn tại, active nó
                    this.activeTabClient = newNode;
                    this.$refs.clientTabs.selectTab(this.activeTabClient, index);
                } else {
                    const newTabs = [...this.tabsClient]; // Tạo mảng mới
                    if (this.activeTabClient?.mrid) {
                        const index = newTabs.findIndex(item => item.mrid === this.activeTabClient.mrid);
                        newTabs.splice(index + 1, 0, newNode);
                    } else {
                        newTabs.push(newNode);
                    }
                    // Gán lại để trigger reactivity
                    this.tabsClient = newTabs;
                    this.activeTabClient = newNode;
                    this.$refs.clientTabs.selectTab(this.activeTabClient, newTabs.length - 1);
                    this.$refs.clientTabs.loadData(newNode, newTabs.length - 1);
                }
            } catch (error) {
                this.$message.error("Some error occur when loading data")
                console.error(error)
            }
        },

        async deleteDataClient(node) {
            if (node.children && node.children.length > 0) {
                this.$message.error("Node has children, cannot delete");
                return;
            } else {
                const checkDelete = await this.checkChildren(node)
                if (checkDelete.success) {
                    this.$message.error("Node has children, cannot delete");
                    return;
                } else {
                    try {
                        if (node.mode == 'substation') {

                            const entity = await window.electronAPI.getSubstationEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                            if (!entity.success) {
                                this.$message.error("Entity not found");
                                return;
                            }
                            const deleteSign = await window.electronAPI.deleteSubstationEntityByMrid(entity.data);
                            if (!deleteSign.success) {
                                this.$message.error("Delete data failed");
                                return;
                            }

                            // ✅ Xóa node khỏi cây organisationClientList
                            const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                            if (parentNode && Array.isArray(parentNode.children)) {
                                const index = parentNode.children.findIndex(child => child.mrid === node.mrid);
                                if (index !== -1) {
                                    parentNode.children.splice(index, 1); // Xóa khỏi mảng children
                                    this.$message.success("Delete data successfully");
                                } else {
                                    this.$message.warning("Node not found in tree structure");
                                }
                            } else {
                                this.$message.warning("Parent node not found in tree");
                            }
                        } else if (node.mode == 'organisation') {
                            const entity = await window.electronAPI.getOrganisationEntityByMrid(node.mrid)
                            if (!entity.success) {
                                this.$message.error("Entity not found");
                                return;
                            }
                            const deleteSign = await window.electronAPI.deleteParentOrganizationEntity(entity.data);
                            if (!deleteSign.success) {
                                this.$message.error("Delete data failed");
                                return;
                            }

                            // ✅ Xóa node khỏi cây organisationClientList
                            const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                            if (parentNode && Array.isArray(parentNode.children)) {
                                const index = parentNode.children.findIndex(child => child.mrid === node.mrid);
                                if (index !== -1) {
                                    parentNode.children.splice(index, 1); // Xóa khỏi mảng children
                                    this.$message.success("Delete data successfully");
                                } else {
                                    this.$message.warning("Node not found in tree structure");
                                }
                            } else {
                                this.$message.warning("Parent node not found in tree");
                            }
                        } else if (node.mode == 'voltageLevel') {
                            const entity = await window.electronAPI.getVoltageLevelEntityByMrid(node.mrid)
                            if (!entity.success) {
                                this.$message.error("Entity not found");
                                return;
                            }
                            const deleteSign = await window.electronAPI.deleteVoltageLevelEntityByMrid(entity.data);
                            if (!deleteSign.success) {
                                this.$message.error("Delete data failed");
                                return;
                            }

                            // ✅ Xóa node khỏi cây organisationClientList
                            const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                            if (parentNode && Array.isArray(parentNode.children)) {
                                const index = parentNode.children.findIndex(child => child.mrid === node.mrid);
                                if (index !== -1) {
                                    parentNode.children.splice(index, 1); // Xóa khỏi mảng children
                                    this.$message.success("Delete data successfully");
                                } else {
                                    this.$message.warning("Node not found in tree structure");
                                }
                            } else {
                                this.$message.warning("Parent node not found in tree");
                            }
                        } else if (node.mode == 'bay') {
                            const entity = await window.electronAPI.getBayEntityByMrid(node.mrid)
                            if (!entity.success) {
                                this.$message.error("Entity not found");
                                return;
                            }
                            const deleteSign = await window.electronAPI.deleteBayEntityByMrid(entity.data);
                            if (!deleteSign.success) {
                                this.$message.error("Delete data failed");
                                return;
                            }

                            // ✅ Xóa node khỏi cây organisationClientList
                            const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                            if (parentNode && Array.isArray(parentNode.children)) {
                                const index = parentNode.children.findIndex(child => child.mrid === node.mrid);
                                if (index !== -1) {
                                    parentNode.children.splice(index, 1); // Xóa khỏi mảng children
                                    this.$message.success("Delete data successfully");
                                } else {
                                    this.$message.warning("Node not found in tree structure");
                                }
                            } else {
                                this.$message.warning("Parent node not found in tree");
                            }
                        } else if (node.mode == 'asset') {
                            if (node.asset === 'Surge arrester') {
                                const entity = await window.electronAPI.getSurgeArresterEntityByMrid(node.mrid);
                                if (!entity.success) {
                                    this.$message.error("Entity not found");
                                    return;
                                }
                                const deleteSign = await window.electronAPI.deleteSurgeArresterEntity(entity.data);
                                if (!deleteSign.success) {
                                    this.$message.error("Delete data failed");
                                    return;
                                }
                                // ✅ Xóa node khỏi cây organisationClientList
                                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                                if (parentNode && Array.isArray(parentNode.children)) {
                                    const index = parentNode.children.findIndex(child => child.mrid === node.mrid);
                                    if (index !== -1) {
                                        parentNode.children.splice(index, 1); // Xóa khỏi mảng children
                                        this.$message.success("Delete data successfully");
                                    } else {
                                        this.$message.warning("Node not found in tree structure");
                                    }
                                } else {
                                    this.$message.warning("Parent node not found in tree");
                                }
                            } else if (node.asset === 'Power cable') {
                                const entity = await window.electronAPI.getPowerCableEntityByMrid(node.mrid, node.parentId);
                                if (!entity.success) {
                                    this.$message.error("Entity not found");
                                    return;
                                }
                                const deleteSign = await window.electronAPI.deletePowerCableEntity(entity.data);
                                if (!deleteSign.success) {
                                    this.$message.error("Delete data failed: " + (deleteSign.message || 'Unknown error'));
                                    return;
                                }
                                // ✅ Xóa node khỏi cây organisationClientList
                                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                                if (parentNode && Array.isArray(parentNode.children)) {
                                    const index = parentNode.children.findIndex(child => child.mrid === node.mrid);
                                    if (index !== -1) {
                                        parentNode.children.splice(index, 1); // Xóa khỏi mảng children
                                        this.$message.success("Delete data successfully");
                                    } else {
                                        this.$message.warning("Node not found in tree structure");
                                    }
                                } else {
                                    this.$message.warning("Parent node not found in tree");
                                }
                            } else if (node.asset === 'Disconnector') {
                                const entity = await window.electronAPI.getDisconnectorEntityByMrid(node.mrid, node.parentId);
                                if (!entity.success) {
                                    this.$message.error("Entity not found");
                                    return;
                                }
                                const deleteSign = await window.electronAPI.deleteDisconnectorEntity(entity.data);
                                if (!deleteSign.success) {
                                    this.$message.error("Delete data failed: " + (deleteSign.message || 'Unknown error'));
                                    return;
                                }
                                // ✅ Xóa node khỏi cây organisationClientList
                                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                                if (parentNode && Array.isArray(parentNode.children)) {
                                    const index = parentNode.children.findIndex(child => child.mrid === node.mrid);
                                    if (index !== -1) {
                                        parentNode.children.splice(index, 1); // Xóa khỏi mảng children
                                        this.$message.success("Delete data successfully");
                                    } else {
                                        this.$message.warning("Node not found in tree structure");
                                    }
                                } else {
                                    this.$message.warning("Parent node not found in tree");
                                }
                            } else if (node.asset === 'Rotating machine') {
                                const entity = await window.electronAPI.getRotatingMachineEntityByMrid(node.mrid, node.parentId);
                                if (!entity.success) {
                                    this.$message.error("Entity not found");
                                    return;
                                }
                                const deleteSign = await window.electronAPI.deleteRotatingMachineEntity(entity.data);
                                if (!deleteSign.success) {
                                    this.$message.error("Delete data failed: " + (deleteSign.message || 'Unknown error'));
                                    return;
                                }
                                // ✅ Xóa node khỏi cây organisationClientList
                                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                                if (parentNode && Array.isArray(parentNode.children)) {
                                    const index = parentNode.children.findIndex(child => child.mrid === node.mrid);
                                    if (index !== -1) {
                                        parentNode.children.splice(index, 1); // Xóa khỏi mảng children
                                        this.$message.success("Delete data successfully");
                                    } else {
                                        this.$message.warning("Node not found in tree structure");
                                    }
                                } else {
                                    this.$message.warning("Parent node not found in tree");
                                }
                            } else if (node.asset === 'Capacitor') {
                                const entity = await window.electronAPI.getCapacitorEntityByMrid(node.mrid, node.parentId);
                                if (!entity.success) {
                                    this.$message.error("Entity not found");
                                    return;
                                }
                                const deleteSign = await window.electronAPI.deleteCapacitorEntity(entity.data);
                                if (!deleteSign.success) {
                                    this.$message.error("Delete data failed: " + (deleteSign.message || 'Unknown error'));
                                    return;
                                }
                                // ✅ Xóa node khỏi cây organisationClientList
                                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                                if (parentNode && Array.isArray(parentNode.children)) {
                                    const index = parentNode.children.findIndex(child => child.mrid === node.mrid);
                                    if (index !== -1) {
                                        parentNode.children.splice(index, 1); // Xóa khỏi mảng children
                                        this.$message.success("Delete data successfully");
                                    } else {
                                        this.$message.warning("Node not found in tree structure");
                                    }
                                } else {
                                    this.$message.warning("Parent node not found in tree");
                                }
                            }else if (node.asset === 'Reactor') {
                                const entity = await window.electronAPI.getReactorEntityByMrid(node.mrid, node.parentId);
                                if (!entity.success) {
                                    this.$message.error("Entity not found");
                                    return;
                                }
                                const deleteSign = await window.electronAPI.deleteReactorEntity(entity.data);
                                if (!deleteSign.success) {
                                    this.$message.error("Delete data failed: " + (deleteSign.message || 'Unknown error'));
                                    return;
                                }
                                // ✅ Xóa node khỏi cây organisationClientList
                                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                                if (parentNode && Array.isArray(parentNode.children)) {
                                    const index = parentNode.children.findIndex(child => child.mrid === node.mrid);
                                    if (index !== -1) {
                                        parentNode.children.splice(index, 1); // Xóa khỏi mảng children
                                        this.$message.success("Delete data successfully");
                                    } else {
                                        this.$message.warning("Node not found in tree structure");
                                    }
                                } else {
                                    this.$message.warning("Parent node not found in tree");
                                }
                            } else if (node.asset === 'Voltage transformer') {
                                const entity = await window.electronAPI.getVoltageTransformerEntityByMrid(node.mrid, node.parentId);
                                if (!entity.success) {
                                    this.$message.error("Entity not found");
                                    return;
                                }
                                const deleteSign = await window.electronAPI.deleteVoltageTransformerEntity(entity.data);
                                if (!deleteSign.success) {
                                    this.$message.error("Delete data failed: " + (deleteSign.message || 'Unknown error'));
                                    return;
                                }
                                // ✅ Xóa node khỏi cây organisationClientList
                                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                                if (parentNode && Array.isArray(parentNode.children)) {
                                    const index = parentNode.children.findIndex(child => child.mrid === node.mrid);
                                    if (index !== -1) {
                                        parentNode.children.splice(index, 1); // Xóa khỏi mảng children
                                        this.$message.success("Delete data successfully");
                                    } else {
                                        this.$message.warning("Node not found in tree structure");
                                    }
                                } else {
                                    this.$message.warning("Parent node not found in tree");
                                }
                            } else if (node.asset === 'Current transformer') {
                                const entity = await window.electronAPI.getCurrentTransformerEntityByMrid(node.mrid, node.parentId);
                                if (!entity.success) {
                                    this.$message.error("Entity not found");
                                    return;
                                }
                                const deleteSign = await window.electronAPI.deleteCurrentTransformerEntity(entity.data);
                                if (!deleteSign.success) {
                                    this.$message.error("Delete data failed: " + (deleteSign.message || 'Unknown error'));
                                    return;
                                }
                                // ✅ Xóa node khỏi cây organisationClientList
                                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                                if (parentNode && Array.isArray(parentNode.children)) {
                                    const index = parentNode.children.findIndex(child => child.mrid === node.mrid);
                                    if (index !== -1) {
                                        parentNode.children.splice(index, 1); // Xóa khỏi mảng children
                                        this.$message.success("Delete data successfully");
                                    } else {
                                        this.$message.warning("Node not found in tree structure");
                                    }
                                } else {
                                    this.$message.warning("Parent node not found in tree");
                                }
                            } else if (node.asset === 'Circuit breaker') {
                                const entity = await window.electronAPI.getBreakerEntityByMrid(node.mrid, node.parentId);
                                if (!entity.success) {
                                    this.$message.error("Entity not found");
                                    return;
                                }
                                const deleteSign = await window.electronAPI.deleteBreakerEntity(entity.data);
                                if (!deleteSign.success) {
                                    this.$message.error("Delete data failed: " + (deleteSign.message || 'Unknown error'));
                                    return;
                                }
                                // ✅ Xóa node khỏi cây organisationClientList
                                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                                if (parentNode && Array.isArray(parentNode.children)) {
                                    const index = parentNode.children.findIndex(child => child.mrid === node.mrid);
                                    if (index !== -1) {
                                        parentNode.children.splice(index, 1); // Xóa khỏi mảng children
                                        this.$message.success("Delete data successfully");
                                    } else {
                                        this.$message.warning("Node not found in tree structure");
                                    }
                                } else {
                                    this.$message.warning("Parent node not found in tree");
                                }
                            } else if (node.asset === 'Transformer') {
                                const entity = await window.electronAPI.getTransformerEntityByMrid(node.mrid, node.parentId);
                                if (!entity.success) {
                                    this.$message.error("Entity not found");
                                    return;
                                }
                                const deleteSign = await window.electronAPI.deleteTransformerEntity(entity.data);
                                if (!deleteSign.success) {
                                    this.$message.error("Delete data failed: " + (deleteSign.message || 'Unknown error'));
                                    return;
                                }
                                // ✅ Xóa node khỏi cây organisationClientList
                                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                                if (parentNode && Array.isArray(parentNode.children)) {
                                    const index = parentNode.children.findIndex(child => child.mrid === node.mrid);
                                    if (index !== -1) {
                                        parentNode.children.splice(index, 1); // Xóa khỏi mảng children
                                        this.$message.success("Delete data successfully");
                                    } else {
                                        this.$message.warning("Node not found in tree structure");
                                    }
                                } else {
                                    this.$message.warning("Parent node not found in tree");
                                }
                            }
                        }
                    } catch (error) {
                        this.$message.error("Some error occur when deleting data");
                        console.error(error);
                    }
                }
            }
        },

        async showAddSubs(organisationId) {
            try {
                const [dataLocation, dataPerson, parentOrganization] = await Promise.all([
                    window.electronAPI.getLocationByOrganisationId(organisationId),
                    window.electronAPI.getPersonByOrganisationId(organisationId),
                    window.electronAPI.getParentOrganizationByMrid(organisationId)
                ]);
                if (dataLocation.success) {
                    this.locationList = dataLocation.data
                } else {
                    this.locationList = []
                }

                if (dataPerson.success) {
                    this.personList = dataPerson.data
                } else {
                    this.personList = []
                }

                if (parentOrganization.success) {
                    this.parentOrganization = parentOrganization.data
                } else {
                    this.parentOrganization = null
                }

                this.organisationId = organisationId
                this.signSubs = true
                this.$nextTick(() => {
                    const substation = this.$refs.substation;
                    if (substation) {
                        substation.resetForm();
                    }
                });
            } catch (error) {
                this.parentOrganization = null
                this.$message.error("Some error occur")
                console.error(error)
            }

        },

        async showAddSubsInTree(node) {
            try {
                this.parentOrganization = node
                const [dataLocation, dataPerson] = await Promise.all([
                    window.electronAPI.getLocationByOrganisationId(node.mrid),
                    window.electronAPI.getPersonByOrganisationId(node.mrid),
                ]);
                if (dataLocation.success) {
                    this.locationList = dataLocation.data
                } else {
                    this.locationList = []
                }

                if (dataPerson.success) {
                    this.personList = dataPerson.data
                } else {
                    this.personList = []
                }
                this.organisationId = node.mrid
                this.signSubs = true
                this.$nextTick(() => {
                    const substation = this.$refs.substation;
                    if (substation) {
                        substation.resetForm();
                    }
                });
            } catch (error) {
                this.parentOrganization = null
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async showAddOrganisation(node) {
            try {
                this.parentOrganization = node
                this.signOrg = true
                this.$nextTick(() => {
                    const organisation = this.$refs.organisation;
                    if (organisation) {
                        organisation.resetForm();
                    }
                });
            } catch (error) {
                this.parentOrganization = null
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async showAddVoltageLevel(node) {
            try {
                const dataLocation = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid);
                if (dataLocation.success) {
                    this.locationId = dataLocation.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signVoltageLevel = true
                this.$nextTick(() => {
                    const voltageLevel = this.$refs.voltageLevel;
                    if (voltageLevel) {
                        voltageLevel.resetForm();
                    }
                });
            } catch (error) {
                this.parentOrganization = null
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async showAddBay(node) {
            try {
                const dataLocation = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid);
                if (dataLocation.success) {
                    this.locationId = dataLocation.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signBay = true
                this.$nextTick(() => {
                    const bay = this.$refs.bay;
                    if (bay) {
                        bay.resetForm();
                    }
                });
            } catch (error) {
                this.parentOrganization = null
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async showAddTransformer(node) {
            try {
                this.locationId = null;
                let psrId = null;
                if (node.parentArr && node.parentArr.length >= 2) {
                    psrId = node.parentArr[1].mrid;
                } else {
                    psrId = node.mrid;
                }
                const dataLoction = await window.electronAPI.getLocationByPowerSystemResourceMrid(psrId);
                if (dataLoction.success) {
                    this.locationId = dataLoction.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signTransformer = true
                this.$nextTick(() => {
                    const transformer = this.$refs.transformer;
                    if (transformer) {
                        transformer.resetForm();
                    }
                });
            } catch (error) {
                this.parentOrganization = null
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async showAddBushing(node) {
            try {
                const dataLocation = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid);
                if (dataLocation.success) {
                    this.locationId = dataLocation.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signBushing = true
                this.$nextTick(() => {
                    const bushing = this.$refs.bushing;
                    if (bushing) {
                        bushing.resetForm();
                    }
                });
            } catch (error) {
                this.parentOrganization = null
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async showAddSurgeArrester(node) {
            try {
                const dataLocation = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid);
                if (dataLocation.success) {
                    this.locationId = dataLocation.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signSurge = true
                this.$nextTick(() => {
                    const surgeArrester = this.$refs.surgeArrester;
                    if (surgeArrester) {
                        surgeArrester.resetForm();
                    }
                });
            } catch (error) {
                this.parentOrganization = null
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async showAddCapacitor(node) {
            try {
                const dataLocation = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid);
                if (dataLocation.success) {
                    this.locationId = dataLocation.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signCapacitor = true
                this.$nextTick(() => {
                    const capacitor = this.$refs.capacitor;
                    if (capacitor) {
                        capacitor.resetForm();
                    }
                });
            } catch (error) {
                this.parentOrganization = null
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async showAddReactor(node) {
            try {
                const dataLocation = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid);
                if (dataLocation.success) {
                    this.locationId = dataLocation.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signReactor = true
                this.$nextTick(() => {
                    const reactor = this.$refs.reactor;
                    if (reactor) {
                        reactor.resetForm();
                    }
                });
            } catch (error) {
                this.parentOrganization = null
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async showAddCt(node) {
            try {
                const dataLocation = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid);
                if (dataLocation.success) {
                    this.locationId = dataLocation.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signCt = true
                this.$nextTick(() => {
                    const currentTransformer = this.$refs.currentTransformer;
                    if (currentTransformer) {
                        currentTransformer.resetForm();
                    }
                });
            } catch (error) {
                this.parentOrganization = null
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async showAddVt(node) {
            try {
                const dataLocation = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid);
                if (dataLocation.success) {
                    this.locationId = dataLocation.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signVt = true
                this.$nextTick(() => {
                    const voltageTransformer = this.$refs.voltageTransformer;
                    if (voltageTransformer) {
                        voltageTransformer.resetForm();
                    }
                });
            } catch (error) {
                this.parentOrganization = null
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async showAddPowerCable(node) {
            try {
                const dataLocation = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid);
                if (dataLocation.success) {
                    this.locationId = dataLocation.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signPower = true
                this.$nextTick(() => {
                    const powerCable = this.$refs.powerCable;
                    if (powerCable) {
                        powerCable.resetForm();
                    }
                });
            } catch (error) {
                this.parentOrganization = null
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async showAddRotatingMachine(node) {
            try {
                const dataLocation = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid);
                if (dataLocation.success) {
                    this.locationId = dataLocation.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signRotating = true
                this.$nextTick(() => {
                    const rotatingMachine = this.$refs.rotatingMachine;
                    if (rotatingMachine) {
                        rotatingMachine.resetForm();
                    }
                });
            } catch (error) {
                this.parentOrganization = null
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async showAddDisconnector(node) {
            try {
                const dataLocation = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid);
                if (dataLocation.success) {
                    this.locationId = dataLocation.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signDisconnector = true
                this.$nextTick(() => {
                    const disconnector = this.$refs.disconnector;
                    if (disconnector) {
                        disconnector.resetForm();
                    }
                });
            } catch (error) {
                this.parentOrganization = null
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async showAddCircuitBreaker(node) {
            try {
                const dataLocation = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid);
                if (dataLocation.success) {
                    this.locationId = dataLocation.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signCircuit = true
                this.$nextTick(() => {
                    const circuitBreaker = this.$refs.circuitBreaker;
                    if (circuitBreaker) {
                        circuitBreaker.resetForm();
                    }
                });
            } catch (error) {
                this.parentOrganization = null
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async showAddJob(node) {
            try {
                const dataAsset = await window.electronAPI.getAssetByMrid(node.mrid);
                if (dataAsset.success) {
                    this.assetData = dataAsset.data
                    const [dataLocation, dataProductAssetModel] = await Promise.all([
                        window.electronAPI.getLocationDetailByMrid(dataAsset.data.location),
                        window.electronAPI.getProductAssetModelByMrid(dataAsset.data.product_asset_model)
                    ]);
                    if (dataLocation.success) {
                        this.locationData = dataLocation.data
                    } else {
                        this.locationData = {}
                    }

                    if (dataProductAssetModel.success) {
                        this.productAssetModelData = dataProductAssetModel.data
                    } else {
                        this.productAssetModelData = {}
                    }
                } else {
                    this.$message.error("Asset not found")
                }

                this.parentOrganization = node

                if (node.asset == 'Surge arrester') {
                    const dataTestType = await window.electronAPI.getAllTestTypeSurgeArrester();
                    const dataSurgeArrester = await window.electronAPI.getSurgeArresterByMrid(node.mrid);
                    if (dataSurgeArrester.success) {
                        this.assetData = dataSurgeArrester.data
                    } else {
                        this.assetData = {}
                    }
                    if (dataTestType.success) {
                        this.testTypeListData = dataTestType.data
                    } else {
                        this.testTypeListData = []
                    }
                    this.checkJobType = 'JobSurgeArrester'
                    this.signJob = true;
                }
                else if (node.asset == 'Power cable') {
                    const dataTestType = await window.electronAPI.getAllTestTypePowerCable();
                    if (dataTestType.success) {
                        this.testTypeListData = dataTestType.data
                    } else {
                        this.testTypeListData = []
                    }
                    this.checkJobType = 'JobPowerCable'
                    this.signJob = true;
                }
                else if (node.asset == 'Disconnector') {
                    const dataTestType = await window.electronAPI.getAllTestTypeDisconnector();
                    if (dataTestType.success) {
                        this.testTypeListData = dataTestType.data
                    } else {
                        this.testTypeListData = []
                    }
                    this.checkJobType = 'JobDisconnector'
                    this.signJob = true;
                }
                else if (node.asset == 'Current transformer') {
                    const dataTestType = await window.electronAPI.getAllTestTypeCT();
                    if (dataTestType.success) {
                        this.testTypeListData = dataTestType.data
                    } else {
                        this.testTypeListData = []
                    }
                    this.checkJobType = 'JobCurrentTransformer'
                    this.signJob = true;
                }
                else if (node.asset == 'Voltage transformer') {
                    const dataTestType = await window.electronAPI.getAllTestTypeVT();
                    if (dataTestType.success) {
                        this.testTypeListData = dataTestType.data
                    } else {
                        this.testTypeListData = []
                    }
                    this.checkJobType = 'JobVoltageTransformer'
                    this.signJob = true;
                }
                else if (node.asset == 'Circuit breaker') {
                    const dataTestType = await window.electronAPI.getAllTestTypeCircuitBreaker();
                    const dataBreakerEntity = await window.electronAPI.getBreakerEntityByMrid(node.mrid);
                    const dto = BreakerMapping.mapEntityToDto(dataBreakerEntity.data);
                    console.log("dto", dto)
                    if (dataBreakerEntity.success) {
                        this.assetData = dto
                    } else {
                        this.assetData = {}
                    }
                    if (dataTestType.success) {
                        this.testTypeListData = dataTestType.data
                    } else {
                        this.testTypeListData = []
                    }
                    this.checkJobType = 'JobCircuitBreaker'
                    this.signJob = true;
                }
                else if (node.asset == 'Transformer') {
                    const dataTestType = await window.electronAPI.getAllTestTypeTransformers();
                    const dataTransformerEntity = await window.electronAPI.getTransformerEntityByMrid(node.mrid);
                    console.log("dataTransformerEntity", dataTransformerEntity)
                    const dto = TransformerMapping.transformerEntityToDto(dataTransformerEntity.data);
                    console.log("dto", dto)
                    if (dataTransformerEntity.success) {
                        this.assetData = dto
                    } else {
                        this.assetData = {}
                    }
                    if (dataTestType.success) {
                        this.testTypeListData = dataTestType.data
                    } else {
                        this.testTypeListData = []
                    }
                    this.checkJobType = 'JobTransformer'
                    this.signJob = true;
                } else {
                    this.$message.error("This asset type not support for job")
                }
            } catch (error) {
                this.parentOrganization = null
                this.$message.error("Some error occur")
                console.error(error)
            }
        },

        async handleOpenNode() {
    if (!this.selectedNodes || this.selectedNodes.length === 0) {
        this.$message.warning("Please select a node first");
        return;
    }

    try {
        // Mở tất cả các node được chọn
        for (const node of this.selectedNodes) {
            // Nếu là client side, mở tab client
            if (this.clientSlide) {
                await this.showDataClient(node);
            } else {
                // Nếu là server side, mở tab server
                await this.showData(node);
                await this.showPropertiesData(node);
            }
        }
    } catch (error) {
        this.$message.error("Error opening node");
        console.error(error);
    }
},

async handleDeleteNode() {
    if (!this.selectedNodes || this.selectedNodes.length === 0) {
        this.$message.warning("Please select a node first");
        return;
    }

    const node = this.selectedNodes[this.selectedNodes.length - 1];
    
    // Lấy tên node - kiểm tra nhiều field khả năng
    let nodeName = node.serial_no || node.serial_number;
    if (!nodeName || nodeName.toString().trim() === '') {
        nodeName = node.name;
    }
    nodeName = nodeName || 'Unknown';
    // Confirm before delete
    this.$confirm(`Delete "${nodeName}"?`, 'Warning', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning'
    }).then(async () => {
        try {
            if (this.clientSlide) {
                // Delete from client side
                await this.deleteDataClient(node);
            } else {
                // Delete from server side - cần implement tương tự
                this.$message.info("Delete from server side not yet implemented");
            }
            // Clear selection sau khi xóa
            this.selectedNodes = [];
        } catch (error) {
            this.$message.error("Error deleting node: " + error.message);
            console.error(error);
        }
    }).catch(() => {
    });
},

        async resetAllServer() {
            this.selectedNodes = [],
                this.assetPropertySign = false
            this.jobPropertySign = false
            this.pathMapServer = []
            this.properties = {
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
            }
            this.assetProperties = {
                asset: '',
                asset_type: '',
                serial_no: '',
                manufacturer: '',
                manufacturer_type: '',
                manufacturing_year: '',
                apparatus_id: '',
                country: '',
            }
            this.jobProperties = {
                name: '',
                work_order: '',
                creation_date: '',
                execution_date: '',
                tested_by: '',
                approved_by: '',
                ambient_condition: '',
                standard: ''
            }
            this.pageLocationSync = {
                first: 1,
                second: 2,
                third: 3,
                dot: "...",
                end: 10,
            }
            this.displayPageLocationSync = {
                second: true,
                third: true,
                dot: true,
                end: true
            }
            this.pageLocationSyncInstance = {
                first: "",
                second: "",
                third: "",
                dot: "",
                end: "",
            }
            this.currentLocationSync = {
                nextP: '',
                previousP: '',
                current: 1,
            }
            this.optionLocationSync = {
                mode: ''
            }
            this.ownerServerList = []
            this.count = ''
        },

        async resetPathServer(index) {
            if (index == 0) {
                let currentNode = this.ownerServerList.find(node => node.id === this.pathMapServer[0].id);
                if (!currentNode) {
                    return; // Không tìm thấy node đầu tiên
                }
                await this.clearSelection()
                await this.showPropertiesData(currentNode)
                Vue.set(currentNode, "expanded", !currentNode.expanded);
            } else {
                let currentNode = this.ownerServerList.find(node => node.id === this.pathMapServer[0].id);
                if (!currentNode) {
                    return; // Không tìm thấy node đầu tiên
                }
                for (let i = 1; i <= index; i++) {
                    if (!currentNode.children) return; // Nếu không có children thì dừng lại
                    currentNode = currentNode.children.find(child => child.id === this.pathMapServer[i].id);
                    if (!currentNode) {
                        return; // Không tìm thấy thì dừng lại
                    }
                }
                await this.clearSelection()
                await this.showPropertiesData(currentNode)
                Vue.set(currentNode, "expanded", !currentNode.expanded);
            }
        },

        async resetAllClient() {
        },

        async handleAddCommand(cmd) {
    const selectedNode = this.selectedNodes && this.selectedNodes.length > 0 
        ? this.selectedNodes[this.selectedNodes.length - 1] 
        : null;

    if (!selectedNode) {
        this.$message.warning("Please select a node first");
        return;
    }

    // Validate command against node type
    const allowedCommands = this.getAllowedCommands(selectedNode);
    if (!allowedCommands.includes(cmd)) {
        this.$message.warning("This action is not allowed for this node type");
        return;
    }

    switch(cmd) {
        case 'organisation':
            this.showAddOrganisation(selectedNode);
            break;
        case 'substation':
            this.showAddSubsInTree(selectedNode);
            break;
        case 'voltageLevel':
            this.showAddVoltageLevel(selectedNode);
            break;
        case 'bay':
            this.showAddBay(selectedNode);
            break;
        case 'asset':
            this.showAddTransformer(selectedNode);
            break;
        case 'job':
            this.showAddJob(selectedNode);
            break;
    }
},

getAllowedCommands(node) {
    const commands = [];
    
    if (node.mode === 'organisation') {
        commands.push('organisation', 'substation');
    } else if (node.mode === 'substation') {
        commands.push('voltageLevel', 'bay', 'asset');
    } else if (node.mode === 'voltageLevel') {
        commands.push('bay');
    } else if (node.mode === 'bay') {
        commands.push('asset', 'job');
    } else if (node.mode === 'asset') {
        commands.push('job');
    }
    
    return commands;
},

async handleAssetCommand(assetType) {
    const selectedNode = this.selectedNodes && this.selectedNodes.length > 0 
        ? this.selectedNodes[this.selectedNodes.length - 1] 
        : null;

    if (!selectedNode) {
        this.$message.warning("Please select a node first");
        return;
    }

    // Map asset type to show* method
    const assetMethodMap = {
        'Transformer': this.showAddTransformer,
        'Surge arrester': this.showAddSurgeArrester,
        'Bushing': this.showAddBushing,
        'Voltage transformer': this.showAddVt,
        'Disconnector': this.showAddDisconnector,
        'Power cable': this.showAddPowerCable,
        'Current transformer': this.showAddCt,
        'Circuit breaker': this.showAddCircuitBreaker,
        'Rotating machine': this.showAddRotatingMachine,
        'Capacitor': this.showAddCapacitor,
        'Reactor': this.showAddReactor,
    };

    const method = assetMethodMap[assetType];
    if (method) {
        await method.call(this, selectedNode);
    } else {
        this.$message.warning(`Asset type "${assetType}" not supported`);
    }
},
cloneNodeRecursive(node) {
           const copy = JSON.parse(JSON.stringify(node));
           const walk = (n) => {
               n.mrid = this.generateUuid();
               if (n.id !== undefined) n.id = n.mrid;
               if (n.parentArr && Array.isArray(n.parentArr)) {
                   // keep parentArr of copy pointing to same ancestors (not changing)
               }
               if (n.children && n.children.length) {
                   n.children = n.children.map(child => walk(child));
               }
               return n;
           };
           return walk(copy);
       },
       
cleanDtoForDuplicate(dto) {
            if (!dto) return;
            
            // Xóa IDs của entity chính (cần tạo mới)
            if (dto.properties) dto.properties.mrid = null;
            dto.mrid = null;
            dto.id = null;
            dto.assetInfoId = null;
            dto.lifecycleDateId = null;
            dto.assetPsrId = null;
            dto.attachmentId = null;
            dto.productAssetModelId = null; // Tạo ProductAssetModel mới
            
            // Old info IDs
            if (dto.oldSurgeArresterInfoId) dto.oldSurgeArresterInfoId = null;
            if (dto.oldPowerTransformerInfoId) dto.oldPowerTransformerInfoId = null;
            if (dto.oldCableInfoId) dto.oldCableInfoId = null;
            
            // Giữ lại foreign keys: locationId, psrId (tham chiếu đến entities độc lập)
            
            // Xóa mrid trong ratings (giữ value và unit)
            if (dto.ratings) {
                const ratingFields = [
                    'rated_voltage', 'rated_frequency', 'rated_current',
                    'short_time_withstand_current', 'rated_duration_of_short_circuit',
                    'power_freq_withstand_voltage_earth_poles',
                    'power_freq_withstand_voltage_isolating_distance'
                ];
                ratingFields.forEach(field => {
                    if (dto.ratings[field] && dto.ratings[field].mrid) {
                        dto.ratings[field].mrid = null;
                    }
                });
            }
            
            // Xóa mrid/id trong nested objects (giữ dữ liệu)
            const clearRecursive = (obj, depth = 0) => {
                if (depth > 5) return;
                if (Array.isArray(obj)) {
                    obj.forEach(item => clearRecursive(item, depth + 1));
                } else if (obj && typeof obj === 'object') {
                    if ('mrid' in obj && obj.mrid !== null) obj.mrid = null;
                    if ('id' in obj && obj.id !== null) obj.id = null;
                    Object.values(obj).forEach(val => {
                        if (val !== null && typeof val === 'object') {
                            clearRecursive(val, depth + 1);
                        }
                    });
                }
            };
            
            if (dto.ratings) clearRecursive(dto.ratings);
            if (dto.winding_configuration) clearRecursive(dto.winding_configuration);
            if (dto.impedances) clearRecursive(dto.impedances);
            if (dto.others) clearRecursive(dto.others);
            if (dto.tap_changers) clearRecursive(dto.tap_changers);
            if (dto.voltage) clearRecursive(dto.voltage);
            if (dto.frequency) clearRecursive(dto.frequency);
            if (dto.currentFlow) clearRecursive(dto.currentFlow);
            if (dto.seconds) clearRecursive(dto.seconds);
            // Power Cable specific: temperature, area, length, datasData, othersData, ratingsData
            if (dto.temperature) clearRecursive(dto.temperature);
            if (dto.area) clearRecursive(dto.area);
            if (dto.length) clearRecursive(dto.length);
            if (dto.datasData) clearRecursive(dto.datasData);
            if (dto.othersData) clearRecursive(dto.othersData);
            if (dto.ratingsData) clearRecursive(dto.ratingsData);
            if (dto.configsData) clearRecursive(dto.configsData);
            // Reactor specific: reactorRating (includes inductance), reactorOther
            if (dto.reactorRating) clearRecursive(dto.reactorRating);
            if (dto.reactorOther) clearRecursive(dto.reactorOther);
    },
       
       
        async processDuplicateAsset(node, apiGetEntity, mappingFunction, mixinObject, dataPropName) {
    try {
        // 1. Tìm Node cha
        let parentNode = this.findNodeById(node.parentId, this.organisationClientList);
        
        if (!parentNode) {
            const isRoot = node.parentId === this.$constant.ROOT || !node.parentId;
            if (isRoot) parentNode = { mrid: this.$constant.ROOT, name: 'Root', mode: 'root' };
            else {
                this.$message.error(`Cannot find parent node.`);
                return { success: false };
            }
        }

        // 2. Lấy dữ liệu gốc
        const entityRes = await apiGetEntity(node.mrid, this.$store.state.user.user_id, node.parentId);
        if (!entityRes.success || !entityRes.data) {
            this.$message.error("Failed to fetch original data.");
            return { success: false };
                }

        // 3. Map sang DTO & Clean
        const dto = mappingFunction(entityRes.data);
        this.cleanDtoForDuplicate(dto);

        // Generate mrid mới cho nested objects
        if (Array.isArray(dto.voltage)) {
            dto.voltage.forEach(item => {
                if (item && !item.mrid) item.mrid = this.generateUuid();
            });
        }
        if (Array.isArray(dto.frequency)) {
            dto.frequency.forEach(item => {
                if (item && !item.mrid) item.mrid = this.generateUuid();
            });
        }
        if (Array.isArray(dto.seconds)) {
            dto.seconds.forEach(item => {
                if (item && !item.mrid) item.mrid = this.generateUuid();
            });
        }
        if (Array.isArray(dto.currentFlow)) {
            dto.currentFlow.forEach(item => {
                if (item && !item.mrid) item.mrid = this.generateUuid();
            });
        }
        // Power Cable specific: temperature, area, length
        if (Array.isArray(dto.temperature)) {
            dto.temperature.forEach(item => {
                if (item && !item.mrid) item.mrid = this.generateUuid();
            });
        }
        if (Array.isArray(dto.area)) {
            dto.area.forEach(item => {
                if (item && !item.mrid) item.mrid = this.generateUuid();
            });
        }
        if (Array.isArray(dto.length)) {
            dto.length.forEach(item => {
                if (item && !item.mrid) item.mrid = this.generateUuid();
            });
        }
        // Reactor specific: inductance, reactivePower, mass
        if (Array.isArray(dto.inductance)) {
            dto.inductance.forEach(item => {
                if (item && !item.mrid) item.mrid = this.generateUuid();
            });
        }
        if (Array.isArray(dto.reactivePower)) {
            dto.reactivePower.forEach(item => {
                if (item && !item.mrid) item.mrid = this.generateUuid();
            });
        }
        if (Array.isArray(dto.mass)) {
            dto.mass.forEach(item => {
                if (item && !item.mrid) item.mrid = this.generateUuid();
            });
        }
        
        // Generate mrid cho objects chính
        if (dto.properties && !dto.properties.mrid) {
            dto.properties.mrid = this.generateUuid();
        }
        if (!dto.lifecycleDateId) {
            dto.lifecycleDateId = this.generateUuid();
        }
        if (!dto.productAssetModelId) {
            dto.productAssetModelId = this.generateUuid();
        }
        if (!dto.assetPsrId) {
            dto.assetPsrId = this.generateUuid();
        }
        if (!dto.assetInfoId) {
            dto.assetInfoId = this.generateUuid();
        }
        if (!dto.psrId && parentNode && parentNode.mrid) {
            dto.psrId = parentNode.mrid;
        }
        
        // Setup attachment
        if (!dto.attachment) {
            dto.attachment = {};
        }
        if (!dto.attachment.path || dto.attachment.path === '') {
            dto.attachment.path = "[]";
        } else if (typeof dto.attachment.path !== 'string') {
            try {
                dto.attachment.path = JSON.stringify(dto.attachment.path);
            } catch (e) {
                dto.attachment.path = "[]";
            }
        } else {
            try {
                JSON.parse(dto.attachment.path);
            } catch (e) {
                dto.attachment.path = "[]";
            }
        }
        if (!dto.attachmentId) {
            dto.attachmentId = this.generateUuid();
        }
        dto.attachment.id = dto.attachmentId;
        dto.attachment.id_foreign = dto.properties?.mrid || null;
        dto.attachment.type = dto.attachment.type || 'asset';
        dto.attachment.name = dto.attachment.name || null;
        
        // Generate mrid cho ratings
        if (dto.ratings) {
            const ratingFields = [
                'rated_voltage', 'rated_frequency', 'rated_current',
                'short_time_withstand_current', 'rated_duration_of_short_circuit',
                'power_freq_withstand_voltage_earth_poles',
                'power_freq_withstand_voltage_isolating_distance'
            ];
            ratingFields.forEach(field => {
                if (dto.ratings[field] && !dto.ratings[field].mrid) {
                    dto.ratings[field].mrid = this.generateUuid();
                }
            });
        }
        
        // Reactor specific: Generate mrid cho reactorRating (includes inductance)
        if (dto.reactorRating) {
            const reactorRatingFields = [
                'rated_voltage', 'rated_frequency', 'rated_current',
                'rated_power', 'inductance'
            ];
            reactorRatingFields.forEach(field => {
                if (dto.reactorRating[field] && !dto.reactorRating[field].mrid) {
                    dto.reactorRating[field].mrid = this.generateUuid();
                }
            });
        }
        
        // Reactor specific: Generate mrid cho reactorOther
        if (dto.reactorOther) {
            if (dto.reactorOther.weight && !dto.reactorOther.weight.mrid) {
                dto.reactorOther.weight.mrid = this.generateUuid();
            }
        }
        
        // Power Cable specific: Generate mrid cho nested objects trong datasData, othersData, ratingsData
        const generateMridForNestedObject = (obj) => {
            if (!obj || typeof obj !== 'object') return;
            if (Array.isArray(obj)) {
                obj.forEach(item => generateMridForNestedObject(item));
            } else {
                if (obj.mrid === null || obj.mrid === '') {
                    obj.mrid = this.generateUuid();
                }
                Object.values(obj).forEach(val => {
                    if (val && typeof val === 'object' && val !== null) {
                        generateMridForNestedObject(val);
                    }
                });
            }
        };
        
        if (dto.ratingsData) generateMridForNestedObject(dto.ratingsData);
        if (dto.othersData) generateMridForNestedObject(dto.othersData);
        if (dto.datasData) generateMridForNestedObject(dto.datasData);
        if (dto.configsData) generateMridForNestedObject(dto.configsData);
        
        // Reactor specific: Generate mrid cho nested objects trong reactorRating và reactorOther
        if (dto.reactorRating) generateMridForNestedObject(dto.reactorRating);
        if (dto.reactorOther) generateMridForNestedObject(dto.reactorOther);

        // Xóa children
        if (dto.children) dto.children = [];
        if (dto.voltageLevels) dto.voltageLevels = [];
        if (dto.bays) dto.bays = [];
        if (dto.assets) dto.assets = [];

        // Đổi serial no (chỉ đổi serial_no, giữ nguyên apparatus_id)
        const copySuffix = ` - Copy`;
        if (dto.name) dto.name = `${dto.name}${copySuffix}`;
        if (dto.properties) {
             if (dto.properties.serial_no) {
                 dto.properties.serial_no = `${dto.properties.serial_no}${copySuffix}`;
             } else {
                 const randomSuffix = Math.floor(Math.random() * 10000);
                 dto.properties.serial_no = `COPY_${randomSuffix}`;
             }
             // Giữ nguyên apparatus_id - không đổi
        }

        // Location logic
        let targetLocationId = dto.locationId;
        if (!targetLocationId && ['substation', 'organisation', 'root'].includes(parentNode.mode)) {
             try {
                 const locRes = await window.electronAPI.getLocationByPowerSystemResourceMrid(parentNode.mrid);
                 if (locRes.success) targetLocationId = locRes.data.mrid;
             } catch(e) {
                 console.warn("Failed to fetch location from parent node:", e);
             }
        }
        if (!dto.locationId && targetLocationId) {
            dto.locationId = targetLocationId;
        }

        // Tạo context từ mixin
        const context = {
            [dataPropName]: dto,
            [dataPropName + 'Old']: JSON.parse(JSON.stringify(dto)),
            parentData: parentNode,
            locationId: targetLocationId,
            attachmentData: [],
            ...mixinObject.methods,
            $message: this.$message,
            $store: this.$store,
            $constant: this.$constant,
            $config: this.$config,
            $common: this.$common,
            $helper: this.$helper,
            $uuid: this.$uuid
        };
            
        // Bind methods
        const vuePrototypeProps = ['$message', '$store', '$constant', '$config', '$common', '$helper', '$uuid', '$nextTick', '$set', '$delete'];
        Object.keys(context).forEach(key => {
            if (typeof context[key] === 'function' && !vuePrototypeProps.includes(key) && !key.startsWith('$')) {
                context[key] = context[key].bind(context);
            }
        });
        
        if (typeof mixinObject.data === 'function') {
            const defaultData = mixinObject.data();
            Object.keys(defaultData).forEach(k => {
                if (k !== dataPropName && k !== dataPropName + 'Old') {
                    context[k] = defaultData[k];
                }
            });
        }

        // Gọi hàm save
        let saveResult;
        if (typeof context.saveAsset === 'function') {
            saveResult = await context.saveAsset();
        } else if (typeof context.saveSubstation === 'function') {
             saveResult = await context.saveSubstation();
        } else if (typeof context.saveOrganisation === 'function') {
             saveResult = await context.saveOrganisation();
        } else if (typeof context.saveBay === 'function') {
             saveResult = await context.saveBay();
        } else if (typeof context.saveVoltageLevel === 'function') {
             saveResult = await context.saveVoltageLevel();
        } else {
            return { success: false, message: "Save method not found in mixin" };
        }
        if (saveResult && saveResult.success) {
            let newNodeData = {
                mrid: '',
                name: dto.name || (dto.properties ? dto.properties.apparatus_id : `${node.name} - Copy`),
                serial_number: dto.properties ? dto.properties.serial_no : '',
                parentId: parentNode.mrid,
                parentName: parentNode.name,
                parentArr: [...(parentNode.parentArr || []), { mrid: parentNode.mrid, parent: parentNode.name }],
                mode: node.mode,
                asset: node.asset,
                job: node.job,
                children: [], 
                expanded: false,
                isLeaf: true
            };

            const resData = saveResult.data;
            if (resData) {
                const keys = ['substation', 'organisation', 'voltageLevel', 'bay', 'asset', 'surgeArrester', 'transformer', 'circuitBreaker', 'breaker', 'disconnector', 'powerCable', 'voltageTransformer', 'currentTransformer', 'rotatingMachine', 'capacitor', 'reactor', 'bushing'];
                let mainObj = null;
                for(const k of keys) { if(resData[k]) { mainObj = resData[k]; break; } }
                
                if(mainObj) {
                    newNodeData.mrid = mainObj.mrid;
                    newNodeData.id = mainObj.mrid;
                    if (mainObj.name && mainObj.name !== mainObj.mrid) newNodeData.name = mainObj.name;
                } else if (resData.mrid) {
                     newNodeData.mrid = resData.mrid;
                     newNodeData.id = resData.mrid;
                     if(resData.name) newNodeData.name = resData.name;
                }
            }
            return { success: true, data: newNodeData };
            } else {
            return { success: false, message: saveResult ? saveResult.error : "Save failed" };
            }

        } catch (error) {
        console.error("Duplicate Error:", error);
        return { success: false, message: error.message };
        }
    },
    async duplicateSelectedNodes() {
    if (!this.selectedNodes || this.selectedNodes.length === 0) {
        this.$message.warning("Please select a node to duplicate");
        return;
    }

    const node = this.selectedNodes[this.selectedNodes.length - 1];
    let nodeName = node.serial_no || node.serial_number;
    
    // Logic cũ: ưu tiên serial_no nếu name rỗng
    if (!nodeName || nodeName.trim() === '') {
        nodeName = node.name;
    }
    
    // Nếu vẫn chưa có tên, gọi API lấy chi tiết
    if ((!nodeName || nodeName.toString().trim() === '') && node.mode === 'asset' && node.mrid) {
        try {
            let entityRes = null;
            const getNameFromEntity = (assetData) => {
                if (!assetData) return 'Unknown';
                // Ưu tiên Serial Number
                if (assetData.serial_number && assetData.serial_number.toString().trim() !== '') {
                    return assetData.serial_number;
                }
                // Sau đó đến Name
                if (assetData.name && assetData.name.toString().trim() !== '') {
                    return assetData.name;
                }
                // Cuối cùng là Apparatus ID (nếu có)
                return assetData.apparatus_id || 'Unknown';
            };
            // --- SURGE ARRESTER ---
            if (node.asset === 'Surge arrester') {
                entityRes = await window.electronAPI.getSurgeArresterEntityByMrid(node.mrid);
                if (entityRes.success && entityRes.data) {
                    nodeName = getNameFromEntity(entityRes.data.surgeArrester);
                }   
            } else if (node.asset === 'Transformer') {
                entityRes = await window.electronAPI.getTransformerEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId);
                if (entityRes.success && entityRes.data) {
                    nodeName = getNameFromEntity(entityRes.data.asset);
                }
            } else if (node.asset === 'Circuit breaker') {
                entityRes = await window.electronAPI.getBreakerEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId);
                if (entityRes.success && entityRes.data) {
                    nodeName = getNameFromEntity(entityRes.data.asset);
                }
            } else if (node.asset === 'Disconnector') {
                entityRes = await window.electronAPI.getDisconnectorEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId);
                if (entityRes.success && entityRes.data) {
                    nodeName = getNameFromEntity(entityRes.data.asset);
                }
            } else if (node.asset === 'Power cable') {
                entityRes = await window.electronAPI.getPowerCableEntityByMrid(node.mrid, node.parentId);
                if (entityRes.success && entityRes.data) {
                    nodeName = getNameFromEntity(entityRes.data.asset);
                }
            } else if (node.asset === 'Rotating machine') {
                entityRes = await window.electronAPI.getRotatingMachineEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId);
                if (entityRes.success && entityRes.data) {
                    nodeName = getNameFromEntity(entityRes.data.asset);
                }
            } else if (node.asset === 'Voltage transformer') {
                entityRes = await window.electronAPI.getVoltageTransformerEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId);
                if (entityRes.success && entityRes.data) {
                    nodeName = getNameFromEntity(entityRes.data.asset);
                }
            } else if (node.asset === 'Current transformer') {
                entityRes = await window.electronAPI.getCurrentTransformerEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId);
                if (entityRes.success && entityRes.data) {
                    nodeName = getNameFromEntity(entityRes.data.asset);
                }
            } else if (node.asset === 'Capacitor') {
                entityRes = await window.electronAPI.getCapacitorEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId);
                if (entityRes.success && entityRes.data) {
                    nodeName = getNameFromEntity(entityRes.data.asset);
                }
            } else if (node.asset === 'Reactor') {
                entityRes = await window.electronAPI.getReactorEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId);
                if (entityRes.success && entityRes.data) {
                    nodeName = getNameFromEntity(entityRes.data.asset);
                }
            } else if (node.asset === 'Bushing') {
                entityRes = await window.electronAPI.getBushingEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId);
                if (entityRes.success && entityRes.data) {
                    nodeName = getNameFromEntity(entityRes.data.asset); // Bushing thường dùng name hoặc serial
                }
            }
        } catch (error) {
            console.error("Error fetching entity for name:", error);
        }
    }
    
    nodeName = nodeName || 'Unknown';

        this.$confirm(`Duplicate "${nodeName}"?`, 'Confirmation', {
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            type: 'info'
        }).then(async () => {
        let result = { success: false };

        if (node.asset === 'Transformer') {
            result = await this.processDuplicateAsset(
                node,
                window.electronAPI.getTransformerEntityByMrid,
                TransformerMapping.transformerEntityToDto,
                TransformerMixin,   // Mixin Object
                'transformerDto'    // Tên biến data trong Mixin
            );
        }
        else if (node.asset === 'Surge arrester') {
            result = await this.processDuplicateAsset(
                node,
                window.electronAPI.getSurgeArresterEntityByMrid,
                SurgeArresterMapping.mapEntityToDto,
                SurgeArresterMixin,
                'surge_arrester_data' // Tên biến data trong Mixin Surge
            );
        }
        else if (node.asset === 'Circuit breaker') {
            result = await this.processDuplicateAsset(
                node,
                window.electronAPI.getBreakerEntityByMrid,
                BreakerMapping.mapEntityToDto,
                CircuitBreakerMixin,
                'circuitBreakerDto'
            );
        }
        else if (node.asset === 'Disconnector') {
            result = await this.processDuplicateAsset(
                node,
                window.electronAPI.getDisconnectorEntityByMrid,
                DisconnectorMapping.disconnectorEntityToDto,
                DisconnectorMixin,
                'disconnector'
            );
        }
        else if (node.asset === 'Power cable') {
            result = await this.processDuplicateAsset(
                node,
                window.electronAPI.getPowerCableEntityByMrid,
                PowerCableMapping.mapEntityToDto,
                PowerCableMixin,
                'powerCable'
            );
        }
        else if (node.asset === 'Voltage transformer') {
            result = await this.processDuplicateAsset(
                node,
                window.electronAPI.getVoltageTransformerEntityByMrid,
                VoltageTransformerMapping.mapEntityToDto,
                VoltageTransformerMixin,
                'voltageTransformer'
            );
        }
        else if (node.asset === 'Current transformer') {
            result = await this.processDuplicateAsset(
                node,
                window.electronAPI.getCurrentTransformerEntityByMrid,
                CurrentTransformerMapping.mapEntityToDto,
                CurrentTransformerMixin,
                'currentTransformer'
            );
        }
        else if (node.asset === 'Rotating machine') {
            result = await this.processDuplicateAsset(
                node,
                window.electronAPI.getRotatingMachineEntityByMrid,
                rotatingMachineMapping.mapEntityToDto,
                RotatingMachineMixin,
                'rotatingMachine'
            );
        }
        else if (node.asset === 'Capacitor') {
            result = await this.processDuplicateAsset(
                node,
                window.electronAPI.getCapacitorEntityByMrid,
                CapacitorMapping.mapEntityToDto,
                CapacitorMixin,
                'capacitor'
            );
        }
        else if (node.asset === 'Reactor') {
            result = await this.processDuplicateAsset(
                node,
                window.electronAPI.getReactorEntityByMrid,
                ReactorMapping.mapEntityToDto,
                ReactorMixin,
                'reactor'
            );
        }
        else if (node.asset === 'Bushing') {
            result = await this.processDuplicateAsset(
                node,
                window.electronAPI.getBushingEntityByMrid,
                BushingMapping.mapEntityToDto,
                BushingMixin,
                'bushing_data'
            );
        }
        // --- LOCATIONS ---
        else if (node.mode === 'bay') {
             result = await this.processDuplicateAsset(
                node,
                window.electronAPI.getBayEntityByMrid,
                (entity) => { return { mrid: entity.mrid, name: entity.name, ...entity }; },
                BayMixin,
                'properties'
            );
        }
        // ... Các location khác tương tự (Substation, Organisation) ...

        if (result.success && result.data) {
            this.$message.success("Duplicate successful!");
            const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                    if (parentNode) {
                if (!Array.isArray(parentNode.children)) this.$set(parentNode, 'children', []);
                const index = parentNode.children.findIndex(c => c.mrid === node.mrid);
                if (index !== -1) parentNode.children.splice(index + 1, 0, result.data);
                else parentNode.children.push(result.data);
                this.$set(parentNode, 'expanded', true);
                    this.clearSelection();
                this.updateSelection(result.data);
            }
                } else {
            this.$message.error(result.message || "Failed to duplicate.");
                }

    }).catch((e) => {
        if(e !== 'cancel') console.error(e);
        });
    },


        findNodeById(mrid, nodes) {
            for (const node of nodes) {
                if (node.mrid === mrid) return node;
                if (node.children) {
                    const result = this.findNodeById(mrid, node.children);
                    if (result) return result;
                }
            }
            return null;
        },

        async doubleClickNode(node) {
            await this.showDataClient(node);
        },

        async doubleClickNodeServer(node) {
            await this.showData(node);
            await this.showPropertiesData(node);
        },

        getValidParentTypes(nodeMode) {
        switch (nodeMode) {
            case 'organisation':
                return ['organisation']; // Org chỉ nằm trong Org
            case 'substation':
                return ['organisation']; // Substation nằm trong Org
            case 'voltageLevel':
                return ['substation'];   // Voltage nằm trong Substation
            case 'bay':
                return ['voltageLevel', 'substation']; // Bay nằm trong Voltage hoặc Substation
            case 'asset':
                return ['bay', 'voltageLevel', 'substation', 'organisation']; // Asset nằm được nhiều chỗ
            case 'job':
                return ['asset']; // Job nằm trong Asset
            default:
                return [];
        }
    },

    // 2. Hàm đệ quy xây dựng cây cho Dialog Move
    // nodeToMove: Node đang được chọn để di chuyển (để ẩn đi khỏi cây đích)
    // validParentTypes: Danh sách các loại node cha hợp lệ
    buildMoveTreeData(nodes, nodeToMove, validParentTypes) {
        let tree = [];
        if (!nodes) return tree;

        nodes.forEach(node => {
            // Không hiển thị chính node đang di chuyển (và con của nó) trong cây đích
            if (node.mrid === nodeToMove.mrid) return;

            // Kiểm tra xem node này có phải là cha hợp lệ không
            // Nếu KHÔNG phải cha hợp lệ -> disabled = true (không cho chọn), nhưng vẫn hiện để duyệt con
            const isValidParent = validParentTypes.includes(node.mode);

            // Tạo node mới cho el-tree
            let newNode = {
                mrid: node.mrid,
                name: node.name || node.serial_no || 'Unknown',
                mode: node.mode,
                disabled: !isValidParent, // Element UI sẽ làm mờ và không cho click nếu true
                children: []
            };

            // Đệ quy xử lý con
            if (node.children && node.children.length > 0) {
                newNode.children = this.buildMoveTreeData(node.children, nodeToMove, validParentTypes);
            }

            tree.push(newNode);
        });
        return tree;
    },

    // 3. Xử lý khi nhấn nút Move trên toolbar
    async handleMoveNode() {
        if (!this.selectedNodes || this.selectedNodes.length === 0) {
            this.$message.warning("Please select a node to move");
            return;
        }

        const nodeToMove = this.selectedNodes[this.selectedNodes.length - 1];
        
        // Không cho phép di chuyển Root
        if (!nodeToMove.parentId || nodeToMove.parentId === this.$constant.ROOT) {
             // Tuỳ logic của bạn, nếu Organisation cấp 1 không được move thì chặn
             // this.$message.warning("Cannot move root nodes");
             // return;
        }

        const validTypes = this.getValidParentTypes(nodeToMove.mode);
        
        // Xây dựng dữ liệu cây, lọc theo logic
        // Dùng organisationClientList nếu đang ở Client Slide, hoặc ownerServerList nếu Server
        const sourceData = this.clientSlide ? this.organisationClientList : this.ownerServerList;
        
        this.moveTreeData = this.buildMoveTreeData(sourceData, nodeToMove, validTypes);
        
        // Reset selection
        this.selectedTargetNode = null;
        this.moveDialogVisible = true;
        
        // Mở rộng cây mặc định (optional)
        if(this.moveTreeData.length > 0) {
            this.expandedMoveKeys = [this.moveTreeData[0].mrid];
        }
    },

    // 4. Xử lý khi click chọn node đích trong Dialog
    handleTargetNodeClick(data, node, component) {
        if (data.disabled) {
            this.$message.warning("Cannot move to this node type");
            this.selectedTargetNode = null;
            return;
        }
        this.selectedTargetNode = data;
    },

    // 5. Xác nhận di chuyển
    async confirmMoveNode() {
        if (!this.selectedTargetNode) return;
        
        const nodeToMove = this.selectedNodes[this.selectedNodes.length - 1];
        const newParent = this.selectedTargetNode;

        // Kiểm tra xem có di chuyển vào chính cha hiện tại không
        if (nodeToMove.parentId === newParent.mrid) {
            this.$message.warning("Node is already in this location");
            return;
        }

        this.$confirm(`Move "${nodeToMove.name || nodeToMove.serial_no}" to "${newParent.name}"?`, 'Confirm Move', {
            confirmButtonText: 'Move',
            cancelButtonText: 'Cancel',
            type: 'warning'
        }).then(async () => {
            try {
                let success = false;
                let updateResult = null;
                
                // --- GỌI API CẬP NHẬT PARENT ID TRONG DATABASE ---
                
                if (nodeToMove.mode === 'organisation') {
                    // Update parent_organization field
                    const orgEntity = await window.electronAPI.getOrganisationEntityByMrid(nodeToMove.mrid);
                    if (!orgEntity.success || !orgEntity.data) {
                        this.$message.error("Failed to fetch organisation data");
                        return;
                    }
                    const orgData = orgEntity.data.organisation;
                    orgData.parent_organization = newParent.mrid;
                    updateResult = await window.electronAPI.updateParentOrganizationByMrid(nodeToMove.mrid, orgData);
                    success = updateResult.success;
                    
                } else if (nodeToMove.mode === 'substation') {
                    // Update PSR location field (location refId points to parent organisation)
                    const substationEntity = await window.electronAPI.getSubstationByMrid(nodeToMove.mrid);
                    if (!substationEntity.success || !substationEntity.data) {
                        this.$message.error("Failed to fetch substation data");
                        return;
                    }
                    const substationData = substationEntity.data;
                    // Update location refId to point to new parent
                    if (substationData.location) {
                        const locationEntity = await window.electronAPI.getLocationByMrid(substationData.location);
                        if (locationEntity.success && locationEntity.data) {
                            locationEntity.data.refId = newParent.mrid;
                            const locationUpdate = await window.electronAPI.updateLocationByMrid(substationData.location, locationEntity.data);
                            if (!locationUpdate.success) {
                                this.$message.error("Failed to update location");
                                return;
                            }
                        }
                    }
                    // Also update substation data if needed
                    updateResult = await window.electronAPI.updateSubstationByMrid(nodeToMove.mrid, substationData);
                    success = updateResult.success;
                    
                } else if (nodeToMove.mode === 'voltageLevel') {
                    // Update substation field
                    const voltageLevelEntity = await window.electronAPI.getVoltageLevelByMrid(nodeToMove.mrid);
                    if (!voltageLevelEntity.success || !voltageLevelEntity.data) {
                        this.$message.error("Failed to fetch voltage level data");
                        return;
                    }
                    const voltageLevelData = voltageLevelEntity.data;
                    voltageLevelData.substation = newParent.mrid;
                    updateResult = await window.electronAPI.updateVoltageLevelByMrid(nodeToMove.mrid, voltageLevelData);
                    success = updateResult.success;
                    
                } else if (nodeToMove.mode === 'bay') {
                    // Update voltage_level or substation field
                    const bayEntity = await window.electronAPI.getBayByMrid(nodeToMove.mrid);
                    if (!bayEntity.success || !bayEntity.data) {
                        this.$message.error("Failed to fetch bay data");
                        return;
                    }
                    const bayData = bayEntity.data;
                    // Determine if new parent is voltageLevel or substation
                    if (newParent.mode === 'voltageLevel') {
                        bayData.voltage_level = newParent.mrid;
                        bayData.substation = null; // Clear substation if moving to voltageLevel
                    } else if (newParent.mode === 'substation') {
                        bayData.substation = newParent.mrid;
                        bayData.voltage_level = null; // Clear voltageLevel if moving to substation
                    }
                    updateResult = await window.electronAPI.updateBayByMrid(nodeToMove.mrid, bayData);
                    success = updateResult.success;
                    
                } else if (nodeToMove.mode === 'asset') {
                    // Asset có thể có parent là location hoặc PSR (substation, voltageLevel, bay)
                    // Lấy asset entity để biết location mrid
                    const assetEntity = await window.electronAPI.getAssetByMrid(nodeToMove.mrid);
                    if (!assetEntity.success || !assetEntity.data) {
                        this.$message.error("Failed to fetch asset data");
                        return;
                    }
                    const assetData = assetEntity.data;
                    
                    // Kiểm tra new parent là location hay PSR
                    if (newParent.mode === 'location' || newParent.mode === 'organisation') {
                        // Parent là location: update location refId
                        if (assetData.location) {
                            const locationEntity = await window.electronAPI.getLocationByMrid(assetData.location);
                            if (locationEntity.success && locationEntity.data) {
                                locationEntity.data.refId = newParent.mrid;
                                updateResult = await window.electronAPI.updateLocationByMrid(assetData.location, locationEntity.data);
                                success = updateResult.success;
                            } else {
                                this.$message.error("Failed to fetch location data for asset");
                                return;
                            }
                        } else {
                            // Asset không có location, có thể cần tạo mới hoặc update asset.location
                            this.$message.warning("Asset does not have location. This case needs special handling.");
                            success = false;
                        }
                    } else if (newParent.mode === 'substation' || newParent.mode === 'voltageLevel' || newParent.mode === 'bay') {
                        // Parent là PSR: cần update asset_psr.psr_id
                        // Tìm asset_psr record hiện tại của asset (nếu có)
                        // Có thể có nhiều asset_psr records, nhưng thường chỉ có một active
                        // Tìm asset_psr với asset_id = nodeToMove.mrid
                        try {
                            // Tìm asset_psr hiện tại (có thể có nhiều, lấy cái đầu tiên)
                            // Hoặc tìm theo psr_id cũ (parentId hiện tại)
                            let existingAssetPsr = null;
                            
                            // Thử tìm asset_psr với psr_id cũ (parentId hiện tại)
                            if (nodeToMove.parentId) {
                                const assetPsrResult = await window.electronAPI.getAssetPsrByAssetIdAndPsrId(nodeToMove.mrid, nodeToMove.parentId);
                                if (assetPsrResult.success && assetPsrResult.data) {
                                    existingAssetPsr = assetPsrResult.data;
                                }
                            }
                            
                            // Nếu không tìm thấy, tìm bất kỳ asset_psr nào của asset này
                            // (Có thể cần query khác, nhưng tạm thời dùng cách này)
                            
                            if (existingAssetPsr) {
                                // Update asset_psr với psr_id mới
                                existingAssetPsr.psr_id = newParent.mrid;
                                updateResult = await window.electronAPI.updateAssetPsr(existingAssetPsr.mrid, existingAssetPsr);
                                success = updateResult.success;
                            } else {
                                // Tạo mới asset_psr
                                const newAssetPsr = {
                                    mrid: this.generateUuid(),
                                    asset_id: nodeToMove.mrid,
                                    psr_id: newParent.mrid
                                };
                                updateResult = await window.electronAPI.insertAssetPsr(newAssetPsr);
                                success = updateResult.success;
                            }
                            
                            if (!success) {
                                this.$message.error("Failed to update asset_psr");
                                return;
                            }
                        } catch (error) {
                            console.error("Error updating asset_psr:", error);
                            this.$message.error("Failed to move asset to PSR: " + (error.message || error));
                            return;
                        }
                    } else {
                        this.$message.warning(`Cannot move asset to ${newParent.mode} type`);
                        success = false;
                    }
                    
                } else if (nodeToMove.mode === 'job') {
                    // Job parent is asset, need to check how job parent is stored
                    // For now, update job's asset_id if available
                    this.$message.warning("Job move functionality needs to be implemented based on job structure");
                    success = false;
                } else {
                    this.$message.warning(`Move functionality for ${nodeToMove.mode} is not yet implemented`);
                    success = false;
                }

                if (success) {
                    // --- CẬP NHẬT UI (CLIENT SIDE) ---
                    
                    // 1. Tìm và xoá node ở vị trí cũ
                    const oldParentNode = this.findNodeById(nodeToMove.parentId, this.clientSlide ? this.organisationClientList : this.ownerServerList);
                    if (oldParentNode && oldParentNode.children) {
                        const idx = oldParentNode.children.findIndex(c => c.mrid === nodeToMove.mrid);
                        if (idx !== -1) {
                            oldParentNode.children.splice(idx, 1);
                            // Clear children fetched flag to force reload
                            if (oldParentNode.children.length === 0) {
                                this.$set(oldParentNode, '_childrenFetched', false);
                            }
                        }
                    }

                    // 2. Thêm node vào vị trí mới
                    const targetNodeInTree = this.findNodeById(newParent.mrid, this.clientSlide ? this.organisationClientList : this.ownerServerList);
                    if (targetNodeInTree) {
                        if (!targetNodeInTree.children) this.$set(targetNodeInTree, 'children', []);
                        
                        // Cập nhật thông tin cha mới cho node
                        nodeToMove.parentId = newParent.mrid;
                        nodeToMove.parentName = newParent.name || newParent.parentName || '';
                        // Cập nhật lại parentArr
                        const newParentArr = [...(newParent.parentArr || []), { mrid: newParent.mrid, parent: newParent.name }];
                        nodeToMove.parentArr = newParentArr;
                        
                        // Clear children fetched flag để force reload từ database
                        this.$set(targetNodeInTree, '_childrenFetched', false);
                        
                        // Reload children từ database để đảm bảo dữ liệu mới nhất
                        await this.fetchChildren(targetNodeInTree);
                        
                        // Mở rộng node cha mới để thấy kết quả
                        this.$set(targetNodeInTree, 'expanded', true);
                    }

                    this.$message.success("Moved successfully");
                    this.moveDialogVisible = false;
                    this.selectedNodes = []; // Clear selection
                } else {
                    if (updateResult && updateResult.message) {
                        this.$message.error(updateResult.message || "Failed to move node");
                    }
                }

            } catch (error) {
                console.error("Move node error:", error);
                this.$message.error("Failed to move node: " + (error.message || error));
            }
        });
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
    background-color: #D9D9D9;
    height: 30px;
    display: flex;
    gap: 10px;
    border-bottom: 1px solid #CCCCCC;
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
    border-bottom: 1px solid #CCCCCC;
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
    background-color: #E2E8F0;
}

.content-properties::-webkit-scrollbar {
    display: none;
}

.content-properties-header {
    width: 100%;
    height: 40px;
    display: flex;
    background-color: #E2E8F0;
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
    border-left: 3px #E2E8F0 solid;
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
    background: #D9D9D9;
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
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
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
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
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
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
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
body > .v-modal {
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

/* Ẩn tất cả backdrop ngay khi duplicate */
body.duplicating-mode > .v-modal {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
}
</style>