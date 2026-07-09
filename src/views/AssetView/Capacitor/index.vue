<template>
    <div id="asset">
        <div class="cap-view">
            <div class="cap-content">
                <capacitorProperty
                    :data="capacitor.properties"
                    @update-attachment="updateAttachment"
                    :attachment="normalAttachmentData">
                    <template #side-top>
                        <name-plate
                            class="cap-media-card"
                            :attachment_="nameplateAttachment"
                            :file-url="nameplateFileUrl"
                            height="230px"
                            @data-attachment="updateNameplate">
                        </name-plate>
                    </template>
                </capacitorProperty>
                <configs
                    :configs="capacitor.configsData"
                    :ratings="capacitor.ratings"
                    :others="capacitor.othersData"
                    :capacitance="capacitor.capacitance"
                    :dissipationFactor="capacitor.dissipationFactor"
                    @update-configs="updateConfigs"
                    @update-ratings="updateRatings"
                    @update-others="updateOthers"
                    @update-capacitance="updateCapacitance"
                    @update-dissipation-factor="updateDissipationFactor">
                </configs>
            </div>
        </div>
    </div>
</template>

<script>
import mixin from './mixin'
import capacitorProperty from './components/properties.vue'
import configs from './components/configs.vue'
import NamePlate from '@/views/Common/NamePlate.vue'


export default {
    name: 'capacitor',
    components: {
        capacitorProperty,
        configs,
        NamePlate
    },
    data() {
        return {
            title : 'capacitor',
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
        updateConfigs(configs) {
            // Backup toàn bộ state trước khi phase thay đổi
            const oldPhase = this.capacitor.configsData ? this.capacitor.configsData.number_of_phase : null;
            const newPhase = configs ? configs.number_of_phase : null;

            // Nếu quay lại phase cũ VÀ phase thực sự thay đổi, restore dữ liệu từ backup
            if (this.capacitorOld && this.capacitorOld.configsData && oldPhase !== newPhase && this.capacitorOld.configsData.number_of_phase === newPhase) {
                // Restore toàn bộ configsData, capacitance, dissipationFactor
                this.capacitor.configsData = JSON.parse(JSON.stringify(this.capacitorOld.configsData));
                this.capacitor.capacitance = JSON.parse(JSON.stringify(this.capacitorOld.capacitance));
                this.capacitor.dissipationFactor = JSON.parse(JSON.stringify(this.capacitorOld.dissipationFactor));
                this.capacitor.ratings = JSON.parse(JSON.stringify(this.capacitorOld.ratings));
                this.capacitor.othersData = JSON.parse(JSON.stringify(this.capacitorOld.othersData));
                return; // Dừng lại, không cần update nữa
            } else if (oldPhase && newPhase && oldPhase !== newPhase) {
                // Backup toàn bộ capacitor để preserve cả capacitance và dissipationFactor
                this.capacitorOld = JSON.parse(JSON.stringify(this.capacitor));
                // Update phase sau khi backup
                this.capacitor.configsData = configs;
            } else {
                // Không phải phase change, chỉ update configs
                // Đảm bảo merge phase_name vào configsData hiện tại
                this.capacitor.configsData = JSON.parse(JSON.stringify(configs));
            }
        },
        updateRatings(ratings) {
            this.capacitor.ratings = ratings;
        },
        updateOthers(others) {
            this.capacitor.othersData = others;
        },
        updateCapacitance(capacitance) {
            this.capacitor.capacitance = capacitance;
        },
        updateDissipationFactor(dissipationFactor) {
            this.capacitor.dissipationFactor = dissipationFactor;
            // Force Vue reactivity by creating new reference
            this.capacitor.dissipationFactor = Object.assign({}, dissipationFactor);
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

.cap-view {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 0 4px 16px;
}

.cap-content {
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

@media (max-width: 768px) {
    .cap-view {
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
