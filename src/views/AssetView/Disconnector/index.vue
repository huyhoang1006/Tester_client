<template>
    <div id="asset">
        <div class="ds-view">
            <div class="ds-content">
                <disconnectTransProperty
                    :properties.sync="disconnector.properties"
                    :attachment="normalAttachmentData"
                    @update-attachment="updateAttachment">
                    <template #side-top>
                        <name-plate
                            class="ds-media-card"
                            :attachment_="nameplateAttachment"
                            :file-url="nameplateFileUrl"
                            height="230px"
                            @data-attachment="updateNameplate">
                        </name-plate>
                    </template>
                </disconnectTransProperty>
                <configuration :config.sync="disconnector.config"></configuration>
                <ratings :ratings.sync="disconnector.ratings"></ratings>
            </div>
        </div>
    </div>
</template>

<script>
import mixin from '../Disconnector/mixin'
import disconnectTransProperty from '../Disconnector/components/properties.vue'
import ratings from '../Disconnector/components/ratings.vue'
import configuration from '../Disconnector/components/configuration.vue'
import NamePlate from '@/views/Common/NamePlate.vue'

export default {
    name: 'disconnector',
    components: {
        disconnectTransProperty,
        ratings,
        configuration,
        NamePlate
    },
    data() {
        return {
            title: 'disconnector',
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
    methods: {
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
        loadMapForView() {
        },
    }
}
</script>

<style lang="scss" scoped>
#asset {
    width: 100%;
    height: 100%;
}

.ds-view {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 0 4px 16px;
}

.ds-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
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

::v-deep(.content-toggle > .content) {
    margin: 0;
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

@media (max-width: 768px) {
    .ds-view {
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
}
</style>
