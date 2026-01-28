<template>
    <el-dialog 
        title="Select Parent Node for Downloaded Asset"
        :visible="visible" 
        @close="handleClose"
        @update:visible="$emit('update:visible', $event)"
        :modal="modal"
        :show-close="showClose"
        :transition="transition"
        :custom-class="customClass"
    >
        <div style="height: 300px; overflow-y: auto">
            <el-tree 
                :data="moveTreeData" 
                :props="moveTreeProps" 
                :expanded-keys="expandedMoveKeys"
                :highlight-current="true" 
                node-key="mrid" 
                @node-click="handleNodeClick"
                @node-expand="handleNodeExpand" 
                ref="downloadTree"
            >
                <span class="custom-tree-node" slot-scope="{ data }">
                    <span class="tree-node-content">
                        <icon 
                            v-if="data.mode === 'substation'" 
                            size="12px" 
                            folderType="location"
                            assetDetail="Unknown" 
                            badgeColor="146EBE"
                        />
                        <icon 
                            v-else-if="data.mode === 'voltageLevel'" 
                            size="12px" 
                            folderType="voltageLevel"
                            assetDetail="Unknown" 
                            badgeColor="146EBE"
                        />
                        <icon 
                            v-else-if="data.mode === 'bay'" 
                            size="12px" 
                            folderType="bay" 
                            assetDetail="Unknown"
                            badgeColor="146EBE"
                        />
                        <icon 
                            v-else-if="data.mode === 'asset'" 
                            size="12px" 
                            folderType="asset"
                            :assetDetail="data.asset || 'Unknown'" 
                            badgeColor="146EBE"
                        />
                        <icon 
                            v-else-if="data.mode === 'job'" 
                            size="12px" 
                            folderType="job" 
                            assetDetail="Unknown"
                            badgeColor="FF0000"
                        />
                        <icon 
                            v-else-if="data.mode === 'test'" 
                            size="12px" 
                            folderType="test"
                            assetDetail="Unknown" 
                            badgeColor="008001"
                        />
                        <icon 
                            v-else 
                            size="12px" 
                            folderType="building" 
                            assetDetail="Unknown"
                            badgeColor="008001"
                        />
                        <span class="node-label">{{ data.name || data.serial_number || data.serial_no || 'Unknown' }}</span>
                    </span>
                </span>
            </el-tree>
        </div>
        <span slot="footer" class="dialog-footer custom-footer">
            <el-button class="footer-btn" size="small" type="danger" @click="handleCancel">Cancel</el-button>
            <el-button 
                class="footer-btn" 
                size="small" 
                type="primary" 
                @click="handleConfirm"
                :disabled="!selectedDownloadTargetNode"
            >
                Confirm Download
            </el-button>
        </span>
    </el-dialog>
</template>

<script>
import Icon from '@/views/Common/Icon.vue'

export default {
    name: 'DownloadDialog',
    components: {
        Icon
    },
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        moveTreeData: {
            type: Array,
            default: () => []
        },
        moveTreeProps: {
            type: Object,
            default: () => ({
                children: 'children',
                label: 'name',
                disabled: 'disabled'
            })
        },
        expandedMoveKeys: {
            type: Array,
            default: () => []
        },
        selectedDownloadTargetNode: {
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
        handleNodeClick(data) {
            this.$emit('node-click', data)
        },
        // eslint-disable-next-line vue/no-unused-vars
        handleNodeExpand(data, node, instance) {
            this.$emit('node-expand', data, node, instance)
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