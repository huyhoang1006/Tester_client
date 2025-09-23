<!-- eslint-disable -->
<template>
    <div ref="customTabs" class="custom-tabs">
        <div class="tabs-header">
            <div class="scroll-btn left" @click="scrollLeft"><i class="fa-solid fa-chevron-left"></i></div>
            <div class="tabs-header-data" ref="tabsHeader" @scroll="checkScroll">
                <div v-for="(tab, index) in tabs" :key="tab.mrid" @click="selectTab(tab, index)"
                    @mouseover="hoveredTab = tab.mrid" @mouseleave="hoveredTab = null" class="tab-item"
                    :class="{ active: activeTab.mrid === tab.mrid }" ref="tabItems">
                    <i style="color: #FDD835;" class="fa-solid fa-folder-open mgr-10 mgl-10"></i>
                    <span v-if="tab.mode == 'organisation'" class="tab-label">{{ tab.name }}</span>
                    <span v-else-if="tab.mode == 'substation'" class="tab-label">{{ tab.name }}</span>
                    <span v-else-if="tab.mode == 'voltageLevel'" class="tab-label">{{ tab.name }}</span>
                    <span v-else-if="tab.mode == 'bay'" class="tab-label">{{ tab.name }}</span>
                    <span v-else-if="tab.mode == 'asset'" class="tab-label">{{ tab.serial_number }}</span>
                    <span v-else-if="tab.mode == 'job'" class="tab-label">{{ tab.name }}</span>
                    <span v-else-if="tab.mode == 'test'" class="tab-label">{{ tab.name }}</span>
                    <span class="close-icon mgr-10 mgl-10"
                        :class="{ visible: hoveredTab === tab.mrid || activeTab.mrid === tab.mrid }"
                        @click.stop="closeTab(index)">✖</span>
                </div>
            </div>
            <div class="scroll-btn right" @click="scrollRight"><i class="fa-solid fa-angle-right"></i></div>
        </div>
        <div class="tabs-content">
            <div class="mgr-20 mgt-20 mgb-20 mgl-20" v-for="(item, index) in tabs" :key="item.mrid">
                <component mode="update" @reload="loadData" v-show="activeTab.mrid === item.mrid"
                    ref="componentLoadData" :sideData="sideSign" :is="checkTab(item)" :organisationId="item.parentId"
                    :testTypeListData="testTypeListData" :assetData="assetData"
                    :productAssetModelData="productAssetModelData" :parent="parentOrganization"
                    :locationData="locationData" style="min-height: calc(100vh - 250px);">
                </component>
                <span class="tab-actions" v-show="activeTab.mrid === item.mrid">
                    <el-button size="small" type="danger" @click="closeTab(index)">Close</el-button>
                    <el-button size="small" type="primary" @click="saveCtrlS()">Save</el-button>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */

import LocationViewData from '@/views/LocationInsert/locationLevelView.vue'
import OwnerView from '@/views/OwnerViewData/index.vue'
import Transformer from '@/views/AssetView/Transformer'
import OrganisationView from '@/views/Organisation/index.vue'
import * as subsMapper from '@/views/Mapping/Substation/index'
import * as orgMapper from '@/views/Mapping/Organisation/index'
import * as voltageMapper from '@/views/Mapping/VoltageLevel/index'
import * as surgeMapper from '@/views/Mapping/SurgeArrester/index'
import * as bushingMapper from '@/views/Mapping/Bushing/index'
import * as vtMapper from '@/views/Mapping/VoltageTransformer/index'
import * as SurgeArresterJobMapper from '@/views/Mapping/SurgerArresterJob/index'
import * as disconnectorMapper from '@/views/Mapping/Disconnector/index'
import * as PowerCableMapper from '@/views/Mapping/PowerCable'
import * as RotatingMachineMapper from '@/views/Mapping/RotatingMachine'

import VoltageLevel from '@/views/VoltageLevel/index.vue'
import Bay from '@/views/Bay/index.vue'
import SurgeArrester from '@/views/AssetView/SurgeArrester/index.vue'
import Bushing from '@/views/AssetView/Bushing/index.vue'
import SurgeArresterJob from '@/views/JobView/SurgeArrester/index.vue'
import VoltageTransformer from '@/views/AssetView/VoltageTransformer/index.vue'
import Disconnector from '@/views/AssetView/Disconnector/index.vue'
import PowerCable from '@/views/AssetView/PowerCable/index.vue'
import RotatingMachine from '@/views/AssetView/RotatingMachine/index.vue'

export default {
    name: "Tabs",
    components: {
        LocationViewData,
        OwnerView,
        Transformer,
        OrganisationView,
        VoltageLevel,
        Bay,
        SurgeArrester,
        Bushing,
        VoltageTransformer,
        SurgeArresterJob,
        Disconnector,
        PowerCable,
        RotatingMachine
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
    methods: {
        async loadData(tab, index) {
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
                        data.dto = dto
                    } else {
                        this.$message.error("Failed to load substation data");
                        return
                    }
                    this.$refs.componentLoadData[index].loadData(data)
                } else if (tab.mode === 'organisation') {
                    const data = await window.electronAPI.getOrganisationEntityByMrid(tab.mrid)
                    if (data.success) {
                        const orgEntity = orgMapper.OrgEntityToOrgDto(data.data)
                        this.$refs.componentLoadData[index].loadData(orgEntity)
                    } else {
                        this.$message.error("Failed to load organisation data");
                    }
                } else if (tab.mode === 'voltageLevel') {
                    const data = await window.electronAPI.getVoltageLevelEntityByMrid(tab.mrid)
                    if (data.success) {
                        const voltageLevelDto = voltageMapper.volEntityToVolDto(data.data)
                        this.$refs.componentLoadData[index].loadData(voltageLevelDto)
                    } else {
                        this.$message.error("Failed to load voltage level data");
                    }
                } else if (tab.mode === 'bay') {
                    const data = await window.electronAPI.getBayEntityByMrid(tab.mrid)
                    if (data.success) {
                        this.$refs.componentLoadData[index].loadData(data.data)
                    } else {
                        this.$message.error("Failed to load bay data");
                    }
                } else if (tab.mode === 'asset') {
                    if (tab.asset === 'Surge arrester') {
                        this.parentOrganization = {
                            mrid: tab.parentId
                        }
                        const data = await window.electronAPI.getSurgeArresterEntityByMrid(tab.mrid, tab.parentId)
                        if (data.success) {
                            const surgeArresterDto = surgeMapper.mapEntityToDto(data.data)
                            this.$refs.componentLoadData[index].loadData(surgeArresterDto)
                        } else {
                            this.$message.error("Failed to load surge arrester data");
                        }
                    } else if (tab.asset === 'Bushing') {
                        this.parentOrganization = {
                            mrid: tab.parentId
                        }
                        const data = await window.electronAPI.getBushingEntityByMrid(tab.mrid, tab.parentId)
                        if (data.success) {
                            const BushingDto = bushingMapper.mapEntityToDto(data.data)
                            this.$refs.componentLoadData[index].loadData(BushingDto)
                        } else {
                            this.$message.error("Failed to load surge arrester data");
                        }
                    } else if (tab.asset === 'Voltage transformer') {
                        this.parentOrganization = {
                            mrid: tab.parentId
                        }
                        const data = await window.electronAPI.getVoltageTransformerEntityByMrid(tab.mrid, tab.parentId)
                        console.log("data : ", data)
                        if (data.success) {
                            const vtDto = vtMapper.mapEntityToDto(data.data)
                            console.log("entityToDto : ", vtDto)
                            this.$refs.componentLoadData[index].loadData(vtDto)
                        } else {
                            this.$message.error("Failed to load surge arrester data");
                        }
                    } else if(tab.asset === 'Disconnector') {
                        this.parentOrganization = {
                            mrid : tab.parentId
                        }
                        const data = await window.electronAPI.getDisconnectorEntityByMrid(tab.mrid, tab.parentId)
                        if(data.success) {
                            const disconnectorDto = disconnectorMapper.disconnectorEntityToDto(data.data)
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
                            this.$refs.componentLoadData[index].loadData(powerCableDto)
                        } else {
                            this.$message.error("Failed to load Disconnector data");
                        }
                    } else if(tab.asset === 'Rotating machine') {
                        this.parentOrganization = {
                            mrid : tab.parentId
                        }
                        const data = await window.electronAPI.getRotatingMachineEntityByMrid(tab.mrid, tab.parentId)
                        if(data.success) {
                            const rotatingMachineDto = RotatingMachineMapper.mapEntityToDto(data.data)
                            this.$refs.componentLoadData[index].loadData(rotatingMachineDto)
                        } else {
                            this.$message.error("Failed to load Rotating Machine data");
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
                        const dataTestType = await window.electronAPI.getAllTestTypeSurgeArrester();
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
                            this.$refs.componentLoadData[index].loadData(surgeArresterJobDto)
                        } else {
                            this.$message.error("Failed to load surge arrester job data");
                        }
                    }
                } else {
                    this.$message.error("Unsupported tab mode");
                }
            } catch (error) {
                console.error("Error loading data:", error);
            }
        },
        async selectTab(tab, index) {
            try {
                this.indexTab = index
                this.activeTab = tab
                this.$emit('input', tab)
                this.$nextTick(() => {
                    if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                        this.$refs.componentLoadData[index].loadMapForView()
                    }
                })
            } catch (error) {
                console.error("Error selecting tab:", error);
            }
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
                }
            } else if (tab.mode == 'job') {
                if (tab.job === 'Surge arrester') {
                    return 'SurgeArresterJob'
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