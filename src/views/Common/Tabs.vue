
<!-- eslint-disable -->
<template>
    <div ref="customTabs" class="custom-tabs">
        <div class="tabs-header">
            <div class="scroll-btn left" @click="scrollLeft"><i class="fa-solid fa-chevron-left"></i></div>
            <div class="tabs-header-data" ref="tabsHeader" @scroll="checkScroll">
                <div
                    v-for="(tab, index) in tabs"
                    :key="tab.mrid"
                    @click="selectTab(tab, index)"
                    @mouseover="hoveredTab = tab.mrid"
                    @mouseleave="hoveredTab = null"
                    class="tab-item"
                    :class="{active: activeTab.mrid === tab.mrid}"
                    ref="tabItems">
                    <i style="color: #FDD835;" class="fa-solid fa-folder-open mgr-10 mgl-10"></i>
                    <span v-if="tab.mode == 'organisation'" class="tab-label">{{ tab.name }}</span>
                    <span v-else-if="tab.mode == 'substation'" class="tab-label">{{ tab.name }}</span>
                    <span v-else-if="tab.mode == 'asset'" class="tab-label">{{ tab.serial_no }}</span>
                    <span v-else-if="tab.mode == 'job'" class="tab-label">{{ tab.name }}</span>
                    <span v-else-if="tab.mode == 'test'" class="tab-label">{{ tab.name }}</span>
                    <span class="close-icon mgr-10 mgl-10" :class="{visible: hoveredTab === tab.mrid || activeTab.mrid === tab.mrid}" @click.stop="closeTab(index)">✖</span>
                </div>
            </div>
            <div class="scroll-btn right" @click="scrollRight"><i class="fa-solid fa-angle-right"></i></div>
        </div>
        <div class="tabs-content">
            <div class="mgr-20 mgt-20 mgb-20 mgl-20" v-for="(item) in tabs" :key="item.mrid">
                <component mode="update" @reload="loadData" v-show="activeTab.mrid === item.mrid" ref="componentLoadData" :sideData="sideSign" :is="checkTab(item)" :organisationId="item.parrentId"></component>
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

export default {
    name : "Tabs",
    components: {
        LocationViewData,
        OwnerView,
        Transformer,
        OrganisationView
    },
    model: {
        prop: 'value',
        event: 'input'
    },
    props: {
        value: Object,
        tabs: Array,
        side : {
            type: String,
            required: true
        },
    },
    data() {
        return {
            activeTab: this.value,
            tabsData : [],
            indexTab: null,
            sideSign : this.side,
            hoveredTab: null,
            canScrollLeft: false,
            canScrollRight: false,
        }
    },
    methods: {
        async loadData(tab, index) {
            try {
                if(index == null) {
                    index = this.tabs.findIndex(t => t.mrid === tab.mrid);
                    if(index === -1) {
                        this.$message.error("Tab not found");
                        return;
                    }
                }
                if(tab.mode === 'substation') {
                    const [dataLocation, dataPerson, dataEntity] = await Promise.all([
                        window.electronAPI.getLocationByOrganisationId(tab.parentId),
                        window.electronAPI.getPersonByOrganisationId(tab.parentId),
                        window.electronAPI.getSubstationEntityByMrid(tab.mrid, this.$store.state.user.user_id, tab.parentId)
                    ]);
                    const data = {
                        locationList: [],
                        personList: [],
                        dto: null,
                        substation : tab
                    }
                    if(dataLocation.success) {
                        data.locationList = dataLocation.data
                    } else {
                        data.locationList = []
                    }
                    
                    if(dataPerson.success) {
                        data.personList = dataPerson.data
                    } else {
                        data.personList = []
                    }

                    if(dataEntity.success) {
                        const dto = subsMapper.mapEntityToDto(dataEntity.data)
                        data.dto = dto
                    } else {
                        this.$message.error("Failed to load substation data");
                        return
                    }
                    this.$refs.componentLoadData[index].loadData(data)
                } else {
                    //
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
                    if(this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                        this.$refs.componentLoadData[index].loadMapForView()
                    }
                })
            } catch (error) {
                console.error("Error selecting tab:", error);
            }
        },
        closeTab(index) {
            this.$emit('close-tab', index)
            if(this.indexTab === index) {
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
            if(tab.mode == 'substation') {
                return 'LocationViewData'
            } else if(tab.mode == 'organisation') {
                return 'OrganisationView'
            }
        },
        saveCtrlS() {
            try {
                if(this.indexTab !== null) {
                    if(this.$refs.componentLoadData && this.$refs.componentLoadData[this.indexTab]) {
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
    flex-wrap: nowrap; /* Không cho xuống dòng */
    overflow-x : hidden;
    overflow-y : hidden;
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
    overflow-y: auto; /* Cho phép cuộn theo chiều dọc */
    overflow-x: auto; /* Scroll ngang vẫn hiển thị */
    scrollbar-width: none; /* Ẩn scrollbar dọc trên Firefox */
}

.tabs-content::-webkit-scrollbar {
    width: 0; /* Ẩn scrollbar dọc trên Chrome, Safari, Edge */
}
</style>
  