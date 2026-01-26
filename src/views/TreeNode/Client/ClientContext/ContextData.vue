<template>
    <div ref="contextDataClient" class="context-data">
        <div ref="contentDataClient" class="content-data">
            <div ref="contentClient" class="content">
                <div class="title-content"></div>
                <div class="content-content">
                    <Tabs :side="'client'" ref="clientTabs" :value="activeTabClient" :tabs="tabsClient"
                        @input="onTabChange"
                        @close-tab="removeTabClient" />
                </div>
            </div>
            <div @mousedown="startResizeContentClient" ref="resizerContentClient" class="resizer"></div>
            <div v-if="propertiesSignClient" ref="propertiesClient" class="properties">
                <div class="title-properties">
                    <div class="title-wrapper">
                        <div class="title-name">Object Properties</div>
                        <div style="margin-right: 5px">
                            <i @click="hidePropertiesClient" class="fa-solid fa-square-caret-right"></i>
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
                                propertiesClient.name || '&nbsp;' }}</div>
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
                            <div class="content-properties-table-content fixed-box pl10 break-word">
                                {{ propertiesClient.state_province || '&nbsp;' }}
                            </div>
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
                            <div class="content-properties-table-content fixed-box pl10 break-word">
                                {{ propertiesClient.geo_coordinates || '&nbsp;' }}
                            </div>
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
                        <i class="fa-solid fa-chevron-down" style="padding-right: 5px; font-size: 10px"></i>
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
                            <div class="content-properties-table-content fixed-box pl10 break-word">
                                {{ assetPropertiesClient.asset_type || '&nbsp;' }}
                            </div>
                        </div>
                        <div class="content-properties-table-flex">
                            <div class="content-properties-table-header">Serial number</div>
                            <div class="content-properties-table-content fixed-box pl10 break-word">
                                {{ assetPropertiesClient.serial_no || '&nbsp;' }}
                            </div>
                        </div>
                        <div class="content-properties-table-flex">
                            <div class="content-properties-table-header">Manufacturer</div>
                            <div class="content-properties-table-content fixed-box pl10 break-word">
                                {{ assetPropertiesClient.manufacturer || '&nbsp;' }}
                            </div>
                        </div>
                        <div class="content-properties-table-flex">
                            <div class="content-properties-table-header">Manufacturer type</div>
                            <div class="content-properties-table-content fixed-box pl10 break-word">
                                {{ assetPropertiesClient.manufacturer_type || '&nbsp;' }}
                            </div>
                        </div>
                        <div class="content-properties-table-flex">
                            <div class="content-properties-table-header">Manufacturing year</div>
                            <div class="content-properties-table-content fixed-box pl10 break-word">
                                {{ assetPropertiesClient.manufacturing_year || '&nbsp;' }}
                            </div>
                        </div>
                        <div class="content-properties-table-flex">
                            <div class="content-properties-table-header">Country</div>
                            <div class="content-properties-table-content fixed-box pl10 break-word">
                                {{ assetPropertiesClient.country || '&nbsp;' }}
                            </div>
                        </div>
                        <div class="content-properties-table-flex">
                            <div class="content-properties-table-header">Apparatus id</div>
                            <div class="content-properties-table-content fixed-box pl10 break-word">
                                {{ assetPropertiesClient.apparatus_id || '&nbsp;' }}
                            </div>
                        </div>
                    </div>
                    <div v-if="jobPropertySignClient" class="content-properties-header">
                        <i class="fa-solid fa-chevron-down" style="padding-right: 5px; font-size: 10px"></i>
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
            <div v-if="!propertiesSignClient" @click="showPropertiesClient" class="trapezoid"></div>
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

export default {
    name: 'ContextData',
    components: {
        LogBar,
        Tabs
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
    height: 100%;
}

.content-data {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
}

.content {
    width: calc(75% - 5px);
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

.trapezoid {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    width: 1.2vh !important;
    height: 10vh;
    background: #d9d9d9;
    clip-path: polygon(100% 0%, 100% 100%, 0% 80%, 0% 20%);
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