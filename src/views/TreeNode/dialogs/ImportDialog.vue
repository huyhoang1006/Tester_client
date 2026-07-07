<template>
    <el-dialog 
        title="Import" 
        :visible="visible"
        @update:visible="$emit('update:visible', $event)"
        :modal="modal"
        :show-close="showClose"
        :transition="transition"
        :custom-class="customClass"
        :importType="importType"
    >
        <Import :importType="importType" @imported="$emit('imported')" />
        <span slot="footer" class="dialog-footer custom-footer">
            <el-button class="footer-btn" size="small" type="danger" @click="handleCancel">Cancel</el-button>
        </span>
    </el-dialog>
</template>

<script>
import Import from '@/views/Import/index.vue'

export default {
    name: 'ImportDialog',
    components: {
        Import
    },
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        importType: {
            type: String,
            default: null
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
            default: 'app-dialog custom-dialog'
        }
    },
    methods: {
        handleCancel() {
            this.$emit('cancel')
        },
    }
}
</script>
<style lang="scss" scoped>
::v-deep(.app-dialog) {
    box-sizing: border-box;
}

::v-deep(.app-dialog.el-dialog) {
    width: 80%;
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