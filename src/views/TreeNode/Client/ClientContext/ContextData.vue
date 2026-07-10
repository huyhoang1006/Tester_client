<template>
    <div ref="contextDataClient" class="context-data">
        <div ref="contentDataClient" class="content-data">
            <div ref="contentClient" class="content">
                <div class="title-content"></div>
                <div class="content-content">
                    <Tabs :side="'client'" ref="clientTabs" :value="activeTabClient" :tabs="tabsClient"
                        @input="onTabChange"
                        @close-tab="removeTabClient"
                        @update-node-data="handleUpdateNodeData"
                        @refresh-properties="handleRefreshProperties" />
                </div>
            </div>
            <div @mousedown="startResizeContentClient" ref="resizerContentClient" class="resizer"></div>
            <div v-if="propertiesSignClient" ref="propertiesClient" class="properties">
                <ObjectPropertiesPanel
                    :properties="propertiesClient"
                    :show-asset="assetPropertySignClient"
                    :asset-properties="assetPropertiesClient"
                    :show-job="jobPropertySignClient"
                    :job-properties="jobPropertiesClient"
                    @hide="hidePropertiesClient" />
            </div>
            <button v-if="!propertiesSignClient" @click="showPropertiesClient" class="op-show-btn" title="Show Object Properties">
                <i class="fa-solid fa-angles-left"></i>
            </button>
        </div>
        <div ref="logBarClient" v-if="logSignClient" class="log-bar">
            <LogBar @reloadLog="reloadLogClient" :logData="logDataClient" @hideLogBar="hideLogBarClient">
            </LogBar>
        </div>
    </div>
</template>

<script>
import LogBar from '@/components/LogBar'
import Tabs from '@/views/Common/Tabs.vue'
import ObjectPropertiesPanel from '@/views/Common/ObjectPropertiesPanel.vue'

export default {
    name: 'ContextData',
    components: {
        LogBar,
        Tabs,
        ObjectPropertiesPanel
    },
    props: {
        activeTabClient: {
            type: Object,
            default: () => ({})
        },
        tabsClient: {
            type: Array,
            default: () => []
        },
        propertiesSignClient: {
            type: Boolean,
            default: true
        },
        propertiesClient: {
            type: Object,
            default: () => ({
                region: '',
                name: '',
                plant: '',
                address: '',
                city: '',
                state_province: '',
                postal_code: '',
                country: '',
                phone_no: '',
                email: '',
                geo_coordinates: ''
            })
        },
        assetPropertySignClient: {
            type: Boolean,
            default: false
        },
        assetPropertiesClient: {
            type: Object,
            default: () => ({
                asset: '',
                asset_type: '',
                serial_no: '',
                manufacturer: '',
                manufacturer_type: '',
                manufacturing_year: '',
                apparatus_id: '',
                country: ''
            })
        },
        jobPropertySignClient: {
            type: Boolean,
            default: false
        },
        jobPropertiesClient: {
            type: Object,
            default: () => ({
                name: '',
                work_order: '',
                creation_date: '',
                execution_date: '',
                tested_by: '',
                approved_by: '',
                ambient_condition: '',
                standard: ''
            })
        },
        logSignClient: {
            type: Boolean,
            default: false
        },
        logDataClient: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        // Resize methods
        startResizeContentClient() {
            document.addEventListener('mousemove', this.resizeContentClient)
            document.addEventListener('mouseup', this.stopResizeContentClient)
        },
        resizeContentClient(event) {
            if (!this.$refs.propertiesClient || !this.$refs.contentDataClient) return
            const parentWidth = this.$refs.contextDataClient.clientWidth
            let newWidth = parentWidth - event.clientX + this.$refs.contextDataClient.getBoundingClientRect().left
            const minWidth = parentWidth * 0.1
            const maxWidth = parentWidth * 0.4
            newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth))
            newWidth = (newWidth / parentWidth) * 100
            // Cập nhật width của sidebar và context-data
            this.$refs.propertiesClient.style.width = `${newWidth}%`
            this.$refs.contentClient.style.width = `${100 - newWidth}%`
        },
        stopResizeContentClient() {
            document.removeEventListener('mousemove', this.resizeContentClient)
            document.removeEventListener('mouseup', this.stopResizeContentClient)
        },

        // Properties methods
        async showPropertiesClient() {
            this.$emit('update:propertiesSignClient', true)
            const content = this.$refs.contentClient
            if (content) {
                content.style.width = `calc(75% - 5px)`
            }
        },
        async hidePropertiesClient() {
            this.$emit('update:propertiesSignClient', false)
            const content = this.$refs.contentClient
            if (content) {
                content.style.width = '100%'
            }
        },

        // Tab methods
        removeTabClient(index) {
            this.$emit('remove-tab-client', index)
        },
        
        // Handle tab change event
        onTabChange(selectedTab) {
            this.$emit('update:activeTabClient', selectedTab)
            this.$emit('tab-changed', selectedTab)
        },

        // Log methods
        hideLogBarClient() {
            this.$emit('update:logSignClient', false)
            const element = this.$refs.contentDataClient
            if (element) {
                element.style.height = '100%'
            }
        },
        async reloadLogClient(doneCallback) {
            this.$emit('reload-log-client', doneCallback)
        },
        handleUpdateNodeData(payload) {
           
            // Emit lên parent (treeNavigation) để update node trong tree
            this.$emit('update-node-data', payload)
        },
        handleRefreshProperties(tab) {
            
            // Emit lên parent (treeNavigation) để gọi showPropertiesDataClient
            this.$emit('refresh-properties', tab)
        },
        showLogBarClient() {
            this.$emit('update:logSignClient', true)
            const element = this.$refs.contentDataClient
            if (element) {
                element.style.height = '80%'
                this.$nextTick(() => {
                    const elementLog = this.$refs.logBarClient
                    if (elementLog) {
                        elementLog.style.height = '20%'
                    }
                })
            }
        },

        // Expose internal refs to parent component
        getContextDataClientRef() {
            return this.$refs.contextDataClient
        },
        getContentDataClientRef() {
            return this.$refs.contentDataClient
        },
        getContentClientRef() {
            return this.$refs.contentClient
        },
        getPropertiesClientRef() {
            return this.$refs.propertiesClient
        },
        getLogBarClientRef() {
            return this.$refs.logBarClient
        },
        getClientTabsRef() {
            return this.$refs.clientTabs
        }
    }
}
</script>

<style scoped>
.context-data {
    box-sizing: border-box;
    width: calc(80% - 5px);
    min-width: 0;   /* flex item: cho phép co, chặn khung tràn ngang */
    height: 100%;
}

.content-data {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    position: relative;
}

.content {
    width: calc(75% - 5px);
    /* Flex item: KHÔNG cho min-content của nội dung (bảng rộng) chống co,
       tránh đẩy khung app tràn ngang — bảng rộng tự cuộn trong view con */
    min-width: 0;
    background-color: white;
    font-size: 12px;
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

.resizer {
    width: 5px;
    background-color: white;
    cursor: ew-resize;
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

.log-bar {
    box-sizing: border-box;
    width: 100%;
    height: 20%;
    border: 1px rgb(224, 222, 222) solid;
}

.op-show-btn {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 22px;
    height: 64px;
    border: 1px solid #e4e7ed;
    border-right: none;
    border-radius: 6px 0 0 6px;
    background: #f5f7fa;
    color: #909399;
    font-size: 11px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: background 0.15s, color 0.15s;
}
.op-show-btn:hover {
    background: #ecf5ff;
    color: #409eff;
    border-color: #b5d4f4;
}

.fixed-box {
    box-sizing: border-box;
}

.pl10 {
    padding-left: 10px;
}

.break-word {
    word-break: break-word;
}
</style>
