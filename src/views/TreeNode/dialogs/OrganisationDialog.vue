<template>
    <el-dialog 
        title="Add Organisation" 
        :visible="visible" 
        @close="handleClose"
        @update:visible="$emit('update:visible', $event)"
        :modal="modal"
        :show-close="showClose"
        :transition="transition"
        :custom-class="customClass"
    >
        <Organisation :parent="parentOrganization" ref="organisation" />
        <span slot="footer" class="dialog-footer custom-footer">
            <el-button class="footer-btn" size="small" type="danger" @click="handleCancel">Cancel</el-button>
            <el-button class="footer-btn" size="small" type="primary" @click="handleConfirm">Save</el-button>
        </span>
    </el-dialog>
</template>

<script>
import Organisation from '@/views/Organisation/index.vue'

export default {
    name: 'OrganisationDialog',
    components: {
        Organisation
    },
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        parentOrganization: {
            type: Object,
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
        // Expose organisation ref to parent
        getOrganisationRef() {
            return this.$refs.organisation
        },
        // Alternative method name for consistency
        getComponentRef() {
            return this.$refs.organisation
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