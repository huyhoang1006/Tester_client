<template>
    <div class="ov-wrap">
        <div class="ov-row">
            <!-- Job properties -->
            <section class="ov-card ov-half">
                <div class="ov-header">
                    <i class="fa-solid fa-file-lines"></i>
                    <span>Job properties</span>
                </div>
                <div class="ov-body">
                    <el-form :inline-message="true" size="mini" :label-width="labelWidth" label-position="left">
                        <el-form-item label="Name" required>
                            <el-input v-model="propertiesData.name" placeholder="Job name"></el-input>
                        </el-form-item>
                        <el-form-item label="Type">
                            <el-input v-model="propertiesData.type"></el-input>
                        </el-form-item>
                        <el-form-item label="Creation date">
                            <el-date-picker
                                v-model="propertiesData.creation_date"
                                class="w-100"
                                format="MM/dd/yyyy"
                                value-format="MM/dd/yyyy"
                                type="date"
                                placeholder="Pick a day">
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item label="Execution date">
                            <el-date-picker
                                v-model="propertiesData.execution_date"
                                class="w-100"
                                format="MM/dd/yyyy"
                                value-format="MM/dd/yyyy"
                                type="date"
                                placeholder="Pick a day">
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item label="Tested by">
                            <el-input v-model="propertiesData.tested_by"></el-input>
                        </el-form-item>
                        <el-form-item label="Approved by">
                            <el-input v-model="propertiesData.approved_by"></el-input>
                        </el-form-item>
                        <el-form-item label="Approval date">
                            <el-date-picker
                                v-model="propertiesData.approval_date"
                                class="w-100"
                                format="MM/dd/yyyy"
                                value-format="MM/dd/yyyy"
                                type="date"
                                placeholder="Pick a day">
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item label="Test method">
                            <el-select v-model="propertiesData.test_method" class="w-100" filterable clearable>
                                <el-option v-for="item in testMethod" :key="item" :label="item" :value="item"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Reference standard">
                            <!-- fix: bind ref_standard (trước đây bind nhầm 'standard' nên không lưu được) -->
                            <el-input v-model="propertiesData.ref_standard"></el-input>
                        </el-form-item>
                    </el-form>
                </div>
            </section>

            <!-- Summary + attachments -->
            <section class="ov-card ov-half">
                <div class="ov-header">
                    <i class="fa-solid fa-align-left"></i>
                    <span>Summary</span>
                </div>
                <div class="ov-body">
                    <el-input
                        v-model="propertiesData.summary"
                        type="textarea"
                        :rows="6"
                        placeholder="Notes, remarks, conclusions..."></el-input>
                    <div class="ov-attachment">
                        <Attachment :attachment_="attachmentData" title="Overview" height="120px" @data-attachment="getDataAttachment"></Attachment>
                    </div>
                </div>
            </section>
        </div>

        <div class="ov-row">
            <!-- Location -->
            <section class="ov-card ov-half">
                <div class="ov-header">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>Location</span>
                </div>
                <div class="ov-body ov-info">
                    <div class="ov-info-row"><span>Name</span><b>{{ locationData.name || '—' }}</b></div>
                    <div class="ov-info-row"><span>Address</span><b>{{ locationData.address_general || '—' }}</b></div>
                    <div class="ov-info-row"><span>City</span><b>{{ locationData.city || '—' }}</b></div>
                    <div class="ov-info-row"><span>State/Province</span><b>{{ locationData.state_or_province || '—' }}</b></div>
                    <div class="ov-info-row"><span>Country</span><b>{{ locationData.country || '—' }}</b></div>
                </div>
            </section>

            <!-- Asset -->
            <section class="ov-card ov-half">
                <div class="ov-header">
                    <i class="fa-solid fa-gears"></i>
                    <span>Asset</span>
                </div>
                <div class="ov-body ov-info">
                    <div class="ov-info-row"><span>Asset</span><b>{{ assetInfo.kind || '—' }}</b></div>
                    <div class="ov-info-row"><span>Asset type</span><b>{{ assetInfo.type || '—' }}</b></div>
                    <div class="ov-info-row"><span>Serial number</span><b>{{ assetInfo.serial || '—' }}</b></div>
                    <div class="ov-info-row"><span>Manufacturer</span><b>{{ assetInfo.manufacturer || '—' }}</b></div>
                </div>
            </section>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
// Tab Overview dùng chung cho mọi JobView.
// assetData có 2 shape tùy loại job: { properties: {...} } (Transformer) hoặc flat {...} -> chuẩn hóa ở computed assetInfo.
import Attachment from '@/views/Common/Attachment.vue'
import { TestMethod } from '@/views/Enum/TestMethod'

export default {
    name: 'JobOverviewPanel',
    components: {
        Attachment
    },
    props: {
        data: {
            type: Object,
            default: () => ({})
        },
        locationData: {
            type: Object,
            default: () => ({})
        },
        assetData: {
            type: Object,
            default: () => ({})
        },
        productAssetModelData: {
            type: Object,
            default: () => ({})
        },
        attachment: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            labelWidth: '140px',
            attachmentData: [],
            testMethod: Object.values(TestMethod)
        }
    },
    watch: {
        attachment: {
            handler(newVal) {
                this.attachmentData = newVal
            },
            immediate: true
        }
    },
    computed: {
        propertiesData() {
            return this.data || {}
        },
        assetInfo() {
            const p = (this.assetData && this.assetData.properties) ? this.assetData.properties : (this.assetData || {})
            const pam = this.productAssetModelData || {}
            return {
                kind: p.kind || '',
                type: p.type || '',
                serial: p.serial_no || p.serial_number || '',
                manufacturer: pam.manufacturer || pam.name || ''
            }
        }
    },
    methods: {
        getDataAttachment(rowData) {
            this.attachmentData = rowData
            this.$emit('update-attachment', this.attachmentData)
        }
    }
}
</script>

<style scoped>
.ov-wrap {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
}
.ov-row {
    display: flex;
    gap: 14px;
    align-items: stretch;
    /* responsive: card tự xuống dòng khi bề ngang hẹp */
    flex-wrap: wrap;
}
.ov-card {
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    background: #fff;
    display: flex;
    flex-direction: column;
    min-width: 0;
}
/* basis hạ từ 420px -> 340px: giữ 2 cột cạnh nhau ở màn 1920x1080 15.6" (kể cả Windows scaling 150%),
   chỉ wrap khi cửa sổ thực sự hẹp */
.ov-half { flex: 1 1 340px; }

.ov-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    border-radius: 6px 6px 0 0;
    font-size: 12px;
    font-weight: 600;
    color: #606266;
}
.ov-header i { color: #909399; }

.ov-body {
    padding: 12px;
    flex: 1;
}
.ov-attachment { margin-top: 12px; }

.ov-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.ov-info-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 5px 2px;
    font-size: 12px;
    border-bottom: 1px dashed #f0f2f5;
}
.ov-info-row:last-child { border-bottom: none; }
.ov-info-row span { color: #909399; flex-shrink: 0; }
.ov-info-row b { font-weight: 600; color: #303133; text-align: right; word-break: break-word; }

.w-100 { width: 100%; }

::v-deep .el-form-item__label {
    font-size: 12px;
}
::v-deep .el-form-item {
    margin-bottom: 10px;
}
/* đồng bộ chiều dài mọi control trong form:
   date-picker/select của Element có width mặc định (220px) -> ép 100% */
.ov-body ::v-deep .el-date-editor.el-input,
.ov-body ::v-deep .el-select,
.ov-body ::v-deep .el-input {
    width: 100%;
}
</style>
