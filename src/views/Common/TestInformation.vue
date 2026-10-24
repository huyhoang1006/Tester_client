<template>
    <div class="ti-wrap">
        <section class="ti-card ti-metadata-card">
            <div class="ti-header">
                <i class="fa-solid fa-calendar-check"></i>
                <span>Test information</span>
            </div>
            <div class="ti-metadata-body">
                <label class="ti-metadata-field">
                    <span>Name</span>
                    <el-input
                        v-model="testMetadata.name"
                        size="mini"
                        placeholder="Enter test name">
                    </el-input>
                </label>
                <label class="ti-metadata-field">
                    <span>Type</span>
                    <el-select
                        v-model="testMetadata.type"
                        size="mini"
                        filterable
                        allow-create
                        default-first-option
                        placeholder="Select or type a test type">
                        <el-option
                            v-for="jobType in jobTypeOptions"
                            :key="jobType"
                            :label="jobType"
                            :value="jobType">
                        </el-option>
                    </el-select>
                </label>
                <label class="ti-metadata-field">
                    <span>Testing date</span>
                    <el-date-picker
                        v-model="testMetadata.testing_date"
                        size="mini"
                        type="date"
                        format="dd/MM/yyyy"
                        value-format="MM/dd/yyyy"
                        placeholder="Select testing date">
                    </el-date-picker>
                </label>
                <label class="ti-metadata-field">
                    <span>Tested by</span>
                    <el-input
                        v-model="testMetadata.tested_by"
                        size="mini"
                        placeholder="Enter tester name">
                    </el-input>
                </label>
                <label class="ti-metadata-field">
                    <span>Approved by</span>
                    <el-input
                        v-model="testMetadata.approved_by"
                        size="mini"
                        placeholder="Enter approver name">
                    </el-input>
                </label>
                <label class="ti-metadata-field">
                    <span>Approved date</span>
                    <el-date-picker
                        v-model="testMetadata.approved_date"
                        size="mini"
                        type="date"
                        format="dd/MM/yyyy"
                        value-format="MM/dd/yyyy"
                        placeholder="Select approved date">
                    </el-date-picker>
                </label>
                <label class="ti-metadata-field ti-metadata-field-wide">
                    <span>Reference standard</span>
                    <el-input
                        v-model="testMetadata.reference_standard"
                        size="mini"
                        placeholder="Enter reference standard">
                    </el-input>
                </label>
            </div>
        </section>

        <!-- Khi bật Compare: 3 khối dồn hết sang cột trái, cột phải dành cho bảng
             so sánh. .ti-card có height:100% + grid stretch nên ô phải tự cao bằng
             tổng cột trái, không cần tính chiều cao. -->
        <div class="ti-row" :class="{ 'ti-row-compare': showCompare }">
            <div class="col-content" :class="{ 'ti-col-stack': showCompare }">
                <section class="ti-card">
                    <div class="ti-header">
                        <i class="fa-solid fa-temperature-half"></i>
                        <span>Testing conditions</span>
                    </div>
                    <div class="ti-body">
                        <table class="ti-conditions">
                            <tr v-if="showOilAndWindingTemperatures && conditions.top_oil_temp">
                                <td class="condition-head">Top oil temperature</td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="conditions.top_oil_temp.value">
                                        <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="showOilAndWindingTemperatures && conditions.bottom_oil_temp">
                                <td class="condition-head">Bottom oil temperature</td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="conditions.bottom_oil_temp.value">
                                        <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="showOilAndWindingTemperatures && conditions.winding_temp">
                                <td class="condition-head">{{ windingTemperatureLabel }}</td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="conditions.winding_temp.value">
                                        <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.reference_temp">
                                <td class="condition-head">Reference temperature</td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="conditions.reference_temp.value">
                                        <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.ambient_temp">
                                <td class="condition-head">Ambient temperature</td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="conditions.ambient_temp.value">
                                        <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.humidity">
                                <td class="condition-head">Humidity</td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="conditions.humidity.value">
                                        <template slot="append">%</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.weather">
                                <td class="condition-head">Weather</td>
                                <td>
                                    <el-input size="mini" type="text" text v-model="conditions.weather.value">
                                    </el-input>
                                </td>
                            </tr>
                        </table>
                    </div>
                </section>

                <!-- Compare bật: Comment + Attachments tụt xuống dưới Testing conditions -->
                <template v-if="showCompare">
                    <section class="ti-card ti-comment-card">
                        <div class="ti-header">
                            <i class="fa-solid fa-align-left"></i>
                            <span>Comment</span>
                        </div>
                        <div class="ti-body">
                            <el-input class="ti-comment-input" type="textarea" v-model="testConditions.comment"></el-input>
                        </div>
                    </section>
                    <Attachment class="ti-attach-card" :attachment_="attachment_" :title="title" height="160px"
                        @data-attachment="getDataAttachment">
                    </Attachment>
                </template>
            </div>

            <!-- Compare tắt: cột phải giữ nguyên Comment + Attachments như cũ -->
            <div v-if="!showCompare" class="col-content ti-col-stack">
                <section class="ti-card ti-comment-card">
                    <div class="ti-header">
                        <i class="fa-solid fa-align-left"></i>
                        <span>Comment</span>
                    </div>
                    <div class="ti-body">
                        <el-input class="ti-comment-input" type="textarea" v-model="testConditions.comment"></el-input>
                    </div>
                </section>
                <Attachment class="ti-attach-card" :attachment_="attachment_" :title="title" height="160px"
                    @data-attachment="getDataAttachment">
                </Attachment>
            </div>

            <!-- Compare bật: cột phải là bảng so sánh -->
            <div v-else class="col-content ti-col-compare">
                <CompareResultsPanel
                    :asset-mrid="resolvedCompareAssetMrid"
                    :asset-kind="compareAssetKind"
                    :test-code="compareTestCode"
                    :test-name="title"
                    :exclude-work-mrid="compareExcludeWorkMrid"
                    :current-table="compareCurrentTable"
                    :current-conditions="conditions"
                    :columns="compareColumns"
                    :asset-data="assetData"
                    :excluded-condition-keys="excludedConditionKeys"
                    @reference-change="$emit('compare-reference-change', $event)"
                    @close="$emit('update:showCompare', false)" />
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import Attachment from '../Common/Attachment.vue';
import CompareResultsPanel from '@/views/JobView/Common/CompareResultsPanel/index.vue'
import { notifyCompareOpened, notifyCompareClosed } from '@/utils/compareUiBus'
import { UnitSymbol } from '@/views/Enum/UnitSymbol'
import { JOB_TYPES } from '@/config/job-types'
import { buildEmptyTestCondition } from '@/views/JobView/Common'
export default {
    components: {
        Attachment,
        CompareResultsPanel
    },
    name: "testInfomation",
    props: {
        title: String,
        data: {
            type: Object,
            require: true,
            default: () => ({})
        },
        attachment: {
            type: Array,
            default: () => []
        },
        assetData: {
            type: Object,
            default: () => ({})
        },
        jobProperties: {
            type: Object,
            default: () => ({})
        },
        // ── So sánh với lần test trước ──────────────────────────────────────
        // Chỉ bài test nào được bật mới truyền compareTestCode; các job/test khác
        // không truyền gì thì layout giữ nguyên như cũ.
        showCompare: { type: Boolean, default: false },
        compareTestCode: { type: String, default: '' },
        compareCurrentTable: { type: [Object, Array], default: () => ({}) },
        compareColumns: { type: Array, default: () => [] },
        // Lấy thẳng từ DTO của job đang mở: properties.asset_id và properties.mrid.
        // Suy từ assetData không đáng tin — job hiện tại từng lọt vào danh sách tham chiếu.
        compareAssetMrid: { type: String, default: '' },
        compareExcludeWorkMrid: { type: String, default: '' },
        // Loại thiết bị, để panel tra cột mốc trong config/compare-keys
        compareAssetKind: { type: String, default: '' },
        showOilAndWindingTemperatures: { type: Boolean, default: false },
        conditionColumns: { type: Array, default: () => [] },
        windingTemperatureLabel: { type: String, default: 'Winding temperature' }
    },
    data() {
        return {
            attachment_: [],
            unitSymbol: UnitSymbol,
            jobTypeOptions: JOB_TYPES,
        }
    },
    methods: {
        ensureConditionFields() {
            if (!this.data || !this.conditionColumns.length) return
            if (!this.data.condition || typeof this.data.condition !== 'object') {
                this.$set(this.data, 'condition', {})
            }
            const defaults = buildEmptyTestCondition(this.conditionColumns)
            Object.keys(defaults).forEach((code) => {
                if (!this.data.condition[code]) {
                    this.$set(this.data.condition, code, defaults[code])
                }
            })
        },
        ensureTestMetadata() {
            if (!this.data || typeof this.data !== 'object') return
            const job = this.jobProperties || {}
            const defaults = {
                name: this.title || '',
                type: job.type || '',
                testing_date: job.execution_date || '',
                tested_by: job.tested_by || '',
                approved_by: job.approved_by || '',
                approved_date: job.approval_date || '',
                reference_standard: job.ref_standard || ''
            }

            if (!this.data.metadata || typeof this.data.metadata !== 'object') {
                this.$set(this.data, 'metadata', defaults)
                return
            }

            Object.keys(defaults).forEach((key) => {
                if (this.data.metadata[key] === undefined || this.data.metadata[key] === null) {
                    this.$set(this.data.metadata, key, defaults[key])
                }
            })
        },
        getDataAttachment(arr) {
            const attachmentData = Array.isArray(arr) ? arr : []
            this.attachment_ = attachmentData
            this.$set(this.data, 'attachmentData', attachmentData)
            this.$emit('update:attachment', attachmentData)
        }
    },
    computed: {
        resolvedCompareAssetMrid() {
            if (this.compareAssetMrid) return this.compareAssetMrid
            const asset = this.assetData || {}
            return (asset.properties && asset.properties.mrid) || asset.mrid || ''
        },
        conditions: function () {
            return this.data.condition || {}
        },
        testConditions: function () {
            return this.data
        },
        testMetadata() {
            return this.data.metadata || {}
        },
        excludedConditionKeys() {
            if (this.showOilAndWindingTemperatures) return []
            return ['top_oil_temp', 'bottom_oil_temp', 'winding_temp']
        }

    },
    watch: {
        data: {
            immediate: true,
            handler() {
                this.ensureTestMetadata()
                this.ensureConditionFields()
            }
        },
        attachment: {
            immediate: true,
            deep: true,
            handler: function () {
                this.attachment_ = this.attachment
            }
        },
        // Báo bus mỗi lần CHUYỂN trạng thái — không immediate, không lặp.
        // Đặt watch ở đây (chứ không ở nút bấm) để bắt cả trường hợp đóng bằng
        // dấu X trên chính bảng Compare.
        showCompare(value, oldValue) {
            if (value === oldValue) return
            if (value) notifyCompareOpened()
            else notifyCompareClosed()
        }
    },
    // Đóng tab test trong lúc bảng Compare đang mở thì watch không chạy —
    // phải tự trừ, nếu không bộ đếm kẹt và panel không bao giờ hiện lại.
    beforeDestroy() {
        if (this.showCompare) notifyCompareClosed()
    }
}
</script>
<style scoped>
.ti-wrap {
    width: 100%;
    margin-bottom: 12px;
}

.ti-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 16px;
}

.col-content {
    min-width: 0;
}

.ti-col-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.ti-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
}

.ti-metadata-card {
    height: auto;
    margin-bottom: 12px;
}

.ti-metadata-body {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 16px;
    padding: 10px 12px;
}

.ti-metadata-field {
    display: grid;
    grid-template-columns: minmax(90px, 34%) minmax(0, 1fr);
    align-items: center;
    gap: 10px;
    min-width: 0;
    color: #303133;
    font-size: 12px;
}

.ti-metadata-field > span {
    white-space: nowrap;
}

.ti-metadata-field ::v-deep(.el-date-editor.el-input),
.ti-metadata-field ::v-deep(.el-input),
.ti-metadata-field ::v-deep(.el-select) {
    width: 100%;
}

.ti-metadata-field-wide {
    grid-column: 1 / -1;
}

.ti-col-stack .ti-comment-card {
    flex: 1;
}

/* Cột Compare KHÔNG được kéo dài hàng grid.
   Bảng so sánh dài bao nhiêu là do dữ liệu, không thể để nó đẩy cả khối
   Testing conditions / Comment / Attachment giãn theo. Đặt panel ở position
   absolute → nó đóng góp 0 vào chiều cao hàng, nên chiều cao hàng do CỘT TRÁI
   quyết định, còn panel stretch vừa đúng bằng đó rồi tự cuộn bên trong. */
.ti-col-compare {
    position: relative;
    min-height: 320px;
}

.ti-col-compare > * {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.ti-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    border-radius: 6px 6px 0 0;
    color: #606266;
    font-size: 12px;
    font-weight: 600;
}

.ti-header i {
    color: #909399;
}

.ti-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 12px;
}

/* Bảng điều kiện: 2 cột label/input, không viền */
.ti-conditions {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 6px;
}

.ti-conditions td {
    font-size: 12px;
    color: #303133;
    padding: 0;
    border: none;
    background: transparent;
}

.condition-head {
    width: 45%;
    min-width: 150px;
    padding-right: 12px !important;
    color: #303133;
}

::v-deep(.ti-conditions .el-input) {
    width: 100%;
}

::v-deep(.ti-conditions .el-input__inner) {
    font-size: 12px !important;
}

/* Comment giãn hết chiều cao card */
.ti-comment-input,
.ti-comment-input ::v-deep(.el-textarea__inner) {
    height: 100%;
}

.ti-comment-input {
    display: flex;
    flex: 1;
}

.ti-comment-input ::v-deep(.el-textarea__inner) {
    min-height: 110px !important;
    resize: vertical;
    font-size: 12px;
}

::v-deep(.ti-attach-card) {
    min-height: 230px;
}

@media (max-width: 767px) {
    .ti-metadata-body {
        grid-template-columns: 1fr;
        gap: 8px;
        padding: 10px;
    }

    .ti-row {
        gap: 10px;
    }

    /* Màn hẹp: grid xếp 1 cột nên mỗi ô là 1 hàng riêng — không còn cột trái để
       lấy chiều cao. Trả panel về luồng thường và chặn bằng max-height. */
    .ti-col-compare {
        position: static;
        min-height: 0;
    }

    .ti-col-compare > * {
        position: static;
        max-height: 60vh;
    }

    .ti-header {
        padding: 8px 10px;
    }

    .ti-body {
        padding: 10px;
    }

    .ti-conditions tr {
        display: block;
        margin-bottom: 8px;
    }

    .ti-conditions td {
        display: block;
        width: 100%;
    }

    .condition-head {
        width: 100%;
        padding: 0 0 4px !important;
    }
}
</style>
