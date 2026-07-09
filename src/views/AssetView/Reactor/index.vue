<template>
    <div id="asset">
        <div class="rx-view">
            <div class="rx-content">
                <PropertiesReactor :data="reactor.properties" @update-attachment="updateAttachment"
                    :attachment="normalAttachmentData">
                    <template #side-top>
                        <name-plate
                            class="rx-media-card"
                            :attachment_="nameplateAttachment"
                            :file-url="nameplateFileUrl"
                            height="230px"
                            @data-attachment="updateNameplate">
                        </name-plate>
                    </template>
                </PropertiesReactor>
                <reactorConfiguration :config="reactor.config"></reactorConfiguration>

                <!-- Ratings + Others: 2 card ngắn cạnh nhau trên màn rộng -->
                <el-row :gutter="16" class="short-cards">
                    <el-col :xs="24" :md="12" class="short-card-col">
                        <RatingsReactor :data="reactor.reactorRating"></RatingsReactor>
                    </el-col>
                    <el-col :xs="24" :md="12" class="short-card-col">
                        <OthersReactor :data="reactor.reactorOther"></OthersReactor>
                    </el-col>
                </el-row>
            </div>
        </div>
    </div>
</template>
<script>
import PropertiesReactor from './components/properties.vue'
import reactorConfiguration from './components/configuration.vue'
import OthersReactor from './components/others.vue'
import RatingsReactor from './components/ratings.vue'
import NamePlate from '@/views/Common/NamePlate.vue'
import mixin from './mixin'
export default {
    name: 'Reactor',
    components: {
        PropertiesReactor,
        reactorConfiguration,
        OthersReactor,
        RatingsReactor,
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
                    // eslint-disable-next-line no-unused-vars
                    const { role, ...rest } = item
                    return rest
                })
        },
        isSameAttachmentList(left, right) {
            return JSON.stringify(left || []) === JSON.stringify(right || [])
        },
        loadMapForView() {
        }
    },
}

</script>
<style lang="scss" scoped>
#asset {
    width: 100%;
    height: 100%;
}

.rx-view {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 0 4px 16px;
}

.rx-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
}

/* Short cards side by side, equal height */
.short-cards {
    display: flex;
    flex-wrap: wrap;
}

.short-cards .short-card-col {
    display: flex;
    flex-direction: column;
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

@media (max-width: 768px) {
    .rx-view {
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
