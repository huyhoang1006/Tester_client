<template>
    <el-dialog 
        title="Add Job" 
        :visible="visible" 
        @close="handleClose"
        @update:visible="$emit('update:visible', $event)"
        :modal="modal"
        :show-close="showClose"
        :transition="transition"
        :custom-class="customClass"
    >
        <component 
            ref="jobData" 
            :is="checkJobType" 
            :locationData="locationData" 
            :assetData="assetData"
            :productAssetModelData="productAssetModelData" 
            :parent="parentOrganization"
            :testTypeListData="testTypeListData"
        />
        <span slot="footer" class="dialog-footer custom-footer">
            <el-button class="footer-btn" size="small" type="danger" @click="handleCancel">Cancel</el-button>
            <el-button class="footer-btn" size="small" type="primary" @click="handleConfirm">Save</el-button>
        </span>
    </el-dialog>
</template>

<script>
// Import Job Components
import JobSurgeArrester from '@/views/JobView/SurgeArrester/index.vue'
import JobPowerCable from '@/views/JobView/PowerCable/index.vue'
import JobDisconnector from '@/views/JobView/Disconnector/index.vue'
import JobCurrentTransformer from '@/views/JobView/CurrentTrans/index.vue'
import JobVoltageTransformer from '@/views/JobView/VoltageTransformer/index.vue'
import JobCircuitBreaker from '@/views/JobView/CircuitBreaker/index.vue'
import JobTransformer from '@/views/JobView/Transformer/index.vue'

export default {
    name: 'JobDialog',
    components: {
        // Register components with names that match checkJobType values
        JobSurgeArrester,
        JobPowerCable,
        JobDisconnector,
        JobCurrentTransformer,
        JobVoltageTransformer,
        JobCircuitBreaker,
        JobTransformer
    },
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        checkJobType: {
            type: String,
            default: ''
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
        parentOrganization: {
            type: Object,
            default: null
        },
        testTypeListData: {
            type: Array,
            default: () => []
        },
        modal: {
            type: Boolean,
            default: true
        },
        showClose: {
            type: Boolean,
            default: true
        },
        transition: {
            type: String,
            default: 'dialog-fade'
        },
        customClass: {
            type: String,
            default: 'app-dialog'
        }
    },
    methods: {
        handleClose() {
            this.$emit('close')
        },
        handleCancel() {
            this.$emit('cancel')
        },
        handleConfirm() {
            this.$emit('confirm')
        },
        // Expose jobData ref to parent
        getJobDataRef() {
            return this.$refs.jobData
        },
        // Alternative method name for consistency
        getComponentRef() {
            return this.$refs.jobData
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep(.app-dialog) {
    box-sizing: border-box;
}

::v-deep(.app-dialog.el-dialog) {
    width: 50%;
    margin-top: 5vh !important;
    border-radius: 6px;
    max-height: 90vh;
    height: auto !important;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

::v-deep(.app-dialog .el-dialog__body) {
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    flex: 1;
}

::v-deep(.app-dialog .el-dialog__body::-webkit-scrollbar) {
    width: 0px;
    height: 0px;
}

::v-deep(.app-dialog .el-dialog__footer) {
    padding: 10px 20px;
    border-top: 1px solid #ebeef5;
}

::v-deep(.custom-footer) {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

::v-deep(.custom-footer .footer-btn) {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100px;
}

@media (max-width: 767px) {
    ::v-deep(.custom-footer) {
        justify-content: center;
    }
}
</style>