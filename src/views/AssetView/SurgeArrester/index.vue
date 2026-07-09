<template>
    <div id="asset">
        <div class="sa-view">
            <div class="sa-content">
                <property :data="this.surge_arrester_data.properties" @update-attachment="updateAttachment"
                    :attachment="normalAttachmentData">
                    <template #side-top>
                        <name-plate
                            class="sa-media-card"
                            :attachment_="nameplateAttachment"
                            :file-url="nameplateFileUrl"
                            height="230px"
                            @data-attachment="updateNameplate">
                        </name-plate>
                    </template>
                </property>
                <configuration :config="this.surge_arrester_data.config"></configuration>
                <ratings :data="this.surge_arrester_data.ratings"></ratings>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import mixin from './mixin'
import property from './components/property/index.vue'
import ratings from './components/ratings/index.vue'
import configuration from './components/configuration/index.vue'
import NamePlate from '@/views/Common/NamePlate.vue'

export default {
    name: 'surgeArrester',
    components: {
        property,
        ratings,
        configuration,
        NamePlate
    },

    props: {
        parent : {
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
    data() {
        return {
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
    mixins : [mixin],
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
                    const { role, ...rest } = item
                    return rest
                })
        },
        isSameAttachmentList(left, right) {
            return JSON.stringify(left || []) === JSON.stringify(right || [])
        },
        loadMapForView() {
        }
    }
}
</script>

<style lang="scss" scoped>
#asset {
    width: 100%;
    height: 100%;
}

.sa-view {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 0 4px 16px;
}

.sa-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
}

::v-deep(.el-form-item__label) {
    font-size: 12px !important;
    color: #303133;
}

/* global element-ui.css ép .el-input__inner width 80px — trả lại full width trong view này */
::v-deep(.el-form .el-input),
::v-deep(.el-form .el-select) {
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

/* global element-ui.css ép divider màu đen #17202A !important — override lại */
::v-deep(.el-divider.el-divider--horizontal) {
    margin: 8px 0 12px !important;
    background-color: #e4e7ed !important;
}

::v-deep(.table-scroll) {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
}

::v-deep(.table-scroll::-webkit-scrollbar) {
    height: 5px;
}

::v-deep(.table-scroll::-webkit-scrollbar-track) {
    background: transparent;
}

::v-deep(.table-scroll::-webkit-scrollbar-thumb) {
    background-color: rgba(120, 120, 120, 0.6);
    border-radius: 6px;
}

::v-deep(.table-strip-input-data) {
    overflow: hidden;
    border: 1px solid #e4e7ed !important;
    border-radius: 4px;
    background: #fff;
    color: #303133;
    font-size: 12px !important;
}

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

::v-deep(.table-strip-input-data .el-input),
::v-deep(.table-strip-input-data .el-select) {
    width: 100%;
    min-width: 100px;
}

::v-deep(.table-strip-input-data .el-input-group__append) {
    min-width: 36px;
    padding: 0 8px;
    text-align: center;
}

@media (max-width: 768px) {
    .sa-view {
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
