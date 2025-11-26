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
        <div class="toolbar-setting">
            <div>
                <el-dropdown trigger="click">
                    <span class="icon-wrapper">
                        <i title="Add" style="font-size: 12px;" class="fa-solid fa-square-plus"></i>
                    </span>

                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item>
                            <icon size="12px" folderType="building" badgeColor="146EBE"></icon> add Organisation
                        </el-dropdown-item>
                        <el-dropdown-item>
                            <icon size="12px" folderType="voltageLevel" badgeColor="146EBE"></icon> add Voltage Level
                        </el-dropdown-item>
                        <el-dropdown-item>
                            <icon size="12px" folderType="location" badgeColor="146EBE"></icon> add Substation
                        </el-dropdown-item>
                        <el-dropdown-item>
                            <icon size="12px" folderType="bay" badgeColor="146EBE"></icon> add Bay
                        </el-dropdown-item>
                        <el-dropdown-item>
                            <icon size="12px" folderType="asset" badgeColor="146EBE"></icon> add Asset
                        </el-dropdown-item>
                        <el-dropdown-item>
                            <icon size="12px" folderType="job" badgeColor="146EBE"></icon> add Job
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
            <div>
                <i title="Open" style="font-size: 12px;" class="fa-regular fa-folder-open"></i>
            </div>
            <div>
                <i title="Duplicate" style="font-size: 12px;" class="fa-solid fa-clone"></i>
            </div>
            <div>
                <i title="Import" style="font-size: 12px;" class="fa-solid fa-file-import"></i>

            </div>
            <div>
                <el-dropdown @command="handleCommand" trigger="click">
                <i title="Export" style="font-size: 12px;" class="fa-solid fa-file-export"></i>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="exportJSON">
                            <icon size="12px" fileTypeDetail="json" folderType="fileType" badgeColor="146EBE"></icon> export to JSON
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
                <i title="Delete" style="font-size: 12px;" class="fa-solid fa-trash"></i>
            </div>
            <div>
                <i title="Fmeca" style="font-size: 12px;" class="fa-solid fa-table"></i>
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
                        @show-addCapacitor="showAddCapacitor"
                        @show-addReactor="showAddReactor"
                        @show-addRotatingMachine="showAddRotatingMachine" @show-addBay="showAddBay"
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
                    <contextMenu @show-data="showData" ref="contextMenu"></contextMenu>
                </div>
                <div class="page-align">
                    <page-align ref="LocationSyncPageAlign" :page-user="this.pageLocationSync"
                        :display-page-user="this.displayPageLocationSync"
                        :page-user-instance="this.pageLocationSyncInstance" :current-page="this.currentLocationSync"
                        title="LocationSync" :option.sync="this.optionLocationSync"
                        @update-page="updateLocationSyncPage">
                        >
                    </page-align>
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
            @close="handleTransformerCancel">
            <Transformer :locationId="locationId" :parent="parentOrganization" ref="transformer"></Transformer>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleTransformerCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleTransformerConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Bushing" :visible.sync="signBushing" width="1000px" @close="handleBushingCancel">
            <Bushing :locationId="locationId" :parent="parentOrganization" ref="bushing"></Bushing>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleBushingCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleBushingConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Surge Arrester" :visible.sync="signSurge" width="1000px" @close="handleSurgeCancel">
            <SurgeArrester :locationId="locationId" :parent="parentOrganization" ref="surgeArrester"></SurgeArrester>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleSurgeCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleSurgeConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Circuit Breaker" :visible.sync="signCircuit" width="1000px" @close="handleCircuitCancel">
            <CircuitBreaker :locationId="locationId" :parent="parentOrganization" ref="circuitBreaker"></CircuitBreaker>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleCircuitCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleCircuitConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Current Transformer" :visible.sync="signCt" width="1000px" @close="handleCtCancel">
            <CurrentTransformer :locationId="locationId" :parent="parentOrganization" ref="currentTransformer">
            </CurrentTransformer>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleCtCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleCtConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Voltage Transformer" :visible.sync="signVt" width="1000px" @close="handleVtCancel">
            <VoltageTransformer :locationId="locationId" :parent="parentOrganization" ref="voltageTransformer">
            </VoltageTransformer>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleVtCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleVtConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Power Cable" :visible.sync="signPower" width="1000px" @close="handlePowerCancel">
            <PowerCable :locationId="locationId" :parent="parentOrganization" ref="powerCable"></PowerCable>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handlePowerCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handlePowerConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Disconnector" :visible.sync="signDisconnector" width="1000px"
            @close="handleDisconnectorCancel">
            <Disconnector :locationId="locationId" :parent="parentOrganization" ref="disconnector"></Disconnector>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleDisconnectorCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleDisconnectorConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Rotating Machine" :visible.sync="signRotating" width="1000px"
            @close="handleRotatingCancel">
            <RotatingMachine :locationId="locationId" :parent="parentOrganization" ref="rotatingMachine">
            </RotatingMachine>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleRotatingCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleRotatingConfirm">Save</el-button>
            </span>
        </el-dialog>
        <el-dialog title="Add Capacitor" :visible.sync="signCapacitor" width="1000px" @close="handleCapacitorCancel">
            <Capacitor :locationId="locationId" :parent="parentOrganization" ref="capacitor">
            </Capacitor>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="handleCapacitorCancel">Cancel</el-button>
                <el-button size="small" type="primary" @click="handleCapacitorConfirm">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Add Reactor" :visible.sync="signReactor" width="1000px"
            @close="handleReactorCancel">
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
    </div>
</template>
<script>
/* eslint-disable */
import LogBar from '@/components/LogBar'
import TreeNode from '@/views/Common/TreeNode.vue'
import Vue from "vue";
import pageAlign from '@/views/PageAlign/pageAlign.vue'
import * as ownerAPI from '@/api/owner/owner.js'
import * as locationApi from '@/api/location'
import spinner from '@/views/Common/Spinner.vue'
import Tabs from '@/views/Common/Tabs.vue'
import contextMenu from "@/views/Common/ContextMenu.vue";
import * as circuitApi from '@/api/circuit/circuit'
import * as currentApi from '@/api/current/current'
import * as disconnectorApi from '@/api/disconnector/disconnector'
import * as voltageApi from '@/api/voltage/voltage'
import * as surgeApi from '@/api/surge/surge'
import * as powerApi from '@/api/power/power'
import * as assetApi from '@/api/asset'

import * as jobApi from '@/api/job'
import * as jobCircuitApi from '@/api/circuit/jobCircuit'
import * as jobCurrentApi from '@/api/current/jobCurrent'
import * as jobVoltageApi from '@/api/voltage/jobVoltage'
import * as jobDisconnectorApi from '@/api/disconnector/jobDisconnector'
import * as jobSurgeApi from '@/api/surge/jobSurge'
import * as jobPowerApi from '@/api/power/jobPower'

import * as testApi from '@/api/test'
import * as testCircuitApi from '@/api/circuit/testCircuit'
import * as testCurrentApi from '@/api/current/testCurrent'
import * as testVoltageApi from '@/api/voltage/testVoltage'
import * as testDisconnectorApi from '@/api/disconnector/testDisconnector'
import * as testSurgeApi from '@/api/surge/testSurge'
import * as testPowerApi from '@/api/power/testPower'

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
import JobSurgeArrester from '@/views/JobView/SurgeArrester/index.vue'
import JobPowerCable from '@/views/JobView/PowerCable/index.vue'
import JobDisconnector from '@/views/JobView/Disconnector/index.vue'
import JobCurrentTransformer from '@/views/JobView/CurrentTrans/index.vue'
import JobVoltageTransformer from '@/views/JobView/VoltageTransformer/index.vue'
import JobCircuitBreaker from '@/views/JobView/CircuitBreaker/index.vue'
import JobTransformer from '@/views/JobView/Transformer/index.vue'

import * as rotatingMachineMapping from "@/views/Mapping/RotatingMachine/index"
import RotatingMachine from '@/views/AssetView/RotatingMachine/index.vue'
import mixin from './mixin'
import Attachment from '../Common/Attachment.vue';
import * as demoAPI from '@/api/demo'
import * as BreakerMapping from '@/views/Mapping/Breaker/index'
import Icon from '@/views/Common/Icon.vue'


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
        Icon
    },
    data() {
        return {
            openExportDialog: false,
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
            currentTabServer: '',
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
        handleCommand(cmd) {
            if (cmd === 'exportExcel') {
                this.openExportDialog = true
            } else if(cmd === 'exportJSON'){

            } else if(cmd === 'exportXML'){
                this.openExportDialog = true
            } else if(cmd === 'exportWord'){
                this.openExportDialog = true
            } else if(cmd === 'exportPDF'){
                this.openExportDialog = true
            } 
        },

        handleCancelExport(){
            this.openExportDialog = false
        },

        handleExportConfirm(){
            this.openExportDialog = false
            this.$message.success("Export successfully")
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
            if (!node.children) {
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
                            assetRotatingMachineReturn, assetCurrentTransformerReturn, assetCapacitorReturn, assetBreakerReturn] = await this.fetchAssetByPsr(clickedRow.mrid);
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
                            assetRotatingMachineReturn, assetCurrentTransformerReturn, assetCapacitorReturn, assetBreakerReturn] = await this.fetchAssetByPsr(clickedRow.mrid);
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
                    Vue.set(node, "children", newRows); // Đảm bảo Vue reactive
                } catch (error) {
                    console.error("Error fetching children:", error);
                    this.$message.error("Có lỗi xảy ra khi tải dữ liệu: " + error.message);
                }
            }
        },

        async fetchAssetByPsr(psrId) {
            try {
                const [responseTransformer, responseSurge, responseBushing, responseVT, responseDisconnector, responsePowerCale, responseRotatingMachine, responseCurrentTransformer, responseCapacitor, responseBreaker] = await Promise.all([
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Transformer'),
                    window.electronAPI.getSurgeArresterByPsrId(psrId),
                    window.electronAPI.getBushingByPsrId(psrId),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Voltage transformer'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Disconnector'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Power cable'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Rotating machine'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Current transformer'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Capacitor'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Circuit breaker')
                ])
                return [responseTransformer, responseSurge, responseBushing, responseVT, responseDisconnector, responsePowerCale, responseRotatingMachine, responseCurrentTransformer, responseCapacitor, responseBreaker];
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
                        const [assetSurgeReturn, assetBushingReturn, assetVtReturn, assetDisconnectorReturn, assetPowerCableReturn, assetRotatingMachineReturn, assetCurrentTransformerReturn, assetCapacitorReturn] = await this.fetchAssetByPsr(clickedRow.mrid);
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
                        const [assetSurgeReturn, assetBushingReturn, assetVtReturn, assetDisconnectorReturn, assetPowerCableReturn, assetRotatingMachineReturn, assetCurrentTransformerReturn, assetCapacitorReturn] = await this.fetchAssetByPsr(clickedRow.mrid);
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
                    }else if (node.mode == 'bay') {
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

        async updateLocationSyncPage(pageStt) {
            try {
                if (this.optionLocationSync.mode == 'update') {
                    await ownerAPI.getOwnerByRole("OWNER3", pageStt, this.sl).then((res) => {
                        if (res != null && res.length != 0) {
                            for (let i in res) {
                                res[i].id = res[i].mrid
                                res[i].parentId = ''
                                res[i].parentName = ''
                                res[i].parentArr = []
                            }
                            this.ownerServerList = res
                        }
                    })
                }
            } catch (error) {
                this.$message.error("Some error occur")
                console.error(error)
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
                const index = this.selectedNodes.findIndex(n => n.id === node.id);
                if (index === -1) {
                    this.selectedNodes.push(node);
                } else {
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
            const menuHeight = menu.offsetHeight || 200; // fallback nếu chưa render
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
            this.$message.success("Reactor saved successfully")
            // Cần thêm logic để cập nhật lại cây nếu cần thiết
            // await this.$refs.transformer.saveAsset();
            this.signReactor = false
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

        async downloadFromServer() {

        },

        async getAssets(node, rowData) {
            let locationId = node.id
            await assetApi.getAssetByLocation(locationId).then(async (response) => {
                if (response && response.length > 0) {
                    response.forEach(row => {
                        row.parentId = node.id;
                        let parentName = node.parentName + "/" + node.name
                        row.parentName = parentName
                    });
                    rowData = response
                }
            })
            await circuitApi.findByLocationId(locationId).then(async (responseAsset) => {
                if (responseAsset && responseAsset.length > 0) {
                    responseAsset.forEach(row => {
                        row.parentId = node.id;
                        let parentName = node.parentName + "/" + node.name
                        row.parentName = parentName
                    });
                    rowData = rowData.concat(responseAsset)
                }
            })
            await currentApi.findByLocationId(locationId).then(async (responseAsset) => {
                if (responseAsset && responseAsset.length > 0) {
                    responseAsset.forEach(row => {
                        row.parentId = node.id;
                        let parentName = node.parentName + "/" + node.name
                        row.parentName = parentName
                    });
                    rowData = rowData.concat(responseAsset)
                }
            })
            await voltageApi.findByLocationId(locationId).then(async (responseAsset) => {
                if (responseAsset && responseAsset.length > 0) {
                    responseAsset.forEach(row => {
                        row.parentId = node.id;
                        let parentName = node.parentName + "/" + node.name
                        row.parentName = parentName
                    });
                    rowData = rowData.concat(responseAsset)
                }
            })
            await disconnectorApi.findByLocationId(locationId).then(async (responseAsset) => {
                if (responseAsset && responseAsset.length > 0) {
                    responseAsset.forEach(row => {
                        row.parentId = node.id;
                        let parentName = node.parentName + "/" + node.name
                        row.parentName = parentName
                    });
                    rowData = rowData.concat(responseAsset)
                }
            })
            await surgeApi.findByLocationId(locationId).then(async (responseAsset) => {
                if (responseAsset && responseAsset.length > 0) {
                    responseAsset.forEach(row => {
                        row.parentId = node.id;
                        let parentName = node.parentName + "/" + node.name
                        row.parentName = parentName
                    });
                    rowData = rowData.concat(responseAsset)
                }
            })
            await powerApi.findByLocationId(locationId).then(async (responseAsset) => {
                if (responseAsset && responseAsset.length > 0) {
                    responseAsset.forEach(row => {
                        row.parentId = node.id;
                        let parentName = node.parentName + "/" + node.name
                        row.parentName = parentName
                    });
                    rowData = rowData.concat(responseAsset)
                }
            })

            return rowData
        },

        async getJobs(node, rowData) {
            if (node.asset == "Transformer") {
                await jobApi.getJobByAsset(node.id).then((response) => {
                    if (response && response.length > 0) {
                        response.forEach(row => {
                            row.parentId = node.id;
                        });
                        rowData = response
                    }
                })
            } else if (node.asset == "Circuit breaker") {
                await jobCircuitApi.findAllJobByAssetId(node.id).then((responseJob) => {
                    if (responseJob && responseJob.length > 0) {
                        responseJob.forEach(row => {
                            row.parentId = node.id;
                        });
                        rowData = rowData.concat(responseJob)
                    }
                })
            } else if (node.asset == "Current transformer") {
                await jobCurrentApi.findAllJobByAssetId(node.id).then((responseJob) => {
                    if (responseJob && responseJob.length > 0) {
                        responseJob.forEach(row => {
                            row.parentId = node.id;
                        });
                        rowData = rowData.concat(responseJob)
                    }
                })
            } else if (node.asset == "Disconnector") {
                await jobDisconnectorApi.findAllJobByAssetId(node.id).then((responseJob) => {
                    if (responseJob && responseJob.length > 0) {
                        responseJob.forEach(row => {
                            row.parentId = node.id;
                        });
                        rowData = rowData.concat(responseJob)
                    }
                })
            } else if (node.asset == "Surge arrester") {
                await jobSurgeApi.findAllJobByAssetId(node.id).then((responseJob) => {
                    if (responseJob && responseJob.length > 0) {
                        responseJob.forEach(row => {
                            row.parentId = node.id;
                        });
                        rowData = rowData.concat(responseJob)
                    }
                })
            } else if (node.asset == "Power cable") {
                await jobPowerApi.findAllJobByAssetId(node.id).then((responseJob) => {
                    if (responseJob && responseJob.length > 0) {
                        responseJob.forEach(row => {
                            row.parentId = node.id;
                        });
                        rowData = rowData.concat(responseJob)
                    }
                })
            } else if (node.asset == "Voltage transformer") {
                await jobVoltageApi.findAllJobByAssetId(node.id).then((responseJob) => {
                    if (responseJob && responseJob.length > 0) {
                        responseJob.forEach(row => {
                            row.parentId = node.id;
                        });
                        rowData = rowData.concat(responseJob)
                    }
                })
            }
            return rowData
        },

        async getTests(node, rowData) {
            if (node.parent.asset == "Transformer") {
                await testApi.getTestsByJobId(node.id).then((responseTest) => {
                    if (responseTest && responseTest.length > 0) {
                        responseTest.forEach(row => {
                            row.parentId = node.id;
                        });
                        rowData = rowData.concat(responseTest)
                    }
                })
            } else if (node.parent.asset == "Circuit breaker") {
                await testCircuitApi.findAllTestByJobId(node.id).then((responseTest) => {
                    if (responseTest && responseTest.length > 0) {
                        responseTest.forEach(row => {
                            row.parentId = node.id;
                        });
                        rowData = rowData.concat(responseTest)
                    }
                })
            } else if (node.parent.asset == "Current transformer") {
                await testCurrentApi.findAllTestByJobId(node.id).then((responseTest) => {
                    if (responseTest && responseTest.length > 0) {
                        responseTest.forEach(row => {
                            row.parentId = node.id;
                        });
                        rowData = rowData.concat(responseTest)
                    }
                })
            } else if (node.parent.asset == "Disconnector") {
                await testDisconnectorApi.findAllTestByJobId(node.id).then((responseTest) => {
                    if (responseTest && responseTest.length > 0) {
                        responseTest.forEach(row => {
                            row.parentId = node.id;
                        });
                        rowData = rowData.concat(responseTest)
                    }
                })
            } else if (node.parent.asset == "Surge arrester") {
                await testSurgeApi.findAllTestByJobId(node.id).then((responseTest) => {
                    if (responseTest && responseTest.length > 0) {
                        responseTest.forEach(row => {
                            row.parentId = node.id;
                        });
                        rowData = rowData.concat(responseTest)
                    }
                })
            } else if (node.parent.asset == "Power cable") {
                await testPowerApi.findAllTestByJobId(node.id).then((responseTest) => {
                    if (responseTest && responseTest.length > 0) {
                        responseTest.forEach(row => {
                            row.parentId = node.id;
                        });
                        rowData = rowData.concat(responseTest)
                    }
                })
            } else if (node.parent.asset == "Voltage transformer") {
                await testVoltageApi.findAllTestByJobId(node.id).then((responseTest) => {
                    if (responseTest && responseTest.length > 0) {
                        responseTest.forEach(row => {
                            row.parentId = node.id;
                        });
                        rowData = rowData.concat(responseTest)
                    }
                })
            }
            return rowData
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
</style>