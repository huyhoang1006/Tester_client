<template>
    <div ref="customTabs" class="custom-tabs">
        <div class="tabs-header">
            <button class="scroll-btn left" @click="scrollLeft"><i class="fa-solid fa-chevron-left"></i></button>
            <div class="tabs-header" ref="tabsHeader" @scroll="checkScroll">
                <div
                    v-for="(tab, index) in tabs"
                    :key="tab.name"
                    class="tab-item"
                    :class="{active: activeTab === tab.name}"
                    @click="selectTab(tab.name, index)"
                    @mouseover="hoveredTab = tab.name"
                    @mouseleave="hoveredTab = null"
                    ref="tabItems">
                    <span class="tab-label">{{ tab.label + 43244324324324234324 }}</span>
                    <span class="close-icon" :class="{visible: hoveredTab === tab.name || activeTab === tab.name}" @click.stop="closeTab(index)">✖</span>
                </div>
            </div>
            <button class="scroll-btn right" @click="scrollRight"><i class="fa-solid fa-angle-right"></i></button>
        </div>
        <div class="tabs-content">

        </div>
    </div>
</template>
  
<script>
/* eslint-disable */
export default {
    name : "Tabs",
    props: {
        value: String,
        tabs: Array
    },
    data() {
        return {
            activeTab: this.value,
            hoveredTab: null,
            canScrollLeft: false,
            canScrollRight: false
        }
    },
    watch: {
        value(newVal) {
            this.activeTab = newVal
        },
        tabs(newVal) {
            this.checkScroll()
            const customTabs = this.$refs.customTabs
            if(customTabs && this.tabs.length == 0) {
                customTabs.style.borderBottom = "none";
            }
        }
    },
    mounted() {
        console.log("A")
        this.checkScroll()
        window.addEventListener('resize', this.checkScroll)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.checkScroll)
    },
    methods: {
        selectTab(name, index) {
            this.activeTab = name
            this.$emit('input', name)
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
    }
}
</script>
  
  <style scoped>
.custom-tabs {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
}
.tabs-header {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    height: 40px;
    box-sizing: border-box;
}
.tabs-header-data {
    display: flex;
    gap: 8px;
    /* overflow-x: auto;
    scrollbar-width: none; */
    max-width: 100%; /* Giữ chiều rộng tối đa trong phần tử cha */
}
.tabs-header-data::-webkit-scrollbar {
    display: none;
}
.tab-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    position: relative;
    border-bottom: 2px solid transparent;
    transition: border-bottom 0.3s;
    height: 32px;
    box-sizing: border-box;
}
.tab-item.active {
    border-bottom: 3px solid #012596;
    font-weight: bold;
}
.close-icon {
    margin-left: 8px;
    cursor: pointer;
    color: red;
    font-size: 14px;
    visibility: hidden;
    width: 14px;
    text-align: center;
}
.close-icon.visible {
    visibility: visible;
}
.scroll-btn {
    height: 100%;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 20px;
    color: #012596;
    align-items: center;
    width: 30px;
}
.scroll-btn:focus {
    outline: none;
}
</style>
  