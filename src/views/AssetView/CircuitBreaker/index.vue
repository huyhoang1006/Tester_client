<template>
    <div id="asset">
        <div class="circuit-view">
            <div class="top-switch">
                <el-button class="trs-btn" :class="{ active: this.switch === 'circuitBreaker' }"
                    @click="switchData('circuitBreaker')" size="mini">Circuit Breaker</el-button>
                <el-button class="trs-btn" :class="{ active: this.switch === 'operatingMechanism' }"
                    @click="switchData('operatingMechanism')" size="mini">Operating</el-button>
                <el-button class="trs-btn" :class="{ active: this.switch === 'assessmentLimit' }"
                    @click="switchData('assessmentLimit')" size="mini">Assessment</el-button>
            </div>
            <div class="circuit-content">
                <div v-if="this.switch == 'circuitBreaker'">
                    <circuitBreakProperty :title="title" :properties.sync="circuitBreakerDto.properties"
                        @update-attachment="updateAttachment" :attachment="normalAttachmentData">
                        <template #side-top>
                            <name-plate
                                class="circuit-media-card"
                                :attachment_="nameplateAttachment"
                                :file-url="nameplateFileUrl"
                                height="230px"
                                @data-attachment="updateNameplate">
                            </name-plate>
                        </template>
                    </circuitBreakProperty>
                    <circuitBreakerData :properties="circuitBreakerDto.properties"
                        :circuitBreaker="circuitBreakerDto.circuitBreaker"></circuitBreakerData>
                    <circuitBreakRating :ratings.sync="circuitBreakerDto.ratings"></circuitBreakRating>
                    <contactSystem :contactSys.sync="circuitBreakerDto.contactSystem"></contactSystem>
                    <others :others="circuitBreakerDto.others"></others>
                </div>
                <div v-else-if="this.switch == 'operatingMechanism'">
                    <operatingMechanism :operating.sync="circuitBreakerDto.operating"></operatingMechanism>
                </div>
                <div v-else-if="this.switch == 'assessmentLimit'">
                    <assessmentLimit :assessLimits.sync="circuitBreakerDto.assessmentLimits"></assessmentLimit>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import mixin from './mixin'
import circuitBreakProperty from '../CircuitBreaker/components/properties.vue'
import circuitBreakRating from '../CircuitBreaker/components/ratings.vue'
import circuitBreakerData from '../CircuitBreaker/components/circuitBreaker.vue'
import contactSystem from '../CircuitBreaker/components/contactSystem.vue'
import others from '../CircuitBreaker/components/others.vue'
import operatingMechanism from '../CircuitBreaker/components/operatingMechanism.vue'
import assessmentLimit from '../CircuitBreaker/components/assessmentLimits.vue'
import NamePlate from '@/views/Common/NamePlate.vue'

export default {
    name: 'circuitBreaker',
    components: {
        circuitBreakProperty,
        circuitBreakRating,
        circuitBreakerData,
        contactSystem,
        others,
        operatingMechanism,
        assessmentLimit,
        NamePlate
    },
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
    data() {
        return {
            title: 'Circuit breaker',
            switch: 'circuitBreaker',
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
        switchData(data) {
            this.switch = data;
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
    }
}
</script>

<style lang="scss" scoped>
#asset {
    width: 100%;
    height: 100%;
}

.circuit-view {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 0 4px 16px;
}

.circuit-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
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
    min-width: 120px;
}

::v-deep(.table-strip-input-data .el-input-group__append) {
    min-width: 36px;
    padding: 0 8px;
    text-align: center;
}

::v-deep(.top-switch .trs-btn) {
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    overflow: visible;
    flex: 0 1 auto;
    max-width: 100%;
    min-height: 32px;
    margin-left: 0;
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
    .circuit-view {
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
