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
                        <icon v-else-if="tab.mode == 'asset'" size="16px" folderType="asset" :assetDetail="tab.asset" badgeColor="146EBE"></icon>
                        <icon v-else-if="tab.mode == 'job'" size="16px" folderType="job" badgeColor="FF0000"></icon>
                        <icon v-else-if="tab.mode == 'test'" size="16px" folderType="test" badgeColor="008001"></icon>
                        <icon v-else size="16px" folderType="building" badgeColor="008001"></icon>
                        <span v-if="tab.mode == 'organisation'" class="tab-label">{{ tab.name }}</span>
                        <span v-else-if="tab.mode == 'substation'" class="tab-label">{{ tab.name }}</span>
                        <span v-else-if="tab.mode == 'voltageLevel'" class="tab-label">{{ tab.name }}</span>
                        <span v-else-if="tab.mode == 'bay'" class="tab-label">{{ tab.name }}</span>
                        <span v-else-if="tab.mode == 'asset'" class="tab-label">{{ tab.serial_number }}</span>
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
                <component mode="update" @reload="loadData"
                    ref="componentLoadData" :sideData="sideSign" :is="checkTab(item)" :organisationId="item.parentId"
                    :testTypeListData="testTypeListData" :assetData="assetData"
                    :productAssetModelData="productAssetModelData" :parent="parentOrganization"
                    :locationData="locationData" style="min-height: calc(100vh - 250px);">
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
                        <icon v-else-if="tab.mode == 'asset'" size="16px" folderType="asset" :assetDetail="tab.asset" badgeColor="146EBE"></icon>
                        <icon v-else-if="tab.mode == 'job'" size="16px" folderType="job" badgeColor="FF0000"></icon>
                        <icon v-else-if="tab.mode == 'test'" size="16px" folderType="test" badgeColor="008001"></icon>
                        <icon v-else size="16px" folderType="building" badgeColor="008001"></icon>
                        <span v-if="tab.mode == 'organisation'" class="tab-label">{{ tab.aliasName || tab.name }}</span>
                        <span v-else-if="tab.mode == 'substation'" class="tab-label">{{ tab.name }}</span>
                        <span v-else-if="tab.mode == 'voltageLevel'" class="tab-label">{{ tab.name }}</span>
                        <span v-else-if="tab.mode == 'bay'" class="tab-label">{{ tab.name }}</span>
                        <span v-else-if="tab.mode == 'asset'" class="tab-label">{{ tab.serial_number }}</span>
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
                <component mode="update" @reload="loadData" v-show="compareTab(activeTab, item)"
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
import * as disconnectorMapper from '@/views/Mapping/Disconnector/index'
import * as PowerCableMapper from '@/views/Mapping/PowerCable'
import * as RotatingMachineMapper from '@/views/Mapping/RotatingMachine'
import * as currentTransformerMapper from '@/views/Mapping/CurrentTransformer'
import * as CapacitorMapper from '@/views/Mapping/Capacitor'
import * as BreakerMapper from '@/views/Mapping/Breaker'
import * as transformerMapper from '@/views/Mapping/Transformer'
import * as reactorMapper from '@/views/Mapping/Reactor'

import * as demoAPI from '@/api/demo/index.js'
import * as PowerCableServerMapper from '@/views/Mapping/PowerCableTest/index.js'

import VoltageLevel from '@/views/VoltageLevel/index.vue'
import Bay from '@/views/Bay/index.vue'
import SurgeArrester from '@/views/AssetView/SurgeArrester/index.vue'
import Bushing from '@/views/AssetView/Bushing/index.vue'
import SurgeArresterJob from '@/views/JobView/SurgeArrester/index.vue'
import TransformerJob from '@/views/JobView/Transformer/index.vue'
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
        async loadData(tab, index) {
            if (this.side === 'client') {
                await this.loadDataClient(tab, index)
            } else {
                await this.loadDataServer(tab, index)
            }
        },
        async loadDataClient(tab, index) {
            try {
                if (index == null) {
                    index = this.tabs.findIndex(t => t.mrid === tab.mrid);
                    if (index === -1) {
                        this.$message.error("Tab not found");
                        return;
                    }
                }
                if (tab.mode === 'substation') {
                    const [dataLocation, dataPerson, dataEntity] = await Promise.all([
                        window.electronAPI.getLocationByOrganisationId(tab.parentId),
                        window.electronAPI.getPersonByOrganisationId(tab.parentId),
                        window.electronAPI.getSubstationEntityByMrid(tab.mrid, this.$store.state.user.user_id, tab.parentId)
                    ]);
                    const data = {
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
                    this.$refs.componentLoadData[index].loadData(data)
                } else if (tab.mode === 'organisation') {
                    const data = await window.electronAPI.getOrganisationEntityByMrid(tab.mrid)
                    if (data.success) {
                        const orgEntity = orgMapper.OrgEntityToOrgDto(data.data)
                        // Đảm bảo name được set từ tab nếu entity không có name
                        if (!orgEntity.name || orgEntity.name === '') {
                            orgEntity.name = tab.name || ''
                        }
                        this.$refs.componentLoadData[index].loadData(orgEntity)
                    } else {
                        // Nếu entity chưa tồn tại, tạo DTO mới từ tab data
                        const OrganisationDto = require('@/views/Dto/Organisation').default
                        const orgDto = new OrganisationDto()
                        orgDto.name = tab.name || ''
                        orgDto.organisationId = tab.mrid || ''
                        orgDto.parentId = tab.parentId || ''
                        this.$refs.componentLoadData[index].loadData(orgDto)
                    }
                } else if (tab.mode === 'voltageLevel') {
                    const data = await window.electronAPI.getVoltageLevelEntityByMrid(tab.mrid)
                    if (data.success) {
                        const voltageLevelDto = voltageMapper.volEntityToVolDto(data.data)
                        // Đảm bảo name được set từ tab nếu entity không có name
                        if (!voltageLevelDto.name || voltageLevelDto.name === '') {
                            voltageLevelDto.name = tab.name || ''
                        }
                        this.$refs.componentLoadData[index].loadData(voltageLevelDto)
                    } else {
                        // Nếu entity chưa tồn tại, tạo DTO mới từ tab data
                        const VoltageLevelDto = require('@/views/Dto/VoltageLevel').default
                        const volDto = new VoltageLevelDto()
                        volDto.name = tab.name || ''
                        volDto.voltageLevelId = tab.mrid || ''
                        volDto.substationId = tab.parentId || ''
                        this.$refs.componentLoadData[index].loadData(volDto)
                    }
                } else if (tab.mode === 'bay') {
                    const data = await window.electronAPI.getBayEntityByMrid(tab.mrid)
                    if (data.success) {
                        const bayData = data.data
                        // Đảm bảo name được set từ tab nếu entity không có name
                        if (!bayData.name || bayData.name === '') {
                            bayData.name = tab.name || ''
                        }
                        this.$refs.componentLoadData[index].loadData(bayData)
                    } else {
                        // Nếu entity chưa tồn tại, tạo object mới từ tab data
                        const bayData = {
                            name: tab.name || '',
                            mrid: tab.mrid || '',
                            voltageLevel: tab.parentId || ''
                        }
                        this.$refs.componentLoadData[index].loadData(bayData)
                    }
                } else if (tab.mode === 'asset') {
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
                        } else {
                            this.$message.error("Failed to load reactor data");
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
                        const data = await window.electronAPI.getSurgeArresterJobByMrid(tab.mrid, tab.parentId)
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
                            this.$refs.componentLoadData[index].loadData(surgeArresterJobDto)
                        } else {
                            this.$message.error("Failed to load surge arrester job data");
                        }
                    }
                    else if( tab.job === 'Power cable') {
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
                            const powerCableJobDto = PowerCableMapper.JobEntityToDto(data.data)
                            for (const test of powerCableJobDto.testList) {
                                for (const type of this.testTypeListData) {
                                    if (test.testTypeCode === type.code) {
                                        test.testTypeName = type.name
                                        test.testTypeId = type.mrid
                                        break
                                    }
                                }
                            }
                            this.$refs.componentLoadData[index].loadData(powerCableJobDto)
                        } else {
                            this.$message.error("Failed to load power cable job data");
                        }
                    }
                    else if( tab.job === 'Transformer') {
                        const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Transformer")
                        if (dataTestType.success) {
                            this.testTypeListData = dataTestType.data
                        } else {
                            this.testTypeListData = []
                        }
                        const dataTransformer = await window.electronAPI.getAssetByMrid(tab.parentId)
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
                            this.$refs.componentLoadData[index].loadData(transformerJobDto)
                        } else {
                            this.$message.error("Failed to load transformer job data");
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