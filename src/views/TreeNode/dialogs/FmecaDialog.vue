<template>
    <el-dialog 
        title="Fmeca" 
        :visible="visible" 
        @close="handleClose"
        @update:visible="$emit('update:visible', $event)"
        :modal="modal"
        :show-close="showClose"
        :transition="transition"
        :custom-class="customClass"
    >
        <Fmeca />
        <span slot="footer" class="dialog-footer custom-footer">
            <el-button class="footer-btn" size="small" type="danger" @click="handleCancel">Cancel</el-button>
            <el-button class="footer-btn" size="small" type="primary" @click="handleConfirm">Save</el-button>
        </span>
    </el-dialog>
</template>

<script>
import Fmeca from '@/views/Fmeca'

export default {
    name: 'FmecaDialog',
    components: {
        Fmeca
    },
    props: {
        visible: {
            type: Boolean,
            default: false
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
        }
    }
}
</script>

<style scoped>

.app-dialog {
    box-sizing: border-box;
}

.app-dialog.el-dialog {
    width: 65%;
    margin-top: 5vh !important;
    border-radius: 6px;
    height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.app-dialog .el-dialog__body {
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    flex: 1;
}

.app-dialog .el-dialog__body::-webkit-scrollbar {
    display: none;
    width: 0px;
    height: 0px;
}

.app-dialog .el-dialog__footer {
    flex-shrink: 0;
    padding: 10px 20px;
    border-top: 1px solid #ebeef5;
}

.custom-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.custom-footer .footer-btn {
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 80px;
    max-width: 100px;
    height: 32px;
    font-size: 12px;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.custom-footer .footer-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 767px) {
    .app-dialog.el-dialog {
        width: 95%;
        margin: 2vh auto;
    }
    
    .custom-footer {
        justify-content: center;
        flex-direction: column;
        gap: 8px;
    }
    
    .custom-footer .footer-btn {
        max-width: none;
        width: 100%;
    }
}

@media (max-width: 480px) {
    .app-dialog .el-dialog__footer {
        padding: 8px 16px;
    }
}

</style>
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
