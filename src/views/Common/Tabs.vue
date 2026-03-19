<!-- eslint-disable -->
<template>
    <!-- Màn hình Client -->
    <div v-if="side == 'client'" ref="customTabs" class="custom-tabs">
        <!-- Nếu mảng tabs rỗng, không hiển thị gì cả (hoặc có thể hiển thị một màn hình welcome) -->
        <template v-if="tabs && tabs.length > 0">
            <div class="tabs-header">
                <div class="scroll-btn left" @click="scrollLeft"><i class="fa-solid fa-chevron-left"></i></div>
                <div class="tabs-header-data" ref="tabsHeader" @scroll="checkScroll">
                    <div v-for="(tab, index) in tabs" :key="tab.mrid || tab.id" @click="selectTab(tab, index)"
                        @mouseover="hoveredTab = tab.mrid" @mouseleave="hoveredTab = null" class="tab-item"
                        :class="{ active: compareTab(activeTab, tab) }" ref="tabItems">
                        <div class="icon-wrapper mgl-10">
                            <icon v-if="tab.mode == 'substation'" size="16px" folderType="location" badgeColor="146EBE">
                            </icon>
                            <icon v-else-if="tab.mode == 'voltageLevel'" size="16px" folderType="voltageLevel"
                                badgeColor="146EBE"></icon>
                            <icon v-else-if="tab.mode == 'bay'" size="16px" folderType="bay" badgeColor="146EBE"></icon>
                            <icon v-else-if="tab.mode == 'asset'" size="16px" folderType="asset"
                                :assetDetail="tab.asset" :transformerType="tab.type" badgeColor="146EBE">
                            </icon>
                            <icon v-else-if="tab.mode == 'job'" size="16px" folderType="job" badgeColor="FF0000"></icon>
                            <icon v-else-if="tab.mode == 'test'" size="16px" folderType="test" badgeColor="008001">
                            </icon>
                            <icon v-else size="16px" folderType="building" badgeColor="008001"></icon>
                            <span v-if="tab.mode == 'organisation'" class="tab-label">{{ tab.aliasName || tab.name
                            }}</span>
                            <span v-else-if="tab.mode == 'substation'" class="tab-label">{{ tab.aliasName || tab.name
                            }}</span>
                            <span v-else-if="tab.mode == 'voltageLevel'" class="tab-label">{{ tab.aliasName || tab.name
                            }}</span>
                            <span v-else-if="tab.mode == 'bay'" class="tab-label">{{ tab.aliasName || tab.name }}</span>
                            <span v-else-if="tab.mode == 'asset'" class="tab-label">{{ tab.apparatus_id ||
                                tab.serial_number }}</span>
                            <span v-else-if="tab.mode == 'job'" class="tab-label">{{ tab.name }}</span>
                        </div>
                        <span class="close-icon mgr-10 mgl-10"
                            :class="{ visible: hoveredTab === tab.mrid || compareTab(activeTab, tab) }"
                            @click.stop="closeTab(index)">✖</span>
                    </div>
                </div>
                <div class="scroll-btn right" @click="scrollRight"><i class="fa-solid fa-angle-right"></i></div>
            </div>

            <!-- TỐI ƯU HÓA: Render Đơn Component với Keep-Alive thay vì V-For -->
            <div class="tabs-content">
                <div class="mgr-20 mgt-20 mgb-20 mgl-20">
                    <!-- Vẫn dùng keep-alive để cache RAM -->
                    <keep-alive :max="20">
                        <!-- BỌC THÊM 1 THẺ DIV Ở ĐÂY ĐỂ ĐÓNG GÓI CONTENT + BUTTON THÀNH 1 KHỐI -->
                        <div v-if="activeTab && (activeTab.mrid || activeTab.id)" :key="activeTab.mrid || activeTab.id"
                            class="tab-scroll-wrapper">
                            <component :ref="'component_' + (activeTab.mrid || activeTab.id)" mode="update"
                                @reload="handleReload(activeTab, indexTab, $event)" :sideData="sideSign"
                                :is="checkTab(activeTab)" :organisationId="String(activeTab.parentId)"
                                :testTypeListData="testTypeListData" :assetData="assetData"
                                :productAssetModelData="productAssetModelData" :parent="parentOrganization"
                                :locationData="locationData" style="min-height: calc(100vh - 250px);">
                            </component>

                            <!-- Hai nút này sẽ trôi theo sau nội dung component -->
                            <span class="tab-actions">
                                <el-button size="small" type="danger" @click="closeTab(indexTab)">Close</el-button>
                                <el-button size="small" type="primary" @click="saveCtrlS()">Save</el-button>
                            </span>
                        </div>
                    </keep-alive>
                </div>
            </div>
        </template>
    </div>

    <!-- Màn hình Server -->
    <div v-else class="custom-tabs" ref="customTabsServer">
        <template v-if="tabs && tabs.length > 0">
            <div class="tabs-header">
                <!-- Header giữ nguyên -->
                <div class="scroll-btn left" @click="scrollLeft"><i class="fa-solid fa-chevron-left"></i></div>
                <div class="tabs-header-data" ref="tabsHeader" @scroll="checkScroll">
                    <div v-for="(tab, index) in tabs" :key="tab.mrid || tab.id" @click="selectTab(tab, index)"
                        @mouseover="hoveredTab = tab.mrid" @mouseleave="hoveredTab = null" class="tab-item"
                        :class="{ active: compareTab(activeTab, tab) }" ref="tabItems">
                        <div class="icon-wrapper mgl-10">
                            <icon v-if="tab.mode == 'substation'" size="16px" folderType="location" badgeColor="146EBE">
                            </icon>
                            <icon v-else-if="tab.mode == 'voltageLevel'" size="16px" folderType="voltageLevel"
                                badgeColor="146EBE"></icon>
                            <icon v-else-if="tab.mode == 'bay'" size="16px" folderType="bay" badgeColor="146EBE"></icon>
                            <icon v-else-if="tab.mode == 'asset'" size="16px" folderType="asset"
                                :assetDetail="tab.asset" :transformerType="tab.type" badgeColor="146EBE"></icon>
                            <icon v-else-if="tab.mode == 'job'" size="16px" folderType="job" badgeColor="FF0000"></icon>
                            <icon v-else-if="tab.mode == 'test'" size="16px" folderType="test" badgeColor="008001">
                            </icon>
                            <icon v-else size="16px" folderType="building" badgeColor="008001"></icon>
                            <span v-if="tab.mode == 'organisation'" class="tab-label">{{ tab.aliasName || tab.name
                            }}</span>
                            <span v-else-if="tab.mode == 'substation'" class="tab-label">{{ tab.aliasName || tab.name
                            }}</span>
                            <span v-else-if="tab.mode == 'voltageLevel'" class="tab-label">{{ tab.aliasName || tab.name
                            }}</span>
                            <span v-else-if="tab.mode == 'bay'" class="tab-label">{{ tab.aliasName || tab.name }}</span>
                            <span v-else-if="tab.mode == 'asset'" class="tab-label">{{ tab.apparatus_id ||
                                tab.serial_number }}</span>
                            <span v-else-if="tab.mode == 'job'" class="tab-label">{{ tab.name }}</span>
                        </div>
                        <span class="close-icon mgr-10 mgl-10"
                            :class="{ visible: hoveredTab === tab.mrid || compareTab(activeTab, tab) }"
                            @click.stop="closeTab(index)">✖</span>
                    </div>
                </div>
                <div class="scroll-btn right" @click="scrollRight"><i class="fa-solid fa-angle-right"></i></div>
            </div>

            <div class="tabs-content">
                <div class="mgr-20 mgt-20 mgb-20 mgl-20">
                    <keep-alive :max="20">
                        <component v-if="activeTab && (activeTab.mrid || activeTab.id)"
                            :key="activeTab.mrid || activeTab.id" :ref="'component_' + (activeTab.mrid || activeTab.id)"
                            mode="update" @reload="handleReload(activeTab, indexTab, $event)" :sideData="sideSign"
                            :is="checkTab(activeTab)" :organisationId="String(activeTab.parentId)"
                            :testTypeListData="testTypeListData" :assetData="assetData"
                            :productAssetModelData="productAssetModelData" :parent="parentOrganization"
                            :locationData="locationData" style="min-height: calc(100vh - 250px);">
                        </component>
                    </keep-alive>

                    <!-- Form server hiện tại chưa có các nút action này ở bản trước của bạn -->
                </div>
            </div>
        </template>
    </div>
</template>

<script>
/* eslint-disable */

import LocationViewData from '@/views/LocationInsert/locationLevelView.vue'
import OrganisationView from '@/views/Organisation/index.vue'
import * as subsMapper from '@/views/Mapping/Substation/index'
import SubstationDto from '@/views/Dto/Substation'
import * as orgMapper from '@/views/Mapping/Organisation/index'
import * as voltageMapper from '@/views/Mapping/VoltageLevel/index'
import * as surgeMapper from '@/views/Mapping/SurgeArrester/index'
import * as bushingMapper from '@/views/Mapping/Bushing/index'
import * as vtMapper from '@/views/Mapping/VoltageTransformer/index'

import * as SurgeArresterJobMapper from '@/views/Mapping/SurgerArresterJob/index'
import * as TransformerJobMapper from '@/views/Mapping/TransformerJob/index'
import * as BushingJobMapper from '@/views/Mapping/BushingJob/index'
import * as CircuitBreakerJobMapper from '@/views/Mapping/CircuitBreakerJob/index'
import * as PowerCableJobMapper from '@/views/Mapping/PowerCableJob/index'
import * as CurrentTransformerJobMapper from '@/views/Mapping/CurrentTransformerJob/index'
import * as CapacitorJobMapper from '@/views/Mapping/CapacitorJob/index'
import * as ReactorJobMapper from '@/views/Mapping/ReactorJob/index'
import * as DisconnectorJobMapper from '@/views/Mapping/DisconnectorJob/index'
import * as RotatingMachineJobMapper from '@/views/Mapping/RotatingMachineJob/index'
import * as VoltageTransformerJobMapper from '@/views/Mapping/VoltageTransformerJob/index'
import * as BayServerMapper from '@/views/Mapping/ServerToDTO/Bay/index.js'
import * as TransformerServerMapper from '@/views/Mapping/ServerToDTO/Transformer/index.js'

import * as disconnectorMapper from '@/views/Mapping/Disconnector/index'
import * as PowerCableMapper from '@/views/Mapping/PowerCable'
import * as RotatingMachineMapper from '@/views/Mapping/RotatingMachine'
import * as currentTransformerMapper from '@/views/Mapping/CurrentTransformer'
import * as CapacitorMapper from '@/views/Mapping/Capacitor'
import * as BreakerMapper from '@/views/Mapping/Breaker'
import * as transformerMapper from '@/views/Mapping/Transformer'
import * as reactorMapper from '@/views/Mapping/Reactor'

import * as demoAPI from '@/api/demo/index.js'
import * as PowerCableServerMapper from '@/views/Mapping/ServerToDTO/PowerCable/index.js'
import * as OrganisationServerMapper from '@/views/Mapping/ServerToDTO/Organisation/index.js'
import * as SubstationServerMapper from '@/views/Mapping/ServerToDTO/Substation/index.js'
import * as VoltageLevelServerMapper from '@/views/Mapping/ServerToDTO/VoltageLevel/index.js'

import VoltageLevel from '@/views/VoltageLevel/index.vue'
import Bay from '@/views/Bay/index.vue'
import SurgeArrester from '@/views/AssetView/SurgeArrester/index.vue'
import Bushing from '@/views/AssetView/Bushing/index.vue'

import SurgeArresterJob from '@/views/JobView/SurgeArrester/index.vue'
import TransformerJob from '@/views/JobView/Transformer/index.vue'
import BushingJob from '@/views/JobView/Bushing/index.vue'
import CircuitBreakerJob from '@/views/JobView/CircuitBreaker/index.vue'
import PowerCableJob from '@/views/JobView/PowerCable/index.vue'
import CurrentTransformerJob from '@/views/JobView/CurrentTransformer/index.vue'
import CapacitorJob from '@/views/JobView/Capacitor/index.vue'
import ReactorJob from '@/views/JobView/Reactor/index.vue'
import DisconnectorJob from '@/views/JobView/Disconnector/index.vue'
import RotatingMachineJob from '@/views/JobView/RotatingMachine/index.vue'
import VoltageTransformerJob from '@/views/JobView/VoltageTransformer/index.vue'
import * as DisconnectorServerMapper from '@/views/Mapping/ServerToDTO/Disconnector/index.js'
import * as BushingServerMapper from '@/views/Mapping/ServerToDTO/Bushing'

import VoltageTransformer from '@/views/AssetView/VoltageTransformer/index.vue'
import Disconnector from '@/views/AssetView/Disconnector/index.vue'
import PowerCable from '@/views/AssetView/PowerCable/index.vue'
import RotatingMachine from '@/views/AssetView/RotatingMachine/index.vue'
import CurrentTransformer from '@/views/AssetView/CurrentTransformer/index.vue'
import Capacitor from '@/views/AssetView/Capacitor/index.vue'
import CircuitBreaker from "@/views/AssetView/CircuitBreaker/index.vue"
import Reactor from '@/views/AssetView/Reactor/index.vue'
import Transformer from '@/views/AssetView/Transformer/index.vue'
import Icon from '@/views/Common/Icon.vue'
import * as SurgeArresterServerMapper from '@/views/Mapping/ServerToDTO/SurgeArrester/index.js'

export default {
    name: "Tabs",
    components: {
        LocationViewData, Transformer, OrganisationView, VoltageLevel, Bay, SurgeArrester, Bushing, VoltageTransformer,
        SurgeArresterJob, TransformerJob, BushingJob, CircuitBreakerJob, PowerCableJob, CurrentTransformerJob,
        CapacitorJob, ReactorJob, VoltageTransformerJob, DisconnectorJob, RotatingMachineJob,
        Disconnector, PowerCable, RotatingMachine, CurrentTransformer, Capacitor, CircuitBreaker, Reactor, Icon
    },
    model: { prop: 'value', event: 'input' },
    props: {
        value: Object,
        tabs: Array,
        side: { type: String, required: true },
    },
    data() {
        return {
            activeTab: this.value,
            testTypeListData: [],
            assetData: {},
            productAssetModelData: {},
            parentOrganization: {},
            locationData: {},
            indexTab: null,
            sideSign: this.side,
            hoveredTab: null,
            canScrollLeft: false,
            canScrollRight: false,
            pendingLoadData: {} // Hàng chờ lưu data để tránh lỗi khi chuyển tab quá nhanh
        }
    },
    watch: {
        value: {
            handler(newVal) {
                this.activeTab = newVal;
            },
            deep: true
        },
        activeTab: {
            handler(newTab) {
                if (!newTab) return;
                const id = newTab.mrid || newTab.id;

                // Nếu user vừa quay lại tab, kiểm tra xem có dữ liệu chờ nạp không
                this.$nextTick(() => {
                    const comp = this.getComponentRef(id);
                    if (comp && this.pendingLoadData[id]) {
                        this.pendingLoadData[id](comp);
                        this.$delete(this.pendingLoadData, id); // Nạp xong thì xóa cache
                    }
                });
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        // Helper method: Lấy đúng component kể cả khi Vue trả về Array
        getComponentRef(id) {
            const refName = 'component_' + id;
            const comp = this.$refs[refName];
            if (!comp) return null;
            return Array.isArray(comp) ? comp[0] : comp;
        },

        // Helper method: Giải quyết việc user nhảy tab trước khi API kịp load xong
        executeOrQueueLoadData(id, loadFn) {
            this.$nextTick(() => {
                const comp = this.getComponentRef(id);
                if (comp) {
                    loadFn(comp); // Tab đang mở -> Nạp luôn
                } else {
                    this.$set(this.pendingLoadData, id, loadFn); // Tab đã ẩn -> Xếp hàng chờ
                }
            });
        },

        handleReload(tab, index, ...args) {
            let savedData
            if (args.length === 1) {
                const eventData = args[0]
                savedData = eventData?.savedData
            } else if (args.length === 2) {
                const eventData = args[1]
                savedData = eventData?.savedData
            }
            this.loadData(tab, index, savedData)
        },
        async loadData(tab, index, savedData) {
            if (this.side === 'client') {
                await this.loadDataClient(tab, index, savedData)
            } else {
                await this.loadDataServer(tab, index, savedData)
            }
        },
        async loadDataClient(tab, index, savedData) {
            try {
                if (index == null) {
                    index = this.tabs.findIndex(t => (t.mrid || t.id) === (tab.mrid || tab.id));
                    if (index === -1) {
                        this.$message.error("Tab not found");
                        return;
                    }
                }
                const id = tab.mrid || tab.id;

                if (tab.mode === 'substation') {
                    let data
                    if (savedData) {
                        data = savedData
                    } else {
                        const [dataLocation, dataPerson, dataEntity] = await Promise.all([
                            window.electronAPI.getLocationByOrganisationId(tab.parentId),
                            window.electronAPI.getPersonByOrganisationId(tab.parentId),
                            window.electronAPI.getSubstationEntityByMrid(tab.mrid, this.$store.state.user.user_id, tab.parentId)
                        ]);

                        data = { locationList: [], personList: [], dto: null, substation: tab }
                        if (dataLocation.success) data.locationList = dataLocation.data;
                        if (dataPerson.success) data.personList = dataPerson.data;

                        if (dataEntity.success) {
                            const dto = subsMapper.mapEntityToDto(dataEntity.data)
                            if (!dto.name || dto.name === '') dto.name = tab.name || ''
                            data.dto = dto
                        } else {
                            const dto = new SubstationDto()
                            dto.name = tab.name || ''
                            dto.subsId = tab.mrid || ''
                            dto.organisationId = tab.parentId || ''
                            data.dto = dto
                        }
                    }

                    this.executeOrQueueLoadData(id, (comp) => comp.loadData(data));

                    if (data.dto) {
                        Object.assign(tab, { name: data.dto.name, aliasName: data.dto.aliasName || data.dto.name })
                    }
                    this.$emit('update-node-data', { mrid: tab.mrid, data: data.dto, mode: 'substation' })
                    this.$emit('refresh-properties', tab)

                } else if (tab.mode === 'organisation') {
                    let orgEntity
                    if (savedData) {
                        orgEntity = savedData
                    } else {
                        const data = await window.electronAPI.getOrganisationEntityByMrid(tab.mrid)
                        if (data.success) {
                            orgEntity = orgMapper.OrgEntityToOrgDto(data.data)
                        } else {
                            const OrganisationDto = require('@/views/Dto/Organisation').default
                            const orgDto = new OrganisationDto()
                            orgDto.name = tab.name || ''
                            orgDto.organisationId = tab.mrid || ''
                            orgDto.parentId = tab.parentId || ''
                            orgEntity = orgDto
                        }
                    }

                    if (!orgEntity.name || orgEntity.name === '') orgEntity.name = tab.name || ''

                    this.executeOrQueueLoadData(id, (comp) => comp.loadData(orgEntity));

                    Object.assign(tab, { name: orgEntity.name, aliasName: orgEntity.aliasName })
                    this.$emit('update-node-data', { mrid: tab.mrid, data: orgEntity })
                    this.$emit('refresh-properties', tab)

                } else if (tab.mode === 'voltageLevel') {
                    let voltageLevelDto
                    if (savedData) {
                        voltageLevelDto = savedData
                    } else {
                        const data = await window.electronAPI.getVoltageLevelEntityByMrid(tab.mrid)
                        if (data.success) {
                            voltageLevelDto = voltageMapper.volEntityToVolDto(data.data)
                            if (!voltageLevelDto.name || voltageLevelDto.name === '') voltageLevelDto.name = tab.name || ''
                        } else {
                            const VoltageLevelDto = require('@/views/Dto/VoltageLevel').default
                            voltageLevelDto = new VoltageLevelDto()
                            voltageLevelDto.name = tab.name || ''
                            voltageLevelDto.voltageLevelId = tab.mrid || ''
                            voltageLevelDto.substationId = tab.parentId || ''
                        }
                    }

                    this.executeOrQueueLoadData(id, (comp) => comp.loadData(voltageLevelDto));

                    Object.assign(tab, { name: voltageLevelDto.name, aliasName: voltageLevelDto.aliasName || voltageLevelDto.name })
                    this.$emit('update-node-data', { mrid: tab.mrid, mode: 'voltageLevel', data: voltageLevelDto })

                } else if (tab.mode === 'bay') {
                    let bayData
                    if (savedData) {
                        bayData = savedData
                    } else {
                        const data = await window.electronAPI.getBayEntityByMrid(tab.mrid)
                        if (data.success) {
                            bayData = data.data
                            if (!bayData.name || bayData.name === '') bayData.name = tab.name || ''
                        } else {
                            bayData = { name: tab.name || '', mrid: tab.mrid || '', voltageLevel: tab.parentId || '' }
                        }
                    }

                    this.executeOrQueueLoadData(id, (comp) => comp.loadData(bayData));

                    Object.assign(tab, { name: bayData.name, aliasName: bayData.aliasName || bayData.name })
                    this.$emit('update-node-data', { mrid: tab.mrid, mode: 'bay', data: bayData })

                } else if (tab.mode === 'asset') {
                    if (savedData) {
                        this.parentOrganization = { mrid: tab.parentId }

                        this.executeOrQueueLoadData(id, (comp) => comp.loadData(savedData));

                        Object.assign(tab, {
                            serial_number: savedData.properties?.serial_no,
                            apparatus_id: savedData.properties?.apparatus_id,
                            manufacturer: savedData.properties?.manufacturer,
                            type: savedData.properties?.type
                        })
                        this.$emit('update-node-data', { mrid: tab.mrid, data: savedData, mode: 'asset', assetType: tab.asset })
                        this.$emit('refresh-properties', tab)
                    } else {
                        if (tab.asset === 'Surge arrester') {
                            this.parentOrganization = { mrid: tab.parentId }
                            const data = await window.electronAPI.getSurgeArresterEntityByMrid(tab.mrid, tab.parentId)
                            if (data.success) {
                                const surgeArresterDto = surgeMapper.mapEntityToDto(data.data)
                                if (!surgeArresterDto.properties?.serial_no) surgeArresterDto.properties = { serial_no: tab.serial_number || '' }

                                this.executeOrQueueLoadData(id, (comp) => comp.loadData(surgeArresterDto));

                                this.$emit('update-node-data', { mrid: tab.mrid, data: surgeArresterDto, mode: 'asset', assetType: tab.asset })
                            }
                        } else if (tab.asset === 'Bushing') {
                            this.parentOrganization = { mrid: tab.parentId }
                            const data = await window.electronAPI.getBushingEntityByMrid(tab.mrid, tab.parentId)
                            if (data.success) {
                                const BushingDto = bushingMapper.mapEntityToDto(data.data)
                                if (!BushingDto.properties?.serial_no) BushingDto.properties = { serial_no: tab.serial_number || '' }

                                this.executeOrQueueLoadData(id, (comp) => comp.loadData(BushingDto));

                                this.$emit('update-node-data', { mrid: tab.mrid, data: BushingDto, mode: 'asset', assetType: tab.asset })
                            }
                        } else if (tab.asset === 'Current transformer') {
                            this.parentOrganization = { mrid: tab.parentId }
                            const data = await window.electronAPI.getCurrentTransformerEntityByMrid(tab.mrid, tab.parentId)
                            if (data.success) {
                                const currentTransformerDto = currentTransformerMapper.mapEntityToDto(data.data)
                                if (!currentTransformerDto.properties?.serial_no) currentTransformerDto.properties = { serial_no: tab.serial_number || '' }

                                this.executeOrQueueLoadData(id, (comp) => comp.loadData(currentTransformerDto));

                                this.$emit('update-node-data', { mrid: tab.mrid, data: currentTransformerDto, mode: 'asset', assetType: tab.asset })
                            }
                        } else if (tab.asset === 'Voltage transformer') {
                            this.parentOrganization = { mrid: tab.parentId }
                            const data = await window.electronAPI.getVoltageTransformerEntityByMrid(tab.mrid, tab.parentId)
                            if (data.success) {
                                const vtDto = vtMapper.mapEntityToDto(data.data)
                                if (!vtDto.properties?.serial_no) vtDto.properties = { serial_no: tab.serial_number || '' }

                                this.executeOrQueueLoadData(id, (comp) => comp.loadData(vtDto));

                                this.$emit('update-node-data', { mrid: tab.mrid, data: vtDto, mode: 'asset', assetType: tab.asset })
                            }
                        } else if (tab.asset === 'Disconnector') {
                            this.parentOrganization = { mrid: tab.parentId }
                            const data = await window.electronAPI.getDisconnectorEntityByMrid(tab.mrid, tab.parentId)
                            if (data.success) {
                                const disconnectorDto = disconnectorMapper.disconnectorEntityToDto(data.data)
                                if (!disconnectorDto.properties?.serial_no) disconnectorDto.properties = { serial_no: tab.serial_number || '' }

                                this.executeOrQueueLoadData(id, (comp) => comp.loadData(disconnectorDto));

                                this.$emit('update-node-data', { mrid: tab.mrid, data: disconnectorDto, mode: 'asset', assetType: tab.asset })
                            }
                        } else if (tab.asset === 'Power cable') {
                            this.parentOrganization = { mrid: tab.parentId }
                            const data = await window.electronAPI.getPowerCableEntityByMrid(tab.mrid, tab.parentId)
                            if (data.success) {
                                const powerCableDto = PowerCableMapper.mapEntityToDto(data.data)
                                if (!powerCableDto.properties?.serial_no) powerCableDto.properties = { serial_no: tab.serial_number || '' }

                                this.executeOrQueueLoadData(id, (comp) => comp.loadData(powerCableDto));

                                this.$emit('update-node-data', { mrid: tab.mrid, data: powerCableDto, mode: 'asset', assetType: tab.asset })
                            }
                        } else if (tab.asset === 'Rotating machine') {
                            this.parentOrganization = { mrid: tab.parentId }
                            const data = await window.electronAPI.getRotatingMachineEntityByMrid(tab.mrid, tab.parentId)
                            if (data.success) {
                                const rotatingMachineDto = RotatingMachineMapper.mapEntityToDto(data.data)
                                if (!rotatingMachineDto.properties?.serial_no) rotatingMachineDto.properties = { serial_no: tab.serial_number || '' }

                                this.executeOrQueueLoadData(id, (comp) => comp.loadData(rotatingMachineDto));

                                this.$emit('update-node-data', { mrid: tab.mrid, data: rotatingMachineDto, mode: 'asset', assetType: tab.asset })
                            }
                        } else if (tab.asset === 'Capacitor') {
                            this.parentOrganization = { mrid: tab.parentId }
                            const data = await window.electronAPI.getCapacitorEntityByMrid(tab.mrid, tab.parentId)
                            if (data.success) {
                                const capacitorDto = CapacitorMapper.mapEntityToDto(data.data)
                                if (!capacitorDto.properties?.serial_no) capacitorDto.properties = { serial_no: tab.serial_number || '' }

                                this.executeOrQueueLoadData(id, (comp) => comp.loadData(capacitorDto));

                                this.$emit('update-node-data', { mrid: tab.mrid, data: capacitorDto, mode: 'asset', assetType: tab.asset })
                            }
                        } else if (tab.asset === 'Circuit breaker') {
                            this.parentOrganization = { mrid: tab.parentId }
                            const data = await window.electronAPI.getBreakerEntityByMrid(tab.mrid, tab.parentId)
                            if (data.success) {
                                const breakerDto = BreakerMapper.mapEntityToDto(data.data)
                                if (!breakerDto.properties?.serial_no) breakerDto.properties = { serial_no: tab.serial_number || '' }

                                this.executeOrQueueLoadData(id, (comp) => comp.loadData(breakerDto));

                                this.$emit('update-node-data', { mrid: tab.mrid, data: breakerDto, mode: 'asset', assetType: tab.asset })
                            }
                        } else if (tab.asset === 'Transformer') {
                            this.parentOrganization = { mrid: tab.parentId }
                            const data = await window.electronAPI.getTransformerEntityByMrid(tab.mrid, tab.parentId)
                            if (data.success) {
                                const transformerDto = transformerMapper.transformerEntityToDto(data.data)
                                if (!transformerDto.properties?.serial_no) transformerDto.properties = { serial_no: tab.serial_number || '' }

                                this.executeOrQueueLoadData(id, (comp) => comp.loadData(transformerDto));

                                this.$emit('update-node-data', { mrid: tab.mrid, data: transformerDto, mode: 'asset', assetType: tab.asset })
                            }
                        } else if (tab.asset === 'Reactor') {
                            this.parentOrganization = { mrid: tab.parentId }
                            const data = await window.electronAPI.getReactorEntityByMrid(tab.mrid, tab.parentId)
                            if (data.success) {
                                const reactorDto = reactorMapper.mapEntityToDto(data.data)
                                if (!reactorDto.properties?.serial_no) reactorDto.properties = { serial_no: tab.serial_number || '' }

                                this.executeOrQueueLoadData(id, (comp) => comp.loadData(reactorDto));

                                this.$emit('update-node-data', { mrid: tab.mrid, data: reactorDto, mode: 'asset', assetType: tab.asset })
                            }
                        }
                    }
                } else if (tab.mode === 'job') {
                    const dataAsset = await window.electronAPI.getAssetByMrid(tab.parentId)
                    if (dataAsset.success) {
                        this.assetData = dataAsset.data
                        this.parentOrganization = dataAsset.data
                        const [dataLocation, dataProductAssetModel] = await Promise.all([
                            window.electronAPI.getLocationDetailByMrid(dataAsset.data.location),
                            window.electronAPI.getProductAssetModelByMrid(dataAsset.data.product_asset_model)
                        ]);
                        this.locationData = dataLocation.success ? dataLocation.data : {}
                        this.productAssetModelData = dataProductAssetModel.success ? dataProductAssetModel.data : {}
                    } else {
                        this.assetData = {}
                        this.locationData = {}
                        this.productAssetModelData = {}
                    }

                    if (tab.job === 'Surge arrester') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Surge arrester")
                        this.testTypeListData = dataTestType.success ? dataTestType.data : []
                        const dataSurgeArrester = await window.electronAPI.getSurgeArresterByMrid(tab.parentId)
                        this.assetData = dataSurgeArrester.success ? dataSurgeArrester.data : {}

                        const data = await window.electronAPI.getSurgeArresterJobByMrid(tab.mrid)
                        if (data.success) {
                            const surgeArresterJobDto = SurgeArresterJobMapper.JobEntityToDto(data.data)
                            for (const test of surgeArresterJobDto.testList) {
                                for (const type of this.testTypeListData) {
                                    if (test.testTypeCode === type.alias_name) {
                                        test.testTypeName = type.name
                                        test.testTypeId = type.mrid
                                        break
                                    }
                                }
                            }
                            this.executeOrQueueLoadData(id, (comp) => {
                                comp.loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData);
                                comp.loadData(surgeArresterJobDto);
                            });
                        }
                    } else if (tab.job === 'Power cable') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Power cable")
                        this.testTypeListData = dataTestType.success ? dataTestType.data : []
                        const dataPowerCable = await window.electronAPI.getPowerCableEntityByMrid(tab.parentId)
                        if (dataPowerCable.success && dataPowerCable.data) {
                            // Map entity to pro format like other asset types
                            this.assetData = PowerCableMapper.mapEntityToDto(dataPowerCable.data)
                        } else {
                            this.assetData = {}
                        }

                        const data = await window.electronAPI.getPowerCableJobByMrid(tab.mrid)
                        if (data.success) {
                            const powerCableJobDto = PowerCableJobMapper.JobEntityToDto(data.data)
                            for (const test of powerCableJobDto.testList) {
                                for (const type of this.testTypeListData) {
                                    if (test.testTypeCode === type.alias_name) {
                                        test.testTypeName = type.name
                                        test.testTypeId = type.mrid
                                        break
                                    }
                                }
                            }
                            this.executeOrQueueLoadData(id, (comp) => {
                                comp.loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData);
                                comp.loadData(powerCableJobDto);
                            });
                        }
                    } else if (tab.job === 'Transformer') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Transformer")
                        this.testTypeListData = dataTestType.success ? dataTestType.data : []
                        const dataTransformer = await window.electronAPI.getTransformerEntityByMrid(tab.parentId)
                        this.assetData = dataTransformer.success ? transformerMapper.transformerEntityToDto(dataTransformer.data) : {}

                        const data = await window.electronAPI.getTransformerJobByMrid(tab.mrid)
                        if (data.success) {
                            const transformerJobDto = TransformerJobMapper.JobEntityToDto(data.data)
                            for (const test of transformerJobDto.testList) {
                                for (const type of this.testTypeListData) {
                                    if (test.testTypeCode === type.code) {
                                        test.testTypeName = type.name
                                        test.testTypeId = type.mrid
                                        break
                                    }
                                }
                            }
                            this.executeOrQueueLoadData(id, (comp) => {
                                comp.loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData);
                                comp.loadData(transformerJobDto);
                            });
                        }
                    } else if (tab.job === 'Voltage transformer') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Voltage transformer")
                        this.testTypeListData = dataTestType.success ? dataTestType.data : []
                        const dataVoltageTransformer = await window.electronAPI.getVoltageTransformerEntityByMrid(tab.parentId)
                        if (dataVoltageTransformer.success) {
                            this.assetData = vtMapper.mapEntityToDto(dataVoltageTransformer.data)
                            const [dataLocation, dataProductAssetModel] = await Promise.all([
                                window.electronAPI.getLocationDetailByMrid(this.assetData.locationId),
                                window.electronAPI.getProductAssetModelByMrid(this.assetData.productAssetModelId)
                            ]);
                            this.locationData = dataLocation.success ? dataLocation.data : {}
                            this.productAssetModelData = dataProductAssetModel.success ? dataProductAssetModel.data : {}
                        }

                        const data = await window.electronAPI.getVoltageTransformerJobByMrid(tab.mrid)
                        if (data.success) {
                            const voltageTransformerJobDto = VoltageTransformerJobMapper.JobEntityToDto(data.data)
                            for (const test of voltageTransformerJobDto.testList) {
                                for (const type of this.testTypeListData) {
                                    if (test.testTypeCode === type.code) {
                                        test.testTypeName = type.name
                                        test.testTypeId = type.mrid
                                        break
                                    }
                                }
                            }
                            this.executeOrQueueLoadData(id, (comp) => {
                                comp.loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData);
                                comp.loadData(voltageTransformerJobDto);
                            });
                        }
                    } else if (tab.job === 'Current transformer') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Current transformer")
                        this.testTypeListData = dataTestType.success ? dataTestType.data : []
                        const dataCurrentTransformer = await window.electronAPI.getCurrentTransformerEntityByMrid(tab.parentId)
                        this.assetData = dataCurrentTransformer.success ? currentTransformerMapper.mapEntityToDto(dataCurrentTransformer.data) : {}

                        const data = await window.electronAPI.getCurrentTransformerJobByMrid(tab.mrid)
                        if (data.success) {
                            const currentTransformerJobDto = CurrentTransformerJobMapper.JobEntityToDto(data.data)
                            for (const test of currentTransformerJobDto.testList) {
                                for (const type of this.testTypeListData) {
                                    if (test.testTypeCode === type.code) {
                                        test.testTypeName = type.name
                                        test.testTypeId = type.mrid
                                        break
                                    }
                                }
                            }
                            this.executeOrQueueLoadData(id, (comp) => {
                                comp.loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData);
                                comp.loadData(currentTransformerJobDto);
                            });
                        }
                    } else if (tab.job === 'Disconnector') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Disconnector")
                        this.testTypeListData = dataTestType.success ? dataTestType.data : []
                        const dataDisconnector = await window.electronAPI.getDisconnectorEntityByMrid(tab.parentId)
                        this.assetData = dataDisconnector.success ? disconnectorMapper.disconnectorEntityToDto(dataDisconnector.data) : {}

                        const data = await window.electronAPI.getDisconnectorJobByMrid(tab.mrid)
                        if (data.success) {
                            const disconnectorJobDto = DisconnectorJobMapper.JobEntityToDto(data.data)
                            for (const test of disconnectorJobDto.testList) {
                                for (const type of this.testTypeListData) {
                                    if (test.testTypeCode === type.code || test.testTypeCode === type.alias_name) {
                                            test.testTypeName = type.name
                                        test.testTypeId = type.mrid
                                        break
                                    }
                                }
                            }
                            this.executeOrQueueLoadData(id, (comp) => {
                                comp.loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData);
                                comp.loadData(disconnectorJobDto);
                            });
                        }
                    } else if (tab.job === 'Rotating machine') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Rotating machine")
                        this.testTypeListData = dataTestType.success ? dataTestType.data : []
                        const dataRotatingMachine = await window.electronAPI.getRotatingMachineEntityByMrid(tab.parentId)
                        this.assetData = dataRotatingMachine.success ? RotatingMachineMapper.mapEntityToDto(dataRotatingMachine.data) : {}

                        const data = await window.electronAPI.getRotatingMachineJobByMrid(tab.mrid)
                        if (data.success) {
                            const rotatingMachineJobDto = RotatingMachineJobMapper.JobEntityToDto(data.data)
                            for (const test of rotatingMachineJobDto.testList) {
                                for (const type of this.testTypeListData) {
                                    if (test.testTypeCode === type.code) {
                                        test.testTypeName = type.name
                                        test.testTypeId = type.mrid
                                        break
                                    }
                                }
                            }
                            this.executeOrQueueLoadData(id, (comp) => {
                                comp.loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData);
                                comp.loadData(rotatingMachineJobDto);
                            });
                        }
                    } else if (tab.job === 'Reactor') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Reactor")
                        this.testTypeListData = dataTestType.success ? dataTestType.data : []
                        const dataReactor = await window.electronAPI.getReactorByMrid(tab.parentId)
                        this.assetData = dataReactor.success ? dataReactor.data : {}

                        const data = await window.electronAPI.getReactorJobByMrid(tab.mrid)
                        if (data.success) {
                            const reactorJobDto = ReactorJobMapper.JobEntityToDto(data.data)
                            for (const test of reactorJobDto.testList) {
                                for (const type of this.testTypeListData) {
                                    if (test.testTypeCode === type.code) {
                                        test.testTypeName = type.name
                                        test.testTypeId = type.mrid
                                        break
                                    }
                                }
                            }
                            this.executeOrQueueLoadData(id, (comp) => {
                                comp.loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData);
                                comp.loadData(reactorJobDto);
                            });
                        }
                    } else if (tab.job === 'Capacitor') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Capacitor")
                        this.testTypeListData = dataTestType.success ? dataTestType.data : []
                        const dataCapacitor = await window.electronAPI.getCapacitorEntityByMrid(tab.parentId)
                        this.assetData = dataCapacitor.success ? CapacitorMapper.mapEntityToDto(dataCapacitor.data) : {}

                        const data = await window.electronAPI.getCapacitorJobByMrid(tab.mrid)
                        if (data.success) {
                            const capacitorJobDto = CapacitorJobMapper.JobEntityToDto(data.data)
                            for (const test of capacitorJobDto.testList) {
                                for (const type of this.testTypeListData) {
                                    if (test.testTypeCode === type.code) {
                                        test.testTypeName = type.name
                                        test.testTypeId = type.mrid
                                        break
                                    }
                                }
                            }
                            this.executeOrQueueLoadData(id, (comp) => {
                                comp.loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData);
                                comp.loadData(capacitorJobDto);
                            });
                        }
                    } else if (tab.job === 'Bushing') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Bushing")
                        this.testTypeListData = dataTestType.success ? dataTestType.data : []
                        const dataBushing = await window.electronAPI.getBushingByMrid(tab.parentId)
                        this.assetData = dataBushing.success ? dataBushing.data : {}

                        const data = await window.electronAPI.getBushingJobByMrid(tab.mrid)
                        if (data.success) {
                            const bushingJobDto = BushingJobMapper.JobEntityToDto(data.data)
                            for (const test of bushingJobDto.testList) {
                                for (const type of this.testTypeListData) {
                                    if (test.testTypeCode === type.code) {
                                        test.testTypeName = type.name
                                        test.testTypeId = type.mrid
                                        break
                                    }
                                }
                            }
                            this.executeOrQueueLoadData(id, (comp) => {
                                comp.loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData);
                                comp.loadData(bushingJobDto);
                            });
                        }
                    } else if (tab.job === 'Circuit breaker') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Circuit breaker")
                        this.testTypeListData = dataTestType.success ? dataTestType.data : []
                        const dataCircuitBreaker = await window.electronAPI.getBreakerEntityByMrid(tab.parentId)
                        this.assetData = dataCircuitBreaker.success ? BreakerMapper.mapEntityToDto(dataCircuitBreaker.data) : {}

                        const data = await window.electronAPI.getCircuitBreakerJobByMrid(tab.mrid)
                        if (data.success) {
                            const circuitBreakerJobDto = CircuitBreakerJobMapper.JobEntityToDto(data.data)
                            for (const test of circuitBreakerJobDto.testList) {
                                for (const type of this.testTypeListData) {
                                    if (test.testTypeCode === type.code) {
                                        test.testTypeName = type.name
                                        test.testTypeId = type.mrid
                                        break
                                    }
                                }
                            }
                            this.executeOrQueueLoadData(id, (comp) => {
                                comp.loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData);
                                comp.loadData(circuitBreakerJobDto);
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading data:", error);
            }
        },
        async loadDataServer(tab, index) {
            try {
                const id = tab.mrid || tab.id;
                if (tab.mode === 'substation') {
                    const response = await demoAPI.getSubstationById(tab.mrid);
                    if (response) {
                        const dto = SubstationServerMapper.mapServerToDto(response.data || response);
                        this.executeOrQueueLoadData(id, (comp) => {
                            comp.loadData({ dto: dto, locationList: [], personList: [] });
                        });
                    }
                }
                else if (tab.mode === 'voltageLevel') {
                    const response = await demoAPI.getVoltageLevelById(tab.mrid);
                    if (response) {
                        const dto = VoltageLevelServerMapper.mapServerToDto(response.data || response);
                        this.executeOrQueueLoadData(id, (comp) => comp.loadData(dto));
                    }
                }
                else if (tab.mode === 'bay') {
                    const response = await demoAPI.getBayById(tab.mrid);
                    if (response) {
                        const dto = BayServerMapper.mapServerToDto(response.data || response);
                        if (!dto.voltageLevel && !dto.substation) dto.parentId = tab.parentId;
                        this.executeOrQueueLoadData(id, (comp) => comp.loadData(dto));
                    }
                }
                else if (tab.mode === 'organisation') {
                    // 1. Gọi API lấy full data của Organisation
                    const response = await demoAPI.getOrganisationById(tab.mrid || tab.id);
                    console.log("Response from server for Organisation:", response);
                    if (response) {
                        const serverData = response.data || response;
                        
                        // 2. Map dữ liệu chuẩn qua DTO
                        const dto = OrganisationServerMapper.mapServerToDto(serverData);

                        // 3. Đảm bảo cấu trúc positionPoints luôn tồn tại để UI không bị lỗi undefined
                        if (!dto.positionPoints) {
                            dto.positionPoints = { x: [], y: [], z: [] };
                        } else {
                            if (!dto.positionPoints.x) dto.positionPoints.x = [];
                            if (!dto.positionPoints.y) dto.positionPoints.y = [];
                            if (!dto.positionPoints.z) dto.positionPoints.z = [];
                        }

                        // 4. Đẩy data vào View (SỬA LẠI Ở ĐÂY: Truyền trực tiếp dto)
                        this.executeOrQueueLoadData(id, (comp) => {
                            comp.loadData(dto);
                        });
                    } else {
                        this.$message.error("Failed to load Organisation data");
                    }

                    // this.executeOrQueueLoadData(id, (comp) => {
                    //     comp.loadData({ dto: dto, locationList: [], personList: [] });
                    // });

                }
                else if (tab.mode === 'asset' && tab.asset === 'Transformer') {
                    const response = await demoAPI.getTransformerById(tab.mrid);
                    if (response) {
                        const dto = TransformerServerMapper.mapServerToDto(response.data || response);
                        this.executeOrQueueLoadData(id, (comp) => comp.loadData(dto));
                    }
                }
                else if (tab.mode == 'asset' && tab.asset === 'Power cable') {
                    const response = await demoAPI.getAssetById(tab.mrid, 'PowerCable');
                    if (response) {
                        const dto = PowerCableServerMapper.mapServerToDto(response);
                        this.executeOrQueueLoadData(id, (comp) => comp.loadData(dto));
                    }
                }
                else if (tab.mode === 'asset' && tab.asset === 'Surge arrester') {
                    // API getAssetById nhận mode là "SurgeArrester"
                    const response = await demoAPI.getAssetById(tab.mrid, 'SurgeArrester');
                    console.log("Response from server for SurgeArrester:", response);

                    if (response) {
                        // Trích xuất dữ liệu từ response
                        const serverData = response.data || response;
                        
                        // Map sang cấu trúc DTO cho UI
                        const dto = SurgeArresterServerMapper.mapServerToDto(serverData);

                        this.executeOrQueueLoadData(id, (comp) => comp.loadData(dto));
                    } else {
                        this.$message.error("Failed to load Surge Arrester data");
                    }
                }
                 else if (tab.mode === 'asset' && tab.asset === 'Disconnector') {
                    const response = await demoAPI.getAssetById(tab.mrid, 'Disconnector');
                    console.log("Response from server for Disconnector:", response);

                    if (response) {
                        const serverData = response.data || response;
                        const dto = DisconnectorServerMapper.mapServerToDto(serverData);
                        this.executeOrQueueLoadData(id, (comp) => comp.loadData(dto));
                    } else {
                        this.$message.error("Failed to load Disconnector data");
                    }
                }
                else if (tab.mode === 'asset' && tab.asset === 'Bushing') {
    const response = await demoAPI.getAssetById(tab.mrid, 'Bushing');
    console.log("Response from server for Bushing:", response);
    if (response) {
        const serverData = response.data || response;
        const dto = BushingServerMapper.mapServerToDto(serverData);
        this.executeOrQueueLoadData(id, (comp) => comp.loadData(dto));
    } else {
        this.$message.error("Failed to load Bushing data");
    }
}
            } catch (error) {
                console.error("Error loading data from server:", error);
            }
        },
        async selectTab(tab, index) {
            this.activeTab = tab;
            this.indexTab = index;
            this.$emit('input', tab);

            this.$nextTick(() => {
                const id = tab.mrid || tab.id;
                const comp = this.getComponentRef(id);
                if (comp && comp.loadMapForView) {
                    comp.loadMapForView();
                }
            });
        },
        compareTab(tab1, tab2) {
            if (!tab1 || !tab2) return false;
            return (tab1.mrid || tab1.id) === (tab2.mrid || tab2.id);
        },
        closeTab(index) {
            this.$emit('close-tab', index)
            if (this.indexTab === index) {
                this.indexTab = null;
            }
        },
        checkScroll() {
            this.$nextTick(() => {
                const header = this.$refs.tabsHeader
                if (header) {
                    this.canScrollLeft = header.scrollLeft > 0
                    this.canScrollRight = header.scrollLeft + header.clientWidth < header.scrollWidth
                }
            })
        },
        scrollLeft() { this.scrollTabs(-2) },
        scrollRight() { this.scrollTabs(2) },
        scrollTabs(step) {
            this.$nextTick(() => {
                const header = this.$refs.tabsHeader;
                const tabItems = this.$refs.tabItems;
                if (!header || !tabItems || tabItems.length === 0) return;
                const moveBy = step * (tabItems[0].offsetWidth || 50);
                if (moveBy) {
                    header.scrollBy({ left: moveBy, behavior: 'smooth' });
                    setTimeout(this.checkScroll, 300);
                }
            });
        },
        checkTab(tab) {
            if (tab.mode == 'substation') return 'LocationViewData'
            else if (tab.mode == 'organisation') return 'OrganisationView'
            else if (tab.mode == 'voltageLevel') return 'VoltageLevel'
            else if (tab.mode == 'bay') return 'Bay'
            else if (tab.mode == 'asset') {
                if (tab.asset === 'Surge arrester') return 'SurgeArrester'
                else if (tab.asset === 'Bushing') return 'Bushing'
                else if (tab.asset === 'Voltage transformer') return 'VoltageTransformer'
                else if (tab.asset === 'Disconnector') return 'Disconnector'
                else if (tab.asset === 'Power cable') return 'PowerCable'
                else if (tab.asset === 'Rotating machine') return 'RotatingMachine'
                else if (tab.asset === 'Current transformer') return 'CurrentTransformer'
                else if (tab.asset === 'Capacitor') return 'Capacitor'
                else if (tab.asset === 'Circuit breaker') return 'CircuitBreaker'
                else if (tab.asset === 'Transformer') return 'Transformer'
                else if (tab.asset === 'Reactor') return 'Reactor'
            } else if (tab.mode == 'job') {
                if (tab.job === 'Surge arrester') return 'SurgeArresterJob'
                else if (tab.job === 'Transformer') return 'TransformerJob'
                else if (tab.job === 'Voltage transformer') return 'VoltageTransformerJob'
                else if (tab.job === 'Current transformer') return 'CurrentTransformerJob'
                else if (tab.job === 'Disconnector') return 'DisconnectorJob'
                else if (tab.job === 'Rotating machine') return 'RotatingMachineJob'
                else if (tab.job === 'Reactor') return 'ReactorJob'
                else if (tab.job === 'Capacitor') return 'CapacitorJob'
                else if (tab.job === 'Bushing') return 'BushingJob'
                else if (tab.job === 'Circuit breaker') return 'CircuitBreakerJob'
                else if (tab.job === 'Power cable') return 'PowerCableJob'
            }
        },
        saveCtrlS() {
            try {
                if (this.activeTab) {
                    const id = this.activeTab.mrid || this.activeTab.id;
                    const comp = this.getComponentRef(id);
                    if (comp && comp.saveCtrS) {
                        comp.saveCtrS();
                    }
                } else {
                    this.$message.error("Please select a tab to save data.")
                }
            } catch (error) {
                console.error("Error saving data:", error);
            }
        }
    }
}
</script>

<style scoped>
/* CSS giữ nguyên như cũ không thay đổi */
.custom-tabs {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.tabs-header {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    height: 40px;
}

.tabs-header-data {
    display: flex;
    height: 100%;
    padding: 3px;
    gap: 8px;
    box-sizing: border-box;
    width: calc(100% - 40px);
    border-bottom: 1px rgb(224, 222, 222) solid;
    flex-wrap: nowrap;
    overflow-x: hidden;
    overflow-y: hidden;
}

.tab-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: border-bottom 0.3s;
    height: 100%;
    white-space: nowrap;
}

.tab-item.active {
    border-bottom: 3px solid #012596;
    font-weight: bold;
}

.icon-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
}

.close-icon {
    cursor: pointer;
    color: red;
    font-size: 14px;
    visibility: hidden;
    width: 20px;
    text-align: center;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}

.close-icon.visible {
    visibility: visible;
}

.scroll-btn {
    box-sizing: border-box;
    display: flex;
    height: 100%;
    cursor: pointer;
    font-size: 15px;
    color: #012596;
    align-items: center;
    justify-content: center;
    width: 20px;
}

.tabs-content {
    width: 100%;
    height: calc(100% - 40px);
    overflow-y: auto;
    overflow-x: auto;
    scrollbar-width: none;
}

.tabs-content::-webkit-scrollbar {
    width: 0;
}

.tab-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 10px;
    width: 100%;
}
</style>