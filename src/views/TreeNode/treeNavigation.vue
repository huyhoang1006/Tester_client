<template>
    <div class="explorer">
        <!-- Thanh công cụ -->
        <div v-show="clientSlide" class="toolbar">
            <TopBarClient :pathMapClient.sync="pathMapClient" :organisationClientList="organisationClientList"
                @clear-selection="clearSelection" />
        </div>
        <div v-show="!clientSlide" class="toolbar">
            <TopBarServer :pathMapServer="pathMapServer" @reset-all="resetAllServer" @path-click="resetPathServer" />
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
                <i @click="handleUploadNode" title="Upload" style="font-size: 12px; cursor: pointer;"
                    class="fa-solid fa-upload"></i>
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
            <ClientTreePanel ref="clientPanel" v-show="clientSlide" :organisationClientList="organisationClientList"
                :selectedNodes.sync="selectedNodes" @showLocationRoot="showLocationRoot" @show-addSubs="showAddSubs"
                @double-click-node="doubleClickNode" @fetch-children="fetchChildren"
                @show-properties="showPropertiesDataClient" @update-selection="updateSelection"
                @clear-selection="clearSelection" @delete-data="handleDeleteFromContextMenu"
                @show-addSubsInTree="showAddSubsInTree" @show-addOrganisation="showAddOrganisation"
                @show-addVoltageLevel="showAddVoltageLevel" @show-addTransformer="showAddTransformer"
                @show-addJob="showAddJob" @show-addBushing="showAddBushing"
                @show-addSurgeArrester="showAddSurgeArrester" @show-addCircuit="showAddCircuitBreaker"
                @show-addVt="showAddVt" @show-addCt="showAddCt" @show-addPowerCable="showAddPowerCable"
                @show-addDisconnector="showAddDisconnector" @show-addCapacitor="showAddCapacitor"
                @show-addReactor="showAddReactor" @show-addRotatingMachine="showAddRotatingMachine"
                @show-addBay="showAddBay" @export-json="handleExportJSONFromContext"
                @export-json-cim="handleExportJSONCIMFromContext" @export-xml="handleExportXMLFromContext"
                @export-excel="handleExportExcelFromContext" @export-word="handleExportWordFromContext"
                @export-pdf="handleExportPDFFromContext" @duplicate-node="handleDuplicateFromContext"
                @move-node="handleMoveFromContext" @import-json="handleImportJSONFromContext"
                @show-zero-diagram="handleShowZeroDiagram"
                @import-json-cim="handleImportJSONCIMFromContext" @show-data="showDataClient" />

            <ServerTreePanel ref="serverPanel" v-show="!clientSlide" :ownerServerList="ownerServerList"
                :selectedNodes.sync="selectedNodes" @showOwnerServerRoot="showOwnerServerRoot"
                @fetch-children-server="fetchChildrenServer" @double-click-node-server="doubleClickNodeServer"
                @show-properties="showPropertiesData" @update-selection="updateSelection"
                @clear-selection="clearSelection" @show-data="showData" @export-json="handleExportJSONFromContext"
                @export-json-cim="handleExportJSONCIMFromContext" @export-xml="handleExportXMLFromContext"
                @export-excel="handleExportExcelFromContext" @export-word="handleExportWordFromContext"
                @export-pdf="handleExportPDFFromContext" @duplicate-node="handleDuplicateFromContext"
                @move-node="handleMoveFromContext" @import-json="handleImportJSONFromContext"
                @import-json-cim="handleImportJSONCIMFromContext" />

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
            <ContextDataClient v-show="clientSlide" ref="contextDataClient" :activeTabClient="activeTabClient"
                :tabsClient="tabsClient" :propertiesSignClient.sync="propertiesSignClient"
                :propertiesClient="propertiesClient" :assetPropertySignClient="assetPropertySignClient"
                :assetPropertiesClient="assetPropertiesClient" :jobPropertySignClient="jobPropertySignClient"
                :jobPropertiesClient="jobPropertiesClient" :logSignClient.sync="logSignClient"
                :logDataClient="logDataClient" @update:activeTabClient="activeTabClient = $event"
                @tab-changed="handleTabSelect" @remove-tab-client="removeTabClient"
                @reload-log-client="reloadLogClient" />
        </div>

        <!-- Dialog Components -->
        <SubstationDialog ref="substationDialog" :visible="signSubs" @update:visible="signSubs = $event"
            :parentOrganization="parentOrganization" :personList="personList" :locationList="locationList"
            :organisationId="organisationId" @close="handleSubsCancel" @cancel="handleSubsCancel"
            @confirm="handleSubsConfirm" />

        <OrganisationDialog ref="organisationDialog" :visible="signOrg" @update:visible="signOrg = $event"
            :parentOrganization="parentOrganization" @close="handleOrgCancel" @cancel="handleOrgCancel"
            @confirm="handleOrgConfirm" />

        <VoltageLevelDialog ref="voltageLevelDialog" :visible="signVoltageLevel"
            @update:visible="signVoltageLevel = $event" :locationId="locationId"
            :parentOrganization="parentOrganization" @close="handleVoltageLevelCancel"
            @cancel="handleVoltageLevelCancel" @confirm="handleVoltageLevelConfirm" />

        <BayDialog ref="bayDialog" :visible="signBay" @update:visible="signBay = $event" :locationId="locationId"
            :parentOrganization="parentOrganization" @close="handleBayCancel" @cancel="handleBayCancel"
            @confirm="handleBayConfirm" />

        <TransformerDialog ref="transformerDialog" :visible="signTransformer" @update:visible="signTransformer = $event"
            :locationId="locationId" :parentOrganization="parentOrganization" :modal="!isDuplicating"
            :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'" :custom-class="dialogClass"
            @close="handleTransformerCancel" @cancel="handleTransformerCancel" @confirm="handleTransformerConfirm" />

        <BushingDialog ref="bushingDialog" :visible="signBushing" @update:visible="signBushing = $event"
            :locationId="locationId" :parentOrganization="parentOrganization" :modal="!isDuplicating"
            :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'" :custom-class="dialogClass"
            @close="handleBushingCancel" @cancel="handleBushingCancel" @confirm="handleBushingConfirm" />

        <SurgeArresterDialog ref="surgeArresterDialog" :visible="signSurge" @update:visible="signSurge = $event"
            :locationId="locationId" :parentOrganization="parentOrganization" :modal="!isDuplicating"
            :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'" :custom-class="dialogClass"
            @close="handleSurgeCancel" @cancel="handleSurgeCancel" @confirm="handleSurgeConfirm" />

        <CircuitBreakerDialog ref="circuitBreakerDialog" :visible="signCircuit" @update:visible="signCircuit = $event"
            :locationId="locationId" :parentOrganization="parentOrganization" :modal="!isDuplicating"
            :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'" :custom-class="dialogClass"
            @close="handleCircuitCancel" @cancel="handleCircuitCancel" @confirm="handleCircuitConfirm" />

        <CurrentTransformerDialog ref="currentTransformerDialog" :visible="signCt" @update:visible="signCt = $event"
            :locationId="locationId" :parentOrganization="parentOrganization" :modal="!isDuplicating"
            :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'" :custom-class="dialogClass"
            @close="handleCtCancel" @cancel="handleCtCancel" @confirm="handleCtConfirm" />

        <VoltageTransformerDialog ref="voltageTransformerDialog" :visible="signVt" @update:visible="signVt = $event"
            :locationId="locationId" :parentOrganization="parentOrganization" :modal="!isDuplicating"
            :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'" :custom-class="dialogClass"
            @close="handleVtCancel" @cancel="handleVtCancel" @confirm="handleVtConfirm" />

        <PowerCableDialog ref="powerCableDialog" :visible="signPower" @update:visible="signPower = $event"
            :locationId="locationId" :parentOrganization="parentOrganization" :modal="!isDuplicating"
            :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'" :custom-class="dialogClass"
            @close="handlePowerCancel" @cancel="handlePowerCancel" @confirm="handlePowerConfirm" />

        <DisconnectorDialog ref="disconnectorDialog" :visible="signDisconnector"
            @update:visible="signDisconnector = $event" :locationId="locationId"
            :parentOrganization="parentOrganization" :modal="!isDuplicating" :show-close="!isDuplicating"
            :transition="isDuplicating ? '' : 'dialog-fade'" :custom-class="dialogClass"
            @close="handleDisconnectorCancel" @cancel="handleDisconnectorCancel" @confirm="handleDisconnectorConfirm" />

        <RotatingMachineDialog ref="rotatingMachineDialog" :visible="signRotating"
            @update:visible="signRotating = $event" :locationId="locationId" :parentOrganization="parentOrganization"
            :modal="!isDuplicating" :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'"
            :custom-class="dialogClass" @close="handleRotatingCancel" @cancel="handleRotatingCancel"
            @confirm="handleRotatingConfirm" />

        <CapacitorDialog ref="capacitorDialog" :visible="signCapacitor" @update:visible="signCapacitor = $event"
            :locationId="locationId" :parentOrganization="parentOrganization" :modal="!isDuplicating"
            :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'" :custom-class="dialogClass"
            @close="handleCapacitorCancel" @cancel="handleCapacitorCancel" @confirm="handleCapacitorConfirm" />

        <ReactorDialog ref="reactorDialog" :visible="signReactor" @update:visible="signReactor = $event"
            :locationId="locationId" :parentOrganization="parentOrganization" :modal="!isDuplicating"
            :show-close="!isDuplicating" :transition="isDuplicating ? '' : 'dialog-fade'" :custom-class="dialogClass"
            @close="handleReactorCancel" @cancel="handleReactorCancel" @confirm="handleReactorConfirm" />

        <JobDialog ref="jobDialog" :visible="signJob" @update:visible="signJob = $event" :checkJobType="checkJobType"
            :locationData="locationData" :assetData="assetData" :productAssetModelData="productAssetModelData"
            :parentOrganization="parentOrganization" :testTypeListData="testTypeListData" @close="handleJobCancel"
            @cancel="handleJobCancel" @confirm="handleJobConfirm" />

        <ExportDialog :visible="openExportDialog" @update:visible="openExportDialog = $event" :exportType="exportType"
            @cancel="handleCancelExport" @confirm="handleExportConfirm" />

        <ImportDialog :visible="openImportDialog" @update:visible="openImportDialog = $event"
            @cancel="handleCancelImport" @confirm="handleImportConfirm" />

        <FmecaDialog :visible="signFmeca" @update:visible="signFmeca = $event" @close="handleFmecaCancel"
            @cancel="handleFmecaCancel" @confirm="handleFmecaConfirm" />

        <MoveDialog :visible="moveDialogVisible" @update:visible="moveDialogVisible = $event"
            :moveTreeData="moveTreeData" :selectedTargetNodes="selectedTargetNodes"
            :selectedTargetNode="selectedTargetNode" :nodeToMove="nodeToMove" :moveDisplayText="moveDisplayText"
            :moveDisplayData="moveDisplayData" @close="handleMoveCancel" @cancel="handleMoveCancel"
            @confirm="confirmMoveNode" @fetch-children="fetchChildrenForMove" @update-selection="handleMoveNodeSelection" />

        <DownloadDialog :visible="downloadDialogVisible" @update:visible="downloadDialogVisible = $event"
            :moveTreeData="moveTreeData" :moveTreeProps="moveTreeProps" :expandedMoveKeys="expandedMoveKeys"
            :selectedDownloadTargetNode="selectedDownloadTargetNode" @close="() => downloadDialogVisible = false"
            @cancel="() => downloadDialogVisible = false" @confirm="confirmDownloadSelection"
            @node-click="handleDownloadTargetSelection" @node-expand="fetchChildren" />

            <ZeroDiagramDialog 
            :visible="signZeroDiagram" 
            @update:visible="signZeroDiagram = $event"
            :currentNode="nodeForZeroDiagram"
            @close="handleZeroDiagramClose"
            />
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
import ContextDataClient from './Client/ClientContext/ContextData.vue'

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

import mixin from './Common'
import Attachment from '../Common/Attachment.vue'
import Icon from '@/views/Common/Icon.vue'
import Fmeca from '@/views/Fmeca'
import Export from '@/views/Export/index.vue'

// Import Dialog Components
import {
    SubstationDialog,
    OrganisationDialog,
    VoltageLevelDialog,
    BayDialog,
    TransformerDialog,
    BushingDialog,
    SurgeArresterDialog,
    CircuitBreakerDialog,
    CurrentTransformerDialog,
    VoltageTransformerDialog,
    PowerCableDialog,
    DisconnectorDialog,
    RotatingMachineDialog,
    CapacitorDialog,
    ReactorDialog,
    JobDialog,
    ExportDialog,
    ImportDialog,
    FmecaDialog,
    MoveDialog,
    DownloadDialog,
    ZeroDiagramDialog 
} from './dialogs'


import mixinTreeNavigation from '@/views/TreeNode/Common/mixinTreeNavigation/mixin'
import TopBarServer from './Server/TopBarServer/index.vue'
import uploadNodeMixin from './mixin/Upload/index.js';
import ClientTreePanel from './Client/ClientTree/index.vue'
import ServerTreePanel from './Server/ServerTree/index.vue'
export default {
    name: 'TreeNavigation',
    components: {
        ContextDataClient,
        ServerTreePanel,
        ClientTreePanel,
        mapJobProperties,
        mapAssetProperties,
        mapProperties, mapClientProperties,
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
        Export,
        // Dialog Components
        SubstationDialog,
        OrganisationDialog,
        VoltageLevelDialog,
        BayDialog,
        TransformerDialog,
        BushingDialog,
        SurgeArresterDialog,
        CircuitBreakerDialog,
        CurrentTransformerDialog,
        VoltageTransformerDialog,
        PowerCableDialog,
        DisconnectorDialog,
        RotatingMachineDialog,
        CapacitorDialog,
        ReactorDialog,
        JobDialog,
        ExportDialog,
        ImportDialog,
        FmecaDialog,
        MoveDialog,
        DownloadDialog,
        ZeroDiagramDialog 
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
             signZeroDiagram: false, // Biến điều khiển ẩn hiện dialog
            nodeForZeroDiagram: null, // Biến lưu node đang chọn
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
    mixins: [mixin, mixinTreeNavigation, uploadNodeMixin],
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

        // Helper method to get component ref from dialog
        getDialogComponentRef(dialogRefName, componentRefName) {
            const dialogRef = this.$refs[dialogRefName]
            if (dialogRef && typeof dialogRef[`get${componentRefName}Ref`] === 'function') {
                return dialogRef[`get${componentRefName}Ref`]()
            }
            return null
        },

        // Helper method to reset form after successful save
        resetFormAfterSave(component) {
            this.$nextTick(() => {
                if (component && typeof component.resetForm === 'function') {
                    component.resetForm()
                }
            })
        },


        async handleMoveCancel() {
            this.moveDialogVisible = false
        },
         handleShowZeroDiagram(node) {
            this.nodeForZeroDiagram = node;
            this.signZeroDiagram = true;
        },
        handleZeroDiagramClose() {
            this.signZeroDiagram = false;
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
.custom-dialog {
    max-height: 90vh;
    height: auto !important;
}

.move-dialog {
    width: 35% !important;
}

@media (max-width: 991px) {
    .move-dialog {
        width: 50% !important;
    }
}
</style>