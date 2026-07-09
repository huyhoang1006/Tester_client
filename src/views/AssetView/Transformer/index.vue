<template>
    <div class="transformer-view">
        <div class="top-switch">
            <el-button class="trs-btn" :class="{ active: this.switch === 'Transformer' }" size="mini"
                @click="switchData('Transformer')">Transformer</el-button>
            <el-button class="trs-btn" :class="{ active: this.switch === 'Bushings' }" size="mini"
                @click="switchData('Bushings')">Bushings</el-button>
            <el-button class="trs-btn" :class="{ active: this.switch === 'Tap changer' }" size="mini"
                @click="switchData('Tap changer')">Tap changer</el-button>
            <el-button class="trs-btn" :class="{ active: this.switch === 'Surge Arrester' }" size="mini"
                @click="switchData('Surge Arrester')">Surge Arrester</el-button>
        </div>

        <div class="transformer-content">
            <div v-if="this.switch == 'Transformer'">
                <!-- Properties -->
                <property @update-attachment="updateAttachment" :attachment="normalAttachmentData"
                    @change-type="onChangeAssetType" :data="this.transformerDto.properties"
                    style="font-size: 12px !important;">
                    <template #side-top>
                        <name-plate
                            class="transformer-media-card"
                            :attachment_="nameplateAttachment"
                            :file-url="nameplateFileUrl"
                            height="230px"
                            @data-attachment="updateNameplate">
                        </name-plate>
                    </template>
                </property>

                <!-- Winding configuration + Others (short cards, side by side on wide screens) -->
                <div class="short-cards">
                    <div class="short-card-col">
                        <winding-configuration :properties="this.transformerDto.properties"
                            :data="this.transformerDto.winding_configuration"
                            style="font-size: 12px !important;"></winding-configuration>
                    </div>
                    <div class="short-card-col">
                        <other :data="this.transformerDto.others" :properties="this.transformerDto.properties"
                            style="font-size: 12px;"></other>
                    </div>
                </div>

                <!-- Ratings -->
                <rating :properties="this.transformerDto.properties" :data="this.transformerDto.ratings"
                    style="font-size: 12px !important;"></rating>

                <!-- Impedances -->
                <impedance @add="addShortCircuitTest" @remove="removeShortCircuitTest"
                    @removeArr="removeShortCircuitTestArr" :tapChangers="this.transformerDto.tap_changers"
                    :data="this.transformerDto.impedances" :properties="this.transformerDto.properties"
                    style="font-size: 12px !important;"></impedance>
            </div>

            <div v-else-if="this.switch == 'Tap changer'">
                <!-- Tap changer -->
                <tap-changer :properties="this.transformerDto.properties" :data="this.transformerDto.tap_changers"
                    style="font-size: 12px !important;"></tap-changer>
            </div>

            <!-- Bushings -->
            <div class="transformer-content" v-else-if="this.switch == 'Bushings'">
                <bushing :asset_type="this.transformerDto.properties.type"
                    :asset_phase="this.transformerDto.winding_configuration.phases"
                    :asset_winding_config="this.transformerDto.winding_configuration.vector_group"
                    :bushing_data="this.transformerDto.bushing_data" @input-bushing="onInputBushing">
                </bushing>
            </div>

            <!-- Surge Arrester -->
            <div v-else-if="this.switch == 'Surge Arrester'">
                <surge-arrester :data="this.transformerDto.surge_arrester" :properties="this.transformerDto.properties" @update="updateDataSurgeArrester"
                    style="font-size: 12px !important;"></surge-arrester>
            </div>

        </div>
    </div>
</template>

<script>
/* eslint-disable */
import WindingConfiguration from './components/WindingConfiguration/index.vue'
import Bushing from './components/Bushing/index.vue'
import TapChanger from './components/TapChanger/index.vue'
import SurgeArrester from './components/SurgeArrester/index.vue'
import Property from './components/Property/index.vue'
import Rating from './components/Rating/index.vue'
import Impedance from './components/Impedance/index.vue'
import Other from './components/Other/index.vue'
import mixin from './mixin'
import manufacturerAdd from '@/views/Common/ManufacturerAdd.vue'
import NamePlate from '@/views/Common/NamePlate.vue'

export default {
    name: 'AssetView',
    props: {
        parent: {
            type: Object,
            default: () => ({})
        },
        organisationId: {
            type: String,
            default: ''
        },

        locationId: {
            type: String,
            default: ''
        },
    },
    components: {
        WindingConfiguration,
        Bushing,
        TapChanger,
        Property,
        Rating,
        Impedance,
        Other,
        manufacturerAdd,
        SurgeArrester,
        NamePlate
    },
    mixins: [mixin],
    data() {
        return {
            title: 'transformer',
            switch: 'Transformer',
            normalAttachmentData: []
        }
    },
    computed: {
        parentData() {
            return this.parent
        },
        nameplateAttachment() {
            return (this.attachmentData || []).find(item => item && item.role === 'nameplate') || null
        },
        nameplateFileUrl() {
            return this.nameplateAttachment && this.nameplateAttachment.path ? this.nameplateAttachment.path : '-1'
        }
    },
    watch: {
        attachmentData: {
            deep: true,
            immediate: true,
            handler(value) {
                const normalAttachments = this.getNormalAttachments(value)
                if (!this.isSameAttachmentList(this.normalAttachmentData, normalAttachments)) {
                    this.normalAttachmentData = normalAttachments
                }
            }
        }
    },
    methods: {
        onInputBushing(bushings_config_arr) {
            this.bushings_config = bushings_config_arr
        },
        async switchData(data) {
            this.switch = data
        },
        updateAttachment(attachment) {
            this.mergeAttachmentData(attachment, this.nameplateAttachment)
        },
        updateNameplate(nameplate) {
            this.mergeAttachmentData(this.normalAttachmentData, nameplate)
        },
        mergeAttachmentData(attachments, nameplate) {
            const normalAttachments = this.getNormalAttachments(attachments)
            const data = [...normalAttachments]
            if (nameplate && nameplate.path) {
                data.push({
                    ...nameplate,
                    role: 'nameplate'
                })
            }
            if (!this.isSameAttachmentList(this.attachmentData, data)) {
                this.attachmentData = data
            }
        },
        getNormalAttachments(attachments) {
            return (attachments || [])
                .filter(item => item && item.path && item.role !== 'nameplate')
                .map(item => {
                    const { role, ...rest } = item
                    return rest
                })
        },
        isSameAttachmentList(left, right) {
            return JSON.stringify(left || []) === JSON.stringify(right || [])
        },
        loadMapForView() {
        },
        updateDataSurgeArrester(data) {
            this.transformerDto.surge_arrester = data
        }
    }
}
</script>

<style lang="scss" scoped>
.transformer-view {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 0 4px 16px;
}

.transformer-content {
    display: flex;
    flex: 1;
    flex-direction: column;
}

#asset {
    width: 100%;
    height: 100%;
}

table,
td,
th {
    border: 1px solid;
}

table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
}

th,
td {
    padding: 0px 10px;
    height: 30px;
}

.top-switch {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
    margin: 8px 0 14px;
}

/* Short cards side by side, equal height */
.short-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
    gap: 16px;
    align-items: stretch;
}

.short-cards .short-card-col {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.short-cards ::v-deep(.short-card-col > div) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
}

.short-cards ::v-deep(.content-toggle) {
    flex: 1;
}

::v-deep(.el-form-item__label) {
    font-size: 12px !important;
    color: #303133;
}

::v-deep(.el-input__inner),
::v-deep(.el-select .el-input__inner) {
    font-size: 12px !important;
    height: 32px;
    line-height: 32px;
}

::v-deep(.header-toggle) {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    margin-top: 14px;
    padding: 10px 14px;
    background: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 6px 6px 0 0;
    color: #606266;
    font-size: 12px;
    font-weight: 600;
}

::v-deep(.content-toggle) {
    padding: 14px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-top: 0;
    border-radius: 0 0 6px 6px;
}

::v-deep(.content-toggle > .content) {
    margin: 0;
}

::v-deep(.bolder) {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    color: #606266;
    font-size: 12px;
    font-weight: 600;
}

::v-deep(.el-divider.el-divider--horizontal) {
    margin: 8px 0 12px !important;
    background-color: #e4e7ed !important;
}

::v-deep(.table-strip-input-data) {
    overflow: hidden;
    border: 1px solid #e4e7ed !important;
    border-radius: 4px;
    background: #fff;
    color: #303133;
    font-size: 12px;
}

/* global style.css (public/style/style.css) stripes even rows and zeroes cell borders — reset both */
::v-deep(.table-strip-input-data > thead) {
    background-color: #f5f7fa;
}

::v-deep(.table-strip-input-data > tbody > tr),
::v-deep(.table-strip-input-data > tbody > tr:nth-child(even)) {
    background-color: #fff;
}

::v-deep(.table-strip-input-data > tbody > tr:hover) {
    background-color: #f9fafc;
}

::v-deep(.table-strip-input-data th) {
    background: #f5f7fa;
    color: #606266;
    font-weight: 600;
}

::v-deep(.table-strip-input-data th),
::v-deep(.table-strip-input-data td) {
    border: 1px solid #e4e7ed !important;
    height: 34px;
    padding: 4px 8px;
    vertical-align: middle;
}

::v-deep(.table-strip-input-data input),
::v-deep(.table-strip-input-data .el-input__inner) {
    height: 30px;
    line-height: 30px;
}

/* delete buttons inside tables: ghost icon style instead of solid red blocks */
::v-deep(.table-strip-input-data .el-button--danger) {
    width: auto;
    padding: 5px 7px;
    background: transparent;
    border-color: transparent;
    color: #cc0514;
}

::v-deep(.table-strip-input-data .el-button--danger:hover),
::v-deep(.table-strip-input-data .el-button--danger:focus) {
    background: #fdeaec;
    border-color: transparent;
    color: #cc0514;
}

/* toolbar buttons (Add / Clear / ...) */
::v-deep(.action-row) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-left: 0 !important;
    margin-right: 0 !important;
}

::v-deep(.action-row::before),
::v-deep(.action-row::after) {
    display: none;
}

::v-deep(.action-col-fit) {
    float: none;
    width: auto;
    padding-left: 0 !important;
    padding-right: 0 !important;
}

::v-deep(.btn-fluid) {
    min-height: 26px;
    padding: 5px 9px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
}

::v-deep(.btn-fluid i) {
    margin-right: 3px;
}

::v-deep(.top-switch .trs-btn) {
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    overflow: visible;
    flex: 0 1 auto;
    max-width: 100%;
    margin-left: 0;
    min-height: 32px;
    padding: 7px 10px;
    background: #fff;
    border-color: #dcdfe6;
    color: #606266;
    font-size: 12px;
    font-weight: 600;
}

::v-deep(.top-switch .trs-btn.active),
::v-deep(.top-switch .trs-btn.active:focus),
::v-deep(.top-switch .trs-btn.active:hover) {
    background: #012596;
    border-color: #012596;
    color: #fff;
}

::v-deep(.top-switch .trs-btn:hover),
::v-deep(.top-switch .trs-btn:focus) {
    background: #f5f7fa;
    border-color: #b8c0cc;
    color: #012596;
}

@media (max-width: 768px) {
    .transformer-view {
        padding: 0 0 12px;
    }

    ::v-deep(.header-toggle) {
        margin-top: 10px;
        padding: 9px 12px;
    }

    ::v-deep(.content-toggle) {
        padding: 12px;
    }

    ::v-deep(.el-form-item__label) {
        float: none;
        display: block;
        width: 100% !important;
        padding: 0 0 4px;
        text-align: left;
    }

    ::v-deep(.el-form-item__content) {
        margin-left: 0 !important;
    }

    ::v-deep(.table-strip-input-data) {
        min-width: 680px;
    }

    /* small tables inside short cards don't need forced width */
    ::v-deep(.short-cards .table-strip-input-data) {
        min-width: 0;
    }
}
</style>
