<!-- eslint-disable -->
<template>
    <div v-if="side == 'client'" ref="customTabs" class="custom-tabs">
        <div class="tabs-header">
            <div class="scroll-btn left" @click="scrollLeft"><i class="fa-solid fa-chevron-left"></i></div>
            <div class="tabs-header-data" ref="tabsHeader" @scroll="checkScroll">
                <div v-for="(tab, index) in tabs" :key="tab.mrid" @click="selectTab(tab, index)"
                    @mouseover="hoveredTab = tab.mrid" @mouseleave="hoveredTab = null" class="tab-item"
                    :class="{ active: activeTab.mrid === tab.mrid }" ref="tabItems">
                    <div class="icon-wrapper mgl-10">
                        <icon v-if="tab.mode == 'substation'" size="16px" folderType="location" badgeColor="146EBE"></icon>
                        <icon v-else-if="tab.mode == 'voltageLevel'" size="16px" folderType="voltageLevel" badgeColor="146EBE"></icon>
                        <icon v-else-if="tab.mode == 'bay'" size="16px" folderType="bay" badgeColor="146EBE"></icon>
                        <icon v-else-if="tab.mode == 'asset'" 
                            size="16px" 
                            folderType="asset" 
                            :assetDetail="tab.asset" 
                            :transformerType="tab.type" 
                            badgeColor="146EBE">
                        </icon>
                        <icon v-else-if="tab.mode == 'job'" size="16px" folderType="job" badgeColor="FF0000"></icon>
                        <icon v-else-if="tab.mode == 'test'" size="16px" folderType="test" badgeColor="008001"></icon>
                        <icon v-else size="16px" folderType="building" badgeColor="008001"></icon>
                        <span v-if="tab.mode == 'organisation'" class="tab-label">{{ tab.name }}</span>
                        <span v-else-if="tab.mode == 'substation'" class="tab-label">{{ tab.name }}</span>
                        <span v-else-if="tab.mode == 'voltageLevel'" class="tab-label">{{ tab.name }}</span>
                        <span v-else-if="tab.mode == 'bay'" class="tab-label">{{ tab.name }}</span>
                        <span v-else-if="tab.mode == 'asset'" class="tab-label">{{ tab.apparatus_id || tab.serial_number }}</span>
                        <span v-else-if="tab.mode == 'job'" class="tab-label">{{ tab.name }}</span>
                    </div>
                    <span class="close-icon mgr-10 mgl-10"
                        :class="{ visible: hoveredTab === tab.mrid || activeTab.mrid === tab.mrid }"
                        @click.stop="closeTab(index)">✖</span>
                </div>
            </div>
            <div class="scroll-btn right" @click="scrollRight"><i class="fa-solid fa-angle-right"></i></div>
        </div>
        <div class="tabs-content">
            <div v-show="activeTab.mrid === item.mrid" class="mgr-20 mgt-20 mgb-20 mgl-20" v-for="(item, index) in tabs" :key="item.mrid">
                <component mode="update" @reload="handleReload(item, index, $event)"
                    ref="componentLoadData" :sideData="sideSign" :is="checkTab(item)" :organisationId="item.parentId"
                    :parent="parentOrganization"
                    style="min-height: calc(100vh - 250px);">
                </component>
                <span class="tab-actions">
                    <el-button size="small" type="danger" @click="closeTab(index)">Close</el-button>
                    <el-button size="small" type="primary" @click="saveCtrlS()">Save</el-button>
                </span>
            </div>
        </div>
    </div>
    <div v-else class="custom-tabs" ref="customTabsServer">
        <div class="tabs-header">
            <div class="scroll-btn left" @click="scrollLeft"><i class="fa-solid fa-chevron-left"></i></div>
            <div class="tabs-header-data" ref="tabsHeader" @scroll="checkScroll">
                <div v-for="(tab, index) in tabs" :key="tab.mrid || tab.id" @click="selectTab(tab, index)"
                    @mouseover="hoveredTab = tab.mrid" @mouseleave="hoveredTab = null" class="tab-item"
                    :class="{ active: compareTab(activeTab, tab) }" ref="tabItems">
                    <div class="icon-wrapper mgl-10">
                        <icon v-if="tab.mode == 'substation'" size="16px" folderType="location" badgeColor="146EBE"></icon>
                        <icon v-else-if="tab.mode == 'voltageLevel'" size="16px" folderType="voltageLevel" badgeColor="146EBE"></icon>
                        <icon v-else-if="tab.mode == 'bay'" size="16px" folderType="bay" badgeColor="146EBE"></icon>
                        <icon v-else-if="tab.mode == 'asset'" 
                            size="16px" 
                            folderType="asset" 
                            :assetDetail="tab.asset" 
                            :transformerType="tab.type" 
                            badgeColor="146EBE">
                        </icon>
                        <icon v-else-if="tab.mode == 'job'" size="16px" folderType="job" badgeColor="FF0000"></icon>
                        <icon v-else-if="tab.mode == 'test'" size="16px" folderType="test" badgeColor="008001"></icon>
                        <icon v-else size="16px" folderType="building" badgeColor="008001"></icon>
                        <span v-if="tab.mode == 'organisation'" class="tab-label">{{ tab.aliasName || tab.name }}</span>
                        <span v-else-if="tab.mode == 'substation'" class="tab-label">{{ tab.name }}</span>
                        <span v-else-if="tab.mode == 'voltageLevel'" class="tab-label">{{ tab.name }}</span>
                        <span v-else-if="tab.mode == 'bay'" class="tab-label">{{ tab.name }}</span>
                        <span v-else-if="tab.mode == 'asset'" class="tab-label">{{ tab.apparatus_id || tab.serial_number }}</span>
                        <span v-else-if="tab.mode == 'job'" class="tab-label">{{ tab.name }}</span>
                    </div>
                    <span class="close-icon mgr-10 mgl-10"
                        :class="{ visible: hoveredTab === tab.mrid || activeTab.mrid === tab.mrid }"
                        @click.stop="closeTab(index)">✖</span>
                </div>
            </div>
            <div class="scroll-btn right" @click="scrollRight"><i class="fa-solid fa-angle-right"></i></div>
        </div>
        <div class="tabs-content">
            <div class="mgr-20 mgt-20 mgb-20 mgl-20" v-for="(item, index) in tabs" :key="item.mrid || item.id">
                <component mode="update" @reload="handleReload(item, index, $event)" v-show="compareTab(activeTab, item)"
                    ref="componentLoadData" :sideData="sideSign" :is="checkTab(item)" :organisationId="String(item.parentId)"
                    :testTypeListData="testTypeListData" :assetData="assetData"
                    :productAssetModelData="productAssetModelData" :parent="parentOrganization"
                    :locationData="locationData" style="min-height: calc(100vh - 250px);">
                </component>
            </div>
        </div>
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

export default {
    name: "Tabs",
    components: {
        LocationViewData,
        Transformer,
        OrganisationView,
        VoltageLevel,
        Bay,
        SurgeArrester,
        Bushing,
        VoltageTransformer,

        SurgeArresterJob,
        TransformerJob,
        BushingJob,
        CircuitBreakerJob,
        PowerCableJob,
        CurrentTransformerJob,
        CapacitorJob,
        ReactorJob,
        VoltageTransformerJob,
        DisconnectorJob,
        RotatingMachineJob,

        Disconnector,
        PowerCable,
        RotatingMachine,
        CurrentTransformer,
        Capacitor,
        CircuitBreaker,
        Reactor,
        Icon
    },
    model: {
        prop: 'value',
        event: 'input'
    },
    props: {
        value: Object,
        tabs: Array,
        side: {
            type: String,
            required: true
        },
    },
    data() {
        return {
            activeTab: this.value,
            testTypeListData: [],
            assetData: {},
            productAssetModelData: {},
            parentOrganization: {},
            locationData: {},
            tabsData: [],
            indexTab: null,
            sideSign: this.side,
            hoveredTab: null,
            canScrollLeft: false,
            canScrollRight: false,
        }
    },
    watch: {
        value: {
            handler(newVal) {
                this.activeTab = newVal; // Cập nhật activeTab nội bộ khi prop value thay đổi
            },
            deep: true
        }
    },
    methods: {
        handleReload(tab, index, ...args) {
            
            // Xử lý 2 format khác nhau:
            // - Organisation: emit('reload', { savedData: ... })
            // - Substation: emit('reload', substation, { savedData: ... })
            
            let savedData
            
            if (args.length === 1) {
                // Format 1: Organisation - args[0] = { savedData: ... }
                const eventData = args[0]
                savedData = eventData?.savedData
            } else if (args.length === 2) {
                // Format 2: Substation - args[0] = substation, args[1] = { savedData: ... }
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
                    index = this.tabs.findIndex(t => t.mrid === tab.mrid);
                    if (index === -1) {
                        this.$message.error("Tab not found");
                        return;
                    }
                }
                if (tab.mode === 'substation') {
                    
                    let data
                    
                    // ✅ Nếu có savedData từ save, dùng luôn - KHÔNG gọi API!
                    if (savedData) {
                        data = savedData
                    } else {
                        // Chỉ gọi API khi không có savedData (ví dụ: reload thủ công)
                        const [dataLocation, dataPerson, dataEntity] = await Promise.all([
                            window.electronAPI.getLocationByOrganisationId(tab.parentId),
                            window.electronAPI.getPersonByOrganisationId(tab.parentId),
                            window.electronAPI.getSubstationEntityByMrid(tab.mrid, this.$store.state.user.user_id, tab.parentId)
                        ]);
                        
                        data = {
                            locationList: [],
                            personList: [],
                            dto: null,
                            substation: tab
                        }
                        
                        if (dataLocation.success) {
                            data.locationList = dataLocation.data
                        } else {
                            data.locationList = []
                        }

                        if (dataPerson.success) {
                            data.personList = dataPerson.data
                        } else {
                            data.personList = []
                        }

                        if (dataEntity.success) {
                            const dto = subsMapper.mapEntityToDto(dataEntity.data)
                            // Đảm bảo name được set từ tab nếu entity không có name
                            if (!dto.name || dto.name === '') {
                                dto.name = tab.name || ''
                            }
                            data.dto = dto
                        } else {
                            // Nếu entity chưa tồn tại, tạo DTO mới từ tab data
                            const dto = new SubstationDto()
                            dto.name = tab.name || ''
                            dto.subsId = tab.mrid || ''
                            dto.organisationId = tab.parentId || ''
                            data.dto = dto
                        }
                    }
                    
                    
                    // ✅ Check component exists before calling loadData
                    if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                        this.$refs.componentLoadData[index].loadData(data)
                    } else {
                        await this.$nextTick()
                        if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                            this.$refs.componentLoadData[index].loadData(data)
                        }
                    }
                    
                    // ✅ Update tab với data mới
                    if (data.dto) {
                        Object.assign(tab, {
                            name: data.dto.name
                        })
                    }
                    
                    // ✅ Update node trong tree với data mới và set cache flag
                    this.$emit('update-node-data', {
                        mrid: tab.mrid,
                        data: data.dto,
                        mode: 'substation'
                    })
                    
                    // ✅ Emit event để update Object Properties
                    this.$emit('refresh-properties', tab)
                } else if (tab.mode === 'organisation') {
                    
                    let orgEntity
                    
                    // ✅ Nếu có savedData từ save, dùng luôn - KHÔNG gọi API!
                    if (savedData) {
                        orgEntity = savedData
                    } else {
                        // Chỉ gọi API khi không có savedData (ví dụ: reload thủ công)
                        const data = await window.electronAPI.getOrganisationEntityByMrid(tab.mrid)
                        if (data.success) {
                            orgEntity = orgMapper.OrgEntityToOrgDto(data.data)
                        } else {
                            // Nếu entity chưa tồn tại, tạo DTO mới từ tab data
                            const OrganisationDto = require('@/views/Dto/Organisation').default
                            const orgDto = new OrganisationDto()
                            orgDto.name = tab.name || ''
                            orgDto.organisationId = tab.mrid || ''
                            orgDto.parentId = tab.parentId || ''
                            orgEntity = orgDto
                        }
                    }
                    
                    // Đảm bảo name được set từ tab nếu entity không có name
                    if (!orgEntity.name || orgEntity.name === '') {
                        orgEntity.name = tab.name || ''
                    }
                    
                    // ✅ Check component exists before calling loadData
                    if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                        this.$refs.componentLoadData[index].loadData(orgEntity)
                    } else {
                        await this.$nextTick()
                        if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                            this.$refs.componentLoadData[index].loadData(orgEntity)
                        }
                    }
                    
                    // ✅ Update tab với data mới
                    Object.assign(tab, {
                        name: orgEntity.name,
                        aliasName: orgEntity.aliasName
                    })
                    
                    // ✅ Update node trong tree với data mới và set cache flag
                    // Emit event để parent update node trong tree
                    this.$emit('update-node-data', {
                        mrid: tab.mrid,
                        data: orgEntity
                    })
                    
                    // ✅ Emit event để update Object Properties (sẽ dùng cache, không gọi API)
                    this.$emit('refresh-properties', tab)
                } else if (tab.mode === 'voltageLevel') {
                    
                    let voltageLevelDto
                    
                    // ✅ Nếu có savedData từ save, dùng luôn - KHÔNG gọi API!
                    if (savedData) {
                        voltageLevelDto = savedData
                    } else {
                        // Chỉ gọi API khi không có savedData (ví dụ: reload thủ công)
                        const data = await window.electronAPI.getVoltageLevelEntityByMrid(tab.mrid)
                        if (data.success) {
                            voltageLevelDto = voltageMapper.volEntityToVolDto(data.data)
                            // Đảm bảo name được set từ tab nếu entity không có name
                            if (!voltageLevelDto.name || voltageLevelDto.name === '') {
                                voltageLevelDto.name = tab.name || ''
                            }
                        } else {
                            // Nếu entity chưa tồn tại, tạo DTO mới từ tab data
                            const VoltageLevelDto = require('@/views/Dto/VoltageLevel').default
                            voltageLevelDto = new VoltageLevelDto()
                            voltageLevelDto.name = tab.name || ''
                            voltageLevelDto.voltageLevelId = tab.mrid || ''
                            voltageLevelDto.substationId = tab.parentId || ''
                        }
                    }
                    
                    // ✅ Check component exists before calling loadData
                    if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                        this.$refs.componentLoadData[index].loadData(voltageLevelDto)
                    }
                    
                    // ✅ Update tab với data mới
                    Object.assign(tab, {
                        name: voltageLevelDto.name
                    })
                    
                    // ✅ Update tree node
                    this.$emit('update-node-data', {
                        mrid: tab.mrid,
                        mode: 'voltageLevel',
                        data: voltageLevelDto
                    })
                } else if (tab.mode === 'bay') {
                    
                    let bayData
                    
                    // ✅ Nếu có savedData từ save, dùng luôn - KHÔNG gọi API!
                    if (savedData) {
                        bayData = savedData
                    } else {
                        // Chỉ gọi API khi không có savedData (ví dụ: reload thủ công)
                        const data = await window.electronAPI.getBayEntityByMrid(tab.mrid)
                        if (data.success) {
                            bayData = data.data
                            // Đảm bảo name được set từ tab nếu entity không có name
                            if (!bayData.name || bayData.name === '') {
                                bayData.name = tab.name || ''
                            }
                        } else {
                            // Nếu entity chưa tồn tại, tạo object mới từ tab data
                            bayData = {
                                name: tab.name || '',
                                mrid: tab.mrid || '',
                                voltageLevel: tab.parentId || ''
                            }
                        }
                    }
                    
                    // ✅ Check component exists before calling loadData
                    if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                        this.$refs.componentLoadData[index].loadData(bayData)
                    }
                    
                    // ✅ Update tab với data mới
                    Object.assign(tab, {
                        name: bayData.name
                    })
                    
                    // ✅ Update tree node
                    this.$emit('update-node-data', {
                        mrid: tab.mrid,
                        mode: 'bay',
                        data: bayData
                    })
                } else if (tab.mode === 'asset') {
                    // ✅ Nếu có savedData từ save, dùng luôn - KHÔNG gọi API!
                    if (savedData) {
                        this.parentOrganization = { mrid: tab.parentId }
                        
                        // ✅ Check component exists before calling loadData
                        if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                            this.$refs.componentLoadData[index].loadData(savedData)
                        } else {
                            await this.$nextTick()
                            if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                                this.$refs.componentLoadData[index].loadData(savedData)
                            }
                        }
                        
                        // ✅ Update tab với data mới
                        Object.assign(tab, {
                            serial_number: savedData.properties?.serial_no,
                            apparatus_id: savedData.properties?.apparatus_id,
                            manufacturer: savedData.properties?.manufacturer,
                            type: savedData.properties?.type
                        })
                        
                        // Update node và emit events
                        this.$emit('update-node-data', {
                            mrid: tab.mrid,
                            data: savedData,
                            mode: 'asset',
                            assetType: tab.asset
                        })
                        this.$emit('refresh-properties', tab)
                    } else {
                        // Gọi API để load asset (sẽ được cache sau khi load thành công)
                        
                        if (tab.asset === 'Surge arrester') {
                        this.parentOrganization = {
                            mrid: tab.parentId
                        }
                        const data = await window.electronAPI.getSurgeArresterEntityByMrid(tab.mrid, tab.parentId)
                        if (data.success) {
                            const surgeArresterDto = surgeMapper.mapEntityToDto(data.data)
                            // Đảm bảo serial_number được set từ tab nếu entity không có
                            if (!surgeArresterDto.properties?.serial_no || surgeArresterDto.properties.serial_no === '') {
                                if (!surgeArresterDto.properties) surgeArresterDto.properties = {}
                                surgeArresterDto.properties.serial_no = tab.serial_number || ''
                            }
                            this.$refs.componentLoadData[index].loadData(surgeArresterDto)
                            
                            // ✅ Cache DTO vào tree node
                            this.$emit('update-node-data', {
                                mrid: tab.mrid,
                                data: surgeArresterDto,
                                mode: 'asset',
                                assetType: tab.asset
                            })
                        } else {
                            // Nếu entity chưa tồn tại, tạo DTO mới từ tab data
                            const SurgeArresterDto = require('@/views/Dto/SurgeArrester').default
                            const dto = new SurgeArresterDto()
                            if (!dto.properties) dto.properties = {}
                            dto.properties.serial_no = tab.serial_number || ''
                            dto.assetId = tab.mrid || ''
                            this.$refs.componentLoadData[index].loadData(dto)
                        }
                    } else if (tab.asset === 'Bushing') {
                        this.parentOrganization = {
                            mrid: tab.parentId
                        }
                        const data = await window.electronAPI.getBushingEntityByMrid(tab.mrid, tab.parentId)
                        if (data.success) {
                            const BushingDto = bushingMapper.mapEntityToDto(data.data)
                            // Đảm bảo serial_number được set từ tab nếu entity không có
                            if (!BushingDto.properties?.serial_no || BushingDto.properties.serial_no === '') {
                                if (!BushingDto.properties) BushingDto.properties = {}
                                BushingDto.properties.serial_no = tab.serial_number || ''
                            }
                            this.$refs.componentLoadData[index].loadData(BushingDto)
                            
                            // ✅ Cache DTO vào tree node để lần sau không cần gọi API
                            this.$emit('update-node-data', {
                                mrid: tab.mrid,
                                data: BushingDto,
                                mode: 'asset',
                                assetType: tab.asset
                            })
                        } else {
                            this.$message.error("Failed to load bushing data");
                        }
                    } else if (tab.asset === 'Current transformer') {
                        this.parentOrganization = {
                            mrid: tab.parentId
                        }
                        const data = await window.electronAPI.getCurrentTransformerEntityByMrid(tab.mrid, tab.parentId)
                        if (data.success) {
                            const currentTransformerDto = currentTransformerMapper.mapEntityToDto(data.data)
                            // Đảm bảo serial_number được set từ tab nếu entity không có
                            if (!currentTransformerDto.properties?.serial_no || currentTransformerDto.properties.serial_no === '') {
                                if (!currentTransformerDto.properties) currentTransformerDto.properties = {}
                                currentTransformerDto.properties.serial_no = tab.serial_number || ''
                            }
                            this.$refs.componentLoadData[index].loadData(currentTransformerDto)
                            
                            // ✅ Cache DTO vào tree node
                            this.$emit('update-node-data', {
                                mrid: tab.mrid,
                                data: currentTransformerDto,
                                mode: 'asset',
                                assetType: tab.asset
                            })
                        } else {
                            this.$message.error("Failed to load Current transformer data");
                        }
                    }
                     else if (tab.asset === 'Voltage transformer') {
                        this.parentOrganization = {
                            mrid: tab.parentId
                        }
                        const data = await window.electronAPI.getVoltageTransformerEntityByMrid(tab.mrid, tab.parentId)
                        if (data.success) {
                            const vtDto = vtMapper.mapEntityToDto(data.data)
                            // Đảm bảo serial_number được set từ tab nếu entity không có
                            if (!vtDto.properties?.serial_no || vtDto.properties.serial_no === '') {
                                if (!vtDto.properties) vtDto.properties = {}
                                vtDto.properties.serial_no = tab.serial_number || ''
                            }
                            this.$refs.componentLoadData[index].loadData(vtDto)
                            
                            // ✅ Cache DTO vào tree node
                            this.$emit('update-node-data', {
                                mrid: tab.mrid,
                                data: vtDto,
                                mode: 'asset',
                                assetType: tab.asset
                            })
                        } else {
                            this.$message.error("Failed to load Voltage transformer data");
                        }
                    } else if(tab.asset === 'Disconnector') {
                        this.parentOrganization = {
                            mrid : tab.parentId
                        }
                        const data = await window.electronAPI.getDisconnectorEntityByMrid(tab.mrid, tab.parentId)
                        if(data.success) {
                            const disconnectorDto = disconnectorMapper.disconnectorEntityToDto(data.data)
                            // Đảm bảo serial_number được set từ tab nếu entity không có
                            if (!disconnectorDto.properties?.serial_no || disconnectorDto.properties.serial_no === '') {
                                if (!disconnectorDto.properties) disconnectorDto.properties = {}
                                disconnectorDto.properties.serial_no = tab.serial_number || ''
                            }
                            this.$refs.componentLoadData[index].loadData(disconnectorDto)
                            
                            // ✅ Cache DTO vào tree node
                            this.$emit('update-node-data', {
                                mrid: tab.mrid,
                                data: disconnectorDto,
                                mode: 'asset',
                                assetType: tab.asset
                            })
                        } else {
                            this.$message.error("Failed to load Disconnector data");
                        }
                    } else if(tab.asset === 'Power cable') {
                        this.parentOrganization = {
                            mrid : tab.parentId
                        }
                        const data = await window.electronAPI.getPowerCableEntityByMrid(tab.mrid, tab.parentId)
                        if(data.success) {
                            const powerCableDto = PowerCableMapper.mapEntityToDto(data.data)
                            // Đảm bảo serial_number được set từ tab nếu entity không có
                            if (!powerCableDto.properties?.serial_no || powerCableDto.properties.serial_no === '') {
                                if (!powerCableDto.properties) powerCableDto.properties = {}
                                powerCableDto.properties.serial_no = tab.serial_number || ''
                            }
                            this.$refs.componentLoadData[index].loadData(powerCableDto)
                            
                            // ✅ Cache DTO vào tree node
                            this.$emit('update-node-data', {
                                mrid: tab.mrid,
                                data: powerCableDto,
                                mode: 'asset',
                                assetType: tab.asset
                            })
                        } else {
                            this.$message.error("Failed to load Power cable data");
                        }
                    } else if(tab.asset === 'Rotating machine') {
                        this.parentOrganization = {
                            mrid : tab.parentId
                        }
                        const data = await window.electronAPI.getRotatingMachineEntityByMrid(tab.mrid, tab.parentId)
                        if(data.success) {
                            const rotatingMachineDto = RotatingMachineMapper.mapEntityToDto(data.data)
                            // Đảm bảo serial_number được set từ tab nếu entity không có
                            if (!rotatingMachineDto.properties?.serial_no || rotatingMachineDto.properties.serial_no === '') {
                                if (!rotatingMachineDto.properties) rotatingMachineDto.properties = {}
                                rotatingMachineDto.properties.serial_no = tab.serial_number || ''
                            }
                            this.$refs.componentLoadData[index].loadData(rotatingMachineDto)
                            
                            // ✅ Cache DTO vào tree node
                            this.$emit('update-node-data', {
                                mrid: tab.mrid,
                                data: rotatingMachineDto,
                                mode: 'asset',
                                assetType: tab.asset
                            })
                        } else {
                            this.$message.error("Failed to load Rotating Machine data");
                        }
                    } else if(tab.asset === 'Capacitor') {
                        this.parentOrganization = {
                            mrid : tab.parentId
                        }
                        const data = await window.electronAPI.getCapacitorEntityByMrid(tab.mrid, tab.parentId)
                        if(data.success) {
                            const capacitorDto = CapacitorMapper.mapEntityToDto(data.data)
                            // Đảm bảo serial_number được set từ tab nếu entity không có
                            if (!capacitorDto.properties?.serial_no || capacitorDto.properties.serial_no === '') {
                                if (!capacitorDto.properties) capacitorDto.properties = {}
                                capacitorDto.properties.serial_no = tab.serial_number || ''
                            }
                            this.$refs.componentLoadData[index].loadData(capacitorDto)
                            
                            // ✅ Cache DTO vào tree node
                            this.$emit('update-node-data', {
                                mrid: tab.mrid,
                                data: capacitorDto,
                                mode: 'asset',
                                assetType: tab.asset
                            })
                        }
                        else {
                            this.$message.error("Failed to load Capacitor data");
                        }
                    } else if(tab.asset === 'Circuit breaker') {
                        this.parentOrganization = {
                            mrid : tab.parentId
                        }
                        const data = await window.electronAPI.getBreakerEntityByMrid(tab.mrid, tab.parentId)
                        if(data.success) {
                            const breakerDto = BreakerMapper.mapEntityToDto(data.data)
                            // Đảm bảo serial_number được set từ tab nếu entity không có
                            if (!breakerDto.properties?.serial_no || breakerDto.properties.serial_no === '') {
                                if (!breakerDto.properties) breakerDto.properties = {}
                                breakerDto.properties.serial_no = tab.serial_number || ''
                            }
                            this.$refs.componentLoadData[index].loadData(breakerDto)
                            
                            // ✅ Cache DTO vào tree node
                            this.$emit('update-node-data', {
                                mrid: tab.mrid,
                                data: breakerDto,
                                mode: 'asset',
                                assetType: tab.asset
                            })
                        } else {
                            this.$message.error("Failed to load circuit breaker data");
                        }    
                    } else if(tab.asset === 'Transformer') {
                        this.parentOrganization = {
                            mrid : tab.parentId
                        }
                        const data = await window.electronAPI.getTransformerEntityByMrid(tab.mrid, tab.parentId)
                        if(data.success) {
                            const transformerDto = transformerMapper.transformerEntityToDto(data.data)
                            // Đảm bảo serial_number được set từ tab nếu entity không có
                            if (!transformerDto.properties?.serial_no || transformerDto.properties.serial_no === '') {
                                if (!transformerDto.properties) transformerDto.properties = {}
                                transformerDto.properties.serial_no = tab.serial_number || ''
                            }
                            this.$refs.componentLoadData[index].loadData(transformerDto)
                            
                            // ✅ Cache DTO vào tree node
                            this.$emit('update-node-data', {
                                mrid: tab.mrid,
                                data: transformerDto,
                                mode: 'asset',
                                assetType: tab.asset
                            })
                        } else {
                            this.$message.error("Failed to load transformer data");
                        }    
                    } else if(tab.asset === 'Reactor') {
                        this.parentOrganization = {
                            mrid : tab.parentId
                        }
                        const data = await window.electronAPI.getReactorEntityByMrid(tab.mrid, tab.parentId)
                        if(data.success) {
                            const reactorDto = reactorMapper.mapEntityToDto(data.data)
                            // Đảm bảo serial_number được set từ tab nếu entity không có
                            if (!reactorDto.properties?.serial_no || reactorDto.properties.serial_no === '') {
                                if (!reactorDto.properties) reactorDto.properties = {}
                                reactorDto.properties.serial_no = tab.serial_number || ''
                            }
                            this.$refs.componentLoadData[index].loadData(reactorDto)
                            
                            // ✅ Cache DTO vào tree node
                            this.$emit('update-node-data', {
                                mrid: tab.mrid,
                                data: reactorDto,
                                mode: 'asset',
                                assetType: tab.asset
                            })
                        } else {
                            this.$message.error("Failed to load reactor data");
                        }    
                    }
                    } // ✅ Đóng block else của savedData check
                } else if (tab.mode === 'job') {
                    const dataAsset = await window.electronAPI.getAssetByMrid(tab.parentId)
                    if (dataAsset.success) {
                        this.assetData = dataAsset.data
                        this.parentOrganization = dataAsset.data
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
                        this.assetData = {}
                        this.locationData = {}
                        this.productAssetModelData = {}
                    }
                    if (tab.job === 'Surge arrester') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Surge arrester")
                        if (dataTestType.success) {
                            this.testTypeListData = dataTestType.data
                        } else {
                            this.testTypeListData = []
                        }
                        const dataSurgeArrester = await window.electronAPI.getSurgeArresterByMrid(tab.parentId)
                        if (dataSurgeArrester.success) {
                            this.assetData = dataSurgeArrester.data
                        } else {
                            this.assetData = {}
                        }
                        this.checkJobType = 'JobSurgeArrester'
                        this.signJob = true;
                        const data = await window.electronAPI.getSurgeArresterJobByMrid(tab.mrid)
                        if (data.success) {
                            const surgeArresterJobDto = SurgeArresterJobMapper.JobEntityToDto(data.data)
                            for (const test of surgeArresterJobDto.testList) {
                                for (const type of this.testTypeListData) {
                                    if (test.testTypeCode === type.code) {
                                        test.testTypeName = type.name
                                        test.testTypeId = type.mrid
                                        break
                                    }
                                }
                            }
                            this.$refs.componentLoadData[index].loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData)
                            this.$refs.componentLoadData[index].loadData(surgeArresterJobDto)
                        } else {
                            this.$message.error("Failed to load surge arrester job data");
                        }
                    } else if( tab.job === 'Power cable') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Power cable")
                        if (dataTestType.success) {
                            this.testTypeListData = dataTestType.data
                        } else {
                            this.testTypeListData = []
                        }
                        const dataPowerCable = await window.electronAPI.getPowerCableByMrid(tab.parentId)
                        if (dataPowerCable.success) {
                            this.assetData = dataPowerCable.data
                        } else {
                            this.assetData = {}
                        }
                        this.checkJobType = 'JobPowerCable'
                        this.signJob = true;
                        const data = await window.electronAPI.getPowerCableJobByMrid(tab.mrid)
                        if (data.success) {
                            const powerCableJobDto = PowerCableJobMapper.JobEntityToDto(data.data)
                            for (const test of powerCableJobDto.testList) {
                                for (const type of this.testTypeListData) {
                                    if (test.testTypeCode === type.code) {
                                        test.testTypeName = type.name
                                        test.testTypeId = type.mrid
                                        break
                                    }
                                }
                            }
                            this.$refs.componentLoadData[index].loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData)
                            this.$refs.componentLoadData[index].loadData(powerCableJobDto)
                        } else {
                            this.$message.error("Failed to load power cable job data");
                        }
                    } else if( tab.job === 'Transformer') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Transformer")
                        if (dataTestType.success) {
                            this.testTypeListData = dataTestType.data
                        } else {
                            this.testTypeListData = []
                        }
                        const dataTransformer = await window.electronAPI.getTransformerByMrid(tab.parentId)
                        if (dataTransformer.success) {
                            this.assetData = dataTransformer.data
                        } else {
                            this.assetData = {}
                        }
                        this.checkJobType = 'JobTransformer'
                        this.signJob = true;
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
                            this.$refs.componentLoadData[index].loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData)
                            this.$refs.componentLoadData[index].loadData(transformerJobDto)
                        } else {
                            this.$message.error("Failed to load transformer job data");
                        }
                    } else if (tab.job === 'Voltage transformer') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Voltage transformer")
                        if (dataTestType.success) {
                            this.testTypeListData = dataTestType.data
                        } else {
                            this.testTypeListData = []
                        }
                        const dataVoltageTransformer = await window.electronAPI.getVoltageTransformerEntityByMrid(tab.parentId)
                        if (dataVoltageTransformer.success) {
                            this.assetData = dataVoltageTransformer.data
                        } else {
                            this.assetData = {}
                        }
                        this.checkJobType = 'JobVoltageTransformer'
                        this.signJob = true;
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
                            this.$refs.componentLoadData[index].loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData)
                            this.$refs.componentLoadData[index].loadData(voltageTransformerJobDto)
                        } else {
                            this.$message.error("Failed to load voltage transformer job data");
                        }
                    } else if (tab.job === 'Current transformer') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Current transformer")
                        if (dataTestType.success) {
                            this.testTypeListData = dataTestType.data
                        } else {
                            this.testTypeListData = []
                        }
                        const dataCurrentTransformer = await window.electronAPI.getCurrentTransformerEntityByMrid(tab.parentId)
                        if (dataCurrentTransformer.success) {
                            // Keep full entity but add flat properties for Overview compatibility
                            const entity = dataCurrentTransformer.data
                            this.assetData = {
                                ...entity,
                                // Add flat properties for Overview component
                                kind: entity.asset.kind,
                                type: entity.asset.type,
                                serial_number: entity.asset.serial_number,
                                mrid: entity.asset.mrid
                            }
                            // Update productAssetModelData if available
                            if (entity.productAssetModel) {
                                this.productAssetModelData = entity.productAssetModel
                            }
                        } else {
                            this.assetData = {}
                        }
                        this.checkJobType = 'JobCurrentTransformer'
                        this.signJob = true;
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
                            this.$refs.componentLoadData[index].loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData)
                            this.$refs.componentLoadData[index].loadData(currentTransformerJobDto)
                        } else {
                            this.$message.error("Failed to load current transformer job data");
                        }
                    } else if (tab.job === 'Disconnector') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Disconnector")
                        if (dataTestType.success) {
                            this.testTypeListData = dataTestType.data
                        } else {
                            this.testTypeListData = []
                        }
                        const dataDisconnector = await window.electronAPI.getDisconnectorByMrid(tab.parentId)
                        if (dataDisconnector.success) {
                            this.assetData = dataDisconnector.data
                        } else {
                            this.assetData = {}
                        }
                        this.checkJobType = 'JobDisconnector'
                        this.signJob = true;
                        const data = await window.electronAPI.getDisconnectorJobByMrid(tab.mrid)
                        if (data.success) {
                            const disconnectorJobDto = DisconnectorJobMapper.JobEntityToDto(data.data)
                            for (const test of disconnectorJobDto.testList) {
                                for (const type of this.testTypeListData) {
                                    if (test.testTypeCode === type.code) {
                                        test.testTypeName = type.name
                                        test.testTypeId = type.mrid
                                        break
                                    }
                                }
                            }
                            this.$refs.componentLoadData[index].loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData)
                            this.$refs.componentLoadData[index].loadData(disconnectorJobDto)
                        } else {
                            this.$message.error("Failed to load disconnector job data");
                        }
                    } else if (tab.job === 'Rotating machine') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Rotating machine")
                        if (dataTestType.success) {
                            this.testTypeListData = dataTestType.data
                        } else {
                            this.testTypeListData = []
                        }
                        const dataRotatingMachine = await window.electronAPI.getRotatingMachineByMrid(tab.parentId)
                        if (dataRotatingMachine.success) {
                            this.assetData = dataRotatingMachine.data
                        } else {
                            this.assetData = {}
                        }
                        this.checkJobType = 'JobRotatingMachine'
                        this.signJob = true;
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
                            this.$refs.componentLoadData[index].loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData)
                            this.$refs.componentLoadData[index].loadData(rotatingMachineJobDto)
                        } else {
                            this.$message.error("Failed to load rotating machine job data");
                        }
                    } else if (tab.job === 'Reactor') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Reactor")
                        if (dataTestType.success) {
                            this.testTypeListData = dataTestType.data
                        } else {
                            this.testTypeListData = []
                        }
                        const dataReactor = await window.electronAPI.getReactorByMrid(tab.parentId)
                        if (dataReactor.success) {
                            this.assetData = dataReactor.data
                        } else {
                            this.assetData = {}
                        }
                        this.checkJobType = 'JobReactor'
                        this.signJob = true;
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
                            this.$refs.componentLoadData[index].loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData)
                            this.$refs.componentLoadData[index].loadData(reactorJobDto)
                        } else {
                            this.$message.error("Failed to load reactor job data");
                        }
                    } else if (tab.job === 'Capacitor') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Capacitor")
                        if (dataTestType.success) {
                            this.testTypeListData = dataTestType.data
                        } else {
                            this.testTypeListData = []
                        }
                        const dataCapacitor = await window.electronAPI.getCapacitorByMrid(tab.parentId)
                        if (dataCapacitor.success) {
                            this.assetData = dataCapacitor.data
                        } else {
                            this.assetData = {}
                        }
                        this.checkJobType = 'JobCapacitor'
                        this.signJob = true;
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
                            this.$refs.componentLoadData[index].loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData)
                            this.$refs.componentLoadData[index].loadData(capacitorJobDto)
                        } else {
                            this.$message.error("Failed to load capacitor job data");
                        }
                    } else if (tab.job === 'Bushing') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Bushing")
                        if (dataTestType.success) {
                            this.testTypeListData = dataTestType.data
                        } else {
                            this.testTypeListData = []
                        }
                        const dataBushing = await window.electronAPI.getBushingByMrid(tab.parentId)
                        if (dataBushing.success) {
                            this.assetData = dataBushing.data
                        } else {
                            this.assetData = {}
                        }
                        this.checkJobType = 'JobBushing'
                        this.signJob = true;
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
                            this.$refs.componentLoadData[index].loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData)
                            this.$refs.componentLoadData[index].loadData(bushingJobDto)
                        } else {
                            this.$message.error("Failed to load bushing job data");
                        }
                    } else if (tab.job === 'Circuit breaker') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Circuit breaker")
                        if (dataTestType.success) {
                            this.testTypeListData = dataTestType.data
                        } else {
                            this.testTypeListData = []
                        }
                        const dataCircuitBreaker = await window.electronAPI.getBreakerEntityByMrid(tab.parentId)
                        if (dataCircuitBreaker.success) {
                            this.assetData = dataCircuitBreaker.data
                        } else {
                            this.assetData = {}
                        }
                        this.checkJobType = 'JobCircuitBreaker'
                        this.signJob = true;
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
                            this.$refs.componentLoadData[index].loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData)
                            this.$refs.componentLoadData[index].loadData(circuitBreakerJobDto)
                        } else {
                            this.$message.error("Failed to load circuit breaker job data");
                        }
                    }
                } else {
                    this.$message.error("Unsupported tab mode");
                }
            } catch (error) {
                console.error("Error loading data:", error);
            }
        },
       // Trong src/views/Common/Tabs.vue
        async loadDataServer(tab, index) {
            try { if (tab.mode === 'substation') {
                    const serverData = tab; 

                    
                    const SubstationDto = require('@/views/Dto/Substation').default;
                    const dto = new SubstationDto();

                    
                    dto.subsId = String(serverData.id || serverData.mrid || ''); 
                    dto.name = serverData.name || '';
                    dto.generation = serverData.generation || '';
                    dto.industry = serverData.industry || '';
                    dto.comment = serverData.description || ''; 
                    
                    dto.organisationId = String(serverData.parentId || '');

                    this.$nextTick(() => {
                        if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                            this.$refs.componentLoadData[index].loadData({
                                dto: dto,
                                locationList: [], 
                                personList: []
                            });
                        }
                    });
                } 
                
                else if (tab.mode === 'organisation') {
                    const serverData = tab;

                    const OrganisationDto = require('@/views/Dto/Organisation').default;
                    const dto = new OrganisationDto();

                    dto.organisationId = String(serverData.id || ''); 
                    dto.name = serverData.name || '';
                    dto.tax_code = serverData.taxCode || '';         
                    dto.comment = serverData.description || '';      
                    dto.parentId = String(serverData.parentOrganisation || '');
                    
                    if (serverData.address) dto.street = serverData.address;

                    this.$nextTick(() => {
                        if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                            this.$refs.componentLoadData[index].loadData(dto);
                        }
                    });
                } 
                else if (tab.mode == 'asset' && tab.asset === 'Power cable') {
                    const response = await demoAPI.getAssetById(tab.mrid, 'PowerCable');
                    if (response) {
                        const dto = PowerCableServerMapper.mapServerToDto(response);

                        this.$nextTick(() => {
                            if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                                this.$refs.componentLoadData[index].loadData(dto);
                            }
                        });
                    }
                }
            } catch (error) {
                console.error("Error loading data from server:", error);
            }
        },
        async selectTab(tab, index) {
            this.activeTab = tab;
            this.indexTab = index;
            this.$emit('input', tab); // Gửi ngược lại cho TreeNavigation qua v-model
            
            this.$nextTick(() => {
                if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                    if (this.$refs.componentLoadData[index].loadMapForView) {
                        this.$refs.componentLoadData[index].loadMapForView();
                    }
                }
            });
        },
        compareTab(tab1, tab2) {
            if (!tab1 || !tab2) return false;
            const id1 = tab1.mrid || tab1.id;
            const id2 = tab2.mrid || tab2.id;
            return id1 === id2;
        },
        closeTab(index) {
            this.$emit('close-tab', index)
            if (this.indexTab === index) {
                this.indexTab = null; // Reset indexTab nếu tab hiện tại bị đóng
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
        scrollLeft() {
            this.scrollTabs(-2)
        },
        scrollRight() {
            this.scrollTabs(2)
        },
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
            if (tab.mode == 'substation') {
                return 'LocationViewData'
            } else if (tab.mode == 'organisation') {
                return 'OrganisationView'
            } else if (tab.mode == 'voltageLevel') {
                return 'VoltageLevel'
            } else if (tab.mode == 'bay') {
                return 'Bay'
            } else if (tab.mode == 'asset') {
                if (tab.asset === 'Surge arrester') {
                    return 'SurgeArrester'
                } else if (tab.asset === 'Bushing') {
                    return 'Bushing'
                } else if (tab.asset === 'Voltage transformer') {
                    return 'VoltageTransformer'
                } else if(tab.asset === 'Disconnector') {
                    return 'Disconnector'
                } else if(tab.asset === 'Power cable') {
                    return 'PowerCable'
                } else if (tab.asset === 'Rotating machine') {
                    return 'RotatingMachine'
                } else if (tab.asset === 'Current transformer') {
                    return 'CurrentTransformer'
                } else if (tab.asset === 'Capacitor') {
                    return 'Capacitor'
                } else if(tab.asset === 'Circuit breaker') {
                    return 'CircuitBreaker'
                } else if(tab.asset === 'Transformer') {
                    return 'Transformer'
                } else if(tab.asset === 'Reactor') {
                    return 'Reactor'
                }
            } else if (tab.mode == 'job') {
                if (tab.job === 'Surge arrester') {
                    return 'SurgeArresterJob'
                } else if (tab.job === 'Transformer') {
                    return 'TransformerJob'
                } else if (tab.job === 'Voltage transformer') {
                    return 'VoltageTransformerJob'
                } else if (tab.job === 'Current transformer') {
                    return 'CurrentTransformerJob'
                } else if (tab.job === 'Disconnector') {
                    return 'DisconnectorJob'
                } else if (tab.job === 'Rotating machine') {
                    return 'RotatingMachineJob'
                } else if (tab.job === 'Reactor') {
                    return 'ReactorJob'
                } else if (tab.job === 'Capacitor') {
                    return 'CapacitorJob'
                } else if (tab.job === 'Bushing') {
                    return 'BushingJob'
                } else if (tab.job === 'Circuit breaker') {
                    return 'CircuitBreakerJob'
                }
            }
        },
        saveCtrlS() {
            try {
                if (this.indexTab !== null) {
                    if (this.$refs.componentLoadData && this.$refs.componentLoadData[this.indexTab]) {
                        this.$refs.componentLoadData[this.indexTab].saveCtrS()
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
    /* Không cho xuống dòng */
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
    /* Cho phép cuộn theo chiều dọc */
    overflow-x: auto;
    /* Scroll ngang vẫn hiển thị */
    scrollbar-width: none;
    /* Ẩn scrollbar dọc trên Firefox */
}

.tabs-content::-webkit-scrollbar {
    width: 0;
    /* Ẩn scrollbar dọc trên Chrome, Safari, Edge */
}

.tab-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 10px;
    width: 100%;
}
</style>