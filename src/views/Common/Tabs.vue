
<!-- eslint-disable -->
<template>
    <div ref="customTabs" class="custom-tabs">
        <div class="tabs-header">
            <div class="scroll-btn left" @click="scrollLeft"><i class="fa-solid fa-chevron-left"></i></div>
            <div class="tabs-header-data" ref="tabsHeader" @scroll="checkScroll">
                <div
                    v-for="(tab, index) in tabs"
                    :key="tab.id"
                    @click="selectTab(tab, index)"
                    @mouseover="hoveredTab = tab.id"
                    @mouseleave="hoveredTab = null"
                    class="tab-item"
                    :class="{active: activeTab.id === tab.id}"
                    ref="tabItems">
                    <i style="color: #FDD835;" class="fa-solid fa-folder-open mgr-10 mgl-10"></i>
                    <span v-if="dataTypeOwner.includes(tab.mode)" class="tab-label">{{ tab.name }}</span>
                    <span v-if="dataType.includes(tab.mode)" class="tab-label">{{ tab.name }}</span>
                    <span v-if="assetType.includes(tab.asset)" class="tab-label">{{ tab.serial_no }}</span>
                    <span v-if="tab.type == 'job'" class="tab-label">{{ tab.name }}</span>
                    <span v-if="tab.type == 'test'" class="tab-label">{{ tab.name }}</span>
                    <span class="close-icon mgr-10 mgl-10" :class="{visible: hoveredTab === tab.id || activeTab.id === tab.id}" @click.stop="closeTab(index)">✖</span>
                </div>
            </div>
            <div class="scroll-btn right" @click="scrollRight"><i class="fa-solid fa-angle-right"></i></div>
        </div>
        <div class="tabs-content">
            <div class="mgr-20 mgt-20 mgb-20 mgl-20" v-for="(item) in tabs" :key="item.id">
                <component v-show="activeTab.id === item.id" ref="componentLoadData" :sideData="sideSign" :is="checkTab(item)" :ownerData="item"></component>
            </div>
        </div>
    </div>
</template>
  
<script>
/* eslint-disable */

import LocationViewData from '@/views/LocationInsert/locationLevelView.vue'
import OwnerView from '@/views/OwnerViewData/index.vue'
import Transformer from '@/views/AssetView/Transformer'
export default {
    name : "Tabs",
    components: {
        LocationViewData,
        OwnerView,
        Transformer
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
        }
    },
    data() {
        return {
            activeTab: this.value,
            sideSign : this.side,
            hoveredTab: null,
            canScrollLeft: false,
            canScrollRight: false,
            dataType : ["location", "voltage", "feeder"],
            dataTypeOwner : ["OWNER1", "OWNER2", "OWNER3", "OWNER4", "OWNER5"],
            assetType : ["Transformer", "Circuit breaker", "Current transformer", "Disconnector", "Surge arrester", "Power cable", "Voltage transformer"]
        }
    },
    watch: {
        value: {
            handler(newVal) {
                if (newVal && (!this.activeTab || newVal.id !== this.activeTab.id)) {
                    this.activeTab = { ...newVal }; // Tạo object mới
                }
            },
            deep: true, // Theo dõi thay đổi sâu trong object
            immediate: true // Chạy ngay khi mounted
        },
        tabs(newVal) {
            this.checkScroll()
            const customTabs = this.$refs.customTabs
            if(customTabs && this.tabs.length == 0) {
                customTabs.style.borderBottom = "none";
            }
        }
    },
    methods: {
        async selectTab(tab, index) {
            this.activeTab = tab
            this.$emit('input', tab)
            this.$nextTick(() => {
                if(this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                    this.$refs.componentLoadData[index].loadMapForView()
                }
            })
        },
        closeTab(index) {
            this.$emit('close-tab', index)
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
            if(this.dataType.includes(tab.mode)) {
                return 'LocationViewData'
            } else if (this.dataTypeOwner.includes(tab.mode)) {
                return 'OwnerView'
            } else {
                if(tab.asset != undefined) {
                    if(tab.asset == 'Transformer') {
                        return 'Transformer'
                    } else if(tab.asset == 'Circuit breaker') {
                        return 'CircuitBreaker'
                    } else {
                        return 'Transformer'
                    }
                } else {
                    return 'LocationViewData'
                }
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
  