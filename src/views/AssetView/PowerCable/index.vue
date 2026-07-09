<template>
    <div id="asset">
        <div class="pc-view">
            <div class="top-switch">
                <el-button class="switch-btn" :class="{ active: this.switch === 'powerCable' }"
                    @click="switchData('powerCable')" size="mini">Power Cable</el-button>
                <el-button class="switch-btn" :class="{ active: this.switch === 'assessories' }"
                    @click="switchData('assessories')" size="mini">Accessories</el-button>
            </div>
            <div class="pc-content">
                <div v-if="this.switch == 'powerCable'">
                    <powerCableProperty
                        :properties.sync="powerCable.properties"
                        :attachment="normalAttachmentData"
                        @update-attachment="updateAttachment">
                        <template #side-top>
                            <name-plate
                                class="pc-media-card"
                                :attachment_="nameplateAttachment"
                                :file-url="nameplateFileUrl"
                                height="230px"
                                @data-attachment="updateNameplate">
                            </name-plate>
                        </template>
                    </powerCableProperty>
                    <configs :layer.sync="powerCable.layersData" :ratings.sync="powerCable.ratingsData"
                        :configs.sync="powerCable.configsData" :other="powerCable.othersData"
                        :datas="powerCable.datasData">
                    </configs>
                </div>
                <div v-else-if="this.switch == 'assessories'">
                    <assessories :joint="powerCable.datasData.jointsData" :terminal="powerCable.datasData.terminalsData"
                        :sheathLimit="powerCable.datasData.sheathLimitsData"></assessories>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import powerCableProperty from './components/properties.vue'
import configs from './components/configs.vue'
import mixin from './mixin'
import assessories from './components/assessories.vue'
import NamePlate from '@/views/Common/NamePlate.vue'

export default {
    name: 'powerCable',
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
        powerCableProperty,
        configs,
        assessories,
        NamePlate
    },
    data() {
        return {
            switch: 'powerCable',
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
    mixins: [mixin],
    methods: {
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
                    // eslint-disable-next-line no-unused-vars
                    const { role, ...rest } = item
                    return rest
                })
        },
        isSameAttachmentList(left, right) {
            return JSON.stringify(left || []) === JSON.stringify(right || [])
        },
        loadMapForView() { },
    }
}
</script>

<style lang="scss" scoped>
#asset {
    width: 100%;
    height: 100%;
}

.pc-view {
    display: flex;
    flex-direction: column;
    min-height: 500px;
    padding: 0 4px 16px;
}

.pc-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
}

.top-switch {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
}

.switch-btn {
    width: fit-content;
    min-width: 108px;
    margin-left: 0 !important;
    padding: 7px 14px;
    color: #303133;
    background: #fff;
    border-color: #dcdfe6;
    font-size: 12px;
}

.switch-btn.active {
    color: #fff;
    background: #002b9a;
    border-color: #002b9a;
}

::v-deep(.el-form-item__label) {
    color: #303133;
    font-size: 12px !important;
}

::v-deep(.el-form .el-input),
::v-deep(.el-form .el-select),
::v-deep(.el-form .el-textarea) {
    width: 100%;
}

::v-deep(.el-input__inner),
::v-deep(.el-select .el-input__inner) {
    width: 100%;
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
    font-size: 12px !important;
    font-weight: 600;
}

::v-deep(.content-toggle) {
    padding: 14px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-top: 0;
    border-radius: 0 0 6px 6px;
}

::v-deep(.content) {
    margin-right: 0 !important;
    margin-left: 0 !important;
}

::v-deep(.bolder) {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    color: #606266;
    font-size: 12px !important;
    font-weight: 600;
}

::v-deep(.el-divider.el-divider--horizontal) {
    margin: 8px 0 12px !important;
    background-color: #e4e7ed !important;
}

::v-deep(.el-input-group__append) {
    min-width: 38px;
    padding: 0 8px;
    text-align: center;
}

@media (max-width: 768px) {
    .pc-view {
        padding: 0 0 12px;
    }

    .switch-btn {
        flex: 1 1 140px;
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
}
</style>
