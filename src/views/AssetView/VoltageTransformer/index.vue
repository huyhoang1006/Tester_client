<template>
    <div id="asset">
        <div class="vt-view">
            <div class="vt-content">
                <voltageTransProperty @setUpdate="setUpdate" :updateNew='updateNew' :update="update"
                    @editManu="editManu" :title="title" :properties.sync="voltageTransformer.properties"
                    @createAdd="updateShowAdd" :manufact="manufacturerCustom" @reloadManu="reloadManu()"
                    :attachment="normalAttachmentData" @update-attachment="updateAttachment">
                    <template #side-top>
                        <name-plate
                            class="vt-media-card"
                            :attachment_="nameplateAttachment"
                            :file-url="nameplateFileUrl"
                            height="230px"
                            @data-attachment="updateNameplate">
                        </name-plate>
                    </template>
                </voltageTransProperty>
                <configuration :config.sync="voltageTransformer.config"></configuration>
                <ratings :ratings.sync="voltageTransformer.ratings" :properties="voltageTransformer.properties">
                </ratings>
                <currentVTConfig :configs.sync="voltageTransformer.vt_Configuration"></currentVTConfig>
            </div>
        </div>
    </div>
</template>

<script>
import mixin from '../VoltageTransformer/mixin'
import voltageTransProperty from '../VoltageTransformer/components/properties.vue'
import ratings from '../VoltageTransformer/components/ratings.vue'
import currentVTConfig from '../VoltageTransformer/components/VTConfiguration.vue'
import configuration from '../VoltageTransformer/components/configuration.vue'
import NamePlate from '@/views/Common/NamePlate.vue'

export default {
    name: 'voltageTransformer',
    components: {
        voltageTransProperty,
        ratings,
        currentVTConfig,
        configuration,
        NamePlate
    },
    props: {
        parent: {
            type: Object,
            default: () => ({}),
            required: true
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
            mode: this.$constant.ADD,
            asset_id: null,
            saved: false,
            showAdd: false,
            title: 'voltage',
            manufacturerCustom: [],
            modeManu: 'insert',
            dataProperties: {},
            updateNew: '',
            update: false,
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
        onCancel() {
            this.$router.go(-1)
        },
        backToManage() {
            const sel = this
            this.$confirm('Do you want to exit?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
                .then(async () => {
                    sel.$router.push({ name: 'manage' })
                })
                .catch(() => {
                    return
                })
        },
        updateShowAdd(sign) {
            this.showAdd = sign
        },
        async editManu(item) {
            let rs = await window.electronAPI.getManufacturerByName(item)
            if (rs.success) {
                this.dataProperties = rs.data[0]
                this.showAdd = true
                this.modeManu = 'edit'
            }
        },
        async backSign(sign) {
            this.showAdd = sign
            let rs = await await window.electronAPI.getManufacturerByType(this.title)
            if (rs.success) {
                this.manufacturerCustom = rs.data.map(e => e.name)
            }
            this.modeManu = 'insert'
        },
        async backSignUpdate(dataUpdate) {
            this.showAdd = false
            let rs = await await window.electronAPI.getManufacturerByType(this.title)
            if (rs.success) {
                this.manufacturerCustom = rs.data.map(e => e.name)
            }
            this.modeManu = 'insert'
            this.update = true
            this.updateNew = dataUpdate
        },
        async setUpdate(check) {
            this.update = check
        },
        async reloadManu() {
            let rs = await await window.electronAPI.getManufacturerByType(this.title)
            if (rs.success) {
                this.manufacturerCustom = rs.data.map(e => e.name)
            }
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

.vt-view {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 0 4px 16px;
}

.vt-content {
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
    .vt-view {
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
